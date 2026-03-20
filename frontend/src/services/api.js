import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '/api',
  headers: { 'Content-Type': 'application/json' },
});

// Request interceptor — attach token
api.interceptors.request.use(
  (config) => {
    const stored = localStorage.getItem('golf-auth');
    if (stored) {
      const { token } = JSON.parse(stored).state || {};
      if (token) config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (err) => Promise.reject(err)
);

// Response interceptor — handle 401
api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      localStorage.removeItem('golf-auth');
      window.location.href = '/login';
    }
    return Promise.reject(err);
  }
);

export default api;

// ─── API helper functions ─────────────────────────────────────────────────────

// Auth
export const authAPI = {
  login:          (data)    => api.post('/auth/login', data),
  register:       (data)    => api.post('/auth/register', data),
  getMe:          ()        => api.get('/auth/me'),
  updateProfile:  (data)    => api.put('/auth/profile', data),
  changePassword: (data)    => api.put('/auth/change-password', data),
};

// Scores
export const scoresAPI = {
  getScores:   ()          => api.get('/scores'),
  addScore:    (data)      => api.post('/scores', data),
  editScore:   (id, data)  => api.put(`/scores/${id}`, data),
  deleteScore: (id)        => api.delete(`/scores/${id}`),
};

// Draws
export const drawsAPI = {
  getDraws:     (params)   => api.get('/draws', { params }),
  getDraw:      (id)       => api.get(`/draws/${id}`),
  getCurrentDraw: ()       => api.get('/draws/current'),
  getMyDraws:   ()         => api.get('/draws/my'),
  // Admin
  simulate:     (data)     => api.post('/draws/simulate', data),
  publish:      (data)     => api.post('/draws/publish', data),
  adminGetAll:  ()         => api.get('/draws/admin/all'),
};

// Charities
export const charitiesAPI = {
  getAll:    (params)      => api.get('/charities', { params }),
  getOne:    (slug)        => api.get(`/charities/${slug}`),
  create:    (data)        => api.post('/charities', data),
  update:    (id, data)    => api.put(`/charities/${id}`, data),
  remove:    (id)          => api.delete(`/charities/${id}`),
};

// Payments
export const paymentsAPI = {
  createCheckout: (plan)   => api.post('/payments/create-checkout', { plan }),
  createPortal:   ()       => api.post('/payments/portal'),
  getHistory:     ()       => api.get('/payments/history'),
};

// Winners
export const winnersAPI = {
  uploadProof:    (drawId, form) => api.post(`/winners/${drawId}/proof`, form, { headers: { 'Content-Type': 'multipart/form-data' } }),
  getPending:     ()             => api.get('/winners/pending'),
  verify:         (drawId, winnerId, data) => api.put(`/winners/${drawId}/${winnerId}`, data),
};

// Admin
export const adminAPI = {
  getAnalytics:        ()              => api.get('/admin/analytics'),
  getUsers:            (params)        => api.get('/admin/users', { params }),
  getUser:             (id)            => api.get(`/admin/users/${id}`),
  updateUser:          (id, data)      => api.put(`/admin/users/${id}`, data),
  manageSubscription:  (id, action)    => api.put(`/admin/users/${id}/subscription`, { action }),
  getPayments:         ()              => api.get('/admin/payments'),
};

// Users
export const usersAPI = {
  getMe:         ()       => api.get('/users/me'),
  updateCharity: (data)   => api.put('/users/charity', data),
};
