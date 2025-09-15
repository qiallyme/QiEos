import React, { useState, useEffect } from "react";

const Dashboard: React.FC = () => {
  const [stats, setStats] = useState({
    totalUsers: 0,
    activeProjects: 0,
    pendingTasks: 0,
    totalOrgs: 0,
    recentActivity: 0,
    systemHealth: "unknown",
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Fetch dashboard stats from Worker API
    const fetchStats = async () => {
      try {
        setLoading(true);
        if (window.electronAPI) {
          const response = await window.electronAPI.apiRequest("/admin/stats");
          setStats(response);
        }
      } catch (error) {
        console.error("Failed to fetch dashboard stats:", error);
        // Set fallback stats
        setStats({
          totalUsers: 0,
          activeProjects: 0,
          pendingTasks: 0,
          totalOrgs: 0,
          recentActivity: 0,
          systemHealth: "offline",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchStats();

    // Refresh stats every 30 seconds
    const interval = setInterval(fetchStats, 30000);
    return () => clearInterval(interval);
  }, []);

  const handleCreateTenant = async () => {
    try {
      const name = prompt("Enter organization name:");
      if (name) {
        const slug = name.toLowerCase().replace(/\s+/g, "-");
        await window.electronAPI.apiRequest("/admin/tenants", {
          method: "POST",
          body: JSON.stringify({ name, slug }),
        });
        // Refresh stats
        window.location.reload();
      }
    } catch (error) {
      console.error("Failed to create tenant:", error);
      alert("Failed to create tenant. Check console for details.");
    }
  };

  const handleSystemCheck = async () => {
    try {
      const health = await window.electronAPI.apiRequest("/admin/health");
      alert(`System Health: ${health.status}\nDatabase: ${health.database}`);
    } catch (error) {
      console.error("System check failed:", error);
      alert("System check failed. Check console for details.");
    }
  };

  const handleViewLogs = async () => {
    try {
      const logs = await window.electronAPI.apiRequest("/admin/logs");
      console.log("System logs:", logs);
      alert("Logs printed to console. Check DevTools.");
    } catch (error) {
      console.error("Failed to fetch logs:", error);
      alert("Failed to fetch logs. Check console for details.");
    }
  };

  return (
    <div className="content">
      <div className="card">
        <h2>System Overview</h2>
        {loading ? (
          <div className="loading">Loading dashboard stats...</div>
        ) : (
          <div className="dashboard-grid">
            <div className="card">
              <h3>Total Users</h3>
              <p className="stat-number primary">{stats.totalUsers}</p>
            </div>
            <div className="card">
              <h3>Active Projects</h3>
              <p className="stat-number success">{stats.activeProjects}</p>
            </div>
            <div className="card">
              <h3>Pending Tasks</h3>
              <p className="stat-number warning">{stats.pendingTasks}</p>
            </div>
            <div className="card">
              <h3>Organizations</h3>
              <p className="stat-number info">{stats.totalOrgs}</p>
            </div>
            <div className="card">
              <h3>Recent Activity</h3>
              <p className="stat-number secondary">{stats.recentActivity}</p>
            </div>
            <div className="card">
              <h3>System Health</h3>
              <p
                className={`stat-number ${
                  stats.systemHealth === "online" ? "success" : "danger"
                }`}
              >
                {stats.systemHealth === "online" ? "🟢" : "🔴"}
              </p>
            </div>
          </div>
        )}
      </div>

      <div className="card card-spacing">
        <h2>Quick Actions</h2>
        <div className="flex-gap">
          <button className="btn btn-primary" onClick={handleCreateTenant}>
            Create New Tenant
          </button>
          <button className="btn btn-secondary" onClick={handleSystemCheck}>
            Run System Check
          </button>
          <button className="btn btn-secondary" onClick={handleViewLogs}>
            View Logs
          </button>
        </div>
      </div>

      <div className="card card-spacing">
        <h2>Recent Activity</h2>
        {loading ? (
          <p className="text-muted">Loading recent activity...</p>
        ) : stats.recentActivity > 0 ? (
          <p className="text-success">
            {stats.recentActivity} new tasks created in the last 24 hours
          </p>
        ) : (
          <p className="text-muted">
            No recent activity to display. System is ready for new tasks.
          </p>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
