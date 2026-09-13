import { useState, useEffect, useRef } from "react";
import { Link, useNavigate, useParams, useSearchParams } from "react-router-dom";
import toast from "react-hot-toast";
import Navbar from "../components/Navbar";
import CategorySelector from "../components/CategorySelector";
import RichTextEditor, { isYouTubeUrl } from "../components/RichTextEditor";
import DiscountCodeInput from "../components/DiscountCodeInput";
import api from "../services/api";
import { getStorageUrl } from "../utils/constants";
import {
  Store, MapPin, ImageIcon, Video, Tag, Phone, Mail,
  Globe, Camera, ChevronRight, ChevronLeft,
  X, Plus, Upload, Check, AlertCircle, Loader2, Search, Trash2,
  Crown, CreditCard, FileText, Sparkles, Copy, CheckCircle2, ShieldCheck, Clock
} from "lucide-react";
import { MapContainer, TileLayer, Marker, useMapEvents, useMap } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import markerIcon2x from "leaflet/dist/images/marker-icon-2x.png";
import markerIcon from "leaflet/dist/images/marker-icon.png";
import markerShadow from "leaflet/dist/images/marker-shadow.png";

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: markerIcon2x,
  iconUrl: markerIcon,
  shadowUrl: markerShadow,
});

function getYouTubeEmbedUrl(url) {
  if (!url || typeof url !== "string") return null;
  const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|shorts\/|watch\?v=|&v=)([^#&?]*).*/;
  const match = url.trim().match(regExp);
  return match && match[2].length === 11
    ? `https://www.youtube.com/embed/${match[2]}`
    : null;
}

function MapResizeHandler() {
  const map = useMap();
  useEffect(() => {
    if (!map) return;

    const t1 = setTimeout(() => { map.invalidateSize(); }, 100);
    const t2 = setTimeout(() => { map.invalidateSize(); }, 400);

    const mapDiv = map.getContainer();
    const parent = mapDiv?.parentElement;
    if (!parent) return () => { clearTimeout(t1); clearTimeout(t2); };

    let rafId = null;
    const observer = new ResizeObserver(() => {
      if (rafId) cancelAnimationFrame(rafId);
      rafId = requestAnimationFrame(() => {
        if (map && map._container) {
          map.invalidateSize();
        }
      });
    });

    observer.observe(parent);

    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      if (rafId) cancelAnimationFrame(rafId);
      observer.disconnect();
    };
  }, [map]);
  return null;
}

function MapCenterHandler({ coords }) {
  const map = useMap();
  
  useEffect(() => {
    if (coords && map) {
      // Fly to new coordinates with animation
      map.flyTo([coords.lat, coords.lng], 15, {
        duration: 1.5, // 1.5 seconds animation
        easeLinearity: 0.25
      });
    }
  }, [coords, map]);
  
  return null;
}

const DAYS = ["Senin", "Selasa", "Rabu", "Kamis", "Jumat", "Sabtu", "Minggu"];

const DESA_LIST = [
  "Kelurahan Surade",
  "Desa Jagamukti",
  "Desa Citanglar",
  "Desa Wanasari",
  "Desa Sirnasari",
  "Desa Kadaleman",
  "Desa Gunungsungging",
  "Desa Cipeundeuy",
  "Desa Pasiripis",
  "Desa Buniwangi",
  "Desa Sukatani",
  "Desa Kademangan"
];

const TIME_OPTIONS = [];
for (let h = 0; h < 24; h++) {
  for (let m = 0; m < 60; m += 30) {
    TIME_OPTIONS.push(String(h).padStart(2, '0') + ':' + String(m).padStart(2, '0'));
  }
}

function parseTimeToMinutes(str) {
  if (!str || typeof str !== 'string') return null;
  const parts = str.split(':');
  if (parts.length !== 2) return null;
  const h = parseInt(parts[0], 10);
  const m = parseInt(parts[1], 10);
  if (isNaN(h) || isNaN(m) || h < 0 || h > 23 || m < 0 || m > 59) return null;
  return h * 60 + m;
}

function MapClickHandler({ onMapClick }) {
  useMapEvents({ click: (e) => onMapClick(e.latlng) });
  return null;
}

const inputCls = "w-full px-4 py-3 border-[1.5px] border-[#e2e8f0] rounded-xl text-[0.95rem] text-[#0f172a] bg-[#fafafa] outline-none transition-all duration-200 h-12 leading-normal focus:border-[#007570] focus:bg-white focus:shadow-[0_0_0_4px_rgba(0,117,112,0.1)]";
const labelCls = "text-[0.85rem] font-semibold text-[#374151] flex items-center gap-1.5";
const spinCls = "animate-[spin360_1s_linear_infinite]";

const PAYMENT_METHODS = [
  {
    category: "Transfer Bank / Rekening Resmi",
    items: [
      { id: "Mandiri", name: "Bank Mandiri", accountName: "Triwala Mitra Bestari", accountNumber: "133-0011-409-331", badgeColor: "bg-[#003d79] text-white" },
      { id: "BNI", name: "Bank BNI", accountName: "Triwala Mitra Bestari", accountNumber: "0973607008", badgeColor: "bg-[#f15a24] text-white" },
      { id: "BCA", name: "Bank BCA", accountName: "Triwala Mitra Bestari", accountNumber: "0954152045", badgeColor: "bg-[#00529c] text-white" },
      { id: "Maybank", name: "Maybank", accountName: "Triwala Mitra Bestari", accountNumber: "2097000009", badgeColor: "bg-[#ffc800] text-black" },
      { id: "BJB", name: "Bank BJB", accountName: "Triwala Mitra Bestari", accountNumber: "0119213282001", badgeColor: "bg-[#0072bc] text-white" },
    ]
  },
  {
    category: "E-Wallet",
    items: [
      { id: "OVO", name: "OVO", accountName: "Triwala Mitra Bestari", accountNumber: "0811-1919-711", badgeColor: "bg-[#4c2a86] text-white" },
      { id: "DANA", name: "DANA", accountName: "Triwala Mitra Bestari", accountNumber: "0811-1919-711", badgeColor: "bg-[#008cff] text-white" },
      { id: "GoPay", name: "GoPay", accountName: "Triwala Mitra Bestari", accountNumber: "0811-1919-711", badgeColor: "bg-[#00a5cf] text-white" },
    ]
  },
  {
    category: "QRIS",
    items: [
      { id: "QRIS", name: "QRIS (Semua E-Wallet & Bank)", accountName: "Triwala Mitra Bestari", accountNumber: "Scan QR Code", badgeColor: "bg-gradient-to-r from-[#00a5cf] to-[#008cff] text-white", isQRIS: true },
    ]
  }
];

export default function AddBusiness() {
  const navigate = useNavigate();
  const { id } = useParams();
  const [searchParams] = useSearchParams();
  const isEditing = !!id;
  const isUpgradeParam = searchParams.get("upgrade") === "true" || searchParams.get("mode") === "upgrade";

  const [step, setStep] = useState(isEditing ? 2 : 1);
  const [isUpgradeMode, setIsUpgradeMode] = useState(isUpgradeParam);
  const [isAlreadyPremium, setIsAlreadyPremium] = useState(false);
  const [isPendingUpgrade, setIsPendingUpgrade] = useState(false);
  const [categories, setCategories] = useState([]);
  const [plans, setPlans] = useState([]);
  const [plansLoading, setPlansLoading] = useState(false);
  
  // Desa dropdown state
  const [desaSearch, setDesaSearch] = useState("");
  const [desaDropdownOpen, setDesaDropdownOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [categoriesLoading, setCategoriesLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [createdId, setCreatedId] = useState(null);
  const [draftBizId, setDraftBizId] = useState(null); // bisnis yg sudah dibuat di step 2, dipakai di step 5
  const [deleting, setDeleting] = useState(false);
  const [isPendingVerification, setIsPendingVerification] = useState(false);
  const [rejectionReason, setRejectionReason] = useState("");
  const [businessStatus, setBusinessStatus] = useState("");

  // ── Package Selection State ──
  const [selectedPackage, setSelectedPackage] = useState(null); // null, or { isFree: true, id: 'free', ... } or plan object

  // ── Coupon State (Optional) ──
  const [couponInput, setCouponInput] = useState("");
  const [couponLoading, setCouponLoading] = useState(false);
  const [couponError, setCouponError] = useState("");
  const [couponSuccessMsg, setCouponSuccessMsg] = useState("");
  const [appliedCoupon, setAppliedCoupon] = useState(null);
  const [couponPrefill, setCouponPrefill] = useState(""); // dipicu saat user klik chip "Kupon Tersedia"
  // Daftar kode kupon yang sedang aktif & bisa dipakai, supaya user tahu
  // kode apa saja yang tersedia (bukan cuma nebak-nebak).
  const [availableCoupons, setAvailableCoupons] = useState([]);
  const [availableCouponsLoading, setAvailableCouponsLoading] = useState(true);

  useEffect(() => {
    api.get("/coupons/public-codes")
      .then((res) => {
        const list = res.data?.data || res.data || [];
        setAvailableCoupons(Array.isArray(list) ? list : []);
      })
      .catch((err) => console.error("Gagal memuat daftar kupon:", err))
      .finally(() => setAvailableCouponsLoading(false));
  }, []);

  // ── Referral State (Optional - Premium Only) ──
  const [referralInput, setReferralInput] = useState("");
  const [referralLoading, setReferralLoading] = useState(false);
  const [referralError, setReferralError] = useState("");
  const [referralSuccessMsg, setReferralSuccessMsg] = useState("");
  const [appliedReferral, setAppliedReferral] = useState(null);

  // ── Payment Method & Proof State ──
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState("DANA");
  const [copiedAccount, setCopiedAccount] = useState(false);
  const [proofFile, setProofFile] = useState(null);
  const [proofPreview, setProofPreview] = useState(null);
  const [hasExistingProof, setHasExistingProof] = useState(false); // Flag untuk existing proof
  const proofInputRef = useRef();

  // Category selection state
  const [selectedMainCategory, setSelectedMainCategory] = useState(null);
  const [selectedSubCategory, setSelectedSubCategory] = useState(null);
  const [categoryError, setCategoryError] = useState("");

  const [form, setForm] = useState({
    name: "", category_id: "", city: "", province: "", description: "",
    phone: "", whatsapp: "", email: "", website: "", instagram: "", facebook: "", opening_hours: "",
  });
  const [tagInput, setTagInput] = useState("");
  const [tags, setTags] = useState([]);
  const [banners, setBanners] = useState([]);
  const bannerInputRef = useRef();
  const [address, setAddress] = useState("");
  const [coords, setCoords] = useState(null);
  const [geocoding, setGeocoding] = useState(false);
  const [mapKey, setMapKey] = useState(0);
  const DEFAULT_CENTER = [-6.2, 106.816];
  const [photos, setPhotos] = useState([]);
  const photoInputRef = useRef();
  const [video, setVideo] = useState(null);
  const videoInputRef = useRef();
  const [videoSourceTab, setVideoSourceTab] = useState("file");
  const [youtubeUrlInput, setYoutubeUrlInput] = useState("");
  const [youtubeUrlError, setYoutubeUrlError] = useState("");
  const [deletedMediaIds, setDeletedMediaIds] = useState([]);

  // Logo / Thumbnail
  const [logo, setLogo] = useState(null);
  const [logoPreview, setLogoPreview] = useState(null);
  const logoInputRef = useRef();

  // Opening Days State
  const [openingDays, setOpeningDays] = useState(
    DAYS.map((day) => ({ day, open: "08:00", close: "17:00", selected: true }))
  );

  const handleDayToggle = (index) => {
    setOpeningDays((prev) =>
      prev.map((d, i) => {
        if (i === index) {
          if (!d.selected) {
            return { ...d, selected: true, open: "09:00", close: "17:00" };
          } else {
            return { ...d, selected: false, open: "", close: "" };
          }
        }
        return d;
      })
    );
  };

  const handleDayTimeChange = (index, field, value) => {
    setOpeningDays((prev) =>
      prev.map((d, i) => {
        if (i === index) {
          const updated = { ...d, [field]: value };
          if (field === 'close' && updated.open && value) {
            const openMinutes = parseTimeToMinutes(updated.open);
            const closeMinutes = parseTimeToMinutes(value);
            if (closeMinutes < openMinutes) {
              return d;
            }
          }
          return updated;
        }
        return d;
      })
    );
  };

  const getOpeningDaysSummary = () => {
    const active = openingDays.filter((d) => d.selected);
    if (active.length === 0) return "Tidak ada";
    if (active.length === 7) return "Setiap hari";
    return active.map((d) => d.day).join(", ");
  };

  // Fetch Categories from NavbarCategory (same as Navbar Informasi dropdown)
  useEffect(() => {
    setCategoriesLoading(true);
    fetch(`${import.meta.env.VITE_API_URL}/navbar-categories`)
      .then((r) => r.json())
      .then((d) => { 
        const list = Array.isArray(d) ? d : (d?.data || []);
        if (Array.isArray(list) && list.length > 0) {
          setCategories(list);
          
          if (!isEditing && !selectedMainCategory) {
            const defaultCat = list.find((cat) => cat.name === "Pendidikan" || cat.name === "Hiburan") || list[0];
            if (defaultCat) {
              setSelectedMainCategory(defaultCat);
            }
          }
        }
      })
      .catch(console.error)
      .finally(() => setCategoriesLoading(false));
  }, []);

  // Fetch Premium Plans dynamically from API
  useEffect(() => {
    setPlansLoading(true);
    fetch(`${import.meta.env.VITE_API_URL}/plans`)
      .then((r) => r.json())
      .then((d) => {
        const raw = Array.isArray(d) ? d : (d?.data || []);
        // Simpan SEMUA plan (termasuk Free) supaya kartu Free juga bisa
        // menampilkan fitur asli dari database, bukan teks statis.
        setPlans(raw);
        const premiumOnly = raw.filter((p) => Number(p.price) > 0);
        if (premiumOnly.length > 0 && isUpgradeParam) {
          setSelectedPackage({ ...premiumOnly[0], isFree: false });
        }
      })
      .catch(console.error)
      .finally(() => setPlansLoading(false));
  }, [isUpgradeParam]);
  
  // Close desa dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (desaDropdownOpen && !e.target.closest('.desa-dropdown-container')) {
        setDesaDropdownOpen(false);
      }
    };
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [desaDropdownOpen]);

  // Update form.category_id when subcategory or main category changes
  useEffect(() => {
    const targetCatId = selectedSubCategory?.id || selectedMainCategory?.id || "";
    if (targetCatId) {
      console.log('[DEBUG] Setting category_id:', targetCatId, selectedSubCategory?.name || selectedMainCategory?.name);
      setForm((prev) => ({ ...prev, category_id: targetCatId }));
    } else {
      console.log('[DEBUG] Clearing category_id (no category selected)');
      setForm((prev) => ({ ...prev, category_id: "" }));
    }
  }, [selectedSubCategory, selectedMainCategory]);

  // Load existing business data when editing
  useEffect(() => {
    if (isEditing && id) {
      setLoading(true);
      api.get(`/businesses/${id}`)
        .then((res) => {
          // show endpoint returns unwrapped business, fallback handles both formats
          const data = res.data?.data || res.data;
          if (data && data.id) {
            setForm({
              name: data.name || "",
              category_id: data.category_id || "",
              city: data.city || "",
              province: data.province || "",
              description: data.description || "",
              phone: data.phone || "",
              whatsapp: data.whatsapp || "",
              email: data.email || "",
              website: data.website || "",
              instagram: data.instagram || "",
              facebook: data.facebook || "",
              opening_hours: data.opening_hours || "",
            });
            setAddress(data.address || "");
            setTags(data.tags || []);
            if (data.latitude && data.longitude) {
              setCoords({ lat: parseFloat(data.latitude), lng: parseFloat(data.longitude) });
            }
            if (data.opening_days && Array.isArray(data.opening_days)) {
              setOpeningDays(DAYS.map((day) => {
                const existing = data.opening_days.find((d) => d.day === day);
                return existing
                  ? { day, open: existing.open || "08:00", close: existing.close || "17:00", selected: true }
                  : { day, open: "08:00", close: "17:00", selected: false };
              }));
            }

            if (data.category_id && categories.length > 0) {
              let subCategory = null;
              let mainCategory = null;
              for (const main of categories) {
                if (main.children && Array.isArray(main.children)) {
                  const found = main.children.find((child) => child.id === data.category_id);
                  if (found) {
                    subCategory = found;
                    mainCategory = main;
                    break;
                  }
                }
              }
              if (!subCategory) {
                mainCategory = categories.find((c) => c.id === data.category_id);
              }
              if (subCategory) {
                setSelectedSubCategory(subCategory);
                setSelectedMainCategory(mainCategory);
              } else if (mainCategory) {
                setSelectedMainCategory(mainCategory);
                setSelectedSubCategory(null);
              }
            }

            // Load existing media from gallery column (array of paths) stored on businesses table
            // Also try legacy data.media for backwards compat
            if (data.media && Array.isArray(data.media) && data.media.length > 0) {
              const existingBanners = data.media
                .filter((m) => m.title === "Banner")
                .map((m) => ({ id: m.id, preview: getStorageUrl(m.file_path), isExisting: true }));
              if (existingBanners.length > 0) setBanners(existingBanners);

              const existingPhotos = data.media
                .filter((m) => m.title !== "Banner" && m.type === "image")
                .map((m) => ({
                  id: m.id,
                  preview: getStorageUrl(m.file_path),
                  url: getStorageUrl(m.file_path),
                  isExisting: true,
                }));
              if (existingPhotos.length > 0) setPhotos(existingPhotos);

              const existingVideoItem = data.media.find((m) => m.type === "video");
              if (existingVideoItem) {
                const rawPath = existingVideoItem.file_path;
                const isUrl = rawPath.startsWith("http://") || rawPath.startsWith("https://");
                const fullUrl = isUrl ? rawPath : getStorageUrl(rawPath);
                const embed = getYouTubeEmbedUrl(fullUrl);
                setVideo({
                  id: existingVideoItem.id,
                  type: embed || isUrl ? "youtube" : "file",
                  preview: fullUrl,
                  url: fullUrl,
                  embedUrl: embed,
                  isExisting: true,
                });
              }
            } else {
              // Primary source: gallery column on businesses table (array of paths/urls)
              if (data.gallery && Array.isArray(data.gallery) && data.gallery.length > 0) {
                const galleryPhotos = data.gallery
                  .filter((path) => typeof path === 'string' && !path.includes('youtube.com') && !path.includes('youtu.be'))
                  .map((path, idx) => ({
                    id: `gallery_col_${idx}`,
                    preview: getStorageUrl(path),
                    url: getStorageUrl(path),
                    galleryPath: path,
                    isExisting: true,
                  }));
                if (galleryPhotos.length > 0) setPhotos(galleryPhotos);

                // Load youtube video from gallery column
                const galleryVideoUrl = data.gallery.find(
                  (path) => typeof path === 'string' && (path.includes('youtube.com') || path.includes('youtu.be'))
                );
                if (galleryVideoUrl) {
                  const embed = getYouTubeEmbedUrl(galleryVideoUrl);
                  setVideo({
                    type: 'youtube',
                    file: null,
                    preview: null,
                    url: galleryVideoUrl,
                    embedUrl: embed,
                    isExisting: true,
                  });
                }
              }

              // Load existing banners from banners column
              if (data.banners && Array.isArray(data.banners) && data.banners.length > 0) {
                const existingBanners = data.banners.map((path, idx) => ({
                  id: `banner_col_${idx}`,
                  preview: getStorageUrl(path),
                  bannerPath: path,
                  isExisting: true,
                }));
                setBanners(existingBanners);
              } else if (data.banner) {
                // Single banner fallback
                setBanners([{ id: 'banner_col_0', preview: getStorageUrl(data.banner), bannerPath: data.banner, isExisting: true }]);
              }
            }

            if (data.logo) {
              setLogoPreview(getStorageUrl(data.logo));
            }

            const existingProof = data.subscriptions?.[0]?.payment?.proof || data.latest_subscription?.payment?.proof || data.payment?.proof || data.proof;
            if (existingProof) {
              setProofPreview(getStorageUrl(existingProof));
              setHasExistingProof(true); // Mark that we have existing proof
            }

            if (data.rejection_reason) {
              setRejectionReason(data.rejection_reason);
            }
            if (data.status) {
              setBusinessStatus(data.status);
            }

            const subs = data.subscriptions || [];
            const latestSub = subs[0];
            const isPendingSub = Boolean(data.has_pending_subscription || (latestSub?.status === "pending" && latestSub?.payment?.status === "pending"));

            // Set default package if editing
            if (data.is_premium) {
              setIsAlreadyPremium(true);
              setIsPendingUpgrade(false);
              setIsUpgradeMode(false);
              setSelectedPackage({ id: 1, name: "Premium", price: 50000, isFree: false });
            } else if (isPendingSub) {
              setIsAlreadyPremium(false);
              setIsPendingUpgrade(true);
              setIsUpgradeMode(false);
              setSelectedPackage({ id: "free", name: "Free", price: 0, isFree: true });
            } else if (isUpgradeParam) {
              setIsAlreadyPremium(false);
              setIsPendingUpgrade(false);
              setIsUpgradeMode(true);
              const premPlan = plans.find(p => !p.name?.toLowerCase().includes("free") && Number(p.price) > 0) || { id: 1, name: "Premium Business", price: 50000, duration_value: 1, duration_unit: "month", formatted_duration: "1 Bulan", isFree: false };
              setSelectedPackage(premPlan);
            } else {
              setIsAlreadyPremium(false);
              setIsPendingUpgrade(false);
              setSelectedPackage({ id: "free", name: "Free", price: 0, isFree: true });
            }
            setStep(2);
          }
        })
        .catch((err) => {
          setError("Gagal memuat data bisnis.");
          console.error(err);
        })
        .finally(() => setLoading(false));
    }
  }, [isEditing, id, categories, isUpgradeParam, plans]);

  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setForm((p) => ({ ...p, [name]: value }));
  };

  const addTag = () => {
    const t = tagInput.trim();
    if (t && !tags.includes(t) && tags.length < 10) {
      setTags((p) => [...p, t]);
      setTagInput("");
    }
  };

  const removeTag = (t) => setTags((p) => p.filter((x) => x !== t));

  const handleBannerAdd = (files) => {
    const arr = Array.from(files);
    const remaining = 4 - banners.length;
    arr.slice(0, remaining).forEach((file) => {
      setBanners((p) => [...p, { file, preview: URL.createObjectURL(file) }]);
    });
  };

  const removeBanner = (i) => {
    setBanners((p) => {
      URL.revokeObjectURL(p[i].preview);
      return p.filter((_, idx) => idx !== i);
    });
  };

  const handleLogoChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setLogo(file);
      setLogoPreview(URL.createObjectURL(file));
    }
  };

  const removeLogo = () => {
    setLogo(null);
    if (logoPreview) URL.revokeObjectURL(logoPreview);
    setLogoPreview(null);
  };

  const handleProofChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setProofFile(file);
      setProofPreview(URL.createObjectURL(file));
      setHasExistingProof(false); // Clear existing proof flag when new file uploaded
      setError("");
    }
  };

  const removeProof = () => {
    setProofFile(null);
    if (proofPreview && proofPreview.startsWith("blob:")) {
      URL.revokeObjectURL(proofPreview);
    }
    setProofPreview(null);
    setHasExistingProof(false); // Clear existing proof flag
  };
  const handleRemoveProof = removeProof;

  const geocodeAddress = async () => {
    const query = address.trim();
    if (!query) {
      setError("Masukkan alamat terlebih dahulu");
      setTimeout(() => setError(""), 3000);
      return;
    }
    
    setGeocoding(true);
    setError(""); // Clear previous error
    
    try {
      const res = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&limit=1`,
        { headers: { "Accept-Language": "id" } }
      );
      const data = await res.json();
      
      if (data?.[0]) {
        const newCoords = { 
          lat: parseFloat(data[0].lat), 
          lng: parseFloat(data[0].lon) 
        };
        setCoords(newCoords);
        setMapKey((k) => k + 1);
        
        // Show success message
        toast.success(`Lokasi ditemukan: ${data[0].display_name.split(',').slice(0, 3).join(',')}`);
      } else {
        setError("Alamat tidak ditemukan. Coba gunakan format: Nama Tempat, Kota, Provinsi");
        setTimeout(() => setError(""), 5000);
        toast.error("Alamat tidak ditemukan");
      }
    } catch (err) {
      console.error("Geocoding error:", err);
      setError("Gagal mencari lokasi. Periksa koneksi internet Anda.");
      setTimeout(() => setError(""), 4000);
      toast.error("Gagal mencari lokasi");
    } finally {
      setGeocoding(false);
    }
  };

  // Photo Gallery Handlers
  const handlePhotoAdd = (files) => {
    if (!files || files.length === 0) return;
    const arr = Array.from(files).filter((f) => f.type.startsWith("image/"));
    const isPrem = Boolean(selectedPackage && !selectedPackage.isFree && selectedPackage.id !== "free");

    if (!isPrem) {
      const remaining = 3 - photos.length;
      if (remaining <= 0) {
        setError("Paket Free hanya dapat menambahkan maksimal 3 foto galeri. Silakan upgrade ke paket Premium untuk foto tanpa batas.");
        setTimeout(() => setError(""), 5000);
        return;
      }
      arr.slice(0, remaining).forEach((file) => {
        setPhotos((prev) => [
          ...prev,
          {
            file,
            preview: URL.createObjectURL(file),
            isExisting: false,
          },
        ]);
      });
      if (arr.length > remaining) {
        setError("Hanya 3 foto yang ditambahkan sesuai kuota paket Free. Upgrade ke Premium untuk upload tanpa batas.");
        setTimeout(() => setError(""), 5000);
      }
      return;
    }

    arr.forEach((file) => {
      setPhotos((prev) => [
        ...prev,
        {
          file,
          preview: URL.createObjectURL(file),
          isExisting: false,
        },
      ]);
    });
  };

  const removePhoto = (index) => {
    setPhotos((prev) => {
      const item = prev[index];
      if (item?.isExisting && item?.id) {
        setDeletedMediaIds((d) => [...d, item.id]);
      } else if (item?.preview && item.preview.startsWith("blob:")) {
        URL.revokeObjectURL(item.preview);
      }
      return prev.filter((_, idx) => idx !== index);
    });
  };

  // Video Handlers (Strictly 1 video limit)
  const handleVideoFileAdd = (files) => {
    if (!files || files.length === 0) return;
    const file = Array.from(files).find((f) => f.type.startsWith("video/"));
    if (!file) return;
    if (file.size > 25 * 1024 * 1024) {
      setError("Ukuran file video maksimal 25MB.");
      setTimeout(() => setError(""), 4000);
      return;
    }
    if (video?.isExisting && video?.id) {
      setDeletedMediaIds((d) => [...d, video.id]);
    } else if (video?.preview && video.preview.startsWith("blob:")) {
      URL.revokeObjectURL(video.preview);
    }

    setVideo({
      type: "file",
      file,
      preview: URL.createObjectURL(file),
      url: null,
      embedUrl: null,
      isExisting: false,
    });
    setError("");
  };

  const handleYouTubeAdd = () => {
    const url = youtubeUrlInput.trim();
    if (!url) {
      setYoutubeUrlError("Masukkan URL YouTube terlebih dahulu.");
      return;
    }
    const embed = getYouTubeEmbedUrl(url);
    if (!embed) {
      setYoutubeUrlError("URL YouTube tidak valid. Gunakan format link YouTube yang benar.");
      return;
    }
    setYoutubeUrlError("");

    if (video?.isExisting && video?.id) {
      setDeletedMediaIds((d) => [...d, video.id]);
    } else if (video?.preview && video.preview.startsWith("blob:")) {
      URL.revokeObjectURL(video.preview);
    }

    setVideo({
      type: "youtube",
      file: null,
      preview: null,
      url,
      embedUrl: embed,
      isExisting: false,
    });
    setYoutubeUrlInput("");
  };

  const handleRemoveVideo = () => {
    if (video?.isExisting && video?.id) {
      setDeletedMediaIds((d) => [...d, video.id]);
    } else if (video?.preview && video.preview.startsWith("blob:")) {
      URL.revokeObjectURL(video.preview);
    }
    setVideo(null);
    setYoutubeUrlInput("");
    setYoutubeUrlError("");
  };

  const handleReplaceVideo = () => {
    handleRemoveVideo();
  };

  // Coupon application logic
  const handleApplyCoupon = async () => {
    if (!couponInput.trim()) {
      setCouponError("Masukkan kode kupon terlebih dahulu.");
      return;
    }
    setCouponLoading(true);
    setCouponError("");
    setCouponSuccessMsg("");
    try {
      const res = await api.post("/coupons/validate", {
        code: couponInput.trim(),
        product_type: "premium",
        amount: selectedPackage?.price || 0,
      });
      if (res.data?.valid) {
        setAppliedCoupon(res.data);
        setCouponSuccessMsg(res.data.message || "Kupon berhasil diterapkan!");
      } else {
        setAppliedCoupon(null);
        setCouponError(res.data?.message || "Kode kupon tidak valid atau sudah tidak berlaku.");
      }
    } catch (e) {
      setAppliedCoupon(null);
      const msg = e?.response?.data?.message || "Kode kupon tidak valid atau sudah tidak berlaku.";
      setCouponError(msg);
    } finally {
      setCouponLoading(false);
    }
  };

  const handleRemoveCoupon = () => {
    setAppliedCoupon(null);
    setCouponInput("");
    setCouponSuccessMsg("");
    setCouponError("");
  };

  // Referral application logic (Premium Only)
  const handleApplyReferral = async () => {
    if (!referralInput.trim()) {
      setReferralError("Masukkan kode referral terlebih dahulu.");
      return;
    }
    if (isFreeSelection) {
      setReferralError("Kode referral hanya berlaku untuk pembelian paket Premium.");
      return;
    }
    setReferralLoading(true);
    setReferralError("");
    setReferralSuccessMsg("");
    try {
      const res = await api.post("/referrals/validate", {
        code: referralInput.trim(),
        product_type: "premium",
        amount: selectedPackage?.price || 0,
      });
      if (res.data?.valid) {
        setAppliedReferral(res.data);
        setReferralSuccessMsg(res.data.message || "Kode referral valid! Diskon Rp 5.000 berhasil diterapkan.");
      } else {
        setAppliedReferral(null);
        setReferralError(res.data?.message || "Kode referral tidak valid.");
      }
    } catch (e) {
      setAppliedReferral(null);
      const msg = e?.response?.data?.message || "Kode referral hanya berlaku untuk pembelian paket Premium.";
      setReferralError(msg);
    } finally {
      setReferralLoading(false);
    }
  };

  const handleRemoveReferral = () => {
    setAppliedReferral(null);
    setReferralInput("");
    setReferralSuccessMsg("");
    setReferralError("");
  };

  // Dynamic Step Indicator configuration based on Free vs Premium vs Upgrade
  const isFreeSelection = isEditing ? (!isUpgradeMode && selectedPackage?.isFree) : selectedPackage?.isFree;
  
  let currentSteps = [];
  if (isEditing) {
    if (isUpgradeMode) {
      currentSteps = [
        { id: 2, label: "Data Bisnis", icon: <Store size={18} /> },
        { id: 3, label: "Ringkasan", icon: <FileText size={18} /> },
        { id: 4, label: "Pembayaran", icon: <CreditCard size={18} /> },
        { id: 5, label: "Upload Bukti", icon: <Upload size={18} /> },
      ];
    } else {
      currentSteps = [{ id: 2, label: "Edit Data Usaha", icon: <Store size={18} /> }];
    }
  } else {
    currentSteps = isFreeSelection
      ? [
          { id: 1, label: "Pilih Paket", icon: <Crown size={18} /> },
          { id: 2, label: "Data Bisnis", icon: <Store size={18} /> },
          { id: 3, label: "Review & Daftar", icon: <Check size={18} /> },
        ]
      : [
          { id: 1, label: "Pilih Paket", icon: <Crown size={18} /> },
          { id: 2, label: "Data Bisnis", icon: <Store size={18} /> },
          { id: 3, label: "Ringkasan", icon: <FileText size={18} /> },
          { id: 4, label: "Pembayaran", icon: <CreditCard size={18} /> },
          { id: 5, label: "Upload Bukti", icon: <Upload size={18} /> },
        ];
  }

  const validateCurrentStep = () => {
    if (step === 1 && !isEditing) {
      if (!selectedPackage) return "Silakan pilih salah satu paket terlebih dahulu.";
    }
    if (step === 2) {
      if (!form.name.trim()) return "Nama usaha wajib diisi.";
      if (!selectedMainCategory) {
        setCategoryError("Pilih kategori utama.");
        return "Pilih kategori utama.";
      }
      if (selectedMainCategory.children && selectedMainCategory.children.length > 0 && !selectedSubCategory) {
        setCategoryError("Pilih sub kategori.");
        return "Pilih sub kategori.";
      }
      setCategoryError("");
      // Desa boleh kosong (Semua) atau harus dipilih salah satu
      // if (!form.city.trim()) return "Desa wajib dipilih.";
      if (!form.province.trim()) return "Provinsi wajib diisi.";
      if (!form.description.trim()) return "Deskripsi wajib diisi.";
      if (isYouTubeUrl(form.description)) {
        toast.error("Tidak diperbolehkan memasukkan link video YouTube ke dalam deskripsi usaha. Silakan gunakan fitur Galeri Video.", {
          duration: 5000,
          id: "yt-validation-error",
        });
        return "Tidak diperbolehkan memasukkan link video YouTube ke dalam deskripsi usaha. Silakan gunakan fitur Galeri Video.";
      }
      if (!form.phone.trim()) return "Nomor telepon wajib diisi.";
      if (!address.trim()) return "Alamat wajib diisi.";
    }
    if (step === 5 && !isFreeSelection) {
      // Validasi: harus ada proof file baru ATAU existing proof
      if (!proofFile && !hasExistingProof) {
        return "Wajib mengunggah bukti pembayaran sebelum mengirim.";
      }
    }
    return null;
  };

  const nextStep = async () => {
    const err = validateCurrentStep();
    if (err) {
      setError(err);
      toast.error(err, { duration: 4000 });
      setTimeout(() => setError(""), 3500);
      return;
    }
    setError("");

    // Pada step 2 (form bisnis), buat bisnis dulu ke backend sebelum lanjut ke step 3
    // supaya di step 5 kita tinggal kirim subscription + proof saja
    if (step === 2 && !isFreeSelection && !isEditing && !draftBizId) {
      setLoading(true);
      try {
        const selectedDays = openingDays
          .filter((d) => d.selected)
          .map((d) => ({ day: d.day, open: d.open, close: d.close }));
        const categoryIdToSend = selectedSubCategory?.id || selectedMainCategory?.id || form.category_id;
        const payload = {
          ...form,
          category_id: categoryIdToSend,
          address,
          tags,
          opening_days: selectedDays,
          latitude: coords?.lat ?? null,
          longitude: coords?.lng ?? null,
        };
        const bizRes = await api.post("/businesses", payload);
        const bizId = bizRes.data?.data?.id || bizRes.data?.id;
        if (!bizId) throw new Error("ID bisnis tidak ditemukan.");
        setDraftBizId(bizId);

        // Upload logo & banner jika ada
        if (logo) {
          const fd = new FormData();
          fd.append("logo", logo);
          await api.post(`/businesses/${bizId}/logo`, fd);
        }
        for (const banner of banners) {
          if (!banner.isExisting) {
            const fd = new FormData();
            fd.append("banner", banner.file);
            await api.post(`/businesses/${bizId}/banner`, fd);
          }
        }
      } catch (e) {
        const msg = e?.response?.data?.message ||
          (e?.response?.data?.errors ? Object.values(e.response.data.errors).flat().join(", ") : e.message) ||
          "Terjadi kesalahan saat menyimpan data bisnis.";
        setError(msg);
        setLoading(false);
        return;
      }
      setLoading(false);
    }

    const maxSteps = isEditing ? (isUpgradeMode ? 5 : 2) : (isFreeSelection ? 3 : 5);
    setStep((s) => Math.min(s + 1, maxSteps));
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const prevStep = () => {
    setError("");
    const minStep = isEditing ? 2 : 1;
    setStep((s) => Math.max(s - 1, minStep));
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // Submit Free Business
  const handleFreeSubmit = async () => {
    setLoading(true);
    setError("");
    try {
      console.log('[DEBUG] handleFreeSubmit - form.category_id:', form.category_id);
      console.log('[DEBUG] selectedSubCategory:', selectedSubCategory);
      console.log('[DEBUG] selectedMainCategory:', selectedMainCategory);
      
      const selectedDays = openingDays
        .filter((d) => d.selected)
        .map((d) => ({ day: d.day, open: d.open, close: d.close }));

      const categoryIdToSend = selectedSubCategory?.id || selectedMainCategory?.id || form.category_id;
      const payload = {
        ...form,
        category_id: categoryIdToSend,
        address,
        tags,
        opening_days: selectedDays,
        latitude: coords?.lat ?? null,
        longitude: coords?.lng ?? null,
      };
      
      console.log('[DEBUG] Payload being sent:', payload);

      let bizId;
      if (isEditing) {
        await api.put(`/businesses/${id}`, payload);
        bizId = id;
      } else {
        const bizRes = await api.post("/businesses", payload);
        // Handle both response formats: { data: { id } } or { id }
        bizId = bizRes.data?.data?.id || bizRes.data?.id;
        if (!bizId) throw new Error("ID bisnis tidak ditemukan.");
      }

      if (logo) {
        const fd = new FormData();
        fd.append("logo", logo);
        await api.post(`/businesses/${bizId}/logo`, fd);
      }

      for (const banner of banners) {
        // Skip existing banners (already saved, no file object)
        if (banner.isExisting || !banner.file) continue;
        const fd = new FormData();
        fd.append("banner", banner.file);
        await api.post(`/businesses/${bizId}/banner`, fd);
      }
      // Delete removed existing media items
      if (deletedMediaIds.length > 0) {
        for (const mediaId of deletedMediaIds) {
          try {
            await api.delete(`/business-media/${mediaId}`);
          } catch (err) {
            console.error("Failed to delete media item:", err);
          }
        }
      }

      // Upload new photo gallery files
      const newPhotoFiles = photos.filter((p) => !p.isExisting && p.file).map((p) => p.file);
      if (newPhotoFiles.length > 0) {
        const fd = new FormData();
        newPhotoFiles.forEach((file) => fd.append("files[]", file));
        await api.post(`/businesses/${bizId}/gallery`, fd);
      }

      // Upload or save new video
      if (video && !video.isExisting) {
        const fd = new FormData();
        if (video.type === "file" && video.file) {
          fd.append("files[]", video.file);
          await api.post(`/businesses/${bizId}/gallery`, fd);
        } else if (video.type === "youtube" && video.url) {
          fd.append("video_url", video.url);
          await api.post(`/businesses/${bizId}/gallery`, fd);
        }
      }

      setCreatedId(bizId);
      setIsPendingVerification(false);
      setSuccess(true);
    } catch (e) {
      const msg = e?.response?.data?.message ||
        (e?.response?.data?.errors ? Object.values(e.response.data.errors).flat().join(", ") : e.message) ||
        "Terjadi kesalahan saat mendaftarkan usaha.";
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  // Submit Premium Business + Subscription + Proof
  const handlePremiumSubmit = async () => {
    console.log('[DEBUG] handlePremiumSubmit called');
    console.log('[DEBUG] proofFile:', proofFile);
    console.log('[DEBUG] draftBizId:', draftBizId);
    
    const err = validateCurrentStep();
    if (err) {
      setError(err);
      return;
    }

    setLoading(true);
    setError("");
    try {
      let bizId = draftBizId;

      // Fallback: jika draftBizId belum ada (misal user reload), buat bisnis dulu
      if (!bizId) {
        const selectedDays = openingDays
          .filter((d) => d.selected)
          .map((d) => ({ day: d.day, open: d.open, close: d.close }));

        const categoryIdToSend = selectedSubCategory?.id || selectedMainCategory?.id || form.category_id;
        const payload = {
          ...form,
          category_id: categoryIdToSend,
          address,
          tags,
          opening_days: selectedDays,
          latitude: coords?.lat ?? null,
          longitude: coords?.lng ?? null,
        };

        if (isEditing) {
          await api.put(`/businesses/${id}`, payload);
          bizId = id;
        } else {
          const bizRes = await api.post("/businesses", payload);
          bizId = bizRes.data?.data?.id || bizRes.data?.id;
          if (!bizId) throw new Error("ID bisnis tidak ditemukan.");
        }

        if (logo) {
          const fd = new FormData();
          fd.append("logo", logo);
          await api.post(`/businesses/${bizId}/logo`, fd);
        }
        for (const banner of banners) {
          if (!banner.isExisting) {
            const fd = new FormData();
            fd.append("banner", banner.file);
            await api.post(`/businesses/${bizId}/banner`, fd);
          }
        }
      } else if (isEditing) {
        // Edit mode: update bisnis
        const selectedDays = openingDays
          .filter((d) => d.selected)
          .map((d) => ({ day: d.day, open: d.open, close: d.close }));
        const categoryIdToSend = selectedSubCategory?.id || selectedMainCategory?.id || form.category_id;
        const payload = {
          ...form,
          category_id: categoryIdToSend,
          address,
          tags,
          opening_days: selectedDays,
          latitude: coords?.lat ?? null,
          longitude: coords?.lng ?? null,
        };
        await api.put(`/businesses/${id}`, payload);
        bizId = id;
      }

      // Upload new photo gallery files
      const newPhotoFiles = photos.filter((p) => !p.isExisting && p.file).map((p) => p.file);
      if (newPhotoFiles.length > 0) {
        try {
          const fd = new FormData();
          newPhotoFiles.forEach((file) => fd.append("files[]", file));
          await api.post(`/businesses/${bizId}/gallery`, fd);
        } catch (gErr) {
          console.warn("Failed to upload gallery photos:", gErr);
        }
      }

      // Upload or save new video
      if (video && !video.isExisting) {
        try {
          const fd = new FormData();
          if (video.type === "file" && video.file) {
            fd.append("files[]", video.file);
            await api.post(`/businesses/${bizId}/gallery`, fd);
          } else if (video.type === "youtube" && video.url) {
            fd.append("video_url", video.url);
            await api.post(`/businesses/${bizId}/gallery`, fd);
          }
        } catch (vErr) {
          console.warn("Failed to upload video:", vErr);
        }
      }

      // Submit Subscription + Payment Proof
      const subFd = new FormData();
      subFd.append("business_id", bizId);
      subFd.append("plan_id", selectedPackage.id);
      if (appliedCoupon?.code) {
        subFd.append("coupon_code", appliedCoupon.code);
      }
      if (appliedReferral?.referral_code) {
        subFd.append("referral_code", appliedReferral.referral_code);
      }
      subFd.append("payment_method", selectedPaymentMethod);
      if (proofFile) {
        subFd.append("proof", proofFile);
      }

      await api.post("/subscriptions", subFd);

      setCreatedId(bizId);
      setIsPendingVerification(true);
      setSuccess(true);
    } catch (e) {
      const msg = e?.response?.data?.message ||
        (e?.response?.data?.errors ? Object.values(e.response.data.errors).flat().join(", ") : e.message) ||
        "Terjadi kesalahan saat mendaftarkan usaha dan mengirim pembayaran.";
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  // Save Changes for Existing Business (Direct Edit - No Subscriptions or Payments)
  const handleSaveEdit = async () => {
    const err = validateCurrentStep();
    if (err) {
      setError(err);
      setTimeout(() => setError(""), 3500);
      return;
    }

    setLoading(true);
    setError("");
    try {
      console.log('[DEBUG handleSaveEdit] form.category_id:', form.category_id);
      console.log('[DEBUG handleSaveEdit] selectedSubCategory:', selectedSubCategory);
      console.log('[DEBUG handleSaveEdit] selectedMainCategory:', selectedMainCategory);
      
      const selectedDays = openingDays
        .filter((d) => d.selected)
        .map((d) => ({ day: d.day, open: d.open, close: d.close }));

      const categoryIdToSend = selectedSubCategory?.id || selectedMainCategory?.id || form.category_id;
      const payload = {
        ...form,
        category_id: categoryIdToSend,
        address,
        tags,
        opening_days: selectedDays,
        latitude: coords?.lat ?? null,
        longitude: coords?.lng ?? null,
      };
      
      console.log('[DEBUG handleSaveEdit] Payload:', payload);

      await api.put(`/businesses/${id}`, payload);
      const bizId = id;

      if (logo) {
        const fd = new FormData();
        fd.append("logo", logo);
        await api.post(`/businesses/${bizId}/logo`, fd);
      }

      for (const banner of banners) {
        if (banner.file) {
          const fd = new FormData();
          fd.append("banner", banner.file);
          await api.post(`/businesses/${bizId}/banner`, fd);
        }
      }

      if (deletedMediaIds.length > 0) {
        for (const mediaId of deletedMediaIds) {
          try {
            await api.delete(`/business-media/${mediaId}`);
          } catch (err) {
            console.error("Failed to delete media item:", err);
          }
        }
      }

      const newPhotoFiles = photos.filter((p) => !p.isExisting && p.file).map((p) => p.file);
      if (newPhotoFiles.length > 0) {
        const fd = new FormData();
        newPhotoFiles.forEach((file) => fd.append("files[]", file));
        await api.post(`/businesses/${bizId}/gallery`, fd);
      }

      if (video && !video.isExisting) {
        const fd = new FormData();
        if (video.type === "file" && video.file) {
          fd.append("files[]", video.file);
          await api.post(`/businesses/${bizId}/gallery`, fd);
        } else if (video.type === "youtube" && video.url) {
          fd.append("video_url", video.url);
          await api.post(`/businesses/${bizId}/gallery`, fd);
        }
      }

      if (proofFile) {
        const fd = new FormData();
        fd.append("proof", proofFile);
        await api.post(`/businesses/${bizId}/proof`, fd);
      }

      setCreatedId(bizId);
      setIsPendingVerification(false);
      setSuccess(true);
      
      // Show success message immediately
      toast.success('Perubahan berhasil disimpan dan dikirim untuk verifikasi!', { duration: 4000 });
      
      // Auto redirect after short delay
      setTimeout(() => {
        navigate('/admin-user?tab=bisnis');
      }, 2000);
    } catch (e) {
      const msg = e?.response?.data?.message ||
        (e?.response?.data?.errors ? Object.values(e.response.data.errors).flat().join(", ") : e.message) ||
        "Terjadi kesalahan saat memperbarui data usaha.";
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm("Apakah Anda yakin ingin menghapus bisnis ini? Tindakan ini tidak dapat dibatalkan.")) {
      return;
    }
    setDeleting(true);
    setError("");
    try {
      await api.delete(`/businesses/${id}`);
      navigate("/admin-user");
    } catch (e) {
      const msg = e?.response?.data?.message || "Gagal menghapus bisnis.";
      setError(msg);
    } finally {
      setDeleting(false);
    }
  };

  const createDropHandler = (onAdd) => ({
    onDragOver: (e) => e.preventDefault(),
    onDrop: (e) => { e.preventDefault(); onAdd(e.dataTransfer.files); },
  });

  const getAccountDetail = () => {
    for (const cat of PAYMENT_METHODS) {
      const found = cat.items.find((item) => item.id === selectedPaymentMethod);
      if (found) return found;
    }
    return PAYMENT_METHODS[0].items[0];
  };

  const currentAccount = getAccountDetail();

  // ── SUCCESS SCREEN ──
  if (success) {
    return (
      <div className="min-h-screen bg-[#f0f4f8] font-['Poppins',sans-serif]">
        <Navbar />
        <div className="flex flex-col items-center justify-center min-h-[calc(100vh-80px)] text-center px-6 py-[60px] max-w-[560px] mx-auto">
          {isPendingVerification ? (
            <>
              <div className="w-[90px] h-[90px] rounded-full bg-gradient-to-br from-[#d97706] to-[#f59e0b] text-white flex items-center justify-center mb-7 shadow-[0_8px_32px_rgba(217,119,6,0.3)] animate-[popIn_0.4s_cubic-bezier(0.34,1.56,0.64,1)_both]">
                <Clock size={48} />
              </div>
              <h1 className="text-[1.8rem] font-extrabold text-[#0f172a] mb-3.5">
                {isEditing ? "Permohonan Upgrade & Pembayaran Berhasil Dikirim!" : "Pendaftaran & Pembayaran Berhasil Dikirim!"}
              </h1>
              <p className="text-base text-[#64748b] leading-[1.7] mb-8">
                Bukti pembayaran paket Premium kamu untuk <strong className="text-[#0f172a]">{form.name}</strong> sedang dalam proses verifikasi oleh Admin. Status Premium akan otomatis aktif setelah pembayaran disetujui.
              </p>
              <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 mb-8 text-left text-[0.88rem] text-amber-900 w-full flex items-start gap-3">
                <AlertCircle size={20} className="text-amber-600 shrink-0 mt-0.5" />
                <div>
                  <span className="font-bold block mb-1">Status Langganan: Pending Verifikasi</span>
                  Kamu tetap bisa mengakses dashboard usaha kamu. Fitur Premium akan terbuka secara penuh setelah admin menyelesaikan verifikasi.
                </div>
              </div>
            </>
          ) : (
            <>
              <div className="w-[90px] h-[90px] rounded-full bg-gradient-to-br from-[#d97706] to-[#f59e0b] text-white flex items-center justify-center mb-7 shadow-[0_8px_32px_rgba(217,119,6,0.3)] animate-[popIn_0.4s_cubic-bezier(0.34,1.56,0.64,1)_both]">
                <Clock size={48} />
              </div>
              <h1 className="text-[1.8rem] font-extrabold text-[#0f172a] mb-3.5">
                {isEditing ? "Usaha Berhasil Diperbarui!" : "Usaha Berhasil Dikirim!"}
              </h1>
              <p className="text-base text-[#64748b] leading-[1.7] mb-9">
                {isEditing 
                  ? "Perubahan data usaha kamu telah berhasil diajukan ulang dan menunggu peninjauan dari Admin."
                  : "Usaha kamu telah berhasil terdaftar dan saat ini berstatus Menunggu Persetujuan Admin sebelum tampil di publik."}
              </p>
            </>
          )}

          <div className="flex gap-3.5 flex-wrap justify-center w-full">
            <Link
              to={"/business/" + createdId}
              className="inline-flex items-center justify-center gap-2 px-7 py-3.5 bg-gradient-to-br from-[#007570] to-[#009990] text-white rounded-[14px] text-[0.95rem] font-semibold no-underline border-0 cursor-pointer transition-all duration-[0.25s] shadow-[0_4px_16px_rgba(0,117,112,0.3)] hover:-translate-y-0.5 hover:shadow-[0_8px_24px_rgba(0,117,112,0.4)] flex-1 min-w-[200px]"
            >
              Lihat Halaman Usaha
            </Link>
            <Link
              to="/admin-user"
              className="inline-flex items-center justify-center gap-2 px-7 py-3.5 bg-white text-[#374151] rounded-[14px] text-[0.95rem] font-semibold no-underline border-[1.5px] border-[#e2e8f0] cursor-pointer transition-all duration-[0.25s] hover:bg-[#f8fafc] hover:border-[#94a3b8] flex-1 min-w-[200px]"
            >
              Ke Dashboard Admin
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f0f4f8] font-['Poppins',sans-serif]">
      <Navbar />

      {/* HERO */}
      <div className="bg-gradient-to-br from-[#0a1428] via-[#004f4c] to-[#007570] pt-[110px] pb-14 px-6 text-center relative overflow-hidden">
        <div className="absolute inset-0 [background-image:radial-gradient(rgba(255,255,255,0.06)_1px,transparent_1px)] [background-size:28px_28px]" />
        <div className="relative z-[1]">
          <h1 className="text-[clamp(1.8rem,4vw,2.8rem)] font-extrabold text-white tracking-[-0.03em] mb-2.5">
            {isEditing ? "Edit Usaha Kamu" : "Pendaftaran Usaha Baru"}
          </h1>
          <p className="text-[1.05rem] text-white/75">
            {isEditing ? "Perbarui informasi usaha kamu" : "Pilih paket dan kembangkan usaha kamu ke seluruh Indonesia"}
          </p>
        </div>
      </div>

      {/* BODY CONTAINER */}
      <div className="max-w-[920px] mx-auto px-6 pt-10 pb-20">

        {/* STEP INDICATOR */}
        <div className="flex items-center justify-center mb-9 flex-wrap gap-y-4">
          {currentSteps.map((s, i) => (
            <div key={s.id} className="flex items-center">
              <div className="flex flex-col items-center gap-2 cursor-default">
                <div className={`w-[44px] h-[44px] rounded-full flex items-center justify-center border-2 transition-all duration-300
                  ${step === s.id
                    ? "bg-[#007570] border-[#007570] text-white shadow-[0_0_0_6px_rgba(0,117,112,0.15)]"
                    : step > s.id
                    ? "bg-[#16a34a] border-[#16a34a] text-white"
                    : "bg-[#e2e8f0] border-[#e2e8f0] text-[#94a3b8]"
                  }`}
                >
                  {step > s.id ? <Check size={16} /> : s.icon}
                </div>
                <span className={`text-[0.78rem] font-semibold transition-colors duration-300 whitespace-nowrap
                  ${step === s.id ? "text-[#007570]" : step > s.id ? "text-[#16a34a]" : "text-[#94a3b8]"}`}
                >
                  {s.label}
                </span>
              </div>
              {i < currentSteps.length - 1 && (
                <div className={`w-10 sm:w-14 h-0.5 mx-1 mb-6 transition-colors duration-300
                  ${step > s.id ? "bg-[#16a34a]" : "bg-[#e2e8f0]"}`}
                />
              )}
            </div>
          ))}
        </div>

        {/* ERROR MESSAGE */}
        {error && (
          <div className="flex items-center gap-2.5 bg-[#fef2f2] border border-[#fecaca] rounded-xl px-[18px] py-3.5 text-[#dc2626] text-[0.9rem] mb-6 animate-[slideDown_0.2s_ease]">
            <AlertCircle size={18} className="shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* ── STEP 1: PILIH PAKET ── */}
        {step === 1 && (
          <div className="bg-white rounded-[20px] shadow-[0_4px_24px_rgba(15,23,42,0.07)] p-6 sm:p-9 mb-6 border border-[#e2e8f0] animate-[fadeCard_0.25s_ease]">
            <div className="flex items-start gap-4 mb-8 pb-6 border-b border-[#f1f5f9]">
              <Crown size={28} className="text-[#007570] shrink-0 mt-1" />
              <div>
                <h2 className="text-[1.35rem] font-bold text-[#0f172a] mb-1">Pilihan Paket</h2>
                <p className="text-[0.92rem] text-[#64748b]">Pilih paket yang sesuai dengan kebutuhan usaha kamu.</p>
              </div>
            </div>

            {plansLoading ? (
              <div className="flex flex-col items-center justify-center py-12 text-[#94a3b8]">
                <Loader2 size={36} className={spinCls} />
                <span className="text-sm font-medium mt-3">Memuat pilihan paket...</span>
              </div>
            ) : (() => {
              const freePlan = plans.find((p) => Number(p.price) === 0);
              const premiumPlans = plans.filter((p) => Number(p.price) > 0);
              return (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-7">
                {/* ── CARD FREE ── */}
                <div
                  onClick={() => setSelectedPackage({ id: 'free', name: 'Free', price: 0, isFree: true })}
                  className={`relative rounded-3xl p-7 md:p-8 border-2 transition-all duration-300 flex flex-col justify-between cursor-pointer bg-gradient-to-b from-[#f0fdfa]/60 via-white to-white ${
                    selectedPackage?.isFree
                      ? "border-[#007570] shadow-[0_8px_30px_rgba(0,117,112,0.18)] -translate-y-1 ring-4 ring-[#007570]/10"
                      : "border-[#e2e8f0] hover:border-[#007570]/40 hover:shadow-md"
                  }`}
                >
                  {selectedPackage?.isFree && (
                    <div className="absolute top-6 right-6 bg-[#007570] text-white p-1.5 rounded-full shadow-sm">
                      <Check size={16} strokeWidth={2.5} />
                    </div>
                  )}

                  <div>
                    <div className="inline-block px-3 py-1 bg-[#e6f7f5] text-[#007570] border border-[#ccfbf1] font-bold text-[0.72rem] rounded-full mb-3 uppercase tracking-wider">
                      PAKET STARTER
                    </div>
                    <h3 className="text-2xl font-black text-[#0f172a] mb-1">Free Basic</h3>
                    <div className="flex items-baseline gap-1 my-3.5">
                      <span className="text-3xl font-black text-[#007570]">Rp0</span>
                      <span className="text-xs font-semibold text-slate-400">/ Selamanya</span>
                    </div>
                    <p className="text-[0.88rem] text-[#64748b] mb-6 leading-relaxed">
                      Cocok untuk memulai dan mengenalkan usaha Anda ke direktori umum.
                    </p>

                    <div className="space-y-3 pt-5 border-t border-slate-100 text-[0.88rem]">
                      {freePlan?.features && Object.keys(freePlan.features).length > 0 ? (
                        Object.entries(freePlan.features).map(([featureName, enabled]) => (
                          <div
                            key={featureName}
                            className={`flex items-center gap-2.5 font-medium ${enabled ? "text-slate-700" : "text-slate-400 line-through"}`}
                          >
                            {enabled ? (
                              <Check size={16} className="text-[#007570] shrink-0" />
                            ) : (
                              <X size={16} className="text-slate-300 shrink-0" />
                            )}
                            <span>{featureName}</span>
                          </div>
                        ))
                      ) : (
                        [
                          { name: "Lokasi Peta Penuh", enabled: false },
                          { name: "Galeri Foto Profil", enabled: false },
                          { name: "Fitur Katalog Produk", enabled: true },
                          { name: "Akses Chat & WA Direct", enabled: true },
                          { name: "Prioritas & Badge Premium", enabled: false },
                        ].map((f) => (
                          <div
                            key={f.name}
                            className={`flex items-center gap-2.5 font-medium ${f.enabled ? "text-slate-700" : "text-slate-400 line-through"}`}
                          >
                            {f.enabled ? (
                              <Check size={16} className="text-[#007570] shrink-0" />
                            ) : (
                              <X size={16} className="text-slate-300 shrink-0" />
                            )}
                            <span>{f.name}</span>
                          </div>
                        ))
                      )}
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedPackage({ id: 'free', name: 'Free', price: 0, isFree: true });
                      setStep(2);
                    }}
                    className={`mt-8 w-full py-3.5 px-4 rounded-2xl text-[0.92rem] font-bold transition-all duration-200 border-0 cursor-pointer ${
                      selectedPackage?.isFree
                        ? "bg-[#007570] text-white shadow-lg shadow-[#007570]/30"
                        : "bg-[#eef8f7] text-[#007570] hover:bg-[#007570] hover:text-white"
                    }`}
                  >
                    Gunakan Paket Free
                  </button>
                </div>

                {/* ── CARD PREMIUM (Clean Ultra-Premium Design) ── */}
                {premiumPlans.length === 0 ? (
                  <div
                    onClick={() => setSelectedPackage({ id: 1, name: "Premium Business", price: 50000, duration_value: 1, duration_unit: "month", formatted_duration: "1 Bulan", isFree: false })}
                    className={`relative rounded-3xl p-7 md:p-8 border-2 transition-all duration-300 flex flex-col justify-between cursor-pointer overflow-hidden group ${
                      selectedPackage && !selectedPackage.isFree
                        ? "bg-gradient-to-b from-[#0c2b27] via-[#053733] to-[#021f1d] text-white border-amber-400 shadow-[0_16px_40px_rgba(0,117,112,0.35)] -translate-y-1.5 ring-4 ring-amber-400/20"
                        : "bg-gradient-to-b from-[#0e3530] via-[#082e29] to-[#041d1a] text-white border-[#009990]/40 hover:border-amber-400/70 hover:shadow-[0_12px_36px_rgba(0,117,112,0.3)] hover:-translate-y-1"
                    }`}
                  >
                    {/* Ambient Glows */}
                    <div className="absolute -top-24 -right-24 w-60 h-60 bg-gradient-to-br from-amber-400/20 to-[#00c48c]/30 rounded-full blur-3xl pointer-events-none" />
                    <div className="absolute -bottom-24 -left-24 w-60 h-60 bg-gradient-to-tr from-[#007570]/30 to-teal-400/10 rounded-full blur-3xl pointer-events-none" />

                    <div>
                      {/* Top Header Badge */}
                      <div className="flex items-center justify-between gap-2 mb-4 relative z-10">
                        <div className="inline-flex items-center gap-1 px-3.5 py-1 rounded-full text-[0.72rem] font-bold uppercase tracking-wider bg-gradient-to-r from-amber-400 via-amber-300 to-amber-500 text-slate-950 shadow-sm">
                          <span>REKOMENDASI TERBAIK</span>
                        </div>

                        {selectedPackage && !selectedPackage.isFree && (
                          <div className="bg-amber-400 text-slate-950 p-1.5 rounded-full shadow-md font-bold flex items-center justify-center">
                            <Check size={16} strokeWidth={3} />
                          </div>
                        )}
                      </div>

                      <div className="relative z-10">
                        <h3 className="text-2xl font-black text-white tracking-tight mb-1">Premium Business</h3>

                        <div className="flex items-baseline gap-2 my-3.5">
                          <span className="text-3xl sm:text-4xl font-black text-white">
                            Rp50.000
                          </span>
                          <span className="text-xs sm:text-sm font-semibold text-emerald-200/80">/ 1 Bulan</span>
                        </div>

                        <p className="text-[0.88rem] text-slate-300 mb-6 leading-relaxed">
                          Tingkatkan jangkauan usaha dengan badge terverifikasi, peta interaktif, galeri lengkap, dan prioritas pencarian.
                        </p>

                        <div className="space-y-3 pt-5 border-t border-white/15 text-[0.88rem]">
                          <div className="flex items-center gap-2.5 text-slate-100 font-medium">
                            <Check size={16} className="text-emerald-400 shrink-0" />
                            <span>Integrasi Map &amp; Lokasi Interaktif</span>
                          </div>
                          <div className="flex items-center gap-2.5 text-slate-100 font-medium">
                            <Check size={16} className="text-emerald-400 shrink-0" />
                            <span>Galeri Foto Banner &amp; Video Profil</span>
                          </div>
                          <div className="flex items-center gap-2.5 text-slate-100 font-medium">
                            <Check size={16} className="text-emerald-400 shrink-0" />
                            <span>Katalog Produk &amp; Rata-rata Harga</span>
                          </div>
                          <div className="flex items-center gap-2.5 text-slate-100 font-medium">
                            <Check size={16} className="text-emerald-400 shrink-0" />
                            <span>Akses Fitur Chat Langsung</span>
                          </div>
                          <div className="flex items-center gap-2.5 text-amber-300 font-semibold">
                            <Check size={16} className="text-amber-400 shrink-0" />
                            <span>Badge Bisnis Terverifikasi &amp; Prioritas</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedPackage({ id: 1, name: "Premium Business", price: 50000, duration_value: 1, duration_unit: "month", formatted_duration: "1 Bulan", isFree: false });
                        setStep(2);
                      }}
                      className={`mt-8 w-full py-3.5 px-5 rounded-2xl text-[0.95rem] font-bold transition-all duration-200 border-0 cursor-pointer relative z-10 flex items-center justify-center gap-2 ${
                        selectedPackage && !selectedPackage.isFree
                          ? "bg-gradient-to-r from-amber-400 via-amber-300 to-amber-500 text-slate-950 shadow-[0_4px_20px_rgba(251,191,36,0.5)] scale-[1.02]"
                          : "bg-[#00c48c] hover:bg-[#00b074] text-slate-950 font-extrabold shadow-[0_4px_20px_rgba(0,196,140,0.4)] hover:scale-[1.02] active:scale-[0.98]"
                      }`}
                    >
                      <span>{selectedPackage && !selectedPackage.isFree ? "Paket Premium Terpilih" : "Pilih Paket Premium"}</span>
                      <ChevronRight size={18} />
                    </button>
                  </div>
                ) : (
                  premiumPlans.map((plan) => {
                    const isSelected = selectedPackage?.id === plan.id;
                    const durationText = plan.formatted_duration || `${plan.duration_value || 1} ${plan.duration_unit === 'year' || plan.duration_unit === 'tahun' ? 'Tahun' : 'Bulan'}`;

                    return (
                      <div
                        key={plan.id}
                        onClick={() => setSelectedPackage({ ...plan, isFree: false })}
                        className={`relative rounded-3xl p-7 md:p-8 border-2 transition-all duration-300 flex flex-col justify-between cursor-pointer overflow-hidden group ${
                          isSelected
                            ? "bg-gradient-to-b from-[#0c2b27] via-[#053733] to-[#021f1d] text-white border-amber-400 shadow-[0_16px_40px_rgba(0,117,112,0.35)] -translate-y-1.5 ring-4 ring-amber-400/20"
                            : "bg-gradient-to-b from-[#0e3530] via-[#082e29] to-[#041d1a] text-white border-[#009990]/40 hover:border-amber-400/70 hover:shadow-[0_12px_36px_rgba(0,117,112,0.3)] hover:-translate-y-1"
                        }`}
                      >
                        {/* Ambient Glows */}
                        <div className="absolute -top-24 -right-24 w-60 h-60 bg-gradient-to-br from-amber-400/20 to-[#00c48c]/30 rounded-full blur-3xl pointer-events-none" />
                        <div className="absolute -bottom-24 -left-24 w-60 h-60 bg-gradient-to-tr from-[#007570]/30 to-teal-400/10 rounded-full blur-3xl pointer-events-none" />

                        <div>
                          {/* Top Header Badge */}
                          <div className="flex items-center justify-between gap-2 mb-4 relative z-10">
                            <div className="inline-flex items-center gap-1 px-3.5 py-1 rounded-full text-[0.72rem] font-bold uppercase tracking-wider bg-gradient-to-r from-amber-400 via-amber-300 to-amber-500 text-slate-950 shadow-sm">
                              <span>REKOMENDASI TERBAIK</span>
                            </div>

                            {isSelected && (
                              <div className="bg-amber-400 text-slate-950 p-1.5 rounded-full shadow-md font-bold flex items-center justify-center">
                                <Check size={16} strokeWidth={3} />
                              </div>
                            )}
                          </div>

                          <div className="relative z-10">
                            <h3 className="text-2xl font-black text-white tracking-tight mb-1">{plan.name}</h3>

                            <div className="flex items-baseline gap-2 my-3.5">
                              <span className="text-3xl sm:text-4xl font-black text-white">
                                Rp{Number(plan.price || 0).toLocaleString('id-ID')}
                              </span>
                              <span className="text-xs sm:text-sm font-semibold text-emerald-200/80">/ {durationText}</span>
                            </div>

                            <p className="text-[0.88rem] text-slate-300 mb-6 leading-relaxed">
                              {plan.description || "Tingkatkan promosi usaha Anda dengan fitur terlengkap dan badge bisnis terverifikasi."}
                            </p>

                            <div className="space-y-3 pt-5 border-t border-white/15 text-[0.88rem]">
                              {plan.features && Object.keys(plan.features).length > 0 ? (
                                Object.entries(plan.features).map(([featureName, enabled]) => (
                                  <div
                                    key={featureName}
                                    className={`flex items-center gap-2.5 font-medium ${enabled ? "text-slate-100" : "text-slate-400 line-through"}`}
                                  >
                                    {enabled ? (
                                      <Check size={16} className="text-emerald-400 shrink-0" />
                                    ) : (
                                      <X size={16} className="text-slate-500 shrink-0" />
                                    )}
                                    <span>{featureName}</span>
                                  </div>
                                ))
                              ) : (
                                <div className="flex items-center gap-2.5 text-slate-100 font-medium">
                                  <Check size={16} className="text-emerald-400 shrink-0" />
                                  <span>Akses fitur lengkap untuk usaha Anda</span>
                                </div>
                              )}
                            </div>
                          </div>
                        </div>

                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedPackage({ ...plan, isFree: false });
                            setStep(2);
                          }}
                          className={`mt-8 w-full py-3.5 px-5 rounded-2xl text-[0.95rem] font-bold transition-all duration-200 border-0 cursor-pointer relative z-10 flex items-center justify-center gap-2 ${
                            isSelected
                              ? "bg-gradient-to-r from-amber-400 via-amber-300 to-amber-500 text-slate-950 shadow-[0_4px_20px_rgba(251,191,36,0.5)] scale-[1.02]"
                              : "bg-[#00c48c] hover:bg-[#00b074] text-slate-950 font-extrabold shadow-[0_4px_20px_rgba(0,196,140,0.4)] hover:scale-[1.02] active:scale-[0.98]"
                          }`}
                        >
                          <span>{isSelected ? "Paket Premium Terpilih" : "Pilih Paket Premium"}</span>
                          <ChevronRight size={18} />
                        </button>
                      </div>
                    );
                  })
                )}
              </div>
              );
            })()}
          </div>
        )}

        {/* ── STEP 2: DATA BISNIS ── */}
        {step === 2 && (
          <div className="bg-white rounded-[20px] shadow-[0_4px_24px_rgba(15,23,42,0.07)] p-6 sm:p-9 mb-6 border border-[#e2e8f0] animate-[fadeCard_0.25s_ease]">
            <div className="flex items-start justify-between pb-6 border-b border-[#f1f5f9] mb-8">
              <div className="flex items-start gap-4">
                <Store size={26} className="text-[#007570] shrink-0 mt-1" />
                <div>
                  <h2 className="text-[1.25rem] font-bold text-[#0f172a] mb-1">
                    {isEditing ? `Edit Data Usaha: ${form.name || ""}` : "Informasi Data Bisnis"}
                  </h2>
                  <p className="text-[0.9rem] text-[#64748b]">
                    {isEditing ? "Perbarui informasi detail tentang usaha kamu." : "Lengkapi informasi detail tentang usaha yang didaftarkan."}
                  </p>
                </div>
              </div>
              {isEditing ? (
                <div className="hidden sm:flex items-center gap-2 px-3.5 py-1.5 bg-[#f0fffe] border border-[#007570]/30 rounded-full text-xs font-bold text-[#007570]">
                  {isUpgradeMode || selectedPackage?.isFree === false ? <Sparkles size={14} className="text-amber-500" /> : <Store size={14} />}
                  <span>{isUpgradeMode ? "Mode Upgrade Premium" : (isAlreadyPremium ? "Paket Premium Aktif" : "Paket Free")}</span>
                </div>
              ) : selectedPackage && (
                <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 bg-[#f0fffe] border border-[#007570]/30 rounded-full text-xs font-bold text-[#007570]">
                  <Crown size={14} />
                  <span>{selectedPackage.name}</span>
                </div>
              )}
            </div>

            {/* Alert if already premium in upgrade mode */}
            {isEditing && isAlreadyPremium && isUpgradeParam && (
              <div className="mb-8 rounded-2xl p-5 bg-amber-50 border-2 border-amber-300 text-amber-950 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 animate-fadeIn">
                <div className="flex items-start gap-3.5">
                  <div className="w-11 h-11 rounded-2xl bg-amber-200 text-amber-900 flex items-center justify-center font-bold shrink-0 shadow-xs">
                    <Crown size={22} />
                  </div>
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="px-2.5 py-0.5 rounded-full text-[10.5px] font-extrabold bg-amber-200 text-amber-900 uppercase tracking-wider">
                        Sudah Premium Aktif
                      </span>
                      <h4 className="text-sm font-bold text-amber-950">
                        Usaha "{form.name || 'Ini'}" Sudah Memiliki Paket Premium
                      </h4>
                    </div>
                    <p className="text-xs text-amber-800 leading-relaxed">
                      Profil bisnis Anda sudah berstatus <strong>Premium Aktif</strong> dengan seluruh fasilitas lengkap (Peta Lokasi, Galeri Foto &amp; Video, Direct Chat, dan Badge Terverifikasi). Anda tidak dapat melakukan upgrade ganda. Silakan pilih usaha Anda yang lain jika ingin meng-upgrade usaha berstatus Free.
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
                  <button
                    type="button"
                    onClick={() => navigate('/admin/premium')}
                    className="px-4 py-2 bg-[#007570] hover:bg-[#005a58] text-white rounded-xl text-xs font-bold transition-all shadow-xs cursor-pointer border-0 flex items-center gap-1.5"
                  >
                    <span>Pilih Usaha Lain</span>
                    <ChevronRight size={14} />
                  </button>
                </div>
              </div>
            )}

            {/* Alert if pending verification in upgrade mode */}
            {isEditing && isPendingUpgrade && isUpgradeParam && (
              <div className="mb-8 rounded-2xl p-5 bg-blue-50 border-2 border-blue-300 text-blue-950 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 animate-fadeIn">
                <div className="flex items-start gap-3.5">
                  <div className="w-11 h-11 rounded-2xl bg-blue-200 text-blue-900 flex items-center justify-center font-bold shrink-0 shadow-xs">
                    <Clock size={22} />
                  </div>
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="px-2.5 py-0.5 rounded-full text-[10.5px] font-extrabold bg-blue-200 text-blue-900 uppercase tracking-wider">
                        Sedang Diverifikasi Admin
                      </span>
                      <h4 className="text-sm font-bold text-blue-950">
                        Pengajuan Upgrade Usaha "{form.name || 'Ini'}" Sedang Diproses
                      </h4>
                    </div>
                    <p className="text-xs text-blue-800 leading-relaxed">
                      Bukti pembayaran paket Premium untuk usaha ini telah berhasil dikirim dan saat ini sedang menunggu antrean verifikasi oleh Admin. Anda tidak perlu mengajukan atau membayar ulang. Silakan pilih usaha lain jika ingin meng-upgrade usaha yang berbeda.
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
                  <button
                    type="button"
                    onClick={() => navigate('/admin/premium')}
                    className="px-4 py-2 bg-[#007570] hover:bg-[#005a58] text-white rounded-xl text-xs font-bold transition-all shadow-xs cursor-pointer border-0 flex items-center gap-1.5"
                  >
                    <span>Pilih Usaha Lain</span>
                    <ChevronRight size={14} />
                  </button>
                </div>
              </div>
            )}

            {/* Upgrade Mode Banner for Existing Business */}
            {isEditing && isUpgradeMode && !isAlreadyPremium && !isPendingUpgrade && (
              <div className="mb-8 rounded-2xl p-5 bg-gradient-to-r from-[#0c2b27] via-[#053733] to-[#021f1d] text-white border-2 border-amber-400 shadow-md flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 animate-fadeIn">
                <div className="flex items-center gap-3">
                  <div className="w-11 h-11 rounded-2xl bg-amber-400 text-slate-950 flex items-center justify-center font-bold shrink-0 shadow-sm">
                    <Crown size={22} />
                  </div>
                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-sm font-extrabold text-amber-300">Mode Upgrade ke Premium Aktif</span>
                      <span className="text-xs bg-amber-400/20 text-amber-300 border border-amber-400/30 px-2.5 py-0.5 rounded-full font-bold">
                        {selectedPackage?.name || "Premium Business"}
                      </span>
                    </div>
                    <p className="text-xs text-slate-200 mt-1 leading-relaxed">
                      Data usaha Anda sudah terisi otomatis. Anda dapat meninjau/memperbarui informasi (fitur peta lokasi &amp; galeri luas terbuka!), lalu lanjutkan ke tahap pembayaran &amp; upload bukti transfer.
                    </p>
                  </div>
                </div>
                {!isUpgradeParam && (
                  <button
                    type="button"
                    onClick={() => {
                      setIsUpgradeMode(false);
                      setSelectedPackage({ id: 'free', name: 'Free', price: 0, isFree: true });
                    }}
                    className="text-xs text-slate-300 hover:text-white underline cursor-pointer bg-transparent border-0 shrink-0 self-end sm:self-center"
                  >
                    Batalkan Upgrade
                  </button>
                )}
              </div>
            )}

            {/* Upgrade Opportunity Banner for Free Business */}
            {isEditing && !isUpgradeMode && !isAlreadyPremium && !isPendingUpgrade && (
              <div className="mb-8 rounded-3xl p-6 bg-gradient-to-r from-[#0c2b27] via-[#053733] to-[#021f1d] text-white border-2 border-amber-400/80 shadow-[0_12px_32px_rgba(0,117,112,0.25)] relative overflow-hidden flex flex-col sm:flex-row items-start sm:items-center justify-between gap-5 animate-fadeIn">
                <div className="relative z-10 space-y-1.5">
                  <div className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full text-[10.5px] font-bold uppercase tracking-wider bg-gradient-to-r from-amber-400 via-amber-300 to-amber-500 text-slate-950">
                    <Crown size={12} />
                    <span>UPGRADE KE PREMIUM</span>
                  </div>
                  <h3 className="text-lg sm:text-xl font-black text-white">Tingkatkan Visibilitas &amp; Fitur Usaha Ini</h3>
                  <p className="text-xs text-slate-300 max-w-xl leading-relaxed">
                    Buka integrasi peta Leaflet interaktif, galeri foto &amp; video tanpa batas, katalog produk luas, dan badge terverifikasi dengan upgrade ke paket Premium.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setIsUpgradeMode(true);
                    const premPlan = plans.find(p => !p.name?.toLowerCase().includes("free") && Number(p.price) > 0) || { id: 1, name: "Premium Business", price: 50000, duration_value: 1, duration_unit: "month", formatted_duration: "1 Bulan", isFree: false };
                    setSelectedPackage(premPlan);
                    window.scrollTo({ top: 0, behavior: "smooth" });
                  }}
                  className="relative z-10 px-5 py-3 rounded-2xl bg-gradient-to-r from-amber-400 via-amber-300 to-amber-500 text-slate-950 font-black text-xs sm:text-sm hover:scale-105 active:scale-95 transition-all shadow-lg shadow-amber-400/20 shrink-0 cursor-pointer border-0 flex items-center gap-2"
                >
                  <Sparkles size={16} />
                  <span>Upgrade ke Premium Sekarang</span>
                  <ChevronRight size={16} />
                </button>
              </div>
            )}

            {/* Rejection Alert Banner (If business was rejected by admin - Only in normal edit mode) */}
            {!isUpgradeMode && businessStatus === "rejected" && rejectionReason && (
              <div className="mb-8 p-4 sm:p-5 bg-rose-50 border-2 border-rose-200 rounded-2xl flex items-start gap-3.5 shadow-sm animate-fadeIn">
                <div className="w-10 h-10 rounded-xl bg-rose-100 text-rose-700 flex items-center justify-center shrink-0 mt-0.5">
                  <AlertCircle size={22} />
                </div>
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 rounded text-[10px] font-extrabold bg-rose-200 text-rose-800 uppercase tracking-wider">
                      Perlu Perbaikan
                    </span>
                    <h4 className="text-sm font-bold text-rose-900">
                      Profil Usaha Ini Sebelumnya Ditolak Oleh Admin
                    </h4>
                  </div>
                  <p className="text-xs text-rose-700 leading-relaxed">
                    <strong>Catatan Alasan Penolakan:</strong> {rejectionReason}
                  </p>
                  <p className="text-[11.5px] text-rose-600 font-medium">
                    Silakan periksa dan perbarui data bisnis Anda di bawah ini sesuai catatan admin, kemudian klik tombol <strong>"Simpan &amp; Ajukan Ulang Bisnis"</strong> untuk diverifikasi ulang oleh admin.
                  </p>
                </div>
              </div>
            )}

            <div className="flex flex-col gap-8">
              {/* ── SECTION 1: INFORMASI BISNIS ── */}
              <div className="bg-slate-50 border border-slate-200/90 rounded-2xl p-5 sm:p-6 space-y-5">
                <div className="flex items-center gap-2.5 pb-3 border-b border-slate-200/80">
                  <Store size={18} className="text-[#007570]" />
                  <h3 className="text-sm font-bold uppercase tracking-wider text-slate-800">1. Informasi Bisnis</h3>
                </div>

                <div className="space-y-4">
                  {/* Nama Usaha */}
                  <div className="flex flex-col gap-2">
                    <label className={labelCls}>Nama Usaha <span className="text-[#dc2626]">*</span></label>
                    <input name="name" type="text" placeholder="Contoh: Warung Makan Sederhana" value={form.name} onChange={handleFormChange} className={inputCls} />
                  </div>

                  {/* Deskripsi Usaha (TinyMCE WYSIWYG Editor Style) */}
                  <div className="flex flex-col gap-2">
                    <label className={labelCls}>Deskripsi Usaha <span className="text-[#dc2626]">*</span></label>
                    <RichTextEditor
                      value={form.description}
                      onChange={(val) => setForm((prev) => ({ ...prev, description: val }))}
                      placeholder="Ceritakan keunggulan, produk utama, dan informasi usaha kamu secara lengkap..."
                      minHeight="180px"
                      disabled={loading}
                    />
                  </div>

                  {/* Kategori & Sub Kategori */}
                  <div className="flex flex-col gap-2">
                    <CategorySelector
                      categories={categories}
                      selectedMainCategory={selectedMainCategory}
                      selectedSubCategory={selectedSubCategory}
                      onMainCategoryChange={setSelectedMainCategory}
                      onSubCategoryChange={setSelectedSubCategory}
                      disabled={loading}
                      loading={categoriesLoading}
                      error={categoryError}
                    />
                  </div>
                </div>
              </div>

              {/* ── SECTION 2: JAM OPERASIONAL ── */}
              <div className="bg-slate-50 border border-slate-200/90 rounded-2xl p-5 sm:p-6 space-y-5">
                <div className="flex items-center gap-2.5 pb-3 border-b border-slate-200/80">
                  <Clock size={18} className="text-[#007570]" />
                  <h3 className="text-sm font-bold uppercase tracking-wider text-slate-800">2. Jam Operasional</h3>
                </div>

                <div className="flex flex-col gap-2">
                  <label className={labelCls}>Pilih Hari &amp; Jam Buka Usaha</label>
                  <div className="flex flex-col gap-3 bg-white border-[1.5px] border-[#e2e8f0] rounded-xl p-4">
                    {openingDays.map((d, i) => (
                      <div key={d.day} className="flex items-center gap-3.5 py-2.5 border-b border-[#e5e7eb] w-full flex-nowrap min-h-[44px] last:border-b-0">
                        <label className="flex items-center gap-3 cursor-pointer min-w-[100px] shrink-0">
                          <input
                            type="checkbox"
                            checked={d.selected}
                            onChange={() => handleDayToggle(i)}
                            className="w-5 h-5 accent-[#007570] cursor-pointer shrink-0"
                          />
                          <span className="text-[0.92rem] font-semibold text-[#0f172a] select-none min-w-[70px]">{d.day}</span>
                        </label>
                        {d.selected ? (
                          <div className="flex items-center gap-2 flex-1 min-w-0">
                            <select
                              className="w-[120px] px-3 py-2 border-[1.5px] border-[#e2e8f0] rounded-lg text-sm text-[#0f172a] bg-[#fafafa] outline-none cursor-pointer"
                              value={d.open}
                              onChange={(e) => handleDayTimeChange(i, 'open', e.target.value)}
                            >
                              {TIME_OPTIONS.map((t) => (
                                <option key={t} value={t}>{t}</option>
                              ))}
                            </select>
                            <span className="text-xs text-slate-400 font-medium">s/d</span>
                            <select
                              className="w-[120px] px-3 py-2 border-[1.5px] border-[#e2e8f0] rounded-lg text-sm text-[#0f172a] bg-[#fafafa] outline-none cursor-pointer"
                              value={d.close}
                              onChange={(e) => handleDayTimeChange(i, 'close', e.target.value)}
                            >
                              {TIME_OPTIONS.map((t) => (
                                <option key={t} value={t}>{t}</option>
                              ))}
                            </select>
                          </div>
                        ) : (
                          <span className="text-xs text-slate-400 bg-slate-100 px-3 py-1 rounded-md">Tutup</span>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* ── SECTION 3: TAG & INFORMASI TAMBAHAN ── */}
              <div className="bg-slate-50 border border-slate-200/90 rounded-2xl p-5 sm:p-6 space-y-5">
                <div className="flex items-center gap-2.5 pb-3 border-b border-slate-200/80">
                  <Tag size={18} className="text-[#007570]" />
                  <h3 className="text-sm font-bold uppercase tracking-wider text-slate-800">3. Tag &amp; Informasi Tambahan</h3>
                </div>

                <div className="flex flex-col gap-2">
                  <label className={labelCls}>Tags / Kata Kunci Pencarian</label>
                  <div className="flex items-center gap-2.5 border-[1.5px] border-[#e2e8f0] rounded-xl px-3.5 py-2 bg-white">
                    <Tag size={16} className="text-[#94a3b8] shrink-0" />
                    <input
                      type="text"
                      placeholder="Ketik tag (contoh: kuliner, murah) lalu tekan Enter"
                      value={tagInput}
                      onChange={(e) => setTagInput(e.target.value)}
                      onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); addTag(); } }}
                      className="flex-1 border-0 bg-transparent outline-none text-[0.95rem] text-[#0f172a]"
                    />
                    <button type="button" onClick={addTag} className="w-7 h-7 bg-[#007570] text-white border-0 rounded-lg cursor-pointer flex items-center justify-center hover:bg-[#005a58] transition-colors">
                      <Plus size={16} />
                    </button>
                  </div>
                  <div className="flex flex-wrap gap-2 min-h-6 mt-1">
                    {tags.map((t) => (
                      <span key={t} className="inline-flex items-center gap-1.5 px-3 py-1 bg-[#e6fffc] border border-[#007570]/30 rounded-full text-xs font-semibold text-[#007570]">
                        {t}
                        <button type="button" onClick={() => removeTag(t)} className="bg-transparent border-0 cursor-pointer text-[#007570] p-0 hover:text-red-500">
                          <X size={12} />
                        </button>
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              {/* ── SECTION 4: ALAMAT & KONTAK ── */}
              <div className="bg-slate-50 border border-slate-200/90 rounded-2xl p-5 sm:p-6 space-y-5">
                <div className="flex items-center gap-2.5 pb-3 border-b border-slate-200/80">
                  <MapPin size={18} className="text-[#007570]" />
                  <h3 className="text-sm font-bold uppercase tracking-wider text-slate-800">4. Alamat &amp; Kontak</h3>
                </div>

                <div className="space-y-4">
                  {/* Lokasi Alamat & Map */}
                  <div className="flex flex-col gap-2">
                    <label className={labelCls}><MapPin size={16} /> Alamat Lengkap Usaha <span className="text-[#dc2626]">*</span></label>
                    <div className="flex gap-2.5">
                      <input
                        type="text"
                        placeholder="Jl. Contoh No. 123, Kelurahan, Kecamatan, Kota"
                        value={address}
                        onChange={(e) => setAddress(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === "Enter" && !isFreeSelection) {
                            e.preventDefault();
                            geocodeAddress();
                          }
                        }}
                        className={inputCls}
                      />
                      {!isFreeSelection && (
                        <button
                          type="button"
                          onClick={geocodeAddress}
                          disabled={geocoding}
                          className="px-5 bg-[#007570] text-white border-0 rounded-xl font-semibold cursor-pointer shrink-0 hover:bg-[#005a58] flex items-center gap-2 transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
                        >
                          {geocoding ? <Loader2 size={16} className={spinCls} /> : <Search size={16} />}
                          <span className="hidden sm:inline">Cari Peta</span>
                        </button>
                      )}
                    </div>
                    {!isFreeSelection && (
                      <p className="text-xs text-slate-500 flex items-center gap-1.5 mt-1.5">
                        <Search size={12} className="text-[#007570]" />
                        <span>
                          Tips: Ketik alamat lengkap (contoh: "Desa Surade, Sukabumi, Jawa Barat") lalu klik <strong>Cari Peta</strong> atau tekan <kbd className="px-1.5 py-0.5 bg-slate-100 border border-slate-300 rounded text-[10px] font-mono">Enter</kbd>
                        </span>
                      </p>
                    )}

                    {!isFreeSelection ? (
                      <div className="w-full max-w-full rounded-2xl overflow-hidden mt-3 border border-[#e2e8f0] relative isolate z-0 min-w-0">
                        <MapContainer
                          key={mapKey}
                          center={coords ? [coords.lat, coords.lng] : DEFAULT_CENTER}
                          zoom={coords ? 15 : 6}
                          style={{ height: "280px", width: "100%", minWidth: 0, position: "relative", zIndex: 0 }}
                          scrollWheelZoom
                        >
                          <MapResizeHandler />
                          <MapCenterHandler coords={coords} />
                          <TileLayer attribution="&copy; OpenStreetMap" url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                          <MapClickHandler onMapClick={(latlng) => setCoords({ lat: latlng.lat, lng: latlng.lng })} />
                          {coords && <Marker position={[coords.lat, coords.lng]} />}
                        </MapContainer>
                        <p className="text-xs text-slate-500 px-4 py-2.5 bg-white border-t border-slate-200 flex items-center gap-1.5">
                          <MapPin size={14} className="text-[#007570]" />
                          <span>Klik pada peta untuk menentukan posisi presisi lokasi usaha.</span>
                        </p>
                      </div>
                    ) : (
                      <p className="text-xs text-slate-500 mt-1 flex items-center gap-1.5">
                        <MapPin size={14} className="text-[#007570]" />
                        <span>Peta lokasi interaktif dan pin presisi Leaflet tersedia pada paket <strong>Premium</strong>.</span>
                      </p>
                    )}
                  </div>

                  {/* Desa & Provinsi */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="flex flex-col gap-2 relative desa-dropdown-container">
                      <label className={labelCls}>Desa <span className="text-[#dc2626]">*</span></label>
                      
                      {/* Custom Searchable Dropdown */}
                      <div className="relative">
                        <button
                          type="button"
                          onClick={() => setDesaDropdownOpen(!desaDropdownOpen)}
                          className={`${inputCls} flex items-center justify-between text-left ${!form.city ? 'text-gray-400' : ''}`}
                        >
                          <span>{form.city || "Lokasi Semua"}</span>
                          <ChevronRight 
                            size={18} 
                            className={`transition-transform duration-200 ${desaDropdownOpen ? 'rotate-90' : ''}`}
                          />
                        </button>
                        
                        {desaDropdownOpen && (
                          <div className="absolute z-50 w-full mt-2 bg-white border-2 border-[#007570] rounded-xl shadow-2xl max-h-[320px] overflow-hidden">
                            {/* Search Input */}
                            <div className="p-3 border-b border-slate-200 bg-slate-50">
                              <div className="relative">
                                <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                                <input
                                  type="text"
                                  placeholder="Cari desa..."
                                  value={desaSearch}
                                  onChange={(e) => setDesaSearch(e.target.value)}
                                  className="w-full pl-9 pr-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#007570]/20"
                                />
                              </div>
                            </div>
                            
                            {/* Options List */}
                            <div className="overflow-y-auto max-h-[240px]">
                              {/* Semua Option */}
                              <button
                                type="button"
                                onClick={() => {
                                  setForm(prev => ({ ...prev, city: "" }));
                                  setDesaDropdownOpen(false);
                                  setDesaSearch("");
                                }}
                                className={`w-full px-4 py-2.5 text-left text-sm hover:bg-[#007570]/5 transition-colors ${
                                  !form.city ? 'bg-[#007570]/10 font-semibold text-[#007570]' : 'text-slate-700'
                                }`}
                              >
                                <div className="font-medium">Semua</div>
                              </button>
                              
                              {/* Filtered Desa List */}
                              {DESA_LIST
                                .filter(desa => 
                                  desa.toLowerCase().includes(desaSearch.toLowerCase())
                                )
                                .map((desa) => (
                                  <button
                                    key={desa}
                                    type="button"
                                    onClick={() => {
                                      setForm(prev => ({ ...prev, city: desa }));
                                      setDesaDropdownOpen(false);
                                      setDesaSearch("");
                                    }}
                                    className={`w-full px-4 py-2.5 text-left text-sm hover:bg-[#007570]/5 transition-colors ${
                                      form.city === desa ? 'bg-[#007570]/10 font-semibold text-[#007570]' : 'text-slate-700'
                                    }`}
                                  >
                                    {desa}
                                  </button>
                                ))}
                              
                              {/* No Results */}
                              {DESA_LIST.filter(desa => 
                                desa.toLowerCase().includes(desaSearch.toLowerCase())
                              ).length === 0 && (
                                <div className="px-4 py-8 text-center text-sm text-slate-400">
                                  Tidak ada desa ditemukan
                                </div>
                              )}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="flex flex-col gap-2">
                      <label className={labelCls}>Provinsi <span className="text-[#dc2626]">*</span></label>
                      <input name="province" type="text" placeholder="Contoh: Jawa Barat" value={form.province} onChange={handleFormChange} className={inputCls} />
                    </div>
                  </div>

                  {/* Telepon & WhatsApp */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="flex flex-col gap-2">
                      <label className={labelCls}><Phone size={14} /> Nomor Telepon Utama <span className="text-[#dc2626]">*</span></label>
                      <input name="phone" type="tel" placeholder="+62 812 3456 7890" value={form.phone} onChange={handleFormChange} className={inputCls} />
                    </div>
                    <div className="flex flex-col gap-2">
                      <label className={labelCls}><Phone size={14} /> WhatsApp</label>
                      <input name="whatsapp" type="tel" placeholder="+62 812 3456 7890" value={form.whatsapp} onChange={handleFormChange} className={inputCls} />
                    </div>
                  </div>

                  {/* Email & Website */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="flex flex-col gap-2">
                      <label className={labelCls}><Mail size={14} /> Email Usaha</label>
                      <input name="email" type="email" placeholder="kontak@usaha.com" value={form.email} onChange={handleFormChange} className={inputCls} />
                    </div>
                    <div className="flex flex-col gap-2">
                      <label className={labelCls}><Globe size={14} /> Website Resmi</label>
                      <input name="website" type="url" placeholder="https://usaha.com" value={form.website} onChange={handleFormChange} className={inputCls} />
                    </div>
                  </div>

                  {/* Instagram & Facebook */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="flex flex-col gap-2">
                      <label className={labelCls}><Camera size={14} /> Instagram</label>
                      <input name="instagram" type="text" placeholder="@usahakamu" value={form.instagram} onChange={handleFormChange} className={inputCls} />
                    </div>
                    <div className="flex flex-col gap-2">
                      <label className={labelCls}><Camera size={14} /> Facebook</label>
                      <input name="facebook" type="text" placeholder="Halaman Facebook" value={form.facebook} onChange={handleFormChange} className={inputCls} />
                    </div>
                  </div>
                </div>
              </div>

              {/* ── SECTION 5: MEDIA BISNIS (ORDER: 1. LOGO, 2. BANNER, 3. GALLERY) ── */}
              <div className="bg-slate-50 border border-slate-200/90 rounded-2xl p-5 sm:p-6 space-y-6">
                <div className="flex items-center justify-between pb-3 border-b border-slate-200/80">
                  <div className="flex items-center gap-2.5">
                    <ImageIcon size={18} className="text-[#007570]" />
                    <h3 className="text-sm font-bold uppercase tracking-wider text-slate-800">5. Media Bisnis</h3>
                  </div>
                  <span className="text-xs font-semibold text-slate-500">Logo → Banner → Galeri</span>
                </div>

                <div className="space-y-6">
                  {/* 1. LOGO (Top Priority) */}
                  <div className="flex flex-col gap-3 bg-gradient-to-br from-purple-50 to-pink-50 p-5 rounded-xl border-2 border-purple-200 shadow-sm">
                    <label className="text-sm font-bold text-slate-800 flex items-center gap-2">
                      <Camera size={18} className="text-purple-600" /> 
                      1. Logo / Thumbnail Utama Usaha
                    </label>
                    <p className="text-xs text-purple-700 mb-1">
                      Gambar ini akan menjadi foto profil &amp; thumbnail utama di halaman pencarian.
                    </p>
                    {logoPreview ? (
                      <div className="relative max-w-[180px] rounded-xl overflow-hidden border-2 border-purple-400 shadow-md">
                        <img src={logoPreview} alt="Logo" className="w-full aspect-square object-cover" />
                        <button
                          type="button"
                          className="absolute top-2 right-2 flex items-center justify-center w-7 h-7 bg-red-600 text-white rounded-lg border-0 cursor-pointer shadow-md hover:bg-red-700 transition-colors"
                          onClick={removeLogo}
                          title="Hapus Logo"
                        >
                          <X size={14} />
                        </button>
                      </div>
                    ) : (
                      <div
                        className="border-2 border-dashed border-purple-300 rounded-xl p-8 text-center cursor-pointer bg-white hover:bg-purple-50 hover:border-purple-500 transition-colors max-w-[360px]"
                        onClick={() => logoInputRef.current?.click()}
                      >
                        <input ref={logoInputRef} type="file" accept="image/*" hidden onChange={handleLogoChange} />
                        <Camera size={32} className="mx-auto text-purple-600 mb-3" />
                        <span className="text-sm font-bold text-slate-700 block">Upload Logo Usaha</span>
                        <span className="text-xs text-slate-400 block mt-1">JPG, PNG (Maks 4MB)</span>
                      </div>
                    )}
                  </div>

                  {/* 2. BANNER (After Logo) */}
                  <div className="flex flex-col gap-3 bg-gradient-to-br from-blue-50 to-cyan-50 p-5 rounded-xl border-2 border-blue-200 shadow-sm">
                    <label className="text-sm font-bold text-slate-800 flex items-center gap-2">
                      <Upload size={18} className="text-blue-600" /> 
                      2. Banner / Foto Latar Header (Maks. 4 Foto)
                    </label>
                    <p className="text-xs text-blue-700 mb-1">
                      Banner akan ditampilkan sebagai latar belakang header halaman detail bisnis Anda.
                    </p>
                    <div
                      className={`border-2 border-dashed rounded-xl p-8 text-center transition-all bg-white
                        ${banners.length >= 4 
                          ? "border-slate-300 cursor-not-allowed opacity-60" 
                          : "border-blue-300 cursor-pointer hover:border-blue-500 hover:bg-blue-50"}`}
                      {...createDropHandler(handleBannerAdd)}
                      onClick={() => banners.length < 4 && bannerInputRef.current?.click()}
                    >
                      <input ref={bannerInputRef} type="file" accept="image/*" multiple hidden onChange={(e) => handleBannerAdd(e.target.files)} />
                      <Upload size={32} className="text-blue-600 mb-3 mx-auto" />
                      <p className="text-sm font-bold text-slate-700">
                        {banners.length >= 4 ? "Maksimum 4 foto banner telah tercapai" : "Klik atau drag & drop foto banner"}
                      </p>
                      <p className="text-xs text-slate-400 mt-1">{banners.length}/4 foto terunggah</p>
                    </div>
                    {banners.length > 0 && (
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-2">
                        {banners.map((b, i) => (
                          <div key={i} className="relative rounded-xl overflow-hidden aspect-video border border-slate-200 shadow-2xs">
                            <img src={b.preview} alt="" className="w-full h-full object-cover" />
                            <button
                              type="button"
                              onClick={() => removeBanner(i)}
                              className="absolute top-1.5 right-1.5 w-6 h-6 bg-red-600 text-white rounded-md flex items-center justify-center border-0 cursor-pointer shadow-md hover:bg-red-700 transition-colors"
                              title="Hapus Banner"
                            >
                              <X size={14} />
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* 3. GALERI USAHA */}
                  <div className="flex flex-col gap-4 bg-gradient-to-br from-emerald-50 to-teal-50 p-5 rounded-xl border-2 border-emerald-200 shadow-sm">
                    <div className="flex items-center justify-between pb-2 border-b border-emerald-200">
                      <div className="flex items-center gap-2">
                        <ImageIcon size={18} className="text-emerald-600" />
                        <label className="text-sm font-bold text-slate-800">
                          3. Galeri Usaha
                        </label>
                      </div>
                      <span className="text-xs font-semibold text-emerald-700 bg-emerald-100 px-3 py-1 rounded-full">
                        {photos.length}{isFreeSelection ? "/3" : ""} foto
                      </span>
                    </div>

                    <p className="text-xs text-emerald-700">
                      {isFreeSelection
                        ? "Tambahkan hingga maksimal 3 foto suasana toko atau produk unggulan (Paket Free)."
                        : "Tambahkan foto galeri foto tanpa batas untuk menarik lebih banyak pelanggan (Paket Premium)."}
                    </p>

                    {/* Upload Controls Row */}
                    <div className="w-full">
                      {/* Photo Upload Area */}
                      <div
                        className={`border-2 border-dashed rounded-xl p-8 text-center transition-all min-h-[120px] flex flex-col items-center justify-center ${
                          isFreeSelection && photos.length >= 3
                            ? "border-slate-300 bg-slate-50 opacity-60 cursor-not-allowed"
                            : "border-emerald-300 bg-white cursor-pointer hover:border-emerald-500 hover:bg-emerald-50"
                        }`}
                        {...createDropHandler(handlePhotoAdd)}
                        onClick={() => {
                          if (isFreeSelection && photos.length >= 3) return;
                          photoInputRef.current?.click();
                        }}
                      >
                        <input
                          ref={photoInputRef}
                          type="file"
                          accept="image/jpeg,image/png,image/webp,image/gif"
                          multiple
                          hidden
                          disabled={isFreeSelection && photos.length >= 3}
                          onChange={(e) => handlePhotoAdd(e.target.files)}
                        />
                        <div className="flex items-center gap-2 mb-2 text-emerald-600">
                          <ImageIcon size={32} />
                        </div>
                        <span className="text-sm font-bold text-slate-700 block">
                            {isFreeSelection && photos.length >= 3
                              ? "Batas 3 Foto Paket Free Tercapai"
                              : "Upload Foto Galeri Usaha"}
                          </span>
                        <span className="text-xs text-slate-400 mt-1">JPG, PNG, WEBP (Bisa pilih banyak)</span>
                      </div>
                    </div>

                    {/* UNIFIED MEDIA THUMBNAILS GRID (Photos + Video together!) */}
                    {(photos.length > 0 || video !== null) && (
                      <div className="pt-3 border-t border-emerald-200">
                        <span className="text-xs font-bold text-emerald-700 block mb-2">Media Galeri Usaha</span>
                        <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-2.5">
                          {/* Photo Thumbnails */}
                          {photos.map((p, i) => (
                            <div
                              key={`photo-${i}`}
                              className="relative rounded-xl overflow-hidden aspect-square border border-slate-200 bg-slate-100 shadow-2xs group"
                            >
                              <img src={p.preview} alt={`Foto ${i + 1}`} className="w-full h-full object-cover" />
                              <button
                                type="button"
                                onClick={() => removePhoto(i)}
                                className="absolute top-1.5 right-1.5 w-6 h-6 bg-red-600/90 text-white rounded-md flex items-center justify-center border-0 cursor-pointer shadow-xs hover:bg-red-700 transition-colors"
                                title="Hapus Foto"
                              >
                                <X size={12} />
                              </button>
                            </div>
                          ))}

                          {/* Video Thumbnail (Unified Square Grid Tile!) */}
                          {video && (
                            <div className="relative rounded-xl overflow-hidden aspect-square border-2 border-[#007570] bg-slate-950 shadow-2xs group flex items-center justify-center">
                              {video.type === "youtube" || video.embedUrl ? (
                                <iframe
                                  src={video.embedUrl || getYouTubeEmbedUrl(video.url)}
                                  title="Preview Video YouTube"
                                  className="w-full h-full border-0 pointer-events-none"
                                />
                              ) : (
                                <video
                                  src={video.preview || video.url}
                                  className="w-full h-full object-cover opacity-80"
                                  muted
                                  playsInline
                                />
                              )}

                              {/* Play badge overlay */}
                              <div className="absolute inset-0 bg-black/40 flex flex-col items-center justify-center pointer-events-none p-1 text-center">
                                <div className="w-8 h-8 rounded-full bg-[#007570] text-white flex items-center justify-center shadow-md mb-0.5">
                                  <Video size={14} className="ml-0.5" />
                                </div>
                                <span className="text-[0.62rem] font-bold text-white uppercase tracking-wider bg-black/60 px-1.5 py-0.5 rounded">
                                  {video.type === "youtube" ? "YouTube" : "Video"}
                                </span>
                              </div>

                              {/* Action Buttons (Replace & Remove) */}
                              <div className="absolute top-1.5 right-1.5 flex items-center gap-1 z-10">
                                <button
                                  type="button"
                                  onClick={handleReplaceVideo}
                                  className="w-6 h-6 bg-slate-800/90 text-white rounded-md flex items-center justify-center border-0 cursor-pointer shadow-xs hover:bg-[#007570] transition-colors"
                                  title="Ganti Video"
                                >
                                  <Upload size={11} />
                                </button>
                                <button
                                  type="button"
                                  onClick={handleRemoveVideo}
                                  className="w-6 h-6 bg-red-600/90 text-white rounded-md flex items-center justify-center border-0 cursor-pointer shadow-xs hover:bg-red-700 transition-colors"
                                  title="Hapus Video"
                                >
                                  <X size={12} />
                                </button>
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* ── SECTION 4 (EDIT / REVISI): BUKTI PEMBAYARAN HANYA JIKA DITOLAK SEBELUMNYA ── */}
                {isEditing && !isUpgradeMode && businessStatus === "rejected" && (
                  <div className="bg-slate-50 border border-slate-200/90 rounded-2xl p-5 sm:p-6 space-y-5">
                    <div className="flex items-center justify-between pb-3 border-b border-slate-200/80">
                      <div className="flex items-center gap-2.5">
                        <CreditCard size={18} className="text-[#007570]" />
                        <h3 className="text-base font-bold text-slate-800">
                          4. Bukti Pembayaran / Transfer (Revisi)
                        </h3>
                      </div>
                      <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-[#f0fdfa] text-[#007570] border border-[#ccfbf1]">
                        Gratis Revisi — Tanpa Biaya Tambahan
                      </span>
                    </div>

                    <p className="text-xs text-slate-600 leading-relaxed">
                      Jika penolakan sebelumnya terkait bukti pembayaran (buram / tidak terbaca), silakan unggah foto struk transfer yang baru dan jelas di bawah ini. Anda <strong>tidak perlu membayar ulang</strong>.
                    </p>

                    <input
                      type="file"
                      ref={proofInputRef}
                      onChange={handleProofChange}
                      accept="image/jpeg,image/png,image/jpg,image/webp"
                      className="hidden"
                    />

                    {proofPreview ? (
                      <div className="p-4 bg-white border-2 border-[#007570] rounded-2xl flex items-center justify-between gap-4">
                        <div className="flex items-center gap-3.5 overflow-hidden">
                          <img
                            src={proofPreview}
                            alt="Bukti Transfer"
                            className="w-16 h-16 rounded-xl object-cover border border-slate-300 shrink-0"
                          />
                          <div className="overflow-hidden">
                            <span className="text-xs font-bold text-slate-900 block truncate">
                              {proofFile ? proofFile.name : "Foto Bukti Transfer Terpasang"}
                            </span>
                            <span className="text-[11px] text-emerald-600 font-semibold flex items-center gap-1 mt-0.5">
                              <CheckCircle2 size={12} /> {proofFile ? `Siap diunggah (${(proofFile.size / 1024).toFixed(1)} KB)` : "Bukti transfer tersimpan"}
                            </span>
                          </div>
                        </div>

                        <div className="flex items-center gap-2 shrink-0">
                          <button
                            type="button"
                            onClick={() => proofInputRef.current?.click()}
                            className="px-3 py-1.5 bg-white border border-slate-300 text-slate-800 rounded-lg text-xs font-bold hover:bg-slate-50 cursor-pointer"
                          >
                            Ganti Foto
                          </button>
                          {proofFile && (
                            <button
                              type="button"
                              onClick={handleRemoveProof}
                              className="px-3 py-1.5 bg-rose-50 text-rose-600 rounded-lg text-xs font-bold hover:bg-rose-100 cursor-pointer border-0"
                            >
                              Batal
                            </button>
                          )}
                        </div>
                      </div>
                    ) : (
                      <div
                        onClick={() => proofInputRef.current?.click()}
                        className="border-2 border-dashed border-slate-300 hover:border-[#007570] bg-white hover:bg-teal-50/20 rounded-2xl p-6 text-center cursor-pointer transition-all flex flex-col items-center justify-center gap-2"
                      >
                        <div className="w-10 h-10 rounded-full bg-teal-50 text-[#007570] flex items-center justify-center">
                          <Upload size={20} />
                        </div>
                        <div>
                          <span className="text-xs font-bold text-slate-800">Klik untuk mengunggah foto struk bukti transfer baru</span>
                          <p className="text-[11px] text-slate-400 mt-0.5">Format: JPG, PNG, WEBP (Maksimal 10MB)</p>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* ── STEP 3 (FREE FLOW): REVIEW & DAFTARKAN ── */}
        {step === 3 && isFreeSelection && (
          <div className="bg-white rounded-[20px] shadow-[0_4px_24px_rgba(15,23,42,0.07)] p-6 sm:p-9 mb-6 border border-[#e2e8f0] animate-[fadeCard_0.25s_ease]">
            <div className="flex items-start gap-4 mb-8 pb-6 border-b border-[#f1f5f9]">
              <CheckCircle2 size={28} className="text-[#007570] shrink-0 mt-1" />
              <div>
                <h2 className="text-[1.35rem] font-bold text-[#0f172a] mb-1">Review Ringkasan Data Usaha</h2>
                <p className="text-[0.9rem] text-[#64748b]">Periksa kembali data usaha kamu sebelum mendaftarkan dengan Paket Free.</p>
              </div>
            </div>

            <div className="bg-slate-50 rounded-2xl p-6 border border-slate-200 space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <span className="text-xs font-bold uppercase text-slate-400 block mb-1">Paket Dipilih</span>
                  <span className="text-sm font-extrabold text-[#007570] bg-[#e6fffc] px-3 py-1 rounded-full border border-[#007570]/30 inline-block">
                    PAKET FREE (Rp0)
                  </span>
                </div>
                <div>
                  <span className="text-xs font-bold uppercase text-slate-400 block mb-1">Nama Usaha</span>
                  <span className="text-sm font-bold text-slate-800">{form.name || "-"}</span>
                </div>
                <div>
                  <span className="text-xs font-bold uppercase text-slate-400 block mb-1">Desa &amp; Provinsi</span>
                  <span className="text-sm font-medium text-slate-800">{form.city}, {form.province}</span>
                </div>
                <div>
                  <span className="text-xs font-bold uppercase text-slate-400 block mb-1">Nomor Telepon</span>
                  <span className="text-sm font-medium text-slate-800">{form.phone || "-"}</span>
                </div>
              </div>

              <div className="pt-4 border-t border-slate-200">
                <span className="text-xs font-bold uppercase text-slate-400 block mb-1">Alamat Lengkap</span>
                <span className="text-sm font-medium text-slate-800">{address || "-"}</span>
              </div>

              <div className="pt-4 border-t border-slate-200">
                <span className="text-xs font-bold uppercase text-slate-400 block mb-1">Deskripsi</span>
                <p className="text-sm text-slate-700 leading-relaxed whitespace-pre-line">{form.description}</p>
              </div>
            </div>
          </div>
        )}

        {/* ── STEP 3 (PREMIUM FLOW): RINGKASAN PESANAN & KUPON ── */}
        {step === 3 && !isFreeSelection && (
          <div className="bg-white rounded-[20px] shadow-[0_4px_24px_rgba(15,23,42,0.07)] p-6 sm:p-9 mb-6 border border-[#e2e8f0] animate-[fadeCard_0.25s_ease]">
            <div className="flex items-start gap-4 mb-8 pb-6 border-b border-[#f1f5f9]">
              <FileText size={28} className="text-[#007570] shrink-0 mt-1" />
              <div>
                <h2 className="text-[1.35rem] font-bold text-[#0f172a] mb-1">Ringkasan Pesanan</h2>
                <p className="text-[0.9rem] text-[#64748b]">Periksa detail pesanan paket Premium dan gunakan kode kupon jika ada.</p>
              </div>
            </div>

            {/* Quick Plan Selector if multiple plans exist */}
            {plans && plans.length > 1 && (
              <div className="mb-6 p-4 bg-slate-50 border border-slate-200 rounded-2xl">
                <label className="text-xs font-bold uppercase tracking-wider text-slate-600 block mb-2.5">
                  Pilihan Durasi Paket:
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2.5">
                  {plans.map((p) => {
                    const isSel = selectedPackage?.id === p.id;
                    const durText = p.formatted_duration || `${p.duration_value || 1} ${p.duration_unit === 'year' || p.duration_unit === 'tahun' ? 'Tahun' : 'Bulan'}`;
                    return (
                      <div
                        key={p.id}
                        onClick={() => setSelectedPackage({ ...p, isFree: false })}
                        className={`p-3 rounded-xl border-2 cursor-pointer transition-all flex items-center justify-between ${
                          isSel
                            ? "bg-[#007570] text-white border-[#007570] shadow-sm"
                            : "bg-white text-slate-800 border-slate-200 hover:border-slate-300"
                        }`}
                      >
                        <div>
                          <span className={`text-xs font-bold block ${isSel ? "text-white" : "text-slate-900"}`}>{p.name}</span>
                          <span className={`text-[11px] ${isSel ? "text-teal-100" : "text-slate-500"}`}>{durText}</span>
                        </div>
                        <span className={`text-xs font-extrabold ${isSel ? "text-amber-300" : "text-[#007570]"}`}>
                          Rp {Number(p.price || 0).toLocaleString('id-ID')}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Order Detail Card */}
            <div className="bg-slate-50 border border-slate-200 rounded-2xl p-6 mb-6 space-y-3.5">
              <div className="flex justify-between items-center text-sm pb-3 border-b border-slate-200">
                <span className="text-slate-500 font-medium">Paket</span>
                <span className="font-bold text-[#0f172a]">{selectedPackage?.name}</span>
              </div>
              <div className="flex justify-between items-center text-sm pb-3 border-b border-slate-200">
                <span className="text-slate-500 font-medium">Bisnis</span>
                <span className="font-bold text-[#0f172a]">{form.name || "Usaha"}</span>
              </div>
              <div className="flex justify-between items-center text-sm pb-3 border-b border-slate-200">
                <span className="text-slate-500 font-medium">Masa Aktif</span>
                <span className="font-semibold text-slate-700">
                  {selectedPackage?.formatted_duration || `${selectedPackage?.duration_value || 1} Bulan`}
                </span>
              </div>
              <div className="flex justify-between items-center text-sm">
                <span className="text-slate-500 font-medium">Harga Normal</span>
                <span className="font-extrabold text-[#0f172a]">
                  Rp {Number(selectedPackage?.price || 0).toLocaleString('id-ID')}
                </span>
              </div>
            </div>

            {/* ── Kupon Tersedia — supaya user tahu kode apa yang bisa dipakai ── */}
            <div className="mb-4 p-4 rounded-2xl border border-emerald-200 bg-emerald-50/60">
              <p className="text-xs font-bold text-emerald-800 mb-2.5 flex items-center gap-1.5">
                <Sparkles size={14} />
                Kupon Tersedia — klik untuk pakai
              </p>

              {availableCouponsLoading ? (
                <div className="flex items-center gap-2 text-xs text-slate-500 py-1">
                  <Loader2 size={14} className="animate-spin" />
                  Memuat kupon aktif...
                </div>
              ) : availableCoupons.length > 0 ? (
                <div className="flex flex-wrap gap-2">
                  {availableCoupons.map((c) => (
                    <button
                      key={c.code}
                      type="button"
                      onClick={() => setCouponPrefill(c.code)}
                      className="group flex items-center gap-2 bg-white border border-emerald-300 hover:border-emerald-500 hover:bg-emerald-100 rounded-xl px-3 py-2 text-left transition-all cursor-pointer"
                      title={c.description || ""}
                    >
                      <span className="font-mono font-extrabold text-xs text-emerald-700 tracking-wide">
                        {c.code}
                      </span>
                      <span className="text-[11px] font-semibold text-slate-500">
                        {c.discount_type === "percentage"
                          ? `-${Number(c.discount_value)}%`
                          : `-Rp${Number(c.discount_value).toLocaleString('id-ID')}`}
                      </span>
                    </button>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-slate-500">
                  Belum ada kupon promo aktif saat ini. Kalau kamu punya kode kupon, masukkan langsung di kotak di bawah.
                </p>
              )}
            </div>

            {/* ── Kode Kupon / Diskon (Opsional) ── */}
            <DiscountCodeInput
              type="coupon"
              amount={selectedPackage?.price || 0}
              appliedCode={appliedCoupon}
              prefillCode={couponPrefill}
              onApplied={(data) => setAppliedCoupon(data)}
              onRemoved={() => setAppliedCoupon(null)}
              className="mb-4"
            />

            {/* ── Kode Referral (Opsional - Paket Premium) ── */}
            <DiscountCodeInput
              type="referral"
              amount={selectedPackage?.price || 0}
              appliedCode={appliedReferral}
              onApplied={(data) => setAppliedReferral(data)}
              onRemoved={() => setAppliedReferral(null)}
              disabled={isFreeSelection}
              className="mb-6"
            />

            {/* Total Pembayaran Calculation */}
            {(() => {
              const basePrice = Number(selectedPackage?.price || 0);
              const couponDiscount = appliedCoupon ? Number(appliedCoupon.discount_amount || 0) : 0;
              const refDiscount = appliedReferral ? Number(appliedReferral.discount_amount || 0) : 0;
              const totalDiscount = couponDiscount + refDiscount;
              const finalCalculatedPrice = Math.max(0, basePrice - totalDiscount);

              return (
                <div className="bg-[#f0fffe] border border-[#007570]/30 rounded-2xl p-5 flex items-center justify-between">
                  <div>
                    <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block">Total Pembayaran</span>
                    {totalDiscount > 0 && (
                      <span className="text-xs text-slate-400 line-through">
                        Rp {basePrice.toLocaleString('id-ID')}
                      </span>
                    )}
                  </div>
                  <div className="text-right">
                    <span className="text-2xl font-black text-[#007570]">
                      Rp {finalCalculatedPrice.toLocaleString('id-ID')}
                    </span>
                    {totalDiscount > 0 && (
                      <span className="text-[11px] font-bold text-emerald-600 block">
                        Hemat Rp {totalDiscount.toLocaleString('id-ID')}
                      </span>
                    )}
                  </div>
                </div>
              );
            })()}
          </div>
        )}

        {/* ── STEP 4 (PREMIUM FLOW): METODE PEMBAYARAN ── */}
        {step === 4 && !isFreeSelection && (
          <div className="bg-white rounded-[20px] shadow-[0_4px_24px_rgba(15,23,42,0.07)] p-6 sm:p-9 mb-6 border border-[#e2e8f0] animate-[fadeCard_0.25s_ease]">
            <div className="flex items-start gap-4 mb-8 pb-6 border-b border-[#f1f5f9]">
              <CreditCard size={28} className="text-[#007570] shrink-0 mt-1" />
              <div>
                <h2 className="text-[1.35rem] font-bold text-[#0f172a] mb-1">Pilihan Metode Pembayaran</h2>
                <p className="text-[0.9rem] text-[#64748b]">Pilih metode pembayaran yang kamu inginkan.</p>
              </div>
            </div>

            <div className="space-y-6">
              {PAYMENT_METHODS.map((group) => (
                <div key={group.category} className="space-y-3">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">{group.category}</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    {group.items.map((item) => {
                      const isSelected = selectedPaymentMethod === item.id;
                      return (
                        <div
                          key={item.id}
                          onClick={() => setSelectedPaymentMethod(item.id)}
                          className={`p-4 rounded-xl border-2 cursor-pointer transition-all flex items-center justify-between ${
                            isSelected
                              ? "bg-[#f0fffe] border-[#007570] shadow-sm"
                              : "bg-slate-50 border-slate-200 hover:border-slate-300"
                          }`}
                        >
                          <div className="flex items-center gap-3">
                            {/* Logo Images from local/CDN */}
                            <div className="w-14 h-14 rounded-lg flex items-center justify-center bg-white border border-slate-200 p-2 overflow-hidden">
                              <img 
                                src={`/logos/${item.id.toLowerCase()}.png`}
                                alt={item.name}
                                className="w-full h-full object-contain"
                                onError={(e) => {
                                  // Fallback to colored badge if image fails
                                  e.target.style.display = 'none';
                                  e.target.parentElement.innerHTML = `<div class="w-full h-full flex items-center justify-center ${item.badgeColor} rounded"><span class="text-white text-xs font-bold">${item.id}</span></div>`;
                                }}
                              />
                            </div>
                            <span className="text-sm font-bold text-slate-800">{item.name}</span>
                          </div>
                          <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${isSelected ? "border-[#007570] bg-[#007570]" : "border-slate-300"}`}>
                            {isSelected && <Check size={12} className="text-white" />}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>

            {/* Instruction Card */}
            <div className="mt-8 bg-slate-50 border border-slate-200 rounded-2xl p-5 space-y-3">
              <h4 className="text-sm font-bold text-slate-800 flex items-center gap-2">
                <ShieldCheck size={18} className="text-[#007570]" /> Instruksi Pembayaran {currentAccount.name}
              </h4>
              <p className="text-xs text-slate-600">
                {currentAccount.isQRIS 
                  ? "Scan QR Code di bawah menggunakan aplikasi e-wallet atau mobile banking kamu:"
                  : "Silakan lakukan transfer sebesar total tagihan ke rekening / Virtual Account berikut:"}
              </p>
              
              {currentAccount.isQRIS ? (
                /* QRIS QR Code Display */
                <div className="bg-white border-2 border-slate-200 rounded-xl p-6 flex flex-col items-center space-y-4">
                  <div className="w-64 h-64 bg-white border-4 border-[#007570] rounded-2xl p-4 flex items-center justify-center shadow-lg">
                    {/* QR Code SVG - Dummy/Placeholder */}
                    <svg viewBox="0 0 200 200" className="w-full h-full">
                      {/* QR Code Pattern - Simplified representation */}
                      <rect width="200" height="200" fill="white"/>
                      
                      {/* Top-left corner square */}
                      <rect x="10" y="10" width="60" height="60" fill="black"/>
                      <rect x="20" y="20" width="40" height="40" fill="white"/>
                      <rect x="30" y="30" width="20" height="20" fill="black"/>
                      
                      {/* Top-right corner square */}
                      <rect x="130" y="10" width="60" height="60" fill="black"/>
                      <rect x="140" y="20" width="40" height="40" fill="white"/>
                      <rect x="150" y="30" width="20" height="20" fill="black"/>
                      
                      {/* Bottom-left corner square */}
                      <rect x="10" y="130" width="60" height="60" fill="black"/>
                      <rect x="20" y="140" width="40" height="40" fill="white"/>
                      <rect x="30" y="150" width="20" height="20" fill="black"/>
                      
                      {/* QR Code data pattern (simplified) */}
                      <rect x="80" y="20" width="10" height="10" fill="black"/>
                      <rect x="95" y="20" width="10" height="10" fill="black"/>
                      <rect x="110" y="20" width="10" height="10" fill="black"/>
                      
                      <rect x="20" y="80" width="10" height="10" fill="black"/>
                      <rect x="35" y="80" width="10" height="10" fill="black"/>
                      <rect x="50" y="80" width="10" height="10" fill="black"/>
                      <rect x="80" y="80" width="10" height="10" fill="black"/>
                      <rect x="95" y="80" width="10" height="10" fill="black"/>
                      <rect x="110" y="80" width="10" height="10" fill="black"/>
                      <rect x="140" y="80" width="10" height="10" fill="black"/>
                      <rect x="155" y="80" width="10" height="10" fill="black"/>
                      <rect x="170" y="80" width="10" height="10" fill="black"/>
                      
                      <rect x="80" y="95" width="10" height="10" fill="black"/>
                      <rect x="110" y="95" width="10" height="10" fill="black"/>
                      <rect x="140" y="95" width="10" height="10" fill="black"/>
                      <rect x="170" y="95" width="10" height="10" fill="black"/>
                      
                      <rect x="20" y="110" width="10" height="10" fill="black"/>
                      <rect x="50" y="110" width="10" height="10" fill="black"/>
                      <rect x="80" y="110" width="10" height="10" fill="black"/>
                      <rect x="110" y="110" width="10" height="10" fill="black"/>
                      <rect x="140" y="110" width="10" height="10" fill="black"/>
                      <rect x="170" y="110" width="10" height="10" fill="black"/>
                      
                      <rect x="80" y="140" width="10" height="10" fill="black"/>
                      <rect x="95" y="140" width="10" height="10" fill="black"/>
                      <rect x="110" y="140" width="10" height="10" fill="black"/>
                      <rect x="140" y="140" width="10" height="10" fill="black"/>
                      <rect x="155" y="140" width="10" height="10" fill="black"/>
                      <rect x="170" y="140" width="10" height="10" fill="black"/>
                      
                      <rect x="80" y="155" width="10" height="10" fill="black"/>
                      <rect x="110" y="155" width="10" height="10" fill="black"/>
                      <rect x="140" y="155" width="10" height="10" fill="black"/>
                      <rect x="170" y="155" width="10" height="10" fill="black"/>
                      
                      <rect x="80" y="170" width="10" height="10" fill="black"/>
                      <rect x="95" y="170" width="10" height="10" fill="black"/>
                      <rect x="110" y="170" width="10" height="10" fill="black"/>
                      <rect x="140" y="170" width="10" height="10" fill="black"/>
                      <rect x="155" y="170" width="10" height="10" fill="black"/>
                      <rect x="170" y="170" width="10" height="10" fill="black"/>
                      
                      <rect x="35" y="95" width="10" height="10" fill="black"/>
                      <rect x="50" y="95" width="10" height="10" fill="black"/>
                      <rect x="35" y="110" width="10" height="10" fill="black"/>
                    </svg>
                  </div>
                  <div className="text-center space-y-2">
                    <p className="text-sm font-bold text-slate-800">Scan QRIS untuk Pembayaran</p>
                    <p className="text-xs text-slate-500">Kompatibel dengan semua e-wallet & mobile banking</p>
                    <div className="flex items-center justify-center gap-2 pt-2">
                      <span className="px-2 py-1 bg-[#4c2a86] text-white text-[10px] font-bold rounded">OVO</span>
                      <span className="px-2 py-1 bg-[#008cff] text-white text-[10px] font-bold rounded">DANA</span>
                      <span className="px-2 py-1 bg-[#00a5cf] text-white text-[10px] font-bold rounded">GoPay</span>
                      <span className="px-2 py-1 bg-[#003d79] text-white text-[10px] font-bold rounded">BCA</span>
                      <span className="px-2 py-1 bg-[#f15a24] text-white text-[10px] font-bold rounded">BNI</span>
                    </div>
                  </div>
                </div>
              ) : (
                /* Bank Transfer / E-Wallet Account Number Display */
                <div className="bg-white border border-slate-200 rounded-xl p-4 flex items-center justify-between">
                  <div>
                    <span className="text-xs text-slate-400 font-medium block">Nomor Rekening / Virtual Account</span>
                    <span className="text-lg font-black text-[#0f172a]">{currentAccount.accountNumber}</span>
                    <span className="text-xs text-slate-500 block mt-0.5">a.n {currentAccount.accountName}</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      navigator.clipboard.writeText(currentAccount.accountNumber.replace(/-/g, ''));
                      setCopiedAccount(true);
                      setTimeout(() => setCopiedAccount(false), 2500);
                    }}
                    className="px-3.5 py-2 bg-slate-100 border border-slate-200 rounded-lg text-xs font-bold text-slate-700 hover:bg-slate-200 cursor-pointer flex items-center gap-1.5"
                  >
                    {copiedAccount ? <Check size={14} className="text-emerald-600" /> : <Copy size={14} />}
                    <span>{copiedAccount ? "Tersalin!" : "Salin No"}</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        )}

        {/* ── STEP 5 (PREMIUM FLOW): UPLOAD BUKTI PEMBAYARAN ── */}
        {step === 5 && !isFreeSelection && (
          <div className="bg-white rounded-[20px] shadow-[0_4px_24px_rgba(15,23,42,0.07)] p-6 sm:p-9 mb-6 border border-[#e2e8f0] animate-[fadeCard_0.25s_ease]">
            <div className="flex items-start gap-4 mb-8 pb-6 border-b border-[#f1f5f9]">
              <Upload size={28} className="text-[#007570] shrink-0 mt-1" />
              <div>
                <h2 className="text-[1.35rem] font-bold text-[#0f172a] mb-1">Upload Bukti Pembayaran</h2>
                <p className="text-[0.9rem] text-[#64748b]">Unggah foto atau tangkapan layar bukti transfer kamu.</p>
              </div>
            </div>

            {/* Summary Badge */}
            {(() => {
              const basePrice = Number(selectedPackage?.price || 0);
              const couponDiscount = appliedCoupon ? Number(appliedCoupon.discount_amount || 0) : 0;
              const refDiscount = appliedReferral ? Number(appliedReferral.discount_amount || 0) : 0;
              const finalPaymentTotal = Math.max(0, basePrice - couponDiscount - refDiscount);

              return (
                <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 mb-6 flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <span className="text-xs text-slate-400 font-bold uppercase block">Total Harus Dibayar</span>
                    <span className="text-xl font-black text-[#007570]">
                      Rp {finalPaymentTotal.toLocaleString('id-ID')}
                    </span>
                  </div>
                  <div className="text-right">
                    <span className="text-xs text-slate-400 font-bold uppercase block">Metode Pembayaran</span>
                    <span className="text-sm font-bold text-slate-800">{currentAccount.name}</span>
                  </div>
                </div>
              );
            })()}

            {/* Hidden input for file picking - always rendered so ref works */}
            <input ref={proofInputRef} type="file" accept="image/*" hidden onChange={handleProofChange} />

            {/* Upload Area */}
            {proofPreview ? (
              <div className="relative max-w-[320px] mx-auto rounded-2xl overflow-hidden border-2 border-slate-200 shadow-md">
                <img src={proofPreview} alt="Bukti Pembayaran" className="w-full h-auto max-h-[300px] object-contain bg-slate-900" />
                <div className="p-3 bg-white flex justify-between items-center border-t border-slate-200">
                  <span className="text-xs font-semibold text-slate-700 truncate max-w-[180px]">{proofFile?.name || "Bukti Transfer"}</span>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => proofInputRef.current?.click()}
                      className="px-2.5 py-1 text-xs font-bold text-[#007570] bg-[#e6fffc] rounded-md border-0 cursor-pointer"
                    >
                      Ganti
                    </button>
                    <button
                      type="button"
                      onClick={removeProof}
                      className="px-2.5 py-1 text-xs font-bold text-red-600 bg-red-50 rounded-md border-0 cursor-pointer"
                    >
                      Hapus
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              <div
                className="border-2 border-dashed border-slate-300 rounded-2xl p-10 text-center cursor-pointer bg-slate-50 hover:bg-[#f0fffe] hover:border-[#007570] transition-colors"
                onClick={() => proofInputRef.current?.click()}
              >
                <Upload size={40} className="mx-auto text-slate-400 mb-3" />
                <p className="text-base font-semibold text-slate-800 mb-1">Klik atau drag &amp; drop bukti transfer</p>
                <p className="text-xs text-slate-400">Format JPG, PNG, WEBP max 10MB</p>
              </div>
            )}
          </div>
        )}

        {/* ── NAVIGATION BUTTONS ── */}
        <div className="flex items-center gap-3 mt-8">
          {isEditing ? (
            isUpgradeMode ? (
              <>
                {step === 2 ? (
                  <button
                    type="button"
                    onClick={() => navigate("/admin-user")}
                    className="inline-flex items-center gap-2 px-7 py-3.5 rounded-[14px] text-[0.95rem] font-semibold cursor-pointer border-[1.5px] border-[#e2e8f0] bg-white text-[#374151] transition-all duration-[0.25s] hover:bg-[#f8fafc] hover:border-[#94a3b8]"
                  >
                    <ChevronLeft size={18} /> Kembali ke Dashboard
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={prevStep}
                    className="inline-flex items-center gap-2 px-7 py-3.5 rounded-[14px] text-[0.95rem] font-semibold cursor-pointer border-[1.5px] border-[#e2e8f0] bg-white text-[#374151] transition-all duration-[0.25s] hover:bg-[#f8fafc] hover:border-[#94a3b8]"
                  >
                    <ChevronLeft size={18} /> Kembali
                  </button>
                )}

                <div style={{ flex: 1 }} />

                {step < 5 ? (
                  <button
                    type="button"
                    onClick={nextStep}
                    className="inline-flex items-center gap-2 px-7 py-3.5 rounded-[14px] text-[0.95rem] font-semibold cursor-pointer border-0 transition-all duration-[0.25s] bg-gradient-to-br from-[#007570] to-[#009990] text-white shadow-[0_4px_16px_rgba(0,117,112,0.3)] hover:-translate-y-0.5 hover:shadow-[0_8px_24px_rgba(0,117,112,0.4)]"
                  >
                    {step === 2 ? "Lanjut ke Pembayaran" : step === 3 ? "Lanjut ke Metode Bayar" : "Lanjut Upload Bukti"} <ChevronRight size={18} />
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={handlePremiumSubmit}
                    disabled={loading || !proofFile}
                    className="inline-flex items-center gap-2 px-7 py-3.5 rounded-[14px] text-[0.95rem] font-semibold cursor-pointer border-0 transition-all duration-[0.25s] bg-gradient-to-br from-[#16a34a] to-[#22c55e] text-white shadow-[0_4px_16px_rgba(22,163,74,0.3)] enabled:hover:-translate-y-0.5 enabled:hover:shadow-[0_8px_24px_rgba(22,163,74,0.4)] disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {loading ? <><Loader2 size={18} className={spinCls} /> Mengirim Bukti...</> : <><Check size={18} /> Kirim Pembayaran &amp; Selesaikan Upgrade</>}
                  </button>
                )}
              </>
            ) : (
              <>
                <button
                  type="button"
                  onClick={() => navigate("/admin-user")}
                  className="inline-flex items-center gap-2 px-7 py-3.5 rounded-[14px] text-[0.95rem] font-semibold cursor-pointer border-[1.5px] border-[#e2e8f0] bg-white text-[#374151] transition-all duration-[0.25s] hover:bg-[#f8fafc] hover:border-[#94a3b8]"
                >
                  <ChevronLeft size={18} /> Kembali ke Dashboard
                </button>

                <div style={{ flex: 1 }} />

                <button
                  type="button"
                  onClick={handleDelete}
                  disabled={deleting}
                  className="inline-flex items-center gap-2 px-7 py-3.5 rounded-[14px] text-[0.95rem] font-semibold cursor-pointer border-[1.5px] transition-all duration-[0.25s] bg-[#fef2f2] text-[#dc2626] border-[#fecaca] hover:bg-[#fee2e2] disabled:opacity-70 disabled:cursor-not-allowed"
                >
                  {deleting ? <><Loader2 size={18} className={spinCls} /> Menghapus...</> : <><Trash2 size={18} /> Hapus Usaha</>}
                </button>

                <button
                  type="button"
                  onClick={handleSaveEdit}
                  disabled={loading}
                  className="inline-flex items-center gap-2 px-7 py-3.5 rounded-[14px] text-[0.95rem] font-semibold cursor-pointer border-0 transition-all duration-[0.25s] bg-gradient-to-br from-[#007570] to-[#009990] text-white shadow-[0_4px_16px_rgba(0,117,112,0.3)] enabled:hover:-translate-y-0.5 enabled:hover:shadow-[0_8px_24px_rgba(0,117,112,0.4)] disabled:opacity-70 disabled:cursor-not-allowed"
                >
                  {loading ? <><Loader2 size={18} className={spinCls} /> Menyimpan...</> : <><Check size={18} /> {businessStatus === "rejected" ? "Simpan & Ajukan Ulang Bisnis" : "Simpan Perubahan"}</>}
                </button>
              </>
            )
          ) : (
            <>
              {step > 1 && (
                <button
                  type="button"
                  onClick={prevStep}
                  className="inline-flex items-center gap-2 px-7 py-3.5 rounded-[14px] text-[0.95rem] font-semibold cursor-pointer border-[1.5px] border-[#e2e8f0] bg-white text-[#374151] transition-all duration-[0.25s] hover:bg-[#f8fafc] hover:border-[#94a3b8]"
                >
                  <ChevronLeft size={18} /> Kembali
                </button>
              )}

              <div style={{ flex: 1 }} />

              {/* Dynamic Next / Submit Button */}
              {isFreeSelection ? (
                step < 3 ? (
                  <button
                    type="button"
                    onClick={nextStep}
                    className="inline-flex items-center gap-2 px-7 py-3.5 rounded-[14px] text-[0.95rem] font-semibold cursor-pointer border-0 transition-all duration-[0.25s] bg-gradient-to-br from-[#007570] to-[#009990] text-white shadow-[0_4px_16px_rgba(0,117,112,0.3)] hover:-translate-y-0.5 hover:shadow-[0_8px_24px_rgba(0,117,112,0.4)]"
                  >
                    Selanjutnya <ChevronRight size={18} />
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={handleFreeSubmit}
                    disabled={loading}
                    className="inline-flex items-center gap-2 px-7 py-3.5 rounded-[14px] text-[0.95rem] font-semibold cursor-pointer border-0 transition-all duration-[0.25s] bg-gradient-to-br from-[#16a34a] to-[#22c55e] text-white shadow-[0_4px_16px_rgba(22,163,74,0.3)] enabled:hover:-translate-y-0.5 enabled:hover:shadow-[0_8px_24px_rgba(22,163,74,0.4)] disabled:opacity-70 disabled:cursor-not-allowed"
                  >
                    {loading ? <><Loader2 size={18} className={spinCls} /> Mendaftarkan...</> : <><Check size={18} /> Daftarkan Usaha (Free)</>}
                  </button>
                )
              ) : (
                step < 5 ? (
                  <button
                    type="button"
                    onClick={nextStep}
                    className="inline-flex items-center gap-2 px-7 py-3.5 rounded-[14px] text-[0.95rem] font-semibold cursor-pointer border-0 transition-all duration-[0.25s] bg-gradient-to-br from-[#007570] to-[#009990] text-white shadow-[0_4px_16px_rgba(0,117,112,0.3)] hover:-translate-y-0.5 hover:shadow-[0_8px_24px_rgba(0,117,112,0.4)]"
                  >
                    {step === 3 ? "Lanjut ke Pembayaran" : step === 4 ? "Lanjut Upload Bukti" : "Selanjutnya"} <ChevronRight size={18} />
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={handlePremiumSubmit}
                    disabled={loading || !proofFile}
                    className="inline-flex items-center gap-2 px-7 py-3.5 rounded-[14px] text-[0.95rem] font-semibold cursor-pointer border-0 transition-all duration-[0.25s] bg-gradient-to-br from-[#16a34a] to-[#22c55e] text-white shadow-[0_4px_16px_rgba(22,163,74,0.3)] enabled:hover:-translate-y-0.5 enabled:hover:shadow-[0_8px_24px_rgba(22,163,74,0.4)] disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {loading ? <><Loader2 size={18} className={spinCls} /> Mengirim Bukti...</> : <><Check size={18} /> Kirim Bukti Pembayaran</>}
                  </button>
                )
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}