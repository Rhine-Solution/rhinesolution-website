@echo off
cd /d "%~dp0"
echo Starting Rhine Solution merged site on http://localhost:8080/
start "" http://localhost:8080/
node serve.js