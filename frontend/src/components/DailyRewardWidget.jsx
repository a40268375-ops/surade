import React, { useState, useEffect } from "react";
import axios from "axios";
import toast from "react-hot-toast";
import {
  Sparkles,
  Calendar,
  CheckCircle2,
  Clock,
  Flame,
  Gift,
  Loader2,
  Lock,
  ChevronRight,
  Award,
  Zap,
  TrendingUp,
  X
} from "lucide-react";
import SuradeCoinIcon from "./SuradeCoinIcon";

const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:8000/api";

export default function DailyRewardWidget({ onRewardClaimed }) {
  const [loading, setLoading] = useState(true);
  const [claiming, setClaiming] = useState(false);
  const [rewardData, setRewardData] = useState(null);
  const [claimSuccessModal, setClaimSuccessModal] = useState(null);

  const fetchRewardStatus = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        setLoading(false);
        return;
      }
      const res = await axios.get(`${API_BASE}/coins/daily-reward/status`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.data?.success) {
        setRewardData(res.data.data || res.data);
      }
    } catch (err) {
      console.error("Failed to load daily reward status:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRewardStatus();
  }, []);

  const handleClaimReward = async () => {
    if (claiming) return;
    setClaiming(true);
    try {
      const token = localStorage.getItem("token");
      const res = await axios.post(
        `${API_BASE}/coins/daily-reward/claim`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (res.data?.success) {
        const rewardPts = res.data.reward_points || 1;
        const streakNow = res.data.streak || 1;
        const cycleLabel = res.data.cycle_label || `Hari-${((streakNow - 1) % 7) + 1}`;

        toast.success(res.data.message || `Selamat! +${rewardPts} Poin Silver berhasil diklaim!`, {
          duration: 4500,
          icon: "🎉",
        });

        setClaimSuccessModal({
          reward_points: rewardPts,
          streak: streakNow,
          cycle_label: cycleLabel,
          new_silver_balance: res.data.new_silver_balance,
        });

        // Trigger balance update event across application
        window.dispatchEvent(
          new CustomEvent("poin-balance-updated", {
            detail: {
              silver_balance: res.data.new_silver_balance,
              balance: res.data.new_total_balance,
            },
          })
        );

        if (onRewardClaimed) {
          onRewardClaimed(res.data);
        }

        // Refresh status setelah modal ditutup (delay agar modal terlihat dulu)
        setTimeout(() => {
          fetchRewardStatus();
        }, 800);
      } else {
        toast.error(res.data?.message || "Gagal mengklaim reward hari ini.");
      }
    } catch (err) {
      toast.error(err.response?.data?.message || "Terjadi kesalahan saat mengklaim reward harian.");
    } finally {
      setClaiming(false);
    }
  };

  if (loading) {
    return (
      <div className="bg-slate-900/90 rounded-3xl p-6 border border-emerald-500/30 shadow-xl flex items-center justify-center min-h-[160px]">
        <div className="flex items-center gap-2.5 text-emerald-400 text-xs font-bold animate-pulse">
          <Loader2 size={18} className="animate-spin text-emerald-400" />
          <span>Memuat Absensi &amp; Reward Harian...</span>
        </div>
      </div>
    );
  }

  if (!rewardData) return null;

  const { can_claim, claimed_today, today_reward, current_streak, calendar, today_day_name } = rewardData;

  return (
    <div className="relative rounded-2xl bg-gradient-to-br from-[#021814] via-[#052b22] to-[#01140f] text-white p-3.5 sm:p-5 shadow-[0_12px_35px_rgba(2,24,20,0.5)] border border-emerald-500/30 overflow-hidden text-left font-['Poppins',sans-serif]">
      {/* Background ambient subtle lighting */}
      <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none -mr-16 -mt-16" />
      <div className="absolute bottom-0 left-0 w-64 h-64 bg-amber-400/10 rounded-full blur-3xl pointer-events-none -ml-16 -mb-16" />

      <div className="relative z-10 space-y-3.5">
        {/* Top Header Row: Compact Title & Streak Badge */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-500/20 border border-emerald-400/30 text-emerald-300 text-[10.5px] font-bold">
              <Sparkles size={11} className="text-emerald-300" />
              <span>Absensi Harian</span>
            </span>
            <h3 className="text-sm sm:text-base font-black tracking-tight flex items-center gap-1.5 text-white">
              <span>Reward Poin Silver Harian</span>
              <SuradeCoinIcon size={18} type="silver" />
            </h3>
          </div>

          {/* Compact Streak Pill */}
          <div className="inline-flex items-center gap-2 bg-black/40 backdrop-blur-md px-3 py-1.5 rounded-xl border border-amber-400/40 shadow-xs self-start sm:self-auto">
            <Flame size={16} className="fill-amber-400 text-amber-400 animate-pulse shrink-0" />
            <div className="text-xs">
              <span className="text-[10px] text-slate-300 font-semibold mr-1.5">Streak:</span>
              <strong className="text-amber-300 font-black">{current_streak || 0} Hari Berturut-turut</strong>
            </div>
          </div>
        </div>

        {/* 7 Days Reward Cards Grid (Hari-1 sampai Hari-7) */}
        <div className="grid grid-cols-7 gap-1 sm:gap-2 pt-0.5">
          {calendar &&
            calendar.map((item, idx) => {
              const isToday = item.status === "today";
              const isClaimed = item.status === "claimed" || (isToday && claimed_today);
              const isActiveToday = isToday && !claimed_today;

              return (
                <div
                  key={idx}
                  className={`relative rounded-xl p-1.5 sm:p-2 text-center flex flex-col items-center justify-between transition-all duration-200 ${
                    isClaimed
                      ? "bg-emerald-950/40 border border-emerald-500/40"
                      : isActiveToday
                      ? "bg-gradient-to-b from-amber-400/20 via-emerald-600/20 to-teal-900/35 border border-amber-400 shadow-[0_0_20px_rgba(245,158,11,0.25)] ring-1 ring-amber-400/50"
                      : "bg-white/[0.04] border border-white/10 hover:border-white/20"
                  }`}
                >
                  {/* Today Ribbon Badge - KLAIM */}
                  {isActiveToday && (
                    <div className="absolute -top-2 left-1/2 -translate-x-1/2 px-1.5 py-0.2 rounded-full bg-amber-400 text-slate-950 text-[8px] font-black uppercase tracking-wider shadow-xs whitespace-nowrap animate-pulse">
                      KLAIM
                    </div>
                  )}

                  {/* Day Label (Hari-1 s/d Hari-7) */}
                  <span className={`text-[8.5px] sm:text-[10px] font-black mt-0.5 tracking-tight whitespace-nowrap ${
                    isActiveToday ? "text-amber-300 font-black" : isClaimed ? "text-emerald-300 font-black" : "text-slate-400 font-bold"
                  }`}>
                    {item.label || item.day_name || `Hari-${item.cycle_day}`}
                  </span>

                  {/* Coin or Checkmark Icon */}
                  <div className="my-1 flex items-center justify-center">
                    {isClaimed ? (
                      <div className="w-6 h-6 rounded-lg bg-emerald-500/20 border border-emerald-400/50 flex items-center justify-center text-emerald-300">
                        <CheckCircle2 size={14} strokeWidth={2.5} />
                      </div>
                    ) : (
                      <SuradeCoinIcon
                        size={isActiveToday ? 24 : 18}
                        type="silver"
                        animate={isActiveToday}
                      />
                    )}
                  </div>

                  {/* Reward Amount */}
                  <div className="leading-none mb-1">
                    <span className={`text-xs sm:text-sm font-black ${
                      isClaimed ? "text-emerald-300" : isActiveToday ? "text-amber-300 font-extrabold" : "text-slate-200"
                    }`}>
                      +{item.reward}
                    </span>
                    <span className="text-[8px] text-slate-400 block -mt-0.5">Silver</span>
                  </div>

                  {/* Status Indicator Badge (KLAIM / SELESAI / TERKUNCI) */}
                  <div className="w-full">
                    {isClaimed ? (
                      <span className="text-[8px] font-bold text-emerald-300 bg-emerald-950/70 border border-emerald-500/30 py-0.5 rounded flex items-center justify-center gap-0.5 uppercase tracking-wide">
                        <CheckCircle2 size={8} strokeWidth={2.5} className="text-emerald-400" />
                        <span>SELESAI</span>
                      </span>
                    ) : isActiveToday ? (
                      <span className="text-[8px] font-black py-0.5 rounded block bg-amber-400 text-slate-950 animate-pulse font-extrabold uppercase tracking-wide shadow-xs">
                        KLAIM
                      </span>
                    ) : (
                      <span className="text-[8px] font-medium text-slate-400 bg-white/5 py-0.5 rounded flex items-center justify-center gap-0.5 uppercase tracking-wider">
                        <Lock size={7} className="text-slate-500" />
                        <span>TERKUNCI</span>
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
        </div>

        {/* Claim Bar & Daily Info Row */}
        <div className="pt-2 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 border-t border-emerald-500/20">
          <div className="flex items-center gap-2 text-xs text-slate-300">
            <div className="w-6 h-6 rounded-lg bg-emerald-500/20 border border-emerald-400/30 flex items-center justify-center text-emerald-300 shrink-0">
              <Calendar size={13} />
            </div>
            <span className="text-[11.5px]">
              Hari ini: <strong className="text-white font-bold">{today_day_name || `Hari-${rewardData.active_cycle_day || 1}`}</strong> • Reward: <strong className="text-amber-300 font-black">+{today_reward} Poin Silver</strong>
            </span>
          </div>

          <div>
            {claimed_today ? (
              <div className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-950/60 border border-emerald-400/40 text-emerald-300 text-xs font-bold shadow-inner">
                <CheckCircle2 size={15} className="text-emerald-400" />
                <span>Sudah Diklaim Hari Ini ✓ Hadir Lagi Besok!</span>
              </div>
            ) : (
              <button
                type="button"
                onClick={handleClaimReward}
                disabled={claiming || !can_claim}
                className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-gradient-to-r from-amber-400 via-amber-500 to-amber-600 hover:from-amber-300 hover:to-amber-500 text-slate-950 font-black text-xs flex items-center justify-center gap-2 transition-all shadow-md shadow-amber-500/30 hover:scale-102 active:scale-98 cursor-pointer disabled:opacity-50"
              >
                {claiming ? (
                  <>
                    <Loader2 size={14} className="animate-spin text-slate-950" />
                    <span>Mengklaim...</span>
                  </>
                ) : (
                  <>
                    <Gift size={14} className="text-slate-950" />
                    <span>Klaim Reward Hari Ini (+{today_reward} Silver)</span>
                    <Sparkles size={13} className="text-slate-950" />
                  </>
                )}
              </button>
            )}
          </div>
        </div>

        {/* ── INSTRUKSI & PANDUAN LENGKAP ABSENSI HARIAN (Hari-1 s/d Hari-7) ── */}
        <div className="bg-black/35 rounded-xl p-3 border border-emerald-500/25 text-left space-y-1.5">
          <div className="flex items-center justify-between flex-wrap gap-1.5">
            <span className="text-[11px] font-black text-amber-300 flex items-center gap-1.5">
              <span>💡</span>
              <span>Panduan &amp; Aturan Absensi Harian:</span>
            </span>
            <span className="text-emerald-300 font-bold text-[10px] bg-emerald-500/15 px-2 py-0.5 rounded border border-emerald-500/20">
              WIB (Asia/Jakarta) • Reset Setiap 00:00
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-[10.5px] text-slate-300 leading-snug pt-1">
            <div className="bg-white/[0.03] p-2 rounded-lg border border-white/5 flex items-start gap-1.5">
              <span className="w-3.5 h-3.5 rounded-full bg-emerald-500/30 text-emerald-300 font-bold text-[9px] flex items-center justify-center shrink-0 mt-0.5">1</span>
              <span><strong>Klaim Setiap Hari:</strong> Tekan tombol klaim gratis 1x setiap hari untuk mendapatkan Poin Silver.</span>
            </div>
            <div className="bg-white/[0.03] p-2 rounded-lg border border-white/5 flex items-start gap-1.5">
              <span className="w-3.5 h-3.5 rounded-full bg-amber-500/30 text-amber-300 font-bold text-[9px] flex items-center justify-center shrink-0 mt-0.5">2</span>
              <span><strong>Pertahankan Streak:</strong> Hadir &amp; klaim setiap hari (Hari-1 s/d Hari-4: +1 Silver, Hari-5 &amp; Hari-6: +2 Silver, Hari-7: +3 Silver). Setelah Hari-7, siklus reward kembali ke Hari-1. Jika bolong 1 hari, streak otomatis terputus dan kembali ke Hari-1.</span>
            </div>
            <div className="bg-white/[0.03] p-2 rounded-lg border border-white/5 flex items-start gap-1.5">
              <span className="w-3.5 h-3.5 rounded-full bg-teal-500/30 text-teal-300 font-bold text-[9px] flex items-center justify-center shrink-0 mt-0.5">3</span>
              <span><strong>Fungsi Poin Silver:</strong> Gunakan Poin Silver untuk membuka semua fitur dan layanan di Surade.</span>
            </div>
          </div>
        </div>
      </div>

      {/* ── CELEBRATION MODAL SAAT BERHASIL KLAIM ── */}
      {claimSuccessModal && (
        <div
          className="fixed inset-0 z-[1200] bg-black/80 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in duration-200"
          onClick={() => setClaimSuccessModal(null)}
        >
          <div
            className="bg-gradient-to-b from-slate-900 via-[#072d24] to-[#031d16] text-white rounded-3xl p-6 sm:p-8 max-w-sm w-full text-center border-2 border-amber-400 shadow-[0_20px_60px_rgba(245,158,11,0.4)] space-y-4 relative overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="absolute top-0 right-0 w-40 h-40 bg-amber-400/20 rounded-full blur-2xl pointer-events-none" />

            <div className="w-16 h-16 rounded-3xl bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center mx-auto shadow-xl shadow-amber-500/30">
              <SuradeCoinIcon size={38} type="silver" animate />
            </div>

            <div>
              <span className="text-xs font-black text-amber-300 uppercase tracking-widest block">Klaim Berhasil!</span>
              <h4 className="text-2xl font-black text-white mt-1">
                +{claimSuccessModal.reward_points} Poin Silver
              </h4>
              <p className="text-xs text-slate-300 mt-2 leading-relaxed">
                Poin Silver telah ditambahkan ke dompet Anda. Pertahankan streak harian Anda dari Hari-1 sampai Hari-7 untuk mendapatkan reward bonus maksimal!
              </p>
            </div>

            <div className="p-3 bg-white/5 rounded-2xl border border-white/10 flex items-center justify-around text-xs">
              <div>
                <span className="text-slate-400 block text-[10.5px]">Streak Saat Ini</span>
                <strong className="text-amber-300 font-black text-sm">{claimSuccessModal.streak} Hari 🔥</strong>
              </div>
              <div className="w-[1px] h-8 bg-white/10" />
              <div>
                <span className="text-slate-400 block text-[10.5px]">Hari Siklus</span>
                <strong className="text-amber-300 font-black text-sm">{claimSuccessModal.cycle_label || `Hari-${((claimSuccessModal.streak - 1) % 7) + 1}`}</strong>
              </div>
              <div className="w-[1px] h-8 bg-white/10" />
              <div>
                <span className="text-slate-400 block text-[10.5px]">Saldo Silver Baru</span>
                <strong className="text-emerald-300 font-black text-sm">{claimSuccessModal.new_silver_balance} Silver</strong>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setClaimSuccessModal(null)}
              className="w-full py-3 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-black text-xs shadow-lg transition-all cursor-pointer"
            >
              Terima Kasih!
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
