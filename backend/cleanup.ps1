# Script para limpiar y recrear la base de datos

Write-Host "🔧 Limpiando base de datos..." -ForegroundColor Cyan

# Detener todos los procesos de Node que puedan estar usando la BD
Write-Host "Deteniendo procesos de Node..." -ForegroundColor Yellow
Get-Process node -ErrorAction SilentlyContinue | Stop-Process -Force -ErrorAction SilentlyContinue
Start-Sleep -Seconds 2

# Eliminar archivos de base de datos
Write-Host "Eliminando archivos de base de datos..." -ForegroundColor Yellow
Remove-Item -Path ".\prisma\dev.db" -Force -ErrorAction SilentlyContinue
Remove-Item -Path ".\prisma\dev.db-journal" -Force -ErrorAction SilentlyContinue

# Limpiar archivos de Prisma
Write-Host "Limpiando archivos de Prisma..." -ForegroundColor Yellow
Remove-Item -Path ".\node_modules\.prisma" -Recurse -Force -ErrorAction SilentlyContinue

Write-Host "✅ Limpieza completada" -ForegroundColor Green
Write-Host ""
Write-Host "Ahora ejecuta estos comandos:" -ForegroundColor Cyan
Write-Host "1. npx prisma db push" -ForegroundColor White
Write-Host "2. npx prisma generate" -ForegroundColor White
Write-Host "3. node src/create_admin.js" -ForegroundColor White
Write-Host "4. npm run dev" -ForegroundColor White
