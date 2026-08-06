import { useParams, Link } from "react-router-dom";
import { useEffect, useState } from "react";
import Navbar from "../components/Navbar";
import api from "../services/api";
import logoImg from "../assets/logo.png";
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
      if (user && data.favorites && data.favorites.some(f => f.user_id === user.id)) {
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
    const userStr = localStorage.getItem("user");
    if (!userStr) {
      alert("Silakan login terlebih dahulu untuk menyimpan artikel.");
      return;
    }
    
    if (isSaving || !blog) return;
    setIsSaving(true);
    
    try {
      if (saved) {
        await api.delete(`/blog-favorites/${blog.id}`);
        setSaved(false);
      } else {
        await api.post(`/blog-favorites/${blog.id}`);
        setSaved(true);
      }
    } catch (err) {
      console.error("Failed to toggle favorite:", err);
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

  const images = Array.isArray(blog.images) ? blog.images : [];

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
              <Link to="/blog">Blog</Link>
              <span>/</span>
              <span>{blog.title}</span>
            </div>
            <div className="bdg-hero__category-badge">{getCategoryLabel(blog.blog_category)}</div>
            <h1 className="bdg-hero__title">{blog.title}</h1>
            {blog.excerpt && <p className="bdg-hero__excerpt">{blog.excerpt}</p>}
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
                  <span className="bdg-meta-bar__role">Penulis</span>
                </div>
              </div>
              <div className="bdg-meta-bar__stats">
                <span className="bdg-meta-bar__stat">
                  <Calendar size={15} />
                  {formatDate(blog.published_at || blog.created_at)}
                </span>
                <span className="bdg-meta-bar__stat">
                  <Clock size={15} />
                  {getReadTime(blog.content)}
                </span>
                <span className="bdg-meta-bar__stat">
                  <Eye size={15} />
                  {(blog.views || 0).toLocaleString()} dilihat
                </span>
              </div>
            </div>

            {/* Article Body */}
            <article className="bdg-article">
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
            {/* Author Card */}
            <div className="bdg-sidebar-card">
              <h3 className="bdg-sidebar-card__title">Penulis</h3>
              <div className="bdg-author-card">
                <img src={getUserAvatar()} alt={blog.user?.name || "Penulis"} className="bdg-author-card__avatar" />
                <div className="bdg-author-card__info">
                  <span className="bdg-author-card__name">{blog.user?.name || "Penulis"}</span>
                  <span className="bdg-author-card__role">Kontributor Blog</span>
                </div>
                <p className="bdg-author-card__bio">
                  {blog.user?.bio || "Penulis kontributor portal Info.co.id."}
                </p>
              </div>
            </div>

            {/* Blog Info Card */}
            <div className="bdg-sidebar-card">
              <h3 className="bdg-sidebar-card__title">Informasi Blog</h3>
              <div className="bdg-info-list">
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
      <footer className="footer">
        <div className="footer-inner">
          <div className="footer-cols">
            <div className="footer-col footer-col--brand">
              <Link to="/" className="footer-logo">
                <img src={logoImg} alt="Info.co.id" className="footer-logo__img" />
              </Link>
              <p className="footer-desc">
                info.co.id adalah portal informasi yang menyajikan data dan berita terpercaya dari berbagai sumber resmi di Indonesia.
              </p>
              <div className="footer-social">
                <a href="#" className="footer-social__link" aria-label="Instagram">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect>
                    <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path>
                    <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line>
                  </svg>
                </a>
                <a href="#" className="footer-social__link" aria-label="Twitter">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M22 4s-.7 2.1-2 3.4c1.6 10-9.4 17.3-18 11.6 2.2.1 4.4-.6 6-2C3 15.5.5 9.6 3 5c2.2 2.6 5.6 4.1 9 4-.9-4.2 4-6.6 7-3.8 1.1 0 3-1.2 3-1.2z"></path>
                  </svg>
                </a>
                <a href="#" className="footer-social__link" aria-label="Facebook">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"></path>
                  </svg>
                </a>
                <a href="#" className="footer-social__link" aria-label="WhatsApp">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"></path>
                  </svg>
                </a>
                <a href="#" className="footer-social__link" aria-label="YouTube">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M22.54 6.42a2.78 2.78 0 0 0-1.94-2C18.88 4 12 4 12 4s-6.88 0-8.6.46a2.78 2.78 0 0 0-1.94 2A29 29 0 0 0 1 11.75a29 29 0 0 0 .46 5.33A2.78 2.78 0 0 0 3.4 19c1.72.46 8.6.46 8.6.46s6.88 0 8.6-.46a2.78 2.78 0 0 0 1.94-2 29 29 0 0 0 .46-5.25 29 29 0 0 0-.46-5.33z"></path>
                    <polygon points="9.75 15.02 15.5 11.75 9.75 8.48 9.75 15.02"></polygon>
                  </svg>
                </a>
              </div>
            </div>
            <div className="footer-col">
              <h4 className="footer-heading">Tentang Kami</h4>
              <ul className="footer-links">
                <li><Link to="/about">Tentang Info.co.id</Link></li>
                <li><Link to="/vision-mission">Visi &amp; Misi</Link></li>
                <li><Link to="/partnership-career">Kerjasama &amp; Karir</Link></li>
              </ul>
            </div>
            <div className="footer-col">
              <h4 className="footer-heading">Bantuan</h4>
              <ul className="footer-links">
                <li><a href="#">FAQ</a></li>
                <li><Link to="/terms">Syarat &amp; Ketentuan</Link></li>
                <li><Link to="/contact">Hubungi Kami</Link></li>
              </ul>
            </div>
            <div className="footer-col">
              <h4 className="footer-heading">Kontak Kami</h4>
              <ul className="footer-links">
                <li><a href="mailto:support@info.co.id">support@info.co.id</a></li>
                <li><span className="footer-text">(021) 1234 5678</span></li>
                <li><span className="footer-text">Jalan Mercurius 16680 Dramaga West Java</span></li>
              </ul>
            </div>
          </div>
        </div>
        <div className="footer-bottom">
          <div className="footer-bottom__inner">
            <p className="footer-copyright">&copy; 2024 Info.co.id. All rights reserved.</p>
            <div className="footer-bottom-links">
              <a href="#">Privasi</a>
              <Link to="/terms">Syarat &amp; Ketentuan</Link>
              <a href="#">Sitemap</a>
            </div>
          </div>
        </div>
      </footer>

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

