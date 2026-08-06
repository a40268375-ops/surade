import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import Navbar from "../components/Navbar";
import api from "../services/api";
import logoImg from "../assets/logo.png";
import { InlineSpinner } from "../components/LoadingScreen";
import {
  User,
  Calendar,
  Clock,
  ArrowRight,
  Search,
} from "lucide-react";
import "./Blog.css";
import { DEFAULT_AVATAR } from "../utils/constants";

export default function Blog() {
  const [activeCategory, setActiveCategory] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [blogs, setBlogs] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    window.scrollTo(0, 0);
    fetchBlogs();
    fetchCategories();
  }, []);

  const fetchBlogs = async () => {
    setLoading(true);
    try {
      const res = await api.get("/blogs?status=published");
      const data = res.data?.data || res.data || [];
      setBlogs(data);
    } catch (err) {
      console.error("Failed to fetch blogs:", err);
      setBlogs([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const res = await api.get("/blog-categories");
      const data = res.data?.data || res.data || [];
      if (Array.isArray(data)) {
        const mappedCategories = [
          { id: "all", label: "Semua" },
          ...data.map(c => ({ id: c.slug, label: c.name }))
        ];
        setCategories(mappedCategories);
      }
    } catch (err) {
      console.error("Failed to fetch blog categories:", err);
    }
  };

  const getCategoryLabel = (catId) => {
    const cat = categories.find(c => c.id === catId);
    return cat?.label || catId || "Umum";
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

  const filteredPosts = blogs.filter((post) => {
    const cat = (post.blog_category || "").toLowerCase();
    const matchesCategory = activeCategory === "all" || cat === activeCategory;
    const title = (post.title || "").toLowerCase();
    const excerpt = (post.excerpt || "").toLowerCase();
    const search = searchQuery.toLowerCase();
    const matchesSearch = !search || title.includes(search) || excerpt.includes(search);
    return matchesCategory && matchesSearch;
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
            <span>Blog</span>
          </div>
          <h1 className="blog-hero__title">Blog</h1>
          <p className="blog-hero__subtitle">Jelajahi Cerita dan Informasi Menarik Seputar Budaya Indonesia</p>
        </div>
      </section>

      {/* ── BLOG CONTENT ── */}
      <section className="blog-content">
        <div className="blog-content__inner">
          {/* Search & Filter */}
          <div className="blog-controls">
            <div className="blog-search">
              <Search size={18} className="blog-search__icon" />
              <input
                type="text"
                placeholder="Cari artikel..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="blog-search__input"
              />
            </div>
            <div className="blog-categories">
              {categories.map((cat) => (
                <button
                  key={cat.id}
                  type="button"
                  className={`blog-category-btn${activeCategory === cat.id ? " active" : ""}`}
                  onClick={() => setActiveCategory(cat.id)}
                >
                  {cat.label}
                </button>
              ))}
            </div>
          </div>

          {/* Loading */}
          {loading && (
            <InlineSpinner text="Memuat artikel..." />
          )}

          {/* Blog Grid */}
          {!loading && (
            <div className="blog-grid">
              {filteredPosts.map((post) => (
                <article key={post.id} className="blog-card">
                  <div className="blog-card__img-wrap">
                    <img src={getThumbnailUrl(post)} alt={post.title} className="blog-card__img" loading="lazy" />
                    <span className="blog-card__category">{getCategoryLabel(post.blog_category)}</span>
                  </div>
                  <div className="blog-card__body">
                    <h2 className="blog-card__title">{post.title}</h2>
                    <p className="blog-card__excerpt">{post.excerpt || post.content?.substring(0, 150)}</p>
                    <div className="blog-card__meta">
                      <span className="blog-card__meta-item">
                        <User size={14} />
                        {post.user?.name || post.author || "Penulis"}
                      </span>
                      <span className="blog-card__meta-item">
                        <Calendar size={14} />
                        {formatDate(post.published_at || post.created_at)}
                      </span>
                      <span className="blog-card__meta-item">
                        <Clock size={14} />
                        {getReadTime(post.content || post.excerpt)}
                      </span>
                    </div>
                    <Link to={`/blog/${post.id}`} className="blog-card__link">
                      Baca Selengkapnya
                      <ArrowRight size={16} />
                    </Link>
                  </div>
                </article>
              ))}
            </div>
          )}

          {!loading && filteredPosts.length === 0 && (
            <div className="blog-empty">
              <p>Tidak ada artikel yang ditemukan.</p>
            </div>
          )}
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer className="footer">
        <div className="footer-inner">
          <div className="footer-cols">
            {/* Brand/Logo Col */}
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

            {/* Col 1 - Tentang Kami */}
            <div className="footer-col">
              <h4 className="footer-heading">Tentang Kami</h4>
              <ul className="footer-links">
                <li><Link to="/about">Tentang Info.co.id</Link></li>
                <li><Link to="/vision-mission">Visi &amp; Misi</Link></li>
                <li><Link to="/partnership-career">Kerjasama &amp; Karir</Link></li>
              </ul>
            </div>

            {/* Col 2 - Bantuan */}
            <div className="footer-col">
              <h4 className="footer-heading">Bantuan</h4>
              <ul className="footer-links">
                <li><a href="#">FAQ</a></li>
                <li><Link to="/terms">Syarat &amp; Ketentuan</Link></li>
                <li><Link to="/contact">Hubungi Kami</Link></li>
              </ul>
            </div>

            {/* Col 3 - Kontak Kami */}
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

        {/* Bottom Bar */}
        <div className="footer-bottom">
          <div className="footer-bottom__inner">
            <p className="footer-copyright">
              &copy; 2024 Info.co.id. All rights reserved.
            </p>
            <div className="footer-bottom-links">
              <a href="#">Privasi</a>
              <Link to="/terms">Syarat &amp; Ketentuan</Link>
              <a href="#">Sitemap</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
