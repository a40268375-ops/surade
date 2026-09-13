import axios from "axios";

const api = axios.create({
    baseURL: import.meta.env.VITE_API_URL || "http://localhost:8000/api",
    headers: {
        Accept: "application/json",
    },
});

let activeRequests = 0;

api.interceptors.request.use((config) => {
    activeRequests++;
    if (activeRequests === 1 && typeof window !== "undefined") {
        window.dispatchEvent(new Event("app:loading-start"));
    }

    const token = localStorage.getItem("token");

    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
});

api.interceptors.response.use(
    (response) => {
        activeRequests = Math.max(0, activeRequests - 1);
        if (activeRequests === 0 && typeof window !== "undefined") {
            window.dispatchEvent(new Event("app:loading-stop"));
        }
        return response;
    },
    (error) => {
        activeRequests = Math.max(0, activeRequests - 1);
        if (activeRequests === 0 && typeof window !== "undefined") {
            window.dispatchEvent(new Event("app:loading-stop"));
        }
        if (error.response && error.response.status === 401) {
            const token = localStorage.getItem("token");
            if (token) {
                localStorage.removeItem("token");
                localStorage.removeItem("user");
                localStorage.removeItem("displayName");
                window.dispatchEvent(new Event("userAuthChanged"));
                
                // If on protected admin-user, admin-web, or profile routes, redirect to login
                if (
                    window.location.pathname.startsWith("/admin-") || 
                    window.location.pathname.startsWith("/admin") ||
                    window.location.pathname.startsWith("/profile")
                ) {
                    window.location.href = "/login";
                }
            }
        }
        return Promise.reject(error);
    }
);

export default api;