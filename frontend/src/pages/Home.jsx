import { useState, useRef, useEffect } from "react";
  import { Link, useNavigate } from "react-router-dom";
  import api from "../utils/api";
  import "./Home.css";
  import Navbar from "../components/Navbar";
  import { SMART_CITIES } from "../data/smartCities";
  import logoImg from "../assets/logo.png";
  import Loading from "../components/Loading";
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
    ChevronDown as ChevronDownIcon,
    Pointer,
    Rocket,
    BookOpen,
    User,
    Calendar,
  } from "lucide-react";

  /* ── Indonesian cities ── */
  const KOTA_INDONESIA = [
    "Jakarta", "Surabaya", "Bandung", "Medan", "Bekasi", "Tangerang", "Depok",
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

  /* ── Mock business data ── */
  const BISNIS_DATA = [
    {
      id: 1, name: "Amel Irwanto cake", category: "Pertokoan",
      tags: ["Amel irwanto cake"], location: "Kabupaten Bogor",
      views: "Pratinjau", status: "Buka Sekarang",
      img: "https://images.unsplash.com/photo-1565958011703-44f9829ba187?w=400&h=250&fit=crop",
    },
    {
      id: 2, name: "Warung Makan Sederhana", category: "Cafe & Restaurant",
      tags: ["Warung makan", "Nasi padang"], location: "Kota Bogor",
      views: "Pratinjau", status: "Buka Sekarang",
      img: "https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=400&h=250&fit=crop",
    },
    {
      id: 3, name: "Toko Elektronik Jaya", category: "Elektronik & Gadget",
      tags: ["Handphone", "Aksesoris"], location: "Kabupaten Bogor",
      views: "Pratinjau", status: "Buka Sekarang",
      img: "https://images.unsplash.com/photo-1491933382434-500287f9b54b?w=400&h=250&fit=crop",
    },
    {
      id: 4, name: "Salon & Spa Cantik", category: "Pertokoan",
      tags: ["Salon", "Perawatan"], location: "Kota Depok",
      views: "Pratinjau", status: "Buka Sekarang",
      img: "https://images.unsplash.com/photo-1560066984-138dadb4c035?w=400&h=250&fit=crop",
    },
    {
      id: 5, name: "Bengkel Motor Makmur", category: "Servis & Tukang",
      tags: ["Bengkel", "Motor", "Oli"], location: "Kabupaten Bekasi",
      views: "Pratinjau", status: "Buka Sekarang",
      img: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400&h=250&fit=crop",
    },
    {
      id: 6, name: "Wisata Alam Puncak", category: "Wisata",
      tags: ["Wisata", "Alam", "Liburan"], location: "Kabupaten Bogor",
      views: "Pratinjau", status: "Buka Sekarang",
      img: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400&h=250&fit=crop",
    },
  ];

  /* ── Data kota Smart City sekarang diimpor dari src/data/smartCities.js
     supaya selalu sinkron dengan halaman SmartCity.jsx ── */


  /* ── Ads/Iklan data ── */
  const ADS_DATA = [
    {
      id: 1, businessId: 1, img: "https://images.unsplash.com/photo-1565958011703-44f9829ba187?w=800&h=400&fit=crop",
      name: "Amel Irwanto cake", desc: "Kue lezat berkualitas tinggi untuk momen istimewa Anda"
    },
    {
      id: 2, businessId: 2, img: "https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=800&h=400&fit=crop",
      name: "Warung Makan Sederhana", desc: "Masakan Padang autentik dengan cita rasa tradisional"
    },
    {
      id: 3, businessId: 3, img: "https://images.unsplash.com/photo-1491933382434-500287f9b54b?w=800&h=400&fit=crop",
      name: "Toko Elektronik Jaya", desc: "Gadget terbaru dan aksesoris terlengkap bergaransi"
    },
    {
      id: 4, businessId: 4, img: "https://images.unsplash.com/photo-1560066984-138dadb4c035?w=800&h=400&fit=crop",
      name: "Salon & Spa Cantik", desc: "Perawatan kecantikan premium dan spa relaksasi terbaik"
    },
  ];

  /* ── How it works steps ── */
  const QUICK_STEPS = [
    { num: "1", title: "Ketik Kata Kunci", desc: "Pemilihan kata kunci akan mempercepat dalam pencarian." },
    { num: "2", title: "Ketik Lokasi", desc: "Anda dapat menemukan lokasi secara mudah dengan mengetik daerah yang Anda cari." },
    { num: "3", title: "Temukan Pencarian", desc: "Penuhi semua keperluan dan kebutuhan Anda." },
  ];

  /* ── Temukan Tempat Baru data ── */
  const TEMUKAN_DATA = [
    {
      id: 101, name: "Global Bakery Leuwiliang", category: "Pertokoan", categoryColor: "#007570",
      tags: ["Global Bakery Leuwiliang"], location: "Kabupaten Bogor", open: true,
      img: "https://images.unsplash.com/photo-1509440159596-0249088772ff?w=400&h=240&fit=crop",
    },
    {
      id: 102, name: "TK Triwala", category: "Yayasan", categoryColor: "#f59e0b",
      tags: ["Tk Triwala"], location: "Kuningan", open: false,
      img: "https://images.unsplash.com/photo-1503676260728-1c00da094a0b?w=400&h=240&fit=crop",
    },
    {
      id: 103, name: "Bunda Diana", category: "Pertokoan", categoryColor: "#007570",
      tags: ["Bunda Diana"], location: "Kabupaten Bogor", open: true,
      img: "https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=400&h=240&fit=crop",
    },
    {
      id: 104, name: "Rumah Makan Athiam", category: "Cafe & Restaurant", categoryColor: "#0ea5e9",
      tags: ["Rumah Makan Athiam"], location: "Sukabumi", open: true,
      img: "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=400&h=240&fit=crop",
    },
    {
      id: 105, name: "Rumah Makan Cikole Sukabumi", category: "Cafe & Restaurant", categoryColor: "#0ea5e9",
      tags: ["Rumah Makan Cikole Sukabumi"], location: "Sukabumi", open: true,
      img: "https://images.unsplash.com/photo-1550966871-3ed3cbe818b5?w=400&h=240&fit=crop",
    },
    {
      id: 106, name: "Toko Kue Ibu Nanih", category: "Pertokoan", categoryColor: "#007570",
      tags: ["Toko Kue Ibu Nanih"], location: "Kabupaten Bogor", open: true,
      img: "https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=400&h=240&fit=crop",
    },
    {
      id: 107, name: "Kantor Kecamatan Sawangan", category: "Kantor Pemerintah", categoryColor: "#10b981",
      tags: ["Kantor Kecamatan Sawangan"], location: "Depok", open: true,
      img: "https://images.unsplash.com/photo-1562654501-a0ccc0fc3fb1?w=400&h=240&fit=crop",
    },
    {
      id: 108, name: "Kantor Kecamatan Sawangan", category: "Kantor Pemerintah", categoryColor: "#10b981",
      tags: ["Kantor Kecamatan Sawangan"], location: "Depok", open: true,
      img: "https://images.unsplash.com/photo-1486325212027-8081e485255e?w=400&h=240&fit=crop",
    },
    {
      id: 109, name: "Amel Irwanto cake", category: "Pertokoan", categoryColor: "#007570",
      tags: ["Amel irwanto cake"], location: "Kabupaten Bogor", open: true,
      img: "https://images.unsplash.com/photo-1565958011703-44f9829ba187?w=400&h=240&fit=crop",
    },
  ];

  /* ── Testimonials data ── */
  const TESTIMONIALS_DATA = [
    {
      id: 1,
      name: "Nindi Afrilia",
      role: "Marketing Executive",
      text: "Dengan adanya Surade.co.id cukup membantu untuk memudahkan melakukan pencarian yang ada di Indonesia",
      avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=120&h=120&fit=crop",
    },
    {
      id: 2,
      name: "Putri Indah lestari",
      role: "Research and Development",
      text: "What i liked most about the service was the consistent high quality service, which was excelent and friendly. Overall very satusfied with the programs.",
      avatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=120&h=120&fit=crop",
    },
    {
      id: 3,
      name: "Algi Triana",
      role: "Design Freelancer",
      text: "Keren... baru sehari dicek di google analytic sudah masuk beberapa session referal dari satujutalink.",
      avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=120&h=120&fit=crop",
    },
    {
      id: 4,
      name: "Fajar Septiawan",
      role: "Bussines Development",
      text: "Excellent !! This web-based information system helps the user in finding a variety of information, especially travel information with......Selengkapnya",
      avatar: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=120&h=120&fit=crop",
    },
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

  /* ── Blog/Experience data ── */
  const BLOG_DATA = [
    {
      id: 1,
      category: "Umum",
      title: "Cucurak Khas Bogor, sambut Bulan Ramadhan",
      author: "Hikmah Yusila",
      date: "15 Agustus 2017",
      img: "https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=400&h=260&fit=crop",
    },
    {
      id: 2,
      category: "Budaya",
      title: "Tradisi Grebeg Gethuk di Kota Magelang",
      author: "Hikmah Yusila",
      date: "16 Februari 2017",
      img: "https://images.unsplash.com/photo-1596422846543-75c6fc197f07?w=400&h=260&fit=crop",
    },
    {
      id: 3,
      category: "Kuliner",
      title: "Pasar Tiban Pahingan Magelang, Destinasi Wisata Kuliner Sambil Mendengarkan Pengajian",
      author: "Hikmah Yusila",
      date: "16 Februari 2017",
      img: "https://images.unsplash.com/photo-1572285870954-7b08e56f4c58?w=400&h=260&fit=crop",
    },
  ];

  export default function Home() {
    const navigate = useNavigate();
    const [selectedKota, setSelectedKota] = useState("Jakarta");
    const [kotaSearch, setKotaSearch] = useState("");
    const [dropdownOpen, setDropdownOpen] = useState(false);
    const [activeCategory, setActiveCategory] = useState("all");
    const [saved, setSaved] = useState({});
    const [selectedCity, setSelectedCity] = useState(null);
    const [searchKeyword, setSearchKeyword] = useState("");
    const [selectedSearchCategory, setSelectedSearchCategory] = useState("all");
    const [keywordDropdownOpen, setKeywordDropdownOpen] = useState(false);
    const [searchHistory, setSearchHistory] = useState([]);
    const [currentAdIndex, setCurrentAdIndex] = useState(0);
    const dropdownRef = useRef(null);
    const keywordDropdownRef = useRef(null);

    // Dynamic API state
    const [dbBusinesses, setDbBusinesses] = useState([]);
    const [dbCategories, setDbCategories] = useState([]);
    const [dbAds, setDbAds] = useState([]);
    const [loading, setLoading] = useState(true);
    const [apiError, setApiError] = useState(false);

    useEffect(() => {
      window.scrollTo(0, 0);
      const history = JSON.parse(localStorage.getItem("search_history") || "[]");
      setSearchHistory(history);

      async function loadData() {
        try {
          const busData = await api.get('/businesses');
          setDbBusinesses(busData);
          const catData = await api.get('/categories');
          setDbCategories(catData);
          // Public ad listing: the backend only returns ads whose owner still
          // has an active (non-expired) Premium business subscription. Free
          // accounts have no ads here, and an ad disappears automatically the
          // moment its owner's premium period ends - no manual step needed.
          const adsData = await api.get('/advertisements');
          setDbAds(adsData);
          setApiError(false);
        } catch (e) {
          console.error("Gagal memuat data dari API", e);
          setApiError(true);
        } finally {
          setLoading(false);
        }
      }
      loadData();
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
        setCurrentAdIndex((prev) => (prev + 1) % displayAds.length);
      }, 5000);
      return () => clearInterval(interval);
    }, [dbAds]);

    // Map real advertisements (Premium-only, auto-hidden on expiry) into the
    // same shape the carousel already knows how to render. Falls back to the
    // static demo cards only when there are genuinely no live ads yet.
    const displayAds = dbAds.length > 0
      ? dbAds.map((ad) => ({
          id: ad.id,
          categorySlug: ad.category?.slug || "all",
          img: ADS_DATA[ad.id % ADS_DATA.length]?.img || ADS_DATA[0].img,
          name: ad.company_name,
          desc: ad.title,
        }))
      : ADS_DATA.map((ad) => ({ ...ad, categorySlug: null }));

    // Map API data to view schemas
    // Sama seperti Category.jsx: contoh/dummy cuma dipakai kalau API beneran
    // gagal (apiError) - bukan cuma karena masih dalam proses loading, biar
    // gak ada "kedipan" kategori/bisnis contoh sebelum data asli muncul.
    const categoriesList = dbCategories.length > 0 ? [
      { id: "all", label: "Semua", icon: <Store size={26} strokeWidth={1.7} /> },
      ...dbCategories.map(c => ({
        id: c.slug,
        label: c.name,
        icon: c.name.toLowerCase().includes('cafe') ? <Coffee size={26} strokeWidth={1.7} /> :
              c.name.toLowerCase().includes('gadget') ? <Smartphone size={26} strokeWidth={1.7} /> :
              c.name.toLowerCase().includes('fashion') ? <Shirt size={26} strokeWidth={1.7} /> :
              c.name.toLowerCase().includes('servis') ? <Wrench size={26} strokeWidth={1.7} /> :
              c.name.toLowerCase().includes('wisata') ? <MapPin size={26} strokeWidth={1.7} /> :
              <Store size={26} strokeWidth={1.7} />
      }))
    ] : (apiError ? CATEGORIES : []);

    const businessesList = dbBusinesses.length > 0 ? dbBusinesses.map(b => ({
      id: b.id,
      name: b.title,
      category: b.category?.name || "Lainnya",
      tags: [b.title],
      location: b.address,
      views: "Pratinjau",
      status: b.status === "approved" ? "Buka Sekarang" : "Pending",
      img: b.image || "https://images.unsplash.com/photo-1560066984-138dadb4c035?w=400&h=250&fit=crop",
      is_premium: b.is_premium_active,
      categoryColor: "#159c60"
    })) : (apiError ? [...TEMUKAN_DATA, ...BISNIS_DATA] : []);

    const filteredKota = KOTA_INDONESIA.filter((k) =>
      k.toLowerCase().includes(kotaSearch.toLowerCase())
    );

    const filteredBisnis = activeCategory === "all"
      ? businessesList
      : businessesList.filter((b) =>
        b.category.toLowerCase().includes(
          categoriesList.find((c) => c.id === activeCategory)?.label.split(" ")[0].toLowerCase() ?? ""
        )
      );

    const cityFilteredBisnis = selectedCity
      ? businessesList.filter((b) => b.location.includes(selectedCity))
      : businessesList;

    const searchFilteredBisnis = searchKeyword
      ? businessesList.filter((b) =>
          b.name.toLowerCase().includes(searchKeyword.toLowerCase()) ||
          b.category.toLowerCase().includes(searchKeyword.toLowerCase()) ||
          b.tags.some(tag => tag.toLowerCase().includes(searchKeyword.toLowerCase())) ||
          b.location.toLowerCase().includes(searchKeyword.toLowerCase())
        )
      : businessesList;

    // Combine all filters
    const finalFilteredBisnis = businessesList.filter((b) => {
      const matchesCategory = activeCategory === "all" ||
        b.category.toLowerCase().includes(
          categoriesList.find((c) => c.id === activeCategory)?.label.split(" ")[0].toLowerCase() ?? ""
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
    const filteredTemukanData = businessesList.filter((b) => {
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
        ].slice(0, 5);
        localStorage.setItem("search_history", JSON.stringify(updatedHistory));
        setSearchHistory(updatedHistory);
      }
      navigate(`/category/${selectedSearchCategory}?q=${encodeURIComponent(searchKeyword)}&location=${encodeURIComponent(selectedKota)}`);
    };

    if (loading) {
      return <Loading />;
    }

    return (
      <div className="home-page">
        {/* ── NAVBAR ── */}
        <Navbar />

        {apiError && (
          <div style={{
            background: "#fff7ed", color: "#9a3412", border: "1px solid #fdba74",
            padding: "10px 24px", fontSize: "0.9rem", textAlign: "center",
          }}>
            ⚠️ Tidak bisa terhubung ke server backend. Menampilkan data contoh sementara.
            Pastikan backend Laravel berjalan (<code>php artisan serve</code>) di http://127.0.0.1:8000.
          </div>
        )}

        {/* ── HERO BANNER ── */}
        <section className="home-hero">
          <div className="home-hero__bg" />
          <div className="home-hero__content">
            <h1 
              className="home-hero__title" 
              style={{
                background: 'linear-gradient(100deg, #fff0ed 0%, #fff0ed 32%, #B52809 44%, #d6380c 52%, #8f1a06 60%, #fff0ed 72%, #fff0ed 100%)',
                WebkitBackgroundClip: 'text',
                backgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                color: '#B52809',
                backgroundSize: '260% 100%',
                animation: 'home-hero-shimmer 4.5s linear infinite'
              }}
            >
              Surade.co.id
            </h1>
            <p className="home-hero__subtitle">Semua Ada Disini</p>

            {/* Search Bar */}
            <div className="home-search">
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
                                di {categoriesList.find(c => c.id === item.category)?.label || "Semua"}
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
                        {categoriesList.map((cat) => (
                          <li
                            key={cat.id}
                            className="home-keyword-dropdown__item home-keyword-dropdown__item--category"
                            onClick={() => {
                              setSelectedSearchCategory(cat.id);
                              setKeywordDropdownOpen(false);
                              navigate(`/category/${cat.id}?location=${encodeURIComponent(selectedKota)}`);
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

              <div className="home-search__group home-search__group--lokasi" ref={dropdownRef}>
                <span className="home-search__label">Lokasi</span>
                <button
                  type="button"
                  className="home-search__kota-btn"
                  onClick={() => setDropdownOpen((v) => !v)}
                >
                  <span>{selectedKota}</span>
                  <ChevronDown size={14} className={`home-search__kota-caret${dropdownOpen ? " open" : ""}`} />
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
                type="button" 
                aria-label="Cari"
                onClick={handleSearchSubmit}
              >
                <Search size={18} strokeWidth={2.5} />
              </button>
            </div>
          </div>
        </section>

        {/* ── TERBARU / IKLAN SECTION ── */}
        <section className="reko-section">
          <div className="reko-inner">
            <h2 className="reko-title"></h2>

            {/* Ads carousel */}
            <div className="ads-carousel">
              <button
                className="ads-carousel__nav ads-carousel__nav--prev"
                onClick={() => setCurrentAdIndex((prev) => Math.max(0, prev - 1))}
                aria-label="Previous slide"
              >
                ‹
              </button>
              <div className="ads-carousel__track" style={{ transform: `translateX(-${currentAdIndex * 33.33}%)` }}>
                {[...displayAds, ...displayAds].map((ad, index) => (
                  <Link
                    key={`${ad.id}-${index}`}
                    to={ad.categorySlug ? `/category/${ad.categorySlug}` : `/business/${ad.businessId}`}
                    className="ad-card"
                  >
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
                onClick={() => setCurrentAdIndex((prev) => Math.min(displayAds.length - 3, prev + 1))}
                aria-label="Next slide"
              >
                ›
              </button>
            </div>
          </div>
        </section>

        {/* ── KATEGORI SECTION ── */}
        <section className="category-section">
          <div className="category-inner">
            {/* Category tabs */}
            {loading && categoriesList.length === 0 ? null : (
              <div className="reko-tabs">
                {categoriesList.map((cat) => (
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
            )}
          </div>
        </section>

        {/* ── KATEGORI SECTION ── */}
        <section className="smart-section">
          <div className="smart-inner">
            <h2 className="smart-title">Smart City &amp; Smart Village</h2>
            <p className="smart-subtitle">Surade.co.id Mendorong Percepatan Program Pemerintah Smart City &amp; Smart Village</p>

            <div className="smart-grid">
              {SMART_CITIES.map((city) => (
                <Link 
                  key={city.id} 
                  to={`/smart-city/${city.id}`}
                  className="smart-card-link"
                >
                  <div 
                    className={`smart-card${selectedCity === city.name ? " active" : ""}`} 
                    tabIndex={0}
                    onClick={() => setSelectedCity(selectedCity === city.name ? null : city.name)}
                  >
                    <img src={city.img} alt={city.name} className="smart-card__img" loading="lazy" />
                    <div className="smart-card__overlay" />
                    <span className="smart-card__name">{city.name}</span>
                    <div className="smart-card__tooltip">
                      <span className="smart-card__tooltip-count">{city.bisnis.toLocaleString("id-ID")}</span>
                      <span className="smart-card__tooltip-label"> bisnis terdaftar</span>
                    </div>
                  </div>
                </Link>
              ))}
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
                    <p className="biz-card__category">
                      <span className="biz-card__cat-dot" style={{ background: bisnis.categoryColor }} />
                      {bisnis.category}
                    </p>
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
          </div>
        </section>

        {/* ── TESTIMONIALS SECTION ── */}
        <section className="testi-section">
          <div className="testi-inner">
            <h2 className="testi-title">Apa Yang Mereka Katakan</h2>

            <div className="testi-grid">
              {TESTIMONIALS_DATA.map((testi) => (
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
              ))}
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
            <p className="blog-subtitle">Bagikan Pengalaman Dan Info Anda Di Surade.co.id.</p>

            <div className="blog-grid">
              {BLOG_DATA.map((post) => (
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
              ))}
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
                  <img src={logoImg} alt="Surade.co.id" className="footer-logo__img" />
                </Link>
                <p className="footer-desc">
                  Surade.co.id adalah portal informasi yang menyajikan data dan berita terpercaya dari berbagai sumber resmi di Indonesia.
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
                  <li><Link to="/about">Tentang Surade.co.id</Link></li>
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
                  <li><a href="mailto:support@Surade.co.id">support@Surade.co.id</a></li>
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
                &copy; 2024 Surade.co.id. All rights reserved.
              </p>
            </div>
          </div>
        </footer>
      </div>
    );
  }