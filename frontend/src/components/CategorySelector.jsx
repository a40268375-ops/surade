import { useState, useEffect, useMemo } from "react";
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

  const subCategories = useMemo(
    () => selectedMainCategory?.children || [],
    [selectedMainCategory?.id]
  );

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

  const handleMainCategoryClick = (category) => {
    onMainCategoryChange(category);
    onSubCategoryChange(null);
    setSearchQuery("");
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
        <div className="border-r border-slate-200 max-h-[400px] overflow-y-auto">
          <div className="sticky top-0 bg-emerald-50 border-b border-emerald-100 px-3 py-2">
            <h3 className="text-[0.8rem] font-bold text-emerald-700 uppercase tracking-wide">
              Kategori Utama
            </h3>
          </div>
          <ul className="divide-y divide-slate-100">
            {categories.map((cat) => {
              const isActive = selectedMainCategory?.id === cat.id;
              const hasChildren = cat.children && cat.children.length > 0;
              
              return (
                <li key={cat.id}>
                  <button
                    type="button"
                    onClick={() => handleMainCategoryClick(cat)}
                    disabled={disabled || loading}
                    className={`w-full flex items-center justify-between px-4 py-3 text-left transition-all duration-150 ${
                      isActive
                        ? "bg-emerald-500 text-white font-semibold"
                        : "hover:bg-slate-50 text-slate-700"
                    } ${disabled ? "cursor-not-allowed opacity-50" : "cursor-pointer"}`}
                  >
                    <span className="text-[0.9rem]">{cat.name}</span>
                    {hasChildren && (
                      <ChevronRight
                        size={16}
                        className={`${isActive ? "text-white" : "text-slate-400"}`}
                      />
                    )}
                  </button>
                </li>
              );
            })}
          </ul>
        </div>

        <div className="max-h-[400px] overflow-y-auto">
          {selectedMainCategory ? (
            <>
              <div className="sticky top-0 bg-sky-50 border-b border-sky-100 p-3">
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
                  Sub Kategori {selectedMainCategory.name}
                </p>
              </div>

              <ul className="divide-y divide-slate-100 p-2">
                {filteredSubCategories.length > 0 ? (
                  filteredSubCategories.map((sub) => {
                    const isSelected = selectedSubCategory?.id === sub.id;
                    
                    return (
                      <li key={sub.id}>
                        <button
                          type="button"
                          onClick={() => handleSubCategoryClick(sub)}
                          disabled={disabled || loading}
                          className={`w-full flex items-center justify-between px-3 py-2.5 text-left rounded-md transition-all duration-150 ${
                            isSelected
                              ? "bg-sky-100 text-sky-700 font-semibold"
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
        <span className="flex items-center gap-1 text-[0.85rem] text-red-500">
          {error}
        </span>
      )}

      {selectedMainCategory && selectedSubCategory && (
        <div className="flex items-center gap-2 px-3 py-2 bg-emerald-50 border border-emerald-200 rounded-lg text-[0.85rem]">
          <Check size={14} className="text-emerald-600 shrink-0" />
          <span className="text-slate-700">
            <strong className="text-emerald-700">{selectedMainCategory.name}</strong>
            {" → "}
            <strong className="text-sky-700">{selectedSubCategory.name}</strong>
          </span>
        </div>
      )}
    </div>
  );
}