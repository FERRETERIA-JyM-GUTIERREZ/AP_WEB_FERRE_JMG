<?php

namespace App\Http\Controllers;

use App\Models\User;
use Illuminate\Http\Request;
use Laravel\Socialite\Facades\Socialite;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Str;
use GuzzleHttp\Client;

class GoogleAuthController extends Controller
{
    /**
     * Obtiene una instancia de Socialite configurada con el cliente HTTP correcto
     * para manejar problemas de certificados SSL en Windows
     */
    protected function getSocialiteDriver()
    {
        $driver = Socialite::driver('google')->stateless();
        
        // Configurar cliente HTTP para manejar certificados SSL
        $httpOptions = $this->getHttpOptions();
        if (!empty($httpOptions)) {
            $client = new Client($httpOptions);
            $driver->setHttpClient($client);
        }
        
        return $driver;
    }

    /**
     * Obtiene las opciones HTTP para Guzzle según el entorno
     */
    protected function getHttpOptions(): array
    {
        $options = [];
        
        // Intentar encontrar el archivo de certificados CA
        $cacertPath = $this->getCacertPath();
        
        if ($cacertPath && file_exists($cacertPath)) {
            // Si tenemos el archivo cacert.pem, usarlo
            $options['verify'] = $cacertPath;
        } elseif (app()->environment('local', 'development')) {
            // Solo en desarrollo local: desactivar verificación SSL
            // ⚠️ ADVERTENCIA: Esto es solo para desarrollo, NUNCA en producción
            $options['verify'] = false;
        }
        
        return $options;
    }

    /**
     * Obtiene la ruta del archivo de certificados CA
     */
    protected function getCacertPath(): ?string
    {
        $possiblePaths = [
            base_path('cacert.pem'),
            base_path('vendor/guzzlehttp/guzzle/src/cacert.pem'),
            php_ini_loaded_file() ? dirname(php_ini_loaded_file()) . '/cacert.pem' : null,
            ini_get('extension_dir') . '/../cacert.pem',
            'C:/php/extras/ssl/cacert.pem',
            getenv('CURL_CA_BUNDLE') ?: null,
        ];

        foreach ($possiblePaths as $path) {
            if ($path && file_exists($path)) {
                return $path;
            }
        }

        return null;
    }

    public function redirectToGoogle()
    {
        return $this->getSocialiteDriver()->redirect();
    }

    public function handleGoogleCallback(Request $request)
    {
        try {
            \Log::info('🔄 Iniciando callback de Google OAuth');
            
            $googleUser = $this->getSocialiteDriver()->user();
            \Log::info('✅ Usuario de Google obtenido:', ['email' => $googleUser->getEmail()]);
            
            // Buscar usuario existente por email
            $user = User::where('email', $googleUser->getEmail())->first();
            
            $avatarUrl = $googleUser->getAvatar();
            \Log::info('🖼️ Avatar de Google obtenido:', ['avatar' => $avatarUrl]);
            
            if ($user) {
                \Log::info('👤 Usuario existente encontrado, actualizando datos de Google');
                // Usuario existe, actualizar datos de Google si es necesario
                $user->update([
                    'google_id' => $googleUser->getId(),
                    'avatar' => $avatarUrl,
                ]);
                // Refrescar el modelo para obtener los datos actualizados
                $user->refresh();
                \Log::info('✅ Usuario actualizado con avatar:', ['id' => $user->id, 'avatar' => $user->avatar]);
            } else {
                \Log::info('➕ Creando nuevo usuario desde Google');
                // Crear nuevo usuario
                $user = User::create([
                    'name' => $googleUser->getName(),
                    'email' => $googleUser->getEmail(),
                    'google_id' => $googleUser->getId(),
                    'avatar' => $avatarUrl,
                    'password' => bcrypt(Str::random(16)), // Password aleatorio
                    'rol' => 'cliente', // Por defecto es cliente
                    'email_verified_at' => now(), // Google ya verificó el email
                ]);
                \Log::info('✅ Nuevo usuario creado:', ['id' => $user->id, 'email' => $user->email, 'avatar' => $user->avatar]);
            }

            // Crear token para el usuario
            $token = $user->createToken('google-auth-token')->plainTextToken;
            \Log::info('🔑 Token creado para usuario');

            // Asegurarse de que el avatar esté presente
            $userAvatar = $user->avatar ?? $avatarUrl;
            \Log::info('🖼️ Avatar final para enviar al frontend:', ['avatar' => $userAvatar]);
            
            // Redirigir al frontend con los datos en la URL
            $frontendUrl = env('FRONTEND_URL', 'http://localhost:3000');
            $redirectUrl = $frontendUrl . '/auth/google/callback?' . http_build_query([
                'success' => 'true',
                'user' => json_encode([
                    'id' => $user->id,
                    'name' => $user->name,
                    'email' => $user->email,
                    'rol' => $user->rol,
                    'avatar' => $userAvatar,
                ]),
                'token' => $token,
            ]);

            \Log::info('🚀 Redirigiendo al frontend con avatar:', ['avatar' => $userAvatar]);
            return redirect($redirectUrl);

        } catch (\Exception $e) {
            \Log::error('❌ Error en callback de Google:', [
                'message' => $e->getMessage(),
                'file' => $e->getFile(),
                'line' => $e->getLine(),
                'trace' => $e->getTraceAsString()
            ]);
            
            // En caso de error, redirigir al frontend con el error
            $frontendUrl = env('FRONTEND_URL', 'http://localhost:3000');
            $redirectUrl = $frontendUrl . '/auth/google/callback?' . http_build_query([
                'success' => 'false',
                'error' => 'Error en autenticación con Google: ' . $e->getMessage()
            ]);

            return redirect($redirectUrl);
        }
    }

    public function getGoogleUrl()
    {
        try {
            // Verificar que las credenciales de Google estén configuradas
            $clientId = env('GOOGLE_CLIENT_ID');
            $clientSecret = env('GOOGLE_CLIENT_SECRET');
            $redirectUri = env('GOOGLE_REDIRECT_URI');
            
            if (empty($clientId) || empty($clientSecret) || empty($redirectUri)) {
                return response()->json([
                    'success' => false,
                    'message' => 'Las credenciales de Google OAuth no están configuradas. Por favor, configure GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET y GOOGLE_REDIRECT_URI en el archivo .env del backend.',
                    'error' => 'missing_credentials'
                ], 500);
            }
            
            $url = $this->getSocialiteDriver()->redirect()->getTargetUrl();
            
            return response()->json([
                'success' => true,
                'url' => $url
            ]);
        } catch (\Exception $e) {
            $errorMessage = $e->getMessage();
            
            // Mensaje más específico para el error de client_id faltante
            if (strpos($errorMessage, 'client_id') !== false || strpos($errorMessage, 'Missing required parameter') !== false) {
                return response()->json([
                    'success' => false,
                    'message' => 'Las credenciales de Google OAuth no están configuradas correctamente. Por favor, configure GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET y GOOGLE_REDIRECT_URI en el archivo .env del backend.',
                    'error' => 'missing_credentials',
                    'details' => $errorMessage
                ], 500);
            }
            
            return response()->json([
                'success' => false,
                'message' => 'Error generando URL de Google: ' . $errorMessage,
                'error' => 'google_auth_error'
            ], 500);
        }
    }
}
