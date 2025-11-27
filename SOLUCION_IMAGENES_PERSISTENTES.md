# 🔧 Solución para Imágenes Persistentes en Producción

## ❌ Problema Actual

Las imágenes se guardan en `public/img_productos/` que **se borra en cada despliegue** en Render/Railway porque:
- Cada despliegue crea un nuevo contenedor
- Los archivos locales no persisten entre despliegues
- Las imágenes desaparecen después de cada `git push`

## ✅ Solución Implementada (Parcial)

Se cambió el código para usar **Laravel Storage** (`storage/app/public/productos`) que es más robusto, pero **aún puede tener problemas en algunos hosts**.

### Cambios Realizados:

1. ✅ **Backend**: Cambiado a usar `Storage::disk('public')` 
2. ✅ **Rutas**: Mantiene compatibilidad con `/img_productos/` (fallback)
3. ✅ **Build**: Agregado `php artisan storage:link` al build command

## 🚀 Solución Definitiva: AWS S3

Para que las imágenes **realmente persistan**, necesitas usar **AWS S3** o un servicio similar.

### Opción 1: AWS S3 (Recomendado)

#### Paso 1: Crear bucket en S3

1. Ve a [AWS Console](https://console.aws.amazon.com/s3/)
2. Crea un bucket (ej: `jm-ferreteria-imagenes`)
3. Configura permisos públicos para lectura
4. Anota el nombre del bucket y la región

#### Paso 2: Configurar variables de entorno en Render/Railway

```env
FILESYSTEM_DISK=s3
AWS_ACCESS_KEY_ID=tu_access_key
AWS_SECRET_ACCESS_KEY=tu_secret_key
AWS_DEFAULT_REGION=us-east-1
AWS_BUCKET=jm-ferreteria-imagenes
AWS_URL=https://jm-ferreteria-imagenes.s3.us-east-1.amazonaws.com
```

#### Paso 3: Actualizar código (ya está listo)

El código ya está preparado para usar S3. Solo necesitas cambiar `FILESYSTEM_DISK` a `s3` en las variables de entorno.

### Opción 2: Cloudinary (Alternativa más fácil)

Cloudinary es más fácil de configurar y tiene plan gratuito generoso.

#### Paso 1: Crear cuenta en Cloudinary

1. Ve a [Cloudinary](https://cloudinary.com/)
2. Crea cuenta gratuita
3. Obtén tus credenciales (Cloud Name, API Key, API Secret)

#### Paso 2: Instalar paquete

```bash
composer require cloudinary-labs/cloudinary-laravel
```

#### Paso 3: Configurar variables de entorno

```env
CLOUDINARY_URL=cloudinary://api_key:api_secret@cloud_name
```

#### Paso 4: Actualizar código para usar Cloudinary

Modificar `ProductoController.php` para usar Cloudinary en lugar de Storage local.

### Opción 3: Volumen Persistente (Solo Railway)

Si usas Railway, puedes configurar un volumen persistente:

1. En Railway, ve a tu servicio
2. Agrega un volumen persistente
3. Monta en `/app/storage/app/public`
4. Las imágenes persistirán entre despliegues

## 📋 Pasos Inmediatos (Solución Temporal)

Mientras implementas S3, puedes:

1. **Hacer backup de imágenes existentes** antes de cada despliegue
2. **Restaurar imágenes** después del despliegue
3. O **migrar todas las imágenes a S3** de una vez

## 🔄 Script de Migración de Imágenes a S3

Si ya tienes imágenes en producción, necesitas migrarlas a S3:

```php
// Crear comando: php artisan migrate:images-to-s3

use Illuminate\Console\Command;
use Illuminate\Support\Facades\Storage;
use App\Models\Producto;

class MigrateImagesToS3 extends Command
{
    protected $signature = 'migrate:images-to-s3';
    
    public function handle()
    {
        $productos = Producto::whereNotNull('imagen')->get();
        
        foreach ($productos as $producto) {
            $oldPath = public_path('img_productos/' . $producto->imagen);
            
            if (file_exists($oldPath)) {
                $file = file_get_contents($oldPath);
                Storage::disk('s3')->put('productos/' . $producto->imagen, $file);
                $this->info("Migrado: {$producto->imagen}");
            }
        }
        
        $this->info('Migración completada');
    }
}
```

## ⚠️ Importante

**Sin S3 o volumen persistente, las imágenes seguirán desapareciendo en cada despliegue.**

La solución implementada mejora el código pero **NO resuelve el problema de persistencia** en Render/Railway sin almacenamiento externo.

## 🎯 Recomendación

**Usa AWS S3** - Es la solución más profesional y escalable:
- ✅ Persistencia garantizada
- ✅ Escalable
- ✅ CDN incluido
- ✅ Plan gratuito generoso (5GB, 20,000 requests/mes)
- ✅ Código ya preparado

