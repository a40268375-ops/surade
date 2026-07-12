const BASE_URL = 'http://127.0.0.1:8000/api';

const api = {
  getHeaders() {
    const headers = {
      'Accept': 'application/json',
    };
    const token = localStorage.getItem('access_token');
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
    return headers;
  },

  async request(endpoint, options = {}) {
    const url = `${BASE_URL}/${endpoint.replace(/^\//, '')}`;
    const headers = { ...this.getHeaders(), ...options.headers };
    
    // If body is FormData, don't set Content-Type header manually (browser will set it with boundary)
    if (options.body && !(options.body instanceof FormData)) {
      headers['Content-Type'] = 'application/json';
      options.body = JSON.stringify(options.body);
    }

    const config = {
      ...options,
      headers,
    };

    let response;
    try {
      response = await fetch(url, config);
    } catch (networkErr) {
      // fetch() throws (not a normal HTTP error) when the request never
      // reaches the server at all: backend not running, wrong port, or
      // blocked by CORS. Surface that clearly instead of letting callers
      // fall back to a vague "something failed" message.
      throw {
        status: 0,
        data: null,
        isNetworkError: true,
        message: `Tidak dapat terhubung ke server (${BASE_URL}). Pastikan backend Laravel sedang berjalan (php artisan serve) dan CORS mengizinkan origin ini.`,
      };
    }

    if (response.status === 401) {
      localStorage.removeItem('access_token');
      localStorage.removeItem('user');
      window.dispatchEvent(new Event('auth-change'));
    }

    const data = await response.json().catch(() => null);

    if (!response.ok) {
      throw { status: response.status, data };
    }

    return data;
  },

  get(endpoint, options = {}) {
    return this.request(endpoint, { ...options, method: 'GET' });
  },

  post(endpoint, body, options = {}) {
    return this.request(endpoint, { ...options, method: 'POST', body });
  },

  put(endpoint, body, options = {}) {
    return this.request(endpoint, { ...options, method: 'PUT', body });
  },

  delete(endpoint, options = {}) {
    return this.request(endpoint, { ...options, method: 'DELETE' });
  }
};

export default api;
