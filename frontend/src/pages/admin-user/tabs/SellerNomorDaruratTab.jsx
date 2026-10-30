import React, { useState, useEffect, useMemo } from "react";
import api from "../../../services/api";
import toast from "react-hot-toast";
import SuradeLoader from "../../../components/SuradeLoader";
import {
  PhoneCall,
  Phone,
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
  MessageCircle,
  MapPin,
  Clock,
  RefreshCw,
  X,
  Check,
  Send,
  HelpCircle,
} from "lucide-react";

const CATEGORIES = [
  { id: "darurat", label: "Hotline Darurat", icon: AlertCircle, color: "rose" },
  { id: "keamanan", label: "Polisi & Keamanan", icon: Shield, color: "blue" },
  { id: "medis", label: "Medis & Ambulans", icon: HeartPulse, color: "emerald" },
  { id: "bencana", label: "Damkar & Bencana", icon: Flame, color: "orange" },
  { id: "pemerintahan", label: "Pemerintahan & Desa", icon: Building2, color: "purple" },
  { id: "utilitas", label: "PLN, PDAM & Derek/Bengkel", icon: Zap, color: "amber" },
  { id: "umum", label: "Layanan Umum 24 Jam", icon: Sparkles, color: "teal" },
];

const VILLAGES = [
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

export default function SellerNomorDaruratTab() {
  const [numbers, setNumbers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  // Modal State
  const [modalOpen, setModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState("");

  // Delete State
  const [deleteItem, setDeleteItem] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const initialForm = {
    name: "",
    phone: "",
    phone_display: "",
    whatsapp: "",
    category: "utilitas",
    village_name: "Kecamatan Surade",
    description: "",
    address: "",
    status_label: "24 Jam Siaga",
  };
  const [formData, setFormData] = useState(initialForm);

  const fetchMyNumbers = async () => {
    setLoading(true);
    try {
      const res = await api.get("/user/important-numbers");
      const list = res.data?.data || (Array.isArray(res.data) ? res.data : []);
      setNumbers(list);
    } catch (err) {
      console.error("Gagal memuat nomor darurat penjual:", err);
      toast.error("Gagal memuat daftar nomor darurat Anda.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMyNumbers();
  }, []);

  const handleOpenAdd = () => {
    setEditingItem(null);
    setFormError("");
    setFormData(initialForm);
    setModalOpen(true);
  };

  const handleOpenEdit = (item) => {
    if (item?.status === "rejected") {
      toast.error("Pengajuan nomor penting yang telah ditolak tidak dapat diperbaiki lagi.");
      return;
    }
    setEditingItem(item);
    setFormError("");
    setFormData({
      name: item.name || "",
      phone: item.phone || "",
      phone_display: item.phone_display || item.phone || "",
      whatsapp: item.whatsapp || "",
      category: item.category || "utilitas",
      village_name: item.village_name || "Kecamatan Surade",
      description: item.description || "",
      address: item.address || "",
      status_label: item.status_label || "24 Jam Siaga",
    });
    setModalOpen(true);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setFormError("");

    if (!formData.name.trim()) {
      setFormError("Nama layanan / usaha darurat wajib diisi.");
      return;
    }
    if (!formData.phone.trim()) {
      setFormError("Nomor telepon darurat wajib diisi.");
      return;
    }

    setSubmitting(true);
    try {
      const payload = {
        ...formData,
        phone_display: formData.phone_display.trim() || formData.phone.trim(),
      };

      if (editingItem) {
        const res = await api.put(`/user/important-numbers/${editingItem.id}`, payload);
        toast.success(res.data?.message || "Perbaikan nomor darurat berhasil diajukan ulang ke Admin!");
      } else {
        const res = await api.post("/user/important-numbers", payload);
        toast.success(res.data?.message || "Nomor darurat berhasil diajukan! Menunggu verifikasi Admin.");
      }

      setModalOpen(false);
      fetchMyNumbers();
    } catch (err) {
      console.error("Gagal menyimpan nomor darurat:", err);
      const msg = err.response?.data?.message || "Terjadi kesalahan saat menyimpan nomor darurat.";
      setFormError(msg);
      toast.error(msg);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteItem) return;
    setDeleting(true);
    try {
      await api.delete(`/user/important-numbers/${deleteItem.id}`);
      toast.success("Nomor darurat berhasil dihapus.");
      setNumbers((prev) => prev.filter((n) => n.id !== deleteItem.id));
      setDeleteItem(null);
    } catch (err) {
      console.error("Gagal menghapus nomor darurat:", err);
      toast.error("Gagal menghapus nomor darurat.");
    } finally {
      setDeleting(false);
    }
  };

  // KPI Calculations
  const stats = useMemo(() => {
    const total = numbers.length;
    const pending = numbers.filter((n) => n.status === "pending").length;
    const needsRevision = numbers.filter((n) => n.status === "needs_revision").length;
    const approved = numbers.filter((n) => n.status === "approved" || (!n.status && n.is_verified)).length;
    const rejected = numbers.filter((n) => n.status === "rejected").length;
    return { total, pending, needsRevision, approved, rejected };
  }, [numbers]);

  // Filtered
  const filteredNumbers = useMemo(() => {
    const q = searchQuery.toLowerCase().trim();
    return numbers.filter((n) => {
      if (statusFilter !== "all") {
        if (statusFilter === "approved") {
          if (n.status !== "approved" && n.status !== null) return false;
        } else if (n.status !== statusFilter) {
          return false;
        }
      }
      if (q) {
        const matchName = (n.name || "").toLowerCase().includes(q);
        const matchPhone = (n.phone || "").includes(q) || (n.phone_display || "").includes(q);
        const matchDesc = (n.description || "").toLowerCase().includes(q);
        const matchVillage = (n.village_name || "").toLowerCase().includes(q);
        if (!matchName && !matchPhone && !matchDesc && !matchVillage) return false;
      }
      return true;
    });
  }, [numbers, searchQuery, statusFilter]);

  const getStatusBadge = (status) => {
    switch (status) {
      case "approved":
        return {
          label: "Disetujui & Aktif",
          className: "bg-emerald-50 text-emerald-700 border-emerald-200",
          icon: CheckCircle2,
          hint: "Nomor tayang di direktori publik Nomor Darurat Surade",
        };
      case "needs_revision":
        return {
          label: "Perlu Perbaikan",
          className: "bg-amber-50 text-amber-800 border-amber-300 animate-pulse",
          icon: AlertTriangle,
          hint: "Admin meminta revisi data. Silakan klik tombol 'Perbaiki Data'",
        };
      case "rejected":
        return {
          label: "Ditolak",
          className: "bg-rose-50 text-rose-700 border-rose-200",
          icon: XCircle,
          hint: "Pengajuan belum memenuhi ketentuan portal",
        };
      case "pending":
      default:
        return {
          label: "Menunggu Verifikasi",
          className: "bg-sky-50 text-sky-700 border-sky-200",
          icon: Clock,
          hint: "Sedang ditinjau oleh Administrator",
        };
    }
  };

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
      default:
        return { label: "Hotline Darurat", bg: "bg-rose-50 text-rose-700 border-rose-200", icon: AlertCircle };
    }
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto pb-12 font-['Poppins',sans-serif]">
      {/* Header Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-[#064e3b] via-[#043d2e] to-[#022c22] text-white p-6 sm:p-8 shadow-xl border border-emerald-800/40">
        <div className="absolute right-0 top-0 translate-x-10 -translate-y-10 w-80 h-80 rounded-full bg-emerald-500/10 blur-3xl pointer-events-none" />
        
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/20 border border-emerald-400/30 text-emerald-300 text-xs font-semibold backdrop-blur-md">
              <PhoneCall size={14} className="animate-pulse" />
              <span>Layanan Nomor Penting & Panggilan Darurat</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white flex items-center gap-2.5">
              <PhoneCall size={28} className="text-emerald-400" />
              <span>Nomor Penting Usaha Penjual</span>
            </h2>
            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed font-normal">
              Ajukan nomor telepon penting, siaga, derek kendaraan, bengkel 24 jam, apotek malam, atau layanan usaha Anda agar terverifikasi Admin dan terdaftar resmi di website <strong className="text-emerald-300 font-semibold">Nomor Penting Surade</strong>.
            </p>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <button
              type="button"
              onClick={fetchMyNumbers}
              disabled={loading}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white font-semibold text-xs border border-white/20 transition-all cursor-pointer shadow-sm active:scale-95"
              title="Perbarui Data"
            >
              <RefreshCw size={14} className={loading ? "animate-spin" : ""} />
              <span>Refresh</span>
            </button>
            <button
              type="button"
              onClick={handleOpenAdd}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-400 hover:bg-emerald-300 text-slate-950 font-black text-xs sm:text-sm shadow-lg shadow-emerald-950/20 hover:shadow-xl transition-all cursor-pointer hover:scale-[1.02] active:scale-95"
            >
              <Plus size={18} strokeWidth={2.5} />
              <span>Ajukan Nomor Penting</span>
            </button>
          </div>
        </div>
      </div>

      {/* Alert if Needs Revision */}
      {stats.needsRevision > 0 && (
        <div className="bg-amber-500/10 border-2 border-amber-500/30 rounded-2xl p-4 sm:p-5 flex items-start gap-4 animate-in fade-in slide-in-from-top-2 duration-300">
          <div className="w-10 h-10 rounded-xl bg-amber-500 text-white flex items-center justify-center shrink-0 shadow-md">
            <AlertTriangle size={20} />
          </div>
          <div className="flex-1 min-w-0">
            <h4 className="text-sm font-black text-amber-900">
              Ada {stats.needsRevision} Pengajuan Nomor Penting Perlu Perbaikan!
            </h4>
            <p className="text-xs text-amber-800/90 mt-1 leading-relaxed">
              Admin telah memberikan catatan perbaikan pada pengajuan Anda. Silakan lihat catatan di bawah dan klik tombol <strong>"Perbaiki Data"</strong> untuk mengirim ulang tanpa perlu menginput ulang dari awal.
            </p>
          </div>
        </div>
      )}

      {/* KPI Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5">
        <div
          onClick={() => setStatusFilter("all")}
          className={`bg-white rounded-2xl p-4 sm:p-5 border transition-all cursor-pointer shadow-xs hover:shadow-md ${
            statusFilter === "all"
              ? "ring-2 ring-slate-900 border-slate-900 shadow-md scale-[1.02]"
              : "border-slate-200/90 hover:bg-slate-50/70"
          }`}
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-[10px] sm:text-[11px] font-bold text-slate-500 uppercase tracking-wider">
              Total Diajukan
            </span>
            <div className="w-8 h-8 rounded-xl bg-slate-100 text-slate-700 flex items-center justify-center font-bold">
              <PhoneCall size={15} />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-black text-slate-900 leading-tight">
            {stats.total}
          </div>
          <span className="text-[11px] text-slate-400 font-medium block mt-1">
            Total Pengajuan
          </span>
        </div>

        <div
          onClick={() => setStatusFilter("pending")}
          className={`bg-white rounded-2xl p-4 sm:p-5 border transition-all cursor-pointer shadow-xs hover:shadow-md ${
            statusFilter === "pending"
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
            Menunggu Verifikasi
          </span>
        </div>

        <div
          onClick={() => setStatusFilter("needs_revision")}
          className={`bg-white rounded-2xl p-4 sm:p-5 border transition-all cursor-pointer shadow-xs hover:shadow-md ${
            statusFilter === "needs_revision"
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
            Perlu Dilengkapi
          </span>
        </div>

        <div
          onClick={() => setStatusFilter("approved")}
          className={`bg-white rounded-2xl p-4 sm:p-5 border transition-all cursor-pointer shadow-xs hover:shadow-md ${
            statusFilter === "approved"
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
            Aktif di Direktori
          </span>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white border border-slate-200/90 rounded-2xl p-4 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="relative flex-1">
          <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Cari nama usaha, nomor telepon, atau desa..."
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

        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0 scrollbar-none">
          {[
            { id: "all", label: "Semua" },
            { id: "pending", label: "Menunggu" },
            { id: "needs_revision", label: "Perlu Revisi" },
            { id: "approved", label: "Disetujui" },
            { id: "rejected", label: "Ditolak" },
          ].map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setStatusFilter(tab.id)}
              className={`px-3 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
                statusFilter === tab.id
                  ? "bg-emerald-600 text-white shadow-xs"
                  : "bg-slate-100 text-slate-600 hover:bg-slate-200"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Items List */}
      {loading ? (
        <div className="bg-white rounded-2xl border border-slate-200/90 p-12">
          <SuradeLoader
            variant="section"
            size="md"
            text="Memuat daftar nomor darurat usaha Anda..."
            minHeight="160px"
          />
        </div>
      ) : filteredNumbers.length === 0 ? (
        <div className="bg-white border border-slate-200/90 rounded-3xl p-12 text-center flex flex-col items-center justify-center space-y-4 shadow-xs">
          <div className="w-16 h-16 rounded-3xl bg-teal-50 text-emerald-600 flex items-center justify-center border border-teal-100 shadow-inner">
            <PhoneCall size={32} />
          </div>
          <div className="max-w-md space-y-1">
            <h4 className="text-base font-bold text-slate-900">
              {numbers.length === 0
                ? "Belum ada nomor penting yang diajukan"
                : "Tidak ditemukan nomor penting yang sesuai filter"}
            </h4>
            <p className="text-xs text-slate-500 leading-relaxed">
              {numbers.length === 0
                ? "Daftarkan kontak penting & layanan darurat usaha Anda (misal derek 24 jam, ambulans swasta, tambal ban darurat, apotek siaga) agar mudah dihubungi warga saat keadaan genting."
                : "Coba ubah filter status atau kata kunci pencarian Anda."}
            </p>
          </div>
          {numbers.length === 0 && (
            <button
              type="button"
              onClick={handleOpenAdd}
              className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold flex items-center gap-2 shadow-xs transition-all cursor-pointer"
            >
              <Plus size={16} strokeWidth={2.5} />
              <span>Ajukan Nomor Penting Sekarang</span>
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredNumbers.map((item) => {
            const stBadge = getStatusBadge(item.status);
            const catBadge = getCategoryBadge(item.category);
            const StatusIcon = stBadge.icon;
            const CatIcon = catBadge.icon;
            const isRevision = item.status === "needs_revision";
            const isRejected = item.status === "rejected";

            return (
              <div
                key={item.id}
                className={`bg-white rounded-3xl border transition-all p-5 shadow-xs flex flex-col justify-between gap-4 relative overflow-hidden ${
                  isRevision
                    ? "border-amber-400 bg-amber-50/20 ring-2 ring-amber-300/50"
                    : isRejected
                    ? "border-rose-200 bg-rose-50/20"
                    : "border-slate-200/90 hover:border-teal-300 hover:shadow-md"
                }`}
              >
                {/* Header Card */}
                <div className="space-y-3">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-2.5">
                      <div className={`w-10 h-10 rounded-2xl flex items-center justify-center shrink-0 border ${catBadge.bg}`}>
                        <CatIcon size={20} />
                      </div>
                      <div>
                        <h4 className="font-bold text-slate-900 text-sm leading-snug">
                          {item.name}
                        </h4>
                        <span className="text-[11px] font-semibold text-slate-500 flex items-center gap-1 mt-0.5">
                          <MapPin size={11} className="text-slate-400" />
                          {item.village_name || "Kecamatan Surade"}
                        </span>
                      </div>
                    </div>

                    {/* Status Badge */}
                    <div className="shrink-0">
                      <span
                        className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-black border ${stBadge.className}`}
                        title={stBadge.hint}
                      >
                        <StatusIcon size={12} />
                        <span>{stBadge.label}</span>
                      </span>
                    </div>
                  </div>

                  {/* Description */}
                  {item.description && (
                    <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed bg-slate-50/80 p-2.5 rounded-xl border border-slate-100">
                      {item.description}
                    </p>
                  )}

                  {/* Phone & Contacts */}
                  <div className="flex items-center gap-2 flex-wrap pt-1">
                    <a
                      href={`tel:${item.phone}`}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-teal-50 text-emerald-600 font-black text-xs border border-teal-200/70 hover:bg-teal-100 transition-colors"
                      title="Klik untuk panggilan darurat"
                    >
                      <Phone size={13} />
                      <span>{item.phone_display || item.phone}</span>
                    </a>

                    {item.whatsapp && (
                      <a
                        href={`https://wa.me/${item.whatsapp}`}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-50 text-emerald-700 font-bold text-xs border border-emerald-200/70 hover:bg-emerald-100 transition-colors"
                      >
                        <MessageCircle size={13} />
                        <span>WA: {item.whatsapp}</span>
                      </a>
                    )}

                    <span className="inline-flex items-center gap-1 text-[11px] font-bold text-slate-500 bg-slate-100 px-2.5 py-1 rounded-xl">
                      <Clock size={11} />
                      {item.status_label || "24 Jam Siaga"}
                    </span>
                  </div>

                  {/* Admin Notes Box (Catatan Revisi / Alasan Tolak) */}
                  {(isRevision || isRejected) && (
                    <div
                      className={`p-3.5 rounded-2xl border text-xs space-y-1.5 mt-2 ${
                        isRevision
                          ? "bg-amber-100/80 border-amber-300 text-amber-950"
                          : "bg-rose-100/80 border-rose-300 text-rose-950"
                      }`}
                    >
                      <div className="flex items-center gap-1.5 font-black text-[11.5px] uppercase tracking-wider">
                        <AlertCircle size={14} className={isRevision ? "text-amber-700" : "text-rose-700"} />
                        <span>{isRevision ? "Catatan Perbaikan dari Admin:" : "Pengajuan Ditolak (Permanen):"}</span>
                      </div>
                      {item.admin_notes && <p className="leading-relaxed font-medium pl-5">{item.admin_notes}</p>}
                      {isRejected && (
                        <p className="text-[11px] text-rose-800 font-semibold pl-5 pt-0.5">
                          Status ditolak tidak dapat diperbaiki lagi. Anda dapat menghapus data ini.
                        </p>
                      )}
                    </div>
                  )}
                </div>

                {/* Footer Card Actions */}
                <div className="flex items-center justify-between border-t border-slate-100 pt-3 mt-1">
                  <span className="text-[10.5px] text-slate-400">
                    Diajukan: {new Date(item.created_at).toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric" })}
                  </span>

                  <div className="flex items-center gap-2">
                    {/* If Needs Revision, show prominent "Perbaiki Data" button */}
                    {isRevision && (
                      <button
                        type="button"
                        onClick={() => handleOpenEdit(item)}
                        className="px-3.5 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-white text-xs font-black flex items-center gap-1.5 shadow-xs transition-all cursor-pointer animate-pulse"
                      >
                        <Edit2 size={13} />
                        <span>Perbaiki Data</span>
                      </button>
                    )}

                    {/* Edit for pending */}
                    {item.status === "pending" && (
                      <button
                        type="button"
                        onClick={() => handleOpenEdit(item)}
                        className="px-3 py-1.5 rounded-xl border border-slate-200 text-slate-700 hover:text-emerald-600 hover:bg-teal-50 text-xs font-bold flex items-center gap-1 transition-all cursor-pointer"
                        title="Edit Data"
                      >
                        <Edit2 size={13} />
                        <span>Edit</span>
                      </button>
                    )}

                    {/* Delete */}
                    <button
                      type="button"
                      onClick={() => setDeleteItem(item)}
                      className="p-1.5 rounded-xl border border-slate-200 text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
                      title="Hapus Nomor"
                    >
                      <Trash2 size={15} />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* MODAL AJUKAN / PERBAIKI NOMOR DARURAT */}
      {modalOpen && (
        <div className="fixed inset-0 z-[999] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl w-full max-w-xl max-h-[92vh] flex flex-col shadow-2xl border border-slate-100 overflow-hidden animate-in zoom-in-95 duration-200">
            {/* Modal Header */}
            <div className="px-6 py-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/80">
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-xl bg-teal-50 text-emerald-600 flex items-center justify-center border border-teal-100">
                  <PhoneCall size={20} />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900">
                    {editingItem
                      ? editingItem.status === "needs_revision"
                        ? "Perbaiki Data Nomor Penting"
                        : "Edit Data Nomor Penting"
                      : "Ajukan Nomor Penting Baru"}
                  </h3>
                  <p className="text-xs text-slate-500">
                    {editingItem?.status === "needs_revision"
                      ? "Sesuaikan data sesuai instruksi admin lalu klik ajukan ulang"
                      : "Nomor akan diverifikasi oleh Admin sebelum tampil di website"}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setModalOpen(false)}
                className="w-8 h-8 rounded-full text-slate-400 hover:text-slate-600 hover:bg-slate-200 flex items-center justify-center transition-colors"
              >
                <X size={18} />
              </button>
            </div>

            {/* Modal Body */}
            <form onSubmit={handleSave} className="flex-1 overflow-y-auto p-6 space-y-4">
              {/* Show admin revision notes inside modal if editing revision */}
              {editingItem?.status === "needs_revision" && editingItem?.admin_notes && (
                <div className="p-3.5 rounded-2xl bg-amber-50 border border-amber-300 text-xs text-amber-900 space-y-1">
                  <div className="flex items-center gap-1.5 font-bold text-amber-800">
                    <AlertTriangle size={15} />
                    <span>Catatan Admin yang Harus Diperbaiki:</span>
                  </div>
                  <p className="leading-relaxed font-semibold pl-5">{editingItem.admin_notes}</p>
                </div>
              )}

              {formError && (
                <div className="p-3.5 rounded-2xl bg-rose-50 border border-rose-200 text-xs text-rose-700 flex items-center gap-2">
                  <AlertCircle size={16} className="shrink-0" />
                  <span>{formError}</span>
                </div>
              )}

              {/* Nama Usaha / Layanan */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Nama Layanan / Usaha Darurat <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="Contoh: Bengkel Panggilan 24 Jam Jaya, Derek Motor Surade, dll"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 focus:outline-none focus:border-emerald-600 focus:bg-white transition-all"
                />
              </div>

              {/* Nomor Telepon & WA */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Nomor Telepon Darurat <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Contoh: 081234567890"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 focus:outline-none focus:border-emerald-600 focus:bg-white transition-all"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Nomor WhatsApp (Opsional)
                  </label>
                  <input
                    type="text"
                    placeholder="Contoh: 081234567890"
                    value={formData.whatsapp}
                    onChange={(e) => setFormData({ ...formData, whatsapp: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 focus:outline-none focus:border-emerald-600 focus:bg-white transition-all"
                  />
                </div>
              </div>

              {/* Kategori & Wilayah */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Kategori Layanan <span className="text-rose-500">*</span>
                  </label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 focus:outline-none focus:border-emerald-600 focus:bg-white transition-all"
                  >
                    {CATEGORIES.map((c) => (
                      <option key={c.id} value={c.id}>{c.label}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Wilayah / Desa <span className="text-rose-500">*</span>
                  </label>
                  <select
                    value={formData.village_name}
                    onChange={(e) => setFormData({ ...formData, village_name: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 focus:outline-none focus:border-emerald-600 focus:bg-white transition-all"
                  >
                    {VILLAGES.map((v) => (
                      <option key={v} value={v}>{v}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Jam Operasional / Label Siaga */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Jam Siaga / Kesiapan Operasional
                </label>
                <input
                  type="text"
                  placeholder="Contoh: 24 Jam Siaga, Jam 06.00 - 23.00 WIB, dll"
                  value={formData.status_label}
                  onChange={(e) => setFormData({ ...formData, status_label: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 focus:outline-none focus:border-emerald-600 focus:bg-white transition-all"
                />
              </div>

              {/* Alamat Fisik / Lokasi Standby */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Alamat Fisik / Posko Standby
                </label>
                <input
                  type="text"
                  placeholder="Contoh: Jl. Raya Surade No. 45 (Depan Pom Bensin)"
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 focus:outline-none focus:border-emerald-600 focus:bg-white transition-all"
                />
              </div>

              {/* Deskripsi & Ruang Lingkup */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Deskripsi Layanan Tanggap Darurat
                </label>
                <textarea
                  rows={3}
                  placeholder="Jelaskan jenis pertolongan darurat yang Anda layani, armada yang tersedia, jangkauan jemput, atau syarat lainnya..."
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-800 focus:outline-none focus:border-emerald-600 focus:bg-white transition-all resize-none"
                />
              </div>

              {/* Modal Footer */}
              <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  disabled={submitting}
                  className="px-4 py-2.5 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-100 text-xs font-bold transition-all cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-black flex items-center gap-2 shadow-md transition-all cursor-pointer disabled:opacity-50"
                >
                  {submitting ? (
                    <>
                      <Loader2 size={15} className="animate-spin" />
                      <span>Menyimpan...</span>
                    </>
                  ) : (
                    <>
                      <Send size={15} />
                      <span>{editingItem?.status === "needs_revision" ? "Simpan & Ajukan Ulang" : "Kirim Pengajuan"}</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* DELETE CONFIRMATION MODAL */}
      {deleteItem && (
        <div className="fixed inset-0 z-[999] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl w-full max-w-sm p-6 space-y-4 shadow-2xl border border-slate-100 animate-in zoom-in-95 duration-200 text-center">
            <div className="w-14 h-14 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center mx-auto border border-rose-100">
              <Trash2 size={28} />
            </div>
            <div className="space-y-1">
              <h4 className="text-base font-bold text-slate-900">Hapus Nomor Penting?</h4>
              <p className="text-xs text-slate-500 leading-relaxed">
                Apakah Anda yakin ingin menghapus <strong>"{deleteItem.name}"</strong>? Data yang dihapus tidak dapat dipulihkan.
              </p>
            </div>
            <div className="flex items-center justify-center gap-3 pt-2">
              <button
                type="button"
                onClick={() => setDeleteItem(null)}
                disabled={deleting}
                className="flex-1 py-2.5 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-100 text-xs font-bold transition-colors cursor-pointer"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={handleDelete}
                disabled={deleting}
                className="flex-1 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-black transition-colors cursor-pointer disabled:opacity-50 flex items-center justify-center gap-1.5"
              >
                {deleting ? <Loader2 size={14} className="animate-spin" /> : <Trash2 size={14} />}
                <span>Hapus</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
