import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Search } from "lucide-react";

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
  const dropdownRef = useRef(null);
  const keywordDropdownRef = useRef(null);

  useEffect(() => {
    function handleClickOutside(e) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setDropdownOpen(false);
        setKotaSearch("");
      }
      if (keywordDropdownRef.current && !keywordDropdownRef.current.contains(e.target)) {
        setKeywordDropdownOpen(false);
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
                  {categories.find(c => c.id === selectedSearchCategory)?.label || selectedSearchCategory}
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
                              di {categories.find(c => c.id === item.category)?.label || "Semua"}
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
  );
}
