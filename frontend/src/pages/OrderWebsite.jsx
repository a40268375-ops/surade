import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import api from "../utils/api";
import Navbar from "../components/Navbar";
import SuradeLoader from "../components/SuradeLoader";
import { 
  ArrowLeft, 
  Check, 
  CreditCard, 
  Phone, 
  Mail, 
  User, 
  Building, 
  Globe,
  FileText,
  AlertCircle
} from "lucide-react";
import "./OrderWebsite.css";

export default function OrderWebsite() {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  
  const [pkg, setPkg] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  
  useEffect(() => {
    document.title = "Pesan Pembuatan Website - Surade.com";
  }, []);
  const [formData, setFormData] = useState({
    customer_name: user?.name || "",
    customer_email: user?.email || "",
    customer_phone: "",
    company_name: "",
    website_url: "",
    project_description: "",
    special_requests: "",
    payment_method: "bank_transfer"
  });

  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (!user) {
      navigate("/login");
      return;
    }
    loadPackage();
  }, [id, user]);

  const loadPackage = async () => {
    try {
      const data = await api.get(`/premium-packages/${id}`);
      setPkg(data);
    } catch (err) {
      alert("Paket tidak ditemukan.");
      navigate("/premium-website");
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: null }));
    }
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.customer_name.trim()) {
      newErrors.customer_name = "Nama wajib diisi";
    }
    
    if (!formData.customer_email.trim()) {
      newErrors.customer_email = "Email wajib diisi";
    } else if (!/\S+@\S+\.\S+/.test(formData.customer_email)) {
      newErrors.customer_email = "Format email tidak valid";
    }
    
    if (!formData.customer_phone.trim()) {
      newErrors.customer_phone = "Nomor HP wajib diisi";
    }
    
    if (!formData.project_description.trim()) {
      newErrors.project_description = "Deskripsi project wajib diisi";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    setSubmitting(true);
    try {
      const orderData = {
        ...formData,
        package_id: parseInt(id),
        total_amount: pkg.price
      };
      
      const response = await api.post("/orders", orderData);
      
      // Redirect to payment ticket creation in dashboard
      navigate(`/dashboard?tab=tickets&order_id=${response.id}&type=website_order`);
      
    } catch (err) {
      const errorMessage = err?.data?.errors 
        ? Object.values(err.data.errors).flat().join("\n")
        : "Gagal membuat pesanan. Silakan coba lagi.";
      alert(errorMessage);
    } finally {
      setSubmitting(false);
    }
  };

  const formatRupiah = (n) => "Rp" + Number(n || 0).toLocaleString("id-ID");

  if (loading) {
    return (
      <div className="order-website-page min-h-screen flex flex-col bg-[#f8fafc]">
        <Navbar />
        <div className="flex-1 flex flex-col items-center justify-center p-6">
          <SuradeLoader
            variant="section"
            text="Memuat informasi paket website"
            subtext="Menyiapkan data pesanan dan rincian layanan"
            showBrand
          />
        </div>
      </div>
    );
  }

  if (!pkg) {
    return (
      <div className="order-website-page">
        <Navbar />
        <div className="order-error">
          <AlertCircle size={48} />
          <h2>Paket Tidak Ditemukan</h2>
          <p>Paket yang Anda cari tidak tersedia.</p>
          <button onClick={() => navigate("/premium-website")} className="btn-back">
            Kembali ke Daftar Paket
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="order-website-page">
      <Navbar />
      
      <div className="order-container">
        <div className="order-header">
          <button onClick={() => navigate("/premium-website")} className="order-back-btn">
            <ArrowLeft size={20} />
            Kembali ke Paket
          </button>
          <h1>Formulir Pemesanan Website</h1>
        </div>

        <div className="order-content">
          {/* Package Summary */}
          <div className="package-summary">
            <h2>Paket yang Dipilih</h2>
            <div className="package-summary-card">
              <div className="package-summary-header">
                <h3>{pkg.name}</h3>
                <div className="package-price">
                  {formatRupiah(pkg.price)}
                </div>
              </div>
              <p className="package-description">{pkg.description}</p>
              
              <div className="package-features">
                <h4>Fitur yang Termasuk:</h4>
                <ul>
                  {(pkg.features || []).map((feature, idx) => (
                    <li key={idx}>
                      <Check size={16} />
                      {feature}
                    </li>
                  ))}
                </ul>
              </div>
              
              <div className="package-duration">
                <strong>Estimasi Pengerjaan: {pkg.duration} hari</strong>
              </div>
            </div>
          </div>

          {/* Order Form */}
          <div className="order-form-container">
            <h2>Informasi Pemesanan</h2>
            <form onSubmit={handleSubmit} className="order-form">
              {/* Customer Information */}
              <div className="form-section">
                <h3>Informasi Kontak</h3>
                <div className="form-row">
                  <div className="form-group">
                    <label>
                      <User size={16} />
                      Nama Lengkap <span className="required">*</span>
                    </label>
                    <input
                      type="text"
                      name="customer_name"
                      value={formData.customer_name}
                      onChange={handleInputChange}
                      className={errors.customer_name ? "error" : ""}
                      placeholder="Masukkan nama lengkap Anda"
                    />
                    {errors.customer_name && (
                      <span className="error-message">{errors.customer_name}</span>
                    )}
                  </div>
                  
                  <div className="form-group">
                    <label>
                      <Mail size={16} />
                      Email <span className="required">*</span>
                    </label>
                    <input
                      type="email"
                      name="customer_email"
                      value={formData.customer_email}
                      onChange={handleInputChange}
                      className={errors.customer_email ? "error" : ""}
                      placeholder="email@example.com"
                    />
                    {errors.customer_email && (
                      <span className="error-message">{errors.customer_email}</span>
                    )}
                  </div>
                </div>
                
                <div className="form-row">
                  <div className="form-group">
                    <label>
                      <Phone size={16} />
                      Nomor HP <span className="required">*</span>
                    </label>
                    <input
                      type="tel"
                      name="customer_phone"
                      value={formData.customer_phone}
                      onChange={handleInputChange}
                      className={errors.customer_phone ? "error" : ""}
                      placeholder="08123456789"
                    />
                    {errors.customer_phone && (
                      <span className="error-message">{errors.customer_phone}</span>
                    )}
                  </div>
                  
                  <div className="form-group">
                    <label>
                      <Building size={16} />
                      Nama Perusahaan/Bisnis
                    </label>
                    <input
                      type="text"
                      name="company_name"
                      value={formData.company_name}
                      onChange={handleInputChange}
                      placeholder="PT. Nama Perusahaan"
                    />
                  </div>
                </div>
              </div>

              {/* Project Information */}
              <div className="form-section">
                <h3>Informasi Project</h3>
                
                <div className="form-group">
                  <label>
                    <Globe size={16} />
                    Website URL (jika sudah ada)
                  </label>
                  <input
                    type="url"
                    name="website_url"
                    value={formData.website_url}
                    onChange={handleInputChange}
                    placeholder="https://www.namadomain.com"
                  />
                </div>
                
                <div className="form-group">
                  <label>
                    <FileText size={16} />
                    Deskripsi Project <span className="required">*</span>
                  </label>
                  <textarea
                    name="project_description"
                    rows={4}
                    value={formData.project_description}
                    onChange={handleInputChange}
                    className={errors.project_description ? "error" : ""}
                    placeholder="Jelaskan bisnis/website yang ingin Anda buat, target audience, warna yang disukai, dll."
                  />
                  {errors.project_description && (
                    <span className="error-message">{errors.project_description}</span>
                  )}
                </div>
                
                <div className="form-group">
                  <label>
                    <FileText size={16} />
                    Permintaan Khusus
                  </label>
                  <textarea
                    name="special_requests"
                    rows={3}
                    value={formData.special_requests}
                    onChange={handleInputChange}
                    placeholder="Fitur tambahan, integrasi khusus, atau permintaan lainnya..."
                  />
                </div>
              </div>

              {/* Payment Method */}
              <div className="form-section">
                <h3>Metode Pembayaran</h3>
                <div className="payment-methods">
                  <label className="payment-method">
                    <input
                      type="radio"
                      name="payment_method"
                      value="bank_transfer"
                      checked={formData.payment_method === "bank_transfer"}
                      onChange={handleInputChange}
                    />
                    <div className="payment-method-content">
                      <CreditCard size={20} />
                      <span>Transfer Bank</span>
                    </div>
                  </label>
                  
                  <label className="payment-method">
                    <input
                      type="radio"
                      name="payment_method"
                      value="qris"
                      checked={formData.payment_method === "qris"}
                      onChange={handleInputChange}
                    />
                    <div className="payment-method-content">
                      <CreditCard size={20} />
                      <span>QRIS</span>
                    </div>
                  </label>
                  
                  <label className="payment-method">
                    <input
                      type="radio"
                      name="payment_method"
                      value="e_wallet"
                      checked={formData.payment_method === "e_wallet"}
                      onChange={handleInputChange}
                    />
                    <div className="payment-method-content">
                      <CreditCard size={20} />
                      <span>E-Wallet</span>
                    </div>
                  </label>
                </div>
              </div>

              {/* Order Summary */}
              <div className="order-summary">
                <div className="order-summary-row">
                  <span>Paket {pkg.name}</span>
                  <span>{formatRupiah(pkg.price)}</span>
                </div>
                <div className="order-summary-row total">
                  <span><strong>Total Pembayaran</strong></span>
                  <span><strong>{formatRupiah(pkg.price)}</strong></span>
                </div>
              </div>

              {/* Submit Button */}
              <div className="form-actions">
                <button
                  type="submit"
                  className="btn-submit"
                  disabled={submitting}
                >
                  {submitting ? "Memproses..." : "Lanjutkan ke Pembayaran"}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}