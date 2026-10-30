import React, { useEffect, useRef } from "react";
import toast from "react-hot-toast";
import api from "../services/api";
import suradeCoinImg from "../assets/surade-coin.png";

export function useGlobalNotifications() {
  const isPollingRef = useRef(false);

  useEffect(() => {
    const checkNotifications = async () => {
      const token = localStorage.getItem("token");
      if (!token || isPollingRef.current) return;

      isPollingRef.current = true;
      try {
        const res = await api.get("/notifications", { silent: true });
        const list = res.data?.data || res.data?.notifications || [];
        if (!Array.isArray(list) || list.length === 0) return;

        const globalToasted = JSON.parse(sessionStorage.getItem("user_toasted_global_notif_ids") || "[]");
        const coinToasted = JSON.parse(sessionStorage.getItem("user_toasted_coin_ids") || "[]");
        const toastedIds = Array.from(new Set([...globalToasted, ...coinToasted]));
        const readIds = JSON.parse(localStorage.getItem("user_read_notif_ids") || "[]");

        const markAsToasted = (id) => {
          toastedIds.push(id);
          sessionStorage.setItem("user_toasted_global_notif_ids", JSON.stringify(toastedIds));
          sessionStorage.setItem("user_toasted_coin_ids", JSON.stringify(toastedIds));
        };

        // 1. Notifikasi Verifikasi Akses WhatsApp (Dikhususkan untuk User yang Mengakses pakai QRIS)
        const waApprovedNotif = list.find((n) =>
          (n.type === "whatsapp_access_approved" || String(n.title).toLowerCase().includes("akses whatsapp")) &&
          !n.is_read &&
          !readIds.includes(n.id) &&
          !toastedIds.includes(n.id)
        );

        if (waApprovedNotif) {
          markAsToasted(waApprovedNotif.id);

          const bizName = waApprovedNotif.data?.business_name || "Usaha";
          const bizId = waApprovedNotif.data?.business_id;

          toast(
            (t) => (
              <div style={{ display: "flex", flexDirection: "column", gap: "8px", padding: "4px 2px" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "8px", fontWeight: "800", fontSize: "0.92rem", color: "#065f46" }}>
                  <span style={{ fontSize: "1.2rem" }}>🎉</span>
                  <span>Akses WhatsApp Berhasil Diverifikasi!</span>
                </div>
                <p style={{ margin: 0, fontSize: "0.82rem", color: "#334155", lineHeight: "1.45" }}>
                  {waApprovedNotif.message || `Pembayaran QRIS Anda telah diverifikasi oleh admin. Anda sudah bisa mengakses nomor WhatsApp ${bizName} sekarang!`}
                </p>
                <div style={{ display: "flex", gap: "8px", marginTop: "4px" }}>
                  {bizId && (
                    <button
                      onClick={() => {
                        toast.dismiss(t.id);
                        window.location.href = `/business/${bizId}`;
                      }}
                      style={{
                        padding: "6px 12px",
                        backgroundColor: "#007570",
                        color: "#ffffff",
                        border: "none",
                        borderRadius: "8px",
                        fontSize: "0.78rem",
                        fontWeight: "700",
                        cursor: "pointer",
                      }}
                    >
                      Buka Halaman Usaha
                    </button>
                  )}
                  <button
                    onClick={() => toast.dismiss(t.id)}
                    style={{
                      padding: "6px 12px",
                      backgroundColor: "#f1f5f9",
                      color: "#475569",
                      border: "none",
                      borderRadius: "8px",
                      fontSize: "0.78rem",
                      fontWeight: "600",
                      cursor: "pointer",
                    }}
                  >
                    Tutup
                  </button>
                </div>
              </div>
            ),
            {
              duration: 12000,
              style: {
                borderRadius: "16px",
                background: "#ffffff",
                boxShadow: "0 12px 36px rgba(0, 0, 0, 0.18)",
                border: "2px solid #10b981",
                maxWidth: "460px",
                padding: "14px 18px",
              },
            }
          );

          window.dispatchEvent(
            new CustomEvent("whatsapp-access-approved", { detail: waApprovedNotif })
          );
        }

        // 2. Notifikasi Reward +1 Poin untuk Pemilik Usaha
        const waRewardNotif = list.find((n) =>
          (n.type === "whatsapp_lead_reward" || String(n.title).toLowerCase().includes("poin akses whatsapp")) &&
          !n.is_read &&
          !readIds.includes(n.id) &&
          !toastedIds.includes(n.id)
        );

        if (waRewardNotif) {
          markAsToasted(waRewardNotif.id);

          toast.success(
            waRewardNotif.message || "Selamat! Anda mendapatkan +1 Poin karena ada pengunjung mengakses kontak WhatsApp usaha Anda.",
            {
              duration: 9000,
              icon: (
                <img
                  src={suradeCoinImg}
                  alt="Surade Coin"
                  style={{
                    width: "32px",
                    height: "32px",
                    minWidth: "32px",
                    objectFit: "contain",
                    filter: "drop-shadow(0 2px 4px rgba(245, 158, 11, 0.4))",
                  }}
                />
              ),
              style: {
                borderRadius: "16px",
                background: "#ffffff",
                border: "2px solid #f59e0b",
                fontSize: "0.88rem",
                fontWeight: "600",
                color: "#1e293b",
                boxShadow: "0 10px 25px -5px rgba(245, 158, 11, 0.2), 0 8px 10px -6px rgba(0, 0, 0, 0.1)",
                padding: "12px 18px",
              },
            }
          );

          window.dispatchEvent(new CustomEvent("poin-balance-updated"));
        }
      } catch (e) {
        // silent error on background poll
      } finally {
        isPollingRef.current = false;
      }
    };

    checkNotifications();
    const interval = setInterval(checkNotifications, 6000);
    return () => clearInterval(interval);
  }, []);
}
