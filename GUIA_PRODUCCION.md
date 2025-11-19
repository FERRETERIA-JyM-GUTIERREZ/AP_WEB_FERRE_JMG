# 🚀 Guía para Subir tu Proyecto a Producción

## 📋 Requisitos Necesarios

### Para el Backend (Laravel):
- PHP 8.2 o superior
- Composer
- Base de datos MySQL/MariaDB
- Servidor web (Nginx o Apache)

### Para el Frontend (React):
- Node.js 18+ (solo para compilar)
- Servidor web para archivos estáticos

---

## 🎯 OPCIÓN 1: Hosting Compartido (Más Fácil)

### Proveedores Recomendados:
- **Hostinger** ($3-5/mes): https://www.hostinger.com
- **Namecheap** ($4-6/mes): https://www.namecheap.com
- **SiteGround** ($4-7/mes): https://www.siteground.com

### Pasos:

#### 1. Preparar el Backend:
```bash
cd jm-ferreteria-backend

# Instalar dependencias
composer install --no-dev --optimize-autoloader

# Crear archivo .env de producción
cp .env .env.production

# Editar .env.production con:
# - APP_ENV=production
# - APP_DEBUG=false
# - APP_URL=https://tudominio.com
# - DB_HOST=tu_host_db
# - DB_DATABASE=tu_base_datos
# - DB_USERNAME=tu_usuario
# - DB_PASSWORD=tu_password
# - FRONTEND_URL=https://tudominio.com

# Generar clave de aplicación
php artisan key:generate

# Optimizar para producción
php artisan config:cache
php artisan route:cache
php artisan view:cache
```

#### 2. Subir archivos al servidor:
- Sube TODA la carpeta `jm-ferreteria-backend` al servidor
- La carpeta `public` debe ser accesible desde la web
- Configura el servidor para que apunte a `public/index.php`

#### 3. Configurar Base de Datos:
- Crea la base de datos en el panel de control
- Ejecuta las migraciones:
```bash
php artisan migrate --force
php artisan db:seed --force
```

#### 4. Preparar el Frontend:
```bash
cd jm-ferreteria-frontend

# Crear archivo .env.production
echo "REACT_APP_API_URL=https://tudominio.com/api" > .env.production

# Compilar para producción
npm run build
```

#### 5. Subir Frontend:
- Sube el contenido de la carpeta `build` al servidor
- Puedes usar un subdominio como `app.tudominio.com` o `www.tudominio.com`

---

## 🎯 OPCIÓN 2: VPS (Más Control) - RECOMENDADO

### Proveedores Recomendados:
- **DigitalOcean** ($6/mes): https://www.digitalocean.com
- **Linode** ($5/mes): https://www.linode.com
- **Vultr** ($6/mes): https://www.vultr.com

### Pasos Completos:

#### 1. Crear VPS:
- Elige Ubuntu 22.04 LTS
- Mínimo: 1GB RAM, 1 CPU, 25GB SSD

#### 2. Conectar por SSH:
```bash
ssh root@TU_IP_SERVIDOR
```

#### 3. Instalar Software Necesario:
```bash
# Actualizar sistema
apt update && apt upgrade -y

# Instalar Nginx
apt install nginx -y

# Instalar PHP 8.2
apt install software-properties-common -y
add-apt-repository ppa:ondrej/php -y
apt update
apt install php8.2-fpm php8.2-cli php8.2-mysql php8.2-xml php8.2-mbstring php8.2-curl php8.2-zip -y

# Instalar Composer
curl -sS https://getcomposer.org/installer | php
mv composer.phar /usr/local/bin/composer

# Instalar Node.js (para compilar frontend)
curl -fsSL https://deb.nodesource.com/setup_18.x | bash -
apt install -y nodejs

# Instalar MySQL
apt install mysql-server -y
mysql_secure_installation
```

#### 4. Configurar Base de Datos:
```bash
mysql -u root -p
```

```sql
CREATE DATABASE jm_ferreteria;
CREATE USER 'ferreteria_user'@'localhost' IDENTIFIED BY 'tu_password_seguro';
GRANT ALL PRIVILEGES ON jm_ferreteria.* TO 'ferreteria_user'@'localhost';
FLUSH PRIVILEGES;
EXIT;
```

#### 5. Subir Código al Servidor:
```bash
# En tu computadora local, comprime el proyecto
# Luego sube los archivos usando SCP o SFTP

# En el servidor, crea directorio
mkdir -p /var/www/jm-ferreteria
cd /var/www/jm-ferreteria

# Descomprime y organiza:
# - Backend en: /var/www/jm-ferreteria/backend
# - Frontend build en: /var/www/jm-ferreteria/frontend
```

#### 6. Configurar Backend:
```bash
cd /var/www/jm-ferreteria/backend

# Instalar dependencias
composer install --no-dev --optimize-autoloader

# Configurar .env
nano .env
# Edita:
# APP_ENV=production
# APP_DEBUG=false
# APP_URL=https://tudominio.com
# DB_HOST=localhost
# DB_DATABASE=jm_ferreteria
# DB_USERNAME=ferreteria_user
# DB_PASSWORD=tu_password_seguro
# FRONTEND_URL=https://tudominio.com

# Permisos
chown -R www-data:www-data /var/www/jm-ferreteria
chmod -R 755 /var/www/jm-ferreteria
chmod -R 775 /var/www/jm-ferreteria/backend/storage
chmod -R 775 /var/www/jm-ferreteria/backend/bootstrap/cache

# Generar clave
php artisan key:generate

# Migraciones
php artisan migrate --force

# Optimizar
php artisan config:cache
php artisan route:cache
php artisan view:cache
```

#### 7. Configurar Nginx para Backend:
```bash
nano /etc/nginx/sites-available/jm-ferreteria-api
```

```nginx
server {
    listen 80;
    server_name api.tudominio.com;  # O tudominio.com/api
    
    root /var/www/jm-ferreteria/backend/public;
    index index.php;

    location / {
        try_files $uri $uri/ /index.php?$query_string;
    }

    location ~ \.php$ {
        fastcgi_pass unix:/var/run/php/php8.2-fpm.sock;
        fastcgi_param SCRIPT_FILENAME $realpath_root$fastcgi_script_name;
        include fastcgi_params;
    }

    location ~ /\.(?!well-known).* {
        deny all;
    }
}
```

```bash
# Activar sitio
ln -s /etc/nginx/sites-available/jm-ferreteria-api /etc/nginx/sites-enabled/
nginx -t
systemctl reload nginx
```

#### 8. Configurar Nginx para Frontend:
```bash
nano /etc/nginx/sites-available/jm-ferreteria-frontend
```

```nginx
server {
    listen 80;
    server_name tudominio.com www.tudominio.com;
    
    root /var/www/jm-ferreteria/frontend;
    index index.html;

    location / {
        try_files $uri $uri/ /index.html;
    }

    # Cache para archivos estáticos
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }
}
```

```bash
ln -s /etc/nginx/sites-available/jm-ferreteria-frontend /etc/nginx/sites-enabled/
nginx -t
systemctl reload nginx
```

#### 9. Instalar SSL (Certificado HTTPS):
```bash
apt install certbot python3-certbot-nginx -y
certbot --nginx -d tudominio.com -d www.tudominio.com
```

---

## 🎯 OPCIÓN 3: Plataformas Cloud (Más Fácil pero Más Caro)

### Railway (Recomendado para empezar):
1. Ve a https://railway.app
2. Conecta tu repositorio de GitHub
3. Crea dos servicios:
   - Backend (Laravel)
   - Frontend (React)
4. Configura variables de entorno
5. ¡Listo!

### Render:
1. Ve a https://render.com
2. Conecta tu repositorio
3. Crea Web Service para backend
4. Crea Static Site para frontend
5. Configura variables de entorno

---

## 📝 Checklist Antes de Subir:

### Backend:
- [ ] Cambiar `APP_ENV=production` en .env
- [ ] Cambiar `APP_DEBUG=false` en .env
- [ ] Configurar `APP_URL` con tu dominio
- [ ] Configurar base de datos
- [ ] Configurar `FRONTEND_URL` en .env
- [ ] Ejecutar `composer install --no-dev`
- [ ] Ejecutar `php artisan config:cache`
- [ ] Ejecutar `php artisan route:cache`
- [ ] Verificar permisos de storage y cache

### Frontend:
- [ ] Crear `.env.production` con `REACT_APP_API_URL`
- [ ] Ejecutar `npm run build`
- [ ] Verificar que la carpeta `build` se creó correctamente
- [ ] Probar que las rutas funcionan (React Router)

### Seguridad:
- [ ] Cambiar todas las contraseñas por defecto
- [ ] Configurar HTTPS (SSL)
- [ ] Verificar que CORS está configurado correctamente
- [ ] Revisar permisos de archivos

---

## 🔧 Comandos Útiles en Producción:

```bash
# Ver logs de Laravel
tail -f storage/logs/laravel.log

# Limpiar cache
php artisan cache:clear
php artisan config:clear
php artisan route:clear
php artisan view:clear

# Re-optimizar
php artisan config:cache
php artisan route:cache
php artisan view:cache

# Ver estado de servicios
systemctl status nginx
systemctl status php8.2-fpm
systemctl status mysql
```

---

## 🆘 Problemas Comunes:

### Error 500:
- Verificar permisos: `chmod -R 775 storage bootstrap/cache`
- Ver logs: `tail -f storage/logs/laravel.log`
- Limpiar cache: `php artisan config:clear`

### CORS Error:
- Verificar `FRONTEND_URL` en .env del backend
- Verificar configuración en `config/cors.php`

### Base de datos no conecta:
- Verificar credenciales en .env
- Verificar que MySQL está corriendo: `systemctl status mysql`

---

## 💡 Recomendación Final:

**Para empezar rápido:** Usa **Railway** o **Render** (Opción 3)
**Para tener control total:** Usa **VPS con DigitalOcean** (Opción 2)
**Para presupuesto limitado:** Usa **Hosting Compartido** (Opción 1)

¿Necesitas ayuda con alguna opción específica? ¡Dime cuál prefieres y te ayudo paso a paso!










