const API_BASE = '/api';

const getHeaders = () => {
  const token = localStorage.getItem('token');
  return {
    'Content-Type': 'application/json',
    ...(token ? { 'Authorization': `Bearer ${token}` } : {})
  };
};

export const api = {
  get: async (endpoint) => {
    const res = await fetch(`${API_BASE}${endpoint}`, {
      headers: getHeaders()
    });
    const text = await res.text();
    if (!res.ok) {
      let json;
      try {
        json = JSON.parse(text);
      } catch (e) {
        json = { message: text || res.statusText };
      }
      const error = new Error(json.message || 'Unknown error');
      error.responseData = json;
      throw error;
    }
    return text ? JSON.parse(text) : null;
  },

  post: async (endpoint, data) => {
    const res = await fetch(`${API_BASE}${endpoint}`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(data)
    });
    const text = await res.text();
    if (!res.ok) {
      let json;
      try {
        json = JSON.parse(text);
      } catch (e) {
        json = { message: text || res.statusText };
      }
      const error = new Error(json.message || 'Unknown error');
      error.responseData = json;
      throw error;
    }
    return text ? JSON.parse(text) : null;
  },

  put: async (endpoint, data) => {
    const res = await fetch(`${API_BASE}${endpoint}`, {
      method: 'PUT',
      headers: getHeaders(),
      body: JSON.stringify(data)
    });
    const text = await res.text();
    if (!res.ok) {
      let json;
      try {
        json = JSON.parse(text);
      } catch (e) {
        json = { message: text || res.statusText };
      }
      const error = new Error(json.message || 'Unknown error');
      error.responseData = json;
      throw error;
    }
    return text ? JSON.parse(text) : null;
  },

  delete: async (endpoint) => {
    const res = await fetch(`${API_BASE}${endpoint}`, {
      method: 'DELETE',
      headers: getHeaders()
    });
    const text = await res.text();
    if (!res.ok) {
      let json;
      try {
        json = JSON.parse(text);
      } catch (e) {
        json = { message: text || res.statusText };
      }
      const error = new Error(json.message || 'Unknown error');
      error.responseData = json;
      throw error;
    }
    return text ? JSON.parse(text) : null;
  }
};