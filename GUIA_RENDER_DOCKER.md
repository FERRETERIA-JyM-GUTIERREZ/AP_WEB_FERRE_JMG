# 🐳 Guía: Desplegar en Render con Dockerfile

## ✅ Ventajas de usar Docker en Render

- **Más control**: Entorno exacto que defines tú
- **Más estable**: No depende de detección automática de Render
- **Reproducible**: Mismo entorno en desarrollo y producción
- **Mejor rendimiento**: Optimizado específicamente para Laravel

## 📋 Pasos para Desplegar en Render

### Paso 1: Preparar el Repositorio

Los archivos necesarios ya están creados:
- ✅ `Dockerfile` - Configuración del contenedor
- ✅ `.dockerignore` - Archivos a ignorar
- ✅ `docker/nginx.conf` - Configuración de Nginx
- ✅ `docker/supervisord.conf` - Gestión de procesos
- ✅ `docker/start.sh` - Script de inicio

### Paso 2: Crear Servicio en Render

1. Ve a https://render.com
2. Inicia sesión con GitHub
3. Haz clic en **"New +"** → **"Web Service"**
4. Conecta tu repositorio: `FERRETERIA-JyM-GUTIERREZ/AP_WEB_FERRE_JMG`
5. Configura el servicio:

   **Configuración Básica:**
   - **Name**: `jm-ferreteria-backend`
   - **Environment**: `Docker`
   - **Region**: Elige la más cercana (ej: "Oregon (US West)")
   - **Branch**: `main`
   - **Root Directory**: `jm-ferreteria-backend`
   - **Dockerfile Path**: `Dockerfile` (o deja vacío si está en la raíz del backend)
   - **Docker Context**: `.` (punto, significa el directorio actual)

   **Plan:**
   - Selecciona **"Free"**

### Paso 3: Configurar Variables de Entorno

En la sección **"Environment Variables"**, agrega:

```env
APP_ENV=production
APP_DEBUG=false
APP_KEY=(se generará automáticamente o usa: php artisan key:generate --show)
DB_CONNECTION=pgsql
DB_HOST=db.jzmmjydlnqqryloveuqw.supabase.co
DB_PORT=5432
DB_DATABASE=postgres
DB_USERNAME=postgres
DB_PASSWORD=Emersonvelez$3
FRONTEND_URL=https://ap-web-ferre-jmg.vercel.app
GOOGLE_CLIENT_ID=170789156059-74q7bets2o7jij8sb3ikj7e52feaud5t.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=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
GOOGLE_REDIRECT_URI=https://tu-backend.onrender.com/api/auth/google/callback
```

**⚠️ IMPORTANTE:**
- Reemplaza `https://tu-backend.onrender.com` con la URL real que Render te dé después del deploy
- El `APP_KEY` se puede generar localmente con: `php artisan key:generate --show`

### Paso 4: Desplegar

1. Haz clic en **"Create Web Service"**
2. Render comenzará a construir la imagen Docker (puede tardar 5-10 minutos)
3. Una vez completado, obtendrás una URL como: `https://jm-ferreteria-backend.onrender.com`

### Paso 5: Verificar Migraciones

Las migraciones se ejecutan automáticamente al iniciar el contenedor (ver `docker/start.sh`).

Para verificar:
1. Ve a la pestaña **"Logs"** en Render
2. Busca mensajes como:
   - "📦 Ejecutando migraciones..."
   - "Migration table created successfully"

Si hay errores, aparecerán en los logs.

### Paso 6: Actualizar GOOGLE_REDIRECT_URI

Después de obtener la URL de Render:
1. Ve a **"Environment"** → **"Environment Variables"**
2. Actualiza `GOOGLE_REDIRECT_URI` con tu URL real:
   ```
   https://jm-ferreteria-backend.onrender.com/api/auth/google/callback
   ```
3. Guarda los cambios (esto redeployará automáticamente)

### Paso 7: Actualizar Google Cloud Console

1. Ve a https://console.cloud.google.com
2. Selecciona tu proyecto
3. Ve a **"APIs & Services"** → **"Credentials"**
4. Abre tu OAuth 2.0 Client ID
5. Agrega en **"Authorized redirect URIs"**:
   ```
   https://jm-ferreteria-backend.onrender.com/api/auth/google/callback
   ```
6. Guarda los cambios

## 🔧 Comandos Útiles

### Ver logs en tiempo real:
Los logs están disponibles en la pestaña **"Logs"** de Render.

### Reiniciar el servicio:
En Render, ve a tu servicio → **"Manual Deploy"** → **"Deploy latest commit"**

### Ejecutar comandos Artisan (si Render lo permite):
Algunos planes de Render permiten ejecutar comandos. Si no, puedes agregarlos al `start.sh`.

## 🐛 Solución de Problemas

### Error: "Connection refused" al conectar a la base de datos
- Verifica que `DB_HOST` esté correcto: `db.jzmmjydlnqqryloveuqw.supabase.co`
- Verifica que `DB_PASSWORD` sea correcta
- Verifica que Supabase permita conexiones desde cualquier IP (Settings → Database → Network Restrictions)

### Error: "Migration failed"
- Revisa los logs en Render
- Verifica que las credenciales de la base de datos sean correctas
- Puede ser que las migraciones ya estén ejecutadas (es normal)

### Error: "Port already in use"
- Render maneja el puerto automáticamente con la variable `$PORT`
- El script `start.sh` ya está configurado para usar `$PORT`

### El servicio "duerme" después de 15 minutos
- Esto es normal en el plan gratuito de Render
- El primer acceso después de dormir puede tardar ~30 segundos
- Para evitar esto, considera usar un servicio de "ping" o actualizar a un plan de pago

## ✅ Checklist Final

- [ ] Servicio creado en Render con Docker
- [ ] Variables de entorno configuradas
- [ ] Deploy completado exitosamente
- [ ] Migraciones ejecutadas (verificar en logs)
- [ ] `GOOGLE_REDIRECT_URI` actualizado con URL real de Render
- [ ] Google Cloud Console actualizado con nueva URL
- [ ] Frontend actualizado con nueva URL del backend (si es necesario)

## 🎉 ¡Listo!

Tu aplicación Laravel debería estar funcionando en Render con Docker. La ventaja es que ahora tienes control total sobre el entorno y es más fácil de mantener y actualizar.

