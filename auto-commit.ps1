# Script de auto-guardado para GitHub
# Este script automatiza commit y push de cambios

param(
    [string]$mensaje = "Actualización automática"
)

$repoPath = "c:\Users\x360\Documents\pagina-nella"
Set-Location $repoPath

try {
    # Agregar todos los cambios
    git add .
    
    # Obtener los cambios pendientes
    $status = git status --porcelain
    
    if ($status) {
        # Hacer commit solo si hay cambios
        $timestamp = Get-Date -Format "yyyy-MM-dd HH:mm:ss"
        git commit -m "$mensaje - $timestamp"
        
        # Push a GitHub
        git push origin main
        
        Write-Host "✅ Cambios guardados en GitHub con éxito" -ForegroundColor Green
    } else {
        Write-Host "ℹ️  No hay cambios para guardar" -ForegroundColor Yellow
    }
} catch {
    Write-Host "❌ Error: $_" -ForegroundColor Red
}
