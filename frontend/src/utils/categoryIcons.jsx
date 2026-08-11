import {
  Building2,
  Store,
  Camera,
  Wrench,
  Fuel,
  Car,
  GraduationCap,
  Heart,
  Smartphone,
  Shirt,
  Music,
  Users,
  Info,
  Coffee,
  MapPin,
} from "lucide-react";

const defaultIconSize = 24;
const defaultStrokeWidth = 1.5;

export function iconForCategory(name = "", options = {}) {
  const { size = defaultIconSize, strokeWidth = defaultStrokeWidth } = options;
  const n = name.toLowerCase();

  if (n.includes("perkantoran") || n.includes("kantor") || n.includes("office"))
    return <Building2 size={size} strokeWidth={strokeWidth} />;
  if (n.includes("bisnis") || n.includes("market") || n.includes("toko") || n.includes("pertokoan"))
    return <Store size={size} strokeWidth={strokeWidth} />;
  if (n.includes("wisata") || n.includes("rekreasi") || n.includes("hiburan") || n.includes("entertainment"))
    return <Camera size={size} strokeWidth={strokeWidth} />;
  if (n.includes("servis") || n.includes("jasa") || n.includes("service"))
    return <Wrench size={size} strokeWidth={strokeWidth} />;
  if (n.includes("fasilitas") || n.includes("facility"))
    return <Fuel size={size} strokeWidth={strokeWidth} />;
  if (n.includes("otomotif") || n.includes("motor") || n.includes("mobil") || n.includes("bengkel"))
    return <Car size={size} strokeWidth={strokeWidth} />;
  if (n.includes("pendidikan") || n.includes("sekolah") || n.includes("universitas") || n.includes("education"))
    return <GraduationCap size={size} strokeWidth={strokeWidth} />;
  if (n.includes("kesehatan") || n.includes("rumah sakit") || n.includes("klinik") || n.includes("health"))
    return <Heart size={size} strokeWidth={strokeWidth} />;
  if (n.includes("gadget") || n.includes("elektronik") || n.includes("hp") || n.includes("handphone"))
    return <Smartphone size={size} strokeWidth={strokeWidth} />;
  if (n.includes("fashion") || n.includes("pakaian") || n.includes("baju"))
    return <Shirt size={size} strokeWidth={strokeWidth} />;
  if (n.includes("musik") || n.includes("music") || n.includes("band") || n.includes("studio"))
    return <Music size={size} strokeWidth={strokeWidth} />;
  if (n.includes("komunitas") || n.includes("community") || n.includes("grup"))
    return <Users size={size} strokeWidth={strokeWidth} />;
  if (n.includes("informasi") || n.includes("info") || n.includes("umum") || n.includes("information"))
    return <Info size={size} strokeWidth={strokeWidth} />;
  if (n.includes("cafe") || n.includes("kuliner") || n.includes("restaurant") || n.includes("makanan"))
    return <Coffee size={size} strokeWidth={strokeWidth} />;

  return <Store size={size} strokeWidth={strokeWidth} />;
}

const largeIconSize = 26;
const largeStrokeWidth = 1.7;

export const DEFAULT_CATEGORY_TABS = [
  { id: "all", label: "Semua", icon: <Store size={largeIconSize} strokeWidth={largeStrokeWidth} /> },
  { id: "perkantoran", label: "Perkantoran", icon: <Building2 size={largeIconSize} strokeWidth={largeStrokeWidth} /> },
  { id: "bisnis", label: "Bisnis & Market", icon: <Store size={largeIconSize} strokeWidth={largeStrokeWidth} /> },
  { id: "rekreasi-hiburan", label: "Rekreasi & Hiburan", icon: <Camera size={largeIconSize} strokeWidth={largeStrokeWidth} /> },
  { id: "jasa-servis", label: "Jasa & Servis", icon: <Wrench size={largeIconSize} strokeWidth={largeStrokeWidth} /> },
  { id: "fasilitas", label: "Fasilitas", icon: <Fuel size={largeIconSize} strokeWidth={largeStrokeWidth} /> },
  { id: "otomotif", label: "Otomotif", icon: <Car size={largeIconSize} strokeWidth={largeStrokeWidth} /> },
  { id: "pendidikan", label: "Pendidikan", icon: <GraduationCap size={largeIconSize} strokeWidth={largeStrokeWidth} /> },
  { id: "kesehatan", label: "Kesehatan", icon: <Heart size={largeIconSize} strokeWidth={largeStrokeWidth} /> },
  { id: "elektronik", label: "Elektronik & Gadget", icon: <Smartphone size={largeIconSize} strokeWidth={largeStrokeWidth} /> },
  { id: "fashion", label: "Fashion", icon: <Shirt size={largeIconSize} strokeWidth={largeStrokeWidth} /> },
  { id: "musik", label: "Musik", icon: <Music size={largeIconSize} strokeWidth={largeStrokeWidth} /> },
  { id: "komunitas", label: "Komunitas", icon: <Users size={largeIconSize} strokeWidth={largeStrokeWidth} /> },
  { id: "informasi-umum", label: "Informasi Umum", icon: <Info size={largeIconSize} strokeWidth={largeStrokeWidth} /> },
];
