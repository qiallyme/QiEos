# filename: worker.py
import asyncio, subprocess, uuid, shlex, os, psutil, time, json, signal, pathlib
from fastapi import FastAPI, UploadFile, File, Form
from pydantic import BaseModel, Field
from typing import Optional, Dict, Any
from fastapi.middleware.cors import CORSMiddleware

# Config
PORT = int(os.getenv("QITASK_PORT", "7130"))
BIND = os.getenv("QITASK_BIND", "0.0.0.0")
WORK_DIR = os.getenv("QITASK_WORKDIR", os.path.join(os.getcwd(), "jobs"))
pathlib.Path(WORK_DIR).mkdir(parents=True, exist_ok=True)

app = FastAPI(title="QiTask Worker", version="0.2.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

class JobSpec(BaseModel):
    cmd: str = Field(..., description='Command to execute, e.g. "ffmpeg -i in.mp4 out.mp4"')
    workdir: Optional[str] = Field(None, description="Working directory for the job")
    timeout: Optional[int] = Field(0, description="Seconds, 0 means no timeout")
    nice: Optional[int] = Field(5, description="CPU niceness, higher is lower priority")
    env: Optional[Dict[str, str]] = Field(default=None, description="Environment variables")

class Job(BaseModel):
    id: str
    status: str
    spec: JobSpec
    rc: Optional[int] = None
    started_at: Optional[float] = None
    finished_at: Optional[float] = None
    tail: Optional[str] = None
    error: Optional[str] = None
    log_path: Optional[str] = None
    out_dir: Optional[str] = None
    pid: Optional[int] = None

JOBS: Dict[str, Job] = {}
QUEUE: "asyncio.Queue[str]" = asyncio.Queue()

async def run_job(job_id: str):
    job = JOBS[job_id]
    spec = job.spec
    workdir = spec.workdir or WORK_DIR
    os.makedirs(workdir, exist_ok=True)

    # Per-job output dir
    out_dir = os.path.join(workdir, job_id)
    os.makedirs(out_dir, exist_ok=True)
    log_path = os.path.join(out_dir, "stdout.log")
    job.out_dir = out_dir
    job.log_path = log_path

    env = os.environ.copy()
    if spec.env:
        env.update({str(k): str(v) for k, v in spec.env.items()})

    start = time.time()
    job.status = "running"
    job.started_at = start

    # Windows uses shell=True for .bat/cmd
    args = spec.cmd if os.name == "nt" else shlex.split(spec.cmd)

    try:
        with open(log_path, "w", encoding="utf-8", errors="ignore") as logf:
            proc = subprocess.Popen(
                args,
                cwd=out_dir,
                env=env,
                stdout=logf,
                stderr=subprocess.STDOUT,
                text=True,
                shell=(os.name == "nt"),
            )
            job.pid = proc.pid

        # Adjust priority if possible
        try:
            p = psutil.Process(job.pid)
            if os.name == "nt":
                pri = psutil.BELOW_NORMAL_PRIORITY_CLASS if (spec.nice or 5) >= 5 else psutil.HIGH_PRIORITY_CLASS
                p.nice(pri)
            else:
                p.nice(spec.nice or 5)
        except Exception:
            pass

        deadline = start + spec.timeout if (spec.timeout or 0) > 0 else None

        # Poll loop
        while True:
            if deadline and time.time() > deadline:
                try:
                    psutil.Process(job.pid).kill()
                except Exception:
                    pass
                job.status = "timeout"
                break

            ret = psutil.Popen(job.pid).poll() if psutil.pid_exists(job.pid) else 0
            if ret is not None:
                job.rc = ret
                job.status = "done" if ret == 0 else "error"
                break
            await asyncio.sleep(0.7)

        job.finished_at = time.time()

        # Tail last 200 lines
        try:
            with open(log_path, "r", encoding="utf-8", errors="ignore") as logf:
                lines = logf.readlines()
                job.tail = "".join(lines[-200:])
        except Exception:
            job.tail = None

    except Exception as e:
        job.status = "crashed"
        job.error = str(e)
        job.finished_at = time.time()

async def worker_loop():
    while True:
        job_id = await QUEUE.get()
        try:
            await run_job(job_id)
        finally:
            QUEUE.task_done()

@app.on_event("startup")
async def startup_event():
    asyncio.create_task(worker_loop())

@app.get("/health")
async def health():
    return {"ok": True, "workdir": WORK_DIR, "jobs": len(JOBS)}

@app.post("/submit")
async def submit(spec: JobSpec):
    job_id = str(uuid.uuid4())
    job = Job(id=job_id, status="queued", spec=spec)
    JOBS[job_id] = job
    await QUEUE.put(job_id)
    return {"job_id": job_id, "status": "queued"}

@app.post("/submit-with-upload")
async def submit_with_upload(
    cmd: str = Form(...),
    filename: str = Form("upload.bin"),
    file: UploadFile = File(...),
    workdir: Optional[str] = Form(None),
    timeout: Optional[int] = Form(0),
    nice: Optional[int] = Form(5),
):
    # Store uploaded file inside a per-job dir after we allocate id
    job_id = str(uuid.uuid4())
    dest_dir = os.path.join(WORK_DIR, job_id)
    os.makedirs(dest_dir, exist_ok=True)
    dest_path = os.path.join(dest_dir, filename)
    with open(dest_path, "wb") as f:
        f.write(await file.read())
    spec = JobSpec(cmd=cmd, workdir=dest_dir, timeout=timeout, nice=nice)
    job = Job(id=job_id, status="queued", spec=spec)
    JOBS[job_id] = job
    await QUEUE.put(job_id)
    return {"job_id": job_id, "status": "queued", "stored": filename}

@app.get("/status/{job_id}")
async def status(job_id: str):
    j = JOBS.get(job_id)
    if not j:
        return {"error": "not found"}
    return json.loads(j.model_dump_json())

@app.post("/kill/{job_id}")
async def kill(job_id: str):
    j = JOBS.get(job_id)
    if not j or j.pid is None:
        return {"error": "not found or no pid"}
    try:
        psutil.Process(j.pid).kill()
        return {"killed": True}
    except Exception as e:
        return {"killed": False, "error": str(e)}
