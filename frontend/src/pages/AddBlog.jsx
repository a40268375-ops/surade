import { useState, useRef, useEffect } from "react";
import { Link, useNavigate, useParams, useSearchParams } from "react-router-dom";
import Navbar from "../components/Navbar";
import api from "../services/api";
import {
  FileText, ImageIcon, Send, X, Upload,
  Check, AlertCircle, Loader2, ArrowLeft, Eye, EyeOff, Plus, Calendar, MapPin, Trash2,
  Pencil, ChevronDown, CheckCircle2, Circle
} from "lucide-react";
import "./AddBlog.css";

const STATUSES = [
  { value: "draft", label: "Draft" },
  { value: "published", label: "Terbit" },
];

export default function AddBlog() {
  const navigate = useNavigate();
  const { id } = useParams();
  const [searchParams] = useSearchParams();
  const typeParam = searchParams.get("type") || "blog";
  const isEditing = !!id;
  const [contentType, setContentType] = useState(typeParam);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [createdId, setCreatedId] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const [blogCategories, setBlogCategories] = useState([]);
  const [form, setForm] = useState({
    title: "",
    blog_category: "",
    excerpt: "",
    content: "",
    status: "draft",
    event_date: "",
    event_location: "",
  });

  // Thumbnail
  const [thumbnail, setThumbnail] = useState(null);
  const [thumbnailPreview, setThumbnailPreview] = useState(null);

  // Banner (max 4)
  const [banners, setBanners] = useState([]);
  const bannerInputRef = useRef();

  // Gallery (additional images)
  const [gallery, setGallery] = useState([]);
  const galleryInputRef = useRef();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((p) => ({ ...p, [name]: value }));
  };

  // ── Thumbnail ──
  const handleThumbnailChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setThumbnail(file);
      setThumbnailPreview(URL.createObjectURL(file));
    }
  };

  const removeThumbnail = () => {
    setThumbnail(null);
    if (thumbnailPreview) URL.revokeObjectURL(thumbnailPreview);
    setThumbnailPreview(null);
  };

  // ── Banner ──
  const handleBannerAdd = (files) => {
    const arr = Array.from(files);
    const remaining = 4 - banners.length;
    arr.slice(0, remaining).forEach((file) => {
      setBanners((p) => [...p, { file, preview: URL.createObjectURL(file) }]);
    });
  };

  const removeBanner = (i) => {
    setBanners((p) => {
      URL.revokeObjectURL(p[i].preview);
      return p.filter((_, idx) => idx !== i);
    });
  };

  // ── Gallery ──
  const handleGalleryAdd = (files) => {
    Array.from(files).forEach((file) => {
      setGallery((p) => [...p, { file, preview: URL.createObjectURL(file) }]);
    });
  };

  const removeGallery = (i) => {
    setGallery((p) => {
      if (p[i]?.preview) URL.revokeObjectURL(p[i].preview);
      return p.filter((_, idx) => idx !== i);
    });
  };

  // ── Drag & Drop helper ──
  const createDropHandler = (onAdd) => ({
    onDragOver: (e) => e.preventDefault(),
    onDrop: (e) => { e.preventDefault(); onAdd(e.dataTransfer.files); },
  });

  // Load existing data when editing
  useEffect(() => {
    if (isEditing && id) {
      setSubmitting(true);
      const endpoint = contentType === "event" ? `/events/${id}` : `/blogs/${id}`;
      api.get(endpoint)
        .then((res) => {
          const data = res.data?.data;
          if (data) {
            setForm({
              title: data.title || "",
              blog_category: data.blog_category || "",
              excerpt: data.excerpt || "",
              content: data.content || "",
              status: data.status || "draft",
              event_date: data.event_date || "",
              event_location: data.event_location || "",
            });
            if (data.thumbnail) {
              setThumbnailPreview(data.thumbnail);
            }
          }
        })
        .catch((err) => {
          setError("Gagal memuat data.");
          console.error(err);
        })
        .finally(() => setSubmitting(false));
    }
  }, [isEditing, id, contentType]);

  // Fetch blog categories
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await api.get("/blog-categories");
        const data = res.data?.data || res.data || [];
        if (Array.isArray(data)) {
          const mappedCategories = [
            { value: "", label: "Pilih Kategori" },
            ...data.map(c => ({ value: c.slug, label: c.name }))
          ];
          setBlogCategories(mappedCategories);
        }
      } catch (err) {
        console.error("Failed to fetch blog categories:", err);
      }
    };
    fetchCategories();
  }, []);

  // ── Validation ──
  const validate = () => {
    if (!form.title.trim()) return "Judul wajib diisi.";
    if (!form.content.trim()) return "Konten wajib diisi.";
    if (contentType === "event" && !form.event_date) return "Tanggal event wajib diisi.";
    if (contentType === "event" && !form.event_location.trim()) return "Lokasi event wajib diisi.";
    return null;
  };

  // ── Submit ──
  const handleSubmit = async (e) => {
    e.preventDefault();
    const err = validate();
    if (err) {
      setError(err);
      setTimeout(() => setError(""), 4000);
      return;
    }
    setSubmitting(true);
    setError("");
    try {
      const endpoint = contentType === "event" ? "/events" : "/blogs";
      const payload = {
        title: form.title,
        blog_category: form.blog_category || null,
        excerpt: form.excerpt || null,
        content: form.content,
        type: contentType,
        status: form.status,
        ...(contentType === "event" && {
          event_date: form.event_date,
          event_location: form.event_location,
        }),
      };

      let itemId;
      if (isEditing) {
        await api.put(`${endpoint}/${id}`, payload);
        itemId = id;
      } else {
        const res = await api.post(endpoint, payload);
        itemId = res.data?.data?.id;
        if (!itemId) throw new Error("Gagal membuat konten");
      }

      // Upload thumbnail if exists
      if (thumbnail) {
        const fd = new FormData();
        fd.append("thumbnail", thumbnail);
        await api.post(`${endpoint}/${itemId}/thumbnail`, fd);
      }

      // Upload banners (via images endpoint)
      const allImages = [...banners.map((b) => b.file), ...gallery.map((g) => g.file)];
      if (allImages.length > 0) {
        const fd = new FormData();
        allImages.forEach((file) => fd.append("images[]", file));
        await api.post(`${endpoint}/${itemId}/images`, fd);
      }

      setCreatedId(itemId);
      setSuccess(true);
    } catch (err) {
      const msg =
        err?.response?.data?.message ||
        (err?.response?.data?.errors
          ? Object.values(err.response.data.errors).flat().join(", ")
          : err.message) ||
        "Terjadi kesalahan.";
      setError(msg);
    } finally {
      setSubmitting(false);
    }
  };

  // ── Delete ──
  const handleDelete = async () => {
    if (!confirm("Apakah Anda yakin ingin menghapus ini? Tindakan ini tidak dapat dibatalkan.")) {
      return;
    }
    setDeleting(true);
    setError("");
    try {
      const endpoint = contentType === "event" ? `/events/${id}` : `/blogs/${id}`;
      await api.delete(endpoint);
      navigate("/admin-user");
    } catch (err) {
      const msg = err?.response?.data?.message || "Gagal menghapus.";
      setError(msg);
    } finally {
      setDeleting(false);
    }
  };

  // ── SUCCESS SCREEN ──
  if (success) {
    return (
      <div className="add-blog-page">
        <Navbar />
        <div className="add-blog-success">
          <div className="add-blog-success__icon">
            <Check size={48} />
          </div>
          <h1>{contentType === "event" ? (isEditing ? "Event Berhasil Diperbarui!" : "Event Berhasil Dibuat!") : (isEditing ? "Blog Berhasil Diperbarui!" : "Blog Berhasil Dibuat!")}</h1>
          <p>
            {contentType === "event"
              ? (form.status === "published" ? "Event kamu sudah tayang dan bisa dilihat oleh pengunjung." : "Event tersimpan sebagai draft.")
              : (form.status === "published" ? "Blog kamu sudah tayang dan bisa dilihat oleh pengunjung." : "Blog tersimpan sebagai draft. Kamu bisa publikasikan nanti.")}
          </p>
          <div className="add-blog-success__actions">
            <Link to="/admin-user" className="btn-primary">
              Ke Dashboard Admin
            </Link>
            <button onClick={() => navigate(`/add-blog?type=${contentType}`)} className="btn-outline">
              Buat {contentType === "event" ? "Event" : "Blog"} Lagi
            </button>
            <Link to="/" className="btn-outline">
              Kembali ke Beranda
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // ── MAIN FORM ──
  return (
    <div className="add-blog-page">
      <Navbar />
      <div className="add-blog-container">
        {/* ── HERO CARD ── */}
        <div className="add-blog-hero-card">
          <div className="add-blog-hero-card__content">
            <div className="add-blog-back-wrapper">
              <Link to="/admin-user" className="add-blog-back-btn">
                <ArrowLeft size={16} />
                <span>Kembali ke Dashboard</span>
              </Link>
              <span className="add-blog-back-dot">•</span>
            </div>
            <h1 className="add-blog-hero-card__title">
              {isEditing ? (
                <>Edit <span className="text-highlight">{contentType === "event" ? "Event" : "Blog"}</span></>
              ) : (
                <>Buat <span className="text-highlight">{contentType === "event" ? "Event" : "Blog"}</span> Baru</>
              )}
            </h1>
            <p className="add-blog-hero-card__subtitle">
              Bagikan informasi, cerita, atau pengetahuan menarik<br />
              untuk pengunjung Info.co.id
            </p>
          </div>

          <div className="add-blog-hero-card__illustration">
            <div className="illustration-graphic">
              {/* Decorative Floating Dots & Plus Icons */}
              <span className="illus-plus illus-plus-1">+</span>
              <span className="illus-plus illus-plus-2">+</span>
              <span className="illus-dot illus-dot-1"></span>
              <span className="illus-dot illus-dot-2"></span>

              {/* Editor Window */}
              <div className="illus-window">
                <div className="illus-window-header">
                  <span className="illus-w-dot"></span>
                  <span className="illus-w-dot"></span>
                  <span className="illus-w-dot"></span>
                </div>
                <div className="illus-window-body">
                  <div className="illus-text-line-t">
                    <div className="illus-letter-t">T</div>
                    <div className="illus-line-stub"></div>
                  </div>
                  <div className="illus-img-placeholder">
                    <ImageIcon size={36} strokeWidth={1.5} className="illus-img-svg" />
                  </div>
                </div>
              </div>

              {/* Floating Pencil Badge */}
              <div className="illus-pencil-badge">
                <Pencil size={20} strokeWidth={2.2} />
              </div>

              {/* Potted Plant */}
              <div className="illus-plant-container">
                <div className="plant-leaves">
                  <div className="leaf leaf-left"></div>
                  <div className="leaf leaf-center"></div>
                  <div className="leaf leaf-right"></div>
                </div>
                <div className="plant-pot"></div>
              </div>
            </div>
          </div>
        </div>

        {/* ── TYPE SELECTOR TABS ── */}
        {!isEditing && (
          <div className="type-selector-wrapper">
            <div className="type-segmented-control">
              <button
                type="button"
                className={`type-segment ${contentType === "blog" ? "active" : ""}`}
                onClick={() => setContentType("blog")}
              >
                <FileText size={18} />
                <span>Blog</span>
              </button>
              <button
                type="button"
                className={`type-segment ${contentType === "event" ? "active" : ""}`}
                onClick={() => setContentType("event")}
              >
                <Calendar size={18} />
                <span>Event</span>
              </button>
            </div>
          </div>
        )}

        {/* ── FORM CARD ── */}
        <div className="add-blog-form-card">
          {error && (
            <div className="add-blog-error">
              <AlertCircle size={18} />
              <span>{error}</span>
            </div>
          )}
          <form onSubmit={handleSubmit} className="add-blog-form">
            {/* Judul Blog */}
            <div className="form-row">
              <div className="form-group form-group--full">
                <label className="form-label">
                  Judul {contentType === "event" ? "Event" : "Blog"} <span className="required-star">*</span>
                </label>
                <div className="input-with-icon">
                  <input
                    name="title"
                    type="text"
                    placeholder={`Masukkan judul ${contentType === "event" ? "event" : "blog"}...`}
                    value={form.title}
                    onChange={handleChange}
                    className="form-input"
                  />
                  <Pencil size={18} className="input-icon-right" />
                </div>
              </div>
            </div>

            {/* Kategori & Status Publikasi */}
            <div className="form-row form-row--2cols">
              <div className="form-group">
                <label className="form-label">Kategori Blog</label>
                <div className="select-wrapper">
                  <select
                    name="blog_category"
                    value={form.blog_category}
                    onChange={handleChange}
                    className="form-input form-select"
                  >
                    {blogCategories.map((c) => (
                      <option key={c.value} value={c.value}>
                        {c.label}
                      </option>
                    ))}
                  </select>
                  <ChevronDown size={18} className="select-icon" />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Status Publikasi</label>
                <div className="select-wrapper">
                  <select
                    name="status"
                    value={form.status}
                    onChange={handleChange}
                    className="form-input form-select"
                  >
                    {STATUSES.map((s) => (
                      <option key={s.value} value={s.value}>
                        {s.label}
                      </option>
                    ))}
                  </select>
                  <ChevronDown size={18} className="select-icon" />
                </div>
              </div>
            </div>

            {/* Tipe Konten Radio Cards */}
            <div className="form-row">
              <div className="form-group form-group--full">
                <label className="form-label">
                  Tipe Konten <span className="required-star">*</span>
                </label>
                <div className="content-type-cards">
                  <div
                    className={`content-type-card ${contentType === "blog" ? "active" : ""}`}
                    onClick={() => setContentType("blog")}
                  >
                    <div className="content-type-card__icon">
                      <FileText size={20} />
                    </div>
                    <div className="content-type-card__info">
                      <div className="content-type-card__title">Blog</div>
                      <div className="content-type-card__sub">Artikel, berita, atau informasi umum</div>
                    </div>
                    <div className="content-type-card__radio">
                      {contentType === "blog" ? (
                        <CheckCircle2 size={22} className="radio-checked" />
                      ) : (
                        <Circle size={22} className="radio-unchecked" />
                      )}
                    </div>
                  </div>

                  <div
                    className={`content-type-card ${contentType === "event" ? "active" : ""}`}
                    onClick={() => setContentType("event")}
                  >
                    <div className="content-type-card__icon">
                      <Calendar size={20} />
                    </div>
                    <div className="content-type-card__info">
                      <div className="content-type-card__title">Event</div>
                      <div className="content-type-card__sub">Kegiatan, acara, atau event khusus</div>
                    </div>
                    <div className="content-type-card__radio">
                      {contentType === "event" ? (
                        <CheckCircle2 size={22} className="radio-checked" />
                      ) : (
                        <Circle size={22} className="radio-unchecked" />
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Ringkasan (Excerpt) */}
            <div className="form-row">
              <div className="form-group form-group--full">
                <label className="form-label">Ringkasan (Excerpt)</label>
                <textarea
                  name="excerpt"
                  rows={2}
                  placeholder="Ringkasan singkat..."
                  value={form.excerpt}
                  onChange={handleChange}
                  className="form-input form-textarea"
                />
              </div>
            </div>

            {/* Event-specific fields */}
            {contentType === "event" && (
              <div className="form-row form-row--2cols">
                <div className="form-group">
                  <label className="form-label">
                    Tanggal Event <span className="required-star">*</span>
                  </label>
                  <input
                    name="event_date"
                    type="datetime-local"
                    value={form.event_date}
                    onChange={handleChange}
                    className="form-input"
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">
                    Lokasi Event <span className="required-star">*</span>
                  </label>
                  <input
                    name="event_location"
                    type="text"
                    placeholder="Lokasi event..."
                    value={form.event_location}
                    onChange={handleChange}
                    className="form-input"
                  />
                </div>
              </div>
            )}

            {/* Konten Utama */}
            <div className="form-row">
              <div className="form-group form-group--full">
                <label className="form-label">
                  Konten Utama <span className="required-star">*</span>
                </label>
                <textarea
                  name="content"
                  rows={10}
                  placeholder={`Tulis konten ${contentType === "event" ? "event" : "blog"} disini...`}
                  value={form.content}
                  onChange={handleChange}
                  className="form-input form-textarea form-textarea--content"
                />
              </div>
            </div>

            {/* ── GAMBAR & MEDIA SECTION ── */}
            <div className="form-section-divider" />
            <div className="form-section-title">Gambar & Media</div>

            <div className="form-row">
              <div className="form-group form-group--full">
                <label className="form-label">Thumbnail (Foto Sampul)</label>
                {thumbnailPreview ? (
                  <div className="thumbnail-preview-wrapper">
                    <img src={thumbnailPreview} alt="Thumbnail" className="thumbnail-preview" />
                    <button type="button" className="thumbnail-remove" onClick={removeThumbnail}>
                      <X size={16} />
                    </button>
                  </div>
                ) : (
                  <div
                    className="upload-zone upload-zone--small"
                    onClick={() => document.getElementById("thumb-input").click()}
                  >
                    <Upload size={28} className="upload-zone__icon" />
                    <p className="upload-zone__text">Klik untuk upload thumbnail</p>
                    <p className="upload-zone__hint">JPG, PNG, WEBP max 4MB</p>
                  </div>
                )}
                <input
                  id="thumb-input"
                  type="file"
                  accept="image/*"
                  hidden
                  onChange={handleThumbnailChange}
                />
              </div>
            </div>

            <div className="form-row">
              <div className="form-group form-group--full">
                <label className="form-label">Banner (Opsional, maks. 4)</label>
                <div
                  className={"upload-zone upload-zone--small " + (banners.length >= 4 ? "upload-zone--disabled" : "")}
                  {...createDropHandler(handleBannerAdd)}
                  onClick={() => banners.length < 4 && bannerInputRef.current?.click()}
                >
                  <input
                    ref={bannerInputRef}
                    type="file"
                    accept="image/*"
                    multiple
                    hidden
                    onChange={(e) => handleBannerAdd(e.target.files)}
                  />
                  <Upload size={28} className="upload-zone__icon" />
                  <p className="upload-zone__text">
                    {banners.length >= 4 ? "Batas maksimum 4 banner" : "Klik atau drag & drop banner"}
                  </p>
                  <p className="upload-zone__hint">{banners.length}/4 banner</p>
                </div>
                {banners.length > 0 && (
                  <div className="add-blog-banner-grid">
                    {banners.map((b, i) => (
                      <div key={i} className="add-blog-banner-item">
                        <img src={b.preview} alt="" className="add-blog-banner-item__img" />
                        <div className="add-blog-banner-item__overlay">
                          <button type="button" onClick={() => removeBanner(i)} className="add-blog-banner-item__remove">
                            <X size={16} />
                          </button>
                          <span className="add-blog-banner-item__badge">Banner {i + 1}</span>
                        </div>
                      </div>
                    ))}
                    {banners.length < 4 && (
                      <button
                        type="button"
                        className="add-blog-banner-add-more"
                        onClick={() => bannerInputRef.current?.click()}
                      >
                        <Plus size={28} />
                        <span>Tambah</span>
                      </button>
                    )}
                  </div>
                )}
              </div>
            </div>

            <div className="form-row">
              <div className="form-group form-group--full">
                <label className="form-label">Galeri Foto (Opsional)</label>
                <div
                  className="upload-zone upload-zone--small"
                  {...createDropHandler(handleGalleryAdd)}
                  onClick={() => galleryInputRef.current?.click()}
                >
                  <input
                    ref={galleryInputRef}
                    type="file"
                    accept="image/*"
                    multiple
                    hidden
                    onChange={(e) => handleGalleryAdd(e.target.files)}
                  />
                  <Upload size={28} className="upload-zone__icon" />
                  <p className="upload-zone__text">Klik atau drag & drop foto</p>
                  <p className="upload-zone__hint">JPG, PNG, WEBP — bisa multiple file</p>
                </div>
                {gallery.length > 0 && (
                  <div className="add-blog-gallery-grid">
                    {gallery.map((img, i) => (
                      <div key={i} className="add-blog-gallery-item">
                        <img src={img.preview} alt="" className="add-blog-gallery-item__img" />
                        <button
                          type="button"
                          className="add-blog-gallery-item__remove"
                          onClick={() => removeGallery(i)}
                        >
                          <X size={12} />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
                {gallery.length === 0 && (
                  <p className="add-blog-gallery-empty">Belum ada foto diupload</p>
                )}
              </div>
            </div>

            {/* ── SUBMIT ACTIONS ── */}
            <div className="add-blog-submit-actions">
              {isEditing && (
                <button type="button" onClick={handleDelete} disabled={deleting} className="add-blog-delete-btn">
                  {deleting ? <><Loader2 size={18} className="spin" /> Menghapus...</> : <><Trash2 size={18} /> Hapus</>}
                </button>
              )}
              <button type="submit" disabled={submitting} className="add-blog-submit-btn">
                {submitting ? (
                  <><Loader2 size={18} className="spin" /> Menyimpan...</>
                ) : (
                  <><Send size={18} /> {form.status === "published" ? (contentType === "event" ? "Terbitkan Event" : "Terbitkan Blog") : "Simpan Draft"}</>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

