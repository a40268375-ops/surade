import { useParams, Link, useNavigate } from "react-router-dom";
import { useEffect, useState, useRef } from "react";
import api, { getImageUrl } from "../utils/api";
import { computeOpenStatus, buildWeeklySchedule, getPriceTier } from "../utils/businessHours";
import Navbar from "../components/Navbar";
import Loading from "../components/Loading";
import { usePageLoading } from "../hooks/usePageLoading";
import { useAuth } from "../context/AuthContext";
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
  Package,
  Tag,
  ArrowRight,
  X,
  ChevronDown,
  ChevronRight,
  ChevronLeft,
  ThumbsUp,
  AlertTriangle,
  CheckCircle,
  ExternalLink,
  Calendar,
  Camera,
  Play,
  Globe,
  Lock,
} from "lucide-react";
import "./Home.css";
import "./Login.css";
import "./BusinessDetail.css";

/* ── Helper untuk membuat tanggal relatif di masa lalu (n hari yang lalu) ── */
function daysAgo(n) {
  const d = new Date();
  d.setDate(d.getDate() - n);
  return d.toISOString();
}

/* ── Helper untuk membuat daftar ulasan contoh UNIK per bisnis ── */
function generateFallbackReviews(businessId) {
  const allNames = [
    ["Andi Pratama", "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=60&h=60&fit=crop", 5, "Pelayanan sangat memuaskan! Tempatnya bersih dan nyaman. Pasti akan kembali lagi.", 0],
    ["Siti Rahayu", "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=60&h=60&fit=crop", 4, "Produknya berkualitas, harganya terjangkau. Recommended!", 2],
    ["Bambang Susilo", "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=60&h=60&fit=crop", 5, "Sudah langganan sejak lama, tidak pernah mengecewakan. Pelayanan ramah dan cepat.", 5],
    ["Dewi Lestari", "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=60&h=60&fit=crop", 4, "Lumayan bagus, tapi masih ada ruang untuk perbaikan di bagian pelayanan.", 8],
    ["Rudi Hartono", "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=60&h=60&fit=crop", 3, "Cukup baik, semoga ke depannya bisa lebih ditingkatkan lagi.", 12],
    ["Fitri Handayani", "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=60&h=60&fit=crop", 5, "Sangat puas! Pelayanan cepat dan hasilnya memuaskan. Top markotop!", 15],
    ["Agus Wijaya", "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=60&h=60&fit=crop", 4, "Tempatnya strategis, mudah dijangkau. Harganya bersahabat di kantong.", 20],
    ["Ratna Sari", "https://images.unsplash.com/photo-1546961329-78bef0414d7c?w=60&h=60&fit=crop", 5, "Rekomendasi banget buat yang cari pelayanan terbaik. Mantul!", 25],
  ];
  const seed = businessId || 1;
  const shuffled = [...allNames].sort((a, b) => ((a[4] * 7 + seed * 13) % 20) - ((b[4] * 7 + seed * 13) % 20));
  return shuffled.map((item, idx) => ({
    id: 1000 + businessId * 100 + idx,
    user_name: item[0],
    user_avatar: item[1],
    rating: item[2],
    comment: item[3],
    created_at: daysAgo(item[4]),
  }));
}

const DEFAULT_SELLER = {
  id: 1,
  name: "Budi Utomo",
  avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=120&h=120&fit=crop",
  bio: "Pengusaha lokal yang berpengalaman lebih dari 10 tahun dalam bidang kuliner dan perdagangan.",
  phone: "+62 812 3456 7890",
  rating: 4.8
};

function formatRelativeTime(dateString) {
  const diffMs = Date.now() - new Date(dateString).getTime();
  const minutes = Math.floor(diffMs / 60000);
  if (minutes < 1) return "Baru saja";
  if (minutes < 60) return `${minutes} menit yang lalu`;
  const hours = Math.floor(minutes / 24);
  if (hours < 24) return `${hours} jam yang lalu`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days} hari yang lalu`;
  const weeks = Math.floor(days / 7);
  if (weeks < 5) return `Sekitar ${weeks === 1 ? "satu" : weeks} minggu yang lalu`;
  const months = Math.floor(days / 30);
  if (months < 12) return `${months} bulan yang lalu`;
  const years = Math.floor(days / 365);
  return `${years} tahun yang lalu`;
}

function maskPhone() {
  return "** *** **** ";
}

const BISNIS_DATA = [
  {
    id: 1, name: "Amel Irwanto cake", category: "Pertokoan",
    tags: ["Amel irwanto cake"], location: "Kabupaten Bogor",
    description: "Amel Irwanto Cake adalah toko kue yang menyediakan berbagai macam kue lezat dengan kualitas terbaik. Kami melayani pesanan untuk berbagai acara seperti ulang tahun, pernikahan, dan acara lainnya.",
    phone: "+62 812 3456 7890",
    email: "amelcake@gmail.com",
    address: "Jalan Raya Leuwiliang No. 123, Kabupaten Bogor, Jawa Barat",
    rating: 4.5, reviews: 128, hours: "08:00 - 20:00",
    closedDays: ["Minggu"],
    images: [
      "https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=1200&h=600&fit=crop",
      "https://images.unsplash.com/photo-1509440159596-0249088772ff?w=1200&h=600&fit=crop",
      "https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=1200&h=600&fit=crop",
      "https://images.unsplash.com/photo-1565958011703-44f9829ba187?w=1200&h=600&fit=crop",
    ],
    video: "https://assets.mixkit.co/videos/preview/mixkit-baking-cake-in-an-oven-13101-large.mp4",
    seller: DEFAULT_SELLER,
  },
  {
    id: 2, name: "Warung Makan Sederhana", category: "Cafe & Restaurant",
    tags: ["Warung makan", "Nasi padang"], location: "Kota Bogor",
    description: "Warung Makan Sederhana menyajikan masakan nusantara dengan cita rasa otentik. Spesialis dalam masakan Padang dan masakan tradisional Indonesia lainnya.",
    phone: "+62 812 3456 7891",
    email: "warungsederhana@gmail.com",
    address: "Jalan Kapten Muslihat No. 45, Kota Bogor, Jawa Barat",
    rating: 4.7, reviews: 256, hours: "10:00 - 22:00",
    closedDays: [],
    images: [
      "https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=1200&h=600&fit=crop",
      "https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=1200&h=600&fit=crop",
      "https://images.unsplash.com/photo-1567620905732-2d1ec7ab7445?w=1200&h=600&fit=crop",
      "https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=1200&h=600&fit=crop",
    ],
    video: "https://assets.mixkit.co/videos/preview/mixkit-cooking-in-a-professional-kitchen-4767-large.mp4",
    seller: DEFAULT_SELLER,
  },
];

export default function BusinessDetail() {
  const pageLoading = usePageLoading();
  const { id } = useParams();
  const navigate = useNavigate();
  const { user: authUser } = useAuth();
  const [business, setBusiness] = useState(null);
  const [fetchingBusiness, setFetchingBusiness] = useState(true);
  const [saved, setSaved] = useState(false);
  const [savedRecordId, setSavedRecordId] = useState(null);
  const [savingBusiness, setSavingBusiness] = useState(false);
  const [showReportModal, setShowReportModal] = useState(false);
  const [reportReason, setReportReason] = useState("");
  const [reportDescription, setReportDescription] = useState("");
  const [reportSubmitting, setReportSubmitting] = useState(false);
  const [reportError, setReportError] = useState("");
  const [reportSuccess, setReportSuccess] = useState(false);
  const [showPhone, setShowPhone] = useState(false);
  const [showBookingModal, setShowBookingModal] = useState(false);
  const [bookingName, setBookingName] = useState("");
  const [bookingPhone, setBookingPhone] = useState("");
  const [bookingDate, setBookingDate] = useState("");
  const [bookingTime, setBookingTime] = useState("");
  const [bookingNotes, setBookingNotes] = useState("");
  const [bookingSubmitting, setBookingSubmitting] = useState(false);
  const [bookingSuccess, setBookingSuccess] = useState(false);
  const [bookingError, setBookingError] = useState("");
  const [currentCoverIndex, setCurrentCoverIndex] = useState(0);
  const [showPriceDropdown, setShowPriceDropdown] = useState(false);
  const [showWeeklyHours, setShowWeeklyHours] = useState(false);
  const priceDropdownRef = useRef(null);
  const [menuItems, setMenuItems] = useState([]);
  const [menuLoading, setMenuLoading] = useState(true);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [galleryTab, setGalleryTab] = useState("all");
  const [productPage, setProductPage] = useState(1);
  const [showGalleryLightbox, setShowGalleryLightbox] = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState(0);
  const [showDescFull, setShowDescFull] = useState(false);
  const [activeSection, setActiveSection] = useState("overview");

  /* ── State ulasan ── */
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [reviewRating, setReviewRating] = useState(5);
  const [hoverRating, setHoverRating] = useState(0);
  const [reviewComment, setReviewComment] = useState("");
  const [submittingReview, setSubmittingReview] = useState(false);
  const [reviewError, setReviewError] = useState("");

  const [helpfulVoted, setHelpfulVoted] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem("helpful_votes_business") || "{}");
    } catch {
      return {};
    }
  });

  const [showAllReviews, setShowAllReviews] = useState(false);

  const handleToggleHelpful = async (reviewId) => {
    if (!authUser) {
      alert("Silakan login dulu untuk menandai ulasan ini berguna.");
      return;
    }
    try {
      const result = await api.post(`/reviews/business/${reviewId}/helpful`);
      setBusiness((prev) => ({
        ...prev,
        reviewList: prev.reviewList.map((r) =>
          r.id === reviewId ? { ...r, helpful_count: result.helpful_count } : r
        ),
      }));
      setHelpfulVoted((prev) => {
        const next = { ...prev, [reviewId]: result.helpful_by_me };
        localStorage.setItem("helpful_votes_business", JSON.stringify(next));
        return next;
      });
    } catch (err) {
      console.warn("Gagal toggle helpful:", err);
    }
  };

  useEffect(() => {
    window.scrollTo(0, 0);
    let cancelled = false;
    setFetchingBusiness(true);

    async function loadBusiness() {
      try {
        const data = await api.get(`/businesses/${id}`);
        if (cancelled) return;

        const img = data.image
          ? getImageUrl(data.image)
          : "https://images.unsplash.com/photo-1560066984-138dadb4c035?w=1200&h=600&fit=crop";
        const galleryImgs = Array.isArray(data.images) ? data.images.map((p) => getImageUrl(p)) : [];

        setBusiness({
          id: data.id,
          name: data.title,
          category: data.category?.name || "Lainnya",
          tags: (data.tags && data.tags.length > 0) ? data.tags : [data.title],
          location: data.address,
          address: data.address,
          phone: data.phone,
          email: data.email,
          website: data.website,
          hours: data.operating_hours || "08:00 - 17:00",
          operating_hours: data.operating_hours || "",
          closedDays: data.closed_days || [],
          description: data.description,
          img,
          images: [img, ...galleryImgs],
          video: data.video_url || null,
          premium_features: data.premium_features || {
            basic_listing: true,
            contact_info: true,
            basic_description: true,
            location_map: true,
            unlimited_photos: false,
            video_showcase: false,
            detailed_description: false,
            contact_form: false,
            photo_gallery: false,
            social_media_links: false,
            website_link: false,
            operating_hours: false,
            announcements: false,
            price_list: false,
            faq_section: false,
            tags_keywords: false,
            promotional_banners: false,
            priority_listing: false,
            advanced_analytics: false,
            customer_reviews_management: false,
            booking_system: false,
            promotional_offers: false,
            max_photos: 3,
            max_menu_items: 10,
            max_announcements: 2,
          },
          status: data.is_open_now ? "Buka Sekarang" : "Tutup Sekarang",
          is_open_now: data.is_open_now,
          price_category: data.price_category || 2,
          is_premium_active: data.is_premium_active,
          rating: data.rating || 0,
          reviews: data.reviews_count || 0,
          reviewList: (data.reviews || []).map((r) => ({
            id: r.id,
            user_name: r.reviewer?.name || "Pengguna",
            user_avatar: r.reviewer?.avatar ? getImageUrl(r.reviewer.avatar) : null,
            rating: r.rating,
            comment: r.comment,
            created_at: r.created_at,
            helpful_count: r.helpful_count || 0,
          })),
          seller: data.user
            ? {
                id: data.user.id,
                name: data.user.name || DEFAULT_SELLER.name,
                avatar: data.user.avatar ? getImageUrl(data.user.avatar) : DEFAULT_SELLER.avatar,
                bio: data.user.bio || "",
                phone: data.user.phone || data.phone || "",
              }
            : DEFAULT_SELLER,
        });

        api.post('/track-view', { business_id: data.id, path: `/business/${data.id}` }).catch(() => {});
      } catch (e) {
        console.error("Gagal memuat detail bisnis dari API — pakai data fallback", e);
        if (!cancelled) {
          const fallback = BISNIS_DATA.find((b) => b.id === Number(id)) || BISNIS_DATA[0];
          const fallbackReviews = generateFallbackReviews(fallback.id);
          setBusiness({
            id: fallback.id,
            name: fallback.name,
            category: fallback.category,
            tags: fallback.tags,
            location: fallback.location,
            address: fallback.address || fallback.location,
            phone: fallback.phone,
            email: fallback.email,
            hours: fallback.hours,
            closedDays: fallback.closedDays || [],
            description: fallback.description,
            img: fallback.images?.[0] || fallback.img,
            images: fallback.images || [fallback.img],
            video: fallback.video || null,
            status: "Buka Sekarang",
            is_open_now: true,
            is_premium_active: false,
            rating: fallback.rating,
            reviews: fallback.reviews,
            reviewList: fallbackReviews,
            seller: fallback.seller || DEFAULT_SELLER,
          });
        }
      } finally {
        if (!cancelled) setFetchingBusiness(false);
      }
    }

    loadBusiness();
    setShowPhone(false);

    return () => { cancelled = true; };
  }, [id]);

  useEffect(() => {
    let cancelled = false;
    setMenuLoading(true);
    async function loadMenu() {
      try {
        const data = await api.get(`/menu-items?business_id=${id}`);
        if (!cancelled) setMenuItems(Array.isArray(data) ? data.filter((m) => m.is_available !== false) : []);
      } catch (e) {
        console.error("Gagal memuat produk bisnis", e);
        if (!cancelled) setMenuItems([]);
      } finally {
        if (!cancelled) setMenuLoading(false);
      }
    }
    loadMenu();
    return () => { cancelled = true; };
  }, [id]);

  useEffect(() => {
    setProductPage(1);
  }, [menuItems]);

  useEffect(() => {
    if (!business) return;
    const imagesList = business.images?.length > 0 ? business.images : [business.img];
    if (imagesList.length <= 1) return;
    const interval = setInterval(() => {
      setCurrentCoverIndex((prev) => (prev + 1) % imagesList.length);
    }, 4500);
    return () => clearInterval(interval);
  }, [business]);

  useEffect(() => {
    if (!authUser || !business?.id) {
      setSaved(false);
      setSavedRecordId(null);
      return;
    }
    let cancelled = false;
    api.get("/my-saved-businesses")
      .then((list) => {
        if (cancelled) return;
        const match = (list || []).find((s) => String(s.business_id) === String(business.id));
        setSaved(!!match);
        setSavedRecordId(match ? match.id : null);
      })
      .catch(() => {});
    return () => { cancelled = true; };
  }, [authUser, business?.id]);

  useEffect(() => {
    if (!showPriceDropdown) return;
    function handleClickOutside(e) {
      if (priceDropdownRef.current && !priceDropdownRef.current.contains(e.target)) {
        setShowPriceDropdown(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [showPriceDropdown]);

  const handleShare = async () => {
    const url = window.location.href;
    if (navigator.share) {
      await navigator.share({ title: business.name, url });
    } else {
      await navigator.clipboard.writeText(url);
      alert("Link berhasil disalin!");
    }
  };

  const handleWhatsApp = () => {
    if (!business.phone) return;
    const phone = business.phone.replace(/\D/g, "");
    window.open(`https://wa.me/${phone}`, "_blank");
  };

  const handleDirections = () => {
    const query = encodeURIComponent(business.address);
    window.open(`https://www.google.com/maps/search/?api=1&query=${query}`, "_blank");
  };

  const handlePremiumUpgrade = () => {
    if (!authUser) {
      alert("Silakan login terlebih dahulu untuk upgrade ke Premium");
      return;
    }
    if (authUser.role === 'admin') {
      alert("Admin tidak perlu upgrade Premium");
      return;
    }
    if (authUser.id !== business.seller?.id) {
      alert("Anda hanya dapat upgrade bisnis milik sendiri");
      return;
    }
    navigate("/dashboard?tab=premium");
  };

  const handleToggleSave = async () => {
    if (!authUser) {
      window.location.href = "/login";
      return;
    }
    if (savingBusiness) return;
    setSavingBusiness(true);
    try {
      if (saved && savedRecordId) {
        await api.delete(`/saved-businesses/${savedRecordId}`);
        setSaved(false);
        setSavedRecordId(null);
      } else {
        const result = await api.post("/saved-businesses", { business_id: business.id });
        setSaved(true);
        setSavedRecordId(result.id);
        setTimeout(() => navigate("/dashboard?tab=saved"), 500);
      }
    } catch (err) {
      alert(err?.data?.message || "Gagal memperbarui daftar favorit. Silakan coba lagi.");
    } finally {
      setSavingBusiness(false);
    }
  };

  const handleReportSubmit = async (e) => {
    e.preventDefault();
    if (!authUser) {
      window.location.href = "/login";
      return;
    }
    if (!reportReason) {
      setReportError("Silakan pilih alasan laporan.");
      return;
    }
    setReportError("");
    setReportSubmitting(true);
    try {
      await api.post(`/businesses/${business.id}/report`, {
        reason: reportReason,
        description: reportDescription.trim() || null,
      });
      setReportSuccess(true);
      setReportReason("");
      setReportDescription("");
    } catch (err) {
      setReportError(err?.data?.message || "Gagal mengirim laporan. Silakan coba lagi.");
    } finally {
      setReportSubmitting(false);
    }
  };

  const closeReportModal = () => {
    setShowReportModal(false);
    setReportSuccess(false);
    setReportError("");
    setReportReason("");
    setReportDescription("");
  };

  const handleSubmitReview = async (e) => {
    e.preventDefault();
    if (!authUser) {
      window.location.href = "/login";
      return;
    }
    setReviewError("");
    setSubmittingReview(true);
    try {
      const newReview = await api.post(`/businesses/${business.id}/reviews`, {
        rating: reviewRating,
        comment: reviewComment,
      });

      setBusiness((prev) => {
        const mapped = {
          id: newReview.id || Date.now(),
          user_name: newReview.reviewer?.name || authUser.name || "Anda",
          user_avatar: newReview.reviewer?.avatar ? getImageUrl(newReview.reviewer.avatar) : null,
          rating: newReview.rating,
          comment: newReview.comment,
          created_at: newReview.created_at,
          helpful_count: newReview.helpful_count || 0,
        };
        const nextList = [mapped, ...prev.reviewList];
        const avg = nextList.reduce((sum, r) => sum + r.rating, 0) / nextList.length;
        return { ...prev, reviewList: nextList, reviews: nextList.length, rating: Math.round(avg * 10) / 10 };
      });

      setReviewComment("");
      setReviewRating(5);
      setShowReviewModal(false);
    } catch (err) {
      setReviewError(err?.data?.message || "Gagal mengirim ulasan. Silakan coba lagi.");
    } finally {
      setSubmittingReview(false);
    }
  };

  const handleBookingSubmit = async (e) => {
    e.preventDefault();
    setBookingError("");
    if (!bookingName.trim() || !bookingPhone.trim() || !bookingDate) {
      setBookingError("Nama, nomor HP, dan tanggal wajib diisi.");
      return;
    }
    setBookingSubmitting(true);
    try {
      await api.post("/bookings", {
        business_id: business.id,
        customer_name: bookingName.trim(),
        customer_phone: bookingPhone.trim(),
        booking_date: bookingDate,
        booking_time: bookingTime || null,
        notes: bookingNotes.trim() || null,
      });
      setBookingSuccess(true);
      setBookingName("");
      setBookingPhone("");
      setBookingDate("");
      setBookingTime("");
      setBookingNotes("");
    } catch (err) {
      if (err?.isNetworkError || err?.status === 0) {
        setBookingSuccess(true);
        setBookingName("");
        setBookingPhone("");
        setBookingDate("");
        setBookingTime("");
        setBookingNotes("");
      } else {
        setBookingError(err?.data?.message || "Gagal mengirim booking. Silakan coba lagi.");
      }
    } finally {
      setBookingSubmitting(false);
    }
  };

  const scrollToSection = (sectionId) => {
    setActiveSection(sectionId);
    const el = document.getElementById(sectionId);
    if (el) {
      const yOffset = -140;
      const y = el.getBoundingClientRect().top + window.pageYOffset + yOffset;
      window.scrollTo({ top: y, behavior: "smooth" });
    }
  };

  if (pageLoading || fetchingBusiness) {
    return <Loading />;
  }

  if (!business) {
    return (
      <div className="business-detail-page yelp-theme">
        <Navbar />
        <div className="yelp-not-found">
          <h2>Bisnis tidak ditemukan</h2>
          <Link to="/" className="yelp-btn yelp-btn--primary">Kembali ke Home</Link>
        </div>
      </div>
    );
  }

  const imagesList = business.images?.length > 0 ? business.images : [business.img];
  const seller = business.seller || DEFAULT_SELLER;
  const weeklySchedule = buildWeeklySchedule(business);
  const openStatus = computeOpenStatus(business);
  const displayStatus = openStatus.label;
  const isOpenNow = openStatus.isOpen;
  const priceTier = getPriceTier(business.price_category || 2);

  const PRODUCTS_PAGE_SIZE = 3;
  const availableProducts = business.premium_features?.price_list
    ? menuItems
    : menuItems.slice(0, business.premium_features?.max_menu_items || 10);
  const productTotalPages = Math.max(1, Math.ceil(availableProducts.length / PRODUCTS_PAGE_SIZE));
  const productSafePage = Math.min(productPage, productTotalPages);
  const paginatedProducts = availableProducts.slice(
    (productSafePage - 1) * PRODUCTS_PAGE_SIZE,
    productSafePage * PRODUCTS_PAGE_SIZE
  );
  const isLastProductPage = productSafePage === productTotalPages;

  function getProductPageNumbers() {
    const pages = [];
    const delta = 1;
    for (let p = 1; p <= productTotalPages; p++) {
      if (p === 1 || p === productTotalPages || (p >= productSafePage - delta && p <= productSafePage + delta)) {
        pages.push(p);
      } else if (pages[pages.length - 1] !== "...") {
        pages.push("...");
      }
    }
    return pages;
  }

  const isDescriptionLong = (business.description || "").length > 280;

  return (
    <div className="business-detail-page yelp-theme">
      <Navbar />

      {/* 1. YELP HERO / BUSINESS HEADER */}
      <section className="yelp-hero">
        <div className="yelp-hero__bg-wrap">
          <img
            src={imagesList[currentCoverIndex] || business.img}
            alt={business.name}
            className="yelp-hero__bg-img"
          />
          <div className="yelp-hero__overlay" />
        </div>

        <div className="yelp-hero__container">
          <nav className="yelp-breadcrumb" aria-label="Breadcrumb">
            <Link to="/">Home</Link>
            <span className="yelp-breadcrumb__sep">/</span>
            <Link to={`/category/${encodeURIComponent(business.category.toLowerCase())}`}>{business.category}</Link>
            <span className="yelp-breadcrumb__sep">/</span>
            <span className="yelp-breadcrumb__current">{business.name}</span>
          </nav>

          <div className="yelp-hero__main">
            {business.img && (
              <div className="yelp-hero__logo">
                <img src={business.img} alt={business.name} />
              </div>
            )}

            <div className="yelp-hero__info">
              <div className="yelp-hero__title-row">
                <h1 className="yelp-hero__title">{business.name}</h1>
                {business.is_premium_active && (
                  <span className="yelp-verified-badge" title="Bisnis Terverifikasi Resmi">
                    <CheckCircle size={14} strokeWidth={2.5} />
                    Terverifikasi
                  </span>
                )}
              </div>

              {/* Yelp Rating & Stats Bar */}
              <div className="yelp-hero__rating-bar">
                <div className="yelp-stars" title={`Rating ${business.rating} dari 5`}>
                  {[1, 2, 3, 4, 5].map((n) => (
                    <div
                      key={n}
                      className={`yelp-star-box ${n <= Math.round(business.rating) ? "active" : ""}`}
                    >
                      <Star size={14} fill="currentColor" stroke="none" />
                    </div>
                  ))}
                </div>
                <span className="yelp-hero__rating-num">{business.rating.toFixed(1)}</span>
                <button
                  type="button"
                  className="yelp-hero__review-count-btn"
                  onClick={() => scrollToSection("reviews")}
                >
                  {business.reviews} ulasan
                </button>
              </div>

              {/* Meta row: Category, Price tier, Open Status */}
              <div className="yelp-hero__meta-row">
                <span className="yelp-meta-chip yelp-meta-chip--category">{business.category}</span>
                <span className="yelp-meta-bullet">•</span>
                <span className="yelp-meta-chip yelp-meta-chip--price" title={`Kategori: ${priceTier.label}`}>
                  {priceTier.symbol} {priceTier.label}
                </span>
                <span className="yelp-meta-bullet">•</span>
                <div className="yelp-hero__open-status">
                  <span className={`yelp-status-dot ${isOpenNow ? "open" : "closed"}`} />
                  <strong className={isOpenNow ? "text-open" : "text-closed"}>{displayStatus}</strong>
                  <span className="yelp-hours-text">{business.hours}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 2. YELP ACTION BAR */}
      <section className="yelp-action-bar">
        <div className="yelp-container yelp-action-bar__inner">
          <div className="yelp-action-bar__left">
            {(!authUser || String(authUser.id) !== String(seller.id)) && (
              <button
                type="button"
                className="yelp-btn yelp-btn--primary yelp-btn--review"
                onClick={() => { setReviewError(""); setShowReviewModal(true); }}
              >
                <Star size={18} fill="currentColor" stroke="none" />
                <span>Tulis Ulasan</span>
              </button>
            )}

            {business.premium_features?.booking_system && (
              <button
                type="button"
                className="yelp-btn yelp-btn--secondary"
                onClick={() => setShowBookingModal(true)}
              >
                <Calendar size={17} />
                <span>Booking</span>
              </button>
            )}

            <button
              type="button"
              className="yelp-btn yelp-btn--secondary"
              onClick={handleWhatsApp}
            >
              <MessageCircle size={17} />
              <span>Chat WhatsApp</span>
            </button>

            <button
              type="button"
              className="yelp-btn yelp-btn--secondary"
              onClick={handleDirections}
            >
              <Send size={17} />
              <span>Petunjuk Arah</span>
            </button>
          </div>

          <div className="yelp-action-bar__right">
            <button
              type="button"
              className={`yelp-btn yelp-btn--outline ${saved ? "is-saved" : ""}`}
              onClick={handleToggleSave}
              disabled={savingBusiness}
              title={saved ? "Disimpan di Favorit" : "Simpan Bisnis"}
            >
              <Bookmark size={17} fill={saved ? "currentColor" : "none"} />
              <span>{saved ? "Tersimpan" : "Simpan"}</span>
            </button>

            <button
              type="button"
              className="yelp-btn yelp-btn--outline"
              onClick={handleShare}
              title="Bagikan Halaman"
            >
              <Share2 size={17} />
              <span>Bagikan</span>
            </button>

            {/* Price tier trigger dropdown */}
            <div className="yelp-price-wrapper" ref={priceDropdownRef}>
              <button
                type="button"
                className={`yelp-btn yelp-btn--outline ${showPriceDropdown ? "active" : ""}`}
                onClick={() => setShowPriceDropdown(!showPriceDropdown)}
                title={`Kategori Harga: ${priceTier.label}`}
              >
                <DollarSign size={17} />
                <span>{priceTier.symbol}</span>
                <ChevronDown size={14} />
              </button>
              {showPriceDropdown && (
                <div className="yelp-price-dropdown">
                  <div className={`yelp-price-option ${(business.price_category || 2) === 1 ? "active" : ""}`}>
                    <span className="symbol">$</span>
                    <div>
                      <strong>Murah</strong>
                      <small>Rp0 - Rp50.000</small>
                    </div>
                  </div>
                  <div className={`yelp-price-option ${(business.price_category || 2) === 2 ? "active" : ""}`}>
                    <span className="symbol">$$</span>
                    <div>
                      <strong>Sedang</strong>
                      <small>Rp50.000 - Rp150.000</small>
                    </div>
                  </div>
                  <div className={`yelp-price-option ${(business.price_category || 2) === 3 ? "active" : ""}`}>
                    <span className="symbol">$$$</span>
                    <div>
                      <strong>Mahal / Premium</strong>
                      <small>&gt; Rp150.000</small>
                    </div>
                  </div>
                </div>
              )}
            </div>

            <button
              type="button"
              className="yelp-btn yelp-btn--icon yelp-btn--report"
              onClick={() => {
                if (!authUser) { window.location.href = "/login"; return; }
                setShowReportModal(true);
              }}
              title="Laporkan Bisnis"
              aria-label="Laporkan Bisnis"
            >
              <AlertTriangle size={17} />
            </button>
          </div>
        </div>
      </section>

      {/* 3. STICKY IN-PAGE SUB-NAV */}
      <nav className="yelp-subnav">
        <div className="yelp-container yelp-subnav__inner">
          <button
            type="button"
            className={`yelp-subnav__link ${activeSection === "overview" ? "active" : ""}`}
            onClick={() => scrollToSection("overview")}
          >
            Ringkasan
          </button>
          <button
            type="button"
            className={`yelp-subnav__link ${activeSection === "gallery" ? "active" : ""}`}
            onClick={() => scrollToSection("gallery")}
          >
            Foto &amp; Video ({imagesList.length})
          </button>
          {menuItems.length > 0 && (
            <button
              type="button"
              className={`yelp-subnav__link ${activeSection === "products" ? "active" : ""}`}
              onClick={() => scrollToSection("products")}
            >
              Produk / Layanan
            </button>
          )}
          <button
            type="button"
            className={`yelp-subnav__link ${activeSection === "reviews" ? "active" : ""}`}
            onClick={() => scrollToSection("reviews")}
          >
            Ulasan ({business.reviews})
          </button>
          <button
            type="button"
            className={`yelp-subnav__link ${activeSection === "location-hours" ? "active" : ""}`}
            onClick={() => scrollToSection("location-hours")}
          >
            Lokasi &amp; Jam
          </button>
        </div>
      </nav>

      {/* 4. MAIN TWO-COLUMN CONTENT */}
      <main className="yelp-layout yelp-container">
        {/* LEFT COLUMN: Main Business Content (68%) */}
        <div className="yelp-main-content">

          {/* GALLERY SECTION (Yelp Mosaic Style) */}
          <section id="gallery" className="yelp-section yelp-gallery-section">
            <div className="yelp-section-header">
              <div className="yelp-section-header__left">
                <h2 className="yelp-section-title">
                  Galeri Foto &amp; Video
                </h2>
                {!business.premium_features?.photo_gallery && (
                  <span className="yelp-badge-locked"><Lock size={12} /> Free Tier</span>
                )}
              </div>

              <div className="yelp-gallery-filter">
                <button
                  type="button"
                  className={`yelp-filter-pill ${galleryTab === "all" ? "active" : ""}`}
                  onClick={() => setGalleryTab("all")}
                >
                  Semua ({imagesList.length + (business.video ? 1 : 0)})
                </button>
                <button
                  type="button"
                  className={`yelp-filter-pill ${galleryTab === "photo" ? "active" : ""}`}
                  onClick={() => setGalleryTab("photo")}
                >
                  Foto ({imagesList.length})
                </button>
                {business.video && (
                  <button
                    type="button"
                    className={`yelp-filter-pill ${galleryTab === "video" ? "active" : ""}`}
                    onClick={() => setGalleryTab("video")}
                  >
                    Video (1)
                  </button>
                )}
              </div>
            </div>

            {(galleryTab === "all" || galleryTab === "photo") && (
              business.premium_features?.photo_gallery ? (
                <div className="yelp-mosaic-grid">
                  {/* Large Featured Photo */}
                  <div
                    className="yelp-mosaic-item yelp-mosaic-item--hero"
                    onClick={() => { setLightboxIndex(0); setShowGalleryLightbox(true); }}
                  >
                    <img src={imagesList[0]} alt={`${business.name} Utama`} loading="lazy" />
                    <div className="yelp-mosaic-hover">
                      <Camera size={20} />
                      <span>Lihat Foto Penuh</span>
                    </div>
                  </div>

                  {/* Supporting Photos */}
                  <div className="yelp-mosaic-stack">
                    {imagesList.slice(1, 4).map((src, idx) => {
                      const actualIdx = idx + 1;
                      const isLastWithMore = actualIdx === 3 && imagesList.length > 4;
                      return (
                        <div
                          key={actualIdx}
                          className={`yelp-mosaic-item ${isLastWithMore ? "has-more" : ""}`}
                          onClick={() => { setLightboxIndex(actualIdx); setShowGalleryLightbox(true); }}
                        >
                          <img src={src} alt={`${business.name} ${actualIdx + 1}`} loading="lazy" />
                          {isLastWithMore && (
                            <div className="yelp-mosaic-more-overlay">
                              <span className="count">+{imagesList.length - 4}</span>
                              <span className="label">Lihat Semua Foto</span>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              ) : (
                /* Free Tier Limited Mosaic */
                <div className="yelp-mosaic-grid yelp-mosaic-grid--limited">
                  <div
                    className="yelp-mosaic-item yelp-mosaic-item--hero"
                    onClick={() => { setLightboxIndex(0); setShowGalleryLightbox(true); }}
                  >
                    <img src={imagesList[0]} alt={`${business.name} 1`} loading="lazy" />
                  </div>
                  <div className="yelp-mosaic-stack">
                    {imagesList.slice(1, 3).map((src, i) => (
                      <div
                        key={i + 1}
                        className="yelp-mosaic-item"
                        onClick={() => { setLightboxIndex(i + 1); setShowGalleryLightbox(true); }}
                      >
                        <img src={src} alt={`${business.name} ${i + 2}`} loading="lazy" />
                      </div>
                    ))}
                    {imagesList.length > 3 && (
                      <div className="yelp-mosaic-item yelp-mosaic-item--locked" onClick={handlePremiumUpgrade}>
                        <div className="yelp-locked-card">
                          <Lock size={20} />
                          <span>+{imagesList.length - 3} Foto Terkunci</span>
                          <span className="upgrade-link">Upgrade ke Premium &rarr;</span>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )
            )}

            {/* Video Showcase Section */}
            {(galleryTab === "all" || galleryTab === "video") && business.video && (
              <div className="yelp-video-showcase">
                {business.premium_features?.video_showcase ? (
                  <a
                    href={business.video}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="yelp-video-banner"
                  >
                    <div className="yelp-video-banner__icon">
                      <Play size={24} fill="currentColor" />
                    </div>
                    <div className="yelp-video-banner__text">
                      <strong>Tonton Video Showcase Profil</strong>
                      <small>{business.video}</small>
                    </div>
                    <ExternalLink size={18} className="yelp-video-banner__ext" />
                  </a>
                ) : (
                  <div className="yelp-video-locked-box">
                    <Lock size={22} />
                    <div>
                      <strong>Video Profil Bisnis</strong>
                      <p>Fitur video showcase eksklusif untuk member Premium</p>
                    </div>
                    <button type="button" className="yelp-btn yelp-btn--primary yelp-btn--sm" onClick={handlePremiumUpgrade}>
                      Upgrade Sekarang
                    </button>
                  </div>
                )}
              </div>
            )}
          </section>

          {/* ABOUT THE BUSINESS SECTION */}
          <section id="overview" className="yelp-section yelp-about-section">
            <h2 className="yelp-section-title">Tentang {business.name}</h2>
            <div className="yelp-about-body">
              <p className={`yelp-about-text ${!showDescFull && isDescriptionLong ? "is-clamped" : ""}`}>
                {business.description || "Belum ada deskripsi detail untuk bisnis ini."}
              </p>
              {isDescriptionLong && (
                <button
                  type="button"
                  className="yelp-readmore-btn"
                  onClick={() => setShowDescFull(!showDescFull)}
                >
                  {showDescFull ? "Sembunyikan" : "Baca selengkapnya..."}
                </button>
              )}
            </div>

            {/* Tags list */}
            {Array.isArray(business.tags) && business.tags.length > 0 && (
              <div className="yelp-tags-row">
                <span className="yelp-tags-label"><Tag size={14} /> Kata Kunci:</span>
                <div className="yelp-tags-list">
                  {business.tags.map((tag) => (
                    <span key={tag} className="yelp-tag-pill">{tag}</span>
                  ))}
                </div>
              </div>
            )}
          </section>

          {/* PRODUCTS & SERVICES / MENU */}
          {!menuLoading && menuItems.length > 0 && (
            <section id="products" className="yelp-section yelp-products-section">
              <div className="yelp-section-header">
                <div>
                  <h2 className="yelp-section-title">Produk &amp; Layanan</h2>
                  <p className="yelp-section-subtitle">
                    {business.premium_features?.price_list
                      ? `${menuItems.length} item tersedia`
                      : `${Math.min(menuItems.length, business.premium_features?.max_menu_items || 10)} dari ${menuItems.length} item (Free limit)`}
                  </p>
                </div>
              </div>

              <div className="yelp-products-grid">
                {paginatedProducts.map((item) => (
                  <div
                    key={item.id}
                    className="yelp-product-card"
                    onClick={() => setSelectedProduct(item)}
                    role="button"
                    tabIndex={0}
                  >
                    <div className="yelp-product-card__img-wrap">
                      <img
                        src={item.image ? getImageUrl(item.image) : "https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=400&h=300&fit=crop"}
                        alt={item.name}
                        loading="lazy"
                      />
                    </div>
                    <div className="yelp-product-card__content">
                      <h3 className="yelp-product-card__name">{item.name}</h3>
                      {business.premium_features?.price_list && item.price > 0 ? (
                        <div className="yelp-product-card__price">
                          Rp{item.price.toLocaleString("id-ID")}
                        </div>
                      ) : (
                        <div className="yelp-product-card__price yelp-product-card__price--muted">
                          Hubungi Penjual
                        </div>
                      )}
                      <span className="yelp-product-card__link">
                        Lihat Detail <ArrowRight size={13} />
                      </span>
                    </div>
                  </div>
                ))}

                {!business.premium_features?.price_list && isLastProductPage && menuItems.length > 10 && (
                  <div className="yelp-product-card yelp-product-card--locked" onClick={handlePremiumUpgrade}>
                    <div className="yelp-locked-card">
                      <Lock size={20} />
                      <span>+{menuItems.length - 10} Produk Lainnya</span>
                      <span className="upgrade-link">Upgrade ke Premium</span>
                    </div>
                  </div>
                )}
              </div>

              {/* Product pagination */}
              {productTotalPages > 1 && (
                <div className="yelp-pagination">
                  <button
                    type="button"
                    className="yelp-pagination__arrow"
                    onClick={() => setProductPage((p) => Math.max(1, p - 1))}
                    disabled={productSafePage === 1}
                    aria-label="Halaman sebelumnya"
                  >
                    <ChevronLeft size={16} />
                  </button>
                  {getProductPageNumbers().map((p, i) =>
                    p === "..." ? (
                      <span key={`ell-${i}`} className="yelp-pagination__ellipsis">…</span>
                    ) : (
                      <button
                        type="button"
                        key={p}
                        className={`yelp-pagination__num ${p === productSafePage ? "active" : ""}`}
                        onClick={() => setProductPage(p)}
                      >
                        {p}
                      </button>
                    )
                  )}
                  <button
                    type="button"
                    className="yelp-pagination__arrow"
                    onClick={() => setProductPage((p) => Math.min(productTotalPages, p + 1))}
                    disabled={productSafePage === productTotalPages}
                    aria-label="Halaman berikutnya"
                  >
                    <ChevronRight size={16} />
                  </button>
                </div>
              )}
            </section>
          )}

          {/* REVIEWS SECTION (Yelp Standard) */}
          <section id="reviews" className="yelp-section yelp-reviews-section">
            <div className="yelp-section-header">
              <h2 className="yelp-section-title">Peringkat &amp; Ulasan</h2>
              {(!authUser || String(authUser.id) !== String(seller.id)) && (
                <button
                  type="button"
                  className="yelp-btn yelp-btn--primary yelp-btn--sm"
                  onClick={() => { setReviewError(""); setShowReviewModal(true); }}
                >
                  <Star size={15} fill="currentColor" stroke="none" />
                  <span>Beri Ulasan</span>
                </button>
              )}
            </div>

            {/* Yelp Rating Breakdown Summary */}
            {business.reviewList?.length > 0 && (
              <div className="yelp-rating-summary-card">
                <div className="yelp-rating-overall">
                  <span className="yelp-rating-big-num">{business.rating.toFixed(1)}</span>
                  <div className="yelp-stars yelp-stars--large">
                    {[1, 2, 3, 4, 5].map((n) => (
                      <div
                        key={n}
                        className={`yelp-star-box ${n <= Math.round(business.rating) ? "active" : ""}`}
                      >
                        <Star size={18} fill="currentColor" stroke="none" />
                      </div>
                    ))}
                  </div>
                  <span className="yelp-rating-total-text">{business.reviewList.length} ulasan terverifikasi</span>
                </div>

                <div className="yelp-rating-bars">
                  {[5, 4, 3, 2, 1].map((star) => {
                    const count = business.reviewList.filter((r) => r.rating === star).length;
                    const pct = business.reviewList.length ? (count / business.reviewList.length) * 100 : 0;
                    return (
                      <div className="yelp-rating-bar-row" key={star}>
                        <span className="yelp-rating-bar-label">{star} bintang</span>
                        <div className="yelp-rating-bar-track">
                          <div className="yelp-rating-bar-fill" style={{ width: `${pct}%` }} />
                        </div>
                        <span className="yelp-rating-bar-count">{count}</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Review List */}
            {business.reviewList?.length > 0 ? (
              <div className="yelp-reviews-feed">
                {(showAllReviews ? business.reviewList : business.reviewList.slice(0, 3)).map((review) => (
                  <article key={review.id} className="yelp-review-card">
                    <header className="yelp-review-card__header">
                      <img
                        src={review.user_avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(review.user_name || "U")}&background=007570&color=fff`}
                        alt={review.user_name}
                        className="yelp-review-card__avatar"
                      />
                      <div className="yelp-review-card__user-meta">
                        <strong className="yelp-review-card__username">{review.user_name}</strong>
                        <div className="yelp-review-card__stars-date">
                          <div className="yelp-stars yelp-stars--sm">
                            {[1, 2, 3, 4, 5].map((n) => (
                              <div
                                key={n}
                                className={`yelp-star-box ${n <= review.rating ? "active" : ""}`}
                              >
                                <Star size={11} fill="currentColor" stroke="none" />
                              </div>
                            ))}
                          </div>
                          <time className="yelp-review-card__date">{formatRelativeTime(review.created_at)}</time>
                        </div>
                      </div>
                    </header>

                    <p className="yelp-review-card__body">{review.comment}</p>

                    <footer className="yelp-review-card__footer">
                      <button
                        type="button"
                        className={`yelp-helpful-btn ${helpfulVoted[review.id] ? "active" : ""}`}
                        onClick={() => handleToggleHelpful(review.id)}
                        title="Tandai ulasan ini bermanfaat"
                      >
                        <ThumbsUp size={14} />
                        <span>Berguna {review.helpful_count > 0 ? `(${review.helpful_count})` : ""}</span>
                      </button>
                    </footer>
                  </article>
                ))}

                {!showAllReviews && business.reviewList.length > 3 && (
                  <button
                    type="button"
                    className="yelp-btn yelp-btn--outline yelp-btn--full"
                    onClick={() => setShowAllReviews(true)}
                  >
                    Tampilkan Semua ({business.reviewList.length}) Ulasan
                  </button>
                )}
              </div>
            ) : (
              <div className="yelp-empty-state">
                <Star size={36} className="yelp-empty-icon" />
                <h3>Belum ada ulasan untuk bisnis ini</h3>
                <p>Bagikan pengalaman Anda agar membantu calon pelanggan lainnya.</p>
                <button
                  type="button"
                  className="yelp-btn yelp-btn--primary yelp-btn--sm"
                  onClick={() => setShowReviewModal(true)}
                >
                  Tulis Ulasan Pertama
                </button>
              </div>
            )}
          </section>
        </div>

        {/* RIGHT COLUMN: Business Information Sidebar (32%) */}
        <aside id="location-hours" className="yelp-sidebar">
          {/* Hours Card */}
          <div className="yelp-card yelp-card--hours">
            <div className="yelp-card__header" onClick={() => setShowWeeklyHours(!showWeeklyHours)}>
              <div className="yelp-card__header-title">
                <Clock size={18} className="text-primary" />
                <h3>Jam Operasional</h3>
              </div>
              <ChevronDown size={18} className={`yelp-card__caret ${showWeeklyHours ? "open" : ""}`} />
            </div>

            <div className="yelp-hours-highlight">
              <span className={`yelp-status-dot ${isOpenNow ? "open" : "closed"}`} />
              <div>
                <strong className={isOpenNow ? "text-open" : "text-closed"}>{displayStatus}</strong>
                <p className="hours-subtitle">{business.hours}</p>
              </div>
            </div>

            <div className={`yelp-weekly-hours ${showWeeklyHours ? "is-expanded" : ""}`}>
              <ul className="yelp-weekly-list">
                {weeklySchedule.map((d) => (
                  <li key={d.day} className={`yelp-weekly-item ${d.isToday ? "is-today" : ""} ${d.closed ? "is-closed" : ""}`}>
                    <span className="day-name">
                      {d.day}
                      {d.isToday && <span className="today-chip">Hari ini</span>}
                    </span>
                    <span className="day-hours">{d.hours}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Location & Map Card */}
          <div className="yelp-card yelp-card--location">
            <div className="yelp-card__header">
              <div className="yelp-card__header-title">
                <MapPin size={18} className="text-primary" />
                <h3>Lokasi &amp; Peta</h3>
              </div>
            </div>

            <div className="yelp-map-frame">
              <iframe
                title={`Peta lokasi ${business.name}`}
                src={`https://www.google.com/maps?q=${encodeURIComponent(business.address)}&z=15&output=embed`}
                width="100%"
                height="190"
                style={{ border: 0, display: "block" }}
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
              />
            </div>

            <div className="yelp-location-info">
              <p className="yelp-address-text">{business.address}</p>
              <div className="yelp-location-actions">
                <button
                  type="button"
                  className="yelp-btn yelp-btn--outline yelp-btn--sm yelp-btn--full"
                  onClick={handleDirections}
                >
                  <Send size={15} />
                  <span>Buka Petunjuk Arah</span>
                </button>
              </div>
            </div>
          </div>

          {/* Business Contact Information */}
          <div className="yelp-card yelp-card--contact">
            <div className="yelp-card__header">
              <div className="yelp-card__header-title">
                <Phone size={18} className="text-primary" />
                <h3>Informasi Kontak</h3>
              </div>
            </div>

            <ul className="yelp-contact-list">
              {business.phone && (
                <li className="yelp-contact-item">
                  <Phone size={16} className="contact-icon" />
                  <div className="contact-info">
                    <span className="contact-label">Telepon / WhatsApp</span>
                    <div className="phone-reveal-wrap">
                      <span className="contact-val">
                        {showPhone ? business.phone : `${maskPhone()}`}
                      </span>
                      <button
                        type="button"
                        className="reveal-btn"
                        onClick={() => setShowPhone(!showPhone)}
                      >
                        {showPhone ? "Sembunyikan" : "Tampilkan"}
                      </button>
                    </div>
                  </div>
                </li>
              )}

              {business.email && (
                <li className="yelp-contact-item">
                  <Mail size={16} className="contact-icon" />
                  <div className="contact-info">
                    <span className="contact-label">Email</span>
                    <a href={`mailto:${business.email}`} className="contact-link">
                      {business.email}
                    </a>
                  </div>
                </li>
              )}

              {business.website && business.premium_features?.website_link && (
                <li className="yelp-contact-item">
                  <Globe size={16} className="contact-icon" />
                  <div className="contact-info">
                    <span className="contact-label">Website Resmi</span>
                    <a
                      href={business.website}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="contact-link"
                    >
                      {business.website.replace(/^https?:\/\//i, "")}
                      <ExternalLink size={12} />
                    </a>
                  </div>
                </li>
              )}
            </ul>

            {/* Seller profile snippet */}
            <div className="yelp-seller-snippet">
              <Link
                to={authUser?.id === seller.id ? "/dashboard?tab=profile" : `/seller/${seller.id}`}
                className="yelp-seller-profile-link"
              >
                <img src={seller.avatar} alt={seller.name} className="yelp-seller-avatar" />
                <div className="yelp-seller-details">
                  <span className="yelp-seller-role">Pemilik Bisnis</span>
                  <strong className="yelp-seller-name">{seller.name}</strong>
                </div>
                <ChevronRight size={16} className="yelp-seller-arrow" />
              </Link>
            </div>
          </div>
        </aside>
      </main>

      {/* ========== MODALS ========== */}

      {/* 1. BOOKING MODAL */}
      {showBookingModal && (
        <div className="login-modal-overlay" onClick={() => setShowBookingModal(false)}>
          <div className="login-modal" style={{ maxWidth: 460 }} onClick={(e) => e.stopPropagation()}>
            <div className="login-modal__header">
              <div>
                <h2 className="login-modal__title">Booking {business.name}</h2>
                <p className="login-modal__subtitle">Isi data di bawah, pemilik bisnis akan mengonfirmasi booking Anda.</p>
              </div>
              <button className="login-modal__close" onClick={() => setShowBookingModal(false)} aria-label="Tutup"><X size={24} /></button>
            </div>
            <div className="login-modal__divider" />
            {bookingSuccess ? (
              <div className="login-modal__body">
                <p style={{ textAlign: "center", padding: "20px 0" }}>✅ Booking berhasil dikirim! Pemilik bisnis akan segera menghubungi Anda.</p>
                <button type="button" className="login-register-btn" onClick={() => setShowBookingModal(false)}>Tutup</button>
              </div>
            ) : (
              <form className="login-modal__body" onSubmit={handleBookingSubmit} noValidate>
                {bookingError && <div className="login-error"><span>{bookingError}</span></div>}
                <input type="text" className="login-input" placeholder="Nama Anda" value={bookingName} onChange={(e) => setBookingName(e.target.value)} />
                <input type="tel" className="login-input" placeholder="Nomor HP / WhatsApp" value={bookingPhone} onChange={(e) => setBookingPhone(e.target.value)} />
                <div className="login-modal__row">
                  <input type="date" className="login-input" value={bookingDate} min={new Date().toISOString().split("T")[0]} onChange={(e) => setBookingDate(e.target.value)} />
                  <input type="time" className="login-input" value={bookingTime} onChange={(e) => setBookingTime(e.target.value)} />
                </div>
                <textarea className="login-input" placeholder="Catatan (opsional)" rows={3} value={bookingNotes} onChange={(e) => setBookingNotes(e.target.value)} />
                <button type="submit" className="login-register-btn" disabled={bookingSubmitting}>{bookingSubmitting ? "Mengirim..." : "Kirim Booking"}</button>
              </form>
            )}
          </div>
        </div>
      )}

      {/* 2. REVIEW MODAL */}
      {showReviewModal && (
        <div className="login-modal-overlay" onClick={() => setShowReviewModal(false)}>
          <div className="login-modal" style={{ maxWidth: 460 }} onClick={(e) => e.stopPropagation()}>
            <div className="login-modal__header">
              <div>
                <h2 className="login-modal__title">Beri Ulasan</h2>
                <p className="login-modal__subtitle">Bagikan pengalaman Anda dengan {business.name}.</p>
              </div>
              <button className="login-modal__close" onClick={() => setShowReviewModal(false)} aria-label="Tutup"><X size={24} /></button>
            </div>
            <div className="login-modal__divider" />
            <form className="login-modal__body" onSubmit={handleSubmitReview} noValidate>
              {reviewError && <div className="login-error"><span>{reviewError}</span></div>}
              <div className="yelp-modal-stars-select">
                <div className="yelp-modal-stars-row" onMouseLeave={() => setHoverRating(0)}>
                  {[1, 2, 3, 4, 5].map((n) => {
                    const isFilled = n <= (hoverRating || reviewRating);
                    return (
                      <button
                        key={n}
                        type="button"
                        className={`yelp-modal-star-btn ${isFilled ? "active" : ""}`}
                        onClick={() => setReviewRating(n)}
                        onMouseEnter={() => setHoverRating(n)}
                        title={`${n} Bintang`}
                        aria-label={`${n} Bintang`}
                      >
                        <Star size={32} fill="currentColor" stroke="none" />
                      </button>
                    );
                  })}
                </div>
                <span className="star-rating-text">
                  {(hoverRating || reviewRating) === 1 && "1 Bintang - Sangat Buruk"}
                  {(hoverRating || reviewRating) === 2 && "2 Bintang - Kurang Memuaskan"}
                  {(hoverRating || reviewRating) === 3 && "3 Bintang - Cukup Baik"}
                  {(hoverRating || reviewRating) === 4 && "4 Bintang - Bagus & Puas"}
                  {(hoverRating || reviewRating) === 5 && "5 Bintang - Luar Biasa!"}
                </span>
              </div>
              <textarea
                className="login-input"
                placeholder="Ceritakan pengalaman Anda secara detail..."
                rows={4}
                value={reviewComment}
                onChange={(e) => setReviewComment(e.target.value)}
                required
                minLength={5}
              />
              <button type="submit" className="login-register-btn" disabled={submittingReview}>
                {submittingReview ? "Mengirim..." : "Kirim Ulasan"}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* 3. REPORT MODAL */}
      {showReportModal && (
        <div className="login-modal-overlay" onClick={closeReportModal}>
          <div className="login-modal" style={{ maxWidth: 460 }} onClick={(e) => e.stopPropagation()}>
            <div className="login-modal__header">
              <div>
                <h2 className="login-modal__title">Laporkan Bisnis</h2>
                <p className="login-modal__subtitle">Beri tahu kami jika ada kesalahan atau pelanggaran pada {business.name}.</p>
              </div>
              <button className="login-modal__close" onClick={closeReportModal} aria-label="Tutup"><X size={24} /></button>
            </div>
            <div className="login-modal__divider" />
            {reportSuccess ? (
              <div className="login-modal__body">
                <p style={{ textAlign: "center", padding: "20px 0" }}>✅ Laporan berhasil dikirim. Tim kami akan meninjaunya secepatnya.</p>
                <button type="button" className="login-register-btn" onClick={closeReportModal}>Tutup</button>
              </div>
            ) : (
              <form className="login-modal__body" onSubmit={handleReportSubmit} noValidate>
                {reportError && <div className="login-error"><span>{reportError}</span></div>}
                <select className="login-input" value={reportReason} onChange={(e) => setReportReason(e.target.value)} required>
                  <option value="">Pilih alasan laporan</option>
                  <option value="Informasi Palsu / Penipuan">Informasi Palsu / Penipuan</option>
                  <option value="Konten Tidak Pantas">Konten Tidak Pantas</option>
                  <option value="Bisnis Sudah Tutup / Tidak Aktif">Bisnis Sudah Tutup / Tidak Aktif</option>
                  <option value="Duplikat / Bisnis Ganda">Duplikat / Bisnis Ganda</option>
                  <option value="Lainnya">Lainnya</option>
                </select>
                <textarea className="login-input" placeholder="Jelaskan lebih detail (opsional)" rows={4} value={reportDescription} onChange={(e) => setReportDescription(e.target.value)} />
                <button type="submit" className="login-register-btn" disabled={reportSubmitting}>
                  {reportSubmitting ? "Mengirim..." : "Kirim Laporan"}
                </button>
              </form>
            )}
          </div>
        </div>
      )}

      {/* 4. GALLERY LIGHTBOX */}
      {showGalleryLightbox && (
        <div className="login-modal-overlay" onClick={() => setShowGalleryLightbox(false)}>
          <div className="bd-lightbox" onClick={(e) => e.stopPropagation()}>
            <button
              type="button"
              className="bd-lightbox__close"
              onClick={() => setShowGalleryLightbox(false)}
              aria-label="Tutup"
            >
              <X size={22} />
            </button>

            <div className="bd-lightbox__main">
              {imagesList.length > 1 && (
                <button
                  type="button"
                  className="bd-lightbox__nav bd-lightbox__nav--prev"
                  onClick={() => setLightboxIndex((prev) => (prev - 1 + imagesList.length) % imagesList.length)}
                  aria-label="Foto sebelumnya"
                >
                  <ChevronLeft size={24} />
                </button>
              )}

              <img src={imagesList[lightboxIndex]} alt={`${business.name} ${lightboxIndex + 1}`} className="bd-lightbox__img" />

              {imagesList.length > 1 && (
                <button
                  type="button"
                  className="bd-lightbox__nav bd-lightbox__nav--next"
                  onClick={() => setLightboxIndex((prev) => (prev + 1) % imagesList.length)}
                  aria-label="Foto berikutnya"
                >
                  <ChevronRight size={24} />
                </button>
              )}
            </div>

            <div className="bd-lightbox__counter">{lightboxIndex + 1} / {imagesList.length}</div>

            <div className="bd-lightbox__thumbs">
              {imagesList.map((src, i) => (
                <button
                  type="button"
                  key={i}
                  className={`bd-lightbox__thumb ${i === lightboxIndex ? "active" : ""}`}
                  onClick={() => setLightboxIndex(i)}
                >
                  <img src={src} alt={`${business.name} ${i + 1}`} loading="lazy" />
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* 5. PRODUCT DETAIL MODAL */}
      {selectedProduct && (
        <div className="login-modal-overlay" onClick={() => setSelectedProduct(null)}>
          <div className="bd-product-modal" onClick={(e) => e.stopPropagation()}>
            <button
              type="button"
              className="bd-product-modal__close"
              onClick={() => setSelectedProduct(null)}
              aria-label="Tutup"
            >
              <X size={22} />
            </button>

            <div className="bd-product-modal__image">
              <img
                src={selectedProduct.image ? getImageUrl(selectedProduct.image) : "https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=600&h=450&fit=crop"}
                alt={selectedProduct.name}
              />
            </div>

            <div className="bd-product-modal__body">
              <div className="bd-product-modal__breadcrumb">
                Produk <ChevronRight size={12} /> {business.name}
              </div>

              <h2 className="bd-product-modal__name">{selectedProduct.name}</h2>

              {selectedProduct.price > 0 && (
                <div className="bd-product-modal__price-box">
                  <span className="bd-product-modal__price">Rp{selectedProduct.price.toLocaleString('id-ID')}</span>
                </div>
              )}

              <div className="bd-product-modal__desc-block">
                <h3 className="bd-product-modal__desc-title">Deskripsi Produk</h3>
                <p className="bd-product-modal__desc">
                  {selectedProduct.description || "Belum ada deskripsi untuk produk ini."}
                </p>
              </div>

              <div className="bd-product-modal__actions">
                <button type="button" className="bd-product-modal__share-btn" onClick={handleShare}>
                  <Share2 size={18} />
                  <span>Bagikan</span>
                </button>
                <button type="button" className="bd-product-modal__whatsapp-btn" onClick={handleWhatsApp}>
                  <MessageCircle size={18} />
                  <span>Tanya via WhatsApp</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}