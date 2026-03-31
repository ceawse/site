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
      let message;
      try {
        const json = JSON.parse(text);
        message = json.message || JSON.stringify(json);
      } catch (e) {
        message = text || res.statusText;
      }
      throw new Error(message);
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
      let message;
      try {
        const json = JSON.parse(text);
        message = json.message || JSON.stringify(json);
      } catch (e) {
        message = text || res.statusText;
      }
      throw new Error(message);
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
      let message;
      try {
        const json = JSON.parse(text);
        message = json.message || JSON.stringify(json);
      } catch (e) {
        message = text || res.statusText;
      }
      throw new Error(message);
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
      let message;
      try {
        const json = JSON.parse(text);
        message = json.message || JSON.stringify(json);
      } catch (e) {
        message = text || res.statusText;
      }
      throw new Error(message);
    }
    return text ? JSON.parse(text) : null;
  }
};
