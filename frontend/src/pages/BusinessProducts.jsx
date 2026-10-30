import { useState, useEffect, useMemo } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import {
  Package,
  Search,
  SlidersHorizontal,
  Star,
  MapPin,
  MessageCircle,
  ArrowLeft,
  CheckCircle2,
  Sparkles,
  ChevronRight,
  Store,
  Share2,
  Clock,
  Tag,
  AlertCircle,
  Loader2,
  ExternalLink,
  ChevronDown
} from "lucide-react";
import toast from "react-hot-toast";
import api from "../services/api";
import { getStorageUrl, DEFAULT_AVATAR } from "../utils/constants";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import FloatingWhatsApp from "../components/FloatingWhatsApp";
import WhatsAppAccessModal from "../components/WhatsAppAccessModal";
import SuradeLoader from "../components/SuradeLoader";
import WhatsAppIcon from "../components/icons/WhatsAppIcon";

export default function BusinessProducts() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [business, setBusiness] = useState(null);
  const [products, setProducts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState("latest"); // 'latest' | 'price_asc' | 'price_desc' | 'name_asc'
  const [startingChat, setStartingChat] = useState(false);

  useEffect(() => {
    window.scrollTo(0, 0);
    loadData();
  }, [id]);

  const loadData = async () => {
    setIsLoading(true);
    setError(null);
    try {
      // Parallel fetch for speed and zero delay
      const [bizRes, prodRes] = await Promise.all([
        api.get(`/businesses/${id}`),
        api.get(`/businesses/${id}/products`)
      ]);
      const bizData = bizRes.data?.data || bizRes.data;
      setBusiness(bizData);
      const prodData = Array.isArray(prodRes.data) ? prodRes.data : (prodRes.data?.data || []);
      setProducts(prodData);
    } catch (err) {
      console.error("Gagal memuat katalog produk bisnis:", err);
      setError("Profil usaha atau produk tidak ditemukan.");
    } finally {
      setIsLoading(false);
    }
  };

  const [showWaPaymentModal, setShowWaPaymentModal] = useState(false);
  const [waSettings, setWaSettings] = useState(null);
  const [pendingWaProduct, setPendingWaProduct] = useState(null);

  const openWhatsAppDirect = (targetProduct = null) => {
    const token = localStorage.getItem("token");
    if (!token) {
      toast.error("Silakan login terlebih dahulu untuk mengakses WhatsApp.");
      navigate(`/login?redirect=${encodeURIComponent(window.location.pathname)}`);
      return;
    }

    const rawPhone = business?.whatsapp || business?.phone;
    if (!rawPhone) {
      toast.error("Nomor WhatsApp belum tersedia untuk penjual ini.");
      return;
    }
    const cleanPhone = String(rawPhone).replace(/\D/g, "");
    const formattedPhone = cleanPhone.startsWith("0") ? "62" + cleanPhone.slice(1) : cleanPhone;

    // Catat log akses WhatsApp tersambung dengan usaha pemilik produk
    if (business?.id) {
      api.post("/whatsapp-click", { business_id: business.id }).catch(() => {});
    }

    if (targetProduct) {
      const formattedPrice = targetProduct.price != null
        ? new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", maximumFractionDigits: 0 }).format(Number(targetProduct.price))
        : "Hubungi Penjual";
      const prodUrl = `${window.location.origin}/product/${targetProduct.id}`;
      const message = `Halo Admin *${business.name}*,\n\nSaya tertarik dengan produk:\n📦 *${targetProduct.name}*\n💰 *Harga:* ${formattedPrice}\n🔗 *Link:* ${prodUrl}\n\nApakah stok masih tersedia? Mohon info pemesanan. Terima kasih!`;
      window.open(`https://wa.me/${formattedPhone}?text=${encodeURIComponent(message)}`, "_blank");
    } else {
      const message = `Halo Admin *${business.name}*,\n\nSaya melihat katalog produk Anda di *Surade.com* (${window.location.href}). Ingin bertanya informasi produk & cara pemesanannya. Terima kasih!`;
      window.open(`https://wa.me/${formattedPhone}?text=${encodeURIComponent(message)}`, "_blank");
    }
  };

  const handleWhatsAppWithCheck = async (targetProduct = null) => {
    const token = localStorage.getItem("token");
    const userStored = localStorage.getItem("user");
    let currentUser = null;
    try {
      if (userStored) currentUser = JSON.parse(userStored);
    } catch (e) {}

    // Wajib login terlebih dahulu untuk mengakses fitur WhatsApp
    if (!currentUser || !token) {
      toast.error("Silakan login terlebih dahulu untuk mengakses WhatsApp penjual.");
      navigate(`/login?redirect=${encodeURIComponent(window.location.pathname)}`);
      return;
    }

    // Pemilik Usaha dan Admin langsung dapat akses WhatsApp tanpa biaya
    if (isOwner || isAdmin) {
      openWhatsAppDirect(targetProduct);
      return;
    }

    try {
      // Cek apakah akses WhatsApp usaha ini sudah terbuka sebelumnya (lewat poin atau pembayaran)
      if (business?.id) {
        try {
          const statusRes = await api.get(`/whatsapp-access-status?business_id=${business.id}`);
          if (statusRes?.data?.data?.has_access) {
            openWhatsAppDirect(targetProduct);
            return;
          }
        } catch (e) {}
      }

      // Check WhatsApp settings
      const res = await api.get("/whatsapp-settings");
      const data = res.data?.data;
      if (data?.enabled && data?.amount > 0) {
        setWaSettings(data);
        setPendingWaProduct(targetProduct);
        setShowWaPaymentModal(true);
      } else {
        openWhatsAppDirect(targetProduct);
      }
    } catch (err) {
      openWhatsAppDirect(targetProduct);
    }
  };

  const handleWhatsAppBusiness = () => {
    handleWhatsAppWithCheck(null);
  };

  const handleWhatsAppProduct = (e, product) => {
    e.stopPropagation();
    handleWhatsAppWithCheck(product);
  };

  const handleChatSeller = async () => {
    const userStored = localStorage.getItem("user");
    if (!userStored) {
      toast.error("Silakan login terlebih dahulu untuk mengirim pesan ke penjual.", {
        duration: 4000,
        style: { borderRadius: "12px", background: "#0f172a", color: "#fff" }
      });
      navigate(`/login?redirect=/business/${id}/products`);
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

  // Filter and sort products
  const filteredProducts = useMemo(() => {
    let result = [...products];

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(
        (p) =>
          p.name?.toLowerCase().includes(q) ||
          p.description?.toLowerCase().includes(q)
      );
    }

    if (sortBy === "price_asc") {
      result.sort((a, b) => (Number(a.price) || 0) - (Number(b.price) || 0));
    } else if (sortBy === "price_desc") {
      result.sort((a, b) => (Number(b.price) || 0) - (Number(a.price) || 0));
    } else if (sortBy === "name_asc") {
      result.sort((a, b) => (a.name || "").localeCompare(b.name || ""));
    } else {
      // latest (default)
      result.sort((a, b) => new Date(b.created_at || 0) - new Date(a.created_at || 0));
    }

    const isPremium = Boolean(business?.is_premium && (!business?.premium_expires_at || new Date(business.premium_expires_at) > new Date()));
    const maxAllowed = isPremium ? 3 : 2;
    return result.slice(0, maxAllowed);
  }, [products, searchQuery, sortBy, business]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col pt-[68px]">
        <Navbar />
        <div className="flex-1 flex flex-col items-center justify-center py-20 px-4">
          <SuradeLoader
            variant="section"
            text="Memuat katalog produk usaha..."
            subtext="Mengambil etalase produk dan promo usaha UMKM Surade"
            showBrand
          />
        </div>
        <Footer />
      </div>
    );
  }

  if (error || !business) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col pt-[68px]">
        <Navbar />
        <div className="flex-1 flex flex-col items-center justify-center py-20 px-4 text-center">
          <div className="w-16 h-16 rounded-2xl bg-amber-50 border border-amber-200 flex items-center justify-center text-amber-600 mb-4 shadow-xs">
            <AlertCircle size={32} />
          </div>
          <h2 className="text-xl font-bold text-slate-800 mb-2">Usaha Tidak Ditemukan</h2>
          <p className="text-sm text-slate-500 max-w-md mb-6">{error || "Halaman katalog produk yang Anda cari tidak tersedia."}</p>
          <Link
            to="/category"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#007570] hover:bg-[#005a58] text-white font-bold text-sm transition-all shadow-xs"
          >
            <ArrowLeft size={16} />
            <span>Kembali ke Direktori Usaha</span>
          </Link>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col text-slate-800 antialiased font-sans pt-[68px]">
      <Navbar />

      {/* ── SHOPEE STORE HEADER BANNER ── */}
      <div className="bg-gradient-to-r from-[#005a58] via-[#007570] to-[#044c48] text-white pt-8 pb-12 shadow-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          {/* Breadcrumb row */}
          <div className="flex items-center gap-1.5 text-xs text-teal-100/80 mb-6 overflow-x-auto whitespace-nowrap">
            <Link to="/" className="hover:text-white transition-colors">Beranda</Link>
            <ChevronRight size={14} className="text-teal-300/60" />
            <Link to={`/business/${business.id}`} className="hover:text-white transition-colors">{business.name}</Link>
            <ChevronRight size={14} className="text-teal-300/60" />
            <span className="text-white font-bold">Katalog Produk Usaha</span>
          </div>

          {/* Store Info Card (Shopee Store Profile Banner Style) */}
          <div className="bg-white/10 backdrop-blur-md rounded-3xl p-6 sm:p-8 border border-white/20 shadow-xl flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
            
            {/* Left: Avatar & Identity */}
            <div className="flex items-center gap-5">
              <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl overflow-hidden bg-white border-2 border-white/40 shadow-md shrink-0">
                <img
                  src={business.logo ? getStorageUrl(business.logo) : `https://picsum.photos/seed/${encodeURIComponent(business.name)}/200/200`}
                  alt={business.name}
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="space-y-1.5">
                <div className="flex items-center gap-2 flex-wrap">
                  <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight">{business.name}</h1>
                  {business.is_verified && (
                    <span className="inline-flex items-center gap-1 bg-amber-400 text-slate-950 text-xs font-black px-2.5 py-0.5 rounded-full shadow-xs">
                      <CheckCircle2 size={13} strokeWidth={3} />
                      OFFICIAL STORE
                    </span>
                  )}
                </div>
                <p className="text-xs sm:text-sm text-teal-100 flex items-center gap-1.5">
                  <MapPin size={14} className="text-teal-200" />
                  <span>{business.address || `${business.village ? `Desa ${business.village}, ` : ""}Kecamatan Surade`}</span>
                </p>
                <div className="flex items-center gap-4 text-xs text-teal-100/90 pt-0.5">
                  <span className="font-semibold">{products.length} Produk Aktif</span>
                </div>
              </div>
            </div>

            {/* Right: Actions */}
            <div className="flex items-center gap-3 w-full lg:w-auto flex-wrap sm:flex-nowrap">
              <Link
                to={`/business/${business.id}`}
                className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-white/15 hover:bg-white/25 text-white font-bold text-xs sm:text-sm border border-white/30 backdrop-blur-xs transition-all shadow-xs"
              >
                <Store size={16} />
                <span>Lihat Profil Usaha</span>
              </Link>
              <button
                type="button"
                onClick={handleChatSeller}
                disabled={startingChat}
                className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-white text-[#007570] hover:bg-teal-50 font-bold text-xs sm:text-sm shadow-md transition-all cursor-pointer border-0"
              >
                {startingChat ? <Loader2 size={16} className="animate-spin" /> : <MessageCircle size={16} />}
                <span>Chat Penjual</span>
              </button>
              <button
                type="button"
                onClick={handleWhatsAppBusiness}
                className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-2.5 px-6 py-3 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white font-black text-xs sm:text-sm shadow-md transition-all cursor-pointer border-0"
              >
                <WhatsAppIcon size={20} className="shrink-0 text-white" />
                <span>WhatsApp</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* ── MAIN STOREFRONT PRODUCTS SECTION (SHOPEE STYLE) ── */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        
        {/* Filter & Search Bar Box */}
        <div className="bg-white rounded-2xl border border-slate-200/90 p-4 sm:p-5 shadow-2xs flex flex-col md:flex-row items-center justify-between gap-4">
          
          {/* Left: Tab & Title */}
          <div className="flex items-center gap-3 w-full md:w-auto">
            <div className="w-9 h-9 rounded-xl bg-teal-50 border border-teal-200 flex items-center justify-center text-[#007570] shrink-0">
              <Package size={18} />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-bold text-slate-900 leading-tight">
                Daftar Produk &amp; Layanan
              </h2>
              <p className="text-xs text-slate-500">
                Menampilkan {filteredProducts.length} produk dari {business.name}
              </p>
            </div>
          </div>

          {/* Right: Search Input & Sort Dropdown */}
          <div className="flex items-center gap-3 w-full md:w-auto flex-1 md:max-w-md justify-end">
            
            {/* Search Input */}
            <div className="relative flex-1">
              <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Cari produk di usaha ini..."
                className="w-full pl-9 pr-4 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-[#007570]/30 focus:border-[#007570] transition-all"
              />
            </div>

            {/* Sort Selector */}
            <div className="relative shrink-0">
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="pl-3 pr-8 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs sm:text-sm font-semibold text-slate-700 focus:outline-none focus:ring-2 focus:ring-[#007570]/30 focus:border-[#007570] transition-all cursor-pointer appearance-none"
              >
                <option value="latest">Terbaru</option>
                <option value="price_asc">Harga Termurah</option>
                <option value="price_desc">Harga Termahal</option>
                <option value="name_asc">Nama A-Z</option>
              </select>
              <ChevronDown size={14} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
            </div>
          </div>
        </div>

        {/* ── PRODUCT CARDS GRID (SHOPEE STYLE) ── */}
        {filteredProducts.length > 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3.5 sm:gap-5">
            {filteredProducts.map((prod) => {
              const fallbackImg = "/images/businesses/retail_sembako.jpg";
              const prodImg = prod.image ? getStorageUrl(prod.image) : fallbackImg;
              const formattedPrice = prod.price != null
                ? new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", maximumFractionDigits: 0 }).format(Number(prod.price))
                : "Hubungi Penjual";

              return (
                <div
                  key={prod.id}
                  onClick={() => navigate(`/product/${prod.id}`)}
                  className="group bg-white rounded-2xl border border-slate-200/90 hover:border-teal-400 shadow-2xs hover:shadow-lg transition-all duration-300 overflow-hidden flex flex-col justify-between cursor-pointer relative"
                >
                  {/* Image with Badge */}
                  <div className="aspect-square w-full bg-slate-100 overflow-hidden relative">
                    <img
                      src={prodImg}
                      alt={prod.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      onError={(e) => {
                        e.target.onerror = null;
                        e.target.src = fallbackImg;
                      }}
                    />
                    <div className="absolute top-2 left-2 bg-[#007570] text-white text-[10px] font-bold px-2 py-0.5 rounded-md shadow-xs uppercase tracking-wider">
                      Produk Usaha
                    </div>
                  </div>

                  {/* Body Content */}
                  <div className="p-3.5 flex flex-col justify-between flex-1 gap-2.5">
                    <div className="space-y-1">
                      <h3 className="text-xs sm:text-sm font-bold text-slate-900 line-clamp-2 leading-snug group-hover:text-[#007570] transition-colors">
                        {prod.name}
                      </h3>
                      {prod.description && (
                        <p className="text-[11px] text-slate-500 line-clamp-1">
                          {prod.description}
                        </p>
                      )}
                    </div>

                    {/* Price & Location */}
                    <div className="space-y-2 pt-1 border-t border-slate-100">
                      <div>
                        <span className="text-[10px] text-slate-400 uppercase font-semibold block">Harga</span>
                        <div className="text-sm sm:text-base font-extrabold text-[#007570]">
                          {formattedPrice}
                        </div>
                      </div>

                      {/* Chat via WhatsApp Button */}
                      <button
                        type="button"
                        onClick={(e) => handleWhatsAppProduct(e, prod)}
                        className="w-full inline-flex items-center justify-center gap-1.5 py-2 px-2.5 rounded-xl bg-emerald-50 hover:bg-emerald-600 text-emerald-700 hover:text-white border border-emerald-200 hover:border-emerald-600 text-xs font-bold transition-all shadow-2xs cursor-pointer"
                      >
                        <WhatsAppIcon size={14} />
                        <span>Chat WhatsApp</span>
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="bg-white rounded-3xl border border-slate-200/90 p-12 text-center space-y-4 shadow-2xs">
            <div className="w-16 h-16 rounded-2xl bg-teal-50 border border-teal-200 text-[#007570] flex items-center justify-center mx-auto shadow-xs">
              <Package size={30} />
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-bold text-slate-800">
                {searchQuery ? "Produk Tidak Ditemukan" : "Belum Ada Produk Ditambahkan"}
              </h3>
              <p className="text-xs text-slate-500 max-w-md mx-auto mt-1">
                {searchQuery
                  ? `Tidak ada produk dengan kata kunci "${searchQuery}". Coba gunakan kata kunci lain.`
                  : `Pemilik usaha ${business.name} belum menambahkan daftar produk katalog. Anda tetap dapat menghubungi via WhatsApp atau Chat.`}
              </p>
            </div>
            <div className="flex items-center justify-center gap-3 pt-2">
              <button
                type="button"
                onClick={handleWhatsAppBusiness}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs sm:text-sm shadow-xs transition-all cursor-pointer border-0"
              >
                <WhatsAppIcon size={16} />
                <span>Hubungi Penjual via WhatsApp</span>
              </button>
              <Link
                to={`/business/${business.id}`}
                className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs sm:text-sm transition-all"
              >
                <ArrowLeft size={15} />
                <span>Profil Usaha</span>
              </Link>
            </div>
          </div>
        )}
      </main>

      <Footer />
      <FloatingWhatsApp />

      {/* WhatsApp Access Payment Modal */}
      <WhatsAppAccessModal
        isOpen={showWaPaymentModal}
        onClose={() => setShowWaPaymentModal(false)}
        business={business}
        waSettings={waSettings}
        product={pendingWaProduct}
        onSuccess={() => {
          openWhatsAppDirect(pendingWaProduct);
        }}
      />
    </div>
  );
}
