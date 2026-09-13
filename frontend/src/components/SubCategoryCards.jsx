import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { ChevronRight } from "lucide-react";

/* Icon mapping untuk subcategory */
const getSubCategoryIcon = (label) => {
  const l = (label || "").toLowerCase();
  
  // Kesehatan subcategories
  if (l.includes("klinik umum")) return "🏥";
  if (l.includes("apotek")) return "💊";
  if (l.includes("praktek dokter") || l.includes("dokter")) return "👨‍⚕️";
  if (l.includes("puskesmas")) return "🏨";
  if (l.includes("rumah sakit")) return "🏥";
  
  // Food & Beverage
  if (l.includes("warung")) return "🍜";
  if (l.includes("restoran")) return "🍽️";
  if (l.includes("kedai")) return "☕";
  if (l.includes("bakery") || l.includes("roti")) return "🍞";
  
  // Retail
  if (l.includes("supermarket")) return "🏪";
  if (l.includes("toko")) return "🛒";
  if (l.includes("minimarket")) return "🏬";
  
  // Otomotif
  if (l.includes("bengkel")) return "🔧";
  if (l.includes("salon mobil")) return "🚗";
  if (l.includes("pompa")) return "⛽";
  
  // Fashion
  if (l.includes("butik")) return "👗";
  if (l.includes("konveksi")) return "👔";
  
  // Education
  if (l.includes("les")) return "📚";
  if (l.includes("kursus")) return "✏️";
  if (l.includes("sekolah")) return "🎓";
  
  // Default
  return "🏢";
};

export default function SubCategoryCards({
  parentCategory = null,
  subCategories = [],
  onSubCategorySelect = null,
  selectedSubCategory = null,
  className = "",
}) {
  if (!parentCategory || !subCategories || subCategories.length === 0) {
    return null;
  }

  return (
    <div className={`w-full ${className}`}>
      {/* Header */}
      <div className="mb-5">
        <h3 className="text-xl font-bold text-slate-800">
          Sub Kategori {parentCategory.label}
        </h3>
        <p className="text-sm text-slate-500 mt-1">
          Pilih sub kategori untuk hasil pencarian yang lebih spesifik
        </p>
      </div>

      {/* Grid of sub categories */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
        {subCategories.map((sub) => {
          const icon = getSubCategoryIcon(sub.name);
          const isSelected = selectedSubCategory?.id === sub.id;

          return (
            <button
              key={sub.id}
              type="button"
              onClick={() => {
                if (onSubCategorySelect) {
                  onSubCategorySelect(sub);
                }
              }}
              className={[
                "flex flex-col items-center justify-center gap-2 p-4 rounded-xl",
                "transition-all duration-200 text-center",
                "hover:shadow-md active:scale-95",
                isSelected
                  ? "bg-gradient-to-br from-[#059669] to-[#10B981] text-white shadow-md border border-[#059669]"
                  : "bg-white border border-slate-200 text-slate-700 hover:border-[#059669] hover:bg-[#f0fdf4]",
              ].join(" ")}
              title={sub.name}
            >
              {/* Icon */}
              <div className={`text-3xl transition-transform duration-200 ${isSelected ? "scale-110" : "group-hover:scale-105"}`}>
                {icon}
              </div>

              {/* Label */}
              <span className={`text-xs font-semibold truncate w-full ${
                isSelected ? "text-white" : "text-slate-700"
              }`}>
                {sub.name}
              </span>
            </button>
          );
        })}
      </div>

      {/* Optional: Show "View All" link if many subcategories */}
      {subCategories.length > 10 && (
        <div className="flex justify-center mt-6">
          <button
            type="button"
            className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-[#059669] hover:text-[#10B981] transition-colors"
          >
            <span>Lihat Semua Sub Kategori</span>
            <ChevronRight size={16} />
          </button>
        </div>
      )}
    </div>
  );
}
