import { useMemo } from "react";
import { Link, useParams } from "react-router-dom";
import Navbar from "../components/Navbar";
import Loading from "../components/Loading";
import { usePageLoading } from "../hooks/usePageLoading";
import logoImg from "../assets/logo.png";
import { Calendar, Clock, ArrowLeft, User } from "lucide-react";
import "./Blog.css";

/* ── Blog data (samakan dengan Blog.jsx) ── */
const BLOG_POSTS = [
  {
    id: 1,
    title: "Cucurak Khas Bogor, sambut Bulan Ramadhan",
    excerpt:
      "Tradisi cucurak merupakan salah satu budaya lokal yang masih dilestarikan oleh masyarakat Bogor sebagai bentuk syukur menyambut bulan suci Ramadhan.",
    category: "Budaya",
    author: "Hikmah Yusila",
    date: "15 Agustus 2017",
    readTime: "5 min",
    img: "https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=800&h=500&fit=crop",
    content:
      "Tradisi cucurak merupakan salah satu budaya lokal yang masih dilestarikan oleh masyarakat Bogor sebagai bentuk syukur menyambut bulan suci Ramadhan. Tradisi ini mengandung nilai kebersamaan, rasa syukur, dan upaya pelestarian warisan budaya.",
  },
  {
    id: 2,
    title: "Tradisi Grebeg Gethuk di Kota Magelang",
    excerpt:
      "Grebeg Gethuk adalah tradisi tahunan yang menjadi ikon budaya Kota Magelang, melambangkan kerukunan dan kebersamaan masyarakat.",
    category: "Budaya",
    author: "Hikmah Yusila",
    date: "16 Februari 2017",
    readTime: "4 min",
    img: "https://images.unsplash.com/photo-1596422846543-75c6fc197f07?w=800&h=500&fit=crop",
    content:
      "Grebeg Gethuk merupakan tradisi tahunan yang menjadi ikon budaya Kota Magelang. Kegiatan ini melibatkan banyak unsur masyarakat dan menggambarkan kerukunan serta kebersamaan dalam merayakan momen penting budaya.",
  },
  {
    id: 3,
    title: "Pasar Tiban Pahingan Magelang, Destinasi Wisata Kuliner",
    excerpt:
      "Pasar Tiban Pahingan menawarkan pengalaman unik berwisata kuliner sambil mendengarkan pengajian, memadukan tradisi dan kuliner lokal.",
    category: "Kuliner",
    author: "Hikmah Yusila",
    date: "16 Februari 2017",
    readTime: "6 min",
    img: "https://images.unsplash.com/photo-1572285870954-7b08e56f4c58?w=800&h=500&fit=crop",
    content:
      "Pasar Tiban Pahingan Magelang menawarkan pengalaman unik berwisata kuliner sambil mendengarkan pengajian. Di sini, tradisi dan kuliner lokal bertemu dalam suasana yang hangat dan penuh makna.",
  },
  {
    id: 4,
    title: "Pesona Rumah Gadang Minangkabau",
    excerpt:
      "Rumah Gadang adalah ikon arsitektur tradisional Minangkabau dengan atap bergonjong yang khas, merepresentasikan filosofi adat dan budaya.",
    category: "Budaya",
    author: "Andi Pratama",
    date: "20 Maret 2024",
    readTime: "7 min",
    img: "https://images.unsplash.com/photo-1588668214407-6ea9a6d8c272?w=800&h=500&fit=crop",
    content:
      "Rumah Gadang merupakan ikon arsitektur tradisional Minangkabau dengan atap bergonjong yang khas. Keunikan bentuknya merepresentasikan filosofi adat dan budaya masyarakat setempat.",
  },
  {
    id: 5,
    title: "Keindahan Pulau Komodo dan Habitatnya",
    excerpt:
      "Pulau Komodo adalah rumah bagi komodo, reptil terbesar di dunia, serta menawarkan pemandangan alam yang memukau dan biodiversitas unik.",
    category: "Wisata",
    author: "Siti Rahayu",
    date: "25 April 2024",
    readTime: "8 min",
    img: "https://images.unsplash.com/photo-1596422846543-75c6fc197f07?w=800&h=500&fit=crop",
    content:
      "Pulau Komodo adalah rumah bagi komodo, reptil terbesar di dunia. Selain itu, kawasan ini menawarkan pemandangan alam yang memukau serta biodiversitas unik yang menjadi daya tarik utama wisata alam.",
  },
  {
    id: 6,
    title: "Tari Kecak: Tradisi Bali yang Mendunia",
    excerpt:
      "Tari Kecak adalah seni pertunjukan tradisional Bali yang terkenal dengan gerakan tangan yang kompleks dan nyanyian khas 'cak-cak-cak'.",
    category: "Budaya",
    author: "Made Widana",
    date: "10 Mei 2024",
    readTime: "5 min",
    img: "https://images.unsplash.com/photo-1537996194471-e657df975ab4?w=800&h=500&fit=crop",
    content:
      "Tari Kecak adalah seni pertunjukan tradisional Bali yang mendunia. Pertunjukan ini terkenal dengan gerakan tangan yang kompleks serta nyanyian khas 'cak-cak-cak' yang menciptakan suasana dramatis.",
  },
];

export default function BlogDetail() {
  const pageLoading = usePageLoading();
  const { id } = useParams();

  const post = useMemo(() => {
    const numId = Number(id);
    return BLOG_POSTS.find((p) => p.id === numId);
  }, [id]);

  if (pageLoading) {
    return <Loading />;
  }

  return (
    <div className="blog-page">
      <Navbar />

      <section className="blog-hero">
        <div className="blog-hero__bg" />
        <div className="blog-hero__overlay" />
        <div className="blog-hero__content" style={{ textAlign: "center" }}>
          <div className="blog-hero__breadcrumb" style={{ justifyContent: "center" }}>
            <Link to="/">Home</Link>
            <span className="separator">/</span>
            <Link to="/blog">Blog</Link>
            <span className="separator">/</span>
            <span>{post ? `Artikel #${post.id}` : "Tidak ditemukan"}</span>
          </div>

          <h1 className="blog-hero__title" style={{ fontSize: "clamp(2.4rem, 5vw, 3.6rem)" }}>
            {post ? post.title : "Halaman artikel tidak ditemukan"}
          </h1>

          <p className="blog-hero__subtitle" style={{ maxWidth: 820 }}>
            {post
              ? post.excerpt
              : "Link yang Anda buka tidak tersedia. Silakan kembali ke halaman Blog."}
          </p>

          {post && (
            <div
              style={{
                marginTop: 18,
                display: "flex",
                justifyContent: "center",
                gap: 16,
                flexWrap: "wrap",
                color: "rgba(255,255,255,0.92)",
              }}
            >
              <span className="blog-card__meta-item" style={{ color: "rgba(255,255,255,0.92)" }}>
                <User size={14} /> {post.author}
              </span>
              <span className="blog-card__meta-item" style={{ color: "rgba(255,255,255,0.92)" }}>
                <Calendar size={14} /> {post.date}
              </span>
              <span className="blog-card__meta-item" style={{ color: "rgba(255,255,255,0.92)" }}>
                <Clock size={14} /> {post.readTime}
              </span>
            </div>
          )}

          <div style={{ marginTop: 22, display: "flex", justifyContent: "center" }}>
            <Link
              to="/blog"
              className="blog-card__link"
              style={{ color: "#ffffff", textDecoration: "none" }}
            >
              <ArrowLeft size={16} /> Kembali ke Blog
            </Link>
          </div>
        </div>
      </section>

      <section className="blog-content">
        <div className="blog-content__inner">
          {!post ? (
            <div className="blog-empty">
              <p>Artikel tidak ditemukan.</p>
              <p style={{ marginTop: 8 }}>
                <Link to="/blog" className="blog-card__link">Buka halaman Blog</Link>
              </p>
            </div>
          ) : (
            <article style={{ maxWidth: 920, margin: "0 auto", padding: "0 6px" }}>
              <div style={{ borderRadius: 16, overflow: "hidden", border: "1px solid #e8ecf0" }}>
                <img
                  src={post.img}
                  alt={post.title}
                  style={{ width: "100%", height: 380, objectFit: "cover", display: "block" }}
                />
              </div>

              <div style={{ marginTop: 18, display: "flex", gap: 10, alignItems: "center", flexWrap: "wrap" }}>
                <span className="blog-card__category" style={{ position: "relative", top: 0, left: 0 }}>
                  {post.category}
                </span>
                <span style={{ color: "#64748b", fontSize: 14 }}>
                  Dibuat oleh <strong style={{ color: "#0f172a" }}>{post.author}</strong>
                </span>
              </div>

              <div
                style={{
                  marginTop: 18,
                  background: "#ffffff",
                  border: "1px solid #e8ecf0",
                  borderRadius: 16,
                  padding: "22px 22px",
                  boxShadow: "0 4px 20px rgba(15,23,42,0.03)",
                }}
              >
                <h2 style={{ color: "#0f172a", fontSize: 26, marginBottom: 12, lineHeight: 1.25 }}>
                  {post.title}
                </h2>
                <p style={{ color: "#475569", lineHeight: 1.8, marginBottom: 14 }}>
                  {post.excerpt}
                </p>
                <p style={{ color: "#334155", lineHeight: 1.9, whiteSpace: "pre-wrap" }}>
                  {post.content}
                </p>

                <div style={{ marginTop: 26, display: "flex", gap: 12, flexWrap: "wrap" }}>
                  <Link
                    to="/blog"
                    className="blog-card__link"
                    style={{ textDecoration: "none", color: "#007570" }}
                  >
                    <ArrowLeft size={16} /> Kembali
                  </Link>
                </div>
              </div>
            </article>
          )}
        </div>
      </section>

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
            </div>

            <div className="footer-col">
              <h4 className="footer-heading">Tentang Kami</h4>
              <ul className="footer-links">
                <li>
                  <Link to="/about">Tentang Surade.co.id</Link>
                </li>
                <li>
                  <Link to="/vision-mission">Visi &amp; Misi</Link>
                </li>
                <li>
                  <Link to="/partnership-career">Kerjasama &amp; Karir</Link>
                </li>
              </ul>
            </div>

            <div className="footer-col">
              <h4 className="footer-heading">Bantuan</h4>
              <ul className="footer-links">
                <li>
                  <a href="#">FAQ</a>
                </li>
                <li>
                  <Link to="/terms">Syarat &amp; Ketentuan</Link>
                </li>
                <li>
                  <Link to="/contact">Hubungi Kami</Link>
                </li>
              </ul>
            </div>

            <div className="footer-col">
              <h4 className="footer-heading">Kontak Kami</h4>
              <ul className="footer-links">
                <li>
                  <a href="mailto:support@Surade.co.id">support@Surade.co.id</a>
                </li>
                <li>
                  <span className="footer-text">(021) 1234 5678</span>
                </li>
                <li>
                  <span className="footer-text">Jalan Mercurius 16680 Dramaga West Java</span>
                </li>
              </ul>
            </div>
          </div>
        </div>

        <div className="footer-bottom">
          <div className="footer-bottom__inner">
            <p className="footer-copyright">&copy; 2024 Surade.co.id. All rights reserved.</p>
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

