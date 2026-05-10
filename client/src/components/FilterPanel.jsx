import { useState, useEffect } from 'react';
import { tagApi } from '../hooks/api.js';

export default function FilterPanel({ isOpen, onClose, filters, onFiltersChange, topDomains = [] }) {
  const [tags, setTags] = useState([]);
  const [collapsed, setCollapsed] = useState({});

  useEffect(() => {
    tagApi.list().then((data) => setTags(data.tags || [])).catch(() => {});
  }, []);

  const toggleCollapse = (section) => {
    setCollapsed((prev) => ({ ...prev, [section]: !prev[section] }));
  };

  const toggleFilter = (key, value) => {
    const current = filters[key] || [];
    const next = current.includes(value)
      ? current.filter((v) => v !== value)
      : [...current, value];
    onFiltersChange({ ...filters, [key]: next });
  };

  const setDateFilter = (key, value) => {
    onFiltersChange({ ...filters, [key]: value });
  };

  const clearAll = () => {
    onFiltersChange({ domains: [], statuses: [], tags: [], dateFrom: '', dateTo: '' });
  };

  const activeCount =
    (filters.domains?.length || 0) +
    (filters.statuses?.length || 0) +
    (filters.tags?.length || 0) +
    (filters.dateFrom ? 1 : 0) +
    (filters.dateTo ? 1 : 0);

  return (
    <>
      <div
        className={`filter-backdrop ${isOpen ? 'open' : ''}`}
        onClick={onClose}
      />
      <aside className={`filter-panel ${isOpen ? 'open' : ''}`}>
        <div className="filter-panel-header">
          <h3>Filters</h3>
          <div style={{ display: 'flex', gap: 'var(--space-2)', alignItems: 'center' }}>
            {activeCount > 0 && (
              <button className="filter-clear-btn" onClick={clearAll}>
                Clear all ({activeCount})
              </button>
            )}
            <button className="btn btn-ghost btn-sm" onClick={onClose}>✕</button>
          </div>
        </div>

        {/* Active filter pills */}
        {activeCount > 0 && (
          <div className="filter-active-pills">
            {(filters.domains || []).map((d) => (
              <span key={d} className="filter-pill" onClick={() => toggleFilter('domains', d)}>
                {d} ✕
              </span>
            ))}
            {(filters.statuses || []).map((s) => (
              <span key={s} className="filter-pill" onClick={() => toggleFilter('statuses', s)}>
                {s} ✕
              </span>
            ))}
            {(filters.tags || []).map((t) => (
              <span key={t} className="filter-pill" onClick={() => toggleFilter('tags', t)}>
                {t} ✕
              </span>
            ))}
          </div>
        )}

        {/* Domain filter */}
        <div className="filter-section">
          <button className="filter-section-header" onClick={() => toggleCollapse('domain')}>
            <span>Domain</span>
            <span className={`filter-chevron ${collapsed.domain ? '' : 'open'}`}>›</span>
          </button>
          {!collapsed.domain && (
            <div className="filter-section-body">
              {topDomains.map((d) => (
                <label key={d.domain} className="filter-checkbox">
                  <input
                    type="checkbox"
                    checked={(filters.domains || []).includes(d.domain)}
                    onChange={() => toggleFilter('domains', d.domain)}
                  />
                  <span className="filter-checkbox-label">{d.domain}</span>
                  <span className="filter-checkbox-count">{d.count}</span>
                </label>
              ))}
              {topDomains.length === 0 && (
                <span className="filter-empty">No domains yet</span>
              )}
            </div>
          )}
        </div>

        {/* Status filter */}
        <div className="filter-section">
          <button className="filter-section-header" onClick={() => toggleCollapse('status')}>
            <span>Status</span>
            <span className={`filter-chevron ${collapsed.status ? '' : 'open'}`}>›</span>
          </button>
          {!collapsed.status && (
            <div className="filter-section-body">
              {['done', 'pending', 'error'].map((s) => (
                <label key={s} className="filter-checkbox">
                  <input
                    type="checkbox"
                    checked={(filters.statuses || []).includes(s)}
                    onChange={() => toggleFilter('statuses', s)}
                  />
                  <span className="filter-checkbox-label">{s}</span>
                </label>
              ))}
            </div>
          )}
        </div>

        {/* Tag filter */}
        <div className="filter-section">
          <button className="filter-section-header" onClick={() => toggleCollapse('tags')}>
            <span>Tags</span>
            <span className={`filter-chevron ${collapsed.tags ? '' : 'open'}`}>›</span>
          </button>
          {!collapsed.tags && (
            <div className="filter-section-body">
              <div className="filter-tag-list">
                {tags.map((tag) => (
                  <button
                    key={tag.id}
                    className={`filter-tag-pill ${(filters.tags || []).includes(tag.name) ? 'active' : ''}`}
                    onClick={() => toggleFilter('tags', tag.name)}
                  >
                    {tag.name}
                  </button>
                ))}
                {tags.length === 0 && (
                  <span className="filter-empty">No tags yet</span>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Date range */}
        <div className="filter-section">
          <button className="filter-section-header" onClick={() => toggleCollapse('date')}>
            <span>Date Range</span>
            <span className={`filter-chevron ${collapsed.date ? '' : 'open'}`}>›</span>
          </button>
          {!collapsed.date && (
            <div className="filter-section-body">
              <div className="filter-date-row">
                <label className="filter-date-label">From</label>
                <input
                  type="date"
                  className="filter-date-input"
                  value={filters.dateFrom || ''}
                  onChange={(e) => setDateFilter('dateFrom', e.target.value)}
                />
              </div>
              <div className="filter-date-row">
                <label className="filter-date-label">To</label>
                <input
                  type="date"
                  className="filter-date-input"
                  value={filters.dateTo || ''}
                  onChange={(e) => setDateFilter('dateTo', e.target.value)}
                />
              </div>
            </div>
          )}
        </div>
      </aside>
    </>
  );
}
