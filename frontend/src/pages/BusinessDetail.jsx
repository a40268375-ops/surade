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
  Flag,
  AlertTriangle,
  CheckCircle,
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

/* ── Helper untuk membuat tanggal relatif di masa lalu (n hari yang lalu) ── */
function formatRelativeTime(dateString) {
  const diffMs = Date.now() - new Date(dateString).getTime();
  const minutes = Math.floor(diffMs / 60000);
  if (minutes < 1) return "Baru saja";
  if (minutes < 60) return `${minutes} menit yang lalu`;
  const hours = Math.floor(minutes / 60);
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

/* ── Data bisnis contoh (fallback kalau API gagal) ── */
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
  {
    id: 3, name: "Toko Elektronik Jaya", category: "Elektronik & Gadget",
    tags: ["Handphone", "Aksesoris"], location: "Kabupaten Bogor",
    description: "Toko Elektronik Jaya menyediakan berbagai macam elektronik dan gadget dengan harga terjangkau dan kualitas terjamin. Kami juga menyediakan layanan servis.",
    phone: "+62 812 3456 7892",
    email: "elektronikjaya@gmail.com",
    address: "Jalan Mercurius 16680 Dramaga, Kabupaten Bogor, Jawa Barat",
    rating: 4.3, reviews: 89, hours: "09:00 - 21:00",
    closedDays: [],
    images: [
      "https://images.unsplash.com/photo-1542751371-adc38448a05e?w=1200&h=600&fit=crop",
      "https://images.unsplash.com/photo-1531297484001-80022131f5a1?w=1200&h=600&fit=crop",
      "https://images.unsplash.com/photo-1498049794561-7780e7231661?w=1200&h=600&fit=crop",
      "https://images.unsplash.com/photo-1491933382434-500287f9b54b?w=1200&h=600&fit=crop",
    ],
    video: "https://assets.mixkit.co/videos/preview/mixkit-hands-of-a-man-working-on-a-computer-40742-large.mp4",
    seller: DEFAULT_SELLER,
  },
  {
    id: 4, name: "Salon & Spa Cantik", category: "Pertokoan",
    tags: ["Salon", "Perawatan"], location: "Kota Depok",
    description: "Salon & Spa Cantik menawarkan berbagai layanan kecantikan dan perawatan tubuh dengan profesional. Dapatkan pengalaman relaksasi terbaik di sini.",
    phone: "+62 812 3456 7893",
    email: "saloncantik@gmail.com",
    address: "Jalan Margonda Raya No. 56, Kota Depok, Jawa Barat",
    rating: 4.6, reviews: 167, hours: "09:00 - 20:00",
    closedDays: ["Senin"],
    images: [
      "https://images.unsplash.com/photo-1540555700478-4be289fbecef?w=1200&h=600&fit=crop",
      "https://images.unsplash.com/photo-1512290923902-8a9f81dc236c?w=1200&h=600&fit=crop",
      "https://images.unsplash.com/photo-1519699047748-de8e457a634e?w=1200&h=600&fit=crop",
      "https://images.unsplash.com/photo-1560066984-138dadb4c035?w=1200&h=600&fit=crop",
    ],
    video: "https://assets.mixkit.co/videos/preview/mixkit-spa-treatment-with-stones-and-flowers-close-up-42861-large.mp4",
    seller: DEFAULT_SELLER,
  },
  {
    id: 5, name: "Bengkel Motor Makmur", category: "Servis & Tukang",
    tags: ["Bengkel", "Motor", "Oli"], location: "Kabupaten Bekasi",
    description: "Bengkel Motor Makmur adalah bengkel motor terpercaya dengan mekanik berpengalaman. Kami melayani servis, ganti oli, dan perbaikan motor berbagai merek.",
    phone: "+62 812 3456 7894",
    email: "bengkelmakmur@gmail.com",
    address: "Jalan Cikarang Barat No. 90, Kabupaten Bekasi, Jawa Barat",
    rating: 4.4, reviews: 134, hours: "08:00 - 18:00",
    closedDays: ["Minggu"],
    images: [
      "https://images.unsplash.com/photo-1486006920555-c77dce18193b?w=1200&h=600&fit=crop",
      "https://images.unsplash.com/photo-1508974239320-0a029497e820?w=1200&h=600&fit=crop",
      "https://images.unsplash.com/photo-1517524206127-48bbd363f3d7?w=1200&h=600&fit=crop",
      "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=1200&h=600&fit=crop",
    ],
    video: "https://assets.mixkit.co/videos/preview/mixkit-car-mechanic-hands-repairing-an-engine-42777-large.mp4",
    seller: DEFAULT_SELLER,
  },
  {
    id: 6, name: "Wisata Alam Puncak", category: "Wisata",
    tags: ["Wisata", "Alam", "Liburan"], location: "Kabupaten Bogor",
    description: "Wisata Alam Puncak menawarkan keindahan alam yang menakjubkan dengan udara sejuk dan pemandangan yang memukau. Tempat yang sempurna untuk liburan keluarga.",
    phone: "+62 812 3456 7895",
    email: "wisatapuncak@gmail.com",
    address: "Jalan Raya Puncak No. 234, Kabupaten Bogor, Jawa Barat",
    rating: 4.8, reviews: 312, hours: "06:00 - 18:00",
    closedDays: [],
    images: [
      "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=1200&h=600&fit=crop",
      "https://images.unsplash.com/photo-1454496522488-7a8e488e8606?w=1200&h=600&fit=crop",
      "https://images.unsplash.com/photo-1472214222541-d510753a8707?w=1200&h=600&fit=crop",
      "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=1200&h=600&fit=crop",
    ],
    video: "https://assets.mixkit.co/videos/preview/mixkit-landscape-of-green-mountains-in-a-foggy-day-34301-large.mp4",
    seller: DEFAULT_SELLER,
  },
  {
    id: 101, name: "Global Bakery Leuwiliang", category: "Pertokoan",
    tags: ["Global Bakery Leuwiliang"], location: "Kabupaten Bogor",
    description: "Global Bakery Leuwiliang menyediakan berbagai roti dan kue segar setiap hari dengan bahan berkualitas tinggi.",
    phone: "+62 812 3456 7801",
    email: "globalbakery@gmail.com",
    address: "Jalan Raya Leuwiliang No. 88, Kabupaten Bogor, Jawa Barat",
    rating: 4.4, reviews: 67, hours: "07:00 - 19:00",
    closedDays: [],
    images: [
      "https://images.unsplash.com/photo-1509440159596-0249088772ff?w=1200&h=600&fit=crop",
      "https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=1200&h=600&fit=crop",
      "https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=1200&h=600&fit=crop",
      "https://images.unsplash.com/photo-1565958011703-44f9829ba187?w=1200&h=600&fit=crop",
    ],
    video: "https://assets.mixkit.co/videos/preview/mixkit-baking-cake-in-an-oven-13101-large.mp4",
    seller: DEFAULT_SELLER,
  },
  {
    id: 102, name: "TK Triwala", category: "Yayasan",
    tags: ["Tk Triwala"], location: "Kuningan",
    description: "TK Triwala adalah taman kanak-kanak yang menyediakan pendidikan anak usia dini dengan lingkungan belajar yang nyaman dan aman.",
    phone: "+62 812 3456 7802",
    email: "tktriwala@gmail.com",
    address: "Jalan Pendidikan No. 12, Kuningan, Jawa Barat",
    rating: 4.6, reviews: 42, hours: "07:30 - 15:00",
    closedDays: ["Sabtu", "Minggu"],
    images: [
      "https://images.unsplash.com/photo-1503676260728-1c00da094a0b?w=1200&h=600&fit=crop",
      "https://images.unsplash.com/photo-1580582932707-520aed937b7b?w=1200&h=600&fit=crop",
      "https://images.unsplash.com/photo-1509062522246-3755977927d7?w=1200&h=600&fit=crop",
      "https://images.unsplash.com/photo-1523050854058-8df90110c9f1?w=1200&h=600&fit=crop",
    ],
    video: null,
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
  const [showHours, setShowHours] = useState(false);
  const [showBookingModal, setShowBookingModal] = useState(false);
  // BARU: state untuk modal "Chat Dengan Penjual" - sebelumnya tombol ini
  // salah pasang, memanggil handleWhatsApp yang sama persis dengan tombol
  // WhatsApp di sebelahnya. Sekarang benar-benar mengirim pesan lewat
  // sistem chat internal (masuk ke tab Inbox pemilik bisnis).
  const [showChatModal, setShowChatModal] = useState(false);
  const [chatName, setChatName] = useState(authUser?.name || "");
  const [chatContact, setChatContact] = useState(authUser?.phone || authUser?.email || "");
  const [chatMessage, setChatMessage] = useState("");
  const [chatError, setChatError] = useState("");
  const [chatSubmitting, setChatSubmitting] = useState(false);
  const [chatSuccess, setChatSuccess] = useState(false);
  const [bookingName, setBookingName] = useState("");
  const [bookingPhone, setBookingPhone] = useState("");
  const [bookingDate, setBookingDate] = useState("");
  const [bookingTime, setBookingTime] = useState("");
  const [bookingNotes, setBookingNotes] = useState("");
  const [bookingSubmitting, setBookingSubmitting] = useState(false);
  const [bookingSuccess, setBookingSuccess] = useState(false);
  const [bookingError, setBookingError] = useState("");
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [showPriceDropdown, setShowPriceDropdown] = useState(false);
  const [showWeeklyHours, setShowWeeklyHours] = useState(false);
  const priceDropdownRef = useRef(null);
  const [menuItems, setMenuItems] = useState([]);
  const [menuLoading, setMenuLoading] = useState(true);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [productPage, setProductPage] = useState(1);
  const [showGalleryLightbox, setShowGalleryLightbox] = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState(0);
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [profileBusinesses, setProfileBusinesses] = useState([]);

  /* ── State ulasan ── */
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewComment, setReviewComment] = useState("");
  const [submittingReview, setSubmittingReview] = useState(false);
  const [reviewError, setReviewError] = useState("");

  // Menyimpan ulasan mana saja yang sudah ditandai "Berguna" oleh browser ini,
  // supaya tombolnya langsung kelihatan aktif tanpa nunggu reload halaman.
  const [helpfulVoted, setHelpfulVoted] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem("helpful_votes_business") || "{}");
    } catch {
      return {};
    }
  });

  // Kalau ulasan lebih dari 3, awalnya cuma 3 yang ditampilkan - sisanya
  // baru muncul setelah klik "Lihat Semua Ulasan" (gaya Google Play Store).
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
          hours: data.operating_hours || "08.00 - 17.00",
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
    setCurrentImageIndex(0);
    setShowPhone(false);
    setShowHours(false);

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

  // Balik ke halaman 1 tiap kali daftar produk berubah (misal ganti bisnis),
  // supaya pagination-nya nggak nyangkut di halaman kosong.
  useEffect(() => {
    setProductPage(1);
  }, [menuItems]);

  useEffect(() => {
    if (!business) return;
    const imagesList = business.images?.length > 0 ? business.images : [business.img];
    if (imagesList.length <= 1) return;
    const interval = setInterval(() => {
      setCurrentImageIndex((prev) => (prev + 1) % imagesList.length);
    }, 3000);
    return () => clearInterval(interval);
  }, [business]);

  // Cek apakah bisnis ini sudah ada di daftar favorit user yang login,
  // supaya ikon bookmark langsung tampil terisi kalau memang sudah disimpan.
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
    
    // Check if user owns this business
    if (authUser.id !== business.seller?.id) {
      alert("Anda hanya dapat upgrade bisnis milik sendiri");
      return;
    }
    
    // Redirect to dashboard premium tab
    navigate("/dashboard?tab=premium");
  };

  /* ── SIMPAN / HAPUS DARI FAVORIT ── */
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
      }
    } catch (err) {
      alert(err?.data?.message || "Gagal memperbarui daftar favorit. Silakan coba lagi.");
    } finally {
      setSavingBusiness(false);
    }
  };

  /* ── LAPORKAN BISNIS ── */
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

  /* ── KIRIM ULASAN ── */
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

  const handleChatSubmit = async (e) => {
    e.preventDefault();
    setChatError("");
    if (!chatName.trim() || !chatMessage.trim()) {
      setChatError("Nama dan pesan wajib diisi.");
      return;
    }
    setChatSubmitting(true);
    try {
      await api.post("/messages", {
        business_id: business.id,
        sender_name: chatName.trim(),
        sender_contact: chatContact.trim() || null,
        message: chatMessage.trim(),
      });
      setChatSuccess(true);
      setChatMessage("");
    } catch (err) {
      setChatError(err?.data?.message || "Gagal mengirim pesan. Silakan coba lagi.");
    } finally {
      setChatSubmitting(false);
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

  if (pageLoading || fetchingBusiness) {
    return <Loading />;
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

  const imagesList = business.images?.length > 0 ? business.images : [business.img];
  const seller = business.seller || DEFAULT_SELLER;
  const weeklySchedule = buildWeeklySchedule(business);
  const openStatus = computeOpenStatus(business);
  const displayStatus = openStatus.label;
  const isOpenNow = openStatus.isOpen;
  const priceTier = getPriceTier(business.price_category || 2);

  // Produk: dibatasi 3 per halaman, dengan pagination bernomor (kaya di
  // halaman kategori). Kalau produknya cuma 1 halaman, paginationnya
  // disembunyikan sama sekali.
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

  return (
    <div className="business-detail-page">
      <Navbar />

      {/* HERO SECTION */}
      <section className="bd-hero">
        <div className="bd-hero__bg">
          <div className="bd-hero__slides-container" style={{ transform: `translateX(-${currentImageIndex * 100}%)` }}>
            {/* For premium businesses, start slideshow from 2nd image (index 1) */}
            {business.is_premium_active && imagesList.length > 1 
              ? imagesList.slice(1).map((src, i) => (
                  <img key={i + 1} src={src} alt="" className="bd-hero__slide-img" />
                ))
              : imagesList.map((src, i) => (
                  <img key={i} src={src} alt="" className="bd-hero__slide-img" />
                ))
            }
          </div>
        </div>
        <div className="bd-hero__overlay" />
        <div className="bd-hero__content">
          <div className="bd-hero__inner">
            <div className="bd-hero__breadcrumb">
              <Link to="/">Home</Link>
              <span>/</span>
              <span>{business.category}</span>
              <span>/</span>
              <span>{business.name}</span>
            </div>
            <h1 className="bd-hero__title">
              {business.name}
              {business.is_premium_active && (
                <span className="bd-verified-badge" title="Bisnis Terverifikasi">
                  <CheckCircle size={14} strokeWidth={2.5} />
                  Terverifikasi
                </span>
              )}
            </h1>
            <p className="bd-hero__category">{business.category}</p>
            <div className="bd-hero__meta">
              <div className="bd-hero__rating">
                <Star size={18} fill="#fbbf24" stroke="#fbbf24" />
                <span>{business.rating}</span>
                <span>({business.reviews} ulasan)</span>
              </div>
              <div className="bd-hero__status">
                <span className={`bd-hero__status-dot ${isOpenNow ? "open" : "closed"}`} />
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
              <div className="bd-price-dropdown-wrapper" ref={priceDropdownRef}>
                <button type="button" className={`bd-quick-action ${showPriceDropdown ? "active" : ""}`} title={`Kategori Harga: ${priceTier.label}`} onClick={() => setShowPriceDropdown(!showPriceDropdown)}>
                  <DollarSign size={22} strokeWidth={1.8} />
                  <span className="bd-price-count">{priceTier.symbol}</span>
                </button>
                {showPriceDropdown && (
                  <div className="bd-price-dropdown">
                    <div className={`bd-price-option ${(business.price_category || 2) === 1 ? "active" : ""}`}>
                      <DollarSign size={16} /><span>Murah</span>
                    </div>
                    <div className={`bd-price-option ${(business.price_category || 2) === 2 ? "active" : ""}`}>
                      <div className="bd-price-dollars"><DollarSign size={16} /><DollarSign size={16} /></div><span>Sedang</span>
                    </div>
                    <div className={`bd-price-option ${(business.price_category || 2) === 3 ? "active" : ""}`}>
                      <div className="bd-price-dollars"><DollarSign size={16} /><DollarSign size={16} /><DollarSign size={16} /></div><span>Mahal</span>
                    </div>
                  </div>
                )}
              </div>

              <a href={`mailto:${business.email}`} className="bd-quick-action" title="Email"><Mail size={22} strokeWidth={1.8} /></a>
              <button type="button" className="bd-quick-action bd-quick-action--disabled" title="Telepon" disabled><Phone size={22} strokeWidth={1.8} /></button>
              <button type="button" className="bd-quick-action" title="WhatsApp" onClick={handleWhatsApp}><MessageCircle size={22} strokeWidth={1.8} /></button>
              <button type="button" className="bd-quick-action" title="Dapatkan Arah" onClick={handleDirections}><Send size={22} strokeWidth={1.8} /></button>
              <button type="button" className={`bd-quick-action ${saved ? "active" : ""}`} title={saved ? "Disimpan" : "Simpan"} onClick={handleToggleSave} disabled={savingBusiness}>
                <Bookmark size={22} strokeWidth={1.8} fill={saved ? "currentColor" : "none"} />
              </button>
              <button type="button" className="bd-quick-action" title="Bagikan" onClick={handleShare}><Share2 size={22} strokeWidth={1.8} /></button>
              <button type="button" className="bd-quick-action bd-quick-action--report" title="Laporkan" onClick={() => { if (!authUser) { window.location.href = "/login"; return; } setShowReportModal(true); }}>
                <AlertTriangle size={22} strokeWidth={1.8} />
              </button>
            </div>

            {showHours && (
              <div className="bd-hours-banner">
                <Clock size={18} />
                <span>Jam Operasional: <strong>{business.hours}</strong> ({displayStatus})</span>
              </div>
            )}

            {/* About */}
            <div className="bd-about-card">
              <h2 className="bd-about-card__title">Tentang {business.name}</h2>
              <p className="bd-about-card__text">{business.description}</p>
            </div>

            {/* Gallery - Premium Feature Check */}
            <div className="bd-gallery-section">
              <h2 className="bd-gallery-section__title">
                Galeri Foto &amp; Video
                {!business.premium_features?.photo_gallery && (
                  <span className="bd-premium-badge">Premium</span>
                )}
              </h2>
              
              {business.premium_features?.photo_gallery ? (
                <div className="bd-photo-grid">
                  {(imagesList.length > 4 ? imagesList.slice(0, 3) : imagesList).map((src, i) => (
                    <div
                      key={i}
                      className="bd-photo-item"
                      onClick={() => { setLightboxIndex(i); setShowGalleryLightbox(true); }}
                    >
                      <img src={src} alt={`${business.name} ${i + 1}`} loading="lazy" />
                    </div>
                  ))}
                  {imagesList.length > 4 && (
                    <div
                      className="bd-photo-item bd-photo-item--more"
                      onClick={() => { setLightboxIndex(3); setShowGalleryLightbox(true); }}
                    >
                      <img src={imagesList[3]} alt={`${business.name} 4`} loading="lazy" />
                      <div className="bd-more-overlay">
                        <span className="bd-more-overlay__count">+{imagesList.length - 3}</span>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div className="bd-premium-restriction">
                  <div className="bd-photo-grid bd-photo-grid--limited">
                    {/* For premium businesses, show images starting from index 1 (2nd image), 
                        For free businesses, show images starting from index 0 (1st image) */}
                    {business.is_premium_active 
                      ? imagesList.slice(1, (business.premium_features?.max_photos || 3) + 1).map((src, i) => (
                          <div key={i + 1} className="bd-photo-item">
                            <img src={src} alt={`${business.name} ${i + 2}`} loading="lazy" />
                          </div>
                        ))
                      : imagesList.slice(0, business.premium_features?.max_photos || 3).map((src, i) => (
                          <div key={i} className="bd-photo-item">
                            <img src={src} alt={`${business.name} ${i + 1}`} loading="lazy" />
                          </div>
                        ))
                    }
                    {imagesList.length > 3 && (
                      <div className="bd-photo-item bd-photo-item--locked">
                        <div className="bd-locked-overlay">
                          <div className="bd-locked-icon">🔒</div>
                          <span>+{imagesList.length - 3} foto lainnya</span>
                          <button className="bd-premium-upgrade-btn" onClick={handlePremiumUpgrade}>
                            Upgrade ke Premium
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}
              
              {business.premium_features?.video_showcase && business.video ? (
                <div className="bd-video-container">
                  <h3 className="bd-video-title">Video Profil</h3>
                  <a href={business.video} target="_blank" rel="noopener noreferrer" className="bd-video-link">
                    <div className="bd-video-link__icon">
                      <svg width="24" height="24" viewBox="0 0 24 24" fill="none"><path d="M8 5v14l11-7z" fill="currentColor"/></svg>
                    </div>
                    <div className="bd-video-link__content">
                      <span className="bd-video-link__label">Tonton Video</span>
                      <span className="bd-video-link__url">{business.video}</span>
                    </div>
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path><polyline points="15 3 21 3 21 9"></polyline><line x1="10" y1="14" x2="21" y2="3"></line></svg>
                  </a>
                </div>
              ) : business.video && (
                <div className="bd-premium-restriction">
                  <div className="bd-video-locked">
                    <div className="bd-locked-overlay">
                      <div className="bd-locked-icon">🔒</div>
                      <span>Video Profil (Premium Only)</span>
                      <button className="bd-premium-upgrade-btn" onClick={handlePremiumUpgrade}>
                        Upgrade ke Premium
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Produk - Premium Feature Check */}
            {!menuLoading && menuItems.length > 0 && (
              <div className="bd-products-section">
                <div className="bd-products-section__header">
                  <div className="bd-products-section__header-icon"><Package size={20} /></div>
                  <div>
                    <h2 className="bd-gallery-section__title">
                      Produk
                      {!business.premium_features?.price_list && (
                        <span className="bd-premium-badge">Premium</span>
                      )}
                    </h2>
                    <p className="bd-products-section__subtitle">
                      {business.premium_features?.price_list ? 
                        `${menuItems.length} produk tersedia` :
                        `${Math.min(menuItems.length, business.premium_features?.max_menu_items || 10)} dari ${menuItems.length} produk`
                      }
                    </p>
                  </div>
                </div>
                <div className="bd-products-grid">
                  {paginatedProducts.map((item) => (
                    <button
                      type="button"
                      key={item.id}
                      className="bd-product-card"
                      onClick={() => setSelectedProduct(item)}
                    >
                      <div className="bd-product-card__img-wrap">
                        <img src={item.image ? getImageUrl(item.image) : "https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=400&h=300&fit=crop"} alt={item.name} loading="lazy" />
                      </div>
                      <div className="bd-product-card__body">
                        <h3 className="bd-product-card__name">{item.name}</h3>
                        {business.premium_features?.price_list && item.price > 0 && (
                          <span className="bd-product-card__price">
                            <Tag size={12} /> Rp{item.price.toLocaleString('id-ID')}
                          </span>
                        )}
                        {!business.premium_features?.price_list && (
                          <span className="bd-product-card__price bd-product-card__price--locked">
                            <Tag size={12} /> Harga tersembunyi
                          </span>
                        )}
                        <span className="bd-product-card__footer-link">
                          Lihat Detail <ArrowRight size={13} />
                        </span>
                      </div>
                    </button>
                  ))}
                  {!business.premium_features?.price_list && isLastProductPage && menuItems.length > 10 && (
                    <div className="bd-product-card bd-product-card--locked">
                      <div className="bd-locked-overlay">
                        <div className="bd-locked-icon">🔒</div>
                        <span>+{menuItems.length - 10} produk lainnya</span>
                        <button className="bd-premium-upgrade-btn" onClick={handlePremiumUpgrade}>
                          Upgrade ke Premium
                        </button>
                      </div>
                    </div>
                  )}
                </div>

                {/* Pagination produk: cuma muncul kalau lebih dari 1 halaman */}
                {productTotalPages > 1 && (
                  <nav className="bd-products-pagination" aria-label="Navigasi halaman produk">
                    <button
                      type="button"
                      className="bd-products-pagination__nav"
                      onClick={() => setProductPage((p) => Math.max(1, p - 1))}
                      disabled={productSafePage === 1}
                      aria-label="Halaman sebelumnya"
                    >
                      <ChevronLeft size={16} />
                    </button>

                    {getProductPageNumbers().map((p, i) =>
                      p === "..." ? (
                        <span key={`ellipsis-${i}`} className="bd-products-pagination__ellipsis">…</span>
                      ) : (
                        <button
                          type="button"
                          key={p}
                          className={`bd-products-pagination__num ${p === productSafePage ? "active" : ""}`}
                          onClick={() => setProductPage(p)}
                        >
                          {p}
                        </button>
                      )
                    )}

                    <button
                      type="button"
                      className="bd-products-pagination__nav"
                      onClick={() => setProductPage((p) => Math.min(productTotalPages, p + 1))}
                      disabled={productSafePage === productTotalPages}
                      aria-label="Halaman berikutnya"
                    >
                      <ChevronRight size={16} />
                    </button>
                  </nav>
                )}
              </div>
            )}

            {/* Tags - Premium Feature Check */}
            {business.premium_features?.tags_keywords ? (
              <div className="bd-tags">
                <h3 className="bd-tags__title">Tags</h3>
                <div className="bd-tags__list">
                  {Array.isArray(business.tags) && business.tags.map((tag) => (
                    <span key={tag} className="bd-tag">{tag}</span>
                  ))}
                </div>
              </div>
            ) : (Array.isArray(business.tags) && business.tags.length > 0) && (
              <div className="bd-tags">
                <h3 className="bd-tags__title">
                  Tags
                  <span className="bd-premium-badge">Premium</span>
                </h3>
                <div className="bd-premium-restriction">
                  <div className="bd-locked-overlay">
                    <div className="bd-locked-icon">🔒</div>
                    <span>Fitur Tags hanya tersedia untuk pengguna Premium</span>
                    <button className="bd-premium-upgrade-btn" onClick={handlePremiumUpgrade}>
                      Upgrade ke Premium
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* ========== ULASAN ========== */}
            <div className="bd-reviews-section">
              <div className="bd-gallery-section__title-row" style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                <h2 className="bd-gallery-section__title">Peringkat dan Ulasan</h2>
                {(!authUser || String(authUser.id) !== String(seller.id)) && (
                  <button type="button" className="bd-review-write-btn" onClick={() => { setReviewError(""); setShowReviewModal(true); }}>
                    <Star size={16} />
                    Beri Ulasan
                  </button>
                )}
              </div>

              {business.reviewList?.length > 0 && (
                <div className="bd-reviews-summary">
                  <div className="bd-reviews-summary__score">
                    <span className="bd-reviews-summary__number">{business.rating.toFixed(1).replace(".", ",")}</span>
                    <div className="bd-reviews-summary__stars">
                      {[1, 2, 3, 4, 5].map((n) => (
                        <Star key={n} size={14} fill={n <= Math.round(business.rating) ? "#f59e0b" : "none"} stroke="#f59e0b" />
                      ))}
                    </div>
                    <span className="bd-reviews-summary__count">{business.reviewList.length} PERINGKAT</span>
                  </div>
                  <div className="bd-reviews-summary__bars">
                    {[5, 4, 3, 2, 1].map((star) => {
                      const count = business.reviewList.filter((r) => r.rating === star).length;
                      const pct = business.reviewList.length ? (count / business.reviewList.length) * 100 : 0;
                      return (
                        <div className="bd-reviews-summary__bar-row" key={star}>
                          <span className="bd-reviews-summary__bar-label">{star}<Star size={11} fill="#f59e0b" stroke="#f59e0b" /></span>
                          <div className="bd-reviews-summary__bar-track">
                            <div className="bd-reviews-summary__bar-fill" style={{ width: `${pct}%` }} />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {business.reviewList?.length > 0 ? (
                <div className="bd-reviews-list">
                  {(showAllReviews ? business.reviewList : business.reviewList.slice(0, 3)).map((review) => (
                    <div key={review.id} className="bd-review-item">
                      <div className="bd-review-item__header">
                        <img
                          src={review.user_avatar || "https://ui-avatars.com/api/?name=" + encodeURIComponent(review.user_name || "U")}
                          alt={review.user_name}
                          className="bd-review-item__avatar"
                        />
                        <div className="bd-review-item__info">
                          <strong className="bd-review-item__name">{review.user_name}</strong>
                          <div className="bd-review-item__meta">
                            <div className="bd-review-item__stars">
                              {[1, 2, 3, 4, 5].map((n) => (
                                <Star key={n} size={13} fill={n <= review.rating ? "#f59e0b" : "none"} stroke="#f59e0b" />
                              ))}
                            </div>
                            <span className="bd-review-item__date">{formatRelativeTime(review.created_at)}</span>
                          </div>
                        </div>
                      </div>
                      <p className="bd-review-item__comment">{review.comment}</p>
                      <button
                        type="button"
                        className={`bd-review-item__helpful ${helpfulVoted[review.id] ? "is-active" : ""}`}
                        onClick={() => handleToggleHelpful(review.id)}
                      >
                        <ThumbsUp size={14} />
                        <span>{review.helpful_count > 0 ? review.helpful_count : ""}</span>
                      </button>
                    </div>
                  ))}

                  {/* Kalau ulasan lebih dari 3, jangan langsung tampilkan semua -
                      kasih tombol "Lihat Semua" seperti di Google Play Store. */}
                  {!showAllReviews && business.reviewList.length > 3 && (
                    <button
                      type="button"
                      className="bd-reviews-see-all-btn"
                      onClick={() => setShowAllReviews(true)}
                    >
                      Lihat Semua Ulasan ({business.reviewList.length})
                    </button>
                  )}
                </div>
              ) : (
                <div className="bd-products-empty">
                  <p>Belum ada ulasan. Jadilah yang pertama memberikan ulasan untuk bisnis ini.</p>
                </div>
              )}
            </div>
          </div>

          {/* ========== SIDEBAR ========== */}
          <div className="bd-content__sidebar">
            {/* Hours */}
            <div className="bd-hours-card">
              <button type="button" className="bd-hours-card__toggle" onClick={() => setShowWeeklyHours(!showWeeklyHours)} aria-expanded={showWeeklyHours}>
                <h3 className="bd-hours-card__title">Jam Buka</h3>
                <ChevronDown size={18} className={`bd-hours-card__caret${showWeeklyHours ? " open" : ""}`} />
              </button>
              <div className="bd-hours-card__content">
                <Clock size={20} className="bd-hours-card__icon" />
                <span className={`bd-hours-card__time ${isOpenNow ? "is-open" : "is-closed"}`}>
                  {displayStatus} &middot; {business.hours}
                </span>
              </div>
              <div className={`bd-hours-card__week-wrap${showWeeklyHours ? " open" : ""}`}>
                <ul className="bd-hours-card__week">
                  {weeklySchedule.map((d) => (
                    <li key={d.day} className={`bd-hours-card__week-row${d.isToday ? " today" : ""}${d.closed ? " closed" : ""}`}>
                      <span className="bd-hours-card__week-day">{d.day}{d.isToday && <span className="bd-hours-card__today-badge">Hari ini</span>}</span>
                      <span className="bd-hours-card__week-time">{d.hours}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Lokasi & Alamat */}
            <div className="bd-location-card">
              <h3 className="bd-location-card__title">Lokasi &amp; Alamat</h3>
              <div className="bd-location-card__map" style={{ padding: 0, overflow: "hidden" }}>
                <iframe
                  title={`Peta lokasi ${business.name}`}
                  src={`https://www.google.com/maps?q=${encodeURIComponent(business.address)}&z=16&output=embed`}
                  width="100%" height="220"
                  style={{ border: 0, display: "block" }}
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                />
              </div>
              <p className="bd-address-card__text" style={{ marginTop: 10 }}>
                <MapPin size={16} style={{ verticalAlign: "text-bottom", marginRight: 6, color: "#007570" }} />
                {business.address}
              </p>
              <div className="bd-address-card__actions">
                <button type="button" className="bd-address-action" onClick={handleDirections} aria-label="Dapatkan Arah"><Send size={22} strokeWidth={1.8} /></button>
                <button type="button" className="bd-address-action" onClick={handleWhatsApp} aria-label="WhatsApp"><MessageCircle size={22} strokeWidth={1.8} /></button>
              </div>
              <button type="button" className="bd-location-card__directions-link" onClick={handleDirections} style={{ marginTop: 10, width: "100%", textAlign: "center", background: "none", border: "none", color: "#007570", fontWeight: 600, cursor: "pointer", padding: "6px 0" }}>
                Buka di Google Maps &rarr;
              </button>
            </div>

            {/* Seller Profile - Premium Contact Features */}
            <div className="bd-seller-card">
              {authUser?.id === seller.id ? (
                <Link to="/dashboard?tab=profile" className="bd-seller-card__profile">
                  <img src={seller.avatar} alt={seller.name} className="bd-seller-card__avatar" />
                  <span className="bd-seller-card__name">{seller.name}</span>
                </Link>
              ) : (
                <Link to={`/seller/${seller.id}`} className="bd-seller-card__profile bd-seller-card__profile--clickable">
                  <img src={seller.avatar} alt={seller.name} className="bd-seller-card__avatar" />
                  <span className="bd-seller-card__name">{seller.name}</span>
                  <ChevronRight size={18} />
                </Link>
              )}
              {seller.bio && <div className="bd-seller-card__bio" dangerouslySetInnerHTML={{ __html: seller.bio }} />}
              
              {/* Contact Buttons - Premium Check */}
              {business.premium_features?.contact_form ? (
                <>
                  <button type="button" className="bd-seller-btn" onClick={handleWhatsApp}>
                    <MessageCircle size={18} /><span>WhatsApp</span>
                  </button>
                  <button type="button" className="bd-seller-btn" onClick={() => { setShowChatModal(true); setChatSuccess(false); setChatError(""); }}>
                    <MessageCircle size={18} /><span>Chat Dengan Penjual</span>
                  </button>
                  <button type="button" className="bd-seller-phone" onClick={() => setShowPhone(!showPhone)}>
                    <Phone size={16} />
                    <span>{showPhone ? (seller.phone || business.phone) : `${maskPhone()}Tampilkan nomor`}</span>
                  </button>
                </>
              ) : (
                <div className="bd-premium-restriction">
                  <div className="bd-locked-overlay bd-locked-overlay--compact">
                    <div className="bd-locked-icon">🔒</div>
                    <span>Fitur kontak lengkap hanya tersedia untuk bisnis Premium</span>
                    <button className="bd-premium-upgrade-btn bd-premium-upgrade-btn--small" onClick={handlePremiumUpgrade}>
                      Upgrade ke Premium
                    </button>
                  </div>
                </div>
              )}

              {/* Website Link - Premium Feature */}
              {business.premium_features?.website_link && business.website && (
                <a 
                  href={business.website} 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="bd-seller-btn bd-seller-btn--website"
                >
                  <svg width={18} height={18} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <circle cx="12" cy="12" r="10"></circle>
                    <line x1="2" y1="12" x2="22" y2="12"></line>
                    <path d="m12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"></path>
                  </svg>
                  <span>Kunjungi Website</span>
                </a>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Booking Modal */}
      {/* ========== CHAT DENGAN PENJUAL MODAL ========== */}
      {/* BARU: sebelumnya tombol ini cuma membuka WhatsApp (sama seperti
          tombol WhatsApp di sebelahnya) - sekarang benar-benar mengirim
          pesan lewat sistem chat internal (endpoint /messages), yang
          langsung masuk ke tab Inbox pemilik bisnis dan bisa dibalas dari
          sana seperti chat WhatsApp dua arah. */}
      {showChatModal && (
        <div className="login-modal-overlay" onClick={() => setShowChatModal(false)}>
          <div className="login-modal" style={{ maxWidth: 440 }} onClick={(e) => e.stopPropagation()}>
            <div className="login-modal__header">
              <div>
                <h2 className="login-modal__title">Chat Dengan {seller.name}</h2>
                <p className="login-modal__subtitle">Pesan Anda akan masuk ke Inbox penjual dan bisa dibalas langsung dari sini.</p>
              </div>
              <button className="login-modal__close" onClick={() => setShowChatModal(false)} aria-label="Tutup"><X size={24} /></button>
            </div>
            <div className="login-modal__divider" />
            {chatSuccess ? (
              <div className="login-modal__body">
                <p style={{ textAlign: "center", padding: "20px 0" }}>✅ Pesan terkirim! Penjual akan membalas lewat Inbox {authUser ? "Anda" : "(cek lewat kontak yang Anda cantumkan)"}.</p>
                <button type="button" className="login-register-btn" onClick={() => setShowChatModal(false)}>Tutup</button>
              </div>
            ) : (
              <form className="login-modal__body" onSubmit={handleChatSubmit} noValidate>
                {chatError && <div className="login-error"><span>{chatError}</span></div>}
                <input type="text" className="login-input" placeholder="Nama Anda" value={chatName} onChange={(e) => setChatName(e.target.value)} />
                <input type="text" className="login-input" placeholder="No. HP / Email (opsional)" value={chatContact} onChange={(e) => setChatContact(e.target.value)} />
                <textarea className="login-input" placeholder="Tulis pesan Anda..." rows={4} value={chatMessage} onChange={(e) => setChatMessage(e.target.value)} />
                <button type="submit" className="login-register-btn" disabled={chatSubmitting}>{chatSubmitting ? "Mengirim..." : "Kirim Pesan"}</button>
              </form>
            )}
          </div>
        </div>
      )}

      {showBookingModal && (
        <div className="login-modal-overlay" onClick={() => setShowBookingModal(false)}>
          <div className="login-modal" style={{ maxWidth: 440 }} onClick={(e) => e.stopPropagation()}>
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

      {/* ========== REVIEW MODAL ========== */}
      {showReviewModal && (
        <div className="login-modal-overlay" onClick={() => setShowReviewModal(false)}>
          <div className="login-modal" style={{ maxWidth: 440 }} onClick={(e) => e.stopPropagation()}>
            <div className="login-modal__header">
              <div>
                <h2 className="login-modal__title">Beri Ulasan untuk {business.name}</h2>
                <p className="login-modal__subtitle">Bagikan pengalaman Anda dengan bisnis ini.</p>
              </div>
              <button className="login-modal__close" onClick={() => setShowReviewModal(false)} aria-label="Tutup"><X size={24} /></button>
            </div>
            <div className="login-modal__divider" />
            <form className="login-modal__body" onSubmit={handleSubmitReview} noValidate>
              {reviewError && <div className="login-error"><span>{reviewError}</span></div>}
              <div className="bd-review-form__stars">
                {[1, 2, 3, 4, 5].map((n) => (
                  <Star key={n} size={28} fill={n <= reviewRating ? "#fbbf24" : "none"} stroke="#fbbf24" style={{ cursor: "pointer" }} onClick={() => setReviewRating(n)} />
                ))}
              </div>
              <textarea className="login-input" placeholder="Ceritakan pengalaman Anda dengan bisnis ini..." rows={4} value={reviewComment} onChange={(e) => setReviewComment(e.target.value)} required minLength={5} />
              <button type="submit" className="login-register-btn" disabled={submittingReview}>
                {submittingReview ? "Mengirim..." : "Kirim Ulasan"}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* ========== REPORT MODAL ========== */}
      {showReportModal && (
        <div className="login-modal-overlay" onClick={closeReportModal}>
          <div className="login-modal" style={{ maxWidth: 440 }} onClick={(e) => e.stopPropagation()}>
            <div className="login-modal__header">
              <div>
                <h2 className="login-modal__title">Laporkan {business.name}</h2>
                <p className="login-modal__subtitle">Beri tahu kami jika ada kesalahan atau pelanggaran pada bisnis ini.</p>
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

      {/* Gallery Lightbox Modal */}
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

      {/* Product Detail Modal */}
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

      {/* Profile Modal */}
      {showProfileModal && (
        <div className="login-modal-overlay" onClick={() => setShowProfileModal(false)}>
          <div className="login-modal" style={{ maxWidth: 540 }} onClick={(e) => e.stopPropagation()}>
            <div className="login-modal__header">
              <div>
                <h2 className="login-modal__title">Profil {seller.name}</h2>
                <p className="login-modal__subtitle">Informasi penjual dan bisnis yang dimiliki</p>
              </div>
              <button className="login-modal__close" onClick={() => setShowProfileModal(false)} aria-label="Tutup"><X size={24} /></button>
            </div>
            <div className="login-modal__divider" />
            <div className="login-modal__body" style={{ gap: '1.5rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                <img src={seller.avatar} alt={seller.name} style={{ width: 64, height: 64, borderRadius: '50%', objectFit: 'cover' }} />
                <div>
                  <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 700 }}>{seller.name}</h3>
                  {seller.phone && <p style={{ margin: '0.25rem 0 0', color: '#64748b', fontSize: '0.9rem' }}><Phone size={14} style={{ marginRight: 6, verticalAlign: 'middle' }} />{seller.phone}</p>}
                </div>
              </div>
              {seller.bio && <div style={{ padding: '0.75rem', background: '#f8fafc', borderRadius: '8px', fontSize: '0.9rem', color: '#475569' }}>{seller.bio}</div>}
              <div>
                <h4 style={{ margin: '0 0 0.75rem', fontSize: '0.95rem', fontWeight: 700, color: '#0f172a' }}>Bisnis yang Dimiliki ({profileBusinesses.length})</h4>
                {profileBusinesses.length > 0 ? (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                    {profileBusinesses.map((biz) => (
                      <Link key={biz.id} to={`/business/${biz.id}`} style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.75rem', background: '#fff', border: '1px solid #e2e8f0', borderRadius: '8px', textDecoration: 'none', transition: 'all 0.2s' }}
                        onMouseEnter={(e) => { e.currentTarget.style.borderColor = '#007570'; e.currentTarget.style.background = '#f0fdfa'; }}
                        onMouseLeave={(e) => { e.currentTarget.style.borderColor = '#e2e8f0'; e.currentTarget.style.background = '#fff'; }}>
                        <img src={biz.image ? getImageUrl(biz.image) : 'https://images.unsplash.com/photo-1560066984-138dadb4c035?w=80&h=80&fit=crop'} alt={biz.title} style={{ width: 48, height: 48, borderRadius: '6px', objectFit: 'cover' }} />
                        <div style={{ flex: 1 }}>
                          <h5 style={{ margin: 0, fontSize: '0.9rem', fontWeight: 600, color: '#0f172a' }}>{biz.title}</h5>
                          <p style={{ margin: '0.15rem 0 0', fontSize: '0.8rem', color: '#64748b' }}>{biz.category?.name || 'Lainnya'}</p>
                        </div>
                        <ChevronRight size={18} style={{ color: '#94a3b8' }} />
                      </Link>
                    ))}
                  </div>
                ) : (
                  <p style={{ color: '#94a3b8', fontSize: '0.9rem', textAlign: 'center', padding: '1rem' }}>Belum ada bisnis lain</p>
                )}
              </div>
              <button type="button" className="login-register-btn" onClick={() => setShowProfileModal(false)} style={{ marginTop: '0.5rem' }}>Tutup</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}