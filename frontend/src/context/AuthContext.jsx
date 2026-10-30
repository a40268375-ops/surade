import { createContext, useContext, useState, useEffect } from "react";
import api from "../utils/api";
import { sendOfflineSignal } from "../utils/userPresence";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const unwrapUser = (res) => {
    if (!res || typeof res !== "object") return null;
    if (res.data && typeof res.data === "object" && (res.data.role || res.data.email || res.data.id)) {
      return res.data;
    }
    if (res.user && typeof res.user === "object" && (res.user.role || res.user.email || res.user.id)) {
      return res.user;
    }
    return res;
  };

  const fetchProfile = async () => {
    try {
      const res = await api.get("/profile");
      const userData = unwrapUser(res);
      setUser(userData);
      localStorage.setItem("user", JSON.stringify(userData));
    } catch (err) {
      console.warn("Failed to fetch user profile:", err);
      // Only logout if it's an authentication error, not a network error
      if (err?.status === 401 || err?.status === 403) {
        logoutLocal();
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const token = localStorage.getItem("token");
    const cachedUser = localStorage.getItem("user");

    if (token) {
      if (cachedUser) {
        try {
          const parsed = JSON.parse(cachedUser);
          const unwrapped = unwrapUser(parsed);
          setUser(unwrapped);
          if (parsed?.data?.role || parsed?.user?.role) {
            localStorage.setItem("user", JSON.stringify(unwrapped));
          }
        } catch {
          setUser(null);
        }
        setLoading(false);
        // Refresh profile in background
        fetchProfile();
      } else {
        fetchProfile();
      }
    } else {
      setLoading(false);
    }

    const handleAuthChange = () => {
      const updatedToken = localStorage.getItem("token");
      if (!updatedToken) {
        setUser(null);
      } else {
        fetchProfile();
      }
    };

    window.addEventListener("auth-change", handleAuthChange);
    return () => window.removeEventListener("auth-change", handleAuthChange);
  }, []);

  const login = async (email, password) => {
    try {
      const data = await api.post("/login", { email, password });
      
      // Ensure we have valid response data
      if (!data.access_token || !data.user) {
        throw new Error("Invalid login response");
      }
      
      localStorage.setItem("token", data.access_token);
      const userObj = unwrapUser(data.user) || data.user;
      localStorage.setItem("user", JSON.stringify(userObj));
      if (data.user.role === 'user' && (!data.user.businesses || data.user.businesses.length === 0)) {
        localStorage.removeItem('is_seller');
        localStorage.removeItem('user_mode');
        localStorage.removeItem('dashboard_mode');
        localStorage.removeItem('is_seller_mode');
      }
      setUser(userObj);
      
      // Dispatch auth change event to notify other components
      window.dispatchEvent(new Event("auth-change"));
      
      return data.user;
    } catch (error) {
      // Clean up any partial data on login failure
      logoutLocal();
      throw error;
    }
  };

  const setAuth = (authData) => {
    if (authData.token && authData.user) {
      localStorage.setItem("token", authData.token);
      const userObj = unwrapUser(authData.user) || authData.user;
      localStorage.setItem("user", JSON.stringify(userObj));
      if (authData.user.role === 'user' && authData.user.account_type !== 'business' && (!authData.user.businesses || authData.user.businesses.length === 0)) {
        localStorage.removeItem('is_seller');
        localStorage.removeItem('user_mode');
        localStorage.removeItem('dashboard_mode');
        localStorage.removeItem('is_seller_mode');
        localStorage.removeItem('cached_my_businesses');
      }
      setUser(userObj);
      
      // Dispatch auth change event to notify other components
      window.dispatchEvent(new Event("auth-change"));
    }
  };

  const register = async (name, email, password, referral_code = null) => {
    const data = await api.post("/register", { name, email, password, referral_code });
    
    // For register with OTP, we don't store auth yet - wait for verification
    return data;
  };

  const logoutLocal = () => {
    try {
      sendOfflineSignal();
    } catch (_) {}
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    localStorage.removeItem("is_seller");
    localStorage.removeItem("user_mode");
    localStorage.removeItem("dashboard_mode");
    localStorage.removeItem("is_seller_mode");
    localStorage.removeItem("cached_my_businesses");
    localStorage.removeItem("displayName");
    setUser(null);
  };

  const logout = async () => {
    try {
      await api.post("/logout");
    } catch (err) {
      // Ignore network error on logout
    } finally {
      logoutLocal();
    }
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout, setAuth, refreshUser: fetchProfile, isAdmin: user?.role === 'admin' }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}