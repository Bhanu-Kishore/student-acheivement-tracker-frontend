const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8080/api';

export const api = {
  register: async (userData) => {
    const response = await fetch(`${API_BASE_URL}/users/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(userData)
    });
    return response.json();
  },

  login: async (username, password) => {
    const response = await fetch(`${API_BASE_URL}/users/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password })
    });
    if (!response.ok) throw new Error('Login failed');
    return response.json();
  },

  getUsersBySection: async (sectionCode) => {
    const response = await fetch(`${API_BASE_URL}/users/section/${sectionCode}`);
    return response.json();
  },

  addAchievement: async (username, achievement) => {
    const response = await fetch(`${API_BASE_URL}/achievements/${username}/add`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(achievement)
    });
    return response.json();
  },

  getAchievementsBySection: async (sectionCode) => {
    const response = await fetch(`${API_BASE_URL}/achievements/section/${sectionCode}`);
    return response.json();
  },

  getAchievementsByUsername: async (username) => {
    const response = await fetch(`${API_BASE_URL}/achievements/${username}`);
    return response.json();
  },

  deleteAchievement: async (id) => {
    const response = await fetch(`${API_BASE_URL}/achievements/${id}`, {
      method: 'DELETE'
    });
    return response.ok;
  }
};
