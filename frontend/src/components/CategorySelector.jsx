import { useState, useEffect, useMemo, useRef } from "react";
import { Search, ChevronRight, Check } from "lucide-react";

export default function CategorySelector({
  categories = [],
  selectedMainCategory = null,
  selectedSubCategory = null,
  onMainCategoryChange,
  onSubCategoryChange,
  disabled = false,
  error = null,
  loading = false,
}) {
  const [searchQuery, setSearchQuery] = useState("");
  const [filteredSubCategories, setFilteredSubCategories] = useState([]);
  const subCategoryContainerRef = useRef(null);

  const mainCategoryContainerRef = useRef(null);

  const subCategories = useMemo(() => {
    const raw = selectedMainCategory?.children || [];
    const uniqueMap = new Map();
    raw.forEach((sub) => {
      const key = (sub.name || "").trim().toLowerCase();
      if (key && !uniqueMap.has(key)) {
        uniqueMap.set(key, sub);
      }
    });
    return Array.from(uniqueMap.values());
  }, [selectedMainCategory?.id, selectedMainCategory?.name, selectedMainCategory?.children]);

  useEffect(() => {
    if (searchQuery.trim()) {
      const filtered = subCategories.filter((sub) =>
        sub.name.toLowerCase().includes(searchQuery.toLowerCase())
      );
      setFilteredSubCategories(filtered);
    } else {
      setFilteredSubCategories(subCategories);
    }
  }, [searchQuery, subCategories]);

  // Auto-scroll active main category into view
  useEffect(() => {
    if (mainCategoryContainerRef.current && selectedMainCategory) {
      const activeBtn = mainCategoryContainerRef.current.querySelector('[data-active="true"]');
      if (activeBtn) {
        activeBtn.scrollIntoView({ block: "nearest", behavior: "smooth" });
      }
    }
  }, [selectedMainCategory?.name, selectedMainCategory?.id]);

  // Auto-scroll active sub category into view
  useEffect(() => {
    if (subCategoryContainerRef.current && selectedSubCategory) {
      const timer = setTimeout(() => {
        const activeSubBtn = subCategoryContainerRef.current?.querySelector('[data-selected="true"]');
        if (activeSubBtn) {
          activeSubBtn.scrollIntoView({ block: "nearest", behavior: "smooth" });
        }
      }, 60);
      return () => clearTimeout(timer);
    }
  }, [selectedSubCategory?.name, selectedSubCategory?.id, selectedMainCategory?.id]);

  const handleMainCategoryClick = (category) => {
    onMainCategoryChange(category);
    onSubCategoryChange(null);
    setSearchQuery("");
    if (subCategoryContainerRef.current) {
      subCategoryContainerRef.current.scrollTop = 0;
    }
  };

  const handleSubCategoryClick = (subCategory) => {
    onSubCategoryChange(subCategory);
  };

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <label className="text-[0.9rem] font-semibold text-slate-700">
          Kategori Bisnis & Jasa <span className="text-red-500">*</span>
        </label>
        <span className="text-[0.75rem] text-slate-500">
          {categories.length} Kategori
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-[2fr_3fr] gap-3 border-[1.5px] border-slate-200 rounded-xl overflow-hidden bg-white shadow-sm">
        <div ref={mainCategoryContainerRef} className="border-r border-slate-200 max-h-[400px] overflow-y-auto">
          <div className="sticky top-0 bg-emerald-50 border-b border-emerald-100 px-3 py-2 z-10">
            <h3 className="text-[0.8rem] font-bold text-emerald-700 uppercase tracking-wide">
              Kategori Utama
            </h3>
          </div>
          <ul className="divide-y divide-slate-100">
            {categories.map((cat) => {
              const isActive = Boolean(
                selectedMainCategory && (
                  (selectedMainCategory.id != null && cat.id != null && String(selectedMainCategory.id).toLowerCase() === String(cat.id).toLowerCase()) ||
                  (selectedMainCategory.slug && cat.slug && String(selectedMainCategory.slug).toLowerCase() === String(cat.slug).toLowerCase()) ||
                  (selectedMainCategory.name && cat.name && selectedMainCategory.name.trim().toLowerCase() === cat.name.trim().toLowerCase())
                )
              );
              const hasChildren = cat.children && cat.children.length > 0;
              
              return (
                <li key={cat.id || cat.slug || cat.name}>
                  <button
                    type="button"
                    data-active={isActive ? "true" : "false"}
                    onClick={() => handleMainCategoryClick(cat)}
                    disabled={disabled || loading}
                    className={`w-full flex items-center justify-between px-4 py-3 text-left transition-all duration-150 ${
                      isActive
                        ? "bg-emerald-600 text-white font-semibold shadow-sm"
                        : "hover:bg-slate-50 text-slate-700"
                    } ${disabled ? "cursor-not-allowed opacity-50" : "cursor-pointer"}`}
                  >
                    <span className="text-[0.9rem]">{cat.name}</span>
                    {hasChildren && (
                      <ChevronRight
                        size={16}
                        className={`${isActive ? "text-white translate-x-0.5" : "text-slate-400"}`}
                      />
                    )}
                  </button>
                </li>
              );
            })}
          </ul>
        </div>

        <div ref={subCategoryContainerRef} className="max-h-[400px] overflow-y-auto">
          {selectedMainCategory ? (
            <>
              <div className="sticky top-0 bg-sky-50 border-b border-sky-100 p-3 z-10">
                <div className="relative">
                  <Search
                    size={16}
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                  />
                  <input
                    type="text"
                    placeholder="Cari sub kategori..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full h-10 pl-10 pr-4 bg-white border border-slate-200 rounded-lg text-[0.85rem] text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-sky-500 transition-all"
                  />
                </div>
                <p className="text-[0.7rem] text-slate-500 mt-1.5 uppercase font-semibold tracking-wide">
                  Sub Kategori {selectedMainCategory.name} ({subCategories.length})
                </p>
              </div>

              <ul className="divide-y divide-slate-100 p-2">
                {filteredSubCategories.length > 0 ? (
                  filteredSubCategories.map((sub) => {
                    const isSelected = Boolean(
                      selectedSubCategory && (
                        String(selectedSubCategory.id).toLowerCase() === String(sub.id).toLowerCase() ||
                        (selectedSubCategory.slug && sub.slug && String(selectedSubCategory.slug).toLowerCase() === String(sub.slug).toLowerCase()) ||
                        (selectedSubCategory.name && sub.name && String(selectedSubCategory.name).toLowerCase() === String(sub.name).toLowerCase())
                      )
                    );
                    
                    return (
                      <li key={sub.id || sub.slug || sub.name}>
                        <button
                          type="button"
                          data-selected={isSelected ? "true" : "false"}
                          onClick={() => handleSubCategoryClick(sub)}
                          disabled={disabled || loading}
                          className={`w-full flex items-center justify-between px-3 py-2.5 text-left rounded-md transition-all duration-150 ${
                            isSelected
                              ? "bg-sky-100 text-sky-800 font-semibold ring-1 ring-sky-300"
                              : "hover:bg-slate-50 text-slate-700"
                          } ${disabled ? "cursor-not-allowed opacity-50" : "cursor-pointer"}`}
                        >
                          <span className="text-[0.85rem]">{sub.name}</span>
                          {isSelected && (
                            <Check size={16} className="text-sky-600" />
                          )}
                        </button>
                      </li>
                    );
                  })
                ) : (
                  <li className="px-4 py-6 text-center text-slate-400 text-[0.85rem]">
                    {searchQuery
                      ? `Tidak ada sub kategori yang cocok dengan "${searchQuery}"`
                      : "Tidak ada sub kategori tersedia"}
                  </li>
                )}
              </ul>
            </>
          ) : (
            <div className="flex flex-col items-center justify-center h-full py-12 px-4 text-center">
              <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mb-3">
                <Search size={24} className="text-slate-400" />
              </div>
              <p className="text-[0.9rem] font-medium text-slate-600">
                Pilih Kategori Utama
              </p>
              <p className="text-[0.75rem] text-slate-400 mt-1 max-w-[200px]">
                Pilih salah satu kategori di sebelah kiri untuk melihat sub kategori
              </p>
            </div>
          )}
        </div>
      </div>

      {error && (
        <span className="flex items-center gap-1 text-[0.85rem] text-red-500 font-medium">
          {error}
        </span>
      )}

      {selectedMainCategory && selectedSubCategory && (
        <div className="flex items-center gap-2 px-3.5 py-2.5 bg-emerald-50 border border-emerald-200 rounded-xl text-[0.85rem] shadow-xs">
          <Check size={16} className="text-emerald-600 shrink-0" />
          <span className="text-slate-700 font-medium">
            Kategori Terpilih: <strong className="text-emerald-700">{selectedMainCategory.name}</strong>
            {" → "}
            <strong className="text-sky-700">{selectedSubCategory.name}</strong>
          </span>
        </div>
      )}
    </div>
  );
}