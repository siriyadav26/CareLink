import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

const API_URL = 'http://130.1.11.163:5000/api'; // Updated to match current machine IP

const api = axios.create({
  baseURL: API_URL,
  headers: { 'Content-Type': 'application/json' },
});

api.interceptors.request.use(async (config) => {
  const token = await AsyncStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const authAPI = {
  register: (data) => api.post('/auth/register', data),
  login: (data) => api.post('/auth/login', data),
  faceLogin: (data) => api.post('/auth/face-login', data),
  enrollFace: (data) => api.post('/auth/enroll-face', data),
  forgotPassword: (email) => api.post('/auth/forgot-password', { email }),
  updateProfile: (data) => api.put('/auth/profile', data),
};

export const medicineAPI = {
  getAll: () => api.get('/medicines'),
  create: (data) => api.post('/medicines', data),
  update: (id, data) => api.put(`/medicines/${id}`, data),
  delete: (id) => api.delete(`/medicines/${id}`),
  markTaken: (id) => api.post(`/medicines/${id}/taken`),
};

export const moodAPI = {
  create: (data) => api.post('/moods', data),
  getAll: () => api.get('/moods'),
  resetToday: (dayString) => api.delete('/moods/reset', { data: { dayString } }),
};

export const gameAPI = {
  saveScore: (data) => api.post('/games/score', data),
  getStats: () => api.get('/games/stats'),
};

export const chatbotAPI = {
  sendMessage: (message) => api.post('/chatbot/message', { message }),
};

export const sosAPI = {
  // Use a longer timeout for SOS to prevent Axios timeouts when the email server is slow
  trigger: (location) => api.post('/sos/trigger', { location }, { timeout: 30000 }),
};

export default api;