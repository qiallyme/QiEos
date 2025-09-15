export {};

declare global {
  interface Window {
    electronAPI?: {
      getAppVersion: () => Promise<string>;
      getPlatform: () => Promise<string>;
      launchBackend: () => Promise<{ ok: boolean; message?: string }>;
      stopBackend: () => Promise<{ ok: boolean; message?: string }>;
      apiRequest: (endpoint: string, options?: RequestInit) => Promise<any>;
      addBackendLogListener: (cb: (msg: any) => void) => void;
      removeBackendLogListener: () => void;
    };
  }
}
