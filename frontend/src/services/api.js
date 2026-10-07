import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || '/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('ewp_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      // Token expired or invalid
      // Only redirect if not already on login
    }
    return Promise.reject(error);
  }
);

export const authApi = {
  login: async (username, password) => {
    const res = await api.post('/auth/login', { username, password });
    return res.data;
  },
  register: async (userData) => {
    const res = await api.post('/auth/register', userData);
    return res.data;
  },
  getCurrentUser: async () => {
    const res = await api.get('/auth/me');
    return res.data;
  },
};

export const workflowApi = {
  getDefinitions: async () => {
    const res = await api.get('/workflows/definitions');
    return res.data;
  },
  getActiveDefinitions: async () => {
    const res = await api.get('/workflows/definitions/active');
    return res.data;
  },
  getDefinitionById: async (id) => {
    const res = await api.get(`/workflows/definitions/${id}`);
    return res.data;
  },
  createDefinition: async (definitionData) => {
    const res = await api.post('/workflows/definitions', definitionData);
    return res.data;
  },
  updateDefinition: async (id, definitionData) => {
    const res = await api.put(`/workflows/definitions/${id}`, definitionData);
    return res.data;
  },
  getAllInstances: async () => {
    const res = await api.get('/workflows/instances');
    return res.data;
  },
  getInstanceById: async (id) => {
    const res = await api.get(`/workflows/instances/${id}`);
    return res.data;
  },
  createInstance: async (data) => {
    const res = await api.post('/workflows/instances', data);
    return res.data;
  },
  executeAction: async (id, actionData) => {
    const res = await api.post(`/workflows/instances/${id}/action`, actionData);
    return res.data;
  },
  getMySubmissions: async () => {
    const res = await api.get('/workflows/instances/my-submissions');
    return res.data;
  },
  getPendingApprovals: async () => {
    const res = await api.get('/workflows/instances/pending-approvals');
    return res.data;
  },
  getInstanceAuditLogs: async (instanceId) => {
    const res = await api.get(`/workflows/audit/instance/${instanceId}`);
    return res.data;
  },
  getRecentAuditLogs: async () => {
    const res = await api.get('/workflows/audit/recent');
    return res.data;
  },
  getMetrics: async () => {
    const res = await api.get('/workflows/analytics/metrics');
    return res.data;
  },
  getUsers: async (role) => {
    const res = await api.get(role ? `/users?role=${role}` : '/users');
    return res.data;
  },
};

export default api;
