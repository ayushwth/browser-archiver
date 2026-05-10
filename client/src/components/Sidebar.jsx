import { NavLink, useLocation } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { archiveApi } from '../hooks/api.js';

export default function Sidebar() {
  const location = useLocation();
  const [stats, setStats] = useState(null);

  useEffect(() => {
    archiveApi.stats().then(setStats).catch(() => {});
  }, [location.pathname]);

  const formatBytes = (bytes) => {
    if (!bytes) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`;
  };

  return (
    <aside className="sidebar">
      <div className="sidebar-logo">
        <div className="logo-icon">→</div>
        <h1>Archive</h1>
      </div>

      <nav className="sidebar-nav">
        <div className="sidebar-section-label">Navigation</div>
        <NavLink
          to="/"
          className={({ isActive }) => (isActive ? 'active' : '')}
          end
        >
          <span className="nav-icon">⌕</span>
          Search
        </NavLink>
        <NavLink
          to="/browse"
          className={({ isActive }) => (isActive ? 'active' : '')}
        >
          <span className="nav-icon">≡</span>
          Browse
        </NavLink>
      </nav>

      {stats && (
        <div className="sidebar-stats">
          <div className="stat-item">
            <span className="stat-label">Total Pages</span>
            <span className="stat-value">{stats.total || 0}</span>
          </div>
          <div className="stat-item">
            <span className="stat-label">Completed</span>
            <span className="stat-value">{stats.done || 0}</span>
          </div>
          <div className="stat-item">
            <span className="stat-label">Pending</span>
            <span className="stat-value">{stats.pending || 0}</span>
          </div>
          <div className="stat-item">
            <span className="stat-label">Storage</span>
            <span className="stat-value">
              {formatBytes(stats.totalSizeBytes)}
            </span>
          </div>
        </div>
      )}
    </aside>
  );
}
