<?php

use Illuminate\Support\Facades\Route;
use Illuminate\Support\Facades\Storage;

Route::get('/', function () {
    return view('welcome');
});

// Ruta para servir imágenes de productos
Route::get('/img_productos/{filename}', function ($filename) {
    // Sanitizar el nombre del archivo para prevenir path traversal
    $filename = basename($filename);
    
    $path = public_path('img_productos/' . $filename);
    
    if (!file_exists($path)) {
        \Log::warning('Imagen no encontrada', ['path' => $path, 'filename' => $filename]);
        abort(404, 'Imagen no encontrada');
    }
    
    try {
        $file = file_get_contents($path);
        $type = mime_content_type($path);
        
        // Si no se puede determinar el tipo, usar un tipo genérico
        if (!$type) {
            $extension = strtolower(pathinfo($filename, PATHINFO_EXTENSION));
            $typeMap = [
                'jpg' => 'image/jpeg',
                'jpeg' => 'image/jpeg',
                'png' => 'image/png',
                'gif' => 'image/gif',
                'webp' => 'image/webp',
                'jfif' => 'image/jpeg',
            ];
            $type = $typeMap[$extension] ?? 'application/octet-stream';
        }
        
        return response($file, 200)
            ->header('Content-Type', $type)
            ->header('Cache-Control', 'public, max-age=31536000'); // Cache por 1 año
    } catch (\Exception $e) {
        \Log::error('Error al servir imagen', [
            'path' => $path,
            'filename' => $filename,
            'error' => $e->getMessage()
        ]);
        abort(500, 'Error al cargar la imagen');
    }
})->where('filename', '.*');
