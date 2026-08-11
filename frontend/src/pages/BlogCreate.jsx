import { useState, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import Navbar from "../components/Navbar";
import {
  ArrowLeft, Upload, X, FileText, Calendar, CheckCircle2, Image as ImageIcon, Edit2,
} from "lucide-react";
import api from "../utils/api";
import "./BlogCreate.css";

export default function BlogCreate() {
  const navigate = useNavigate();
  const { isAdmin } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [formData, setFormData] = useState({
    type: "blog",
    title: "",
    content: "",
    excerpt: "",
    category: "",
    status: "draft",
    location: "",
    eventDate: "",
  });

  const [thumbnail, setThumbnail] = useState(null);
  const [banners, setBanners] = useState([]);
  const [gallery, setGallery] = useState([]);

  const thumbnailInputRef = useRef(null);
  const bannerInputRef = useRef(null);
  const galleryInputRef = useRef(null);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setError("");
  };

  const setType = (type) => setFormData((prev) => ({ ...prev, type }));

  const handleThumbnailUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      setThumbnail({ file, preview: URL.createObjectURL(file) });
    }
  };

  const handleBannerUpload = (e) => {
    const files = Array.from(e.target.files);
    if (banners.length + files.length <= 4) {
      const newBanners = files.map((file) => ({ file, preview: URL.createObjectURL(file) }));
      setBanners((prev) => [...prev, ...newBanners]);
    } else {
      setError("Banner maksimal 4 gambar.");
    }
  };

  const handleGalleryUpload = (e) => {
    const files = Array.from(e.target.files);
    const newGallery = files.map((file) => ({ file, preview: URL.createObjectURL(file) }));
    setGallery((prev) => [...prev, ...newGallery]);
  };

  const removeBanner = (index) => setBanners((prev) => prev.filter((_, i) => i !== index));
  const removeGalleryImage = (index) => setGallery((prev) => prev.filter((_, i) => i !== index));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!formData.title.trim()) {
      setError(`Judul ${formData.type === "blog" ? "blog" : "event"} harus diisi`);
      return;
    }
    if (!formData.content.trim()) {
      setError("Konten utama harus diisi");
      return;
    }
    if (formData.type === "blog" && !formData.category) {
      setError("Kategori harus dipilih");
      return;
    }

    setLoading(true);
    try {
      if (formData.type === "blog") {
        // Kirim sebagai multipart/form-data supaya file thumbnail/banner/galeri
        // ikut terupload sungguhan ke server (dulu cuma pakai blob preview
        // lokal, jadi gambarnya sebenarnya tidak pernah benar-benar tersimpan).
        const payload = new FormData();
        payload.append("title", formData.title);
        payload.append("content", formData.content);
        payload.append("excerpt", formData.excerpt);
        payload.append("category", formData.category);
        payload.append("status", formData.status);
        if (thumbnail?.file) payload.append("thumbnail", thumbnail.file);
        banners.forEach((b) => payload.append("banners[]", b.file));
        gallery.forEach((g) => payload.append("gallery[]", g.file));

        await api.post("/blogs", payload);
        alert("Blog berhasil disimpan!");
        navigate("/blog");
      } else {
        if (!isAdmin) {
          setError("Hanya admin yang dapat membuat event.");
          setLoading(false);
          return;
        }

        const payload = new FormData();
        payload.append("title", formData.title);
        payload.append("description", formData.content);
        payload.append("location", formData.location);
        if (formData.eventDate) payload.append("event_date", formData.eventDate);
        if (formData.category) payload.append("category", formData.category);
        payload.append("status", formData.status);

        if (thumbnail?.file) {
          payload.append("image", thumbnail.file);
        } else if (thumbnail?.preview && /^https?:\/\//i.test(thumbnail.preview)) {
          payload.append("image_url", thumbnail.preview);
        }

        await api.post("/events", payload);
        alert("Event berhasil disimpan!");
        navigate("/dashboard");
      }
    } catch (err) {
      console.error("Error saving content:", err);
      setError(err.data?.message || err.message || "Gagal menyimpan konten. Silakan coba lagi.");
    } finally {
      setLoading(false);
    }
  };

  const isBlog = formData.type === "blog";

  return (
    <div className="blog-create-page">
      <Navbar />

      <div className="blog-create-container">
        {/* ── Hero ── */}
        <div className="bc-hero">
          <div className="bc-hero__text">
            <Link to="/dashboard" className="bc-hero__back">
              <ArrowLeft size={16} />
              <span>Kembali ke Dashboard</span>
              <span className="bc-hero__back-dot" />
            </Link>
            <h1 className="bc-hero__title">
              Buat <span className="bc-hero__title-highlight">{isBlog ? "Blog" : "Event"}</span> Baru
            </h1>
            <p className="bc-hero__subtitle">
              Bagikan informasi, cerita, atau pengetahuan menarik untuk pengunjung Surade.co.id
            </p>
          </div>
          <div className="bc-hero__illustration">
            <div className="bc-mock-card">
              <div className="bc-mock-card__dots">
                <span /><span /><span />
              </div>
              <div className="bc-mock-card__title-row">
                <span className="bc-mock-card__t">T</span>
                <span className="bc-mock-card__line" />
              </div>
              <div className="bc-mock-card__image-box">
                <ImageIcon size={28} />
              </div>
            </div>
            <div className="bc-mock-pencil">
              <Edit2 size={18} />
            </div>
            <div className="bc-mock-plant" aria-hidden="true">🌵</div>
          </div>
        </div>

        {/* ── Tab pill Blog / Event ── */}
        <div className="bc-tabpill">
          <button
            type="button"
            className={`bc-tabpill__btn ${isBlog ? "active" : ""}`}
            onClick={() => setType("blog")}
          >
            <FileText size={16} />
            <span>Blog</span>
          </button>
          <button
            type="button"
            className={`bc-tabpill__btn ${!isBlog ? "active" : ""}`}
            onClick={() => setType("event")}
            disabled={!isAdmin}
            title={!isAdmin ? "Hanya admin yang dapat membuat event." : "Buat Event"}
          >
            <Calendar size={16} />
            <span>Event</span>
          </button>
        </div>

        {error && <div className="error-message">{error}</div>}

        {/* ── Form card ── */}
        <form className="bc-card" onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">
              Judul {isBlog ? "Blog" : "Event"} <span className="required">*</span>
            </label>
            <div className="bc-input-icon-wrap">
              <input
                type="text"
                name="title"
                className="form-input"
                placeholder={isBlog ? "Masukkan judul blog..." : "Masukkan nama event..."}
                value={formData.title}
                onChange={handleInputChange}
              />
              <Edit2 size={16} className="bc-input-icon" />
            </div>
          </div>

          <div className="bc-form-row">
            <div className="form-group">
              <label className="form-label">Kategori {isBlog ? "Blog" : "Event"}</label>
              <select name="category" className="form-select" value={formData.category} onChange={handleInputChange}>
                <option value="">Pilih Kategori</option>
                <option value="budaya">Budaya</option>
                <option value="kuliner">Kuliner</option>
                <option value="wisata">Wisata</option>
                <option value="teknologi">Teknologi</option>
                <option value="umum">Umum</option>
                <option value="informasi">Informasi</option>
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">Status Publikasi</label>
              <select name="status" className="form-select" value={formData.status} onChange={handleInputChange}>
                <option value="draft">Draft</option>
                <option value="published">Published</option>
              </select>
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">
              Tipe Konten <span className="required">*</span>
            </label>
            <div className="bc-type-cards">
              <button
                type="button"
                className={`bc-type-card ${isBlog ? "active" : ""}`}
                onClick={() => setType("blog")}
              >
                <span className="bc-type-card__icon"><FileText size={20} /></span>
                <span className="bc-type-card__text">
                  <strong>Blog</strong>
                  <span>Artikel, berita, atau informasi umum</span>
                </span>
                <span className="bc-type-card__check">
                  {isBlog ? <CheckCircle2 size={18} /> : <span className="bc-type-card__circle" />}
                </span>
              </button>
              <button
                type="button"
                className={`bc-type-card ${!isBlog ? "active" : ""}`}
                onClick={() => setType("event")}
              >
                <span className="bc-type-card__icon"><Calendar size={20} /></span>
                <span className="bc-type-card__text">
                  <strong>Event</strong>
                  <span>Kegiatan, acara, atau event khusus</span>
                </span>
                <span className="bc-type-card__check">
                  {!isBlog ? <CheckCircle2 size={18} /> : <span className="bc-type-card__circle" />}
                </span>
              </button>
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Ringkasan (Excerpt)</label>
            <textarea
              name="excerpt"
              className="form-textarea"
              placeholder="Ringkasan singkat..."
              rows={2}
              value={formData.excerpt}
              onChange={handleInputChange}
            />
          </div>

          {!isBlog && (
            <div className="bc-form-row">
              <div className="form-group">
                <label className="form-label">Lokasi</label>
                <input
                  type="text"
                  name="location"
                  className="form-input"
                  placeholder="Nama tempat, kota"
                  value={formData.location}
                  onChange={handleInputChange}
                />
              </div>
              <div className="form-group">
                <label className="form-label">Tanggal & Waktu</label>
                <input
                  type="datetime-local"
                  name="eventDate"
                  className="form-input"
                  value={formData.eventDate}
                  onChange={handleInputChange}
                />
              </div>
            </div>
          )}

          <div className="form-group">
            <label className="form-label">
              Konten Utama <span className="required">*</span>
            </label>
            <textarea
              name="content"
              className="form-textarea form-textarea--large"
              placeholder={isBlog ? "Tulis konten blog disini..." : "Jelaskan acara Anda..."}
              rows={10}
              value={formData.content}
              onChange={handleInputChange}
            />
          </div>

          <div className="bc-divider" />
          <h3 className="bc-section-title">GAMBAR & MEDIA</h3>

          <div className="form-group">
            <label className="upload-label">Thumbnail (Foto Sampul)</label>
            <div className="upload-area" onClick={() => thumbnailInputRef.current?.click()}>
              {thumbnail ? (
                <div className="upload-preview">
                  <img src={thumbnail.preview} alt="Thumbnail preview" />
                  <button
                    type="button"
                    className="remove-btn"
                    onClick={(e) => { e.stopPropagation(); setThumbnail(null); }}
                  >
                    <X size={16} />
                  </button>
                </div>
              ) : (
                <div className="upload-placeholder">
                  <Upload size={28} />
                  <span>Klik untuk upload thumbnail</span>
                </div>
              )}
              <input
                type="file"
                ref={thumbnailInputRef}
                className="hidden-input"
                accept="image/*"
                onChange={handleThumbnailUpload}
              />
            </div>
          </div>

          <div className="form-group">
            <label className="upload-label">Banner (Opsional, maks. 4)</label>
            <div className="upload-area" onClick={() => bannerInputRef.current?.click()}>
              <div className="upload-placeholder">
                <Upload size={28} />
                <span>Klik atau drag &amp; drop banner</span>
                <span className="upload-hint">{banners.length}/4 banner</span>
              </div>
              <input
                type="file"
                ref={bannerInputRef}
                className="hidden-input"
                accept="image/*"
                multiple
                onChange={handleBannerUpload}
              />
            </div>
            {banners.length > 0 && (
              <div className="uploaded-images">
                {banners.map((banner, index) => (
                  <div key={index} className="uploaded-image">
                    <img src={banner.preview} alt={`Banner ${index + 1}`} />
                    <button type="button" className="remove-btn" onClick={() => removeBanner(index)}>
                      <X size={14} />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="form-group">
            <label className="upload-label">Galeri Foto (Opsional)</label>
            <div className="upload-area upload-area--tinted" onClick={() => galleryInputRef.current?.click()}>
              <div className="upload-placeholder">
                <Upload size={28} />
                <span>Klik atau drag &amp; drop foto</span>
                <span className="upload-hint">JPG, PNG, WEBP - bisa multiple file</span>
              </div>
              <input
                type="file"
                ref={galleryInputRef}
                className="hidden-input"
                accept="image/*"
                multiple
                onChange={handleGalleryUpload}
              />
            </div>
            {gallery.length === 0 ? (
              <div className="upload-empty">Belum ada foto diupload</div>
            ) : (
              <div className="uploaded-images">
                {gallery.map((image, index) => (
                  <div key={index} className="uploaded-image">
                    <img src={image.preview} alt={`Gallery ${index + 1}`} />
                    <button type="button" className="remove-btn" onClick={() => removeGalleryImage(index)}>
                      <X size={14} />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="form-actions">
            <button type="submit" className="btn btn-primary" disabled={loading}>
              {loading ? "Menyimpan..." : `Simpan ${isBlog ? "Blog" : "Event"}`}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}