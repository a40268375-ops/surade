import { useState, useEffect, useRef } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import Navbar from "../components/Navbar";
import api from "../services/api";
import {
  Package, ImageIcon, DollarSign, Tag, X, Plus, Upload, Check, AlertCircle, Loader2, Trash2, Save
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
    const file = e.target.files[0];
    if (!file) return;
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

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    if (!form.business_id) {
      setError("Pilih bisnis terlebih dahulu");
      setLoading(false);
      return;
    }

    if (!form.name || !form.price) {
      setError("Nama produk dan harga wajib diisi");
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
      setTimeout(() => {
        navigate("/admin-user?tab=produk");
      }, 2000);
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
      // Hapus semua karakter non-digit
      const numeric = value.replace(/\D/g, "");
      // Simpan nilai numerik bersih ke form state
      setForm(prev => ({ ...prev, price: numeric }));
      // Format display dengan pemisah ribuan
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
        <div className="add-product-header">
          <Package size={32} className="header-icon" />
          <div>
            <h1>Tambah Produk</h1>
            <p>Tambahkan produk baru untuk bisnis Anda</p>
          </div>
        </div>

        {success && (
          <div className="success-message">
            <Check size={20} />
            <span>Produk berhasil ditambahkan!</span>
          </div>
        )}

        {error && (
          <div className="error-message">
            <AlertCircle size={20} />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="add-product-form">
          {/* Business Selection */}
          <div className="form-group">
            <label>
              <Package size={18} />
              Pilih Bisnis *
            </label>
            <select
              name="business_id"
              value={form.business_id}
              onChange={handleInputChange}
              required
              disabled={!!businessId}
            >
              <option value="">-- Pilih Bisnis --</option>
              {businesses.map((biz) => (
                <option key={biz.id} value={biz.id}>
                  {biz.name}
                </option>
              ))}
            </select>
          </div>

          {/* Product Name */}
          <div className="form-group">
            <label>
              <Tag size={18} />
              Nama Produk *
            </label>
            <input
              type="text"
              name="name"
              value={form.name}
              onChange={handleInputChange}
              placeholder="Contoh: Nasi Goreng Spesial"
              required
            />
          </div>

          {/* Price */}
          <div className="form-group">
            <label>
              <DollarSign size={18} />
              Harga (Rp) *
            </label>
            <input
              type="text"
              name="price"
              value={priceDisplay}
              onChange={handleInputChange}
              placeholder="Contoh: Rp 25.000"
              required
              inputMode="numeric"
            />
          </div>

          {/* Description */}
          <div className="form-group">
            <label>
              <Tag size={18} />
              Deskripsi
            </label>
            <textarea
              name="description"
              value={form.description}
              onChange={handleInputChange}
              placeholder="Deskripsi produk..."
              rows={4}
            />
          </div>

          {/* Image */}
          <div className="form-group">
            <label>
              <ImageIcon size={18} />
              Foto Produk
            </label>
            <div className="image-upload-area">
              <input
                type="file"
                ref={imageInputRef}
                onChange={handleImageChange}
                accept="image/*"
                style={{ display: "none" }}
              />
              {!imagePreview && (
                <button
                  type="button"
                  className="upload-btn"
                  onClick={() => imageInputRef.current?.click()}
                >
                  <Upload size={18} />
                  <span>Upload Foto</span>
                </button>
              )}
            </div>

            {imagePreview && (
              <div className="image-previews">
                <div className="image-preview-item">
                  <img src={imagePreview} alt="Preview" />
                  <button
                    type="button"
                    className="remove-image-btn"
                    onClick={removeImage}
                  >
                    <X size={16} />
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Submit Buttons */}
          <div className="form-actions">
            <button
              type="button"
              className="btn-cancel"
              onClick={() => navigate("/admin-user?tab=produk")}
            >
              Batal
            </button>
            <button type="submit" className="btn-submit" disabled={loading}>
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
