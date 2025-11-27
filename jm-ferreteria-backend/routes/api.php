<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use Illuminate\Support\Facades\DB;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\CategoriaController;
use App\Http\Controllers\ProductoController;
use App\Http\Controllers\VentaController;
use App\Http\Controllers\PedidoController;
use App\Http\Controllers\UsuarioController;
use App\Http\Controllers\DniScrapingController;
use App\Http\Controllers\ReporteController;
use App\Http\Controllers\WishlistController;
use App\Http\Controllers\CarritoController;
use App\Http\Controllers\GoogleAuthController;
use App\Http\Controllers\RolePermissionController;
use App\Http\Controllers\EnvioController;

/*
|--------------------------------------------------------------------------
| API Routes
|--------------------------------------------------------------------------
*/

// Ruta de prueba
Route::get('/test', function () {
    return response()->json([
        'success' => true,
        'message' => 'API funciona correctamente'
    ]);
});

// Ruta de prueba para productos (sin autenticación)
Route::get('/test-productos', function () {
    return response()->json([
        'success' => true,
        'message' => 'Endpoint de productos accesible',
        'timestamp' => now()
    ]);
});

// Rutas para consulta de DNI (públicas, sin autenticación)
Route::post('/buscar-dni', [DniScrapingController::class, 'buscarPorDni']);
Route::get('/test-dni', [DniScrapingController::class, 'test']);


// Auth clientes (Sanctum)
Route::post('/auth/register', [AuthController::class, 'register']);
Route::post('/auth/login', [AuthController::class, 'login']);

// Google OAuth
Route::get('/auth/google/url', [GoogleAuthController::class, 'getGoogleUrl']);
Route::get('/auth/google/callback', [GoogleAuthController::class, 'handleGoogleCallback']);
Route::get('/api/auth/google/callback', [GoogleAuthController::class, 'handleGoogleCallback']);

Route::middleware('auth:sanctum')->group(function () {
    Route::post('/auth/logout', [AuthController::class, 'logout']);
    Route::get('/auth/user', [AuthController::class, 'user']);
    Route::put('/auth/user', [AuthController::class, 'update']);

    // Wishlist
    Route::get('/wishlist', [WishlistController::class, 'index']);
    Route::post('/wishlist', [WishlistController::class, 'store']);
    Route::delete('/wishlist/{productoId}', [WishlistController::class, 'destroy']);

    // Carrito
    Route::get('/carrito', [CarritoController::class, 'index']);
    Route::post('/carrito', [CarritoController::class, 'store']);
    Route::put('/carrito/{productoId}', [CarritoController::class, 'update']);
    Route::delete('/carrito/{productoId}', [CarritoController::class, 'destroy']);
    Route::delete('/carrito', [CarritoController::class, 'clear']);

    // Historial de compras del cliente autenticado
    Route::get('/ventas/mias', [VentaController::class, 'myHistory']);
    
    // Envíos del cliente autenticado
    Route::get('/envios/mios', [EnvioController::class, 'misEnvios']);
});

// Rutas públicas (sin autenticación)
Route::post('/login', [AuthController::class, 'login']);
Route::get('/login', function () {
    return response()->json([
        'success' => false,
        'message' => 'Método GET no permitido para login. Use POST.'
    ], 405);
});

// Ruta de login para el middleware de autenticación
Route::get('/login', function () {
    return response()->json([
        'success' => false,
        'message' => 'No autenticado. Por favor, inicie sesión.'
    ], 401);
})->name('login');

// Rutas públicas para catálogo (sin autenticación)
Route::get('/catalogo/productos', [ProductoController::class, 'catalogo']);
Route::get('/catalogo/categorias', [CategoriaController::class, 'catalogo']);
Route::get('/catalogo/buscar', [ProductoController::class, 'buscar']);
Route::post('/pedidos/publico', [PedidoController::class, 'store']);

// Rutas de envíos (públicas)
Route::get('/envios/destinos', [EnvioController::class, 'getDestinos']);
Route::get('/envios/agencias', [EnvioController::class, 'getAgencias']);
Route::get('/envios/agencias/ciudad/{ciudad}', [EnvioController::class, 'getAgenciasPorCiudad']);
Route::get('/envios/ciudades', [EnvioController::class, 'getCiudadesConAgencias']);

// Ruta temporal para ejecutar migración y seeder de agencias (ELIMINAR DESPUÉS DE USAR)
Route::get('/setup-agencias/{clave}', function ($clave) {
    if ($clave !== 'jym2024ferreteria') {
        return response()->json(['error' => 'Clave incorrecta'], 403);
    }
    
    try {
        // Ejecutar migración
        \Artisan::call('migrate', ['--force' => true]);
        $migrateOutput = \Artisan::output();
        
        // Ejecutar seeder
        \Artisan::call('db:seed', [
            '--class' => 'AgenciaEnvioSeeder',
            '--force' => true
        ]);
        $seedOutput = \Artisan::output();
        
        // Verificar cuántas agencias se insertaron
        $totalAgencias = \App\Models\AgenciaEnvio::count();
        $totalCiudades = \App\Models\AgenciaEnvio::select('ciudad')->distinct()->count();
        
        return response()->json([
            'success' => true,
            'message' => 'Migración y seeder ejecutados correctamente',
            'migration_output' => $migrateOutput,
            'seed_output' => $seedOutput,
            'total_agencias' => $totalAgencias,
            'total_ciudades' => $totalCiudades
        ]);
    } catch (\Exception $e) {
        return response()->json([
            'success' => false,
            'message' => 'Error al ejecutar: ' . $e->getMessage(),
            'trace' => $e->getTraceAsString()
        ], 500);
    }
});

// Ruta temporal para verificar agencias (ELIMINAR DESPUÉS DE USAR)
Route::get('/verificar-agencias/{clave}', function ($clave) {
    if ($clave !== 'jym2024ferreteria') {
        return response()->json(['error' => 'Clave incorrecta'], 403);
    }
    
    try {
        $totalAgencias = \App\Models\AgenciaEnvio::count();
        $totalCiudades = \App\Models\AgenciaEnvio::select('ciudad')->distinct()->count();
        $primerasAgencias = \App\Models\AgenciaEnvio::limit(5)->get();
        $primerasCiudades = \App\Models\AgenciaEnvio::select('ciudad', 'departamento')->distinct()->limit(10)->get();
        
        return response()->json([
            'success' => true,
            'total_agencias' => $totalAgencias,
            'total_ciudades' => $totalCiudades,
            'primeras_agencias' => $primerasAgencias,
            'primeras_ciudades' => $primerasCiudades
        ]);
    } catch (\Exception $e) {
        return response()->json([
            'success' => false,
            'message' => 'Error: ' . $e->getMessage(),
            'trace' => $e->getTraceAsString()
        ], 500);
    }
});

// Búsqueda de clientes por DNI (pública)
Route::get('/buscar-cliente-por-dni/{dni}', [VentaController::class, 'buscarClientePorDni']);

// Rutas protegidas (requieren autenticación)
Route::middleware('auth:sanctum')->group(function () {
    
    // Rutas de ventas - Temporalmente sin middleware de permisos
    Route::get('/ventas', [VentaController::class, 'index']);
    Route::get('/ventas/estadisticas', [VentaController::class, 'estadisticas']);
    Route::get('/ventas/productos-mas-vendidos', [VentaController::class, 'productosMasVendidos']);
    Route::get('/ventas/{id}', [VentaController::class, 'show']);
    Route::post('/ventas', [VentaController::class, 'store']);
    Route::put('/ventas/{id}/anular', [VentaController::class, 'anularVenta']);
    
    // Rutas de pedidos - Con permisos específicos
    Route::get('/pedidos', [PedidoController::class, 'index'])->middleware('permission:pedidos.view');
    Route::get('/pedidos/{id}', [PedidoController::class, 'show'])->middleware('permission:pedidos.view');
    Route::post('/pedidos', [PedidoController::class, 'store'])->middleware('permission:pedidos.create');
    Route::put('/pedidos/{id}/estado', [PedidoController::class, 'updateEstado'])->middleware('permission:pedidos.estado');
    
    // Autenticación
    Route::post('/logout', [AuthController::class, 'logout']);
    Route::get('/user', [AuthController::class, 'user']);
    
    // Productos (CRUD) - Temporalmente sin middleware de permisos
    Route::get('/productos', [ProductoController::class, 'index']);
    Route::get('/productos/{id}', [ProductoController::class, 'show']);
    Route::post('/productos', [ProductoController::class, 'store']);
    Route::put('/productos/{id}', [ProductoController::class, 'update']);
    Route::delete('/productos/{id}', [ProductoController::class, 'destroy']);
    Route::delete('/productos', [ProductoController::class, 'deleteAll']); // Eliminar todos los productos
    Route::post('/productos/upload', [ProductoController::class, 'uploadImage']);
    
    // Categorías - Temporalmente sin middleware de permisos
    Route::get('/categorias', [CategoriaController::class, 'index']);
    Route::get('/categorias/{id}', [CategoriaController::class, 'show']);
    Route::post('/categorias', [CategoriaController::class, 'store']);
    Route::put('/categorias/{id}', [CategoriaController::class, 'update']);
    Route::delete('/categorias/{id}', [CategoriaController::class, 'destroy']);

    // Clientes frecuentes
    Route::get('/clientes-frecuentes', [UsuarioController::class, 'clientesFrecuentes']);
    
    // Obtener solo clientes (para reportes)
    Route::get('/clientes', [UsuarioController::class, 'getClientes']);
    
    // Pedidos (ver y actualizar estado)
    Route::get('/pedidos', [PedidoController::class, 'index']);
    Route::get('/pedidos/{id}', [PedidoController::class, 'show']);
    Route::put('/pedidos/{id}/estado', [PedidoController::class, 'updateEstado']);
    
    // Gestión de usuarios - Temporalmente sin middleware de permisos
    Route::get('/usuarios', [UsuarioController::class, 'index']);
    Route::get('/usuarios/{id}', [UsuarioController::class, 'show']);
    Route::post('/usuarios', [UsuarioController::class, 'store']);
    Route::put('/usuarios/{id}', [UsuarioController::class, 'update']);
    Route::delete('/usuarios/{id}', [UsuarioController::class, 'destroy']);
    
    // Reportes - Temporalmente sin middleware de permisos
    Route::get('/reportes/ventas', [ReporteController::class, 'ventas']);
    Route::get('/reportes/productos', [ReporteController::class, 'productos']);
    Route::get('/reportes/clientes', [ReporteController::class, 'clientes']);
    Route::get('/reportes/financiero', [ReporteController::class, 'financiero']);
    Route::get('/reportes/{tipo}/pdf', [ReporteController::class, 'exportPDF']);
    Route::get('/reportes/{tipo}/excel', [ReporteController::class, 'exportExcel']);
    
    // Gestión de envíos - Con permisos específicos
    Route::get('/envios', [EnvioController::class, 'index'])->middleware('permission:envios.view');
    Route::get('/envios/{id}', [EnvioController::class, 'show'])->middleware('permission:envios.view');
    Route::put('/envios/{id}/estado', [EnvioController::class, 'updateEstado'])->middleware('permission:envios.update');
    
    // Checkout de ventas
    Route::post('/ventas/checkout', [EnvioController::class, 'checkout']);
    
    // Gestión de roles y permisos - Solo admin
    Route::get('/roles', [RolePermissionController::class, 'getRoles']);
    Route::get('/permissions', [RolePermissionController::class, 'getPermissions']);
    Route::get('/roles/{role}/permissions', [RolePermissionController::class, 'getRolePermissions']);
    Route::get('/users/{userId}/permissions', [RolePermissionController::class, 'getUserPermissions']);
    Route::put('/users/{userId}/permissions', [RolePermissionController::class, 'updateUserPermissions']);
    Route::get('/users/{userId}/permissions/{permission}', [RolePermissionController::class, 'checkPermission']);
    Route::get('/employees', [RolePermissionController::class, 'getEmployees']);
    Route::get('/role-stats', [RolePermissionController::class, 'getRoleStats']);
}); 

// Clientes sugeridos para autocompletar
Route::get('/sugerir-clientes', [UsuarioController::class, 'sugerirClientes']); 