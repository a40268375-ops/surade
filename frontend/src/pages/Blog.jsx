import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import Navbar from "../components/Navbar";
import logoImg from "../assets/logo.png";
import Loading from "../components/Loading";
import { usePageLoading } from "../hooks/usePageLoading";
import api, { getImageUrl } from "../utils/api";
import {
  User,
  Calendar,
  Clock,
  MapPin,
  ArrowRight,
  Search,
  BookOpen,
  CalendarDays,
} from "lucide-react";
import "./Blog.css";

const BLOG_FALLBACK_IMG =
  "https://images.unsplash.com/photo-1536240470700-3e9b6b9b7b7e?w=800&h=500&fit=crop";
const EVENT_FALLBACK_IMG =
  "https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=800&h=500&fit=crop";

// PERMINTAAN: Blog & Event digabung jadi SATU halaman publik (bukan dua
// halaman terpisah lagi), dengan tab "Semua / Blog / Event" - tiap kartu
// dikasih badge penanda tipenya biar tetap kelihatan bedanya walau
// ditampilkan campur di tab "Semua".
export default function Blog() {
  const pageLoading = usePageLoading();
  const [contentTypeFilter, setContentTypeFilter] = useState("all"); // all | blog | event
  const [searchQuery, setSearchQuery] = useState("");
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState(false);

  useEffect(() => {
    window.scrollTo(0, 0);

    async function loadData() {
      setLoading(true);
      try {
        const [blogData, eventData] = await Promise.all([
          api.get("/blogs").catch(() => []),
          api.get("/events").catch(() => []),
        ]);

        const mappedBlogs = (Array.isArray(blogData) ? blogData : []).map((blog) => ({
          type: "blog",
          id: blog.id,
          title: blog.title || "Tanpa judul",
          excerpt: blog.excerpt || (blog.content || "").substring(0, 200) + "...",
          category: blog.category || "Informasi",
          author: blog.author?.name || "Admin Surade",
          sortDate: blog.created_at ? new Date(blog.created_at) : new Date(0),
          dateLabel: blog.created_at
            ? new Date(blog.created_at).toLocaleDateString("id-ID", {
                day: "numeric", month: "long", year: "numeric",
              })
            : "-",
          readTime: Math.ceil(((blog.content || "").length / 1000) * 2) + " min",
          img: blog.image && !blog.image.startsWith("blob:")
            ? getImageUrl(blog.image)
            : BLOG_FALLBACK_IMG,
        }));

        const mappedEvents = (Array.isArray(eventData) ? eventData : []).map((ev) => {
          const dt = ev.event_date ? new Date(ev.event_date) : null;
          return {
            type: "event",
            id: ev.id,
            title: ev.title || "Tanpa judul",
            excerpt: ev.description || "",
            category: ev.category || "Umum",
            location: ev.location || "-",
            sortDate: dt || new Date(0),
            dateLabel: dt
              ? dt.toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" })
              : "-",
            timeLabel: dt
              ? dt.toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" }) + " WIB"
              : "-",
            img: ev.image && !ev.image.startsWith("blob:") ? getImageUrl(ev.image) : EVENT_FALLBACK_IMG,
          };
        });

        const combined = [...mappedBlogs, ...mappedEvents].sort(
          (a, b) => b.sortDate - a.sortDate
        );
        setItems(combined);
        setLoadError(false);
      } catch (e) {
        console.error("Gagal memuat Blog & Event:", e);
        setItems([]);
        setLoadError(true);
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, []);

  const filteredItems = items.filter((item) => {
    const matchesType = contentTypeFilter === "all" || item.type === contentTypeFilter;
    const q = searchQuery.toLowerCase();
    const matchesSearch =
      item.title.toLowerCase().includes(q) ||
      (item.excerpt || "").toLowerCase().includes(q) ||
      (item.location || "").toLowerCase().includes(q);
    return matchesType && matchesSearch;
  });

  if (pageLoading || loading) {
    return <Loading />;
  }

  return (
    <div className="blog-page">
      {/* ── NAVBAR ── */}
      <Navbar />

      {/* ── HERO ── */}
      <section className="blog-hero">
        <div className="blog-hero__bg" />
        <div className="blog-hero__overlay" />
        <div className="blog-hero__content">
          <div className="blog-hero__breadcrumb">
            <Link to="/">Home</Link>
            <span className="separator">/</span>
            <span>Blog &amp; Event</span>
          </div>
          <h1 className="blog-hero__title">Blog &amp; Event</h1>
          <p className="blog-hero__subtitle">Cerita, informasi, dan berbagai event menarik dari Surade.co.id</p>
        </div>
      </section>

      {/* ── CONTENT ── */}
      <section className="blog-content">
        <div className="blog-content__inner">
          {/* Search & Tab tipe konten */}
          <div className="blog-controls">
            <div className="blog-search">
              <Search size={18} className="blog-search__icon" />
              <input
                type="text"
                placeholder="Cari blog atau event..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="blog-search__input"
              />
            </div>
            <div className="blog-categories">
              <button
                type="button"
                className={`blog-category-btn${contentTypeFilter === "all" ? " active" : ""}`}
                onClick={() => setContentTypeFilter("all")}
              >
                Semua
              </button>
              <button
                type="button"
                className={`blog-category-btn${contentTypeFilter === "blog" ? " active" : ""}`}
                onClick={() => setContentTypeFilter("blog")}
              >
                <BookOpen size={14} style={{ marginRight: 5, verticalAlign: -2 }} />
                Blog
              </button>
              <button
                type="button"
                className={`blog-category-btn${contentTypeFilter === "event" ? " active" : ""}`}
                onClick={() => setContentTypeFilter("event")}
              >
                <CalendarDays size={14} style={{ marginRight: 5, verticalAlign: -2 }} />
                Event
              </button>
            </div>
          </div>

          {/* Grid gabungan */}
          <div className="blog-grid">
            {filteredItems.map((item) => (
              <article key={`${item.type}-${item.id}`} className="blog-card">
                <div className="blog-card__img-wrap">
                  <img
                    src={item.img}
                    alt={item.title}
                    className="blog-card__img"
                    loading="lazy"
                    onError={(e) => {
                      e.currentTarget.onerror = null;
                      e.currentTarget.src = item.type === "blog" ? BLOG_FALLBACK_IMG : EVENT_FALLBACK_IMG;
                    }}
                  />
                  {/* Badge penanda tipe konten - ini yang bikin tetap kebeda
                      Blog vs Event walau lagi nampilin tab "Semua" */}
                  <span className={`blog-card__type-badge blog-card__type-badge--${item.type}`}>
                    {item.type === "blog" ? <BookOpen size={12} /> : <CalendarDays size={12} />}
                    {item.type === "blog" ? "Blog" : "Event"}
                  </span>
                  <span className="blog-card__category">{item.category}</span>
                </div>
                <div className="blog-card__body">
                  <h2 className="blog-card__title">{item.title}</h2>
                  <p className="blog-card__excerpt">{item.excerpt}</p>
                  <div className="blog-card__meta">
                    {item.type === "blog" ? (
                      <>
                        <span className="blog-card__meta-item">
                          <User size={14} />
                          {item.author}
                        </span>
                        <span className="blog-card__meta-item">
                          <Calendar size={14} />
                          {item.dateLabel}
                        </span>
                        <span className="blog-card__meta-item">
                          <Clock size={14} />
                          {item.readTime}
                        </span>
                      </>
                    ) : (
                      <>
                        <span className="blog-card__meta-item">
                          <Calendar size={14} />
                          {item.dateLabel}
                        </span>
                        <span className="blog-card__meta-item">
                          <Clock size={14} />
                          {item.timeLabel}
                        </span>
                        <span className="blog-card__meta-item">
                          <MapPin size={14} />
                          {item.location}
                        </span>
                      </>
                    )}
                  </div>
                  <Link to={item.type === "blog" ? `/blog/${item.id}` : `/events/${item.id}`} className="blog-card__link">
                    {item.type === "blog" ? "Baca Selengkapnya" : "Lihat Detail"}
                    <ArrowRight size={16} />
                  </Link>
                </div>
              </article>
            ))}
          </div>

          {filteredItems.length === 0 && (
            <div className="blog-empty">
              <p>
                {loadError
                  ? "Gagal memuat data dari server."
                  : "Tidak ada blog atau event yang ditemukan."}
              </p>
            </div>
          )}
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer className="footer">
        <div className="footer-inner">
          <div className="footer-cols">
            <div className="footer-col footer-col--brand">
              <Link to="/" className="footer-logo">
                <img src={logoImg} alt="Surade.co.id" className="footer-logo__img" />
              </Link>
              <p className="footer-desc">
                Surade.co.id adalah portal informasi yang menyajikan data dan berita terpercaya dari berbagai sumber resmi di Indonesia.
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
                <li><Link to="/about">Tentang Surade.co.id</Link></li>
                <li><Link to="/vision-mission">Visi &amp; Misi</Link></li>
                <li><Link to="/partnership-career">Kerjasama &amp; Karir</Link></li>
              </ul>
            </div>

            <div className="footer-col">
              <h4 className="footer-heading">Bantuan</h4>
              <ul className="footer-links">
                <li><Link to="/faq">FAQ</Link></li>
                <li><Link to="/terms">Syarat &amp; Ketentuan</Link></li>
                <li><Link to="/contact">Hubungi Kami</Link></li>
              </ul>
            </div>

            <div className="footer-col">
              <h4 className="footer-heading">Kontak Kami</h4>
              <ul className="footer-links">
                <li><a href="mailto:support@Surade.co.id">support@Surade.co.id</a></li>
                <li><span className="footer-text">(021) 1234 5678</span></li>
                <li><span className="footer-text">Jalan Mercurius 16680 Dramaga West Java</span></li>
              </ul>
            </div>
          </div>
        </div>

        <div className="footer-bottom">
          <div className="footer-bottom__inner">
            <p className="footer-copyright">
              &copy; 2026 Surade.co.id. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}