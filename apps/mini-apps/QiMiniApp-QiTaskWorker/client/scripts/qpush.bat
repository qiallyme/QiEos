@echo off
setlocal
cd /d %~dp0\..
if not exist .venv (
  py -3 -m venv .venv || python -m venv .venv
)
call .venv\Scripts\activate
pip install -U pip
pip install -r requirements.txt
python qpush.py %*
