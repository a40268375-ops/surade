import { useState, useRef, useEffect } from "react";
import { Search, X, ChevronDown, Loader2 } from "lucide-react";

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

  // Get subcategories based on selected main category
  const subCategories = selectedMainCategory?.children || [];

  // Filter subcategories based on debounced search query
  const filteredSubCategories = subCategories.filter((sub) =>
    sub.name.toLowerCase().includes(debouncedQuery.toLowerCase())
  );

  // Get display names
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
    <div className="flex flex-col gap-4">
      {/* Main Category Dropdown */}
      <div className="flex flex-col gap-[6px]">
        <label className="text-[0.9rem] font-medium text-slate-700">
          Kategori <span className="text-red-500">*</span>
        </label>
        <div className="relative w-full">
          <select
            value={selectedMainCategory?.id || ""}
            onChange={handleMainCategoryChange}
            disabled={disabled || loading}
            className={`w-full h-[48px] pl-[14px] pr-[40px] py-[12px] text-[0.95rem] text-slate-900 bg-white border-[1.5px] rounded-lg cursor-pointer transition-all duration-200 appearance-none outline-none hover:border-slate-300 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 disabled:bg-slate-50 disabled:text-slate-400 disabled:cursor-not-allowed ${
              error ? "border-red-500 focus:ring-red-500/10" : "border-slate-200"
            }`}
          >
            <option value="">Pilih kategori utama...</option>
            {categories.map((cat) => (
              <option key={cat.id} value={cat.id}>
                {cat.name}
              </option>
            ))}
          </select>
          <ChevronDown size={16} className="absolute right-[14px] top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none transition-transform duration-200" />
        </div>
      </div>

      {/* Sub Category Search */}
      <div className="flex flex-col gap-[6px]">
        <label className="text-[0.9rem] font-medium text-slate-700">
          Sub Kategori <span className="text-red-500">*</span>
        </label>
        <div
          ref={dropdownRef}
          className={`relative w-full ${
            !selectedMainCategory ? "opacity-60 pointer-events-none" : ""
          }`}
        >
          <div
            className={`relative flex items-center w-full h-[48px] bg-white border-[1.5px] rounded-lg transition-all duration-200 hover:border-slate-300 focus-within:border-blue-500 focus-within:ring-4 focus-within:ring-blue-500/10 ${
              error ? "border-red-500 focus-within:ring-red-500/10" : "border-slate-200"
            } ${!selectedMainCategory ? "bg-slate-50 cursor-not-allowed" : ""}`}
          >
            <Search size={16} className="absolute left-[14px] text-slate-400 pointer-events-none" />
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
              className="flex-1 h-full pl-[40px] pr-[40px] py-[12px] text-[0.95rem] text-slate-900 bg-transparent border-none outline-none placeholder:text-slate-400 disabled:cursor-not-allowed"
            />
            {subCategoryName && !searchQuery && (
              <button
                type="button"
                onClick={handleClear}
                className="absolute right-[14px] flex items-center justify-center w-6 h-6 bg-slate-100 border-none rounded text-slate-500 cursor-pointer transition-all duration-200 hover:bg-slate-200 hover:text-slate-700"
              >
                <X size={14} />
              </button>
            )}
            {loading && (
              <Loader2 size={16} className="absolute right-[14px] text-blue-500 animate-spin" />
            )}
          </div>

          {/* Dropdown Results */}
          {isOpen && selectedMainCategory && (
            <div className="absolute top-[calc(100%+4px)] left-0 right-0 max-h-[280px] sm:max-h-[240px] bg-white border border-slate-200 rounded-lg shadow-[0_4px_12px_rgba(0,0,0,0.1)] z-[1000] overflow-hidden animate-[slideUp_0.2s_ease]">
              {loading ? (
                <div className="flex items-center justify-center gap-2 p-6 text-slate-500 text-[0.9rem]">
                  <Loader2 size={20} className="animate-spin" />
                  <span>Memuat sub kategori...</span>
                </div>
              ) : filteredSubCategories.length === 0 ? (
                <div className="p-6 text-center text-slate-400 text-[0.9rem]">
                  {searchQuery
                    ? "Tidak ada sub kategori yang cocok"
                    : "Tidak ada sub kategori tersedia"}
                </div>
              ) : (
                <ul className="list-none m-0 p-1 max-h-[280px] sm:max-h-[240px] overflow-y-auto">
                  {filteredSubCategories.map((sub, index) => (
                    <li
                      key={sub.id}
                      className={`px-3 py-[10px] text-[0.9rem] rounded-md cursor-pointer transition-all duration-150 select-none ${
                        index === highlightedIndex
                          ? "bg-sky-100 text-sky-700"
                          : selectedSubCategory?.id === sub.id
                          ? "bg-blue-100 text-blue-700 font-medium"
                          : "text-slate-700 hover:bg-slate-100 hover:text-slate-900"
                      }`}
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
        {error && <span className="flex items-center gap-1 mt-1 text-[0.85rem] text-red-500">{error}</span>}
      </div>
    </div>
  );
}
