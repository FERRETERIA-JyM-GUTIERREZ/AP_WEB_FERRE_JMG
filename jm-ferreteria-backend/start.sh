#!/bin/bash
set -e

# Buscar PHP en ubicaciones comunes de Nixpacks
PHP_CMD="php"
if ! command -v php &> /dev/null; then
    # Buscar en ubicaciones comunes de Nix
    for php_path in /nix/store/*-php*/bin/php /usr/bin/php /usr/local/bin/php; do
        if [ -f "$php_path" ] && [ -x "$php_path" ]; then
            PHP_CMD="$php_path"
            export PATH="$(dirname $php_path):$PATH"
            break
        fi
    done
fi

# Si aún no encontramos PHP, intentar con el PATH de Nix
if ! command -v php &> /dev/null; then
    export PATH="/nix/var/nix/profiles/default/bin:$PATH"
fi

# Verificar que PHP existe
if ! command -v php &> /dev/null; then
    echo "ERROR: PHP no encontrado"
    echo "PATH actual: $PATH"
    echo "Buscando PHP..."
    find /nix -name php -type f 2>/dev/null | head -5
    exit 1
fi

echo "PHP encontrado en: $(which php)"
php -v

# Cambiar al directorio del backend
cd jm-ferreteria-backend || cd .

# Ejecutar migraciones
echo "Ejecutando migraciones..."
php artisan migrate --force || echo "Advertencia: Error en migraciones"

# Iniciar servidor
echo "Iniciando servidor PHP..."
php -S 0.0.0.0:${PORT:-8000} -t public

