@echo off
REM Double-click this to build the IMP APK and optionally install it.
powershell -NoProfile -ExecutionPolicy Bypass -File "%~dp0scripts\build-apk.ps1"
echo.
pause
