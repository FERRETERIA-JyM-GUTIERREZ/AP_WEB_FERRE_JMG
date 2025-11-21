<?php

return [

    /*
    |--------------------------------------------------------------------------
    | Cross-Origin Resource Sharing (CORS) Configuration
    |--------------------------------------------------------------------------
    |
    | Here you may configure your settings for cross-origin resource sharing
    | or "CORS". This determines which domains are allowed to access your
    | API via the browser. You should restrict this to domains you trust.
    |
    */

    'paths' => ['api/*', 'sanctum/csrf-cookie'],
    'allowed_methods' => ['*'],
    'allowed_origins' => env('APP_ENV') === 'local' 
        ? ['*'] // En desarrollo, permitir todos los orígenes
        : array_values(array_filter([
            'http://localhost:3000',
            'http://localhost:5173',
            'http://127.0.0.1:3000',
            'http://127.0.0.1:5173',
            env('FRONTEND_URL'), // URL de producción del frontend
            'https://ap-web-ferre-jmg.vercel.app', // URL de Vercel (nueva)
            'https://ap-web-ferre-jmg.vercel.app/', // URL de Vercel con barra final
            'https://ap-web-ferre-jmg-git-main-ferreteria-jms-projects.vercel.app', // URL de Vercel (preview)
            'https://*.vercel.app', // Permitir todas las URLs de Vercel (preview y producción)
            'https://ferreteriafrontend.vercel.app', // URL de Vercel (antigua - mantener por compatibilidad)
        ], function($value) {
            return !empty($value); // Filtrar valores vacíos o null
        })),
    'allowed_headers' => ['*'],
    'exposed_headers' => [],
    'max_age' => 0,
    'supports_credentials' => true,

]; 