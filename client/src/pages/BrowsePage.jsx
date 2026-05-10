import { useState, useMemo, useEffect } from 'react';
import { useArchives } from '../hooks/useArchives.js';
import ResultCard from '../components/ResultCard.jsx';
import FilterPanel from '../components/FilterPanel.jsx';
import ViewToggle from '../components/ViewToggle.jsx';
import ConfirmDialog from '../components/ConfirmDialog.jsx';

export default function BrowsePage() {
  const {
    archives,
    total,
    page,
    setPage,
    loading,
    error,
    stats,
    submitUrl,
    deleteArchive,
    refresh,
  } = useArchives();

  const [url, setUrl] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [submitMessage, setSubmitMessage] = useState(null);
  const [filterOpen, setFilterOpen] = useState(false);
  const [filters, setFilters] = useState({ domains: [], statuses: [], tags: [], dateFrom: '', dateTo: '' });
  const [view, setView] = useState(() => localStorage.getItem('archiveView') || 'list');
  const [sort, setSort] = useState(() => localStorage.getItem('archiveSort') || 'newest');
  const [deleteTarget, setDeleteTarget] = useState(null);

  useEffect(() => { localStorage.setItem('archiveView', view); }, [view]);
  useEffect(() => { localStorage.setItem('archiveSort', sort); }, [sort]);

  const totalPages = Math.ceil(total / 20);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!url.trim()) return;
    setSubmitting(true);
    setSubmitMessage(null);
    try {
      const data = await submitUrl(url.trim());
      setSubmitMessage({
        type: data.duplicate ? 'info' : 'success',
        text: data.duplicate ? 'This page was already archived!' : 'Page queued for archiving!',
      });
      setUrl('');
      refresh();
    } catch (err) {
      setSubmitMessage({ type: 'error', text: err.message });
    } finally {
      setSubmitting(false);
      setTimeout(() => setSubmitMessage(null), 4000);
    }
  };

  const handleDelete = (id) => {
    setDeleteTarget(id);
  };

  const confirmDelete = async () => {
    if (!deleteTarget) return;
    try {
      await deleteArchive(deleteTarget);
    } catch {
      // Error handled in hook
    }
    setDeleteTarget(null);
  };

  // Client-side filtering & sorting
  const filteredArchives = useMemo(() => {
    let result = [...archives];

    if (filters.domains?.length) {
      result = result.filter((a) => filters.domains.includes(a.domain));
    }
    if (filters.statuses?.length) {
      result = result.filter((a) => filters.statuses.includes(a.status));
    }
    if (filters.tags?.length) {
      result = result.filter((a) =>
        a.tags?.some((t) => filters.tags.includes(t.name))
      );
    }
    if (filters.dateFrom) {
      result = result.filter((a) => new Date(a.createdAt) >= new Date(filters.dateFrom));
    }
    if (filters.dateTo) {
      result = result.filter((a) => new Date(a.createdAt) <= new Date(filters.dateTo + 'T23:59:59'));
    }

    switch (sort) {
      case 'oldest':
        result.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
        break;
      case 'alpha':
        result.sort((a, b) => (a.title || '').localeCompare(b.title || ''));
        break;
      case 'domain':
        result.sort((a, b) => (a.domain || '').localeCompare(b.domain || ''));
        break;
      default: // newest
        result.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    }

    return result;
  }, [archives, filters, sort]);

  const activeFilterCount =
    (filters.domains?.length || 0) +
    (filters.statuses?.length || 0) +
    (filters.tags?.length || 0) +
    (filters.dateFrom ? 1 : 0) +
    (filters.dateTo ? 1 : 0);

  return (
    <div>
      <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <h2 className="page-title">Browse Archive</h2>
          <p className="page-subtitle">
            {total} page{total !== 1 ? 's' : ''} archived
          </p>
        </div>
        <button
          className="btn btn-ghost"
          onClick={() => setFilterOpen(true)}
        >
          ⚙ Filters{activeFilterCount > 0 ? ` (${activeFilterCount})` : ''}
        </button>
      </div>

      {/* Filter Panel */}
      <FilterPanel
        isOpen={filterOpen}
        onClose={() => setFilterOpen(false)}
        filters={filters}
        onFiltersChange={setFilters}
        topDomains={stats?.topDomains || []}
      />

      {/* Archive URL input */}
      <form className="archive-input-bar" onSubmit={handleSubmit}>
        <input
          type="url"
          placeholder="Paste a URL to archive…"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          required
          id="archive-url-input"
        />
        <button
          type="submit"
          className="btn btn-primary"
          disabled={submitting || !url.trim()}
          id="archive-submit-btn"
        >
          {submitting ? 'Archiving…' : 'Archive'}
        </button>
      </form>

      {/* Submit feedback */}
      {submitMessage && (
        <div
          className={`toast ${submitMessage.type}`}
          style={{
            position: 'relative',
            marginBottom: 'var(--space-6)',
            bottom: 'auto',
            right: 'auto',
          }}
        >
          {submitMessage.text}
        </div>
      )}

      {/* View toggle */}
      <ViewToggle
        view={view}
        onViewChange={setView}
        sort={sort}
        onSortChange={setSort}
      />

      {/* Error */}
      {error && (
        <div className="card" style={{ borderLeftColor: 'var(--color-error)', borderLeftWidth: '3px', marginBottom: 'var(--space-6)' }}>
          <p style={{ color: 'var(--color-error)' }}>{error}</p>
          <button className="btn btn-ghost btn-sm" onClick={refresh} style={{ marginTop: 'var(--space-3)' }}>
            Retry
          </button>
        </div>
      )}

      {/* Loading */}
      {loading && (
        <div className="loading-spinner">
          <div className="spinner" />
        </div>
      )}

      {/* Archive list */}
      {!loading && filteredArchives.length > 0 && (
        <div className={`results-list results-animated ${view === 'grid' ? 'results-grid' : ''} ${view === 'compact' ? 'results-compact' : ''}`}>
          {filteredArchives.map((archive, i) => (
            <div
              key={archive.id}
              className="result-animate-in"
              style={{ animationDelay: `${i * 40}ms` }}
            >
              <ResultCard
                result={archive}
                onDelete={handleDelete}
                compact={view === 'compact'}
              />
            </div>
          ))}
        </div>
      )}

      {/* Empty state */}
      {!loading && filteredArchives.length === 0 && !error && (
        <div className="empty-state empty-float">
          <div className="empty-icon">∴</div>
          <h3>{activeFilterCount > 0 ? 'No matching archives' : 'No pages archived yet'}</h3>
          <p>
            {activeFilterCount > 0
              ? 'Try adjusting your filters.'
              : 'Paste a URL above to archive your first webpage, or install the browser extension to capture pages automatically.'}
          </p>
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && !loading && (
        <div className="pagination">
          <button disabled={page <= 1} onClick={() => setPage(page - 1)} aria-label="Previous page">‹</button>
          {Array.from({ length: Math.min(totalPages, 7) }, (_, i) => {
            const p = i + 1;
            return (
              <button key={p} className={p === page ? 'active' : ''} onClick={() => setPage(p)}>{p}</button>
            );
          })}
          <button disabled={page >= totalPages} onClick={() => setPage(page + 1)} aria-label="Next page">›</button>
        </div>
      )}

      {/* Delete confirmation dialog */}
      <ConfirmDialog
        isOpen={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={confirmDelete}
        title="Delete Archive"
        message="This will permanently delete the archive and its PDF file. This cannot be undone."
        confirmText="Delete"
        variant="danger"
      />
    </div>
  );
}
