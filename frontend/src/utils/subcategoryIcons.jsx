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
  PhoneCall,
  ShieldAlert,
  Trophy,
  Video,
  Music,
  GraduationCap,
  Sparkles,
  Droplets,
  Zap,
  Flame,
  Home,
  Users,
  Search,
  Key,
  Shield,
  Scissors,
  Coffee,
} from "lucide-react";

/**
 * Helper to get contextual icons for every subcategory across the platform
 */
export const getSubcategoryIcon = (name) => {
  const n = (name || "").toLowerCase();
  
  if (n.includes("darurat") || n.includes("ambulans") || n.includes("polisi") || n.includes("damkar") || n.includes("bpbd") || n.includes("pdam") || n.includes("pln") || n.includes("penguburan") || n.includes("towing"))
    return <PhoneCall size={13} className="text-red-500 shrink-0" />;
  if (n.includes("musik") || n.includes("gitar") || n.includes("drum") || n.includes("piano") || n.includes("sound") || n.includes("biduan") || n.includes("band") || n.includes("rebana") || n.includes("organ") || n.includes("kendang"))
    return <Music size={13} className="text-purple-600 shrink-0" />;
  if (n.includes("olahraga") || n.includes("lapangan") || n.includes("futsal") || n.includes("renang") || n.includes("senam") || n.includes("camping") || n.includes("pancing"))
    return <Trophy size={13} className="text-amber-600 shrink-0" />;
  if (n.includes("video") || n.includes("foto") || n.includes("kamera") || n.includes("drone") || n.includes("streaming"))
    return <Video size={13} className="text-rose-600 shrink-0" />;
  if (n.includes("pendidikan") || n.includes("sekolah") || n.includes("bimbel") || n.includes("kursus") || n.includes("les") || n.includes("fotocopy"))
    return <GraduationCap size={13} className="text-indigo-600 shrink-0" />;
  if (n.includes("kunci") || n.includes("brankas"))
    return <Key size={13} className="text-amber-600 shrink-0" />;
  if (n.includes("satpam") || n.includes("security") || n.includes("bodyguard") || n.includes("notaris") || n.includes("hukum"))
    return <Shield size={13} className="text-slate-700 shrink-0" />;
  if (n.includes("sedot wc") || n.includes("sumur") || n.includes("pipa") || n.includes("bocor") || n.includes("toren") || n.includes("drainase"))
    return <Droplets size={13} className="text-sky-600 shrink-0" />;
  if (n.includes("listrik") || n.includes("saklar") || n.includes("lampu") || n.includes("genset") || n.includes("dinamo"))
    return <Zap size={13} className="text-amber-500 shrink-0" />;
  if (n.includes("kayu") || n.includes("mebel") || n.includes("kusen") || n.includes("pagar") || n.includes("kanopi"))
    return <Wrench size={13} className="text-amber-700 shrink-0" />;
  if (n.includes("pertanian") || n.includes("tani") || n.includes("kebun") || n.includes("rumput") || n.includes("bunga") || n.includes("bibit") || n.includes("pupuk") || n.includes("madu") || n.includes("susu") || n.includes("hewan") || n.includes("qurban") || n.includes("telur"))
    return <Leaf size={13} className="text-emerald-600 shrink-0" />;
  if (n.includes("kerajinan") || n.includes("anyaman") || n.includes("tikar") || n.includes("bambu") || n.includes("lukis") || n.includes("badut"))
    return <Palette size={13} className="text-pink-600 shrink-0" />;
  if (n.includes("roti") || n.includes("bakery") || n.includes("kue") || n.includes("warteg") || n.includes("angkringan") || n.includes("kopi") || n.includes("cafe"))
    return <Coffee size={13} className="text-amber-600 shrink-0" />;
  if (n.includes("warung") || n.includes("makan") || n.includes("kuliner") || n.includes("seblak") || n.includes("resto") || n.includes("seafood") || n.includes("catering") || n.includes("bakso") || n.includes("mie"))
    return <Utensils size={13} className="text-orange-500 shrink-0" />;
  if (n.includes("apotek") || n.includes("obat") || n.includes("dokter") || n.includes("sehat") || n.includes("klinik") || n.includes("bidan") || n.includes("sunat") || n.includes("pijat") || n.includes("ruqyah") || n.includes("bekam") || n.includes("perawat"))
    return <HeartPulse size={13} className="text-rose-500 shrink-0" />;
  if (n.includes("bengkel") || n.includes("motor") || n.includes("mobil") || n.includes("otomotif") || n.includes("steam") || n.includes("helm") || n.includes("coating") || n.includes("ketok"))
    return <Car size={13} className="text-blue-600 shrink-0" />;
  if (n.includes("baju") || n.includes("busana") || n.includes("fashion") || n.includes("muslim") || n.includes("jahit") || n.includes("seragam") || n.includes("mua") || n.includes("kebaya"))
    return <Shirt size={13} className="text-indigo-600 shrink-0" />;
  if (n.includes("salon") || n.includes("barbershop") || n.includes("pangkas"))
    return <Scissors size={13} className="text-purple-600 shrink-0" />;
  if (n.includes("minimarket") || n.includes("sembako") || n.includes("retail") || n.includes("kelontong") || n.includes("pasar"))
    return <ShoppingBag size={13} className="text-emerald-600 shrink-0" />;
  if (n.includes("cat") || n.includes("bangunan") || n.includes("properti") || n.includes("kost") || n.includes("kontrakan") || n.includes("ruko") || n.includes("apartemen") || n.includes("tanah") || n.includes("rumah"))
    return <Building2 size={13} className="text-cyan-600 shrink-0" />;
  if (n.includes("wisata") || n.includes("penginapan") || n.includes("hotel") || n.includes("pantai") || n.includes("curug") || n.includes("villa") || n.includes("homestay"))
    return <Bed size={13} className="text-teal-600 shrink-0" />;
  if (n.includes("olahan") || n.includes("gula") || n.includes("ikan") || n.includes("madu") || n.includes("keripik") || n.includes("opak") || n.includes("parsel"))
    return <Package size={13} className="text-amber-700 shrink-0" />;
  if (n.includes("elektronik") || n.includes("komputer") || n.includes("laptop") || n.includes("hp") || n.includes("cctv") || n.includes("printer") || n.includes("wifi"))
    return <Smartphone size={13} className="text-blue-500 shrink-0" />;
  if (n.includes("komunitas") || n.includes("relawan") || n.includes("taruna") || n.includes("warga"))
    return <Users size={13} className="text-teal-600 shrink-0" />;

  return <Tag size={13} className="text-[#007570] shrink-0" />;
};
