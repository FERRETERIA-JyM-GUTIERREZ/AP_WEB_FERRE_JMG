<?php

use Illuminate\Support\Facades\Route;
use Illuminate\Support\Facades\Storage;

Route::get('/', function () {
    return view('welcome');
});

// Ruta para servir imágenes de productos (compatibilidad con rutas antiguas)
Route::get('/img_productos/{filename}', function ($filename) {
    // Sanitizar el nombre del archivo para prevenir path traversal
    $filename = basename($filename);
    
    // Primero intentar desde storage (nuevo sistema)
    $storagePath = 'productos/' . $filename;
    if (Storage::disk('public')->exists($storagePath)) {
        $path = Storage::disk('public')->path($storagePath);
        $type = mime_content_type($path);
        
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
        
        return response()->file($path, [
            'Content-Type' => $type,
            'Cache-Control' => 'public, max-age=31536000'
        ]);
    }
    
    // Fallback: intentar desde public/img_productos (sistema antiguo)
    $oldPath = public_path('img_productos/' . $filename);
    if (file_exists($oldPath)) {
        $type = mime_content_type($oldPath);
        
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
        
        return response()->file($oldPath, [
            'Content-Type' => $type,
            'Cache-Control' => 'public, max-age=31536000'
        ]);
    }
    
    \Log::warning('Imagen no encontrada', ['filename' => $filename]);
    abort(404, 'Imagen no encontrada');
})->where('filename', '.*');
