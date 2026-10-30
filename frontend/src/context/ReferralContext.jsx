import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import api from "../services/api";

const ReferralContext = createContext(null);

export const ReferralProvider = ({ children }) => {
  const [appliedReferral, setAppliedReferral] = useState(() => {
    try {
      // 1. Prioritaskan data user dari backend di localStorage
      const userStr = localStorage.getItem("user");
      if (userStr) {
        const u = JSON.parse(userStr);
        if (u?.applied_referral) {
          return u.applied_referral;
        }
      }
      // 2. Cache lokal sekunder
      const cached = localStorage.getItem("global_applied_referral");
      return cached ? JSON.parse(cached) : null;
    } catch (e) {
      return null;
    }
  });

  const [myOwnReferralCode, setMyOwnReferralCode] = useState(() => {
    try {
      const userStr = localStorage.getItem("user");
      if (userStr) {
        const u = JSON.parse(userStr);
        return u?.referral_code || null;
      }
    } catch (e) {}
    return null;
  });

  const [loading, setLoading] = useState(false);

  // Sync dari backend API sebagai Single Source of Truth
  const refreshReferral = useCallback(async () => {
    const token = localStorage.getItem("token");
    if (!token) {
      setAppliedReferral(null);
      setMyOwnReferralCode(null);
      localStorage.removeItem("global_applied_referral");
      return null;
    }

    try {
      setLoading(true);
      const res = await api.get("/referrals/applied");
      const data = res.data;

      if (data?.success && data?.is_bound && (data?.data || data?.referral)) {
        const boundInfo = data.data || data.referral;
        setAppliedReferral(boundInfo);
        localStorage.setItem("global_applied_referral", JSON.stringify(boundInfo));

        // Update juga user object di localStorage agar selalu konsisten
        try {
          const userStr = localStorage.getItem("user");
          if (userStr) {
            const u = JSON.parse(userStr);
            u.applied_referral = boundInfo;
            u.referred_by = boundInfo.referrer_id;
            u.referral_used = true;
            localStorage.setItem("user", JSON.stringify(u));
          }
        } catch (_) {}

        return boundInfo;
      } else {
        // Jika belum terikat di database
        setAppliedReferral(null);
        localStorage.removeItem("global_applied_referral");
        return null;
      }
    } catch (err) {
      console.warn("Gagal menyinkronkan data referral global dari server:", err);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  // Update referral dari event atau perubahan user
  useEffect(() => {
    const handleSync = () => {
      try {
        const userStr = localStorage.getItem("user");
        if (userStr) {
          const u = JSON.parse(userStr);
          if (u?.referral_code) {
            setMyOwnReferralCode(u.referral_code);
          }
          if (u?.applied_referral) {
            setAppliedReferral(u.applied_referral);
          }
        }
      } catch (_) {}
      refreshReferral();
    };

    handleSync();

    window.addEventListener("auth-change", handleSync);
    window.addEventListener("referral-updated", handleSync);
    window.addEventListener("storage", handleSync);

    return () => {
      window.removeEventListener("auth-change", handleSync);
      window.removeEventListener("referral-updated", handleSync);
      window.removeEventListener("storage", handleSync);
    };
  }, [refreshReferral]);

  // Fungsi untuk menerapkan kode referral dan langsung menguncinya ke database
  const applyReferralCode = async (rawCode, serviceType = "general", amount = 35000) => {
    const code = (rawCode || "").trim().toUpperCase();
    if (!code) {
      return { success: false, message: "Kode referral tidak boleh kosong." };
    }

    const token = localStorage.getItem("token");
    if (!token) {
      return { success: false, message: "Silakan login terlebih dahulu untuk menggunakan kode referral." };
    }

    try {
      setLoading(true);
      const res = await api.post("/referrals/apply-global", {
        code,
        service_type: serviceType,
        amount,
      });

      const resData = res.data;
      if (resData?.success) {
        const boundInfo = resData.data || resData.referral;
        setAppliedReferral(boundInfo);
        localStorage.setItem("global_applied_referral", JSON.stringify(boundInfo));

        // Update user di localStorage
        try {
          const userStr = localStorage.getItem("user");
          if (userStr) {
            const u = JSON.parse(userStr);
            u.applied_referral = boundInfo;
            u.referred_by = boundInfo.referrer_id;
            u.referral_used = true;
            localStorage.setItem("user", JSON.stringify(u));
          }
        } catch (_) {}

        // Pancarkan event agar komponen lain langsung update
        window.dispatchEvent(new CustomEvent("referral-updated", { detail: boundInfo }));
        window.dispatchEvent(new CustomEvent("referral:applied", { detail: boundInfo }));

        return {
          success: true,
          data: boundInfo,
          message: resData.message || "Kode referral berhasil diterapkan dan terhubung ke akun Anda!",
        };
      }

      return {
        success: false,
        message: resData?.message || "Gagal menerapkan kode referral.",
      };
    } catch (err) {
      const errMsg = err.response?.data?.message || err.message || "Kode referral tidak valid atau gagal diterapkan.";
      return {
        success: false,
        message: errMsg,
      };
    } finally {
      setLoading(false);
    }
  };

  const isBound = Boolean(appliedReferral?.is_bound || appliedReferral?.code || appliedReferral?.referral_code);

  return (
    <ReferralContext.Provider
      value={{
        appliedReferral,
        isBound,
        myOwnReferralCode,
        loading,
        applyReferralCode,
        refreshReferral,
      }}
    >
      {children}
    </ReferralContext.Provider>
  );
};

export const useGlobalReferral = () => {
  const context = useContext(ReferralContext);
  if (!context) {
    // Fallback jika komponen dipanggil di luar Provider agar tidak crash
    let fallbackApplied = null;
    let fallbackOwnCode = null;
    try {
      const userStr = localStorage.getItem("user");
      if (userStr) {
        const u = JSON.parse(userStr);
        fallbackApplied = u?.applied_referral || null;
        fallbackOwnCode = u?.referral_code || null;
      }
      if (!fallbackApplied) {
        const cached = localStorage.getItem("global_applied_referral");
        if (cached) fallbackApplied = JSON.parse(cached);
      }
    } catch (_) {}

    return {
      appliedReferral: fallbackApplied,
      isBound: Boolean(fallbackApplied?.is_bound || fallbackApplied?.code || fallbackApplied?.referral_code),
      myOwnReferralCode: fallbackOwnCode,
      loading: false,
      applyReferralCode: async () => ({ success: false, message: "ReferralProvider not mounted." }),
      refreshReferral: async () => fallbackApplied,
    };
  }
  return context;
};

export default ReferralContext;

