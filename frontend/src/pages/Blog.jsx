import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
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
} from "lucide-react";
import "./Blog.css";
import { DEFAULT_AVATAR } from "../utils/constants";

export default function Blog() {
  const [activeType, setActiveType] = useState("all"); // 'all' | 'blog' | 'event'
  const [activeCategory, setActiveCategory] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [blogs, setBlogs] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saved, setSaved] = useState({});

  useEffect(() => {
    window.scrollTo(0, 0);
    fetchBlogs();
  }, []);

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
          const bId = fav.blog_id || fav.blog?.id;
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

  const fetchBlogs = async () => {
    try {
      const res = await api.get("/blogs?status=published&all=true");
      const raw = res.data?.data || res.data || [];
      const data = Array.isArray(raw) ? raw : (raw?.data || []);
      setBlogs(data);

      if (data.length > 0) {
        const catNames = data.map(b => b.blog_category).filter(Boolean);
        const uniqueCats = Array.from(new Set(catNames));
        setCategories(uniqueCats);
      }
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

  const getStorageUrl = (path) => {
    if (!path) return "";
    if (path.startsWith("http")) return path;
    const baseUrl = import.meta.env.VITE_API_URL.replace(/\/api$/i, "");
    return `${baseUrl}/storage/${path}`;
  };

  const getThumbnailUrl = (blog) => {
    if (blog.thumbnail) {
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

  // ── Filter logic: Type + Category + Search ──
  const filteredPosts = blogs.filter((post) => {
    // 1. Type filter
    const postType = post.type || "blog";
    const matchesType = activeType === "all" || postType === activeType;

    // 2. Category filter
    const postCat = (post.blog_category || "").toLowerCase();
    const matchesCategory = activeCategory === "all" || postCat === activeCategory.toLowerCase();

    // 3. Search query
    const q = searchQuery.toLowerCase().trim();
    const matchesSearch = !q ||
      (post.title || "").toLowerCase().includes(q) ||
      (post.excerpt || "").toLowerCase().includes(q) ||
      (post.content || "").toLowerCase().includes(q) ||
      (post.blog_category || "").toLowerCase().includes(q) ||
      (post.event_location || "").toLowerCase().includes(q);

    return matchesType && matchesCategory && matchesSearch;
  });

  return (
    <div className="blog-page">
      {/* ── NAVBAR ── */}
      <Navbar />

      {/* ── BLOG HERO ── */}
      <section className="blog-hero">
        <div className="blog-hero__bg" />
        <div className="blog-hero__overlay" />
        <div className="blog-hero__content">
          <div className="blog-hero__breadcrumb">
            <Link to="/">Home</Link>
            <span className="separator">/</span>
            <span>Blog & Event</span>
          </div>
          <h1 className="blog-hero__title">Blog & Event</h1>
          <p className="blog-hero__subtitle">Jelajahi Wawasan Bisnis, Berita Terkini, dan Agenda Event Menarik di Indonesia</p>
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
                  <span>Blog</span>
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

              {/* Topic Category Pills */}
              {categories.length > 0 && (
                <div className="blog-categories">
                  <button
                    type="button"
                    className={`blog-category-btn${activeCategory === "all" ? " active" : ""}`}
                    onClick={() => setActiveCategory("all")}
                  >
                    Semua Topik
                  </button>
                  {categories.map((cat) => (
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
              )}
            </div>
          </div>

          {/* Loading */}
          {loading && (
            <InlineSpinner text="Memuat data blog & event..." />
          )}

          {/* Blog & Event Grid */}
          {!loading && (
            <div className="blog-grid">
              {filteredPosts.map((post) => {
                const isEvent = post.type === "event";
                return (
                  <article key={post.id} className="blog-card">
                    <div className="blog-card__img-wrap" style={{ position: "relative" }}>
                      <img src={getThumbnailUrl(post)} alt={post.title} className="blog-card__img" loading="lazy" />
                      {isEvent ? (
                        <span className="blog-badge-tag blog-badge-tag--event">EVENT</span>
                      ) : (
                        <span className="blog-badge-tag blog-badge-tag--blog">BLOG</span>
                      )}
                      <button
                        type="button"
                        className={`biz-card__save${saved[post.id] ? " saved" : ""}`}
                        style={{ position: "absolute", top: "12px", right: "12px", zIndex: 5 }}
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          toggleSave(post.id, post.title);
                        }}
                        aria-label="Simpan Blog/Event"
                      >
                        <Bookmark size={13} fill={saved[post.id] ? "currentColor" : "none"} />
                        <span>Simpan</span>
                      </button>
                    </div>
                    <div className="blog-card__body">
                      {post.blog_category && (
                        <p className="blog-card__category">{post.blog_category}</p>
                      )}
                      <h2 className="blog-card__title">{post.title}</h2>
                      <p className="blog-card__excerpt">{post.excerpt || post.content?.substring(0, 140)}</p>

                      {isEvent && post.event_location && (
                        <div className="blog-card__event-loc">
                          <MapPin size={13} />
                          <span>{post.event_location}</span>
                        </div>
                      )}

                      <div className="blog-card__meta">
                        <span className="blog-card__meta-item">
                          <User size={14} />
                          {post.user?.name || post.author || "Info.co.id"}
                        </span>
                        <span className="blog-card__meta-item">
                          <Calendar size={14} />
                          {isEvent && post.event_date ? formatDate(post.event_date) : formatDate(post.published_at || post.created_at)}
                        </span>
                        <span className="blog-card__meta-item">
                          <Clock size={14} />
                          {getReadTime(post.content || post.excerpt)}
                        </span>
                      </div>

                      <Link to={`/blog/${post.slug || post.id}`} className="blog-card__link">
                        Baca Selengkapnya
                        <ArrowRight size={16} />
                      </Link>
                    </div>
                  </article>
                );
              })}
            </div>
          )}

          {!loading && filteredPosts.length === 0 && (
            <div className="blog-empty">
              <p>Tidak ada blog atau event yang sesuai dengan pencarian/filter.</p>
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
                  Reset Semua Filter
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
