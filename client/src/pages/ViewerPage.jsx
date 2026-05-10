import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { archiveApi } from '../hooks/api.js';
import PDFViewer from '../components/PDFViewer.jsx';
import TagChip from '../components/TagChip.jsx';

export default function ViewerPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [archive, setArchive] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [newTag, setNewTag] = useState('');

  useEffect(() => {
    setLoading(true);
    archiveApi
      .get(id)
      .then((data) => setArchive(data.archive))
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [id]);

  const formatDate = (dateStr) => {
    if (!dateStr) return '';
    return new Date(dateStr).toLocaleString('en-US', {
      dateStyle: 'long',
      timeStyle: 'short',
    });
  };

  const formatBytes = (bytes) => {
    if (!bytes) return 'Unknown';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`;
  };

  const handleAddTag = async (e) => {
    e.preventDefault();
    if (!newTag.trim() || !archive) return;
    const currentTags = archive.tags?.map((t) => t.name) || [];
    try {
      const data = await archiveApi.updateTags(id, [
        ...currentTags,
        newTag.trim(),
      ]);
      setArchive(data.archive);
      setNewTag('');
    } catch {
      // Silently fail
    }
  };

  const handleRemoveTag = async (tag) => {
    if (!archive) return;
    const newTags = archive.tags
      .filter((t) => t.id !== tag.id)
      .map((t) => t.name);
    try {
      const data = await archiveApi.updateTags(id, newTags);
      setArchive(data.archive);
    } catch {
      // Silently fail
    }
  };

  const handleDelete = async () => {
    if (window.confirm('Delete this archive? This cannot be undone.')) {
      try {
        await archiveApi.delete(id);
        navigate('/browse');
      } catch {
        // Error
      }
    }
  };

  if (loading) {
    return (
      <div className="loading-spinner">
        <div className="spinner"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="empty-state">
        <div className="empty-icon">⚠</div>
        <h3>Could not load archive</h3>
        <p>{error}</p>
        <button
          className="btn btn-primary"
          onClick={() => navigate('/browse')}
          style={{ marginTop: 'var(--space-4)' }}
        >
          Back to Browse
        </button>
      </div>
    );
  }

  if (!archive) return null;

  return (
    <div>
      {/* Header */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'flex-start',
          marginBottom: 'var(--space-6)',
        }}
      >
        <div>
          <button
            className="btn btn-ghost btn-sm"
            onClick={() => navigate(-1)}
            style={{ marginBottom: 'var(--space-3)' }}
          >
            ← Back
          </button>
          <h2
            className="page-title"
            style={{ fontSize: 'var(--font-size-2xl)' }}
          >
            {archive.title || 'Untitled Page'}
          </h2>
          <a
            href={archive.url}
            target="_blank"
            rel="noopener noreferrer"
            style={{ fontSize: 'var(--font-size-sm)' }}
          >
            {archive.url} ↗
          </a>
        </div>
        <div style={{ display: 'flex', gap: 'var(--space-3)' }}>
          <a
            href={archiveApi.pdfUrl(id)}
            target="_blank"
            rel="noopener noreferrer"
            className="btn btn-ghost"
          >
            📄 Open PDF
          </a>
          <button className="btn btn-danger" onClick={handleDelete}>
            🗑 Delete
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="viewer-layout">
        {/* PDF viewer */}
        {archive.status === 'done' && archive.pdfPath ? (
          <PDFViewer archiveId={id} title={archive.title} />
        ) : (
          <div className="viewer-pdf-container">
            <div className="empty-state">
              <div className="empty-icon">⏳</div>
              <h3>
                {archive.status === 'error'
                  ? 'Archive failed'
                  : 'Processing…'}
              </h3>
              <p>
                {archive.status === 'error'
                  ? archive.errorMsg
                  : 'The page is being archived. Refresh to check progress.'}
              </p>
            </div>
          </div>
        )}

        {/* Sidebar */}
        <div className="viewer-sidebar">
          {/* Metadata */}
          <div className="card viewer-meta-card">
            <h3>Details</h3>
            <div className="viewer-meta-item">
              <span className="meta-label">Domain</span>
              <span className="meta-value">{archive.domain}</span>
            </div>
            <div className="viewer-meta-item">
              <span className="meta-label">Archived</span>
              <span className="meta-value">
                {formatDate(archive.createdAt)}
              </span>
            </div>
            <div className="viewer-meta-item">
              <span className="meta-label">File Size</span>
              <span className="meta-value">
                {formatBytes(archive.pageSize)}
              </span>
            </div>
            <div className="viewer-meta-item">
              <span className="meta-label">Status</span>
              <span className={`status-badge ${archive.status}`}>
                <span className="status-dot"></span>
                {archive.status}
              </span>
            </div>
            {archive.ocrUsed && (
              <div className="viewer-meta-item">
                <span className="meta-label">OCR</span>
                <span className="meta-value">
                  Used (image-heavy page)
                </span>
              </div>
            )}
          </div>

          {/* Tags */}
          <div className="card viewer-meta-card">
            <h3>Tags</h3>
            <div
              style={{
                display: 'flex',
                flexWrap: 'wrap',
                gap: 'var(--space-2)',
                marginBottom: 'var(--space-3)',
              }}
            >
              {archive.tags?.length > 0 ? (
                archive.tags.map((tag) => (
                  <TagChip key={tag.id} tag={tag} onRemove={handleRemoveTag} />
                ))
              ) : (
                <span
                  style={{
                    fontSize: 'var(--font-size-sm)',
                    color: 'var(--color-text-tertiary)',
                  }}
                >
                  No tags
                </span>
              )}
            </div>
            <form
              onSubmit={handleAddTag}
              style={{ display: 'flex', gap: 'var(--space-2)' }}
            >
              <input
                type="text"
                placeholder="Add tag…"
                value={newTag}
                onChange={(e) => setNewTag(e.target.value)}
                style={{
                  flex: 1,
                  padding: 'var(--space-2) var(--space-3)',
                  fontSize: 'var(--font-size-sm)',
                  background: 'var(--color-bg-input)',
                  border: '1px solid var(--color-border)',
                  borderRadius: 'var(--radius-sm)',
                  color: 'var(--color-text-primary)',
                  fontFamily: 'var(--font-family)',
                  outline: 'none',
                }}
                id="add-tag-input"
              />
              <button type="submit" className="btn btn-ghost btn-sm">
                +
              </button>
            </form>
          </div>

          {/* Text preview */}
          {archive.textContent && (
            <div className="card viewer-meta-card">
              <h3>Extracted Text</h3>
              <p
                style={{
                  fontSize: 'var(--font-size-sm)',
                  color: 'var(--color-text-secondary)',
                  lineHeight: 'var(--line-height-relaxed)',
                  maxHeight: '300px',
                  overflowY: 'auto',
                  whiteSpace: 'pre-wrap',
                  wordBreak: 'break-word',
                }}
              >
                {archive.textContent.substring(0, 2000)}
                {archive.textContent.length > 2000 && '…'}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
