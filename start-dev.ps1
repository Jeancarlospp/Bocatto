# Script de inicio para desarrollo local
# Ejecutar desde la carpeta raíz del proyecto

Write-Host "🍽️  Bocatto Restaurant - Iniciando entorno de desarrollo..." -ForegroundColor Cyan
Write-Host ""

# Verificar Node.js
Write-Host "✓ Verificando Node.js..." -ForegroundColor Yellow
$nodeVersion = node --version
Write-Host "  Node.js: $nodeVersion" -ForegroundColor Green

# Verificar npm
$npmVersion = npm --version
Write-Host "  npm: v$npmVersion" -ForegroundColor Green
Write-Host ""

# Verificar que existe .env en backend
if (!(Test-Path ".\backend\.env")) {
    Write-Host "⚠️  ADVERTENCIA: No se encontró el archivo backend\.env" -ForegroundColor Red
    Write-Host "   Por favor, copia .env.example a .env y configura tu MONGODB_URI" -ForegroundColor Yellow
    Write-Host ""
    $continue = Read-Host "¿Deseas continuar de todos modos? (s/n)"
    if ($continue -ne "s") {
        exit
    }
}

Write-Host "🚀 Iniciando Backend (Node.js + Express)..." -ForegroundColor Cyan
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '.\backend'; Write-Host '🔧 Backend Server' -ForegroundColor Green; npm run dev"

Start-Sleep -Seconds 2

Write-Host "🌐 Iniciando Frontend (HTTP Server)..." -ForegroundColor Cyan
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '.\frontend'; Write-Host '🎨 Frontend Server' -ForegroundColor Green; python -m http.server 3000"

Write-Host ""
Write-Host "✅ Servidores iniciados!" -ForegroundColor Green
Write-Host ""
Write-Host "📍 URLs:" -ForegroundColor Cyan
Write-Host "   Frontend: http://localhost:3000" -ForegroundColor White
Write-Host "   Backend:  http://localhost:5000" -ForegroundColor White
Write-Host ""
Write-Host "💡 Tip: Abre http://localhost:3000 en tu navegador" -ForegroundColor Yellow
Write-Host "🛑 Para detener: Cierra las ventanas de terminal que se abrieron" -ForegroundColor Yellow
Write-Host ""
