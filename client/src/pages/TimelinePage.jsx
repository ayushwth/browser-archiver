import { useState, useEffect, useRef } from 'react';
import { archiveApi } from '../hooks/api.js';
import { useNavigate } from 'react-router-dom';

export default function TimelinePage() {
  const navigate = useNavigate();
  const [archives, setArchives] = useState([]);
  const [loading, setLoading] = useState(true);
  const [jumpDate, setJumpDate] = useState('');
  const sectionRefs = useRef({});

  useEffect(() => {
    archiveApi.list(1, 200)
      .then((data) => setArchives(data.archives || []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  // Group by date
  const grouped = {};
  archives.forEach((a) => {
    const d = new Date(a.createdAt);
    const key = d.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
    if (!grouped[key]) grouped[key] = [];
    grouped[key].push(a);
  });

  const dateGroups = Object.entries(grouped);

  const handleJump = () => {
    if (!jumpDate) return;
    const target = new Date(jumpDate).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
    const el = sectionRefs.current[target];
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  if (loading) {
    return (
      <div className="loading-spinner"><div className="spinner" /></div>
    );
  }

  return (
    <div className="timeline-page">
      <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <h2 className="page-title">Timeline</h2>
          <p className="page-subtitle">{archives.length} pages across {dateGroups.length} day{dateGroups.length !== 1 ? 's' : ''}</p>
        </div>
        <div className="timeline-jump">
          <input
            type="date"
            className="filter-date-input"
            value={jumpDate}
            onChange={(e) => setJumpDate(e.target.value)}
          />
          <button className="btn btn-ghost btn-sm" onClick={handleJump}>Jump</button>
        </div>
      </div>

      {dateGroups.length === 0 && (
        <div className="empty-state">
          <div className="empty-icon">∴</div>
          <h3>No archives yet</h3>
          <p>Start archiving pages to see them on your timeline.</p>
        </div>
      )}

      <div className="timeline">
        {dateGroups.map(([date, items], gi) => (
          <div
            key={date}
            className="timeline-group"
            ref={(el) => { sectionRefs.current[date] = el; }}
          >
            <div className="timeline-date-header">
              <div className="timeline-date-dot" />
              <span className="timeline-date-label">{date}</span>
              <span className="timeline-date-count">{items.length} page{items.length !== 1 ? 's' : ''}</span>
            </div>

            {items.map((archive, i) => (
              <div
                key={archive.id}
                className={`timeline-item ${i % 2 === 0 ? 'left' : 'right'}`}
                style={{ animationDelay: `${gi * 100 + i * 60}ms` }}
                onClick={() => navigate(`/view/${archive.id}`)}
              >
                <div className="timeline-item-dot" />
                <div className="timeline-item-card card">
                  <div className="timeline-item-title">{archive.title || 'Untitled'}</div>
                  <div className="timeline-item-url">{archive.domain}</div>
                  <div className="timeline-item-meta">
                    <span className={`status-badge ${archive.status}`}>
                      <span className="status-dot" />
                      {archive.status}
                    </span>
                    <span className="timeline-item-time">
                      {new Date(archive.createdAt).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}
