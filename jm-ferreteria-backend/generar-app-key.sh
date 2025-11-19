#!/bin/bash
# Script para generar APP_KEY para Laravel
# Ejecutar: bash generar-app-key.sh

echo "🔑 Generando APP_KEY para Laravel..."
php artisan key:generate --show
echo ""
echo "✅ Copia la clave generada y pégala en la variable APP_KEY en Render.com"

