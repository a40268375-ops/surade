import { useParams, Link } from "react-router-dom";
import { useEffect, useState } from "react";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import api from "../services/api";
import { requireAuth } from "../utils/authCheck";
import logoImg from "../assets/logo-surade.png";
import {
  User,
  Calendar,
  Clock,
  ArrowLeft,
  Eye,
  Tag,
  MapPin,
  Share2,
  Bookmark,
  ArrowRight,
  ChevronLeft,
  ChevronRight,
  X,
  Loader2,
  CheckCircle,
} from "lucide-react";
import "./BlogDetail.css";
import { DEFAULT_AVATAR } from "../utils/constants";

const defaultImg = "https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=1200&h=600&fit=crop";

export default function BlogDetail() {
  const { id } = useParams();
  const [blog, setBlog] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [saved, setSaved] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);

  useEffect(() => {
    window.scrollTo(0, 0);
    fetchBlog();
  }, [id]);

  const fetchBlog = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await api.get(`/blogs/${id}`);
      const data = res.data?.data || res.data;
      if (!data || !data.id) throw new Error("Blog tidak ditemukan");
      setBlog(data);
      
      const userStr = localStorage.getItem("user");
      const user = userStr ? JSON.parse(userStr) : null;
      let localBlogIds = [];
      try {
        localBlogIds = JSON.parse(localStorage.getItem("saved_blog_ids") || "[]");
      } catch (e) {}

      const isFavApi = user && data.favorites && data.favorites.some(f => f.user_id === user.id);
      const isFavLocal = localBlogIds.includes(data.id) || localBlogIds.includes(String(data.id));

      if (isFavApi || isFavLocal) {
        setSaved(true);
      }
    } catch (err) {
      setError(err?.response?.data?.message || err.message || "Blog tidak ditemukan");
    } finally {
      setLoading(false);
    }
  };

  // Keyboard navigation for lightbox
  useEffect(() => {
    if (!lightboxOpen) return;
    const handleKeyDown = (e) => {
      if (e.key === "Escape") setLightboxOpen(false);
      if (e.key === "ArrowLeft" && blog?.images?.length) {
        setSelectedImageIndex((prev) => (prev === 0 ? blog.images.length - 1 : prev - 1));
      }
      if (e.key === "ArrowRight" && blog?.images?.length) {
        setSelectedImageIndex((prev) => (prev === blog.images.length - 1 ? 0 : prev + 1));
      }
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [lightboxOpen, blog]);

  const handleShare = async () => {
    const url = window.location.href;
    if (navigator.share) {
      await navigator.share({ title: blog.title, url });
    } else {
      await navigator.clipboard.writeText(url);
      alert("Link berhasil disalin!");
    }
  };

  const handleToggleSave = async () => {
    if (!requireAuth()) return;
    
    if (isSaving || !blog) return;
    setIsSaving(true);

    const isCurrentlySaved = saved;
    setSaved(!isCurrentlySaved);

    let localBlogs = JSON.parse(localStorage.getItem("saved_blog_ids") || "[]");
    if (isCurrentlySaved) {
      localBlogs = localBlogs.filter(id => String(id) !== String(blog.id));
    } else {
      if (!localBlogs.includes(blog.id)) localBlogs.push(blog.id);
    }
    localStorage.setItem("saved_blog_ids", JSON.stringify(localBlogs));
    localStorage.removeItem("cached_saved_items");
    
    try {
      if (isCurrentlySaved) {
        await api.delete(`/blog-favorites/${blog.id}`);
        alert("Bookmark artikel berhasil dihapus.");
      } else {
        await api.post(`/blog-favorites/${blog.id}`);
        alert("Artikel berhasil disimpan ke bookmark!");
      }
      window.dispatchEvent(new Event("bookmarkChanged"));
    } catch (err) {
      console.error("Failed to toggle favorite:", err);
      setSaved(isCurrentlySaved);
      alert("Terjadi kesalahan saat menyimpan bookmark.");
    } finally {
      setIsSaving(false);
    }
  };

  const getCategoryLabel = (cat) => {
    const labels = { budaya: "Budaya", kuliner: "Kuliner", wisata: "Wisata", teknologi: "Teknologi" };
    return labels[cat] || cat || "Umum";
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return "";
    const d = new Date(dateStr);
    return d.toLocaleDateString("id-ID", { year: "numeric", month: "long", day: "numeric" });
  };

  const getReadTime = (content) => {
    if (!content) return "1 min";
    const words = content.split(/\s+/).length;
    const min = Math.ceil(words / 200);
    return min + " min";
  };

  const getStorageUrl = (path) => {
    if (!path) return "";
    if (path.startsWith("http")) return path;
    const baseUrl = import.meta.env.VITE_API_URL.replace(/\/api$/i, "");
    return `${baseUrl}/storage/${path}`;
  };

  const getThumbnailUrl = () => {
    if (!blog?.thumbnail) return defaultImg;
    return getStorageUrl(blog.thumbnail);
  };

  const getImageUrl = (img) => {
    if (!img) return "";
    return getStorageUrl(img);
  };

  const getUserAvatar = () => {
    if (blog?.user?.avatar) {
      return getStorageUrl(blog.user.avatar);
    }
    return DEFAULT_AVATAR;
  };

  if (loading) {
    return (
      <div className="blog-detail-page">
        <Navbar />
        <div className="blog-detail__not-found">
          <Loader2 size={40} className="spin" style={{ marginBottom: "16px", color: "#007570" }} />
          <h2>Memuat artikel...</h2>
        </div>
      </div>
    );
  }

  if (error || !blog) {
    return (
      <div className="blog-detail-page">
        <Navbar />
        <div className="blog-detail__not-found">
          <h2>Blog tidak ditemukan</h2>
          <p style={{ color: "#64748b", marginBottom: "20px" }}>{error}</p>
          <Link to="/blog" className="blog-detail__back-link">Kembali ke Blog</Link>
        </div>
      </div>
    );
  }

  const parseImages = (imgs) => {
    if (!imgs) return [];
    if (Array.isArray(imgs)) return imgs;
    if (typeof imgs === "string") {
      try {
        const parsed = JSON.parse(imgs);
        return Array.isArray(parsed) ? parsed : [imgs];
      } catch (e) {
        return [imgs];
      }
    }
    return [];
  };
  const images = parseImages(blog.images);

  return (
    <div className="blog-detail-page">
      <Navbar />

      {/* ── HERO ── */}
      <section className="bdg-hero">
        <div className="bdg-hero__bg">
          <img src={getThumbnailUrl()} alt={blog.title} className="bdg-hero__img" />
        </div>
        <div className="bdg-hero__overlay" />
        <div className="bdg-hero__content">
          <div className="bdg-hero__inner">
            <div className="bdg-hero__breadcrumb">
              <Link to="/">Home</Link>
              <span>/</span>
              <Link to="/blog">{blog.type === "event" ? "Event" : "Blog"}</Link>
              <span>/</span>
              <span>{blog.title}</span>
            </div>

            <div style={{ marginBottom: "12px" }}>
              <span className={`blog-badge-tag ${blog.type === "event" ? "blog-badge-tag--event" : "blog-badge-tag--blog"}`}>
                {blog.type === "event" ? "ACARA / EVENT" : "ARTIKEL / BLOG"}
              </span>
            </div>

            <h1 className="bdg-hero__title">{blog.title}</h1>
            {blog.excerpt && <p className="bdg-hero__excerpt">{blog.excerpt}</p>}

            <div className="bdg-hero__meta">
              <span className="bdg-hero__meta-item">
                <User size={15} />
                <span>{blog.user?.name || "Penulis"}</span>
              </span>
              {blog.type === "event" && blog.event_date ? (
                <span className="bdg-hero__meta-item">
                  <Calendar size={15} />
                  <span>Pelaksanaan: {formatDate(blog.event_date)}</span>
                </span>
              ) : (
                <span className="bdg-hero__meta-item">
                  <Calendar size={15} />
                  <span>{formatDate(blog.published_at || blog.created_at)}</span>
                </span>
              )}
              {blog.type === "event" && blog.event_location && (
                <span className="bdg-hero__meta-item">
                  <MapPin size={15} />
                  <span>{blog.event_location}</span>
                </span>
              )}
              <span className="bdg-hero__meta-item">
                <Clock size={15} />
                <span>{getReadTime(blog.content)}</span>
              </span>
            </div>

            <Link to="/blog" className="bdg-hero__back">
              <ArrowLeft size={16} />
              <span>Kembali ke Blog</span>
            </Link>
          </div>
        </div>
      </section>

      {/* ── MAIN CONTENT ── */}
      <section className="bdg-content">
        <div className="bdg-content__inner">
          <div className="bdg-content__main">
            {/* Author & Meta Bar */}
            <div className="bdg-meta-bar">
              <div className="bdg-meta-bar__author">
                <img src={getUserAvatar()} alt={blog.user?.name || "Penulis"} className="bdg-meta-bar__avatar" />
                <div>
                  <span className="bdg-meta-bar__name">{blog.user?.name || "Penulis"}</span>
                  <span className="bdg-meta-bar__role">
                    <CheckCircle size={12} /> Penulis Terverifikasi
                  </span>
                </div>
              </div>
              <div className="bdg-meta-bar__stats">
                <span className="bdg-meta-bar__stat">
                  <Calendar size={14} />
                  {formatDate(blog.published_at || blog.created_at)}
                </span>
                <span className="bdg-meta-bar__stat">
                  <Clock size={14} />
                  {getReadTime(blog.content)}
                </span>
                <span className="bdg-meta-bar__stat">
                  <Eye size={14} />
                  {(blog.views || 0).toLocaleString()} dilihat
                </span>
              </div>
            </div>

            {/* Article Body */}
            <article className="bdg-article">
              <h2 className="bdg-article__main-title">{blog.title}</h2>
              {blog.excerpt && <p className="bdg-article__excerpt">{blog.excerpt}</p>}
              <div
                className="bdg-article__content"
                dangerouslySetInnerHTML={{ __html: blog.content }}
              />
            </article>

            {/* Gallery Section */}
            {images.length > 0 && (
              <div className="bdg-gallery">
                <h3 className="bdg-gallery__title">
                  <MapPin size={16} /> Galeri Foto
                </h3>
                <div className="bdg-gallery__grid">
                  {images.map((imgSrc, idx) => (
                    <div
                      key={idx}
                      className="bdg-gallery__item"
                      onClick={() => {
                        setSelectedImageIndex(idx);
                        setLightboxOpen(true);
                      }}
                    >
                      <img src={getImageUrl(imgSrc)} alt={`${blog.title} - ${idx + 1}`} loading="lazy" />
                      <div className="bdg-gallery__overlay">
                        <span className="bdg-gallery__zoom">+</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Tags */}
            {blog.blog_category && (
              <div className="bdg-tags">
                <h3 className="bdg-tags__title">
                  <Tag size={16} /> Kategori
                </h3>
                <div className="bdg-tags__list">
                  <span className="bdg-tag">{getCategoryLabel(blog.blog_category)}</span>
                </div>
              </div>
            )}

            {/* Share & Save Actions */}
            <div className="bdg-actions">
              <button
                type="button"
                className={`bdg-action-btn ${saved ? "active" : ""} ${isSaving ? "disabled" : ""}`}
                onClick={handleToggleSave}
                disabled={isSaving}
              >
                <Bookmark size={18} fill={saved ? "currentColor" : "none"} />
                <span>{saved ? "Tersimpan" : "Simpan"}</span>
              </button>
              <button type="button" className="bdg-action-btn" onClick={handleShare}>
                <Share2 size={18} />
                <span>Bagikan</span>
              </button>
              <Link to="/blog" className="bdg-action-btn bdg-action-btn--back">
                <ArrowLeft size={18} />
                <span>Kembali</span>
              </Link>
            </div>
          </div>

          {/* ── SIDEBAR ── */}
          <aside className="bdg-sidebar">
            {/* Blog/Event Info Card */}
            <div className="bdg-sidebar-card">
              <h3 className="bdg-sidebar-card__title">
                {blog.type === "event" ? "Informasi Event" : "Informasi Blog"}
              </h3>
              <div className="bdg-info-list">
                {blog.type === "event" && blog.event_date && (
                  <div className="bdg-info-item">
                    <Calendar size={16} />
                    <div>
                      <span className="bdg-info-label">Tanggal Pelaksanaan</span>
                      <span className="bdg-info-value" style={{ color: "#007570", fontWeight: "700" }}>
                        {formatDate(blog.event_date)}
                      </span>
                    </div>
                  </div>
                )}
                {blog.type === "event" && blog.event_location && (
                  <div className="bdg-info-item">
                    <MapPin size={16} />
                    <div>
                      <span className="bdg-info-label">Lokasi Event</span>
                      <span className="bdg-info-value">{blog.event_location}</span>
                    </div>
                  </div>
                )}
                <div className="bdg-info-item">
                  <Calendar size={16} />
                  <div>
                    <span className="bdg-info-label">Tanggal Publikasi</span>
                    <span className="bdg-info-value">{formatDate(blog.published_at || blog.created_at)}</span>
                  </div>
                </div>
                <div className="bdg-info-item">
                  <Clock size={16} />
                  <div>
                    <span className="bdg-info-label">Waktu Baca</span>
                    <span className="bdg-info-value">{getReadTime(blog.content)}</span>
                  </div>
                </div>
                <div className="bdg-info-item">
                  <Eye size={16} />
                  <div>
                    <span className="bdg-info-label">Total Dilihat</span>
                    <span className="bdg-info-value">{(blog.views || 0).toLocaleString()}x</span>
                  </div>
                </div>
                <div className="bdg-info-item">
                  <Tag size={16} />
                  <div>
                    <span className="bdg-info-label">Kategori</span>
                    <span className="bdg-info-value">{getCategoryLabel(blog.blog_category)}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Kategori */}
            <div className="bdg-sidebar-card">
              <h3 className="bdg-sidebar-card__title">Kategori</h3>
              <div className="bdg-category-list">
                {["budaya", "kuliner", "wisata", "teknologi"].map((cat) => (
                  <Link
                    key={cat}
                    to={`/blog?category=${cat}`}
                    className={`bdg-category-item ${blog.blog_category === cat ? "active" : ""}`}
                  >
                    <span>{getCategoryLabel(cat)}</span>
                    <ArrowRight size={14} />
                  </Link>
                ))}
              </div>
            </div>
          </aside>
        </div>
      </section>

      {/* ── FOOTER ── */}
      <Footer />

      {/* ── LIGHTBOX ── */}
      {lightboxOpen && images.length > 0 && (
        <div className="bdg-lightbox" onClick={() => setLightboxOpen(false)}>
          <div className="bdg-lightbox__overlay" />
          <div className="bdg-lightbox__content" onClick={(e) => e.stopPropagation()}>
            <button
              className="bdg-lightbox__close"
              onClick={() => setLightboxOpen(false)}
              aria-label="Tutup"
            >
              <X size={24} />
            </button>
            <button
              className="bdg-lightbox__nav bdg-lightbox__nav--prev"
              onClick={() =>
                setSelectedImageIndex((prev) =>
                  prev === 0 ? images.length - 1 : prev - 1
                )
              }
              aria-label="Sebelumnya"
            >
              <ChevronLeft size={28} />
            </button>
            <button
              className="bdg-lightbox__nav bdg-lightbox__nav--next"
              onClick={() =>
                setSelectedImageIndex((prev) =>
                  prev === images.length - 1 ? 0 : prev + 1
                )
              }
              aria-label="Selanjutnya"
            >
              <ChevronRight size={28} />
            </button>
            <div className="bdg-lightbox__counter">
              {selectedImageIndex + 1} / {images.length}
            </div>
            <img
              src={getImageUrl(images[selectedImageIndex])}
              alt={`${blog.title} - ${selectedImageIndex + 1}`}
              className="bdg-lightbox__img"
            />
          </div>
        </div>
      )}
    </div>
  );
}