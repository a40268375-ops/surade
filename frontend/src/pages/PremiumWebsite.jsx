import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import api from "../utils/api";
import Navbar from "../components/Navbar";
import SuradeLoader from "../components/SuradeLoader";
import { 
  Check, 
  Star, 
  Crown, 
  ArrowRight, 
  Globe, 
  Smartphone, 
  Search,
  Shield,
  Zap,
  Users
} from "lucide-react";
import "./PremiumWebsite.css";

export default function PremiumWebsite() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [packages, setPackages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedPackage, setSelectedPackage] = useState(null);

  useEffect(() => {
    document.title = "Layanan Buat Website - Surade.com";
    loadPackages();
  }, []);

  const loadPackages = async () => {
    try {
      const data = await api.get("/premium-packages");
      setPackages(data);
    } catch (err) {
      console.error("Failed to load packages:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleOrderPackage = (pkg) => {
    if (!user) {
      navigate("/login?redirect=/premium-website");
      return;
    }
    
    // Navigate to order form
    navigate(`/order-website/${pkg.id}`);
  };

  const formatRupiah = (n) => "Rp" + Number(n || 0).toLocaleString("id-ID");

  return (
    <div className="premium-website-page">
      <Navbar />
      
      {/* Hero Section */}
      <section className="premium-hero">
        <div className="premium-hero__content">
          <div className="premium-hero__text">
            <h1 className="premium-hero__title">
              Website Premium untuk Bisnis Anda
            </h1>
            <p className="premium-hero__subtitle">
              Tingkatkan kehadiran online bisnis Anda dengan website profesional yang responsive dan SEO-optimized
            </p>
            <div className="premium-hero__features">
              <div className="premium-hero__feature">
                <Globe size={20} />
                <span>Responsive Design</span>
              </div>
              <div className="premium-hero__feature">
                <Search size={20} />
                <span>SEO Optimized</span>
              </div>
              <div className="premium-hero__feature">
                <Smartphone size={20} />
                <span>Mobile Friendly</span>
              </div>
            </div>
          </div>
          <div className="premium-hero__image">
            <img 
              src="https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=600&h=400&fit=crop" 
              alt="Website Design" 
            />
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="premium-benefits">
        <div className="premium-benefits__inner">
          <h2 className="premium-benefits__title">Mengapa Memilih Website Premium Kami?</h2>
          <div className="premium-benefits__grid">
            <div className="benefit-card">
              <div className="benefit-card__icon">
                <Zap size={32} />
              </div>
              <h3>Loading Cepat</h3>
              <p>Website dioptimalkan untuk kecepatan loading maksimal dan performa terbaik</p>
            </div>
            <div className="benefit-card">
              <div className="benefit-card__icon">
                <Shield size={32} />
              </div>
              <h3>Keamanan Terjamin</h3>
              <p>SSL Certificate, backup otomatis, dan perlindungan dari serangan cyber</p>
            </div>
            <div className="benefit-card">
              <div className="benefit-card__icon">
                <Users size={32} />
              </div>
              <h3>Support 24/7</h3>
              <p>Tim support profesional siap membantu Anda kapan saja dibutuhkan</p>
            </div>
          </div>
        </div>
      </section>

      {/* Packages Section */}
      <section className="premium-packages">
        <div className="premium-packages__inner">
          <h2 className="premium-packages__title">Pilih Paket yang Tepat untuk Anda</h2>
          
          {loading ? (
            <SuradeLoader
              variant="section"
              size="md"
              text="Memuat pilihan paket website"
              subtext="Menyiapkan penawaran paket pembuatan website profesional"
              minHeight="220px"
            />
          ) : packages.length > 0 ? (
            <div className="packages-grid">
              {packages.map((pkg, index) => (
                <div key={pkg.id} className={`package-card ${index === 1 ? 'popular' : ''}`}>
                  {index === 1 && (
                    <div className="package-card__popular-badge">
                      <Star size={14} />
                      Paling Populer
                    </div>
                  )}
                  
                  <div className="package-card__header">
                    <h3 className="package-card__name">{pkg.name}</h3>
                    <div className="package-card__price">
                      <span className="package-card__amount">{formatRupiah(pkg.price)}</span>
                      <span className="package-card__period">/{pkg.duration} hari pengerjaan</span>
                    </div>
                    <p className="package-card__description">{pkg.description}</p>
                  </div>

                  <div className="package-card__features">
                    {(pkg.features || []).map((feature, idx) => (
                      <div key={idx} className="package-feature">
                        <Check size={16} className="package-feature__icon" />
                        <span>{feature}</span>
                      </div>
                    ))}
                  </div>

                  <button 
                    className={`package-card__button ${index === 1 ? 'primary' : 'secondary'}`}
                    onClick={() => handleOrderPackage(pkg)}
                  >
                    Pesan Sekarang
                    <ArrowRight size={16} />
                  </button>
                </div>
              ))}
            </div>
          ) : (
            <div className="premium-empty">
              <p>Belum ada paket tersedia. Silakan kembali lagi nanti.</p>
            </div>
          )}
        </div>
      </section>

      {/* CTA Section */}
      <section className="premium-cta">
        <div className="premium-cta__content">
          <h2>Siap Memulai Project Website Anda?</h2>
          <p>Konsultasi gratis dengan tim ahli kami untuk mendiskusikan kebutuhan website bisnis Anda</p>
          <div className="premium-cta__buttons">
            <Link to="/contact" className="premium-cta__btn premium-cta__btn--secondary">
              Konsultasi Gratis
            </Link>
            <Link to="#packages" className="premium-cta__btn premium-cta__btn--primary">
              Lihat Paket
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}