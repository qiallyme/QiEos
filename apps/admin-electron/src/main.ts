import { app, BrowserWindow, ipcMain, IpcMainInvokeEvent } from "electron";
import * as path from "path";
import { spawn, ChildProcess } from "child_process";
import * as fs from "fs";

const isDev = process.env.NODE_ENV === "development";

let mainWindow: BrowserWindow | null = null;
let backendProcess: ChildProcess | null = null;

function createWindow(): void {
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      preload: path.join(__dirname, "preload.js"),
    },
    titleBarStyle: "default",
    show: false,
  });

  if (isDev) {
    mainWindow.loadURL("http://localhost:5173");
    mainWindow.webContents.openDevTools();
  } else {
    mainWindow.loadFile(path.join(__dirname, "../dist/index.html"));
  }

  mainWindow.once("ready-to-show", () => mainWindow?.show());

  mainWindow.on("closed", () => {
    mainWindow = null;
  });
}

app.whenReady().then(createWindow);

app.on("window-all-closed", () => {
  // gracefully kill backend if running
  if (backendProcess && !backendProcess.killed) {
    backendProcess.kill();
  }
  if (process.platform !== "darwin") {
    app.quit();
  }
});

app.on("activate", () => {
  if (BrowserWindow.getAllWindows().length === 0) createWindow();
});

// IPC: basic app info
ipcMain.handle("get-app-version", () => app.getVersion());
ipcMain.handle("get-platform", () => process.platform);

/**
 * Helper - pick python executable (prefer venv if present)
 */
function resolvePythonExec(backendPath: string): string {
  const isWin = process.platform === "win32";
  const venvPython = isWin
    ? path.join(backendPath, "venv", "Scripts", "python.exe")
    : path.join(backendPath, "venv", "bin", "python");

  if (fs.existsSync(venvPython)) return venvPython;

  // fallback to obvious candidates
  if (process.platform === "darwin" || process.platform === "linux") {
    // prefer python3 if available
    return "python3";
  }
  return "python";
}

/**
 * IPC: Launch backend (spawn uvicorn)
 * Returns { ok: true } on spawn attempt, throws on immediate failure.
 * Spawned process stdout/stderr are forwarded to renderer via 'backend-log' channel.
 */
ipcMain.handle("launch-backend", async (evt: IpcMainInvokeEvent) => {
  if (backendProcess && !backendProcess.killed) {
    // Already running — noop
    return { ok: true, message: "already-running" };
  }

  try {
    const backendPath = path.join(__dirname, "..", "QiLifeCore-BackendAPI"); // adjust if needed
    const pythonExec = resolvePythonExec(backendPath);

    const args = [
      "-m",
      "uvicorn",
      "main:app",
      "--host",
      "127.0.0.1",
      "--port",
      "7130",
    ];
    if (isDev) args.push("--reload");

    backendProcess = spawn(pythonExec, args, {
      cwd: backendPath,
      env: { ...process.env, PYTHONUNBUFFERED: "1" }, // unbuffered so logs stream
      stdio: ["ignore", "pipe", "pipe"],
    });

    backendProcess.stdout?.on("data", (chunk: Buffer) => {
      const text = chunk.toString();
      if (mainWindow && !mainWindow.isDestroyed()) {
        mainWindow.webContents.send("backend-log", { stream: "stdout", text });
      }
      console.log("[backend]", text.trim());
    });

    backendProcess.stderr?.on("data", (chunk: Buffer) => {
      const text = chunk.toString();
      if (mainWindow && !mainWindow.isDestroyed()) {
        mainWindow.webContents.send("backend-log", { stream: "stderr", text });
      }
      console.error("[backend]", text.trim());
    });

    backendProcess.on("close", (code) => {
      const msg = `backend exited ${code}`;
      console.log(msg);
      if (mainWindow && !mainWindow.isDestroyed()) {
        mainWindow.webContents.send("backend-log", { stream: "exit", code });
      }
      backendProcess = null;
    });

    backendProcess.on("error", (err) => {
      console.error("backend spawn error", err);
      if (mainWindow && !mainWindow.isDestroyed()) {
        mainWindow.webContents.send("backend-log", {
          stream: "error",
          error: String(err),
        });
      }
    });

    return { ok: true, message: "spawned" };
  } catch (err: any) {
    console.error("failed to launch backend:", err);
    throw new Error(err?.message ?? "Failed to spawn backend");
  }
});

/**
 * Optional: stop backend on demand
 */
ipcMain.handle("stop-backend", async () => {
  if (backendProcess && !backendProcess.killed) {
    backendProcess.kill();
    return { ok: true };
  }
  return { ok: false, message: "no-process" };
});
