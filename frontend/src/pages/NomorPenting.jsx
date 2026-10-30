import React, { useState, useEffect, useMemo } from "react";
import { Link } from "react-router-dom";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import WhatsAppIcon from "../components/icons/WhatsAppIcon";
import coastBg from "../assets/surade-coast.jpg";
import api from "../services/api";
import {
  EMERGENCY_HOTLINES,
  KECAMATAN_IMPORTANT_NUMBERS,
  VILLAGE_IMPORTANT_NUMBERS,
} from "../data/importantNumbersData";
import { SMART_CITIES } from "../data/smartCities";
import {
  PhoneCall,
  ShieldAlert,
  Shield,
  Flame,
  HeartPulse,
  Building2,
  Zap,
  Search,
  Copy,
  Check,
  MapPin,
  AlertTriangle,
  LifeBuoy,
  Info,
  ChevronRight,
  Droplets,
  ExternalLink,
  X,
  Share2,
  CheckCircle2,
  Sparkles,
  Navigation,
} from "lucide-react";
import "./NomorPenting.css";

const CATEGORY_TABS = [
  { id: "all", label: "Semua", icon: Sparkles },
  { id: "darurat", label: "Hotline Darurat", icon: ShieldAlert },
  { id: "keamanan", label: "Polisi & Keamanan", icon: Shield },
  { id: "medis", label: "Medis & Ambulans", icon: HeartPulse },
  { id: "bencana", label: "Damkar & Bencana", icon: Flame },
  { id: "pemerintahan", label: "Pemerintahan & Desa", icon: Building2 },
  { id: "utilitas", label: "PLN, PDAM & Derek", icon: Zap },
];

export default function NomorPenting() {
  const [selectedVillage, setSelectedVillage] = useState("all");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [copiedId, setCopiedId] = useState(null);
  const [toastMessage, setToastMessage] = useState("");
  const [dbNumbers, setDbNumbers] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    document.title = "Nomor Penting & Panggilan Darurat 12 Desa Surade - Surade.com";
    window.scrollTo(0, 0);

    const fetchLiveNumbers = async () => {
      setLoading(true);
      try {
        const res = await api.get("/important-numbers");
        const list = res.data?.data || (Array.isArray(res.data) ? res.data : []);
        if (Array.isArray(list) && list.length > 0) {
          setDbNumbers(list);
        }
      } catch (e) {
        console.warn("Using fallback static important numbers data:", e);
      } finally {
        setLoading(false);
      }
    };

    fetchLiveNumbers();
  }, []);

  // Map villages from SMART_CITIES for tab rendering
  const villageList = useMemo(() => {
    return SMART_CITIES.map((city) => {
      const numbers = VILLAGE_IMPORTANT_NUMBERS[city.name] || [];
      const dbCount = dbNumbers.filter(
        (n) => n.village_name && n.village_name.toLowerCase().includes(city.name.toLowerCase())
      ).length;
      return {
        id: city.id,
        name: city.name,
        slug: city.slug || city.name.toLowerCase().replace(/\s+/g, "-"),
        img: city.img,
        count: dbNumbers.length > 0 ? dbCount : numbers.length,
        area: city.area,
      };
    });
  }, [dbNumbers]);

  // Flatten all contacts into a single queryable list
  const allContacts = useMemo(() => {
    if (dbNumbers.length > 0) {
      return dbNumbers.map((item) => {
        const isKecamatan =
          !item.village_name ||
          item.village_name.toLowerCase().includes("kecamatan") ||
          item.village_name === "Kecamatan Surade";
        return {
          id: item.id,
          name: item.name,
          role: item.status_label || (isKecamatan ? "Tingkat Kecamatan Surade" : item.village_name),
          villageName: item.village_name || "Kecamatan Surade",
          category: item.category || "umum",
          phone: item.phone,
          phoneDisplay: item.phone_display || item.phone,
          whatsapp: item.whatsapp || "628111919711",
          address: item.address || "",
          status: item.status_label || "24 Jam Siaga",
          verified: item.is_verified !== false,
          isSeller: Boolean(item.user_id),
          description: item.description || "",
          isKecamatan: isKecamatan,
        };
      });
    }

    const list = [];

    // Add Kecamatan level numbers
    KECAMATAN_IMPORTANT_NUMBERS.forEach((item) => {
      list.push({
        ...item,
        isKecamatan: true,
        villageName: "Kecamatan Surade",
      });
    });

    // Add village level numbers
    Object.entries(VILLAGE_IMPORTANT_NUMBERS).forEach(([villageName, items]) => {
      items.forEach((item) => {
        list.push({
          ...item,
          isKecamatan: false,
          villageName: villageName,
        });
      });
    });

    return list;
  }, [dbNumbers]);

  // Filtered contacts based on Village, Category, and Search
  const filteredContacts = useMemo(() => {
    const query = searchQuery.toLowerCase().trim();

    return allContacts.filter((item) => {
      // 1. Village filter
      if (selectedVillage !== "all") {
        if (selectedVillage === "kecamatan") {
          if (!item.isKecamatan) return false;
        } else {
          if (!item.villageName.toLowerCase().includes(selectedVillage.toLowerCase())) return false;
        }
      }

      // 2. Category filter
      if (selectedCategory !== "all") {
        if (item.category !== selectedCategory) return false;
      }

      // 3. Search query filter
      if (query) {
        const matchName = item.name.toLowerCase().includes(query);
        const matchRole = (item.role || "").toLowerCase().includes(query);
        const matchDesc = (item.description || "").toLowerCase().includes(query);
        const matchVillage = (item.villageName || "").toLowerCase().includes(query);
        const matchAddress = (item.address || "").toLowerCase().includes(query);
        const matchPhone = (item.phone || "").includes(query) || (item.phoneDisplay || "").includes(query);

        if (!matchName && !matchRole && !matchDesc && !matchVillage && !matchAddress && !matchPhone) {
          return false;
        }
      }

      return true;
    });
  }, [allContacts, selectedVillage, selectedCategory, searchQuery]);

  const handleCopyNumber = (contact) => {
    const num = contact.phoneDisplay || contact.phone;
    if (navigator.clipboard) {
      navigator.clipboard.writeText(num);
    }
    setCopiedId(contact.id);
    setToastMessage(`Nomor ${contact.name} (${num}) berhasil disalin!`);
    setTimeout(() => {
      setCopiedId(null);
    }, 2500);
    setTimeout(() => {
      setToastMessage("");
    }, 3500);
  };

  const getCategoryIcon = (category) => {
    switch (category) {
      case "darurat":
        return <ShieldAlert size={22} className="text-rose-600" />;
      case "keamanan":
        return <Shield size={22} className="text-blue-600" />;
      case "medis":
        return <HeartPulse size={22} className="text-emerald-600" />;
      case "bencana":
        return <Flame size={22} className="text-orange-500" />;
      case "pemerintahan":
        return <Building2 size={22} className="text-purple-600" />;
      case "utilitas":
        return <Zap size={22} className="text-amber-500" />;
      default:
        return <PhoneCall size={22} className="text-emerald-600" />;
    }
  };

  const getCategoryBg = (category) => {
    switch (category) {
      case "darurat":
        return "bg-rose-50 border-rose-100";
      case "keamanan":
        return "bg-blue-50 border-blue-100";
      case "medis":
        return "bg-emerald-50 border-emerald-100";
      case "bencana":
        return "bg-orange-50 border-orange-100";
      case "pemerintahan":
        return "bg-purple-50 border-purple-100";
      case "utilitas":
        return "bg-amber-50 border-amber-100";
      default:
        return "bg-emerald-50 border-emerald-100";
    }
  };

  const getHotlineIcon = (name) => {
    switch (name) {
      case "ShieldAlert":
        return <ShieldAlert size={26} />;
      case "Shield":
        return <Shield size={26} />;
      case "Flame":
        return <Flame size={26} />;
      case "HeartPulse":
        return <HeartPulse size={26} />;
      default:
        return <PhoneCall size={26} />;
    }
  };

  return (
    <div className="np-page-container">
      <Navbar />

      {/* ── HERO SECTION WITH BACKGROUND 2 & WAVE RIBBONS ── */}
      <section className="np-hero-section">
        {/* Coastal Background Image */}
        <div
          className="np-hero-bg-image"
          style={{ backgroundImage: `url(${coastBg})` }}
        />
        <div className="np-hero-overlay" />

        {/* ── Top-Left Wave Ribbon Accent (Matching User Image 2) ── */}
        <div className="np-decor-top-left" aria-hidden="true">
          <svg viewBox="0 0 400 280" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
            {/* Deep Green Base Wave */}
            <path
              d="M0 0 H320 C270 90 190 160 0 210 Z"
              fill="#065f46"
              opacity="0.9"
            />
            {/* Emerald Overlay Wave */}
            <path
              d="M0 0 H270 C220 80 150 140 0 180 Z"
              fill="#059669"
              opacity="0.95"
            />
            {/* Golden Amber Highlight Ribbon */}
            <path
              d="M0 150 Q160 130 290 0 L320 0 Q190 160 0 210 Z"
              fill="#f59e0b"
              opacity="0.9"
            />
            {/* Leaf silhouette decoration */}
            <path
              d="M60 40 C75 25 110 30 115 50 C120 70 85 85 70 80 C55 75 50 50 60 40 Z"
              fill="#34d399"
              opacity="0.5"
            />
            <path
              d="M100 65 C115 55 145 60 148 78 C150 95 125 105 110 100 C98 95 90 75 100 65 Z"
              fill="#6ee7b7"
              opacity="0.4"
            />
          </svg>
        </div>

        {/* Top-Left Yellow Dot Pattern */}
        <div className="np-dots-pattern-tl" aria-hidden="true">
          {[...Array(24)].map((_, i) => (
            <span key={i} className="np-dot" />
          ))}
        </div>

        {/* ── Bottom-Right Wave Ribbon Accent (Matching User Image 2) ── */}
        <div className="np-decor-bottom-right" aria-hidden="true">
          <svg viewBox="0 0 420 300" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
            {/* Light Sage Translucent Wave */}
            <path
              d="M420 300 H100 C160 210 240 140 420 80 Z"
              fill="#a7f3d0"
              opacity="0.35"
            />
            {/* Golden Amber Wave Curve */}
            <path
              d="M420 280 C260 280 180 200 120 300 H420 Z"
              fill="#fbbf24"
              opacity="0.85"
            />
            {/* Dark Green Bottom Wave Ribbon */}
            <path
              d="M420 300 H180 C240 240 310 190 420 150 Z"
              fill="#064e3b"
              opacity="0.95"
            />
            {/* Leaf Accents */}
            <path
              d="M340 200 C355 180 390 190 395 210 C400 230 365 245 350 240 C335 235 330 210 340 200 Z"
              fill="#10b981"
              opacity="0.5"
            />
          </svg>
        </div>

        {/* Top-Right Green Dot Pattern */}
        <div className="np-dots-pattern-tr" aria-hidden="true">
          {[...Array(24)].map((_, i) => (
            <span key={i} className="np-dot-green" />
          ))}
        </div>

        {/* Hero Content Area */}
        <div className="np-hero-content">
          <div className="np-hero-badge">
            <span className="np-pulse-dot" />
            <span>Layanan Siaga 24 Jam • Kecamatan Surade</span>
          </div>

          <h1 className="np-hero-title">
            Nomor Penting &amp; <span>Panggilan Darurat</span>
          </h1>

          <p className="np-hero-desc">
            Akses langsung nomor resmi kepolisian, medis gawat darurat, pemadam kebakaran,
            aparatur 12 desa/kelurahan, dan layanan utilitas se-Kecamatan Surade, Kabupaten Sukabumi.
          </p>

          {/* ── Quick Emergency Hotlines ── */}
          <div className="np-hotlines-grid">
            {EMERGENCY_HOTLINES.map((item) => (
              <a
                key={item.code}
                href={`tel:${item.code}`}
                className="np-hotline-card group"
                title={`Panggil Langsung ${item.code} (${item.title})`}
              >
                <div className={`np-hotline-dial bg-gradient-to-br ${item.color}`}>
                  {getHotlineIcon(item.iconName)}
                  <span className="text-[0.72rem] tracking-tight mt-0.5">{item.code}</span>
                </div>
                <div className="np-hotline-info">
                  <h3 className="np-hotline-name group-hover:text-emerald-700 transition-colors">
                    {item.title}
                  </h3>
                  <p className="np-hotline-sub">{item.desc}</p>
                  <span className="np-hotline-badge">{item.badge}</span>
                </div>
              </a>
            ))}
          </div>
        </div>

        {/* ── ORGANIC FLOWING WAVE DIVIDER (Garis Bergelombang) ── */}
        <div className="np-hero-wave-divider">
          <svg
            viewBox="0 0 1440 120"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            preserveAspectRatio="none"
          >
            {/* Background Soft Wave Layer */}
            <path
              d="M0,45L48,53.3C96,62,192,78,288,80C384,82,480,70,576,55C672,40,768,22,864,24C960,26,1056,48,1152,58.7C1248,69,1344,69,1392,69L1440,69L1440,120L1392,120C1344,120,1248,120,1152,120C1056,120,960,120,864,120C768,120,672,120,576,120C480,120,384,120,288,120C192,120,96,120,48,120L0,120Z"
              fill="rgba(248, 250, 252, 0.4)"
            />
            {/* Foreground Solid Wave Layer */}
            <path
              d="M0,32L48,42.7C96,53,192,75,288,80C384,85,480,75,576,58.7C672,43,768,21,864,21.3C960,21,1056,43,1152,53.3C1248,64,1344,64,1392,64L1440,64L1440,120L1392,120C1344,120,1248,120,1152,120C1056,120,960,120,864,120C768,120,672,120,576,120C480,120,384,120,288,120C192,120,96,120,48,120L0,120Z"
              fill="#f8fafc"
            />
          </svg>
        </div>
      </section>

      {/* ── MAIN CONTENT ── */}
      <main className="np-main-content">
        {/* ── Search & Filter Panel ── */}
        <div className="np-filter-panel">
          {/* Live Search */}
          <div className="np-search-wrapper">
            <Search size={22} className="np-search-icon" />
            <input
              type="text"
              placeholder="Cari pos darurat, nama desa, instansi, atau alamat (cth: Polsek, Puskesmas, Bidan, Pasiripis, 0266490110)..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="np-search-input"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery("")}
                className="np-search-clear"
                title="Hapus pencarian"
              >
                <X size={15} />
              </button>
            )}
          </div>

          {/* 12 Villages Filter Bar */}
          <div className="np-village-tabs-header">
            <span className="np-village-tabs-title">
              <MapPin size={17} className="text-emerald-600" />
              Pilih Wilayah / Desa (12 Desa)
            </span>
            <span className="text-[11.5px] font-semibold text-slate-400">
              Geser untuk memilih desa
            </span>
          </div>

          <div className="np-village-scroll-container">
            {/* All Villages */}
            <button
              type="button"
              onClick={() => setSelectedVillage("all")}
              className={`np-village-tab ${selectedVillage === "all" ? "active" : ""}`}
            >
              <span>Semua Wilayah</span>
              <span className="np-village-tab-badge">{allContacts.length}</span>
            </button>

            {/* Kecamatan Utama */}
            <button
              type="button"
              onClick={() => setSelectedVillage("kecamatan")}
              className={`np-village-tab ${selectedVillage === "kecamatan" ? "active" : ""}`}
            >
              <span>Kecamatan Surade (Utama)</span>
              <span className="np-village-tab-badge">{KECAMATAN_IMPORTANT_NUMBERS.length}</span>
            </button>

            {/* 12 Individual Villages */}
            {villageList.map((village) => {
              const isActive = selectedVillage === village.name;
              return (
                <button
                  key={village.id}
                  type="button"
                  onClick={() => setSelectedVillage(village.name)}
                  className={`np-village-tab ${isActive ? "active" : ""}`}
                >
                  <img
                    src={village.img}
                    alt={village.name}
                    className="np-village-tab-img"
                  />
                  <span>{village.name}</span>
                  <span className="np-village-tab-badge">{village.count}</span>
                </button>
              );
            })}
          </div>

          {/* Category Pills */}
          <div className="np-category-pills">
            {CATEGORY_TABS.map((tab) => {
              const IconComp = tab.icon;
              const isActive = selectedCategory === tab.id;
              const count = tab.id === "all" ? allContacts.length : allContacts.filter((c) => c.category === tab.id).length;
              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setSelectedCategory(tab.id)}
                  className={`np-cat-pill ${isActive ? "active" : ""}`}
                >
                  <IconComp size={16} />
                  <span>{tab.label}</span>
                  <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-extrabold ${isActive ? "bg-white/20 text-white" : "bg-slate-200 text-slate-700"}`}>
                    {count}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* ── Result Info Header ── */}
        <div className="np-result-header">
          <div className="np-result-count">
            Menampilkan <span className="np-result-highlight">{filteredContacts.length}</span> Kontak Penting
            {selectedVillage !== "all" && (
              <span className="text-slate-500 font-normal">
                {" "}di <span className="font-semibold text-slate-800">{selectedVillage === "kecamatan" ? "Kecamatan Surade (Utama)" : selectedVillage}</span>
              </span>
            )}
            {selectedCategory !== "all" && (
              <span className="text-slate-500 font-normal">
                {" "}kategori <span className="font-semibold text-slate-800">{CATEGORY_TABS.find(t => t.id === selectedCategory)?.label}</span>
              </span>
            )}
          </div>

          {(selectedVillage !== "all" || selectedCategory !== "all" || searchQuery) && (
            <button
              type="button"
              onClick={() => {
                setSelectedVillage("all");
                setSelectedCategory("all");
                setSearchQuery("");
              }}
              className="text-[12.5px] font-bold text-emerald-600 hover:text-emerald-700 underline bg-transparent border-none cursor-pointer"
            >
              Reset Filter
            </button>
          )}
        </div>

        {/* ── CARDS GRID ── */}
        {filteredContacts.length > 0 ? (
          <div className="np-cards-grid">
            {filteredContacts.map((contact) => {
              const isCopied = copiedId === contact.id;
              const waNumber = contact.whatsapp || contact.phone;
              const waText = encodeURIComponent(
                `Halo ${contact.name}, saya warga Surade membutuhkan informasi / bantuan layanan terkait ${contact.role || "layanan"}.`
              );
              const mapQuery = encodeURIComponent(contact.address || `${contact.name} ${contact.villageName} Sukabumi`);

              return (
                <div key={contact.id} className="np-card">
                  <div>
                    {/* Top Row: Icon + Status */}
                    <div className="np-card-header">
                      <div className={`np-card-icon-wrap ${getCategoryBg(contact.category)} border`}>
                        {getCategoryIcon(contact.category)}
                      </div>

                      <div className={`np-card-status-badge ${
                        contact.status.toLowerCase().includes("24") || contact.status.toLowerCase().includes("igd")
                          ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                          : "bg-slate-100 text-slate-700 border border-slate-200"
                      }`}>
                        <span className={`np-card-status-dot ${
                          contact.status.toLowerCase().includes("24") || contact.status.toLowerCase().includes("igd")
                            ? "bg-emerald-500 animate-pulse"
                            : "bg-slate-400"
                        }`} />
                        <span>{contact.status}</span>
                      </div>
                    </div>

                    {/* Village Tag */}
                    <div className="np-card-village-tag">
                      <MapPin size={13} />
                      <span>{contact.villageName}</span>
                      {contact.isSeller ? (
                        <span className="flex items-center gap-1 ml-1 text-[10.5px] text-teal-700 bg-teal-50 px-1.5 py-0.5 rounded font-bold border border-teal-200">
                          <CheckCircle2 size={11} className="text-teal-600" /> Mitra Usaha Terverifikasi
                        </span>
                      ) : contact.verified ? (
                        <span className="flex items-center gap-1 ml-1 text-[10.5px] text-blue-600 bg-blue-50 px-1.5 py-0.5 rounded font-bold border border-blue-100">
                          <CheckCircle2 size={11} /> Resmi Terverifikasi
                        </span>
                      ) : null}
                    </div>

                    {/* Title & Role */}
                    <h3 className="np-card-title">{contact.name}</h3>
                    <p className="np-card-role">{contact.role}</p>

                    {/* Description */}
                    {contact.description && (
                      <p className="np-card-desc">{contact.description}</p>
                    )}

                    {/* Address info with clickable Google Maps */}
                    {contact.address && (
                      <a
                        href={`https://www.google.com/maps/search/?api=1&query=${mapQuery}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="np-card-address hover:text-emerald-700 group no-underline transition-colors block"
                        title="Buka lokasi di Google Maps"
                      >
                        <div className="flex items-start gap-1.5">
                          <MapPin size={14} className="shrink-0 mt-0.5 text-emerald-600 group-hover:scale-110 transition-transform" />
                          <span>{contact.address}</span>
                          <Navigation size={12} className="shrink-0 mt-0.5 ml-auto text-slate-400 group-hover:text-emerald-600" />
                        </div>
                      </a>
                    )}
                  </div>

                    {/* Action Buttons */}
                    <div className="np-card-actions">
                      {/* Telepon */}
                      <a
                        href={`tel:${contact.phone}`}
                        className="np-btn-call"
                        title={`Telepon Langsung ${contact.phoneDisplay || contact.phone}`}
                      >
                        <PhoneCall size={15} />
                        <span>Telepon</span>
                      </a>

                      {/* WhatsApp */}
                      <a
                        href={`https://wa.me/${contact.whatsapp || "628111919711"}?text=${
                          contact.whatsapp && contact.whatsapp !== "628111919711"
                            ? encodeURIComponent(`Halo ${contact.name}, saya membutuhkan informasi / bantuan terkait ${contact.role || "layanan"}.`)
                            : encodeURIComponent(`Halo Admin Siaga Surade.com, saya membutuhkan bantuan informasi / koordinasi terkait ${contact.name} (${contact.role || "Layanan"}), Alamat: ${contact.address || contact.villageName}.`)
                        }`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="np-btn-wa"
                        title="Chat WhatsApp"
                      >
                        <WhatsAppIcon size={16} />
                        <span>WhatsApp</span>
                      </a>

                      {/* Copy Button */}
                    <button
                      type="button"
                      onClick={() => handleCopyNumber(contact)}
                      className={`np-btn-copy ${isCopied ? "copied" : ""}`}
                      title="Salin Nomor Telepon"
                    >
                      {isCopied ? <Check size={16} /> : <Copy size={16} />}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="np-empty-state">
            <AlertTriangle size={52} className="mx-auto text-amber-500 mb-3" />
            <h3 className="text-xl font-bold text-slate-800 mb-1">
              Tidak Ada Kontak Penting Ditemukan
            </h3>
            <p className="text-sm text-slate-500 max-w-md mx-auto mb-4">
              Tidak ada kontak yang cocok dengan filter atau kata kunci "{searchQuery}". Silakan reset pencarian atau pilih desa lain.
            </p>
            <button
              type="button"
              onClick={() => {
                setSelectedVillage("all");
                setSelectedCategory("all");
                setSearchQuery("");
              }}
              className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-emerald-600 text-white font-bold text-sm hover:bg-emerald-700 transition-colors shadow-md"
            >
              Tampilkan Semua Kontak
            </button>
          </div>
        )}

        {/* ── GUIDELINES & EMERGENCY TIPS ── */}
        <section className="np-guidelines-card">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 text-xs font-bold uppercase tracking-wider mb-3">
              <LifeBuoy size={14} /> Panduan Kedaruratan Warga
            </div>
            <h2 className="text-2xl font-black text-white mb-3">
              Hal yang Perlu Dilakukan Saat Menghubungi Nomor Darurat
            </h2>
            <p className="text-slate-300 text-sm leading-relaxed mb-4">
              Pastikan Anda memberikan informasi yang jelas dan akurat agar petugas medis, kepolisian, atau damkar dapat segera tiba di lokasi kejadian dengan tepat waktu.
            </p>
            <div className="flex flex-wrap gap-2 text-xs font-semibold text-emerald-200">
              <span className="bg-white/10 px-3 py-1.5 rounded-lg border border-white/10">✓ Bebas Pulsa 112 &amp; 110</span>
              <span className="bg-white/10 px-3 py-1.5 rounded-lg border border-white/10">✓ Respons Cepat</span>
              <span className="bg-white/10 px-3 py-1.5 rounded-lg border border-white/10">✓ Siaga 24 Jam</span>
            </div>
          </div>

          <div className="space-y-3">
            <div className="np-guide-step">
              <span className="np-guide-num">1</span>
              <div>
                <h4 className="text-sm font-bold text-white mb-0.5">Tetap Tenang &amp; Berbicara Jelas</h4>
                <p className="text-xs text-slate-300 leading-normal">
                  Tarik napas dalam, jelaskan kondisi darurat yang sedang dialami (medis, kecelakaan, kebakaran, atau gangguan kamtibmas).
                </p>
              </div>
            </div>

            <div className="np-guide-step">
              <span className="np-guide-num">2</span>
              <div>
                <h4 className="text-sm font-bold text-white mb-0.5">Sebutkan Desa &amp; Patokan Lokasi</h4>
                <p className="text-xs text-slate-300 leading-normal">
                  Sebutkan nama desa (contoh: Desa Pasiripis RT 02/03 dekat Jembatan Minajaya) agar petugas wilayah terdekat langsung menuju lokasi.
                </p>
              </div>
            </div>

            <div className="np-guide-step">
              <span className="np-guide-num">3</span>
              <div>
                <h4 className="text-sm font-bold text-white mb-0.5">Jangan Putus Telepon Sebelum Diarahkan</h4>
                <p className="text-xs text-slate-300 leading-normal">
                  Dengarkan instruksi pertolongan pertama dari petugas dan tunggu konfirmasi tim siaga telah meluncur.
                </p>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* ── TOAST NOTIFICATION ── */}
      {toastMessage && (
        <div className="np-toast">
          <CheckCircle2 size={20} className="text-emerald-400 shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      <Footer />
    </div>
  );
}
