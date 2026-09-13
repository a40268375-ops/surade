import { useState, useRef, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { Search, ChevronDown, MapPin, Store } from "lucide-react";
import api from "../../services/api";

/* ── Desa/Kelurahan di Kecamatan Surade ── */
const KOTA_INDONESIA = [
  "Semua",
  "Kelurahan Surade",
  "Desa Jagamukti",
  "Desa Citanglar",
  "Desa Wanasari",
  "Desa Sirnasari",
  "Desa Kadaleman",
  "Desa Gunungsungging",
  "Desa Cipeundeuy",
  "Desa Pasiripis",
  "Desa Buniwangi",
  "Desa Sukatani",
  "Desa Kademangan",
];

export default function HeroSection({
  searchKeyword,
  setSearchKeyword,
  selectedSearchCategory,
  setSelectedSearchCategory,
  selectedKota,
  setSelectedKota,
  searchHistory,
  categories,
  handleSearchSubmit,
}) {
  const navigate = useNavigate();
  const [kotaSearch, setKotaSearch] = useState("");
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [keywordDropdownOpen, setKeywordDropdownOpen] = useState(false);
  const [searchSuggestions, setSearchSuggestions] = useState([]);
  const [loadingSuggestions, setLoadingSuggestions] = useState(false);
  const dropdownRef = useRef(null);
  const keywordDropdownRef = useRef(null);
  const debounceTimer = useRef(null);

  // Fetch search suggestions with debounce.
  // "location" ikut dikirim supaya hasil saran benar-benar cocok kata kunci
  // DULU, baru disaring lagi sesuai lokasi yang dipilih user di dropdown
  // "Lokasi" (sebelumnya lokasi ini diabaikan total oleh request-nya).
  const fetchSuggestions = useCallback(async (keyword, location) => {
    if (!keyword || keyword.trim().length < 2) {
      setSearchSuggestions([]);
      return;
    }

    setLoadingSuggestions(true);
    try {
      const params = new URLSearchParams({ q: keyword.trim() });
      if (location && location !== "Semua") {
        params.set("location", location);
      }
      const response = await api.get(`/search-suggestions?${params.toString()}`);
      if (response.data.success) {
        setSearchSuggestions(response.data.data || []);
      }
    } catch (error) {
      console.error('Error fetching suggestions:', error);
      setSearchSuggestions([]);
    } finally {
      setLoadingSuggestions(false);
    }
  }, []);

  // Debounced search
  useEffect(() => {
    if (debounceTimer.current) {
      clearTimeout(debounceTimer.current);
    }

    debounceTimer.current = setTimeout(() => {
      if (keywordDropdownOpen && searchKeyword) {
        fetchSuggestions(searchKeyword, selectedKota);
      }
    }, 300); // 300ms debounce

    return () => {
      if (debounceTimer.current) {
        clearTimeout(debounceTimer.current);
      }
    };
  }, [searchKeyword, keywordDropdownOpen, selectedKota, fetchSuggestions]);

  useEffect(() => {
    function handleClickOutside(e) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setDropdownOpen(false);
        setKotaSearch("");
      }
      if (keywordDropdownRef.current && !keywordDropdownRef.current.contains(e.target)) {
        setKeywordDropdownOpen(false);
        setSearchSuggestions([]);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [searchHistory]);

  const filteredKota = KOTA_INDONESIA.filter((k) =>
    k.toLowerCase().includes(kotaSearch.toLowerCase())
  );

  return (
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
                    <stop stopColor="#34D399"/>
                    <stop offset="1" stopColor="#059669"/>
                  </linearGradient>
                </defs>
              </svg>
            </div>
            <span>Direktori Bisnis &amp; Informasi</span>
          </div>

          {/* Title & Subtitle */}
          <h1 className="home-hero__title" data-text="Surade.co.id">
            Surade<span className="home-hero__title-accent">.co.id</span>
          </h1>
          <p className="home-hero__subtitle">
            Temukan berbagai informasi, bisnis, dan layanan<br />
            terpercaya di <span style={{ color: "#34D399", fontWeight: 700 }}>Surade</span>.
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
                    e.preventDefault();
                    setKeywordDropdownOpen(false);
                    handleSearchSubmit();
                  }
                }}
              />
              {selectedSearchCategory !== "all" && (
                <span className="home-search__selected-category">
                  {categories.find(c => c.id === selectedSearchCategory)?.label || selectedSearchCategory}
                </span>
              )}

{keywordDropdownOpen && (
                <div className="home-keyword-dropdown">
                  {/* Search Suggestions - Show ONLY if user is typing >= 2 chars */}
                  {searchKeyword && searchKeyword.trim().length >= 2 ? (
                    <div className="home-keyword-dropdown__section">
                      <span className="home-keyword-dropdown__section-title">
                        {loadingSuggestions ? 'Mencari...' : 'Hasil Pencarian'}
                      </span>
                      <ul className="home-keyword-dropdown__list">
                        {loadingSuggestions ? (
                          <li className="home-keyword-dropdown__item home-keyword-dropdown__item--loading">
                            Memuat hasil...
                          </li>
                        ) : searchSuggestions.length > 0 ? (
                          searchSuggestions.map((business) => (
                            <li
                              key={business.id}
                              className="home-keyword-dropdown__item home-keyword-dropdown__item--business"
                              onClick={() => {
                                setKeywordDropdownOpen(false);
                                setSearchSuggestions([]);
                                navigate(`/business/${business.id}`);
                              }}
                            >
                              <div className="home-keyword-dropdown__business-icon">
                                <Store size={20} strokeWidth={1.8} />
                              </div>
                              <div className="home-keyword-dropdown__business-info">
                                <span className="home-keyword-dropdown__business-name">{business.name}</span>
                                <div className="home-keyword-dropdown__business-meta">
                                  <span className="home-keyword-dropdown__business-category">{business.category}</span>
                                  <span className="home-keyword-dropdown__business-separator">•</span>
                                  <span className="home-keyword-dropdown__business-location">
                                    <MapPin size={12} />
                                    {business.location}
                                  </span>
                                </div>
                              </div>
                            </li>
                          ))
                        ) : (
                          <li className="home-keyword-dropdown__item home-keyword-dropdown__item--empty">
                            Tidak ada hasil untuk "{searchKeyword}"
                          </li>
                        )}
                      </ul>
                    </div>
                  ) : (
                    <>
                      {/* Riwayat Pencarian - Show only if NOT searching */}
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
                                  di {categories.find(c => c.id === item.category)?.label || "Semua"}
                                </span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}

                      {/* Kategori Pilihan - Show only if NOT searching */}
                      <div className="home-keyword-dropdown__section">
                        <span className="home-keyword-dropdown__section-title">Cari berdasarkan Kategori</span>
                        <ul className="home-keyword-dropdown__list home-keyword-dropdown__list--category">
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
                    </>
                  )}
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
                {/* PERBAIKAN: ikon panah dropdown ini sebelumnya sudah
                    ada CSS-nya (.home-search__kota-caret) tapi tidak
                    pernah dirender di JSX - jadi tidak kelihatan sama
                    sekali kalau tombol ini bisa diklik untuk membuka
                    pilihan lokasi. */}
                <ChevronDown
                  size={15}
                  className={`home-search__kota-caret${dropdownOpen ? " open" : ""}`}
                />
              </button>

              {dropdownOpen && (
                <div className="home-kota-dropdown" role="listbox">
                  <div className="home-kota-dropdown__search">
                    <Search size={13} className="home-kota-dropdown__icon" />
                    <input
                      autoFocus
                      type="text"
                      placeholder="Cari desa..."
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
                      : <li className="home-kota-dropdown__empty">Desa tidak ditemukan</li>
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
  );
}