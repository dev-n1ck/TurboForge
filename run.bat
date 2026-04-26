@echo off
setlocal enabledelayedexpansion
title TurboForge - LLMUniverse

:: ASCII ART (Carefully Escaped)
echo.
echo  _      _      __  __ _    _       _                                
echo ^| ^|    ^| ^|    ^|  \/  ^| ^|  ^| ^|     ^| ^|                               
echo ^| ^|    ^| ^|    ^| \  / ^| ^|  ^| ^| _ __ ^(_)__   __ ___  _ __  ___   ___ 
echo ^| ^|    ^| ^|    ^| ^|\/^| ^| ^|  ^| ^|^| '_ \^| ^|\ \ / // _ \^| '__^|/ __^| / _ \
echo ^| ^|____^| ^|____^| ^|  ^| ^| ^|__^| ^|^| ^| ^| ^| ^| \ V /^|  __/^| ^|   \__ \^|  __/
echo ^|______^|______^|_^|  ^|_^|\____/ ^|_^| ^|_^|_^|  \_/  \___^|^|_^|   ^|___/ \___^|
echo.
echo ========================================================
echo        TURBOFORGE - LLMUniverse ^^ ^& Nikhil Kushwaha
echo ========================================================
echo.

:: 1. Setup Python Environment
if not exist "venv" (
    echo [1/3] CREATING VIRTUAL ENVIRONMENT...
    python -m venv venv
    if errorlevel 1 (
        echo.
        echo ERROR: Python command failed. 
        echo Make sure Python is installed and added to your PATH.
        pause
        exit /b
    )
)

:: 2. Install Requirements
echo [2/3] INSTALLING DEPENDENCIES (THIS MAY TAKE A MOMENT)...
.\venv\Scripts\python.exe -m pip install --upgrade pip >nul
.\venv\Scripts\pip install -r requirements.txt --quiet
if errorlevel 1 (
    echo.
    echo ERROR: Failed to install Python dependencies. 
    echo Check your internet connection or requirements.txt file.
    pause
    exit /b
)
echo Dependencies verified successfully.

:: 3. Check for Models and SD_BIN
:check_files
set "MISSING_FILES="
if not exist "sd_bin\sd-cli.exe" set "MISSING_FILES=sd_bin"
if not exist "models\zimage\Z_IMAGE_TURBO_Q4_0.gguf" (
    if "!MISSING_FILES!"=="" (set "MISSING_FILES=models") else (set "MISSING_FILES=!MISSING_FILES! and models")
)

if not "!MISSING_FILES!"=="" (
    cls
    echo.
    echo ========================================================
    echo  [IMPORTANT] MISSING CORE FOLDERS: !MISSING_FILES!
    echo ========================================================
    echo.
    echo 1. Please extract "sd_bin" and "models" folders from your release zip.
    echo 2. Place them in this directory: %CD%
    echo.
    echo Current files in this folder:
    dir /b
    echo.
    set /p dummy="Once folders are copied, press ENTER to retry..."
    goto check_files
)

:: 4. Start Application
echo.
echo [3/3] INITIALIZING TURBOFORGE...
echo Starting Backend Server...
:: Using /k so the window stays open if there is an error
start "TurboForge Backend" cmd /k ".\venv\Scripts\activate && python backend\server.py"

echo Starting Frontend UI...
cd frontend
if not exist "node_modules" (
    echo [INFO] First time setup: Installing frontend dependencies...
    npm install --quiet
)
start "TurboForge Frontend" cmd /k "npm run dev -- --open"

echo.
echo ========================================================
echo  SYSTEM ONLINE! THE UI SHOULD OPEN IN YOUR BROWSER.
echo  IF NOT, GO TO: http://localhost:5173
echo ========================================================
echo.
pause
