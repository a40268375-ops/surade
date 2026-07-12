import { useParams, Link } from "react-router-dom";
import { useState, useEffect } from "react";
import logoImg from "../assets/logo.png";
import Loading from "../components/Loading";
import { usePageLoading } from "../hooks/usePageLoading";
import {
  ChevronDown,
  Plus,
  MapPin,
  Phone,
  Mail,
  Clock,
  Star,
  Share2,
  Bookmark,
  Store,
  Calendar,
  Eye,
  Tag,
  PartyPopper,
} from "lucide-react";
import "./Home.css";
import "./Profile.css";

const DEFAULT_SELLER = {
  id: 1,
  name: "Nicko Lay",
  avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=120&h=120&fit=crop",
  bio: "Pengusaha UMKM yang berdedikasi untuk mengembangkan bisnis lokal di Indonesia.",
  location: "Kabupaten Bogor, Jawa Barat",
  joined: "Januari 2024",
  rating: 4.8,
  reviews: 156,
};

const MOCK_ADS = [
  {
    id: 1,
    name: "Amel Irwanto cake",
    category: "Pertokoan",
    location: "Kabupaten Bogor",
    img: "https://images.unsplash.com/photo-1565958011703-44f9829ba187?w=400&h=250&fit=crop",
    views: 1280,
    status: "Buka Sekarang",
    rating: 4.5,
    reviews: 128,
  },
  {
    id: 2,
    name: "Global Bakery Leuwiliang",
    category: "Pertokoan",
    location: "Kabupaten Bogor",
    img: "https://images.unsplash.com/photo-1509440159596-0249088772ff?w=400&h=250&fit=crop",
    views: 890,
    status: "Buka Sekarang",
    rating: 4.4,
    reviews: 67,
  },
  {
    id: 3,
    name: "Toko Kue Ibu Nanih",
    category: "Pertokoan",
    location: "Kabupaten Bogor",
    img: "https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=400&h=250&fit=crop",
    views: 1560,
    status: "Buka Sekarang",
    rating: 4.8,
    reviews: 156,
  },
];

const MOCK_EVENTS = [
  {
    id: 1,
    title: "Bazar UMKM Akhir Pekan",
    excerpt: "Ikuti bazar UMKM yang menampilkan produk-produk unggulan pelaku usaha lokal...",
    date: "22 Juni 2024",
    time: "09:00 - 17:00",
    location: "Alun-Alun Kabupaten Bogor",
    category: "Bazar",
    img: "https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=400&h=200&fit=crop",
    views: 980,
  },
  {
    id: 2,
    title: "Workshop Manajemen Keuangan UMKM",
    excerpt: "Belajar mengelola keuangan bisnis kecil bersama praktisi berpengalaman...",
    date: "18 Juni 2024",
    time: "13:00 - 15:30",
    location: "Kantor Surade.co.id, Bogor",
    category: "Workshop",
    img: "https://images.unsplash.com/photo-1521737604893-d14cc237f11d?w=400&h=200&fit=crop",
    views: 745,
  },
];

const MOCK_BLOGS = [
  {
    id: 1,
    title: "Tips Mengembangkan Bisnis Kue di Era Digital",
    excerpt: "Pelajari strategi pemasaran digital untuk meningkatkan penjualan bisnis kue Anda...",
    date: "15 Juni 2024",
    category: "Tips Bisnis",
    img: "https://images.unsplash.com/photo-1556910103-1c02745aae4d?w=400&h=200&fit=crop",
    views: 2340,
  },
  {
    id: 2,
    title: "Resep Kue Ulang Tahun Spesial",
    excerpt: "Berbagi resep kue ulang tahun yang lezat dan mudah dibuat di rumah...",
    date: "10 Juni 2024",
    category: "Resep",
    img: "https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=400&h=200&fit=crop",
    views: 1890,
  },
  {
    id: 3,
    title: "Cara Memilih Bahan Kue Berkualitas",
    excerpt: "Panduan lengkap memilih bahan-bahan kue terbaik untuk hasil yang maksimal...",
    date: "5 Juni 2024",
    category: "Tips",
    img: "https://images.unsplash.com/photo-1509440159596-0249088772ff?w=400&h=200&fit=crop",
    views: 1560,
  },
];

function Navbar() {
  return (
    <header className="home-header">
      <div className="home-header__inner">
        <Link to="/" className="home-logo">
          <img src={logoImg} alt="Surade.co.id" className="home-logo__img" />
        </Link>
        <nav className="home-nav">
          <Link to="/" className="home-nav__link">Home</Link>
          <a href="#" className="home-nav__link home-nav__link--dropdown">
            <span>Informasi</span>
            <ChevronDown size={15} className="home-nav__caret" />
          </a>
          <Link to="/blog" className="home-nav__link">Blog</Link>
          <Link to="/contact" className="home-nav__link">Hubungi Kami</Link>
          <Link to="/login" className="home-nav__link home-nav__link--login">Login</Link>
          <button type="button" className="home-nav__button">
            <Plus size={15} /><span>Add Bisnis</span>
          </button>
        </nav>
      </div>
    </header>
  );
}

export default function Profile() {
  const pageLoading = usePageLoading();
  const { id } = useParams();
  const [seller, setSeller] = useState(DEFAULT_SELLER);
  const [activeTab, setActiveTab] = useState("business");
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  if (pageLoading) {
    return <Loading />;
  }

  return (
    <div className="profile-page">
      <Navbar />

      {/* Profile Header */}
      <section className="profile-header">
        <div className="profile-header__inner">
          <div className="profile-header__cover">
            <div className="profile-header__cover-bg" />
          </div>
          
          <div className="profile-header__content">
            <div className="profile-header__avatar-wrapper">
              <img src={seller.avatar} alt={seller.name} className="profile-header__avatar" />
            </div>
            
            <div className="profile-header__info">
              <h1 className="profile-header__name">{seller.name}</h1>
              <p className="profile-header__bio">{seller.bio}</p>
              
              <div className="profile-header__meta">
                <div className="profile-header__meta-item">
                  <MapPin size={16} />
                  <span>{seller.location}</span>
                </div>
                <div className="profile-header__meta-item">
                  <Calendar size={16} />
                  <span>Bergabung {seller.joined}</span>
                </div>
                <div className="profile-header__meta-item">
                  <Star size={16} fill="#fbbf24" stroke="#fbbf24" />
                  <span>{seller.rating} ({seller.reviews} ulasan)</span>
                </div>
              </div>
              
              <div className="profile-header__stats">
                <div className="profile-header__stat">
                  <span className="profile-header__stat-value">{MOCK_ADS.length}</span>
                  <span className="profile-header__stat-label">Bisnis</span>
                </div>
                <div className="profile-header__stat">
                  <span className="profile-header__stat-value">{MOCK_BLOGS.length}</span>
                  <span className="profile-header__stat-label">Blog</span>
                </div>
                <div className="profile-header__stat">
                  <span className="profile-header__stat-value">{MOCK_EVENTS.length}</span>
                  <span className="profile-header__stat-label">Event</span>
                </div>
                <div className="profile-header__stat">
                  <span className="profile-header__stat-value">{MOCK_ADS.reduce((acc, ad) => acc + ad.views, 0).toLocaleString()}</span>
                  <span className="profile-header__stat-label">Total Views</span>
                </div>
              </div>
              
              <div className="profile-header__actions">
                <button
                  className={`profile-header__btn profile-header__btn--primary ${saved ? "saved" : ""}`}
                  onClick={() => setSaved(!saved)}
                >
                  <Bookmark size={18} fill={saved ? "currentColor" : "none"} />
                  {saved ? "Disimpan" : "Simpan"}
                </button>
                <button className="profile-header__btn profile-header__btn--secondary">
                  <Share2 size={18} />
                  Bagikan
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Content Tabs */}
      <section className="profile-content">
        <div className="profile-content__inner">
          <div className="profile-tabs">
            <button
              className={`profile-tab ${activeTab === "business" ? "active" : ""}`}
              onClick={() => setActiveTab("business")}
            >
              <Store size={18} />
              <span>Bisnis</span>
            </button>
            <button
              className={`profile-tab ${activeTab === "blogs" ? "active" : ""}`}
              onClick={() => setActiveTab("blogs")}
            >
              <Tag size={18} />
              <span>Blog</span>
            </button>
            <button
              className={`profile-tab ${activeTab === "events" ? "active" : ""}`}
              onClick={() => setActiveTab("events")}
            >
              <PartyPopper size={18} />
              <span>Event</span>
            </button>
          </div>

          {/* Business Content */}
          {activeTab === "business" && (
            <div className="profile-section">
              <h2 className="profile-section__title">Bisnis yang Dikelola</h2>
              <div className="profile-grid">
                {MOCK_ADS.map((ad) => (
                  <Link key={ad.id} to={`/business/${ad.id}`} className="profile-card">
                    <div className="profile-card__img-wrap">
                      <img src={ad.img} alt={ad.name} className="profile-card__img" />
                      <div className="profile-card__overlay">
                        <div className="profile-card__views">
                          <Eye size={14} />
                          <span>{ad.views.toLocaleString()}</span>
                        </div>
                      </div>
                    </div>
                    <div className="profile-card__body">
                      <h3 className="profile-card__name">{ad.name}</h3>
                      <p className="profile-card__category">{ad.category}</p>
                      <div className="profile-card__meta">
                        <div className="profile-card__rating">
                          <Star size={14} fill="#fbbf24" stroke="#fbbf24" />
                          <span>{ad.rating}</span>
                        </div>
                        <span className={`profile-card__status ${ad.status === "Buka Sekarang" ? "open" : "closed"}`}>
                          {ad.status}
                        </span>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          )}

          {/* Blogs Content */}
          {activeTab === "blogs" && (
            <div className="profile-section">
              <h2 className="profile-section__title">Artikel Blog</h2>
              <div className="profile-grid">
                {MOCK_BLOGS.map((blog) => (
                  <Link key={blog.id} to={`/blog/${blog.id}`} className="profile-card profile-card--blog">
                    <div className="profile-card__img-wrap">
                      <img src={blog.img} alt={blog.title} className="profile-card__img" />
                      <div className="profile-card__overlay">
                        <div className="profile-card__views">
                          <Eye size={14} />
                          <span>{blog.views.toLocaleString()}</span>
                        </div>
                      </div>
                    </div>
                    <div className="profile-card__body">
                      <span className="profile-card__blog-category">{blog.category}</span>
                      <h3 className="profile-card__name">{blog.title}</h3>
                      <p className="profile-card__excerpt">{blog.excerpt}</p>
                      <div className="profile-card__date">
                        <Calendar size={14} />
                        <span>{blog.date}</span>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          )}

          {/* Events Content */}
          {activeTab === "events" && (
            <div className="profile-section">
              <h2 className="profile-section__title">Event yang Dibuat</h2>
              {MOCK_EVENTS.length > 0 ? (
                <div className="profile-grid">
                  {MOCK_EVENTS.map((event) => (
                    <Link key={event.id} to="/blog" className="profile-card profile-card--blog">
                      <div className="profile-card__img-wrap">
                        <img src={event.img} alt={event.title} className="profile-card__img" />
                        <div className="profile-card__overlay">
                          <div className="profile-card__views">
                            <Eye size={14} />
                            <span>{event.views.toLocaleString()}</span>
                          </div>
                        </div>
                      </div>
                      <div className="profile-card__body">
                        <span className="profile-card__blog-category">{event.category}</span>
                        <h3 className="profile-card__name">{event.title}</h3>
                        <p className="profile-card__excerpt">{event.excerpt}</p>
                        <div className="profile-card__date">
                          <Calendar size={14} />
                          <span>{event.date}</span>
                        </div>
                        <div className="profile-card__date">
                          <Clock size={14} />
                          <span>{event.time}</span>
                        </div>
                        <div className="profile-card__date">
                          <MapPin size={14} />
                          <span>{event.location}</span>
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              ) : (
                <p className="profile-empty">Belum ada event yang dibuat.</p>
              )}
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
