# filename: qpush.py
import argparse, time, requests, sys, json

def main():
    ap = argparse.ArgumentParser(description="Push a job to QiTaskWorker and stream status.")
    ap.add_argument("-w","--worker", required=True, help="Worker base URL, e.g. http://100.x.y.z:7130")
    ap.add_argument("-c","--cmd", required=True, help="Command to run remotely")
    ap.add_argument("--workdir", default="", help="Remote workdir (optional)")
    ap.add_argument("--timeout", type=int, default=0, help="Timeout seconds (0=no limit)")
    ap.add_argument("--nice", type=int, default=5, help="CPU niceness (higher is lower priority)")
    args = ap.parse_args()

    payload = {
        "cmd": args.cmd,
        "workdir": args.workdir or None,
        "timeout": args.timeout,
        "nice": args.nice
    }

    try:
        r = requests.post(f"{args.worker}/submit", json=payload, timeout=20)
        r.raise_for_status()
    except Exception as e:
        print(f"Submit failed: {e}", file=sys.stderr)
        sys.exit(2)

    data = r.json()
    job = data.get("job_id")
    if not job:
        print("No job_id returned", file=sys.stderr)
        sys.exit(2)

    print(f"Job submitted: {job}")
    last_status = ""
    while True:
        time.sleep(1.8)
        try:
            s = requests.get(f"{args.worker}/status/{job}", timeout=10).json()
        except Exception as e:
            print(f"[poll error] {e}", file=sys.stderr)
            continue
        status = s.get("status", "unknown")
        if status != last_status:
            print(f"[{time.strftime('%H:%M:%S')}] {status}")
            last_status = status
        tail = s.get("tail")
        if tail:
            print("----- tail -----")
            print(tail.rstrip())
            print("----------------")
        if status not in ("queued","running"):
            rc = s.get("rc", -1)
            print(f"Finished: {status} rc={rc}")
            sys.exit(0 if rc == 0 else 1)

if __name__ == "__main__":
    main()
