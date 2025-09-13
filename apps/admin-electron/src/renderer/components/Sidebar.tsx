import * as React from 'react';
import { Link, useLocation } from 'react-router-dom';

const Sidebar: React.FC = () => {
  const location = useLocation();

  const navItems = [
    { path: '/dashboard', label: 'Dashboard', icon: '📊' },
    { path: '/tenants', label: 'Tenants', icon: '🏢' },
    { path: '/crm', label: 'CRM', icon: '👥' },
    { path: '/projects', label: 'Projects', icon: '📋' },
    { path: '/tasks', label: 'Tasks', icon: '✅' },
    { path: '/kb-editor', label: 'KB Editor', icon: '📚' },
    { path: '/ingest', label: 'Ingest', icon: '📥' },
    { path: '/billing-desk', label: 'Billing Desk', icon: '💰' },
    { path: '/scripts', label: 'Scripts', icon: '⚙️' },
    { path: '/migrations', label: 'Migrations', icon: '🔄' },
    { path: '/auditor', label: 'Auditor', icon: '🔍' },
  ];

  return (
    <div className="sidebar">
      <div className="sidebar-header">
        Admin Cockpit
      </div>
      <nav className="sidebar-nav">
        {navItems.map((item) => (
          <Link
            key={item.path}
            to={item.path}
            className={`nav-item ${location.pathname === item.path ? 'active' : ''}`}
          >
            <span className="nav-item-icon">{item.icon}</span>
            {item.label}
          </Link>
        ))}
      </nav>
    </div>
  );
};

export default Sidebar;
