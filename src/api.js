import axios from 'axios';

const api = axios.create({
    baseURL: "http://localhost:8080/api",
});

export const login = (credentials) => api.post('/users/login', credentials);
export const register = (userData) => api.post('/users/register', userData);
export const getAchievements = () => api.get('/achievements/all');
export const deleteAchievement = (id) => api.delete(`/achievements/delete/${id}`);

export default api;