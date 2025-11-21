#!/bin/bash
set -e

echo "🚀 Iniciando aplicación Laravel..."

# Reemplazar PORT en nginx.conf si está definido
if [ -n "$PORT" ]; then
    echo "🔧 Configurando Nginx para puerto $PORT..."
    sed -i "s/listen \${PORT:-80}/listen $PORT/g" /etc/nginx/sites-available/default
fi

# Limpiar cache
echo "🧹 Limpiando cache..."
php artisan config:clear
php artisan route:clear
php artisan view:clear
php artisan cache:clear

# Optimizar para producción
echo "⚡ Optimizando para producción..."
php artisan config:cache
php artisan route:cache
php artisan view:cache

# Ejecutar migraciones
echo "📦 Ejecutando migraciones..."
php artisan migrate --force || echo "⚠️ Error en migraciones (puede ser normal si ya están ejecutadas)"

# Iniciar servicios con Supervisor
echo "✅ Iniciando servicios (Nginx + PHP-FPM)..."
exec /usr/bin/supervisord -c /etc/supervisor/conf.d/supervisord.conf

