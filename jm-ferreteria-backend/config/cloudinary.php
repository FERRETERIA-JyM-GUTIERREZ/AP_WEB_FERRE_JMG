<?php

return [
    /*
    |--------------------------------------------------------------------------
    | Cloudinary Configuration
    |--------------------------------------------------------------------------
    |
    | This file contains the configuration for Cloudinary integration.
    | The package will automatically read from CLOUDINARY_URL environment variable
    | or you can configure it manually here.
    |
    */

    'cloud_url' => env('CLOUDINARY_URL', null),

    'cloud_name' => env('CLOUDINARY_CLOUD_NAME', null),
    'api_key' => env('CLOUDINARY_API_KEY', null),
    'api_secret' => env('CLOUDINARY_API_SECRET', null),
    'secure' => env('CLOUDINARY_SECURE', true),

    /*
    |--------------------------------------------------------------------------
    | Upload Presets
    |--------------------------------------------------------------------------
    |
    | You can define upload presets here for different use cases.
    |
    */

    'upload_presets' => [
        'productos' => [
            'folder' => 'productos',
            'resource_type' => 'image',
            'allowed_formats' => ['jpg', 'jpeg', 'png', 'gif', 'webp', 'jfif'],
        ],
    ],
];

