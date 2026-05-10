import { useState, useEffect, useCallback } from 'react';
import { searchApi } from './api.js';

/**
 * Custom hook for debounced search
 */
export function useSearch(debounceMs = 400) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [processingTime, setProcessingTime] = useState(null);

  const performSearch = useCallback(async (q, p = 1) => {
    if (!q.trim()) {
      setResults([]);
      setTotal(0);
      setProcessingTime(null);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const data = await searchApi.search(q, p);
      setResults(data.results || []);
      setTotal(data.total || 0);
      setProcessingTime(data.processingTimeMs);
    } catch (err) {
      setError(err.message);
      setResults([]);
    } finally {
      setLoading(false);
    }
  }, []);

  // Debounced search effect
  useEffect(() => {
    const timer = setTimeout(() => {
      performSearch(query, page);
    }, debounceMs);

    return () => clearTimeout(timer);
  }, [query, page, debounceMs, performSearch]);

  return {
    query,
    setQuery,
    results,
    total,
    page,
    setPage,
    loading,
    error,
    processingTime,
    refresh: () => performSearch(query, page),
  };
}
