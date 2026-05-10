import { useState, useEffect } from 'react';
import { archiveApi } from '../hooks/api.js';
import { useAnimatedCounter } from '../hooks/useAnimatedCounter.js';
import TagCloud from '../components/TagCloud.jsx';
import { useNavigate } from 'react-router-dom';
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell,
  AreaChart, Area,
} from 'recharts';

const PIE_COLORS = ['#4ade80', '#fbbf24', '#f87171'];

const SvgIcon = ({ children }) => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" style={{ color: '#8e8e96' }}>
    {children}
  </svg>
);

const icons = {
  archive: <SvgIcon><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></SvgIcon>,
  check: <SvgIcon><polyline points="20 6 9 17 4 12"/></SvgIcon>,
  clock: <SvgIcon><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></SvgIcon>,
  storage: <SvgIcon><ellipse cx="12" cy="5" rx="9" ry="3"/><path d="M21 12c0 1.66-4 3-9 3s-9-1.34-9-3"/><path d="M3 5v14c0 1.66 4 3 9 3s9-1.34 9-3V5"/></SvgIcon>,
};

function StatCard({ label, value, icon, delay = 0, trend }) {
  const animated = useAnimatedCounter(value, 1200, delay);
  return (
    <div className="stat-card" style={{ animationDelay: `${delay}ms` }}>
      <div className="stat-card-icon">{icon}</div>
      <div className="stat-card-body">
        <div className="stat-card-value">{animated}</div>
        <div className="stat-card-label">{label}</div>
      </div>
      {trend !== undefined && (
        <div className={`stat-trend ${trend >= 0 ? 'up' : 'down'}`}>
          {trend >= 0 ? '↑' : '↓'} {Math.abs(trend)}%
        </div>
      )}
    </div>
  );
}

function ProgressRing({ value, max, size = 100, strokeWidth = 8 }) {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const ratio = max > 0 ? value / max : 0;
  const offset = circumference * (1 - ratio);

  return (
    <div className="progress-ring-container">
      <svg width={size} height={size} className="progress-ring">
        <circle
          className="progress-ring-bg"
          cx={size / 2} cy={size / 2} r={radius}
          strokeWidth={strokeWidth}
        />
        <circle
          className="progress-ring-fill"
          cx={size / 2} cy={size / 2} r={radius}
          strokeWidth={strokeWidth}
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          style={{ transition: 'stroke-dashoffset 1.5s cubic-bezier(0.4, 0, 0.2, 1)' }}
        />
      </svg>
      <div className="progress-ring-label">
        <span className="progress-ring-value">{Math.round(ratio * 100)}%</span>
        <span className="progress-ring-text">Complete</span>
      </div>
    </div>
  );
}

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="chart-tooltip">
      <p className="chart-tooltip-label">{label}</p>
      {payload.map((p, i) => (
        <p key={i} className="chart-tooltip-value" style={{ color: p.color }}>
          {p.name}: {p.value}
        </p>
      ))}
    </div>
  );
};

export default function DashboardPage() {
  const navigate = useNavigate();
  const [stats, setStats] = useState(null);
  const [archives, setArchives] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      archiveApi.stats(),
      archiveApi.list(1, 100),
    ]).then(([statsData, archiveData]) => {
      setStats(statsData);
      setArchives(archiveData.archives || []);
    }).catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="loading-spinner">
        <div className="spinner" />
      </div>
    );
  }

  if (!stats) return null;

  const formatBytes = (bytes) => {
    if (!bytes) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`;
  };

  // Build growth chart data (group by date)
  const growthMap = {};
  archives.forEach((a) => {
    const date = new Date(a.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    growthMap[date] = (growthMap[date] || 0) + 1;
  });
  const growthData = Object.entries(growthMap).map(([date, count]) => ({ date, count }));

  // Status pie data
  const statusData = [
    { name: 'Done', value: stats.done || 0 },
    { name: 'Pending', value: stats.pending || 0 },
    { name: 'Error', value: stats.error || 0 },
  ].filter((d) => d.value > 0);

  // Domain bar chart
  const domainData = (stats.topDomains || []).slice(0, 6).map((d) => ({
    domain: d.domain?.replace('www.', '').substring(0, 18),
    count: d.count,
  }));

  return (
    <div className="dashboard">
      <div className="page-header">
        <h2 className="page-title">Dashboard</h2>
        <p className="page-subtitle">Overview of your browsing archive</p>
      </div>

      {/* Stat cards */}
      <div className="stat-cards-grid">
        <StatCard label="Total Archives" value={stats.total || 0} icon={icons.archive} delay={0} />
        <StatCard label="Completed" value={stats.done || 0} icon={icons.check} delay={100} />
        <StatCard label="Pending" value={stats.pending || 0} icon={icons.clock} delay={200} />
        <div className="stat-card" style={{ animationDelay: '300ms' }}>
          <div className="stat-card-icon">{icons.storage}</div>
          <div className="stat-card-body">
            <div className="stat-card-value">{formatBytes(stats.totalSizeBytes)}</div>
            <div className="stat-card-label">Storage Used</div>
          </div>
        </div>
      </div>

      {/* Charts row */}
      <div className="dashboard-charts">
        {/* Progress ring + status pie */}
        <div className="chart-card">
          <h3 className="chart-title">Completion</h3>
          <div className="chart-row-center">
            <ProgressRing value={stats.done || 0} max={stats.total || 1} size={120} strokeWidth={10} />
            {statusData.length > 0 && (
              <div className="chart-pie-wrapper">
                <ResponsiveContainer width={140} height={140}>
                  <PieChart>
                    <Pie
                      data={statusData}
                      cx="50%" cy="50%"
                      innerRadius={35}
                      outerRadius={60}
                      paddingAngle={3}
                      dataKey="value"
                      strokeWidth={0}
                    >
                      {statusData.map((_, i) => (
                        <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip content={<CustomTooltip />} />
                  </PieChart>
                </ResponsiveContainer>
                <div className="chart-legend">
                  {statusData.map((d, i) => (
                    <span key={d.name} className="legend-item">
                      <span className="legend-dot" style={{ background: PIE_COLORS[i] }} />
                      {d.name}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Growth area chart */}
        {growthData.length > 0 && (
          <div className="chart-card chart-card-wide">
            <h3 className="chart-title">Archive Growth</h3>
            <ResponsiveContainer width="100%" height={200}>
              <AreaChart data={growthData}>
                <defs>
                  <linearGradient id="growthGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#71717a" stopOpacity={0.3} />
                    <stop offset="100%" stopColor="#71717a" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <XAxis dataKey="date" tick={{ fill: '#5c5c66', fontSize: 11 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: '#5c5c66', fontSize: 11 }} axisLine={false} tickLine={false} allowDecimals={false} />
                <Tooltip content={<CustomTooltip />} />
                <Area type="monotone" dataKey="count" stroke="#8e8e96" fill="url(#growthGrad)" strokeWidth={2} name="Archives" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>

      {/* Domain bar chart */}
      {domainData.length > 0 && (
        <div className="chart-card" style={{ marginBottom: 'var(--space-8)' }}>
          <h3 className="chart-title">Top Domains</h3>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={domainData} layout="vertical" margin={{ left: 10 }}>
              <XAxis type="number" tick={{ fill: '#5c5c66', fontSize: 11 }} axisLine={false} tickLine={false} allowDecimals={false} />
              <YAxis type="category" dataKey="domain" tick={{ fill: '#8e8e96', fontSize: 11 }} axisLine={false} tickLine={false} width={130} />
              <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(255,255,255,0.04)', radius: 6 }} />
              <Bar dataKey="count" fill="#52525b" radius={[0, 4, 4, 0]} name="Archives" barSize={20} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* Tag cloud */}
    </div>
  );
}
