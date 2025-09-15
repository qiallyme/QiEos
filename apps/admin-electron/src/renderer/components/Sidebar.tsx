import * as React from 'react';
import { Link, useLocation } from 'react-router-dom';

const Sidebar: React.FC = () => {
  const location = useLocation();

  const navItems = [
    { path: '/dashboard', label: 'Dashboard', icon: '⚡' },
    { path: '/tenants', label: 'Tenants', icon: '🏢' },
    { path: '/crm', label: 'CRM', icon: '👥' },
    { path: '/projects', label: 'Projects', icon: '📋' },
    { path: '/tasks', label: 'Tasks', icon: '✅' },
    { path: '/kb-editor', label: 'Knowledge Base', icon: '🧠' },
    { path: '/ingest', label: 'Data Ingest', icon: '📥' },
    { path: '/billing-desk', label: 'Billing Desk', icon: '💳' },
    { path: '/scripts', label: 'Scripts', icon: '⚙️' },
    { path: '/migrations', label: 'Migrations', icon: '🔄' },
    { path: '/auditor', label: 'Auditor', icon: '🔍' },
  ];

  return (
    <div className="sidebar">
      <div className="sidebar-header">
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
          <div style={{ 
            width: '32px', 
            height: '32px', 
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            borderRadius: '8px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '16px',
            fontWeight: 'bold'
          }}>
            Q
          </div>
          QiEOS Admin
        </div>
      </div>
      <nav className="sidebar-nav">
        {navItems.map((item) => (
          <Link
            key={item.path}
            to={item.path}
            className={`nav-item ${location.pathname === item.path ? 'active' : ''}`}
            title={item.label}
          >
            <span className="nav-item-icon">{item.icon}</span>
            <span className="nav-item-label">{item.label}</span>
          </Link>
        ))}
      </nav>
    </div>
  );
};

export default Sidebar;
