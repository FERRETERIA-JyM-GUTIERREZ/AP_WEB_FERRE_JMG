# 🚀 Checklist para Despliegue en AWS

## 📋 Pre-requisitos

- [ ] Cuenta de AWS activa
- [ ] Instancia EC2 o Elastic Beanstalk configurada
- [ ] Base de datos RDS MySQL configurada
- [ ] Dominio configurado (opcional pero recomendado)
- [ ] Certificado SSL (HTTPS) configurado

---

## 🔧 BACKEND (Laravel) - Configuración

### 1. Variables de Entorno (.env)

Crea/actualiza el archivo `.env` en el servidor con:

```env
APP_NAME="JM Ferretería"
APP_ENV=production
APP_KEY=base64:... (generar con php artisan key:generate)
APP_DEBUG=false
APP_URL=https://api.tudominio.com

DB_CONNECTION=mysql
DB_HOST=tu-rds-endpoint.region.rds.amazonaws.com
DB_PORT=3306
DB_DATABASE=jm_ferreteria
DB_USERNAME=tu_usuario
DB_PASSWORD=tu_password_seguro

FRONTEND_URL=https://tudominio.com

# Google OAuth - IMPORTANTE: Actualizar con URLs de producción
GOOGLE_CLIENT_ID=170789156059-74q7bets2o7jij8sb3ikj7e52feaud5t.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=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
GOOGLE_REDIRECT_URI=https://api.tudominio.com/api/auth/google/callback

# CORS - Ya configurado para usar FRONTEND_URL
```

### 2. Comandos de Instalación en el Servidor

```bash
cd /var/www/html/jm-ferreteria-backend

# Instalar dependencias
composer install --no-dev --optimize-autoloader

# Generar clave de aplicación
php artisan key:generate

# Ejecutar migraciones
php artisan migrate --force

# Optimizar para producción
php artisan config:cache
php artisan route:cache
php artisan view:cache

# Configurar permisos
sudo chown -R www-data:www-data storage bootstrap/cache
sudo chmod -R 775 storage bootstrap/cache
```

### 3. Configuración de Google OAuth para Producción

**IMPORTANTE:** Debes agregar las URLs de producción en Google Cloud Console:

1. Ve a [Google Cloud Console](https://console.cloud.google.com/)
2. Selecciona tu proyecto
3. Ve a "APIs & Services" > "Credentials"
4. Abre "JM Ferreteria Web Client"
5. Agrega en "Authorized JavaScript origins":
   - `https://tudominio.com`
   - `https://api.tudominio.com` (si usas subdominio)
6. Agrega en "Authorized redirect URIs":
   - `https://api.tudominio.com/api/auth/google/callback`
7. Guarda los cambios

---

## 🎨 FRONTEND (React) - Configuración

### 1. Variables de Entorno

Crea el archivo `.env.production` en `jm-ferreteria-frontend/`:

```env
REACT_APP_API_URL=https://api.tudominio.com
```

**Nota:** Si el backend y frontend están en el mismo dominio:
```env
REACT_APP_API_URL=https://tudominio.com
```

### 2. Compilación para Producción

```bash
cd jm-ferreteria-frontend

# Instalar dependencias
npm install

# Compilar para producción
npm run build
```

### 3. Subir Archivos

- Sube el contenido de la carpeta `build/` al servidor web (S3, CloudFront, o servidor web estático)

---

## 🔒 SEGURIDAD

### Checklist de Seguridad:

- [ ] `APP_DEBUG=false` en producción
- [ ] `APP_ENV=production` configurado
- [ ] Contraseñas de base de datos seguras
- [ ] HTTPS configurado (certificado SSL)
- [ ] CORS configurado correctamente
- [ ] `.env` NO está en el repositorio (verificar `.gitignore`)
- [ ] Permisos de archivos correctos (775 para storage, 644 para archivos)
- [ ] Firewall configurado (solo puertos necesarios abiertos)

---

## 🌐 CONFIGURACIÓN DE SERVIDOR WEB

### Nginx (Recomendado)

```nginx
# Backend (API)
server {
    listen 80;
    server_name api.tudominio.com;
    
    # Redirigir HTTP a HTTPS
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name api.tudominio.com;
    
    root /var/www/html/jm-ferreteria-backend/public;
    index index.php;
    
    ssl_certificate /path/to/certificate.crt;
    ssl_certificate_key /path/to/private.key;
    
    location / {
        try_files $uri $uri/ /index.php?$query_string;
    }
    
    location ~ \.php$ {
        fastcgi_pass unix:/var/run/php/php8.2-fpm.sock;
        fastcgi_index index.php;
        fastcgi_param SCRIPT_FILENAME $realpath_root$fastcgi_script_name;
        include fastcgi_params;
    }
}

# Frontend (React)
server {
    listen 80;
    server_name tudominio.com www.tudominio.com;
    
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name tudominio.com www.tudominio.com;
    
    root /var/www/html/jm-ferreteria-frontend/build;
    index index.html;
    
    ssl_certificate /path/to/certificate.crt;
    ssl_certificate_key /path/to/private.key;
    
    location / {
        try_files $uri $uri/ /index.html;
    }
}
```

---

## ✅ VERIFICACIÓN POST-DESPLIEGUE

### Backend:

- [ ] Acceder a `https://api.tudominio.com/api/test` - Debe responder JSON
- [ ] Verificar que las migraciones se ejecutaron correctamente
- [ ] Probar login con Google OAuth
- [ ] Verificar logs en `storage/logs/laravel.log`

### Frontend:

- [ ] La página carga correctamente
- [ ] Las imágenes se cargan
- [ ] El login funciona
- [ ] El login con Google funciona
- [ ] Las peticiones a la API funcionan
- [ ] No hay errores en la consola del navegador

---

## 🐛 SOLUCIÓN DE PROBLEMAS COMUNES

### Error: "CORS policy"
- Verificar que `FRONTEND_URL` en `.env` del backend sea correcta
- Verificar que el frontend esté usando la URL correcta en `REACT_APP_API_URL`

### Error: "Google OAuth invalid_client"
- Verificar que las URLs de producción estén agregadas en Google Cloud Console
- Verificar que `GOOGLE_REDIRECT_URI` en `.env` coincida con la URL en Google Cloud Console

### Error: "500 Internal Server Error"
- Verificar permisos de archivos: `chmod -R 775 storage bootstrap/cache`
- Verificar logs: `tail -f storage/logs/laravel.log`
- Verificar que `APP_KEY` esté generado

### Error: "Database connection failed"
- Verificar credenciales de RDS en `.env`
- Verificar que el Security Group de RDS permita conexiones desde EC2
- Verificar que el endpoint de RDS sea correcto

---

## 📝 NOTAS IMPORTANTES

1. **Google OAuth:** Las URLs de producción DEBEN estar agregadas en Google Cloud Console antes de desplegar
2. **HTTPS:** Es obligatorio para Google OAuth en producción
3. **CORS:** Asegúrate de que `FRONTEND_URL` en el backend coincida con la URL real del frontend
4. **Base de Datos:** Usa RDS para producción, no bases de datos locales
5. **Backups:** Configura backups automáticos de la base de datos

---

## 🔄 ACTUALIZACIONES FUTURAS

Para actualizar el código en producción:

```bash
# Backend
cd /var/www/html/jm-ferreteria-backend
git pull origin main
composer install --no-dev --optimize-autoloader
php artisan migrate --force
php artisan config:cache
php artisan route:cache
php artisan view:cache

# Frontend
cd /var/www/html/jm-ferreteria-frontend
git pull origin main
npm install
npm run build
# Subir contenido de build/ al servidor web
```

