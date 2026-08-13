import { useParams, Link, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import Navbar from "../components/Navbar";
import { InlineSpinner } from "../components/LoadingScreen";
import api from "../services/api";
import { getStorageUrl, DEFAULT_AVATAR } from "../utils/constants";
import { requireAuth } from "../utils/authCheck";
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
  AlertTriangle,
  Flag,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";

function MapResizeHandler() {
  const map = useMap();
  useEffect(() => {
    if (!map) return;

    const t1 = setTimeout(() => { map.invalidateSize(); }, 100);
    const t2 = setTimeout(() => { map.invalidateSize(); }, 400);

    const mapDiv = map.getContainer();
    const parent = mapDiv?.parentElement;
    if (!parent) return () => { clearTimeout(t1); clearTimeout(t2); };

    let rafId = null;
    const observer = new ResizeObserver(() => {
      if (rafId) cancelAnimationFrame(rafId);
      rafId = requestAnimationFrame(() => {
        if (map && map._container) {
          map.invalidateSize();
        }
      });
    });

    observer.observe(parent);

    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      if (rafId) cancelAnimationFrame(rafId);
      observer.disconnect();
    };
  }, [map]);
  return null;
}
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
  const [productPage, setProductPage] = useState(1);
  const productsPerPage = 3;
  const [hasActiveAd, setHasActiveAd] = useState(false);
  const [reviews, setReviews] = useState([]);
  const [loadingReviews, setLoadingReviews] = useState(false);
  const [userRating, setUserRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [reviewComment, setReviewComment] = useState("");
  const [submittingReview, setSubmittingReview] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [showProductPopup, setShowProductPopup] = useState(false);
  const [showAllReviewsModal, setShowAllReviewsModal] = useState(false);
  const [allReviewsPage, setAllReviewsPage] = useState(1);
  const reviewsPerPage = 5;

  // Report Modal States
  const [showReportModal, setShowReportModal] = useState(false);
  const [reportReason, setReportReason] = useState("Informasi Palsu / Penipuan");
  const [reportDescription, setReportDescription] = useState("");
  const [reporterName, setReporterName] = useState("");
  const [reporterEmail, setReporterEmail] = useState("");
  const [submittingReport, setSubmittingReport] = useState(false);

  // Gallery Modal & Image Preview States
  const [showGalleryModal, setShowGalleryModal] = useState(false);
  const [previewImageIndex, setPreviewImageIndex] = useState(null);

  const getStorageUrl = (path) => {
    if (!path) return "";
    if (path.startsWith("http")) return path;
    const baseUrl = import.meta.env.VITE_API_URL.replace(/\/api$/i, "");
    return `${baseUrl}/storage/${path}`;
  };

  const imagesList = (() => {
    if (!business) return [];
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

  const galleryImages = (() => {
    if (!business) return [];
    const allMedia = Array.isArray(business.media) ? business.media : [];
    const galleryMedia = allMedia.filter((m) => m.title !== "Banner" && m.type === "image");
    if (galleryMedia.length > 0) {
      return galleryMedia.map((m) => getStorageUrl(m.file_path));
    }
    return imagesList;
  })();

  // Product pagination derived state
  const totalProductPages = Math.ceil(products.length / productsPerPage) || 1;
  const currentProductPage = Math.min(Math.max(1, productPage), totalProductPages);
  const currentProducts = products.slice(
    (currentProductPage - 1) * productsPerPage,
    currentProductPage * productsPerPage
  );

  const formatRelativeDate = (dateString) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return dateString;
    const now = new Date();
    const diffTime = Math.abs(now - date);
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 0) return "Hari ini";
    if (diffDays === 1) return "Kemarin";
    if (diffDays < 7) return `${diffDays} hari lalu`;
    if (diffDays < 30) {
      const weeks = Math.floor(diffDays / 7);
      return `${weeks} minggu lalu`;
    }
    if (diffDays < 365) {
      const months = Math.floor(diffDays / 30);
      return `${months} bulan lalu`;
    }
    const years = Math.floor(diffDays / 365);
    return `${years} tahun lalu`;
  };

  const renderUserAvatar = (reviewUser) => {
    const avatarPath = reviewUser?.avatar || reviewUser?.photo;
    const avatarUrl = avatarPath ? getStorageUrl(avatarPath) : null;
    const name = reviewUser?.name || "Pengguna";
    const initials = name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);

    if (avatarUrl) {
      return (
        <img
          src={avatarUrl}
          alt={name}
          className="w-10 h-10 rounded-full object-cover border border-slate-200 shrink-0"
          onError={(e) => {
            e.currentTarget.style.display = "none";
            if (e.currentTarget.nextElementSibling) {
              e.currentTarget.nextElementSibling.style.display = "flex";
            }
          }}
        />
      );
    }

    const bgColors = [
      "bg-[#dcfce7] text-[#166534] border-[#bbf7d0]",
      "bg-[#e0f2fe] text-[#0369a1] border-[#bae6fd]",
      "bg-[#f3e8ff] text-[#6b21a8] border-[#e9d5ff]",
      "bg-[#fef3c7] text-[#92400e] border-[#fde68a]",
      "bg-[#ffe4e6] text-[#9f1239] border-[#fecdd3]",
      "bg-[#ccfbf1] text-[#115e59] border-[#99f6e4]",
    ];
    let charSum = 0;
    for (let i = 0; i < name.length; i++) charSum += name.charCodeAt(i);
    const colorClass = bgColors[charSum % bgColors.length];

    return (
      <div className={`w-10 h-10 rounded-full border flex items-center justify-center font-bold text-xs shrink-0 ${colorClass}`}>
        {initials || "U"}
      </div>
    );
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
          let localBizIds = [];
          try {
            localBizIds = JSON.parse(localStorage.getItem("saved_business_ids") || "[]");
          } catch (e) {}

          const isFavApi = user && data.favorites && data.favorites.some(f => f.user_id === user.id);
          const isFavLocal = localBizIds.includes(data.id) || localBizIds.includes(String(data.id));

          if (isFavApi || isFavLocal) {
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

  // Keyboard navigation for image preview & gallery modal
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "Escape") {
        if (previewImageIndex !== null) {
          setPreviewImageIndex(null);
        } else if (showGalleryModal) {
          setShowGalleryModal(false);
        }
      } else if (previewImageIndex !== null && galleryImages.length > 1) {
        if (e.key === "ArrowLeft") {
          setPreviewImageIndex((prev) => (prev > 0 ? prev - 1 : galleryImages.length - 1));
        } else if (e.key === "ArrowRight") {
          setPreviewImageIndex((prev) => (prev < galleryImages.length - 1 ? prev + 1 : 0));
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [previewImageIndex, showGalleryModal, galleryImages.length]);

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
    if (!requireAuth()) return;
    
    if (isSaving || !business) return;
    setIsSaving(true);
    
    const isCurrentlySaved = saved;
    // 1. Optimistic UI update (0ms instant response)
    setSaved(!isCurrentlySaved);

    // 2. Sync local cache
    let localBiz = JSON.parse(localStorage.getItem("saved_business_ids") || "[]");
    if (isCurrentlySaved) {
      localBiz = localBiz.filter(id => String(id) !== String(business.id));
    } else {
      if (!localBiz.includes(business.id)) localBiz.push(business.id);
    }
    localStorage.setItem("saved_business_ids", JSON.stringify(localBiz));
    localStorage.removeItem("cached_saved_items");

    try {
      if (isCurrentlySaved) {
        await api.delete(`/favorites/${business.id}`);
        alert("Bookmark bisnis berhasil dihapus.");
      } else {
        await api.post(`/favorites/${business.id}`);
        alert("Bisnis berhasil disimpan ke bookmark!");
      }
      window.dispatchEvent(new Event("bookmarkChanged"));
    } catch (err) {
      console.error("Failed to toggle favorite:", err);
      // Revert on error
      setSaved(isCurrentlySaved);
      alert("Terjadi kesalahan saat menyimpan bookmark.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleWhatsApp = () => {
    if (!requireAuth()) return;
    const phone = business.phone.replace(/\D/g, "");
    window.open(`https://wa.me/${phone}`, "_blank");
  };

  const handleDirections = () => {
    const query = encodeURIComponent(business.address);
    window.open(`https://www.google.com/maps/search/?api=1&query=${query}`, "_blank");
  };

  const handleReportSubmit = async (e) => {
    e.preventDefault();
    if (!requireAuth()) return;

    if (!reportReason) {
      alert("Silakan pilih alasan laporan.");
      return;
    }
    if (!reportDescription.trim()) {
      alert("Silakan isi keterangan detail laporan.");
      return;
    }

    setSubmittingReport(true);
    try {
      const userStr = localStorage.getItem("user");
      const user = userStr ? JSON.parse(userStr) : null;

      await api.post("/reports", {
        reportable_type: "business",
        reportable_id: business.id,
        reason: reportReason,
        description: reportDescription.trim(),
        reporter_name: user?.name || reporterName.trim() || "Pengunjung",
        reporter_email: user?.email || reporterEmail.trim() || null,
      });

      alert("Laporan Anda berhasil dikirim dan akan diproses oleh admin. Terima kasih!");
      setShowReportModal(false);
      setReportReason("Informasi Palsu / Penipuan");
      setReportDescription("");
    } catch (err) {
      console.error("Gagal mengirim laporan:", err);
      alert(err.response?.data?.message || "Gagal mengirim laporan. Silakan coba lagi nanti.");
    } finally {
      setSubmittingReport(false);
    }
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
    if (!requireAuth()) return;
    setUserRating(rating);
  };

  const handleStarHover = (rating) => {
    setHoverRating(rating);
  };

  const handleStarLeave = () => {
    setHoverRating(0);
  };

  const handleSubmitReview = async () => {
    if (!requireAuth()) return;

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


  // Extract main category and subcategory safely
  const rawCat = business.category;
  const isCatObj = rawCat && typeof rawCat === "object";
  const mainCategory = isCatObj ? (rawCat.parent || rawCat) : rawCat;
  const subCategory = isCatObj && rawCat.parent ? rawCat : null;
  const categoryName = typeof mainCategory === "object" ? (mainCategory?.name || "Umum") : (typeof rawCat === "string" ? rawCat : "Umum");
  const subCategoryName = subCategory?.name || null;
  const cityName = typeof business.city === "object" ? (business.city?.name || "Lokasi") : (business.city || "Lokasi");

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
              <button
                type="button"
                className="bd-quick-action text-rose-500 hover:border-rose-500 hover:text-rose-600 hover:bg-rose-50"
                title="Laporkan Usaha Ini"
                onClick={() => requireAuth(() => setShowReportModal(true))}
              >
                <AlertTriangle size={22} strokeWidth={1.8} />
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
                  galleryImages.slice(0, 4).map((src, i) => {
                    const isLastItem = i === 3 && galleryImages.length > 4;
                    const remainingCount = galleryImages.length - 4;

                    return (
                      <div
                        key={i}
                        className="bd-photo-item"
                        onClick={() => {
                          if (isLastItem) {
                            setShowGalleryModal(true);
                          } else {
                            setPreviewImageIndex(i);
                          }
                        }}
                      >
                        <img src={src} alt={`${business.name} ${i + 1}`} loading="lazy" />
                        {isLastItem && (
                          <div className="bd-photo-overlay">
                            <span className="bd-photo-overlay-text">+{remainingCount}</span>
                          </div>
                        )}
                      </div>
                    );
                  })
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
                <>
                  <div className="bd-products-grid">
                    {currentProducts.map((product) => (
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

                  {/* Pagination Controls (tampil otomatis jika produk > 3) */}
                  {products.length > productsPerPage && (
                    <div className="bd-products-pagination">
                      <button
                        type="button"
                        onClick={() => setProductPage((p) => Math.max(1, p - 1))}
                        disabled={currentProductPage === 1}
                        className="bd-pagination-btn"
                      >
                        Prev
                      </button>

                      <div className="bd-pagination-numbers">
                        {Array.from({ length: totalProductPages }, (_, i) => i + 1).map((page) => (
                          <button
                            key={page}
                            type="button"
                            onClick={() => setProductPage(page)}
                            className={`bd-pagination-number ${page === currentProductPage ? "active" : ""}`}
                          >
                            {page}
                          </button>
                        ))}
                      </div>

                      <button
                        type="button"
                        onClick={() => setProductPage((p) => Math.min(totalProductPages, p + 1))}
                        disabled={currentProductPage === totalProductPages}
                        className="bd-pagination-btn"
                      >
                        Next
                      </button>
                    </div>
                  )}
                </>
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
                {Array.isArray(business.tags) && business.tags.map((tag, idx) => (
                  <span key={idx} className="bd-tag">
                    {typeof tag === "object" ? (tag?.name || tag?.title || String(tag)) : String(tag)}
                  </span>
                ))}
              </div>
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
                      <MapResizeHandler />
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

        {/* Full-Width Reviews Section (Spans entire 1240px container width) */}
        <div className="max-w-[1240px] mx-auto mt-8 pt-2">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-7 items-stretch">
            {/* KOLOM KIRI: Form Ulasan & Penilaian */}
            <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs p-6 md:p-7 space-y-6 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between flex-wrap gap-3 pb-4 border-b border-slate-100">
                  <h3 className="text-xl font-bold text-slate-900">Ulasan &amp; Penilaian</h3>
                  <div className="flex items-center gap-2 bg-amber-50 border border-amber-200/60 px-4 py-1.5 rounded-full">
                    <Star size={18} fill="#fbbf24" stroke="#fbbf24" />
                    <span className="text-base font-black text-slate-900">{displayRating}</span>
                    <span className="text-xs font-semibold text-slate-500">({displayReviews} ulasan)</span>
                  </div>
                </div>

                {/* Review Form Box */}
                <div className="space-y-4 bg-slate-50/60 p-5 rounded-xl border border-slate-200/60 mt-5">
                  <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider">Tulis Ulasan Anda</h4>
                  
                  {/* Star Rating Selector */}
                  <div className="flex items-center gap-1">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        type="button"
                        className="p-1 hover:scale-110 transition-transform cursor-pointer focus:outline-none"
                        onClick={() => handleStarClick(star)}
                        onMouseEnter={() => handleStarHover(star)}
                        onMouseLeave={handleStarLeave}
                      >
                        <Star
                          size={28}
                          fill={(hoverRating || userRating) >= star ? "#fbbf24" : "none"}
                          color={(hoverRating || userRating) >= star ? "#fbbf24" : "#cbd5e1"}
                        />
                      </button>
                    ))}
                    {(hoverRating || userRating) > 0 && (
                      <span className="text-xs font-semibold text-amber-600 ml-2">
                        {hoverRating || userRating} dari 5 bintang
                      </span>
                    )}
                  </div>

                  {/* Textarea */}
                  <textarea
                    className="w-full p-4 bg-white border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#007570]/20 focus:border-[#007570] transition-all resize-y min-h-[120px]"
                    placeholder="Bagikan pengalaman Anda tentang bisnis ini..."
                    value={reviewComment}
                    onChange={(e) => setReviewComment(e.target.value)}
                    rows={4}
                  />

                  {/* Submit Button */}
                  <button
                    type="button"
                    className="inline-flex items-center justify-center gap-2 px-6 py-2.5 bg-[#007570] hover:bg-[#005f5b] active:bg-[#004e4a] text-white rounded-xl font-bold text-xs sm:text-sm transition-all shadow-2xs cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                    onClick={handleSubmitReview}
                    disabled={submittingReview || !userRating || !reviewComment.trim()}
                  >
                    {submittingReview ? (
                      <>
                        <Loader2 size={18} className="animate-spin" />
                        <span>Mengirim...</span>
                      </>
                    ) : (
                      <>
                        <Send size={16} />
                        <span>Kirim Ulasan</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>

            {/* KOLOM KANAN: Card Ulasan Terbaru (Max 5) */}
            <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs p-6 md:p-7 space-y-5 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between gap-2 pb-4 border-b border-slate-100">
                  <h3 className="text-xl font-bold text-slate-900">
                    Ulasan Terbaru <span className="text-xs font-semibold text-slate-500">({reviews.length})</span>
                  </h3>
                  {reviews.length > 0 && (
                    <button
                      onClick={() => {
                        setShowAllReviewsModal(true);
                        setAllReviewsPage(1);
                      }}
                      className="text-xs font-bold text-[#007570] hover:text-[#005f5b] flex items-center gap-1 cursor-pointer transition-colors"
                    >
                      <span>Lihat Semua Ulasan</span>
                      <ArrowRight size={14} />
                    </button>
                  )}
                </div>

                {/* Reviews List */}
                {loadingReviews ? (
                  <div className="flex flex-col items-center justify-center py-12 gap-2 text-slate-400">
                    <Loader2 size={32} className="animate-spin text-[#007570]" />
                    <p className="text-xs font-semibold text-slate-500">Memuat ulasan...</p>
                  </div>
                ) : reviews.length > 0 ? (
                  <div className="divide-y divide-slate-100 mt-2">
                    {reviews.slice(0, 5).map((review) => (
                      <div key={review.id} className="py-3.5 first:pt-2 last:pb-0 space-y-1.5">
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex items-center gap-3">
                            {renderUserAvatar(review.user)}
                            <div>
                              <h5 className="text-xs font-bold text-slate-900">{review.user?.name || review.name || "Pengguna"}</h5>
                              <div className="flex items-center gap-1 mt-0.5">
                                {[1, 2, 3, 4, 5].map((star) => (
                                  <Star
                                    key={star}
                                    size={13}
                                    fill={star <= (review.rating || 5) ? "#fbbf24" : "none"}
                                    color={star <= (review.rating || 5) ? "#fbbf24" : "#d1d5db"}
                                  />
                                ))}
                              </div>
                            </div>
                          </div>
                          <span className="text-[11px] font-semibold text-slate-400 whitespace-nowrap">
                            {formatRelativeDate(review.created_at)}
                          </span>
                        </div>
                        <p className="text-xs text-slate-600 leading-relaxed pl-13">
                          "{review.review || review.comment || ""}"
                        </p>
                      </div>
                    ))}
                  </div>
                ) : (
                  /* Empty State */
                  <div className="flex flex-col items-center justify-center py-12 px-4 text-center space-y-2">
                    <MessageCircle size={40} className="text-slate-300" />
                    <p className="text-xs font-semibold text-slate-500">
                      Belum ada ulasan untuk bisnis ini. Jadilah yang pertama memberikan ulasan!
                    </p>
                  </div>
                )}
              </div>

              {/* Bottom Button "Lihat Semua Ulasan" */}
              {reviews.length > 0 && (
                <div className="pt-4 border-t border-slate-100">
                  <button
                    onClick={() => {
                      setShowAllReviewsModal(true);
                      setAllReviewsPage(1);
                    }}
                    className="w-full py-2.5 rounded-full border border-[#007570] text-[#007570] hover:bg-[#007570]/5 font-bold text-xs transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <span>Lihat Semua Ulasan ({reviews.length})</span>
                    <ArrowRight size={14} />
                  </button>
                </div>
              )}
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

      {/* Modal Semua Ulasan */}
      {showAllReviewsModal && (
        <div
          className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-[1000] flex items-center justify-center p-4 overflow-y-auto"
          onClick={() => setShowAllReviewsModal(false)}
        >
          <div
            className="bg-white rounded-2xl p-6 sm:p-7 w-full max-w-2xl shadow-2xl border border-slate-200 space-y-5 my-8 animate-fade-in"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div>
                <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                  <Star className="text-amber-400 fill-amber-400" size={20} />
                  Semua Ulasan &amp; Penilaian ({reviews.length})
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Daftar lengkap seluruh ulasan dari pelanggan untuk {business?.name || "bisnis ini"}
                </p>
              </div>
              <button
                onClick={() => setShowAllReviewsModal(false)}
                className="w-8 h-8 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 flex items-center justify-center transition-colors cursor-pointer"
              >
                <X size={20} />
              </button>
            </div>

            {/* Reviews List Sliced by Page */}
            <div className="space-y-4 max-h-[420px] overflow-y-auto pr-1 divide-y divide-slate-100">
              {(() => {
                const totalPages = Math.ceil(reviews.length / reviewsPerPage) || 1;
                const safePage = Math.min(Math.max(1, allReviewsPage), totalPages);
                const startIndex = (safePage - 1) * reviewsPerPage;
                const currentReviews = reviews.slice(startIndex, startIndex + reviewsPerPage);

                return currentReviews.map((review) => (
                  <div key={review.id} className="pt-4 first:pt-0 space-y-2">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-center gap-3">
                        {renderUserAvatar(review.user)}
                        <div>
                          <h5 className="text-xs font-bold text-slate-900">{review.user?.name || review.name || "Pengguna"}</h5>
                          <div className="flex items-center gap-1 mt-0.5">
                            {[1, 2, 3, 4, 5].map((star) => (
                              <Star
                                key={star}
                                size={13}
                                fill={star <= (review.rating || 5) ? "#fbbf24" : "none"}
                                color={star <= (review.rating || 5) ? "#fbbf24" : "#d1d5db"}
                              />
                            ))}
                          </div>
                        </div>
                      </div>
                      <span className="text-[11px] font-semibold text-slate-400 whitespace-nowrap">
                        {formatRelativeDate(review.created_at)}
                      </span>
                    </div>
                    <p className="text-xs text-slate-600 leading-relaxed pl-13">
                      "{review.review || review.comment || ""}"
                    </p>
                  </div>
                ));
              })()}
            </div>

            {/* Pagination Controls */}
            {reviews.length > reviewsPerPage && (
              <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-3 border-t border-slate-100">
                <p className="text-xs font-semibold text-slate-500">
                  Menampilkan <span className="font-bold text-slate-900">{((allReviewsPage - 1) * reviewsPerPage) + 1}</span>-
                  <span className="font-bold text-slate-900">{Math.min(allReviewsPage * reviewsPerPage, reviews.length)}</span> dari{" "}
                  <span className="font-bold text-[#007570]">{reviews.length}</span> ulasan
                </p>

                <div className="flex items-center gap-1">
                  <button
                    onClick={() => setAllReviewsPage((p) => Math.max(1, p - 1))}
                    disabled={allReviewsPage === 1}
                    className="px-3 py-1.5 rounded-lg border border-slate-200 bg-white text-[#007570] hover:bg-slate-50 disabled:opacity-40 text-xs font-bold transition-all cursor-pointer disabled:cursor-not-allowed"
                  >
                    Prev
                  </button>

                  {(() => {
                    const totalPages = Math.ceil(reviews.length / reviewsPerPage) || 1;
                    const pages = [];
                    for (let i = 1; i <= totalPages; i++) {
                      pages.push(i);
                    }

                    return pages.map((page) => (
                      <button
                        key={page}
                        onClick={() => setAllReviewsPage(page)}
                        className={`w-8 h-8 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                          page === allReviewsPage
                            ? "bg-[#007570] text-white"
                            : "bg-white border border-slate-200 text-slate-600 hover:bg-slate-50"
                        }`}
                      >
                        {page}
                      </button>
                    ));
                  })()}

                  <button
                    onClick={() => setAllReviewsPage((p) => Math.min(Math.ceil(reviews.length / reviewsPerPage), p + 1))}
                    disabled={allReviewsPage === Math.ceil(reviews.length / reviewsPerPage)}
                    className="px-3 py-1.5 rounded-lg border border-slate-200 bg-white text-[#007570] hover:bg-slate-50 disabled:opacity-40 text-xs font-bold transition-all cursor-pointer disabled:cursor-not-allowed"
                  >
                    Next
                  </button>
                </div>
              </div>
            )}

            {/* Modal Footer */}
            <div className="flex justify-end pt-2">
              <button
                onClick={() => setShowAllReviewsModal(false)}
                className="px-5 py-2 rounded-xl bg-slate-100 text-slate-700 hover:bg-slate-200 font-semibold text-xs transition-colors cursor-pointer"
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Report Usaha */}
      {showReportModal && (
        <div
          className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-[1000] flex items-center justify-center p-4 overflow-y-auto"
          onClick={() => setShowReportModal(false)}
        >
          <div
            className="bg-white rounded-2xl p-6 sm:p-7 w-full max-w-lg shadow-2xl border border-slate-200 space-y-5 my-8 animate-fade-in text-left"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center shrink-0">
                  <AlertTriangle size={20} />
                </div>
                <div>
                  <h3 className="text-base sm:text-lg font-bold text-slate-900">Laporkan Usaha Ini</h3>
                  <p className="text-xs text-slate-500">Laporkan penyalahgunaan atau informasi tidak valid</p>
                </div>
              </div>
              <button
                onClick={() => setShowReportModal(false)}
                className="w-8 h-8 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 flex items-center justify-center transition-colors cursor-pointer"
              >
                <X size={20} />
              </button>
            </div>

            {/* Business Info Banner */}
            <div className="flex items-center gap-3 p-3 bg-slate-50 border border-slate-200/80 rounded-xl">
              <div className="w-11 h-11 rounded-lg overflow-hidden bg-slate-200 shrink-0 flex items-center justify-center">
                {business?.logo ? (
                  <img src={getStorageUrl(business.logo)} alt={business.name} className="w-full h-full object-cover" />
                ) : (
                  <Building2 size={20} className="text-slate-400" />
                )}
              </div>
              <div className="min-w-0">
                <h4 className="text-xs sm:text-sm font-bold text-slate-900 truncate">{business?.name}</h4>
                <p className="text-[11px] text-slate-500 truncate">{categoryName} • {cityName}</p>
              </div>
            </div>

            {/* Report Form */}
            <form onSubmit={handleReportSubmit} className="space-y-4">
              {/* Alasan Laporan */}
              <div>
                <label className="block text-xs font-bold text-slate-800 mb-1.5">
                  Pilih Alasan Laporan <span className="text-rose-500">*</span>
                </label>
                <div className="space-y-2 max-h-[180px] overflow-y-auto pr-1">
                  {[
                    "Informasi Palsu / Penipuan",
                    "Konten Tidak Layak / Mengandung SARA",
                    "Hak Cipta / Logo Tanpa Izin",
                    "Spam / Promosi Menyesatkan",
                    "Bisnis Sudah Tutup / Tidak Beroperasi",
                    "Lainnya",
                  ].map((reason) => (
                    <label
                      key={reason}
                      className={`flex items-center gap-2.5 p-3 rounded-xl border text-xs font-semibold cursor-pointer transition-all ${
                        reportReason === reason
                          ? "bg-rose-50/70 border-rose-300 text-rose-900 shadow-2xs"
                          : "bg-white border-slate-200 text-slate-700 hover:bg-slate-50"
                      }`}
                    >
                      <input
                        type="radio"
                        name="reportReason"
                        value={reason}
                        checked={reportReason === reason}
                        onChange={(e) => setReportReason(e.target.value)}
                        className="w-4 h-4 text-rose-600 focus:ring-rose-500 border-slate-300 cursor-pointer"
                      />
                      <span>{reason}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Detail Laporan */}
              <div>
                <label className="block text-xs font-bold text-slate-800 mb-1.5">
                  Keterangan Detail <span className="text-rose-500">*</span>
                </label>
                <textarea
                  required
                  rows={3}
                  value={reportDescription}
                  onChange={(e) => setReportDescription(e.target.value)}
                  placeholder="Jelaskan secara singkat kronologi atau alasan laporan Anda secara jelas..."
                  className="w-full p-3 bg-white border border-slate-200 rounded-xl text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500 transition-all resize-y"
                />
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowReportModal(false)}
                  className="px-4 py-2.5 rounded-xl bg-slate-100 text-slate-700 hover:bg-slate-200 font-bold text-xs transition-colors cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={submittingReport || !reportReason || !reportDescription.trim()}
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs transition-colors shadow-2xs cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {submittingReport ? (
                    <>
                      <Loader2 size={16} className="animate-spin" />
                      <span>Mengirim...</span>
                    </>
                  ) : (
                    <>
                      <AlertTriangle size={15} />
                      <span>Kirim Laporan</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Popup Galeri Foto */}
      {showGalleryModal && (
        <div
          className="fixed inset-0 bg-slate-900/70 backdrop-blur-xs z-[1000] flex items-center justify-center p-4 overflow-y-auto"
          onClick={() => setShowGalleryModal(false)}
        >
          <div
            className="bg-white rounded-2xl p-5 sm:p-7 w-full max-w-4xl shadow-2xl border border-slate-200 space-y-5 my-8 animate-fade-in text-left"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div>
                <h3 className="text-lg sm:text-xl font-bold text-slate-900">
                  Galeri Foto ({galleryImages.length})
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Semua foto galeri dari {business?.name || "bisnis ini"}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setShowGalleryModal(false)}
                className="w-9 h-9 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 flex items-center justify-center transition-colors cursor-pointer"
              >
                <X size={22} />
              </button>
            </div>

            {/* Grid Foto Galeri */}
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3.5 max-h-[65vh] overflow-y-auto pr-1 p-1">
              {galleryImages.map((src, idx) => (
                <div
                  key={idx}
                  onClick={() => setPreviewImageIndex(idx)}
                  className="group relative aspect-4/3 rounded-xl overflow-hidden bg-slate-100 border border-slate-200/80 cursor-pointer shadow-2xs hover:shadow-md transition-all duration-200 transform hover:-translate-y-0.5"
                >
                  <img
                    src={src}
                    alt={`${business?.name || "Foto"} ${idx + 1}`}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    loading="lazy"
                  />
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/25 transition-colors duration-200 flex items-center justify-center">
                    <span className="opacity-0 group-hover:opacity-100 transition-opacity duration-200 bg-white/90 text-slate-800 text-xs font-bold px-3 py-1.5 rounded-full shadow-xs backdrop-blur-xs">
                      Lihat Foto
                    </span>
                  </div>
                </div>
              ))}
            </div>

            {/* Modal Footer */}
            <div className="flex justify-end pt-2 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setShowGalleryModal(false)}
                className="px-5 py-2.5 rounded-xl bg-slate-100 text-slate-700 hover:bg-slate-200 font-semibold text-xs sm:text-sm transition-colors cursor-pointer"
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Large Image Preview Modal */}
      {previewImageIndex !== null && galleryImages[previewImageIndex] && (
        <div
          className="fixed inset-0 bg-black/90 backdrop-blur-md z-[1100] flex flex-col items-center justify-center p-4"
          onClick={() => setPreviewImageIndex(null)}
        >
          {/* Header Bar */}
          <div
            className="absolute top-4 right-4 left-4 flex items-center justify-between z-10"
            onClick={(e) => e.stopPropagation()}
          >
            <span className="text-white/80 text-xs sm:text-sm font-medium bg-black/40 px-3.5 py-1.5 rounded-full border border-white/10 backdrop-blur-xs">
              {previewImageIndex + 1} / {galleryImages.length}
            </span>
            <button
              type="button"
              onClick={() => setPreviewImageIndex(null)}
              className="w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors cursor-pointer backdrop-blur-xs border border-white/10"
              title="Tutup Preview"
            >
              <X size={22} />
            </button>
          </div>

          {/* Prev Button */}
          {galleryImages.length > 1 && (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                setPreviewImageIndex((prev) => (prev > 0 ? prev - 1 : galleryImages.length - 1));
              }}
              className="absolute left-4 top-1/2 -translate-y-1/2 w-11 h-11 rounded-full bg-white/10 hover:bg-white/25 text-white flex items-center justify-center transition-all cursor-pointer backdrop-blur-xs border border-white/10 z-10 hover:scale-110"
              title="Foto Sebelumnya"
            >
              <ChevronLeft size={26} />
            </button>
          )}

          {/* Main Large Image */}
          <div
            className="relative max-w-[90vw] max-h-[85vh] flex items-center justify-center"
            onClick={(e) => e.stopPropagation()}
          >
            <img
              src={galleryImages[previewImageIndex]}
              alt={`${business?.name || "Preview"} ${previewImageIndex + 1}`}
              className="max-w-[90vw] max-h-[85vh] object-contain rounded-lg shadow-2xl select-none"
            />
          </div>

          {/* Next Button */}
          {galleryImages.length > 1 && (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                setPreviewImageIndex((prev) => (prev < galleryImages.length - 1 ? prev + 1 : 0));
              }}
              className="absolute right-4 top-1/2 -translate-y-1/2 w-11 h-11 rounded-full bg-white/10 hover:bg-white/25 text-white flex items-center justify-center transition-all cursor-pointer backdrop-blur-xs border border-white/10 z-10 hover:scale-110"
              title="Foto Selanjutnya"
            >
              <ChevronRight size={26} />
            </button>
          )}
        </div>
      )}
    </div>
  );
}

