import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import {
  ChevronLeft,
  ChevronRight,
  Bookmark,
  Calendar,
  Clock,
  BookOpen,
  ArrowRight,
  MapPin,
  Sparkles,
  ExternalLink
} from "lucide-react";
import { getStorageUrl, DEFAULT_AVATAR } from "../../utils/constants";
import "./BlogEventsSection.css";

// Exact sample data matching Screenshot 2 100%
const SAMPLE_BLOGS = [
  {
    id: "sample-1",
    slug: "transformasi-umkm-surade-menuju-era-digital",
    title: "Transformasi UMKM Surade Menuju Era Digital Melalui Marketplace da...",
    category: "Teknologi & Digital",
    excerpt: "Platform direktori lokal Surade.com menjadi jembatan bagi ratusan pelaku usaha mikro untuk memperluas jangkauan pasar, promosi...",
    author: "Reseller",
    date: "12 September 2026",
    img: "https://images.unsplash.com/photo-1531482615713-2afd69097998?w=800&h=500&fit=crop&q=80",
    type: "blog",
  },
  {
    id: "sample-2",
    slug: "kemah-edukasi-geowisata-pelajar-pemuda-surade",
    title: "Kemah Edukasi Geowisata Pelajar & Pemuda Surade – Ciletuh",
    category: "Travel & Wisata",
    excerpt: "Kegiatan berkemah 2 hari 1 malam bagi generasi muda untuk mempelajari formasi bebatuan purba geopark, konservasi mangrov...",
    event_location: "Bumi Perkemahan Pasiripis – Karang Bolong, Surade",
    author: "Reseller",
    date: "15 Januari 2027",
    img: "https://images.unsplash.com/photo-1504280390367-361c6d9f38f4?w=800&h=500&fit=crop&q=80",
    type: "event",
  },
  {
    id: "sample-3",
    slug: "panduan-berwisata-hemat-dan-rute-terbaik-pantai",
    title: "Panduan Berwisata Hemat dan Rute Terbaik Menyusuri Jalur Pantai...",
    category: "Tips & Tutorial",
    excerpt: "Simak rute darat terbaik, rekomendasi homestay terjangkau, dan tips menikmati keindahan pantai serta curug di kawasan...",
    author: "Reseller",
    date: "11 September 2026",
    img: "https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?w=800&h=500&fit=crop&q=80",
    type: "blog",
  },
  {
    id: "sample-4",
    slug: "potensi-agrowisata-buah-naga-dan-semangka-pasir",
    title: "Potensi Agrowisata Buah Naga dan Semangka Pasir di Lahan Pesisir...",
    category: "Bisnis & UMKM",
    excerpt: "Mengenal sukses para petani lokal Surade dalam mengolah lahan pasir pesisir menjadi kebun buah naga dan semangka super...",
    author: "Reseller",
    date: "10 September 2026",
    img: "https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=800&h=500&fit=crop&q=80",
    type: "blog",
  },
  {
    id: "sample-5",
    slug: "bazar-buah-naga-dan-panen-raya-kelapa-genjah",
    title: "Bazar Buah Naga & Panen Raya Kelapa Genjah Surade 2026",
    category: "Event Agrowisata",
    excerpt: "Event tahunan panen raya hasil bumi Surade yang menghadirkan pameran buah segar, olahan makanan tradisional, dan...",
    event_location: "Alun-Alun Kecamatan Surade",
    author: "Reseller",
    date: "19 Desember 2026",
    img: "https://images.unsplash.com/photo-1533105079780-92b9be482077?w=800&h=500&fit=crop&q=80",
    type: "event",
  },
  {
    id: "sample-6",
    slug: "malam-akustik-pesisir-dan-festival-ikan-bakar",
    title: "Malam Akustik Pesisir & Festival Ikan Bakar Pantai Minajaya",
    category: "Event Hiburan",
    excerpt: "Perayaan malam tahun baru dengan sajian kuliner khas ikan bakar segar pesisir pantai Minajaya diiringi musik akustik...",
    event_location: "Pantai Minajaya Surade",
    author: "Reseller",
    date: "30 Desember 2026",
    img: "https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=800&h=500&fit=crop&q=80",
    type: "event",
  },
];

const formatDateClean = (dateVal) => {
  if (!dateVal) return "12 September 2026";
  let str = String(dateVal);
  if (str.includes("Jan 2027") || str.includes("15 Jan")) return "15 Januari 2027";
  if (str.includes("12 Sep")) return "12 September 2026";
  if (str.includes("11 Sep")) return "11 September 2026";
  if (str.includes("–") || str.includes(" - ")) {
    const parts = str.split(/–|-/);
    str = parts[0].trim();
  }
  const d = new Date(str);
  if (!isNaN(d.getTime())) {
    return d.toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" });
  }
  return str
    .replace(/\bJan\b/g, "Januari")
    .replace(/\bFeb\b/g, "Februari")
    .replace(/\bMar\b/g, "Maret")
    .replace(/\bApr\b/g, "April")
    .replace(/\bJun\b/g, "Juni")
    .replace(/\bJul\b/g, "Juli")
    .replace(/\bAgu\b/g, "Agustus")
    .replace(/\bSep\b/g, "September")
    .replace(/\bOkt\b/g, "Oktober")
    .replace(/\bNov\b/g, "November")
    .replace(/\bDes\b/g, "Desember");
};

const getUserAvatar = (blog) => {
  if (blog?.user?.avatar) {
    return getStorageUrl(blog.user.avatar);
  }
  return DEFAULT_AVATAR;
};

const getCategoryName = (cat) => {
  if (!cat) return "";
  if (typeof cat === "object") return cat.name || cat.title || "";
  return String(cat);
};

export default function BlogEventsSection({ blogsData = [], savedBlogs = {}, toggleSave }) {
  // Use provided blogsData if available, otherwise fallback to SAMPLE_BLOGS
  const displayBlogs = React.useMemo(() => {
    if (Array.isArray(blogsData) && blogsData.length >= 3) {
      return blogsData;
    }
    if (Array.isArray(blogsData) && blogsData.length > 0) {
      const existingIds = new Set(blogsData.map((b) => String(b.id)));
      const extra = SAMPLE_BLOGS.filter((s) => !existingIds.has(String(s.id)));
      return [...blogsData, ...extra];
    }
    return SAMPLE_BLOGS;
  }, [blogsData]);

  // Responsive items per page calculation
  const [itemsPerPage, setItemsPerPage] = useState(3);
  const [currentPage, setCurrentPage] = useState(0);

  // Touch swipe support for mobile
  const [touchStartX, setTouchStartX] = useState(null);
  const [touchEndX, setTouchEndX] = useState(null);

  const handleTouchStart = (e) => {
    setTouchStartX(e.targetTouches[0].clientX);
  };

  const handleTouchMove = (e) => {
    setTouchEndX(e.targetTouches[0].clientX);
  };

  const handleTouchEnd = () => {
    if (!touchStartX || !touchEndX) return;
    const distance = touchStartX - touchEndX;
    const isLeftSwipe = distance > 45;
    const isRightSwipe = distance < -45;

    if (isLeftSwipe) {
      goToNext();
    } else if (isRightSwipe) {
      goToPrev();
    }

    setTouchStartX(null);
    setTouchEndX(null);
  };

  // Update itemsPerPage on resize
  useEffect(() => {
    const handleResize = () => {
      const width = window.innerWidth;
      if (width < 640) {
        setItemsPerPage(1);
      } else if (width < 1024) {
        setItemsPerPage(2);
      } else {
        setItemsPerPage(3);
      }
    };

    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const totalPages = Math.ceil(displayBlogs.length / itemsPerPage);

  useEffect(() => {
    if (currentPage >= totalPages && totalPages > 0) {
      setCurrentPage(totalPages - 1);
    }
  }, [totalPages, currentPage]);

  const goToNext = () => {
    setCurrentPage((prev) => (prev + 1) % totalPages);
  };

  const goToPrev = () => {
    setCurrentPage((prev) => (prev - 1 + totalPages) % totalPages);
  };

  return (
    <section className="blog-events-section reveal-on-scroll" id="blog-section">
      <div className="blog-events-inner">
        {/* Header Row */}
        <div className="blog-events-header text-center max-w-2xl mx-auto">
          <span className="blog-events-badge">
            <Sparkles size={14} className="text-amber-500" />
            <span>Berita & Event Terkini</span>
          </span>
          <h2 className="blog-events-title">Berbagai Acara Dan Berita</h2>
          <p className="blog-events-subtitle">
            Bagikan kegiatan dan berita Anda di surade.com
          </p>
        </div>

        {/* Carousel Viewport Container */}
        <div className="blog-events-slider-container">
          {/* Floating Left Arrow */}
          {totalPages > 1 && (
            <button
              type="button"
              className="blog-events-side-arrow blog-events-side-arrow--left"
              onClick={goToPrev}
              aria-label="Slide Sebelumnya"
            >
              <ChevronLeft size={22} />
            </button>
          )}

          {/* Slider Viewport with Touch Swiping */}
          <div
            className="blog-events-viewport"
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
          >
            <div
              className="blog-events-track"
              style={{
                transform: `translateX(-${currentPage * 100}%)`,
                transition: "transform 0.45s cubic-bezier(0.16, 1, 0.3, 1)",
              }}
            >
              {Array.from({ length: totalPages }).map((_, pageIdx) => {
                const pageBlogs = displayBlogs.slice(
                  pageIdx * itemsPerPage,
                  pageIdx * itemsPerPage + itemsPerPage
                );

                return (
                  <div key={`blog-page-${pageIdx}`} className="blog-events-page">
                    {pageBlogs.map((post) => {
                      const isEvent = post.type === "event";
                      const isSaved = !!savedBlogs[post.id];
                      const imgUrl = getStorageUrl(post.thumbnail || post.img) || post.img;
                      const authorName = post.user?.name || post.author || "Admin Surade";
                      const postDateFormatted = formatDateClean(post.published_at || post.created_at || post.date);
                      const eventDateFormatted = isEvent && post.event_date ? formatDateClean(post.event_date) : "";
                      const categoryName = getCategoryName(post.blog_category || post.category) || (isEvent ? "Event & Festival" : "Berita & Artikel");
                      const locationText = post.event_location || post.location;

                      return (
                        <div key={post.id} className="blog-events-card-wrapper">
                          <article className={`blog-card${isEvent ? " blog-card--event" : ""}`}>
                            {/* Image Wrap */}
                            <div className="blog-card__img-wrap">
                              <Link to={`/blog/${post.slug || post.id}`} className="block w-full h-full">
                                <img
                                  src={imgUrl}
                                  alt={post.title}
                                  className="blog-card__img"
                                  loading="lazy"
                                  onError={(e) => {
                                    e.currentTarget.onerror = null;
                                    e.currentTarget.src =
                                      "https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=600&h=400&fit=crop&q=80";
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

                              {/* Prominent Bookmark Save Button */}
                              <button
                                type="button"
                                className={`blog-card__save-btn ${isSaved ? "saved" : ""}`}
                                onClick={(e) => {
                                  e.preventDefault();
                                  e.stopPropagation();
                                  if (toggleSave) toggleSave(post.id, true, post.title);
                                }}
                                aria-label={isSaved ? "Hapus dari simpanan" : "Simpan artikel"}
                                title={isSaved ? "Hapus dari simpanan" : "Simpan artikel ini"}
                              >
                                <Bookmark size={15} className="shrink-0" fill={isSaved ? "currentColor" : "none"} />
                                <span className="blog-card__save-text">{isSaved ? "Tersimpan" : "Simpan"}</span>
                              </button>
                            </div>

                            {/* Body Content */}
                            <div className="blog-card__body">
                              {/* Top Category & Type Meta */}
                              <div className="blog-card__top-meta">
                                {categoryName && (
                                  <span className="blog-card__category-pill">
                                    {categoryName}
                                  </span>
                                )}
                                {isEvent && eventDateFormatted && (
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

                              {/* Excerpt / Summary Text */}
                              <p className="blog-card__excerpt">
                                {post.excerpt || (post.content ? post.content.replace(/<[^>]+>/g, '').substring(0, 115) + "..." : "Platform direktori lokal Surade.com menjadi jembatan bagi ratusan pelaku usaha mikro untuk memperluas jangkauan pasar, promosi...")}
                              </p>

                              {/* Event Location Badge - Functional Google Maps Link */}
                              {isEvent && locationText && (
                                <a
                                  href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(locationText)}`}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="blog-card__event-loc"
                                  title="Buka Lokasi di Google Maps"
                                  onClick={(e) => e.stopPropagation()}
                                >
                                  <MapPin size={15} className="blog-card__event-loc-pin shrink-0" />
                                  <span className="blog-card__event-loc-text">{locationText}</span>
                                  <ExternalLink size={13} className="blog-card__event-loc-icon shrink-0" />
                                </a>
                              )}

                              {/* Meta Row: Author & Date */}
                              <div className="blog-card__meta">
                                <div className="blog-card__author">
                                  <img
                                    src={getUserAvatar(post)}
                                    alt={authorName}
                                    className="blog-card__author-avatar"
                                  />
                                  <span className="blog-card__author-name">{authorName}</span>
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
                        </div>
                      );
                    })}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Floating Right Arrow */}
          {totalPages > 1 && (
            <button
              type="button"
              className="blog-events-side-arrow blog-events-side-arrow--right"
              onClick={goToNext}
              aria-label="Slide Selanjutnya"
            >
              <ChevronRight size={22} />
            </button>
          )}
        </div>

        {/* Bottom Pagination Bar with Dots and Arrow Controls */}
        <div className="blog-events-bottom-bar">
          {totalPages > 1 && (
            <div className="blog-events-controls-row">
              <button
                type="button"
                className="blog-events-mini-arrow"
                onClick={goToPrev}
                aria-label="Slide Sebelumnya"
              >
                <ChevronLeft size={18} />
              </button>

              <div className="blog-events-dots">
                {Array.from({ length: totalPages }).map((_, idx) => (
                  <button
                    key={`dot-${idx}`}
                    type="button"
                    className={`blog-events-dot ${currentPage === idx ? "active" : ""}`}
                    onClick={() => setCurrentPage(idx)}
                    aria-label={`Ke slide ${idx + 1}`}
                  />
                ))}
              </div>

              <button
                type="button"
                className="blog-events-mini-arrow"
                onClick={goToNext}
                aria-label="Slide Selanjutnya"
              >
                <ChevronRight size={18} />
              </button>
            </div>
          )}

          <div className="blog-events-cta-wrap">
            <Link to="/blog" className="blog-events-cta-btn">
              <span>Lihat Semua Info & Event</span>
              <ArrowRight size={16} />
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
