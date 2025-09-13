import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Sidebar from './components/Sidebar';
import Dashboard from './routes/Dashboard';
import Tenants from './routes/Tenants';
import CRM from './routes/CRM';
import Projects from './routes/Projects';
import Tasks from './routes/Tasks';
import KBEditor from './routes/KBEditor';
import Ingest from './routes/Ingest';
import BillingDesk from './routes/BillingDesk';
import Scripts from './routes/Scripts';
import Migrations from './routes/Migrations';
import Auditor from './routes/Auditor';
import './App.css';

const App: React.FC = () => {
  const [appVersion, setAppVersion] = useState<string>('');
  const [platform, setPlatform] = useState<string>('');

  useEffect(() => {
    // Get app info from main process
    if (window.electronAPI) {
      window.electronAPI.getAppVersion().then(setAppVersion);
      window.electronAPI.getPlatform().then(setPlatform);
    }
  }, []);

  return (
    <Router>
      <div className="app">
        <Sidebar />
        <main className="main-content">
          <header className="app-header">
            <h1>QiEOS Admin Cockpit</h1>
            <div className="app-info">
              <span>v{appVersion}</span>
              <span>{platform}</span>
            </div>
          </header>
          
          <div className="content">
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
          </div>
        </main>
      </div>
    </Router>
  );
};

export default App;
