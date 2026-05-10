import { useState, useEffect } from 'react';
import { tagApi } from '../hooks/api.js';

export default function TagCloud({ onTagClick }) {
  const [tags, setTags] = useState([]);

  useEffect(() => {
    tagApi.list().then((data) => setTags(data.tags || [])).catch(() => {});
  }, []);

  if (tags.length === 0) return null;

  const maxCount = Math.max(...tags.map((t) => t.archiveCount), 1);
  const minSize = 0.75;
  const maxSize = 1.75;

  const getSize = (count) => {
    const ratio = count / maxCount;
    return minSize + ratio * (maxSize - minSize);
  };

  const getHue = (index) => (index * 47) % 360;

  return (
    <div className="tag-cloud">
      <h3 className="tag-cloud-title">Tags</h3>
      <div className="tag-cloud-container">
        {tags.map((tag, i) => (
          <button
            key={tag.id}
            className="tag-cloud-item"
            style={{
              fontSize: `${getSize(tag.archiveCount)}rem`,
              '--tag-hue': getHue(i),
              animationDelay: `${i * 50}ms`,
            }}
            onClick={() => onTagClick?.(tag.name)}
            title={`${tag.archiveCount} archive${tag.archiveCount !== 1 ? 's' : ''}`}
          >
            {tag.name}
            <span className="tag-cloud-count">{tag.archiveCount}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
