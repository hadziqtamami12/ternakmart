// api.js - Unified Fetch Client for Ternakmart API
const API_BASE = '/api/v1';

function getActiveToken() {
  const isAdminPath = typeof window !== 'undefined' && window.location.pathname.toLowerCase().startsWith('/admin');
  const token = isAdminPath
    ? (typeof localStorage !== 'undefined' && localStorage.getItem('ternakmart_admin_token'))
    : (typeof localStorage !== 'undefined' && localStorage.getItem('ternakmart_token'));

  if (!token || token === 'null' || token === 'undefined' || typeof token !== 'string' || token.trim() === '') {
    return null;
  }
  return token.trim();
}

async function request(endpoint, options = {}) {
  const token = options.token || (options.useAdminToken ? localStorage.getItem('ternakmart_admin_token') : getActiveToken());
  const headers = {
    ...(options.headers || {})
  };

  const validToken = (token && token !== 'null' && token !== 'undefined' && typeof token === 'string' && token.trim() !== '') ? token.trim() : null;

  if (validToken && !headers['Authorization']) {
    headers['Authorization'] = `Bearer ${validToken}`;
  }

  if (!(options.body instanceof FormData) && !headers['Content-Type']) {
    headers['Content-Type'] = 'application/json';
  }

  const url = endpoint.startsWith('http') ? endpoint : `${API_BASE}${endpoint.startsWith('/') ? '' : '/'}${endpoint}`;

  try {
    const res = await fetch(url, {
      ...options,
      headers
    });

    const data = await res.json().catch(() => null);

    if (!res.ok) {
      const errorMsg = (data && data.message) || `Request failed with status ${res.status}`;
      const err = new Error(errorMsg);
      err.status = res.status;
      err.data = data;
      throw err;
    }

    return data;
  } catch (err) {
    throw err;
  }
}

export const api = {
  get: (endpoint, options) => request(endpoint, { method: 'GET', ...options }),
  post: (endpoint, body, options) => request(endpoint, {
    method: 'POST',
    body: body instanceof FormData ? body : JSON.stringify(body),
    ...options
  }),
  put: (endpoint, body, options) => request(endpoint, {
    method: 'PUT',
    body: body instanceof FormData ? body : JSON.stringify(body),
    ...options
  }),
  delete: (endpoint, options) => request(endpoint, { method: 'DELETE', ...options }),

  // File upload helper
  uploadFile: async (file) => {
    const formData = new FormData();
    formData.append('file', file);
    return await request('/uploads', {
      method: 'POST',
      body: formData
    });
  }
};
