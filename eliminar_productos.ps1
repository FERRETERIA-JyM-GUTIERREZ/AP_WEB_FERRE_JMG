# Script para eliminar todos los productos
# Requiere que estés autenticado en el sistema

$API_URL = "https://apwebferrejmg-production.up.railway.app/api"
$TOKEN = Read-Host "Ingresa tu token de autenticación (o presiona Enter para leer desde localStorage del navegador)"

# Si no se proporciona token, intentar leer desde el navegador (solo funciona si tienes acceso)
if ([string]::IsNullOrWhiteSpace($TOKEN)) {
    Write-Host "⚠️  Necesitas proporcionar tu token de autenticación."
    Write-Host "Para obtenerlo:"
    Write-Host "1. Abre tu navegador en el frontend"
    Write-Host "2. Abre la consola del navegador (F12)"
    Write-Host "3. Escribe: localStorage.getItem('token')"
    Write-Host "4. Copia el token y ejecuta este script de nuevo"
    exit
}

Write-Host "🗑️  Eliminando todos los productos..."
Write-Host "⚠️  ADVERTENCIA: Esta acción NO se puede deshacer!"
$confirm = Read-Host "¿Estás seguro? Escribe 'SI' para confirmar"

if ($confirm -ne "SI") {
    Write-Host "Operación cancelada."
    exit
}

try {
    $response = Invoke-WebRequest -Uri "$API_URL/productos" -Method DELETE -Headers @{
        "Authorization" = "Bearer $TOKEN"
        "Accept" = "application/json"
        "Content-Type" = "application/json"
    }
    
    $result = $response.Content | ConvertFrom-Json
    
    if ($result.success) {
        Write-Host "✅ $($result.message)" -ForegroundColor Green
        Write-Host "📊 Productos eliminados: $($result.deleted)"
    } else {
        Write-Host "❌ Error: $($result.message)" -ForegroundColor Red
    }
} catch {
    Write-Host "❌ Error al eliminar productos: $($_.Exception.Message)" -ForegroundColor Red
    if ($_.Exception.Response) {
        $reader = New-Object System.IO.StreamReader($_.Exception.Response.GetResponseStream())
        $responseBody = $reader.ReadToEnd()
        Write-Host "Respuesta del servidor: $responseBody" -ForegroundColor Yellow
    }
}

