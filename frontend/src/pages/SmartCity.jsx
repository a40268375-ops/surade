import { useParams, Link } from "react-router-dom";
import { useState, useEffect } from "react";
import Navbar from "../components/Navbar";
import Loading from "../components/Loading";
import { usePageLoading } from "../hooks/usePageLoading";
import { useAuth } from "../context/AuthContext";
import { SMART_CITIES } from "../data/smartCities";
import { findLocationCoords, DEFAULT_LOCATION } from "../data/idLocations";
import api, { getImageUrl } from "../utils/api";
import BusinessMap from "../components/BusinessMap";
import { DEFAULT_CATEGORY_TABS, iconForCategory } from "../utils/categoryIcons.jsx";
import {
  MapPin,
  Building2,
  Users,
  Star,
  Search,
  ArrowRight,
  Bookmark,
  Eye,
  Tag,
  BadgeCheck,
} from "lucide-react";
import "./SmartCity.css";
// PERBAIKAN: kartu bisnis di halaman ini sebelumnya pakai gaya sendiri
// (.sc-business-card) yang lebih polos - sekarang dipakaikan gaya kartu
// yang sama (.biz-card, dari Category.css) supaya konsisten dengan halaman
// /category, termasuk badge "Terverifikasi", tombol Simpan/Pratinjau,
// rating, tags, dan UKURAN kartunya sama persis.
import "./Category.css";

/* ── Data kota Smart City diimpor dari src/data/smartCities.js
   supaya selalu sinkron dengan kartu kota di Home.jsx ── */

export default function SmartCity() {
  const pageLoading = usePageLoading();
  const { id } = useParams();
  const [city, setCity] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [dbBusinesses, setDbBusinesses] = useState([]);
  const [categoryTree, setCategoryTree] = useState([]);
  const [saved, setSaved] = useState({}); // { [businessId]: savedRecordId }
  const [savingIds, setSavingIds] = useState({}); // { [businessId]: true } while in-flight
  const { user: authUser } = useAuth();

  useEffect(() => {
    window.scrollTo(0, 0);
    const foundCity = SMART_CITIES.find((c) => c.id === parseInt(id));
    setCity(foundCity);
  }, [id]);

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
      }
    } catch (err) {
      alert(err?.data?.message || "Gagal memperbarui daftar favorit. Silakan coba lagi.");
    } finally {
      setSavingIds((prev) => ({ ...prev, [id]: false }));
    }
  }

  // Ambil SEMUA bisnis dari API, lalu di bawah kita saring yang alamatnya
  // menyebut nama desa/kelurahan ini (mis. "Kelurahan Surade", "Desa
  // Sukatani"). Nama desa disederhanakan dulu (buang kata "Desa"/
  // "Kelurahan") supaya bisnis yang alamatnya cuma tulis "Sukatani" saja
  // (tanpa embel-embel "Desa") tetap ketemu.
  useEffect(() => {
    async function loadBusinesses() {
      try {
        const data = await api.get("/businesses");
        setDbBusinesses(data);
      } catch (e) {
        console.error("Gagal memuat data bisnis dari API", e);
        setDbBusinesses([]);
      }
    }
    loadBusinesses();

    // Diambil buat nentuin subkategori mana aja yang "anak" dari
    // masing-masing dari 14 kategori utama, supaya filter kategori di
    // halaman ini bisa cocokkan bisnis yang category_id-nya nunjuk ke
    // SUBKATEGORI (mis. "Kafe & Coffee Shop") dengan kartu kategori
    // UTAMA yang dipilih (mis. "Bisnis & Market").
    async function loadCategoryTree() {
      try {
        const data = await api.get("/categories/tree");
        setCategoryTree(data);
      } catch (e) {
        console.error("Gagal memuat pohon kategori", e);
        setCategoryTree([]);
      }
    }
    loadCategoryTree();
  }, []);

  if (pageLoading) {
    return <Loading />;
  }

  if (!city) {
    return (
      <div className="smart-city-page">
        <Navbar />
        <div className="smart-city__not-found">
          <h2>Kota tidak ditemukan</h2>
          <Link to="/" className="smart-city__back-link">Kembali ke Home</Link>
        </div>
      </div>
    );
  }

  // PERBAIKAN: sebelumnya bisnis dicocokkan dengan menebak dari teks
  // alamat (`address.includes(villageKeyword)`) - rawan salah (bisa
  // ketinggalan bisnis yang alamatnya ditulis beda gaya, atau malah
  // salah tangkap bisnis dari desa lain yang kebetulan nama desanya
  // muncul di jalan/patokan). Business sebenarnya sudah punya kolom
  // `village` sendiri yang diisi dari dropdown yang sumbernya SAMA
  // PERSIS dengan SMART_CITIES (lihat data/desaList.js) - jadi
  // pencocokannya sekarang exact match, bukan tebak-tebakan lagi.
  const mapBusiness = (b) => ({
    id: b.id,
    name: b.title,
    category: b.category?.name || "Lainnya",
    categorySlug: b.category?.slug || "",
    tags: [b.title],
    location: b.address,
    views: "Pratinjau",
    rating: b.rating ?? null,
    reviews: 0,
    reviewCount: b.review_count ?? null,
    status: b.is_open_now ? "Buka Sekarang" : "Tutup Sekarang",
    img: b.image ? getImageUrl(b.image) : "https://images.unsplash.com/photo-1560066984-138dadb4c035?w=400&h=250&fit=crop",
    images: Array.isArray(b.images) ? b.images.map((p) => getImageUrl(p)) : [],
    hours: b.operating_hours || "",
    isPremium: !!b.is_premium_active,
  });

  const approvedBusinesses = dbBusinesses.filter((b) => b.status === "approved");
  const businessesInThisVillage = approvedBusinesses
    .filter((b) => b.village === city.name)
    .map(mapBusiness);

  // PERBAIKAN: sebelumnya kalau desa ini belum punya satu pun bisnis yang
  // kolom `village`-nya persis menyebut nama desa ini, halaman diam-diam
  // menampilkan SEMUA bisnis dari desa lain sebagai gantinya - jadi kartu
  // desa di Beranda bisa bilang "0 bisnis terdaftar" tapi begitu dibuka,
  // halamannya malah menampilkan 9 bisnis (yang sebenarnya bukan punya
  // desa ini). Sekarang datanya jujur & konsisten: kalau memang belum ada
  // bisnis di desa ini, halaman ini menampilkan status kosong yang jelas
  // ("Tidak ada bisnis ditemukan"), bukan menampilkan bisnis desa lain
  // seolah-olah punya desa ini.
  const displayBusinesses = businessesInThisVillage;

  // Kumpulan slug yang termasuk kategori utama yang lagi dipilih (dirinya
  // sendiri + semua anaknya), dipakai buat filter di bawah.
  const selectedParent = categoryTree.find((c) => c.slug === selectedCategory);
  const selectedCategorySlugs = selectedParent
    ? new Set([selectedParent.slug, ...(selectedParent.children || []).map((ch) => ch.slug)])
    : null;

  const filteredBusinesses = displayBusinesses.filter((business) => {
    // PERBAIKAN: dulu dicocokkan pakai "business.category.toLowerCase()
    // .includes(cat.id)" - cat.id itu singkatan pendek (mis. "cafe",
    // "bisnis") yang TIDAK PERNAH cocok dengan nama kategori asli di
    // database (mis. "Kafe & Coffee Shop"), makanya semua hitungan
    // filter selalu 0. Sekarang dicocokkan pakai SLUG asli, dan karena
    // bisnis biasanya nempel ke SUBKATEGORI (bukan kategori utama), slug
    // subkategori itu dicek apakah termasuk "anak" dari kategori utama
    // yang lagi dipilih (lihat selectedCategorySlugs di atas).
    const matchesCategory =
      selectedCategory === "all" ||
      !selectedCategorySlugs ||
      selectedCategorySlugs.has(business.categorySlug);
    const matchesSearch = business.name.toLowerCase().includes(searchQuery) ||
                         business.location.toLowerCase().includes(searchQuery);
    return matchesCategory && matchesSearch;
  });

  // Titik tengah desa/kelurahan INI SENDIRI (dari data/idLocations.js),
  // dipakai sebagai posisi awal peta selama belum ada bisnis - supaya
  // peta langsung fokus ke desa ini, bukan zoom out ke seluruh Indonesia.
  const cityCoords = findLocationCoords(city.name) || DEFAULT_LOCATION;

  return (
    <div className="smart-city-page">
      <Navbar />

      {/* Hero Section */}
      <section className="sc-hero">
        <div className="sc-hero__bg">
          <img src={city.img} alt={city.name} className="sc-hero__img" />
          <div className="sc-hero__overlay" />
        </div>
        <div className="sc-hero__content">
          <div className="sc-hero__inner">
            <Link to="/" className="sc-hero__breadcrumb">
              <span>Home</span>
              <ArrowRight size={16} />
              <span>Smart City</span>
              <ArrowRight size={16} />
              <span>{city.name}</span>
            </Link>
            <h1 className="sc-hero__title">{city.name} Smart City</h1>
            <p className="sc-hero__subtitle">{city.description}</p>
            
            <div className="sc-hero__stats">
              <div className="sc-hero__stat">
                <Building2 size={24} className="sc-hero__stat-icon" />
                <div className="sc-hero__stat-content">
                  {/* PERBAIKAN: sebelumnya city.bisnis (angka statis dari
                      smartCities.js) - sekarang jumlah bisnis asli yang
                      approved dan tercatat desanya = {city.name}. */}
                  <span className="sc-hero__stat-value">{businessesInThisVillage.length.toLocaleString("id-ID")}</span>
                  <span className="sc-hero__stat-label">Bisnis Terdaftar</span>
                </div>
              </div>
              <div className="sc-hero__stat">
                <Users size={24} className="sc-hero__stat-icon" />
                <div className="sc-hero__stat-content">
                  <span className="sc-hero__stat-value">{city.population}</span>
                  <span className="sc-hero__stat-label">Penduduk</span>
                </div>
              </div>
              <div className="sc-hero__stat">
                <MapPin size={24} className="sc-hero__stat-icon" />
                <div className="sc-hero__stat-content">
                  <span className="sc-hero__stat-value">{city.area}</span>
                  <span className="sc-hero__stat-label">Luas Wilayah</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Content Section */}
      <section className="sc-content">
        <div className="sc-content__inner">
          {/* Search & Filter */}
          <div className="sc-filter-bar">
            <div className="sc-search-box">
              <Search size={18} className="sc-search-box__icon" />
              <input
                type="text"
                placeholder="Cari bisnis atau lokasi..."
                className="sc-search-box__input"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>

            {/* PERMINTAAN: filter kategori diubah dari tombol kotak
                horizontal jadi kartu ikon (ikon bulat + label + jumlah
                bisnis di bawahnya), konsisten dengan gaya grid kategori
                yang sudah dipakai di halaman lain (mis. Category.jsx).
                PERBAIKAN: sebelumnya cuma 5 kategori yang di-hardcode
                terpisah dari sistem kategori asli (makanya hitungannya
                selalu 0) - sekarang pakai 14 kategori utama yang sama
                persis dengan yang dipakai di seluruh situs. */}
            <div className="sc-category-grid">
              {DEFAULT_CATEGORY_TABS.map((cat) => {
                const parentNode = categoryTree.find((c) => c.slug === cat.id);
                const slugSet = parentNode
                  ? new Set([parentNode.slug, ...(parentNode.children || []).map((ch) => ch.slug)])
                  : null;
                const count = cat.id === "all"
                  ? displayBusinesses.length
                  : displayBusinesses.filter((b) => slugSet && slugSet.has(b.categorySlug)).length;
                return (
                  <button
                    key={cat.id}
                    type="button"
                    className={`sc-category-card ${selectedCategory === cat.id ? "active" : ""}`}
                    onClick={() => setSelectedCategory(cat.id)}
                  >
                    <span className="sc-category-card__icon">{cat.icon}</span>
                    <span className="sc-category-card__label">{cat.label}</span>
                    <span className="sc-category-card__count">{count}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Business Grid */}
          <div className="sc-business-section">
            <h2 className="sc-section__title">
              Bisnis di {city.name}
              <span className="sc-section__count">({filteredBusinesses.length})</span>
            </h2>

            <div className="category-content-layout">
              <div className="category-results-col">
                <div className="reko-grid">
                  {filteredBusinesses.length > 0 ? (
                    filteredBusinesses.map((business, idx) => (
                      <Link
                        key={business.id}
                        to={`/business/${business.id}`}
                        className="biz-card biz-card--link"
                        style={{ animationDelay: `${Math.min(idx, 8) * 0.05}s` }}
                      >
                        {/* Image */}
                        <div className="biz-card__img-wrap">
                          <img src={business.img} alt={business.name} className="biz-card__img" loading="lazy" />
                          {business.isPremium && (
                            <span className="biz-card__premium">
                              <BadgeCheck size={13} fill="#fff" stroke="#059669" />
                              Terverifikasi
                            </span>
                          )}
                          <div className="biz-card__img-overlay">
                            <button
                              type="button"
                              className={`biz-card__save${saved[business.id] ? " saved" : ""}`}
                              onClick={(e) => { e.preventDefault(); toggleSave(business.id); }}
                              disabled={!!savingIds[business.id]}
                              aria-label="Simpan"
                            >
                              <Bookmark size={13} fill={saved[business.id] ? "currentColor" : "none"} />
                              <span>{saved[business.id] ? "Tersimpan" : "Simpan"}</span>
                            </button>
                            <span className="biz-card__views">
                              <Eye size={13} />
                              <span>{business.views}</span>
                            </span>
                          </div>
                          {business.rating && (
                            <span className="biz-card__rating">
                              <Star size={12} fill="#fbbf24" stroke="#fbbf24" />
                              {business.rating}
                            </span>
                          )}
                        </div>

                        {/* Body */}
                        <div className="biz-card__body">
                          <h3 className="biz-card__name">{business.name}</h3>
                          <p className="biz-card__category">{business.category}</p>
                          <div className="biz-card__tags">
                            {business.tags.map((tag) => (
                              <span key={tag} className="biz-card__tag">
                                <Tag size={11} />
                                {tag}
                              </span>
                            ))}
                          </div>
                          <div className="biz-card__footer">
                            <span className="biz-card__location">
                              <MapPin size={12} />
                              {business.location}
                            </span>
                            <span className={`biz-card__cta${business.status === "Buka Sekarang" ? "" : " closed"}`}>
                              {business.status === "Buka Sekarang" ? "Buka Sekarang" : "Tutup Sekarang"} →
                            </span>
                          </div>
                        </div>
                      </Link>
                    ))
                  ) : (
                    <div className="sc-empty-state">
                      <Search size={48} className="sc-empty-state__icon" />
                      <h3 className="sc-empty-state__title">Tidak ada bisnis ditemukan</h3>
                      <p className="sc-empty-state__text">Coba ubah kata kunci pencarian atau filter kategori</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Peta lokasi bisnis di desa ini — di sisi kanan */}
              <div className="category-map-col">
                <div className="category-map-box category-map-box--sticky">
                  <BusinessMap
                    businesses={filteredBusinesses}
                    height={420}
                    fallbackCenter={[cityCoords.lat, cityCoords.lng]}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

    </div>
  );
}