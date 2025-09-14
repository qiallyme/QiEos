@echo off
setlocal
cd /d %~dp0\..
if not exist .venv (
  py -3 -m venv .venv || python -m venv .venv
)
call .venv\Scripts\activate
pip install -U pip
pip install -r requirements.txt
set QITASK_PORT=7130
set QITASK_BIND=0.0.0.0
if not exist jobs mkdir jobs
python -m uvicorn worker:app --host %QITASK_BIND% --port %QITASK_PORT%
