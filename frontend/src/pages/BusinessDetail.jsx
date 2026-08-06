import { useParams, Link, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import Navbar from "../components/Navbar";
import { InlineSpinner } from "../components/LoadingScreen";
import api from "../services/api";
import { getStorageUrl, DEFAULT_AVATAR } from "../utils/constants";
import {
  MapPin,
  Phone,
  Mail,
  Star,
  Share2,
  Bookmark,
  MessageCircle,
  Send,
  DollarSign,
  Clock,
  X,
  Building2,
  ArrowRight,
  Scan,
  Plus,
  Package,
  Loader2,
} from "lucide-react";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import markerIcon2x from "leaflet/dist/images/marker-icon-2x.png";
import markerIcon from "leaflet/dist/images/marker-icon.png";
import markerShadow from "leaflet/dist/images/marker-shadow.png";
import "./Home.css";
import "./BusinessDetail.css";

// Fix Leaflet default icon for Vite
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: markerIcon2x,
  iconUrl: markerIcon,
  shadowUrl: markerShadow,
});

function maskPhone() {
  return "** *** **** ";
}

// ── Day name mapping (Indonesia -> English) ──
const DAY_MAP = {
  Senin: "Monday",
  Selasa: "Tuesday",
  Rabu: "Wednesday",
  Kamis: "Thursday",
  Jumat: "Friday",
  Sabtu: "Saturday",
  Minggu: "Sunday",
};

function getTodayName() {
  const today = new Date().toLocaleDateString("id-ID", { weekday: "long" });
  return today;
}

function isOpenNow(openingDays) {
  if (!openingDays || !Array.isArray(openingDays) || openingDays.length === 0) return null;
  const todayName = getTodayName();
  const todayEntry = openingDays.find((d) => d.day === todayName);
  if (!todayEntry) return false;

  const now = new Date();
  const currentMinutes = now.getHours() * 60 + now.getMinutes();

  const parseMinutes = (timeStr) => {
    if (!timeStr || typeof timeStr !== "string") return null;
    const parts = timeStr.split(":");
    if (parts.length !== 2) return null;
    const h = parseInt(parts[0], 10);
    const m = parseInt(parts[1], 10);
    if (isNaN(h) || isNaN(m) || h < 0 || h > 23 || m < 0 || m > 59) return null;
    return h * 60 + m;
  };

  const openMin = parseMinutes(todayEntry.open);
  const closeMin = parseMinutes(todayEntry.close);
  if (openMin === null || closeMin === null) return null;

  return currentMinutes >= openMin && currentMinutes <= closeMin;
}

export default function BusinessDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [business, setBusiness] = useState(null);
  const [saved, setSaved] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [showPhone, setShowPhone] = useState(false);
  const [showHours, setShowHours] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [showPriceDropdown, setShowPriceDropdown] = useState(false);
  const [priceCategory, setPriceCategory] = useState(2); // 1: cheap, 2: medium, 3: expensive
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [products, setProducts] = useState([]);
  const [loadingProducts, setLoadingProducts] = useState(false);
  const [hasActiveAd, setHasActiveAd] = useState(false);
  const [reviews, setReviews] = useState([]);
  const [loadingReviews, setLoadingReviews] = useState(false);
  const [userRating, setUserRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [reviewComment, setReviewComment] = useState("");
  const [submittingReview, setSubmittingReview] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [showProductPopup, setShowProductPopup] = useState(false);

  const getStorageUrl = (path) => {
    if (!path) return "";
    if (path.startsWith("http")) return path;
    const baseUrl = import.meta.env.VITE_API_URL.replace(/\/api$/i, "");
    return `${baseUrl}/storage/${path}`;
  };

  useEffect(() => {
    window.scrollTo(0, 0);
    setShowPhone(false);
    setShowHours(false);
    setCurrentImageIndex(0);

    const fetchBusiness = async () => {
      setIsLoading(true);
      try {
        const res = await api.get(`/businesses/${id}`);
        const data = res.data?.data || res.data;
        if (data && data.id) {
          setBusiness(data);
          // Check if current user has favorited this business
          const userStr = localStorage.getItem("user");
          const user = userStr ? JSON.parse(userStr) : null;
          if (user && data.favorites && data.favorites.some(f => f.user_id === user.id)) {
            setSaved(true);
          }
        } else {
          setError("Bisnis tidak ditemukan.");
        }
      } catch (err) {
        console.error("Failed to fetch business:", err);
        setError("Gagal memuat data bisnis. Silakan coba lagi nanti.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchBusiness();
  }, [id]);

  useEffect(() => {
    if (!business) return;

    // Bangun daftar gambar untuk hero slideshow:
    // 1. Logo (thumbnail utama) SELALU menjadi slide pertama jika ada
    // 2. Banner dari business_media menyusul setelah logo
    // 3. Gallery dari business_media paling akhir
    const allMedia = Array.isArray(business.media) ? business.media : [];
    const bannerMedia = allMedia.filter((m) => m.title === "Banner");
    const galleryMedia = allMedia.filter((m) => m.title !== "Banner" && m.type === "image");

    const imagesList = [];

    // Logo selalu pertama
    if (business.logo) {
      imagesList.push(getStorageUrl(business.logo));
    }

    // Banner setelah logo
    bannerMedia.forEach((m) => {
      const url = getStorageUrl(m.file_path);
      if (!imagesList.includes(url)) imagesList.push(url);
    });

    // Gallery paling akhir
    galleryMedia.forEach((m) => {
      const url = getStorageUrl(m.file_path);
      if (!imagesList.includes(url)) imagesList.push(url);
    });

    if (imagesList.length <= 1) return;
    const interval = setInterval(() => {
      setCurrentImageIndex((prev) => (prev + 1) % imagesList.length);
    }, 3000);
    return () => clearInterval(interval);
  }, [business]);

  // Fetch products for this business
  useEffect(() => {
    const fetchProducts = async () => {
      if (!business || !business.id) return;
      setLoadingProducts(true);
      try {
        const res = await api.get(`/businesses/${business.id}/products`);
        const data = res.data?.data || res.data || [];
        const list = Array.isArray(data) ? data : (data?.data || []);
        setProducts(list);
      } catch (err) {
        console.error("Failed to fetch products:", err);
        setProducts([]);
      } finally {
        setLoadingProducts(false);
      }
    };
    fetchProducts();
  }, [business?.id]);

  // Check if business has active advertisement
  useEffect(() => {
    const checkAdvertisement = async () => {
      if (!business || !business.id) return;
      try {
        const res = await api.get('/advertisements');
        const adsData = res.data?.data || res.data || [];
        const activeAd = adsData.find(ad => 
          ad.business?.id === business.id && 
          ad.status === 'approved' && 
          ad.payment_status === 'paid'
        );
        setHasActiveAd(!!activeAd);
      } catch (err) {
        console.error("Failed to check advertisement:", err);
        setHasActiveAd(false);
      }
    };
    checkAdvertisement();
  }, [business?.id]);

  // Fetch reviews (ratings) for this business
  useEffect(() => {
    const fetchReviews = async () => {
      if (!business || !business.id) return;
      setLoadingReviews(true);
      try {
        // Route backend: GET /businesses/{business}/ratings
        const res = await api.get(`/businesses/${business.id}/ratings`);
        // RatingController.index() returns paginate — data ada di res.data.data
        const raw = res.data?.data || res.data || [];
        const list = Array.isArray(raw) ? raw : (raw?.data || []);
        setReviews(list);
      } catch (err) {
        console.error("Failed to fetch reviews:", err);
        setReviews([]);
      } finally {
        setLoadingReviews(false);
      }
    };
    fetchReviews();
  }, [business?.id]);

  const handleShare = async () => {
    const url = window.location.href;
    if (navigator.share) {
      await navigator.share({ title: business.name, url });
    } else {
      await navigator.clipboard.writeText(url);
      alert("Link berhasil disalin!");
    }
  };

  const handleToggleSave = async () => {
    const userStr = localStorage.getItem("user");
    if (!userStr) {
      alert("Silakan login terlebih dahulu untuk menyimpan bisnis.");
      navigate("/login");
      return;
    }
    
    if (isSaving || !business) return;
    setIsSaving(true);
    
    try {
      if (saved) {
        await api.delete(`/favorites/${business.id}`);
        setSaved(false);
      } else {
        await api.post(`/favorites/${business.id}`);
        setSaved(true);
      }
    } catch (err) {
      console.error("Failed to toggle favorite:", err);
      alert("Terjadi kesalahan saat menyimpan bookmark.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleWhatsApp = () => {
    const phone = business.phone.replace(/\D/g, "");
    window.open(`https://wa.me/${phone}`, "_blank");
  };

  const handleDirections = () => {
    const query = encodeURIComponent(business.address);
    window.open(`https://www.google.com/maps/search/?api=1&query=${query}`, "_blank");
  };

  const handleProductClick = (product) => {
    setSelectedProduct(product);
    setShowProductPopup(true);
  };

  const closeProductPopup = () => {
    setShowProductPopup(false);
    setSelectedProduct(null);
  };

  const handleStarClick = (rating) => {
    setUserRating(rating);
  };

  const handleStarHover = (rating) => {
    setHoverRating(rating);
  };

  const handleStarLeave = () => {
    setHoverRating(0);
  };

  const handleSubmitReview = async () => {
    if (!userRating || !reviewComment.trim()) {
      alert("Silakan berikan rating dan tulis ulasan Anda.");
      return;
    }

    setSubmittingReview(true);
    try {
      const token = localStorage.getItem("token");
      const userStr = localStorage.getItem("user");
      const user = userStr ? JSON.parse(userStr) : null;

      if (!user) {
        alert("Silakan login terlebih dahulu untuk memberikan ulasan.");
        setSubmittingReview(false);
        return;
      }

      if (!token) {
        alert("Sesi Anda telah berakhir. Silakan login kembali.");
        setSubmittingReview(false);
        return;
      }

      // Route backend: POST /businesses/{business}/ratings
      // Field: rating (integer 1-5), review (string)
      const res = await api.post(`/businesses/${business.id}/ratings`, {
        rating: userRating,
        review: reviewComment.trim(),
      });

      const newReview = res.data?.data || res.data;

      // Refresh ratings dari server agar list dan average akurat
      try {
        const ratingsRes = await api.get(`/businesses/${business.id}/ratings`);
        const raw = ratingsRes.data?.data || ratingsRes.data || [];
        const list = Array.isArray(raw) ? raw : (raw?.data || []);
        setReviews(list);
      } catch {
        // Jika refresh gagal, tambahkan review baru ke list lokal
        setReviews(prev => [newReview, ...prev]);
      }

      setUserRating(0);
      setReviewComment("");
      alert("Ulasan berhasil dikirim!");

      // Refresh business data untuk update average rating
      try {
        const bizRes = await api.get(`/businesses/${id}`);
        const bizData = bizRes.data?.data || bizRes.data;
        if (bizData && bizData.id) {
          setBusiness(bizData);
        }
      } catch (refreshErr) {
        console.error("Failed to refresh business data:", refreshErr);
      }
    } catch (err) {
      console.error("Failed to submit review:", err);
      
      // Show more specific error message
      let errorMessage = "Gagal mengirim ulasan. Silakan coba lagi.";
      if (err.response) {
        if (err.response.status === 401) {
          errorMessage = "Sesi Anda telah berakhir. Silakan login kembali.";
        } else if (err.response.status === 422) {
          errorMessage = "Data ulasan tidak valid. Silakan periksa kembali.";
        } else if (err.response.status === 403) {
          errorMessage = "Anda tidak memiliki izin untuk memberikan ulasan.";
        } else if (err.response.status === 404) {
          errorMessage = "Bisnis tidak ditemukan.";
        } else if (err.response.status === 500) {
          errorMessage = "Terjadi kesalahan server. Silakan coba lagi nanti.";
        }
      } else if (err.request) {
        errorMessage = "Tidak dapat terhubung ke server. Silakan periksa koneksi internet Anda.";
      }
      
      alert(errorMessage);
    } finally {
      setSubmittingReview(false);
    }
  };

  // ── Tampilkan loading spinner saat data belum siap ──
  if (isLoading) {
    return (
      <div className="business-detail-page">
        <Navbar />
        <div className="bd-content" style={{ paddingTop: "100px" }}>
          <InlineSpinner text="Memuat data usaha..." />
        </div>
      </div>
    );
  }

  if (!business) {
    return (
      <div className="business-detail-page">
        <Navbar />
        <div className="business-detail__not-found">
          <h2>Bisnis tidak ditemukan</h2>
          <Link to="/" className="business-detail__back-link">Kembali ke Home</Link>
        </div>
      </div>
    );
  }

  const imagesList = (() => {
    // Logo (thumbnail) SELALU menjadi item pertama
    // Banner dari business_media menyusul
    // Gallery paling akhir
    const allMedia = Array.isArray(business.media) ? business.media : [];
    const bannerMedia = allMedia.filter((m) => m.title === "Banner");
    const galleryMedia = allMedia.filter((m) => m.title !== "Banner" && m.type === "image");

    const list = [];

    if (business.logo) {
      list.push(getStorageUrl(business.logo));
    }

    bannerMedia.forEach((m) => {
      const url = getStorageUrl(m.file_path);
      if (!list.includes(url)) list.push(url);
    });

    galleryMedia.forEach((m) => {
      const url = getStorageUrl(m.file_path);
      if (!list.includes(url)) list.push(url);
    });

    return list;
  })();

  // Gallery only (tanpa banner) — untuk section Galeri Foto
  const galleryImages = (() => {
    const allMedia = Array.isArray(business.media) ? business.media : [];
    const galleryMedia = allMedia.filter((m) => m.title !== "Banner" && m.type === "image");
    if (galleryMedia.length > 0) {
      return galleryMedia.map((m) => getStorageUrl(m.file_path));
    }
    // Fallback: jika tidak ada gallery media, gunakan imagesList minus banner
    return imagesList;
  })();

  // Extract main category and subcategory
  const mainCategory = business.category?.parent || business.category;
  const subCategory = business.category?.parent ? business.category : null;
  const categoryName = mainCategory?.name || business.category?.name || "Umum";
  const subCategoryName = subCategory?.name || null;

  // Hitung rating average dan jumlah dari reviews yang di-load
  // Fallback ke field business jika reviews belum di-load
  const computedAvg = reviews.length > 0
    ? reviews.reduce((sum, r) => sum + (r.rating || 0), 0) / reviews.length
    : null;
  const displayRating = computedAvg !== null
    ? parseFloat(computedAvg.toFixed(1))
    : (business.rating ?? business.averageRating ?? 0);
  const displayReviews = reviews.length > 0
    ? reviews.length
    : (business.reviews ?? business.total_rating ?? 0);

  // ── Dynamic open/closed status from opening_days ──
  const openDays = business.opening_days;
  const todayName = getTodayName();
  const isOpen = isOpenNow(openDays);
  const displayStatus = isOpen === true ? "Buka Sekarang" : isOpen === false ? "Tutup" : "Buka Sekarang";

  // Seller/owner diambil dari business.user (sesuai API response yang sudah eager load 'user')
  const seller = business.user
    ? {
        id: business.user.id,
        name: business.user.name,
        avatar: business.user.avatar
          ? getStorageUrl(business.user.avatar)
          : DEFAULT_AVATAR,
        banner: business.user.banner
          ? getStorageUrl(business.user.banner)
          : null,
      }
    : {
        id: null,
        name: "Pemilik tidak tersedia",
        avatar: DEFAULT_AVATAR,
        banner: null,
      };

  return (
    <div className="business-detail-page">
      <Navbar />

      {/* HERO */}
      <section className="bd-hero">
        <div className="bd-hero__bg">
          <div
            className="bd-hero__slides-container"
            style={{ transform: `translateX(-${currentImageIndex * 100}%)` }}
          >
            {imagesList.map((src, i) => (
              <img key={i} src={src} alt="" className="bd-hero__slide-img" />
            ))}
          </div>
        </div>
        <div className="bd-hero__overlay" />
        <div className="bd-hero__content">
          <div className="bd-hero__inner">
            <div className="bd-hero__breadcrumb">
              <Link to="/">Home</Link>
              <span>/</span>
              <span>{categoryName}</span>
              {subCategoryName && (
                <>
                  <span>/</span>
                  <span>{subCategoryName}</span>
                </>
              )}
              <span>/</span>
              <span>{business.name}</span>
            </div>
            <h1 className="bd-hero__title">
              {business.name}
              {hasActiveAd && (
                <span className="bd-hero__ad-badge">⭐ Iklan Premium</span>
              )}
            </h1>
            <div className="bd-hero__category">
              <span className="bd-hero__category-main">{categoryName}</span>
              {subCategoryName && (
                <>
                  <span className="bd-hero__category-separator">›</span>
                  <span className="bd-hero__category-sub">{subCategoryName}</span>
                </>
              )}
            </div>
            <div className="bd-hero__meta">
              <div className="bd-hero__rating">
                <Star size={18} fill="#fbbf24" stroke="#fbbf24" />
                <span>{displayRating}</span>
                <span>({displayReviews} ulasan)</span>
              </div>
              <div className="bd-hero__status">
                <span className={`bd-hero__status-dot ${isOpen === true ? "open" : "closed"}`} />
                <span>{displayStatus}</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* MAIN CONTENT */}
      <section className="bd-content">
        <div className="bd-content__inner">
          <div className="bd-content__main">
            {/* Quick Action Icons */}
            <div className="bd-quick-actions">
              {/* Price Category Dropdown */}
              <div className="bd-price-dropdown-wrapper">
                <button
                  type="button"
                  className={`bd-quick-action ${showPriceDropdown ? "active" : ""}`}
                  title="Kategori Harga"
                  onClick={() => setShowPriceDropdown(!showPriceDropdown)}
                >
                  <DollarSign size={22} strokeWidth={1.8} />
                  <span className="bd-price-count">{priceCategory}</span>
                </button>
                {showPriceDropdown && (
                  <div className="bd-price-dropdown">
                    <button
                      type="button"
                      className={`bd-price-option ${priceCategory === 1 ? "active" : ""}`}
                      onClick={() => { setPriceCategory(1); setShowPriceDropdown(false); }}
                    >
                      <DollarSign size={16} />
                      <span>Murah</span>
                    </button>
                    <button
                      type="button"
                      className={`bd-price-option ${priceCategory === 2 ? "active" : ""}`}
                      onClick={() => { setPriceCategory(2); setShowPriceDropdown(false); }}
                    >
                      <div className="bd-price-dollars">
                        <DollarSign size={16} />
                        <DollarSign size={16} />
                      </div>
                      <span>Sedang</span>
                    </button>
                    <button
                      type="button"
                      className={`bd-price-option ${priceCategory === 3 ? "active" : ""}`}
                      onClick={() => { setPriceCategory(3); setShowPriceDropdown(false); }}
                    >
                      <div className="bd-price-dollars">
                        <DollarSign size={16} />
                        <DollarSign size={16} />
                        <DollarSign size={16} />
                      </div>
                      <span>Mahal</span>
                    </button>
                  </div>
                )}
              </div>

              <a href={`mailto:${business.email}`} className="bd-quick-action" title="Email">
                <Mail size={22} strokeWidth={1.8} />
              </a>

              {/* Phone - Left blank as requested */}
              <button type="button" className="bd-quick-action bd-quick-action--disabled" title="Telepon" disabled>
                <Phone size={22} strokeWidth={1.8} />
              </button>

              {/* WhatsApp - replacing Telegram */}
              <button type="button" className="bd-quick-action" title="WhatsApp" onClick={handleWhatsApp}>
                <MessageCircle size={22} strokeWidth={1.8} />
              </button>

              {/* Directions - Maps */}
              <button type="button" className="bd-quick-action" title="Dapatkan Arah" onClick={handleDirections}>
                <Send size={22} strokeWidth={1.8} />
              </button>

              <button
                type="button"
                className={`bd-quick-action ${saved ? "active" : ""} ${isSaving ? "disabled" : ""}`}
                title={saved ? "Disimpan" : "Simpan"}
                onClick={handleToggleSave}
                disabled={isSaving}
              >
                <Bookmark size={22} strokeWidth={1.8} fill={saved ? "currentColor" : "none"} />
              </button>
              <button type="button" className="bd-quick-action" title="Bagikan" onClick={handleShare}>
                <Share2 size={22} strokeWidth={1.8} />
              </button>
            </div>

            {showHours && (
              <div className="bd-hours-banner">
                <Clock size={18} />
                <span>Jam Operasional: <strong>{business.hours}</strong></span>
              </div>
            )}

            {/* About */}
            <div className="bd-about-card">
              <h2 className="bd-about-card__title">Tentang {business.name}</h2>
              <p className="bd-about-card__text">{business.description || "Belum ada deskripsi."}</p>
            </div>

            {/* Gallery */}
            <div className="bd-gallery-section">
              <h2 className="bd-gallery-section__title">Galeri Foto &amp; Video</h2>
              <div className="bd-photo-grid">
                {galleryImages.length > 0 ? (
                  galleryImages.map((src, i) => (
                    <div key={i} className="bd-photo-item">
                      <img src={src} alt={`${business.name} ${i + 1}`} loading="lazy" />
                    </div>
                  ))
                ) : (
                  <p className="bd-gallery-empty">Belum ada foto galeri.</p>
                )}
              </div>
              {business.video && (
                <div className="bd-video-container">
                  <h3 className="bd-video-title">Video Profil</h3>
                  <div className="bd-video-player-wrapper">
                    <video controls src={business.video} poster={business.img} className="bd-video-player">
                      Your browser does not support the video tag.
                    </video>
                  </div>
                </div>
              )}
            </div>

            {/* Products Section */}
            <section className="bd-products-section">
              <div className="bd-products-header">
                <h3>Produk Kami</h3>
                <p>Produk dan layanan dari {business.name}</p>
              </div>
              {loadingProducts ? (
                <div className="bd-products-loading">
                  <Loader2 size={32} className="spin" />
                  <p>Memuat produk...</p>
                </div>
              ) : products.length > 0 ? (
                <div className="bd-products-grid">
                  {products.map((product) => (
                    <div
                      key={product.id}
                      className="bd-product-card"
                      onClick={() => handleProductClick(product)}
                      style={{ cursor: "pointer" }}
                    >
                      <div className="bd-product-card__image">
                        <img
                          src={product.image ? getStorageUrl(product.image) : "https://via.placeholder.com/200"}
                          alt={product.name}
                          onError={(e) => { e.currentTarget.src = "https://via.placeholder.com/200" }}
                        />
                      </div>
                      <div className="bd-product-card__content">
                        <h4 className="bd-product-card__name">{product.name}</h4>
                        <p className="bd-product-card__price">
                          {product.price != null
                            ? new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", maximumFractionDigits: 0 }).format(Number(product.price))
                            : "-"}
                        </p>
                        <p className="bd-product-card__description">{product.description}</p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="bd-products-empty">
                  <Package size={48} />
                  <p>Belum ada produk di toko ini</p>
                </div>
              )}
            </section>

            {/* Tags */}
            <div className="bd-tags">
              <h3 className="bd-tags__title">Tags</h3>
              <div className="bd-tags__list">
                {business.tags.map((tag) => (
                  <span key={tag} className="bd-tag">{tag}</span>
                ))}
              </div>
            </div>

            {/* Reviews Section */}
            <div className="bd-reviews-section">
              <div className="bd-reviews-header">
                <h3 className="bd-reviews-header__title">Ulasan &amp; Penilaian</h3>
                <div className="bd-reviews-header__summary">
                  <div className="bd-reviews-header__rating">
                    <Star size={24} fill="#fbbf24" stroke="#fbbf24" />
                    <span className="bd-reviews-header__rating-value">{displayRating}</span>
                    <span className="bd-reviews-header__rating-count">({displayReviews} ulasan)</span>
                  </div>
                </div>
              </div>

              {/* Review Form */}
              <div className="bd-review-form">
                <h4 className="bd-review-form__title">Tulis Ulasan Anda</h4>
                <div className="bd-review-form__stars">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      className="bd-review-form__star"
                      onClick={() => handleStarClick(star)}
                      onMouseEnter={() => handleStarHover(star)}
                      onMouseLeave={handleStarLeave}
                    >
                      <Star
                        size={28}
                        fill={(hoverRating || userRating) >= star ? "#fbbf24" : "none"}
                        color={(hoverRating || userRating) >= star ? "#fbbf24" : "#d1d5db"}
                      />
                    </button>
                  ))}
                </div>
                <textarea
                  className="bd-review-form__textarea"
                  placeholder="Bagikan pengalaman Anda tentang bisnis ini..."
                  value={reviewComment}
                  onChange={(e) => setReviewComment(e.target.value)}
                  rows={4}
                />
                <button
                  type="button"
                  className="bd-review-form__submit"
                  onClick={handleSubmitReview}
                  disabled={submittingReview || !userRating || !reviewComment.trim()}
                >
                  {submittingReview ? (
                    <>
                      <Loader2 size={18} className="spin" />
                      <span>Mengirim...</span>
                    </>
                  ) : (
                    <>
                      <Send size={18} />
                      <span>Kirim Ulasan</span>
                    </>
                  )}
                </button>
              </div>

              {/* Reviews List */}
              {loadingReviews ? (
                <div className="bd-reviews-loading">
                  <Loader2 size={32} className="spin" />
                  <p>Memuat ulasan...</p>
                </div>
              ) : reviews.length > 0 ? (
                <div className="bd-reviews-list">
                  {reviews.map((review) => (
                    <div key={review.id} className="bd-review-card">
                      <div className="bd-review-card__header">
                        <img
                          src={review.user?.avatar || DEFAULT_AVATAR}
                          alt={review.user?.name || "User"}
                          className="bd-review-card__avatar"
                          onError={(e) => { e.currentTarget.src = DEFAULT_AVATAR; }}
                        />
                        <div className="bd-review-card__user-info">
                          <h5 className="bd-review-card__user-name">{review.user?.name || "User"}</h5>
                          <div className="bd-review-card__stars">
                            {[1, 2, 3, 4, 5].map((star) => (
                              <Star
                                key={star}
                                size={14}
                                fill={star <= review.rating ? "#fbbf24" : "none"}
                                color={star <= review.rating ? "#fbbf24" : "#d1d5db"}
                              />
                            ))}
                          </div>
                        </div>
                        <span className="bd-review-card__date">
                          {new Date(review.created_at).toLocaleDateString("id-ID", {
                            year: "numeric",
                            month: "long",
                            day: "numeric",
                          })}
                        </span>
                      </div>
                      <p className="bd-review-card__comment">{review.review || review.comment || ""}</p>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="bd-reviews-empty">
                  <MessageCircle size={48} style={{ opacity: 0.5 }} />
                  <p>Belum ada ulasan. Jadilah yang pertama memberikan ulasan!</p>
                </div>
              )}
            </div>
          </div>

          {/* Sidebar */}
          <div className="bd-content__sidebar">
            {/* Hours */}
            <div className="bd-hours-card">
              <h3 className="bd-hours-card__title">
                <Clock size={18} />
                <span>Jam Buka</span>
              </h3>
              {openDays && Array.isArray(openDays) && openDays.length > 0 ? (
                <div className="bd-hours-table">
                  {openDays.map((d) => {
                    const isToday = d.day === todayName;
                    return (
                      <div key={d.day} className={`bd-hours-row ${isToday ? "today" : ""}`}>
                        <span className="bd-hours-day">{d.day}</span>
                        <span className="bd-hours-time">{d.open} - {d.close}</span>
                        {isToday && (
                          <span className={`bd-hours-badge ${isOpen ? "open" : "closed"}`}>
                            {isOpen ? "Buka" : "Tutup"}
                          </span>
                        )}
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="bd-hours-card__content">
                  <Clock size={20} className="bd-hours-card__icon" />
                  <span className="bd-hours-card__time">{business.opening_hours || business.hours || "-"}</span>
                </div>
              )}
            </div>

            {/* Location & Address Combined Card */}
            <div className="bd-location-card">
              <div className="bd-location-card__header">
                <div>
                  <h3 className="bd-location-card__title">Lokasi & Alamat</h3>
                  <p className="bd-location-card__subtitle">Temukan lokasi dan informasi alamat</p>
                </div>
                <button type="button" className="bd-location-card__expand" onClick={handleDirections} title="Buka Peta Full">
                  <Scan size={20} />
                </button>
              </div>

              <div className="bd-location-card__map-wrapper">
                {business.latitude && business.longitude ? (
                  <div style={{ borderRadius: "14px", overflow: "hidden", height: "200px", position: "relative", zIndex: 0, isolation: "isolate" }}>
                    <MapContainer
                      center={[parseFloat(business.latitude), parseFloat(business.longitude)]}
                      zoom={15}
                      style={{ height: "200px", width: "100%", position: "relative", zIndex: 0 }}
                      scrollWheelZoom={false}
                      zoomControl={true}
                    >
                      <TileLayer
                        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                      />
                      <Marker position={[parseFloat(business.latitude), parseFloat(business.longitude)]}>
                        <Popup>
                          <strong>{business.name}</strong><br />
                          {business.address}
                        </Popup>
                      </Marker>
                    </MapContainer>
                  </div>
                ) : (
                  <button type="button" className="bd-location-card__map" onClick={handleDirections}>
                    <div className="bd-location-card__map-placeholder">
                      <MapPin size={32} />
                      <p>Klik untuk buka di Google Maps</p>
                    </div>
                  </button>
                )}
              </div>

              <a
                href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(business.address)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="bd-location-gmaps-btn"
              >
                <MapPin size={18} />
                <span>Buka di Google Maps</span>
                <ArrowRight size={16} />
              </a>

              <div className="bd-address-full-section">
                <h4 className="bd-address-full-title">Alamat Lengkap</h4>
                <div className="bd-address-full-box">
                  <div className="bd-address-full-icon">
                    <Building2 size={20} />
                  </div>
                  <p className="bd-address-full-text">{business.address}</p>
                </div>
              </div>
            </div>

            <div className="bd-seller-card">
              {/* Banner user */}
              <div className="bd-seller-card__banner">
                {seller.banner ? (
                  <img src={getStorageUrl(seller.banner)} alt="Banner" className="bd-seller-card__banner-img" onError={(e) => { e.currentTarget.style.display = "none"; }} />
                ) : (
                  <div className="bd-seller-card__banner-placeholder" />
                )}
              </div>
              {seller.id ? (
                <Link to={`/profile/${seller.id}`} className="bd-seller-card__profile">
                  <div className="bd-seller-card__avatar-wrapper">
                    <img
                      src={getStorageUrl(seller.avatar)}
                      alt={seller.name}
                      className="bd-seller-card__avatar"
                      onError={(e) => { e.currentTarget.src = DEFAULT_AVATAR; }}
                    />
                  </div>
                  <span className="bd-seller-card__name">{seller.name}</span>
                </Link>
              ) : (
                <div className="bd-seller-card__profile">
                  <div className="bd-seller-card__avatar-wrapper">
                    <img
                      src={getStorageUrl(seller.avatar)}
                      alt={seller.name}
                      className="bd-seller-card__avatar"
                      onError={(e) => { e.currentTarget.src = DEFAULT_AVATAR; }}
                    />
                  </div>
                  <span className="bd-seller-card__name">{seller.name}</span>
                </div>
              )}
              <div style={{ padding: "0 24px", display: "flex", flexDirection: "column", gap: "12px" }}>
              <button type="button" className="bd-seller-btn" onClick={handleWhatsApp}>
                <MessageCircle size={18} />
                <span>WhatsApp</span>
              </button>
              <button type="button" className="bd-seller-btn" onClick={handleWhatsApp}>
                <MessageCircle size={18} />
                <span>Chat Dengan Penjual</span>
              </button>
              <button
                type="button"
                className="bd-seller-phone"
                onClick={() => setShowPhone(!showPhone)}
              >
                <Phone size={16} />
                <span>{showPhone ? business.phone : `*** *** **** Tampilkan nomor`}</span>
              </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Product Popup */}
      {showProductPopup && selectedProduct && (
        <div
          className="bd-product-popup-overlay"
          onClick={closeProductPopup}
        >
          <div
            className="bd-product-popup"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              type="button"
              className="bd-product-popup__close"
              onClick={closeProductPopup}
            >
              <X size={24} strokeWidth={2} />
            </button>
            <div className="bd-product-popup__image">
              <img
                src={selectedProduct.image ? getStorageUrl(selectedProduct.image) : "https://via.placeholder.com/400"}
                alt={selectedProduct.name}
                onError={(e) => { e.currentTarget.src = "https://via.placeholder.com/400" }}
              />
            </div>
            <div className="bd-product-popup__content">
              <h3 className="bd-product-popup__name">{selectedProduct.name}</h3>
              <p className="bd-product-popup__price">
                {selectedProduct.price != null
                  ? new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", maximumFractionDigits: 0 }).format(Number(selectedProduct.price))
                  : "-"}
              </p>
              {selectedProduct.description && (
                <p className="bd-product-popup__description">{selectedProduct.description}</p>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

