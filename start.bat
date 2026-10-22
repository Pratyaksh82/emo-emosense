@echo off
title Chetana 2D Avatar Studio Launcher
echo ================================================================
echo    Starting Chetana (C.H.E.T.A.N.A.) 2D Humanoid Avatar Studio...
echo ================================================================
where node >nul 2>nul
if %errorlevel% neq 0 (
    echo.
    echo [ERROR] Node.js is not found on your system.
    echo Please install Node.js from: https://nodejs.org
    echo.
    pause
    exit /b
)

node server.cjs
pause
