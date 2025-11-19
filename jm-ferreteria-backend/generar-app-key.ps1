# Script para generar APP_KEY para Laravel (PowerShell)
# Ejecutar: .\generar-app-key.ps1

Write-Host "🔑 Generando APP_KEY para Laravel..." -ForegroundColor Cyan
php artisan key:generate --show
Write-Host ""
Write-Host "✅ Copia la clave generada y pégala en la variable APP_KEY en Render.com" -ForegroundColor Green

