import React, { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import axios from "axios";
import toast from "react-hot-toast";
import {
  Sparkles,
  Plus,
  History,
  HelpCircle,
  TrendingUp,
  ArrowDownLeft,
  ArrowUpRight,
  ShieldCheck,
  Zap,
  Crown,
  Megaphone,
  Calendar,
  MessageSquare,
  CheckCircle,
  Loader2,
  RefreshCw,
  ChevronRight,
  CreditCard,
  Coins,
  AlertTriangle,
  AlertCircle,
  Eye,
  Upload,
  X,
  Check,
  Clock,
  Banknote,
  Trash2
} from "lucide-react";
import SuradeCoinIcon from "../../../components/SuradeCoinIcon";
import GoldWithdrawModal from "../../../components/GoldWithdrawModal";
import {
  BuyCoinModal,
  CoinPaymentConfirmationModal,
  CoinHistoryModal,
  CoinGuideModal
} from "../../../components/SuradeCoinModal";

const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:8000/api";

const getFullImageUrl = (url) => {
  if (!url) return "";
  if (url.startsWith("http://") || url.startsWith("https://") || url.startsWith("data:")) return url;
  const baseUrl = API_BASE.replace(/\/api$/, "");
  return `${baseUrl}${url.startsWith("/") ? "" : "/"}${url}`;
};

export default function SuradeCoinTab({ navigate, setActiveTab, onBalanceUpdate }) {
  const [balanceData, setBalanceData] = useState({
    balance: 0,
    silver_balance: 0,
    gold_balance: 0,
    total_earned: 0,
    total_spent: 0,
    total_silver_earned: 0,
    total_silver_spent: 0,
    total_gold_earned: 0,
    total_gold_spent: 0,
    recent_transactions: [],
  });
  const [loading, setLoading] = useState(true);
  const [services, setServices] = useState([]);

  // Purchases (Top Up Requests) State
  const [myPurchases, setMyPurchases] = useState([]);
  const [loadingPurchases, setLoadingPurchases] = useState(false);
  const [previewProof, setPreviewProof] = useState(null);

  // Gold Withdrawals State
  const [goldWithdrawals, setGoldWithdrawals] = useState([]);
  const [loadingWithdrawals, setLoadingWithdrawals] = useState(false);
  const [isWithdrawModalOpen, setIsWithdrawModalOpen] = useState(false);
  const [selectedWithdrawalToFix, setSelectedWithdrawalToFix] = useState(null);

  // Re-upload proof modal state
  const [reuploadModalOpen, setReuploadModalOpen] = useState(false);
  const [selectedPurchaseToFix, setSelectedPurchaseToFix] = useState(null);
  const [newProofFile, setNewProofFile] = useState(null);
  const [newProofPreview, setNewProofPreview] = useState(null);
  const [newSenderName, setNewSenderName] = useState("");
  const [newSenderBank, setNewSenderBank] = useState("");
  const [submittingReupload, setSubmittingReupload] = useState(false);

  // Modals state
  const [isBuyModalOpen, setIsBuyModalOpen] = useState(false);
  const [buyModalInitialType, setBuyModalInitialType] = useState("silver");
  const [isHistoryModalOpen, setIsHistoryModalOpen] = useState(false);
  const [isGuideModalOpen, setIsGuideModalOpen] = useState(false);
  const [txFilter, setTxFilter] = useState("all"); // 'all', 'silver', 'gold'

  useEffect(() => {
    fetchCoinData();
    fetchServices();
    fetchMyPurchases();
    fetchGoldWithdrawals();
  }, []);

  const fetchCoinData = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      const res = await axios.get(`${API_BASE}/coins/balance`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.data?.success) {
        const bal = res.data.balance || 0;
        setBalanceData({
          balance: bal,
          silver_balance: res.data.silver_balance || 0,
          gold_balance: res.data.gold_balance || 0,
          withdrawable_idr: res.data.withdrawable_idr || 0,
          total_withdrawn_gold: res.data.total_withdrawn_gold || 0,
          total_withdrawn_idr: res.data.total_withdrawn_idr || 0,
          yearly_income_gold: res.data.yearly_income_gold || 0,
          yearly_income_idr: res.data.yearly_income_idr || 0,
          current_year: res.data.current_year || new Date().getFullYear(),
          total_earned: res.data.total_earned || 0,
          total_spent: res.data.total_spent || 0,
          total_silver_earned: res.data.total_silver_earned || 0,
          total_silver_spent: res.data.total_silver_spent || 0,
          total_gold_earned: res.data.total_gold_earned || 0,
          total_gold_spent: res.data.total_gold_spent || 0,
          recent_transactions: res.data.recent_transactions || [],
        });
        if (onBalanceUpdate) onBalanceUpdate(bal);
        window.dispatchEvent(
          new CustomEvent("poin-balance-updated", {
            detail: {
              balance: bal,
              silver_balance: res.data.silver_balance || 0,
              gold_balance: res.data.gold_balance || 0,
            },
          })
        );
      }
    } catch (err) {
      console.error("Error fetching coin balance:", err);
    } finally {
      setLoading(false);
    }
  };

  const fetchGoldWithdrawals = async () => {
    setLoadingWithdrawals(true);
    try {
      const token = localStorage.getItem("token");
      const res = await axios.get(`${API_BASE}/coins/gold/withdrawals`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.data?.success) {
        setGoldWithdrawals(res.data.data?.data || res.data.data || res.data.withdrawals || []);
      }
    } catch (err) {
      console.error("Error fetching gold withdrawals:", err);
    } finally {
      setLoadingWithdrawals(false);
    }
  };

  const fetchServices = async () => {
    try {
      const res = await axios.get(`${API_BASE}/coins/services`, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });
      if (res.data?.success) {
        setServices(res.data.services || []);
      }
    } catch (err) {
      console.error("Error fetching coin services:", err);
    }
  };

  const fetchMyPurchases = async () => {
    setLoadingPurchases(true);
    try {
      const token = localStorage.getItem("token");
      const res = await axios.get(`${API_BASE}/coins/my-purchases`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.data?.success) {
        setMyPurchases(res.data.purchases?.data || []);
      }
    } catch (err) {
      console.error("Error fetching my purchases:", err);
    } finally {
      setLoadingPurchases(false);
    }
  };

  const handleCoinPurchased = (newBalance) => {
    const bal = Number(newBalance) || 0;
    setBalanceData((prev) => ({ ...prev, balance: bal }));
    if (onBalanceUpdate) onBalanceUpdate(bal);
    window.dispatchEvent(new CustomEvent("poin-balance-updated", { detail: { balance: bal } }));
    fetchCoinData();
    fetchMyPurchases();
  };

  const handleOpenReuploadModal = (purchase) => {
    setSelectedPurchaseToFix(purchase);
    setNewProofFile(null);
    setNewProofPreview(null);
    setNewSenderName(purchase.sender_account_name || "");
    setNewSenderBank(purchase.sender_bank_name || "");
    setReuploadModalOpen(true);
  };

  const handleSubmitReupload = async (e) => {
    e.preventDefault();
    if (!selectedPurchaseToFix) return;
    if (!newProofFile) {
      toast.error("Wajib memilih foto bukti transfer baru.");
      return;
    }

    setSubmittingReupload(true);
    try {
      const token = localStorage.getItem("token");
      const formData = new FormData();
      formData.append("proof_image", newProofFile);
      if (newSenderName.trim()) formData.append("sender_account_name", newSenderName.trim());
      if (newSenderBank.trim()) formData.append("sender_bank_name", newSenderBank.trim());

      const res = await axios.post(`${API_BASE}/coins/purchases/${selectedPurchaseToFix.id}/reupload`, formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "multipart/form-data",
        },
      });

      if (res.data?.success) {
        toast.success(res.data.message || "Bukti pembayaran berhasil diperbaiki dan dikirim!");
        setReuploadModalOpen(false);
        setSelectedPurchaseToFix(null);
        fetchMyPurchases();
      }
    } catch (err) {
      toast.error(err.response?.data?.message || "Gagal mengunggah ulang bukti transfer.");
    } finally {
      setSubmittingReupload(false);
    }
  };

  const rejectedPurchases = myPurchases.filter((p) => p.payment_status === "failed");
  const rejectedWithdrawals = goldWithdrawals.filter((w) => w.status === "rejected");

  const handleOpenFixWithdrawal = (withdrawal) => {
    setSelectedWithdrawalToFix(withdrawal);
    setIsWithdrawModalOpen(true);
  };

  const handleDeletePurchase = async (id) => {
    if (!window.confirm("Apakah Anda yakin ingin menghapus riwayat permohonan pembelian koin ini?")) return;
    try {
      const token = localStorage.getItem("token");
      const res = await axios.delete(`${API_BASE}/coins/my-purchases/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.data?.success) {
        toast.success(res.data.message || "Riwayat pembelian koin berhasil dihapus.");
        fetchMyPurchases();
      }
    } catch (err) {
      toast.error(err.response?.data?.message || "Gagal menghapus riwayat.");
    }
  };

  const handleDeleteWithdrawal = async (id, status) => {
    const confirmMsg = status === "pending"
      ? "Batalkan dan hapus pengajuan penarikan Gold ini? Saldo Gold akan dikembalikan utuh ke dompet akun Anda."
      : "Apakah Anda yakin ingin menghapus riwayat pencairan Gold ini?";
    if (!window.confirm(confirmMsg)) return;
    try {
      const token = localStorage.getItem("token");
      const res = await axios.delete(`${API_BASE}/coins/gold/withdrawals/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.data?.success) {
        toast.success(res.data.message || "Riwayat pencairan Gold berhasil dihapus.");
        fetchGoldWithdrawals();
        fetchCoinData();
      }
    } catch (err) {
      toast.error(err.response?.data?.message || "Gagal menghapus riwayat.");
    }
  };

  const goldBal = Number(balanceData.gold_balance || 0);
  const withdrawableIdr = balanceData.withdrawable_idr !== undefined && balanceData.withdrawable_idr > 0
    ? Number(balanceData.withdrawable_idr)
    : (goldBal * 1000);

  const totalWithdrawnGold = balanceData.total_withdrawn_gold !== undefined && balanceData.total_withdrawn_gold > 0
    ? Number(balanceData.total_withdrawn_gold)
    : goldWithdrawals.filter((w) => w.status === "paid" || w.status === "approved").reduce((sum, curr) => sum + Number(curr.gold_amount || curr.amount || 0), 0);

  const totalWithdrawnIdr = balanceData.total_withdrawn_idr !== undefined && balanceData.total_withdrawn_idr > 0
    ? Number(balanceData.total_withdrawn_idr)
    : (totalWithdrawnGold * 1000);

  const yearlyIncomeGold = balanceData.yearly_income_gold !== undefined && balanceData.yearly_income_gold > 0
    ? Number(balanceData.yearly_income_gold)
    : Number(balanceData.total_gold_earned || 0);

  const yearlyIncomeIdr = balanceData.yearly_income_idr !== undefined && balanceData.yearly_income_idr > 0
    ? Number(balanceData.yearly_income_idr)
    : (yearlyIncomeGold * 1000);

  return (
    <div className="space-y-6 w-full max-w-full animate-fade-in text-left">
      {/* ── 1. HEADER & DUAL WALLET CARDS (SILVER & GOLD) ── */}
      <div className="space-y-4">
        {/* Top Header Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-4 sm:p-5 rounded-3xl border border-slate-200/80 shadow-xs">
          <div className="space-y-1">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 text-emerald-800 text-[11px] font-black border border-emerald-200">
              <Sparkles size={13} className="text-emerald-600" />
              <span>Sistem Poin Resmi Surade (Silver &amp; Gold)</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
              Dompet Digital Surade
            </h2>
            <p className="text-xs text-slate-500">
              Kelola saldo Poin Silver untuk akses fitur harian dan Poin Gold yang dapat dicairkan menjadi uang tunai.
            </p>
          </div>

          <div className="flex items-center gap-2 self-start sm:self-auto shrink-0">
            <button
              onClick={() => setIsHistoryModalOpen(true)}
              className="px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs flex items-center gap-1.5 transition-colors cursor-pointer border border-slate-200"
            >
              <History size={15} />
              <span>Riwayat Poin</span>
            </button>

            <button
              onClick={() => setIsGuideModalOpen(true)}
              className="px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs flex items-center gap-1.5 transition-colors cursor-pointer border border-slate-200"
            >
              <HelpCircle size={15} />
              <span>Panduan</span>
            </button>
          </div>
        </div>

        {/* Dual Cards Grid: SILVER & GOLD */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-5">
          {/* ── CARD 1: POIN SILVER ── */}
          <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#1e293b] via-[#334155] to-[#0f172a] text-white p-6 sm:p-7 shadow-xl border-2 border-slate-400/30 flex flex-col justify-between group">
            {/* Ambient Silver glow */}
            <div className="absolute -top-20 -right-20 w-64 h-64 bg-slate-400/20 rounded-full blur-3xl pointer-events-none" />
            <div className="absolute -bottom-20 -left-20 w-64 h-64 bg-emerald-400/10 rounded-full blur-3xl pointer-events-none" />

            <div className="relative z-10 space-y-4">
              <div className="flex items-center justify-between">
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md text-slate-200 text-[11px] font-black border border-white/20">
                  <Coins size={13} className="text-slate-300" />
                  <span>Poin Silver (Pengguna &amp; Reward)</span>
                </div>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-white/15 text-slate-300">
                  Non-Tarik Tunai
                </span>
              </div>

              <div>
                <span className="text-[11px] text-slate-400 uppercase tracking-widest font-bold block mb-1">
                  Saldo Silver Anda
                </span>
                <div className="flex items-center gap-4">
                  <div className="relative group shrink-0">
                    <SuradeCoinIcon size={64} type="silver" spin3d={true} className="drop-shadow-lg" />
                  </div>
                  <div className="flex items-baseline gap-2">
                    <h1 className="text-3xl sm:text-5xl font-black text-white tracking-tight">
                      {loading ? "..." : Number(balanceData.silver_balance || 0).toLocaleString("id-ID")}
                    </h1>
                    <span className="text-xl sm:text-2xl font-black text-slate-300">Silver</span>
                  </div>
                </div>
              </div>

              <p className="text-xs text-slate-300/90 leading-relaxed">
                Poin Silver diberikan untuk pengguna baru (10 Poin) dan reward harian absensi. Poin Silver dapat digunakan untuk berbagai fitur di Surade. Namun, pelaku usaha tidak mendapatkan poin jika pengunjung membayar menggunakan Silver. Poin Silver tidak dapat di-top up atau ditarik tunai.
              </p>
            </div>

            <div className="relative z-10 pt-5 mt-4 border-t border-white/10 flex items-center justify-between gap-3">
              <div className="text-[11px] text-slate-400">
                <span>Total Didapat: </span>
                <strong className="text-slate-200">+{Number(balanceData.total_silver_earned || 0).toLocaleString("id-ID")}</strong>
              </div>
              <button
                type="button"
                onClick={() => {
                  if (setActiveTab) setActiveTab("dashboard");
                  else if (navigate) navigate("/admin-user?tab=dashboard");
                  else window.location.href = "/admin-user?tab=dashboard";
                }}
                className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-slate-200 to-white hover:from-white hover:to-slate-100 text-slate-950 font-black text-xs shadow-md flex items-center gap-1.5 transition-all cursor-pointer active:scale-98"
                title="Buka Halaman Dashboard untuk Klaim Poin Silver gratis setiap hari dari absensi"
              >
                <Sparkles size={14} className="text-amber-500" />
                <span>Klaim Absensi di Dashboard</span>
              </button>
            </div>
          </div>

          {/* ── CARD 2: POIN GOLD ── */}
          <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#063a2b] via-[#095e3d] to-[#043322] text-white p-6 sm:p-7 shadow-xl border-2 border-amber-400/50 flex flex-col justify-between group">
            {/* Ambient Gold glow */}
            <div className="absolute -top-20 -right-20 w-64 h-64 bg-amber-400/25 rounded-full blur-3xl pointer-events-none" />
            <div className="absolute -bottom-20 -left-20 w-64 h-64 bg-yellow-400/15 rounded-full blur-3xl pointer-events-none" />

            <div className="relative z-10 space-y-4">
              <div className="flex items-center justify-between">
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-400/20 backdrop-blur-md text-amber-300 text-[11px] font-black border border-amber-400/40">
                  <Sparkles size={13} className="text-amber-300" />
                  <span>Poin Gold (Dapat Ditarik Tunai)</span>
                </div>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-amber-400 text-slate-950">
                  Bisa Ditarik Uang
                </span>
              </div>

              <div>
                <span className="text-[11px] text-emerald-200 uppercase tracking-widest font-bold block mb-1">
                  Saldo Gold Anda (Penghasilan Usaha)
                </span>
                <div className="flex items-center gap-4">
                  <div className="relative group shrink-0">
                    <SuradeCoinIcon size={64} type="gold" spin3d={true} className="drop-shadow-lg" />
                  </div>
                  <div>
                    <div className="flex items-baseline gap-2">
                      <h1 className="text-3xl sm:text-5xl font-black text-white tracking-tight">
                        {loading ? "..." : Number(balanceData.gold_balance || 0).toLocaleString("id-ID")}
                      </h1>
                      <span className="text-xl sm:text-2xl font-black text-amber-300">Gold</span>
                    </div>
                  </div>
                </div>
              </div>

              <p className="text-xs text-emerald-100/90 leading-relaxed">
                Poin Gold didapatkan saat pengunjung menghubungi WhatsApp Anda menggunakan Gold, atau melalui top up. Poin Gold <strong>dapat ditarik ke rekening bank atau e-wallet</strong>.
              </p>
            </div>

            <div className="relative z-10 pt-5 mt-4 border-t border-emerald-500/30 flex items-center justify-between gap-2.5 flex-wrap">
              <div className="text-[11px] text-emerald-200">
                <span>Total Didapat: </span>
                <strong className="text-amber-300">+{Number(balanceData.total_gold_earned || 0).toLocaleString("id-ID")}</strong>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setBuyModalInitialType("gold");
                    setIsBuyModalOpen(true);
                  }}
                  className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-amber-400 via-amber-500 to-amber-600 hover:from-amber-300 hover:to-amber-500 text-slate-950 font-black text-xs shadow-md flex items-center gap-1.5 transition-all cursor-pointer active:scale-98"
                >
                  <Plus size={15} strokeWidth={3} />
                  <span>Top Up Gold</span>
                </button>
              </div>
            </div>
          </div>
        </div>

      </div>

      {/* ── ALERT PERMOHONAN DITOLAK (PERLU PERBAIKAN) ── */}
      {rejectedPurchases.length > 0 && (
        <div className="rounded-3xl bg-rose-50 border-2 border-rose-300 p-5 sm:p-6 shadow-md space-y-3 animate-fade-in">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-start gap-3.5">
              <div className="w-12 h-12 rounded-2xl bg-rose-600 text-white flex items-center justify-center shrink-0 shadow-sm">
                <AlertTriangle size={26} />
              </div>
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="px-2.5 py-0.5 rounded-full bg-rose-200 text-rose-800 text-[10px] font-black uppercase tracking-wider">
                    Permohonan Ditolak
                  </span>
                  <span className="text-xs font-mono text-slate-500 font-bold">
                    #{rejectedPurchases[0].order_number}
                  </span>
                </div>
                <h4 className="text-sm sm:text-base font-extrabold text-slate-900">
                  Bukti Pembayaran Poin Anda Perlu Diperbaiki
                </h4>
                <div className="text-xs text-rose-700 bg-white/90 p-3 rounded-xl border border-rose-200 inline-block max-w-xl shadow-2xs">
                  <span className="font-bold block text-rose-800 mb-0.5">Alasan dari Admin:</span>
                  <p className="italic">"{rejectedPurchases[0].admin_notes || "Bukti transfer tidak valid atau belum masuk ke rekening resmi."}"</p>
                </div>
              </div>
            </div>
            <button
              type="button"
              onClick={() => handleOpenReuploadModal(rejectedPurchases[0])}
              className="px-5 py-3 rounded-2xl bg-gradient-to-r from-rose-600 to-rose-700 hover:from-rose-500 hover:to-rose-600 text-white font-black text-xs shadow-md flex items-center justify-center gap-2 cursor-pointer transition-all self-start sm:self-auto shrink-0 border-0"
            >
              <RefreshCw size={15} />
              <span>Perbaiki Bukti Pembayaran</span>
            </button>
          </div>
        </div>
      )}
      {/* ── ALERT PENCAIRAN GOLD DITOLAK (PERLU PERBAIKAN DATA REKENING) ── */}
      {rejectedWithdrawals.length > 0 && (
        <div className="rounded-3xl bg-gradient-to-r from-amber-50 via-rose-50 to-amber-50 border-2 border-amber-300 p-5 sm:p-6 shadow-md space-y-3 animate-fade-in">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-start gap-3.5">
              <div className="w-12 h-12 rounded-2xl bg-amber-600 text-white flex items-center justify-center shrink-0 shadow-sm">
                <Banknote size={26} />
              </div>
              <div className="space-y-1.5">
                <div className="flex items-center gap-2">
                  <span className="px-2.5 py-0.5 rounded-full bg-rose-100 text-rose-800 text-[10px] font-black uppercase tracking-wider border border-rose-200">
                    Pencairan Gold Ditolak
                  </span>
                  <span className="text-xs font-mono text-slate-500 font-bold">
                    #{rejectedWithdrawals[0].withdrawal_number || rejectedWithdrawals[0].id}
                  </span>
                </div>
                <h4 className="text-sm sm:text-base font-extrabold text-slate-900">
                  Data Rekening Penarikan Saldo Gold Perlu Diperbaiki
                </h4>
                <div className="text-xs text-slate-700 bg-white/95 p-3 rounded-xl border border-amber-200 inline-block max-w-xl shadow-2xs space-y-1.5">
                  <div>
                    <span className="font-bold text-slate-900">Alasan Penolakan dari Admin:</span>
                    <p className="italic text-rose-700 font-semibold mt-0.5">
                      "{rejectedWithdrawals[0].admin_notes || "Nomor rekening atau nama pemilik rekening tidak cocok dengan data bank."}"
                    </p>
                  </div>
                  <div className="text-[11.5px] text-emerald-700 font-bold flex items-center gap-1.5 pt-1.5 border-t border-slate-100">
                    <CheckCircle size={14} className="text-emerald-600 shrink-0" />
                    <span>Saldo {rejectedWithdrawals[0].gold_amount} Poin Gold telah otomatis dikembalikan utuh ke akun Anda.</span>
                  </div>
                </div>
              </div>
            </div>
            <button
              type="button"
              onClick={() => handleOpenFixWithdrawal(rejectedWithdrawals[0])}
              className="px-5 py-3 rounded-2xl bg-gradient-to-r from-amber-600 via-yellow-600 to-amber-700 hover:opacity-95 text-white font-black text-xs shadow-md flex items-center justify-center gap-2 cursor-pointer transition-all self-start sm:self-auto shrink-0 border-0"
            >
              <RefreshCw size={15} />
              <span>Perbaiki Rekening &amp; Tarik Ulang</span>
            </button>
          </div>
        </div>
      )}

      {/* ── 2. FITUR STATS KEUANGAN & PENARIKAN (GAMBAR 4) ── */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {/* Card 1: Poin yang Bisa Ditarik / Saldo Siap Ditarik */}
        <div className="bg-gradient-to-br from-amber-500/10 via-white to-amber-500/5 rounded-3xl p-5 sm:p-6 border-2 border-amber-400/60 shadow-sm hover:shadow-xl transition-all duration-300 hover:-translate-y-1 flex flex-col justify-between group relative overflow-hidden">
          <div className="absolute top-0 right-0 w-28 h-28 bg-amber-400/15 rounded-full blur-2xl pointer-events-none" />

          <div className="space-y-3 relative z-10">
            <div className="flex items-center justify-between">
              <span className="px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-900 text-[10px] font-black uppercase tracking-wider border border-amber-300">
                Bisa Ditarik Tunai
              </span>
              <div className="w-9 h-9 rounded-xl bg-amber-400/20 text-amber-700 flex items-center justify-center font-black">
                <Banknote size={20} />
              </div>
            </div>

            <div>
              <span className="text-[11px] font-extrabold text-slate-500 uppercase tracking-wider block mb-1">
                Saldo Siap Ditarik
              </span>
              <div className="flex items-baseline gap-1 text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
                <span>Rp</span>
                <span>{Number(withdrawableIdr).toLocaleString("id-ID")}</span>
              </div>
            </div>

            <p className="text-[11.5px] text-slate-500 flex items-center gap-1.5 font-medium">
              <SuradeCoinIcon size={14} type="gold" />
              <span><strong>{Number(goldBal).toLocaleString("id-ID")} Gold</strong> siap dicairkan ke rekening/e-wallet</span>
            </p>
          </div>

          <div className="pt-4 mt-3 border-t border-amber-200/60 relative z-10">
            <button
              type="button"
              onClick={() => setIsWithdrawModalOpen(true)}
              className="w-full py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-black text-xs shadow-sm flex items-center justify-center gap-1.5 transition-all cursor-pointer active:scale-98"
            >
              <ArrowUpRight size={14} strokeWidth={2.5} />
              <span>Tarik Saldo Sekarang</span>
            </button>
          </div>
        </div>

        {/* Card 2: Saldo Yang Sudah Ditarik */}
        <div className="bg-gradient-to-br from-blue-500/10 via-white to-blue-500/5 rounded-3xl p-5 sm:p-6 border border-blue-200/80 shadow-sm hover:shadow-xl transition-all duration-300 hover:-translate-y-1 flex flex-col justify-between group relative overflow-hidden">
          <div className="absolute top-0 right-0 w-28 h-28 bg-blue-400/15 rounded-full blur-2xl pointer-events-none" />

          <div className="space-y-3 relative z-10">
            <div className="flex items-center justify-between">
              <span className="px-2.5 py-0.5 rounded-full bg-blue-100 text-blue-900 text-[10px] font-black uppercase tracking-wider border border-blue-200">
                Pencairan Berhasil
              </span>
              <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-700 flex items-center justify-center font-black">
                <CheckCircle size={20} className="text-blue-600" />
              </div>
            </div>

            <div>
              <span className="text-[11px] font-extrabold text-slate-500 uppercase tracking-wider block mb-1">
                Saldo Yang Sudah Ditarik
              </span>
              <div className="flex items-baseline gap-1 text-2xl sm:text-3xl font-black text-blue-950 tracking-tight">
                <span>Rp</span>
                <span>{Number(totalWithdrawnIdr).toLocaleString("id-ID")}</span>
              </div>
            </div>

            <p className="text-[11.5px] text-slate-500 flex items-center gap-1.5 font-medium">
              <CheckCircle size={14} className="text-blue-500 shrink-0" />
              <span><strong>{Number(totalWithdrawnGold).toLocaleString("id-ID")} Gold</strong> telah masuk ke rekening Anda</span>
            </p>
          </div>

          <div className="pt-4 mt-3 border-t border-blue-100 relative z-10">
            <div className="text-[11px] text-slate-500 font-medium py-1.5 flex items-center justify-between">
              <span>Status Transaksi:</span>
              <strong className="text-emerald-600 font-bold">100% Ditransfer</strong>
            </div>
          </div>
        </div>

        {/* Card 3: Total Pendapatan Tahunan */}
        <div className="bg-gradient-to-br from-emerald-500/10 via-white to-emerald-500/5 rounded-3xl p-5 sm:p-6 border border-emerald-200/80 shadow-sm hover:shadow-xl transition-all duration-300 hover:-translate-y-1 flex flex-col justify-between group relative overflow-hidden">
          <div className="absolute top-0 right-0 w-28 h-28 bg-emerald-400/15 rounded-full blur-2xl pointer-events-none" />

          <div className="space-y-3 relative z-10">
            <div className="flex items-center justify-between">
              <span className="px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-900 text-[10px] font-black uppercase tracking-wider border border-emerald-200">
                Tahun {balanceData.current_year || new Date().getFullYear()}
              </span>
              <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center font-black">
                <TrendingUp size={20} className="text-emerald-600" />
              </div>
            </div>

            <div>
              <span className="text-[11px] font-extrabold text-slate-500 uppercase tracking-wider block mb-1">
                Total Pendapatan Tahunan
              </span>
              <div className="flex items-baseline gap-1 text-2xl sm:text-3xl font-black text-emerald-950 tracking-tight">
                <span>Rp</span>
                <span>{Number(yearlyIncomeIdr).toLocaleString("id-ID")}</span>
              </div>
            </div>

            <p className="text-[11.5px] text-slate-500 flex items-center gap-1.5 font-medium">
              <TrendingUp size={14} className="text-emerald-500 shrink-0" />
              <span><strong>{Number(yearlyIncomeGold).toLocaleString("id-ID")} Gold</strong> terkumpul tahun ini</span>
            </p>
          </div>

          <div className="pt-4 mt-3 border-t border-emerald-100 relative z-10">
            <div className="text-[11px] text-slate-500 font-medium py-1.5 flex items-center justify-between">
              <span>Sumber:</span>
              <strong className="text-slate-700 font-bold">Penghasilan Usaha &amp; Layanan</strong>
            </div>
          </div>
        </div>
      </div>

      {/* ── 4. DAFTAR PERMOHONAN TOP UP POIN SAYA (STATUS & UPLOAD ULANG BUKTI) ── */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center">
              <CreditCard size={18} />
            </div>
            <div>
              <h3 className="text-base font-extrabold text-slate-900">Permohonan Pembelian Poin Saya</h3>
              <p className="text-xs text-slate-500">Pantau proses verifikasi bukti transfer dan status penambahan poin ke dompet Anda</p>
            </div>
          </div>
          <button
            onClick={() => setIsBuyModalOpen(true)}
            className="px-4 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-black text-xs shadow-xs flex items-center gap-1.5 cursor-pointer self-start sm:self-auto border border-amber-400/40"
          >
            <Plus size={15} strokeWidth={2.5} />
            <span>+ Beli Poin Baru</span>
          </button>
        </div>

        {loadingPurchases ? (
          <div className="flex items-center justify-center py-12 gap-2 text-slate-400 text-xs font-semibold">
            <Loader2 size={20} className="animate-spin text-amber-500" />
            <span>Memuat data permohonan...</span>
          </div>
        ) : myPurchases.length === 0 ? (
          <div className="text-center py-10 text-slate-400 space-y-2">
            <CreditCard size={36} className="mx-auto opacity-40" />
            <p className="text-xs font-semibold text-slate-500">Belum ada pengajuan pembelian poin.</p>
            <button
              onClick={() => setIsBuyModalOpen(true)}
              className="text-xs text-amber-600 hover:underline font-bold cursor-pointer"
            >
              Mulai Beli Poin Sekarang &rarr;
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto rounded-2xl border border-slate-200">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 uppercase font-bold text-[11px]">
                  <th className="p-3.5">Pesanan</th>
                  <th className="p-3.5">Paket &amp; Poin</th>
                  <th className="p-3.5">Tagihan</th>
                  <th className="p-3.5">Metode</th>
                  <th className="p-3.5">Bukti Transfer</th>
                  <th className="p-3.5">Status Verifikasi</th>
                  <th className="p-3.5 text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {myPurchases.map((purchase) => {
                  const isPaid = purchase.payment_status === "paid";
                  const isPending = purchase.payment_status === "pending";
                  const isFailed = purchase.payment_status === "failed";

                  return (
                    <tr key={purchase.id} className="hover:bg-slate-50/70">
                      <td className="p-3.5">
                        <div className="font-mono font-bold text-slate-800">#{purchase.order_number}</div>
                        <div className="text-[10px] text-slate-400">
                          {new Date(purchase.created_at).toLocaleDateString("id-ID", {
                            day: "numeric",
                            month: "short",
                            year: "numeric",
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </div>
                      </td>
                      <td className="p-3.5">
                        <div className="font-extrabold text-amber-700 flex items-center gap-1">
                          <SuradeCoinIcon size={15} />
                          <span>{Number(purchase.total_coin).toLocaleString("id-ID")} Poin</span>
                        </div>
                        <div className="text-[10px] text-slate-400">{purchase.package?.name || "Paket Poin"}</div>
                      </td>
                      <td className="p-3.5 font-black text-slate-900">
                        Rp {Number(purchase.price_idr).toLocaleString("id-ID")}
                      </td>
                      <td className="p-3.5">
                        <span className="font-semibold text-slate-700">{purchase.payment_method || "QRIS / Transfer"}</span>
                        {purchase.sender_account_name && (
                          <div className="text-[10.5px] text-slate-400">a.n {purchase.sender_account_name}</div>
                        )}
                      </td>
                      <td className="p-3.5">
                        {purchase.proof_image ? (
                          <button
                            type="button"
                            onClick={() => setPreviewProof(getFullImageUrl(purchase.proof_image))}
                            className="px-2.5 py-1 rounded-lg bg-emerald-50 text-emerald-700 hover:bg-emerald-100 font-bold text-[11px] flex items-center gap-1 border border-emerald-200 cursor-pointer"
                          >
                            <Eye size={13} />
                            <span>Lihat Bukti</span>
                          </button>
                        ) : (
                          <span className="text-[11px] text-slate-400 italic">Belum Ada</span>
                        )}
                      </td>
                      <td className="p-3.5">
                        <div className="space-y-1">
                          <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold inline-block ${
                            isPaid
                              ? "bg-emerald-100 text-emerald-800"
                              : isPending
                              ? "bg-amber-100 text-amber-800"
                              : "bg-rose-100 text-rose-800"
                          }`}>
                            {isPaid ? "Disetujui" : isPending ? "Menunggu Verifikasi" : "Ditolak"}
                          </span>
                          {isFailed && purchase.admin_notes && (
                            <div className="text-[10.5px] text-rose-700 bg-rose-50 border border-rose-200 p-1.5 rounded-lg max-w-xs leading-snug">
                              <span className="font-bold">Alasan:</span> {purchase.admin_notes}
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="p-3.5 text-right whitespace-nowrap">
                        <div className="flex items-center justify-end gap-1.5">
                          {isFailed && (
                            <button
                              type="button"
                              onClick={() => handleOpenReuploadModal(purchase)}
                              className="px-3 py-1.5 rounded-xl bg-gradient-to-r from-rose-600 to-amber-600 hover:opacity-95 text-white font-extrabold text-[11px] shadow-sm cursor-pointer inline-flex items-center gap-1"
                            >
                              <RefreshCw size={13} />
                              <span>Perbaiki Bukti</span>
                            </button>
                          )}
                          {isPending && (
                            <button
                              type="button"
                              onClick={() => handleOpenReuploadModal(purchase)}
                              className="px-2.5 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-[11px] border border-slate-200 cursor-pointer inline-flex items-center gap-1"
                              title="Ganti atau unggah ulang foto bukti transfer jika salah"
                            >
                              <Upload size={12} />
                              <span>Ganti Bukti</span>
                            </button>
                          )}
                          {isPaid && (
                            <span className="text-[11px] text-emerald-600 font-bold inline-flex items-center gap-1 mr-1">
                              <CheckCircle size={14} /> Berhasil
                            </span>
                          )}

                          <button
                            type="button"
                            onClick={() => handleDeletePurchase(purchase.id)}
                            className="p-1.5 rounded-xl text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer border border-transparent hover:border-rose-200"
                            title="Hapus riwayat pembelian ini"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* ── 4B. DAFTAR PERMOHONAN PENCAIRAN SALDO GOLD SAYA (STATUS & PERBAIKI DATA REKENING) ── */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-amber-100 to-yellow-100 text-amber-800 flex items-center justify-center border border-amber-200/60 shadow-2xs">
              <Banknote size={19} />
            </div>
            <div>
              <h3 className="text-base font-extrabold text-slate-900">Permohonan Pencairan Saldo Gold Saya</h3>
              <p className="text-xs text-slate-500">Pantau proses transfer penarikan Poin Gold ke rekening bank atau e-wallet Anda (1 Gold = Rp 1.000)</p>
            </div>
          </div>
          <button
            onClick={() => {
              setSelectedWithdrawalToFix(null);
              setIsWithdrawModalOpen(true);
            }}
            className="px-4 py-2 rounded-xl bg-gradient-to-r from-amber-600 via-yellow-600 to-amber-700 hover:opacity-95 text-white font-extrabold text-xs shadow-xs flex items-center gap-1.5 cursor-pointer self-start sm:self-auto border-0"
          >
            <Plus size={15} strokeWidth={2.5} />
            <span>+ Tarik Saldo Gold</span>
          </button>
        </div>

        {loadingWithdrawals ? (
          <div className="flex items-center justify-center py-12 gap-2 text-slate-400 text-xs font-semibold">
            <Loader2 size={20} className="animate-spin text-amber-500" />
            <span>Memuat data penarikan Gold...</span>
          </div>
        ) : goldWithdrawals.length === 0 ? (
          <div className="text-center py-10 text-slate-400 space-y-2">
            <Banknote size={36} className="mx-auto opacity-40 text-amber-600" />
            <p className="text-xs font-semibold text-slate-500">Belum ada pengajuan pencairan saldo Gold.</p>
            <button
              onClick={() => {
                setSelectedWithdrawalToFix(null);
                setIsWithdrawModalOpen(true);
              }}
              className="text-xs text-amber-700 hover:underline font-bold cursor-pointer inline-flex items-center gap-1"
            >
              <span>Mulai Tarik Saldo Gold Sekarang &rarr;</span>
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto rounded-2xl border border-slate-200">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 uppercase font-bold text-[11px]">
                  <th className="p-3.5">ID &amp; Tanggal</th>
                  <th className="p-3.5">Poin &amp; Nilai Rupiah</th>
                  <th className="p-3.5">Rekening Tujuan</th>
                  <th className="p-3.5">Status Transfer</th>
                  <th className="p-3.5">Catatan / Alasan Admin</th>
                  <th className="p-3.5 text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {goldWithdrawals.map((item) => {
                  const isPending = item.status === "pending";
                  const isPaid = item.status === "paid" || item.status === "approved";
                  const isRejected = item.status === "rejected";

                  return (
                    <tr key={item.id} className="hover:bg-slate-50/70">
                      <td className="p-3.5">
                        <div className="font-mono font-bold text-slate-800">
                          #{item.withdrawal_number || item.id}
                        </div>
                        <div className="text-[10px] text-slate-400">
                          {new Date(item.created_at).toLocaleDateString("id-ID", {
                            day: "numeric",
                            month: "short",
                            year: "numeric",
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </div>
                      </td>

                      <td className="p-3.5">
                        <div className="font-extrabold text-amber-700 flex items-center gap-1">
                          <SuradeCoinIcon size={15} type="gold" />
                          <span>{Number(item.gold_amount).toLocaleString("id-ID")} Gold</span>
                        </div>
                        <div className="text-[11px] font-black text-emerald-700">
                          Rp {Number(item.idr_amount).toLocaleString("id-ID")}
                        </div>
                      </td>

                      <td className="p-3.5">
                        <div className="font-bold text-slate-900 flex items-center gap-1.5 uppercase">
                          <span className="px-1.5 py-0.5 rounded bg-slate-100 text-[10px] text-slate-700 border border-slate-200">
                            {item.bank_name}
                          </span>
                          <span className="font-mono text-xs">{item.account_number}</span>
                        </div>
                        <div className="text-[10.5px] text-slate-500 font-semibold mt-0.5">
                          a.n {item.account_name}
                        </div>
                      </td>

                      <td className="p-3.5">
                        <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold inline-flex items-center gap-1 ${
                          isPaid
                            ? "bg-emerald-100 text-emerald-800 border border-emerald-200"
                            : isPending
                            ? "bg-amber-100 text-amber-800 border border-amber-200"
                            : "bg-rose-100 text-rose-800 border border-rose-200"
                        }`}>
                          {isPaid ? (
                            <>
                              <CheckCircle size={12} className="text-emerald-600" />
                              <span>Telah Ditransfer</span>
                            </>
                          ) : isPending ? (
                            <>
                              <Clock size={12} className="text-amber-600" />
                              <span>Menunggu Transfer</span>
                            </>
                          ) : (
                            <>
                              <AlertCircle size={12} className="text-rose-600" />
                              <span>Ditolak (Refund)</span>
                            </>
                          )}
                        </span>
                      </td>

                      <td className="p-3.5 max-w-[240px]">
                        {isRejected ? (
                          <div className="text-[10.5px] text-rose-700 bg-rose-50 border border-rose-200 p-2 rounded-xl space-y-1">
                            <div>
                              <span className="font-bold">Alasan Admin:</span>{" "}
                              <span className="italic">{item.admin_notes || "Data rekening tidak cocok atau dibatalkan."}</span>
                            </div>
                            <div className="text-[10px] text-emerald-700 font-bold flex items-center gap-1 pt-1 border-t border-rose-100">
                              <CheckCircle size={11} className="text-emerald-600 shrink-0" />
                              <span>Saldo {item.gold_amount} Gold telah dikembalikan utuh ke dompet.</span>
                            </div>
                          </div>
                        ) : isPaid ? (
                          <div className="text-[11px] text-slate-600">
                            {item.admin_notes ? (
                              <p title={item.admin_notes}>{item.admin_notes}</p>
                            ) : (
                              <span className="text-emerald-700 font-semibold">Dana berhasil ditransfer ke rekening</span>
                            )}
                          </div>
                        ) : (
                          <span className="text-[11px] text-amber-700 font-medium italic">
                            Sedang menunggu verifikasi admin
                          </span>
                        )}
                      </td>

                      <td className="p-3.5 text-right whitespace-nowrap">
                        <div className="flex items-center justify-end gap-1.5">
                          {isRejected && (
                            <button
                              type="button"
                              onClick={() => handleOpenFixWithdrawal(item)}
                              className="px-3 py-1.5 rounded-xl bg-gradient-to-r from-amber-600 via-yellow-600 to-amber-700 hover:opacity-95 text-white font-black text-[11px] shadow-sm cursor-pointer inline-flex items-center gap-1 border-0"
                              title="Perbaiki nomor rekening atau data bank yang salah dan tarik ulang"
                            >
                              <RefreshCw size={12} />
                              <span>Perbaiki Rekening</span>
                            </button>
                          )}
                          {isPending && (
                            <span className="text-[11px] text-amber-700 font-bold inline-flex items-center gap-1">
                              <Clock size={12} /> Diproses
                            </span>
                          )}
                          {isPaid && (
                            <span className="text-[11px] text-emerald-600 font-bold inline-flex items-center gap-1 mr-1">
                              <CheckCircle size={14} /> Berhasil
                            </span>
                          )}

                          <button
                            type="button"
                            onClick={() => handleDeleteWithdrawal(item.id, item.status)}
                            className="p-1.5 rounded-xl text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer border border-transparent hover:border-rose-200"
                            title="Hapus riwayat pencairan ini"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* ── 5. RECENT TRANSACTIONS TABLE (5 TERAKHIR) ── */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-sm space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2">
            <History size={20} className="text-[#059669]" />
            <h3 className="text-base font-extrabold text-slate-900">Transaksi Terakhir</h3>
          </div>
          <button
            onClick={() => setIsHistoryModalOpen(true)}
            className="text-xs font-bold text-[#059669] hover:underline flex items-center gap-1 cursor-pointer"
          >
            <span>Lihat Semua Riwayat</span>
            <ChevronRight size={15} />
          </button>
        </div>

        {balanceData.recent_transactions.length === 0 ? (
          <div className="text-center py-12 text-slate-400 space-y-2">
            <SuradeCoinIcon size={36} className="mx-auto opacity-50" />
            <p className="text-xs font-bold text-slate-500">Belum ada aktivitas transaksi poin.</p>
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {balanceData.recent_transactions.map((tx) => {
              const isCredit = tx.type === "credit";
              return (
                <div key={tx.id} className="py-3.5 flex items-center justify-between gap-3 hover:bg-slate-50/60 px-2 rounded-xl transition-colors">
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-10 h-10 rounded-2xl flex items-center justify-center shrink-0 shadow-xs ${
                        isCredit ? "bg-emerald-100 text-emerald-700" : "bg-rose-100 text-rose-700"
                      }`}
                    >
                      {isCredit ? <ArrowDownLeft size={20} strokeWidth={2.5} /> : <ArrowUpRight size={20} strokeWidth={2.5} />}
                    </div>
                    <div>
                      <h5 className="text-xs font-extrabold text-slate-900">{tx.service_name || tx.description}</h5>
                      <span className="text-[11px] text-slate-400">
                        {new Date(tx.created_at).toLocaleDateString("id-ID", {
                          day: "numeric",
                          month: "short",
                          year: "numeric",
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </span>
                    </div>
                  </div>

                  <div className="text-right">
                    <div className="flex items-center gap-1.5 justify-end">
                      <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded uppercase ${
                        (tx.coin_type || "silver") === "gold"
                          ? "bg-amber-100 text-amber-800 border border-amber-300"
                          : "bg-slate-100 text-slate-700 border border-slate-300"
                      }`}>
                        {tx.coin_type || "silver"}
                      </span>
                      <span
                        className={`text-sm font-black flex items-center gap-1 ${
                          isCredit ? "text-emerald-600" : "text-rose-600"
                        }`}
                      >
                        <span>{isCredit ? "+" : "-"}{Number(tx.amount).toLocaleString("id-ID")}</span>
                        <SuradeCoinIcon size={16} type={tx.coin_type || "silver"} />
                      </span>
                    </div>
                    <span className="text-[10.5px] text-slate-400 block font-medium mt-0.5">
                      Saldo: {Number(tx.balance_after).toLocaleString("id-ID")}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* ── 6. RESMI PANDUAN, INFOGRAFIS & KEUNTUNGAN PENGGUNAAN POIN (PALING BAWAH) ── */}
      <div className="bg-white rounded-3xl p-6 sm:p-7 border border-slate-200/80 shadow-sm space-y-6">
        {/* Official Infographic Banner Header (Clickable to open Panduan) */}
        <div
          onClick={() => setIsGuideModalOpen(true)}
          className="relative rounded-2xl sm:rounded-3xl overflow-hidden shadow-md border border-emerald-500/20 cursor-pointer group transition-all duration-300 hover:shadow-xl hover:scale-[1.005]"
        >
          <img
            src="/images/surade-poin-banner.png"
            alt="Surade Poin - Top Up Serba Mudah Untuk Kebutuhanmu!"
            className="w-full h-auto object-cover rounded-2xl sm:rounded-3xl"
          />
          <div className="absolute top-3 right-3 sm:top-4 sm:right-4">
            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-slate-950/80 hover:bg-slate-950 text-white font-bold text-[11px] sm:text-xs shadow-lg backdrop-blur-md border border-white/20 group-hover:scale-105 transition-transform">
              <Sparkles size={13} className="text-amber-400" />
              <span>Buka Panduan ↗</span>
            </span>
          </div>
        </div>

        {/* Benefits Breakdown Section */}
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-3">
            <div>
              <h3 className="text-base sm:text-lg font-black text-slate-900 flex items-center gap-2">
                <Sparkles size={20} className="text-amber-500 animate-pulse" />
                Keuntungan Menggunakan Poin Surade
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Nikmati kemudahan transaksi digital serba cepat, hemat biaya, dan tanpa repot transfer berulang untuk seluruh layanan platform Surade.com.
              </p>
            </div>

            {/* Single Button: Panduan & Tarif Poin */}
            <button
              type="button"
              onClick={() => setIsGuideModalOpen(true)}
              className="px-5 py-2.5 rounded-2xl bg-gradient-to-r from-emerald-600 via-[#007570] to-teal-700 hover:opacity-95 text-white font-extrabold text-xs shadow-md flex items-center gap-2 transition-all cursor-pointer border-0 shrink-0 self-start sm:self-auto"
            >
              <span>Panduan &amp; Tarif Poin</span>
              <ChevronRight size={16} />
            </button>
          </div>

          {/* 4 Main Core Benefits of Using Poin */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* 1. Transaksi Instan */}
            <div className="p-5 rounded-2xl bg-gradient-to-br from-emerald-50 via-white to-emerald-50/40 border border-emerald-200/80 space-y-3 hover:border-emerald-400 transition-all shadow-2xs">
              <div className="flex items-center justify-between">
                <div className="w-10 h-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center font-black text-xs shadow-xs">
                  <Zap size={20} className="fill-white" />
                </div>
                <span className="text-[11px] font-black text-emerald-800 bg-emerald-100/90 border border-emerald-200 px-2.5 py-0.5 rounded-full">
                  Serba Instan
                </span>
              </div>
              <h5 className="font-extrabold text-xs sm:text-sm text-slate-900 leading-snug">Transaksi Cepat &amp; 1-Klik Aktif!</h5>
              <div className="text-[11.5px] text-slate-600 space-y-1.5 leading-relaxed">
                <p><strong>Keuntungan Pakai Poin:</strong></p>
                <p>• Layanan langsung aktif dan terverifikasi otomatis dalam 1 detik tanpa perlu upload struk transfer berulang kali.</p>
                <p>• Tidak perlu menunggu konfirmasi admin secara manual setiap kali mengaktifkan fitur.</p>
                <p>• Pengalaman bertransaksi yang mulus, praktis, dan modern kapan pun Anda butuhkan.</p>
              </div>
            </div>

            {/* 2. Nilai Transparan */}
            <div className="p-5 rounded-2xl bg-gradient-to-br from-amber-50 via-white to-amber-50/40 border border-amber-200/80 space-y-3 hover:border-amber-400 transition-all shadow-2xs">
              <div className="flex items-center justify-between">
                <div className="w-10 h-10 rounded-xl bg-amber-500 text-slate-950 flex items-center justify-center font-black text-xs shadow-xs">
                  <Coins size={20} />
                </div>
                <span className="text-[11px] font-black text-amber-900 bg-amber-100/90 border border-amber-200 px-2.5 py-0.5 rounded-full">
                  1 Poin = Rp 1.000
                </span>
              </div>
              <h5 className="font-extrabold text-xs sm:text-sm text-slate-900 leading-snug">Nilai Jelas &amp; Terstandarisasi!</h5>
              <div className="text-[11.5px] text-slate-600 space-y-1.5 leading-relaxed">
                <p><strong>Keuntungan Pakai Poin:</strong></p>
                <p>• Konversi tarif sangat mudah: setiap <strong>1 Poin = Rp 1.000 (seribu rupiah)</strong>.</p>
                <p>• Tarif seluruh layanan (Usaha, Iklan, Event, WA) disesuaikan persis dengan nominal ribuan Rupiahnya.</p>
                <p>• Perhitungan biaya transparan tanpa ada biaya tersembunyi atau pemotongan misterius.</p>
              </div>
            </div>

            {/* 3. Hemat & Bebas Admin */}
            <div className="p-5 rounded-2xl bg-gradient-to-br from-blue-50 via-white to-blue-50/40 border border-blue-200/80 space-y-3 hover:border-blue-400 transition-all shadow-2xs">
              <div className="flex items-center justify-between">
                <div className="w-10 h-10 rounded-xl bg-blue-600 text-white flex items-center justify-center font-black text-xs shadow-xs">
                  <ShieldCheck size={20} />
                </div>
                <span className="text-[11px] font-black text-blue-800 bg-blue-100/90 border border-blue-200 px-2.5 py-0.5 rounded-full">
                  Bebas Biaya Admin
                </span>
              </div>
              <h5 className="font-extrabold text-xs sm:text-sm text-slate-900 leading-snug">Bebas Admin &amp; Bonus Top Up!</h5>
              <div className="text-[11.5px] text-slate-600 space-y-1.5 leading-relaxed">
                <p><strong>Keuntungan Pakai Poin:</strong></p>
                <p>• Bebas dari potongan biaya administrasi perbankan di setiap transaksi aktivasi fitur.</p>
                <p>• Tersedia paket Top Up resmi dengan bonus ekstra poin untuk nilai keuntungan lebih berlipat.</p>
                <p>• Menghemat pengeluaran operasional dan biaya promosi usaha Anda secara nyata.</p>
              </div>
            </div>

            {/* 4. Fleksibel & Saldo Abadi */}
            <div className="p-5 rounded-2xl bg-gradient-to-br from-purple-50 via-white to-purple-50/40 border border-purple-200/80 space-y-3 hover:border-purple-400 transition-all shadow-2xs">
              <div className="flex items-center justify-between">
                <div className="w-10 h-10 rounded-xl bg-purple-600 text-white flex items-center justify-center font-black text-xs shadow-xs">
                  <Crown size={20} />
                </div>
                <span className="text-[11px] font-black text-purple-800 bg-purple-100/90 border border-purple-200 px-2.5 py-0.5 rounded-full">
                  Tidak Pernah Hangus
                </span>
              </div>
              <h5 className="font-extrabold text-xs sm:text-sm text-slate-900 leading-snug">Saldo Abadi &amp; Multi-Layanan!</h5>
              <div className="text-[11.5px] text-slate-600 space-y-1.5 leading-relaxed">
                <p><strong>Keuntungan Pakai Poin:</strong></p>
                <p>• Saldo Poin tidak memiliki batas masa berlaku dan tersimpan aman di akun selamanya.</p>
                <p>• Fleksibel digunakan kapan saja untuk Promosi Usaha, Pasang Iklan, Publikasi Event, maupun Kontak WA.</p>
                <p>• Kebebasan penuh merencanakan dan mengatur strategi promosi usaha Anda.</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── ALL MODALS ── */}
      <BuyCoinModal
        isOpen={isBuyModalOpen}
        onClose={() => setIsBuyModalOpen(false)}
        onSuccess={handleCoinPurchased}
        currentBalance={balanceData.balance}
        initialCoinType={buyModalInitialType}
      />

      <GoldWithdrawModal
        isOpen={isWithdrawModalOpen}
        onClose={() => setIsWithdrawModalOpen(false)}
        goldBalance={balanceData.gold_balance || 0}
        onSuccess={() => {
          fetchCoinData();
          fetchGoldWithdrawals();
        }}
      />

      <CoinHistoryModal
        isOpen={isHistoryModalOpen}
        onClose={() => setIsHistoryModalOpen(false)}
      />

      <CoinGuideModal
        isOpen={isGuideModalOpen}
        onClose={() => setIsGuideModalOpen(false)}
      />

      {/* ── MODAL UPLOAD ULANG BUKTI PEMBAYARAN (PERBAIKAN) ── */}
      {reuploadModalOpen && selectedPurchaseToFix && (typeof document !== "undefined" ? createPortal(
        <div className="fixed inset-0 z-[99999] bg-slate-950/80 backdrop-blur-xs flex items-center justify-center p-4 animate-fade-in font-['Poppins',sans-serif]">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-amber-300 space-y-4 max-h-[92vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2 text-amber-600">
                <RefreshCw size={22} className="text-amber-500" />
                <div>
                  <h3 className="font-extrabold text-base text-slate-900">Perbaiki Bukti Pembayaran</h3>
                  <p className="text-[11px] text-slate-500">Pesanan #{selectedPurchaseToFix.order_number}</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setReuploadModalOpen(false)}
                className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 flex items-center justify-center cursor-pointer"
              >
                <X size={16} />
              </button>
            </div>

            {/* Previous rejection alert */}
            {selectedPurchaseToFix.admin_notes && (
              <div className="p-3 rounded-2xl bg-rose-50 border border-rose-200 text-xs text-rose-800 space-y-1">
                <span className="font-extrabold flex items-center gap-1 text-rose-700">
                  <AlertCircle size={14} />
                  Catatan Penolakan Sebelumnya:
                </span>
                <p className="italic bg-white/70 p-2 rounded-xl border border-rose-200">
                  "{selectedPurchaseToFix.admin_notes}"
                </p>
                <p className="text-[11px] text-rose-600">
                  Silakan unggah foto bukti transfer yang jelas, tidak terpotong, dan sesuai dengan nominal tagihan.
                </p>
              </div>
            )}

            {/* Brief order summary */}
            <div className="p-3 bg-amber-50/60 rounded-2xl border border-amber-200 text-xs space-y-1">
              <div className="flex items-center justify-between">
                <span className="text-slate-600">Paket Poin:</span>
                <strong className="text-amber-800">{Number(selectedPurchaseToFix.total_coin).toLocaleString("id-ID")} Poin</strong>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-600">Total Tagihan:</span>
                <strong className="text-[#007570] font-black">Rp {Number(selectedPurchaseToFix.price_idr).toLocaleString("id-ID")}</strong>
              </div>
            </div>

            <form onSubmit={handleSubmitReupload} className="space-y-4 text-xs">
              {/* File Upload Area */}
              <div>
                <label className="font-bold text-slate-800 block mb-1">
                  Upload Foto Bukti Transfer Baru <span className="text-rose-500">* (Wajib)</span>
                </label>
                <input
                  type="file"
                  accept="image/*"
                  id="new-proof-input"
                  className="hidden"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) {
                      setNewProofFile(file);
                      setNewProofPreview(URL.createObjectURL(file));
                    }
                  }}
                />

                {!newProofPreview ? (
                  <label
                    htmlFor="new-proof-input"
                    className="flex flex-col items-center justify-center p-6 border-2 border-dashed border-amber-300 rounded-2xl bg-amber-50/30 hover:bg-amber-50/70 transition-colors cursor-pointer text-center group"
                  >
                    <div className="w-12 h-12 rounded-2xl bg-amber-100 text-amber-600 flex items-center justify-center mb-2 group-hover:scale-110 transition-transform">
                      <Upload size={22} />
                    </div>
                    <span className="font-bold text-slate-800 text-xs">Klik untuk Pilih Foto Struk / Bukti Transfer</span>
                    <span className="text-[11px] text-slate-400 mt-1">Format JPG, PNG, atau JPEG (Maks. 10MB)</span>
                  </label>
                ) : (
                  <div className="relative rounded-2xl overflow-hidden border-2 border-emerald-500 bg-slate-50 p-2 text-center">
                    <img
                      src={newProofPreview}
                      alt="Preview Bukti Baru"
                      className="max-h-56 mx-auto object-contain rounded-xl"
                    />
                    <button
                      type="button"
                      onClick={() => {
                        setNewProofFile(null);
                        setNewProofPreview(null);
                      }}
                      className="absolute top-3 right-3 w-7 h-7 rounded-full bg-rose-600 text-white flex items-center justify-center cursor-pointer shadow-md hover:bg-rose-700"
                      title="Hapus foto"
                    >
                      <X size={15} />
                    </button>
                    <span className="text-[10.5px] text-emerald-700 font-bold block mt-1.5 flex items-center justify-center gap-1">
                      <Check size={12} /> Foto baru siap dikirim
                    </span>
                  </div>
                )}
              </div>

              {/* Sender Details */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Nama Pemilik Rekening / E-Wallet</label>
                  <input
                    type="text"
                    placeholder="Misal: Budi Santoso"
                    value={newSenderName}
                    onChange={(e) => setNewSenderName(e.target.value)}
                    className="w-full h-9 px-3 border border-slate-300 rounded-xl"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Nama Bank / E-Wallet Pengirim</label>
                  <input
                    type="text"
                    placeholder="Misal: BCA / GoPay / DANA"
                    value={newSenderBank}
                    onChange={(e) => setNewSenderBank(e.target.value)}
                    className="w-full h-9 px-3 border border-slate-300 rounded-xl"
                  />
                </div>
              </div>

              <div className="pt-3 border-t border-slate-100 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setReuploadModalOpen(false)}
                  className="px-4 py-2 border border-slate-300 rounded-xl font-bold text-slate-600 hover:bg-slate-50 cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={submittingReupload || !newProofFile}
                  className="px-5 py-2.5 bg-gradient-to-r from-emerald-600 to-teal-700 hover:opacity-95 text-white font-extrabold rounded-xl flex items-center gap-1.5 cursor-pointer disabled:opacity-50 shadow-md border-0"
                >
                  {submittingReupload ? <Loader2 size={15} className="animate-spin" /> : <Upload size={15} />}
                  <span>Kirim Ulang Bukti Bayar</span>
                </button>
              </div>
            </form>
          </div>
        </div>,
        document.body
      ) : null)}

      {/* ── PREVIEW PROOF IMAGE MODAL ── */}
      {previewProof && (typeof document !== "undefined" ? createPortal(
        <div
          onClick={() => setPreviewProof(null)}
          className="fixed inset-0 z-[99999] bg-black/85 backdrop-blur-md flex items-center justify-center p-4 animate-fade-in font-['Poppins',sans-serif]"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="bg-white rounded-3xl p-4 max-w-md w-full shadow-2xl relative text-center"
          >
            <button
              onClick={() => setPreviewProof(null)}
              className="absolute top-3 right-3 w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-700 flex items-center justify-center cursor-pointer"
            >
              <X size={16} />
            </button>
            <h4 className="font-bold text-slate-800 text-xs mb-3 text-left">Bukti Transfer Pembayaran</h4>
            <div className="bg-slate-50 rounded-2xl p-2 border border-slate-200 flex items-center justify-center">
              <img
                src={previewProof}
                alt="Bukti Transfer"
                className="max-h-[70vh] object-contain rounded-xl"
              />
            </div>
          </div>
        </div>,
        document.body
      ) : null)}
      {/* ── MODAL PENARIKAN SALDO GOLD (AJUKAN BARU / PERBAIKI REKENING) ── */}
      <GoldWithdrawModal
        isOpen={isWithdrawModalOpen}
        onClose={() => {
          setIsWithdrawModalOpen(false);
          setSelectedWithdrawalToFix(null);
        }}
        goldBalance={balanceData.gold_balance || 0}
        initialData={selectedWithdrawalToFix}
        onSuccess={() => {
          fetchCoinData();
          fetchGoldWithdrawals();
        }}
      />
    </div>
  );
}
