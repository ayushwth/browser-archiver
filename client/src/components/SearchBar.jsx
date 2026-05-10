import { useRef, useEffect } from 'react';

export default function SearchBar({ value, onChange, placeholder, autoFocus }) {
  const inputRef = useRef(null);

  useEffect(() => {
    if (autoFocus && inputRef.current) {
      inputRef.current.focus();
    }
  }, [autoFocus]);

  // Global keyboard shortcut: "/" to focus search
  useEffect(() => {
    const handleKey = (e) => {
      if (e.key === '/' && document.activeElement !== inputRef.current) {
        e.preventDefault();
        inputRef.current?.focus();
      }
    };

    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, []);

  return (
    <div className="search-bar-container">
      <input
        ref={inputRef}
        type="text"
        className="search-bar"
        placeholder={placeholder || 'Search your archive…'}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        id="search-input"
      />
      <span className="search-bar-icon">🔍</span>
      <span className="search-bar-shortcut">/</span>
    </div>
  );
}
