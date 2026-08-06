import { useState, useRef, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import "./Home.css";
import Navbar from "../components/Navbar";
import logoImg from "../assets/logo.png";
import { getBusinesses } from "../services/businessService";
import { InlineSpinner } from "../components/LoadingScreen";
import { getStorageUrl } from "../utils/constants";
import {
  Store,
  Coffee,
  Smartphone,
  Shirt,
  Wrench,
  MapPin,
  Search,
  ChevronDown,
  Bookmark,
  Eye,
  Tag,
  Pointer,
  Megaphone,
  Rocket,
  BookOpen,
  User,
  Calendar,
  Building2,
  Landmark,
} from "lucide-react";

/* ── Indonesian cities ── */
const KOTA_INDONESIA = [
  "Semua", "Jakarta", "Surabaya", "Bandung", "Medan", "Bekasi", "Tangerang", "Depok",
  "Semarang", "Palembang", "Makassar", "South Tangerang", "Batam", "Pekanbaru",
  "Bandar Lampung", "Padang", "Malang", "Bogor", "Denpasar", "Samarinda",
  "Tasikmalaya", "Pontianak", "Banjarmasin", "Balikpapan", "Jambi", "Surakarta",
  "Mataram", "Manado", "Yogyakarta", "Ambon", "Kupang", "Jayapura", "Sorong",
  "Ternate", "Gorontalo", "Kendari", "Palu", "Pekalongan", "Tegal", "Cirebon",
  "Sukabumi", "Kabupaten Bogor", "Kabupaten Bekasi", "Kabupaten Tangerang",
];

/* ── Category tabs ── */
const CATEGORIES = [
  { id: "all", label: "Semua", icon: <Store size={26} strokeWidth={1.7} /> },
  { id: "bisnis", label: "Bisnis & Market", icon: <Store size={26} strokeWidth={1.7} /> },
  { id: "cafe", label: "Cafe & Restaurant", icon: <Coffee size={26} strokeWidth={1.7} /> },
  { id: "elektronik", label: "Elektronik & Gadget", icon: <Smartphone size={26} strokeWidth={1.7} /> },
  { id: "fashion", label: "Fashion", icon: <Shirt size={26} strokeWidth={1.7} /> },
  { id: "servis", label: "Servis & Tukang", icon: <Wrench size={26} strokeWidth={1.7} /> },
  { id: "wisata", label: "Wisata", icon: <MapPin size={26} strokeWidth={1.7} /> },
];

/* ── How it works steps ── */
const QUICK_STEPS = [
  { num: "1", title: "Ketik Kata Kunci", desc: "Pemilihan kata kunci akan mempercepat dalam pencarian." },
  { num: "2", title: "Ketik Lokasi", desc: "Anda dapat menemukan lokasi secara mudah dengan mengetik daerah yang Anda cari." },
  { num: "3", title: "Temukan Pencarian", desc: "Penuhi semua keperluan dan kebutuhan Anda." },
];

/* ── Key Features data ── */
const FEATURES_DATA = [
  {
    id: 1,
    title: "Pencarian Akurat",
    text: "Memudahkan pencarian pelaku usaha dan UMKM dengan pencarian yang akurat",
    icon: <MapPin size={24} />,
  },
  {
    id: 2,
    title: "Hanya Satu Kali Klik",
    text: "Hanya dengan satu kali klik 'One Click Service' langsung terhubung dengan Whatsapp pelaku usaha",
    icon: <Pointer size={24} />,
  },
  {
    id: 3,
    title: "Cepat dan Mudah",
    text: "Mudah didaftarkan hanya melalui whatsapp, cepat dalam penayangan iklan usaha",
    icon: <Rocket size={24} />,
  },
  {
    id: 4,
    title: "Kontak Langsung",
    text: "Anda dapat menghubungi dan mendatangi pelaku usaha secara langsung tanpa perantara",
    icon: <BookOpen size={24} />,
  },
];

/* ── Smart Cities data ── */
const SMART_CITIES = [
  {
    id: 1,
    slug: "aceh",
    name: "Aceh",
    description: "Provinsi Aceh mengembangkan Smart City dan Smart Village untuk meningkatkan layanan publik berbasis digital di seluruh kabupaten/kota.",
    img: "https://images.unsplash.com/photo-1584982637256-4b2a4729f276?w=600&h=400&fit=crop",
    bisnis: 312,
    population: "5,5 Juta",
    area: "57.956 km²",
    highlights: ["Sistem informasi desa digital", "E-Government Aceh", "Digitalisasi layanan kependudukan"]
  },
  {
    id: 2,
    slug: "bali",
    name: "Bali",
    description: "Provinsi Bali mengintegrasikan teknologi smart tourism dengan program Smart City untuk mendukung sektor pariwisata dan ekonomi kreatif daerah.",
    img: "https://images.unsplash.com/photo-1537996194471-e657df975ab4?w=600&h=400&fit=crop",
    bisnis: 874,
    population: "4,3 Juta",
    area: "5.780 km²",
    highlights: ["Smart Tourism Platform", "Digitalisasi UMKM pariwisata", "Sistem informasi wisata terpadu"]
  },
  {
    id: 3,
    slug: "bogor",
    name: "Bogor",
    description: "Kota Bogor mengembangkan Smart City dengan fokus pada pengelolaan transportasi, layanan publik digital, dan sistem pengelolaan sampah yang lebih efisien.",
    img: "https://upload.wikimedia.org/wikipedia/commons/e/eb/Tugu_Kujang_1.jpg",
    bisnis: 462,
    population: "1,1 Juta",
    area: "118 km²",
    highlights: ["Sistem transportasi cerdas", "Digitalisasi layanan publik", "Pengelolaan sampah berbasis IoT"]
  },
  {
    id: 4,
    slug: "jakarta",
    name: "Jakarta",
    description: "DKI Jakarta sebagai pionir Smart City Indonesia telah mengoperasikan Jakarta Smart City Command Center yang memantau kota secara real-time melalui ribuan CCTV dan sensor.",
    img: "https://images.unsplash.com/photo-1555993539-1732b0258235?w=600&h=400&fit=crop",
    bisnis: 2140,
    population: "10,6 Juta",
    area: "664 km²",
    highlights: ["Jakarta Smart City Command Center", "Sistem transportasi Transjakarta terintegrasi", "Qlue — platform pengaduan warga digital"]
  },
  {
    id: 5,
    slug: "jambi",
    name: "Jambi",
    description: "Kota Jambi menjalankan program Smart City dalam kerangka Gerakan Menuju 100 Smart City Kementerian Kominfo dengan fokus pada smart economy dan smart government.",
    img: "https://upload.wikimedia.org/wikipedia/commons/f/f8/Gentala_Arasy.jpg",
    bisnis: 198,
    population: "606 Ribu",
    area: "205 km²",
    highlights: ["Gerakan 100 Smart City Kemkominfo", "Sistem informasi perizinan online", "Digitalisasi UMKM lokal"]
  },
  {
    id: 6,
    slug: "kabupaten-kepulauan-mentawai",
    name: "Kabupaten Kepulauan Mentawai",
    description: "Kabupaten Kepulauan Mentawai mengembangkan program Smart Village untuk memperluas akses informasi dan layanan digital hingga ke desa-desa terpencil di kepulauan.",
    img: "https://images.unsplash.com/photo-1500534314209-a25ddb2bd429?w=600&h=400&fit=crop",
    bisnis: 45,
    population: "87 Ribu",
    area: "6.011 km²",
    highlights: ["Akses internet desa", "Sistem informasi potensi desa", "Pelayanan administrasi terpadu"]
  },
  {
    id: 7,
    slug: "magelang",
    name: "Magelang",
    description: "Kota Magelang terpilih dalam program Gerakan Menuju 100 Smart City dan mengembangkan sistem layanan publik digital serta pengelolaan kota berbasis data.",
    img: "https://upload.wikimedia.org/wikipedia/commons/7/73/Borobudur_Temple.jpg",
    bisnis: 187,
    population: "123 Ribu",
    area: "18 km²",
    highlights: ["Data GO (Open Data)", "Sistem layanan kesehatan terpadu", "Magelang Cerdas (Aplikasi Publik)"]
  },
  {
    id: 8,
    slug: "medan",
    name: "Medan",
    description: "Kota Medan terus berinovasi dalam mengimplementasikan konsep Smart City melalui layanan Medan Smart City yang mengintegrasikan berbagai layanan publik dan administrasi kota.",
    img: "https://upload.wikimedia.org/wikipedia/commons/a/a1/Istana_Maimun_Medan.jpg",
    bisnis: 934,
    population: "2,4 Juta",
    area: "265 km²",
    highlights: ["Medan Smart City", "CCTV Terintegrasi", "E-Parkir dan layanan digital"]
  },
  {
    id: 9,
    slug: "papua-barat",
    name: "Papua Barat",
    description: "Provinsi Papua Barat menjalankan program Smart Village untuk mendekatkan layanan pemerintah kepada masyarakat desa dan meningkatkan konektivitas digital di wilayah terpencil.",
    img: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400&h=250&fit=crop",
    bisnis: 87,
    population: "1,1 Juta",
    area: "97.024 km²",
    highlights: ["Program Smart Village pedalaman", "Perluasan infrastruktur internet 4G", "Sistem informasi kampung digital"]
  },
  {
    id: 10,
    slug: "sulawesi-tengah",
    name: "Sulawesi Tengah",
    description: "Provinsi Sulawesi Tengah mengembangkan program Smart Village untuk memperkuat sistem informasi desa dan mendorong digitalisasi potensi ekonomi lokal pascabencana.",
    img: "https://images.unsplash.com/photo-1501854140801-50d01698950b?w=400&h=250&fit=crop",
    bisnis: 143,
    population: "3,1 Juta",
    area: "61.841 km²",
    highlights: ["Sistem informasi desa pascabencana", "Digitalisasi potensi ekonomi lokal", "Program pemulihan berbasis teknologi"]
  },
  {
    id: 11,
    slug: "sumatera-utara",
    name: "Sumatera Utara",
    description: "Provinsi Sumatera Utara mendorong percepatan Smart City di Kota Medan dan Smart Village di berbagai kabupaten untuk meningkatkan pelayanan publik berbasis teknologi.",
    img: "https://images.unsplash.com/photo-1588666309990-d68f08e3d4a6?w=400&h=250&fit=crop",
    bisnis: 1240,
    population: "15,1 Juta",
    area: "72.981 km²",
    highlights: ["Program Smart City Medan", "Digitalisasi desa di Kabupaten Toba", "Sistem informasi pariwisata Danau Toba"]
  },
  {
    id: 12,
    slug: "yogyakarta",
    name: "Yogyakarta",
    description: "Kota Yogyakarta masuk dalam program Gerakan Menuju 100 Smart City dan secara konsisten mengembangkan layanan publik digital serta ekosistem startup berbasis kota.",
    img: "https://images.unsplash.com/photo-1602576666092-bf6447a729fc?w=400&h=250&fit=crop",
    bisnis: 673,
    population: "437 Ribu",
    area: "33 km²",
    highlights: ["Gerakan 100 Smart City Kemkominfo", "Ekosistem startup dan inovasi digital", "Sistem informasi pariwisata terpadu"]
  },
];

/* ── Testimonials data ── */
const TESTIMONIALS_DATA = [
  {
    id: 1,
    avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=80&h=80&fit=crop&crop=face",
    name: "Nindi Afrilia",
    role: "Marketing Executive",
    text: "Dengan adanya Info.co.id, masyarakat jadi lebih mudah menemukan berbagai informasi dan layanan yang ada di daerah mereka.",
  },
  {
    id: 2,
    avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=80&h=80&fit=crop&crop=face",
    name: "Putri Indah Lestari",
    role: "Research and Development",
    text: "Info.co.id membantu menyajikan informasi daerah dalam satu platform yang lebih mudah diakses dan dipahami oleh semua kalangan.",
  },
  {
    id: 3,
    avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=80&h=80&fit=crop&crop=face",
    name: "Algi Triana",
    role: "UI/UX Designer",
    text: "Platform ini punya potensi besar untuk membuat informasi lokal lebih mudah ditemukan. Tampilannya pun cukup bersih dan nyaman dipakai.",
  },
  {
    id: 4,
    avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=80&h=80&fit=crop&crop=face",
    name: "Fajar Septiawan",
    role: "Business Development",
    text: "Info.co.id jadi salah satu platform yang membantu menghubungkan masyarakat dengan berbagai informasi dan potensi bisnis di daerahnya.",
  },
  {
    id: 5,
    avatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=80&h=80&fit=crop&crop=face",
    name: "Risa Permata",
    role: "Digital Development",
    text: "Saya senang ada platform seperti ini. Digitalisasi informasi daerah itu penting banget, terutama untuk mendukung program Smart Village.",
  },
  {
    id: 6,
    avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=80&h=80&fit=crop&crop=face",
    name: "Bagas Nugroho",
    role: "Web Developer",
    text: "Dari sisi teknis, Info.co.id sudah cukup solid. Integrasi data bisnis lokal dengan sistem pencariannya terasa responsif dan mudah digunakan.",
  },
  {
    id: 7,
    avatar: "https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?w=80&h=80&fit=crop&crop=face",
    name: "Laras Diningrum",
    role: "Project Manager",
    text: "Koordinasi antar tim dalam pengembangan platform ini cukup terstruktur. Roadmap-nya jelas dan fokus pada kebutuhan pengguna di daerah.",
  },
  {
    id: 8,
    avatar: "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=80&h=80&fit=crop&crop=face",
    name: "Dito Firmansyah",
    role: "Product Team",
    text: "Info.co.id membantu UMKM di daerah untuk lebih mudah ditemukan. Ini langkah nyata menuju ekosistem digital yang lebih merata di Indonesia.",
  },
];


const getCategoryIcon = (iconName) => {
  switch (iconName) {
    case "store":
      return <Store size={26} strokeWidth={1.7} />;
    case "coffee":
      return <Coffee size={26} strokeWidth={1.7} />;
    case "smartphone":
      return <Smartphone size={26} strokeWidth={1.7} />;
    case "shirt":
      return <Shirt size={26} strokeWidth={1.7} />;
    case "wrench":
      return <Wrench size={26} strokeWidth={1.7} />;
    case "map-pin":
      return <MapPin size={26} strokeWidth={1.7} />;
    case "building":
      return <Building2 size={26} strokeWidth={1.7} />;
    case "landmark":
      return <Landmark size={26} strokeWidth={1.7} />;
    default:
      return <Store size={26} strokeWidth={1.7} />;
  }
};

export default function Home() {
  const navigate = useNavigate();
  const [selectedKota, setSelectedKota] = useState("Semua");
  const [kotaSearch, setKotaSearch] = useState("");
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [activeCategory, setActiveCategory] = useState("all");
  const [saved, setSaved] = useState({});
  const [selectedCity, setSelectedCity] = useState(null);
  const [searchKeyword, setSearchKeyword] = useState("");
  const [selectedSearchCategory, setSelectedSearchCategory] = useState("all");
  const [searchHistory, setSearchHistory] = useState([]);
  const [keywordDropdownOpen, setKeywordDropdownOpen] = useState(false);
  const [currentAdIndex, setCurrentAdIndex] = useState(0);
  const dropdownRef = useRef(null);
  const keywordDropdownRef = useRef(null);
  const [businesses, setBusinesses] = useState([]);
  const [categories, setCategories] = useState(CATEGORIES);
  const [bisnisData, setBisnisData] = useState([]);
  const [temukanData, setTemukanData] = useState([]);
  const [adsData, setAdsData] = useState([]);
  const [loadingData, setLoadingData] = useState(true);
  const [blogsData, setBlogsData] = useState([]);
  const [testimonialsData, setTestimonialsData] = useState(TESTIMONIALS_DATA);
  const [smartCitiesData, setSmartCitiesData] = useState(SMART_CITIES);

  useEffect(() => {
    const fetchData = async () => {
      setLoadingData(true);
      try {
        // Fetch categories
        const catRes = await fetch(`${import.meta.env.VITE_API_URL}/categories`);
        const catData = await catRes.json();
        if (Array.isArray(catData)) {
          const mappedCategories = [
            { id: "all", label: "Semua", icon: <Store size={26} strokeWidth={1.7} /> },
            ...catData.map(c => ({
              id: c.slug,
              label: c.name,
              icon: getCategoryIcon(c.icon)
            }))
          ];
          setCategories(mappedCategories);
        }
      } catch (err) {
        console.error("Failed to fetch categories:", err);
      }

      try {
        // Fetch businesses
        const bizRes = await fetch(`${import.meta.env.VITE_API_URL}/businesses?all=true`);
        const bizJson = await bizRes.json();
        const bizData = bizJson?.data || bizJson || [];
        if (Array.isArray(bizData)) {
          const mapped = bizData.map(b => {
            // Extract main category and subcategory
            const mainCategory = b.category?.parent || b.category;
            const subCategory = b.category?.parent ? b.category : null;
            const categoryName = mainCategory?.name || b.category?.name || "Umum";
            const subCategoryName = subCategory?.name || null;

            return {
              id: b.id,
              name: b.name,
              category: categoryName,
              subCategory: subCategoryName,
              categoryColor: b.category?.icon === "store" ? "#007570" : b.category?.icon === "coffee" ? "#0ea5e9" : "#f59e0b",
              tags: [b.name],
              location: b.city || "Indonesia",
              views: b.views || 0,
              status: "Buka Sekarang",
              img: getStorageUrl(b.logo || b.banner) || "https://images.unsplash.com/photo-1565958011703-44f9829ba187?w=400&h=250&fit=crop",
              open: true,
              featured: b.featured,
              description: b.description
            };
          });
          setBisnisData(mapped);
          setTemukanData(mapped);
          
          // Dynamically update smart city business counts from database
          const updatedSmartCities = SMART_CITIES.map(city => {
            const count = mapped.filter(b => b.location && b.location.toLowerCase().includes(city.name.toLowerCase())).length;
            return { ...city, bisnis: count };
          });
          setSmartCitiesData(updatedSmartCities);
        }
      } catch (err) {
        console.error("Failed to fetch businesses:", err);
      }

      try {
        // Fetch advertisements from API
        const adsRes = await fetch(`${import.meta.env.VITE_API_URL}/advertisements`);
        const adsJson = await adsRes.json();
        const adsData = adsJson?.data || adsJson || [];
        if (Array.isArray(adsData)) {
          const mappedAds = adsData.map(ad => ({
            id: ad.id,
            businessId: ad.business?.id,
            img: getStorageUrl(ad.business?.logo || ad.business?.banner) || "https://images.unsplash.com/photo-1565958011703-44f9829ba187?w=400&h=250&fit=crop",
            name: ad.business?.name || "Bisnis",
            desc: ad.business?.description || "Portal Bisnis Terpercaya",
            packageName: ad.package_name,
            price: ad.price
          }));
          setAdsData(mappedAds);
        }
      } catch (err) {
        console.error("Failed to fetch advertisements:", err);
      }

      try {
        // Fetch blogs from API
        const blogsRes = await fetch(`${import.meta.env.VITE_API_URL}/blogs`);
        const blogsJson = await blogsRes.json();
        const blogsData = blogsJson?.data || blogsJson || [];
        if (Array.isArray(blogsData)) {
          setBlogsData(blogsData);
        }
      } catch (err) {
        console.error("Failed to fetch blogs:", err);
      }

      setLoadingData(false);
    };
    fetchData();
  }, []);

  useEffect(() => {
    window.scrollTo(0, 0);
    const history = JSON.parse(localStorage.getItem("search_history") || "[]");
    setSearchHistory(history);
  }, []);

  useEffect(() => {
    function handleClickOutside(e) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setDropdownOpen(false); setKotaSearch("");
      }
      if (keywordDropdownRef.current && !keywordDropdownRef.current.contains(e.target)) {
        setKeywordDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [searchHistory]);

  useEffect(() => {
    const interval = setInterval(() => {
      if (adsData.length > 0) {
        setCurrentAdIndex((prev) => (prev + 1) % adsData.length);
      }
    }, 5000);
    return () => clearInterval(interval);
  }, [adsData]);

  const filteredKota = KOTA_INDONESIA.filter((k) =>
    k.toLowerCase().includes(kotaSearch.toLowerCase())
  );

  const filteredBisnis = activeCategory === "all"
    ? bisnisData
    : bisnisData.filter((b) =>
      b.category.toLowerCase().includes(
        categories.find((c) => c.id === activeCategory)?.label.split(" ")[0].toLowerCase() ?? ""
      )
    );

  const cityFilteredBisnis = selectedCity
    ? bisnisData.filter((b) => b.location.includes(selectedCity))
    : bisnisData;

  const searchFilteredBisnis = searchKeyword
    ? bisnisData.filter((b) =>
        b.name.toLowerCase().includes(searchKeyword.toLowerCase()) ||
        b.category.toLowerCase().includes(searchKeyword.toLowerCase()) ||
        b.tags.some(tag => tag.toLowerCase().includes(searchKeyword.toLowerCase())) ||
        b.location.toLowerCase().includes(searchKeyword.toLowerCase())
      )
    : bisnisData;

  // Combine all filters
  const finalFilteredBisnis = bisnisData.filter((b) => {
    const matchesCategory = activeCategory === "all" ||
      b.category.toLowerCase().includes(
        categories.find((c) => c.id === activeCategory)?.label.split(" ")[0].toLowerCase() ?? ""
      );
    const matchesCity = !selectedCity || b.location.includes(selectedCity);
    const matchesSearch = !searchKeyword ||
      b.name.toLowerCase().includes(searchKeyword.toLowerCase()) ||
      b.category.toLowerCase().includes(searchKeyword.toLowerCase()) ||
      b.tags.some(tag => tag.toLowerCase().includes(searchKeyword.toLowerCase())) ||
      b.location.toLowerCase().includes(searchKeyword.toLowerCase());
    
    return matchesCategory && matchesCity && matchesSearch;
  });

  // Filter TEMUKAN_DATA based on search
  const filteredTemukanData = temukanData.filter((b) => {
    const matchesSearch = !searchKeyword ||
      b.name.toLowerCase().includes(searchKeyword.toLowerCase()) ||
      b.category.toLowerCase().includes(searchKeyword.toLowerCase()) ||
      b.tags.some(tag => tag.toLowerCase().includes(searchKeyword.toLowerCase())) ||
      b.location.toLowerCase().includes(searchKeyword.toLowerCase());
    
    return matchesSearch;
  });

  function toggleSave(id) {
    setSaved((prev) => ({ ...prev, [id]: !prev[id] }));
  }

  const handleSearchSubmit = () => {
    if (searchKeyword.trim()) {
      const newHistoryItem = { keyword: searchKeyword.trim(), category: selectedSearchCategory };
      const updatedHistory = [
        newHistoryItem,
        ...searchHistory.filter(h => h.keyword.toLowerCase() !== searchKeyword.trim().toLowerCase())
      ].slice(0, 2);
      localStorage.setItem("search_history", JSON.stringify(updatedHistory));
      setSearchHistory(updatedHistory);
    }
    navigate(`/category/${selectedSearchCategory}?q=${encodeURIComponent(searchKeyword)}&location=${encodeURIComponent(selectedKota)}`);
  };
  

  return (
    <div className="home-page">
      {/* ── NAVBAR ── */}
      <Navbar />

      {/* ── HERO BANNER ── */}
      <section className="home-hero">
        <div className="home-hero__bg" />
        <div className="home-hero__container">
          <div className="home-hero__content">
            {/* Badge / Pill */}
            <div className="home-hero__badge">
              <div className="home-hero__badge-icon">
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M12 1L3 5V11C3 16.55 6.84 21.74 12 23C17.16 21.74 21 16.55 21 11V5L12 1Z" fill="url(#heroBadgeGrad)"/>
                  <path d="M9 11.8L11.2 14L15.5 9.5" stroke="#050a16" strokeWidth="2.8" strokeLinecap="round" strokeLinejoin="round"/>
                  <defs>
                    <linearGradient id="heroBadgeGrad" x1="3" y1="1" x2="21" y2="23" gradientUnits="userSpaceOnUse">
                      <stop stopColor="#00d2be"/>
                      <stop offset="1" stopColor="#007570"/>
                    </linearGradient>
                  </defs>
                </svg>
              </div>
              <span>Direktori Bisnis Terpercaya di Indonesia</span>
            </div>

            {/* Title & Subtitle */}
            <h1 className="home-hero__title">
              Info.co.id
              <span className="home-hero__title-sub">Semua Ada Disini</span>
            </h1>
            <p className="home-hero__subtitle">
              Temukan dan terhubung dengan berbagai<br />
              pelaku usaha terbaik di Indonesia.
            </p>

            {/* Search Bar */}
            <form className="home-search" onSubmit={(e) => { e.preventDefault(); handleSearchSubmit(); }}>
              <div className="home-search__group home-search__group--keyword" ref={keywordDropdownRef}>
                <span className="home-search__label">Kata Kunci :</span>
                <input
                  className="home-search__input"
                  type="text"
                  placeholder="UMKM, Pelaku Usaha, Bisnis, dll"
                  id="search-keyword"
                  value={searchKeyword}
                  onChange={(e) => setSearchKeyword(e.target.value)}
                  onFocus={() => setKeywordDropdownOpen(true)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      handleSearchSubmit();
                    }
                  }}
                />
                {selectedSearchCategory !== "all" && (
                  <span className="home-search__selected-category">
                    {CATEGORIES.find(c => c.id === selectedSearchCategory)?.label || selectedSearchCategory}
                  </span>
                )}

                {keywordDropdownOpen && (
                  <div className="home-keyword-dropdown">
                    {/* Riwayat Pencarian (Top) */}
                    {searchHistory.length > 0 && (
                      <div className="home-keyword-dropdown__section">
                        <span className="home-keyword-dropdown__section-title">Riwayat Pencarian</span>
                        <ul className="home-keyword-dropdown__list">
                          {searchHistory.map((item, idx) => (
                            <li
                              key={idx}
                              className="home-keyword-dropdown__item home-keyword-dropdown__item--history"
                              onClick={() => {
                                setSearchKeyword(item.keyword);
                                setSelectedSearchCategory(item.category || "all");
                                setKeywordDropdownOpen(false);
                                navigate(`/category/${item.category || "all"}?q=${encodeURIComponent(item.keyword)}&location=${encodeURIComponent(selectedKota)}`);
                              }}
                            >
                              <span className="home-keyword-dropdown__history-text">{item.keyword}</span>
                              <span className="home-keyword-dropdown__history-cat">
                                di {CATEGORIES.find(c => c.id === item.category)?.label || "Semua"}
                              </span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {/* Kategori Pilihan */}
                    <div className="home-keyword-dropdown__section">
                      <span className="home-keyword-dropdown__section-title">Cari berdasarkan Kategori</span>
                      <ul className="home-keyword-dropdown__list">
                        {categories.map((cat) => (
                          <li
                            key={cat.id}
                            className="home-keyword-dropdown__item home-keyword-dropdown__item--category"
                            onClick={() => {
  setSelectedSearchCategory(cat.id);
  setKeywordDropdownOpen(false);
}}
                          >
                            <span className="home-keyword-dropdown__cat-icon">{cat.icon}</span>
                            <span className="home-keyword-dropdown__cat-label">{cat.label}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                )}
              </div>

              <div className="home-search__divider" />

              <div className="home-search__group home-search__group--lokasi" ref={dropdownRef}>
                <span className="home-search__label">Lokasi</span>
                <button
                  type="button"
                  className="home-search__kota-btn"
                  onClick={() => setDropdownOpen((v) => !v)}
                >
                  <span className="home-search__kota-text">{selectedKota}</span>
                </button>

                {dropdownOpen && (
                  <div className="home-kota-dropdown" role="listbox">
                    <div className="home-kota-dropdown__search">
                      <Search size={13} className="home-kota-dropdown__icon" />
                      <input
                        autoFocus
                        type="text"
                        placeholder="Cari kota..."
                        value={kotaSearch}
                        onChange={(e) => setKotaSearch(e.target.value)}
                        className="home-kota-dropdown__input"
                      />
                    </div>
                    <ul className="home-kota-dropdown__list">
                      {filteredKota.length > 0
                        ? filteredKota.map((kota) => (
                          <li
                            key={kota}
                            role="option"
                            aria-selected={kota === selectedKota}
                            className={`home-kota-dropdown__item${kota === selectedKota ? " selected" : ""}`}
                            onClick={() => { setSelectedKota(kota); setDropdownOpen(false); setKotaSearch(""); }}
                          >
                            {kota}
                          </li>
                        ))
                        : <li className="home-kota-dropdown__empty">Kota tidak ditemukan</li>
                      }
                    </ul>
                  </div>
                )}
              </div>

              <button 
                className="home-search__button" 
                type="submit" 
                aria-label="Cari"
              >
                <Search size={18} strokeWidth={2.5} />
              </button>
            </form>
          </div>
        </div>
      </section>

      {/* ── TERBARU / IKLAN SECTION ── */}
      <section className="reko-section">
        <div className="reko-inner">
          <h2 className="reko-title"></h2>

          {/* Ads carousel */}
          {adsData.length > 0 ? (
            <div className="ads-carousel">
              <button
                className="ads-carousel__nav ads-carousel__nav--prev"
                onClick={() => setCurrentAdIndex((prev) => Math.max(0, prev - 1))}
                aria-label="Previous slide"
              >
                ‹
              </button>
              <div className="ads-carousel__track" style={{ transform: `translateX(-${currentAdIndex * 33.33}%)` }}>
                {[...adsData, ...adsData].map((ad, index) => (
                  <Link key={`${ad.id}-${index}`} to={`/business/${ad.businessId}`} className="ad-card">
                    <div className="ad-card__img-wrap">
                      <img src={ad.img} alt={ad.name} className="ad-card__img" loading="lazy" />
                      <div className="ad-card__img-overlay">
                        <button
                          type="button"
                          className={`ad-card__save${saved[ad.id] ? " saved" : ""}`}
                          onClick={(e) => { e.preventDefault(); toggleSave(ad.id); }}
                          aria-label="Simpan"
                        >
                          <Bookmark size={13} fill={saved[ad.id] ? "currentColor" : "none"} />
                          <span>Simpan</span>
                        </button>
                        <span className="ad-card__views">
                          <Eye size={13} />
                          <span>Pratinjau</span>
                        </span>
                      </div>
                    </div>
                    <div className="ad-card__body">
                      <h3 className="ad-card__name">{ad.name}</h3>
                      <p className="ad-card__category">{ad.desc}</p>
                  </div>
                </Link>
              ))}
            </div>
            <button
              className="ads-carousel__nav ads-carousel__nav--next"
              onClick={() => setCurrentAdIndex((prev) => Math.min(adsData.length - 3, prev + 1))}
              aria-label="Next slide"
            >
              ›
            </button>
          </div>
          ) : (
            <div className="ads-empty-state">
              <Megaphone size={48} style={{ opacity: 0.5 }} />
              <p>Belum ada bisnis yang sedang beriklan</p>
            </div>
          )}
        </div>
      </section>

      {/* ── KATEGORI SECTION ── */}
      <section className="category-section">
        <div className="category-inner">
          {/* Category tabs */}
          <div className="reko-tabs">
            {categories.map((cat) => (
              <Link
                key={cat.id}
                to={`/category/${cat.id}`}
                className="reko-tab reko-tab--link"
              >
                <span className="reko-tab__icon">{cat.icon}</span>
                <span className="reko-tab__label">{cat.label}</span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ── KATEGORI SECTION ── */}
      <section className="smart-section">
        <div className="smart-inner">
          <h2 className="smart-title">Smart City &amp; Smart Village</h2>
          <p className="smart-subtitle">Info.Co.Id Mendorong Percepatan Program Pemerintah Smart City &amp; Smart Village</p>

          <div className="smart-grid">
            {smartCitiesData.length > 0 ? (
              smartCitiesData.map((city) => (
              <Link 
                key={city.id} 
                to={`/location/${city.slug}`}
                className="smart-card-link"
              >
                <div className="smart-card">
                  <img src={city.img} alt={city.name} className="smart-card__img" loading="lazy" />
                  <div className="smart-card__content">
                    <h3 className="smart-card__name">{city.name}</h3>
                    <p className="smart-card__count">{city.bisnis.toLocaleString("id-ID")} bisnis terdaftar</p>
                  </div>
                </div>
              </Link>
            ))
            ) : (
              <div className="smart-empty">
                <p>Belum ada data smart city.</p>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* ── CEPAT PENCARIAN SECTION ── */}
      <section className="quick-section">
        <div className="quick-inner">
          <div className="quick-text">
            <h2 className="quick-title">Cepat dan Memudahkan Pencarian</h2>
            <p className="quick-subtitle">Mudah Menemukan Pelaku Usaha Skala Terkecil</p>
            <div className="quick-steps">
              {QUICK_STEPS.map((step) => (
                <div key={step.num} className="quick-step">
                  <div className="quick-step__num">{step.num}-</div>
                  <div>
                    <p className="quick-step__title">{step.title}</p>
                    <p className="quick-step__desc">{step.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
          <div className="quick-img-wrap">
            <img
              src="https://images.unsplash.com/photo-1537996194471-e657df975ab4?w=700&h=500&fit=crop"
              alt="Ilustrasi pencarian bisnis"
              className="quick-img"
            />
          </div>
        </div>
      </section>

      {/* ── TEMUKAN TEMPAT BARU SECTION ── */}
      <section className="temukan-section">
        <div className="temukan-inner">
          <h2 className="temukan-title">Temukan Tempat Baru</h2>
          <p className="temukan-subtitle">
            Temukan Dihalaman Kami Untuk Dapat Membantu Dalam Menemukan Pelaku Usaha Hingga Skala Terkecil
          </p>

          {loadingData ? (
            <InlineSpinner text="Memuat data bisnis..." />
          ) : (
          <div className="temukan-grid">
            {filteredTemukanData.map((bisnis) => (
              <Link key={bisnis.id} to={`/business/${bisnis.id}`} className="biz-card biz-card--link">
                {/* Image */}
                <div className="biz-card__img-wrap">
                  <img src={bisnis.img} alt={bisnis.name} className="biz-card__img" loading="lazy" />
                  <div className="biz-card__img-overlay">
                    <button
                      type="button"
                      className={`biz-card__save${saved[bisnis.id] ? " saved" : ""}`}
                      onClick={(e) => { e.preventDefault(); toggleSave(bisnis.id); }}
                      aria-label="Simpan"
                    >
                      <Bookmark size={13} fill={saved[bisnis.id] ? "currentColor" : "none"} />
                      <span>Simpan</span>
                    </button>
                    <span className="biz-card__views">
                      <Eye size={13} />
                      <span>Pratinjau</span>
                    </span>
                  </div>
                </div>

                {/* Body */}
                <div className="biz-card__body">
                  <h3 className="biz-card__name">{bisnis.name}</h3>
                  <div className="biz-card__categories">
                    <p className="biz-card__category">
                      <span className="biz-card__cat-dot" style={{ background: bisnis.categoryColor }} />
                      {bisnis.category}
                    </p>
                    {bisnis.subCategory && (
                      <p className="biz-card__category biz-card__category--sub">
                        <span className="biz-card__cat-separator">›</span>
                        {bisnis.subCategory}
                      </p>
                    )}
                  </div>
                  <div className="biz-card__tags">
                    {bisnis.tags.map((tag) => (
                      <span key={tag} className="biz-card__tag">
                        <Tag size={11} />{tag}
                      </span>
                    ))}
                  </div>
                  <div className="biz-card__footer">
                    <span className="biz-card__location">
                      <MapPin size={12} />{bisnis.location}
                    </span>
                    <span className={`biz-card__cta${bisnis.open ? "" : " closed"}`}>
                      {bisnis.open ? "Buka Sekarang →" : "Tutup Sekarang!"}
                    </span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
          )}
        </div>
      </section>

      {/* ── TESTIMONIALS SECTION ── */}
      <section className="testi-section">
        <div className="testi-inner">
          <h2 className="testi-title">Apa Yang Mereka Katakan</h2>

          <div className="testi-grid">
            {testimonialsData.length > 0 ? (
              testimonialsData.map((testi) => (
              <div key={testi.id} className="testi-card">
                <div className="testi-card__avatar-wrap">
                  <img src={testi.avatar} alt={testi.name} className="testi-card__avatar" loading="lazy" />
                </div>
                <div className="testi-card__content">
                  <h3 className="testi-card__name">{testi.name}</h3>
                  <div className="testi-card__role-container">
                    <div className="testi-card__role-line" />
                    <span className="testi-card__role">{testi.role}</span>
                  </div>
                  <p className="testi-card__text">{testi.text}</p>
                </div>
              </div>
            ))
            ) : (
              <div className="testi-empty">
                <p>Belum ada testimoni. Jadilah yang pertama memberikan testimoni!</p>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* ── KEY FEATURES SECTION ── */}
      <section className="features-section">
        <div className="features-inner">
          <div className="features-grid">
            {FEATURES_DATA.map((feat) => (
              <div key={feat.id} className="feat-card">
                <div className="feat-card__icon-wrap">
                  {feat.icon}
                </div>
                <h3 className="feat-card__title">{feat.title}</h3>
                <p className="feat-card__text">{feat.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── BERBAGI PENGALAMAN SECTION ── */}
      <section className="blog-section">
        <div className="blog-inner">
          <h2 className="blog-title">Berbagi Pengalaman Mereka</h2>
          <p className="blog-subtitle">Bagikan Pengalaman Dan Info Anda Di Info.co.id.</p>

          <div className="blog-grid">
            {blogsData.length > 0 ? (
              blogsData.map((post) => (
              <Link key={post.id} to="/blog" className="blog-card blog-card--link">
                <div className="blog-card__img-wrap">
                  <img src={post.img} alt={post.title} className="blog-card__img" loading="lazy" />
                </div>
                <div className="blog-card__body">
                  <p className="blog-card__category">{post.category}</p>
                  <h3 className="blog-card__title">{post.title}</h3>
                  <div className="blog-card__footer">
                    <span className="blog-card__meta">
                      <User size={13} />
                      <span>{post.author}</span>
                    </span>
                    <span className="blog-card__meta">
                      <Calendar size={13} />
                      <span>{post.date}</span>
                    </span>
                  </div>
                </div>
              </Link>
            ))
            ) : (
              <div className="blog-empty">
                <p>Belum ada artikel blog.</p>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer className="footer">
        <div className="footer-inner">
          <div className="footer-cols">
            {/* Brand/Logo Col */}
            <div className="footer-col footer-col--brand">
              <Link to="/" className="footer-logo">
                <img src={logoImg} alt="Info.co.id" className="footer-logo__img" />
              </Link>
              <p className="footer-desc">
                info.co.id adalah portal informasi yang menyajikan data dan berita terpercaya dari berbagai sumber resmi di Indonesia.
              </p>
              <div className="footer-social">
                <a href="#" className="footer-social__link" aria-label="Instagram">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect>
                    <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path>
                    <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line>
                  </svg>
                </a>
                <a href="#" className="footer-social__link" aria-label="Twitter">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M22 4s-.7 2.1-2 3.4c1.6 10-9.4 17.3-18 11.6 2.2.1 4.4-.6 6-2C3 15.5.5 9.6 3 5c2.2 2.6 5.6 4.1 9 4-.9-4.2 4-6.6 7-3.8 1.1 0 3-1.2 3-1.2z"></path>
                  </svg>
                </a>
                <a href="#" className="footer-social__link" aria-label="Facebook">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"></path>
                  </svg>
                </a>
                <a href="#" className="footer-social__link" aria-label="WhatsApp">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"></path>
                  </svg>
                </a>
                <a href="#" className="footer-social__link" aria-label="YouTube">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M22.54 6.42a2.78 2.78 0 0 0-1.94-2C18.88 4 12 4 12 4s-6.88 0-8.6.46a2.78 2.78 0 0 0-1.94 2A29 29 0 0 0 1 11.75a29 29 0 0 0 .46 5.33A2.78 2.78 0 0 0 3.4 19c1.72.46 8.6.46 8.6.46s6.88 0 8.6-.46a2.78 2.78 0 0 0 1.94-2 29 29 0 0 0 .46-5.25 29 29 0 0 0-.46-5.33z"></path>
                    <polygon points="9.75 15.02 15.5 11.75 9.75 8.48 9.75 15.02"></polygon>
                  </svg>
                </a>
              </div>
            </div>

            {/* Col 1 - Tentang Kami */}
            <div className="footer-col">
              <h4 className="footer-heading">Tentang Kami</h4>
              <ul className="footer-links">
                <li><Link to="/about">Tentang Info.co.id</Link></li>
                <li><Link to="/vision-mission">Visi &amp; Misi</Link></li>
                <li><Link to="/partnership-career">Kerjasama &amp; Karir</Link></li>
              </ul>
            </div>

            {/* Col 2 - Bantuan */}
            <div className="footer-col">
              <h4 className="footer-heading">Bantuan</h4>
              <ul className="footer-links">
                <li><a href="#">FAQ</a></li>
                <li><Link to="/terms">Syarat &amp; Ketentuan</Link></li>
                <li><Link to="/contact">Hubungi Kami</Link></li>
              </ul>
            </div>

            {/* Col 3 - Kontak Kami */}
            <div className="footer-col">
              <h4 className="footer-heading">Kontak Kami</h4>
              <ul className="footer-links">
                <li><a href="mailto:support@info.co.id">support@info.co.id</a></li>
                <li><span className="footer-text">(021) 1234 5678</span></li>
                <li><span className="footer-text">Jalan Mercurius 16680 Dramaga West Java</span></li>
              </ul>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="footer-bottom">
          <div className="footer-bottom__inner">
            <p className="footer-copyright">
              &copy; 2024 Info.co.id. All rights reserved.
            </p>
            <div className="footer-bottom-links">
              <a href="#">Privasi</a>
              <Link to="/terms">Syarat &amp; Ketentuan</Link>
              <a href="#">Sitemap</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}