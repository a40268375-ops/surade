import { useParams, Link, useSearchParams } from "react-router-dom";
import { useEffect, useState } from "react";
import Navbar from "../components/Navbar";
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
} from "lucide-react";
import "./Category.css";

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

export default function Category() {
  const { categoryId } = useParams();
  const [searchParams, setSearchParams] = useSearchParams();
  const queryQ = searchParams.get("q") || "";
  const queryLocation = searchParams.get("location") || "";

  const [activeCategory, setActiveCategory] = useState(categoryId || "all");
  const [saved, setSaved] = useState({});
  const [searchKeyword, setSearchKeyword] = useState(queryQ);

  useEffect(() => {
    window.scrollTo(0, 0);
    if (categoryId) {
      setActiveCategory(categoryId);
    }
  }, [categoryId]);

  useEffect(() => {
    setSearchKeyword(queryQ);
  }, [queryQ]);

  const filteredBisnis = activeCategory === "all"
    ? BISNIS_DATA
    : BISNIS_DATA.filter((b) =>
      b.category.toLowerCase().includes(
        CATEGORIES.find((c) => c.id === activeCategory)?.label.split(" ")[0].toLowerCase() ?? ""
      )
    );

  const searchFilteredBisnis = filteredBisnis.filter((b) => {
    // Location filter
    const matchesLocation = !queryLocation || queryLocation === "Semua" ||
      b.location.toLowerCase().includes(queryLocation.toLowerCase());

    // Keyword filter
    const matchesKeyword = !searchKeyword ||
      b.name.toLowerCase().includes(searchKeyword.toLowerCase()) ||
      b.category.toLowerCase().includes(searchKeyword.toLowerCase()) ||
      b.tags.some(tag => tag.toLowerCase().includes(searchKeyword.toLowerCase())) ||
      b.location.toLowerCase().includes(searchKeyword.toLowerCase());

    return matchesLocation && matchesKeyword;
  });

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

  const currentCategory = CATEGORIES.find((c) => c.id === activeCategory);

  return (
    <div className="category-page">
      {/* NAVBAR */}
      <Navbar />

      {/* HERO SECTION */}
      <section className="category-hero">
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
          <div className="reko-tabs">
            {CATEGORIES.map((cat) => (
              <Link
                key={cat.id}
                to={`/category/${cat.id}?${searchParams.toString()}`}
                className={`reko-tab reko-tab--link${activeCategory === cat.id ? " active" : ""}`}
              >
                <span className="reko-tab__icon">{cat.icon}</span>
                <span className="reko-tab__label">{cat.label}</span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* BUSINESS CARDS */}
      <section className="category-business-section">
        <div className="category-business-inner">
          <h2 className="category-business__title">
            {searchFilteredBisnis.length} Bisnis Ditemukan
          </h2>

          {searchFilteredBisnis.length > 0 ? (
            <div className="reko-grid">
              {searchFilteredBisnis.map((bisnis) => (
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
                        <span>{bisnis.views}</span>
                      </span>
                    </div>
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
              <p>Tidak ada bisnis ditemukan untuk kategori ini.</p>
              <Link to="/" className="category-empty__link">Kembali ke Home</Link>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
