import { useState } from "react";
import api from "../services/api";
import PaymentMethodSelector from "./PaymentMethodSelector";
import {
  X, Check, AlertCircle, ArrowLeft, Upload, Ticket, Share2,
  Building2, CreditCard, ShieldCheck, Loader2, Sparkles
} from "lucide-react";
import "./PackageSelectionModal.css";

export default function PackageCheckoutModal({
  isOpen,
  onClose,
  packageData,
  onSuccess,
  onBack,
}) {
  const [couponCode, setCouponCode] = useState("");
  const [couponLoading, setCouponLoading] = useState(false);
  const [appliedCoupon, setAppliedCoupon] = useState(null);
  const [couponError, setCouponError] = useState("");
  const [availableCoupons, setAvailableCoupons] = useState([]);

  useEffect(() => {
    api.get("/coupons/public-codes")
      .then((res) => {
        const data = res.data?.data || res.data || [];
        if (Array.isArray(data)) setAvailableCoupons(data);
      })
      .catch((err) => console.warn("PackageCheckoutModal: failed to fetch public coupons:", err));
  }, []);

  const [referralCode, setReferralCode] = useState("");
  const [referralLoading, setReferralLoading] = useState(false);
  const [appliedReferral, setAppliedReferral] = useState(null);
  const [referralError, setReferralError] = useState("");

  const [paymentMethod, setPaymentMethod] = useState("Transfer Bank BCA");
  const [proofFile, setProofFile] = useState(null);
  const [proofPreview, setProofPreview] = useState(null);
  const [notes, setNotes] = useState("");

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [successData, setSuccessData] = useState(null);

  if (!isOpen || !packageData) return null;

  const basePrice = Number(packageData.price || 0);

  // Discount calculation
  let couponDiscount = 0;
  if (appliedCoupon) {
    if (appliedCoupon.discount_type === "percentage") {
      couponDiscount = (basePrice * appliedCoupon.discount_value) / 100;
      if (appliedCoupon.maximum_discount) {
        couponDiscount = Math.min(couponDiscount, appliedCoupon.maximum_discount);
      }
    } else {
      couponDiscount = appliedCoupon.discount_value;
    }
    couponDiscount = Math.min(couponDiscount, basePrice);
  }

  let referralDiscount = 0;
  if (appliedReferral) {
    referralDiscount = Math.round(basePrice * 0.05);
  }

  const totalDiscount = Math.min(basePrice, couponDiscount + referralDiscount);
  const finalPrice = Math.max(0, basePrice - totalDiscount);

  // Handle Apply Coupon
  const handleApplyCoupon = async (targetCode = null) => {
    const codeToUse = (typeof targetCode === "string" && targetCode ? targetCode : couponCode).trim().toUpperCase();
    if (!codeToUse) return;
    setCouponCode(codeToUse);
    setCouponLoading(true);
    setCouponError("");
    try {
      // Validate via coupon API
      const res = await api.post("/coupons/validate", {
        code: codeToUse,
        product_type: packageData.type,
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

  // Handle Apply Referral
  const handleApplyReferral = async () => {
    if (!referralCode.trim()) return;
    setReferralLoading(true);
    setReferralError("");
    try {
      const refClean = referralCode.trim().toUpperCase();
      setAppliedReferral({ code: refClean, discount_percentage: 5 });
      setReferralError("");
    } catch (err) {
      setReferralError("Kode referral tidak valid.");
    } finally {
      setReferralLoading(false);
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (!file.type.startsWith("image/")) {
        setError("Bukti transfer harus berupa gambar (JPG, PNG, WebP).");
        return;
      }
      if (file.size > 10 * 1024 * 1024) {
        setError("Ukuran file maksimal 10MB.");
        return;
      }
      setProofFile(file);
      setProofPreview(URL.createObjectURL(file));
      setError("");
    }
  };

  const handleRemoveProof = () => {
    setProofFile(null);
    if (proofPreview) URL.revokeObjectURL(proofPreview);
    setProofPreview(null);
  };

  // Submit Purchase
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (finalPrice > 0 && !proofFile) {
      setError("Silakan unggah bukti transfer pembayaran terlebih dahulu.");
      return;
    }

    setSubmitting(true);

    try {
      const formData = new FormData();
      formData.append("package_id", packageData.id);
      if (appliedCoupon) formData.append("coupon_code", couponCode.trim().toUpperCase());
      if (appliedReferral) formData.append("referral_code", referralCode.trim().toUpperCase());
      formData.append("payment_method", paymentMethod);
      if (notes.trim()) formData.append("notes", notes.trim());
      if (proofFile) formData.append("proof", proofFile);

      const res = await api.post("/package-purchase", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      const resData = res.data;
      setSuccessData(resData);

      if (onSuccess) {
        onSuccess(resData);
      }
    } catch (err) {
      console.error("Purchase error:", err);
      setError(err.response?.data?.message || "Terjadi kesalahan saat memproses pembelian. Silakan coba lagi.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="pkg-modal-backdrop" onClick={onClose}>
      <div className="pkg-modal-card" style={{ maxWidth: "42rem" }} onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="pkg-modal-header">
          {onBack && !successData && (
            <button
              type="button"
              onClick={onBack}
              style={{
                position: "absolute",
                top: "1.25rem",
                left: "1.25rem",
                background: "rgba(255,255,255,0.15)",
                border: "none",
                color: "#ffffff",
                width: "2rem",
                height: "2rem",
                borderRadius: "9999px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                cursor: "pointer",
              }}
              aria-label="Kembali"
            >
              <ArrowLeft size={18} />
            </button>
          )}
          <button type="button" className="pkg-modal-close" onClick={onClose} aria-label="Tutup">
            <X size={18} />
          </button>
          <div style={{ marginLeft: onBack && !successData ? "2rem" : 0 }}>
            <h2 style={{ fontSize: "1.25rem", fontWeight: 800, margin: 0 }}>
              {successData ? "Pembayaran Berhasil Diajukan" : "Checkout Pembelian Paket"}
            </h2>
            <p style={{ fontSize: "0.8125rem", opacity: 0.9, marginTop: "0.25rem", marginBottom: 0 }}>
              {successData ? "Konfirmasi pesanan dan aktivasi paket" : "Selesaikan pembayaran untuk mengaktifkan kuota posting Anda"}
            </p>
          </div>
        </div>

        {/* Body */}
        <div className="pkg-modal-body">
          {successData ? (
            /* ── Success Screen ── */
            <div style={{ textAlign: "center", padding: "1.5rem 0.5rem" }}>
              <div style={{
                width: "4rem",
                height: "4rem",
                background: "#dcfce7",
                color: "#16a34a",
                borderRadius: "9999px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                margin: "0 auto 1.25rem",
              }}>
                <Check size={36} strokeWidth={2.5} />
              </div>
              <h3 style={{ fontSize: "1.25rem", fontWeight: 700, color: "#0f172a", marginBottom: "0.5rem" }}>
                Pengajuan Pembelian Berhasil!
              </h3>
              <p style={{ fontSize: "0.875rem", color: "#64748b", maxWidth: "28rem", margin: "0 auto 1.5rem", lineHeight: 1.5 }}>
                {successData.message || "Bukti pembayaran telah kami terima. Admin kami akan segera memverifikasi transaksi Anda."}
              </p>

              <div style={{
                background: "#f8fafc",
                border: "1px solid #e2e8f0",
                borderRadius: "0.75rem",
                padding: "1rem 1.25rem",
                textAlign: "left",
                marginBottom: "1.5rem",
                display: "flex",
                flexDirection: "column",
                gap: "0.5rem",
              }}>
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.8125rem" }}>
                  <span style={{ color: "#64748b" }}>Kode Transaksi:</span>
                  <strong style={{ color: "#0b4f8a" }}>{successData.transaction?.transaction_code || "-"}</strong>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.8125rem" }}>
                  <span style={{ color: "#64748b" }}>Paket:</span>
                  <strong>{packageData.name} ({packageData.type?.toUpperCase()})</strong>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.8125rem" }}>
                  <span style={{ color: "#64748b" }}>Total Bayar:</span>
                  <strong>Rp {finalPrice.toLocaleString("id-ID")}</strong>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.8125rem" }}>
                  <span style={{ color: "#64748b" }}>Status:</span>
                  <span style={{
                    background: successData.transaction?.payment_status === "paid" ? "#dcfce7" : "#fef3c7",
                    color: successData.transaction?.payment_status === "paid" ? "#16a34a" : "#d97706",
                    padding: "0.125rem 0.5rem",
                    borderRadius: "0.25rem",
                    fontWeight: 600,
                    textTransform: "capitalize",
                  }}>
                    {successData.transaction?.payment_status === "paid" ? "Aktif" : "Menunggu Verifikasi"}
                  </span>
                </div>
              </div>

              <button
                type="button"
                className="pkg-btn-buy"
                onClick={onClose}
                style={{ maxWidth: "20rem", margin: "0 auto" }}
              >
                Selesai &amp; Mulai Posting
              </button>
            </div>
          ) : (
            /* ── Checkout Form ── */
            <form onSubmit={handleSubmit}>
              {/* Package Summary Card */}
              <div style={{
                background: "linear-gradient(135deg, #f8fafc 0%, #eff6ff 100%)",
                border: "1px solid #dbeafe",
                borderRadius: "0.75rem",
                padding: "1rem 1.25rem",
                marginBottom: "1.25rem",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                gap: "1rem",
              }}>
                <div>
                  <span style={{ fontSize: "0.75rem", fontWeight: 700, textTransform: "uppercase", color: "#2563eb" }}>
                    {packageData.type === "event" ? "Paket Event" : "Paket Blog"}
                  </span>
                  <h4 style={{ margin: "0.125rem 0 0", fontSize: "1.125rem", fontWeight: 700, color: "#0f172a" }}>
                    {packageData.name}
                  </h4>
                  <p style={{ margin: "0.25rem 0 0", fontSize: "0.8125rem", color: "#64748b" }}>
                    Kuota {packageData.post_limit} {packageData.type === "event" ? "Event" : "Blog"} • Masa Aktif {packageData.duration_days} Hari
                  </p>
                </div>
                <div style={{ textAlign: "right" }}>
                  <span style={{ fontSize: "1.25rem", fontWeight: 800, color: "#0b4f8a" }}>
                    Rp {basePrice.toLocaleString("id-ID")}
                  </span>
                </div>
              </div>

              {/* Coupon & Referral Section */}
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: "0.75rem", marginBottom: "1.25rem" }}>
                {/* Coupon */}
                <div>
                  <label style={{ display: "block", fontSize: "0.75rem", fontWeight: 600, color: "#475569", marginBottom: "0.35rem" }}>
                    Kode Kupon Diskon
                  </label>
                  <div style={{ display: "flex", gap: "0.35rem" }}>
                    <input
                      type="text"
                      placeholder="Contoh: PROMOBLOG"
                      value={couponCode}
                      onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                      style={{
                        flex: 1,
                        padding: "0.5rem 0.75rem",
                        fontSize: "0.8125rem",
                        border: "1px solid #cbd5e1",
                        borderRadius: "0.5rem",
                        textTransform: "uppercase",
                      }}
                      disabled={!!appliedCoupon}
                    />
                    {appliedCoupon ? (
                      <button
                        type="button"
                        onClick={() => { setAppliedCoupon(null); setCouponCode(""); }}
                        style={{
                          padding: "0.5rem 0.75rem",
                          fontSize: "0.75rem",
                          background: "#fee2e2",
                          color: "#dc2626",
                          border: "none",
                          borderRadius: "0.5rem",
                          fontWeight: 600,
                          cursor: "pointer",
                        }}
                      >
                        Hapus
                      </button>
                    ) : (
                      <button
                        type="button"
                        onClick={handleApplyCoupon}
                        disabled={couponLoading || !couponCode.trim()}
                        style={{
                          padding: "0.5rem 0.75rem",
                          fontSize: "0.75rem",
                          background: "#0b4f8a",
                          color: "#ffffff",
                          border: "none",
                          borderRadius: "0.5rem",
                          fontWeight: 600,
                          cursor: "pointer",
                        }}
                      >
                        {couponLoading ? "..." : "Terapkan"}
                      </button>
                    )}
                  </div>
                  {appliedCoupon && (
                    <span style={{ fontSize: "0.75rem", color: "#16a34a", marginTop: "0.25rem", display: "block", fontWeight: 600 }}>
                      ✓ Kupon aktif: Diskon Rp {couponDiscount.toLocaleString("id-ID")}
                    </span>
                  )}
                  {couponError && (
                    <span style={{ fontSize: "0.75rem", color: "#dc2626", marginTop: "0.25rem", display: "block" }}>
                      {couponError}
                    </span>
                  )}
                  {!appliedCoupon && availableCoupons.length > 0 && (
                    <div style={{ marginTop: "0.5rem", paddingTop: "0.5rem", borderTop: "1px solid #f1f5f9" }}>
                      <span style={{ fontSize: "0.6875rem", fontWeight: 700, color: "#64748b", textTransform: "uppercase", display: "block", marginBottom: "0.35rem" }}>
                        🔥 Rekomendasi Kupon Diskon (Klik):
                      </span>
                      <div style={{ display: "flex", flexWrap: "wrap", gap: "0.35rem" }}>
                        {availableCoupons.map((c) => (
                          <button
                            key={c.code}
                            type="button"
                            onClick={() => handleApplyCoupon(c.code)}
                            style={{
                              padding: "0.25rem 0.5rem",
                              background: "#f0fdf4",
                              border: "1px solid #bbf7d0",
                              color: "#15803d",
                              borderRadius: "0.375rem",
                              fontSize: "0.75rem",
                              fontWeight: 700,
                              cursor: "pointer",
                              display: "flex",
                              alignItems: "center",
                              gap: "0.25rem",
                            }}
                          >
                            <Ticket size={12} />
                            <span>{c.code}</span>
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {/* Referral */}
                <div>
                  <label style={{ display: "block", fontSize: "0.75rem", fontWeight: 600, color: "#475569", marginBottom: "0.35rem" }}>
                    Kode Referral (Diskon Rp 5.000)
                  </label>
                  <div style={{ display: "flex", gap: "0.35rem" }}>
                    <input
                      type="text"
                      placeholder="Contoh: INFO-REF-XXXX"
                      value={referralCode}
                      onChange={(e) => setReferralCode(e.target.value.toUpperCase())}
                      style={{
                        flex: 1,
                        padding: "0.5rem 0.75rem",
                        fontSize: "0.8125rem",
                        border: "1px solid #cbd5e1",
                        borderRadius: "0.5rem",
                        textTransform: "uppercase",
                      }}
                      disabled={!!appliedReferral}
                    />
                    {appliedReferral ? (
                      <button
                        type="button"
                        onClick={() => { setAppliedReferral(null); setReferralCode(""); }}
                        style={{
                          padding: "0.5rem 0.75rem",
                          fontSize: "0.75rem",
                          background: "#fee2e2",
                          color: "#dc2626",
                          border: "none",
                          borderRadius: "0.5rem",
                          fontWeight: 600,
                          cursor: "pointer",
                        }}
                      >
                        Hapus
                      </button>
                    ) : (
                      <button
                        type="button"
                        onClick={handleApplyReferral}
                        disabled={referralLoading || !referralCode.trim()}
                        style={{
                          padding: "0.5rem 0.75rem",
                          fontSize: "0.75rem",
                          background: "#0b4f8a",
                          color: "#ffffff",
                          border: "none",
                          borderRadius: "0.5rem",
                          fontWeight: 600,
                          cursor: "pointer",
                        }}
                      >
                        {referralLoading ? "..." : "Terapkan"}
                      </button>
                    )}
                  </div>
                  {appliedReferral && (
                    <span style={{ fontSize: "0.75rem", color: "#16a34a", marginTop: "0.25rem", display: "block", fontWeight: 600 }}>
                      ✓ Referral aktif: Diskon Rp {referralDiscount.toLocaleString("id-ID")}
                    </span>
                  )}
                  {referralError && (
                    <span style={{ fontSize: "0.75rem", color: "#dc2626", marginTop: "0.25rem", display: "block" }}>
                      {referralError}
                    </span>
                  )}
                </div>
              </div>

              {/* Payment Method Selector (Synchronized with Kelola Pembayaran) */}
              <div style={{ marginBottom: "1.25rem" }}>
                <PaymentMethodSelector
                  selectedMethod={paymentMethod}
                  onSelect={(method) => setPaymentMethod(method.id || method.name)}
                />
              </div>

                <div>
                  <label style={{ display: "block", fontSize: "0.8125rem", fontWeight: 600, color: "#334155", marginBottom: "0.35rem" }}>
                    Bukti Transfer <span style={{ color: "#dc2626" }}>*</span>
                  </label>
                  {!proofPreview ? (
                    <label style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      gap: "0.5rem",
                      padding: "0.625rem 0.75rem",
                      border: "1px dashed #0b4f8a",
                      borderRadius: "0.5rem",
                      background: "#f0fdf4",
                      color: "#0b4f8a",
                      fontSize: "0.8125rem",
                      fontWeight: 600,
                      cursor: "pointer",
                    }}>
                      <Upload size={16} />
                      <span>Upload Bukti Pembayaran</span>
                      <input type="file" accept="image/*" onChange={handleFileChange} style={{ display: "none" }} />
                    </label>
                  ) : (
                    <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                      <img
                        src={proofPreview}
                        alt="Bukti Transfer"
                        style={{ width: "2.5rem", height: "2.5rem", objectFit: "cover", borderRadius: "0.375rem", border: "1px solid #cbd5e1" }}
                      />
                      <span style={{ fontSize: "0.75rem", color: "#16a34a", fontWeight: 600, flex: 1, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                        {proofFile?.name || "Bukti terunggah"}
                      </span>
                      <button
                        type="button"
                        onClick={handleRemoveProof}
                        style={{
                          background: "#fee2e2",
                          color: "#dc2626",
                          border: "none",
                          padding: "0.25rem 0.5rem",
                          borderRadius: "0.375rem",
                          fontSize: "0.75rem",
                          cursor: "pointer",
                        }}
                      >
                        Ganti
                      </button>
                    </div>
                  )}
                </div>

              {/* Price Breakdown */}
              <div style={{
                background: "#f8fafc",
                border: "1px solid #e2e8f0",
                borderRadius: "0.75rem",
                padding: "0.875rem 1rem",
                marginBottom: "1.25rem",
                display: "flex",
                flexDirection: "column",
                gap: "0.375rem",
              }}>
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.8125rem", color: "#64748b" }}>
                  <span>Harga Paket:</span>
                  <span>Rp {basePrice.toLocaleString("id-ID")}</span>
                </div>
                {couponDiscount > 0 && (
                  <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.8125rem", color: "#16a34a" }}>
                    <span>Diskon Kupon:</span>
                    <span>- Rp {couponDiscount.toLocaleString("id-ID")}</span>
                  </div>
                )}
                {referralDiscount > 0 && (
                  <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.8125rem", color: "#16a34a" }}>
                    <span>Diskon Referral (Rp 5.000):</span>
                    <span>- Rp {referralDiscount.toLocaleString("id-ID")}</span>
                  </div>
                )}
                <div style={{
                  display: "flex",
                  justifyContent: "space-between",
                  fontSize: "1rem",
                  fontWeight: 800,
                  color: "#0f172a",
                  paddingTop: "0.375rem",
                  borderTop: "1px dashed #cbd5e1",
                  marginTop: "0.25rem",
                }}>
                  <span>Total Pembayaran:</span>
                  <span style={{ color: "#0b4f8a" }}>Rp {finalPrice.toLocaleString("id-ID")}</span>
                </div>
              </div>

              {/* Error Notification */}
              {error && (
                <div style={{
                  background: "#fee2e2",
                  border: "1px solid #fca5a5",
                  borderRadius: "0.5rem",
                  padding: "0.625rem 0.75rem",
                  marginBottom: "1rem",
                  display: "flex",
                  alignItems: "center",
                  gap: "0.5rem",
                  color: "#b91c1c",
                  fontSize: "0.8125rem",
                }}>
                  <AlertCircle size={16} />
                  <span>{error}</span>
                </div>
              )}

              {/* Submit Button */}
              <button
                type="submit"
                className="pkg-btn-buy"
                disabled={submitting}
                style={{ height: "2.875rem", fontSize: "1rem" }}
              >
                {submitting ? (
                  <>
                    <Loader2 size={18} className="animate-spin" />
                    <span>Memproses Pembelian...</span>
                  </>
                ) : (
                  <>
                    <ShieldCheck size={18} />
                    <span>Konfirmasi Pembayaran ({finalPrice > 0 ? `Rp ${finalPrice.toLocaleString("id-ID")}` : "Gratis"})</span>
                  </>
                )}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
