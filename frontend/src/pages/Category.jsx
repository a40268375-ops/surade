import { useParams, Link, useSearchParams, useNavigate } from "react-router-dom";
import { useEffect, useState, useRef } from "react";
import api, { getImageUrl } from "../utils/api";
import { useAuth } from "../context/AuthContext";
import { DEFAULT_CATEGORY_TABS, iconForCategory } from "../utils/categoryIcons.jsx";
import Navbar from "../components/Navbar";
import SearchBar from "../components/SearchBar";
import Loading from "../components/Loading";
import {
  Search,
  MapPin,
  Bookmark,
  Eye,
  Tag,
  Store,
  Coffee,
  Smartphone,
  Shirt,
  Wrench,
  Building2,
  Camera,
  Fuel,
  Car,
  GraduationCap,
  Heart,
  Music,
  Users,
  Info,
  SlidersHorizontal,
  Star,
  BadgeCheck,
  SearchX,
  X,
  ChevronLeft,
  ChevronRight,
  DollarSign,
} from "lucide-react";
import BusinessMap from "../components/BusinessMap";
import "./Category.css";

const CATEGORIES = DEFAULT_CATEGORY_TABS;

/* ── Rentang harga (murah → mahal), dipakai untuk filter di toolbar kategori ── */
const PRICE_BANDS = [
  { id: "all", label: "Semua Harga" },
  { id: "0-50000", label: "Rp0 - Rp50.000", min: 0, max: 50000 },
  { id: "50000-100000", label: "Rp50.000 - Rp100.000", min: 50000, max: 100000 },
  { id: "100000-250000", label: "Rp100.000 - Rp250.000", min: 100000, max: 250000 },
  { id: "250000+", label: "Rp250.000 ke atas", min: 250000, max: Infinity },
];

/* ── Mock business data ── */
const BISNIS_DATA = [
  {
    id: 1, name: "Amel Irwanto cake", category: "Pertokoan",
    tags: ["Amel irwanto cake"], location: "Kabupaten Bogor",
    views: "Pratinjau", status: "Buka Sekarang", rating: 4.5,
    img: "https://images.unsplash.com/photo-1565958011703-44f9829ba187?w=400&h=250&fit=crop",
  },
  {
    id: 2, name: "Warung Makan Sederhana", category: "Cafe & Restaurant",
    tags: ["Warung makan", "Nasi padang"], location: "Kota Bogor",
    views: "Pratinjau", status: "Buka Sekarang", rating: 4.7,
    img: "https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=400&h=250&fit=crop",
  },
  {
    id: 3, name: "Toko Elektronik Jaya", category: "Elektronik & Gadget",
    tags: ["Handphone", "Aksesoris"], location: "Kabupaten Bogor",
    views: "Pratinjau", status: "Buka Sekarang", rating: 4.2,
    img: "https://images.unsplash.com/photo-1491933382434-500287f9b54b?w=400&h=250&fit=crop",
  },
  {
    id: 4, name: "Salon & Spa Cantik", category: "Pertokoan",
    tags: ["Salon", "Perawatan"], location: "Kota Depok",
    views: "Pratinjau", status: "Buka Sekarang", rating: 4.8,
    img: "https://images.unsplash.com/photo-1560066984-138dadb4c035?w=400&h=250&fit=crop",
  },
  {
    id: 5, name: "Bengkel Motor Makmur", category: "Servis & Tukang",
    tags: ["Bengkel", "Motor", "Oli"], location: "Kabupaten Bekasi",
    views: "Pratinjau", status: "Buka Sekarang", rating: 4.3,
    img: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400&h=250&fit=crop",
  },
  {
    id: 6, name: "Wisata Alam Puncak", category: "Wisata",
    tags: ["Wisata", "Alam", "Liburan"], location: "Kabupaten Bogor",
    views: "Pratinjau", status: "Buka Sekarang", rating: 4.9,
    img: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400&h=250&fit=crop",
  },
];

export default function Category() {
  const { categoryId } = useParams();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const queryQ = searchParams.get("q") || "";
  const queryLocation = searchParams.get("location") || "";

  const [activeCategory, setActiveCategory] = useState(categoryId || "all");

  // PERBAIKAN: sebelumnya "activeCategory" cuma di-set SEKALI pas komponen
  // ini pertama kali dimuat (dari useState di atas). Jadi kalau pindah
  // kategori TANPA reload penuh halaman (misal dari hasil pencarian yang
  // langsung mengarah ke /category/perkantoran padahal sebelumnya sudah
  // ada di halaman /category/lain), URL-nya berubah tapi state
  // "activeCategory" di React tetap nyangkut ke kategori yang lama - jadi
  // daftar bisnisnya ikut kefilter pakai kategori lama itu (kosong/salah),
  // sampai ada aksi lain (mis. reset filter) yang "memaksa" state-nya
  // ke-update. Sekarang activeCategory selalu disinkronkan ulang setiap
  // kali parameter :categoryId di URL berubah.
  useEffect(() => {
    setActiveCategory(categoryId || "all");
  }, [categoryId]);
  const [saved, setSaved] = useState({}); // { [businessId]: savedRecordId }
  const [savingIds, setSavingIds] = useState({}); // { [businessId]: true } while in-flight
  const { user: authUser } = useAuth();
  const [searchKeyword, setSearchKeyword] = useState(queryQ);
  const [sortBy, setSortBy] = useState("relevan");
  const [priceRange, setPriceRange] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const PAGE_SIZE = 4; // 2 kolom x 2 baris per halaman

  // Data asli dari API (bukan lagi data contoh/statis)
  const [dbCategories, setDbCategories] = useState([]);
  const [dbBusinesses, setDbBusinesses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [apiError, setApiError] = useState(false);

  useEffect(() => {
    window.scrollTo(0, 0);
    if (categoryId) {
      setActiveCategory(categoryId);
    }
  }, [categoryId]);

  useEffect(() => {
    setSearchKeyword(queryQ);
  }, [queryQ]);

  // Muat daftar bisnis yang sudah disimpan user, supaya ikon "Simpan"
  // langsung kelihatan aktif untuk bisnis yang sebelumnya sudah disimpan.
  useEffect(() => {
    if (!authUser) {
      setSaved({});
      return;
    }
    let cancelled = false;
    api.get("/my-saved-businesses")
      .then((rows) => {
        if (cancelled) return;
        const map = {};
        (rows || []).forEach((row) => {
          const bizId = row.business_id || row.business?.id;
          if (bizId) map[bizId] = row.id;
        });
        setSaved(map);
      })
      .catch(() => {});
    return () => { cancelled = true; };
  }, [authUser]);

  useEffect(() => {
    async function loadData() {
      setLoading(true);
      try {
        const [catData, busData] = await Promise.all([
          api.get("/categories"),
          api.get("/businesses"),
        ]);
        setDbCategories(catData);
        setDbBusinesses(busData);
        setApiError(false);
      } catch (e) {
        console.error("Gagal memuat data kategori/bisnis dari API", e);
        setApiError(true);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  // Tab kategori: pakai kategori asli (dengan slug asli) dari database.
  // PERBAIKAN: dulu fallback ke daftar contoh HANYA kalau `apiError` true -
  // jadi kalau API-nya sukses tapi tabel kategori di database memang masih
  // kosong (belum ada kategori dibuat), categoriesList jadi [] total dan
  // baris kategori di halaman ini kelihatan blank/kosong sama sekali.
  // Sekarang: selama masih loading, jangan tampilkan apa-apa dulu (biar
  // tidak "kedip" kategori contoh sebelum yang asli muncul) - tapi begitu
  // loading selesai dan kategori asli tetap kosong (apa pun sebabnya),
  // langsung pakai daftar contoh supaya baris kategori tidak pernah blank.
  const normalizeLabel = (s) => (s || "").trim().toLowerCase().replace(/\s+/g, " ");

  // PERBAIKAN: sebelumnya pencocokan bisnis <-> kategori pakai
  // "b.categorySlug === cat.id" sebagai andalan utama. Masalahnya, "cat.id"
  // untuk kategori bawaan (DEFAULT_CATEGORY_TABS) itu ID lokal yang
  // ditulis manual di kode (mis. "bisnis", "elektronik"), yang BISA SAJA
  // beda dengan slug asli yang tersimpan di database (mis. "bisnis-market",
  // "elektronik-gadget"). Kalau beda, jatuh ke fallback lama yang cuma
  // mencocokkan KATA PERTAMA nama kategori - gampang meleset, jadi kadang
  // kartu kategori nunjuk ke bisnis yang salah atau kosong padahal
  // sebenarnya ada. Sekarang dibuat SATU fungsi pencocokan yang dipakai
  // konsisten untuk filter bisnis MAUPUN untuk angka jumlah di badge -
  // supaya keduanya selalu nyambung/senada, dengan urutan pengecekan:
  //   1) slug asli dari database (paling akurat, kalau ada)
  //   2) nama kategori dicocokkan UTUH (bukan cuma kata pertama)
  //   3) baru kalau masih belum ketemu, dicocokkan sebagian (saling
  //      mengandung) sebagai jaring pengaman terakhir
  const categoryMatches = (business, cat) => {
    if (business.categorySlug && cat.id && business.categorySlug === cat.id) return true;
    const bizCat = normalizeLabel(business.category);
    const catLabel = normalizeLabel(cat.label);
    if (!bizCat || !catLabel) return false;
    if (bizCat === catLabel) return true;
    return bizCat.includes(catLabel) || catLabel.includes(bizCat);
  };

  const defaultLabelsSet = new Set(DEFAULT_CATEGORY_TABS.map((tab) => normalizeLabel(tab.label)));
  const seenExtraCatLabels = new Set();
  const categoriesList = [
    ...DEFAULT_CATEGORY_TABS,
    ...dbCategories
      // PERBAIKAN: endpoint "/categories" mengembalikan SEMUA baris kategori
      // secara rata (flat) - termasuk subkategori seperti "Agen Properti",
      // "Apotek", "Bank", "Bengkel Mobil", dst (yang punya parent_id terisi).
      // Sebelumnya semua itu ikut ditambahkan sebagai kotak kategori UTAMA
      // di grid ikon, padahal seharusnya cuma 14 kategori utama saja yang
      // tampil di sana (subkategori nempel di dalam menu "Informasi" /
      // halaman kategori masing-masing, bukan jadi kotak sendiri). Sekarang
      // difilter: cuma kategori yang TIDAK punya induk (parent_id kosong)
      // yang boleh ikut jadi kotak kategori utama tambahan.
      .filter((c) => !c.parent_id)
      .filter((c) => {
        const norm = normalizeLabel(c.name);
        if (DEFAULT_CATEGORY_TABS.some((tab) => tab.id === c.slug)) return false;
        if (defaultLabelsSet.has(norm)) return false;
        if (seenExtraCatLabels.has(norm)) return false;
        seenExtraCatLabels.add(norm);
        return true;
      })
      .map((c) => ({
        id: c.slug,
        label: c.name,
        icon: iconForCategory(c.name, { size: 24, strokeWidth: 1.5, iconKey: c.icon }),
      })),
  ];

  // Bisnis asli dari database, lengkap dengan slug kategori sungguhan supaya
  // pencocokan kategori akurat (tidak lagi menebak dari potongan nama label).
  // Sama seperti kategori: contoh cuma dipakai kalau API beneran gagal.
  const businessesList = dbBusinesses.length > 0
    ? dbBusinesses.map((b) => ({
        id: b.id,
        name: b.title,
        category: b.category?.name || "Lainnya",
        categorySlug: b.category?.slug || "",
        tags: [b.title],
        location: b.village || b.address,
        // Alamat lengkap (beda dari "location" di atas yang lebih suka
        // pakai nama desa singkat) - dipakai khusus di kartu popup peta
        // supaya orang bisa langsung lihat alamat sebenarnya tanpa perlu
        // buka halaman detail dulu.
        address: b.address || b.village || "",
        views: "Pratinjau",
        status: b.is_open_now ? "Buka Sekarang" : "Tutup Sekarang",
        img: b.image ? getImageUrl(b.image) : "https://images.unsplash.com/photo-1560066984-138dadb4c035?w=400&h=250&fit=crop",
        images: Array.isArray(b.images) ? b.images.map((p) => getImageUrl(p)) : [],
        hours: b.operating_hours || "",
        rating: b.rating ?? null,
        reviewCount: b.review_count ?? null,
        isPremium: !!b.is_premium_active,
        startingPrice: b.starting_price ?? null,
        // PERBAIKAN: latitude/longitude asli bisnis (kalau sudah diisi
        // pemilik usahanya) sebenarnya SUDAH ada di database & sudah
        // dikirim balik oleh API - cuma sebelumnya nggak ikut diambil di
        // sini, jadi peta selalu terpaksa pakai perkiraan level
        // desa/kota saja (lihat BusinessMap.jsx). Sekarang ikut
        // diteruskan, supaya peta bisa pakai titik lokasi ASLI kalau ada.
        latitude: b.latitude !== null && b.latitude !== undefined ? Number(b.latitude) : null,
        longitude: b.longitude !== null && b.longitude !== undefined ? Number(b.longitude) : null,
      }))
    : (apiError ? BISNIS_DATA : []);

  const filteredBisnis = activeCategory === "all"
    ? businessesList
    : businessesList.filter((b) => {
      const cat = categoriesList.find((c) => c.id === activeCategory);
      return cat ? categoryMatches(b, cat) : false;
    });

  const searchFilteredBisnis = filteredBisnis.filter((b) => {
    // Location filter
    // Jika query location tidak menghasilkan match (mis: mock data tidak punya "Jakarta"),
    // maunya fallback: tampilkan semua bisnis (abaikan filter location).
    const hasLocationConstraint = !!queryLocation && queryLocation !== "Semua";

    const matchesLocation = !hasLocationConstraint ||
      b.location.toLowerCase().includes(queryLocation.toLowerCase());

    // Keyword filter
    const matchesKeyword = !searchKeyword ||
      b.name.toLowerCase().includes(searchKeyword.toLowerCase()) ||
      b.category.toLowerCase().includes(searchKeyword.toLowerCase()) ||
      b.tags.some(tag => tag.toLowerCase().includes(searchKeyword.toLowerCase())) ||
      b.location.toLowerCase().includes(searchKeyword.toLowerCase());

    return matchesLocation && matchesKeyword;
  });

  // Filter rentang harga: dicocokkan dengan harga produk termurah milik
  // bisnis tersebut. Bisnis tanpa produk/harga sama sekali tidak
  // disembunyikan dari "Semua Harga", tapi tidak akan muncul di rentang
  // harga tertentu (karena harganya memang belum diketahui).
  const activePriceBand = PRICE_BANDS.find((p) => p.id === priceRange);
  function applyPriceFilter(list) {
    if (!activePriceBand || activePriceBand.id === "all") return list;
    return list.filter((b) =>
      b.startingPrice !== null &&
      b.startingPrice >= activePriceBand.min &&
      b.startingPrice < activePriceBand.max
    );
  }

  // Fallback: kalau ada filter location tapi hasilnya kosong,
  // tampilkan semua (abaikan filter location) agar halaman tidak kosong.
  const finalBisnisUnsorted = (
    queryLocation !== "" &&
    queryLocation !== "Semua" &&
    searchFilteredBisnis.length === 0
  )
    ? filteredBisnis.filter((b) => {
      const matchesKeyword = !searchKeyword ||
        b.name.toLowerCase().includes(searchKeyword.toLowerCase()) ||
        b.category.toLowerCase().includes(searchKeyword.toLowerCase()) ||
        b.tags.some(tag => tag.toLowerCase().includes(searchKeyword.toLowerCase())) ||
        b.location.toLowerCase().includes(searchKeyword.toLowerCase());
      return matchesKeyword;
    })
    : searchFilteredBisnis;

  const finalBisnis = [...applyPriceFilter(finalBisnisUnsorted)].sort((a, b) => {
    if (sortBy === "rating") return (b.rating ?? 0) - (a.rating ?? 0);
    if (sortBy === "nama") return a.name.localeCompare(b.name);
    return 0; // "relevan" → keep original order
  });

  // Balik ke halaman 1 setiap kali kata kunci/kategori/lokasi/urutan berubah,
  // supaya nggak nyangkut di halaman kosong dari pencarian sebelumnya.
  useEffect(() => {
    setCurrentPage(1);
  }, [searchKeyword, activeCategory, queryLocation, sortBy, priceRange]);

  const totalPages = Math.max(1, Math.ceil(finalBisnis.length / PAGE_SIZE));
  const safePage = Math.min(currentPage, totalPages);
  const paginatedBisnis = finalBisnis.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE);

  // Nomor halaman yang ditampilkan di pagination (dengan "..." kalau
  // halamannya banyak), meniru gaya referensi: selalu tampilkan halaman
  // pertama, terakhir, dan beberapa di sekitar halaman aktif.
  function getPageNumbers() {
    const pages = [];
    const delta = 1;
    for (let p = 1; p <= totalPages; p++) {
      if (p === 1 || p === totalPages || (p >= safePage - delta && p <= safePage + delta)) {
        pages.push(p);
      } else if (pages[pages.length - 1] !== "...") {
        pages.push("...");
      }
    }
    return pages;
  }

  // Jumlah bisnis per kategori, untuk badge di tab kategori. Pakai fungsi
  // pencocokan yang SAMA dengan yang dipakai buat memfilter daftar bisnis
  // di atas, supaya angkanya selalu sesuai dengan apa yang benar-benar
  // tampil begitu kategori itu diklik - tidak ada lagi angka yang bilang
  // "ada 1" tapi pas diklik kartunya ternyata kosong.
  const categoryCounts = categoriesList.reduce((acc, cat) => {
    acc[cat.id] = cat.id === "all"
      ? businessesList.length
      : businessesList.filter((b) => categoryMatches(b, cat)).length;
    return acc;
  }, {});

  const hasActiveFilters = !!searchKeyword || (!!queryLocation && queryLocation !== "Semua") || activeCategory !== "all" || priceRange !== "all";

  function resetFilters() {
    setSearchKeyword("");
    setSortBy("relevan");
    setPriceRange("all");
    setSearchParams({});
  }


  const handleSearchChange = (e) => {
    const val = e.target.value;
    setSearchKeyword(val);
    setSearchParams((prev) => {
      if (val) {
        prev.set("q", val);
      } else {
        prev.delete("q");
      }
      return prev;
    });
  };

  async function toggleSave(id) {
    if (!authUser) {
      window.location.href = "/login";
      return;
    }
    if (savingIds[id]) return;
    setSavingIds((prev) => ({ ...prev, [id]: true }));
    try {
      const existingRecordId = saved[id];
      if (existingRecordId) {
        await api.delete(`/saved-businesses/${existingRecordId}`);
        setSaved((prev) => {
          const next = { ...prev };
          delete next[id];
          return next;
        });
      } else {
        const result = await api.post("/saved-businesses", { business_id: id });
        setSaved((prev) => ({ ...prev, [id]: result.id }));
<<<<<<< HEAD
        // PERBAIKAN: sama seperti di Home.jsx - begitu berhasil disimpan
        // sebagai favorit, otomatis diarahkan ke Dashboard > Favorit
        // supaya langsung kelihatan sudah masuk daftar, tidak perlu
        // membuka Dashboard sendiri lalu mencari menu Favorit secara manual.
        setTimeout(() => navigate("/dashboard?tab=saved"), 500);
=======
>>>>>>> 43511c35c312291308bc3e9f249d166401282bda
      }
    } catch (err) {
      alert(err?.data?.message || "Gagal memperbarui daftar favorit. Silakan coba lagi.");
    } finally {
      setSavingIds((prev) => ({ ...prev, [id]: false }));
    }
  }

  const currentCategory = categoriesList.find((c) => c.id === activeCategory);

  if (loading) {
    return <Loading />;
  }

  return (
    <div className="category-page">
      {/* NAVBAR */}
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

      {/* HERO SECTION */}
      <section className="category-hero">
        <div className="category-hero__bg" />
        <div className="category-hero__overlay" />
        <div className="category-hero__content">
          <div className="category-hero__breadcrumb">
            <Link to="/">Home</Link>
            <span>/</span>
            <span>Kategori</span>
            <span>/</span>
            <span>{currentCategory?.label || "Semua"}</span>
          </div>
          <h1 className="category-hero__title">{currentCategory?.label || "Semua Kategori"}</h1>
          <p className="category-hero__subtitle">
            Temukan bisnis terbaik di kategori {currentCategory?.label?.toLowerCase() || "semua kategori"}
          </p>

          {/* Search Bar */}
          <SearchBar
            categoriesList={categoriesList}
            initialKeyword={searchKeyword}
            initialLocation={queryLocation || undefined}
            onKeywordChange={setSearchKeyword}
          />
        </div>
      </section>

      {/* CATEGORY TABS */}
      <section className="category-tabs-section">
        <div className="category-tabs-inner">
          <div className="cat-tabs">
            {categoriesList.map((cat) => (
              <Link
                key={cat.id}
                to={`/category/${cat.id}?${searchParams.toString()}`}
                className={`cat-tab cat-tab--link${activeCategory === cat.id ? " active" : ""}`}
              >
                <span className="cat-tab__icon">{cat.icon}</span>
                <span className="cat-tab__label">{cat.label}</span>
                <span className="cat-tab__count">{categoryCounts[cat.id]}</span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* BUSINESS CARDS */}
      <section className="category-business-section">
        <div className="category-business-inner">
          <div className="category-toolbar">
            <h2 className="category-business__title">
              {finalBisnis.length} Bisnis Ditemukan
            </h2>

            <div className="category-toolbar__right">
              {hasActiveFilters && (
                <button type="button" className="category-toolbar__reset" onClick={resetFilters}>
                  <X size={14} />
                  Reset filter
                </button>
              )}
              <div className="category-sort">
                <DollarSign size={15} className="category-sort__icon" />
                <select
                  className="category-sort__select"
                  value={priceRange}
                  onChange={(e) => setPriceRange(e.target.value)}
                  aria-label="Filter harga"
                >
                  {PRICE_BANDS.map((band) => (
                    <option key={band.id} value={band.id}>{band.label}</option>
                  ))}
                </select>
              </div>

              <div className="category-sort">
                <SlidersHorizontal size={15} className="category-sort__icon" />
                <select
                  className="category-sort__select"
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  aria-label="Urutkan"
                >
                  <option value="relevan">Paling Relevan</option>
                  <option value="rating">Rating Tertinggi</option>
                  <option value="nama">Nama (A-Z)</option>
                </select>
              </div>
            </div>
          </div>

          <div className="category-layout">
            <div className="category-layout__main">
              {loading ? null : finalBisnis.length > 0 ? (
                <>
                <div className="reko-grid">
                  {paginatedBisnis.map((bisnis, idx) => (
                    <Link
                      key={bisnis.id}
                      to={`/business/${bisnis.id}`}
                      className="biz-card biz-card--link"
                      style={{ animationDelay: `${Math.min(idx, 8) * 0.05}s` }}
                    >
                      {/* Image */}
                      <div className="biz-card__img-wrap">
                        <img src={bisnis.img} alt={bisnis.name} className="biz-card__img" loading="lazy" />
                        {bisnis.isPremium && (
                          <span className="biz-card__premium">
                            <BadgeCheck size={13} fill="#fff" stroke="#059669" />
                            Terverifikasi
                          </span>
                        )}
                        <div className="biz-card__img-overlay">
                          <button
                            type="button"
                            className={`biz-card__save${saved[bisnis.id] ? " saved" : ""}`}
                            onClick={(e) => { e.preventDefault(); toggleSave(bisnis.id); }}
                            disabled={!!savingIds[bisnis.id]}
                            aria-label="Simpan"
                          >
                            <Bookmark size={13} fill={saved[bisnis.id] ? "currentColor" : "none"} />
                            <span>{saved[bisnis.id] ? "Tersimpan" : "Simpan"}</span>
                          </button>
                          <span className="biz-card__views">
                            <Eye size={13} />
                            <span>{bisnis.views}</span>
                          </span>
                        </div>
                        {bisnis.rating && (
                          <span className="biz-card__rating">
                            <Star size={12} fill="#fbbf24" stroke="#fbbf24" />
                            {bisnis.rating}
                          </span>
                        )}
                      </div>

                      {/* Body */}
                      <div className="biz-card__body">
                        <h3 className="biz-card__name">{bisnis.name}</h3>
                        <p className="biz-card__category">{bisnis.category}</p>
                        <div className="biz-card__tags">
                          {bisnis.tags.map((tag) => (
                            <span key={tag} className="biz-card__tag">
                              <Tag size={11} />
                              {tag}
                            </span>
                          ))}
                        </div>
                        <div className="biz-card__footer">
                          <span className="biz-card__location">
                            <MapPin size={12} />
                            {bisnis.location}
                          </span>
                          <span className={`biz-card__cta${bisnis.status === "Buka Sekarang" ? "" : " closed"}`}>
                            {bisnis.status === "Buka Sekarang" ? "Buka Sekarang" : "Tutup Sekarang"} →
                          </span>
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>

                {/* Pagination dipindah keluar dari kolom kartu, ditaruh di bawah
                    setelah <BusinessMap> (lihat blok setelah .category-layout),
                    supaya posisinya di tengah, di bawah kartu + peta sekaligus. */}
                </>
              ) : (
                <div className="category-empty">
                  <SearchX size={48} className="category-empty__icon" />
                  <p>Tidak ada bisnis yang cocok dengan pencarian atau filter Anda.</p>
                  <div className="category-empty__actions">
                    {hasActiveFilters && (
                      <button type="button" className="category-empty__reset" onClick={resetFilters}>
                        Reset Filter
                      </button>
                    )}
                    <Link to="/" className="category-empty__link">Kembali ke Home</Link>
                  </div>
                </div>
              )}
            </div>

            {/* Peta: nempel di samping daftar. Tingginya otomatis mengikuti
                kolom kartu di sebelahnya lewat "align-items: stretch" di
                .category-layout (Category.css) - karena jumlah kartu per
                halaman sudah tetap (4 = 2 baris), CSS murni ini sudah cukup
                akurat, tanpa perlu diukur manual pakai JavaScript lagi. */}
            {!loading && finalBisnis.length > 0 && (
              <aside className="category-layout__map">
                <BusinessMap businesses={finalBisnis} />
              </aside>
            )}
          </div>

          {/* Pagination: di tengah, di bawah kartu + peta sekaligus */}
          {!loading && finalBisnis.length > 0 && totalPages > 1 && (
            <nav className="category-pagination" aria-label="Navigasi halaman">
              <button
                type="button"
                className="category-pagination__nav"
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                disabled={safePage === 1}
                aria-label="Halaman sebelumnya"
              >
                <ChevronLeft size={16} />
              </button>

              {getPageNumbers().map((p, i) =>
                p === "..." ? (
                  <span key={`ellipsis-${i}`} className="category-pagination__ellipsis">…</span>
                ) : (
                  <button
                    type="button"
                    key={p}
                    className={`category-pagination__num ${p === safePage ? "active" : ""}`}
                    onClick={() => setCurrentPage(p)}
                  >
                    {p}
                  </button>
                )
              )}

              <button
                type="button"
                className="category-pagination__nav"
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                disabled={safePage === totalPages}
                aria-label="Halaman berikutnya"
              >
                <ChevronRight size={16} />
              </button>
            </nav>
          )}
        </div>
      </section>
    </div>
  );
}