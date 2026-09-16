import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Search, ChevronDown } from "lucide-react";
import { DESA_LIST } from "../data/desaList";
import "./SearchBar.css";

// Search bar lengkap (Kata Kunci + Lokasi + tombol cari) yang tadinya cuma
// ada di Home.jsx. Sekarang jadi komponen sendiri supaya bisa dipakai juga
// di halaman Kategori dan Smart City/Village, dengan perilaku yang sama
// persis (riwayat pencarian, saran kategori, daftar desa yang bisa dicari).
export default function SearchBar({ categoriesList = [], initialKeyword = "", initialLocation = "", onKeywordChange, onLocationChange }) {
  const navigate = useNavigate();

  const [searchKeyword, setSearchKeyword] = useState(initialKeyword);
  const [selectedSearchCategory, setSelectedSearchCategory] = useState("all");
  const [keywordDropdownOpen, setKeywordDropdownOpen] = useState(false);
  const [searchHistory, setSearchHistory] = useState([]);

  const [selectedKota, setSelectedKota] = useState(initialLocation || DESA_LIST[0] || "Kelurahan Surade");
  const [kotaSearch, setKotaSearch] = useState("");
  const [dropdownOpen, setDropdownOpen] = useState(false);

  const dropdownRef = useRef(null);
  const keywordDropdownRef = useRef(null);

  // Beritahu parent (kalau parent perlu tahu, mis. Home.jsx yang juga
  // memfilter daftar bisnis di halamannya sendiri sambil user mengetik).
  useEffect(() => {
    onKeywordChange?.(searchKeyword);
  }, [searchKeyword]);

  useEffect(() => {
    onLocationChange?.(selectedKota);
  }, [selectedKota]);

  useEffect(() => {
    try {
      const history = JSON.parse(localStorage.getItem("search_history") || "[]");
      setSearchHistory(history);
    } catch {
      setSearchHistory([]);
    }
  }, []);

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

  const filteredKota = DESA_LIST.filter((k) =>
    k.toLowerCase().includes(kotaSearch.toLowerCase())
  );

  const handleSearchSubmit = () => {
    if (searchKeyword.trim()) {
      const newHistoryItem = { keyword: searchKeyword.trim(), category: selectedSearchCategory };
      const updatedHistory = [
        newHistoryItem,
        ...searchHistory.filter((h) => h.keyword.toLowerCase() !== searchKeyword.trim().toLowerCase()),
      ].slice(0, 5);
      localStorage.setItem("search_history", JSON.stringify(updatedHistory));
      setSearchHistory(updatedHistory);
    }
    navigate(`/category/${selectedSearchCategory}?q=${encodeURIComponent(searchKeyword)}&location=${encodeURIComponent(selectedKota)}`);
  };

  return (
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
            if (e.key === "Enter") handleSearchSubmit();
          }}
        />

        {keywordDropdownOpen && (
          <div className="home-keyword-dropdown">
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
                        di {categoriesList.find((c) => c.id === item.category)?.label || "Semua"}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            <div className="home-keyword-dropdown__section">
              <span className="home-keyword-dropdown__section-title">Cari berdasarkan Kategori</span>
              <ul className="home-keyword-dropdown__list">
                {categoriesList
                  .filter((cat) =>
                    searchKeyword.trim() === ""
                      ? true
                      : cat.label.toLowerCase().includes(searchKeyword.trim().toLowerCase())
                  )
                  .map((cat) => (
                    <li
                      key={cat.id}
                      className="home-keyword-dropdown__item home-keyword-dropdown__item--category"
                      onClick={() => {
                        setSelectedSearchCategory(cat.id);
                        setKeywordDropdownOpen(false);

                        if (cat.id === "all") {
                          setSearchKeyword("");
                        } else {
                          setSearchKeyword(cat.label);
                        }
                      }}
                    >
                      <span className="home-keyword-dropdown__cat-label">{cat.label}</span>
                    </li>
                  ))}
                {categoriesList.filter((cat) =>
                  searchKeyword.trim() === ""
                    ? true
                    : cat.label.toLowerCase().includes(searchKeyword.trim().toLowerCase())
                ).length === 0 && (
                  <li className="home-keyword-dropdown__empty">Kategori tidak ditemukan</li>
                )}
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
                placeholder="Cari desa..."
                value={kotaSearch}
                onChange={(e) => setKotaSearch(e.target.value)}
                className="home-kota-dropdown__input"
              />
            </div>
            <ul className="home-kota-dropdown__list">
              {filteredKota.length > 0 ? (
                filteredKota.map((kota) => (
                  <li
                    key={kota}
                    role="option"
                    aria-selected={kota === selectedKota}
                    className={`home-kota-dropdown__item${kota === selectedKota ? " selected" : ""}`}
                    onClick={() => {
                      setSelectedKota(kota);
                      setDropdownOpen(false);
                      setKotaSearch("");
                    }}
                  >
                    {kota}
                  </li>
                ))
              ) : (
                <li className="home-kota-dropdown__empty">Desa tidak ditemukan</li>
              )}
            </ul>
          </div>
        )}
      </div>

      <button className="home-search__button" type="button" aria-label="Cari" onClick={handleSearchSubmit}>
        <Search size={18} strokeWidth={2.5} />
      </button>
    </div>
  );
}