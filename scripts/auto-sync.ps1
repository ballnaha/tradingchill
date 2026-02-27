$url = "http://localhost:4001/api/cron/sync"
$envFile = Join-Path $PSScriptRoot "..\.env"

# Load CRON_SECRET from .env
$cronSecret = ""
if (Test-Path $envFile) {
    $envContent = Get-Content $envFile
    foreach ($line in $envContent) {
        if ($line -match "^CRON_SECRET=`"?(.*?)`"?$") {
            $cronSecret = $Matches[1]
            break
        }
    }
}

$headers = @{}
if ($cronSecret) {
    $headers["Authorization"] = "Bearer $cronSecret"
}

Write-Host "Starting Auto Update for TradingChill..." -ForegroundColor Cyan
try {
    $response = Invoke-RestMethod -Uri $url -Method Get -Headers $headers
    Write-Host "Update Completed!" -ForegroundColor Green
    Write-Host "Stocks Updated: $($response.count)"
    foreach ($res in $response.results) {
        if ($res.status -eq "success") {
            Write-Host "  [OK] $($res.symbol)" -ForegroundColor Gray
        } else {
            Write-Host "  [ERROR] $($res.symbol): $($res.message)" -ForegroundColor Red
        }
    }
} catch {
    Write-Host "Error occurred: $($_.Exception.Message)" -ForegroundColor Red
}
Write-Host "Press any key to close..."
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
