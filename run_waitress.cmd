@echo off
setlocal
cd /d C:\apps\machining-condition-calculator
C:\apps\machining-condition-calculator\.venv\Scripts\python.exe -m waitress --host=0.0.0.0 --port=8080 --call apps.main:create_app
