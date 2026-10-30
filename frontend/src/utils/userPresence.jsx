import React, { useEffect } from "react";

/**
 * userPresence.jsx
 *
 * Sistem Pelacak & Penampil Status Kehadiran (Online / Offline) Real-Time & Fungsional
 * Berfungsi di seluruh platform:
 * - Tabel Kelola User Admin Web
 * - Chat / Pesan WhatsApp (Daftar Obrolan & Header Chat)
 * - Avatar Profil Pengguna
 */

/**
 * Dapatkan URL API aktif
 */
export function getPresenceApiUrl() {
  const envUrl = import.meta.env?.VITE_API_URL;
  if (envUrl) return envUrl.replace("localhost", "127.0.0.1");
  if (typeof window !== "undefined" && (window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1")) {
    return "http://127.0.0.1:8000/api";
  }
  return "https://surade.com/api";
}

/**
 * Format string waktu terakhir aktif / last seen yang ramah dibaca
 */
export function formatLastSeen(dateStr) {
  if (!dateStr) return "Offline";
  try {
    const date = new Date(dateStr);
    if (isNaN(date.getTime())) return "Offline";
    
    const diffMs = Date.now() - date.getTime();
    const diffSeconds = Math.floor(diffMs / 1000);
    const diffMinutes = Math.floor(diffSeconds / 60);

    if (diffSeconds < 60) return "Baru saja";
    if (diffMinutes < 60) return `${diffMinutes} menit lalu`;
    
    const diffHours = Math.floor(diffMinutes / 60);
    if (diffHours < 24) return `${diffHours} jam lalu`;

    const diffDays = Math.floor(diffHours / 24);
    if (diffDays === 1) return "Kemarin";
    if (diffDays < 7) return `${diffDays} hari lalu`;

    return date.toLocaleDateString("id-ID", { day: "numeric", month: "short" });
  } catch (e) {
    return "Offline";
  }
}

/**
 * Cek apakah seorang user sedang online atau offline secara riil & presisi
 * @param {Object} user Data user
 * @returns {{ isOnline: boolean, label: string, color: string, lastSeenText: string }}
 */
export function getUserPresence(user) {
  if (!user) {
    return { isOnline: false, label: "Offline", color: "#94a3b8", lastSeenText: "Offline" };
  }

  // 1. Dapatkan user yang sedang login saat ini di browser (Current Authenticated User)
  let currentAuthUser = null;
  try {
    const raw = typeof window !== "undefined" ? localStorage.getItem("user") : null;
    if (raw) currentAuthUser = JSON.parse(raw);
  } catch (e) {
    // Ignore JSON parse error
  }

  const userId = user.id || user.user_id;

  // Jika ini adalah akun kita sendiri yang sedang aktif di browser ini -> PASTI ONLINE
  if (
    currentAuthUser &&
    ((currentAuthUser.id && userId && String(currentAuthUser.id) === String(userId)) ||
      (currentAuthUser.email && user.email && currentAuthUser.email.toLowerCase() === user.email.toLowerCase()))
  ) {
    return { isOnline: true, label: "Online", color: "#10b981", lastSeenText: "Online sekarang" };
  }

  // 2. Cek explicit field is_online dari backend
  const hasExplicitOnline = user.is_online === true || user.online === true || user.is_online === 1 || user.is_online === "1";
  const lastActiveTime = user.last_seen_at || user.last_active_at;

  if (hasExplicitOnline) {
    return { isOnline: true, label: "Online", color: "#10b981", lastSeenText: "Online sekarang" };
  }

  // 3. Jika is_online belum di-set, periksa apakah ada aktivitas dalam 3 menit (180 detik)
  if (lastActiveTime) {
    try {
      const parsedDate = new Date(lastActiveTime);
      if (!isNaN(parsedDate.getTime())) {
        const diffMs = Date.now() - parsedDate.getTime();
        const diffSeconds = Math.floor(diffMs / 1000);
        if (diffSeconds >= 0 && diffSeconds <= 180) {
          return {
            isOnline: true,
            label: "Online",
            color: "#10b981",
            lastSeenText: "Online sekarang",
          };
        }
      }
    } catch (_) {}

    return {
      isOnline: false,
      label: "Offline",
      color: "#94a3b8",
      lastSeenText: `Terakhir aktif ${formatLastSeen(lastActiveTime)}`,
    };
  }

  // 4. Default: User lain yang tidak aktif berstatus Offline
  return { isOnline: false, label: "Offline", color: "#94a3b8", lastSeenText: "Offline" };
}

/**
 * Kirim sinyal offline segera ke server (dipakai saat logout atau close tab)
 */
export function sendOfflineSignal() {
  if (typeof window === "undefined") return;
  const token = localStorage.getItem("token");
  let user = null;
  try {
    const raw = localStorage.getItem("user");
    if (raw) user = JSON.parse(raw);
  } catch (e) {}

  if (!token && !user?.id) return;

  const apiUrl = getPresenceApiUrl();
  const payload = JSON.stringify({ user_id: user?.id, token });
  const offlineUrl = `${apiUrl}/presence/offline`;

  try {
    // Gunakan text/plain agar sendBeacon tidak memicu CORS preflight OPTIONS dan langsung terkirim saat tab ditutup
    if (navigator.sendBeacon) {
      const blob = new Blob([payload], { type: "text/plain" });
      navigator.sendBeacon(offlineUrl, blob);
    }
    fetch(offlineUrl, {
      method: "POST",
      headers: {
        "Content-Type": "text/plain",
        ...(token ? { "Authorization": `Bearer ${token}` } : {})
      },
      body: payload,
      keepalive: true
    }).catch(() => {});
  } catch (e) {
    // Ignore error
  }
}

/**
 * Hook global pelacak detak jantung (presence heartbeat)
 * Menjaga user tetap "Online" selama membuka situs & aktif di tab,
 * dan langsung "Offline" saat keluar/menutup browser/tab.
 */
export function usePresenceHeartbeat() {
  useEffect(() => {
    if (typeof window === "undefined") return;

    const apiUrl = getPresenceApiUrl();

    const sendPing = async () => {
      const token = localStorage.getItem("token");
      if (!token) return;

      try {
        await fetch(`${apiUrl}/presence/ping`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Accept": "application/json",
            "Authorization": `Bearer ${token}`
          }
        });
      } catch (e) {
        // Ignore network errors
      }
    };

    // 1. Kirim ping pertama saat komponen dimuat
    sendPing();

    // 2. Detak jantung rutin setiap 15 detik selama tab terbuka
    const interval = setInterval(sendPing, 15000);

    // 3. Kirim ping instan saat tab kembali dibuka/difokuskan oleh pengguna
    const handleVisibilityChange = () => {
      if (!document.hidden) {
        sendPing();
      }
    };
    document.addEventListener("visibilitychange", handleVisibilityChange);

    // 4. Kirim sinyal offline segera saat tab/window benar-benar ditutup
    const handleUnload = () => {
      sendOfflineSignal();
    };

    window.addEventListener("beforeunload", handleUnload);
    window.addEventListener("pagehide", handleUnload);

    return () => {
      clearInterval(interval);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      window.removeEventListener("beforeunload", handleUnload);
      window.removeEventListener("pagehide", handleUnload);
    };
  }, []);
}



/**
 * Komponen titik status kehadiran (Online Green Pulse / Offline Gray)
 */
export function OnlineIndicator({
  isOnline = false,
  size = "sm",
  showText = false,
  className = "",
}) {
  const dotSizes = {
    xs: "w-2 h-2",
    sm: "w-2.5 h-2.5",
    md: "w-3 h-3",
    lg: "w-3.5 h-3.5",
  };

  const dotClass = dotSizes[size] || dotSizes.sm;

  return (
    <span
      className={`inline-flex items-center gap-1.5 select-none ${className}`}
      title={isOnline ? "Sedang Online" : "Sedang Offline"}
    >
      <span className="relative flex items-center justify-center shrink-0">
        {isOnline && (
          <span
            className="absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75 animate-ping"
          />
        )}
        <span
          className={`relative inline-block rounded-full ${dotClass} ${
            isOnline
              ? "bg-emerald-500 ring-2 ring-white shadow-xs"
              : "bg-slate-300 ring-1 ring-white"
          }`}
        />
      </span>

      {showText && (
        <span
          className={`text-[11px] font-semibold tracking-tight ${
            isOnline ? "text-emerald-700" : "text-slate-500"
          }`}
        >
          {isOnline ? "Online" : "Offline"}
        </span>
      )}
    </span>
  );
}

export default getUserPresence;
