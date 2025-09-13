import React, { useState, useEffect } from 'react';

const Dashboard: React.FC = () => {
  const [stats, setStats] = useState({
    totalUsers: 0,
    activeProjects: 0,
    pendingTasks: 0,
    systemHealth: 'unknown'
  });

  useEffect(() => {
    // Fetch dashboard stats from Worker API
    const fetchStats = async () => {
      try {
        if (window.electronAPI) {
          const response = await window.electronAPI.apiRequest('/admin/stats');
          setStats(response);
        }
      } catch (error) {
        console.error('Failed to fetch dashboard stats:', error);
        // Set fallback stats
        setStats({
          totalUsers: 0,
          activeProjects: 0,
          pendingTasks: 0,
          systemHealth: 'offline'
        });
      }
    };

    fetchStats();
  }, []);

  return (
    <div className="content">
      <div className="card">
        <h2>System Overview</h2>
        <div className="dashboard-grid">
          <div className="card">
            <h3>Total Users</h3>
            <p className="stat-number primary">
              {stats.totalUsers}
            </p>
          </div>
          <div className="card">
            <h3>Active Projects</h3>
            <p className="stat-number success">
              {stats.activeProjects}
            </p>
          </div>
          <div className="card">
            <h3>Pending Tasks</h3>
            <p className="stat-number warning">
              {stats.pendingTasks}
            </p>
          </div>
          <div className="card">
            <h3>System Health</h3>
            <p className={`stat-number ${stats.systemHealth === 'online' ? 'success' : 'danger'}`}>
              {stats.systemHealth === 'online' ? '🟢' : '🔴'}
            </p>
          </div>
        </div>
      </div>

      <div className="card card-spacing">
        <h2>Quick Actions</h2>
        <div className="flex-gap">
          <button className="btn btn-primary">
            Create New Tenant
          </button>
          <button className="btn btn-secondary">
            Run System Check
          </button>
          <button className="btn btn-secondary">
            View Logs
          </button>
        </div>
      </div>

      <div className="card card-spacing">
        <h2>Recent Activity</h2>
        <p className="text-muted">
          No recent activity to display. Connect to the Worker API to see live updates.
        </p>
      </div>
    </div>
  );
};

export default Dashboard;
