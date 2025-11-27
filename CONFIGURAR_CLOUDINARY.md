# ☁️ Configurar Cloudinary (Gratis - 25GB)

## 🎯 ¿Por qué Cloudinary?

- ✅ **25GB de almacenamiento GRATIS**
- ✅ **25GB de ancho de banda/mes GRATIS**
- ✅ **CDN incluido** (imágenes rápidas en todo el mundo)
- ✅ **Optimización automática** de imágenes
- ✅ **Transformaciones** (redimensionar, recortar, etc.)
- ✅ **Muy fácil de configurar**

## 📋 Paso 1: Crear cuenta en Cloudinary

1. Ve a [https://cloudinary.com/users/register/free](https://cloudinary.com/users/register/free)
2. Regístrate con tu email (gratis)
3. Confirma tu email
4. Inicia sesión en el Dashboard

## 📋 Paso 2: Obtener credenciales

1. En el Dashboard de Cloudinary, verás tu **Cloud Name**
2. Ve a **Settings** → **Security**
3. Copia tu **API Key** y **API Secret**

Tendrás algo como:
```
Cloud Name: dxxxxx
API Key: 123456789012345
API Secret: abcdefghijklmnopqrstuvwxyz123456
```

## 📋 Paso 3: Configurar en Render/Railway

### Opción A: Usando Variable de Entorno CLOUDINARY_URL (Más fácil)

En Render o Railway, agrega esta variable de entorno:

```env
CLOUDINARY_URL=cloudinary://123456789012345:abcdefghijklmnopqrstuvwxyz123456@dxxxxx
```

**Formato:** `cloudinary://API_KEY:API_SECRET@CLOUD_NAME`

### Opción B: Variables separadas

```env
CLOUDINARY_CLOUD_NAME=dxxxxx
CLOUDINARY_API_KEY=123456789012345
CLOUDINARY_API_SECRET=abcdefghijklmnopqrstuvwxyz123456
CLOUDINARY_SECURE=true
```

## 📋 Paso 4: Instalar dependencias

El paquete ya está agregado a `composer.json`. Solo necesitas ejecutar en producción:

```bash
composer install --no-dev --optimize-autoloader
```

O si estás en Render/Railway, se instalará automáticamente en el build.

## 📋 Paso 5: Publicar configuración (Opcional)

Si quieres personalizar la configuración:

```bash
php artisan vendor:publish --provider="CloudinaryLabs\CloudinaryLaravel\CloudinaryServiceProvider"
```

Esto creará `config/cloudinary.php` donde puedes ajustar opciones.

## ✅ Verificar que funciona

1. Sube una imagen desde el inventario
2. Revisa los logs - deberías ver: "✅ Imagen subida a Cloudinary exitosamente"
3. La imagen debería aparecer en tu Dashboard de Cloudinary en la carpeta `productos/`

## 🔄 Migrar imágenes existentes

Si ya tienes imágenes en producción, puedes migrarlas a Cloudinary:

```php
// Crear comando: php artisan migrate:images-to-cloudinary
use Illuminate\Console\Command;
use CloudinaryLabs\CloudinaryLaravel\Facades\Cloudinary;
use App\Models\Producto;

class MigrateImagesToCloudinary extends Command
{
    protected $signature = 'migrate:images-to-cloudinary';
    
    public function handle()
    {
        $productos = Producto::whereNotNull('imagen')->get();
        
        foreach ($productos as $producto) {
            $oldPath = public_path('img_productos/' . $producto->imagen);
            
            if (file_exists($oldPath)) {
                $uploadResult = Cloudinary::upload($oldPath, [
                    'folder' => 'productos',
                    'public_id' => pathinfo($producto->imagen, PATHINFO_FILENAME),
                ]);
                
                // Actualizar el producto con la nueva URL
                $producto->imagen = basename($uploadResult->getSecurePath());
                $producto->save();
                
                $this->info("Migrado: {$producto->imagen}");
            }
        }
        
        $this->info('Migración completada');
    }
}
```

## 🎉 ¡Listo!

Una vez configurado:
- ✅ Las nuevas imágenes se subirán a Cloudinary automáticamente
- ✅ Las imágenes persistirán permanentemente
- ✅ No se borrarán en cada despliegue
- ✅ Tendrás CDN global incluido
- ✅ Optimización automática de imágenes

## 📊 Límites del Plan Gratuito

- **25GB de almacenamiento** (suficiente para miles de imágenes)
- **25GB de ancho de banda/mes** (muy generoso)
- **Transformaciones ilimitadas**
- **CDN incluido**

Si necesitas más, el plan siguiente es muy económico ($89/mes).

## 🔒 Seguridad

- Las credenciales se guardan en variables de entorno (seguro)
- Las imágenes pueden ser públicas o privadas
- Puedes configurar firmas para URLs seguras

## 🆘 Problemas Comunes

### Error: "Cloudinary URL not configured"
- Verifica que `CLOUDINARY_URL` esté configurada correctamente
- Formato: `cloudinary://API_KEY:API_SECRET@CLOUD_NAME`

### Error: "Invalid credentials"
- Verifica que copiaste correctamente API Key y Secret
- Asegúrate de que no haya espacios extra

### Las imágenes no se suben
- Revisa los logs del servidor
- Verifica que el paquete se instaló: `composer show cloudinary-labs/cloudinary-laravel`

