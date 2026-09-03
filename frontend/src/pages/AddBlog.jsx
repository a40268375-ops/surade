import { useState, useRef, useEffect } from "react";
import { Link, useNavigate, useParams, useSearchParams } from "react-router-dom";
import Navbar from "../components/Navbar";
import api from "../services/api";
import {
  FileText, ImageIcon, Send, X, Upload,
  Check, AlertCircle, Loader2, ArrowLeft, Plus, Calendar, MapPin, Trash2,
  ChevronDown, CheckCircle2, Sparkles, Clock, Tag, CreditCard, ShieldCheck,
  ChevronRight, ChevronLeft, Copy, Wallet
} from "lucide-react";
import { getStorageUrl } from "../utils/constants";
import "./AddBlog.css";

const DEFAULT_BLOG_CATEGORIES = [
  { value: "", label: "-- Pilih Kategori Blog --" },
  { value: "bisnis-umkm", label: "Bisnis & UMKM" },
  { value: "kuliner-kafe", label: "Kuliner & Kafe" },
  { value: "teknologi-digital", label: "Teknologi & Digital" },
  { value: "kesehatan-gaya-hidup", label: "Kesehatan & Gaya Hidup" },
  { value: "pendidikan-edukasi", label: "Pendidikan & Edukasi" },
  { value: "travel-wisata", label: "Travel & Wisata" },
  { value: "promo-diskon", label: "Promo & Diskon" },
  { value: "tips-tutorial", label: "Tips & Tutorial" },
  { value: "berita-informasi", label: "Berita & Informasi" },
];

const DEFAULT_EVENT_CATEGORIES = [
  { value: "", label: "-- Pilih Kategori Event --" },
  { value: "festival-bazaar", label: "Festival & Bazaar" },
  { value: "konser-musik", label: "Konser & Musik" },
  { value: "workshop-seminar", label: "Workshop & Seminar" },
  { value: "pameran-expo", label: "Pameran & Expo" },
  { value: "olahraga-fun-run", label: "Olahraga & Fun Run" },
  { value: "komunitas-gathering", label: "Komunitas & Gathering" },
  { value: "kuliner-food-fair", label: "Kuliner & Food Fair" },
  { value: "event-lainnya", label: "Event Lainnya" },
];

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
      { id: "DANA", name: "DANA", accountName: "Triwala Mitra Bestari", accountNumber: "XXX (Belum Terdaftar)", badgeColor: "bg-[#008cff] text-white" },
      { id: "GoPay", name: "GoPay", accountName: "Triwala Mitra Bestari", accountNumber: "XXX (Belum Terdaftar)", badgeColor: "bg-[#00a5cf] text-white" },
    ]
  }
];

const spinCls = "animate-[spin360_1s_linear_infinite]";

export default function AddBlog() {
  const navigate = useNavigate();
  const { id } = useParams();
  const [searchParams] = useSearchParams();
  const typeParam = searchParams.get("type") || "blog";
  const isEditing = !!id;

  const [step, setStep] = useState(1);
  const [contentType, setContentType] = useState(typeParam);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [isPendingVerification, setIsPendingVerification] = useState(false);
  const [createdId, setCreatedId] = useState(null);
  const [createdBlogObj, setCreatedBlogObj] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const [blogCategories, setBlogCategories] = useState(DEFAULT_BLOG_CATEGORIES);

  // ── Pricing State ──
  const [pricing, setPricing] = useState({ blog: 10000, event: 15000 });

  // ── Coupon State ──
  const [couponInput, setCouponInput] = useState("");
  const [couponLoading, setCouponLoading] = useState(false);
  const [couponError, setCouponError] = useState("");
  const [couponSuccessMsg, setCouponSuccessMsg] = useState("");
  const [appliedCoupon, setAppliedCoupon] = useState(null);

  // ── Payment Method State ──
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState("DANA");
  const [copiedAccount, setCopiedAccount] = useState(false);

  // ── Proof of Payment State ──
  const [proofFile, setProofFile] = useState(null);
  const [proofPreview, setProofPreview] = useState(null);
  const [existingProof, setExistingProof] = useState(null);
  const proofInputRef = useRef();

  const currentUser = JSON.parse(localStorage.getItem("user") || "{}");
  const isAdmin = currentUser?.role === "admin";

  const [form, setForm] = useState({
    title: "",
    blog_category: "",
    excerpt: "",
    content: "",
    status: "draft",
    event_date: "",
    event_location: "",
  });

  // Thumbnail
  const [thumbnail, setThumbnail] = useState(null);
  const [thumbnailPreview, setThumbnailPreview] = useState(null);

  // Banner (max 4)
  const [banners, setBanners] = useState([]);
  const bannerInputRef = useRef();

  // Gallery (additional images)
  const [gallery, setGallery] = useState([]);
  const galleryInputRef = useRef();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((p) => ({ ...p, [name]: value }));
  };

  // ── Thumbnail ──
  const handleThumbnailChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setThumbnail(file);
      setThumbnailPreview(URL.createObjectURL(file));
    }
  };

  const removeThumbnail = () => {
    setThumbnail(null);
    if (thumbnailPreview) URL.revokeObjectURL(thumbnailPreview);
    setThumbnailPreview(null);
  };

  // ── Banner ──
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

  // ── Gallery ──
  const handleGalleryAdd = (files) => {
    Array.from(files).forEach((file) => {
      setGallery((p) => [...p, { file, preview: URL.createObjectURL(file) }]);
    });
  };

  const removeGallery = (i) => {
    setGallery((p) => {
      if (p[i]?.preview) URL.revokeObjectURL(p[i].preview);
      return p.filter((_, idx) => idx !== i);
    });
  };

  // ── Drag & Drop helper ──
  const createDropHandler = (onAdd) => ({
    onDragOver: (e) => e.preventDefault(),
    onDrop: (e) => { e.preventDefault(); onAdd(e.dataTransfer.files); },
  });

  // Load existing data when editing
  useEffect(() => {
    if (isEditing && id) {
      setSubmitting(true);
      const endpoint = `/blogs/${id}`;
      api.get(endpoint)
        .then((res) => {
          const data = res.data?.data || res.data;
          if (data && (data.id || data.title)) {
            setForm({
              title: data.title || "",
              blog_category: data.blog_category || "",
              excerpt: data.excerpt || "",
              content: data.content || "",
              status: data.status || "draft",
              rejection_reason: data.rejection_reason || "",
              event_date: data.event_date ? data.event_date.split("T")[0] : "",
              event_location: data.event_location || "",
            });
            if (data.type) setContentType(data.type);
            if (data.thumbnail) {
              setThumbnailPreview(getStorageUrl(data.thumbnail));
            }
            if (data.latest_transaction?.payment_proof || data.latestTransaction?.payment_proof) {
              const p = data.latest_transaction?.payment_proof || data.latestTransaction?.payment_proof;
              setExistingProof(getStorageUrl(p));
            }
            if (data.images && data.images.length > 0) {
              const rawImages = typeof data.images === "string" ? JSON.parse(data.images) : data.images;
              if (Array.isArray(rawImages)) {
                setBanners(rawImages.map((img) => ({ preview: getStorageUrl(img.image_url || img) })));
              }
            }
          }
        })
        .catch((err) => {
          console.error("Gagal memuat data konten:", err);
          setError("Gagal memuat data konten.");
        })
        .finally(() => setSubmitting(false));
    }
  }, [isEditing, id]);

  // Fetch blog categories from backend
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await api.get("/blog-categories");
        const data = res.data?.data || res.data || [];
        if (Array.isArray(data) && data.length > 0) {
          const mappedCategories = [
            { value: "", label: "-- Pilih Kategori --" },
            ...data.map((c) => ({ value: c.slug, label: c.name })),
          ];
          setBlogCategories(mappedCategories);
        }
      } catch (err) {
        console.error("Failed to fetch blog categories:", err);
      }
    };
    fetchCategories();
  }, []);

  // Fetch pay-per-post pricing
  const fetchPricing = async () => {
    try {
      const res = await api.get("/content-pricing");
      if (res.data) {
        setPricing({
          blog: Number(res.data.blog || 10000),
          event: Number(res.data.event || 15000),
        });
      }
    } catch (err) {
      console.error("Failed to fetch content pricing:", err);
    }
  };

  useEffect(() => {
    fetchPricing();
  }, []);

  const currentFee = contentType === "event" ? pricing.event : pricing.blog;

  const activeCategories = contentType === "event"
    ? DEFAULT_EVENT_CATEGORIES
    : (blogCategories && blogCategories.length > 1 ? blogCategories : DEFAULT_BLOG_CATEGORIES);

  // ── Account Detail Helper ──
  const getAccountDetail = () => {
    for (const grp of PAYMENT_METHODS) {
      const found = grp.items.find((item) => item.id === selectedPaymentMethod);
      if (found) return found;
    }
    return PAYMENT_METHODS[0].items[0];
  };

  const currentAccount = getAccountDetail();

  // ── Validation ──
  const validate = () => {
    if (!form.title.trim()) return "Judul wajib diisi.";
    if (!form.content.trim()) return "Konten wajib diisi.";
    if (contentType === "event" && !form.event_date) return "Tanggal event wajib diisi.";
    if (contentType === "event" && !form.event_location.trim()) return "Lokasi event wajib diisi.";
    return null;
  };

  // ── Save Content / Proceed to Payment ──
  const handleProceed = async (targetAction = "publish") => {
    const err = validate();
    if (err) {
      setError(err);
      window.scrollTo({ top: 0, behavior: "smooth" });
      setTimeout(() => setError(""), 5000);
      return;
    }

    setSubmitting(true);
    setError("");
    try {
      const endpoint = "/blogs";
      const isPublish = targetAction === "publish";
      const isResubmit = isEditing && form.status === "rejected";
      const targetStatus = isPublish
        ? (isAdmin ? "published" : (isResubmit ? "pending" : "waiting_payment"))
        : "draft";

      const payload = {
        title: form.title,
        blog_category: form.blog_category || null,
        excerpt: form.excerpt || null,
        content: form.content,
        type: contentType,
        status: targetStatus,
        resubmit: isResubmit,
        ...(contentType === "event" && {
          event_date: form.event_date,
          event_location: form.event_location,
        }),
      };

      let itemId;
      let itemData;
      if (isEditing) {
        const res = await api.put(`${endpoint}/${id}`, payload);
        itemData = res.data?.data || { id, ...payload };
        itemId = id;
      } else {
        const res = await api.post(endpoint, payload);
        itemData = res.data?.data;
        itemId = itemData?.id;
        if (!itemId) throw new Error("Gagal membuat konten");
      }

      // Upload thumbnail if exists
      if (thumbnail instanceof File) {
        try {
          const fd = new FormData();
          fd.append("thumbnail", thumbnail);
          await api.post(`${endpoint}/${itemId}/thumbnail`, fd);
        } catch (thumbErr) {
          console.error("Gagal upload thumbnail:", thumbErr);
        }
      }

      // Upload banners & gallery (only valid File instances)
      const newImageFiles = [
        ...banners.filter((b) => b && b.file instanceof File).map((b) => b.file),
        ...gallery.filter((g) => g && g.file instanceof File).map((g) => g.file),
      ];
      if (newImageFiles.length > 0) {
        try {
          const fd = new FormData();
          newImageFiles.forEach((file) => fd.append("images[]", file));
          await api.post(`${endpoint}/${itemId}/images`, fd);
        } catch (imgErr) {
          console.error("Gagal upload gambar pendukung:", imgErr);
        }
      }

      setCreatedId(itemId);
      const fullBlogData = {
        ...itemData,
        id: itemId,
        title: form.title,
        type: contentType,
        status: targetStatus,
      };
      setCreatedBlogObj(fullBlogData);

      if (isResubmit) {
        // Go directly to Step 4 (Upload Bukti Pembayaran Revisi) without payment methods
        setStep(4);
        window.scrollTo({ top: 0, behavior: "smooth" });
      } else if (!isPublish || isAdmin) {
        setSuccess(true);
      } else {
        // Go to Step 2 (Ringkasan Pesanan & Pembayaran)
        setStep(2);
        window.scrollTo({ top: 0, behavior: "smooth" });
      }
    } catch (err) {
      let msg =
        err?.response?.data?.message ||
        (err?.response?.data?.errors
          ? Object.values(err.response.data.errors).flat().join(", ")
          : err.message) ||
        "Terjadi kesalahan saat menyimpan konten.";

      if (msg.includes("selected blog category is invalid")) {
        msg = "Kategori yang dipilih tidak valid. Silakan pilih kategori dari daftar.";
      } else if (msg.includes("title field is required")) {
        msg = "Judul wajib diisi.";
      } else if (msg.includes("content field is required")) {
        msg = "Konten utama wajib diisi.";
      }

      setError(msg);
      window.scrollTo({ top: 0, behavior: "smooth" });
    } finally {
      setSubmitting(false);
    }
  };

  // ── Coupon Logic ──
  const handleApplyCoupon = async () => {
    if (!couponInput.trim()) return;
    setCouponLoading(true);
    setCouponError("");
    setCouponSuccessMsg("");
    try {
      const res = await api.post("/coupons/validate", {
        code: couponInput.trim().toUpperCase(),
        product_type: contentType,
        amount: currentFee,
      });
      const data = res.data?.data || res.data;
      if (data && (data.valid || data.is_valid !== false)) {
        const couponObj = data.coupon || data;
        let discount = 0;
        if (couponObj.type === "percentage" || couponObj.discount_type === "percentage") {
          const pct = Number(couponObj.value || couponObj.discount_value || 0);
          discount = (currentFee * pct) / 100;
          const maxDisc = Number(couponObj.max_discount || couponObj.maximum_discount || 0);
          if (maxDisc > 0) discount = Math.min(discount, maxDisc);
        } else {
          discount = Number(couponObj.value || couponObj.discount_value || 0);
        }
        discount = Math.min(discount, currentFee);

        setAppliedCoupon({
          code: couponObj.code || couponInput.trim().toUpperCase(),
          discount_amount: discount,
        });
        setCouponSuccessMsg(`Kupon ${couponObj.code || couponInput} berhasil digunakan!`);
      } else {
        setCouponError(data?.message || "Kupon tidak valid.");
      }
    } catch (err) {
      setCouponError(err.response?.data?.message || "Kupon tidak valid atau sudah kedaluwarsa.");
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

  // ── Proof of Payment Upload ──
  const handleProofChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 10 * 1024 * 1024) {
        setError("Ukuran file maksimal 10MB.");
        return;
      }
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

  // ── Final Checkout Submit ──
  const handleFinalCheckout = async () => {
    const isResubmit = isEditing && (form.status === "rejected" || createdBlogObj?.status === "rejected");
    const basePrice = currentFee;
    const couponDiscount = appliedCoupon ? Number(appliedCoupon.discount_amount || 0) : 0;
    const finalAmount = isResubmit ? 0 : Math.max(0, basePrice - couponDiscount);

    if (!isResubmit && finalAmount > 0 && !proofFile) {
      setError("Silakan unggah bukti transfer / pembayaran terlebih dahulu.");
      window.scrollTo({ top: 0, behavior: "smooth" });
      return;
    }

    setSubmitting(true);
    setError("");

    try {
      const formData = new FormData();
      if (appliedCoupon && !isResubmit) {
        formData.append("coupon_code", appliedCoupon.code);
      }
      formData.append("payment_method", isResubmit ? "Revisi Pembayaran" : currentAccount.name);
      if (proofFile) {
        formData.append("payment_proof", proofFile);
      }

      await api.post(`/blogs/${createdId || id}/checkout`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      setIsPendingVerification(true);
      setSuccess(true);
      window.scrollTo({ top: 0, behavior: "smooth" });
    } catch (err) {
      setError(err.response?.data?.message || "Terjadi kesalahan saat memproses pembayaran.");
      window.scrollTo({ top: 0, behavior: "smooth" });
    } finally {
      setSubmitting(false);
    }
  };

  // ── Delete ──
  const handleDelete = async () => {
    if (!window.confirm("Yakin ingin menghapus konten ini?")) return;
    setDeleting(true);
    try {
      await api.delete(`/blogs/${id}`);
      navigate("/admin-user");
    } catch (err) {
      setError("Gagal menghapus konten.");
    } finally {
      setDeleting(false);
    }
  };

  // ── Multi-Step Indicator Config ──
  const BLOG_STEPS = [
    { id: 1, label: "Isi Konten", icon: <FileText size={16} /> },
    { id: 2, label: "Ringkasan Pesanan", icon: <Tag size={16} /> },
    { id: 3, label: "Metode Pembayaran", icon: <CreditCard size={16} /> },
    { id: 4, label: "Upload Bukti", icon: <Upload size={16} /> },
  ];

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
                Publikasi &amp; Pembayaran Berhasil Dikirim!
              </h1>
              <p className="text-base text-[#64748b] leading-[1.7] mb-8">
                Bukti pembayaran publikasi untuk <strong className="text-[#0f172a]">{form.title}</strong> sedang dalam proses verifikasi oleh Admin. Status akan otomatis berubah menjadi <strong className="text-[#007570]">Published</strong> setelah disetujui.
              </p>
              <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 mb-8 text-left text-[0.88rem] text-amber-900 w-full flex items-start gap-3">
                <AlertCircle size={20} className="text-amber-600 shrink-0 mt-0.5" />
                <div>
                  <span className="font-bold block mb-1">Status Publikasi: Pending Verifikasi Admin</span>
                  Konten kamu telah tersimpan aman. Setelah diverifikasi, artikel/event ini akan otomatis tampil di halaman utama Info.co.id.
                </div>
              </div>
            </>
          ) : (
            <>
              <div className="w-[90px] h-[90px] rounded-full bg-gradient-to-br from-[#007570] to-[#00a896] text-white flex items-center justify-center mb-7 shadow-[0_8px_32px_rgba(0,117,112,0.3)] animate-[popIn_0.4s_cubic-bezier(0.34,1.56,0.64,1)_both]">
                <Check size={48} strokeWidth={2.5} />
              </div>
              <h1 className="text-[1.8rem] font-extrabold text-[#0f172a] mb-3.5">
                {form.status === "published" || isAdmin
                  ? "Konten Berhasil Diterbitkan!"
                  : (isEditing && form.status === "rejected"
                    ? "Revisi Konten Berhasil Diajukan Ulang!"
                    : "Draft Konten Berhasil Disimpan!")}
              </h1>
              <p className="text-base text-[#64748b] leading-[1.7] mb-9">
                {form.status === "published" || isAdmin
                  ? `Konten "${form.title}" telah terbit dan kini dapat dibaca oleh seluruh pengunjung website Info.co.id.`
                  : (isEditing && form.status === "rejected"
                    ? `Revisi untuk konten "${form.title}" telah dikirim ke Admin dan kini berstatus Menunggu Persetujuan. Kamu tidak perlu membayar ulang.`
                    : `Draft "${form.title}" telah tersimpan. Kamu dapat melanjutkannya kapan saja melalui Dashboard.`)}
              </p>
            </>
          )}

          <div className="flex gap-3.5 flex-wrap justify-center w-full">
            {createdId && (
              <Link
                to={contentType === "event" ? `/event/${createdId}` : `/blog/${createdId}`}
                className="inline-flex items-center justify-center gap-2 px-7 py-3.5 bg-gradient-to-br from-[#007570] to-[#009990] text-white rounded-[14px] text-[0.95rem] font-semibold no-underline border-0 cursor-pointer transition-all duration-[0.25s] shadow-[0_4px_16px_rgba(0,117,112,0.3)] hover:-translate-y-0.5 hover:shadow-[0_8px_24px_rgba(0,117,112,0.4)] flex-1 min-w-[200px]"
              >
                Lihat Konten
              </Link>
            )}
            <Link
              to="/admin-user"
              className="inline-flex items-center justify-center gap-2 px-7 py-3.5 bg-white text-[#374151] rounded-[14px] text-[0.95rem] font-semibold no-underline border-[1.5px] border-[#e2e8f0] cursor-pointer transition-all duration-[0.25s] hover:bg-[#f8fafc] hover:border-[#94a3b8] flex-1 min-w-[200px]"
            >
              Ke Dashboard
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
            {isEditing
              ? `Edit ${contentType === "event" ? "Event" : "Blog"}`
              : `Buat ${contentType === "event" ? "Event Baru" : "Blog Baru"}`}
          </h1>
          <p className="text-[1.05rem] text-white/75">
            Publikasikan artikel inspiratif atau promosikan agenda event kamu ke seluruh Indonesia
          </p>
        </div>
      </div>

      {/* BODY CONTAINER */}
      <div className="max-w-[920px] mx-auto px-6 pt-10 pb-20">

        {/* STEP INDICATOR (FOR MULTI-STEP FLOW) */}
        {!isAdmin && (() => {
          const isResubmit = isEditing && (form.status === "rejected" || createdBlogObj?.status === "rejected");
          const displayedSteps = isResubmit
            ? [
                { id: 1, label: "Edit Konten", icon: <FileText size={16} /> },
                { id: 4, label: "Upload Bukti Transfer", icon: <Upload size={16} /> },
              ]
            : BLOG_STEPS;

          return (
            <div className="flex items-center justify-center mb-9 flex-wrap gap-y-4">
              {displayedSteps.map((s, i) => (
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
                  {i < displayedSteps.length - 1 && (
                    <div className={`w-10 sm:w-14 h-0.5 mx-1 mb-6 transition-colors duration-300
                      ${step > s.id ? "bg-[#16a34a]" : "bg-[#e2e8f0]"}`}
                    />
                  )}
                </div>
              ))}
            </div>
          );
        })()}

        {/* ERROR MESSAGE */}
        {error && (
          <div className="flex items-center gap-2.5 bg-[#fef2f2] border border-[#fecaca] rounded-xl px-[18px] py-3.5 text-[#dc2626] text-[0.9rem] mb-6 animate-[slideDown_0.2s_ease]">
            <AlertCircle size={18} className="shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* REJECTION REASON ALERT BANNER */}
        {form.rejection_reason && form.status === "rejected" && (
          <div className="mb-6 p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-xs sm:text-sm flex items-start gap-3 shadow-xs animate-[slideDown_0.2s_ease]">
            <AlertCircle size={22} className="text-rose-600 shrink-0 mt-0.5" />
            <div>
              <strong className="block text-rose-900 font-bold mb-1">
                Catatan Penolakan dari Admin:
              </strong>
              <p className="leading-relaxed text-rose-700 bg-white/70 p-2.5 rounded-xl border border-rose-200/60 font-medium">
                "{form.rejection_reason}"
              </p>
              <p className="text-[12px] text-rose-600 font-semibold mt-2">
                💡 Silakan perbaiki isi konten/formulir di bawah ini sesuai catatan admin, kemudian klik tombol <strong>"Simpan Revisi & Ajukan Ulang"</strong>. Anda tidak perlu membayar ulang.
              </p>
            </div>
          </div>
        )}

        {/* ── STEP 1: FORM KONTEN ── */}
        {step === 1 && (
          <div>
            {/* Type Switcher Tabs */}
            <div className="type-selector-wrapper">
              <div className="type-segmented-control">
                <button
                  type="button"
                  className={`type-segment ${contentType === "blog" ? "active" : ""}`}
                  onClick={() => setContentType("blog")}
                >
                  <FileText size={18} />
                  <span>Blog</span>
                </button>
                <button
                  type="button"
                  className={`type-segment ${contentType === "event" ? "active" : ""}`}
                  onClick={() => setContentType("event")}
                >
                  <Calendar size={18} />
                  <span>Event</span>
                </button>
              </div>
            </div>

            {/* Tarif Banner */}
            <div className="mb-6 p-4 sm:p-5 rounded-2xl bg-gradient-to-r from-teal-50/90 via-emerald-50/50 to-teal-50/90 border border-teal-200/80 flex flex-wrap items-center justify-between gap-4">
              <div className="flex items-center gap-3.5">
                <div className="w-11 h-11 rounded-xl bg-[#007570] text-white flex items-center justify-center shrink-0 shadow-sm">
                  <Sparkles size={22} />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-base font-bold text-slate-900">
                      Tarif Publikasi {contentType === "event" ? "Event" : "Blog"}
                    </h3>
                    <span className="px-2.5 py-0.5 text-[10px] font-extrabold uppercase tracking-wider rounded-full bg-emerald-100 text-emerald-800 border border-emerald-300">
                      AKTIF 1 TAHUN
                    </span>
                  </div>
                  <p className="text-xs text-slate-600 mt-1 max-w-lg leading-relaxed">
                    Posting Anda akan tayang aktif selama 1 tahun (365 hari) di platform Info.co.id. Dapatkan jangkauan audiens lebih luas, optimasi SEO, dan bebas update konten kapan saja.
                  </p>
                </div>
              </div>
              <div className="text-right shrink-0">
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">BIAYA PUBLIKASI</span>
                <span className="text-2xl font-black text-[#007570] block">
                  Rp {currentFee.toLocaleString("id-ID")}
                </span>
                <span className="text-[11px] text-slate-500 font-medium">/ posting / tahun</span>
              </div>
            </div>

            {/* Form Card */}
            <div className="bg-white rounded-[20px] shadow-[0_4px_24px_rgba(15,23,42,0.07)] p-6 sm:p-9 mb-6 border border-[#e2e8f0] animate-[fadeCard_0.25s_ease]">
              <form onSubmit={(e) => { e.preventDefault(); handleProceed("publish"); }} className="add-blog-form">
                {/* Judul */}
                <div className="form-row">
                  <div className="form-group form-group--full">
                    <label className="form-label">
                      Judul {contentType === "event" ? "Event" : "Blog"} <span className="required-star">*</span>
                    </label>
                    <div className="input-with-icon">
                      <input
                        name="title"
                        type="text"
                        placeholder={`Masukan judul ${contentType === "event" ? "event" : "blog"}`}
                        value={form.title}
                        onChange={handleChange}
                        className="form-input"
                      />
                    </div>
                  </div>
                </div>

              {/* Kategori */}
              <div className="form-row form-row--2cols">
                <div className="form-group">
                  <label className="form-label">Kategori {contentType === "event" ? "Event" : "Blog"}</label>
                  <div className="select-wrapper">
                    <select
                      name="blog_category"
                      value={form.blog_category}
                      onChange={handleChange}
                      className="form-input form-select"
                    >
                      {activeCategories.map((c) => (
                        <option key={c.value} value={c.value}>
                          {c.label}
                        </option>
                      ))}
                    </select>
                    <ChevronDown size={18} className="select-icon" />
                  </div>
                </div>

                {/* Event Location (if event) */}
                {contentType === "event" ? (
                  <div className="form-group">
                    <label className="form-label">Lokasi Event <span className="required-star">*</span></label>
                    <div className="input-with-icon">
                      <input
                        name="event_location"
                        type="text"
                        placeholder="Contoh: Jakarta International Expo (JIExpo)"
                        value={form.event_location}
                        onChange={handleChange}
                        className="form-input"
                      />
                      <MapPin size={18} className="input-icon" />
                    </div>
                  </div>
                ) : (
                  <div className="form-group">
                    <label className="form-label">Status Draft / Publikasi</label>
                    <div className="select-wrapper">
                      <select
                        name="status"
                        value={form.status}
                        onChange={handleChange}
                        className="form-input form-select"
                      >
                        <option value="draft">Simpan Draft</option>
                        <option value="published">Siap Diterbitkan</option>
                      </select>
                      <ChevronDown size={18} className="select-icon" />
                    </div>
                  </div>
                )}
              </div>

              {/* Tanggal Event (if event) */}
              {contentType === "event" && (
                <div className="form-row form-row--2cols">
                  <div className="form-group">
                    <label className="form-label">Tanggal Penyelenggaraan Event <span className="required-star">*</span></label>
                    <div className="input-with-icon">
                      <input
                        name="event_date"
                        type="date"
                        value={form.event_date}
                        onChange={handleChange}
                        className="form-input"
                      />
                      <Calendar size={18} className="input-icon" />
                    </div>
                  </div>

                  <div className="form-group">
                    <label className="form-label">Status Draft / Publikasi</label>
                    <div className="select-wrapper">
                      <select
                        name="status"
                        value={form.status}
                        onChange={handleChange}
                        className="form-input form-select"
                      >
                        <option value="draft">Simpan Draft</option>
                        <option value="published">Siap Diterbitkan</option>
                      </select>
                      <ChevronDown size={18} className="select-icon" />
                    </div>
                  </div>
                </div>
              )}

              {/* Ringkasan Singkat */}
              <div className="form-row">
                <div className="form-group form-group--full">
                  <label className="form-label">Ringkasan Singkat (Excerpt)</label>
                  <textarea
                    name="excerpt"
                    rows={3}
                    placeholder="Tuliskan 1-2 kalimat ringkasan yang menarik minat pembaca..."
                    value={form.excerpt}
                    onChange={handleChange}
                    className="form-input form-textarea"
                  />
                </div>
              </div>

              {/* Konten Utama */}
              <div className="form-row">
                <div className="form-group form-group--full">
                  <label className="form-label">
                    Konten Utama <span className="required-star">*</span>
                  </label>
                  <textarea
                    name="content"
                    rows={10}
                    placeholder={`Tulis konten lengkap ${contentType === "event" ? "event" : "blog"} di sini...`}
                    value={form.content}
                    onChange={handleChange}
                    className="form-input form-textarea form-textarea--content"
                  />
                </div>
              </div>

              {/* ── GAMBAR & MEDIA SECTION ── */}
              <div className="form-section-divider" />
              <div className="form-section-title">Gambar & Media</div>

              <div className="form-row">
                <div className="form-group form-group--full">
                  <label className="form-label">Thumbnail (Foto Sampul Utama)</label>
                  {thumbnailPreview ? (
                    <div className="thumbnail-preview-wrapper">
                      <img src={thumbnailPreview} alt="Thumbnail" className="thumbnail-preview" />
                      <button type="button" className="thumbnail-remove" onClick={removeThumbnail}>
                        <X size={16} />
                      </button>
                    </div>
                  ) : (
                    <div
                      className="upload-zone upload-zone--small"
                      onClick={() => document.getElementById("thumb-input").click()}
                    >
                      <Upload size={28} className="upload-zone__icon" />
                      <p className="upload-zone__text">Klik untuk upload thumbnail</p>
                      <p className="upload-zone__hint">JPG, PNG, WEBP max 4MB</p>
                    </div>
                  )}
                  <input
                    id="thumb-input"
                    type="file"
                    accept="image/*"
                    hidden
                    onChange={handleThumbnailChange}
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group form-group--full">
                  <label className="form-label">Banner (Opsional, maks. 4)</label>
                  <div
                    className={"upload-zone upload-zone--small " + (banners.length >= 4 ? "upload-zone--disabled" : "")}
                    {...createDropHandler(handleBannerAdd)}
                    onClick={() => banners.length < 4 && bannerInputRef.current?.click()}
                  >
                    <input
                      ref={bannerInputRef}
                      type="file"
                      accept="image/*"
                      multiple
                      hidden
                      onChange={(e) => handleBannerAdd(e.target.files)}
                    />
                    <Upload size={28} className="upload-zone__icon" />
                    <p className="upload-zone__text">
                      {banners.length >= 4 ? "Batas maksimum 4 banner" : "Klik atau drag & drop banner"}
                    </p>
                    <p className="upload-zone__hint">{banners.length}/4 banner</p>
                  </div>
                  {banners.length > 0 && (
                    <div className="add-blog-banner-grid">
                      {banners.map((b, i) => (
                        <div key={i} className="add-blog-banner-item">
                          <img src={b.preview} alt="" className="add-blog-banner-item__img" />
                          <div className="add-blog-banner-item__overlay">
                            <button type="button" onClick={() => removeBanner(i)} className="add-blog-banner-item__remove">
                              <X size={16} />
                            </button>
                            <span className="add-blog-banner-item__badge">Banner {i + 1}</span>
                          </div>
                        </div>
                      ))}
                      {banners.length < 4 && (
                        <button
                          type="button"
                          className="add-blog-banner-add-more"
                          onClick={() => bannerInputRef.current?.click()}
                        >
                          <Plus size={28} />
                          <span>Tambah</span>
                        </button>
                      )}
                    </div>
                  )}
                </div>
              </div>

              <div className="form-row">
                <div className="form-group form-group--full">
                  <label className="form-label">Galeri Foto (Opsional)</label>
                  <div
                    className="upload-zone upload-zone--small"
                    {...createDropHandler(handleGalleryAdd)}
                    onClick={() => galleryInputRef.current?.click()}
                  >
                    <input
                      ref={galleryInputRef}
                      type="file"
                      accept="image/*"
                      multiple
                      hidden
                      onChange={(e) => handleGalleryAdd(e.target.files)}
                    />
                    <Upload size={28} className="upload-zone__icon" />
                    <p className="upload-zone__text">Klik atau drag & drop foto</p>
                    <p className="upload-zone__hint">JPG, PNG, WEBP — bisa multiple file</p>
                  </div>
                  {gallery.length > 0 && (
                    <div className="add-blog-gallery-grid">
                      {gallery.map((img, i) => (
                        <div key={i} className="add-blog-gallery-item">
                          <img src={img.preview} alt="" className="add-blog-gallery-item__img" />
                          <button
                            type="button"
                            className="add-blog-gallery-item__remove"
                            onClick={() => removeGallery(i)}
                          >
                            <X size={12} />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* ── NAVIGATION BUTTONS (STEP 1) ── */}
              <div className="flex items-center gap-3 mt-8 pt-6 border-t border-slate-200">
                {isEditing && (
                  <button
                    type="button"
                    onClick={handleDelete}
                    disabled={deleting}
                    className="inline-flex items-center gap-2 px-6 py-3.5 rounded-[14px] text-[0.92rem] font-semibold cursor-pointer border-[1.5px] transition-all bg-[#fef2f2] text-[#dc2626] border-[#fecaca] hover:bg-[#fee2e2] disabled:opacity-70"
                  >
                    {deleting ? <><Loader2 size={16} className={spinCls} /> Menghapus...</> : <><Trash2 size={16} /> Hapus</>}
                  </button>
                )}

                <button
                  type="button"
                  onClick={() => handleProceed("draft")}
                  disabled={submitting}
                  className="inline-flex items-center gap-2 px-6 py-3.5 rounded-[14px] text-[0.92rem] font-semibold cursor-pointer border-[1.5px] border-[#e2e8f0] bg-white text-[#374151] hover:bg-[#f8fafc] hover:border-[#94a3b8] transition-all"
                >
                  Simpan sebagai Draft
                </button>

                <div style={{ flex: 1 }} />

                <button
                  type="button"
                  onClick={() => handleProceed("publish")}
                  disabled={submitting}
                  className="inline-flex items-center gap-2 px-8 py-3.5 rounded-[14px] text-[0.95rem] font-bold cursor-pointer border-0 transition-all duration-[0.25s] bg-gradient-to-br from-[#007570] to-[#009990] text-white shadow-[0_4px_16px_rgba(0,117,112,0.3)] hover:-translate-y-0.5 hover:shadow-[0_8px_24px_rgba(0,117,112,0.4)] disabled:opacity-70 disabled:cursor-not-allowed"
                >
                  {submitting ? (
                    <><Loader2 size={18} className={spinCls} /> Menyimpan...</>
                  ) : (
                    <>
                      {form.status === "rejected"
                        ? "Simpan Revisi & Ajukan Ulang"
                        : (isAdmin ? "Terbitkan Langsung" : `Lanjut ke Pembayaran (Rp ${currentFee.toLocaleString("id-ID")})`)}
                      <ChevronRight size={18} />
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

        {/* ── STEP 2: RINGKASAN PESANAN & KUPON / REFERRAL ── */}
        {step === 2 && (
          <div className="bg-white rounded-[20px] shadow-[0_4px_24px_rgba(15,23,42,0.07)] p-6 sm:p-9 mb-6 border border-[#e2e8f0] animate-[fadeCard_0.25s_ease]">
            <div className="flex items-start gap-4 mb-8 pb-6 border-b border-[#f1f5f9]">
              <FileText size={28} className="text-[#007570] shrink-0 mt-1" />
              <div>
                <h2 className="text-[1.35rem] font-bold text-[#0f172a] mb-1">Ringkasan Pesanan</h2>
                <p className="text-[0.9rem] text-[#64748b]">Periksa rincian publikasi {contentType === "event" ? "Event" : "Blog"} dan gunakan kode promo jika ada.</p>
              </div>
            </div>

            {/* Order Detail Card */}
            <div className="bg-slate-50 border border-slate-200 rounded-2xl p-6 mb-6 space-y-3.5">
              <div className="flex justify-between items-center text-sm pb-3 border-b border-slate-200">
                <span className="text-slate-500 font-medium">Judul Konten</span>
                <span className="font-bold text-[#0f172a] max-w-[320px] truncate">{form.title}</span>
              </div>
              <div className="flex justify-between items-center text-sm pb-3 border-b border-slate-200">
                <span className="text-slate-500 font-medium">Tipe Konten</span>
                <span className="font-bold text-[#007570] uppercase">{contentType === "event" ? "Event / Agenda" : "Blog / Artikel"}</span>
              </div>
              <div className="flex justify-between items-center text-sm pb-3 border-b border-slate-200">
                <span className="text-slate-500 font-medium">Masa Aktif Publikasi</span>
                <span className="font-semibold text-slate-700">1 Tahun (365 Hari)</span>
              </div>
              <div className="flex justify-between items-center text-sm">
                <span className="text-slate-500 font-medium">Biaya Normal</span>
                <span className="font-extrabold text-[#0f172a]">
                  Rp {currentFee.toLocaleString("id-ID")}
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
                      <span className="text-xs text-emerald-600 font-medium">Diskon Rp {appliedCoupon.discount_amount?.toLocaleString("id-ID")}</span>
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

            {/* Total Pembayaran Calculation */}
            {(() => {
              const basePrice = currentFee;
              const couponDiscount = appliedCoupon ? Number(appliedCoupon.discount_amount || 0) : 0;
              const totalDiscount = couponDiscount;
              const finalCalculatedPrice = Math.max(0, basePrice - totalDiscount);

              return (
                <div className="bg-[#f0fffe] border border-[#007570]/30 rounded-2xl p-5 flex items-center justify-between mb-8 mt-6">
                  <div>
                    <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block">Total Tagihan Publikasi</span>
                    {totalDiscount > 0 && (
                      <span className="text-xs text-slate-400 line-through">
                        Rp {basePrice.toLocaleString("id-ID")}
                      </span>
                    )}
                  </div>
                  <div className="text-right">
                    <span className="text-2xl font-black text-[#007570]">
                      Rp {finalCalculatedPrice.toLocaleString("id-ID")}
                    </span>
                    {totalDiscount > 0 && (
                      <span className="text-[11px] font-bold text-emerald-600 block">
                        Hemat Rp {totalDiscount.toLocaleString("id-ID")}
                      </span>
                    )}
                  </div>
                </div>
              );
            })()}

            {/* Navigation Buttons (Step 2) */}
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => { setStep(1); window.scrollTo({ top: 0, behavior: "smooth" }); }}
                className="inline-flex items-center gap-2 px-7 py-3.5 rounded-[14px] text-[0.95rem] font-semibold cursor-pointer border-[1.5px] border-[#e2e8f0] bg-white text-[#374151] hover:bg-[#f8fafc] hover:border-[#94a3b8] transition-all"
              >
                <ChevronLeft size={18} /> Kembali ke Form
              </button>

              <div style={{ flex: 1 }} />

              <button
                type="button"
                onClick={() => { setStep(3); window.scrollTo({ top: 0, behavior: "smooth" }); }}
                className="inline-flex items-center gap-2 px-8 py-3.5 rounded-[14px] text-[0.95rem] font-bold cursor-pointer border-0 transition-all duration-[0.25s] bg-gradient-to-br from-[#007570] to-[#009990] text-white shadow-[0_4px_16px_rgba(0,117,112,0.3)] hover:-translate-y-0.5 hover:shadow-[0_8px_24px_rgba(0,117,112,0.4)]"
              >
                <span>Pilih Metode Pembayaran</span>
                <ChevronRight size={18} />
              </button>
            </div>
          </div>
        )}

        {/* ── STEP 3: PILIHAN METODE PEMBAYARAN ── */}
        {step === 3 && (
          <div className="bg-white rounded-[20px] shadow-[0_4px_24px_rgba(15,23,42,0.07)] p-6 sm:p-9 mb-6 border border-[#e2e8f0] animate-[fadeCard_0.25s_ease]">
            <div className="flex items-start gap-4 mb-8 pb-6 border-b border-[#f1f5f9]">
              <CreditCard size={28} className="text-[#007570] shrink-0 mt-1" />
              <div>
                <h2 className="text-[1.35rem] font-bold text-[#0f172a] mb-1">Pilihan Metode Pembayaran</h2>
                <p className="text-[0.9rem] text-[#64748b]">Pilih saluran transfer Bank atau E-Wallet yang kamu inginkan.</p>
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
                              {item.id.split(" ")[0]}
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
                Silakan lakukan transfer sesuai total tagihan ke nomor rekening / Virtual Account berikut:
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
                    navigator.clipboard.writeText(currentAccount.accountNumber.replace(/-/g, ""));
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

            {/* Navigation Buttons (Step 3) */}
            <div className="flex items-center gap-3 mt-8">
              <button
                type="button"
                onClick={() => { setStep(2); window.scrollTo({ top: 0, behavior: "smooth" }); }}
                className="inline-flex items-center gap-2 px-7 py-3.5 rounded-[14px] text-[0.95rem] font-semibold cursor-pointer border-[1.5px] border-[#e2e8f0] bg-white text-[#374151] hover:bg-[#f8fafc] hover:border-[#94a3b8] transition-all"
              >
                <ChevronLeft size={18} /> Kembali ke Ringkasan
              </button>

              <div style={{ flex: 1 }} />

              <button
                type="button"
                onClick={() => { setStep(4); window.scrollTo({ top: 0, behavior: "smooth" }); }}
                className="inline-flex items-center gap-2 px-8 py-3.5 rounded-[14px] text-[0.95rem] font-bold cursor-pointer border-0 transition-all duration-[0.25s] bg-gradient-to-br from-[#007570] to-[#009990] text-white shadow-[0_4px_16px_rgba(0,117,112,0.3)] hover:-translate-y-0.5 hover:shadow-[0_8px_24px_rgba(0,117,112,0.4)]"
              >
                <span>Lanjut Upload Bukti</span>
                <ChevronRight size={18} />
              </button>
            </div>
          </div>
        )}

        {/* ── STEP 4: UPLOAD BUKTI PEMBAYARAN ── */}
        {step === 4 && (() => {
          const isResubmit = isEditing && (form.status === "rejected" || createdBlogObj?.status === "rejected");
          const basePrice = currentFee;
          const couponDiscount = appliedCoupon ? Number(appliedCoupon.discount_amount || 0) : 0;
          const finalPaymentTotal = isResubmit ? 0 : Math.max(0, basePrice - couponDiscount);

          return (
            <div className="bg-white rounded-[20px] shadow-[0_4px_24px_rgba(15,23,42,0.07)] p-6 sm:p-9 mb-6 border border-[#e2e8f0] animate-[fadeCard_0.25s_ease]">
              <div className="flex items-start gap-4 mb-8 pb-6 border-b border-[#f1f5f9]">
                <Upload size={28} className="text-[#007570] shrink-0 mt-1" />
                <div>
                  <h2 className="text-[1.35rem] font-bold text-[#0f172a] mb-1">
                    {isResubmit ? "Upload Ulang Bukti Pembayaran (Revisi)" : "Upload Bukti Pembayaran"}
                  </h2>
                  <p className="text-[0.9rem] text-[#64748b]">
                    {isResubmit
                      ? "Unggah foto bukti transfer baru jika diminta admin, atau gunakan bukti transfer sebelumnya."
                      : "Unggah foto atau tangkapan layar bukti transfer kamu."}
                  </p>
                </div>
              </div>

              {/* Summary Badge */}
              <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 mb-6 flex flex-wrap items-center justify-between gap-3">
                <div>
                  <span className="text-xs text-slate-400 font-bold uppercase block">
                    {isResubmit ? "Status Biaya" : "Total Harus Dibayar"}
                  </span>
                  <span className="text-xl font-black text-[#007570]">
                    {isResubmit ? "Gratis Revisi (Rp 0)" : `Rp ${finalPaymentTotal.toLocaleString("id-ID")}`}
                  </span>
                  {isResubmit && (
                    <span className="text-[11px] text-emerald-600 font-bold block mt-0.5">
                      ✓ Pembayaran sudah tercatat sebelumnya
                    </span>
                  )}
                </div>
                <div className="text-right">
                  <span className="text-xs text-slate-400 font-bold uppercase block">Tipe Konten</span>
                  <span className="text-sm font-bold text-slate-800 uppercase">
                    {contentType === "event" ? "Event / Agenda" : "Blog / Artikel"}
                  </span>
                </div>
              </div>

              {/* Rejection Note Reminder if in resubmit mode */}
              {isResubmit && form.rejection_reason && (
                <div className="mb-6 p-4 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-800 space-y-1">
                  <span className="font-bold flex items-center gap-1.5 text-rose-900">
                    <AlertCircle size={15} className="text-rose-600" /> Catatan Penolakan Admin:
                  </span>
                  <p className="pl-5 leading-relaxed">{form.rejection_reason}</p>
                </div>
              )}

              {/* Upload & Preview Area */}
              {proofPreview ? (
                <div className="relative max-w-[340px] mx-auto rounded-2xl overflow-hidden border-2 border-[#007570] shadow-md bg-slate-900/5">
                  <div className="bg-[#007570] text-white text-[11px] font-bold px-3 py-1 text-center">
                    Foto Bukti Transfer Baru (Akan Diunggah)
                  </div>
                  <img src={proofPreview} alt="Bukti Pembayaran Baru" className="w-full h-auto max-h-[280px] object-contain bg-slate-900" />
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
                        Batal
                      </button>
                    </div>
                  </div>
                </div>
              ) : existingProof ? (
                <div className="space-y-3 max-w-[340px] mx-auto">
                  <div className="relative rounded-2xl overflow-hidden border border-slate-200 shadow-sm bg-slate-900/5">
                    <div className="bg-slate-700 text-white text-[11px] font-bold px-3 py-1 text-center">
                      Foto Bukti Transfer Sebelumnya
                    </div>
                    <img src={existingProof} alt="Bukti Pembayaran Sebelumnya" className="w-full h-auto max-h-[240px] object-contain bg-slate-900" />
                  </div>
                  <div className="text-center">
                    <input ref={proofInputRef} type="file" accept="image/*,application/pdf" hidden onChange={handleProofChange} />
                    <button
                      type="button"
                      onClick={() => proofInputRef.current?.click()}
                      className="px-4 py-2 text-xs font-bold text-[#007570] bg-teal-50 border border-teal-200 rounded-xl hover:bg-teal-100 transition-colors cursor-pointer inline-flex items-center gap-1.5"
                    >
                      <Upload size={14} /> Ganti dengan Bukti Baru
                    </button>
                    <p className="text-[11px] text-slate-400 mt-1">
                      Jika bukti lama sudah benar, Anda dapat langsung mengklik tombol Kirim di bawah.
                    </p>
                  </div>
                </div>
              ) : (
                <div
                  className="border-2 border-dashed border-slate-300 rounded-2xl p-10 text-center cursor-pointer bg-slate-50 hover:bg-[#f0fffe] hover:border-[#007570] transition-colors"
                  onClick={() => proofInputRef.current?.click()}
                >
                  <input ref={proofInputRef} type="file" accept="image/*,application/pdf" hidden onChange={handleProofChange} />
                  <Upload size={40} className="mx-auto text-slate-400 mb-3" />
                  <p className="text-base font-semibold text-slate-800 mb-1">Klik atau drag &amp; drop bukti transfer</p>
                  <p className="text-xs text-slate-400">Format JPG, PNG, WEBP, PDF max 10MB</p>
                </div>
              )}

              {/* Navigation Buttons (Step 4) */}
              <div className="flex items-center gap-3 mt-8">
                <button
                  type="button"
                  onClick={() => {
                    setStep(isResubmit ? 1 : 3);
                    window.scrollTo({ top: 0, behavior: "smooth" });
                  }}
                  disabled={submitting}
                  className="inline-flex items-center gap-2 px-7 py-3.5 rounded-[14px] text-[0.95rem] font-semibold cursor-pointer border-[1.5px] border-[#e2e8f0] bg-white text-[#374151] hover:bg-[#f8fafc] hover:border-[#94a3b8] transition-all"
                >
                  <ChevronLeft size={18} /> Kembali ke {isResubmit ? "Form Konten" : "Pembayaran"}
                </button>

                <div style={{ flex: 1 }} />

                <button
                  type="button"
                  onClick={handleFinalCheckout}
                  disabled={submitting}
                  className="inline-flex items-center gap-2 px-8 py-3.5 rounded-[14px] text-[0.95rem] font-bold cursor-pointer border-0 transition-all duration-[0.25s] bg-gradient-to-br from-[#007570] to-[#009990] text-white shadow-[0_4px_16px_rgba(0,117,112,0.3)] hover:-translate-y-0.5 hover:shadow-[0_8px_24px_rgba(0,117,112,0.4)] disabled:opacity-70 disabled:cursor-not-allowed"
                >
                  {submitting ? (
                    <><Loader2 size={18} className={spinCls} /> Memproses...</>
                  ) : (
                    <>
                      <Check size={18} />
                      <span>{isResubmit ? "Kirim Pengajuan Ulang & Bukti Pembayaran" : "Konfirmasi & Kirim Bukti"}</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          );
        })()}

      </div>
    </div>
  );
}
