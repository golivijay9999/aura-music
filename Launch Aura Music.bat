@echo off
title Aura Music
cd /d "%~dp0"

:: Check if server is already running on port 5000
netstat -ano | findstr :5000 >nul 2>&1
if %errorlevel% neq 0 (
    echo Starting Aura Music Background Engine...
    start /b node server/index.js >nul 2>&1
    timeout /t 2 /nobreak >nul
)

:: Launch in native standalone App Mode (Edge or Chrome or default browser)
where msedge >nul 2>&1
if %errorlevel% equ 0 (
    start "" msedge --app=http://localhost:5000
    exit /b 0
)

where chrome >nul 2>&1
if %errorlevel% equ 0 (
    start "" chrome --app=http://localhost:5000
    exit /b 0
)

start http://localhost:5000
exit /b 0
