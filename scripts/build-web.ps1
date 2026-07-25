# Builds the installable web version (PWA) into dist/.
# Run it with:  npm run web:build
#
# Afterwards, upload the CONTENTS of dist/ to any static host (GitHub
# Pages, Netlify, Cloudflare Pages...). On the phone: open the address in
# the browser -> Share -> "Add to Home Screen".

$projectRoot = Split-Path -Parent $PSScriptRoot
Push-Location $projectRoot
try {
    Write-Host "`n  Building the web version..." -ForegroundColor Cyan
    if (Test-Path "dist") { Remove-Item -Recurse -Force "dist" }

    & npx expo export -p web
    if ($LASTEXITCODE -ne 0 -or -not (Test-Path "dist/index.html")) {
        Write-Host "`n  BUILD FAILED`n" -ForegroundColor Red
        exit 1
    }

    # Stamp the service worker so returning players get the new build
    # instead of the cached one.
    $swPath = Join-Path $projectRoot "dist/sw.js"
    if (Test-Path $swPath) {
        $stamp = Get-Date -Format "yyyyMMdd-HHmmss"
        $sw = Get-Content $swPath -Raw
        $sw = $sw -replace 'const CACHE_VERSION = "dev";', "const CACHE_VERSION = `"$stamp`";"
        # No BOM — this file is served as a script, not read by PowerShell.
        [System.IO.File]::WriteAllText($swPath, $sw, (New-Object System.Text.UTF8Encoding $false))
        Write-Host "  Cache version: $stamp" -ForegroundColor DarkGray
    }

    $sizeMb = [math]::Round((Get-ChildItem -Recurse dist | Measure-Object -Property Length -Sum).Sum / 1MB, 1)
    Write-Host "`n  DONE  ($sizeMb MB in dist/)" -ForegroundColor Green
    Write-Host "  Upload the contents of dist/ to any static host.`n" -ForegroundColor DarkGray
} finally {
    Pop-Location
}
