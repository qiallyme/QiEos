// Type definitions for Electron API exposed via preload script
declare global {
  interface Window {
    electronAPI: {
      getAppVersion: () => Promise<string>;
      getPlatform: () => Promise<string>;
      apiRequest: (endpoint: string, options?: RequestInit) => Promise<any>;
    };
  }
}

export {};
