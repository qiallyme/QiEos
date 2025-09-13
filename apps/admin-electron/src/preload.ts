import { contextBridge, ipcRenderer } from 'electron';

// Expose protected methods that allow the renderer process to use
// the ipcRenderer without exposing the entire object
contextBridge.exposeInMainWorld('electronAPI', {
  getAppVersion: () => ipcRenderer.invoke('get-app-version'),
  getPlatform: () => ipcRenderer.invoke('get-platform'),
  
  // API communication with Worker
  apiRequest: async (endpoint: string, options: RequestInit = {}) => {
    // This will be used to communicate with the QiEOS Worker API
    // For now, we'll make direct requests to the Worker
    const baseUrl = process.env.VITE_WORKER_URL || 'http://localhost:8787';
    const response = await fetch(`${baseUrl}${endpoint}`, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
    });
    return response.json();
  },
});

// Type definitions for the exposed API
declare global {
  interface Window {
    electronAPI: {
      getAppVersion: () => Promise<string>;
      getPlatform: () => Promise<string>;
      apiRequest: (endpoint: string, options?: RequestInit) => Promise<any>;
    };
  }
}
