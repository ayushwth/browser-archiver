const API_BASE = 'http://localhost:3001/api';

/**
 * Fetch wrapper with error handling
 */
async function request(endpoint, options = {}) {
  const url = `${API_BASE}${endpoint}`;
  const config = {
    headers: { 'Content-Type': 'application/json' },
    ...options,
  };

  const res = await fetch(url, config);
  const data = await res.json();

  if (!res.ok) {
    throw new Error(data.error?.message || 'Request failed');
  }

  return data;
}

// Archive endpoints
export const archiveApi = {
  submit: (url, tags = []) =>
    request('/archive', {
      method: 'POST',
      body: JSON.stringify({ url, tags }),
    }),

  list: (page = 1, limit = 20, filters = {}) => {
    const params = new URLSearchParams({ page, limit, ...filters });
    return request(`/archive?${params}`);
  },

  get: (id) => request(`/archive/${id}`),

  delete: (id) => request(`/archive/${id}`, { method: 'DELETE' }),

  updateTags: (id, tags) =>
    request(`/archive/${id}/tags`, {
      method: 'PATCH',
      body: JSON.stringify({ tags }),
    }),

  stats: () => request('/archive/stats'),

  pdfUrl: (id) => `${API_BASE}/archive/${id}/pdf`,
};

// Search endpoints
export const searchApi = {
  search: (q, page = 1, limit = 20, filters = {}) => {
    const params = new URLSearchParams({ q, page, limit, ...filters });
    return request(`/search?${params}`);
  },
};

// Tag endpoints
export const tagApi = {
  list: () => request('/tags'),
  create: (name, color) =>
    request('/tags', {
      method: 'POST',
      body: JSON.stringify({ name, color }),
    }),
  delete: (id) => request(`/tags/${id}`, { method: 'DELETE' }),
  update: (id, data) =>
    request(`/tags/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    }),
};
