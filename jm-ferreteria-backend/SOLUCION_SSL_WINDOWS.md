# Solución para Error SSL en Windows

## Problema

Si ves el error:
```
cURL error 60: SSL certificate problem: unable to get local issuer certificate
```

Esto ocurre porque cURL en Windows no tiene los certificados CA (Certificate Authority) configurados por defecto.

## Solución Automática (Recomendada)

El código ya está configurado para manejar este problema automáticamente:

1. **En desarrollo local**: Si no encuentra el archivo `cacert.pem`, desactivará automáticamente la verificación SSL (solo en entorno `local` o `development`).

2. **En producción**: Debes tener los certificados CA configurados correctamente.

## Solución Manual (Opcional)

Si quieres usar certificados CA en desarrollo local:

### Opción 1: Descargar cacert.pem automáticamente

Ejecuta el script PowerShell en el directorio del backend:

```powershell
cd jm-ferreteria-backend
.\download_cacert.ps1
```

Esto descargará el archivo `cacert.pem` en el directorio del backend.

### Opción 2: Descargar manualmente

1. Descarga el archivo desde: https://curl.se/ca/cacert.pem
2. Guárdalo como `cacert.pem` en el directorio `jm-ferreteria-backend/`
3. El código lo detectará automáticamente

### Opción 3: Configurar en php.ini

1. Descarga `cacert.pem` desde https://curl.se/ca/cacert.pem
2. Guárdalo en una ubicación permanente (ej: `C:/php/extras/ssl/cacert.pem`)
3. Edita tu `php.ini` y agrega:
   ```ini
   curl.cainfo = "C:/php/extras/ssl/cacert.pem"
   ```
4. Reinicia tu servidor web

## Verificación

Para verificar que la solución funciona:

1. Intenta hacer login con Google
2. Si funciona, el problema está resuelto
3. Si aún hay problemas, revisa los logs en `storage/logs/laravel.log`

## Notas Importantes

- ⚠️ **NUNCA** desactives la verificación SSL en producción
- El código solo desactiva SSL en entornos `local` o `development`
- En producción, asegúrate de tener los certificados CA configurados correctamente

## Ubicaciones donde el código busca cacert.pem

El código busca automáticamente el archivo en estas ubicaciones:

1. `jm-ferreteria-backend/cacert.pem` (directorio del proyecto)
2. `vendor/guzzlehttp/guzzle/src/cacert.pem` (si está incluido con Composer)
3. Directorio de `php.ini` + `/cacert.pem`
4. Directorio de extensiones PHP + `/../cacert.pem`
5. `C:/php/extras/ssl/cacert.pem` (ubicación común en Windows)
6. Variable de entorno `CURL_CA_BUNDLE`

