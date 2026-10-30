import axios from "axios";
import { loadingManager } from "../utils/loadingManager";

const api = axios.create({
    baseURL: import.meta.env.VITE_API_URL || "https://surade.com/api",
    headers: {
        Accept: "application/json",
    },
});

let activeRequests = 0;

api.interceptors.request.use((config) => {
    const isBackground = config.silent || config.url?.includes("/notifications");
    if (!isBackground) {
        activeRequests++;
        loadingManager.start("network");
        if (activeRequests === 1 && typeof window !== "undefined") {
            window.dispatchEvent(new Event("app:loading-start"));
        }
    }

    const token = localStorage.getItem("token");

    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
});

api.interceptors.response.use(
    (response) => {
        const isBackground = response.config?.silent || response.config?.url?.includes("/notifications");
        if (!isBackground) {
            activeRequests = Math.max(0, activeRequests - 1);
            if (activeRequests === 0) {
                loadingManager.stop("network");
                if (typeof window !== "undefined") {
                    window.dispatchEvent(new Event("app:loading-stop"));
                }
            }
        }
        return response;
    },
    async (error) => {
        const config = error.config;
        const isBackground = config?.silent || config?.url?.includes("/notifications");
        if (!isBackground) {
            activeRequests = Math.max(0, activeRequests - 1);
            if (activeRequests === 0) {
                loadingManager.stop("network");
                if (typeof window !== "undefined") {
                    window.dispatchEvent(new Event("app:loading-stop"));
                }
            }
        }

        const isNetworkOrServerError =
            !error.response ||
            error.code === "ERR_NETWORK" ||
            error.code === "ECONNABORTED" ||
            error.message === "Network Error" ||
            (error.response && [502, 503, 504].includes(error.response.status));

        // Auto retry up to 2 times for transient network errors
        if (config && isNetworkOrServerError && (!config._retryCount || config._retryCount < 2)) {
            config._retryCount = (config._retryCount || 0) + 1;
            await new Promise((resolve) => setTimeout(resolve, 300 * config._retryCount));
            return api(config);
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