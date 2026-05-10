import { useState, useEffect, useCallback } from 'react';
import { archiveApi } from './api.js';

/**
 * Custom hook for fetching and managing archives
 */
export function useArchives() {
  const [archives, setArchives] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [stats, setStats] = useState(null);

  const fetchArchives = useCallback(async (p = 1) => {
    setLoading(true);
    setError(null);

    try {
      const data = await archiveApi.list(p, 20);
      setArchives(data.archives || []);
      setTotal(data.total || 0);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchStats = useCallback(async () => {
    try {
      const data = await archiveApi.stats();
      setStats(data);
    } catch {
      // Stats are optional, don't block on failure
    }
  }, []);

  const submitUrl = useCallback(async (url, tags = []) => {
    const data = await archiveApi.submit(url, tags);
    // Refresh the list
    await fetchArchives(page);
    return data;
  }, [page, fetchArchives]);

  const deleteArchive = useCallback(async (id) => {
    await archiveApi.delete(id);
    await fetchArchives(page);
  }, [page, fetchArchives]);

  useEffect(() => {
    fetchArchives(page);
  }, [page, fetchArchives]);

  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  return {
    archives,
    total,
    page,
    setPage,
    loading,
    error,
    stats,
    submitUrl,
    deleteArchive,
    refresh: () => {
      fetchArchives(page);
      fetchStats();
    },
  };
}
