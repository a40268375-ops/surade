import React from "react";
import {
  Wrench,
  Leaf,
  Palette,
  Utensils,
  HeartPulse,
  Car,
  Shirt,
  ShoppingBag,
  Building2,
  Bed,
  Package,
  Smartphone,
  Tag,
} from "lucide-react";

/**
 * Helper to get contextual icons for every subcategory across the platform
 */
export const getSubcategoryIcon = (name) => {
  const n = (name || "").toLowerCase();
  if (n.includes("kayu") || n.includes("mebel")) return <Wrench size={13} className="text-amber-600 shrink-0" />;
  if (n.includes("pertanian") || n.includes("tani") || n.includes("kebun")) return <Leaf size={13} className="text-emerald-600 shrink-0" />;
  if (n.includes("kerajinan") || n.includes("anyaman") || n.includes("tikar") || n.includes("bambu")) return <Palette size={13} className="text-purple-600 shrink-0" />;
  if (n.includes("roti") || n.includes("bakery") || n.includes("kue")) return <Utensils size={13} className="text-amber-500 shrink-0" />;
  if (n.includes("warung") || n.includes("makan") || n.includes("kuliner") || n.includes("seblak") || n.includes("resto")) return <Utensils size={13} className="text-orange-500 shrink-0" />;
  if (n.includes("apotek") || n.includes("obat") || n.includes("dokter") || n.includes("sehat") || n.includes("klinik")) return <HeartPulse size={13} className="text-rose-500 shrink-0" />;
  if (n.includes("bengkel") || n.includes("motor") || n.includes("mobil") || n.includes("otomotif")) return <Car size={13} className="text-blue-600 shrink-0" />;
  if (n.includes("baju") || n.includes("busana") || n.includes("fashion") || n.includes("muslim")) return <Shirt size={13} className="text-indigo-600 shrink-0" />;
  if (n.includes("minimarket") || n.includes("yomart") || n.includes("sembako") || n.includes("retail")) return <ShoppingBag size={13} className="text-emerald-600 shrink-0" />;
  if (n.includes("cat") || n.includes("bangunan") || n.includes("properti")) return <Building2 size={13} className="text-cyan-600 shrink-0" />;
  if (n.includes("wisata") || n.includes("penginapan") || n.includes("hotel") || n.includes("pantai")) return <Bed size={13} className="text-teal-600 shrink-0" />;
  if (n.includes("olahan") || n.includes("gula") || n.includes("ikan") || n.includes("madu") || n.includes("keripik") || n.includes("opak")) return <Package size={13} className="text-amber-700 shrink-0" />;
  if (n.includes("elektronik") || n.includes("komputer") || n.includes("hp")) return <Smartphone size={13} className="text-blue-500 shrink-0" />;
  return <Tag size={13} className="text-[#007570] shrink-0" />;
};
