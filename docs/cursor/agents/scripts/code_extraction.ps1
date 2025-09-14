$repo = Split-Path -Parent $PSCommandPath | Split-Path -Parent
Set-Location $repo
python scripts/snapshot.py --mode quick --flat-text --outdir snapshots
