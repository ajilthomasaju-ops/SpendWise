
const TOKEN_KEY = 'spendwise_jwt_token';

// Local development uses same-origin API.
// Production uses the Render backend URL from Vercel environment variables.
const API_BASE_URL = (
  import.meta.env.VITE_API_BASE_URL || ''
).replace(/\/$/, '');

export function getStoredToken() {
  try {
    return localStorage.getItem(TOKEN_KEY);
  } catch {
    return null;
  }
}

export function setStoredToken(token) {
  try {
    if (token) {
      localStorage.setItem(TOKEN_KEY, token);
    } else {
      localStorage.removeItem(TOKEN_KEY);
    }
  } catch {
    // Ignore storage errors
  }
}

async function apiRequest(path, options = {}) {
  const token = getStoredToken();

  const headers = {
    'Content-Type': 'application/json',
    ...(options.headers || {}),
  };

  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  const res = await fetch(`${API_BASE_URL}${path}`, {
    ...options,
    headers,
  });

  const contentType = res.headers.get('content-type') || '';

  const data = contentType.includes('application/json')
    ? await res.json()
    : null;

  if (!res.ok) {
    const message =
      (data && typeof data.error === 'string' && data.error) ||
      `Request failed (${res.status})`;

    throw new Error(message);
  }

  return data;
}

// Authentication API
export const authApi = {
  register: (payload) =>
    apiRequest('/api/auth/register', {
      method: 'POST',
      body: JSON.stringify(payload),
    }),

  login: (payload) =>
    apiRequest('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify(payload),
    }),

  me: () => apiRequest('/api/auth/me'),

  updateProfile: (payload) =>
    apiRequest('/api/auth/profile', {
      method: 'PUT',
      body: JSON.stringify(payload),
    }),

  logout: () =>
    apiRequest('/api/auth/logout', {
      method: 'POST',
    }),
};

// Transactions API
export const transactionsApi = {
  list: (params) => {
    const qs = params
      ? new URLSearchParams(params).toString()
      : '';

    return apiRequest(
      `/api/transactions${qs ? `?${qs}` : ''}`
    );
  },

  create: (payload) =>
    apiRequest('/api/transactions', {
      method: 'POST',
      body: JSON.stringify(payload),
    }),

  update: (id, payload) =>
    apiRequest(`/api/transactions/${id}`, {
      method: 'PUT',
      body: JSON.stringify(payload),
    }),

  remove: (id) =>
    apiRequest(`/api/transactions/${id}`, {
      method: 'DELETE',
    }),

  downloadCsv: async (params) => {
    const token = getStoredToken();

    const qs = params
      ? new URLSearchParams(params).toString()
      : '';

    const res = await fetch(
      `${API_BASE_URL}/api/transactions/export/csv${qs ? `?${qs}` : ''}`,
      {
        headers: token
          ? { Authorization: `Bearer ${token}` }
          : {},
      }
    );

    if (!res.ok) {
      throw new Error('Failed to export CSV ledger.');
    }

    const blob = await res.blob();
    const url = URL.createObjectURL(blob);

    const link = document.createElement('a');
    link.href = url;
    link.download = `spendwise-ledger-${new Date()
      .toISOString()
      .slice(0, 10)}.csv`;

    document.body.appendChild(link);
    link.click();
    link.remove();

    URL.revokeObjectURL(url);
  },
};

// Budgets API
export const budgetsApi = {
  list: (month) =>
    apiRequest(
      `/api/budgets?month=${encodeURIComponent(month)}`
    ),

  upsert: (payload) =>
    apiRequest('/api/budgets', {
      method: 'PUT',
      body: JSON.stringify(payload),
    }),

  remove: (id) =>
    apiRequest(`/api/budgets/${id}`, {
      method: 'DELETE',
    }),
};

// Admin API
export const adminApi = {
  overview: () =>
    apiRequest('/api/admin/overview'),

  setUserStatus: (id, status) =>
    apiRequest(`/api/admin/users/${id}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status }),
    }),

  deleteUser: (id) =>
    apiRequest(`/api/admin/users/${id}`, {
      method: 'DELETE',
    }),
};
