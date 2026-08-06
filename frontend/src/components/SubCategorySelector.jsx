import { useState, useRef, useEffect, useCallback } from "react";
import { Search, X, ChevronDown, Loader2 } from "lucide-react";
import "./SubCategorySelector.css";

export default function SubCategorySelector({
  categories = [],
  selectedMainCategory = null,
  selectedSubCategory = null,
  onMainCategoryChange,
  onSubCategoryChange,
  disabled = false,
  error = null,
  loading = false,
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [highlightedIndex, setHighlightedIndex] = useState(-1);
  const [debouncedQuery, setDebouncedQuery] = useState("");
  const dropdownRef = useRef(null);
  const inputRef = useRef(null);

  // Debounced search
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedQuery(searchQuery);
    }, 300);
    
    return () => {
      clearTimeout(handler);
    };
  }, [searchQuery]);

  // Get	subcategories based on selected main category
  const subCategories = selectedMainCategory?.children || [];

  // Filter subcategories based on debounced search query
  const filteredSubCategories = subCategories.filter((sub) =>
    sub.name.toLowerCase().includes(debouncedQuery.toLowerCase())
  );

  // Get display names
  const mainCategoryName = selectedMainCategory?.name || "";
  const subCategoryName = selectedSubCategory?.name || "";

  // Reset search when main category changes
  useEffect(() => {
    setSearchQuery("");
    setHighlightedIndex(-1);
    setIsOpen(false);
  }, [selectedMainCategory]);

  // Handle click outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Handle keyboard navigation
  const handleKeyDown = (e) => {
    if (!isOpen) {
      if (e.key === "ArrowDown" || e.key === "Enter") {
        e.preventDefault();
        setIsOpen(true);
      }
      return;
    }

    switch (e.key) {
      case "ArrowDown":
        e.preventDefault();
        setHighlightedIndex((prev) =>
          prev < filteredSubCategories.length - 1 ? prev + 1 : prev
        );
        break;
      case "ArrowUp":
        e.preventDefault();
        setHighlightedIndex((prev) => (prev > 0 ? prev - 1 : 0));
        break;
      case "Enter":
        e.preventDefault();
        if (highlightedIndex >= 0 && filteredSubCategories[highlightedIndex]) {
          handleSelectSubCategory(filteredSubCategories[highlightedIndex]);
        }
        break;
      case "Escape":
        e.preventDefault();
        setIsOpen(false);
        setHighlightedIndex(-1);
        break;
    }
  };

  const handleSelectSubCategory = (subCategory) => {
    onSubCategoryChange(subCategory);
    setSearchQuery("");
    setIsOpen(false);
    setHighlightedIndex(-1);
  };

  const handleClear = () => {
    onSubCategoryChange(null);
    setSearchQuery("");
    setIsOpen(false);
  };

  const handleMainCategoryChange = (e) => {
    const categoryId = parseInt(e.target.value);
    const category = categories.find((c) => c.id === categoryId);
    onMainCategoryChange(category || null);
    onSubCategoryChange(null); // Reset sub category when main changes
  };

  return (
    <div className="subcategory-selector">
      {/* Main Category Dropdown */}
      <div className="subcategory-selector__main">
        <label className="subcategory-selector__label">
          Kategori <span className="required">*</span>
        </label>
        <div className={`subcategory-selector__dropdown ${error ? "error" : ""}`}>
          <select
            value={selectedMainCategory?.id || ""}
            onChange={handleMainCategoryChange}
            disabled={disabled || loading}
            className="subcategory-selector__select"
          >
            <option value="">Pilih kategori utama...</option>
            {categories.map((cat) => (
              <option key={cat.id} value={cat.id}>
                {cat.name}
              </option>
            ))}
          </select>
          <ChevronDown size={16} className="subcategory-selector__dropdown-icon" />
        </div>
      </div>

      {/* Sub Category Search */}
      <div className="subcategory-selector__sub">
        <label className="subcategory-selector__label">
          Sub Kategori <span className="required">*</span>
        </label>
        <div
          ref={dropdownRef}
          className={`subcategory-selector__search-wrapper ${
            !selectedMainCategory ? "disabled" : ""
          } ${error ? "error" : ""}`}
        >
          <div className="subcategory-selector__search-input">
            <Search size={16} className="subcategory-selector__search-icon" />
            <input
              ref={inputRef}
              type="text"
              placeholder={
                !selectedMainCategory
                  ? "Pilih kategori utama terlebih dahulu"
                  : "Cari sub kategori..."
              }
              value={searchQuery || subCategoryName}
              onChange={(e) => setSearchQuery(e.target.value)}
              onFocus={() => {
                if (selectedMainCategory) setIsOpen(true);
              }}
              onKeyDown={handleKeyDown}
              disabled={!selectedMainCategory || disabled || loading}
              className="subcategory-selector__input"
            />
            {subCategoryName && !searchQuery && (
              <button
                type="button"
                onClick={handleClear}
                className="subcategory-selector__clear"
              >
                <X size={14} />
              </button>
            )}
            {loading && (
              <Loader2 size={16} className="subcategory-selector__loading spin" />
            )}
          </div>

          {/* Dropdown Results */}
          {isOpen && selectedMainCategory && (
            <div className="subcategory-selector__dropdown-results">
              {loading ? (
                <div className="subcategory-selector__loading-state">
                  <Loader2 size={20} className="spin" />
                  <span>Memuat sub kategori...</span>
                </div>
              ) : filteredSubCategories.length === 0 ? (
                <div className="subcategory-selector__empty-state">
                  {searchQuery
                    ? "Tidak ada sub kategori yang cocok"
                    : "Tidak ada sub kategori tersedia"}
                </div>
              ) : (
                <ul className="subcategory-selector__list">
                  {filteredSubCategories.map((sub, index) => (
                    <li
                      key={sub.id}
                      className={`subcategory-selector__item ${
                        index === highlightedIndex ? "highlighted" : ""
                      } ${selectedSubCategory?.id === sub.id ? "selected" : ""}`}
                      onClick={() => handleSelectSubCategory(sub)}
                      onMouseEnter={() => setHighlightedIndex(index)}
                    >
                      {sub.name}
                    </li>
                  ))}
                </ul>
              )}
            </div>
          )}
        </div>
        {error && <span className="subcategory-selector__error">{error}</span>}
      </div>
    </div>
  );
}
