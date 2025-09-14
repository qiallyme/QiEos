param(
  [string]$ServiceName = "QiTaskWorker",
  [string]$NssmPath = "nssm.exe"
)
$scriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
$appDir = Join-Path $scriptDir ".."
$appDir = Resolve-Path $appDir
$exe = Join-Path $appDir ".venv\Scripts\python.exe"
$mod = "uvicorn"
$args = "worker:app --host 0.0.0.0 --port 7130"

# Ensure venv and deps exist
Push-Location $appDir
if (!(Test-Path ".venv")) { py -3 -m venv .venv }
. .\.venv\Scripts\activate
pip install -U pip
pip install -r requirements.txt
Pop-Location

# Install service
& $NssmPath install $ServiceName $exe "-m" $mod $args
& $NssmPath set $ServiceName AppDirectory $appDir
& $NssmPath set $ServiceName Start SERVICE_AUTO_START
& $NssmPath set $ServiceName AppEnvironmentExtra "QITASK_WORKDIR=$($appDir)\jobs"
Write-Host "Service $ServiceName installed. Start it from Services.msc or: nssm start $ServiceName"
