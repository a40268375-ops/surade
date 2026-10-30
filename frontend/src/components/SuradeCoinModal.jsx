import React, { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import axios from "axios";
import toast from "react-hot-toast";
import {
  X,
  Sparkles,
  AlertCircle,
  ArrowUpRight,
  ArrowDownLeft,
  ChevronRight,
  ChevronLeft,
  Info,
  ShieldCheck,
  Zap,
  Loader2,
  Search,
  Upload,
  Check,
  Copy,
  Star,
  Download,
  ZoomIn,
  Maximize2,
  Tag,
  Trash2
} from "lucide-react";
import SuradeCoinIcon from "./SuradeCoinIcon";
import { getPaymentLogo, DEFAULT_OFFICIAL_METHODS } from "./PaymentMethodSelector";

const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:8000/api";

/**
 * 1. MODAL BELI Surade Poin (PREMIUM GOLD & EMERALD - SESUAI GAMBAR 1 & 2)
 */
export function BuyCoinModal({ isOpen, onClose, onSuccess, currentBalance = 0, initialCoinType = "gold" }) {
  const [packages, setPackages] = useState([]);
  const [loadingPackages, setLoadingPackages] = useState(true);
  const [coinType] = useState("gold"); // Silver tidak bisa di-topup, hanya dari reward harian & pendaftaran
  const [selectedPackage, setSelectedPackage] = useState(null);
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState("QRIS");
  const [senderName, setSenderName] = useState("");
  const [senderBank, setSenderBank] = useState("");
  const [proofFile, setProofFile] = useState(null);
  const [proofPreview, setProofPreview] = useState(null);
  const [processingOrder, setProcessingOrder] = useState(false);
  const [activeStep, setActiveStep] = useState(1); // 1: Pilih Paket Poin, 2: Metode Bayar & Upload Bukti
  const [officialMethods, setOfficialMethods] = useState([]);
  const [qrisImage, setQrisImage] = useState(null);
  const [copiedAccount, setCopiedAccount] = useState(false);
  const [isQrisZoomed, setIsQrisZoomed] = useState(false);

  // Kupon & Referral state
  const [couponInput, setCouponInput] = useState("");
  const [appliedCouponCode, setAppliedCouponCode] = useState("");
  const [couponDiscount, setCouponDiscount] = useState(0);
  const [couponApplied, setCouponApplied] = useState(false);
  const [validatingCoupon, setValidatingCoupon] = useState(false);

  const [referralInput, setReferralInput] = useState("");
  const [appliedReferralCode, setAppliedReferralCode] = useState("");
  const [referralDiscount, setReferralDiscount] = useState(0);
  const [referralApplied, setReferralApplied] = useState(false);
  const [validatingReferral, setValidatingReferral] = useState(false);

  const packagePrice = selectedPackage?.price_idr || 0;
  const totalDiscount = Math.min(packagePrice, (couponDiscount || 0) + (referralDiscount || 0));
  const finalPrice = Math.max(0, packagePrice - totalDiscount);

  const handleDownloadQris = (e) => {
    if (e) e.stopPropagation();
    const url = qrisImage || "/logos/qris.png";
    const link = document.createElement("a");
    link.href = url;
    link.download = "QRIS-Surade-Official.png";
    link.target = "_blank";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success("Gambar QRIS berhasil diunduh. Anda bisa scan dari galeri!");
  };

  const fetchPackages = async () => {
    setLoadingPackages(true);
    try {
      const res = await axios.get(`${API_BASE}/coins/packages`, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });
      if (res.data?.success && Array.isArray(res.data.packages)) {
        // HANYA PAKET GOLD YANG BISA DITOPUP
        const goldOnly = res.data.packages.filter((p) => (p.coin_type || "gold") === "gold");
        setPackages(goldOnly.length > 0 ? goldOnly : res.data.packages);
        const defaultPkg = goldOnly.find((p) => p.is_popular || p.badge_label?.includes("POPULER") || p.coin_amount === 50) || goldOnly[0] || res.data.packages[0];
        setSelectedPackage(defaultPkg);
      }
    } catch (err) {
      console.error("Error fetching coin packages:", err);
      const fallbackPkgs = [
        { id: 101, name: "10 Poin Gold", coin_amount: 10, bonus_coin: 0, price_idr: 11000, coin_type: "gold", badge_label: "STARTER" },
        { id: 102, name: "25 Poin Gold", coin_amount: 25, bonus_coin: 0, price_idr: 27000, coin_type: "gold", badge_label: "HEMAT" },
        { id: 103, name: "50 Poin Gold", coin_amount: 50, bonus_coin: 0, price_idr: 53000, coin_type: "gold", is_popular: true, badge_label: "POPULER" },
        { id: 104, name: "100 Poin Gold", coin_amount: 100, bonus_coin: 0, price_idr: 104000, coin_type: "gold", badge_label: "BEST VALUE" },
        { id: 105, name: "250 Poin Gold", coin_amount: 250, bonus_coin: 0, price_idr: 255000, coin_type: "gold", badge_label: "BISNIS" },
        { id: 106, name: "425 Poin Gold", coin_amount: 425, bonus_coin: 0, price_idr: 430000, coin_type: "gold", badge_label: "SUPER VALUE" },
      ];
      setPackages(fallbackPkgs);
      setSelectedPackage(fallbackPkgs[0]);
    } finally {
      setLoadingPackages(false);
    }
  };

  const fetchPaymentMethods = async () => {
    try {
      const res = await axios.get(`${API_BASE}/payment-methods`);
      const data = res.data?.data?.methods;
      const fetchedQris = res.data?.data?.qris_image;
      if (Array.isArray(data) && data.length > 0) {
        setOfficialMethods(data);
      } else {
        setOfficialMethods(DEFAULT_OFFICIAL_METHODS);
      }
      if (fetchedQris) {
        setQrisImage(fetchedQris);
      }
    } catch {
      setOfficialMethods(DEFAULT_OFFICIAL_METHODS);
    }
  };

  /* eslint-disable react-hooks/set-state-in-effect */
  useEffect(() => {
    if (isOpen) {
      fetchPackages();
      fetchPaymentMethods();
      setActiveStep(1);
      setProofFile(null);
      setProofPreview(null);
      setCouponInput("");
      setAppliedCouponCode("");
      setCouponDiscount(0);
      setCouponApplied(false);
      setReferralInput("");
      setAppliedReferralCode("");
      setReferralDiscount(0);
      setReferralApplied(false);
    }
  }, [isOpen]);
  /* eslint-enable react-hooks/set-state-in-effect */

  // Normalizer: support both flat array of payment methods and nested category objects
  const flattenedPaymentItems = React.useMemo(() => {
    const list = [];
    const fallbackList = [
      { id: "QRIS", name: "QRIS (Semua Bank & E-Wallet)", accountNumber: "Scan Barcode QRIS", accountName: "Triwala Mitra Bestari", isQRIS: true, isHot: true },
      { id: "BCA", name: "Bank BCA", accountNumber: "0954152045", accountName: "Triwala Mitra Bestari", isHot: true },
      { id: "Mandiri", name: "Bank Mandiri", accountNumber: "133-0011-409-331", accountName: "Triwala Mitra Bestari" },
      { id: "BNI", name: "Bank BNI", accountNumber: "0973607008", accountName: "Triwala Mitra Bestari" },
      { id: "BJB", name: "Bank BJB", accountNumber: "0119213282001", accountName: "Triwala Mitra Bestari" },
      { id: "DANA", name: "DANA", accountNumber: "0811-1919-711", accountName: "Triwala Mitra Bestari", isHot: true },
      { id: "GoPay", name: "GoPay", accountNumber: "0811-1919-711", accountName: "Triwala Mitra Bestari" },
      { id: "OVO", name: "OVO", accountNumber: "0811-1919-711", accountName: "Triwala Mitra Bestari" },
    ];

    const source = officialMethods && officialMethods.length > 0 ? officialMethods : fallbackList;

    source.forEach((itemOrCat) => {
      if (itemOrCat && Array.isArray(itemOrCat.items)) {
        itemOrCat.items.forEach((sub) => {
          if (sub && sub.isActive !== false && sub.id !== "Midtrans") {
            const isHot = sub.id === "QRIS" || sub.id === "BCA" || sub.id === "DANA" || sub.name?.toLowerCase().includes("qris");
            list.push({ ...sub, isHot: sub.isHot ?? isHot });
          }
        });
      } else if (itemOrCat && typeof itemOrCat === "object") {
        if (itemOrCat.isActive !== false && itemOrCat.id !== "Midtrans") {
          const isHot = itemOrCat.id === "QRIS" || itemOrCat.id === "BCA" || itemOrCat.id === "DANA" || itemOrCat.name?.toLowerCase().includes("qris");
          list.push({ ...itemOrCat, isHot: itemOrCat.isHot ?? isHot });
        }
      }
    });

    const finalResult = list.length > 0 ? list : fallbackList;

    return finalResult.sort((a, b) => {
      if (a.id === "QRIS") return -1;
      if (b.id === "QRIS") return 1;
      if (a.isHot && !b.isHot) return -1;
      if (!a.isHot && b.isHot) return 1;
      return 0;
    });
  }, [officialMethods]);

  const activePaymentDetail = React.useMemo(() => {
    for (const item of flattenedPaymentItems) {
      if (item.id === selectedPaymentMethod || item.name === selectedPaymentMethod) {
        return item;
      }
    }
    return flattenedPaymentItems[0] || null;
  }, [flattenedPaymentItems, selectedPaymentMethod]);

  const copyToClipboard = (text) => {
    if (!text) return;
    navigator.clipboard.writeText(text);
    setCopiedAccount(true);
    toast.success("Nomor rekening / e-wallet berhasil disalin!");
    setTimeout(() => setCopiedAccount(false), 2000);
  };

  const handleApplyCoupon = async () => {
    const code = couponInput.trim().toUpperCase();
    if (!code) {
      toast.error("Masukkan kode kupon promo terlebih dahulu.");
      return;
    }
    setValidatingCoupon(true);
    try {
      const token = localStorage.getItem("token");
      const res = await axios.post(
        `${API_BASE}/coupons/validate`,
        {
          code,
          amount: packagePrice,
          context: "all",
          product_type: "all",
        },
        { headers: token ? { Authorization: `Bearer ${token}` } : {} }
      );

      if (res.data?.valid || res.data?.is_valid) {
        const disc = Number(res.data.discount || res.data.discount_amount || 0);
        setCouponDiscount(disc);
        setAppliedCouponCode(code);
        setCouponApplied(true);
        toast.success(res.data.message || `Kupon aktif! Potongan Rp ${disc.toLocaleString("id-ID")}`);
      } else {
        toast.error(res.data?.message || "Kode kupon tidak valid atau sudah kadaluarsa.");
      }
    } catch (err) {
      toast.error(err.response?.data?.message || "Gagal memvalidasi kode kupon promo.");
    } finally {
      setValidatingCoupon(false);
    }
  };

  const handleRemoveCoupon = () => {
    setCouponInput("");
    setAppliedCouponCode("");
    setCouponDiscount(0);
    setCouponApplied(false);
    toast.success("Kupon dibatalkan.");
  };

  const handleApplyReferral = async () => {
    const code = referralInput.trim().toUpperCase();
    if (!code) {
      toast.error("Masukkan kode referral terlebih dahulu.");
      return;
    }
    setValidatingReferral(true);
    try {
      const token = localStorage.getItem("token");
      const res = await axios.post(
        `${API_BASE}/referrals/validate`,
        { code },
        { headers: token ? { Authorization: `Bearer ${token}` } : {} }
      );

      if (res.data?.valid) {
        const disc = Number(res.data.discount || res.data.discount_amount || 5000);
        setReferralDiscount(disc);
        setAppliedReferralCode(code);
        setReferralApplied(true);
        toast.success(res.data.message || `Kode referral aktif! Diskon Rp ${disc.toLocaleString("id-ID")}`);
      } else {
        toast.error(res.data?.message || "Kode referral tidak valid.");
      }
    } catch (err) {
      toast.error(err.response?.data?.message || "Gagal memvalidasi kode referral.");
    } finally {
      setValidatingReferral(false);
    }
  };

  const handleRemoveReferral = () => {
    setReferralInput("");
    setAppliedReferralCode("");
    setReferralDiscount(0);
    setReferralApplied(false);
    toast.success("Kode referral dibatalkan.");
  };

  const handleSubmitPurchase = async () => {
    if (!selectedPackage) {
      toast.error("Pilih salah satu paket nominal poin.");
      return;
    }

    // MANDATORY PROOF VALIDATION (Syarat Wajib Upload Bukti)
    if (!proofFile) {
      toast.error("Wajib mengunggah foto bukti transfer atau struk pembayaran untuk melanjutkan!", {
        duration: 4000,
        icon: "⚠️",
      });
      return;
    }

    setProcessingOrder(true);
    try {
      const token = localStorage.getItem("token");
      const formData = new FormData();
      formData.append("package_id", selectedPackage.id);
      formData.append("coin_type", coinType || "silver");
      formData.append("payment_method", selectedPaymentMethod || "QRIS");
      if (senderName) formData.append("sender_account_name", senderName);
      if (senderBank) formData.append("sender_bank_name", senderBank);
      formData.append("proof_image", proofFile);
      if (appliedCouponCode) formData.append("coupon_code", appliedCouponCode);
      if (appliedReferralCode) formData.append("referral_code", appliedReferralCode);

      const res = await axios.post(`${API_BASE}/coins/purchase`, formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "multipart/form-data",
        },
      });

      if (!res.data?.success) {
        throw new Error(res.data?.message || "Gagal membuat pesanan poin.");
      }

      toast.success("Bukti pembayaran berhasil dikirim! Poin akan segera diaktifkan setelah verifikasi.", { duration: 5000 });
      if (onSuccess) onSuccess();
      onClose();
    } catch (err) {
      console.error("Purchase error:", err);
      toast.error(err.response?.data?.message || err.message || "Gagal memproses pembelian poin.");
    } finally {
      setProcessingOrder(false);
    }
  };

  if (!isOpen) return null;

  const modalNode = (
    <>
      <div className="fixed inset-0 z-[99999] flex items-center justify-center p-3 sm:p-4 bg-slate-950/80 backdrop-blur-xs animate-fade-in font-['Poppins',sans-serif]">
        <div className="bg-[#fcfdfd] w-full max-w-2xl sm:max-w-3xl rounded-3xl shadow-2xl border border-amber-200/80 overflow-hidden flex flex-col max-h-[92vh] relative">
        
        {/* TOP BRAND HEADER - COMPACT & TIDY */}
        <div className="relative bg-gradient-to-r from-[#d97706] via-[#b45309] to-[#007570] text-white p-3.5 sm:p-4 px-4 sm:px-6 shadow-md">
          <button
            onClick={onClose}
            className="absolute top-3.5 right-3.5 w-8 h-8 rounded-full bg-black/25 hover:bg-black/40 text-white flex items-center justify-center transition-colors cursor-pointer border border-white/20 z-10"
            title="Tutup"
          >
            <X size={16} />
          </button>

          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 pr-9">
            <div className="flex items-center gap-2.5">
              <div className="w-10 h-10 rounded-xl bg-white/15 backdrop-blur-md flex items-center justify-center border border-white/30 shadow-inner shrink-0">
                <SuradeCoinIcon size={26} type="gold" />
              </div>
              <div>
                <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-white/20 text-[10px] font-bold text-amber-100 mb-0.5 border border-white/20">
                  <Sparkles size={11} className="text-amber-300" />
                  <span>Beli Poin Resmi Surade</span>
                </div>
                <h3 className="text-lg sm:text-xl font-black tracking-tight text-white leading-tight">
                  Beli Poin Gold
                </h3>
              </div>
            </div>

            {/* Current Balance Pill */}
            <div className="px-3 py-1.5 rounded-xl bg-black/25 backdrop-blur-md border border-white/20 flex items-center gap-2 self-start sm:self-auto shadow-inner text-xs">
              <span className="text-[11px] text-amber-100 font-medium">Saldo Gold:</span>
              <div className="flex items-center gap-1.5 font-black text-amber-300 text-xs sm:text-sm">
                <SuradeCoinIcon size={16} type="gold" />
                <span>{Number(currentBalance).toLocaleString("id-ID")} Gold</span>
              </div>
            </div>
          </div>
        </div>

        {/* SCROLLABLE CONTENT BODY */}
        <div className="p-3.5 sm:p-5 overflow-y-auto flex-1 space-y-4">

          {/* ========================================================================= */}
          {/* STEP 1: PILIH PAKET POIN (RICH 3D CARDS - COMPACT & ZERO SCROLLING NEEDED) */}
          {/* ========================================================================= */}
          {activeStep === 1 ? (
            <div className="space-y-3">
              
              {/* Header Step 1 */}
              <div className="flex items-center justify-between pb-1.5 border-b border-slate-100">
                <div className="flex items-center gap-2">
                  <span className="w-5 h-5 rounded-full bg-[#f59e0b] text-white flex items-center justify-center text-[11px] font-black shadow-xs">
                    1
                  </span>
                  <h4 className="text-xs sm:text-sm font-black text-slate-900 tracking-tight uppercase">
                    PILIH PAKET POIN GOLD
                  </h4>
                </div>
                <span className="text-[10.5px] text-emerald-700 font-bold bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full flex items-center gap-1">
                  <ShieldCheck size={12} /> Pembayaran Resmi &amp; Terverifikasi
                </span>
              </div>

              {/* Banner Poin Gold (Silver tidak bisa di-top up, hanya dari reward harian) */}
              <div className="p-2.5 px-3.5 rounded-2xl bg-gradient-to-r from-amber-500/15 via-yellow-500/10 to-amber-500/5 border border-amber-300/80 flex items-center justify-between text-xs font-bold text-slate-900">
                <div className="flex items-center gap-2">
                  <SuradeCoinIcon size={20} type="gold" />
                  <div>
                    <span className="block font-black text-amber-950 text-xs">Poin Gold Resmi Surade</span>
                    <span className="text-[10px] font-medium text-slate-600">Dapat ditarik tunai ke rekening bank/e-wallet &amp; untuk transaksi fitur</span>
                  </div>
                </div>
                <span className="text-[10px] font-black text-amber-900 bg-amber-400/30 px-2 py-0.5 rounded-md border border-amber-400/50 shrink-0">
                  Bisa Ditarik Uang
                </span>
              </div>

              {loadingPackages ? (
                <div className="flex flex-col items-center justify-center py-12 gap-2 text-slate-400">
                  <Loader2 className="animate-spin text-amber-500" size={30} />
                  <p className="text-xs font-semibold">Memuat paket poin resmi...</p>
                </div>
              ) : (
                <div className="space-y-3">
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 sm:gap-3.5 pt-1">
                    {(() => {
                      const filteredPkgs = packages.filter((p) => (p.coin_type || "gold") === "gold");
                      const listToRender = filteredPkgs.length > 0 ? filteredPkgs : packages;
                      return listToRender.map((pkg) => {
                        const isSelected = selectedPackage?.id === pkg.id;
                        const totalCoin = (pkg.coin_amount || 0) + (pkg.bonus_coin || 0);

                        // Badge colors & perks
                        let badgeBg = coinType === "gold" ? "bg-gradient-to-r from-amber-600 to-yellow-600" : "bg-gradient-to-r from-slate-600 to-teal-700";
                        let perkText = coinType === "gold" ? "Dapat Dicairkan" : "Akses Layanan";
                        if (totalCoin <= 10) {
                          badgeBg = coinType === "gold" ? "bg-gradient-to-r from-amber-500 to-yellow-500" : "bg-gradient-to-r from-orange-500 to-amber-500";
                          perkText = "Akses Kilat";
                        } else if (totalCoin <= 25) {
                        badgeBg = "bg-gradient-to-r from-orange-600 to-orange-500";
                        perkText = "Paling Hemat";
                      } else if (totalCoin <= 50) {
                        badgeBg = "bg-gradient-to-r from-amber-500 to-amber-600";
                        perkText = "Favorit Warga";
                      } else if (totalCoin <= 100) {
                        badgeBg = "bg-gradient-to-r from-emerald-600 to-teal-600";
                        perkText = "Best Value";
                      } else if (totalCoin <= 250) {
                        badgeBg = "bg-gradient-to-r from-purple-600 to-indigo-600";
                        perkText = "Paket Bisnis";
                      } else {
                        badgeBg = "bg-gradient-to-r from-rose-600 to-red-600";
                        perkText = "Maksimal Cuan";
                      }

                      return (
                        <div
                          key={pkg.id}
                          onClick={() => setSelectedPackage(pkg)}
                          className={`group relative rounded-2xl p-3 sm:p-3.5 border-2 transition-all cursor-pointer flex flex-col justify-between select-none ${
                            isSelected
                              ? "border-[#f59e0b] bg-gradient-to-b from-[#fffbeb] via-[#fef3c7]/25 to-white shadow-[0_4px_0_#d97706,0_10px_20px_rgba(245,158,11,0.2)] -translate-y-0.5 ring-2 ring-[#f59e0b]/25"
                              : "border-slate-200/90 bg-white hover:border-amber-300 hover:bg-slate-50/70 shadow-[0_3px_0_#e2e8f0,0_5px_12px_rgba(0,0,0,0.03)] hover:-translate-y-0.5 active:translate-y-0 active:shadow-none"
                          }`}
                        >
                          {/* Top-Right 3D Badge */}
                          {pkg.badge_label && (
                            <span className={`absolute -top-2.5 right-2 sm:right-3 ${badgeBg} text-white text-[8.5px] sm:text-[9.5px] font-black px-2.5 py-0.5 rounded-full shadow-[0_2px_0_rgba(0,0,0,0.25)] uppercase tracking-wider`}>
                              {pkg.badge_label}
                            </span>
                          )}

                          {/* Top Row: Nominal + Checkbox (Tanpa Icon Koin) */}
                          <div className="flex items-center justify-between mb-1.5 mt-0.5">
                            <div className="flex items-baseline gap-1">
                              <span className="text-lg sm:text-2xl font-black text-slate-900 tracking-tight leading-none">
                                {Number(totalCoin).toLocaleString("id-ID")}
                              </span>
                              <span className="text-xs sm:text-sm font-black text-amber-600 uppercase">
                                Poin
                              </span>
                            </div>

                            <div
                              className={`w-5 h-5 rounded-full flex items-center justify-center transition-all ${
                                isSelected
                                  ? "bg-[#f59e0b] text-white shadow-[0_1.5px_0_#b45309]"
                                  : "border-2 border-slate-300 bg-slate-50"
                              }`}
                            >
                              {isSelected ? (
                                <Check size={11} strokeWidth={3.5} />
                              ) : (
                                <div className="w-1.5 h-1.5 rounded-full bg-transparent" />
                              )}
                            </div>
                          </div>

                          {/* Bottom Row: Perk text on left + Price on right */}
                          <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
                            <span className="text-[10px] sm:text-[11px] font-bold text-slate-500 truncate">
                              {perkText}
                            </span>
                            <span className="text-xs sm:text-sm font-black text-emerald-700 leading-tight">
                              Rp {Number(pkg.price_idr).toLocaleString("id-ID")}
                            </span>
                          </div>
                        </div>
                      );
                      });
                    })()}
                  </div>

                  {/* ── KODE KUPON & KODE REFERRAL (DISKON SPESIAL) ── */}
                  <div className="p-3 sm:p-3.5 bg-gradient-to-r from-amber-50/70 via-slate-50/60 to-emerald-50/70 rounded-2xl border border-amber-200/80 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-black text-slate-800 flex items-center gap-1.5">
                        <Tag size={14} className="text-amber-600" />
                        <span>Punya Kode Kupon atau Kode Referral?</span>
                      </span>
                      <span className="text-[10.5px] text-emerald-700 font-bold bg-emerald-100/70 px-2 py-0.5 rounded-full">
                        Potongan Langsung
                      </span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                      {/* Input Kode Kupon */}
                      <div className="space-y-1">
                        <div className="flex gap-1.5">
                          <input
                            type="text"
                            placeholder="KODE KUPON (contoh: PROMOUMKM)"
                            value={couponInput}
                            onChange={(e) => setCouponInput(e.target.value.toUpperCase())}
                            disabled={couponApplied}
                            className="w-full h-9 px-3 rounded-xl border border-slate-300 text-xs font-bold uppercase tracking-wider placeholder-normal placeholder-slate-400 focus:border-amber-500 focus:ring-1 focus:ring-amber-500 outline-none disabled:bg-slate-100 disabled:text-slate-500"
                          />
                          {couponApplied ? (
                            <button
                              type="button"
                              onClick={handleRemoveCoupon}
                              className="px-3 h-9 rounded-xl bg-rose-100 hover:bg-rose-200 text-rose-700 font-bold text-xs transition-colors cursor-pointer shrink-0"
                            >
                              Batal
                            </button>
                          ) : (
                            <button
                              type="button"
                              onClick={handleApplyCoupon}
                              disabled={validatingCoupon || !couponInput.trim()}
                              className="px-3.5 h-9 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs shadow-xs active:scale-95 transition-all cursor-pointer disabled:opacity-50 shrink-0"
                            >
                              {validatingCoupon ? <Loader2 size={13} className="animate-spin" /> : "Gunakan"}
                            </button>
                          )}
                        </div>
                        {couponApplied && (
                          <div className="flex items-center justify-between text-[10.5px] font-bold text-emerald-700 px-1">
                            <span>✓ Kupon {appliedCouponCode} aktif</span>
                            <span>-Rp {couponDiscount.toLocaleString("id-ID")}</span>
                          </div>
                        )}
                      </div>

                      {/* Input Kode Referral */}
                      <div className="space-y-1">
                        <div className="flex gap-1.5">
                          <input
                            type="text"
                            placeholder="KODE REFERRAL (contoh: ADM983)"
                            value={referralInput}
                            onChange={(e) => setReferralInput(e.target.value.toUpperCase())}
                            disabled={referralApplied}
                            className="w-full h-9 px-3 rounded-xl border border-slate-300 text-xs font-bold uppercase tracking-wider placeholder-normal placeholder-slate-400 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 outline-none disabled:bg-slate-100 disabled:text-slate-500"
                          />
                          {referralApplied ? (
                            <button
                              type="button"
                              onClick={handleRemoveReferral}
                              className="px-3 h-9 rounded-xl bg-rose-100 hover:bg-rose-200 text-rose-700 font-bold text-xs transition-colors cursor-pointer shrink-0"
                            >
                              Batal
                            </button>
                          ) : (
                            <button
                              type="button"
                              onClick={handleApplyReferral}
                              disabled={validatingReferral || !referralInput.trim()}
                              className="px-3.5 h-9 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-black text-xs shadow-xs active:scale-95 transition-all cursor-pointer disabled:opacity-50 shrink-0"
                            >
                              {validatingReferral ? <Loader2 size={13} className="animate-spin" /> : "Terapkan"}
                            </button>
                          )}
                        </div>
                        {referralApplied && (
                          <div className="flex items-center justify-between text-[10.5px] font-bold text-emerald-700 px-1">
                            <span>✓ Referral {appliedReferralCode} aktif</span>
                            <span>-Rp {referralDiscount.toLocaleString("id-ID")}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          ) : (
            /* ========================================================================= */
            /* STEP 2: METODE PEMBAYARAN RESMI & UPLOAD BUKTI REKENING (DUAL COLUMN) */
            /* ========================================================================= */
            <div className="space-y-4">
              
              {/* Header Step 2 */}
              <div className="flex items-center justify-between pb-1.5 border-b border-slate-100">
                <div className="flex items-center gap-2">
                  <span className="w-5 h-5 rounded-full bg-[#007570] text-white flex items-center justify-center text-[11px] font-black shadow-xs">
                    2
                  </span>
                  <h4 className="text-xs sm:text-sm font-black text-slate-900 tracking-tight uppercase">
                    METODE PEMBAYARAN &amp; TRANSFER
                  </h4>
                </div>

                <button
                  type="button"
                  onClick={() => setActiveStep(1)}
                  className="text-xs font-bold text-amber-700 hover:text-amber-800 flex items-center gap-1 cursor-pointer"
                >
                  <ChevronLeft size={14} /> Ganti Paket ({selectedPackage?.coin_amount} Poin)
                </button>
              </div>

              {/* Selected Package Banner */}
              <div className="p-3 bg-gradient-to-r from-amber-50/90 via-amber-100/40 to-emerald-50/70 border border-amber-300/80 rounded-2xl flex items-center justify-between text-xs shadow-xs">
                <div>
                  <div className="flex items-center gap-1.5">
                    <span className="font-extrabold text-slate-900 text-sm">{selectedPackage?.coin_amount} Poin Surade</span>
                    {totalDiscount > 0 && (
                      <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-black border border-emerald-300">
                        Hemat Rp {totalDiscount.toLocaleString("id-ID")}
                      </span>
                    )}
                  </div>
                  <span className="text-[10.5px] text-slate-500 block mt-0.5">
                    {appliedCouponCode && `Kupon: ${appliedCouponCode} (-Rp ${couponDiscount.toLocaleString("id-ID")}) `}
                    {appliedReferralCode && `• Referral: ${appliedReferralCode} (-Rp ${referralDiscount.toLocaleString("id-ID")}) `}
                    {!appliedCouponCode && !appliedReferralCode && "Aktivasi otomatis setelah diverifikasi"}
                  </span>
                </div>
                <div className="text-right">
                  <span className="text-[9.5px] text-slate-400 uppercase font-bold block">Tagihan</span>
                  <div className="flex items-baseline gap-1.5 justify-end">
                    {totalDiscount > 0 && (
                      <span className="text-xs text-slate-400 line-through">
                        Rp {Number(packagePrice).toLocaleString("id-ID")}
                      </span>
                    )}
                    <span className="text-xs sm:text-sm font-black text-[#007570]">
                      Rp {Number(finalPrice).toLocaleString("id-ID")}
                    </span>
                  </div>
                </div>
              </div>

              {/* 2-Column Responsive Layout for Step 2 on Desktop */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-start">
                
                {/* Left Column: Metode Pembayaran & QRIS/Rekening */}
                <div className="space-y-3">
                  <div className="space-y-1.5">
                    <label className="block text-xs font-bold text-slate-800">
                      Pilih Saluran Pembayaran:
                    </label>

                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                      {flattenedPaymentItems.map((item) => {
                        const isSelected = selectedPaymentMethod === item.id || selectedPaymentMethod === item.name;
                        const logoUrl = getPaymentLogo(item.id || item.name);

                        return (
                          <div
                            key={item.id}
                            onClick={() => setSelectedPaymentMethod(item.id || item.name)}
                            className={`relative rounded-xl p-2 border-2 transition-all cursor-pointer flex flex-col justify-between gap-1.5 ${
                              isSelected
                                ? "border-amber-500 bg-amber-50/40 shadow-xs ring-1 ring-amber-400/30"
                                : "border-slate-200 bg-white hover:border-amber-300 hover:bg-slate-50/60"
                            }`}
                          >
                            {item.isHot && (
                              <span className="absolute -top-1.5 right-1.5 bg-gradient-to-r from-orange-500 to-amber-500 text-white text-[8px] font-black px-1.5 py-0.2 rounded-full shadow-xs uppercase tracking-wider">
                                HOT
                              </span>
                            )}

                            <div className="flex items-center gap-1.5">
                              <div className="w-6 h-6 rounded-md bg-white border border-slate-200 p-0.5 flex items-center justify-center shrink-0">
                                <img
                                  src={logoUrl}
                                  alt={item.name}
                                  className="max-h-5 max-w-5 object-contain"
                                  onError={(e) => {
                                    e.currentTarget.src = "/logos/qris.png";
                                  }}
                                />
                              </div>
                              <span className="text-[11px] font-black text-slate-900 truncate">
                                {item.name}
                              </span>
                            </div>

                            <div className="flex items-center justify-between text-[10px] text-slate-500 pt-0.5 border-t border-slate-100">
                              <span className="font-semibold">{item.id === "QRIS" ? "Semua Bank" : "Transfer"}</span>
                              {isSelected && (
                                <div className="w-3.5 h-3.5 rounded-full bg-amber-500 text-white flex items-center justify-center">
                                  <Check size={8} strokeWidth={3} />
                                </div>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Payment Details Drawer */}
                  {activePaymentDetail && (
                    <div className="p-3.5 rounded-xl bg-gradient-to-br from-[#0c2b27] via-[#053733] to-[#021f1d] text-white shadow-md space-y-3 border border-amber-400/30">
                      <div className="flex items-center justify-between border-b border-white/15 pb-2">
                        <div className="flex items-center gap-2">
                          <div className="w-7 h-7 rounded-lg bg-white/15 p-1 flex items-center justify-center border border-white/20">
                            <img
                              src={getPaymentLogo(activePaymentDetail.id || activePaymentDetail.name)}
                              alt={activePaymentDetail.name}
                              className="max-h-5 max-w-5 object-contain"
                            />
                          </div>
                          <div>
                            <span className="text-xs font-bold text-amber-300 block leading-tight">{activePaymentDetail.name}</span>
                            <span className="text-[10px] text-slate-300">Rekening Resmi Surade.com</span>
                          </div>
                        </div>
                        <span className="text-xs font-black text-emerald-300">
                          Rp {Number(finalPrice).toLocaleString("id-ID")}
                        </span>
                      </div>

                      {activePaymentDetail.isQRIS || activePaymentDetail.id === "QRIS" ? (
                        <div className="flex flex-col items-center gap-3 py-1">
                          <div
                            onClick={(e) => {
                              e.preventDefault();
                              e.stopPropagation();
                              setIsQrisZoomed(true);
                            }}
                            className="w-44 bg-white p-2.5 rounded-xl border-2 border-amber-400 shadow-md flex flex-col items-center justify-center cursor-pointer group relative overflow-hidden transition-all hover:scale-[1.02]"
                            title="Klik untuk perbesar QRIS"
                          >
                            <img
                              src={qrisImage || "/logos/qris.png"}
                              alt="QRIS Surade"
                              className="w-full h-auto max-h-48 object-contain rounded pointer-events-none"
                            />
                            <div className="mt-1 text-center pointer-events-none">
                              <span className="text-[10px] font-bold text-slate-600 flex items-center justify-center gap-1 group-hover:text-amber-600">
                                <ZoomIn size={12} className="text-amber-600" />
                                <span>Klik Perbesar Layar Penuh</span>
                              </span>
                            </div>
                          </div>

                          <div className="flex items-center gap-2 w-full max-w-44">
                            <button
                              type="button"
                              onClick={(e) => {
                                e.preventDefault();
                                e.stopPropagation();
                                setIsQrisZoomed(true);
                              }}
                              className="flex-1 py-1.5 px-2 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-[11px] shadow-xs flex items-center justify-center gap-1 cursor-pointer transition-transform active:scale-95"
                            >
                              <Maximize2 size={12} />
                              <span>Perbesar</span>
                            </button>
                            <button
                              type="button"
                              onClick={handleDownloadQris}
                              className="flex-1 py-1.5 px-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-[11px] shadow-xs flex items-center justify-center gap-1 cursor-pointer transition-transform active:scale-95"
                              title="Unduh QRIS ke galeri"
                            >
                              <Download size={12} />
                              <span>Unduh</span>
                            </button>
                          </div>
                        </div>
                      ) : (
                        <div className="space-y-2">
                          <div className="flex items-center justify-between bg-black/35 p-2.5 rounded-xl border border-white/15">
                            <div>
                              <span className="text-[9px] text-amber-200 block uppercase font-bold">Nomor Rekening Tujuan:</span>
                              <span className="text-sm sm:text-base font-black tracking-wider text-amber-300 select-all">
                                {activePaymentDetail.accountNumber}
                              </span>
                            </div>
                            <button
                              type="button"
                              onClick={() => copyToClipboard(activePaymentDetail.accountNumber)}
                              className="px-2.5 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-[11px] flex items-center gap-1 cursor-pointer border-0 shadow-xs"
                            >
                              {copiedAccount ? <Check size={12} /> : <Copy size={12} />}
                              <span>{copiedAccount ? "Tersalin!" : "Salin"}</span>
                            </button>
                          </div>

                          <div className="flex items-center justify-between text-[11px] text-slate-300 px-1">
                            <span>Nama Pemilik Rekening:</span>
                            <strong className="text-white text-xs">{activePaymentDetail.accountName || "Triwala Mitra Bestari"}</strong>
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>

                {/* Right Column: Data Pengirim & Upload Bukti Transfer */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-bold text-slate-800 flex items-center gap-1">
                      <span>Unggah Bukti Transfer / Struk QRIS</span>
                      <span className="text-rose-600 font-extrabold">*</span>
                    </label>
                    <span className="text-[10px] text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full font-bold">
                      Wajib Diunggah
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                    <input
                      type="text"
                      placeholder="Nama Pengirim (Sesuai Rekening)"
                      value={senderName}
                      onChange={(e) => setSenderName(e.target.value)}
                      className="h-9 px-3 border border-slate-300 rounded-xl placeholder-slate-400 text-xs focus:border-[#007570] focus:ring-1 focus:ring-[#007570] outline-hidden"
                    />
                    <input
                      type="text"
                      placeholder="Bank Pengirim (BCA/BRI/DANA/dll)"
                      value={senderBank}
                      onChange={(e) => setSenderBank(e.target.value)}
                      className="h-9 px-3 border border-slate-300 rounded-xl placeholder-slate-400 text-xs focus:border-[#007570] focus:ring-1 focus:ring-[#007570] outline-hidden"
                    />
                  </div>

                  {/* Upload Box with Required Indicator */}
                  <label className={`border-2 border-dashed ${proofFile ? 'border-emerald-500 bg-emerald-50/50 text-emerald-800' : 'border-amber-400 hover:border-amber-600 bg-amber-50/30 hover:bg-amber-50/60 text-amber-900'} p-3 rounded-2xl cursor-pointer transition-all flex flex-col items-center justify-center gap-1.5 text-xs font-bold text-center`}>
                    <Upload size={18} className={proofFile ? "text-emerald-600" : "text-amber-600"} />
                    <span>{proofFile ? "Foto Bukti Terpilih (Klik untuk ganti)" : "Klik di sini untuk Unggah Foto Bukti Transfer / Struk"}</span>
                    <span className="text-[10px] text-slate-500 font-normal">Format JPG, PNG, atau WEBP maks 5MB</span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                          setProofFile(file);
                          setProofPreview(URL.createObjectURL(file));
                        }
                      }}
                      className="hidden"
                    />
                  </label>

                  {proofPreview && (
                    <div className="relative rounded-2xl overflow-hidden border-2 border-emerald-400 w-full h-32 bg-slate-900/5 flex items-center justify-center shadow-inner">
                      <img src={proofPreview} alt="Bukti Transfer Poin" className="h-full object-contain" />
                      <button
                        type="button"
                        onClick={() => {
                          setProofFile(null);
                          setProofPreview(null);
                        }}
                        className="absolute top-2 right-2 w-6 h-6 rounded-full bg-slate-900/80 text-white flex items-center justify-center border-0 cursor-pointer hover:bg-rose-600 transition-colors"
                        title="Hapus bukti"
                      >
                        <X size={12} />
                      </button>
                    </div>
                  )}

                  {!proofFile && (
                    <div className="p-2 rounded-xl bg-amber-50 border border-amber-200 flex items-center gap-2 text-[10.5px] text-amber-800 font-medium">
                      <AlertCircle size={14} className="shrink-0 text-amber-600" />
                      <span>Poin akan langsung ditambahkan ke saldo akun Anda setelah admin memverifikasi bukti ini.</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* STICKY BOTTOM SUMMARY BAR - COMPACT */}
        <div className="p-3 sm:p-3.5 px-4 sm:px-6 bg-white border-t border-slate-200 flex items-center justify-between gap-3 shadow-[0_-4px_20px_rgba(0,0,0,0.06)] relative z-20">
          
          {/* Total Tagihan (Left) */}
          <div className="min-w-0">
            <span className="text-[9.5px] text-slate-400 font-bold block uppercase tracking-wider">
              TOTAL TAGIHAN
            </span>
            <div className="flex items-baseline gap-1.5">
              {totalDiscount > 0 && (
                <span className="text-xs text-slate-400 line-through font-semibold">
                  Rp {Number(packagePrice).toLocaleString("id-ID")}
                </span>
              )}
              <span className="text-lg sm:text-xl font-black text-[#007570] leading-tight block">
                Rp {Number(finalPrice).toLocaleString("id-ID")}
              </span>
              {totalDiscount > 0 && (
                <span className="text-[9.5px] font-black bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full border border-emerald-300">
                  Hemat Rp {totalDiscount.toLocaleString("id-ID")}
                </span>
              )}
            </div>
            <span className="text-[10px] text-amber-700 font-semibold flex items-center gap-1 mt-0.5">
              <SuradeCoinIcon size={12} />
              <span>{selectedPackage?.coin_amount || 0} Poin Resmi Surade</span>
            </span>
          </div>

          {/* Action Buttons (Right - Sesuai Gambar 1) */}
          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl border border-slate-300 text-slate-700 font-bold text-xs hover:bg-slate-100 active:bg-slate-200 transition-all cursor-pointer shadow-xs active:translate-y-0.5"
            >
              Batal
            </button>

            {activeStep === 1 ? (
              <button
                type="button"
                onClick={() => {
                  if (!selectedPackage) {
                    toast.error("Pilih salah satu paket nominal poin.");
                    return;
                  }
                  setActiveStep(2);
                }}
                disabled={!selectedPackage}
                className="px-6 py-3 rounded-2xl bg-gradient-to-r from-[#ea580c] via-[#f59e0b] to-[#d97706] hover:brightness-105 active:translate-y-1 active:shadow-[0_1px_0_#9a3412] text-white font-black text-xs sm:text-sm shadow-[0_4px_0_#9a3412,0_8px_18px_rgba(234,88,12,0.35)] flex items-center gap-2 cursor-pointer disabled:opacity-50 transition-all border-t border-white/30"
              >
                <span>Lanjut Pembayaran</span>
                <ChevronRight size={16} />
              </button>
            ) : (
              <button
                type="button"
                onClick={handleSubmitPurchase}
                disabled={processingOrder || !selectedPackage || !proofFile}
                className={`px-6 py-3 rounded-2xl font-black text-xs sm:text-sm flex items-center gap-2 transition-all border-t border-white/30 ${
                  !proofFile || processingOrder
                    ? "bg-slate-300 text-slate-500 cursor-not-allowed shadow-none"
                    : "bg-gradient-to-r from-[#ea580c] via-[#f59e0b] to-[#007570] hover:brightness-105 active:translate-y-1 text-white shadow-[0_4px_0_#9a3412,0_8px_18px_rgba(234,88,12,0.35)] active:shadow-[0_1px_0_#9a3412] cursor-pointer"
                }`}
              >
                {processingOrder ? (
                  <>
                    <Loader2 size={16} className="animate-spin" />
                    <span>Memproses...</span>
                  </>
                ) : (
                  <>
                    <Zap size={16} className={proofFile ? "fill-white text-white" : "text-slate-400"} />
                    <span>Kirim Bukti Pembayaran</span>
                  </>
                )}
              </button>
            )}
            </div>
          </div>
        </div>
      </div>

      {/* ── MODAL FULLSCREEN ZOOM QRIS (SUPER BESAR & JELAS DI ATAS MODAL UTAMA) ── */}
      {isQrisZoomed && (
        <div
          onClick={() => setIsQrisZoomed(false)}
          className="fixed inset-0 z-[9999999] bg-slate-950/90 backdrop-blur-md flex items-center justify-center p-3 sm:p-5 animate-fade-in"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="bg-white rounded-3xl p-5 sm:p-7 max-w-lg w-full shadow-2xl border-4 border-amber-400 flex flex-col items-center gap-4 text-center relative max-h-[92vh] overflow-y-auto"
          >
            <button
              type="button"
              onClick={() => setIsQrisZoomed(false)}
              className="absolute top-3.5 right-3.5 w-10 h-10 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-700 flex items-center justify-center transition-colors cursor-pointer border border-slate-300 shadow-xs z-10"
              title="Tutup Tampilan Penuh"
            >
              <X size={20} />
            </button>

            <div className="space-y-1.5 pr-8 text-left w-full border-b border-slate-100 pb-3">
              <span className="text-[10px] font-black uppercase tracking-wider text-amber-700 bg-amber-100 px-2.5 py-0.5 rounded-full inline-block">
                Tampilan Layar Penuh QRIS Resmi
              </span>
              <h3 className="text-base sm:text-xl font-black text-slate-900">
                Scan Barcode QRIS Surade.com
              </h3>
              <p className="text-xs text-slate-600">
                A.n <strong>{activePaymentDetail?.accountName || "Triwala Mitra Bestari"}</strong> • Tagihan: <strong className="text-[#007570]">Rp {Number(finalPrice || selectedPackage?.price_idr || 0).toLocaleString("id-ID")}</strong>
              </p>
            </div>

            {/* Extra Large Crisp Image Container */}
            <div className="w-full bg-slate-50 p-4 rounded-2xl border-2 border-slate-200 flex items-center justify-center shadow-inner">
              <img
                src={qrisImage || "/logos/qris.png"}
                alt="QRIS Surade Fullscreen"
                className="w-full max-h-[55vh] object-contain rounded-xl select-all"
              />
            </div>

            <div className="w-full flex flex-col sm:flex-row items-center gap-2 pt-1">
              <button
                type="button"
                onClick={handleDownloadQris}
                className="w-full sm:flex-1 py-3 px-4 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-700 hover:opacity-95 text-white font-extrabold text-xs shadow-md flex items-center justify-center gap-2 cursor-pointer transition-all border-0"
              >
                <Download size={16} />
                <span>Unduh Gambar ke Galeri</span>
              </button>
              <button
                type="button"
                onClick={() => setIsQrisZoomed(false)}
                className="w-full sm:w-auto py-3 px-6 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs cursor-pointer border border-slate-200"
              >
                Tutup
              </button>
            </div>

            <p className="text-[11px] text-slate-400">
              Arahkan kamera aplikasi e-wallet Anda ke layar ini, atau unduh gambar untuk di-scan lewat galeri.
            </p>
          </div>
        </div>
      )}
    </>
  );

  return typeof document !== "undefined" ? createPortal(modalNode, document.body) : modalNode;
}

/**
 * 2. MODAL KONFIRMASI PEMBAYARAN LAYANAN DENGAN Surade Poin
 */
export function CoinPaymentConfirmationModal({
  isOpen,
  onClose,
  onConfirm,
  serviceTitle = "Layanan",
  coinCost = 0,
  currentBalance = 0,
  onBuyCoinClick,
  loading = false,
  extraDetails = null,
}) {
  if (!isOpen) return null;

  const cost = Number(coinCost) || 0;
  const balance = Number(currentBalance) || 0;
  const isSufficient = balance >= cost;
  const remainingBalance = balance - cost;

  const modalNode = (
    <div className="fixed inset-0 z-[99999] flex items-center justify-center p-4 bg-slate-900/80 backdrop-blur-xs animate-fade-in font-['Poppins',sans-serif]">
      <div className="bg-white w-full max-w-md rounded-3xl shadow-2xl border border-amber-200/80 overflow-hidden flex flex-col">
        {/* Header */}
        <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-emerald-950 text-white p-5 flex items-center justify-between border-b border-slate-700/60">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-amber-500/20 border border-amber-400/30 flex items-center justify-center">
              <SuradeCoinIcon size={22} />
            </div>
            <div>
              <h3 className="text-base font-extrabold text-white">Konfirmasi Pembayaran</h3>
              <p className="text-[11px] text-slate-300">Gunakan Saldo Poin Anda</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors cursor-pointer"
          >
            <X size={16} />
          </button>
        </div>

        {/* Body Details */}
        <div className="p-6 space-y-5">
          <div className="p-4 rounded-2xl bg-amber-50/60 border border-amber-200/80 space-y-3">
            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-500 font-medium">Layanan yang Dibeli:</span>
              <span className="font-extrabold text-slate-900 text-right">{serviceTitle}</span>
            </div>

            {extraDetails && (
              <div className="flex items-center justify-between text-xs border-t border-amber-200/40 pt-2">
                <span className="text-slate-500 font-medium">Detail:</span>
                <span className="font-semibold text-slate-700 text-right">{extraDetails}</span>
              </div>
            )}

            <div className="flex items-center justify-between border-t border-amber-200/60 pt-2.5">
              <span className="text-xs font-bold text-slate-700">Biaya Poin:</span>
              <div className="flex items-center gap-1.5 font-black text-amber-700 text-base">
                <SuradeCoinIcon size={20} />
                <span>{cost.toLocaleString("id-ID")} Poin</span>
              </div>
            </div>
          </div>

          {/* Saldo Calculation Breakdown */}
          <div className="bg-slate-50 rounded-2xl p-4 border border-slate-200/80 space-y-2.5 text-xs">
            <div className="flex items-center justify-between text-slate-600">
              <span>Saldo Poin Anda Saat Ini:</span>
              <span className="font-bold text-slate-900">{balance.toLocaleString("id-ID")} Poin</span>
            </div>

            <div className="flex items-center justify-between text-rose-600">
              <span>Pengurangan Poin:</span>
              <span className="font-bold">-{cost.toLocaleString("id-ID")} Poin</span>
            </div>

            <div className="border-t border-slate-200 pt-2 flex items-center justify-between font-black text-sm">
              <span className="text-slate-700">Sisa Saldo Setelah Transaksi:</span>
              <span className={isSufficient ? "text-[#059669]" : "text-rose-600"}>
                {isSufficient ? `${remainingBalance.toLocaleString("id-ID")} Poin` : "Tidak Cukup"}
              </span>
            </div>
          </div>

          {!isSufficient && (
            <div className="p-3.5 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <AlertCircle size={18} className="shrink-0 text-rose-600" />
                <span>Saldo Poin tidak mencukupi untuk transaksi ini.</span>
              </div>
              {onBuyCoinClick && (
                <button
                  type="button"
                  onClick={() => {
                    onClose();
                    onBuyCoinClick();
                  }}
                  className="px-3 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-white font-bold text-xs shrink-0 shadow-xs cursor-pointer"
                >
                  + Beli Poin
                </button>
              )}
            </div>
          )}
        </div>

        {/* Actions Footer */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-end gap-2.5">
          <button
            type="button"
            onClick={onClose}
            disabled={loading}
            className="px-4 py-2.5 rounded-xl border border-slate-300 text-slate-700 font-bold text-xs hover:bg-slate-100 transition-colors cursor-pointer"
          >
            Batal
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={loading || !isSufficient}
            className="px-5 py-2.5 rounded-xl bg-[#059669] hover:bg-[#005f5b] active:scale-98 text-white font-bold text-xs shadow-md flex items-center gap-2 transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? (
              <>
                <Loader2 size={16} className="animate-spin" />
                <span>Memproses Poin...</span>
              </>
            ) : (
              <>
                <SuradeCoinIcon size={16} />
                <span>Bayar dengan Poin</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );

  return typeof document !== "undefined" ? createPortal(modalNode, document.body) : modalNode;
}

/**
 * 3. MODAL RIWAYAT TRANSAKSI Surade Poin LENGKAP
 */
export function CoinHistoryModal({ isOpen, onClose }) {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterType, setFilterType] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [paginationMeta, setPaginationMeta] = useState(null);

  const fetchTransactions = async (page = 1) => {
    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      const params = { page, per_page: 10 };
      if (filterType !== "all") params.type = filterType;
      if (searchQuery.trim()) params.search = searchQuery.trim();

      const res = await axios.get(`${API_BASE}/coins/transactions`, {
        params,
        headers: { Authorization: `Bearer ${token}` },
      });

      if (res.data?.success) {
        setTransactions(res.data.transactions?.data || []);
        setPaginationMeta(res.data.transactions);
        setCurrentPage(page);
      }
    } catch (err) {
      console.error("Error fetching coin transactions:", err);
      toast.error("Gagal memuat riwayat transaksi poin.");
    } finally {
      setLoading(false);
    }
  };

  /* eslint-disable react-hooks/set-state-in-effect, react-hooks/exhaustive-deps */
  useEffect(() => {
    if (isOpen) {
      fetchTransactions(1);
    }
  }, [isOpen, filterType]);
  /* eslint-enable react-hooks/set-state-in-effect, react-hooks/exhaustive-deps */

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchTransactions(1);
  };

  const handleDeleteTransaction = async (id) => {
    if (!window.confirm("Apakah Anda yakin ingin menghapus catatan riwayat transaksi ini?")) return;
    try {
      const token = localStorage.getItem("token");
      const res = await axios.delete(`${API_BASE}/coins/transactions/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.data?.success) {
        toast.success(res.data.message || "Catatan transaksi berhasil dihapus.");
        fetchTransactions(currentPage);
      }
    } catch (err) {
      toast.error(err.response?.data?.message || "Gagal menghapus riwayat transaksi.");
    }
  };

  if (!isOpen) return null;

  const modalNode = (
    <div className="fixed inset-0 z-[99999] flex items-center justify-center p-4 bg-slate-900/80 backdrop-blur-xs animate-fade-in font-['Poppins',sans-serif]">
      <div className="bg-white w-full max-w-2xl rounded-3xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="bg-gradient-to-r from-slate-900 to-emerald-950 text-white p-5 flex items-center justify-between border-b border-slate-700/60">
          <div className="flex items-center gap-2.5">
            <SuradeCoinIcon size={24} />
            <div>
              <h3 className="text-base font-extrabold text-white">Riwayat Poin</h3>
              <p className="text-[11px] text-slate-300">Catatan mutasi poin masuk dan keluar</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors cursor-pointer"
          >
            <X size={16} />
          </button>
        </div>

        {/* Filter & Search Toolbar */}
        <div className="p-4 border-b border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-3 bg-slate-50/50">
          <div className="flex items-center gap-1.5 p-1 bg-white border border-slate-200 rounded-xl text-xs font-bold w-full sm:w-auto">
            <button
              onClick={() => setFilterType("all")}
              className={`px-3 py-1.5 rounded-lg transition-colors cursor-pointer ${
                filterType === "all" ? "bg-[#059669] text-white" : "text-slate-600 hover:bg-slate-100"
              }`}
            >
              Semua
            </button>
            <button
              onClick={() => setFilterType("credit")}
              className={`px-3 py-1.5 rounded-lg transition-colors cursor-pointer flex items-center gap-1 ${
                filterType === "credit" ? "bg-emerald-600 text-white" : "text-emerald-700 hover:bg-emerald-50"
              }`}
            >
              <ArrowDownLeft size={13} />
              <span>Poin Masuk</span>
            </button>
            <button
              onClick={() => setFilterType("debit")}
              className={`px-3 py-1.5 rounded-lg transition-colors cursor-pointer flex items-center gap-1 ${
                filterType === "debit" ? "bg-rose-600 text-white" : "text-rose-700 hover:bg-rose-50"
              }`}
            >
              <ArrowUpRight size={13} />
              <span>Poin Keluar</span>
            </button>
          </div>

          <form onSubmit={handleSearchSubmit} className="relative w-full sm:w-60">
            <input
              type="text"
              placeholder="Cari transaksi..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full h-9 pl-8 pr-3 text-xs bg-white border border-slate-200 rounded-xl placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#007570]/20 focus:border-[#007570]"
            />
            <Search size={14} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" />
          </form>
        </div>

        {/* Transactions List */}
        <div className="p-4 overflow-y-auto flex-1 divide-y divide-slate-100 space-y-2">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-16 gap-3 text-slate-400">
              <Loader2 className="animate-spin text-amber-500" size={32} />
              <p className="text-xs font-semibold">Memuat riwayat transaksi...</p>
            </div>
          ) : transactions.length === 0 ? (
            <div className="text-center py-14 text-slate-400 space-y-2">
              <SuradeCoinIcon size={36} className="mx-auto opacity-50" />
              <p className="text-xs font-semibold">Belum ada riwayat transaksi poin.</p>
            </div>
          ) : (
            transactions.map((tx) => {
              const isCredit = tx.type === "credit";

              return (
                <div key={tx.id} className="pt-2 pb-2 flex items-start justify-between gap-3 hover:bg-slate-50/80 p-2.5 rounded-2xl transition-colors">
                  <div className="flex items-start gap-3">
                    <div
                      className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${
                        isCredit ? "bg-emerald-100 text-emerald-700" : "bg-rose-100 text-rose-700"
                      }`}
                    >
                      {isCredit ? <ArrowDownLeft size={18} /> : <ArrowUpRight size={18} />}
                    </div>

                    <div className="space-y-0.5">
                      <div className="flex items-center gap-2">
                        <h4 className="text-xs font-bold text-slate-900">{tx.service_name || tx.description}</h4>
                        <span className="text-[10px] text-slate-400 font-mono">#{tx.transaction_number}</span>
                      </div>
                      <p className="text-[11px] text-slate-500 leading-snug">{tx.description}</p>
                      <span className="text-[10px] text-slate-400 font-medium block">
                        {new Date(tx.created_at).toLocaleString("id-ID", {
                          day: "numeric",
                          month: "short",
                          year: "numeric",
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2.5 shrink-0">
                    <div className="text-right">
                      <span
                        className={`text-sm font-black flex items-center gap-1 justify-end ${
                          isCredit ? "text-emerald-600" : "text-rose-600"
                        }`}
                      >
                        <span>{isCredit ? "+" : "-"}{Number(tx.amount).toLocaleString("id-ID")}</span>
                        <SuradeCoinIcon size={14} />
                      </span>
                      <span className="text-[10px] text-slate-400 font-medium block">
                        Saldo: {Number(tx.balance_after).toLocaleString("id-ID")}
                      </span>
                    </div>

                    <button
                      type="button"
                      onClick={() => handleDeleteTransaction(tx.id)}
                      className="p-1.5 rounded-xl text-slate-300 hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer border border-transparent hover:border-rose-200"
                      title="Hapus riwayat mutasi transaksi ini"
                    >
                      <Trash2 size={13} />
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Pagination Footer */}
        {paginationMeta && paginationMeta.last_page > 1 && (
          <div className="p-3 bg-slate-50 border-t border-slate-200 flex items-center justify-between text-xs">
            <span className="text-slate-500 text-[11px]">
              Hal {paginationMeta.current_page} dari {paginationMeta.last_page}
            </span>
            <div className="flex items-center gap-1">
              <button
                disabled={currentPage <= 1}
                onClick={() => fetchTransactions(currentPage - 1)}
                className="px-2.5 py-1 rounded-lg border border-slate-200 bg-white hover:bg-slate-100 disabled:opacity-40 text-xs font-bold"
              >
                Prev
              </button>
              <button
                disabled={currentPage >= paginationMeta.last_page}
                onClick={() => fetchTransactions(currentPage + 1)}
                className="px-2.5 py-1 rounded-lg border border-slate-200 bg-white hover:bg-slate-100 disabled:opacity-40 text-xs font-bold"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );

  return typeof document !== "undefined" ? createPortal(modalNode, document.body) : modalNode;
}

/**
 * 4. MODAL PANDUAN CARA MENGGUNAKAN Surade Poin
 */
export function CoinGuideModal({ isOpen, onClose }) {
  if (!isOpen) return null;

  const modalNode = (
    <div className="fixed inset-0 z-[99999] flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-xs animate-fade-in font-['Poppins',sans-serif]">
      <div className="bg-white w-full max-w-lg rounded-3xl shadow-2xl border border-amber-200 overflow-hidden flex flex-col max-h-[90vh]">
        <div className="bg-gradient-to-r from-amber-600 via-amber-500 to-emerald-700 text-white p-5 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <SuradeCoinIcon size={24} />
            <div>
              <h3 className="text-base font-extrabold text-white">Panduan Poin</h3>
              <p className="text-[11px] text-amber-100">Mata uang digital eksklusif Surade.com</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white/20 hover:bg-white/30 text-white flex items-center justify-center transition-colors cursor-pointer"
          >
            <X size={16} />
          </button>
        </div>

        <div className="p-5 overflow-y-auto space-y-5 text-xs text-slate-600 leading-relaxed">

          {/* Apa itu Poin */}
          <div className="p-4 rounded-2xl bg-gradient-to-br from-amber-50 to-amber-100/40 border border-amber-200/80 space-y-2">
            <h4 className="font-extrabold text-slate-900 text-sm flex items-center gap-2">
              <Sparkles size={16} className="text-amber-600" />
              Apa itu Surade Poin?
            </h4>
            <p className="text-slate-600">
              <strong>Poin</strong> adalah mata uang digital internal resmi <strong>Surade.com</strong>. Dengan Poin, Anda bisa membayar berbagai layanan premium secara instan — tanpa perlu transfer berulang untuk setiap transaksi.
            </p>
            <div className="mt-2 p-2.5 rounded-xl bg-emerald-50 border border-emerald-200 flex items-center gap-2 text-[11px] text-emerald-900">
              <Zap size={13} className="text-emerald-600 shrink-0" />
              <span><strong>Nilai Tukar Resmi:</strong> 1 Poin = Rp 1.000</span>
            </div>
          </div>

          {/* Cara Mendapatkan Poin */}
          <div className="space-y-2">
            <h4 className="font-bold text-slate-900 text-xs uppercase tracking-wider flex items-center gap-1.5">
              <Zap size={14} className="text-amber-500" />
              Cara Mendapatkan Poin:
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px]">
              <div className="p-3 rounded-xl border border-emerald-200 bg-emerald-50/60 flex items-start gap-2.5">
                <div className="w-6 h-6 rounded-full bg-emerald-500 text-white flex items-center justify-center shrink-0 text-[10px] font-black">1</div>
                <div>
                  <span className="font-bold text-slate-800 block">Registrasi Pengguna Baru</span>
                  <span className="text-slate-500">Daftar akun baru dan langsung dapat <strong className="text-emerald-700">+10 Poin</strong> gratis otomatis.</span>
                </div>
              </div>
              <div className="p-3 rounded-xl border border-amber-200 bg-amber-50/60 flex items-start gap-2.5">
                <div className="w-6 h-6 rounded-full bg-amber-500 text-white flex items-center justify-center shrink-0 text-[10px] font-black">2</div>
                <div>
                  <span className="font-bold text-slate-800 block">Beli Poin Resmi</span>
                  <span className="text-slate-500">Pilih paket, transfer ke rekening resmi Surade, unggah bukti bayar — Poin langsung aktif setelah diverifikasi admin.</span>
                </div>
              </div>
            </div>
            <div className="p-2.5 rounded-xl border border-slate-200 bg-slate-50 text-[11px] text-slate-700 flex items-center gap-2">
              <Info size={13} className="text-slate-500 shrink-0" />
              <span>Poin <strong>hanya</strong> bisa didapatkan melalui 2 cara di atas. Tidak ada cara lain untuk mendapatkan Poin.</span>
            </div>
          </div>

          {/* Cara Menggunakan Poin */}
          <div className="space-y-2">
            <h4 className="font-bold text-slate-900 text-xs uppercase tracking-wider flex items-center gap-1.5">
              <ShieldCheck size={14} className="text-emerald-600" />
              Cara Menggunakan Poin:
            </h4>
            <ol className="space-y-2">
              <li className="flex items-start gap-2.5">
                <div className="w-5 h-5 rounded-full bg-[#007570] text-white flex items-center justify-center shrink-0 text-[9px] font-black mt-0.5">1</div>
                <div>
                  <span className="font-bold text-slate-800 block text-[11px]">Pilih Layanan</span>
                  <span className="text-[11px] text-slate-500">Klik tombol pada fitur yang ingin Anda gunakan (Bisnis Premium, Iklan, Event, atau Akses WA).</span>
                </div>
              </li>
              <li className="flex items-start gap-2.5">
                <div className="w-5 h-5 rounded-full bg-[#007570] text-white flex items-center justify-center shrink-0 text-[9px] font-black mt-0.5">2</div>
                <div>
                  <span className="font-bold text-slate-800 block text-[11px]">Konfirmasi Pembayaran</span>
                  <span className="text-[11px] text-slate-500">Sistem akan menampilkan modal konfirmasi dengan rincian biaya Poin. Pastikan saldo mencukupi.</span>
                </div>
              </li>
              <li className="flex items-start gap-2.5">
                <div className="w-5 h-5 rounded-full bg-[#007570] text-white flex items-center justify-center shrink-0 text-[9px] font-black mt-0.5">3</div>
                <div>
                  <span className="font-bold text-slate-800 block text-[11px]">Klik "Bayar dengan Poin"</span>
                  <span className="text-[11px] text-slate-500">Poin langsung terpotong dari saldo Anda dan layanan langsung aktif secara otomatis.</span>
                </div>
              </li>
            </ol>
          </div>
        </div>

        <div className="p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between gap-3">
          <p className="text-[10.5px] text-slate-400 flex items-center gap-1">
            <ShieldCheck size={12} className="text-emerald-500" />
            Transaksi aman &amp; terverifikasi resmi Surade.com
          </p>
          <button
            onClick={onClose}
            className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-[#007570] to-emerald-700 hover:opacity-90 text-white font-bold text-xs cursor-pointer shadow-md"
          >
            Mengerti &amp; Tutup
          </button>
        </div>
      </div>
    </div>
  );

  return typeof document !== "undefined" ? createPortal(modalNode, document.body) : modalNode;
}
