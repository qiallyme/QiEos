import json, os, socket
from pathlib import Path
from flask import Flask, jsonify

CFG = json.loads(Path("config.json").read_text())
app = Flask(__name__)

@app.get("/health")
def health():
    return jsonify({"status": "ok", "app": CFG["name"]})

@app.get("/")
def index():
    return jsonify({"hello": CFG["name"]})

def _pick_port():
    if CFG.get("port", 0):
        return CFG["port"]
    s = socket.socket()
    s.bind(("", 0))
    port = s.getsockname()[1]
    s.close()
    return port

if __name__ == "__main__":
    port = _pick_port()
    print(f"{CFG['name']} starting on http://{CFG['host']}:{port}")
    app.run(host=CFG["host"], port=port)
