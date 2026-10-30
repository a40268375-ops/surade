const BASE_URL = import.meta.env.VITE_API_URL || 'https://surade.com/api';
const SERVER_ORIGIN = BASE_URL.replace(/\/api\/?$/, '');

// Business/category images are stored on the Laravel backend and come back
// as relative paths like "/storage/businesses/xxx.jpg". Since the frontend
// (Vite, port 5173) and backend (Laravel, port 8000) run on different
// origins in development, a relative path resolves against the WRONG
// origin unless we prefix it with the backend's own origin here.
export function getImageUrl(path) {
  if (!path) return '';
  if (/^https?:\/\//i.test(path) || path.startsWith('data:') || path.startsWith('blob:')) {
    return path; // already an absolute/external URL, e.g. an Unsplash fallback or local preview blob
  }
  return `${SERVER_ORIGIN}${path.startsWith('/') ? '' : '/'}${path}`;
}

// In-memory cache for fast client-side navigation
const apiCache = new Map();
const inFlightRequests = new Map();

export function clearApiCache(pattern) {
  if (!pattern) {
    apiCache.clear();
    return;
  }
  for (const key of apiCache.keys()) {
    if (key.includes(pattern)) {
      apiCache.delete(key);
    }
  }
}

const api = {
  getHeaders() {
    const headers = {
      'Accept': 'application/json',
    };
    const token = localStorage.getItem('token');
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
    return headers;
  },

  async request(endpoint, options = {}) {
    const cleanEndpoint = endpoint.replace(/^\//, '');
    const url = `${BASE_URL}/${cleanEndpoint}`;
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
      throw {
        status: 0,
        data: null,
        isNetworkError: true,
        message: `Tidak dapat terhubung ke server (${BASE_URL}). Pastikan backend Laravel sedang berjalan (php artisan serve) dan CORS mengizinkan origin ini.`,
      };
    }

    if (response.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      apiCache.clear();
      window.dispatchEvent(new Event('auth-change'));
    }

    const data = await response.json().catch(() => null);

    if (!response.ok) {
      throw { status: response.status, data };
    }

    return data;
  },

  get(endpoint, options = {}) {
    const { bypassCache = false, cacheTtl = 60000, ...fetchOptions } = options;
    const cleanEndpoint = endpoint.replace(/^\//, '');
    const cacheKey = `${cleanEndpoint}_${Boolean(localStorage.getItem('token'))}`;

    // Return cached result if available and fresh
    if (!bypassCache) {
      const cached = apiCache.get(cacheKey);
      if (cached && (Date.now() - cached.timestamp < cacheTtl)) {
        return Promise.resolve(cached.data);
      }
    }

    // Deduplicate in-flight requests
    if (inFlightRequests.has(cacheKey)) {
      return inFlightRequests.get(cacheKey);
    }

    const promise = this.request(endpoint, { ...fetchOptions, method: 'GET' })
      .then((data) => {
        if (!bypassCache) {
          apiCache.set(cacheKey, { data, timestamp: Date.now() });
        }
        return data;
      })
      .finally(() => {
        inFlightRequests.delete(cacheKey);
      });

    inFlightRequests.set(cacheKey, promise);
    return promise;
  },

  post(endpoint, body, options = {}) {
    clearApiCache();
    return this.request(endpoint, { ...options, method: 'POST', body });
  },

  put(endpoint, body, options = {}) {
    clearApiCache();
    if (body instanceof FormData) {
      body.append('_method', 'PUT');
      return this.request(endpoint, { ...options, method: 'POST', body });
    }
    return this.request(endpoint, { ...options, method: 'PUT', body });
  },

  delete(endpoint, options = {}) {
    clearApiCache();
    return this.request(endpoint, { ...options, method: 'DELETE' });
  }
};

export default api;