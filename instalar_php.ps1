# Script para verificar e instalar PHP en Windows
# Ejecutar como Administrador: PowerShell -ExecutionPolicy Bypass -File instalar_php.ps1

Write-Host "=== Verificador de PHP ===" -ForegroundColor Cyan

# Verificar si PHP ya está instalado
$phpPath = Get-Command php -ErrorAction SilentlyContinue
if ($phpPath) {
    Write-Host "✅ PHP ya está instalado en: $($phpPath.Source)" -ForegroundColor Green
    php -v
    exit 0
}

Write-Host "❌ PHP no está instalado o no está en el PATH" -ForegroundColor Red
Write-Host ""
Write-Host "=== OPCIONES DE INSTALACIÓN ===" -ForegroundColor Yellow
Write-Host ""
Write-Host "OPCIÓN 1: XAMPP (Recomendado para desarrollo)" -ForegroundColor Cyan
Write-Host "  1. Descarga XAMPP desde: https://www.apachefriends.org/" -ForegroundColor White
Write-Host "  2. Instala XAMPP (incluye PHP 8.2, MySQL, Apache)" -ForegroundColor White
Write-Host "  3. PHP estará en: C:\xampp\php\php.exe" -ForegroundColor White
Write-Host "  4. Agrega C:\xampp\php al PATH del sistema" -ForegroundColor White
Write-Host ""
Write-Host "OPCIÓN 2: PHP Standalone" -ForegroundColor Cyan
Write-Host "  1. Descarga PHP 8.2 desde: https://windows.php.net/download/" -ForegroundColor White
Write-Host "  2. Elige: VS16 x64 Non Thread Safe ZIP" -ForegroundColor White
Write-Host "  3. Extrae en: C:\php" -ForegroundColor White
Write-Host "  4. Agrega C:\php al PATH del sistema" -ForegroundColor White
Write-Host ""
Write-Host "=== CÓMO AGREGAR AL PATH ===" -ForegroundColor Yellow
Write-Host "1. Presiona Win + R, escribe: sysdm.cpl" -ForegroundColor White
Write-Host "2. Ve a la pestaña 'Opciones avanzadas'" -ForegroundColor White
Write-Host "3. Click en 'Variables de entorno'" -ForegroundColor White
Write-Host "4. En 'Variables del sistema', selecciona 'Path' y click 'Editar'" -ForegroundColor White
Write-Host "5. Agrega la ruta de PHP (ej: C:\xampp\php o C:\php)" -ForegroundColor White
Write-Host "6. Reinicia PowerShell/Terminal" -ForegroundColor White
Write-Host ""
Write-Host "=== VERIFICAR DESPUÉS DE INSTALAR ===" -ForegroundColor Yellow
Write-Host "Ejecuta: php -v" -ForegroundColor White
Write-Host ""

# Verificar rutas comunes
$rutasComunes = @(
    "C:\xampp\php\php.exe",
    "C:\laragon\bin\php\php-8.2\php.exe",
    "C:\php\php.exe",
    "C:\Program Files\PHP\php.exe"
)

Write-Host "=== Verificando instalaciones comunes ===" -ForegroundColor Cyan
foreach ($ruta in $rutasComunes) {
    if (Test-Path $ruta) {
        Write-Host "✅ Encontrado: $ruta" -ForegroundColor Green
        & $ruta -v
    }
}

