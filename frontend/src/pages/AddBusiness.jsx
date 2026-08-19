import { useState, useEffect, useRef } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import Navbar from "../components/Navbar";
import SubCategorySelector from "../components/SubCategorySelector";
import api from "../services/api";
import { getStorageUrl } from "../utils/constants";
import {
  Store, MapPin, ImageIcon, Video, Tag, Phone, Mail,
  Globe, Camera, ChevronRight, ChevronLeft,
  X, Plus, Upload, Check, AlertCircle, Loader2, Search, Trash2,
  Crown, CreditCard, FileText, Sparkles, Copy, CheckCircle2, ShieldCheck, Clock
} from "lucide-react";
import { MapContainer, TileLayer, Marker, useMapEvents, useMap } from "react-leaflet";

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

const DAYS = ["Senin", "Selasa", "Rabu", "Kamis", "Jumat", "Sabtu", "Minggu"];

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
    category: "E-Wallet",
    items: [
      { id: "DANA", name: "DANA", accountName: "Info.co.id", accountNumber: "0812-3456-7890", badgeColor: "bg-[#008cff] text-white" },
      { id: "GoPay", name: "GoPay", accountName: "Info.co.id", accountNumber: "0812-3456-7890", badgeColor: "bg-[#00a5cf] text-white" },
      { id: "OVO", name: "OVO", accountName: "Info.co.id", accountNumber: "0812-3456-7890", badgeColor: "bg-[#4c2a86] text-white" },
    ]
  },
  {
    category: "Virtual Account / Transfer Bank",
    items: [
      { id: "BCA VA", name: "BCA Virtual Account", accountName: "PT Info Media", accountNumber: "8830-1234-5678", badgeColor: "bg-[#00529c] text-white" },
      { id: "Mandiri VA", name: "Mandiri Virtual Account", accountName: "PT Info Media", accountNumber: "137-00-1234-5678", badgeColor: "bg-[#003d79] text-white" },
      { id: "BRI VA", name: "BRI Virtual Account", accountName: "PT Info Media", accountNumber: "0341-01-000123-56-7", badgeColor: "bg-[#00529c] text-white" },
    ]
  }
];

export default function AddBusiness() {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEditing = !!id;

  const [step, setStep] = useState(isEditing ? 2 : 1);
  const [categories, setCategories] = useState([]);
  const [plans, setPlans] = useState([]);
  const [plansLoading, setPlansLoading] = useState(false);
  const [loading, setLoading] = useState(false);
  const [categoriesLoading, setCategoriesLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [createdId, setCreatedId] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const [isPendingVerification, setIsPendingVerification] = useState(false);

  // ── Package Selection State ──
  const [selectedPackage, setSelectedPackage] = useState(null); // null, or { isFree: true, id: 'free', ... } or plan object

  // ── Coupon State (Optional) ──
  const [couponInput, setCouponInput] = useState("");
  const [couponLoading, setCouponLoading] = useState(false);
  const [couponError, setCouponError] = useState("");
  const [couponSuccessMsg, setCouponSuccessMsg] = useState("");
  const [appliedCoupon, setAppliedCoupon] = useState(null);

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

  // Fetch Categories
  useEffect(() => {
    setCategoriesLoading(true);
    fetch(`${import.meta.env.VITE_API_URL}/categories`)
      .then((r) => r.json())
      .then((d) => { if (Array.isArray(d)) setCategories(d); })
      .catch(console.error)
      .finally(() => setCategoriesLoading(false));
  }, []);

  // Fetch Premium Plans dynamically from API
  useEffect(() => {
    setPlansLoading(true);
    fetch(`${import.meta.env.VITE_API_URL}/plans`)
      .then((r) => r.json())
      .then((d) => {
        const list = Array.isArray(d) ? d : (d?.data || []);
        setPlans(list);
      })
      .catch(console.error)
      .finally(() => setPlansLoading(false));
  }, []);

  // Update form.category_id when subcategory changes
  useEffect(() => {
    if (selectedSubCategory) {
      setForm((prev) => ({ ...prev, category_id: selectedSubCategory.id }));
    } else {
      setForm((prev) => ({ ...prev, category_id: "" }));
    }
  }, [selectedSubCategory]);

  // Load existing business data when editing
  useEffect(() => {
    if (isEditing && id) {
      setLoading(true);
      api.get(`/businesses/${id}`)
        .then((res) => {
          const data = res.data?.data;
          if (data) {
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

            // Load existing media items
            if (data.media && Array.isArray(data.media)) {
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
              setPhotos(existingPhotos);

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
            }

            if (data.logo) {
              setLogoPreview(getStorageUrl(data.logo));
            }

            // Set default package if editing
            if (data.is_premium) {
              setSelectedPackage({ id: 1, name: "Premium", price: 50000, isFree: false });
            } else {
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
  }, [isEditing, id, categories]);

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
      setError("");
    }
  };

  const removeProof = () => {
    setProofFile(null);
    if (proofPreview) URL.revokeObjectURL(proofPreview);
    setProofPreview(null);
  };

  const geocodeAddress = async () => {
    const query = address.trim();
    if (!query) return;
    setGeocoding(true);
    try {
      const res = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&limit=1`,
        { headers: { "Accept-Language": "id" } }
      );
      const data = await res.json();
      if (data?.[0]) {
        setCoords({ lat: parseFloat(data[0].lat), lng: parseFloat(data[0].lon) });
        setMapKey((k) => k + 1);
      } else {
        setError("Alamat tidak ditemukan.");
        setTimeout(() => setError(""), 4000);
      }
    } catch {
      setError("Gagal geocode.");
      setTimeout(() => setError(""), 4000);
    } finally {
      setGeocoding(false);
    }
  };

  // Photo Gallery Handlers
  const handlePhotoAdd = (files) => {
    if (!files || files.length === 0) return;
    const arr = Array.from(files).filter((f) => f.type.startsWith("image/"));
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
        setReferralSuccessMsg(res.data.message || "Kode referral valid! Diskon 5% berhasil diterapkan.");
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

  // Dynamic Step Indicator configuration based on Free vs Premium
  const isFreeSelection = selectedPackage?.isFree;
  
  const currentSteps = isEditing
    ? [{ id: 2, label: "Edit Data Usaha", icon: <Store size={18} /> }]
    : (isFreeSelection
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
          ]);

  const validateCurrentStep = () => {
    if (step === 1) {
      if (!selectedPackage) return "Silakan pilih salah satu paket terlebih dahulu.";
    }
    if (step === 2) {
      if (!form.name.trim()) return "Nama usaha wajib diisi.";
      if (!selectedMainCategory) {
        setCategoryError("Pilih kategori utama.");
        return "Pilih kategori utama.";
      }
      if (!selectedSubCategory) {
        setCategoryError("Pilih sub kategori.");
        return "Pilih sub kategori.";
      }
      setCategoryError("");
      if (!form.city.trim()) return "Kota wajib diisi.";
      if (!form.province.trim()) return "Provinsi wajib diisi.";
      if (!form.description.trim()) return "Deskripsi wajib diisi.";
      if (!form.phone.trim()) return "Nomor telepon wajib diisi.";
      if (!address.trim()) return "Alamat wajib diisi.";
    }
    if (step === 5 && !isFreeSelection) {
      if (!proofFile) return "Wajib mengunggah bukti pembayaran sebelum mengirim.";
    }
    return null;
  };

  const nextStep = () => {
    const err = validateCurrentStep();
    if (err) {
      setError(err);
      setTimeout(() => setError(""), 3500);
      return;
    }
    setError("");
    const maxSteps = isFreeSelection ? 3 : 5;
    setStep((s) => Math.min(s + 1, maxSteps));
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const prevStep = () => {
    setError("");
    setStep((s) => Math.max(s - 1, 1));
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // Submit Free Business
  const handleFreeSubmit = async () => {
    setLoading(true);
    setError("");
    try {
      const selectedDays = openingDays
        .filter((d) => d.selected)
        .map((d) => ({ day: d.day, open: d.open, close: d.close }));

      const payload = {
        ...form,
        address,
        tags,
        opening_days: selectedDays,
        latitude: coords?.lat ?? null,
        longitude: coords?.lng ?? null,
      };

      let bizId;
      if (isEditing) {
        await api.put(`/businesses/${id}`, payload);
        bizId = id;
      } else {
        const bizRes = await api.post("/businesses", payload);
        bizId = bizRes.data?.data?.id;
        if (!bizId) throw new Error("ID bisnis tidak ditemukan.");
      }

      if (logo) {
        const fd = new FormData();
        fd.append("logo", logo);
        await api.post(`/businesses/${bizId}/logo`, fd);
      }

      for (const banner of banners) {
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
    const err = validateCurrentStep();
    if (err) {
      setError(err);
      return;
    }

    setLoading(true);
    setError("");
    try {
      const selectedDays = openingDays
        .filter((d) => d.selected)
        .map((d) => ({ day: d.day, open: d.open, close: d.close }));

      const payload = {
        ...form,
        address,
        tags,
        opening_days: selectedDays,
        latitude: coords?.lat ?? null,
        longitude: coords?.lng ?? null,
      };

      let bizId;
      if (isEditing) {
        await api.put(`/businesses/${id}`, payload);
        bizId = id;
      } else {
        const bizRes = await api.post("/businesses", payload);
        bizId = bizRes.data?.data?.id;
        if (!bizId) throw new Error("ID bisnis tidak ditemukan.");
      }

      if (logo) {
        const fd = new FormData();
        fd.append("logo", logo);
        await api.post(`/businesses/${bizId}/logo`, fd);
      }

      for (const banner of banners) {
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
      const selectedDays = openingDays
        .filter((d) => d.selected)
        .map((d) => ({ day: d.day, open: d.open, close: d.close }));

      const payload = {
        ...form,
        address,
        tags,
        opening_days: selectedDays,
        latitude: coords?.lat ?? null,
        longitude: coords?.lng ?? null,
      };

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

      setCreatedId(bizId);
      setIsPendingVerification(false);
      setSuccess(true);
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
                Pendaftaran &amp; Pembayaran Berhasil Dikirim!
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
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* ── CARD FREE ── */}
                <div
                  onClick={() => setSelectedPackage({ id: 'free', name: 'Free', price: 0, isFree: true })}
                  className={`relative rounded-2xl p-6 border-2 transition-all duration-300 flex flex-col justify-between cursor-pointer ${
                    selectedPackage?.isFree
                      ? "bg-[#f0fffe] border-[#007570] shadow-[0_8px_24px_rgba(0,117,112,0.15)] -translate-y-1"
                      : "bg-white border-[#e2e8f0] hover:border-[#007570]/50 hover:shadow-md"
                  }`}
                >
                  {selectedPackage?.isFree && (
                    <div className="absolute top-4 right-4 bg-[#007570] text-white p-1 rounded-full">
                      <Check size={16} />
                    </div>
                  )}

                  <div>
                    <div className="inline-block px-3 py-1 bg-slate-100 text-slate-700 font-bold text-[0.75rem] rounded-full mb-3 uppercase tracking-wider">
                      GRATIS
                    </div>
                    <h3 className="text-xl font-extrabold text-[#0f172a] mb-1">FREE</h3>
                    <div className="flex items-baseline gap-1 my-3">
                      <span className="text-2xl font-black text-[#0f172a]">Rp0</span>
                    </div>
                    <p className="text-[0.88rem] text-[#64748b] mb-6 leading-relaxed">
                      Untuk memulai dan mengenalkan usaha kamu.
                    </p>

                    <div className="space-y-2.5 pt-4 border-t border-slate-100 text-[0.88rem]">
                      <div className="flex items-center gap-2.5 text-slate-700 font-medium">
                        <Check size={16} className="text-emerald-600 shrink-0" />
                        <span>Profil usaha</span>
                      </div>
                      <div className="flex items-center gap-2.5 text-slate-700 font-medium">
                        <Check size={16} className="text-emerald-600 shrink-0" />
                        <span>Informasi dasar usaha</span>
                      </div>
                      <div className="flex items-center gap-2.5 text-slate-700 font-medium">
                        <Check size={16} className="text-emerald-600 shrink-0" />
                        <span>Alamat manual</span>
                      </div>
                      <div className="flex items-center gap-2.5 text-slate-700 font-medium">
                        <Check size={16} className="text-emerald-600 shrink-0" />
                        <span>Fitur dasar</span>
                      </div>
                      <div className="flex items-center gap-2.5 text-slate-400 line-through">
                        <X size={16} className="text-slate-300 shrink-0" />
                        <span>Video profil</span>
                      </div>
                      <div className="flex items-center gap-2.5 text-slate-400 line-through">
                        <X size={16} className="text-slate-300 shrink-0" />
                        <span>Map / lokasi interaktif</span>
                      </div>
                      <div className="flex items-center gap-2.5 text-slate-400 line-through">
                        <X size={16} className="text-slate-300 shrink-0" />
                        <span>Produk katalog</span>
                      </div>
                      <div className="flex items-center gap-2.5 text-slate-400 line-through">
                        <X size={16} className="text-slate-300 shrink-0" />
                        <span>Fitur Chat</span>
                      </div>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedPackage({ id: 'free', name: 'Free', price: 0, isFree: true });
                      setStep(2);
                    }}
                    className={`mt-8 w-full py-3.5 px-4 rounded-xl text-[0.92rem] font-bold transition-all duration-200 border-0 cursor-pointer ${
                      selectedPackage?.isFree
                        ? "bg-[#007570] text-white shadow-lg shadow-[#007570]/30"
                        : "bg-slate-100 text-slate-700 hover:bg-slate-200"
                    }`}
                  >
                    Gunakan Paket Free
                  </button>
                </div>

                {/* ── CARD PREMIUM (Dinamis dari API) ── */}
                {plans.length === 0 ? (
                  <div
                    onClick={() => setSelectedPackage({ id: 1, name: "Premium Business", price: 50000, duration_value: 1, duration_unit: "month", formatted_duration: "1 Bulan", isFree: false })}
                    className={`relative rounded-2xl p-6 border-2 transition-all duration-300 flex flex-col justify-between cursor-pointer ${
                      selectedPackage && !selectedPackage.isFree
                        ? "bg-[#f0fffe] border-[#007570] shadow-[0_8px_24px_rgba(0,117,112,0.15)] -translate-y-1"
                        : "bg-white border-[#e2e8f0] hover:border-[#007570]/50 hover:shadow-md"
                    }`}
                  >
                    {selectedPackage && !selectedPackage.isFree && (
                      <div className="absolute top-4 right-4 bg-[#007570] text-white p-1 rounded-full">
                        <Check size={16} />
                      </div>
                    )}
                    <div>
                      <div className="inline-flex items-center gap-1 px-3 py-1 bg-amber-100 text-amber-800 font-bold text-[0.75rem] rounded-full mb-3 uppercase tracking-wider">
                        <Sparkles size={12} /> RECOMMENDED
                      </div>
                      <h3 className="text-xl font-extrabold text-[#0f172a] mb-1">Premium Business</h3>
                      <div className="flex items-baseline gap-1.5 my-3">
                        <span className="text-2xl font-black text-[#007570]">Rp50.000</span>
                        <span className="text-xs font-semibold text-slate-500">/ 1 Bulan</span>
                      </div>
                      <p className="text-[0.88rem] text-[#64748b] mb-6 leading-relaxed">
                        Tingkatkan jangkauan usaha dengan fitur lokasi interaktif, galeri foto/video, katalog produk, dan fitur chat.
                      </p>

                      <div className="space-y-2.5 pt-4 border-t border-slate-100 text-[0.88rem]">
                        <div className="flex items-center gap-2.5 text-slate-700 font-semibold">
                          <Check size={16} className="text-emerald-600 shrink-0" />
                          <span>Map / Lokasi Interaktif</span>
                        </div>
                        <div className="flex items-center gap-2.5 text-slate-700 font-semibold">
                          <Check size={16} className="text-emerald-600 shrink-0" />
                          <span>Galeri Foto Banner &amp; Video</span>
                        </div>
                        <div className="flex items-center gap-2.5 text-slate-700 font-semibold">
                          <Check size={16} className="text-emerald-600 shrink-0" />
                          <span>Katalog Produk Usaha</span>
                        </div>
                        <div className="flex items-center gap-2.5 text-slate-700 font-semibold">
                          <Check size={16} className="text-emerald-600 shrink-0" />
                          <span>Fitur Chat Langsung</span>
                        </div>
                        <div className="flex items-center gap-2.5 text-slate-700 font-semibold">
                          <Check size={16} className="text-emerald-600 shrink-0" />
                          <span>Prioritas Tampilan Pencarian</span>
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
                      className={`mt-8 w-full py-3.5 px-4 rounded-xl text-[0.92rem] font-bold transition-all duration-200 border-0 cursor-pointer ${
                        selectedPackage && !selectedPackage.isFree
                          ? "bg-gradient-to-br from-[#007570] to-[#009990] text-white shadow-lg shadow-[#007570]/30"
                          : "bg-[#007570] text-white hover:bg-[#005a58]"
                      }`}
                    >
                      Pilih Paket Premium
                    </button>
                  </div>
                ) : (
                  plans.map((plan) => {
                    const isSelected = selectedPackage?.id === plan.id;
                    const durationText = plan.formatted_duration || `${plan.duration_value || 1} ${plan.duration_unit === 'year' || plan.duration_unit === 'tahun' ? 'Tahun' : 'Bulan'}`;

                    return (
                      <div
                        key={plan.id}
                        onClick={() => setSelectedPackage({ ...plan, isFree: false })}
                        className={`relative rounded-2xl p-6 border-2 transition-all duration-300 flex flex-col justify-between cursor-pointer ${
                          isSelected
                            ? "bg-[#f0fffe] border-[#007570] shadow-[0_8px_24px_rgba(0,117,112,0.15)] -translate-y-1"
                            : "bg-white border-[#e2e8f0] hover:border-[#007570]/50 hover:shadow-md"
                        }`}
                      >
                        {isSelected && (
                          <div className="absolute top-4 right-4 bg-[#007570] text-white p-1 rounded-full">
                            <Check size={16} />
                          </div>
                        )}

                        <div>
                          <div className="inline-flex items-center gap-1 px-3 py-1 bg-amber-100 text-amber-800 font-bold text-[0.75rem] rounded-full mb-3 uppercase tracking-wider">
                            <Sparkles size={12} /> PREMIUM
                          </div>
                          <h3 className="text-xl font-extrabold text-[#0f172a] mb-1">{plan.name}</h3>
                          <div className="flex items-baseline gap-1.5 my-3">
                            <span className="text-2xl font-black text-[#007570]">
                              Rp{Number(plan.price || 0).toLocaleString('id-ID')}
                            </span>
                            <span className="text-xs font-semibold text-slate-500">/ {durationText}</span>
                          </div>
                          <p className="text-[0.88rem] text-[#64748b] mb-6 leading-relaxed">
                            {plan.description || "Tingkatkan promosi usaha kamu dengan fitur terlengkap."}
                          </p>

                          <div className="space-y-2.5 pt-4 border-t border-slate-100 text-[0.88rem]">
                            <div className={`flex items-center gap-2.5 ${plan.can_add_map !== false ? 'text-slate-700 font-semibold' : 'text-slate-400 line-through'}`}>
                              {plan.can_add_map !== false ? <Check size={16} className="text-emerald-600 shrink-0" /> : <X size={16} className="text-slate-300 shrink-0" />}
                              <span>Map / Lokasi Interaktif</span>
                            </div>
                            <div className={`flex items-center gap-2.5 ${plan.can_add_gallery !== false ? 'text-slate-700 font-semibold' : 'text-slate-400 line-through'}`}>
                              {plan.can_add_gallery !== false ? <Check size={16} className="text-emerald-600 shrink-0" /> : <X size={16} className="text-slate-300 shrink-0" />}
                              <span>Galeri Foto &amp; Banner</span>
                            </div>
                            <div className={`flex items-center gap-2.5 ${plan.can_add_video !== false ? 'text-slate-700 font-semibold' : 'text-slate-400 line-through'}`}>
                              {plan.can_add_video !== false ? <Check size={16} className="text-emerald-600 shrink-0" /> : <X size={16} className="text-slate-300 shrink-0" />}
                              <span>Video Profil Usaha</span>
                            </div>
                            <div className={`flex items-center gap-2.5 ${plan.can_add_products !== false ? 'text-slate-700 font-semibold' : 'text-slate-400 line-through'}`}>
                              {plan.can_add_products !== false ? <Check size={16} className="text-emerald-600 shrink-0" /> : <X size={16} className="text-slate-300 shrink-0" />}
                              <span>Katalog Produk Usaha</span>
                            </div>
                            <div className={`flex items-center gap-2.5 ${plan.can_chat !== false ? 'text-slate-700 font-semibold' : 'text-slate-400 line-through'}`}>
                              {plan.can_chat !== false ? <Check size={16} className="text-emerald-600 shrink-0" /> : <X size={16} className="text-slate-300 shrink-0" />}
                              <span>Fitur Chat Pelanggan</span>
                            </div>
                            <div className={`flex items-center gap-2.5 ${plan.priority_listing ? 'text-slate-700 font-semibold' : 'text-slate-400 line-through'}`}>
                              {plan.priority_listing ? <Check size={16} className="text-emerald-600 shrink-0" /> : <X size={16} className="text-slate-300 shrink-0" />}
                              <span>Prioritas Tampilan Hasil Pencarian</span>
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
                          className={`mt-8 w-full py-3.5 px-4 rounded-xl text-[0.92rem] font-bold transition-all duration-200 border-0 cursor-pointer ${
                            isSelected
                              ? "bg-gradient-to-br from-[#007570] to-[#009990] text-white shadow-lg shadow-[#007570]/30"
                              : "bg-[#007570] text-white hover:bg-[#005a58]"
                          }`}
                        >
                          Pilih Paket
                        </button>
                      </div>
                    );
                  })
                )}
              </div>
            )}
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
                  {selectedPackage?.isFree === false ? <Sparkles size={14} className="text-amber-500" /> : <Store size={14} />}
                  <span>{selectedPackage?.isFree === false ? "Paket Premium Active" : "Paket Free"}</span>
                </div>
              ) : selectedPackage && (
                <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 bg-[#f0fffe] border border-[#007570]/30 rounded-full text-xs font-bold text-[#007570]">
                  <Crown size={14} />
                  <span>{selectedPackage.name}</span>
                </div>
              )}
            </div>

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

                  {/* Deskripsi Usaha */}
                  <div className="flex flex-col gap-2">
                    <label className={labelCls}>Deskripsi Usaha <span className="text-[#dc2626]">*</span></label>
                    <textarea name="description" rows={4} placeholder="Ceritakan keunggulan, produk utama, dan informasi usaha kamu secara lengkap..." value={form.description} onChange={handleFormChange}
                      className="w-full px-4 py-3 border-[1.5px] border-[#e2e8f0] rounded-xl text-[0.95rem] text-[#0f172a] bg-[#fafafa] outline-none transition-all duration-200 leading-[1.6] resize-vertical min-h-[110px] focus:border-[#007570] focus:bg-white"
                    />
                  </div>

                  {/* Kategori & Sub Kategori */}
                  <div className="flex flex-col gap-2">
                    <SubCategorySelector
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
                        onKeyDown={(e) => e.key === "Enter" && geocodeAddress()}
                        className={inputCls}
                      />
                      <button
                        type="button"
                        onClick={geocodeAddress}
                        disabled={geocoding}
                        className="px-5 bg-[#007570] text-white border-0 rounded-xl font-semibold cursor-pointer shrink-0 hover:bg-[#005a58] flex items-center gap-2 transition-colors"
                      >
                        {geocoding ? <Loader2 size={16} className={spinCls} /> : <Search size={16} />}
                        <span className="hidden sm:inline">Cari Peta</span>
                      </button>
                    </div>

                    <div className="w-full max-w-full rounded-2xl overflow-hidden mt-3 border border-[#e2e8f0] relative isolate z-0 min-w-0">
                      <MapContainer
                        key={mapKey}
                        center={coords ? [coords.lat, coords.lng] : DEFAULT_CENTER}
                        zoom={coords ? 15 : 6}
                        style={{ height: "280px", width: "100%", minWidth: 0, position: "relative", zIndex: 0 }}
                        scrollWheelZoom
                      >
                        <MapResizeHandler />
                        <TileLayer attribution="&copy; OpenStreetMap" url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                        <MapClickHandler onMapClick={(latlng) => setCoords({ lat: latlng.lat, lng: latlng.lng })} />
                        {coords && <Marker position={[coords.lat, coords.lng]} />}
                      </MapContainer>
                      <p className="text-xs text-slate-500 px-4 py-2.5 bg-white border-t border-slate-200 flex items-center gap-1.5">
                        <MapPin size={14} className="text-[#007570]" />
                        <span>Klik pada peta untuk menentukan posisi presisi lokasi usaha.</span>
                      </p>
                    </div>
                  </div>

                  {/* Kota & Provinsi */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="flex flex-col gap-2">
                      <label className={labelCls}>Kota <span className="text-[#dc2626]">*</span></label>
                      <input name="city" type="text" placeholder="Contoh: Jakarta Selatan" value={form.city} onChange={handleFormChange} className={inputCls} />
                    </div>
                    <div className="flex flex-col gap-2">
                      <label className={labelCls}>Provinsi <span className="text-[#dc2626]">*</span></label>
                      <input name="province" type="text" placeholder="Contoh: DKI Jakarta" value={form.province} onChange={handleFormChange} className={inputCls} />
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
                  <div className="flex flex-col gap-2 bg-white p-4 rounded-xl border border-slate-200">
                    <label className={labelCls}><Camera size={16} className="text-[#007570]" /> 1. Logo / Thumbnail Utama Usaha</label>
                    <p className="text-xs text-slate-500 mb-2">Gambar ini akan menjadi foto profil &amp; thumbnail utama di halaman pencarian.</p>
                    {logoPreview ? (
                      <div className="relative max-w-[180px] rounded-xl overflow-hidden border-2 border-[#007570] shadow-sm">
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
                        className="border-2 border-dashed border-slate-300 rounded-xl p-6 text-center cursor-pointer bg-slate-50 hover:bg-[#f0fffe] hover:border-[#007570] transition-colors max-w-[360px]"
                        onClick={() => logoInputRef.current?.click()}
                      >
                        <input ref={logoInputRef} type="file" accept="image/*" hidden onChange={handleLogoChange} />
                        <Camera size={28} className="mx-auto text-[#007570] mb-2" />
                        <span className="text-sm font-bold text-slate-700 block">Upload Logo Usaha</span>
                        <span className="text-xs text-slate-400">Format JPG, PNG (Maks 4MB)</span>
                      </div>
                    )}
                  </div>

                  {/* 2. BANNER (After Logo) */}
                  <div className="flex flex-col gap-2 bg-white p-4 rounded-xl border border-slate-200">
                    <label className={labelCls}><ImageIcon size={16} className="text-[#007570]" /> 2. Banner / Foto Latar Header (Maks. 4 Foto)</label>
                    <p className="text-xs text-slate-500 mb-2">Banner akan ditampilkan sebagai latar belakang header halaman detail bisnis Anda.</p>
                    <div
                      className={`border-2 border-dashed border-slate-300 rounded-xl p-6 text-center transition-all bg-slate-50
                        ${banners.length >= 4 ? "cursor-not-allowed opacity-60" : "cursor-pointer hover:border-[#007570] hover:bg-[#f0fffe]"}`}
                      {...createDropHandler(handleBannerAdd)}
                      onClick={() => banners.length < 4 && bannerInputRef.current?.click()}
                    >
                      <input ref={bannerInputRef} type="file" accept="image/*" multiple hidden onChange={(e) => handleBannerAdd(e.target.files)} />
                      <Upload size={28} className="text-[#007570] mb-2 mx-auto" />
                      <p className="text-sm font-bold text-slate-700">{banners.length >= 4 ? "Maksimum 4 foto banner telah tercapai" : "Klik atau drag & drop foto banner"}</p>
                      <p className="text-xs text-slate-400">{banners.length}/4 foto terunggah</p>
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
                  <div className="flex flex-col gap-3.5 bg-white p-4 sm:p-5 rounded-2xl border border-slate-200 shadow-xs">
                    <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                      <div className="flex items-center gap-2">
                        <ImageIcon size={16} className="text-[#007570]" />
                        <label className="text-[0.9rem] font-bold text-slate-800">
                          3. Galeri Usaha
                        </label>
                      </div>
                      <span className="text-xs font-semibold text-slate-500">
                        {photos.length} foto {video ? " • 1 video" : ""}
                      </span>
                    </div>

                    <p className="text-xs text-slate-500">
                      Tambahkan foto suasana toko, produk unggulan, dan 1 video profil usaha (opsional).
                    </p>

                    {/* Upload Controls Row */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {/* Photo Upload Area */}
                      <div
                        className="border border-dashed border-slate-300 rounded-xl p-3.5 text-center cursor-pointer transition-all bg-slate-50 hover:border-[#007570] hover:bg-[#f0fffe] flex flex-col items-center justify-center min-h-[90px]"
                        {...createDropHandler(handlePhotoAdd)}
                        onClick={() => photoInputRef.current?.click()}
                      >
                        <input
                          ref={photoInputRef}
                          type="file"
                          accept="image/jpeg,image/png,image/webp,image/gif"
                          multiple
                          hidden
                          onChange={(e) => handlePhotoAdd(e.target.files)}
                        />
                        <div className="flex items-center gap-2 mb-1 text-[#007570]">
                          <Upload size={18} />
                          <span className="text-xs font-bold text-slate-700">Upload Foto Galeri</span>
                        </div>
                        <p className="text-[0.72rem] text-slate-400">JPG, PNG, WEBP (Bisa pilih beberapa foto)</p>
                      </div>

                      {/* Video Upload Area (Only if no video exists) */}
                      {!video ? (
                        <div className="border border-slate-200 rounded-xl p-3 bg-slate-50 flex flex-col justify-between min-h-[90px]">
                          <div className="flex items-center justify-between gap-1 mb-2">
                            <span className="text-[0.75rem] font-bold text-slate-700 flex items-center gap-1">
                              <Video size={13} className="text-[#007570]" /> Video Profil (Maks 1)
                            </span>
                            <div className="flex rounded-lg p-0.5 bg-slate-200/80 text-[0.68rem] font-bold">
                              <button
                                type="button"
                                onClick={() => { setVideoSourceTab("file"); setYoutubeUrlError(""); }}
                                className={`px-2 py-0.5 rounded transition-all cursor-pointer ${
                                  videoSourceTab === "file" ? "bg-white text-[#007570] shadow-2xs" : "text-slate-600"
                                }`}
                              >
                                File
                              </button>
                              <button
                                type="button"
                                onClick={() => { setVideoSourceTab("youtube"); setYoutubeUrlError(""); }}
                                className={`px-2 py-0.5 rounded transition-all cursor-pointer ${
                                  videoSourceTab === "youtube" ? "bg-white text-[#007570] shadow-2xs" : "text-slate-600"
                                }`}
                              >
                                YouTube
                              </button>
                            </div>
                          </div>

                          {videoSourceTab === "file" ? (
                            <div
                              className="border border-dashed border-slate-300 rounded-lg p-2 text-center cursor-pointer transition-all bg-white hover:border-[#007570]"
                              {...createDropHandler(handleVideoFileAdd)}
                              onClick={() => videoInputRef.current?.click()}
                            >
                              <input
                                ref={videoInputRef}
                                type="file"
                                accept="video/mp4,video/webm,video/quicktime"
                                hidden
                                onChange={(e) => handleVideoFileAdd(e.target.files)}
                              />
                              <p className="text-xs font-bold text-slate-700 flex items-center justify-center gap-1">
                                <Upload size={13} className="text-[#007570]" /> Upload File Video
                              </p>
                              <p className="text-[0.7rem] text-slate-400">MP4, WebM (Maks 25MB)</p>
                            </div>
                          ) : (
                            <div className="space-y-1">
                              <div className="flex gap-1.5">
                                <input
                                  type="text"
                                  value={youtubeUrlInput}
                                  onChange={(e) => {
                                    setYoutubeUrlInput(e.target.value);
                                    if (youtubeUrlError) setYoutubeUrlError("");
                                  }}
                                  placeholder="Link YouTube (watch?v=...)"
                                  className="w-full px-2.5 py-1 border border-slate-300 rounded-lg text-xs bg-white outline-none focus:border-[#007570]"
                                />
                                <button
                                  type="button"
                                  onClick={handleYouTubeAdd}
                                  className="px-3 py-1 bg-[#007570] hover:bg-[#005c58] text-white text-xs font-bold rounded-lg transition-colors shrink-0 cursor-pointer"
                                >
                                  Tambah
                                </button>
                              </div>
                              {youtubeUrlError && (
                                <p className="text-[0.7rem] font-medium text-red-600">{youtubeUrlError}</p>
                              )}
                            </div>
                          )}
                        </div>
                      ) : (
                        <div className="border border-slate-200 rounded-xl p-3 bg-slate-50 flex items-center justify-between min-h-[90px]">
                          <div className="flex items-center gap-2">
                            <div className="w-8 h-8 rounded-lg bg-[#007570]/10 text-[#007570] flex items-center justify-center font-bold">
                              <Video size={16} />
                            </div>
                            <div>
                              <span className="text-xs font-bold text-slate-800 block">1 Video Usaha Terpasang</span>
                              <span className="text-[0.7rem] text-slate-400">Tampilan video ada pada grid galeri</span>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* UNIFIED MEDIA THUMBNAILS GRID (Photos + Video together!) */}
                    {(photos.length > 0 || video !== null) && (
                      <div className="pt-2 border-t border-slate-100">
                        <span className="text-[0.75rem] font-bold text-slate-600 block mb-2">Media Galeri Usaha</span>
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
                  <span className="text-xs font-bold uppercase text-slate-400 block mb-1">Kota &amp; Provinsi</span>
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

            {/* Order Detail Card */}
            <div className="bg-slate-50 border border-slate-200 rounded-2xl p-6 mb-6 space-y-3.5">
              <div className="flex justify-between items-center text-sm pb-3 border-b border-slate-200">
                <span className="text-slate-500 font-medium">Paket</span>
                <span className="font-bold text-[#0f172a]">{selectedPackage?.name}</span>
              </div>
              <div className="flex justify-between items-center text-sm pb-3 border-b border-slate-200">
                <span className="text-slate-500 font-medium">Bisnis</span>
                <span className="font-bold text-[#0f172a]">{form.name || "Usaha Baru"}</span>
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

            {/* ── Kode Kupon / Diskon (Opsional) ── */}
            <div className="border border-slate-200 rounded-2xl p-5 bg-white mb-4">
              <label className="text-sm font-bold text-slate-800 flex items-center gap-2 mb-2">
                <Tag size={16} className="text-[#007570]" />
                Kode Kupon / Diskon <span className="text-xs font-normal text-slate-400">(Opsional)</span>
              </label>

              {appliedCoupon ? (
                <div className="flex items-center justify-between bg-emerald-50 border border-emerald-200 rounded-xl p-3.5">
                  <div className="flex items-center gap-2.5">
                    <CheckCircle2 size={20} className="text-emerald-600 shrink-0" />
                    <div>
                      <span className="text-xs font-bold text-emerald-800 uppercase block">Kupon Terpasang: {appliedCoupon.code}</span>
                      <span className="text-xs text-emerald-600 font-medium">Diskon Rp {appliedCoupon.discount_amount?.toLocaleString('id-ID')}</span>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={handleRemoveCoupon}
                    className="text-xs font-semibold text-red-600 bg-white border border-red-200 px-3 py-1.5 rounded-lg hover:bg-red-50 cursor-pointer"
                  >
                    Hapus
                  </button>
                </div>
              ) : (
                <div className="space-y-2">
                  <div className="flex gap-2">
                    <input
                      type="text"
                      placeholder="Masukkan kode kupon diskon"
                      value={couponInput}
                      onChange={(e) => setCouponInput(e.target.value.toUpperCase())}
                      className="flex-1 px-4 py-2.5 border border-slate-200 rounded-xl text-sm outline-none focus:border-[#007570]"
                    />
                    <button
                      type="button"
                      onClick={handleApplyCoupon}
                      disabled={couponLoading}
                      className="px-5 py-2.5 bg-[#007570] text-white rounded-xl text-sm font-semibold border-0 cursor-pointer hover:bg-[#005a58] disabled:opacity-60 flex items-center gap-2"
                    >
                      {couponLoading ? <Loader2 size={16} className={spinCls} /> : "Terapkan"}
                    </button>
                  </div>
                  {couponError && (
                    <p className="text-xs text-red-600 font-medium flex items-center gap-1">
                      <AlertCircle size={13} /> {couponError}
                    </p>
                  )}
                  {couponSuccessMsg && (
                    <p className="text-xs text-emerald-600 font-medium flex items-center gap-1">
                      <CheckCircle2 size={13} /> {couponSuccessMsg}
                    </p>
                  )}
                </div>
              )}
            </div>

            {/* ── Kode Referral (Opsional - Paket Premium) ── */}
            <div className="border border-slate-200 rounded-2xl p-5 bg-white mb-6">
              <label className="text-sm font-bold text-slate-800 flex items-center gap-2 mb-2">
                <Sparkles size={16} className="text-[#007570]" />
                Kode Referral <span className="text-xs font-normal text-slate-400">(Opsional - Diskon 5%)</span>
              </label>

              {appliedReferral ? (
                <div className="flex items-center justify-between bg-teal-50 border border-teal-200 rounded-xl p-3.5">
                  <div className="flex items-center gap-2.5">
                    <CheckCircle2 size={20} className="text-[#007570] shrink-0" />
                    <div>
                      <span className="text-xs font-bold text-[#007570] uppercase block">Referral Terpasang: {appliedReferral.referral_code}</span>
                      <span className="text-xs text-teal-700 font-medium">Diskon 5% (-Rp {appliedReferral.discount_amount?.toLocaleString('id-ID')})</span>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={handleRemoveReferral}
                    className="text-xs font-semibold text-red-600 bg-white border border-red-200 px-3 py-1.5 rounded-lg hover:bg-red-50 cursor-pointer"
                  >
                    Hapus
                  </button>
                </div>
              ) : (
                <div className="space-y-2">
                  <div className="flex gap-2">
                    <input
                      type="text"
                      placeholder="Masukkan kode referral"
                      value={referralInput}
                      onChange={(e) => setReferralInput(e.target.value.toUpperCase())}
                      className="flex-1 px-4 py-2.5 border border-slate-200 rounded-xl text-sm outline-none focus:border-[#007570]"
                    />
                    <button
                      type="button"
                      onClick={handleApplyReferral}
                      disabled={referralLoading}
                      className="px-5 py-2.5 bg-[#007570] text-white rounded-xl text-sm font-semibold border-0 cursor-pointer hover:bg-[#005a58] disabled:opacity-60 flex items-center gap-2"
                    >
                      {referralLoading ? <Loader2 size={16} className={spinCls} /> : "Terapkan"}
                    </button>
                  </div>
                  {referralError && (
                    <p className="text-xs text-red-600 font-medium flex items-center gap-1">
                      <AlertCircle size={13} /> {referralError}
                    </p>
                  )}
                  {referralSuccessMsg && (
                    <p className="text-xs text-emerald-600 font-medium flex items-center gap-1">
                      <CheckCircle2 size={13} /> {referralSuccessMsg}
                    </p>
                  )}
                </div>
              )}
            </div>

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
                            <span className={`px-2.5 py-1 text-xs font-black rounded-md ${item.badgeColor}`}>
                              {item.id.split(' ')[0]}
                            </span>
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
                Silakan lakukan transfer sebesar total tagihan ke rekening / Virtual Account berikut:
              </p>
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

            {/* Upload Area */}
            {proofPreview ? (
              <div className="relative max-w-[320px] mx-auto rounded-2xl overflow-hidden border-2 border-slate-200 shadow-md">
                <img src={proofPreview} alt="Bukti Pembayaran" className="w-full h-auto max-h-[300px] object-contain bg-slate-900" />
                <div className="p-3 bg-white flex justify-between items-center border-t border-slate-200">
                  <span className="text-xs font-semibold text-slate-700 truncate max-w-[180px]">{proofFile?.name}</span>
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
                <input ref={proofInputRef} type="file" accept="image/*" hidden onChange={handleProofChange} />
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
                {loading ? <><Loader2 size={18} className={spinCls} /> Menyimpan...</> : <><Check size={18} /> Simpan Perubahan</>}
              </button>
            </>
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
