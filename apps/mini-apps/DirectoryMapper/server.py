# server.py - zero-dependency HTTP backend for Directory Mapper
import json
import argparse
from http.server import HTTPServer, BaseHTTPRequestHandler
from urllib.parse import urlparse
import os
from datetime import datetime

# --- Core logic (adapted from your script) ---
def print_directory_tree(root_dir, show_files=True, max_depth=None, current_depth=0, prefix='', include_hidden=True, exclude_dirs=None, lines=None):
    if exclude_dirs is None:
        exclude_dirs = [
            'venv', '__pycache__', 'data', 'logs',
            '.git', '.vscode', '.idea', '.pytest_cache',
            '.venv', '.DS_Store', '.env', '.env.local',
            '.env.development.local', '.env.test.local',
            '.env.production.local', 'Empty_Folders',
            '.docusaurus', '.docusaurus-plugin-content-docs-current',
            'node_modules', '.node_modules',
            'mpc-hc', 'losslesscut', 'OCR', 'pdf-main', 'my-pdf-main',
            'test', 'tests', '__tests__',
            'plugins', '.local'
        ]

    if max_depth is not None and current_depth >= max_depth:
        return

    try:
        items = os.listdir(root_dir)
    except PermissionError:
        (lines or []).append(prefix + "└── [Permission Denied]")
        return
    except FileNotFoundError:
        (lines or []).append(prefix + "└── [Directory Not Found]")
        return

    items = sorted(items, key=lambda s: s.lower())
    directories = [item for item in items if os.path.isdir(os.path.join(root_dir, item))]
    files = [item for item in items if not os.path.isdir(os.path.join(root_dir, item))]

    directories = [item for item in directories if not any(ex.lower() in item.lower() for ex in exclude_dirs)]
    items = directories if not show_files else directories + files

    for index, item in enumerate(items):
        if not include_hidden and item.startswith('.'):
            continue

        path = os.path.join(root_dir, item)
        if index == len(items) - 1:
            connector = '└── '
            extension = '    '
        else:
            connector = '├── '
            extension = '│   '

        (lines or []).append(prefix + connector + item)

        if os.path.isdir(path):
            print_directory_tree(path, show_files, max_depth, current_depth + 1,
                                 prefix + extension, include_hidden, exclude_dirs, lines)

def create_log_file(filename_prefix, suffix=""):
    downloads_dir = os.path.join(os.path.expanduser("~"), "Downloads")
    os.makedirs(downloads_dir, exist_ok=True)

    sanitized_prefix = "".join(c for c in filename_prefix if c.isalnum() or c in (' ', '_', '-')).strip() or "log"
    timestamp = datetime.now().strftime("%Y-%m-%d_%H-%M-%S")
    base_log_file_name = f"{sanitized_prefix}_{timestamp}{suffix}"
    log_file_path = os.path.join(downloads_dir, f"{base_log_file_name}.txt")

    counter = 1
    while os.path.exists(log_file_path):
        log_file_path = os.path.join(downloads_dir, f"{base_log_file_name}_{counter}.txt")
        counter += 1
    return log_file_path

def run_map(params):
    root_dir = os.path.abspath(params.get("directory"))
    if not os.path.isdir(root_dir):
        return {"ok": False, "error": f"Not a directory: {root_dir}"}

    show_files = bool(params.get("show_files", True))
    include_hidden = bool(params.get("include_hidden", True))
    max_depth = params.get("max_depth", None)
    if isinstance(max_depth, str) and max_depth.lower() == "all":
        max_depth = None
    elif max_depth is not None:
        try:
            max_depth = int(max_depth)
        except:
            max_depth = None

    exclude_dirs = params.get("exclude_dirs", None)

    lines = [root_dir]
    print_directory_tree(root_dir, show_files=show_files, max_depth=max_depth, include_hidden=include_hidden, exclude_dirs=exclude_dirs, lines=lines)
    tree_text = "\n".join(lines)

    out_path = create_log_file(os.path.basename(root_dir), "_tree")
    with open(out_path, "w", encoding="utf-8") as f:
        f.write("Resolved path: " + root_dir + "\n\n")
        f.write(tree_text)

    return {"ok": True, "path": out_path, "tree": tree_text}

# --- HTTP server ---
class Handler(BaseHTTPRequestHandler):
    def _set_headers(self, status=200, mime="application/json"):
        self.send_response(status)
        self.send_header("Content-Type", mime)
        self.send_header("Access-Control-Allow-Origin", "*")
        self.send_header("Access-Control-Allow-Headers", "Content-Type")
        self.send_header("Access-Control-Allow-Methods", "POST, OPTIONS")
        self.end_headers()

    def do_OPTIONS(self):
        self._set_headers(204)

    def do_POST(self):
        parsed = urlparse(self.path)
        if parsed.path != "/run":
            self._set_headers(404)
            self.wfile.write(b'{"ok": false, "error": "Not found"}')
            return
        try:
            length = int(self.headers.get("Content-Length", "0"))
            body = self.rfile.read(length) if length else b"{}"
            params = json.loads(body or "{}")
            result = run_map(params)
            self._set_headers(200)
            self.wfile.write(json.dumps(result).encode("utf-8"))
        except Exception as e:
            self._set_headers(500)
            self.wfile.write(json.dumps({"ok": False, "error": str(e)}).encode("utf-8"))

def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("--port", type=int, default=8750)
    args = parser.parse_args()
    server = HTTPServer(("127.0.0.1", args.port), Handler)
    print(f"[DirectoryMapper] Listening on http://127.0.0.1:{args.port}")
    server.serve_forever()

if __name__ == "__main__":
    main()
