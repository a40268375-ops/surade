import { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import {
  Package,
  Star,
  MapPin,
  MessageCircle,
  Share2,
  ArrowLeft,
  CheckCircle2,
  ShieldCheck,
  Truck,
  Shield,
  Sparkles,
  ChevronRight,
  Store,
  ExternalLink,
  Copy,
  Check,
  Loader2,
  Phone,
  Tag,
  AlertCircle
} from "lucide-react";
import toast from "react-hot-toast";
import api from "../services/api";
import { getStorageUrl } from "../utils/constants";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import FloatingWhatsApp from "../components/FloatingWhatsApp";
import SuradeLoader from "../components/SuradeLoader";
import WhatsAppAccessModal from "../components/WhatsAppAccessModal";
import WhatsAppIcon from "../components/icons/WhatsAppIcon";

function formatRelativeDate(dateStr) {
  if (!dateStr) return "";
  try {
    const d = new Date(dateStr);
    const now = new Date();
    const diffMs = now - d;
    const diffSecs = Math.floor(diffMs / 1000);
    const diffMins = Math.floor(diffSecs / 60);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);
    const diffWeeks = Math.floor(diffDays / 7);
    const diffMonths = Math.floor(diffDays / 30);

    if (diffMonths > 0) return `${diffMonths} bulan lalu`;
    if (diffWeeks > 0) return `${diffWeeks} minggu lalu`;
    if (diffDays > 0) return `${diffDays} hari lalu`;
    if (diffHours > 0) return `${diffHours} jam lalu`;
    if (diffMins > 0) return `${diffMins} menit lalu`;
    return "Baru saja";
  } catch (e) {
    return dateStr;
  }
}

export default function ProductDetail() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [product, setProduct] = useState(null);
  const [business, setBusiness] = useState(null);
  const [otherProducts, setOtherProducts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeImage, setActiveImage] = useState(null);
  const [copiedLink, setCopiedLink] = useState(false);
  const [startingChat, setStartingChat] = useState(false);

  useEffect(() => {
    window.scrollTo(0, 0);
    loadProductDetail();
  }, [id]);

  const loadProductDetail = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await api.get(`/products/${id}`);
      const prodData = res.data.product;
      setProduct(prodData);
      setBusiness(prodData.business || null);
      setOtherProducts(res.data.other_products || []);
      setActiveImage(prodData.image ? getStorageUrl(prodData.image) : null);
    } catch (err) {
      console.error("Gagal memuat produk:", err);
      setError("Produk tidak ditemukan atau belum disetujui.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopiedLink(true);
    toast.success("Tautan produk berhasil disalin!");
    setTimeout(() => setCopiedLink(false), 2500);
  };

  const handleShare = async () => {
    const shareUrl = window.location.href;
    const shareData = {
      title: product?.name || "Produk Surade.com",
      text: `Lihat ${product?.name} di ${business?.name || "Surade.com"}!`,
      url: shareUrl,
    };

    if (navigator.share) {
      try {
        await navigator.share(shareData);
      } catch (e) {}
    } else {
      handleCopyLink();
    }
  };

  const [showWaPaymentModal, setShowWaPaymentModal] = useState(false);
  const [waSettings, setWaSettings] = useState(null);

  const openWhatsAppDirect = () => {
    const token = localStorage.getItem("token");
    if (!token) {
      toast.error("Silakan login terlebih dahulu untuk mengakses WhatsApp.");
      navigate("/login", { state: { from: window.location.pathname } });
      return;
    }

    const rawPhone = business?.whatsapp || business?.phone;
    if (!rawPhone) {
      toast.error("Nomor WhatsApp belum tersedia untuk penjual ini.");
      return;
    }

    const cleanPhone = String(rawPhone).replace(/\D/g, "");
    const formattedPhone = cleanPhone.startsWith("0") ? "62" + cleanPhone.slice(1) : cleanPhone;

    const formattedPrice = product.price != null
      ? new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", maximumFractionDigits: 0 }).format(Number(product.price))
      : "Harga Hubungi Penjual";

    const message = `Halo Admin *${business.name}*,\n\nSaya melihat produk Anda di *Surade.com*:\n📦 *Produk:* ${product.name}\n💰 *Harga:* ${formattedPrice}\n🔗 *Link:* ${window.location.href}\n\nApakah produk ini masih tersedia? Mohon info cara pemesanan / pengirimannya. Terima kasih!`;

    // Catat log akses WhatsApp tersambung dengan usaha pemilik produk
    if (business?.id) {
      api.post("/whatsapp-click", { business_id: business.id }).catch(() => {});
    }

    window.open(`https://wa.me/${formattedPhone}?text=${encodeURIComponent(message)}`, "_blank");
  };

  const handleWhatsAppBuy = async () => {
    const token = localStorage.getItem("token");
    const userStored = localStorage.getItem("user");
    let currentUser = null;
    try {
      if (userStored) currentUser = JSON.parse(userStored);
    } catch (e) {}

    // Wajib login terlebih dahulu untuk mengakses fitur WhatsApp
    if (!currentUser || !token) {
      toast.error("Silakan login terlebih dahulu untuk mengakses WhatsApp penjual.");
      navigate("/login", { state: { from: window.location.pathname } });
      return;
    }

    // Pemilik Usaha dan Admin langsung dapat akses WhatsApp tanpa biaya
    if (isOwner || isAdmin) {
      openWhatsAppDirect();
      return;
    }

    try {
      // Cek apakah akses WhatsApp usaha ini sudah terbuka sebelumnya (lewat poin atau pembayaran)
      if (business?.id) {
        try {
          const statusRes = await api.get(`/whatsapp-access-status?business_id=${business.id}`);
          if (statusRes?.data?.data?.has_access) {
            openWhatsAppDirect();
            return;
          }
        } catch (e) {}
      }

      const res = await api.get("/whatsapp-settings");
      const data = res.data?.data;
      if (data?.enabled && data?.amount > 0) {
        setWaSettings(data);
        setShowWaPaymentModal(true);
      } else {
        openWhatsAppDirect();
      }
    } catch (err) {
      openWhatsAppDirect();
    }
  };

  const handleChatSeller = async () => {
    const userStored = localStorage.getItem("user");
    if (!userStored) {
      toast.error("Silakan login terlebih dahulu untuk mengirim pesan ke penjual.", {
        duration: 4000,
        style: { borderRadius: "12px", background: "#0f172a", color: "#fff" }
      });
      navigate(`/login?redirect=/product/${id}`);
      return;
    }

    let currentUser = null;
    try {
      currentUser = JSON.parse(userStored);
    } catch (e) {}

    if (business && business.user_id && currentUser?.id === business.user_id) {
      toast("Anda adalah pemilik usaha ini.", { icon: "ℹ️" });
      return;
    }

    setStartingChat(true);
    try {
      const res = await api.post(`/businesses/${business.id}/conversation`);
      if (res.data && (res.data.conversation_id || res.data.id)) {
        const convId = res.data.conversation_id || res.data.id;
        navigate(`/dashboard?tab=inbox&conversation=${convId}`);
      } else {
        toast.error(res.data?.message || "Gagal membuka obrolan.");
      }
    } catch (err) {
      console.error("Failed to start chat:", err);
      toast.error("Terjadi kendala saat membuka obrolan.");
    } finally {
      setStartingChat(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col pt-[68px]">
        <Navbar />
        <div className="flex-1 flex flex-col items-center justify-center py-16 px-4">
          <SuradeLoader
            variant="section"
            text="Memuat rincian produk..."
            subtext="Mengambil spesifikasi, foto galeri, dan kontak penjual resmi"
            showBrand
          />
        </div>
        <Footer />
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col pt-[68px]">
        <Navbar />
        <div className="flex-1 flex flex-col items-center justify-center py-20 px-4 text-center">
          <div className="w-16 h-16 rounded-2xl bg-amber-50 border border-amber-200 flex items-center justify-center text-amber-600 mb-4 shadow-xs">
            <AlertCircle size={32} />
          </div>
          <h2 className="text-xl font-bold text-slate-800 mb-2">Produk Tidak Ditemukan</h2>
          <p className="text-sm text-slate-500 max-w-md mb-6">{error || "Produk yang Anda cari mungkin telah dinonaktifkan atau dihapus."}</p>
          <Link
            to="/category"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#007570] hover:bg-[#005a58] text-white font-bold text-sm transition-all shadow-xs"
          >
            <ArrowLeft size={16} />
            <span>Jelajahi Usaha &amp; Produk Lain</span>
          </Link>
        </div>
        <Footer />
      </div>
    );
  }

  const formattedPrice = product.price != null
    ? new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", maximumFractionDigits: 0 }).format(Number(product.price))
    : "Hubungi Penjual";

  const fallbackProductImage = "/images/businesses/retail_sembako.jpg";
  const mainImgUrl = product.image ? getStorageUrl(product.image) : fallbackProductImage;

  // Siapkan galeri thumbnail jika tersedia foto tambahan dari usaha
  const galleryList = Array.isArray(business?.gallery) && business.gallery.length > 1
    ? [mainImgUrl, ...business.gallery.map((g) => getStorageUrl(g)).filter((u) => u !== mainImgUrl)]
    : [];

  return (
    <div className="min-h-screen bg-[#f0f4f8] flex flex-col text-slate-800 antialiased font-sans pt-[68px]">
      <Navbar />

      {/* Breadcrumbs Banner - slim */}
      <div className="bg-white border-b border-slate-200/80 shadow-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-2.5 flex items-center justify-between text-xs text-slate-500 overflow-x-auto gap-4">
          <div className="flex items-center gap-1 shrink-0 flex-wrap">
            <button onClick={() => navigate(-1)} className="inline-flex items-center gap-1 text-slate-600 hover:text-[#007570] font-semibold transition-colors mr-1">
              <ArrowLeft size={13} />
              <span>Kembali</span>
            </button>
            <span className="text-slate-300">|</span>
            <Link to="/" className="hover:text-[#007570] transition-colors font-medium">Beranda</Link>
            <ChevronRight size={12} className="text-slate-300" />
            {business ? (
              <>
                <Link to={`/business/${business.id}`} className="hover:text-[#007570] transition-colors font-semibold text-slate-600 truncate max-w-[120px] sm:max-w-xs">
                  {business.name}
                </Link>
                <ChevronRight size={12} className="text-slate-300" />
              </>
            ) : null}
            <span className="text-[#007570] font-bold truncate max-w-[140px] sm:max-w-sm">{product.name}</span>
          </div>
          <Link
            to={business ? `/business/${business.id}/products` : "/category"}
            className="shrink-0 text-[#007570] font-bold flex items-center gap-0.5 hover:underline"
          >
            <span>Lihat Semua Produk</span>
            <ChevronRight size={13} />
          </Link>
        </div>
      </div>

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* 2-column sticky layout on desktop */}
        <div className="flex flex-col lg:flex-row gap-6 items-start">
          
          {/* ── KOLOM KIRI: Foto & Info Toko ── */}
          <div className="w-full lg:w-80 xl:w-96 shrink-0 space-y-4">
            {/* Main Image Card */}
            <div className="bg-white rounded-2xl border border-slate-200/90 shadow-sm overflow-hidden">
              <div className="relative group">
                <img
                  src={activeImage || mainImgUrl}
                  alt={product.name}
                  className="w-full aspect-square object-cover group-hover:scale-[1.03] transition-transform duration-400"
                  onError={(e) => {
                    e.target.onerror = null;
                    e.target.src = fallbackProductImage;
                  }}
                />
                <div className="absolute top-3 left-3 bg-[#007570] text-white text-[11px] font-bold px-2.5 py-1 rounded-full shadow-md flex items-center gap-1 uppercase tracking-wider">
                  <Sparkles size={11} />
                  <span>Produk Usaha</span>
                </div>
              </div>

              {/* Thumbnail row hanya jika memiliki lebih dari 1 foto galeri */}
              {galleryList.length > 1 && (
                <div className="flex items-center gap-2 p-3 overflow-x-auto border-t border-slate-100">
                  {galleryList.map((imgUrl, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => setActiveImage(imgUrl)}
                      className={`w-14 h-14 rounded-xl overflow-hidden border-2 shrink-0 cursor-pointer transition-all ${
                        (activeImage || mainImgUrl) === imgUrl ? "border-[#007570] ring-2 ring-[#007570]/20" : "border-slate-200 hover:border-slate-300"
                      }`}
                    >
                      <img
                        src={imgUrl}
                        alt={`${product.name} ${idx + 1}`}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          e.target.onerror = null;
                          e.target.src = fallbackProductImage;
                        }}
                      />
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Trust Badges */}
            <div className="bg-white rounded-2xl border border-slate-200/90 p-4 shadow-xs">
              <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3">Keamanan Transaksi</h4>
              <div className="space-y-2.5">
                {[
                  { icon: ShieldCheck, text: "Usaha Resmi Terverifikasi Surade", color: "text-emerald-600" },
                  { icon: Truck, text: "Produk & Layanan Lokal Kec. Surade", color: "text-[#007570]" },
                  { icon: MessageCircle, text: "Respon Chat Langsung dengan Pemilik", color: "text-blue-600" },
                ].map((item, i) => (
                  <div key={i} className="flex items-center gap-2.5 text-xs text-slate-700">
                    <item.icon size={15} className={`${item.color} shrink-0`} />
                    <span className="font-medium">{item.text}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* ── KOLOM KANAN: Info Produk (scrollable) ── */}
          <div className="flex-1 min-w-0 space-y-4">
            {/* Main Product Info Card */}
            <div className="bg-white rounded-2xl border border-slate-200/90 shadow-sm p-5 sm:p-6 space-y-4">
              {/* Category + Title */}
              <div>
                {business?.category && (
                  <span className="inline-flex items-center gap-1 text-xs font-bold text-[#007570] bg-teal-50 px-2.5 py-0.5 rounded-md mb-2 border border-teal-200/60">
                    <Tag size={12} />
                    {typeof business.category === "object" ? business.category.name : business.category}
                  </span>
                )}
                <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight leading-snug">
                  {product.name}
                </h1>
              </div>

              {/* Status & Location row */}
              <div className="flex flex-wrap items-center gap-2 text-xs">
                <div className="flex items-center gap-1 text-slate-500 font-medium">
                  <MapPin size={13} className="text-[#007570]" />
                  <span>
                    {business?.village
                      ? (business.village.toLowerCase().startsWith("desa") || business.village.toLowerCase().startsWith("kelurahan")
                          ? `${business.village}, Surade`
                          : `Desa ${business.village}, Surade`)
                      : "Kecamatan Surade"}
                  </span>
                </div>
                <div className="flex items-center gap-1 text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-lg font-bold border border-emerald-200/60">
                  <CheckCircle2 size={12} />
                  <span>Layanan Aktif</span>
                </div>
              </div>

              {/* Price box */}
              <div className="bg-gradient-to-r from-teal-50 to-slate-50 p-4 rounded-2xl border border-teal-100">
                <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1">Harga Produk / Layanan:</div>
                <div className="text-3xl sm:text-4xl font-black text-[#007570] tracking-tight">{formattedPrice}</div>
                <p className="text-xs text-slate-500 mt-1.5 flex items-center gap-1">
                  <Shield size={12} className="text-emerald-600" />
                  <span>Transaksi aman langsung dengan pemilik usaha lokal terverifikasi.</span>
                </p>
              </div>

              {/* Specs */}
              <div className="text-sm text-slate-600 divide-y divide-slate-100">
                <div className="flex items-center justify-between py-2">
                  <span className="text-slate-400 font-medium text-xs">Penjual / Toko</span>
                  <span className="font-bold text-slate-900 flex items-center gap-1 text-sm">
                    {business?.name}
                    {business?.is_verified && <CheckCircle2 size={13} className="text-[#007570]" />}
                  </span>
                </div>
                <div className="flex items-center justify-between py-2">
                  <span className="text-slate-400 font-medium text-xs">Wilayah</span>
                  <span className="font-semibold text-slate-700 text-sm">Surade, Kab. Sukabumi</span>
                </div>
                <div className="flex items-center justify-between py-2">
                  <span className="text-slate-400 font-medium text-xs">Metode Pemesanan</span>
                  <span className="font-semibold text-slate-700 text-sm text-right max-w-[180px] leading-tight">WhatsApp / Chat Website / Datang Langsung</span>
                </div>
              </div>

              {/* CTA Buttons */}
              <div className="space-y-2.5 pt-1">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  <button
                    type="button"
                    onClick={handleWhatsAppBuy}
                    className="w-full inline-flex items-center justify-center gap-2.5 px-5 py-3.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 active:scale-[0.99] text-white font-black text-sm shadow-md shadow-emerald-600/20 transition-all cursor-pointer border-0"
                  >
                    <WhatsAppIcon size={20} className="shrink-0 text-white" />
                    <span>Chat via WhatsApp</span>
                  </button>

                  <button
                    type="button"
                    onClick={handleChatSeller}
                    disabled={startingChat}
                    className="w-full inline-flex items-center justify-center gap-2 px-5 py-3.5 rounded-xl bg-teal-50 hover:bg-teal-100 active:scale-[0.99] text-[#007570] border border-teal-300 font-bold text-sm transition-all cursor-pointer disabled:opacity-50"
                  >
                    {startingChat ? <Loader2 size={17} className="animate-spin" /> : <MessageCircle size={17} />}
                    <span>Chat Penjual</span>
                  </button>
                </div>

                {/* Share & Visit Store */}
                <div className="flex items-center justify-between pt-1">
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={handleShare}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold transition-all cursor-pointer"
                    >
                      <Share2 size={13} />
                      <span>Bagikan</span>
                    </button>
                    <button
                      type="button"
                      onClick={handleCopyLink}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold transition-all cursor-pointer"
                    >
                      {copiedLink ? <Check size={13} className="text-emerald-600" /> : <Copy size={13} />}
                      <span>{copiedLink ? "Disalin!" : "Salin Link"}</span>
                    </button>
                  </div>
                  {business && (
                    <Link
                      to={`/business/${business.id}`}
                      className="inline-flex items-center gap-1 text-xs font-bold text-[#007570] hover:underline"
                    >
                      <span>Kunjungi Toko</span>
                      <ChevronRight size={13} />
                    </Link>
                  )}
                </div>
              </div>
            </div>

            {/* MERCHANT CARD (Profil Penjual / Toko) */}
            {business && (
          <div className="bg-white rounded-2xl border border-slate-200/90 p-5 sm:p-6 shadow-2xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl overflow-hidden bg-slate-100 border border-slate-200 shrink-0 shadow-2xs">
                <img
                  src={business.logo ? getStorageUrl(business.logo) : `https://picsum.photos/seed/${encodeURIComponent(business.name)}/150/150`}
                  alt={business.name}
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <h3 className="text-base sm:text-lg font-bold text-slate-900">{business.name}</h3>
                  {business.is_verified && (
                    <span className="inline-flex items-center gap-1 bg-teal-50 text-[#007570] text-[11px] font-bold px-2 py-0.5 rounded-full border border-teal-200">
                      <CheckCircle2 size={12} />
                      Terverifikasi
                    </span>
                  )}
                </div>
                <p className="text-xs text-slate-500 flex items-center gap-1.5">
                  <MapPin size={13} className="text-slate-400" />
                  <span>{business.address || `Kecamatan Surade, Kab. Sukabumi`}</span>
                </p>
                {business.rating != null && (
                  <div className="flex items-center gap-1 text-xs text-amber-700 font-semibold">
                    <Star size={13} className="fill-amber-400 text-amber-400" />
                    <span>Rating Toko: {Number(business.rating).toFixed(1)} / 5.0 ({business.reviews_count ?? (business.reviews?.length || 0)} ulasan)</span>
                  </div>
                )}
              </div>
            </div>

            <div className="flex items-center gap-2.5 w-full sm:w-auto shrink-0">
              <Link
                to={`/business/${business.id}`}
                className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-1.5 px-4 py-2 rounded-xl bg-white hover:bg-slate-50 text-slate-700 border border-slate-300 font-bold text-xs sm:text-sm transition-all"
              >
                <Store size={15} />
                <span>Lihat Toko</span>
              </Link>
              <button
                type="button"
                onClick={handleChatSeller}
                className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-1.5 px-4 py-2 rounded-xl bg-[#007570] hover:bg-[#005a58] text-white font-bold text-xs sm:text-sm transition-all shadow-2xs border-0 cursor-pointer"
              >
                <MessageCircle size={15} />
                <span>Chat</span>
              </button>
            </div>
          </div>
            )}

            {/* BOTTOM CARD: Deskripsi Lengkap Produk */}
            <div className="bg-white rounded-2xl border border-slate-200/90 p-6 sm:p-8 shadow-2xs space-y-4">
          <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
            <span className="w-1 h-5 rounded-full bg-[#007570]" />
            <h2 className="text-lg font-bold text-slate-900">Deskripsi Lengkap Produk &amp; Layanan</h2>
          </div>

              <div className="prose prose-sm max-w-none text-slate-700 leading-relaxed whitespace-pre-line">
                {product.description || "Belum ada rincian deskripsi tambahan untuk produk ini. Hubungi pemilik usaha langsung via WhatsApp atau Chat untuk detail pemesanan dan spesifikasi."}
              </div>
            </div>

            {/* OTHER PRODUCTS FROM THIS STORE ("Produk Lain dari Toko Ini") */}
            {otherProducts.length > 0 && (
              <div className="bg-white rounded-2xl border border-slate-200/90 p-6 sm:p-8 shadow-2xs space-y-5">
                <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                  <div className="flex items-center gap-2">
                    <span className="w-1 h-5 rounded-full bg-emerald-600" />
                    <h2 className="text-lg font-bold text-slate-900">Produk Lain dari {business?.name}</h2>
                  </div>
                  {business && (
                    <Link
                      to={`/business/${business.id}/products`}
                      className="text-xs font-bold text-[#007570] hover:underline flex items-center gap-1"
                    >
                      <span>Lihat Semua Produk</span>
                      <ChevronRight size={14} />
                    </Link>
                  )}
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                {otherProducts.map((p) => {
                  const itemImg = p.image ? getStorageUrl(p.image) : `https://picsum.photos/seed/${encodeURIComponent(p.name)}/300/300`;
                  const itemPrice = p.price != null
                    ? new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", maximumFractionDigits: 0 }).format(Number(p.price))
                    : "Hubungi Penjual";

                  return (
                    <Link
                      key={p.id}
                      to={`/product/${p.id}`}
                      className="group bg-slate-50/70 hover:bg-white rounded-xl border border-slate-200/80 hover:border-teal-300 hover:shadow-md transition-all overflow-hidden flex flex-col justify-between"
                    >
                      <div className="aspect-square w-full overflow-hidden bg-white">
                        <img
                          src={itemImg}
                          alt={p.name}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                          onError={(e) => {
                            e.target.onerror = null;
                            e.target.src = `https://picsum.photos/seed/${encodeURIComponent(p.name)}/300/300`;
                          }}
                        />
                      </div>
                      <div className="p-3 space-y-1">
                        <h4 className="text-xs sm:text-sm font-bold text-slate-800 line-clamp-2 group-hover:text-[#007570] transition-colors">
                          {p.name}
                        </h4>
                        <p className="text-xs font-extrabold text-[#007570]">{itemPrice}</p>
                      </div>
                    </Link>
                  );
                })}
              </div>
              </div>
            )}
          </div>
        </div>
      </main>

      <Footer />
      <FloatingWhatsApp />

      {/* WhatsApp Access Payment Modal */}
      <WhatsAppAccessModal
        isOpen={showWaPaymentModal}
        onClose={() => setShowWaPaymentModal(false)}
        business={business}
        waSettings={waSettings}
        product={product}
        onSuccess={() => {
          openWhatsAppDirect();
        }}
      />
    </div>
  );
}
