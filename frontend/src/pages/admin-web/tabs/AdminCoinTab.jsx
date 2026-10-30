import React, { useState, useEffect } from "react";
import axios from "axios";
import toast from "react-hot-toast";
import {
  Sparkles,
  Plus,
  Edit2,
  Trash2,
  Search,
  CheckCircle2,
  XCircle,
  AlertCircle,
  ArrowDownLeft,
  ArrowUpRight,
  Zap,
  TrendingUp,
  CreditCard,
  Layers,
  History,
  Users,
  ShieldCheck,
  RefreshCw,
  Loader2,
  X,
  Save,
  DollarSign,
  Eye,
  Check,
  CheckCircle,
  Clock,
  ExternalLink,
  Receipt,
  Banknote,
  Upload
} from "lucide-react";
import SuradeCoinIcon from "../../../components/SuradeCoinIcon";
import SuradeLoader from "../../../components/SuradeLoader";

const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:8000/api";

const getFullImageUrl = (url) => {
  if (!url) return "";
  if (url.startsWith("http://") || url.startsWith("https://") || url.startsWith("data:")) return url;
  const baseUrl = API_BASE.replace(/\/api$/, "");
  return `${baseUrl}${url.startsWith("/") ? "" : "/"}${url}`;
};

export default function AdminCoinTab() {
  const [activeSubTab, setActiveSubTab] = useState("purchases"); // purchases, packages, services, transactions, wallets
  const [stats, setStats] = useState(null);
  const [loadingStats, setLoadingStats] = useState(true);

  // Purchases (Top Up Requests) State
  const [purchases, setPurchases] = useState([]);
  const [loadingPurchases, setLoadingPurchases] = useState(false);
  const [purchaseSearch, setPurchaseSearch] = useState("");
  const [purchaseStatusFilter, setPurchaseStatusFilter] = useState("pending");
  const [purchasePage, setPurchasePage] = useState(1);
  const [purchasePagination, setPurchasePagination] = useState(null);
  const [previewProofImage, setPreviewProofImage] = useState(null);
  const [rejectModalOpen, setRejectModalOpen] = useState(false);
  const [selectedRejectPurchase, setSelectedRejectPurchase] = useState(null);
  const [rejectReason, setRejectReason] = useState("");
  const [submittingReject, setSubmittingReject] = useState(false);

  // Packages State
  const [packages, setPackages] = useState([]);
  const [loadingPackages, setLoadingPackages] = useState(false);
  const [packageModalOpen, setPackageModalOpen] = useState(false);
  const [editingPackage, setEditingPackage] = useState(null);
  const [packageFormData, setPackageFormData] = useState({
    name: "",
    coin_amount: 100,
    bonus_coin: 0,
    price_idr: 10000,
    badge_label: "",
    is_popular: false,
    is_active: true,
    sort_order: 1,
  });

  // Services State
  const [services, setServices] = useState([]);
  const [loadingServices, setLoadingServices] = useState(false);
  const [serviceModalOpen, setServiceModalOpen] = useState(false);
  const [editingService, setEditingService] = useState(null);
  const [serviceFormData, setServiceFormData] = useState({
    code: "",
    name: "",
    category: "premium",
    coin_price: 100,
    duration_days: 30,
    description: "",
    is_active: true,
    sort_order: 1,
  });

  // Transactions State
  const [transactions, setTransactions] = useState([]);
  const [loadingTransactions, setLoadingTransactions] = useState(false);
  const [txSearch, setTxSearch] = useState("");
  const [txTypeFilter, setTxTypeFilter] = useState("all");
  const [txPage, setTxPage] = useState(1);
  const [txPagination, setTxPagination] = useState(null);

  // Wallets State
  const [wallets, setWallets] = useState([]);
  const [loadingWallets, setLoadingWallets] = useState(false);
  const [walletSearch, setWalletSearch] = useState("");
  const [walletPage, setWalletPage] = useState(1);
  const [walletPagination, setWalletPagination] = useState(null);

  // Adjust Wallet Modal
  const [adjustModalOpen, setAdjustModalOpen] = useState(false);
  const [selectedUserWallet, setSelectedUserWallet] = useState(null);
  const [adjustFormData, setAdjustFormData] = useState({
    action: "add",
    amount: 100,
    reason: "",
    notes: "",
  });
  const [submittingAdjust, setSubmittingAdjust] = useState(false);

  // Gold Withdrawals State
  const [withdrawals, setWithdrawals] = useState([]);
  const [loadingWithdrawals, setLoadingWithdrawals] = useState(false);
  const [withdrawalStatusFilter, setWithdrawalStatusFilter] = useState("pending");
  const [withdrawalPage, setWithdrawalPage] = useState(1);
  const [withdrawalPagination, setWithdrawalPagination] = useState(null);
  const [rejectWithdrawalModalOpen, setRejectWithdrawalModalOpen] = useState(false);
  const [approveWithdrawalModalOpen, setApproveWithdrawalModalOpen] = useState(false);
  const [selectedWithdrawal, setSelectedWithdrawal] = useState(null);
  const [withdrawalRejectReason, setWithdrawalRejectReason] = useState("");
  const [withdrawalApproveNotes, setWithdrawalApproveNotes] = useState("");
  const [withdrawalProofFile, setWithdrawalProofFile] = useState(null);
  const [withdrawalProofPreview, setWithdrawalProofPreview] = useState(null);
  const [submittingWithdrawalAction, setSubmittingWithdrawalAction] = useState(false);

  useEffect(() => {
    fetchStats();
  }, []);

  useEffect(() => {
    if (activeSubTab === "purchases") fetchPurchases(1);
    if (activeSubTab === "packages") fetchPackages();
    if (activeSubTab === "services") fetchServices();
    if (activeSubTab === "transactions") fetchTransactions(1);
    if (activeSubTab === "wallets") fetchWallets(1);
    if (activeSubTab === "withdrawals") fetchWithdrawals(1);
  }, [activeSubTab, purchaseStatusFilter, withdrawalStatusFilter]);

  const getHeaders = () => ({
    Authorization: `Bearer ${localStorage.getItem("token")}`,
  });

  const fetchStats = async () => {
    setLoadingStats(true);
    try {
      const res = await axios.get(`${API_BASE}/admin/coins/stats`, { headers: getHeaders() });
      if (res.data?.success) setStats(res.data.stats);
    } catch (err) {
      console.error("Error fetching coin stats:", err);
    } finally {
      setLoadingStats(false);
    }
  };

  // ── PURCHASES (TOP UP PERMOHONAN) API ──
  const fetchPurchases = async (page = 1) => {
    setLoadingPurchases(true);
    try {
      const params = { page, per_page: 15 };
      if (purchaseStatusFilter !== "all") params.status = purchaseStatusFilter;
      if (purchaseSearch.trim()) params.search = purchaseSearch.trim();

      const res = await axios.get(`${API_BASE}/admin/coins/purchases`, {
        params,
        headers: getHeaders(),
      });
      if (res.data?.success) {
        setPurchases(res.data.purchases?.data || []);
        setPurchasePagination(res.data.purchases);
        setPurchasePage(page);
      }
    } catch (err) {
      toast.error("Gagal memuat permohonan top up koin.");
    } finally {
      setLoadingPurchases(false);
    }
  };

  const handleApprovePurchase = async (id) => {
    if (!window.confirm("Setujui pembelian koin ini? Koin akan otomatis ditambahkan ke wallet pengguna.")) return;
    try {
      const res = await axios.put(`${API_BASE}/admin/coins/purchases/${id}/approve`, {}, { headers: getHeaders() });
      if (res.data?.success) {
        toast.success(res.data.message || "Pembelian koin berhasil disetujui.");
        fetchPurchases(purchasePage);
        fetchStats();
        window.dispatchEvent(new CustomEvent("admin-coins-updated"));
      }
    } catch (err) {
      toast.error(err.response?.data?.message || "Gagal menyetujui pembelian koin.");
    }
  };

  const openRejectModal = (item) => {
    setSelectedRejectPurchase(item);
    setRejectReason(item.admin_notes || "Bukti transfer tidak valid atau belum masuk ke rekening resmi");
    setRejectModalOpen(true);
  };

  const handleConfirmReject = async (e) => {
    if (e) e.preventDefault();
    if (!selectedRejectPurchase) return;
    if (!rejectReason.trim()) {
      toast.error("Alasan penolakan wajib diisi agar pengguna bisa memperbaiki bukti transfer.");
      return;
    }

    setSubmittingReject(true);
    try {
      const res = await axios.put(`${API_BASE}/admin/coins/purchases/${selectedRejectPurchase.id}/reject`, {
        reason: rejectReason.trim(),
      }, { headers: getHeaders() });
      if (res.data?.success) {
        toast.success(res.data.message || "Permohonan pembelian koin telah ditolak.");
        setRejectModalOpen(false);
        setSelectedRejectPurchase(null);
        fetchPurchases(purchasePage);
        fetchStats();
        window.dispatchEvent(new CustomEvent("admin-coins-updated"));
      }
    } catch (err) {
      toast.error(err.response?.data?.message || "Gagal menolak pembelian koin.");
    } finally {
      setSubmittingReject(false);
    }
  };

  // ── PACKAGES API ──
  const fetchPackages = async () => {
    setLoadingPackages(true);
    try {
      const res = await axios.get(`${API_BASE}/admin/coins/packages`, { headers: getHeaders() });
      if (res.data?.success) setPackages(res.data.packages || []);
    } catch (err) {
      toast.error("Gagal memuat paket koin.");
    } finally {
      setLoadingPackages(false);
    }
  };

  const handleOpenPackageModal = (pkg = null) => {
    if (pkg) {
      setEditingPackage(pkg);
      setPackageFormData({
        name: pkg.name,
        coin_amount: pkg.coin_amount,
        bonus_coin: pkg.bonus_coin,
        price_idr: pkg.price_idr,
        badge_label: pkg.badge_label || "",
        is_popular: Boolean(pkg.is_popular),
        is_active: Boolean(pkg.is_active),
        sort_order: pkg.sort_order || 1,
      });
    } else {
      setEditingPackage(null);
      setPackageFormData({
        name: "",
        coin_amount: 500,
        bonus_coin: 0,
        price_idr: 50000,
        badge_label: "",
        is_popular: false,
        is_active: true,
        sort_order: packages.length + 1,
      });
    }
    setPackageModalOpen(true);
  };

  const handleSavePackage = async (e) => {
    e.preventDefault();
    try {
      if (editingPackage) {
        await axios.put(`${API_BASE}/admin/coins/packages/${editingPackage.id}`, packageFormData, {
          headers: getHeaders(),
        });
        toast.success("Paket koin berhasil diperbarui.");
      } else {
        await axios.post(`${API_BASE}/admin/coins/packages`, packageFormData, { headers: getHeaders() });
        toast.success("Paket koin berhasil dibuat.");
      }
      setPackageModalOpen(false);
      fetchPackages();
    } catch (err) {
      toast.error(err.response?.data?.message || "Gagal menyimpan paket koin.");
    }
  };

  const handleDeletePackage = async (id) => {
    if (!window.confirm("Apakah Anda yakin ingin menghapus paket koin ini?")) return;
    try {
      await axios.delete(`${API_BASE}/admin/coins/packages/${id}`, { headers: getHeaders() });
      toast.success("Paket koin berhasil dihapus.");
      fetchPackages();
    } catch (err) {
      toast.error("Gagal menghapus paket koin.");
    }
  };

  // ── SERVICES API ──
  const fetchServices = async () => {
    setLoadingServices(true);
    try {
      const res = await axios.get(`${API_BASE}/admin/coins/services`, { headers: getHeaders() });
      if (res.data?.success) setServices(res.data.services || []);
    } catch (err) {
      toast.error("Gagal memuat daftar layanan koin.");
    } finally {
      setLoadingServices(false);
    }
  };

  const handleOpenServiceModal = (svc = null) => {
    if (svc) {
      setEditingService(svc);
      setServiceFormData({
        code: svc.code,
        name: svc.name,
        category: svc.category || "premium",
        coin_price: svc.coin_price,
        duration_days: svc.duration_days || "",
        description: svc.description || "",
        is_active: Boolean(svc.is_active),
        sort_order: svc.sort_order || 1,
      });
    } else {
      setEditingService(null);
      setServiceFormData({
        code: "",
        name: "",
        category: "premium",
        coin_price: 1000,
        duration_days: 30,
        description: "",
        is_active: true,
        sort_order: services.length + 1,
      });
    }
    setServiceModalOpen(true);
  };

  const handleSaveService = async (e) => {
    e.preventDefault();
    try {
      if (editingService) {
        await axios.put(`${API_BASE}/admin/coins/services/${editingService.id}`, serviceFormData, {
          headers: getHeaders(),
        });
        toast.success("Tarif layanan koin berhasil diperbarui.");
      } else {
        await axios.post(`${API_BASE}/admin/coins/services`, serviceFormData, { headers: getHeaders() });
        toast.success("Layanan koin berhasil ditambahkan.");
      }
      setServiceModalOpen(false);
      fetchServices();
    } catch (err) {
      toast.error(err.response?.data?.message || "Gagal menyimpan layanan koin.");
    }
  };

  const handleDeleteService = async (id) => {
    if (!window.confirm("Apakah Anda yakin ingin menghapus layanan ini?")) return;
    try {
      await axios.delete(`${API_BASE}/admin/coins/services/${id}`, { headers: getHeaders() });
      toast.success("Layanan berhasil dihapus.");
      fetchServices();
    } catch (err) {
      toast.error("Gagal menghapus layanan.");
    }
  };

  // ── TRANSACTIONS API ──
  const fetchTransactions = async (page = 1) => {
    setLoadingTransactions(true);
    try {
      const params = { page, per_page: 15 };
      if (txTypeFilter !== "all") params.type = txTypeFilter;
      if (txSearch.trim()) params.search = txSearch.trim();

      const res = await axios.get(`${API_BASE}/admin/coins/transactions`, {
        params,
        headers: getHeaders(),
      });
      if (res.data?.success) {
        setTransactions(res.data.transactions?.data || []);
        setTxPagination(res.data.transactions);
        setTxPage(page);
      }
    } catch (err) {
      toast.error("Gagal memuat transaksi koin.");
    } finally {
      setLoadingTransactions(false);
    }
  };

  // ── WALLETS API ──
  const fetchWallets = async (page = 1) => {
    setLoadingWallets(true);
    try {
      const params = { page, per_page: 15 };
      if (walletSearch.trim()) params.search = walletSearch.trim();

      const res = await axios.get(`${API_BASE}/admin/coins/wallets`, {
        params,
        headers: getHeaders(),
      });
      if (res.data?.success) {
        setWallets(res.data.wallets?.data || []);
        setWalletPagination(res.data.wallets);
        setWalletPage(page);
      }
    } catch (err) {
      toast.error("Gagal memuat wallet pengguna.");
    } finally {
      setLoadingWallets(false);
    }
  };

  const handleOpenAdjustModal = (wallet) => {
    setSelectedUserWallet(wallet);
    setAdjustFormData({
      action: "add",
      amount: 100,
      reason: "",
      notes: "",
    });
    setAdjustModalOpen(true);
  };

  const handleSaveAdjustWallet = async (e) => {
    e.preventDefault();
    if (!adjustFormData.reason.trim()) {
      toast.error("Alasan penyesuaian saldo wajib diisi untuk audit trail.");
      return;
    }

    setSubmittingAdjust(true);
    try {
      const payload = {
        user_id: selectedUserWallet.user_id,
        action: adjustFormData.action,
        amount: Number(adjustFormData.amount),
        reason: adjustFormData.reason.trim(),
        notes: adjustFormData.notes.trim(),
      };

      const res = await axios.post(`${API_BASE}/admin/coins/adjust-balance`, payload, {
        headers: getHeaders(),
      });

      if (res.data?.success) {
        toast.success(res.data.message || "Saldo koin berhasil disesuaikan.");
        setAdjustModalOpen(false);
        fetchWallets(walletPage);
        fetchStats();
      }
    } catch (err) {
      toast.error(err.response?.data?.message || "Gagal menyesuaikan saldo koin.");
    } finally {
      setSubmittingAdjust(false);
    }
  };

  // ── GOLD WITHDRAWALS (PENCAIRAN GOLD KE BANK/E-WALLET) ──
  const fetchWithdrawals = async (page = 1) => {
    setLoadingWithdrawals(true);
    try {
      const params = { page, per_page: 15 };
      if (withdrawalStatusFilter !== "all") params.status = withdrawalStatusFilter;
      const res = await axios.get(`${API_BASE}/admin/coins/gold/withdrawals`, {
        params,
        headers: getHeaders(),
      });
      if (res.data?.success) {
        setWithdrawals(res.data.data?.data || []);
        setWithdrawalPagination(res.data.data);
        setWithdrawalPage(page);
      }
    } catch (err) {
      toast.error("Gagal memuat permohonan penarikan Gold.");
    } finally {
      setLoadingWithdrawals(false);
    }
  };

  const handleOpenApproveWithdrawal = (item) => {
    setSelectedWithdrawal(item);
    setWithdrawalProofFile(null);
    setWithdrawalProofPreview(null);
    setWithdrawalApproveNotes(`Transfer penarikan ${item.gold_amount} Poin Gold (Rp ${Number(item.idr_amount).toLocaleString("id-ID")}) ke rekening ${item.bank_name} - ${item.account_number} (${item.account_name}) telah berhasil diproses.`);
    setApproveWithdrawalModalOpen(true);
  };

  const handleConfirmApproveWithdrawal = async (e) => {
    if (e) e.preventDefault();
    if (!selectedWithdrawal) return;
    setSubmittingWithdrawalAction(true);
    try {
      const formData = new FormData();
      formData.append("notes", withdrawalApproveNotes.trim());
      if (withdrawalProofFile) {
        formData.append("transfer_proof", withdrawalProofFile);
      }
      const res = await axios.post(`${API_BASE}/admin/coins/gold/withdrawals/${selectedWithdrawal.id}/approve`, formData, {
        headers: {
          ...getHeaders(),
          "Content-Type": "multipart/form-data",
        },
      });
      if (res.data?.success) {
        toast.success(res.data.message || "Penarikan Gold berhasil disetujui & ditandai telah dibayarkan.");
        setApproveWithdrawalModalOpen(false);
        setSelectedWithdrawal(null);
        setWithdrawalProofFile(null);
        setWithdrawalProofPreview(null);
        fetchWithdrawals(withdrawalPage);
        fetchStats();
        window.dispatchEvent(new CustomEvent("admin-coins-updated"));
      }
    } catch (err) {
      toast.error(err.response?.data?.message || "Gagal menyetujui penarikan Gold.");
    } finally {
      setSubmittingWithdrawalAction(false);
    }
  };

  const handleOpenRejectWithdrawal = (item) => {
    setSelectedWithdrawal(item);
    setWithdrawalRejectReason("Nomor rekening atau nama pemilik rekening tidak cocok dengan data bank.");
    setRejectWithdrawalModalOpen(true);
  };

  const handleConfirmRejectWithdrawal = async (e) => {
    if (e) e.preventDefault();
    if (!selectedWithdrawal) return;
    if (!withdrawalRejectReason.trim()) {
      toast.error("Alasan penolakan wajib diisi.");
      return;
    }
    setSubmittingWithdrawalAction(true);
    try {
      const res = await axios.put(`${API_BASE}/admin/coins/gold/withdrawals/${selectedWithdrawal.id}/reject`, {
        reason: withdrawalRejectReason.trim(),
      }, { headers: getHeaders() });
      if (res.data?.success) {
        toast.success(res.data.message || "Penarikan Gold berhasil ditolak dan saldo Gold telah dikembalikan ke pengguna.");
        setRejectWithdrawalModalOpen(false);
        setSelectedWithdrawal(null);
        fetchWithdrawals(withdrawalPage);
        fetchStats();
        window.dispatchEvent(new CustomEvent("admin-coins-updated"));
      }
    } catch (err) {
      toast.error(err.response?.data?.message || "Gagal menolak penarikan Gold.");
    } finally {
      setSubmittingWithdrawalAction(false);
    }
  };

  const handleDeletePurchase = async (id) => {
    if (!window.confirm("Hapus data riwayat pembelian koin ini secara permanen?")) return;
    try {
      const res = await axios.delete(`${API_BASE}/admin/coins/purchases/${id}`, {
        headers: getHeaders(),
      });
      if (res.data?.success) {
        toast.success(res.data.message || "Riwayat pembelian koin berhasil dihapus.");
        fetchPurchases(purchasePage);
        fetchStats();
      }
    } catch (err) {
      toast.error(err.response?.data?.message || "Gagal menghapus data riwayat pembelian.");
    }
  };

  const handleDeleteWithdrawal = async (id, status) => {
    const confirmMsg = status === "pending"
      ? "Hapus dan batalkan pengajuan penarikan Gold ini? Saldo Gold pengguna akan dikembalikan utuh ke wallet-nya."
      : "Hapus riwayat penarikan Gold ini secara permanen?";
    if (!window.confirm(confirmMsg)) return;
    try {
      const res = await axios.delete(`${API_BASE}/admin/coins/gold/withdrawals/${id}`, {
        headers: getHeaders(),
      });
      if (res.data?.success) {
        toast.success(res.data.message || "Riwayat penarikan Gold berhasil dihapus.");
        fetchWithdrawals(withdrawalPage);
        fetchStats();
      }
    } catch (err) {
      toast.error(err.response?.data?.message || "Gagal menghapus data penarikan.");
    }
  };

  const handleDeleteTransaction = async (id) => {
    if (!window.confirm("Hapus catatan transaksi ini secara permanen?")) return;
    try {
      const res = await axios.delete(`${API_BASE}/admin/coins/transactions/${id}`, {
        headers: getHeaders(),
      });
      if (res.data?.success) {
        toast.success(res.data.message || "Riwayat transaksi berhasil dihapus.");
        fetchTransactions(1);
      }
    } catch (err) {
      toast.error(err.response?.data?.message || "Gagal menghapus catatan transaksi.");
    }
  };

  return (
    <div className="space-y-6 w-full max-w-full font-['Poppins',sans-serif]">
      {/* ── HEADER OVERVIEW ── */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-[#0a4d3a] via-[#0b6b45] to-[#0f7a52] text-white p-6 sm:p-8 shadow-xl border border-emerald-600/30">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/15 backdrop-blur-md text-amber-200 text-xs font-bold border border-white/20">
              <Sparkles size={13} className="text-amber-300" />
              <span>Pusat Kontrol Mata Uang Digital</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-black tracking-tight text-white flex items-center gap-3">
              <SuradeCoinIcon size={46} className="drop-shadow-lg shrink-0" />
              Manajemen Poin
            </h2>
            <p className="text-xs sm:text-sm text-emerald-100/90 max-w-2xl leading-relaxed">
              Kelola pembelian koin via rekening resmi Surade, atur tarif koin untuk seluruh fitur, pantau mutasi transaksi &amp; cashback reward, serta verifikasi bukti transfer pengguna.
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-black/25 backdrop-blur-md border border-white/15 text-right shrink-0">
            <span className="text-xs text-amber-200 font-medium block">Total Pembelian Koin Disetujui</span>
            <span className="text-2xl font-black text-amber-300">
              Rp {Number(stats?.total_revenue_idr || 0).toLocaleString("id-ID")}
            </span>
          </div>
        </div>
      </div>

      {/* ── STATS METRICS ROW ── */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3.5">
        <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-xs space-y-1">
          <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">Koin Beredar</span>
          <div className="flex items-center gap-1.5 text-lg font-black text-slate-900">
            <SuradeCoinIcon size={18} />
            <span>{Number(stats?.total_circulating_coins || 0).toLocaleString("id-ID")}</span>
          </div>
          <div className="text-[10px] text-slate-500 font-medium">
            <span className="text-slate-600 font-bold">{Number(stats?.total_silver_circulating || 0).toLocaleString("id-ID")} Silver</span> • <span className="text-amber-600 font-bold">{Number(stats?.total_gold_circulating || 0).toLocaleString("id-ID")} Gold</span>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-xs space-y-1">
          <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">Total Terjual</span>
          <div className="flex items-center gap-1.5 text-lg font-black text-emerald-700">
            <ArrowDownLeft size={18} className="text-emerald-500" />
            <span>{Number(stats?.total_earned_coins || 0).toLocaleString("id-ID")}</span>
          </div>
          <div className="text-[10px] text-emerald-600 font-medium">Rp {Number(stats?.total_revenue_idr || 0).toLocaleString("id-ID")}</div>
        </div>

        <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-xs space-y-1">
          <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">Total Terpakai</span>
          <div className="flex items-center gap-1.5 text-lg font-black text-purple-700">
            <ArrowUpRight size={18} className="text-purple-500" />
            <span>{Number(stats?.total_spent_coins || 0).toLocaleString("id-ID")}</span>
          </div>
          <div className="text-[10px] text-purple-600 font-medium">Fitur, WA &amp; Chat</div>
        </div>

        <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-xs space-y-1">
          <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">Top Up Pending</span>
          <div className="flex items-center gap-1.5 text-lg font-black text-amber-600">
            <Clock size={18} className="text-amber-500" />
            <span>{Number(stats?.pending_purchases_count || 0).toLocaleString("id-ID")}</span>
          </div>
          <div className="text-[10px] text-amber-600 font-medium">Menunggu Verifikasi</div>
        </div>

        <div className="bg-white rounded-2xl p-4 border border-amber-200 shadow-xs space-y-1 bg-gradient-to-br from-amber-50/50 to-white">
          <span className="text-[11px] font-bold text-amber-700 uppercase tracking-wider block">Tarik Gold Pending</span>
          <div className="flex items-center gap-1.5 text-lg font-black text-amber-700">
            <Banknote size={18} className="text-amber-600" />
            <span>{Number(stats?.pending_withdrawals_count || 0).toLocaleString("id-ID")}</span>
          </div>
          <div className="text-[10px] text-amber-600 font-medium">Perlu Ditransfer</div>
        </div>
      </div>

      {/* ── SUB-TABS NAVIGATION ── */}
      <div className="bg-white rounded-2xl p-1.5 border border-slate-200 shadow-xs flex items-center gap-1.5 overflow-x-auto text-xs font-bold">
        <button
          onClick={() => setActiveSubTab("purchases")}
          className={`px-4 py-2.5 rounded-xl transition-all flex items-center gap-2 cursor-pointer shrink-0 ${
            activeSubTab === "purchases"
              ? "bg-[#059669] text-white shadow-xs"
              : "text-slate-600 hover:bg-slate-100"
          }`}
        >
          <CreditCard size={16} />
          <span>Verifikasi Pembelian Koin ({stats?.pending_purchases_count || 0})</span>
        </button>

        <button
          onClick={() => setActiveSubTab("withdrawals")}
          className={`px-4 py-2.5 rounded-xl transition-all flex items-center gap-2 cursor-pointer shrink-0 ${
            activeSubTab === "withdrawals"
              ? "bg-amber-600 text-white shadow-xs"
              : "text-amber-800 hover:bg-amber-50 font-bold"
          }`}
        >
          <Banknote size={16} />
          <span>Pencairan Gold ({stats?.pending_withdrawals_count || 0})</span>
        </button>

        <button
          onClick={() => setActiveSubTab("packages")}
          className={`px-4 py-2.5 rounded-xl transition-all flex items-center gap-2 cursor-pointer shrink-0 ${
            activeSubTab === "packages"
              ? "bg-[#059669] text-white shadow-xs"
              : "text-slate-600 hover:bg-slate-100"
          }`}
        >
          <SuradeCoinIcon size={16} />
          <span>Paket Koin Resmi</span>
        </button>

        <button
          onClick={() => setActiveSubTab("services")}
          className={`px-4 py-2.5 rounded-xl transition-all flex items-center gap-2 cursor-pointer shrink-0 ${
            activeSubTab === "services"
              ? "bg-[#059669] text-white shadow-xs"
              : "text-slate-600 hover:bg-slate-100"
          }`}
        >
          <Layers size={16} />
          <span>Tarif Layanan Fitur</span>
        </button>

        <button
          onClick={() => setActiveSubTab("transactions")}
          className={`px-4 py-2.5 rounded-xl transition-all flex items-center gap-2 cursor-pointer shrink-0 ${
            activeSubTab === "transactions"
              ? "bg-[#059669] text-white shadow-xs"
              : "text-slate-600 hover:bg-slate-100"
          }`}
        >
          <History size={16} />
          <span>Log Transaksi &amp; Cashback</span>
        </button>

        <button
          onClick={() => setActiveSubTab("wallets")}
          className={`px-4 py-2.5 rounded-xl transition-all flex items-center gap-2 cursor-pointer shrink-0 ${
            activeSubTab === "wallets"
              ? "bg-[#059669] text-white shadow-xs"
              : "text-slate-600 hover:bg-slate-100"
          }`}
        >
          <Users size={16} />
          <span>Wallet &amp; Audit Pengguna</span>
        </button>
      </div>

      {/* ── SUB-TAB 1: VERIFIKASI PEMBELIAN KOIN (TOP UP REQUESTS) ── */}
      {activeSubTab === "purchases" && (
        <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xs space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
            <div>
              <h3 className="text-base font-extrabold text-slate-900">Permohonan Pembelian &amp; Top Up Koin</h3>
              <p className="text-xs text-slate-500">Periksa bukti transfer pembayaran resmi dan setujui penambahan koin ke wallet pengguna.</p>
            </div>

            <div className="flex items-center gap-2">
              <select
                value={purchaseStatusFilter}
                onChange={(e) => setPurchaseStatusFilter(e.target.value)}
                className="h-9 px-3 text-xs bg-slate-50 border border-slate-200 rounded-xl font-bold"
              >
                <option value="all">Semua Status</option>
                <option value="pending">Menunggu Verifikasi (Pending)</option>
                <option value="paid">Disetujui (Paid)</option>
                <option value="failed">Ditolak (Failed)</option>
              </select>

              <form onSubmit={(e) => { e.preventDefault(); fetchPurchases(1); }} className="relative">
                <input
                  type="text"
                  placeholder="Cari user / nomor order..."
                  value={purchaseSearch}
                  onChange={(e) => setPurchaseSearch(e.target.value)}
                  className="h-9 pl-8 pr-3 text-xs bg-slate-50 border border-slate-200 rounded-xl placeholder-slate-400 w-56"
                />
                <Search size={14} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" />
              </form>
            </div>
          </div>

          {loadingPurchases ? (
            <SuradeLoader variant="section" size="sm" text="Memuat data permohonan koin" minHeight="180px" />
          ) : purchases.length === 0 ? (
            <div className="text-center py-14 text-slate-400 space-y-2">
              <CreditCard size={36} className="mx-auto opacity-40" />
              <p className="text-xs font-semibold">Tidak ada permohonan pembelian koin pada filter ini.</p>
            </div>
          ) : (
            <div className="overflow-x-auto rounded-2xl border border-slate-200">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 uppercase font-bold text-[11px]">
                    <th className="p-3.5">Order</th>
                    <th className="p-3.5">Pengguna</th>
                    <th className="p-3.5">Paket Koin</th>
                    <th className="p-3.5">Total Tagihan</th>
                    <th className="p-3.5">Metode / Pengirim</th>
                    <th className="p-3.5">Bukti Bayar</th>
                    <th className="p-3.5">Status</th>
                    <th className="p-3.5 text-right">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {purchases.map((item) => {
                    const isPaid = item.payment_status === "paid";
                    const isPending = item.payment_status === "pending";
                    return (
                      <tr key={item.id} className="hover:bg-slate-50/70">
                        <td className="p-3.5 font-mono text-slate-500 font-bold">#{item.order_number}</td>
                        <td className="p-3.5">
                          <div className="font-bold text-slate-900">{item.user?.name || "User #" + item.user_id}</div>
                          <div className="text-[10px] text-slate-400">{item.user?.email}</div>
                        </td>
                        <td className="p-3.5">
                          <div className="font-bold text-amber-700 flex items-center gap-1">
                            <SuradeCoinIcon size={16} />
                            <span>{Number(item.total_coin).toLocaleString("id-ID")} Coin</span>
                          </div>
                          <div className="text-[10px] text-slate-400">{item.package?.name || "Paket Top Up"}</div>
                        </td>
                        <td className="p-3.5 font-black text-slate-900">
                          Rp {Number(item.price_idr).toLocaleString("id-ID")}
                        </td>
                        <td className="p-3.5">
                          <div className="font-semibold text-slate-800">{item.payment_method || "Transfer Bank"}</div>
                          {item.sender_account_name && (
                            <div className="text-[10px] text-slate-400">a.n {item.sender_account_name} ({item.sender_bank_name || "-"})</div>
                          )}
                        </td>
                        <td className="p-3.5">
                          {item.proof_image ? (
                            <button
                              type="button"
                              onClick={() => setPreviewProofImage(getFullImageUrl(item.proof_image))}
                              className="px-2.5 py-1 rounded-lg bg-emerald-50 text-emerald-700 hover:bg-emerald-100 font-bold text-[11px] flex items-center gap-1 border border-emerald-200 cursor-pointer"
                            >
                              <Eye size={13} />
                              <span>Lihat Bukti</span>
                            </button>
                          ) : (
                            <span className="text-[11px] text-slate-400 italic">Tanpa Bukti</span>
                          )}
                        </td>
                        <td className="p-3.5">
                          <div className="space-y-1">
                            <div className="flex items-center gap-1.5 flex-wrap">
                              <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold ${
                                isPaid
                                  ? "bg-emerald-100 text-emerald-800"
                                  : isPending
                                  ? "bg-amber-100 text-amber-800"
                                  : "bg-rose-100 text-rose-800"
                              }`}>
                                {isPaid ? "Disetujui" : isPending ? "Menunggu" : "Ditolak"}
                              </span>
                              {isPending && item.admin_notes && (item.admin_notes.includes("diperbaiki") || item.admin_notes.includes("user")) && (
                                <span className="px-2 py-0.5 rounded-full text-[9.5px] font-black bg-cyan-100 text-cyan-800 border border-cyan-200">
                                  🔄 Diperbaiki User
                                </span>
                              )}
                            </div>
                            {!isPaid && !isPending && item.admin_notes && (
                              <div className="text-[10px] text-rose-700 bg-rose-50 border border-rose-200 p-1.5 rounded-lg max-w-xs leading-snug">
                                <span className="font-bold">Alasan:</span> {item.admin_notes}
                              </div>
                            )}
                          </div>
                        </td>
                        <td className="p-3.5 text-right whitespace-nowrap">
                          <div className="flex items-center justify-end gap-1.5">
                            {isPending && (
                              <>
                                <button
                                  onClick={() => handleApprovePurchase(item.id)}
                                  className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-[11px] shadow-xs cursor-pointer inline-flex items-center gap-1"
                                >
                                  <Check size={13} strokeWidth={3} />
                                  <span>Setujui</span>
                                </button>
                                <button
                                  onClick={() => openRejectModal(item)}
                                  className="px-2.5 py-1.5 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-600 font-bold text-[11px] border border-rose-200 cursor-pointer"
                                >
                                  Tolak
                                </button>
                              </>
                            )}
                            {!isPaid && !isPending && (
                              <>
                                <button
                                  onClick={() => handleApprovePurchase(item.id)}
                                  className="px-2.5 py-1.5 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-700 font-bold text-[10.5px] border border-emerald-200 cursor-pointer inline-flex items-center gap-1"
                                  title="Setujui permohonan ini jika pembayaran sudah valid"
                                >
                                  <Check size={12} />
                                  <span>Setujui Tetap</span>
                                </button>
                                <button
                                  onClick={() => openRejectModal(item)}
                                  className="px-2 py-1.5 rounded-xl bg-slate-50 hover:bg-slate-100 text-slate-600 font-bold text-[10.5px] border border-slate-200 cursor-pointer"
                                  title="Ubah alasan penolakan"
                                >
                                  Ubah Alasan
                                </button>
                              </>
                            )}
                            {isPaid && (
                              <span className="text-[11px] text-emerald-600 font-bold flex items-center justify-end gap-1 mr-1">
                                <CheckCircle size={14} /> Selesai
                              </span>
                            )}

                            <button
                              type="button"
                              onClick={() => handleDeletePurchase(item.id)}
                              className="p-1.5 rounded-xl text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer border border-transparent hover:border-rose-200"
                              title="Hapus riwayat permohonan pembelian ini"
                            >
                              <Trash2 size={13} />
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
      )}

      {/* ── SUB-TAB 2: PAKET KOIN RESMI ── */}
      {activeSubTab === "packages" && (
        <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-4">
            <div>
              <h3 className="text-base font-extrabold text-slate-900">Daftar Paket Pembelian Koin</h3>
              <p className="text-xs text-slate-500">Atur paket koin resmi yang dapat dibeli oleh pengguna via sistem pembayaran resmi Surade.</p>
            </div>
            <button
              onClick={() => handleOpenPackageModal()}
              className="px-4 py-2.5 rounded-xl bg-[#059669] hover:bg-[#005f5b] text-white font-bold text-xs shadow-xs flex items-center gap-1.5 cursor-pointer"
            >
              <Plus size={16} strokeWidth={2.5} />
              <span>Tambah Paket Koin</span>
            </button>
          </div>

          {loadingPackages ? (
            <SuradeLoader variant="section" size="sm" text="Memuat daftar paket koin" minHeight="180px" />
          ) : (
            <div className="overflow-x-auto rounded-2xl border border-slate-200">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 uppercase font-bold text-[11px]">
                    <th className="p-3.5">Urutan</th>
                    <th className="p-3.5">Nama Paket</th>
                    <th className="p-3.5">Jumlah Koin</th>
                    <th className="p-3.5">Bonus Koin</th>
                    <th className="p-3.5">Harga Rupiah (IDR)</th>
                    <th className="p-3.5">Badge Promo</th>
                    <th className="p-3.5">Status</th>
                    <th className="p-3.5 text-right">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {packages.map((pkg) => (
                    <tr key={pkg.id} className="hover:bg-slate-50/70">
                      <td className="p-3.5 font-bold text-slate-400">{pkg.sort_order}</td>
                      <td className="p-3.5 font-bold text-slate-900">{pkg.name}</td>
                      <td className="p-3.5 font-bold text-amber-600">
                        <div className="flex items-center gap-1"><SuradeCoinIcon size={16} /> {Number(pkg.coin_amount).toLocaleString("id-ID")}</div>
                      </td>
                      <td className="p-3.5 font-semibold text-emerald-600">+{Number(pkg.bonus_coin).toLocaleString("id-ID")}</td>
                      <td className="p-3.5 font-black text-slate-900">Rp {Number(pkg.price_idr).toLocaleString("id-ID")}</td>
                      <td className="p-3.5">
                        {pkg.badge_label ? (
                          <span className="px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 text-[10px] font-black">{pkg.badge_label}</span>
                        ) : "-"}
                      </td>
                      <td className="p-3.5">
                        <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold ${pkg.is_active ? "bg-emerald-100 text-emerald-800" : "bg-slate-100 text-slate-600"}`}>
                          {pkg.is_active ? "Aktif" : "Nonaktif"}
                        </span>
                      </td>
                      <td className="p-3.5 text-right space-x-1.5">
                        <button onClick={() => handleOpenPackageModal(pkg)} className="p-1.5 rounded-lg text-blue-600 hover:bg-blue-50"><Edit2 size={14} /></button>
                        <button onClick={() => handleDeletePackage(pkg.id)} className="p-1.5 rounded-lg text-rose-600 hover:bg-rose-50"><Trash2 size={14} /></button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* ── SUB-TAB 3: TARIF LAYANAN FITUR ── */}
      {activeSubTab === "services" && (
        <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-4">
            <div>
              <h3 className="text-base font-extrabold text-slate-900">Katalog Tarif Layanan &amp; Fitur Koin</h3>
              <p className="text-xs text-slate-500">Ubah tarif koin untuk Bisnis Premium, Iklan Banner, Publikasi Event, atau Akses WhatsApp tanpa perlu ubah kode.</p>
            </div>
            <button
              onClick={() => handleOpenServiceModal()}
              className="px-4 py-2.5 rounded-xl bg-[#059669] hover:bg-[#005f5b] text-white font-bold text-xs shadow-xs flex items-center gap-1.5 cursor-pointer"
            >
              <Plus size={16} strokeWidth={2.5} />
              <span>Tambah Layanan Baru</span>
            </button>
          </div>

          {loadingServices ? (
            <SuradeLoader variant="section" size="sm" text="Memuat katalog tarif layanan koin" minHeight="180px" />
          ) : (
            <div className="overflow-x-auto rounded-2xl border border-slate-200">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 uppercase font-bold text-[11px]">
                    <th className="p-3.5">Kode Layanan</th>
                    <th className="p-3.5">Nama Layanan</th>
                    <th className="p-3.5">Kategori</th>
                    <th className="p-3.5">Tarif Koin</th>
                    <th className="p-3.5">Durasi</th>
                    <th className="p-3.5">Status</th>
                    <th className="p-3.5 text-right">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {services.map((svc) => (
                    <tr key={svc.id} className="hover:bg-slate-50/70">
                      <td className="p-3.5 font-mono font-bold text-slate-600">{svc.code}</td>
                      <td className="p-3.5 font-bold text-slate-900">
                        <div>{svc.name}</div>
                        <div className="text-[10px] text-slate-400 font-normal leading-tight mt-0.5">{svc.description}</div>
                      </td>
                      <td className="p-3.5 uppercase text-[10px] font-bold text-slate-500">{svc.category}</td>
                      <td className="p-3.5 font-black text-amber-600">
                        <div className="flex items-center gap-1"><SuradeCoinIcon size={16} /> {Number(svc.coin_price).toLocaleString("id-ID")} Coin</div>
                      </td>
                      <td className="p-3.5 text-slate-600">{svc.duration_days ? `${svc.duration_days} Hari` : "Permanen"}</td>
                      <td className="p-3.5">
                        <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold ${svc.is_active ? "bg-emerald-100 text-emerald-800" : "bg-slate-100 text-slate-600"}`}>
                          {svc.is_active ? "Aktif" : "Nonaktif"}
                        </span>
                      </td>
                      <td className="p-3.5 text-right space-x-1.5">
                        <button onClick={() => handleOpenServiceModal(svc)} className="p-1.5 rounded-lg text-blue-600 hover:bg-blue-50"><Edit2 size={14} /></button>
                        <button onClick={() => handleDeleteService(svc.id)} className="p-1.5 rounded-lg text-rose-600 hover:bg-rose-50"><Trash2 size={14} /></button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* ── SUB-TAB 4: LOG TRANSAKSI PLATFORM & CASHBACK ── */}
      {activeSubTab === "transactions" && (
        <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xs space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
            <div>
              <h3 className="text-base font-extrabold text-slate-900">Log Mutasi Koin Seluruh Platform</h3>
              <p className="text-xs text-slate-500">Audit trail transaksi keluar, transaksi masuk, dan reward cashback koin seluruh pengguna.</p>
            </div>

            <div className="flex items-center gap-2">
              <select
                value={txTypeFilter}
                onChange={(e) => setTxTypeFilter(e.target.value)}
                className="h-9 px-3 text-xs bg-slate-50 border border-slate-200 rounded-xl font-bold"
              >
                <option value="all">Semua Tipe</option>
                <option value="credit">Koin Masuk &amp; Cashback (+)</option>
                <option value="debit">Koin Keluar / Bayar (-)</option>
              </select>

              <form onSubmit={(e) => { e.preventDefault(); fetchTransactions(1); }} className="relative">
                <input
                  type="text"
                  placeholder="Cari user / no. transaksi..."
                  value={txSearch}
                  onChange={(e) => setTxSearch(e.target.value)}
                  className="h-9 pl-8 pr-3 text-xs bg-slate-50 border border-slate-200 rounded-xl placeholder-slate-400 w-56"
                />
                <Search size={14} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" />
              </form>
            </div>
          </div>

          {loadingTransactions ? (
            <SuradeLoader variant="section" size="sm" text="Memuat log transaksi koin platform" minHeight="180px" />
          ) : (
            <div className="overflow-x-auto rounded-2xl border border-slate-200">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 uppercase font-bold text-[11px]">
                    <th className="p-3.5">ID Transaksi</th>
                    <th className="p-3.5">Pengguna</th>
                    <th className="p-3.5">Layanan / Deskripsi</th>
                    <th className="p-3.5">Nominal Koin</th>
                    <th className="p-3.5">Saldo Sesudah</th>
                    <th className="p-3.5">Tanggal</th>
                    <th className="p-3.5 text-right">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {transactions.map((tx) => {
                    const isCredit = tx.type === "credit";
                    return (
                      <tr key={tx.id} className="hover:bg-slate-50/70">
                        <td className="p-3.5 font-mono text-slate-500">#{tx.transaction_number}</td>
                        <td className="p-3.5">
                          <div className="font-bold text-slate-900">{tx.user?.name || "User #" + tx.user_id}</div>
                          <div className="text-[10px] text-slate-400">{tx.user?.email}</div>
                        </td>
                        <td className="p-3.5">
                          <div className="font-bold text-slate-800">{tx.service_name || tx.description}</div>
                          <div className="text-[10px] text-slate-400">{tx.description}</div>
                        </td>
                        <td className="p-3.5 font-black">
                          <span className={`inline-flex items-center gap-1 ${isCredit ? "text-emerald-600" : "text-rose-600"}`}>
                            {isCredit ? "+" : "-"}{Number(tx.amount).toLocaleString("id-ID")} <SuradeCoinIcon size={14} />
                          </span>
                        </td>
                        <td className="p-3.5 font-semibold text-slate-700">{Number(tx.balance_after).toLocaleString("id-ID")} Coin</td>
                        <td className="p-3.5 text-slate-400 text-[11px]">
                          {new Date(tx.created_at).toLocaleString("id-ID", { day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" })}
                        </td>
                        <td className="p-3.5 text-right whitespace-nowrap">
                          <button
                            type="button"
                            onClick={() => handleDeleteTransaction(tx.id)}
                            className="p-1.5 rounded-xl text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer border border-transparent hover:border-rose-200"
                            title="Hapus riwayat transaksi ini"
                          >
                            <Trash2 size={13} />
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* ── SUB-TAB 5: WALLET PENGGUNA & PENYESUAIAN SALDO ── */}
      {activeSubTab === "wallets" && (
        <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xs space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
            <div>
              <h3 className="text-base font-extrabold text-slate-900">Daftar Dompet Koin Pengguna</h3>
              <p className="text-xs text-slate-500">Lihat saldo koin pengguna serta lakukan penyesuaian saldo resmi dengan audit trail.</p>
            </div>

            <form onSubmit={(e) => { e.preventDefault(); fetchWallets(1); }} className="relative">
              <input
                type="text"
                placeholder="Cari nama / email pengguna..."
                value={walletSearch}
                onChange={(e) => setWalletSearch(e.target.value)}
                className="h-9 pl-8 pr-3 text-xs bg-slate-50 border border-slate-200 rounded-xl placeholder-slate-400 w-64"
              />
              <Search size={14} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" />
            </form>
          </div>

          {loadingWallets ? (
            <SuradeLoader variant="section" size="sm" text="Memuat daftar dompet koin pengguna" minHeight="180px" />
          ) : (
            <div className="overflow-x-auto rounded-2xl border border-slate-200">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 uppercase font-bold text-[11px]">
                    <th className="p-3.5">User</th>
                    <th className="p-3.5">Tipe Akun</th>
                    <th className="p-3.5">Saldo Koin Saat Ini</th>
                    <th className="p-3.5">Total Koin Didapat</th>
                    <th className="p-3.5">Total Koin Terpakai</th>
                    <th className="p-3.5 text-right">Aksi Audit</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {wallets.map((w) => (
                    <tr key={w.id} className="hover:bg-slate-50/70">
                      <td className="p-3.5">
                        <div className="font-bold text-slate-900">{w.user?.name || "User #" + w.user_id}</div>
                        <div className="text-[10px] text-slate-400">{w.user?.email}</div>
                      </td>
                      <td className="p-3.5">
                        <span className="px-2 py-0.5 rounded-md bg-slate-100 font-bold text-slate-700 uppercase text-[10px]">
                          {w.user?.account_type || "Personal"}
                        </span>
                      </td>
                      <td className="p-3.5 font-black text-amber-600">
                        <div className="flex items-center gap-1 text-sm"><SuradeCoinIcon size={16} /> {Number(w.balance).toLocaleString("id-ID")}</div>
                      </td>
                      <td className="p-3.5 text-emerald-600 font-bold">+{Number(w.total_earned).toLocaleString("id-ID")}</td>
                      <td className="p-3.5 text-rose-600 font-bold">-{Number(w.total_spent).toLocaleString("id-ID")}</td>
                      <td className="p-3.5 text-right">
                        <button
                          onClick={() => handleOpenAdjustModal(w)}
                          className="px-3 py-1.5 rounded-xl bg-gradient-to-r from-amber-500 to-emerald-600 hover:opacity-90 text-white font-bold text-[11px] shadow-xs cursor-pointer"
                        >
                          Sesuaikan Saldo
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* ── SUB-TAB 6: PERMOHONAN PENCAIRAN SALDO GOLD KE REKENING/E-WALLET ── */}
      {activeSubTab === "withdrawals" && (
        <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xs space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
            <div>
              <h3 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
                <Banknote size={18} className="text-amber-600" />
                Permohonan Pencairan Saldo Gold
              </h3>
              <p className="text-xs text-slate-500">
                Kelola pencairan saldo Poin Gold hasil penjualan/akses fitur pengguna menjadi Rupiah (1 Gold = Rp 1.000).
              </p>
            </div>

            <div className="flex items-center gap-2">
              <select
                value={withdrawalStatusFilter}
                onChange={(e) => setWithdrawalStatusFilter(e.target.value)}
                className="h-9 px-3 text-xs bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-700"
              >
                <option value="all">Semua Status</option>
                <option value="pending">Menunggu Transfer (Pending)</option>
                <option value="paid">Telah Ditransfer (Paid)</option>
                <option value="rejected">Ditolak / Batal</option>
              </select>
            </div>
          </div>

          {loadingWithdrawals ? (
            <SuradeLoader variant="section" size="sm" text="Memuat daftar permohonan pencairan Gold" minHeight="180px" />
          ) : withdrawals.length === 0 ? (
            <div className="p-8 text-center bg-slate-50 rounded-2xl border border-dashed border-slate-200 text-slate-500 space-y-2">
              <Banknote size={36} className="mx-auto text-slate-400 stroke-1" />
              <p className="text-xs font-semibold">Tidak ada data permohonan penarikan Gold ({withdrawalStatusFilter}).</p>
            </div>
          ) : (
            <div className="overflow-x-auto rounded-2xl border border-slate-200">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 uppercase font-bold text-[11px]">
                    <th className="p-3.5">ID &amp; Tanggal</th>
                    <th className="p-3.5">Pengguna</th>
                    <th className="p-3.5">Jumlah Penarikan</th>
                    <th className="p-3.5">Rekening Tujuan</th>
                    <th className="p-3.5">Status</th>
                    <th className="p-3.5">Catatan Admin</th>
                    <th className="p-3.5 text-right">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {withdrawals.map((item) => {
                    const isPending = item.status === "pending";
                    const isPaid = item.status === "paid" || item.status === "approved";
                    const isRejected = item.status === "rejected";

                    return (
                      <tr key={item.id} className="hover:bg-slate-50/70 transition-colors">
                        <td className="p-3.5">
                          <span className="font-mono font-bold text-slate-900 block">
                            #{item.withdrawal_number || item.id}
                          </span>
                          <span className="text-[10px] text-slate-400">
                            {new Date(item.created_at).toLocaleString("id-ID", {
                              day: "numeric",
                              month: "short",
                              year: "numeric",
                              hour: "2-digit",
                              minute: "2-digit",
                            })}
                          </span>
                        </td>

                        <td className="p-3.5">
                          <div className="font-bold text-slate-900">{item.user?.name || "User #" + item.user_id}</div>
                          <div className="text-[10px] text-slate-400">{item.user?.email}</div>
                          {item.user?.phone && (
                            <div className="text-[10px] text-slate-500 font-mono">{item.user.phone}</div>
                          )}
                        </td>

                        <td className="p-3.5">
                          <div className="font-black text-amber-700 text-sm flex items-center gap-1">
                            <SuradeCoinIcon size={16} />
                            <span>{Number(item.gold_amount).toLocaleString("id-ID")} Gold</span>
                          </div>
                          <div className="text-[11px] font-bold text-emerald-700">
                            Rp {Number(item.idr_amount).toLocaleString("id-ID")}
                          </div>
                        </td>

                        <td className="p-3.5">
                          <div className="font-bold text-slate-900 uppercase flex items-center gap-1.5">
                            <span className="px-1.5 py-0.5 rounded bg-slate-100 text-[10px] text-slate-700 border border-slate-200">
                              {item.bank_name}
                            </span>
                            <span className="font-mono">{item.account_number}</span>
                          </div>
                          <div className="text-[10.5px] text-slate-600 font-semibold mt-0.5">
                            a.n. {item.account_name}
                          </div>
                        </td>

                        <td className="p-3.5">
                          {isPending && (
                            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-amber-50 text-amber-700 border border-amber-200 font-bold text-[10.5px]">
                              <Clock size={12} /> Menunggu Transfer
                            </span>
                          )}
                          {isPaid && (
                            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 font-bold text-[10.5px]">
                              <CheckCircle2 size={12} /> Telah Ditransfer
                            </span>
                          )}
                          {isRejected && (
                            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-rose-50 text-rose-700 border border-rose-200 font-bold text-[10.5px]">
                              <XCircle size={12} /> Ditolak (Refund)
                            </span>
                          )}
                        </td>

                        <td className="p-3.5 max-w-[200px]">
                          {item.admin_notes ? (
                            <p className="text-[11px] text-slate-600 line-clamp-2" title={item.admin_notes}>
                              {item.admin_notes}
                            </p>
                          ) : (
                            <span className="text-slate-400 italic text-[10.5px]">-</span>
                          )}
                          {item.transfer_proof && (
                            <button
                              type="button"
                              onClick={() => setPreviewProofImage(getFullImageUrl(item.transfer_proof))}
                              className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-teal-50 text-teal-700 hover:bg-teal-100 border border-teal-200 text-[10.5px] font-bold cursor-pointer transition-all mt-1"
                              title="Lihat Bukti Transfer Bank"
                            >
                              <Eye size={12} />
                              <span>Lihat Bukti Transfer</span>
                            </button>
                          )}
                        </td>

                        <td className="p-3.5 text-right whitespace-nowrap">
                          <div className="flex items-center justify-end gap-1.5">
                            {isPending && (
                              <>
                                <button
                                  onClick={() => handleOpenApproveWithdrawal(item)}
                                  className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-[11px] shadow-xs cursor-pointer flex items-center gap-1"
                                  title="Setujui dan tandai telah ditransfer"
                                >
                                  <Check size={13} />
                                  <span>Setujui</span>
                                </button>
                                <button
                                  onClick={() => handleOpenRejectWithdrawal(item)}
                                  className="px-2.5 py-1.5 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 font-bold text-[11px] cursor-pointer flex items-center gap-1"
                                  title="Tolak dan kembalikan saldo Gold"
                                >
                                  <X size={13} />
                                  <span>Tolak</span>
                                </button>
                              </>
                            )}
                            {isPaid && (
                              <span className="text-slate-400 font-medium text-[11px] mr-1">Selesai</span>
                            )}
                            {isRejected && (
                              <span className="text-rose-500 font-medium text-[11px] mr-1">Ditolak</span>
                            )}

                            <button
                              type="button"
                              onClick={() => handleDeleteWithdrawal(item.id, item.status)}
                              className="p-1.5 rounded-xl text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer border border-transparent hover:border-rose-200"
                              title="Hapus riwayat penarikan ini"
                            >
                              <Trash2 size={13} />
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

          {/* Pagination */}
          {withdrawalPagination && withdrawalPagination.last_page > 1 && (
            <div className="flex items-center justify-between pt-3 border-t border-slate-100 text-xs">
              <span className="text-slate-500">
                Halaman {withdrawalPagination.current_page} dari {withdrawalPagination.last_page} ({withdrawalPagination.total} total penarikan)
              </span>
              <div className="flex gap-1.5">
                <button
                  disabled={withdrawalPagination.current_page <= 1}
                  onClick={() => fetchWithdrawals(withdrawalPagination.current_page - 1)}
                  className="px-3 py-1.5 rounded-xl border border-slate-200 text-slate-700 disabled:opacity-40 font-bold cursor-pointer"
                >
                  Sebelumnya
                </button>
                <button
                  disabled={withdrawalPagination.current_page >= withdrawalPagination.last_page}
                  onClick={() => fetchWithdrawals(withdrawalPagination.current_page + 1)}
                  className="px-3 py-1.5 rounded-xl border border-slate-200 text-slate-700 disabled:opacity-40 font-bold cursor-pointer"
                >
                  Selanjutnya
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ── MODAL KONFIRMASI SETUJUI PENARIKAN GOLD ── */}
      {approveWithdrawalModalOpen && selectedWithdrawal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto">
          <div className="bg-white rounded-3xl p-5 sm:p-6 w-full max-w-md shadow-2xl border border-emerald-200 space-y-4 max-h-[90vh] overflow-y-auto my-auto">
            <div className="flex items-center justify-between border-b pb-3">
              <div className="flex items-center gap-2 text-emerald-700">
                <CheckCircle2 size={22} />
                <h4 className="font-extrabold text-slate-900 text-sm">Konfirmasi Transfer Penarikan Gold</h4>
              </div>
              <button onClick={() => setApproveWithdrawalModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                <X size={18} />
              </button>
            </div>

            <div className="p-3.5 rounded-2xl bg-emerald-50 border border-emerald-200/80 space-y-2 text-xs">
              <div className="flex justify-between items-center text-slate-600">
                <span>Pemohon:</span>
                <span className="font-bold text-slate-900">{selectedWithdrawal.user?.name}</span>
              </div>
              <div className="flex justify-between items-center text-slate-600">
                <span>Poin Gold:</span>
                <span className="font-black text-amber-700">{selectedWithdrawal.gold_amount} Gold</span>
              </div>
              <div className="flex justify-between items-center text-slate-600">
                <span>Nominal Rupiah:</span>
                <span className="font-black text-emerald-700 text-sm">Rp {Number(selectedWithdrawal.idr_amount).toLocaleString("id-ID")}</span>
              </div>
              <div className="pt-2 border-t border-emerald-200/60">
                <span className="text-slate-500 block text-[11px]">Rekening Tujuan:</span>
                <div className="font-bold text-slate-900">{selectedWithdrawal.bank_name} - {selectedWithdrawal.account_number}</div>
                <div className="text-slate-700 font-semibold">a.n. {selectedWithdrawal.account_name}</div>
              </div>
            </div>

            <form onSubmit={handleConfirmApproveWithdrawal} className="space-y-3 text-xs">
              <div>
                <label className="font-bold text-slate-700 block mb-1">Catatan / No. Referensi Transfer Admin</label>
                <textarea
                  rows={2}
                  required
                  value={withdrawalApproveNotes}
                  onChange={(e) => setWithdrawalApproveNotes(e.target.value)}
                  placeholder="Masukkan nomor referensi transfer bank atau catatan verifikasi..."
                  className="w-full p-2.5 border border-slate-300 rounded-xl"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">
                  Upload Foto Bukti Transfer (Screenshot Struk / Bukti Kirim Bank / E-Wallet)
                </label>
                <div className="border-2 border-dashed border-slate-300 rounded-2xl p-3 text-center hover:border-emerald-500 transition-colors bg-slate-50/50">
                  {withdrawalProofPreview ? (
                    <div className="relative group max-w-[200px] mx-auto">
                      <img
                        src={withdrawalProofPreview}
                        alt="Preview Bukti"
                        className="w-full max-h-36 object-contain rounded-xl border border-slate-200 shadow-xs"
                      />
                      <button
                        type="button"
                        onClick={() => {
                          setWithdrawalProofFile(null);
                          setWithdrawalProofPreview(null);
                        }}
                        className="absolute -top-2 -right-2 p-1 bg-rose-600 text-white rounded-full shadow-md hover:bg-rose-700 cursor-pointer"
                        title="Hapus foto"
                      >
                        <X size={14} />
                      </button>
                    </div>
                  ) : (
                    <label className="cursor-pointer block py-2">
                      <Upload size={22} className="mx-auto text-slate-400 mb-1" />
                      <span className="text-xs font-bold text-emerald-700 block">Pilih Gambar Bukti Transfer</span>
                      <span className="text-[10.5px] text-slate-400 block mt-0.5">JPG, PNG, WEBP (Maks 5MB)</span>
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) {
                            setWithdrawalProofFile(file);
                            setWithdrawalProofPreview(URL.createObjectURL(file));
                          }
                        }}
                      />
                    </label>
                  )}
                </div>
              </div>

              <div className="pt-3 border-t flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setApproveWithdrawalModalOpen(false)}
                  className="px-4 py-2 border rounded-xl font-bold text-slate-700 hover:bg-slate-100"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={submittingWithdrawalAction}
                  className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                >
                  {submittingWithdrawalAction ? <Loader2 size={15} className="animate-spin" /> : <Check size={15} />}
                  <span>Tandai Selesai Ditransfer</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── MODAL KONFIRMASI TOLAK PENARIKAN GOLD ── */}
      {rejectWithdrawalModalOpen && selectedWithdrawal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto">
          <div className="bg-white rounded-3xl p-5 sm:p-6 w-full max-w-md shadow-2xl border border-rose-200 space-y-4 max-h-[90vh] overflow-y-auto my-auto">
            <div className="flex items-center justify-between border-b pb-3">
              <div className="flex items-center gap-2 text-rose-600">
                <XCircle size={22} />
                <h4 className="font-extrabold text-slate-900 text-sm">Tolak Penarikan Saldo Gold</h4>
              </div>
              <button onClick={() => setRejectWithdrawalModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                <X size={18} />
              </button>
            </div>

            <div className="p-3.5 rounded-2xl bg-rose-50 border border-rose-200/80 space-y-1.5 text-xs text-slate-700">
              <p className="font-semibold text-rose-800">
                Menolak penarikan ini akan <strong>mengembalikan {selectedWithdrawal.gold_amount} Poin Gold</strong> secara utuh ke dompet pengguna.
              </p>
              <div className="text-[11px] text-slate-600">
                Pengguna: <strong>{selectedWithdrawal.user?.name}</strong> • Rekening: <strong>{selectedWithdrawal.bank_name} {selectedWithdrawal.account_number}</strong>
              </div>
            </div>

            <form onSubmit={handleConfirmRejectWithdrawal} className="space-y-3 text-xs">
              <div>
                <label className="font-bold text-slate-700 block mb-1">
                  Alasan Penolakan <span className="text-rose-600">*</span>
                </label>
                <div className="space-y-1.5 mb-2">
                  {[
                    "Nomor rekening atau nama penerima tidak cocok dengan bank",
                    "Rekening tujuan terblokir atau tidak dapat menerima transfer",
                    "Permintaan dibatalkan atas konfirmasi pengguna",
                  ].map((preset, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => setWithdrawalRejectReason(preset)}
                      className="w-full text-left p-2 rounded-xl border border-slate-200 bg-slate-50 hover:bg-rose-50 hover:border-rose-200 text-[11px] font-medium text-slate-700 transition-colors"
                    >
                      {preset}
                    </button>
                  ))}
                </div>
                <textarea
                  rows={3}
                  required
                  value={withdrawalRejectReason}
                  onChange={(e) => setWithdrawalRejectReason(e.target.value)}
                  placeholder="Jelaskan alasan penolakan agar pengguna dapat memperbaiki data rekeningnya..."
                  className="w-full p-2.5 border border-slate-300 rounded-xl"
                />
              </div>

              <div className="pt-3 border-t flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setRejectWithdrawalModalOpen(false)}
                  className="px-4 py-2 border rounded-xl font-bold text-slate-700 hover:bg-slate-100"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={submittingWithdrawalAction}
                  className="px-5 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-xl font-bold flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                >
                  {submittingWithdrawalAction ? <Loader2 size={15} className="animate-spin" /> : <X size={15} />}
                  <span>Tolak &amp; Kembalikan Gold</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── MODAL TAMBAH/EDIT PAKET ── */}
      {packageModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto">
          <div className="bg-white rounded-3xl p-5 sm:p-6 w-full max-w-md shadow-2xl border border-slate-200 space-y-4 max-h-[90vh] overflow-y-auto my-auto">
            <div className="flex items-center justify-between border-b pb-3">
              <h4 className="font-extrabold text-slate-900 text-sm">
                {editingPackage ? "Edit Paket Koin" : "Tambah Paket Koin Baru"}
              </h4>
              <button onClick={() => setPackageModalOpen(false)} className="text-slate-400 hover:text-slate-600"><X size={18} /></button>
            </div>
            <form onSubmit={handleSavePackage} className="space-y-3 text-xs">
              <div>
                <label className="font-bold text-slate-700 block mb-1">Nama Paket</label>
                <input
                  type="text"
                  required
                  value={packageFormData.name}
                  onChange={(e) => setPackageFormData({ ...packageFormData, name: e.target.value })}
                  placeholder="Misal: Gold Pack 1.000"
                  className="w-full h-9 px-3 border border-slate-300 rounded-xl"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Jumlah Koin</label>
                  <input
                    type="number"
                    required
                    min={1}
                    value={packageFormData.coin_amount}
                    onChange={(e) => setPackageFormData({ ...packageFormData, coin_amount: parseInt(e.target.value) || 0 })}
                    className="w-full h-9 px-3 border border-slate-300 rounded-xl"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Bonus Koin</label>
                  <input
                    type="number"
                    min={0}
                    value={packageFormData.bonus_coin}
                    onChange={(e) => setPackageFormData({ ...packageFormData, bonus_coin: parseInt(e.target.value) || 0 })}
                    className="w-full h-9 px-3 border border-slate-300 rounded-xl"
                  />
                </div>
              </div>
              <div>
                <label className="font-bold text-slate-700 block mb-1">Harga Rupiah (IDR)</label>
                <input
                  type="number"
                  required
                  min={1000}
                  value={packageFormData.price_idr}
                  onChange={(e) => setPackageFormData({ ...packageFormData, price_idr: parseInt(e.target.value) || 0 })}
                  className="w-full h-9 px-3 border border-slate-300 rounded-xl"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Badge Label Promo</label>
                  <input
                    type="text"
                    value={packageFormData.badge_label}
                    onChange={(e) => setPackageFormData({ ...packageFormData, badge_label: e.target.value })}
                    placeholder="POPULER / BEST VALUE"
                    className="w-full h-9 px-3 border border-slate-300 rounded-xl"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Urutan Tampil</label>
                  <input
                    type="number"
                    value={packageFormData.sort_order}
                    onChange={(e) => setPackageFormData({ ...packageFormData, sort_order: parseInt(e.target.value) || 1 })}
                    className="w-full h-9 px-3 border border-slate-300 rounded-xl"
                  />
                </div>
              </div>
              <div className="flex items-center gap-4 pt-2">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={packageFormData.is_popular}
                    onChange={(e) => setPackageFormData({ ...packageFormData, is_popular: e.target.checked })}
                  />
                  <span className="font-semibold text-slate-700">Tandai Populer</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={packageFormData.is_active}
                    onChange={(e) => setPackageFormData({ ...packageFormData, is_active: e.target.checked })}
                  />
                  <span className="font-semibold text-slate-700">Aktif</span>
                </label>
              </div>
              <div className="pt-3 border-t flex justify-end gap-2">
                <button type="button" onClick={() => setPackageModalOpen(false)} className="px-4 py-2 border rounded-xl font-bold">Batal</button>
                <button type="submit" className="px-5 py-2 bg-[#059669] text-white rounded-xl font-bold">Simpan</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── MODAL TAMBAH/EDIT LAYANAN ── */}
      {serviceModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto">
          <div className="bg-white rounded-3xl p-5 sm:p-6 w-full max-w-md shadow-2xl border border-slate-200 space-y-4 max-h-[90vh] overflow-y-auto my-auto">
            <div className="flex items-center justify-between border-b pb-3">
              <h4 className="font-extrabold text-slate-900 text-sm">
                {editingService ? "Edit Tarif Layanan Koin" : "Tambah Tarif Layanan Baru"}
              </h4>
              <button onClick={() => setServiceModalOpen(false)} className="text-slate-400 hover:text-slate-600"><X size={18} /></button>
            </div>
            <form onSubmit={handleSaveService} className="space-y-3 text-xs">
              <div>
                <label className="font-bold text-slate-700 block mb-1">Kode Layanan (Unique)</label>
                <input
                  type="text"
                  required
                  disabled={Boolean(editingService)}
                  value={serviceFormData.code}
                  onChange={(e) => setServiceFormData({ ...serviceFormData, code: e.target.value })}
                  placeholder="Misal: business_premium_30"
                  className="w-full h-9 px-3 border border-slate-300 rounded-xl font-mono disabled:bg-slate-100"
                />
              </div>
              <div>
                <label className="font-bold text-slate-700 block mb-1">Nama Layanan</label>
                <input
                  type="text"
                  required
                  value={serviceFormData.name}
                  onChange={(e) => setServiceFormData({ ...serviceFormData, name: e.target.value })}
                  placeholder="Misal: Bisnis Premium 30 Hari"
                  className="w-full h-9 px-3 border border-slate-300 rounded-xl"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Tarif Koin</label>
                  <input
                    type="number"
                    required
                    min={1}
                    value={serviceFormData.coin_price}
                    onChange={(e) => setServiceFormData({ ...serviceFormData, coin_price: parseInt(e.target.value) || 0 })}
                    className="w-full h-9 px-3 border border-slate-300 rounded-xl"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Durasi (Hari)</label>
                  <input
                    type="number"
                    value={serviceFormData.duration_days}
                    onChange={(e) => setServiceFormData({ ...serviceFormData, duration_days: e.target.value ? parseInt(e.target.value) : "" })}
                    placeholder="Kosongkan jika permanen"
                    className="w-full h-9 px-3 border border-slate-300 rounded-xl"
                  />
                </div>
              </div>
              <div>
                <label className="font-bold text-slate-700 block mb-1">Deskripsi</label>
                <textarea
                  rows={2}
                  value={serviceFormData.description}
                  onChange={(e) => setServiceFormData({ ...serviceFormData, description: e.target.value })}
                  className="w-full p-2.5 border border-slate-300 rounded-xl"
                />
              </div>
              <div className="flex items-center gap-4 pt-1">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={serviceFormData.is_active}
                    onChange={(e) => setServiceFormData({ ...serviceFormData, is_active: e.target.checked })}
                  />
                  <span className="font-semibold text-slate-700">Status Aktif</span>
                </label>
              </div>
              <div className="pt-3 border-t flex justify-end gap-2">
                <button type="button" onClick={() => setServiceModalOpen(false)} className="px-4 py-2 border rounded-xl font-bold">Batal</button>
                <button type="submit" className="px-5 py-2 bg-[#059669] text-white rounded-xl font-bold">Simpan</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── MODAL PENYESUAIAN SALDO USER (AUDIT TRAIL) ── */}
      {adjustModalOpen && selectedUserWallet && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto">
          <div className="bg-white rounded-3xl p-5 sm:p-6 w-full max-w-md shadow-2xl border border-amber-200 space-y-4 max-h-[90vh] overflow-y-auto my-auto">
            <div className="flex items-center justify-between border-b pb-3">
              <div className="flex items-center gap-2">
                <SuradeCoinIcon size={20} />
                <h4 className="font-extrabold text-slate-900 text-sm">Penyesuaian Saldo Koin Pengguna</h4>
              </div>
              <button onClick={() => setAdjustModalOpen(false)} className="text-slate-400 hover:text-slate-600"><X size={18} /></button>
            </div>

            <div className="p-3.5 rounded-2xl bg-amber-50 border border-amber-200/80 space-y-1 text-xs">
              <div className="text-slate-500 font-medium">Pengguna:</div>
              <div className="font-bold text-slate-900">{selectedUserWallet.user?.name} ({selectedUserWallet.user?.email})</div>
              <div className="text-slate-600 pt-1">Saldo Saat Ini: <strong className="text-amber-700">{Number(selectedUserWallet.balance).toLocaleString("id-ID")} Coin</strong></div>
            </div>

            <form onSubmit={handleSaveAdjustWallet} className="space-y-3 text-xs">
              <div>
                <label className="font-bold text-slate-700 block mb-1">Aksi Penyesuaian</label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setAdjustFormData({ ...adjustFormData, action: "add" })}
                    className={`py-2 rounded-xl font-bold border flex items-center justify-center gap-1.5 ${
                      adjustFormData.action === "add" ? "bg-emerald-600 text-white border-emerald-600" : "bg-slate-50 text-slate-700 border-slate-200"
                    }`}
                  >
                    <Plus size={15} /> + Tambah Koin
                  </button>
                  <button
                    type="button"
                    onClick={() => setAdjustFormData({ ...adjustFormData, action: "deduct" })}
                    className={`py-2 rounded-xl font-bold border flex items-center justify-center gap-1.5 ${
                      adjustFormData.action === "deduct" ? "bg-rose-600 text-white border-rose-600" : "bg-slate-50 text-slate-700 border-slate-200"
                    }`}
                  >
                    - Kurangi Koin
                  </button>
                </div>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Nominal Koin</label>
                <input
                  type="number"
                  required
                  min={1}
                  value={adjustFormData.amount}
                  onChange={(e) => setAdjustFormData({ ...adjustFormData, amount: parseInt(e.target.value) || 0 })}
                  className="w-full h-9 px-3 border border-slate-300 rounded-xl font-bold"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">
                  Alasan Penyesuaian <span className="text-rose-500">* (Wajib untuk Audit)</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="Misal: Bonus event komunitas / Koreksi keluhan transaksi"
                  value={adjustFormData.reason}
                  onChange={(e) => setAdjustFormData({ ...adjustFormData, reason: e.target.value })}
                  className="w-full h-9 px-3 border border-slate-300 rounded-xl"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Catatan Tambahan (Opsional)</label>
                <textarea
                  rows={2}
                  placeholder="Catatan internal admin..."
                  value={adjustFormData.notes}
                  onChange={(e) => setAdjustFormData({ ...adjustFormData, notes: e.target.value })}
                  className="w-full p-2 border border-slate-300 rounded-xl"
                />
              </div>

              <div className="pt-3 border-t flex justify-end gap-2">
                <button type="button" onClick={() => setAdjustModalOpen(false)} className="px-4 py-2 border rounded-xl font-bold">Batal</button>
                <button
                  type="submit"
                  disabled={submittingAdjust}
                  className="px-5 py-2 bg-[#059669] hover:bg-[#005f5b] text-white rounded-xl font-bold flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                >
                  {submittingAdjust ? <Loader2 size={15} className="animate-spin" /> : <Save size={15} />}
                  <span>Eksekusi Penyesuaian</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── MODAL TOLAK BUKTI PEMBAYARAN POIN ── */}
      {rejectModalOpen && selectedRejectPurchase && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 animate-fade-in overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-lg w-full p-5 sm:p-6 shadow-2xl border border-rose-200 space-y-4 max-h-[90vh] overflow-y-auto my-auto relative">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2 text-rose-600">
                <XCircle size={22} />
                <h3 className="font-extrabold text-base text-slate-900">Tolak Bukti Pembayaran Poin</h3>
              </div>
              <button
                type="button"
                onClick={() => setRejectModalOpen(false)}
                className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 flex items-center justify-center cursor-pointer transition-colors"
                title="Tutup"
              >
                <X size={16} />
              </button>
            </div>

            {/* Order Details Brief */}
            <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200 text-xs space-y-1.5">
              <div className="flex items-center justify-between">
                <span className="text-slate-500">Nomor Pesanan:</span>
                <span className="font-mono font-bold text-slate-900">#{selectedRejectPurchase.order_number}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-500">Pengguna:</span>
                <span className="font-bold text-slate-900">{selectedRejectPurchase.user?.name} ({selectedRejectPurchase.user?.email})</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-500">Tagihan &amp; Koin:</span>
                <span className="font-black text-[#007570]">
                  Rp {Number(selectedRejectPurchase.price_idr).toLocaleString("id-ID")} • {selectedRejectPurchase.total_coin} Coin
                </span>
              </div>
              {selectedRejectPurchase.proof_image ? (
                <div className="pt-2.5 border-t border-slate-200 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-slate-600 font-bold flex items-center gap-1.5 text-xs">
                      <Receipt size={14} className="text-emerald-600" />
                      <span>Foto Struk / Bukti Transfer:</span>
                    </span>
                    <div className="flex items-center gap-1.5">
                      <button
                        type="button"
                        onClick={() => setPreviewProofImage(getFullImageUrl(selectedRejectPurchase.proof_image))}
                        className="px-2 py-1 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-700 font-bold text-[11px] flex items-center gap-1 border border-emerald-200 cursor-pointer transition-colors"
                        title="Perbesar foto struk"
                      >
                        <Eye size={12} />
                        <span>Perbesar</span>
                      </button>
                      <a
                        href={getFullImageUrl(selectedRejectPurchase.proof_image)}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="px-2 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-[11px] flex items-center gap-1 border border-slate-200 transition-colors"
                        title="Buka gambar di tab baru"
                      >
                        <ExternalLink size={11} />
                        <span>Tab Baru</span>
                      </a>
                    </div>
                  </div>

                  {/* Embedded Interactive Thumbnail */}
                  <div
                    onClick={() => setPreviewProofImage(getFullImageUrl(selectedRejectPurchase.proof_image))}
                    className="group relative rounded-2xl overflow-hidden border border-slate-200 bg-slate-900/5 hover:border-emerald-500 cursor-pointer max-h-36 flex items-center justify-center p-1.5 transition-all shadow-inner"
                    title="Klik untuk memperbesar struk di layar penuh"
                  >
                    <img
                      src={getFullImageUrl(selectedRejectPurchase.proof_image)}
                      alt="Struk Pembayaran"
                      className="max-h-32 object-contain rounded-xl group-hover:scale-[1.02] transition-transform"
                      onError={(e) => {
                        e.currentTarget.onerror = null;
                        e.currentTarget.src = "https://placehold.co/600x400/007570/ffffff?text=Bukti+Transfer";
                      }}
                    />
                    <div className="absolute inset-0 bg-slate-900/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white text-xs font-bold gap-1.5 backdrop-blur-[1px] rounded-xl">
                      <Eye size={16} /> Klik untuk Perbesar Struk
                    </div>
                  </div>
                </div>
              ) : (
                <div className="pt-2 border-t border-slate-200 text-slate-400 italic text-[11px]">
                  Pengguna belum mengunggah foto bukti pembayaran.
                </div>
              )}
            </div>

            <form onSubmit={handleConfirmReject} className="space-y-3 text-xs">
              <div>
                <label className="font-bold text-slate-700 block mb-1.5">
                  Pilih Alasan Cepat (Klik untuk memilih):
                </label>
                <div className="flex flex-wrap gap-1.5">
                  {[
                    "Bukti transfer buram / terpotong",
                    "Nominal transfer tidak sesuai tagihan",
                    "Dana belum masuk rekening mutasi resmi",
                    "Nama pengirim / bukti transfer tidak valid",
                  ].map((preset, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => setRejectReason(preset)}
                      className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-rose-50 hover:text-rose-700 border border-slate-200 text-[11px] font-semibold text-slate-700 cursor-pointer transition-colors text-left"
                    >
                      {preset}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">
                  Detail Alasan Penolakan <span className="text-rose-500">* (Wajib &amp; Terbaca oleh Pengguna)</span>
                </label>
                <textarea
                  rows={3}
                  required
                  placeholder="Jelaskan kendala bukti pembayaran agar pengguna dapat memperbaikinya..."
                  value={rejectReason}
                  onChange={(e) => setRejectReason(e.target.value)}
                  className="w-full p-2.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500 text-xs"
                />
              </div>

              <div className="p-2.5 rounded-xl bg-amber-50 border border-amber-200 text-amber-800 text-[11px] leading-relaxed flex items-start gap-2">
                <AlertCircle size={15} className="text-amber-600 shrink-0 mt-0.5" />
                <span>
                  Pengguna akan menerima notifikasi penolakan beserta alasan ini, dan diberikan tombol untuk mengunggah ulang bukti pembayaran yang benar tanpa harus memesan ulang.
                </span>
              </div>

              <div className="pt-3 border-t border-slate-100 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setRejectModalOpen(false)}
                  className="px-4 py-2 border border-slate-300 rounded-xl font-bold text-slate-600 hover:bg-slate-50 cursor-pointer transition-colors"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={submittingReject}
                  className="px-5 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-xl font-bold flex items-center gap-1.5 cursor-pointer disabled:opacity-50 shadow-sm transition-colors"
                >
                  {submittingReject ? <Loader2 size={15} className="animate-spin" /> : <XCircle size={15} />}
                  <span>Tolak Permohonan</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── MODAL PREVIEW BUKTI TRANSFER (SELALU DI PALING DEPAN z-[9999]) ── */}
      {previewProofImage && (
        <div
          className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md animate-fade-in"
          onClick={() => setPreviewProofImage(null)}
        >
          <div
            className="bg-white rounded-3xl p-5 max-w-2xl w-full shadow-2xl relative border border-slate-200 space-y-3"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center">
                  <Receipt size={17} />
                </div>
                <div>
                  <h4 className="font-extrabold text-sm text-slate-900">Foto Bukti Transfer Pembelian Koin</h4>
                  <p className="text-[10.5px] text-slate-400">Pastikan nominal, tanggal, dan nama pengirim sesuai mutasi bank</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setPreviewProofImage(null)}
                className="w-8 h-8 rounded-full hover:bg-slate-100 text-slate-500 hover:text-slate-800 flex items-center justify-center cursor-pointer transition-colors"
                title="Tutup (ESC / Klik luar)"
              >
                <X size={18} />
              </button>
            </div>

            <div className="max-h-[68vh] overflow-auto flex items-center justify-center bg-slate-900/5 rounded-2xl p-2 min-h-[260px] border border-slate-200">
              <img
                src={getFullImageUrl(previewProofImage)}
                alt="Bukti Transfer Pembelian Poin"
                className="max-h-[62vh] w-auto object-contain rounded-xl shadow-lg border border-slate-200"
                onError={(e) => {
                  e.currentTarget.onerror = null;
                  e.currentTarget.src = "https://placehold.co/600x400/007570/ffffff?text=Bukti+Transfer+Tersimpan";
                }}
              />
            </div>

            <div className="flex items-center justify-between pt-2 border-t border-slate-100">
              <span className="text-[11px] text-slate-400">Klik di luar popup untuk menutup</span>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setPreviewProofImage(null)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold cursor-pointer transition-colors"
                >
                  Tutup
                </button>
                <a
                  href={getFullImageUrl(previewProofImage)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold inline-flex items-center gap-1.5 shadow-xs cursor-pointer transition-colors"
                >
                  <ExternalLink size={13} />
                  <span>Buka Tab Baru ↗</span>
                </a>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
