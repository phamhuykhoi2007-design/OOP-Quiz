@echo off
setlocal EnableExtensions
title OOP Quiz - Launcher
cd /d "%~dp0"

set PORT=8000

echo ============================================
echo   ON TAP OOP - KHOI DONG WEB LOCALHOST
echo ============================================
echo.

rem ---------- 1) Server da chay san? -> mo trinh duyet luon ----------
call :port_open %PORT%
if errorlevel 1 goto need_server
echo Server dang chay san tren cong %PORT% -> mo trinh duyet.
goto open_browser

:need_server
rem ---------- 2) Tim python THAT (bo qua python gia cua Microsoft Store) ----------
set PY=
python -c "import sys" >nul 2>nul
if not errorlevel 1 set PY=python
if defined PY goto have_py
py -3 -c "import sys" >nul 2>nul
if not errorlevel 1 set PY=py -3

:have_py
if defined PY goto start_py
echo Fallback: PowerShell HttpListener -- cong %PORT%
start "OOP Quiz Server" /min powershell -NoProfile -ExecutionPolicy Bypass -File "%~dp0server.ps1"
goto wait_server

:start_py
echo Che do chay: %PY% http.server -- cong %PORT%
start "OOP Quiz Server" /min cmd /c "cd /d %~dp0 && %PY% -m http.server %PORT%"

:wait_server
rem ---------- 3) Cho cong %PORT% THUC SU lang nghe (toi da ~40 giay) ----------
set /a tries=0
:wait_loop
call :port_open %PORT%
if not errorlevel 1 goto open_browser
set /a tries+=1
if %tries%==3 echo  Dang cho server khoi dong...
if %tries% GEQ 40 goto server_fail
timeout /t 1 /nobreak >nul
goto wait_loop

:server_fail
echo.
echo  [!] KHONG KHOI DONG DUOC WEB tren cong %PORT% (doi %tries% giay).
echo      - Xem cua so chay nen "OOP Quiz Server" de doc loi.
echo      - Neu bao cong bi chiem (port in use): mo file nay bang Notepad,
echo        sua dong  set PORT=8000  thanh  set PORT=8080  roi chay lai.
echo.
pause
exit /b

:open_browser
start "" "http://localhost:%PORT%"
echo.
echo  Web dang chay tai:  http://localhost:%PORT%
echo  Muon tat web: dong cua so chay nen "OOP Quiz Server".
echo.
pause
exit /b

:port_open
powershell -NoProfile -ExecutionPolicy Bypass -Command "$c=New-Object Net.Sockets.TcpClient;try{$c.Connect('localhost',%1)}catch{};if($c.Connected){exit 0}else{exit 1}" >nul 2>nul
set rc=%errorlevel%
exit /b %rc%
