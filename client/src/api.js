import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:3000/api',
});

// Request Interceptor: Attach Token
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
}, (error) => {
  return Promise.reject(error);
});

// Auth API
export const login = (username, password) => api.post('/auth/login', { username, password });
export const register = (username, password, name) => api.post('/auth/register', { username, password, name });
export const createChild = (username, password, name) => api.post('/auth/create-child', { username, password, name });
export const createParent = (username, password, name) => api.post('/auth/create-parent', { username, password, name });

// Data API
export const getUsers = () => api.get('/users');
export const getUserData = (id) => api.get(`/users/${id}`);
export const createUser = (name) => {
    return api.post('/auth/create-child', { username: name + Date.now(), password: '123', name });
};
export const updateUser = (id, data) => api.put(`/users/${id}`, data);
export const resetPassword = (id, newPassword) => api.put(`/users/${id}/reset-password`, { newPassword });
export const deleteUser = (id) => api.delete(`/users/${id}`);

export const createChore = (userId, chore) => api.post('/chores', { userId, ...chore });
// Updated deleteChore with optional 'all' flag
export const deleteChore = (id, deleteAll = false) => api.delete(`/chores/${id}${deleteAll ? '?all=true' : ''}`);

export const createReward = (userId, reward) => api.post('/rewards', { userId, ...reward });
// Updated deleteReward with optional 'all' flag
export const deleteReward = (id, deleteAll = false) => api.delete(`/rewards/${id}${deleteAll ? '?all=true' : ''}`);

export const submitChore = (userId, choreId) => api.post('/actions/submit', { userId, choreId });
export const getPendingActions = () => api.get('/pending');
export const approveChore = (id) => api.post(`/actions/approve/${id}`);
export const rejectChore = (id) => api.post(`/actions/reject/${id}`);
export const completeChoreDirect = (userId, choreId) => api.post('/actions/complete-direct', { userId, choreId });

export const redeemReward = (userId, rewardId) => api.post('/actions/redeem', { userId, rewardId });
export const useReward = (itemId) => api.post('/actions/use-reward', { itemId });
export const resetScore = (userId) => api.post('/score/reset', { userId });

// History API
export const getHistory = (userId) => api.get(`/history/${userId}`);
