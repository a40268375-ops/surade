import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import api from "../utils/api";
import PaymentGateway from "../components/PaymentGateway";
import Loading from "../components/Loading";
import { ArrowLeft, Building2, Crown, CheckCircle, XCircle } from "lucide-react";
import "./PremiumUpgrade.css";

export default function PremiumUpgrade() {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  
  const [loading, setLoading] = useState(true);
  const [myBusinesses, setMyBusinesses] = useState([]);
  const [selectedBusiness, setSelectedBusiness] = useState(null);
  const [selectedPlan, setSelectedPlan] = useState("monthly");
  const [showPaymentGateway, setShowPaymentGateway] = useState(false);

  // Get business ID from URL params if provided
  const businessId = searchParams.get("business");

  // Plan definitions
  const plans = {
    monthly: { label: '1 Bulan Premium', amount: 49000, days: 30 },
    quarterly: { label: '3 Bulan Premium', amount: 129000, days: 90 },
    yearly: { label: '12 Bulan Premium', amount: 449000, days: 365 },
  };

  useEffect(() => {
    if (authLoading) return;
    if (!user) {
      navigate("/login");
      return;
    }
    fetchMyBusinesses();
  }, [user, authLoading, navigate]);

  const fetchMyBusinesses = async () => {
    try {
      setLoading(true);
      const businesses = await api.get("/my-businesses");
      // Filter hanya bisnis yang belum premium
      const nonPremiumBusinesses = businesses.filter(b => !b.is_premium_active);
      setMyBusinesses(nonPremiumBusinesses);
      
      if (nonPremiumBusinesses.length === 0) {
        // If no businesses to upgrade, show message but don't redirect
        setLoading(false);
        return;
      }
      
      // Auto-select business from URL parameter
      if (businessId) {
        const business = nonPremiumBusinesses.find(b => String(b.id) === businessId);
        if (business) {
          setSelectedBusiness(business);
        }
      } else if (nonPremiumBusinesses.length === 1) {
        // Auto-select if only one business
        setSelectedBusiness(nonPremiumBusinesses[0]);
      }
    } catch (error) {
      console.error("Failed to fetch businesses:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleBusinessSelect = (business) => {
    setSelectedBusiness(business);
  };

  const handleProceedToPayment = () => {
    if (!selectedBusiness) {
      alert('Pilih bisnis terlebih dahulu');
      return;
    }
    setShowPaymentGateway(true);
  };

  const handlePaymentSuccess = (paymentData) => {
    setShowPaymentGateway(false);
    
    // Show success message
    alert('Pembayaran berhasil! Status premium akan aktif dalam beberapa menit.');
    
    // Redirect to dashboard
    navigate('/dashboard?tab=businesses');
  };

  const handlePaymentError = (message) => {
    alert('Pembayaran gagal: ' + message);
  };

  const handlePaymentCancel = () => {
    setShowPaymentGateway(false);
  };

  if (authLoading || loading) {
    return <Loading />;
  }

  return (
    <div className="premium-upgrade-page">
      {/* Header */}
      <div className="premium-header">
        <button className="back-button" onClick={() => navigate('/dashboard')}>
          <ArrowLeft size={20} />
          Kembali ke Dashboard
        </button>
        <h1>Upgrade ke Premium</h1>
        <p>Tingkatkan bisnis Anda dengan fitur premium eksklusif</p>
      </div>

      <div className="premium-content">
        {myBusinesses.length === 0 ? (
          // No businesses available
          <div className="no-businesses">
            <div className="no-businesses-icon">
              <Building2 size={64} />
            </div>
            <h2>Belum Ada Bisnis untuk Upgrade</h2>
            <p>
              Anda belum memiliki bisnis yang dapat di-upgrade ke Premium, atau semua bisnis Anda sudah Premium.
            </p>
            <button 
              className="btn btn-primary"
              onClick={() => navigate("/dashboard?tab=businesses")}
            >
              Kelola Bisnis
            </button>
          </div>
        ) : (
          // Main upgrade flow
          <div className="upgrade-flow">
            {/* Step 1: Select Business */}
            <div className="upgrade-section">
              <h2 className="section-title">
                <Building2 size={24} />
                Pilih Bisnis
              </h2>
              <div className="business-grid">
                {myBusinesses.map((business) => (
                  <div
                    key={business.id}
                    className={`business-card ${selectedBusiness?.id === business.id ? 'selected' : ''}`}
                    onClick={() => handleBusinessSelect(business)}
                  >
                    <div className="business-card-header">
                      <h3>{business.title}</h3>
                      <div className="business-status">
                        <XCircle size={16} />
                        <span>Free Plan</span>
                      </div>
                    </div>
                    <div className="business-card-body">
                      <p className="business-category">{business.category?.name || business.category || 'Kategori tidak ditentukan'}</p>
                      <p className="business-address">{business.address || 'Alamat tidak tersedia'}</p>
                    </div>
                    {selectedBusiness?.id === business.id && (
                      <div className="business-card-selected">
                        <CheckCircle size={20} />
                        <span>Dipilih</span>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Step 2: Select Plan */}
            {selectedBusiness && (
              <div className="upgrade-section">
                <h2 className="section-title">
                  <Crown size={24} />
                  Pilih Paket Premium
                </h2>
                <div className="plans-grid">
                  {Object.entries(plans).map(([key, plan]) => (
                    <div
                      key={key}
                      className={`plan-card ${selectedPlan === key ? 'selected' : ''}`}
                      onClick={() => setSelectedPlan(key)}
                    >
                      <div className="plan-header">
                        <h3>{plan.label}</h3>
                        <div className="plan-price">
                          Rp {plan.amount.toLocaleString('id-ID')}
                        </div>
                        <div className="plan-duration">{plan.days} hari</div>
                      </div>
                      <div className="plan-features">
                        <div className="feature">
                          <CheckCircle size={16} />
                          <span>Galeri foto unlimited</span>
                        </div>
                        <div className="feature">
                          <CheckCircle size={16} />
                          <span>Video profil bisnis</span>
                        </div>
                        <div className="feature">
                          <CheckCircle size={16} />
                          <span>Menu/produk unlimited</span>
                        </div>
                        <div className="feature">
                          <CheckCircle size={16} />
                          <span>Kontak lengkap</span>
                        </div>
                        <div className="feature">
                          <CheckCircle size={16} />
                          <span>Badge premium</span>
                        </div>
                      </div>
                      {selectedPlan === key && (
                        <div className="plan-selected">
                          <CheckCircle size={20} />
                          <span>Dipilih</span>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Step 3: Summary & Payment */}
            {selectedBusiness && (
              <div className="upgrade-section">
                <div className="upgrade-summary">
                  <h3>Ringkasan Upgrade</h3>
                  <div className="summary-item">
                    <span>Bisnis:</span>
                    <span>{selectedBusiness.title}</span>
                  </div>
                  <div className="summary-item">
                    <span>Paket:</span>
                    <span>{plans[selectedPlan].label}</span>
                  </div>
                  <div className="summary-item total">
                    <span>Total Pembayaran:</span>
                    <span>Rp {plans[selectedPlan].amount.toLocaleString('id-ID')}</span>
                  </div>
                  
                  <button 
                    className="btn btn-primary btn-large"
                    onClick={handleProceedToPayment}
                  >
                    <Crown size={20} />
                    Upgrade ke Premium
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Payment Gateway Modal */}
      {showPaymentGateway && selectedBusiness && (
        <div className="modal-overlay">
          <div className="modal">
            <div className="modal-header">
              <h3>Upgrade {selectedBusiness.title} ke Premium</h3>
              <button className="modal-close" onClick={handlePaymentCancel}>
                ×
              </button>
            </div>
            <div className="modal-body">
              <PaymentGateway
                business={selectedBusiness}
                plan={selectedPlan}
                onSuccess={handlePaymentSuccess}
                onError={handlePaymentError}
                onCancel={handlePaymentCancel}
              />
            </div>
          </div>
        </div>
      )}

      <style jsx>{`
        .premium-upgrade-page {
          min-height: 100vh;
          background: #f8fafc;
          font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
        }

        .premium-header {
          background: linear-gradient(135deg, #0d9488 0%, #0f766e 100%);
          color: white;
          padding: 2rem;
          text-align: center;
        }

        .back-button {
          display: inline-flex;
          align-items: center;
          gap: 0.5rem;
          background: rgba(255, 255, 255, 0.2);
          color: white;
          border: none;
          padding: 0.75rem 1rem;
          border-radius: 8px;
          cursor: pointer;
          font-weight: 500;
          margin-bottom: 2rem;
          transition: all 0.2s;
        }

        .back-button:hover {
          background: rgba(255, 255, 255, 0.3);
        }

        .premium-header h1 {
          font-size: 2.5rem;
          font-weight: 700;
          margin-bottom: 0.5rem;
        }

        .premium-header p {
          font-size: 1.1rem;
          opacity: 0.9;
        }

        .premium-content {
          max-width: 1200px;
          margin: 0 auto;
          padding: 2rem;
        }

        .no-businesses {
          text-align: center;
          padding: 4rem 2rem;
          background: white;
          border-radius: 16px;
          box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
        }

        .no-businesses-icon {
          color: #9ca3af;
          margin-bottom: 2rem;
        }

        .no-businesses h2 {
          font-size: 1.5rem;
          color: #1f2937;
          margin-bottom: 1rem;
        }

        .no-businesses p {
          color: #6b7280;
          margin-bottom: 2rem;
        }

        .upgrade-section {
          background: white;
          border-radius: 16px;
          padding: 2rem;
          margin-bottom: 2rem;
          box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
        }

        .section-title {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          font-size: 1.25rem;
          font-weight: 600;
          color: #1f2937;
          margin-bottom: 1.5rem;
        }

        .business-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
          gap: 1.5rem;
        }

        .business-card {
          border: 2px solid #e5e7eb;
          border-radius: 12px;
          padding: 1.5rem;
          cursor: pointer;
          transition: all 0.2s;
          position: relative;
        }

        .business-card:hover {
          border-color: #0d9488;
          box-shadow: 0 4px 12px rgba(13, 148, 136, 0.15);
        }

        .business-card.selected {
          border-color: #0d9488;
          background: #f0fdfa;
          box-shadow: 0 4px 12px rgba(13, 148, 136, 0.15);
        }

        .business-card-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          margin-bottom: 1rem;
        }

        .business-card-header h3 {
          font-weight: 600;
          color: #1f2937;
          margin: 0;
        }

        .business-status {
          display: flex;
          align-items: center;
          gap: 0.25rem;
          color: #ef4444;
          font-size: 0.875rem;
          font-weight: 500;
        }

        .business-card-body p {
          margin: 0.5rem 0;
          color: #6b7280;
          font-size: 0.875rem;
        }

        .business-category {
          font-weight: 500;
          color: #0d9488;
        }

        .business-card-selected {
          position: absolute;
          top: 1rem;
          right: 1rem;
          display: flex;
          align-items: center;
          gap: 0.25rem;
          background: #0d9488;
          color: white;
          padding: 0.25rem 0.5rem;
          border-radius: 6px;
          font-size: 0.75rem;
          font-weight: 600;
        }

        .plans-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
          gap: 1.5rem;
        }

        .plan-card {
          border: 2px solid #e5e7eb;
          border-radius: 12px;
          padding: 1.5rem;
          cursor: pointer;
          transition: all 0.2s;
          position: relative;
        }

        .plan-card:hover {
          border-color: #0d9488;
          box-shadow: 0 4px 12px rgba(13, 148, 136, 0.15);
        }

        .plan-card.selected {
          border-color: #0d9488;
          background: #f0fdfa;
          box-shadow: 0 4px 12px rgba(13, 148, 136, 0.15);
        }

        .plan-header {
          text-align: center;
          margin-bottom: 1.5rem;
          padding-bottom: 1rem;
          border-bottom: 1px solid #e5e7eb;
        }

        .plan-header h3 {
          font-weight: 600;
          color: #1f2937;
          margin-bottom: 0.5rem;
        }

        .plan-price {
          font-size: 1.75rem;
          font-weight: 700;
          color: #0d9488;
          margin-bottom: 0.25rem;
        }

        .plan-duration {
          color: #6b7280;
          font-size: 0.875rem;
        }

        .plan-features {
          display: flex;
          flex-direction: column;
          gap: 0.75rem;
        }

        .feature {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          color: #374151;
          font-size: 0.875rem;
        }

        .feature svg {
          color: #10b981;
          flex-shrink: 0;
        }

        .plan-selected {
          position: absolute;
          top: 1rem;
          right: 1rem;
          display: flex;
          align-items: center;
          gap: 0.25rem;
          background: #0d9488;
          color: white;
          padding: 0.25rem 0.5rem;
          border-radius: 6px;
          font-size: 0.75rem;
          font-weight: 600;
        }

        .upgrade-summary {
          background: #f9fafb;
          border-radius: 12px;
          padding: 2rem;
        }

        .upgrade-summary h3 {
          font-weight: 600;
          color: #1f2937;
          margin-bottom: 1.5rem;
        }

        .summary-item {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 0.75rem 0;
          border-bottom: 1px solid #e5e7eb;
        }

        .summary-item:last-child {
          border-bottom: none;
        }

        .summary-item.total {
          font-weight: 600;
          font-size: 1.125rem;
          color: #0d9488;
          margin-top: 1rem;
          padding-top: 1rem;
          border-top: 2px solid #e5e7eb;
        }

        .btn {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 0.5rem;
          padding: 0.875rem 1.5rem;
          border-radius: 8px;
          font-weight: 600;
          font-size: 0.9rem;
          border: none;
          cursor: pointer;
          transition: all 0.2s;
          text-decoration: none;
        }

        .btn-primary {
          background: #0d9488;
          color: white;
        }

        .btn-primary:hover {
          background: #0f766e;
          transform: translateY(-1px);
        }

        .btn-large {
          width: 100%;
          padding: 1.125rem 1.5rem;
          font-size: 1rem;
          margin-top: 1.5rem;
        }

        .modal-overlay {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(0, 0, 0, 0.5);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 1000;
          padding: 1rem;
        }

        .modal {
          background: white;
          border-radius: 16px;
          max-width: 700px;
          width: 100%;
          max-height: 90vh;
          overflow-y: auto;
          box-shadow: 0 20px 40px rgba(0, 0, 0, 0.15);
        }

        .modal-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 1.5rem;
          border-bottom: 1px solid #e5e7eb;
        }

        .modal-header h3 {
          font-weight: 600;
          color: #1f2937;
          margin: 0;
        }

        .modal-close {
          background: none;
          border: none;
          font-size: 1.5rem;
          color: #6b7280;
          cursor: pointer;
          padding: 0.25rem;
        }

        .modal-close:hover {
          color: #1f2937;
        }

        .modal-body {
          padding: 0;
        }

        @media (max-width: 768px) {
          .premium-content {
            padding: 1rem;
          }
          
          .business-grid, .plans-grid {
            grid-template-columns: 1fr;
          }
          
          .premium-header h1 {
            font-size: 2rem;
          }
          
          .upgrade-section {
            padding: 1.5rem;
          }
        }
      `}</style>
    </div>
  );
}