# Builds the IMP release APK, then offers to install it on a plugged-in phone.
# Run it with:  npm run apk      (or double-click build-apk.bat)

$projectRoot = Split-Path -Parent $PSScriptRoot
$androidDir  = Join-Path $projectRoot "android"
$apkPath     = Join-Path $androidDir "app\build\outputs\apk\release\app-release.apk"

function Write-Step($text) { Write-Host "`n  $text" -ForegroundColor Cyan }

if (-not (Test-Path $androidDir)) {
    Write-Host "`n  No android/ folder found." -ForegroundColor Red
    Write-Host "  Generate it first with:  npx expo prebuild --platform android`n" -ForegroundColor DarkGray
    exit 1
}

# ---- build ----
Write-Step "Building release APK..."
Push-Location $androidDir
try {
    & .\gradlew.bat assembleRelease
    $buildOk = ($LASTEXITCODE -eq 0)
} finally {
    Pop-Location
}

if (-not $buildOk -or -not (Test-Path $apkPath)) {
    Write-Host "`n  BUILD FAILED" -ForegroundColor Red
    Write-Host "  If it mentions the Android SDK, a stale Gradle daemon is usually the cause:" -ForegroundColor DarkGray
    Write-Host "    cd android" -ForegroundColor DarkGray
    Write-Host "    .\gradlew.bat --stop`n" -ForegroundColor DarkGray
    exit 1
}

$sizeMb = [math]::Round((Get-Item $apkPath).Length / 1MB, 1)
Write-Host "`n  BUILD SUCCESSFUL  ($sizeMb MB)" -ForegroundColor Green
Write-Host "  $apkPath" -ForegroundColor DarkGray

# ---- offer to install ----
$devices = @()
try {
    $devices = @(& adb devices 2>$null | Select-Object -Skip 1 | Where-Object { $_ -match "device$" })
} catch {
    Write-Host "`n  adb not found - skipping install.`n" -ForegroundColor Yellow
    exit 0
}

if ($devices.Count -eq 0) {
    Write-Host "`n  No phone connected - skipping install." -ForegroundColor Yellow
    Write-Host "  Plug it in (USB debugging on) and run 'npm run apk' again.`n" -ForegroundColor DarkGray
    exit 0
}

Write-Host ""
$answer = Read-Host "  Install on your phone now? (y/n)"

if ($answer -match '^\s*(y|yes|d|da)\s*$') {
    Write-Step "Installing..."
    & adb install -r $apkPath
    if ($LASTEXITCODE -eq 0) {
        & adb shell monkey -p com.kosta.imp -c android.intent.category.LAUNCHER 1 2>$null | Out-Null
        Write-Host "`n  Installed and launched - check your phone.`n" -ForegroundColor Green
    } else {
        Write-Host "`n  Install failed. Is the phone unlocked and authorised?`n" -ForegroundColor Red
        exit 1
    }
} else {
    Write-Host "`n  Skipped. The APK is ready at:" -ForegroundColor DarkGray
    Write-Host "  $apkPath`n"
}
