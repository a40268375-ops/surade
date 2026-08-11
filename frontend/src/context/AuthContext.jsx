import { createContext, useContext, useState, useEffect } from "react";
import api from "../utils/api";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchProfile = async () => {
    try {
      const userData = await api.get("/profile");
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
    const token = localStorage.getItem("access_token");
    const cachedUser = localStorage.getItem("user");

    if (token) {
      if (cachedUser) {
        setUser(JSON.parse(cachedUser));
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
      const updatedToken = localStorage.getItem("access_token");
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
      
      localStorage.setItem("access_token", data.access_token);
      localStorage.setItem("user", JSON.stringify(data.user));
      setUser(data.user);
      
      // Dispatch auth change event to notify other components
      window.dispatchEvent(new Event("auth-change"));
      
      return data.user;
    } catch (error) {
      // Clean up any partial data on login failure
      logoutLocal();
      throw error;
    }
  };

  const register = async (name, email, password, referral_code = null) => {
    const data = await api.post("/register", { name, email, password, referral_code });
    localStorage.setItem("access_token", data.access_token);
    localStorage.setItem("user", JSON.stringify(data.user));
    setUser(data.user);
    return data.user;
  };

  const logoutLocal = () => {
    localStorage.removeItem("access_token");
    localStorage.removeItem("user");
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
    <AuthContext.Provider value={{ user, loading, login, register, logout, refreshUser: fetchProfile, isAdmin: user?.role === 'admin' }}>
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