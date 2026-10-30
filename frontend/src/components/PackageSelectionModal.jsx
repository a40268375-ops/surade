import { useState, useEffect } from "react";
import api from "../services/api";
import { Check, Crown, Zap, X, Calendar, BookOpen, Sparkles, AlertCircle } from "lucide-react";
import "./PackageSelectionModal.css";

export default function PackageSelectionModal({
  isOpen,
  onClose,
  initialType = "blog",
  onSelectPackage,
  activeSubscriptions = null,
}) {
  const [activeType, setActiveType] = useState(initialType);
  const [packages, setPackages] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (isOpen) {
      setActiveType(initialType);
      fetchPackages();
    }
  }, [isOpen, initialType]);

  const fetchPackages = async () => {
    setLoading(true);
    try {
      const res = await api.get("/packages");
      const data = res.data?.data || res.data || [];
      setPackages(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Failed to fetch packages:", err);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  const filteredPackages = packages.filter((p) => p.type === activeType);

  // Check if user has active package of this type
  const currentSub = activeType === "blog"
    ? activeSubscriptions?.active_blog
    : activeSubscriptions?.active_event;

  return (
    <div className="pkg-modal-backdrop" onClick={onClose}>
      <div className="pkg-modal-card" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="pkg-modal-header">
          <button type="button" className="pkg-modal-close" onClick={onClose} aria-label="Tutup">
            <X size={18} />
          </button>
          <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "0.35rem" }}>
            <Sparkles size={20} color="#fbbf24" />
            <span style={{ fontSize: "0.8125rem", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.05em", color: "#93c5fd" }}>
              Paket Konten Surade.com
            </span>
          </div>
          <h2 style={{ fontSize: "1.375rem", fontWeight: 800, margin: 0, lineHeight: 1.2 }}>
            Pilih Paket Publikasi Blog &amp; Event
          </h2>
          <p style={{ fontSize: "0.875rem", opacity: 0.9, marginTop: "0.35rem", marginBottom: 0, lineHeight: 1.4 }}>
            Publikasikan artikel wawasan dan agenda kegiatan bisnis Anda untuk menjangkau ribuan pembaca terverifikasi.
          </p>
        </div>

        {/* Body */}
        <div className="pkg-modal-body">
          {/* Tabs */}
          <div className="pkg-type-tabs">
            <button
              type="button"
              className={`pkg-type-tab ${activeType === "blog" ? "active" : ""}`}
              onClick={() => setActiveType("blog")}
            >
              <BookOpen size={16} />
              Paket Blog &amp; Artikel
            </button>
            <button
              type="button"
              className={`pkg-type-tab ${activeType === "event" ? "active" : ""}`}
              onClick={() => setActiveType("event")}
            >
              <Calendar size={16} />
              Paket Agenda Event
            </button>
          </div>

          {/* Active Subscription Warning/Info if any */}
          {currentSub && (
            <div style={{
              background: "#ecfdf5",
              border: "1px solid #a7f3d0",
              borderRadius: "0.75rem",
              padding: "0.75rem 1rem",
              marginBottom: "1.25rem",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              gap: "0.75rem",
              flexWrap: "wrap",
            }}>
              <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                <Check size={18} color="#059669" />
                <span style={{ fontSize: "0.8125rem", color: "#065f46", fontWeight: 600 }}>
                  Paket aktif saat ini: <strong>{currentSub.package?.name || "Paket Aktif"}</strong> (Sisa {currentSub.remaining_posts} posting, {currentSub.days_remaining} hari lagi).
                </span>
              </div>
              <span style={{ fontSize: "0.75rem", color: "#047857" }}>
                Membeli paket baru akan menambah kuota &amp; memperpanjang masa aktif.
              </span>
            </div>
          )}

          {/* Loading */}
          {loading ? (
            <div style={{ padding: "3rem 1rem", textAlign: "center", color: "#64748b" }}>
              <div style={{
                width: "2rem",
                height: "2rem",
                border: "3px solid #e2e8f0",
                borderTopColor: "#0b4f8a",
                borderRadius: "50%",
                animation: "spin 0.8s linear infinite",
                margin: "0 auto 1rem",
              }} />
              Memuat pilihan paket...
            </div>
          ) : filteredPackages.length === 0 ? (
            <div style={{ padding: "3rem 1rem", textAlign: "center", color: "#64748b" }}>
              <AlertCircle size={32} style={{ margin: "0 auto 0.75rem", opacity: 0.5 }} />
              Belum ada paket aktif untuk kategori ini.
            </div>
          ) : (
            <div className="pkg-grid">
              {filteredPackages.map((pkg) => {
                const features = Array.isArray(pkg.features)
                  ? pkg.features
                  : (typeof pkg.features === "string" ? JSON.parse(pkg.features || "[]") : []);

                return (
                  <div key={pkg.id} className={`pkg-card ${pkg.is_popular ? "popular" : ""}`}>
                    {pkg.is_popular && (
                      <span className="pkg-popular-badge">
                        Paling Populer
                      </span>
                    )}

                    <h3 className="pkg-card-title">{pkg.name}</h3>
                    <p className="pkg-card-desc">{pkg.description || `Paket publikasi ${pkg.type} berkualitas di Surade.com.`}</p>

                    <div className="pkg-card-price-box">
                      <span className="pkg-card-price">{pkg.formatted_price || `Rp ${Number(pkg.price).toLocaleString("id-ID")}`}</span>
                      <span className="pkg-card-duration">/ {pkg.duration_days} Hari</span>
                    </div>

                    <div className="pkg-limit-badge">
                      <Zap size={14} />
                      <span>Limit: {pkg.post_limit} {pkg.type === "event" ? "Event" : "Blog"}</span>
                    </div>

                    <ul className="pkg-features-list">
                      {features.map((feat, idx) => (
                        <li key={idx} className="pkg-feature-item">
                          <Check size={16} className="pkg-feature-icon" />
                          <span>{feat}</span>
                        </li>
                      ))}
                    </ul>

                    <button
                      type="button"
                      className="pkg-btn-buy"
                      onClick={() => onSelectPackage(pkg)}
                    >
                      <span>Beli Paket</span>
                    </button>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
