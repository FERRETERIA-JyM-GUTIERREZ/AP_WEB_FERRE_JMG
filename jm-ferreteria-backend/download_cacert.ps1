# Script para descargar el archivo de certificados CA (cacert.pem)
# Este archivo es necesario para que cURL/Guzzle pueda verificar certificados SSL en Windows

Write-Host "Descargando archivo de certificados CA (cacert.pem)..." -ForegroundColor Yellow

$cacertUrl = "https://curl.se/ca/cacert.pem"
$cacertPath = Join-Path $PSScriptRoot "cacert.pem"

try {
    # Descargar el archivo
    Invoke-WebRequest -Uri $cacertUrl -OutFile $cacertPath -UseBasicParsing
    
    if (Test-Path $cacertPath) {
        Write-Host "✅ Archivo descargado exitosamente en: $cacertPath" -ForegroundColor Green
        Write-Host "El archivo tiene $(Get-Item $cacertPath).Length bytes" -ForegroundColor Cyan
        
        # Verificar que el archivo no esté vacío
        $fileSize = (Get-Item $cacertPath).Length
        if ($fileSize -gt 100000) {  # El archivo debería tener más de 100KB
            Write-Host "✅ El archivo parece válido (tamaño: $fileSize bytes)" -ForegroundColor Green
        } else {
            Write-Host "⚠️  Advertencia: El archivo parece muy pequeño. Puede estar corrupto." -ForegroundColor Yellow
        }
    } else {
        Write-Host "❌ Error: El archivo no se descargó correctamente" -ForegroundColor Red
        exit 1
    }
} catch {
    Write-Host "❌ Error al descargar el archivo: $_" -ForegroundColor Red
    Write-Host "Puedes descargarlo manualmente desde: $cacertUrl" -ForegroundColor Yellow
    exit 1
}

Write-Host "`nNota: En desarrollo local, el código desactivará automáticamente la verificación SSL" -ForegroundColor Cyan
Write-Host "si no encuentra este archivo. En producción, asegúrate de tener los certificados configurados." -ForegroundColor Cyan

