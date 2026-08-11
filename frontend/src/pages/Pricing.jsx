import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import api from "../utils/api";
import Navbar from "../components/Navbar";
import { Check, X, Crown, ArrowLeft, ArrowRight, Upload, Copy } from "lucide-react";
import "./Pricing.css";

// Payment Method Selector Component - Same as Dashboard
function PaymentMethodSelector({ onSelectMethod, selectedMethod, onClose, orderSummary, onConfirm }) {
  const [selectedCategory, setSelectedCategory] = useState("E-wallet");
  
  const paymentMethods = {
    "E-wallet": [
      { id: "dana", name: "DANA", icon: "💰", color: "#00B8D4" },
      { id: "unipin", name: "UniPin Credits (IDR)", icon: "🎮", color: "#9C27B0" },
      { id: "shopeepay", name: "ShopeePay", icon: "🛒", color: "#EE4D2D" },
      { id: "gopay", name: "GoPay", icon: "🏍️", color: "#00AA5B" },
      { id: "gopay_token", name: "GoPay Token", icon: "🎫", color: "#00AA5B" },
      { id: "qris", name: "QRIS", icon: "📱", color: "#2C3E50" },
      { id: "ovo", name: "OVO", icon: "💜", color: "#5D2D91" },
      { id: "linkaja", name: "LinkAja", icon: "🔗", color: "#DC143C" },
      { id: "isaku", name: "i.saku", icon: "💳", color: "#2196F3" },
      { id: "jenius", name: "Jenius Pay", icon: "💎", color: "#2196F3" },
      { id: "indodana", name: "indodana", icon: "💰", color: "#4CAF50" },
      { id: "sakuku", name: "Sakuku", icon: "💼", color: "#FF9800" },
      { id: "doku", name: "Doku Wallet", icon: "💰", color: "#4CAF50" }
    ],
    "Transfer Bank": [
      { id: "bca", name: "BCA", icon: "🏦", color: "#003D7A" },
      { id: "bni", name: "BNI", icon: "🏦", color: "#E67E22" },
      { id: "bri", name: "BRI", icon: "🏦", color: "#003F7F" },
      { id: "mandiri", name: "Mandiri", icon: "🏦", color: "#003D7A" },
      { id: "permata", name: "Permata", icon: "🏦", color: "#00A651" },
      { id: "danamon", name: "Danamon", icon: "🏦", color: "#0066CC" }
    ],
    "SMS & Seluler": [
      { id: "telkomsel", name: "Telkomsel", icon: "📱", color: "#E74C3C" },
      { id: "xl", name: "XL Axiata", icon: "📱", color: "#0066CC" },
      { id: "indosat", name: "Indosat Ooredoo", icon: "📱", color: "#FFCC00" },
      { id: "three", name: "3 (Tri)", icon: "📱", color: "#FF6B35" }
    ],
    "OTC non-Bank": [
      { id: "indomaret", name: "Indomaret", icon: "🏪", color: "#0066CC" },
      { id: "alfamart", name: "Alfamart", icon: "🏪", color: "#E74C3C" },
      { id: "pos", name: "Kantor Pos", icon: "📮", color: "#FF9800" }
    ],
    "Perbankan online": [
      { id: "bca_klikpay", name: "BCA KlikPay", icon: "💻", color: "#003D7A" },
      { id: "bca_klikbca", name: "BCA KlikBCA", icon: "💻", color: "#003D7A" },
      { id: "mandiri_clickpay", name: "Mandiri ClickPay", icon: "💻", color: "#003D7A" },
      { id: "cimb_clicks", name: "CIMB Clicks", icon: "💻", color: "#D32F2F" }
    ],
    "Kartu Debit / Kredit": [
      { id: "visa", name: "Visa", icon: "💳", color: "#1A1F71" },
      { id: "mastercard", name: "Mastercard", icon: "💳", color: "#EB001B" },
      { id: "jcb", name: "JCB", icon: "💳", color: "#0E4C96" },
      { id: "amex", name: "American Express", icon: "💳", color: "#006FCF" }
    ]
  };

  const categories = Object.keys(paymentMethods);

  return (
    <div className="payment-method-modal-v2">
      <div className="payment-method-modal__backdrop" onClick={onClose} />
      <div className="payment-method-modal__content-v2">
        <div className="payment-method-modal__header-v2">
          <h2>Semua Saluran Pembayaran</h2>
          <button className="payment-method-modal__close" onClick={onClose}>
            <X size={24} />
          </button>
        </div>

        <div className="payment-method-modal__body-v2">
          {/* Sidebar Categories */}
          <div className="payment-categories-sidebar">
            {categories.map((category) => (
              <button
                key={category}
                className={`payment-category-btn ${selectedCategory === category ? 'active' : ''}`}
                onClick={() => setSelectedCategory(category)}
              >
                {category}
              </button>
            ))}
          </div>

          {/* Payment Methods Grid */}
          <div className="payment-methods-main">
            <div className="payment-methods-grid-v2">
              {paymentMethods[selectedCategory]?.map((method) => (
                <button
                  key={method.id}
                  className={`payment-method-card-v2 ${selectedMethod === method.id ? 'selected' : ''}`}
                  onClick={() => onSelectMethod(method.id, method.name)}
                >
                  <div className="payment-method-icon-v2" style={{ backgroundColor: method.color }}>
                    {method.icon}
                  </div>
                  <span className="payment-method-name-v2">{method.name}</span>
                </button>
              ))}
            </div>
          </div>
        </div>

        {orderSummary && (
          <div className="payment-method-modal__footer-v2">
            <div className="payment-summary-inline">
              <div className="payment-summary-info">
                <span className="payment-summary-business">{orderSummary.businessName}</span>
                <span className="payment-summary-package">{orderSummary.packageName}</span>
                <span className="payment-summary-amount">Rp {Number(orderSummary.amount || 0).toLocaleString('id-ID')}</span>
              </div>
              <button 
                className="payment-confirm-btn"
                disabled={!selectedMethod}
                onClick={() => onConfirm && onConfirm(selectedMethod)}
              >
                Bayar Sekarang
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

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
  { id: "dana", label: "DANA", account: "0812-3456-7890 a.n. Surade.co.id" },
  { id: "bni", label: "Transfer BNI", account: "0123456789 a.n. Surade.co.id" },
  { id: "bca", label: "Transfer BCA", account: "0987654321 a.n. Surade.co.id" },
];

function formatRupiah(amount) {
  return "Rp " + Number(amount || 0).toLocaleString("id-ID");
}

export default function Pricing() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [loading, setLoading] = useState(false);
  // PERBAIKAN: perbandingan Free vs Premium sekarang sudah ditampilkan
  // langsung di tab Premium Dashboard, jadi kalau user datang dari sana
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
        "Bukti pembayaran berhasil dikirim! Premium akan aktif otomatis setelah admin memverifikasi pembayaran Anda (biasanya 1x24 jam)."
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
                  <span className="pricing-card__badge pricing-card__badge--premium">PREMIUM</span>
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
                  PILIH PREMIUM
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
                  <h3>{business ? `Upgrade ${business.title} ke Premium` : "Upgrade Bisnis ke Premium"}</h3>
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
                        Semua bisnis Anda sudah premium, atau Anda belum punya bisnis Free.
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
        <PaymentMethodSelector
          selectedMethod={formData.paymentMethod}
          onSelectMethod={handleSelectPaymentMethod}
          onClose={() => setShowPaymentModal(false)}
          orderSummary={{
            businessName: business?.title || "",
            packageName: selectedPlanInfo?.label || "",
            amount: selectedPlanInfo?.amount || 0
          }}
          onConfirm={handleSelectPaymentMethod}
        />
      )}
    </div>
  );
}