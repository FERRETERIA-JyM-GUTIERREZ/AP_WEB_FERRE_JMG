<?php

namespace App\Http\Controllers;

use App\Models\Producto;
use App\Models\Categoria;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Facades\Storage;
use CloudinaryLabs\CloudinaryLaravel\Facades\Cloudinary;

class ProductoController extends Controller
{
    public function index()
    {
        try {
            \Log::info('🔍 Solicitando lista de productos');
            
            $productos = Producto::with('categoria')->get();
            
            \Log::info('✅ Productos obtenidos exitosamente', [
                'count' => $productos->count(),
                'productos' => $productos->map(function($p) {
                    return [
                        'id' => $p->id,
                        'nombre' => $p->nombre,
                        'categoria' => $p->categoria ? $p->categoria->nombre : 'Sin categoría'
                    ];
                })
            ]);
            
            return response()->json([
                'success' => true,
                'data' => $productos
            ]);
        } catch (\Exception $e) {
            \Log::error('❌ Error al obtener productos', [
                'message' => $e->getMessage(),
                'file' => $e->getFile(),
                'line' => $e->getLine()
            ]);
            
            return response()->json([
                'success' => false,
                'message' => 'Error al obtener productos: ' . $e->getMessage()
            ], 500);
        }
    }

    public function show($id)
    {
        try {
            $producto = Producto::with('categoria')->find($id);
            
            if (!$producto) {
                return response()->json([
                    'success' => false,
                    'message' => 'Producto no encontrado'
                ], 404);
            }
            
            return response()->json([
                'success' => true,
                'data' => $producto
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error al obtener producto: ' . $e->getMessage()
            ], 500);
        }
    }

    public function store(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'nombre' => 'required|string|max:200',
            'descripcion' => 'nullable|string',
            'precio' => 'required|numeric|min:0',
            'stock' => 'required|integer|min:0',
            'categoria_id' => 'required|exists:categorias,id',
            'imagen' => 'nullable|string|max:255',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Datos inválidos',
                'errors' => $validator->errors()
            ], 422);
        }

        try {
            $producto = Producto::create($request->all());
            
            return response()->json([
                'success' => true,
                'message' => 'Producto creado exitosamente',
                'data' => $producto
            ], 201);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error al crear producto: ' . $e->getMessage()
            ], 500);
        }
    }

    public function update(Request $request, $id)
    {
        $producto = Producto::find($id);
        
        if (!$producto) {
            return response()->json([
                'success' => false,
                'message' => 'Producto no encontrado'
            ], 404);
        }

        $validator = Validator::make($request->all(), [
            'nombre' => 'sometimes|required|string|max:200',
            'descripcion' => 'nullable|string',
            'precio' => 'sometimes|required|numeric|min:0',
            'stock' => 'sometimes|required|integer|min:0',
            'categoria_id' => 'sometimes|required|exists:categorias,id',
            'imagen' => 'nullable|string|max:255',
            'activo' => 'sometimes|boolean',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Datos inválidos',
                'errors' => $validator->errors()
            ], 422);
        }

        try {
            // Preparar datos para actualizar
            $updateData = $request->only([
                'nombre', 'descripcion', 'precio', 'stock', 
                'categoria_id', 'activo'
            ]);
            
            // Solo actualizar imagen si viene en el request y no está vacía
            if ($request->has('imagen') && !empty($request->imagen)) {
                $updateData['imagen'] = $request->imagen;
            }
            // Si no viene imagen o está vacía, preservar la imagen existente (no actualizar)
            
            $producto->update($updateData);
            
            return response()->json([
                'success' => true,
                'message' => 'Producto actualizado exitosamente',
                'data' => $producto->fresh()
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error al actualizar producto: ' . $e->getMessage()
            ], 500);
        }
    }

    public function destroy($id)
    {
        try {
            $producto = Producto::find($id);
            
            if (!$producto) {
                return response()->json([
                    'success' => false,
                    'message' => 'Producto no encontrado'
                ], 404);
            }
            
            $producto->delete();
            
            return response()->json([
                'success' => true,
                'message' => 'Producto eliminado exitosamente'
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error al eliminar producto: ' . $e->getMessage()
            ], 500);
        }
    }

    // Eliminar todos los productos
    public function deleteAll()
    {
        try {
            $count = Producto::count();
            
            if ($count === 0) {
                return response()->json([
                    'success' => true,
                    'message' => 'No hay productos para eliminar',
                    'deleted' => 0
                ]);
            }

            $deleted = Producto::query()->delete();
            
            \Log::info('🗑️ Todos los productos eliminados', ['count' => $deleted]);
            
            return response()->json([
                'success' => true,
                'message' => "Se eliminaron {$deleted} productos exitosamente",
                'deleted' => $deleted
            ]);
        } catch (\Exception $e) {
            \Log::error('❌ Error al eliminar todos los productos', [
                'message' => $e->getMessage(),
                'file' => $e->getFile(),
                'line' => $e->getLine()
            ]);
            
            return response()->json([
                'success' => false,
                'message' => 'Error al eliminar productos: ' . $e->getMessage()
            ], 500);
        }
    }

    // Método público para catálogo (sin autenticación)
    public function catalogo()
    {
        try {
            $productos = Producto::with('categoria')
                ->where('stock', '>', 0)
                ->get();
            
            return response()->json([
                'success' => true,
                'data' => $productos
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error al obtener catálogo: ' . $e->getMessage()
            ], 500);
        }
    }

    // Método para búsqueda inteligente (sin autenticación)
    public function buscar(Request $request)
    {
        try {
            $query = $request->get('q', '');
            $categoria = $request->get('categoria', '');
            $precioMin = $request->get('precio_min', 0);
            $precioMax = $request->get('precio_max', 999999);
            
            $productos = Producto::with('categoria')
                ->where('stock', '>', 0);
            
            // Búsqueda por texto
            if ($query) {
                $productos->where(function($q) use ($query) {
                    $q->where('nombre', 'LIKE', "%{$query}%")
                      ->orWhere('descripcion', 'LIKE', "%{$query}%");
                });
            }
            
            // Filtro por categoría
            if ($categoria) {
                $productos->whereHas('categoria', function($q) use ($categoria) {
                    $q->where('nombre', 'LIKE', "%{$categoria}%");
                });
            }
            
            // Filtro por precio
            $productos->whereBetween('precio', [$precioMin, $precioMax]);
            
            $resultados = $productos->get();
            
            return response()->json([
                'success' => true,
                'data' => $resultados,
                'total' => $resultados->count(),
                'query' => $query
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error en la búsqueda: ' . $e->getMessage()
            ], 500);
        }
    }

    // Método para subir imágenes
    public function uploadImage(Request $request)
    {
        try {
            \Log::info('📤 Iniciando subida de imagen');
            
            $validator = Validator::make($request->all(), [
                'imagen' => 'required|image|mimes:jpeg,png,jpg,gif,jfif,webp|max:5120', // 5MB máximo - acepta jfif y webp
            ]);

            if ($validator->fails()) {
                \Log::error('❌ Validación fallida', $validator->errors()->toArray());
                return response()->json([
                    'success' => false,
                    'message' => 'Archivo inválido',
                    'errors' => $validator->errors()
                ], 422);
            }

            if ($request->hasFile('imagen')) {
                $file = $request->file('imagen');
                
                // Validar que el archivo existe y es válido
                if (!$file || !$file->isValid()) {
                    \Log::error('❌ Archivo de imagen inválido');
                    return response()->json([
                        'success' => false,
                        'message' => 'Archivo de imagen inválido'
                    ], 400);
                }
                
                // Generar nombre único
                $filename = time() . '_' . uniqid() . '.' . $file->getClientOriginalExtension();
                
                // Intentar usar Cloudinary si está configurado, sino usar Storage local
                // Verificar tanto la configuración como la variable de entorno
                $cloudinaryUrl = config('cloudinary.cloud_url') ?: env('CLOUDINARY_URL');
                
                // Log detallado para diagnóstico
                \Log::info('🔍 Verificando Cloudinary', [
                    'cloudinary_config' => config('cloudinary.cloud_url') ? 'Sí' : 'No',
                    'cloudinary_env' => env('CLOUDINARY_URL') ? 'Sí (' . substr(env('CLOUDINARY_URL'), 0, 30) . '...)' : 'No',
                    'cloudinary_detected' => $cloudinaryUrl ? 'Sí' : 'No',
                    'file_size' => $file->getSize(),
                    'file_name' => $file->getClientOriginalName()
                ]);
                
                // Si Cloudinary está configurado pero no se detecta, intentar configurarlo manualmente
                if (!$cloudinaryUrl && env('CLOUDINARY_URL')) {
                    \Log::info('⚠️ Cloudinary URL encontrada en env pero no en config, configurando manualmente');
                    // El paquete debería leer automáticamente de CLOUDINARY_URL
                    $cloudinaryUrl = env('CLOUDINARY_URL');
                }
                
                if ($cloudinaryUrl) {
                    try {
                        \Log::info('☁️ Intentando subir a Cloudinary...');
                        
                        // Subir a Cloudinary
                        $uploadResult = Cloudinary::upload($file->getRealPath(), [
                            'folder' => 'productos',
                            'public_id' => pathinfo($filename, PATHINFO_FILENAME),
                            'resource_type' => 'image',
                        ]);
                        
                        $imageUrl = $uploadResult->getSecurePath();
                        // Guardar la URL completa de Cloudinary para que el frontend la use directamente
                        $filename = $imageUrl;
                        
                        \Log::info('✅ Imagen subida a Cloudinary exitosamente', [
                            'filename' => $filename,
                            'url' => $imageUrl
                        ]);
                        
                        return response()->json([
                            'success' => true,
                            'message' => 'Imagen subida exitosamente',
                            'data' => [
                                'filename' => $filename, // URL completa de Cloudinary
                                'path' => $filename,
                                'url' => $imageUrl
                            ]
                        ]);
                    } catch (\Exception $e) {
                        \Log::error('💥 Error al subir a Cloudinary, usando fallback local', [
                            'message' => $e->getMessage(),
                            'file' => $e->getFile(),
                            'line' => $e->getLine(),
                            'class' => get_class($e)
                        ]);
                        
                        // Fallback a storage local si Cloudinary falla
                        try {
                            $path = $file->storeAs('productos', $filename, 'public');
                            \Log::info('✅ Imagen guardada localmente como fallback');
                            
                            return response()->json([
                                'success' => true,
                                'message' => 'Imagen subida localmente (Cloudinary no disponible)',
                                'data' => [
                                    'filename' => $filename,
                                    'path' => $path,
                                    'url' => Storage::url($path)
                                ]
                            ]);
                        } catch (\Exception $storageError) {
                            \Log::error('💥 Error también en storage local', [
                                'message' => $storageError->getMessage()
                            ]);
                            throw $storageError; // Re-lanzar para que se maneje en el catch principal
                        }
                    }
                } else {
                    \Log::info('⚠️ Cloudinary no configurado, usando storage local');
                    // Fallback: Usar Storage de Laravel local
                    $path = $file->storeAs('productos', $filename, 'public');
                    
                    \Log::info('✅ Imagen subida localmente exitosamente', [
                        'filename' => $filename,
                        'path' => $path,
                        'url' => Storage::url($path)
                    ]);
                    
                    return response()->json([
                        'success' => true,
                        'message' => 'Imagen subida exitosamente',
                        'data' => [
                            'filename' => $filename,
                            'path' => $path,
                            'url' => Storage::url($path)
                        ]
                    ]);
                }
            } else {
                \Log::error('❌ No se encontró archivo de imagen');
                return response()->json([
                    'success' => false,
                    'message' => 'No se encontró archivo de imagen'
                ], 400);
            }
        } catch (\Exception $e) {
            \Log::error('💥 Error completo al subir imagen', [
                'message' => $e->getMessage(),
                'file' => $e->getFile(),
                'line' => $e->getLine(),
                'trace' => $e->getTraceAsString(),
                'class' => get_class($e)
            ]);
            
            // Siempre mostrar el mensaje de error para diagnóstico
            // En producción también mostrar mensaje útil
            $errorMessage = 'Error al subir imagen: ' . $e->getMessage();
            
            return response()->json([
                'success' => false,
                'message' => $errorMessage,
                'error' => $e->getMessage(),
                'file' => config('app.debug') ? $e->getFile() . ':' . $e->getLine() : null
            ], 500);
        }
    }
}
