import { useState, useEffect, useMemo } from "react";
import { Link, useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import api from "../services/api";
import { requireAuth } from "../utils/authCheck";
import { InlineSpinner } from "../components/LoadingScreen";
import {
  User,
  Calendar,
  Clock,
  ArrowRight,
  Search,
  BookOpen,
  MapPin,
  X,
  Tag,
  Bookmark,
  PlusCircle,
  Sparkles,
  Zap,
  CheckCircle,
  ExternalLink,
} from "lucide-react";
import "./Blog.css";
import { DEFAULT_AVATAR, getStorageUrl } from "../utils/constants";
import blogHeroBg from "../assets/blog-hero-bg.jpg";

export default function Blog() {
  const navigate = useNavigate();
  const [activeType, setActiveType] = useState("all"); // 'all' | 'blog' | 'event'
  const [activeCategory, setActiveCategory] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [blogs, setBlogs] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saved, setSaved] = useState({});

  // Daftar kategori baku sesuai tabel blog_categories
  const MASTER_CATEGORIES = [
    "Bisnis & UMKM",
    "Kuliner & Kafe",
    "Teknologi & Digital",
    "Kesehatan & Gaya Hidup",
    "Event & Festival",
    "Pendidikan & Edukasi",
    "Travel & Wisata",
    "Promo & Diskon",
    "Tips & Tutorial",
    "Berita & Informasi",
  ];

  useEffect(() => {
    window.scrollTo(0, 0);
    document.title = "Berita & Kabar Daerah - Surade.com";
    fetchBlogs();
  }, []);

  const handleCreatePostClick = (targetType) => {
    const token = localStorage.getItem("token");
    if (!token) {
      if (requireAuth()) return;
      return;
    }

    navigate(`/add-blog?type=${targetType}`);
  };

  const fetchUserSavedState = async () => {
    const token = localStorage.getItem("token");
    const blogSavedMap = {};

    try {
      const localBlogs = JSON.parse(localStorage.getItem("saved_blog_ids") || "[]");
      (Array.isArray(localBlogs) ? localBlogs : []).forEach(id => { blogSavedMap[id] = true; });
    } catch (e) {}

    if (token) {
      try {
        const resBlog = await api.get("/my-blog-favorites");
        const blogData = resBlog.data?.data || resBlog.data || [];
        const blogArr = Array.isArray(blogData) ? blogData : (blogData?.data || []);
        blogArr.forEach(fav => {
          const bId = fav.blog_id || fav.blog?.id || fav.id;
          if (bId) blogSavedMap[bId] = true;
        });
      } catch (err) {
        console.error("Failed to fetch favorites in Blog:", err);
      }
    }

    setSaved(blogSavedMap);
  };

  useEffect(() => {
    fetchUserSavedState();
    window.addEventListener("bookmarkChanged", fetchUserSavedState);
    return () => window.removeEventListener("bookmarkChanged", fetchUserSavedState);
  }, []);

  const toggleSave = async (id, itemName = "") => {
    if (!id) return;
    if (!requireAuth()) return;

    const isCurrentlySaved = !!saved[id];
    setSaved((prev) => ({ ...prev, [id]: !isCurrentlySaved }));

    let localItems = JSON.parse(localStorage.getItem("saved_blog_ids") || "[]");
    if (isCurrentlySaved) {
      localItems = localItems.filter(item => String(item) !== String(id));
    } else {
      if (!localItems.includes(id)) localItems.push(id);
    }
    localStorage.setItem("saved_blog_ids", JSON.stringify(localItems));
    localStorage.removeItem("cached_saved_items");
    window.dispatchEvent(new Event("bookmarkChanged"));

    if (isCurrentlySaved) {
      alert(`${itemName ? `"${itemName}"` : "Konten"} berhasil dihapus dari bookmark.`);
    } else {
      alert(`${itemName ? `"${itemName}"` : "Konten"} berhasil disimpan ke bookmark!`);
    }

    try {
      if (isCurrentlySaved) {
        await api.delete(`/blog-favorites/${id}`);
      } else {
        await api.post(`/blog-favorites/${id}`);
      }
    } catch (err) {
      console.error("Failed to toggle favorite API:", err);
    }
  };

  const getCategoryName = (cat) => {
    if (!cat) return "";
    if (typeof cat === "object") return cat.name || cat.title || "";
    return String(cat);
  };

  const fetchBlogs = async () => {
    try {
      const res = await api.get("/blogs?status=published&all=true");
      const raw = res.data?.data || res.data || [];
      const data = Array.isArray(raw) ? raw : (raw?.data || []);
      setBlogs(data);
      // Kategori diambil dari MASTER_CATEGORIES, tidak dari data blog
    } catch (err) {
      console.error("Failed to fetch blogs:", err);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return "";
    const d = new Date(dateStr);
    return isNaN(d.getTime()) ? dateStr : d.toLocaleDateString("id-ID", { year: "numeric", month: "long", day: "numeric" });
  };

  const getReadTime = (content) => {
    if (!content) return "1 min";
    const words = content.split(/\s+/).length;
    const min = Math.ceil(words / 200);
    return min + " min";
  };

  const getThumbnailUrl = (blog) => {
    if (blog?.thumbnail) {
      if (typeof blog.thumbnail === "string" && (blog.thumbnail.includes("real_images") || blog.thumbnail.includes("real_blogs"))) {
        const fn = blog.thumbnail.split("/").pop();
        return `/images/real_blogs/${fn}`;
      }
      return getStorageUrl(blog.thumbnail);
    }
    return "https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=800&h=500&fit=crop";
  };

  const getUserAvatar = (blog) => {
    if (blog?.user?.avatar) {
      return getStorageUrl(blog.user.avatar);
    }
    return DEFAULT_AVATAR;
  };

  // ── Counts for Type Filter ──
  const countAll = blogs.length;
  const countBlog = blogs.filter(b => b.type === "blog" || !b.type).length;
  const countEvent = blogs.filter(b => b.type === "event").length;

  // ── Filter & Sort logic: Type + Category + Search + Prioritas Hari-H Event & Info Baru ──
  const filteredPosts = useMemo(() => {
    const list = blogs.filter((post) => {
      // 1. Type filter
      const postType = post.type || "blog";
      const matchesType = activeType === "all" || postType === activeType;

      // 2. Category filter
      const postCat = getCategoryName(post.blog_category || post.category).toLowerCase();
      const matchesCategory = activeCategory === "all" || postCat === activeCategory.toLowerCase();

      // 3. Search query
      const q = searchQuery.toLowerCase().trim();
      const matchesSearch = !q ||
        (post.title || "").toLowerCase().includes(q) ||
        (post.excerpt || "").toLowerCase().includes(q) ||
        (post.content || "").toLowerCase().includes(q) ||
        postCat.includes(q) ||
        (post.event_location || "").toLowerCase().includes(q);

      return matchesType && matchesCategory && matchesSearch;
    });

    const now = new Date();
    now.setHours(0, 0, 0, 0);

    return [...list].sort((a, b) => {
      const timeA = new Date(a.published_at || a.created_at || 0).getTime();
      const timeB = new Date(b.published_at || b.created_at || 0).getTime();
      return timeB - timeA;
    });
  }, [blogs, activeType, activeCategory, searchQuery]);

  return (
    <div className="blog-page">
      {/* ── NAVBAR ── */}
      <Navbar />

      {/* ── BLOG HERO ── */}
      <section className="blog-hero">
        <div className="blog-hero__bg" style={{ backgroundImage: `url(${blogHeroBg})` }} />
        <div className="blog-hero__overlay" />
        <div className="blog-hero__content">
          <div className="blog-hero__breadcrumb">
            <Link to="/">Home</Link>
            <span className="separator">/</span>
            <span>Info & Event</span>
          </div>
          <h1 className="blog-hero__title">Info & Event</h1>
          <p className="blog-hero__subtitle">Jelajahi Wawasan Bisnis, Berita & Info Terkini, serta Agenda Event Menarik di Surade</p>
          
          {/* Action Buttons */}
          <div style={{ display: "flex", gap: "0.75rem", justifyContent: "center", marginTop: "1.25rem", flexWrap: "wrap" }}>
            <button
              type="button"
              onClick={() => handleCreatePostClick("blog")}
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "0.5rem",
                background: "linear-gradient(135deg, #007570 0%, #00a896 100%)",
                color: "#ffffff",
                padding: "0.625rem 1.25rem",
                borderRadius: "9999px",
                border: "2px solid rgba(255,255,255,0.2)",
                fontSize: "0.875rem",
                fontWeight: 700,
                cursor: "pointer",
                boxShadow: "0 4px 14px rgba(0,117,112,0.4)",
                transition: "all 0.2s",
              }}
            >
              <BookOpen size={16} />
              <span>+ Buat Info Baru</span>
            </button>

            <button
              type="button"
              onClick={() => handleCreatePostClick("event")}
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "0.5rem",
                background: "linear-gradient(135deg, #059669 0%, #10b981 100%)",
                color: "#ffffff",
                padding: "0.625rem 1.25rem",
                borderRadius: "9999px",
                border: "2px solid rgba(255,255,255,0.2)",
                fontSize: "0.875rem",
                fontWeight: 700,
                cursor: "pointer",
                boxShadow: "0 4px 14px rgba(5,150,105,0.4)",
                transition: "all 0.2s",
              }}
            >
              <Calendar size={16} />
              <span>+ Buat Event Baru</span>
            </button>
          </div>
        </div>
      </section>

      {/* ── BLOG CONTENT ── */}
      <section className="blog-content">
        <div className="blog-content__inner">
          {/* Search & Filter Controls */}
          <div className="blog-controls">
            {/* Search Bar */}
            <div className="blog-search-wrap">
              <div className="blog-search">
                <Search size={18} className="blog-search__icon" />
                <input
                  type="text"
                  placeholder="Cari blog, artikel, atau event..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="blog-search__input"
                />
                {searchQuery && (
                  <button
                    type="button"
                    className="blog-search__clear"
                    onClick={() => setSearchQuery("")}
                    aria-label="Hapus Pencarian"
                  >
                    <X size={16} />
                  </button>
                )}
              </div>
            </div>

            {/* Primary Type Filter Tabs (Semua, Blog, Event) */}
            <div className="blog-filter-section">
              <div className="blog-type-tabs">
                <button
                  type="button"
                  className={`blog-type-tab${activeType === "all" ? " active" : ""}`}
                  onClick={() => {
                    setActiveType("all");
                    setActiveCategory("all");
                  }}
                >
                  <span>Semua</span>
                  <span className="blog-type-count">{countAll}</span>
                </button>

                <button
                  type="button"
                  className={`blog-type-tab blog-type-tab--blog${activeType === "blog" ? " active" : ""}`}
                  onClick={() => {
                    setActiveType("blog");
                    setActiveCategory("all");
                  }}
                >
                  <BookOpen size={16} />
                  <span>Info</span>
                  <span className="blog-type-count">{countBlog}</span>
                </button>

                <button
                  type="button"
                  className={`blog-type-tab blog-type-tab--event${activeType === "event" ? " active" : ""}`}
                  onClick={() => {
                    setActiveType("event");
                    setActiveCategory("all");
                  }}
                >
                  <Calendar size={16} />
                  <span>Event</span>
                  <span className="blog-type-count">{countEvent}</span>
                </button>
              </div>

              {/* Topic Category Pills - pakai daftar kategori baku */}
              <div className="blog-categories">
                <button
                  type="button"
                  className={`blog-category-btn${activeCategory === "all" ? " active" : ""}`}
                  onClick={() => setActiveCategory("all")}
                >
                  Semua Kategori
                </button>
                {MASTER_CATEGORIES.filter((cat) => {
                  // Hanya tampilkan kategori yang ada isinya
                  return blogs.some((b) => {
                    const bCat = getCategoryName(b.blog_category || b.category);
                    return bCat.toLowerCase() === cat.toLowerCase();
                  });
                }).map((cat) => (
                  <button
                    key={cat}
                    type="button"
                    className={`blog-category-btn${activeCategory.toLowerCase() === cat.toLowerCase() ? " active" : ""}`}
                    onClick={() => setActiveCategory(cat)}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>
          </div>


          {/* Loading */}
          {loading && (
            <InlineSpinner text="Memuat data info & event..." />
          )}

          {/* Info & Event Grid */}
          {!loading && (
            <div className="blog-grid">
              {filteredPosts.map((post) => {
                const isEvent = post.type === "event";
                const eventDateFormatted = isEvent && post.event_date ? formatDate(post.event_date) : "";
                const postDateFormatted = formatDate(post.published_at || post.created_at);
                const categoryName = getCategoryName(post.blog_category || post.category);

                return (
                  <article key={post.id} className={`blog-card${isEvent ? " blog-card--event" : ""}`}>
                    {/* Card Media Wrapper */}
                    <div className="blog-card__img-wrap">
                      <Link to={`/blog/${post.slug || post.id}`} className="blog-card__img-link">
                        <img
                          src={getThumbnailUrl(post)}
                          alt={post.title}
                          className="blog-card__img"
                          loading="lazy"
                          onError={(e) => {
                            e.currentTarget.onerror = null;
                            const fn = post.thumbnail ? post.thumbnail.split("/").pop() : "";
                            if (fn && (fn.startsWith("blog_") || fn.startsWith("event_"))) {
                              e.currentTarget.src = `/images/real_blogs/${fn}`;
                            } else {
                              e.currentTarget.src = "https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=800&h=500&fit=crop";
                            }
                          }}
                        />
                        <div className="blog-card__img-overlay" />
                      </Link>

                      {/* Type Badge */}
                      <span className={`blog-badge-tag ${isEvent ? "blog-badge-tag--event" : "blog-badge-tag--blog"}`}>
                        {isEvent ? (
                          <>
                            <Calendar size={12} className="shrink-0" />
                            <span>EVENT</span>
                          </>
                        ) : (
                          <>
                            <BookOpen size={12} className="shrink-0" />
                            <span>INFO</span>
                          </>
                        )}
                      </span>

                      {/* Bookmark Save Button */}
                      <button
                        type="button"
                        className={`blog-card__save-btn biz-card__save${saved[post.id] ? " saved" : ""}`}
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          toggleSave(post.id, post.title);
                        }}
                        aria-label={saved[post.id] ? "Hapus dari Simpanan" : "Simpan Konten"}
                        title={saved[post.id] ? "Hapus dari Simpanan" : "Simpan Konten"}
                      >
                        <Bookmark size={15} className="shrink-0" fill={saved[post.id] ? "currentColor" : "none"} />
                        <span className="blog-card__save-text">{saved[post.id] ? "Tersimpan" : "Simpan"}</span>
                      </button>
                    </div>

                    {/* Card Content Body */}
                    <div className="blog-card__body">
                      {/* Top Category & Type Meta */}
                      <div className="blog-card__top-meta">
                        {categoryName && (
                          <span className="blog-card__category-pill">
                            {categoryName}
                          </span>
                        )}
                        {isEvent && post.event_date && (
                          <span className="blog-card__event-date-pill">
                            <Calendar size={12} className="shrink-0 text-amber-600" />
                            <span>{eventDateFormatted}</span>
                          </span>
                        )}
                      </div>

                      {/* Title */}
                      <h2 className="blog-card__title">
                        <Link to={`/blog/${post.slug || post.id}`}>
                          {post.title}
                        </Link>
                      </h2>

                      {/* Excerpt */}
                      <p className="blog-card__excerpt">
                        {post.excerpt || post.content?.substring(0, 140)}
                      </p>

                      {/* Event Specific: Location Pill with Google Maps link */}
                      {isEvent && post.event_location && (
                        <a
                          href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(post.event_location)}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="blog-card__event-loc"
                          title="Buka Lokasi di Google Maps"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <MapPin size={15} className="blog-card__event-loc-pin shrink-0" />
                          <span className="blog-card__event-loc-text">{post.event_location}</span>
                          <ExternalLink size={13} className="blog-card__event-loc-icon shrink-0" />
                        </a>
                      )}

                      {/* Meta Information (Author & Published Date) */}
                      <div className="blog-card__meta">
                        <div className="blog-card__author">
                          <img
                            src={getUserAvatar(post)}
                            alt={post.user?.name || "Author"}
                            className="blog-card__author-avatar"
                          />
                          <span className="blog-card__author-name">
                            {post.user?.name || post.author || "Admin Surade"}
                          </span>
                        </div>
                        <div className="blog-card__date">
                          <Clock size={13} className="shrink-0 text-slate-400" />
                          <span>{postDateFormatted}</span>
                        </div>
                      </div>

                      {/* Card Action Link */}
                      <div className="blog-card__footer-action">
                        <Link to={`/blog/${post.slug || post.id}`} className="blog-card__link">
                          <span>Baca Selengkapnya</span>
                          <ArrowRight size={16} className="blog-card__link-arrow" />
                        </Link>
                      </div>
                    </div>
                  </article>
                );
              })}
            </div>
          )}

          {!loading && filteredPosts.length === 0 && (
            <div className="blog-empty">
              <div className="blog-empty__icon-wrap">
                <Search size={32} className="text-slate-400" />
              </div>
              <h3 className="blog-empty__title">Tidak Ada Konten Ditemukan</h3>
              <p className="blog-empty__desc">
                Coba sesuaikan kata kunci pencarian atau ganti kategori filter untuk menemukan kabar dan event menarik.
              </p>
              {(searchQuery || activeCategory !== "all" || activeType !== "all") && (
                <button
                  type="button"
                  className="blog-reset-filter-btn"
                  onClick={() => {
                    setSearchQuery("");
                    setActiveType("all");
                    setActiveCategory("all");
                  }}
                >
                  <span>Reset Semua Filter</span>
                </button>
              )}
            </div>
          )}
        </div>
      </section>

      {/* ── FOOTER ── */}
      <Footer />
    </div>
  );
}