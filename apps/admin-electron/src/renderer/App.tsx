import React, { useState, useEffect, useRef } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import Sidebar from "./components/Sidebar";
import Dashboard from "./routes/Dashboard";
import Tenants from "./routes/Tenants";
import CRM from "./routes/CRM";
import Projects from "./routes/Projects";
import Tasks from "./routes/Tasks";
import KBEditor from "./routes/KBEditor";
import Ingest from "./routes/Ingest";
import BillingDesk from "./routes/BillingDesk";
import Scripts from "./routes/Scripts";
import Migrations from "./routes/Migrations";
import Auditor from "./routes/Auditor";
import "./App.css";

type MiniApp = { id?: string; name: string };

// Health poll config
const POLL_INTERVAL = 1500;
const POLL_TIMEOUT = 15000;

async function pingHealth(): Promise<boolean> {
  try {
    const res = await fetch("/health", { cache: "no-store" });
    if (!res.ok) return false;
    const body = await res.json().catch(() => null);
    // Accept { ok: true } or any 2xx
    return !!(res.ok && (!body || body.ok === true || body.status === "ok"));
  } catch {
    return false;
  }
}

const App: React.FC = () => {
  const [appVersion, setAppVersion] = useState<string>("");
  const [platform, setPlatform] = useState<string>("");
  const [connected, setConnected] = useState<boolean>(false);
  const [isConnecting, setIsConnecting] = useState<boolean>(false);
  const [healthState, setHealthState] = useState<
    "unknown" | "healthy" | "unhealthy"
  >("unknown");
  const [apps, setApps] = useState<MiniApp[]>([]);
  const [error, setError] = useState<string | null>(null);
  const pollRef = useRef<number | null>(null);

  useEffect(() => {
    // Electron-provided app info (preload bridge)
    if ((window as any).electronAPI?.getAppVersion) {
      (window as any).electronAPI
        .getAppVersion()
        .then((v: string) => setAppVersion(v))
        .catch(() => {});
    }
    if ((window as any).electronAPI?.getPlatform) {
      (window as any).electronAPI
        .getPlatform()
        .then((p: string) => setPlatform(p))
        .catch(() => {});
    }

    // quick initial health probe
    (async () => {
      const ok = await pingHealth();
      if (ok) {
        setHealthState("healthy");
        setConnected(true);
      } else {
        setHealthState("unhealthy");
        setConnected(false);
      }
    })();
  }, []);

  // Poll health while connecting or connected to keep UI live
  useEffect(() => {
    // clear old poll
    if (pollRef.current) {
      window.clearInterval(pollRef.current);
      pollRef.current = null;
    }

    // Start poll
    pollRef.current = window.setInterval(async () => {
      const ok = await pingHealth();
      setHealthState(ok ? "healthy" : "unhealthy");
      // keep connected flag in sync with actual health
      setConnected(ok);
    }, POLL_INTERVAL);

    return () => {
      if (pollRef.current) {
        window.clearInterval(pollRef.current);
        pollRef.current = null;
      }
    };
  }, []); // run once

  // Fetch miniapps when connected
  useEffect(() => {
    let cancelled = false;
    if (!connected) {
      setApps([]);
      return;
    }
    (async () => {
      try {
        const res = await fetch("/api/apps");
        if (!res.ok) throw new Error("Failed to load apps");
        const data = await res.json();
        if (!cancelled) {
          setApps(
            Array.isArray(data)
              ? data.map((x: any) => (typeof x === "string" ? { name: x } : x))
              : []
          );
        }
      } catch (err: any) {
        if (!cancelled) setApps([]);
        console.warn("apps fetch failed", err);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [connected]);

  // Attempt to start backend via Electron bridge or guide user
  async function handleConnectClick() {
    setError(null);

    // If already connected, treat as disconnect
    if (connected) {
      setConnected(false);
      setHealthState("unknown");
      setApps([]);
      return;
    }

    // Quick pre-check
    const alreadyUp = await pingHealth();
    if (alreadyUp) {
      setConnected(true);
      setHealthState("healthy");
      return;
    }

    // Try electron bridge
    setIsConnecting(true);
    try {
      const bridge = (window as any).electronAPI;
      if (bridge?.launchBackend && typeof bridge.launchBackend === "function") {
        // Launch and allow polling to detect readiness
        await bridge.launchBackend();
        // Let polling confirm health; show a spinner state for timeout window
        const start = Date.now();
        while (Date.now() - start < POLL_TIMEOUT) {
          const ok = await pingHealth();
          if (ok) {
            setConnected(true);
            setHealthState("healthy");
            setIsConnecting(false);
            setError(null);
            return;
          }
          await new Promise((r) => setTimeout(r, 500));
        }
        throw new Error("Backend spawn timed out — check logs");
      } else {
        // Not running inside Electron or missing bridge
        setError(
          "No Electron bridge available. Start the backend manually (uvicorn main:app) and try Connect again."
        );
        setIsConnecting(false);
      }
    } catch (err: any) {
      console.error("launch failed", err);
      setError(err?.message ?? "Failed to start backend");
      setIsConnecting(false);
      setConnected(false);
      setHealthState("unhealthy");
    }
  }

  return (
    <Router>
      <div className="app">
        <Sidebar />
        <main className="main-content">
          <header className="app-header">
            <div className="title-group">
              <h1>QiEOS Admin Cockpit</h1>
              <div className="app-info">
                <span className="version">v{appVersion || "dev"}</span>
                <span className="platform">{platform || "unknown"}</span>
              </div>
            </div>

            <div className="header-actions">
              <div className={`health-pill ${healthState}`}>
                <span className="dot" />
                <span className="label">{healthState}</span>
              </div>

              <button
                className={`btn connect ${connected ? "on" : ""}`}
                onClick={handleConnectClick}
                disabled={isConnecting}
                title={connected ? "Disconnect" : "Connect / Start Backend"}
              >
                {isConnecting
                  ? "Starting…"
                  : connected
                  ? "Disconnect"
                  : "Connect"}
              </button>
            </div>
          </header>

          <div className="content">
            {error && <div className="alert error">⚠ {error}</div>}

            <Routes>
              <Route path="/" element={<Navigate to="/dashboard" replace />} />
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/tenants" element={<Tenants />} />
              <Route path="/crm" element={<CRM />} />
              <Route path="/projects" element={<Projects />} />
              <Route path="/tasks" element={<Tasks />} />
              <Route path="/kb-editor" element={<KBEditor />} />
              <Route path="/ingest" element={<Ingest />} />
              <Route path="/billing-desk" element={<BillingDesk />} />
              <Route path="/scripts" element={<Scripts />} />
              <Route path="/migrations" element={<Migrations />} />
              <Route path="/auditor" element={<Auditor />} />
            </Routes>

            {/* Miniapps / quick debug info */}
            <section className="miniapps">
              <h3>Miniapps</h3>
              {apps.length === 0 ? (
                <div className="muted">No miniapps available</div>
              ) : (
                <ul className="app-list">
                  {apps.map((a, i) => (
                    <li key={a.id ?? `${a.name}-${i}`}>{a.name}</li>
                  ))}
                </ul>
              )}
            </section>
          </div>
        </main>
      </div>
    </Router>
  );
};

export default App;
