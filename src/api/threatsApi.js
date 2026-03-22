import axios from 'axios';

const BASE_URL = 'http://109.120.152.26:5000/items';

const api = axios.create({
  baseURL: BASE_URL,
  headers: { 'Content-Type': 'application/json' },
});

api.interceptors.response.use(
  response => response,
  error => {
    if (error.response?.status === 401) {
      console.warn('Не авторизован (401). Требуется аутентификация.');
    }
    return Promise.reject(error);
  }
);

export const getAllThreats  = ()           => api.get('/');
export const getThreatById = (id)         => api.get(`/${id}`);
export const createThreat  = (threat)     => api.post('/',     JSON.stringify(threat));
export const updateThreat  = (id, threat) => api.put(`/${id}`, JSON.stringify(threat));
export const deleteThreat  = (id)         => api.delete(`/${id});
