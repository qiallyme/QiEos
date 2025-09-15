import { contextBridge, ipcRenderer } from "electron";

// base URL for Worker API (used by apiRequest)
const DEFAULT_WORKER_URL =
  process.env.VITE_WORKER_URL || "http://localhost:8787";

contextBridge.exposeInMainWorld("electronAPI", {
  // Info
  getAppVersion: () => ipcRenderer.invoke("get-app-version"),
  getPlatform: () => ipcRenderer.invoke("get-platform"),

  // Launch/stop backend
  launchBackend: () => ipcRenderer.invoke("launch-backend"),
  stopBackend: () => ipcRenderer.invoke("stop-backend"),

  // Simple API proxy to the Worker (server-side)
  apiRequest: async (endpoint: string, options: RequestInit = {}) => {
    const baseUrl =
      (process.env.VITE_WORKER_URL as string) || DEFAULT_WORKER_URL;
    const url = `${baseUrl}${endpoint}`;
    const res = await fetch(url, {
      ...options,
      headers: {
        "Content-Type": "application/json",
        ...((options && options.headers) || {}),
      },
    });
    return res.json();
  },

  // Log streaming: add/remove callback
  addBackendLogListener: (
    cb: (msg: {
      stream: string;
      text?: string;
      code?: number;
      error?: string;
    }) => void
  ) => {
    const listener = (_: Electron.IpcRendererEvent, payload: any) =>
      cb(payload);
    // store reference so user can remove later
    // We attach the listener to a symbol key to allow removal via removeBackendLogListener
    (window as any).__backend_log_listener = listener;
    ipcRenderer.on("backend-log", listener);
  },

  removeBackendLogListener: () => {
    const listener = (window as any).__backend_log_listener;
    if (listener) {
      ipcRenderer.removeListener("backend-log", listener);
      delete (window as any).__backend_log_listener;
    }
  },
});
