# Dockerfile para Laravel 12 con PHP 8.2 y PostgreSQL
FROM php:8.2-fpm

# Instalar dependencias del sistema
RUN apt-get update && apt-get install -y \
    git \
    curl \
    libpng-dev \
    libonig-dev \
    libxml2-dev \
    zip \
    unzip \
    nginx \
    supervisor \
    && rm -rf /var/lib/apt/lists/*

# Instalar extensiones de PHP necesarias
RUN docker-php-ext-install pdo_mysql pdo_pgsql mbstring exif pcntl bcmath gd

# Instalar Composer
COPY --from=composer:latest /usr/bin/composer /usr/bin/composer

# Establecer directorio de trabajo
WORKDIR /var/www/html

# Copiar archivos de composer primero (para cache de capas)
COPY composer.json composer.lock ./

# Instalar dependencias de PHP (sin dev para producción)
RUN composer install --no-dev --no-scripts --no-autoloader --optimize-autoloader

# Copiar el resto de los archivos
COPY . .

# Completar instalación de Composer
RUN composer dump-autoload --optimize --classmap-authoritative

# Configurar permisos
RUN chown -R www-data:www-data /var/www/html \
    && chmod -R 755 /var/www/html/storage \
    && chmod -R 755 /var/www/html/bootstrap/cache

# Configurar Nginx
COPY docker/nginx.conf /etc/nginx/sites-available/default

# Configurar Supervisor para Nginx y PHP-FPM
COPY docker/supervisord.conf /etc/supervisor/conf.d/supervisord.conf

# Exponer puerto 80
EXPOSE 80

# Script de inicio que ejecuta migraciones y luego inicia servicios
COPY docker/start.sh /usr/local/bin/start.sh
RUN chmod +x /usr/local/bin/start.sh

CMD ["/usr/local/bin/start.sh"]

