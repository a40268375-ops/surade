import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import Navbar from "../components/Navbar";
import logoImg from "../assets/logo.png";
import Loading from "../components/Loading";
import { usePageLoading } from "../hooks/usePageLoading";
import {
  User,
  Calendar,
  Clock,
  ArrowRight,
  Search,
} from "lucide-react";
import "./Blog.css";

/* ── Blog data ── */
const BLOG_POSTS = [
  {
    id: 1,
    title: "Cucurak Khas Bogor, sambut Bulan Ramadhan",
    excerpt: "Tradisi cucurak merupakan salah satu budaya lokal yang masih dilestarikan oleh masyarakat Bogor sebagai bentuk syukur menyambut bulan suci Ramadhan.",
    category: "Budaya",
    author: "Hikmah Yusila",
    date: "15 Agustus 2017",
    readTime: "5 min",
    img: "https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=800&h=500&fit=crop",
  },
  {
    id: 2,
    title: "Tradisi Grebeg Gethuk di Kota Magelang",
    excerpt: "Grebeg Gethuk adalah tradisi tahunan yang menjadi ikon budaya Kota Magelang, melambangkan kerukunan dan kebersamaan masyarakat.",
    category: "Budaya",
    author: "Hikmah Yusila",
    date: "16 Februari 2017",
    readTime: "4 min",
    img: "https://images.unsplash.com/photo-1596422846543-75c6fc197f07?w=800&h=500&fit=crop",
  },
  {
    id: 3,
    title: "Pasar Tiban Pahingan Magelang, Destinasi Wisata Kuliner",
    excerpt: "Pasar Tiban Pahingan menawarkan pengalaman unik berwisata kuliner sambil mendengarkan pengajian, memadukan tradisi dan kuliner lokal.",
    category: "Kuliner",
    author: "Hikmah Yusila",
    date: "16 Februari 2017",
    readTime: "6 min",
    img: "https://images.unsplash.com/photo-1572285870954-7b08e56f4c58?w=800&h=500&fit=crop",
  },
  {
    id: 4,
    title: "Pesona Rumah Gadang Minangkabau",
    excerpt: "Rumah Gadang adalah ikon arsitektur tradisional Minangkabau dengan atap bergonjong yang khas, merepresentasikan filosofi adat dan budaya.",
    category: "Budaya",
    author: "Andi Pratama",
    date: "20 Maret 2024",
    readTime: "7 min",
    img: "https://images.unsplash.com/photo-1588668214407-6ea9a6d8c272?w=800&h=500&fit=crop",
  },
  {
    id: 5,
    title: "Keindahan Pulau Komodo dan Habitatnya",
    excerpt: "Pulau Komodo adalah rumah bagi komodo, reptil terbesar di dunia, serta menawarkan pemandangan alam yang memukau dan biodiversitas unik.",
    category: "Wisata",
    author: "Siti Rahayu",
    date: "25 April 2024",
    readTime: "8 min",
    img: "https://images.unsplash.com/photo-1596422846543-75c6fc197f07?w=800&h=500&fit=crop",
  },
  {
    id: 6,
    title: "Tari Kecak: Tradisi Bali yang Mendunia",
    excerpt: "Tari Kecak adalah seni pertunjukan tradisional Bali yang terkenal dengan gerakan tangan yang kompleks dan nyanyian khas 'cak-cak-cak'.",
    category: "Budaya",
    author: "Made Widana",
    date: "10 Mei 2024",
    readTime: "5 min",
    img: "https://images.unsplash.com/photo-1537996194471-e657df975ab4?w=800&h=500&fit=crop",
  },
];

const CATEGORIES = [
  { id: "all", label: "Semua" },
  { id: "budaya", label: "Budaya" },
  { id: "kuliner", label: "Kuliner" },
  { id: "wisata", label: "Wisata" },
  { id: "teknologi", label: "Teknologi" },
];

export default function Blog() {
  const pageLoading = usePageLoading();
  const [activeCategory, setActiveCategory] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const filteredPosts = BLOG_POSTS.filter((post) => {
    const matchesCategory = activeCategory === "all" || post.category.toLowerCase() === activeCategory;
    const matchesSearch = post.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         post.excerpt.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  if (pageLoading) {
    return <Loading />;
  }

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
              {CATEGORIES.map((cat) => (
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

          {/* Blog Grid */}
          <div className="blog-grid">
            {filteredPosts.map((post) => (
              <article key={post.id} className="blog-card">
                <div className="blog-card__img-wrap">
                  <img src={post.img} alt={post.title} className="blog-card__img" loading="lazy" />
                  <span className="blog-card__category">{post.category}</span>
                </div>
                <div className="blog-card__body">
                  <h2 className="blog-card__title">{post.title}</h2>
                  <p className="blog-card__excerpt">{post.excerpt}</p>
                  <div className="blog-card__meta">
                    <span className="blog-card__meta-item">
                      <User size={14} />
                      {post.author}
                    </span>
                    <span className="blog-card__meta-item">
                      <Calendar size={14} />
                      {post.date}
                    </span>
                    <span className="blog-card__meta-item">
                      <Clock size={14} />
                      {post.readTime}
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

          {filteredPosts.length === 0 && (
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

            {/* Col 1 - Tentang Kami */}
            <div className="footer-col">
              <h4 className="footer-heading">Tentang Kami</h4>
              <ul className="footer-links">
                <li><Link to="/about">Tentang Surade.co.id</Link></li>
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
                <li><a href="mailto:support@Surade.co.id">support@Surade.co.id</a></li>
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
              &copy; 2024 Surade.co.id. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
