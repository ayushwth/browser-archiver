import { useState } from 'react';

export default function ViewToggle({ view, onViewChange, sort, onSortChange, density, onDensityChange }) {
  const [showSort, setShowSort] = useState(false);

  const sortOptions = [
    { value: 'newest', label: 'Newest First' },
    { value: 'oldest', label: 'Oldest First' },
    { value: 'alpha', label: 'A → Z' },
    { value: 'domain', label: 'By Domain' },
  ];

  return (
    <div className="view-toggle-bar">
      <div className="view-toggle-group">
        <button
          className={`view-toggle-btn ${view === 'list' ? 'active' : ''}`}
          onClick={() => onViewChange('list')}
          title="List view"
          aria-label="List view"
        >
          ☰
        </button>
        <button
          className={`view-toggle-btn ${view === 'grid' ? 'active' : ''}`}
          onClick={() => onViewChange('grid')}
          title="Grid view"
          aria-label="Grid view"
        >
          ⊞
        </button>
        <button
          className={`view-toggle-btn ${view === 'compact' ? 'active' : ''}`}
          onClick={() => onViewChange('compact')}
          title="Compact view"
          aria-label="Compact view"
        >
          ≡
        </button>
      </div>

      <div className="view-sort-wrapper">
        <button
          className="btn btn-ghost btn-sm"
          onClick={() => setShowSort(!showSort)}
        >
          Sort: {sortOptions.find((s) => s.value === sort)?.label || 'Newest'}
          <span style={{ marginLeft: '4px', fontSize: '0.7em' }}>▼</span>
        </button>
        {showSort && (
          <div className="sort-dropdown">
            {sortOptions.map((opt) => (
              <button
                key={opt.value}
                className={`sort-option ${sort === opt.value ? 'active' : ''}`}
                onClick={() => {
                  onSortChange(opt.value);
                  setShowSort(false);
                }}
              >
                {opt.label}
                {sort === opt.value && <span className="sort-check">✓</span>}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
