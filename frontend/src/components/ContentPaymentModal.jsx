import { useState, useEffect } from "react";
import api from "../services/api";
import PaymentMethodSelector from "./PaymentMethodSelector";
import {
  X, Check, AlertCircle, Upload, Ticket,
  CreditCard, ShieldCheck, Loader2, Sparkles, FileText, Calendar,
  Building2, Wallet, Copy, RefreshCw, Eye
} from "lucide-react";

export default function ContentPaymentModal({
  isOpen,
  onClose,
  blog,
  onSuccess,
}) {
  const [pricingData, setPricingData] = useState({ blog: 10000, event: 15000 });
  const [loadingPricing, setLoadingPricing] = useState(false);

  const [couponCode, setCouponCode] = useState("");
  const [couponLoading, setCouponLoading] = useState(false);
  const [appliedCoupon, setAppliedCoupon] = useState(null);
  // Daftar kode kupon aktif (sama seperti fitur di halaman Tambah Usaha/Iklan)
  const [availableCoupons, setAvailableCoupons] = useState([]);
  const [availableCouponsLoading, setAvailableCouponsLoading] = useState(true);

  useEffect(() => {
    api.get("/coupons/public-codes")
      .then((res) => {
        const list = res.data?.data || res.data || [];
        setAvailableCoupons(Array.isArray(list) ? list : []);
      })
      .catch((err) => console.error("Gagal memuat daftar kupon:", err))
      .finally(() => setAvailableCouponsLoading(false));
  }, []);
  const [couponError, setCouponError] = useState("");

  const [paymentMethod, setPaymentMethod] = useState("Bank BCA");
  const [copiedAccount, setCopiedAccount] = useState(false);

  const [proofFile, setProofFile] = useState(null);
  const [proofPreview, setProofPreview] = useState(null);

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [successData, setSuccessData] = useState(null);



  const handleCopy = (text) => {
    navigator.clipboard.writeText(text);
    setCopiedAccount(true);
    setTimeout(() => setCopiedAccount(false), 2000);
  };

  useEffect(() => {
    if (isOpen) {
      fetchPricing();
      setCouponCode("");
      setAppliedCoupon(null);
      setCouponError("");
      setProofFile(null);
      setProofPreview(null);
      setError("");
      setSuccessData(null);
      setPaymentMethod("Bank BCA");
    }
  }, [isOpen]);

  const fetchPricing = async () => {
    try {
      setLoadingPricing(true);
      const res = await api.get("/content-pricing");
      if (res.data) {
        setPricingData({
          blog: Number(res.data.blog || 10000),
          event: Number(res.data.event || 15000),
        });
      }
    } catch (err) {
      console.error("Gagal mengambil tarif publikasi:", err);
    } finally {
      setLoadingPricing(false);
    }
  };

  if (!isOpen || !blog) return null;

  const contentType = blog.type || "blog";
  const isEvent = contentType === "event";
  const contentLabel = isEvent ? "Event" : "Blog";
  const basePrice = isEvent ? pricingData.event : pricingData.blog;

  // Discount calculation
  let couponDiscount = 0;
  if (appliedCoupon) {
    if (appliedCoupon.discount_type === "percentage" || appliedCoupon.type === "percentage") {
      const pct = Number(appliedCoupon.discount_value || appliedCoupon.value || 0);
      couponDiscount = (basePrice * pct) / 100;
      const maxDisc = Number(appliedCoupon.maximum_discount || appliedCoupon.max_discount || 0);
      if (maxDisc > 0) {
        couponDiscount = Math.min(couponDiscount, maxDisc);
      }
    } else {
      couponDiscount = Number(appliedCoupon.discount_value || appliedCoupon.value || 0);
    }
    couponDiscount = Math.min(couponDiscount, basePrice);
  }

  const finalPrice = Math.max(0, basePrice - couponDiscount);

  // Apply Coupon
  const handleApplyCoupon = async (targetCode = null) => {
    const codeToUse = (typeof targetCode === "string" && targetCode ? targetCode : couponCode).trim().toUpperCase();
    if (!codeToUse) return;
    setCouponCode(codeToUse);
    setCouponLoading(true);
    setCouponError("");
    try {
      const res = await api.post("/coupons/validate", {
        code: codeToUse,
        product_type: contentType,
        amount: basePrice,
      });
      const data = res.data?.data || res.data;
      if (data && (data.valid || data.is_valid !== false)) {
        setAppliedCoupon(data.coupon || data);
        setCouponError("");
      } else {
        setCouponError(data?.message || "Kupon tidak valid.");
      }
    } catch (err) {
      setCouponError(err.response?.data?.message || "Kupon tidak ditemukan atau sudah kedaluwarsa.");
    } finally {
      setCouponLoading(false);
    }
  };

  // File change
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        setError("Ukuran file maksimal 5MB.");
        return;
      }
      setProofFile(file);
      setProofPreview(URL.createObjectURL(file));
      setError("");
    }
  };

  // Submit checkout
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (finalPrice > 0 && !proofFile) {
      setError("Silakan unggah bukti transfer / struk pembayaran terlebih dahulu.");
      return;
    }

    setSubmitting(true);
    setError("");

    try {
      const formData = new FormData();
      if (appliedCoupon) {
        formData.append("coupon_code", appliedCoupon.code || couponCode.trim().toUpperCase());
      }
      formData.append("payment_method", paymentMethod);
      if (proofFile) {
        formData.append("payment_proof", proofFile);
      }

      const res = await api.post(`/blogs/${blog.id}/checkout`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      const responseData = res.data;
      setSuccessData(responseData);

      if (onSuccess) {
        onSuccess(responseData.blog || blog, responseData.transaction);
      }
    } catch (err) {
      setError(err.response?.data?.message || "Terjadi kesalahan saat memproses pembayaran.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[9999] bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 overflow-y-auto" onClick={onClose}>
      <div
        className="bg-white rounded-3xl max-w-xl w-full shadow-2xl overflow-hidden border border-slate-100 my-auto animate-in fade-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-5 sm:p-6 border-b border-slate-100 bg-white">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-teal-50 text-[#007570] flex items-center justify-center font-bold shrink-0 border border-teal-100">
              {isEvent ? <Calendar size={22} /> : <FileText size={22} />}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base sm:text-lg font-black text-slate-900 leading-tight">
                  Pembayaran Publikasi {contentLabel}
                </h2>
                <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full bg-teal-100 text-[#007570]">
                  Pay Per Post
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                Biaya publikasi 1 kali untuk penayangan aktif di platform Surade.co.id
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-slate-100 text-slate-400 hover:text-slate-700 hover:bg-slate-200 flex items-center justify-center transition-colors cursor-pointer shrink-0"
            aria-label="Tutup"
          >
            <X size={16} />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-5 sm:p-6 max-h-[80vh] overflow-y-auto space-y-5">
          {successData ? (
            /* Success State */
            <div className="text-center py-4 space-y-4">
              <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto shadow-inner">
                <Check size={34} strokeWidth={2.5} />
              </div>
              <div>
                <h3 className="text-lg font-bold text-slate-900">
                  {successData.blog?.status === "published"
                    ? `Publikasi ${contentLabel} Berhasil!`
                    : "Bukti Pembayaran Terkirim!"}
                </h3>
                <p className="text-xs sm:text-sm text-slate-600 mt-1 max-w-md mx-auto leading-relaxed">
                  {successData.blog?.status === "published"
                    ? `${contentLabel} Anda telah berstatus Published dan kini dapat diakses oleh seluruh pengunjung platform.`
                    : `Terima kasih! Bukti pembayaran untuk "${blog.title}" telah diterima dan sedang diverifikasi oleh Admin. Status akan otomatis berubah menjadi Published setelah disetujui.`}
                </p>
              </div>

              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200/80 text-left text-xs space-y-2.5 max-w-md mx-auto">
                <div className="flex justify-between items-center">
                  <span className="text-slate-500">Kode Transaksi:</span>
                  <span className="font-mono font-bold text-slate-800 bg-white px-2 py-0.5 rounded border border-slate-200">
                    {successData.transaction?.transaction_code || "-"}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-slate-500">Metode Bayar:</span>
                  <span className="font-semibold text-slate-800">
                    {paymentMethod}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-slate-500">Total Dibayar:</span>
                  <span className="font-black text-[#007570] text-sm">
                    Rp {Number(successData.transaction?.amount || finalPrice).toLocaleString("id-ID")}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-slate-500">Status Publikasi:</span>
                  <span className={`font-bold px-2.5 py-0.5 rounded-full text-[11px] ${
                    successData.blog?.status === "published"
                      ? "bg-emerald-100 text-emerald-700"
                      : "bg-amber-100 text-amber-800"
                  }`}>
                    {successData.blog?.status === "published" ? "Published" : "Menunggu Verifikasi Admin"}
                  </span>
                </div>
              </div>

              <div className="pt-2">
                <button
                  type="button"
                  onClick={onClose}
                  className="w-full py-3 bg-[#007570] text-white font-bold rounded-xl shadow-lg shadow-teal-700/20 hover:bg-[#005f5b] transition-all cursor-pointer text-sm"
                >
                  Selesai
                </button>
              </div>
            </div>
          ) : (
            /* Checkout Form */
            <form onSubmit={handleSubmit} className="space-y-4 text-left">
              {error && (
                <div className="p-3.5 bg-red-50 border border-red-200 text-red-700 text-xs rounded-xl flex items-start gap-2.5">
                  <AlertCircle size={16} className="shrink-0 mt-0.5 text-red-600" />
                  <span className="font-medium">{error}</span>
                </div>
              )}

              {/* Item Card */}
              <div className="p-4 bg-gradient-to-r from-teal-50/70 to-emerald-50/40 rounded-2xl border border-teal-200/70 flex items-center justify-between gap-3">
                <div className="min-w-0 flex-1">
                  <span className="text-[10px] font-extrabold uppercase tracking-wider text-teal-800 block mb-0.5">
                    Konten yang Dipublikasikan
                  </span>
                  <h4 className="text-sm font-bold text-slate-900 truncate" title={blog.title}>
                    {blog.title || "Draft Konten Tanpa Judul"}
                  </h4>
                  <div className="flex items-center gap-2 mt-1 text-xs text-slate-500">
                    <span className="font-semibold text-slate-700">{contentLabel}</span>
                    <span>•</span>
                    <span>Kategori: {blog.blog_category || blog.category?.name || "Umum"}</span>
                  </div>
                </div>
                <div className="text-right shrink-0">
                  <span className="text-[10px] text-slate-400 uppercase font-semibold block">Biaya Publikasi</span>
                  <span className="text-lg font-black text-[#007570]">
                    Rp {basePrice.toLocaleString("id-ID")}
                  </span>
                </div>
              </div>

              {/* Kupon Tersedia — supaya user tahu kode apa yang bisa dipakai */}
              <div className="bg-emerald-50/60 p-4 rounded-2xl border border-emerald-200">
                <p className="text-xs font-bold text-emerald-800 mb-2.5 flex items-center gap-1.5">
                  <Sparkles size={14} />
                  Kupon Tersedia — klik untuk pakai
                </p>
                {availableCouponsLoading ? (
                  <div className="flex items-center gap-2 text-xs text-slate-500 py-1">
                    <Loader2 size={14} className="animate-spin" />
                    Memuat kupon aktif...
                  </div>
                ) : availableCoupons.length > 0 ? (
                  <div className="flex flex-wrap gap-2">
                    {availableCoupons.map((c) => (
                      <button
                        key={c.code}
                        type="button"
                        onClick={() => setCouponCode(c.code)}
                        disabled={!!appliedCoupon}
                        className="group flex items-center gap-2 bg-white border border-emerald-300 hover:border-emerald-500 hover:bg-emerald-100 rounded-xl px-3 py-2 text-left transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                        title={c.description || ""}
                      >
                        <span className="font-mono font-extrabold text-xs text-emerald-700 tracking-wide">
                          {c.code}
                        </span>
                        <span className="text-[11px] font-semibold text-slate-500">
                          {c.discount_type === "percentage"
                            ? `-${Number(c.discount_value)}%`
                            : `-Rp${Number(c.discount_value).toLocaleString('id-ID')}`}
                        </span>
                      </button>
                    ))}
                  </div>
                ) : (
                  <p className="text-xs text-slate-500">
                    Belum ada kupon promo aktif saat ini. Kalau kamu punya kode kupon, masukkan langsung di kotak di bawah.
                  </p>
                )}
              </div>

              {/* Kupon Diskon */}
              <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-2.5">
                <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                  <Ticket size={15} className="text-[#007570]" />
                  <span>Kupon Diskon (Opsional)</span>
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="Masukkan kode kupon..."
                    value={couponCode}
                    onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                    disabled={!!appliedCoupon}
                    className="flex-1 px-3.5 py-2.5 text-xs uppercase font-mono font-bold tracking-wider border border-slate-200 rounded-xl bg-white focus:outline-none focus:border-[#007570]"
                  />
                  {appliedCoupon ? (
                    <button
                      type="button"
                      onClick={() => {
                        setAppliedCoupon(null);
                        setCouponCode("");
                      }}
                      className="px-4 py-2.5 text-xs font-bold text-red-600 bg-red-50 hover:bg-red-100 rounded-xl transition-colors cursor-pointer"
                    >
                      Hapus
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={handleApplyCoupon}
                      disabled={couponLoading || !couponCode.trim()}
                      className="px-5 py-2.5 text-xs font-bold bg-[#007570] text-white rounded-xl hover:bg-[#005f5b] disabled:opacity-50 transition-colors cursor-pointer"
                    >
                      {couponLoading ? <Loader2 size={14} className="animate-spin" /> : "Gunakan"}
                    </button>
                  )}
                </div>
                {couponError && (
                  <p className="text-[11px] text-red-600 font-medium">{couponError}</p>
                )}
                {appliedCoupon && (
                  <div className="flex items-center justify-between text-xs text-emerald-700 font-bold bg-emerald-50 p-2.5 rounded-xl border border-emerald-200">
                    <span className="flex items-center gap-1.5">
                      <Check size={14} /> Kupon <strong>{appliedCoupon.code}</strong> diterapkan
                    </span>
                    <span>-Rp {couponDiscount.toLocaleString("id-ID")}</span>
                  </div>
                )}

                {!appliedCoupon && availableCoupons.length > 0 && (
                  <div className="pt-2 border-t border-slate-100">
                    <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block mb-1.5">
                      🔥 Rekomendasi Kupon Diskon (Klik untuk gunakan):
                    </span>
                    <div className="flex flex-wrap gap-1.5">
                      {availableCoupons.map((c) => (
                        <button
                          key={c.code}
                          type="button"
                          onClick={() => handleApplyCoupon(c.code)}
                          className="px-2 py-1 bg-teal-50 hover:bg-teal-100 border border-teal-200 text-[#007570] rounded-lg text-[11px] font-bold transition-all cursor-pointer flex items-center gap-1"
                        >
                          <Tag size={11} />
                          <span>{c.code}</span>
                          <span className="text-[9px] text-teal-800 bg-teal-200/60 px-1 rounded">
                            {c.discount_type === "percentage" ? `${c.discount_value}%` : `-Rp ${Number(c.discount_value).toLocaleString("id-ID")}`}
                          </span>
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Ringkasan Total Tagihan */}
              <div className="p-4 bg-white rounded-2xl border-2 border-teal-500/30 flex items-center justify-between shadow-xs">
                <div>
                  <span className="text-xs text-slate-500 font-semibold block">Total Pembayaran:</span>
                  {couponDiscount > 0 && (
                    <span className="text-[11px] text-slate-400 line-through">
                      Rp {basePrice.toLocaleString("id-ID")}
                    </span>
                  )}
                </div>
                <span className="text-xl font-black text-[#007570]">
                  Rp {finalPrice.toLocaleString("id-ID")}
                </span>
              </div>

              {/* Payment Section */}
              {finalPrice > 0 ? (
                <div className="space-y-4">
                  {/* Integrated Live Payment Method Selector synchronized with Kelola Pembayaran */}
                  <PaymentMethodSelector
                    selectedMethod={paymentMethod}
                    onSelect={(method) => setPaymentMethod(method.id || method.name)}
                  />

                  {/* Upload Bukti */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-700 block">
                      Unggah Bukti Transfer <span className="text-red-500">*</span>
                    </label>
                    <div className="relative border-2 border-dashed border-slate-300 hover:border-[#007570] rounded-2xl p-4 text-center cursor-pointer transition-colors bg-slate-50/50 hover:bg-teal-50/30">
                      <input
                        type="file"
                        accept="image/jpeg,image/png,image/jpg,image/webp,application/pdf"
                        onChange={handleFileChange}
                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                      />
                      {proofPreview ? (
                        <div className="space-y-2">
                          <img
                            src={proofPreview}
                            alt="Bukti Transfer Preview"
                            className="max-h-28 mx-auto rounded-xl object-contain shadow-sm border border-slate-200 bg-white"
                          />
                          <p className="text-xs text-emerald-600 font-bold flex items-center justify-center gap-1">
                            <Check size={14} /> Bukti dipilih: {proofFile?.name}
                          </p>
                          <span className="text-[11px] text-[#007570] font-semibold underline">Klik untuk ganti file</span>
                        </div>
                      ) : (
                        <div className="space-y-1 py-1">
                          <Upload size={22} className="mx-auto text-slate-400" />
                          <p className="text-xs font-bold text-slate-700">
                            Pilih atau seret foto bukti transfer ke sini
                          </p>
                          <p className="text-[11px] text-slate-400">
                            Format: JPG, PNG, WEBP (Maks. 5MB)
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ) : (
                <div className="p-3.5 bg-emerald-50 border border-emerald-200 rounded-2xl text-xs text-emerald-800 font-semibold flex items-center gap-2">
                  <Sparkles size={16} className="text-emerald-600 shrink-0" />
                  <span>Total pembayaran Rp 0 (Gratis berkat kupon). Konten akan langsung dipublikasikan!</span>
                </div>
              )}

              {/* Action Buttons */}
              <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2.5">
                <button
                  type="button"
                  onClick={onClose}
                  disabled={submitting}
                  className="px-4 py-2.5 rounded-xl border border-slate-200 text-xs font-bold text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-6 py-2.5 bg-[#007570] hover:bg-[#005f5b] text-white text-xs font-bold rounded-xl shadow-lg shadow-teal-700/20 disabled:opacity-50 flex items-center gap-2 transition-all cursor-pointer"
                >
                  {submitting ? (
                    <>
                      <Loader2 size={15} className="animate-spin" />
                      <span>Memproses...</span>
                    </>
                  ) : (
                    <span>{finalPrice > 0 ? "Konfirmasi & Kirim Bukti" : "Publikasikan Sekarang"}</span>
                  )}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
