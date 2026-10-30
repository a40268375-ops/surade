import React, { useState, useEffect, useMemo } from "react";
import api from "../../../services/api";
import SuradeLoader from "../../../components/SuradeLoader";
import {
  PhoneCall,
  Shield,
  HeartPulse,
  Flame,
  Building2,
  Zap,
  Search,
  Plus,
  Edit2,
  Trash2,
  CheckCircle2,
  XCircle,
  AlertCircle,
  AlertTriangle,
  Loader2,
  Sparkles,
  Phone,
  MessageCircle,
  MapPin,
  Clock,
  RefreshCw,
  X,
  Check,
  Send,
  User,
  HelpCircle,
} from "lucide-react";

const CATEGORIES = [
  { id: "all", label: "Semua", icon: Sparkles },
  { id: "darurat", label: "Hotline Darurat", icon: AlertCircle, color: "rose" },
  { id: "keamanan", label: "Polisi & Keamanan", icon: Shield, color: "blue" },
  { id: "medis", label: "Medis & Ambulans", icon: HeartPulse, color: "emerald" },
  { id: "bencana", label: "Damkar & Bencana", icon: Flame, color: "orange" },
  { id: "pemerintahan", label: "Pemerintahan & Desa", icon: Building2, color: "purple" },
  { id: "utilitas", label: "PLN, PDAM & Derek/Bengkel", icon: Zap, color: "amber" },
];

const VILLAGES = [
  "Semua Wilayah",
  "Kecamatan Surade",
  "Desa Buniwangi",
  "Desa Cipeundeuy",
  "Desa Citanglar",
  "Desa Gunungbatu",
  "Desa Jagamukti",
  "Desa Kadaung",
  "Desa Kademangan",
  "Desa Pasiripis",
  "Desa Sirnasari",
  "Desa Sukatani",
  "Kelurahan Surade",
  "Desa Wanasari",
];

export default function AdminNomorPentingTab() {
  const [numbers, setNumbers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [selectedVillage, setSelectedVillage] = useState("Semua Wilayah");
  const [selectedStatus, setSelectedStatus] = useState("all");

  // Modal State (Add / Edit)
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState("");
  const [toastMessage, setToastMessage] = useState("");

  // Verification Action Modal (Setujui / Perbaiki / Tolak)
  const [verifyModal, setVerifyModal] = useState({
    open: false,
    type: "approve", // 'approve' | 'revision' | 'reject'
    item: null,
    notes: "",
    submitting: false,
    error: "",
  });

  // Delete Modal State
  const [deleteItem, setDeleteItem] = useState(null);
  const [deleting, setDeleting] = useState(false);

  // Form State
  const initialForm = {
    name: "",
    phone: "",
    phone_display: "",
    whatsapp: "",
    category: "keamanan",
    village_name: "Kecamatan Surade",
    description: "",
    address: "",
    status_label: "24 Jam Siaga",
    order: 0,
    is_active: true,
  };
  const [formData, setFormData] = useState(initialForm);

  const fetchNumbers = async () => {
    setLoading(true);
    try {
      const res = await api.get("/admin/important-numbers?limit=150");
      const list = res.data?.data || (Array.isArray(res.data) ? res.data : []);
      setNumbers(list);
    } catch (err) {
      console.error("Gagal memuat nomor penting:", err);
      showToast("Gagal memuat data nomor penting.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNumbers();
  }, []);

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(""), 3500);
  };

  const handleOpenAddModal = () => {
    setEditingItem(null);
    setFormError("");
    const maxOrder = numbers.reduce((max, item) => Math.max(max, item.order || 0), 0);
    setFormData({
      ...initialForm,
      order: maxOrder + 1,
    });
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (item) => {
    setEditingItem(item);
    setFormError("");
    setFormData({
      name: item.name || "",
      phone: item.phone || "",
      phone_display: item.phone_display || item.phone || "",
      whatsapp: item.whatsapp || "",
      category: item.category || "keamanan",
      village_name: item.village_name || "Kecamatan Surade",
      description: item.description || "",
      address: item.address || "",
      status_label: item.status_label || "24 Jam Siaga",
      order: item.order ?? 0,
      is_active: Boolean(item.is_active),
    });
    setIsModalOpen(true);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setFormError("");

    if (!formData.name.trim()) {
      setFormError("Nama layanan / instansi wajib diisi.");
      return;
    }
    if (!formData.phone.trim()) {
      setFormError("Nomor telepon wajib diisi.");
      return;
    }

    setSubmitting(true);
    try {
      const payload = {
        ...formData,
        phone_display: formData.phone_display.trim() || formData.phone.trim(),
        order: parseInt(formData.order) || 0,
      };

      if (editingItem) {
        await api.put(`/admin/important-numbers/${editingItem.id}`, payload);
        showToast(`Nomor "${formData.name}" berhasil diperbarui.`);
      } else {
        await api.post("/admin/important-numbers", payload);
        showToast(`Nomor "${formData.name}" berhasil ditambahkan.`);
      }

      setIsModalOpen(false);
      fetchNumbers();
    } catch (err) {
      console.error("Gagal menyimpan nomor penting:", err);
      setFormError(
        err.response?.data?.message ||
        "Terjadi kesalahan saat menyimpan nomor penting."
      );
    } finally {
      setSubmitting(false);
    }
  };

  // ═════════ VERIFICATION ACTIONS (SETUJUI, PERBAIKI, TOLAK) ═════════
  const handleOpenVerifyModal = (item, type) => {
    setVerifyModal({
      open: true,
      type,
      item,
      notes: item.admin_notes || "",
      submitting: false,
      error: "",
    });
  };

  const handleConfirmVerification = async () => {
    const { item, type, notes } = verifyModal;
    if (!item) return;

    if ((type === "revision" || type === "reject") && (!notes || notes.trim().length < 5)) {
      setVerifyModal((prev) => ({
        ...prev,
        error: type === "revision"
          ? "Catatan perbaikan minimal 5 karakter agar penjual tahu apa yang harus diperbaiki."
          : "Alasan penolakan minimal 5 karakter.",
      }));
      return;
    }

    setVerifyModal((prev) => ({ ...prev, submitting: true, error: "" }));

    try {
      let res;
      if (type === "approve") {
        res = await api.put(`/admin/important-numbers/${item.id}/approve`);
        showToast(`Nomor "${item.name}" berhasil disetujui & aktif di portal!`);
      } else if (type === "revision") {
        res = await api.put(`/admin/important-numbers/${item.id}/revision`, {
          admin_notes: notes.trim(),
        });
        showToast(`Permintaan perbaikan dikirim ke penjual.`);
      } else if (type === "reject") {
        res = await api.put(`/admin/important-numbers/${item.id}/reject`, {
          admin_notes: notes.trim(),
        });
        showToast(`Pengajuan nomor "${item.name}" ditolak.`);
      }

      const updated = res?.data?.data;
      if (updated) {
        setNumbers((prev) => prev.map((n) => (n.id === updated.id ? updated : n)));
      } else {
        fetchNumbers();
      }

      setVerifyModal({ open: false, type: "approve", item: null, notes: "", submitting: false, error: "" });
    } catch (err) {
      console.error("Gagal memproses verifikasi:", err);
      const msg = err.response?.data?.message || "Gagal memproses verifikasi.";
      setVerifyModal((prev) => ({ ...prev, submitting: false, error: msg }));
    }
  };

  const handleToggleStatus = async (item) => {
    try {
      const res = await api.put(`/admin/important-numbers/${item.id}/toggle-status`);
      const newStatus = res.data?.data?.is_active ?? !item.is_active;
      setNumbers((prev) =>
        prev.map((n) => (n.id === item.id ? { ...n, is_active: newStatus } : n))
      );
      showToast(
        `Nomor "${item.name}" sekarang ${newStatus ? "AKTIF" : "NONAKTIF"}.`
      );
    } catch (err) {
      console.error("Gagal mengubah status:", err);
      showToast("Gagal mengubah status nomor penting.");
    }
  };

  const handleDelete = async () => {
    if (!deleteItem) return;
    setDeleting(true);
    try {
      await api.delete(`/admin/important-numbers/${deleteItem.id}`);
      setNumbers((prev) => prev.filter((n) => n.id !== deleteItem.id));
      showToast(`Nomor "${deleteItem.name}" berhasil dihapus.`);
      setDeleteItem(null);
    } catch (err) {
      console.error("Gagal menghapus:", err);
      showToast("Gagal menghapus nomor penting.");
    } finally {
      setDeleting(false);
    }
  };

  // Filtered List
  const filteredNumbers = useMemo(() => {
    const q = searchQuery.toLowerCase().trim();
    return numbers.filter((item) => {
      // Category filter
      if (selectedCategory !== "all" && item.category !== selectedCategory) {
        return false;
      }
      // Village filter
      if (selectedVillage !== "Semua Wilayah") {
        if (!item.village_name || !item.village_name.toLowerCase().includes(selectedVillage.toLowerCase())) {
          return false;
        }
      }
      // Status filter
      if (selectedStatus === "active" && !item.is_active) return false;
      if (selectedStatus === "inactive" && item.is_active) return false;
      if (selectedStatus === "pending" && item.status !== "pending") return false;
      if (selectedStatus === "needs_revision" && item.status !== "needs_revision") return false;
      if (selectedStatus === "approved" && item.status !== "approved" && item.status !== null) return false;
      if (selectedStatus === "rejected" && item.status !== "rejected") return false;

      // Search query
      if (q) {
        const matchName = (item.name || "").toLowerCase().includes(q);
        const matchPhone = (item.phone || "").includes(q) || (item.phone_display || "").includes(q);
        const matchDesc = (item.description || "").toLowerCase().includes(q);
        const matchVillage = (item.village_name || "").toLowerCase().includes(q);
        const matchAddress = (item.address || "").toLowerCase().includes(q);
        const matchUser = item.user && ((item.user.name || "").toLowerCase().includes(q) || (item.user.email || "").toLowerCase().includes(q));
        if (!matchName && !matchPhone && !matchDesc && !matchVillage && !matchAddress && !matchUser) {
          return false;
        }
      }

      return true;
    }).sort((a, b) => {
      // 1. Pending (Menunggu Verifikasi) ALWAYS AT TOP
      const rank = (item) => {
        if (item.status === "pending") return 0;
        if (item.status === "needs_revision") return 1;
        return 2;
      };
      const rankA = rank(a);
      const rankB = rank(b);
      if (rankA !== rankB) return rankA - rankB;

      // 2. Newest ID first so newly submitted items are at the top
      return (b.id || 0) - (a.id || 0);
    });
  }, [numbers, searchQuery, selectedCategory, selectedVillage, selectedStatus]);

  // Statistics
  const stats = useMemo(() => {
    const total = numbers.length;
    const active = numbers.filter((n) => n.is_active).length;
    const pending = numbers.filter((n) => n.status === "pending").length;
    const needsRevision = numbers.filter((n) => n.status === "needs_revision").length;
    const approved = numbers.filter((n) => n.status === "approved" || (!n.status && n.is_verified)).length;
    const rejected = numbers.filter((n) => n.status === "rejected").length;
    const sellerSubmissions = numbers.filter((n) => Boolean(n.user_id)).length;
    return { total, active, pending, needsRevision, approved, rejected, sellerSubmissions };
  }, [numbers]);

  const getCategoryBadge = (cat) => {
    switch (cat) {
      case "keamanan":
        return { label: "Polisi & Keamanan", bg: "bg-blue-50 text-blue-700 border-blue-200", icon: Shield };
      case "medis":
        return { label: "Medis & Ambulans", bg: "bg-emerald-50 text-emerald-700 border-emerald-200", icon: HeartPulse };
      case "bencana":
        return { label: "Damkar & Bencana", bg: "bg-orange-50 text-orange-700 border-orange-200", icon: Flame };
      case "pemerintahan":
        return { label: "Pemerintahan & Desa", bg: "bg-purple-50 text-purple-700 border-purple-200", icon: Building2 };
      case "utilitas":
        return { label: "PLN, PDAM & Derek/Bengkel", bg: "bg-amber-50 text-amber-800 border-amber-200", icon: Zap };
      case "darurat":
      default:
        return { label: "Hotline Darurat", bg: "bg-rose-50 text-rose-700 border-rose-200", icon: AlertCircle };
    }
  };

  const getVerificationBadge = (item) => {
    const st = item.status;
    if (st === "pending") {
      return {
        label: "Menunggu Verifikasi",
        className: "bg-sky-50 text-sky-700 border-sky-300",
        icon: Clock,
      };
    }
    if (st === "needs_revision") {
      return {
        label: "Perlu Perbaikan",
        className: "bg-amber-50 text-amber-800 border-amber-300 animate-pulse",
        icon: AlertTriangle,
      };
    }
    if (st === "rejected") {
      return {
        label: "Ditolak",
        className: "bg-rose-50 text-rose-700 border-rose-200",
        icon: XCircle,
      };
    }
    return {
      label: "Disetujui",
      className: "bg-emerald-50 text-emerald-700 border-emerald-200",
      icon: CheckCircle2,
    };
  };

  return (
    <div className="space-y-6 font-['Poppins',sans-serif]">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-20 right-5 z-50 bg-slate-900 text-white px-4 py-3 rounded-2xl shadow-xl flex items-center gap-3 border border-slate-700 animate-in fade-in slide-in-from-top-4 duration-300">
          <CheckCircle2 size={18} className="text-emerald-400" />
          <span className="text-xs font-semibold">{toastMessage}</span>
        </div>
      )}

      {/* Header Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-[#064e3b] via-[#043d2e] to-[#022c22] text-white p-6 sm:p-8 shadow-xl border border-emerald-800/40">
        <div className="absolute right-0 top-0 translate-x-10 -translate-y-10 w-80 h-80 rounded-full bg-emerald-500/10 blur-3xl pointer-events-none" />
        
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/20 border border-emerald-400/30 text-emerald-300 text-xs font-semibold backdrop-blur-md">
              <PhoneCall size={14} className="animate-pulse" />
              <span>Verifikasi & Direktori Nomor Darurat</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white flex items-center gap-2.5">
              <PhoneCall size={28} className="text-emerald-400" />
              <span>Kelola & Verifikasi Nomor Penting</span>
            </h2>
            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed font-normal">
              Verifikasi pengajuan dari penjual (Setujui, Minta Perbaikan, Tolak) dan kelola nomor resmi darurat di portal <strong className="text-emerald-300 font-semibold">Surade.com</strong>.
            </p>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <button
              type="button"
              onClick={fetchNumbers}
              disabled={loading}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white font-semibold text-xs border border-white/20 transition-all cursor-pointer shadow-sm active:scale-95"
              title="Perbarui Data"
            >
              <RefreshCw size={14} className={loading ? "animate-spin text-emerald-300" : ""} />
              <span>Refresh</span>
            </button>
            <button
              type="button"
              onClick={handleOpenAddModal}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-400 hover:bg-emerald-300 text-slate-950 font-black text-xs sm:text-sm shadow-lg shadow-emerald-950/20 hover:shadow-xl transition-all cursor-pointer hover:scale-[1.02] active:scale-95"
            >
              <Plus size={18} strokeWidth={2.5} />
              <span>Tambah Nomor Baru</span>
            </button>
          </div>
        </div>
      </div>

      {/* Metric Cards Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3.5">
        <div
          onClick={() => setSelectedStatus("all")}
          className={`bg-white rounded-2xl p-4 border transition-all cursor-pointer shadow-xs hover:shadow-md ${
            selectedStatus === "all"
              ? "ring-2 ring-slate-900 border-slate-900 shadow-md scale-[1.02]"
              : "border-slate-200/90 hover:bg-slate-50/70"
          }`}
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-[10px] sm:text-[11px] font-bold text-slate-500 uppercase tracking-wider">
              Total Nomor
            </span>
            <div className="w-8 h-8 rounded-xl bg-slate-100 text-slate-700 flex items-center justify-center font-bold">
              <PhoneCall size={15} />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-black text-slate-900 leading-tight">
            {stats.total}
          </div>
          <span className="text-[11px] text-slate-400 font-medium block mt-1">
            Total Database
          </span>
        </div>

        <div
          onClick={() => setSelectedStatus("pending")}
          className={`bg-white rounded-2xl p-4 border transition-all cursor-pointer shadow-xs hover:shadow-md ${
            selectedStatus === "pending"
              ? "ring-2 ring-sky-500 border-sky-500 shadow-md scale-[1.02]"
              : "border-slate-200/90 hover:bg-sky-50/40"
          }`}
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-[10px] sm:text-[11px] font-bold text-sky-700 uppercase tracking-wider flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-sky-500 animate-pulse" />
              Menunggu Admin
            </span>
            <div className="w-8 h-8 rounded-xl bg-sky-50 text-sky-600 flex items-center justify-center font-bold">
              <Clock size={15} />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-black text-sky-600 leading-tight">
            {stats.pending}
          </div>
          <span className="text-[11px] text-sky-600/80 font-medium block mt-1">
            Perlu Diverifikasi
          </span>
        </div>

        <div
          onClick={() => setSelectedStatus("needs_revision")}
          className={`bg-white rounded-2xl p-4 border transition-all cursor-pointer shadow-xs hover:shadow-md ${
            selectedStatus === "needs_revision"
              ? "ring-2 ring-amber-500 border-amber-500 shadow-md scale-[1.02]"
              : "border-slate-200/90 hover:bg-amber-50/40"
          }`}
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-[10px] sm:text-[11px] font-bold text-amber-700 uppercase tracking-wider flex items-center gap-1">
              <AlertTriangle size={13} />
              Perlu Perbaikan
            </span>
            <div className="w-8 h-8 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center font-bold">
              <AlertTriangle size={15} />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-black text-amber-600 leading-tight">
            {stats.needsRevision}
          </div>
          <span className="text-[11px] text-amber-600/80 font-medium block mt-1">
            Menunggu Penjual
          </span>
        </div>

        <div
          onClick={() => setSelectedStatus("approved")}
          className={`bg-white rounded-2xl p-4 border transition-all cursor-pointer shadow-xs hover:shadow-md ${
            selectedStatus === "approved"
              ? "ring-2 ring-emerald-500 border-emerald-500 shadow-md scale-[1.02]"
              : "border-slate-200/90 hover:bg-emerald-50/40"
          }`}
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-[10px] sm:text-[11px] font-bold text-emerald-700 uppercase tracking-wider flex items-center gap-1">
              <CheckCircle2 size={13} />
              Disetujui
            </span>
            <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold">
              <CheckCircle2 size={15} />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-black text-emerald-600 leading-tight">
            {stats.approved}
          </div>
          <span className="text-[11px] text-emerald-600/80 font-medium block mt-1">
            Aktif Ditayangkan
          </span>
        </div>

        <div
          onClick={() => setSelectedStatus("rejected")}
          className={`bg-white rounded-2xl p-4 border transition-all cursor-pointer shadow-xs hover:shadow-md ${
            selectedStatus === "rejected"
              ? "ring-2 ring-rose-500 border-rose-500 shadow-md scale-[1.02]"
              : "border-slate-200/90 hover:bg-rose-50/40"
          }`}
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-[10px] sm:text-[11px] font-bold text-rose-700 uppercase tracking-wider flex items-center gap-1">
              <XCircle size={13} />
              Ditolak
            </span>
            <div className="w-8 h-8 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center font-bold">
              <XCircle size={15} />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-black text-rose-600 leading-tight">
            {stats.rejected}
          </div>
          <span className="text-[11px] text-rose-600/80 font-medium block mt-1">
            Tidak Memenuhi Syarat
          </span>
        </div>
      </div>

      {/* Filters & Search Bar */}
      <div className="bg-white border border-slate-200/90 rounded-2xl p-4 sm:p-5 shadow-xs space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
          {/* Search Input */}
          <div className="relative md:col-span-2">
            <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Cari nama instansi, nomor telepon, penjual, atau wilayah..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-800 focus:outline-none focus:border-emerald-600 focus:bg-white transition-all"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-0.5"
              >
                <X size={14} />
              </button>
            )}
          </div>

          {/* Village Filter */}
          <div>
            <select
              value={selectedVillage}
              onChange={(e) => setSelectedVillage(e.target.value)}
              className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 focus:outline-none focus:border-emerald-600 transition-all"
            >
              {VILLAGES.map((v) => (
                <option key={v} value={v}>{v}</option>
              ))}
            </select>
          </div>

          {/* Status Filter */}
          <div>
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 focus:outline-none focus:border-emerald-600 transition-all"
            >
              <option value="all">Semua Status</option>
              <option value="pending">🟡 Menunggu Verifikasi</option>
              <option value="needs_revision">🟠 Perlu Perbaikan (Revisi)</option>
              <option value="approved">🟢 Disetujui</option>
              <option value="rejected">🔴 Ditolak</option>
              <option value="active">Status Aktif Saja</option>
              <option value="inactive">Status Nonaktif Saja</option>
            </select>
          </div>
        </div>

        {/* Category Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-2 scrollbar-thin">
          {CATEGORIES.map((cat) => {
            const isActive = selectedCategory === cat.id;
            const IconComponent = cat.icon;
            const catCount = cat.id === "all" ? numbers.length : numbers.filter((n) => n.category === cat.id).length;
            return (
              <button
                key={cat.id}
                type="button"
                onClick={() => setSelectedCategory(cat.id)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap flex items-center gap-1.5 transition-all cursor-pointer ${
                  isActive
                    ? "bg-emerald-600 text-white shadow-xs"
                    : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                }`}
              >
                {IconComponent && <IconComponent size={13} />}
                <span>{cat.label}</span>
                <span
                  className={`text-[10.5px] px-1.5 py-0.2 rounded-full font-extrabold ${
                    isActive ? "bg-white/20 text-white" : "bg-slate-200/80 text-slate-600"
                  }`}
                >
                  {catCount}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Table List */}
      <div className="bg-white border border-slate-200/90 rounded-2xl shadow-xs overflow-hidden">
        {loading ? (
          <div className="p-8">
            <SuradeLoader
              variant="section"
              size="md"
              text="Memuat daftar nomor penting..."
              minHeight="180px"
            />
          </div>
        ) : filteredNumbers.length === 0 ? (
          <div className="flex flex-col items-center justify-center p-14 text-center space-y-3">
            <div className="w-14 h-14 rounded-2xl bg-slate-100 text-slate-400 flex items-center justify-center">
              <PhoneCall size={28} />
            </div>
            <h4 className="text-sm font-bold text-slate-800">Tidak ada nomor penting yang cocok</h4>
            <p className="text-xs text-slate-400 max-w-sm">
              Coba sesuaikan kata kunci pencarian atau ganti filter kategori/wilayah di atas.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                  <th className="py-3.5 px-4 w-12 text-center">No</th>
                  <th className="py-3.5 px-4">Nama Layanan & Pengaju</th>
                  <th className="py-3.5 px-4">Nomor Telepon</th>
                  <th className="py-3.5 px-4">Kategori & Wilayah</th>
                  <th className="py-3.5 px-4 text-center">Status Verifikasi</th>
                  <th className="py-3.5 px-4 text-center">Aktif / Tayang</th>
                  <th className="py-3.5 px-4 text-right">Aksi Admin</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs">
                {filteredNumbers.map((item, idx) => {
                  const catBadge = getCategoryBadge(item.category);
                  const Icon = catBadge.icon;
                  const vBadge = getVerificationBadge(item);
                  const VIcon = vBadge.icon;
                  const isPending = item.status === "pending";
                  const isRevision = item.status === "needs_revision";
                  const isApproved = item.status === "approved" || (!item.status && item.is_verified);

                  return (
                    <tr
                      key={item.id}
                      className={`hover:bg-slate-50/80 transition-colors ${
                        isPending ? "bg-sky-50/20" : isRevision ? "bg-amber-50/20" : ""
                      }`}
                    >
                      {/* Urutan */}
                      <td className="py-3.5 px-4 text-center text-slate-400 font-bold">
                        {item.order ?? idx + 1}
                      </td>

                      {/* Info Layanan & Pengaju */}
                      <td className="py-3.5 px-4">
                        <div className="flex items-start gap-2.5 max-w-md">
                          <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 mt-0.5 ${catBadge.bg}`}>
                            <Icon size={16} />
                          </div>
                          <div className="min-w-0 space-y-1">
                            <h4 className="font-bold text-slate-900 text-sm leading-snug">{item.name}</h4>
                            
                            {/* Submitter info */}
                            {item.user ? (
                              <div className="flex items-center gap-1.5 text-[11px] text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded-md border border-indigo-100 w-fit">
                                <User size={11} className="text-indigo-600" />
                                <span className="font-semibold">Penjual: {item.user.name}</span>
                              </div>
                            ) : (
                              <span className="text-[10px] font-bold text-slate-500 bg-slate-100 px-2 py-0.5 rounded-md inline-block">
                                Resmi Pemkab / Kecamatan
                              </span>
                            )}

                            {item.description && (
                              <p className="text-[11.5px] text-slate-500 line-clamp-2 leading-relaxed">
                                {item.description}
                              </p>
                            )}

                            {/* Catatan Admin jika ada */}
                            {(isRevision || item.status === "rejected") && item.admin_notes && (
                              <div className="text-[11px] text-amber-900 bg-amber-100/70 p-2 rounded-lg border border-amber-200 mt-1">
                                <span className="font-bold block">
                                  {isRevision ? "Catatan Perbaikan:" : "Alasan Penolakan:"}
                                </span>
                                {item.admin_notes}
                              </div>
                            )}
                          </div>
                        </div>
                      </td>

                      {/* Nomor Telepon */}
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <div className="space-y-1.5">
                          <a
                            href={`tel:${item.phone}`}
                            className="inline-flex items-center gap-1.5 font-bold text-emerald-600 hover:underline bg-teal-50 px-2.5 py-1 rounded-lg border border-teal-200/80 shadow-2xs text-xs"
                            title="Klik untuk tes panggilan"
                          >
                            <Phone size={12} />
                            <span>{item.phone_display || item.phone}</span>
                          </a>
                          {item.whatsapp && (
                            <a
                              href={`https://wa.me/${item.whatsapp}`}
                              target="_blank"
                              rel="noreferrer"
                              className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200 block w-fit"
                            >
                              <MessageCircle size={11} />
                              <span>WA: {item.whatsapp}</span>
                            </a>
                          )}
                          <span className="text-[10.5px] text-slate-400 block font-medium">
                            {item.status_label || "24 Jam Siaga"}
                          </span>
                        </div>
                      </td>

                      {/* Kategori & Wilayah */}
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <div className="space-y-1">
                          <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10.5px] font-bold border ${catBadge.bg}`}>
                            {catBadge.label}
                          </span>
                          <p className="text-[11px] font-semibold text-slate-700">
                            {item.village_name || "Kecamatan Surade"}
                          </p>
                        </div>
                      </td>

                      {/* Status Verifikasi Badge */}
                      <td className="py-3.5 px-4 text-center whitespace-nowrap">
                        <span
                          className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold border ${vBadge.className}`}
                        >
                          <VIcon size={12} />
                          <span>{vBadge.label}</span>
                        </span>
                      </td>

                      {/* Status Aktif Toggle */}
                      <td className="py-3.5 px-4 text-center whitespace-nowrap">
                        <button
                          type="button"
                          onClick={() => handleToggleStatus(item)}
                          className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-[11px] font-extrabold transition-all cursor-pointer border ${
                            item.is_active
                              ? "bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100"
                              : "bg-slate-100 text-slate-500 border-slate-200 hover:bg-slate-200"
                          }`}
                          title="Klik untuk mengubah status aktif/nonaktif"
                        >
                          <span className={`w-2 h-2 rounded-full ${item.is_active ? "bg-emerald-500 animate-pulse" : "bg-slate-400"}`} />
                          <span>{item.is_active ? "Aktif" : "Nonaktif"}</span>
                        </button>
                      </td>

                      {/* Actions */}
                      <td className="py-3.5 px-4 text-right whitespace-nowrap">
                        <div className="flex items-center justify-end gap-1.5">
                          {/* JIKA BELUM DISETUJUI: TAMPILKAN TOMBOL VERIFIKASI */}
                          {!isApproved && (
                            <>
                              {/* Tombol SETUJUI: untuk pending, needs_revision, atau rejected */}
                              <button
                                type="button"
                                onClick={() => handleOpenVerifyModal(item, "approve")}
                                className="px-2.5 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center gap-1 shadow-2xs transition-all cursor-pointer"
                                title="Setujui Nomor Penting"
                              >
                                <Check size={13} strokeWidth={2.5} />
                                <span className="hidden xl:inline">Setujui</span>
                              </button>

                              {/* Tombol PERBAIKI: Khusus status pending */}
                              {isPending && (
                                <button
                                  type="button"
                                  onClick={() => handleOpenVerifyModal(item, "revision")}
                                  className="px-2.5 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-600 text-white font-bold text-xs flex items-center gap-1 shadow-2xs transition-all cursor-pointer"
                                  title="Minta Perbaikan / Revisi ke Penjual"
                                >
                                  <AlertTriangle size={13} />
                                  <span className="hidden xl:inline">Perbaiki</span>
                                </button>
                              )}

                              {/* Tombol TOLAK: untuk pending atau needs_revision */}
                              {(isPending || isRevision) && (
                                <button
                                  type="button"
                                  onClick={() => handleOpenVerifyModal(item, "reject")}
                                  className="px-2 py-1.5 rounded-lg border border-rose-200 text-rose-600 hover:bg-rose-50 font-bold text-xs flex items-center gap-1 transition-all cursor-pointer"
                                  title="Tolak Pengajuan"
                                >
                                  <XCircle size={13} />
                                  <span className="hidden xl:inline">Tolak</span>
                                </button>
                              )}
                            </>
                          )}

                          {/* JIKA SUDAH DISETUJUI: TAMPILAN CUMA EDIT DAN HAPUS */}
                          <button
                            type="button"
                            onClick={() => handleOpenEditModal(item)}
                            className="p-1.5 rounded-lg border border-slate-200 text-slate-600 hover:text-emerald-600 hover:bg-teal-50 hover:border-teal-200 transition-all cursor-pointer"
                            title="Edit Data"
                          >
                            <Edit2 size={14} />
                          </button>

                          <button
                            type="button"
                            onClick={() => setDeleteItem(item)}
                            className="p-1.5 rounded-lg border border-slate-200 text-slate-400 hover:text-rose-600 hover:bg-rose-50 hover:border-rose-200 transition-all cursor-pointer"
                            title="Hapus Nomor"
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

      {/* ═════════ MODAL VERIFIKASI (SETUJUI, PERBAIKI, TOLAK) ═════════ */}
      {verifyModal.open && verifyModal.item && (
        <div className="fixed inset-0 z-[999] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl w-full max-w-lg shadow-2xl border border-slate-100 overflow-hidden animate-in zoom-in-95 duration-200">
            {/* Modal Header */}
            <div
              className={`p-5 border-b flex items-center justify-between ${
                verifyModal.type === "approve"
                  ? "bg-emerald-50/80 border-emerald-100"
                  : verifyModal.type === "revision"
                  ? "bg-amber-50/80 border-amber-100"
                  : "bg-rose-50/80 border-rose-100"
              }`}
            >
              <div className="flex items-center gap-3">
                <div
                  className={`w-10 h-10 rounded-2xl flex items-center justify-center ${
                    verifyModal.type === "approve"
                      ? "bg-emerald-600 text-white"
                      : verifyModal.type === "revision"
                      ? "bg-amber-500 text-white"
                      : "bg-rose-600 text-white"
                  }`}
                >
                  {verifyModal.type === "approve" ? (
                    <CheckCircle2 size={22} />
                  ) : verifyModal.type === "revision" ? (
                    <AlertTriangle size={22} />
                  ) : (
                    <XCircle size={22} />
                  )}
                </div>
                <div>
                  <h3 className="text-base font-black text-slate-900">
                    {verifyModal.type === "approve"
                      ? "Setujui Nomor Penting"
                      : verifyModal.type === "revision"
                      ? "Minta Perbaikan (Revisi) Data"
                      : "Tolak Pengajuan Nomor Penting"}
                  </h3>
                  <p className="text-xs text-slate-500">
                    Nomor: <strong>{verifyModal.item.name}</strong>
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setVerifyModal({ ...verifyModal, open: false })}
                className="w-8 h-8 rounded-full text-slate-400 hover:text-slate-600 hover:bg-white flex items-center justify-center transition-colors"
              >
                <X size={18} />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 space-y-4">
              {verifyModal.error && (
                <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-700 flex items-center gap-2">
                  <AlertCircle size={15} className="shrink-0" />
                  <span>{verifyModal.error}</span>
                </div>
              )}

              {verifyModal.type === "approve" ? (
                <div className="space-y-3">
                  <p className="text-xs text-slate-600 leading-relaxed">
                    Dengan menyetujui pengajuan ini, nomor penting <strong>"{verifyModal.item.name}"</strong> akan langsung diaktifkan dan dapat dilihat serta dihubungi oleh seluruh warga di halaman publik <strong>Nomor Penting Surade</strong>.
                  </p>
                  <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-1 text-xs">
                    <div className="flex justify-between">
                      <span className="text-slate-500">Telepon Darurat:</span>
                      <span className="font-bold text-emerald-600">{verifyModal.item.phone_display || verifyModal.item.phone}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">Wilayah:</span>
                      <span className="font-semibold text-slate-700">{verifyModal.item.village_name}</span>
                    </div>
                    {verifyModal.item.user && (
                      <div className="flex justify-between">
                        <span className="text-slate-500">Diajukan oleh:</span>
                        <span className="font-semibold text-indigo-700">{verifyModal.item.user.name} ({verifyModal.item.user.email})</span>
                      </div>
                    )}
                  </div>
                </div>
              ) : (
                <div className="space-y-3">
                  <p className="text-xs text-slate-600 leading-relaxed">
                    {verifyModal.type === "revision"
                      ? "Tuliskan catatan perbaikan secara spesifik agar penjual dapat memperbaiki data yang kurang sebelum diverifikasi kembali."
                      : "Tuliskan alasan penolakan secara jelas kepada penjual."}
                  </p>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      {verifyModal.type === "revision" ? "Catatan Perbaikan (Wajib):" : "Alasan Penolakan (Wajib):"}
                    </label>
                    <textarea
                      rows={4}
                      required
                      placeholder={
                        verifyModal.type === "revision"
                          ? "Contoh: Mohon pastikan nomor telepon selalu siaga 24 jam dan lengkapi rincian armada derek pada deskripsi..."
                          : "Contoh: Nomor telepon tidak valid / layanan bukan kategori darurat..."
                      }
                      value={verifyModal.notes}
                      onChange={(e) => setVerifyModal({ ...verifyModal, notes: e.target.value })}
                      className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-900 focus:outline-none focus:border-emerald-600 focus:bg-white resize-none"
                    />
                  </div>

                  {/* Quick Templates */}
                  <div className="space-y-1.5">
                    <span className="text-[11px] font-bold text-slate-400 block">Template Cepat:</span>
                    <div className="flex flex-wrap gap-1.5">
                      {[
                        "Nomor telepon tidak aktif saat diverifikasi",
                        "Mohon lengkapi alamat dan ruang lingkup siaga",
                        "Pastikan nomor WhatsApp aktif untuk darurat",
                      ].map((tmpl) => (
                        <button
                          key={tmpl}
                          type="button"
                          onClick={() => setVerifyModal((prev) => ({ ...prev, notes: tmpl }))}
                          className="text-[10.5px] px-2 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-600 font-medium transition-colors"
                        >
                          + {tmpl}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setVerifyModal({ ...verifyModal, open: false })}
                  disabled={verifyModal.submitting}
                  className="px-4 py-2.5 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 text-xs font-bold transition-all cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="button"
                  onClick={handleConfirmVerification}
                  disabled={verifyModal.submitting}
                  className={`px-5 py-2.5 rounded-xl text-white text-xs font-black flex items-center gap-2 shadow-md transition-all cursor-pointer disabled:opacity-50 ${
                    verifyModal.type === "approve"
                      ? "bg-emerald-600 hover:bg-emerald-700"
                      : verifyModal.type === "revision"
                      ? "bg-amber-600 hover:bg-amber-700"
                      : "bg-rose-600 hover:bg-rose-700"
                  }`}
                >
                  {verifyModal.submitting ? (
                    <>
                      <Loader2 size={14} className="animate-spin" />
                      <span>Memproses...</span>
                    </>
                  ) : verifyModal.type === "approve" ? (
                    <>
                      <Check size={14} strokeWidth={2.5} />
                      <span>Setujui Sekarang</span>
                    </>
                  ) : verifyModal.type === "revision" ? (
                    <>
                      <Send size={14} />
                      <span>Kirim Permintaan Perbaikan</span>
                    </>
                  ) : (
                    <>
                      <XCircle size={14} />
                      <span>Tolak Pengajuan</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ═════════ ADD / EDIT MODAL ═════════ */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl w-full max-w-xl max-h-[92vh] flex flex-col shadow-2xl border border-slate-100 overflow-hidden">
            <div className="px-6 py-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/80">
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-xl bg-teal-50 text-emerald-600 flex items-center justify-center border border-teal-100">
                  <PhoneCall size={20} />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900">
                    {editingItem ? "Edit Nomor Penting" : "Tambah Nomor Penting Baru"}
                  </h3>
                  <p className="text-xs text-slate-500">
                    {editingItem ? "Perbarui informasi layanan darurat" : "Tambahkan kontak darurat resmi ke portal"}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="w-8 h-8 rounded-full text-slate-400 hover:text-slate-600 hover:bg-slate-200 flex items-center justify-center transition-colors"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSave} className="flex-1 overflow-y-auto p-6 space-y-4">
              {formError && (
                <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-700 flex items-center gap-2">
                  <AlertCircle size={16} className="shrink-0" />
                  <span>{formError}</span>
                </div>
              )}

              {/* Nama Instansi */}
              <div>
                <label className="block font-bold text-slate-700 mb-1 text-xs">
                  Nama Layanan / Instansi <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="Contoh: Polsek Surade, Pos Damkar, dll"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-900 focus:outline-none focus:border-emerald-600 focus:bg-white"
                />
              </div>

              {/* Telepon & Tampilan Telepon */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1 text-xs">
                    Nomor Panggilan (Dial) <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Contoh: 0266490110 atau 110"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-900 focus:outline-none focus:border-emerald-600 focus:bg-white"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1 text-xs">
                    Format Tampilan
                  </label>
                  <input
                    type="text"
                    placeholder="Contoh: (0266) 490110"
                    value={formData.phone_display}
                    onChange={(e) => setFormData({ ...formData, phone_display: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-900 focus:outline-none focus:border-emerald-600 focus:bg-white"
                  />
                </div>
              </div>

              {/* WhatsApp & Label Status */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1 text-xs">
                    Nomor WhatsApp (Opsional)
                  </label>
                  <input
                    type="text"
                    placeholder="Contoh: 081234567890"
                    value={formData.whatsapp}
                    onChange={(e) => setFormData({ ...formData, whatsapp: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-900 focus:outline-none focus:border-emerald-600 focus:bg-white"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1 text-xs">
                    Status Layanan
                  </label>
                  <input
                    type="text"
                    placeholder="Contoh: 24 Jam Siaga, Jam Kerja"
                    value={formData.status_label}
                    onChange={(e) => setFormData({ ...formData, status_label: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-900 focus:outline-none focus:border-emerald-600 focus:bg-white"
                  />
                </div>
              </div>

              {/* Kategori & Wilayah */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1 text-xs">
                    Kategori Layanan <span className="text-rose-500">*</span>
                  </label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-900 focus:outline-none focus:border-emerald-600"
                  >
                    <option value="keamanan">Polisi & Keamanan</option>
                    <option value="medis">Medis & Ambulans</option>
                    <option value="bencana">Damkar & Bencana</option>
                    <option value="pemerintahan">Pemerintahan & Desa</option>
                    <option value="utilitas">PLN, PDAM & Derek/Bengkel</option>
                    <option value="darurat">Hotline Darurat Nasional</option>
                  </select>
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1 text-xs">
                    Wilayah / Desa
                  </label>
                  <select
                    value={formData.village_name}
                    onChange={(e) => setFormData({ ...formData, village_name: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-900 focus:outline-none focus:border-emerald-600"
                  >
                    {VILLAGES.filter((v) => v !== "Semua Wilayah").map((v) => (
                      <option key={v} value={v}>{v}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Keterangan */}
              <div>
                <label className="block font-bold text-slate-700 mb-1 text-xs">
                  Keterangan Layanan
                </label>
                <textarea
                  rows={3}
                  placeholder="Jelaskan jenis bantuan yang dilayani..."
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-900 focus:outline-none focus:border-emerald-600 focus:bg-white resize-none"
                />
              </div>

              {/* Alamat Fisik */}
              <div>
                <label className="block font-bold text-slate-700 mb-1 text-xs">
                  Alamat Fisik / Lokasi Kantor
                </label>
                <input
                  type="text"
                  placeholder="Contoh: Jl. Raya Surade No. 1"
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-900 focus:outline-none focus:border-emerald-600 focus:bg-white"
                />
              </div>

              {/* Urutan & Status Aktif */}
              <div className="grid grid-cols-2 gap-3 pt-1">
                <div>
                  <label className="block font-bold text-slate-700 mb-1 text-xs">
                    Urutan Tampilan (Order)
                  </label>
                  <input
                    type="number"
                    value={formData.order}
                    onChange={(e) => setFormData({ ...formData, order: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-900 focus:outline-none focus:border-emerald-600"
                  />
                </div>
                <div className="flex flex-col justify-end">
                  <label className="flex items-center gap-2 cursor-pointer select-none pb-2">
                    <input
                      type="checkbox"
                      checked={formData.is_active}
                      onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                      className="rounded text-emerald-600 focus:ring-emerald-600 w-4 h-4 cursor-pointer"
                    />
                    <span className="font-bold text-slate-800 text-xs">Aktifkan Nomor Ini</span>
                  </label>
                </div>
              </div>

              {/* Submit Buttons */}
              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  disabled={submitting}
                  className="px-4 py-2 rounded-xl border border-slate-200 text-slate-700 hover:bg-slate-50 text-xs font-bold transition-all cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-xs flex items-center gap-2 transition-all cursor-pointer disabled:opacity-60"
                >
                  {submitting && <Loader2 size={14} className="animate-spin" />}
                  <span>{editingItem ? "Simpan Perubahan" : "Tambahkan Nomor"}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl max-w-sm w-full p-5 shadow-2xl border border-slate-200 space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center mx-auto">
              <Trash2 size={24} />
            </div>
            <div className="text-center space-y-1">
              <h4 className="text-base font-bold text-slate-900">Hapus Nomor Penting?</h4>
              <p className="text-xs text-slate-500">
                Apakah Anda yakin ingin menghapus nomor <strong>"{deleteItem.name}"</strong>? Data yang dihapus tidak dapat dikembalikan.
              </p>
            </div>
            <div className="flex items-center gap-2 pt-2">
              <button
                type="button"
                onClick={() => setDeleteItem(null)}
                disabled={deleting}
                className="flex-1 py-2.5 rounded-xl border border-slate-200 text-slate-700 text-xs font-bold hover:bg-slate-50 transition-all cursor-pointer"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={handleDelete}
                disabled={deleting}
                className="flex-1 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold shadow-xs transition-all cursor-pointer flex items-center justify-center gap-1.5"
              >
                {deleting && <Loader2 size={14} className="animate-spin" />}
                <span>Hapus Nomor</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
