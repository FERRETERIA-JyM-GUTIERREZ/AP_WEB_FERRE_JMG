<?php
// Test Google OAuth Configuration
require_once 'vendor/autoload.php';

use Laravel\Socialite\Facades\Socialite;

// Cargar configuración de Laravel
$app = require_once 'bootstrap/app.php';
$app->make('Illuminate\Contracts\Console\Kernel')->bootstrap();

echo "=== CONFIGURACIÓN DE GOOGLE OAUTH ===\n";
echo "GOOGLE_CLIENT_ID: " . env('GOOGLE_CLIENT_ID') . "\n";
echo "GOOGLE_CLIENT_SECRET: " . (env('GOOGLE_CLIENT_SECRET') ? 'CONFIGURADO' : 'NO CONFIGURADO') . "\n";
echo "GOOGLE_REDIRECT_URI: " . env('GOOGLE_REDIRECT_URI') . "\n";

echo "\n=== CONFIGURACIÓN DE SERVICIOS ===\n";
$services = config('services.google');
echo "Client ID: " . $services['client_id'] . "\n";
echo "Client Secret: " . ($services['client_secret'] ? 'CONFIGURADO' : 'NO CONFIGURADO') . "\n";
echo "Redirect URI: " . $services['redirect'] . "\n";

echo "\n=== PRUEBA DE URL DE GOOGLE ===\n";
try {
    $url = Socialite::driver('google')->stateless()->redirect()->getTargetUrl();
    echo "URL generada exitosamente: " . $url . "\n";
} catch (Exception $e) {
    echo "ERROR: " . $e->getMessage() . "\n";
}













































































