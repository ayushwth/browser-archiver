import { useNavigate } from 'react-router-dom';
import TagChip from './TagChip.jsx';

export default function ResultCard({ result, onDelete }) {
  const navigate = useNavigate();

  const handleClick = () => {
    navigate(`/view/${result.id}`);
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return '';
    const d = new Date(dateStr);
    return d.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const faviconUrl = result.domain
    ? `https://www.google.com/s2/favicons?domain=${result.domain}&sz=32`
    : null;

  // Sanitize snippet HTML (only allow <mark> tags)
  const sanitizeSnippet = (html) => {
    if (!html) return '';
    return html
      .replace(/<(?!\/?(mark)(?=>|\s))\/?[^>]+>/gi, '')
      .substring(0, 400);
  };

  return (
    <div className="card result-card" onClick={handleClick} id={`result-${result.id}`}>
      <div className="card-favicon">
        {faviconUrl ? (
          <img
            src={faviconUrl}
            alt=""
            onError={(e) => {
              e.target.style.display = 'none';
              e.target.nextSibling.style.display = 'block';
            }}
          />
        ) : null}
        <span
          className="fallback-icon"
          style={{ display: faviconUrl ? 'none' : 'block' }}
        >
          ◉
        </span>
      </div>

      <div className="card-body">
        <div className="card-title">{result.title || 'Untitled Page'}</div>
        <div className="card-url">{result.url}</div>

        {result.snippets?.length > 0 && (
          <div
            className="card-snippet"
            dangerouslySetInnerHTML={{
              __html: sanitizeSnippet(result.snippets[0]),
            }}
          />
        )}

        <div className="card-meta">
          <span className="card-date">{formatDate(result.createdAt)}</span>

          {result.status && (
            <span className={`status-badge ${result.status}`}>
              <span className="status-dot"></span>
              {result.status}
            </span>
          )}

          <div className="card-tags">
            {result.tags?.map((tag) => (
              <TagChip key={tag.id} tag={tag} small />
            ))}
          </div>
        </div>
      </div>

      <div className="card-actions" onClick={(e) => e.stopPropagation()}>
        <a
          href={result.url}
          target="_blank"
          rel="noopener noreferrer"
          className="btn btn-ghost btn-sm"
          title="Open original"
        >
          ↗
        </a>
        {onDelete && (
          <button
            className="btn btn-danger btn-sm"
            onClick={() => onDelete(result.id)}
            title="Delete"
          >
            🗑
          </button>
        )}
      </div>
    </div>
  );
}
