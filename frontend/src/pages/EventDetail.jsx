import { useMemo, useState, useEffect } from "react";
import { Link, useParams } from "react-router-dom";
import Navbar from "../components/Navbar";
import Loading from "../components/Loading";
import { usePageLoading } from "../hooks/usePageLoading";
import api, { getImageUrl } from "../utils/api";
import logoImg from "../assets/logo.png";
import { Calendar, Clock, MapPin, ArrowLeft } from "lucide-react";
import "./Blog.css";

const FALLBACK_HERO_IMG =
  "https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=1920&h=800&fit=crop";

export default function EventDetail() {
  const pageLoading = usePageLoading();
  const { id } = useParams();

  const [apiEvent, setApiEvent] = useState(null);
  const [fetching, setFetching] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    window.scrollTo(0, 0);
    let cancelled = false;

    async function loadEvent() {
      setFetching(true);
      setNotFound(false);
      try {
        const data = await api.get(`/events/${id}`);
        if (!cancelled) setApiEvent(data);
      } catch (err) {
        if (!cancelled) setNotFound(true);
      } finally {
        if (!cancelled) setFetching(false);
      }
    }

    loadEvent();
    return () => { cancelled = true; };
  }, [id]);

  const event = useMemo(() => {
    if (!apiEvent) return null;
    const dt = apiEvent.event_date ? new Date(apiEvent.event_date) : null;
    return {
      id: apiEvent.id,
      title: apiEvent.title,
      description: apiEvent.description || "",
      category: apiEvent.category || "Umum",
      location: apiEvent.location || "-",
      date: dt
        ? dt.toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" })
        : "-",
      time: dt
        ? dt.toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" }) + " WIB"
        : "-",
      img: apiEvent.image && !apiEvent.image.startsWith("blob:") ? getImageUrl(apiEvent.image) : FALLBACK_HERO_IMG,
    };
  }, [apiEvent]);

  if (pageLoading || fetching) {
    return <Loading />;
  }

  return (
    <div className="blog-page">
      <Navbar />

      <section className="blog-hero">
        <div
          className="blog-hero__bg"
          style={event ? { backgroundImage: `url(${event.img})` } : undefined}
        />
        <div className="blog-hero__overlay" />
        <div className="blog-hero__content" style={{ textAlign: "center" }}>
          <div className="blog-hero__breadcrumb" style={{ justifyContent: "center" }}>
            <Link to="/">Home</Link>
            <span className="separator">/</span>
            <Link to="/blog">Event</Link>
            <span className="separator">/</span>
            <span>{event ? `Event #${event.id}` : "Tidak ditemukan"}</span>
          </div>

          <h1 className="blog-hero__title" style={{ fontSize: "clamp(2.4rem, 5vw, 3.6rem)" }}>
            {event ? event.title : "Event tidak ditemukan"}
          </h1>

          <p className="blog-hero__subtitle" style={{ maxWidth: 820 }}>
            {event
              ? event.description
              : "Link yang Anda buka tidak tersedia atau event ini belum dipublikasikan. Silakan kembali ke halaman Event."}
          </p>

          {event && (
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
                <Calendar size={14} /> {event.date}
              </span>
              <span className="blog-card__meta-item" style={{ color: "rgba(255,255,255,0.92)" }}>
                <Clock size={14} /> {event.time}
              </span>
              <span className="blog-card__meta-item" style={{ color: "rgba(255,255,255,0.92)" }}>
                <MapPin size={14} /> {event.location}
              </span>
            </div>
          )}

          <div style={{ marginTop: 22, display: "flex", justifyContent: "center" }}>
            <Link
              to="/blog"
              className="blog-card__link"
              style={{ color: "#ffffff", textDecoration: "none" }}
            >
              <ArrowLeft size={16} /> Kembali ke Event
            </Link>
          </div>
        </div>
      </section>

      <section className="blog-content">
        <div className="blog-content__inner">
          {!event ? (
            <div className="blog-empty">
              <p>Event tidak ditemukan.</p>
              <p style={{ marginTop: 8 }}>
                <Link to="/blog" className="blog-card__link">Buka halaman Event</Link>
              </p>
            </div>
          ) : (
            <article style={{ maxWidth: 920, margin: "0 auto", padding: "0 6px" }}>
              <div style={{ borderRadius: 16, overflow: "hidden", border: "1px solid #e8ecf0" }}>
                <img
                  src={event.img}
                  alt={event.title}
                  style={{ width: "100%", height: 380, objectFit: "cover", display: "block" }}
                  onError={(e) => {
                    e.currentTarget.onerror = null;
                    e.currentTarget.src = FALLBACK_HERO_IMG;
                  }}
                />
              </div>

              <div style={{ marginTop: 18, display: "flex", gap: 10, alignItems: "center", flexWrap: "wrap" }}>
                <span className="blog-card__category" style={{ position: "relative", top: 0, left: 0 }}>
                  {event.category}
                </span>
                <span style={{ color: "#64748b", fontSize: 14 }}>
                  <MapPin size={14} style={{ verticalAlign: "-2px", marginRight: 4 }} />
                  {event.location}
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
                  {event.title}
                </h2>
                <p style={{ color: "#334155", lineHeight: 1.9, whiteSpace: "pre-wrap" }}>
                  {event.description}
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
                <li><a href="mailto:admin@Surade.co.id">admin@Surade.co.id</a></li>
                <li><span className="footer-text">Call Center 0807 - 100 - 1500</span></li>
                  <li><span className="footer-text">WhatsApp: +62 811-1919-711</span></li>
                
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