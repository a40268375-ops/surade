import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import api from "../utils/api";
import Navbar from "../components/Navbar";
import PaymentMethodSelector from "../components/PaymentMethodSelector";
import { Check, X, Crown, ArrowLeft, ArrowRight, Upload, Copy } from "lucide-react";
import "./Pricing.css";

const FEATURES_COMPARISON = [
  { name: "Lamanya : Tidak ada batas hari", free: false, premium: true },
  { name: "Peta", free: false, premium: true },
  { name: "Kontak", free: false, premium: true },
  { name: "Galeri Foto", free: false, premium: true },
  { name: "Video", free: false, premium: true },
  { name: "Slogan", free: false, premium: true },
  { name: "Alamat", free: false, premium: true },
  { name: "Website", free: false, premium: true },
  { name: "Tautan Sosial Media", free: false, premium: true },
  { name: "FAQ", free: false, premium: true },
  { name: "Rentang Harga", free: false, premium: true },
  { name: "Tag/Kata Kunci", free: false, premium: true },
  { name: "Jam Operasional", free: false, premium: true },
  { name: "Pengumuman", free: false, premium: true },
  { name: "Penawaran & Diskon", free: false, premium: true },
  { name: "Sembunyikan Iklan pesaing", free: false, premium: true },
  { name: "Event", free: false, premium: true },
];

// PERBAIKAN: sebelumnya harga & metode pembayaran di halaman ini cuma
// tulisan "Rp0 / Donasi Sukarela" yang dikarang di frontend - tidak
// nyambung sama sekali dengan backend (SubscriptionController) yang
// sebenarnya WAJIB ada payment_method (dana/bni/bca) + bukti transfer
// (file gambar), dan punya harga asli per paket. Submit form yang lama
// SELALU gagal validasi 422 karena 2 field wajib itu tidak pernah dikirim.
// Sekarang halaman ini fetch harga asli dari backend dan minta metode +
// bukti bayar seperti yang backend butuhkan.
const PAYMENT_METHODS = [
  { id: "bca", label: "Transfer BCA", account: "0954152045 a.n. Triwala Mitra Bestari" },
  { id: "bni", label: "Transfer BNI", account: "0973607008 a.n. Triwala Mitra Bestari" },
  { id: "mandiri", label: "Transfer Mandiri", account: "133-0011-409-331 a.n. Triwala Mitra Bestari" },
  { id: "dana", label: "DANA", account: "xxxx a.n. xxxx" },
];

function formatRupiah(amount) {
  return "Rp " + Number(amount || 0).toLocaleString("id-ID");
}

export default function Pricing() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [loading, setLoading] = useState(false);
  // PERBAIKAN: perbandingan Free vs BISNIS TERVERIFIKASI sekarang sudah ditampilkan
  // langsung di tab BISNIS TERVERIFIKASI Dashboard, jadi kalau user datang dari sana
  // (sudah lihat perbandingannya), halaman ini boleh langsung mulai dari
  // step 2 (isi data) lewat parameter ?step=2 di URL.
  const initialStep = Number(searchParams.get("step")) === 2 ? 2 : 1;
  const [currentStep, setCurrentStep] = useState(initialStep);
  const [business, setBusiness] = useState(null);
  const [plans, setPlans] = useState(null);
  const [myBusinesses, setMyBusinesses] = useState([]);
  const [selectedBusinessId, setSelectedBusinessId] = useState("");

  const [formData, setFormData] = useState({
    plan: "monthly",
    notes: "",
    paymentMethod: "dana",
    proof: null,
  });
  const [proofPreview, setProofPreview] = useState(null);
  const [formError, setFormError] = useState("");

  // Payment Modal States
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState("");

  const businessId = searchParams.get("business");

  useEffect(() => {
    if (businessId) {
      setSelectedBusinessId(businessId);
      fetchBusinessDetails(businessId);
    }
    fetchPlans();
    fetchMyBusinesses();
  }, [businessId]);

  const fetchMyBusinesses = async () => {
    try {
      const response = await api.get("/my-businesses");
      setMyBusinesses((response || []).filter((b) => !b.is_premium_active));
    } catch (err) {
      console.error("Failed to fetch my businesses:", err);
    }
  };

  const fetchBusinessDetails = async (id) => {
    try {
      const response = await api.get(`/businesses/${id}`);
      setBusiness(response);
    } catch (err) {
      console.error("Failed to fetch business:", err);
    }
  };

  // Harga & durasi asli diambil dari backend (bukan dikarang di sini) supaya
  // kalau harga berubah di server, halaman ini otomatis ikut berubah.
  const fetchPlans = async () => {
    try {
      const response = await api.get("/subscription-plans");
      setPlans(response);
    } catch (err) {
      console.error("Failed to fetch plans:", err);
    }
  };

  const handlePlanSelect = (plan) => {
    if (plan === "free") {
      alert("Paket Free dipilih. Tidak ada perubahan pada bisnis Anda.");
      navigate("/dashboard?tab=premium");
    } else {
      setCurrentStep(2);
    }
  };

  const handleFormSubmit = (e) => {
    e.preventDefault();
    if (!selectedBusinessId) {
      setFormError("Pilih dulu bisnis mana yang mau di-upgrade.");
      return;
    }
    setFormError("");
    setCurrentStep(3);
  };

  const handleSelectBusiness = (id) => {
    setSelectedBusinessId(id);
    const found = myBusinesses.find((b) => String(b.id) === String(id));
    if (found) setBusiness(found);
  };

  const handleProofChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setFormData((f) => ({ ...f, proof: file }));
    setProofPreview(URL.createObjectURL(file));
  };

  const handlePaymentSubmit = async () => {
    if (!selectedBusinessId) {
      alert("Data bisnis tidak ditemukan");
      return;
    }
    if (!formData.proof) {
      setFormError("Unggah bukti transfer dulu ya, sebelum mengaktifkan.");
      return;
    }
    setFormError("");
    setLoading(true);
    try {
      const payload = new FormData();
      payload.append("business_id", selectedBusinessId);
      payload.append("plan", formData.plan);
      payload.append("payment_method", formData.paymentMethod);
      payload.append("proof", formData.proof);
      if (formData.notes) payload.append("notes", formData.notes);

      await api.post("/subscriptions", payload);

      alert(
        "Bukti pembayaran berhasil dikirim! BISNIS TERVERIFIKASI akan aktif otomatis setelah admin memverifikasi pembayaran Anda (biasanya 1x24 jam)."
      );
      navigate("/dashboard?tab=premium");
    } catch (err) {
      console.error("Subscription error:", err);
      const msg = err?.data?.errors
        ? Object.values(err.data.errors).flat().join(" ")
        : err?.data?.message || "Gagal memproses upgrade. Silakan coba lagi.";
      setFormError(msg);
    } finally {
      setLoading(false);
    }
  };

  // Payment Modal Handlers
  const handleSelectPaymentMethod = (methodId, methodName) => {
    setSelectedPaymentMethod(methodName);
    setFormData(f => ({ ...f, paymentMethod: methodId }));
    setShowPaymentModal(false);
  };

  const handleFinalSubmit = async () => {
    if (!selectedPaymentMethod) {
      alert("Silakan pilih metode pembayaran terlebih dahulu");
      return;
    }
    
    setLoading(true);
    try {
      const submissionData = new FormData();
      submissionData.append("business_id", selectedBusinessId);
      submissionData.append("plan", formData.plan);
      submissionData.append("payment_method", formData.paymentMethod);
      submissionData.append("notes", formData.notes);
      if (formData.proof) {
        submissionData.append("payment_proof", formData.proof);
      }

      await api.post("/subscriptions", submissionData);
      navigate("/dashboard?tab=premium", { 
        state: { message: "Pengajuan berlangganan berhasil dikirim! Menunggu verifikasi admin." } 
      });
    } catch (err) {
      console.error("Subscription submission failed:", err);
      const apiMsg = err?.data?.errors 
        ? Object.values(err.data.errors).flat().join(" ")
        : err?.data?.message;
      setFormError(apiMsg || "Gagal mengirim pengajuan berlangganan. Coba lagi.");
    } finally {
      setLoading(false);
    }
  };

  const selectedPlanInfo = plans?.[formData.plan];

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="pricing-step pricing-step--packages">
            <h2 className="pricing-step__title">Pilih Paket Langganan</h2>
            <div className="pricing-grid">
              <div className="pricing-card pricing-card--free">
                <div className="pricing-card__header">
                  <span className="pricing-card__badge">FREE</span>
                  <h2 className="pricing-card__title">Free</h2>
                  <p className="pricing-card__subtitle">Per Bisnis</p>
                </div>
                <div className="pricing-card__features">
                  {FEATURES_COMPARISON.map((feature, idx) => (
                    <div key={idx} className="pricing-feature">
                      <div
                        className={`pricing-feature__icon ${
                          feature.free ? "pricing-feature__icon--available" : "pricing-feature__icon--unavailable"
                        }`}
                      >
                        {feature.free ? <Check size={16} /> : <X size={16} />}
                      </div>
                      <span className={`pricing-feature__text ${feature.free ? "" : "pricing-feature__text--unavailable"}`}>
                        {feature.name}
                      </span>
                    </div>
                  ))}
                </div>
                <button className="pricing-card__button pricing-card__button--free" onClick={() => handlePlanSelect("free")}>
                  PILIH FREE
                </button>
              </div>

              <div className="pricing-card pricing-card--premium">
                <div className="pricing-card__hot-badge">HOT</div>
                <div className="pricing-card__header">
                  <span className="pricing-card__badge pricing-card__badge--premium">BISNIS TERVERIFIKASI</span>
                  <h2 className="pricing-card__title">{plans ? formatRupiah(plans.monthly.amount) : "..."}</h2>
                  <p className="pricing-card__subtitle">Mulai dari / Bulan</p>
                </div>
                <div className="pricing-card__features">
                  {FEATURES_COMPARISON.map((feature, idx) => (
                    <div key={idx} className="pricing-feature">
                      <div
                        className={`pricing-feature__icon ${
                          feature.premium ? "pricing-feature__icon--available" : "pricing-feature__icon--unavailable"
                        }`}
                      >
                        {feature.premium ? <Check size={16} /> : <X size={16} />}
                      </div>
                      <span className={`pricing-feature__text ${feature.premium ? "" : "pricing-feature__text--unavailable"}`}>
                        {feature.name}
                      </span>
                    </div>
                  ))}
                </div>
                <button className="pricing-card__button pricing-card__button--premium" onClick={() => handlePlanSelect("premium")}>
                  PILIH BISNIS TERVERIFIKASI
                </button>
              </div>
            </div>
          </div>
        );

      case 2:
        return (
          <div className="pricing-step pricing-step--form">
            <h2 className="pricing-step__title">Pilih Paket Berlangganan</h2>
            <div className="pricing-form-container">
              <div className="pricing-form-card">
                <div className="pricing-form-header">
                  <h3>{business ? `Upgrade ${business.title} ke BISNIS TERVERIFIKASI` : "Upgrade Bisnis ke BISNIS TERVERIFIKASI"}</h3>
                  <p>Pilih bisnis dan durasi berlangganan sesuai kebutuhan Anda</p>
                </div>

                <form onSubmit={handleFormSubmit} className="pricing-form">
                  <div className="pricing-form-group">
                    <label>Pilih Bisnis</label>
                    <select
                      value={selectedBusinessId}
                      onChange={(e) => handleSelectBusiness(e.target.value)}
                      required
                    >
                      <option value="">-- Pilih bisnis yang mau di-upgrade --</option>
                      {myBusinesses.map((b) => (
                        <option key={b.id} value={b.id}>
                          {b.title}
                        </option>
                      ))}
                    </select>
                    {myBusinesses.length === 0 && (
                      <p className="pricing-form-hint">
                        Semua bisnis Anda sudah BISNIS TERVERIFIKASI, atau Anda belum punya bisnis Free.
                      </p>
                    )}
                  </div>

                  <div className="pricing-plan-options">
                    {plans &&
                      Object.entries(plans).map(([key, p]) => (
                        <label
                          key={key}
                          className={`pricing-plan-option ${formData.plan === key ? "pricing-plan-option--active" : ""}`}
                        >
                          <input
                            type="radio"
                            name="plan"
                            value={key}
                            checked={formData.plan === key}
                            onChange={() => setFormData({ ...formData, plan: key })}
                          />
                          <span className="pricing-plan-option__label">{p.label}</span>
                          <span className="pricing-plan-option__price">{formatRupiah(p.amount)}</span>
                        </label>
                      ))}
                    {!plans && <p>Memuat pilihan paket...</p>}
                  </div>

                  <div className="pricing-form-group">
                    <label>Catatan Tambahan (Opsional)</label>
                    <textarea
                      rows={3}
                      value={formData.notes}
                      onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                      placeholder="Tulis catatan atau pesan khusus..."
                    />
                  </div>

                  {formError && <p className="pricing-form-error">{formError}</p>}

                  <div className="pricing-form-actions">
                    <button type="button" className="pricing-btn pricing-btn--secondary" onClick={() => setCurrentStep(1)}>
                      <ArrowLeft size={16} />
                      Kembali
                    </button>
                    <button type="submit" className="pricing-btn pricing-btn--primary">
                      Lanjut ke Pembayaran
                      <ArrowRight size={16} />
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        );

      case 3: {
        const selectedPlanInfo = plans?.[formData.plan];
        return (
          <div className="pricing-step pricing-step--payment">
            <h2 className="pricing-step__title">Konfirmasi & Pembayaran</h2>
            <div className="pricing-payment-container">
              <div className="pricing-payment-card">
                <div className="pricing-payment-summary">
                  <h3>Ringkasan Pesanan</h3>
                  <div className="pricing-summary-item">
                    <span>Bisnis:</span>
                    <strong>{business?.title}</strong>
                  </div>
                  <div className="pricing-summary-item">
                    <span>Paket:</span>
                    <strong>{selectedPlanInfo?.label}</strong>
                  </div>
                  <div className="pricing-summary-item">
                    <span>Total Biaya:</span>
                    <strong className="pricing-total">{formatRupiah(selectedPlanInfo?.amount)}</strong>
                  </div>
                  {formData.notes && (
                    <div className="pricing-summary-notes">
                      <span>Catatan:</span>
                      <p>{formData.notes}</p>
                    </div>
                  )}
                </div>

                <div className="pricing-payment-action">
                  <button 
                    type="button" 
                    className="pricing-btn pricing-btn--primary pricing-btn--large"
                    onClick={() => setShowPaymentModal(true)}
                  >
                    Pilih Metode Pembayaran
                  </button>
                  
                  {selectedPaymentMethod && (
                    <div className="selected-payment-info">
                      <p>Metode yang dipilih: <strong>{selectedPaymentMethod}</strong></p>
                      <button 
                        type="button" 
                        className="pricing-btn pricing-btn--secondary"
                        onClick={() => setShowPaymentModal(true)}
                      >
                        Ganti Metode
                      </button>
                    </div>
                  )}
                </div>

                <div className="pricing-form-actions">
                  <button type="button" className="pricing-btn pricing-btn--secondary" onClick={() => setCurrentStep(2)}>
                    <ArrowLeft size={16} />
                    Kembali
                  </button>
                  {selectedPaymentMethod && (
                    <button type="button" className="pricing-btn pricing-btn--primary" onClick={handleFinalSubmit}>
                      Konfirmasi Pembayaran
                      <ArrowRight size={16} />
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        );
      }

      default:
        return null;
    }
  };

  return (
    <div className="pricing-page">
      <Navbar />

      <section className="pricing-hero">
        <div className="pricing-hero__content">
          <button className="pricing-back-btn" onClick={() => navigate("/dashboard?tab=premium")}>
            <ArrowLeft size={16} />
            <span>Kembali ke Dashboard</span>
          </button>

          <div className="pricing-steps-indicator">
            <div className={`pricing-step-dot ${currentStep >= 1 ? "active" : ""}`}>1</div>
            <div className="pricing-step-line"></div>
            <div className={`pricing-step-dot ${currentStep >= 2 ? "active" : ""}`}>2</div>
            <div className="pricing-step-line"></div>
            <div className={`pricing-step-dot ${currentStep >= 3 ? "active" : ""}`}>3</div>
          </div>

          <div className="pricing-steps-labels">
            <span className={currentStep === 1 ? "active" : ""}>Pilih Paket</span>
            <span className={currentStep === 2 ? "active" : ""}>Isi Data</span>
            <span className={currentStep === 3 ? "active" : ""}>Pembayaran</span>
          </div>
        </div>
      </section>

      <section className="pricing-content">
        <div className="pricing-content__inner">{renderStepContent()}</div>
      </section>

      {/* Payment Method Modal */}
      {showPaymentModal && (
        <div className="fixed inset-0 z-[9999] bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto" onClick={() => setShowPaymentModal(false)}>
          <div className="bg-white rounded-3xl max-w-2xl w-full shadow-2xl overflow-hidden border border-slate-100 p-6 space-y-4 my-auto" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h3 className="text-lg font-black text-slate-900">Pilih Metode Pembayaran</h3>
                <p className="text-xs text-slate-500">Silakan pilih saluran pembayaran resmi yang Anda inginkan</p>
              </div>
              <button onClick={() => setShowPaymentModal(false)} className="w-8 h-8 rounded-full bg-slate-100 text-slate-400 hover:text-slate-700 flex items-center justify-center cursor-pointer border-0">
                <X size={16} />
              </button>
            </div>

            <PaymentMethodSelector
              selectedMethod={formData.paymentMethod}
              onSelect={(m) => {
                handleSelectPaymentMethod(m.id || m.name, m.name);
                setShowPaymentModal(false);
              }}
            />
          </div>
        </div>
      )}
    </div>
  );
}
