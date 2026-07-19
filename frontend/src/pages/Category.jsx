import { useParams, Link, useSearchParams } from "react-router-dom";
import { useEffect, useState } from "react";
import api, { getImageUrl } from "../utils/api";
import Navbar from "../components/Navbar";
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
  SlidersHorizontal,
  Star,
  SearchX,
  X,
} from "lucide-react";
import BusinessMap from "../components/BusinessMap";
import "./Category.css";

/* ── Fallback category tabs (dipakai hanya kalau API belum bisa diakses) ── */
const CATEGORIES = [
  { id: "all", label: "Semua", icon: <Store size={26} strokeWidth={1.7} /> },
  { id: "bisnis", label: "Bisnis & Market", icon: <Store size={26} strokeWidth={1.7} /> },
  { id: "cafe", label: "Cafe & Restaurant", icon: <Coffee size={26} strokeWidth={1.7} /> },
  { id: "elektronik", label: "Elektronik & Gadget", icon: <Smartphone size={26} strokeWidth={1.7} /> },
  { id: "fashion", label: "Fashion", icon: <Shirt size={26} strokeWidth={1.7} /> },
  { id: "servis", label: "Servis & Tukang", icon: <Wrench size={26} strokeWidth={1.7} /> },
  { id: "wisata", label: "Wisata", icon: <MapPin size={26} strokeWidth={1.7} /> },
];

/* ── Pilih icon berdasarkan nama kategori asli dari database ── */
function iconForCategory(name = "") {
  const n = name.toLowerCase();
  if (n.includes("cafe") || n.includes("kuliner")) return <Coffee size={26} strokeWidth={1.7} />;
  if (n.includes("gadget") || n.includes("elektronik")) return <Smartphone size={26} strokeWidth={1.7} />;
  if (n.includes("fashion")) return <Shirt size={26} strokeWidth={1.7} />;
  if (n.includes("servis") || n.includes("jasa") || n.includes("otomotif")) return <Wrench size={26} strokeWidth={1.7} />;
  if (n.includes("wisata") || n.includes("rekreasi") || n.includes("hiburan")) return <MapPin size={26} strokeWidth={1.7} />;
  return <Store size={26} strokeWidth={1.7} />;
}

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
  const [searchParams, setSearchParams] = useSearchParams();
  const queryQ = searchParams.get("q") || "";
  const queryLocation = searchParams.get("location") || "";

  const [activeCategory, setActiveCategory] = useState(categoryId || "all");
  const [saved, setSaved] = useState({});
  const [searchKeyword, setSearchKeyword] = useState(queryQ);
  const [sortBy, setSortBy] = useState("relevan");

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
  // Fallback ke daftar statis HANYA kalau API beneran gagal (apiError) - kalau
  // masih dalam proses loading, jangan tampilkan daftar contoh dulu (biar
  // gak ada "kedipan" kategori contoh sebelum kategori asli muncul).
  const categoriesList = dbCategories.length > 0
    ? [
        { id: "all", label: "Semua", icon: <Store size={26} strokeWidth={1.7} /> },
        ...dbCategories.map((c) => ({
          id: c.slug,
          label: c.name,
          icon: iconForCategory(c.name),
        })),
      ]
    : (apiError ? CATEGORIES : []);

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
        views: "Pratinjau",
        status: b.status === "approved" ? "Buka Sekarang" : "Pending",
        img: b.image ? getImageUrl(b.image) : "https://images.unsplash.com/photo-1560066984-138dadb4c035?w=400&h=250&fit=crop",
        rating: null,
      }))
    : (apiError ? BISNIS_DATA : []);

  const filteredBisnis = activeCategory === "all"
    ? businessesList
    : businessesList.filter((b) =>
      b.categorySlug
        ? b.categorySlug === activeCategory
        : b.category.toLowerCase().includes(
            categoriesList.find((c) => c.id === activeCategory)?.label.split(" ")[0].toLowerCase() ?? ""
          )
    );

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

  const finalBisnis = [...finalBisnisUnsorted].sort((a, b) => {
    if (sortBy === "rating") return (b.rating ?? 0) - (a.rating ?? 0);
    if (sortBy === "nama") return a.name.localeCompare(b.name);
    return 0; // "relevan" → keep original order
  });

  // Jumlah bisnis per kategori, untuk badge di tab kategori
  const categoryCounts = categoriesList.reduce((acc, cat) => {
    acc[cat.id] = cat.id === "all"
      ? businessesList.length
      : businessesList.filter((b) =>
        b.categorySlug
          ? b.categorySlug === cat.id
          : b.category.toLowerCase().includes(cat.label.split(" ")[0].toLowerCase())
      ).length;
    return acc;
  }, {});

  const hasActiveFilters = !!searchKeyword || (!!queryLocation && queryLocation !== "Semua") || activeCategory !== "all";

  function resetFilters() {
    setSearchKeyword("");
    setSortBy("relevan");
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

  function toggleSave(id) {
    setSaved((prev) => ({ ...prev, [id]: !prev[id] }));
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
          <div className="category-search">
            <Search size={18} className="category-search__icon" />
            <input
              type="text"
              placeholder="Cari bisnis..."
              value={searchKeyword}
              onChange={handleSearchChange}
              className="category-search__input"
            />
          </div>
        </div>
      </section>

      {/* CATEGORY TABS */}
      <section className="category-tabs-section">
        <div className="category-tabs-inner">
          {loading && categoriesList.length === 0 ? null : (
            <div className="reko-tabs">
              {categoriesList.map((cat) => (
                <Link
                  key={cat.id}
                  to={`/category/${cat.id}?${searchParams.toString()}`}
                  className={`reko-tab reko-tab--link${activeCategory === cat.id ? " active" : ""}`}
                >
                  <span className="reko-tab__icon">{cat.icon}</span>
                  <span className="reko-tab__label">{cat.label}</span>
                  <span className="reko-tab__count">{categoryCounts[cat.id]}</span>
                </Link>
              ))}
            </div>
          )}
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
                <div className="reko-grid">
                  {finalBisnis.map((bisnis, idx) => (
                    <Link
                      key={bisnis.id}
                      to={`/business/${bisnis.id}`}
                      className="biz-card biz-card--link"
                      style={{ animationDelay: `${Math.min(idx, 8) * 0.05}s` }}
                    >
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
                          <span className="biz-card__cta">{bisnis.status} →</span>
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
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

            {/* Peta: nempel di samping daftar, selalu kelihatan bareng (bukan tab terpisah) */}
            {!loading && finalBisnis.length > 0 && (
              <aside className="category-layout__map">
                <BusinessMap businesses={finalBisnis} />
              </aside>
            )}
          </div>
        </div>
      </section>
    </div>
  );
}