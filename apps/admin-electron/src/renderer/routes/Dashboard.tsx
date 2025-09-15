import React, { useState, useEffect } from "react";
import AdminQuicklinks from "../components/AdminQuicklinks";

const Dashboard: React.FC = () => {
  const [activeTab, setActiveTab] = useState("overview");
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

  const tabs = [
    { id: "overview", label: "Overview", icon: "📊" },
    { id: "analytics", label: "Analytics", icon: "📈" },
    { id: "actions", label: "Quick Actions", icon: "⚡" },
    { id: "system", label: "System", icon: "🔧" },
  ];

  return (
    <div className="content">
      {/* Tab Navigation */}
      <div className="tab-navigation">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            className={`tab-btn ${activeTab === tab.id ? "active" : ""}`}
            onClick={() => setActiveTab(tab.id)}
          >
            <span className="tab-icon">{tab.icon}</span>
            <span className="tab-label">{tab.label}</span>
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <div className="tab-content">
        {activeTab === "overview" && (
          <div className="dashboard-overview">
            <div className="stats-grid">
              <div className="stat-card primary">
                <div className="stat-icon">👥</div>
                <div className="stat-content">
                  <div className="stat-number">{stats.totalUsers}</div>
                  <div className="stat-label">Total Users</div>
                </div>
              </div>
              <div className="stat-card secondary">
                <div className="stat-icon">📋</div>
                <div className="stat-content">
                  <div className="stat-number">{stats.activeProjects}</div>
                  <div className="stat-label">Active Projects</div>
                </div>
              </div>
              <div className="stat-card warning">
                <div className="stat-icon">✅</div>
                <div className="stat-content">
                  <div className="stat-number">{stats.pendingTasks}</div>
                  <div className="stat-label">Pending Tasks</div>
                </div>
              </div>
              <div className="stat-card success">
                <div className="stat-icon">🏢</div>
                <div className="stat-content">
                  <div className="stat-number">{stats.totalOrgs}</div>
                  <div className="stat-label">Organizations</div>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === "analytics" && (
          <div className="dashboard-analytics">
            <div className="card">
              <h2>System Analytics</h2>
              <div className="analytics-grid">
                <div className="analytics-item">
                  <h3>Recent Activity</h3>
                  <p className="analytics-value">{stats.recentActivity}</p>
                </div>
                <div className="analytics-item">
                  <h3>System Health</h3>
                  <div className={`health-status ${stats.systemHealth}`}>
                    {stats.systemHealth}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === "actions" && (
          <div className="dashboard-actions">
            <div className="card">
              <h2>Quick Actions</h2>
              <div className="action-grid">
                <button
                  className="action-btn primary"
                  onClick={handleCreateTenant}
                  disabled={loading}
                >
                  <span className="action-icon">🏢</span>
                  <span className="action-label">Create New Tenant</span>
                </button>
                <button
                  className="action-btn secondary"
                  onClick={handleSystemCheck}
                  disabled={loading}
                >
                  <span className="action-icon">🔍</span>
                  <span className="action-label">System Check</span>
                </button>
                <button
                  className="action-btn secondary"
                  onClick={handleViewLogs}
                  disabled={loading}
                >
                  <span className="action-icon">📋</span>
                  <span className="action-label">View Logs</span>
                </button>
              </div>
            </div>
            <AdminQuicklinks />
          </div>
        )}

        {activeTab === "system" && (
          <div className="dashboard-system">
            <div className="card">
              <h2>System Information</h2>
              <div className="system-info">
                <div className="info-item">
                  <label>Status:</label>
                  <span className={`status-indicator ${stats.systemHealth}`}>
                    {stats.systemHealth}
                  </span>
                </div>
                <div className="info-item">
                  <label>Total Users:</label>
                  <span>{stats.totalUsers}</span>
                </div>
                <div className="info-item">
                  <label>Active Projects:</label>
                  <span>{stats.activeProjects}</span>
                </div>
                <div className="info-item">
                  <label>Pending Tasks:</label>
                  <span>{stats.pendingTasks}</span>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
