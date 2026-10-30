import { useState, useEffect, useRef } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import toast from "react-hot-toast";
import Navbar from "../components/Navbar";
import api from "../services/api";
import {
  Package, ImageIcon, DollarSign, Tag, X, Plus, Upload, Check, AlertCircle, Loader2, Trash2, Save, ArrowLeft, Building2, FileText, Sparkles
} from "lucide-react";
import "./AddProduct.css";

export default function AddProduct() {
  const navigate = useNavigate();
  const { businessId } = useParams();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [businesses, setBusinesses] = useState([]);

  const [form, setForm] = useState({
    business_id: businessId || "",
    name: "",
    price: "",
    description: "",
  });

  // Display value untuk input harga (format Rupiah)
  const [priceDisplay, setPriceDisplay] = useState("");

  const [image, setImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const imageInputRef = useRef(null);

  useEffect(() => {
    document.title = "Tambah Produk Baru - Surade.com";
  }, []);

  // Fetch businesses for dropdown
  useEffect(() => {
    const fetchBusinesses = async () => {
      try {
        const res = await api.get("/my-businesses");
        const data = res.data?.data || res.data || [];
        const list = Array.isArray(data) ? data : (data?.data || []);
        if (Array.isArray(list)) {
          setBusinesses(list);
        }
      } catch (err) {
        console.error("Failed to fetch businesses:", err);
      }
    };
    fetchBusinesses();
  }, []);

  // Set business_id from URL param if available
  useEffect(() => {
    if (businessId) {
      setForm(prev => ({ ...prev, business_id: businessId }));
    }
  }, [businessId]);

  const handleImageChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) {
      toast.error("Ukuran gambar maksimal 5MB.");
      return;
    }
    if (imagePreview) URL.revokeObjectURL(imagePreview);
    setImage(file);
    setImagePreview(URL.createObjectURL(file));
  };

  const removeImage = () => {
    if (imagePreview) URL.revokeObjectURL(imagePreview);
    setImage(null);
    setImagePreview(null);
    if (imageInputRef.current) imageInputRef.current.value = "";
  };

  const selectedBiz = businesses.find((b) => String(b.id) === String(form.business_id));
  const isBizPremium = Boolean(
    selectedBiz?.is_premium ||
    selectedBiz?.features?.is_premium ||
    selectedBiz?.premium_info?.status === "active" ||
    selectedBiz?.subscription?.status === "active"
  );
  const currentProdCount = selectedBiz?.products?.length || 0;
  const isLimitReached = selectedBiz && !isBizPremium && currentProdCount >= 3;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    if (!form.business_id) {
      setError("Pilih bisnis terlebih dahulu");
      setLoading(false);
      return;
    }

    if (isLimitReached) {
      setError("Paket Free dibatasi maksimal 3 produk. Silakan upgrade ke paket Premium untuk menambahkan produk tanpa batas.");
      setLoading(false);
      return;
    }

    if (!form.name || !form.price) {
      setError("Nama produk dan harga wajib diisi");
      setLoading(false);
      return;
    }

    if (image && image.size > 5 * 1024 * 1024) {
      setError("Ukuran gambar produk melebihi batas maksimal 5MB. Silakan pilih foto lain.");
      setLoading(false);
      return;
    }

    try {
      const formData = new FormData();
      formData.append("business_id", form.business_id);
      formData.append("name", form.name);
      formData.append("price", form.price);
      formData.append("description", form.description || "");

      if (image) {
        formData.append("image", image);
      }

      const res = await api.post("/products", formData, {
        headers: { "Content-Type": "multipart/form-data" }
      });

      setSuccess(true);
      toast.success("Produk berhasil ditambahkan! Menunggu verifikasi admin.");
      
      setTimeout(() => {
        navigate("/admin-user?tab=produk");
      }, 1000);
    } catch (err) {
      console.error("Failed to create product:", err);
      setError(err.response?.data?.message || "Gagal menambahkan produk");
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    if (name === "price") {
      const numeric = value.replace(/\D/g, "");
      setForm(prev => ({ ...prev, price: numeric }));
      if (numeric === "") {
        setPriceDisplay("");
      } else {
        setPriceDisplay(
          "Rp " + parseInt(numeric, 10).toLocaleString("id-ID")
        );
      }
    } else {
      setForm(prev => ({ ...prev, [name]: value }));
    }
  };

  return (
    <div className="add-product-page">
      <Navbar />

      <div className="add-product-container">
        {/* Navigation back bar */}
        <div className="add-product-back-bar">
          <Link
            to="/admin-user?tab=produk"
            className="back-link-btn"
            title="Kembali ke Kelola Produk"
            onClick={(e) => {
              e.preventDefault();
              navigate("/admin-user?tab=produk");
            }}
          >
            <ArrowLeft size={16} />
            <span>Kembali ke Kelola Produk</span>
          </Link>
        </div>

        {/* Hero Header */}
        <div className="add-product-header">
          <div className="header-icon-wrap">
            <Package size={28} className="header-icon" />
          </div>
          <div className="header-text">
            <div className="header-badge">
              <Sparkles size={13} />
              <span>Form Produk Usaha</span>
            </div>
            <h1>Tambah Produk Baru</h1>
            <p>Lengkapi informasi produk atau jasa untuk mempromosikannya ke pelanggan</p>
          </div>
        </div>

        {success && (
          <div className="success-message">
            <Check size={20} />
            <span>Produk berhasil ditambahkan dan sedang menunggu verifikasi Admin!</span>
          </div>
        )}

        {error && (
          <div className="error-message">
            <AlertCircle size={20} />
            <span>{error}</span>
          </div>
        )}

        {isLimitReached && (
          <div className="limit-alert-card">
            <div className="limit-alert-body">
              <AlertCircle size={22} className="alert-icon" />
              <div>
                <strong>Batas Maksimal 3 Produk Tercapai (Paket Free)</strong>
                <p>
                  Bisnis <strong>{selectedBiz?.name}</strong> menggunakan paket Free ({currentProdCount}/3 produk). Upgrade ke Premium untuk produk tanpa batas.
                </p>
              </div>
            </div>
            <button
              type="button"
              className="upgrade-btn"
              onClick={() => {
                if (selectedBiz?.id) {
                  navigate(`/add-business/${selectedBiz.id}?upgrade=true`);
                } else {
                  navigate("/admin-user?tab=bisnis");
                }
              }}
            >
              <Sparkles size={14} />
              <span>Upgrade Premium</span>
            </button>
          </div>
        )}

        <form onSubmit={handleSubmit} className="add-product-form">
          {/* Business Selection */}
          <div className="form-group">
            <label htmlFor="prod-business-select">
              <Building2 size={16} className="label-icon text-teal-600" />
              <span>Pilih Bisnis <span className="required-star">*</span></span>
            </label>
            <div className="input-field-wrapper">
              <select
                id="prod-business-select"
                name="business_id"
                value={form.business_id}
                onChange={handleInputChange}
                required
                disabled={!!businessId}
                className="custom-select"
              >
                <option value="">-- Pilih Bisnis Anda --</option>
                {businesses.map((biz) => {
                  const isPrem = Boolean(
                    biz.is_premium ||
                    biz.is_premium_active ||
                    biz.features?.is_premium ||
                    biz.premium_info?.status === "active" ||
                    biz.subscription?.status === "active"
                  );
                  const count = biz.products?.length || 0;
                  return (
                    <option key={biz.id} value={biz.id}>
                      {isPrem
                        ? `⭐ [PREMIUM] ${biz.name} (Bebas Tambah Produk)`
                        : count >= 3
                        ? `📦 [FREE - PENUH (3/3)] ${biz.name}`
                        : `📦 [FREE (${count}/3)] ${biz.name}`}
                    </option>
                  );
                })}
              </select>
            </div>
          </div>

          {/* Product Name */}
          <div className="form-group">
            <label htmlFor="prod-name-input">
              <Tag size={16} className="label-icon text-teal-600" />
              <span>Nama Produk / Jasa <span className="required-star">*</span></span>
            </label>
            <div className="input-field-wrapper">
              <input
                id="prod-name-input"
                type="text"
                name="name"
                value={form.name}
                onChange={handleInputChange}
                placeholder="Contoh: Servis AC Sukabumi Spesial / Nasi Goreng Komplit"
                required
                className="custom-input"
              />
            </div>
          </div>

          {/* Price */}
          <div className="form-group">
            <label htmlFor="prod-price-input">
              <DollarSign size={16} className="label-icon text-teal-600" />
              <span>Harga (Rp) <span className="required-star">*</span></span>
            </label>
            <div className="input-field-wrapper">
              <input
                id="prod-price-input"
                type="text"
                name="price"
                value={priceDisplay}
                onChange={handleInputChange}
                placeholder="Contoh: Rp 25.000"
                required
                inputMode="numeric"
                className="custom-input font-semibold"
              />
            </div>
            <span className="field-hint">Masukkan angka, sistem akan memformat otomatis dalam Rupiah</span>
          </div>

          {/* Description */}
          <div className="form-group">
            <label htmlFor="prod-desc-input">
              <FileText size={16} className="label-icon text-teal-600" />
              <span>Deskripsi Produk / Detail Jasa</span>
            </label>
            <div className="input-field-wrapper">
              <textarea
                id="prod-desc-input"
                name="description"
                value={form.description}
                onChange={handleInputChange}
                placeholder="Jelaskan spesifikasi produk, keunggulan, atau cara pemesanan secara ringkas..."
                rows={4}
                className="custom-textarea"
              />
            </div>
          </div>

          {/* Image Upload Zone */}
          <div className="form-group">
            <label>
              <ImageIcon size={16} className="label-icon text-teal-600" />
              <span>Foto Produk</span>
              <span className="label-tag-optional">Opsional (Maks 5MB)</span>
            </label>

            <input
              type="file"
              ref={imageInputRef}
              onChange={handleImageChange}
              accept="image/jpeg,image/png,image/jpg,image/webp"
              style={{ display: "none" }}
            />

            {!imagePreview ? (
              <div
                className="product-dropzone"
                onClick={() => imageInputRef.current?.click()}
              >
                <div className="dropzone-icon-circle">
                  <Upload size={22} />
                </div>
                <div className="dropzone-text">
                  <span className="dropzone-title">Klik untuk Upload Foto Produk</span>
                  <span className="dropzone-sub">Format yang didukung: JPG, PNG, WEBP (Maksimal 5MB)</span>
                </div>
              </div>
            ) : (
              <div className="product-image-preview-card">
                <img src={imagePreview} alt="" className="preview-img-backdrop" />
                <img src={imagePreview} alt="Preview Produk" className="preview-img" />
                <div className="preview-actions-overlay">
                  <button
                    type="button"
                    className="btn-change-photo"
                    onClick={() => imageInputRef.current?.click()}
                  >
                    <Upload size={14} />
                    <span>Ganti Foto</span>
                  </button>
                  <button
                    type="button"
                    className="btn-remove-photo"
                    onClick={removeImage}
                  >
                    <Trash2 size={14} />
                    <span>Hapus</span>
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Form Actions */}
          <div className="form-actions">
            <button
              type="button"
              className="btn-cancel"
              onClick={() => navigate("/admin-user?tab=produk")}
            >
              Batal
            </button>
            <button type="submit" className="btn-submit" disabled={loading || isLimitReached}>
              {loading ? (
                <>
                  <Loader2 size={18} className="spin" />
                  <span>Menyimpan...</span>
                </>
              ) : (
                <>
                  <Save size={18} />
                  <span>Simpan Produk</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
