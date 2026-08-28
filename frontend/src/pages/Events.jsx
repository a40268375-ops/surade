import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import Navbar from "../components/Navbar";
import logoImg from "../assets/logo.png";
import Loading from "../components/Loading";
import { usePageLoading } from "../hooks/usePageLoading";
import api, { getImageUrl } from "../utils/api";
import {
  Calendar,
  Clock,
  MapPin,
  ArrowRight,
  Search,
} from "lucide-react";
import "./Blog.css";

const FALLBACK_IMG =
  "https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=800&h=500&fit=crop";

export default function Events() {
  const pageLoading = usePageLoading();
  const [searchQuery, setSearchQuery] = useState("");
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState(false);

  useEffect(() => {
    window.scrollTo(0, 0);

    async function loadData() {
      setLoading(true);
      try {
        // GET /events - backend hanya mengembalikan event berstatus
        // "published" untuk pengunjung biasa (draft cuma kelihatan di Admin).
        const data = await api.get("/events");
        setEvents(Array.isArray(data) ? data : []);
        setLoadError(false);
      } catch (e) {
        console.error("Gagal memuat data event:", e);
        setEvents([]);
        setLoadError(true);
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, []);

  const mapped = events.map((ev) => {
    const dt = ev.event_date ? new Date(ev.event_date) : null;
    return {
      id: ev.id,
      title: ev.title,
      description: ev.description || "",
      category: ev.category || "Umum",
      location: ev.location || "-",
      date: dt
        ? dt.toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" })
        : "-",
      time: dt
        ? dt.toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" }) + " WIB"
        : "-",
      img: ev.image && !ev.image.startsWith("blob:") ? getImageUrl(ev.image) : FALLBACK_IMG,
    };
  });

  const filtered = mapped.filter((ev) => {
    const q = searchQuery.toLowerCase();
    return (
      ev.title.toLowerCase().includes(q) ||
      ev.description.toLowerCase().includes(q) ||
      ev.location.toLowerCase().includes(q)
    );
  });

  if (pageLoading || loading) {
    return <Loading />;
  }

  return (
    <div className="blog-page">
      <Navbar />

      <section className="blog-hero">
        <div className="blog-hero__bg" />
        <div className="blog-hero__overlay" />
        <div className="blog-hero__content">
          <div className="blog-hero__breadcrumb">
            <Link to="/">Home</Link>
            <span className="separator">/</span>
            <span>Event</span>
          </div>
          <h1 className="blog-hero__title">Event</h1>
          <p className="blog-hero__subtitle">
            Jangan Lewatkan Berbagai Event Menarik dari Surade.co.id
          </p>
        </div>
      </section>

      <section className="blog-content">
        <div className="blog-content__inner">
          <div className="blog-controls">
            <div className="blog-search">
              <Search size={18} className="blog-search__icon" />
              <input
                type="text"
                placeholder="Cari event, lokasi..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="blog-search__input"
              />
            </div>
          </div>

          <div className="blog-grid">
            {filtered.map((ev) => (
              <article key={ev.id} className="blog-card">
                <div className="blog-card__img-wrap">
                  <img
                    src={ev.img}
                    alt={ev.title}
                    className="blog-card__img"
                    loading="lazy"
                    onError={(e) => {
                      e.currentTarget.onerror = null;
                      e.currentTarget.src = FALLBACK_IMG;
                    }}
                  />
                  <span className="blog-card__category">{ev.category}</span>
                </div>
                <div className="blog-card__body">
                  <h2 className="blog-card__title">{ev.title}</h2>
                  <p className="blog-card__excerpt">{ev.description}</p>
                  <div className="blog-card__meta">
                    <span className="blog-card__meta-item">
                      <Calendar size={14} />
                      {ev.date}
                    </span>
                    <span className="blog-card__meta-item">
                      <Clock size={14} />
                      {ev.time}
                    </span>
                    <span className="blog-card__meta-item">
                      <MapPin size={14} />
                      {ev.location}
                    </span>
                  </div>
                  <Link to={`/events/${ev.id}`} className="blog-card__link">
                    Lihat Detail
                    <ArrowRight size={16} />
                  </Link>
                </div>
              </article>
            ))}
          </div>

          {filtered.length === 0 && (
            <div className="blog-empty">
              <p>
                {loadError
                  ? "Gagal memuat data event dari server."
                  : "Belum ada event yang tersedia saat ini."}
              </p>
            </div>
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
<<<<<<< HEAD
                <li><a href="mailto:admin@Surade.co.id">admin@Surade.co.id</a></li>
                <li><span className="footer-text">Call Center 0807 - 100 - 1500</span></li>
                  <li><span className="footer-text">WhatsApp: +62 811-1919-711</span></li>
                
=======
                <li><a href="mailto:support@Surade.co.id">support@Surade.co.id</a></li>
                <li><span className="footer-text">(021) 1234 5678</span></li>
                <li><span className="footer-text">Jalan Mercurius 16680 Dramaga West Java</span></li>
>>>>>>> 43511c35c312291308bc3e9f249d166401282bda
              </ul>
            </div>
          </div>
        </div>

        <div className="footer-bottom">
          <div className="footer-bottom__inner">
            <p className="footer-copyright">&copy; 2026 Surade.co.id. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}