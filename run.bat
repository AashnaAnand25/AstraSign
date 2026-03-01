@echo off
REM ──────────────────────────────────────────────────────────────────────────
REM  AstraSign — One-Click Launch Script (Windows)
REM  Usage:  run.bat          (launches frontend + backend)
REM          run.bat --front  (frontend only)
REM          run.bat --back   (backend only)
REM ──────────────────────────────────────────────────────────────────────────
setlocal EnableDelayedExpansion
title AstraSign Launcher

set FRONTEND_PORT=8080
set BACKEND_PORT=8000
set ROOT_DIR=%~dp0

echo.
echo    ╔═══════════════════════════════════════╗
echo    ║         AstraSign                     ║
echo    ║      ASL Translation System           ║
echo    ╚═══════════════════════════════════════╝
echo.

REM ── Check Node.js ───────────────────────────────────────────────────────
where node >nul 2>&1
if %ERRORLEVEL% neq 0 (
    echo [X] Node.js not found. Install from https://nodejs.org
    pause
    exit /b 1
)
for /f "tokens=*" %%v in ('node -v') do echo [OK] Node %%v detected

where npm >nul 2>&1
if %ERRORLEVEL% neq 0 (
    echo [X] npm not found.
    pause
    exit /b 1
)
for /f "tokens=*" %%v in ('npm -v') do echo [OK] npm %%v detected

REM ── Parse args ──────────────────────────────────────────────────────────
set RUN_FRONT=1
set RUN_BACK=1
if "%1"=="--front" set RUN_BACK=0
if "%1"=="--back"  set RUN_FRONT=0

REM ── Backend ─────────────────────────────────────────────────────────────
if %RUN_BACK%==0 goto :skip_backend

if not exist "%ROOT_DIR%signbridge\backend\main.py" (
    echo [!] Backend not found — skipping
    goto :skip_backend
)

echo [AstraSign] Setting up backend...
cd /d "%ROOT_DIR%signbridge\backend"

where python >nul 2>&1
if %ERRORLEVEL% neq 0 (
    echo [!] Python not found — skipping backend
    goto :skip_backend
)
for /f "tokens=*" %%v in ('python --version') do echo [OK] %%v detected

if not exist "venv" (
    echo [AstraSign] Creating Python virtual environment...
    python -m venv venv
    echo [OK] Virtual environment created
)

call venv\Scripts\activate.bat

if exist "requirements.txt" (
    echo [AstraSign] Installing Python dependencies...
    pip install -q -r requirements.txt
    echo [OK] Python dependencies installed
)

if not exist ".env" (
    if exist ".env.example" (
        copy .env.example .env >nul
        echo [!] Created .env from .env.example — fill in your API keys!
    )
)

REM Kill port if in use
for /f "tokens=5" %%p in ('netstat -aon ^| findstr ":%BACKEND_PORT% " ^| findstr "LISTENING"') do (
    echo [!] Port %BACKEND_PORT% in use — killing PID %%p
    taskkill /F /PID %%p >nul 2>&1
)

echo [AstraSign] Starting backend on port %BACKEND_PORT%...
start "AstraSign Backend" cmd /c "venv\Scripts\activate.bat && python -m uvicorn main:app --host 0.0.0.0 --port %BACKEND_PORT% --reload"
echo [OK] Backend starting

cd /d "%ROOT_DIR%"

:skip_backend

REM ── Frontend ────────────────────────────────────────────────────────────
if %RUN_FRONT%==0 goto :skip_frontend

echo [AstraSign] Setting up frontend...
cd /d "%ROOT_DIR%"

if not exist "node_modules" (
    echo [AstraSign] Installing npm dependencies...
    call npm install --legacy-peer-deps
    echo [OK] Dependencies installed
) else (
    echo [OK] Dependencies up to date
)

REM Kill port if in use
for /f "tokens=5" %%p in ('netstat -aon ^| findstr ":%FRONTEND_PORT% " ^| findstr "LISTENING"') do (
    echo [!] Port %FRONTEND_PORT% in use — killing PID %%p
    taskkill /F /PID %%p >nul 2>&1
)

echo [AstraSign] Starting frontend on port %FRONTEND_PORT%...
echo.
echo ══════════════════════════════════════════
if %RUN_FRONT%==1 echo   Frontend:  http://localhost:%FRONTEND_PORT%
if %RUN_BACK%==1  echo   Backend:   http://localhost:%BACKEND_PORT%
echo ══════════════════════════════════════════
echo   Close this window to stop the frontend
echo.

call npm run dev

:skip_frontend

if %RUN_FRONT%==0 if %RUN_BACK%==1 (
    echo.
    echo   Backend:   http://localhost:%BACKEND_PORT%
    echo   Press any key to stop...
    pause >nul
)

endlocal
