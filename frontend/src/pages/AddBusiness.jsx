import { useState, useEffect, useRef } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import Navbar from "../components/Navbar";
import SubCategorySelector from "../components/SubCategorySelector";
import api from "../services/api";
import {
  Store, MapPin, ImageIcon, Video, Tag, Phone, Mail,
  Globe, Camera, ChevronRight, ChevronLeft,
  X, Plus, Upload, Check, AlertCircle, Loader2, Search, Trash2
} from "lucide-react";
import { MapContainer, TileLayer, Marker, useMapEvents } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import markerIcon2x from "leaflet/dist/images/marker-icon-2x.png";
import markerIcon from "leaflet/dist/images/marker-icon.png";
import markerShadow from "leaflet/dist/images/marker-shadow.png";
import "./AddBusiness.css";

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: markerIcon2x,
  iconUrl: markerIcon,
  shadowUrl: markerShadow,
});

const STEPS = [
  { id: 1, label: "Info Dasar", icon: <Store size={18} /> },
  { id: 2, label: "Banner", icon: <ImageIcon size={18} /> },
  { id: 3, label: "Lokasi", icon: <MapPin size={18} /> },
  { id: 4, label: "Galeri", icon: <Video size={18} /> },
];

const DAYS = ["Senin", "Selasa", "Rabu", "Kamis", "Jumat", "Sabtu", "Minggu"];

/** Generate time options for dropdown: 00:00, 00:30, 01:00, ... 23:30 */
const TIME_OPTIONS = [];
for (let h = 0; h < 24; h++) {
  for (let m = 0; m < 60; m += 30) {
    TIME_OPTIONS.push(String(h).padStart(2, '0') + ':' + String(m).padStart(2, '0'));
  }
}

/** Helper: parse "HH:MM" to total minutes */
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

export default function AddBusiness() {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEditing = !!id;
  const [step, setStep] = useState(1);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [categoriesLoading, setCategoriesLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [createdId, setCreatedId] = useState(null);
  const [deleting, setDeleting] = useState(false);

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
  const [gallery, setGallery] = useState([]);
  const galleryInputRef = useRef();

  // Logo / Thumbnail
  const [logo, setLogo] = useState(null);
  const [logoPreview, setLogoPreview] = useState(null);
  const logoInputRef = useRef();

  // ── Opening Days State ──
  const [openingDays, setOpeningDays] = useState(
    DAYS.map((day) => ({ day, open: "08:00", close: "17:00", selected: true }))
  );

  const handleDayToggle = (index) => {
    setOpeningDays((prev) =>
      prev.map((d, i) => {
        if (i === index) {
          if (!d.selected) {
            // When enabling, reset to default times
            return { ...d, selected: true, open: "09:00", close: "17:00" };
          } else {
            // When disabling, clear times
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
          // Validate: close time should not be less than open time
          if (field === 'close' && updated.open && value) {
            const openMinutes = parseTimeToMinutes(updated.open);
            const closeMinutes = parseTimeToMinutes(value);
            if (closeMinutes < openMinutes) {
              // Don't update if invalid
              return d;
            }
          }
          return updated;
        }
        return d;
      })
    );
  };

  const parseTimeToMinutes = (timeStr) => {
    if (!timeStr) return 0;
    const [hours, minutes] = timeStr.split(':').map(Number);
    return hours * 60 + minutes;
  };

  const getOpeningDaysSummary = () => {
    const active = openingDays.filter((d) => d.selected);
    if (active.length === 0) return "Tidak ada";
    if (active.length === 7) return "Setiap hari";
    return active.map((d) => d.day).join(", ");
  };

  useEffect(() => {
    setCategoriesLoading(true);
    fetch(`${import.meta.env.VITE_API_URL}/categories`)
      .then((r) => r.json())
      .then((d) => { if (Array.isArray(d)) setCategories(d); })
      .catch(console.error)
      .finally(() => setCategoriesLoading(false));
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

            // Load category selection for editing
            if (data.category_id && categories.length > 0) {
              // Find subcategory
              let subCategory = null;
              let mainCategory = null;

              // Search in children of all main categories
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

              // Also check if category_id is a main category (backward compatibility)
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

  // ── Logo ──
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

  const handleGalleryAdd = (files) => {
    Array.from(files).forEach((file) => {
      const isVideo = file.type.startsWith("video/");
      setGallery((p) => [...p, {
        file,
        preview: isVideo ? null : URL.createObjectURL(file),
        type: isVideo ? "video" : "image"
      }]);
    });
  };

  const removeGallery = (i) => {
    setGallery((p) => {
      if (p[i].preview) URL.revokeObjectURL(p[i].preview);
      return p.filter((_, idx) => idx !== i);
    });
  };

  const validateStep = () => {
    if (step === 1) {
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
    }
    if (step === 3) {
      if (!address.trim()) return "Alamat wajib diisi.";
    }
    return null;
  };

  const nextStep = () => {
    const err = validateStep();
    if (err) { setError(err); setTimeout(() => setError(""), 3500); return; }
    setError("");
    setStep((s) => Math.min(s + 1, 4));
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const prevStep = () => {
    setError("");
    setStep((s) => Math.max(s - 1, 1));
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleSubmit = async () => {
    setLoading(true);
    setError("");
    try {
      // Build opening_days array from state
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
        // Update existing business
        const bizRes = await api.put(`/businesses/${id}`, payload);
        bizId = id;
      } else {
        // Create new business
        const bizRes = await api.post("/businesses", payload);
        bizId = bizRes.data?.data?.id;
        if (!bizId) throw new Error("ID bisnis tidak ditemukan.");
      }

      // Upload logo if exists
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
      if (gallery.length > 0) {
        const fd = new FormData();
        gallery.forEach(({ file }) => fd.append("files[]", file));
        await api.post(`/businesses/${bizId}/gallery`, fd);
      }
      setCreatedId(bizId);
      setSuccess(true);
    } catch (e) {
      const msg = e?.response?.data?.message ||
        (e?.response?.data?.errors ? Object.values(e.response.data.errors).flat().join(", ") : e.message) ||
        "Terjadi kesalahan.";
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

  // ── SUCCESS SCREEN ──
  if (success) {
    return (
      <div className="add-biz-page">
        <Navbar />
        <div className="add-biz-success">
          <div className="add-biz-success__icon"><Check size={48} /></div>
          <h1>{isEditing ? "Usaha Berhasil Diperbarui!" : "Usaha Berhasil Didaftarkan!"}</h1>
          <p>{isEditing ? "Perubahan pada usaha kamu telah disimpan." : "Usaha kamu sedang dalam proses review oleh tim kami."}</p>
          <div className="add-biz-success__actions">
            <Link to={"/business/" + createdId} className="btn-primary">Lihat Halaman Usaha</Link>
            <Link to="/admin-user" className="btn-outline">Ke Dashboard Admin</Link>
            <Link to="/" className="btn-outline">Kembali ke Beranda</Link>
          </div>
        </div>
      </div>
    );
  }

  // ── MAIN FORM ──
  return (
    <div className="add-biz-page">
      <Navbar />

      {/* HERO */}
      <div className="add-biz-hero">
        <div className="add-biz-hero__inner">
          <h1 className="add-biz-hero__title">{isEditing ? "Edit Usaha Kamu" : "Daftarkan Usaha Kamu"}</h1>
          <p className="add-biz-hero__sub">{isEditing ? "Perbarui informasi usaha kamu" : "Jangkau lebih banyak pelanggan di seluruh Indonesia"}</p>
        </div>
      </div>

      {/* BODY */}
      <div className="add-biz-body">
        {/* STEP INDICATOR */}
        <div className="add-biz-steps">
          {STEPS.map((s, i) => (
            <div key={s.id} className="add-biz-steps__item">
              <div className={"add-biz-step " + (step === s.id ? "active" : "") + " " + (step > s.id ? "done" : "")}>
                <div className="add-biz-step__circle">
                  {step > s.id ? <Check size={16} /> : s.icon}
                </div>
                <span className="add-biz-step__label">{s.label}</span>
              </div>
              {i < STEPS.length - 1 && <div className={"add-biz-steps__line " + (step > s.id ? "done" : "")} />}
            </div>
          ))}
        </div>

        {/* ERROR MESSAGE */}
        {error && (
          <div className="add-biz-error">
            <AlertCircle size={18} />
            <span>{error}</span>
          </div>
        )}

        {/* ── STEP 1: INFO DASAR ── */}
        {step === 1 && (
          <div className="add-biz-card">
            <div className="add-biz-card__header">
              <Store size={24} className="add-biz-card__icon" />
              <div>
                <h2>Informasi Dasar</h2>
                <p>Isi data utama tentang usaha kamu</p>
              </div>
            </div>
            <div className="add-biz-form">
              <div className="form-row">
                <div className="form-group form-group--full">
                  <label>Nama Usaha <span>*</span></label>
                  <input name="name" type="text" placeholder="Warung Makan Sederhana" value={form.name} onChange={handleFormChange} className="form-input" />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group form-group--full">
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

              <div className="form-row">
                <div className="form-group form-group--full">
                  <label>Hari &amp; Jam Buka</label>
                  <div className="opening-days-picker">
                    {openingDays.map((d, i) => (
                      <div key={d.day} className="opening-day-row">
                        <label className="opening-day-check">
                          <input
                            type="checkbox"
                            checked={d.selected}
                            onChange={() => handleDayToggle(i)}
                          />
                          <span className="opening-day-label">{d.day}</span>
                        </label>
                        {d.selected && (
                          <div className="opening-day-times">
                            <select
                              className="opening-time-select"
                              value={d.open}
                              onChange={(e) => handleDayTimeChange(i, 'open', e.target.value)}
                            >
                              {TIME_OPTIONS.map((t) => (
                                <option key={t} value={t}>{t}</option>
                              ))}
                            </select>
                            <span className="opening-time-sep">s/d</span>
                            <select
                              className="opening-time-select"
                              value={d.close}
                              onChange={(e) => handleDayTimeChange(i, 'close', e.target.value)}
                            >
                              {TIME_OPTIONS.map((t) => (
                                <option key={t} value={t}>{t}</option>
                              ))}
                            </select>
                          </div>
                        )}
                        {!d.selected && <span className="opening-day-closed">Tutup</span>}
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Kota <span>*</span></label>
                  <input name="city" type="text" placeholder="Jakarta" value={form.city} onChange={handleFormChange} className="form-input" />
                </div>
                <div className="form-group">
                  <label>Provinsi <span>*</span></label>
                  <input name="province" type="text" placeholder="DKI Jakarta" value={form.province} onChange={handleFormChange} className="form-input" />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group form-group--full">
                  <label>Deskripsi <span>*</span></label>
                  <textarea name="description" rows={4} placeholder="Ceritakan tentang usaha kamu..." value={form.description} onChange={handleFormChange} className="form-input form-textarea" />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group form-group--full">
                  <label>Tags</label>
                  <div className="form-tags-input">
                    <Tag size={16} className="form-tags-icon" />
                    <input type="text" placeholder="Tambah tag" value={tagInput} onChange={(e) => setTagInput(e.target.value)} onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); addTag(); } }} className="form-tags-field" />
                    <button type="button" onClick={addTag} className="form-tags-add"><Plus size={16} /></button>
                  </div>
                  <div className="form-tags-list">
                    {tags.map((t) => (
                      <span key={t} className="form-tag">
                        {t}
                        <button type="button" onClick={() => removeTag(t)}><X size={12} /></button>
                      </span>
                    ))}
                    {tags.length === 0 && <span className="form-tags-hint">Belum ada tag</span>}
                  </div>
                </div>
              </div>

              <div className="form-divider"><span>Kontak</span></div>

              <div className="form-row">
                <div className="form-group">
                  <label><Phone size={14} /> Telepon <span>*</span></label>
                  <input name="phone" type="tel" placeholder="+62 812 3456 7890" value={form.phone} onChange={handleFormChange} className="form-input" />
                </div>
                <div className="form-group">
                  <label><Phone size={14} /> WhatsApp</label>
                  <input name="whatsapp" type="tel" placeholder="+62 812 3456 7890" value={form.whatsapp} onChange={handleFormChange} className="form-input" />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label><Mail size={14} /> Email</label>
                  <input name="email" type="email" placeholder="usaha@email.com" value={form.email} onChange={handleFormChange} className="form-input" />
                </div>
                <div className="form-group">
                  <label><Globe size={14} /> Website</label>
                  <input name="website" type="url" placeholder="https://usaha.com" value={form.website} onChange={handleFormChange} className="form-input" />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label><Camera size={14} /> Instagram</label>
                  <input name="instagram" type="text" placeholder="@usahakamu" value={form.instagram} onChange={handleFormChange} className="form-input" />
                </div>
                <div className="form-group">
                  <label><Camera size={14} /> Facebook</label>
                  <input name="facebook" type="text" placeholder="Facebook page" value={form.facebook} onChange={handleFormChange} className="form-input" />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ── STEP 2: THUMBNAIL & BANNER ── */}
        {step === 2 && (
          <div className="add-biz-card">
            <div className="add-biz-card__header">
              <ImageIcon size={24} className="add-biz-card__icon" />
              <div>
                <h2>Thumbnail &amp; Banner / Foto Utama</h2>
                <p>Upload thumbnail (gambar utama) dan foto banner (maks. 4 foto)</p>
              </div>
            </div>

            {/* ═══ THUMBNAIL / LOGO (Bagian Paling Atas) ═══ */}
            <div className="add-biz-thumbnail-section">
              <div className="add-biz-thumbnail-section__header">
                <Camera size={20} className="add-biz-thumbnail-section__icon" />
                <div>
                  <h3 className="add-biz-thumbnail-section__title">Thumbnail / Logo Usaha</h3>
                  <p className="add-biz-thumbnail-section__desc">Gambar ini akan tampil sebagai foto utama di halaman pencarian</p>
                </div>
              </div>
              {logoPreview ? (
                <div className="thumbnail-preview-wrapper">
                  <img src={logoPreview} alt="Logo" className="thumbnail-preview" />
                  <button type="button" className="thumbnail-remove" onClick={removeLogo}><X size={16} /></button>
                </div>
              ) : (
                <div className="upload-zone upload-zone--thumbnail" onClick={() => logoInputRef.current?.click()}>
                  <input ref={logoInputRef} type="file" accept="image/*" hidden onChange={handleLogoChange} />
                  <div className="upload-zone__thumbnail-icon">
                    <Camera size={36} />
                  </div>
                  <p className="upload-zone__text">Klik untuk upload thumbnail</p>
                  <p className="upload-zone__hint">Rekomendasi: 1:1 ratio, JPG/PNG/WEBP max 4MB</p>
                </div>
              )}
            </div>

            {/* ═══ BANNER (Di Bawah Thumbnail) ═══ */}
            <div className="add-biz-banner-section">
              <div className="add-biz-banner-section__header">
                <ImageIcon size={20} className="add-biz-banner-section__icon" />
                <div>
                  <h3 className="add-biz-banner-section__title">Banner / Foto Latar</h3>
                  <p className="add-biz-banner-section__desc">Upload beberapa foto banner untuk tampilan halaman usaha (maks. 4 foto)</p>
                </div>
              </div>
              <div className={"upload-zone " + (banners.length >= 4 ? "upload-zone--disabled" : "")}
                {...createDropHandler(handleBannerAdd)}
                onClick={() => banners.length < 4 && bannerInputRef.current?.click()}>
                <input ref={bannerInputRef} type="file" accept="image/*" multiple hidden onChange={(e) => handleBannerAdd(e.target.files)} />
                <Upload size={40} className="upload-zone__icon" />
                <p className="upload-zone__text">{banners.length >= 4 ? "Batas maksimum 4 foto" : "Klik atau drag & drop foto banner"}</p>
                <p className="upload-zone__hint">{banners.length}/4 foto</p>
              </div>
              {banners.length > 0 && (
                <div className="banner-grid">
                  {banners.map((b, i) => (
                    <div key={i} className="banner-item">
                      <img src={b.preview} alt="" className="banner-item__img" />
                      <div className="banner-item__overlay">
                        <button type="button" onClick={() => removeBanner(i)} className="banner-item__remove"><X size={16} /></button>
                        <span className="banner-item__badge">Banner {i + 1}</span>
                      </div>
                    </div>
                  ))}
                  {banners.length < 4 && (
                    <button type="button" className="banner-add-more" onClick={() => bannerInputRef.current?.click()}>
                      <Plus size={28} /><span>Tambah</span>
                    </button>
                  )}
                </div>
              )}
            </div>
          </div>
        )}

        {/* ── STEP 3: LOKASI ── */}
        {step === 3 && (
          <div className="add-biz-card">
            <div className="add-biz-card__header">
              <MapPin size={24} className="add-biz-card__icon" />
              <div>
                <h2>Lokasi Usaha</h2>
                <p>Masukkan alamat, lalu cari atau klik di peta</p>
              </div>
            </div>
            <div className="form-group form-group--full">
              <label>Alamat Lengkap <span>*</span></label>
              <div className="geocode-row">
                <input type="text" placeholder="Jl. Contoh No. 123, Kota, Provinsi" value={address} onChange={(e) => setAddress(e.target.value)} onKeyDown={(e) => e.key === "Enter" && geocodeAddress()} className="form-input geocode-input" />
                <button type="button" onClick={geocodeAddress} disabled={geocoding} className="btn-geocode">
                  {geocoding ? <Loader2 size={18} className="spin" /> : <Search size={18} />}
                  <span>{geocoding ? "Mencari..." : "Cari"}</span>
                </button>
              </div>
              <p className="geocode-hint"><MapPin size={13} />{coords ? "Koordinat: " + coords.lat.toFixed(6) + ", " + coords.lng.toFixed(6) : "Belum ada koordinat"}</p>
            </div>
            <div className="map-wrapper" style={{ isolation: "isolate", position: "relative", zIndex: 0 }}>
              <MapContainer key={mapKey} center={coords ? [coords.lat, coords.lng] : DEFAULT_CENTER} zoom={coords ? 15 : 6} style={{ height: "420px", width: "100%", position: "relative", zIndex: 0 }} scrollWheelZoom>
                <TileLayer attribution="&copy; OpenStreetMap" url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                <MapClickHandler onMapClick={(latlng) => setCoords({ lat: latlng.lat, lng: latlng.lng })} />
                {coords && <Marker position={[coords.lat, coords.lng]} />}
              </MapContainer>
              <p className="map-hint"><MapPin size={13} /> Klik di peta untuk menentukan koordinat</p>
            </div>
          </div>
        )}

        {/* ── STEP 4: GALERI ── */}
        {step === 4 && (
          <div className="add-biz-card">
            <div className="add-biz-card__header">
              <Video size={24} className="add-biz-card__icon" />
              <div>
                <h2>Galeri Foto & Video</h2>
                <p>Upload foto dan video tambahan</p>
              </div>
            </div>
            <div className="upload-zone" {...createDropHandler(handleGalleryAdd)} onClick={() => galleryInputRef.current?.click()}>
              <input ref={galleryInputRef} type="file" accept="image/*,video/mp4,video/webm,video/quicktime" multiple hidden onChange={(e) => handleGalleryAdd(e.target.files)} />
              <Upload size={40} className="upload-zone__icon" />
              <p className="upload-zone__text">Klik atau drag & drop foto/video</p>
              <p className="upload-zone__hint">Gambar: JPG, PNG | Video: MP4, WEBM, MOV | maks. 20MB</p>
            </div>
            {gallery.length > 0 && (
              <div className="gallery-grid">
                {gallery.map((g, i) => (
                  <div key={i} className={"gallery-item " + (g.type === "video" ? "gallery-item--video" : "")}>
                    {g.type === "image" ? (
                      <img src={g.preview} alt="" className="gallery-item__media" />
                    ) : (
                      <div className="gallery-item__video-thumb"><Video size={36} /><span>{g.file.name}</span></div>
                    )}
                    <div className="gallery-item__overlay">
                      <button type="button" onClick={() => removeGallery(i)} className="gallery-item__remove"><X size={16} /></button>
                      <span className="gallery-item__type-badge">{g.type === "video" ? "VIDEO" : "FOTO"}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
            {gallery.length === 0 && <p className="gallery-empty">Belum ada file diunggah</p>}

            {/* SUBMIT SUMMARY */}
            <div className="submit-summary">
              <h3>Ringkasan Pendaftaran</h3>
              <div className="summary-grid">
                <div className="summary-item"><span className="summary-label">Nama Usaha</span><span className="summary-value">{form.name || "-"}</span></div>
                <div className="summary-item"><span className="summary-label">Kategori</span><span className="summary-value">{categories.find((c) => String(c.id) === String(form.category_id))?.name || "-"}</span></div>
                <div className="summary-item"><span className="summary-label">Kota</span><span className="summary-value">{form.city || "-"}</span></div>
                <div className="summary-item"><span className="summary-label">Hari Buka</span><span className="summary-value">{getOpeningDaysSummary()}</span></div>
                <div className="summary-item"><span className="summary-label">Thumbnail</span><span className="summary-value">{logo ? "Ada" : "Belum"}</span></div>
                <div className="summary-item"><span className="summary-label">Banner</span><span className="summary-value">{banners.length} foto</span></div>
                <div className="summary-item"><span className="summary-label">Galeri</span><span className="summary-value">{gallery.length} file</span></div>
                <div className="summary-item"><span className="summary-label">Koordinat</span><span className="summary-value">{coords ? coords.lat.toFixed(4) + ", " + coords.lng.toFixed(4) : "Belum"}</span></div>
                <div className="summary-item"><span className="summary-label">Tags</span><span className="summary-value">{tags.join(", ") || "-"}</span></div>
              </div>
            </div>
          </div>
        )}

        {/* ── NAVIGATION BUTTONS ── */}
        <div className="add-biz-nav">
          {step > 1 && (
            <button type="button" onClick={prevStep} className="btn-nav btn-back">
              <ChevronLeft size={18} /> Kembali
            </button>
          )}
          <div style={{ flex: 1 }} />
          {isEditing && (
            <button type="button" onClick={handleDelete} disabled={deleting} className="btn-nav btn-delete">
              {deleting ? <><Loader2 size={18} className="spin" /> Menghapus...</> : <><Trash2 size={18} /> Hapus Usaha</>}
            </button>
          )}
          {step < 4 ? (
            <button type="button" onClick={nextStep} className="btn-nav btn-next">
              Selanjutnya <ChevronRight size={18} />
            </button>
          ) : (
            <button type="button" onClick={handleSubmit} disabled={loading} className="btn-nav btn-submit">
              {loading ? <><Loader2 size={18} className="spin" /> {isEditing ? "Menyimpan..." : "Mendaftarkan..."}</> : <><Check size={18} /> {isEditing ? "Simpan Perubahan" : "Daftarkan Usaha"}</>}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

