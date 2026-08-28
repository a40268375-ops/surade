import { useState, useEffect } from 'react';
import { CreditCard, Smartphone, Building, Clock, CheckCircle, Tag, X } from 'lucide-react';
import api from '../utils/api';

const PaymentGateway = ({ business, plan, onSuccess, onError, onCancel }) => {
  const [loading, setLoading] = useState(false);
  const [selectedGateway, setSelectedGateway] = useState(null);
  const [midtransLoaded, setMidtransLoaded] = useState(false);
  const [referralCode, setReferralCode] = useState('');
  const [discount, setDiscount] = useState(0);
  const [validatingReferral, setValidatingReferral] = useState(false);
  const [referralError, setReferralError] = useState('');
  const [referralApplied, setReferralApplied] = useState(false);

  useEffect(() => {
    // Load Midtrans Snap script dynamically
    const loadMidtransScript = () => {
      if (window.snap) {
        setMidtransLoaded(true);
        return;
      }

      const script = document.createElement('script');
      script.src = 'https://app.sandbox.midtrans.com/snap/snap.js';
      script.setAttribute('data-client-key', import.meta.env.VITE_MIDTRANS_CLIENT_KEY || 'SB-Mid-client-YOUR_CLIENT_KEY_HERE');
      script.onload = () => setMidtransLoaded(true);
      script.onerror = () => console.error('Failed to load Midtrans Snap');
      document.head.appendChild(script);
    };

    loadMidtransScript();
  }, []);

  const plans = {
    monthly: { label: '1 Bulan Premium', amount: 49000, days: 30 },
    quarterly: { label: '3 Bulan Premium', amount: 129000, days: 90 },
    yearly: { label: '12 Bulan Premium', amount: 449000, days: 365 },
  };

  const planData = plans[plan];

  const validateReferralCode = async () => {
    if (!referralCode.trim()) {
      setReferralError('Masukkan kode referral');
      return;
    }

    setValidatingReferral(true);
    setReferralError('');

    try {
      const response = await api.post('/referral/validate', {
        code: referralCode.trim(),
        plan: plan,
        business_id: business.id
      });

      if (response.success) {
        // Use discount from backend API response (fixed 5% discount)
        setDiscount(response.discount || 0);
        setReferralApplied(true);
        setReferralError('');
      } else {
        setReferralError(response.message || 'Kode referral tidak valid');
        setDiscount(0);
        setReferralApplied(false);
      }
    } catch (error) {
      console.error('Referral validation error:', error);
      setReferralError(error.response?.data?.message || 'Gagal memvalidasi kode referral');
      setDiscount(0);
      setReferralApplied(false);
    } finally {
      setValidatingReferral(false);
    }
  };

  const removeReferralCode = () => {
    setReferralCode('');
    setDiscount(0);
    setReferralApplied(false);
    setReferralError('');
  };

  const finalAmount = Math.max(0, planData.amount - discount);

  const handleMidtransPayment = async () => {
    if (!midtransLoaded) {
      onError('Midtrans belum siap. Silakan tunggu sebentar dan coba lagi.');
      return;
    }

    setLoading(true);
    try {
      const response = await api.post('/payment/midtrans/create', {
        business_id: business.id,
        plan: plan,
        referral_code: referralCode.trim(),
        discount: discount
      });

      if (response.success) {
        if (response.mock_mode) {
          alert('Pembayaran Berhasil! (Mode Simulasi - Tidak ada API Key asli)');
          onSuccess({
            gateway: 'midtrans',
            transaction_id: 'mock_trx',
            subscription_id: response.subscription_id
          });
          setLoading(false);
          return;
        }

        // Load Midtrans Snap
        window.snap.pay(response.snap_token, {
          onSuccess: function(result) {
            console.log('Payment success:', result);
            onSuccess({
              gateway: 'midtrans',
              transaction_id: result.order_id,
              subscription_id: response.subscription_id
            });
          },
          onPending: function(result) {
            console.log('Payment pending:', result);
            alert('Pembayaran sedang diproses. Silakan cek status pembayaran secara berkala.');
          },
          onError: function(result) {
            console.log('Payment error:', result);
            onError('Pembayaran gagal. Silakan coba lagi.');
          },
          onClose: function() {
            console.log('Payment popup closed');
          }
        });
      } else {
        onError(response.message || 'Gagal membuat pembayaran');
      }
    } catch (error) {
      console.error('Midtrans payment error:', error);
      onError(error.response?.data?.message || 'Terjadi kesalahan saat membuat pembayaran');
    } finally {
      setLoading(false);
    }
  };

  const handleXenditPayment = async () => {
    setLoading(true);
    try {
      const response = await api.post('/payment/xendit/create', {
        business_id: business.id,
        plan: plan,
        referral_code: referralCode.trim(),
        discount: discount
      });

      if (response.success) {
        if (response.mock_mode) {
          alert('Pembayaran Berhasil! (Mode Simulasi - Tidak ada API Key asli)');
          onSuccess({
            gateway: 'xendit',
            invoice_id: response.invoice_id,
            subscription_id: response.subscription_id
          });
          setLoading(false);
          return;
        }

        // Redirect to Xendit payment page
        window.open(response.invoice_url, '_blank');
        
        // Show success message for now
        alert('Halaman pembayaran Xendit telah dibuka. Setelah pembayaran berhasil, status premium akan aktif otomatis.');
        
        onSuccess({
          gateway: 'xendit',
          invoice_id: response.invoice_id,
          subscription_id: response.subscription_id
        });
      } else {
        onError(response.message || 'Gagal membuat pembayaran');
      }
    } catch (error) {
      console.error('Xendit payment error:', error);
      onError(error.response?.data?.message || 'Terjadi kesalahan saat membuat pembayaran');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="payment-gateway">
      <div className="payment-header">
        <h3 className="payment-title">Pilih Metode Pembayaran</h3>
        <p className="payment-subtitle">
          Upgrade {business.title} ke {planData.label}
        </p>
      </div>

      <div className="payment-summary">
        <div className="summary-item">
          <span>Paket</span>
          <span>{planData.label}</span>
        </div>
        <div className="summary-item">
          <span>Durasi</span>
          <span>{planData.days} hari</span>
        </div>
        {discount > 0 && (
          <div className="summary-item discount">
            <span>Diskon Referral</span>
            <span>-Rp {discount.toLocaleString('id-ID')}</span>
          </div>
        )}
        <div className="summary-item total">
          <span>Total Pembayaran</span>
          <span>Rp {finalAmount.toLocaleString('id-ID')}</span>
        </div>
      </div>

      {/* Referral Code Section */}
      {!referralApplied && (
        <div className="referral-section">
          <div className="referral-input-group">
            <div className="referral-icon">
              <Tag size={20} />
            </div>
            <input
              type="text"
              className="referral-input"
              placeholder="Masukkan kode referral (opsional)"
              value={referralCode}
              onChange={(e) => setReferralCode(e.target.value.toUpperCase())}
              disabled={validatingReferral}
            />
            <button
              className="referral-apply-btn"
              onClick={validateReferralCode}
              disabled={validatingReferral || !referralCode.trim()}
            >
              {validatingReferral ? 'Validasi...' : 'Gunakan'}
            </button>
          </div>
          {referralError && (
            <div className="referral-error">{referralError}</div>
          )}
        </div>
      )}

      {referralApplied && (
        <div className="referral-applied">
          <div className="referral-applied-content">
            <Tag size={16} />
            <span>Kode referral <strong>{referralCode}</strong> diterapkan</span>
            <span className="referral-discount">Diskon Rp {discount.toLocaleString('id-ID')}</span>
          </div>
          <button
            className="referral-remove-btn"
            onClick={removeReferralCode}
          >
            <X size={16} />
          </button>
        </div>
      )}

      <div className="referral-info">
        <p>💡 Gunakan kode referral dari reseller untuk mendapatkan diskon 5%</p>
      </div>

      <div className="payment-methods">
        <div className="payment-method-section">
          <h4>Payment Gateway</h4>
          
          <button
            className={`payment-method ${selectedGateway === 'midtrans' ? 'selected' : ''}`}
            onClick={() => setSelectedGateway('midtrans')}
            disabled={loading || !midtransLoaded}
          >
            <div className="method-icon">
              <CreditCard size={24} />
            </div>
            <div className="method-info">
              <h5>Midtrans {!midtransLoaded && '(Loading...)'}</h5>
              <p>Kartu Kredit, Debit, E-Wallet, Bank Transfer</p>
              <div className="method-features">
                <span><CheckCircle size={16} /> Instant Payment</span>
                <span><CheckCircle size={16} /> Secure</span>
              </div>
            </div>
          </button>

          <button
            className={`payment-method ${selectedGateway === 'xendit' ? 'selected' : ''}`}
            onClick={() => setSelectedGateway('xendit')}
            disabled={loading}
          >
            <div className="method-icon">
              <Smartphone size={24} />
            </div>
            <div className="method-info">
              <h5>Xendit</h5>
              <p>Bank Transfer, E-Wallet, Virtual Account</p>
              <div className="method-features">
                <span><CheckCircle size={16} /> Multiple Banks</span>
                <span><CheckCircle size={16} /> Easy Payment</span>
              </div>
            </div>
          </button>
        </div>
      </div>

      <div className="payment-actions">
        <button
          className="btn btn-secondary"
          onClick={onCancel}
          disabled={loading}
        >
          Batal
        </button>
        
        <button
          className="btn btn-primary"
          onClick={selectedGateway === 'midtrans' ? handleMidtransPayment : handleXenditPayment}
          disabled={!selectedGateway || loading || (selectedGateway === 'midtrans' && !midtransLoaded)}
        >
          {loading ? (
            <div className="loading-spinner">
              <div className="spinner"></div>
              Memproses...
            </div>
          ) : (
            `Bayar Rp ${finalAmount.toLocaleString('id-ID')}`
          )}
        </button>
      </div>

      <div className="payment-security">
        <div className="security-badges">
          <span><Building size={16} /> Bank Grade Security</span>
          <span><Clock size={16} /> Aktivasi Instan</span>
        </div>
        <p className="security-note">
          Pembayaran Anda dilindungi dengan enkripsi SSL 256-bit. 
          Status premium akan aktif otomatis setelah pembayaran berhasil.
        </p>
      </div>

      <style jsx>{`
        .payment-gateway {
          max-width: 600px;
          margin: 0 auto;
          padding: 2rem;
          background: white;
          border-radius: 12px;
          box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
        }

        .payment-header {
          text-align: center;
          margin-bottom: 2rem;
        }

        .payment-title {
          font-size: 1.5rem;
          font-weight: 600;
          color: #1f2937;
          margin-bottom: 0.5rem;
        }

        .payment-subtitle {
          color: #6b7280;
          font-size: 0.9rem;
        }

        .payment-summary {
          background: #f9fafb;
          border-radius: 8px;
          padding: 1.5rem;
          margin-bottom: 2rem;
        }

        .summary-item {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 0.5rem 0;
          border-bottom: 1px solid #e5e7eb;
        }

        .summary-item:last-child {
          border-bottom: none;
        }

        .summary-item.total {
          font-weight: 600;
          font-size: 1.1rem;
          color: #0d9488;
          padding-top: 1rem;
          margin-top: 0.5rem;
          border-top: 2px solid #e5e7eb;
        }

        .summary-item.discount {
          color: #059669;
        }

        .referral-section {
          margin-bottom: 1.5rem;
        }

        .referral-input-group {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          padding: 0.75rem;
          border: 2px solid #e5e7eb;
          border-radius: 8px;
          background: white;
        }

        .referral-input-group:focus-within {
          border-color: #0d9488;
          box-shadow: 0 0 0 3px rgba(13, 148, 136, 0.1);
        }

        .referral-icon {
          color: #0d9488;
          flex-shrink: 0;
        }

        .referral-input {
          flex: 1;
          border: none;
          outline: none;
          font-size: 0.9rem;
          color: #1f2937;
          background: transparent;
        }

        .referral-input::placeholder {
          color: #9ca3af;
        }

        .referral-input:disabled {
          opacity: 0.6;
        }

        .referral-apply-btn {
          padding: 0.5rem 1rem;
          background: #0d9488;
          color: white;
          border: none;
          border-radius: 6px;
          font-size: 0.875rem;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s;
          white-space: nowrap;
        }

        .referral-apply-btn:hover:not(:disabled) {
          background: #0f766e;
        }

        .referral-apply-btn:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }

        .referral-error {
          margin-top: 0.5rem;
          font-size: 0.875rem;
          color: #dc2626;
        }

        .referral-applied {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 0.75rem 1rem;
          background: #ecfdf5;
          border: 1px solid #10b981;
          border-radius: 8px;
          margin-bottom: 1.5rem;
        }

        .referral-applied-content {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          font-size: 0.875rem;
          color: #065f46;
        }

        .referral-applied-content strong {
          font-weight: 600;
        }

        .referral-discount {
          color: #059669;
          font-weight: 600;
        }

        .referral-remove-btn {
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 0.25rem;
          background: transparent;
          border: none;
          color: #065f46;
          cursor: pointer;
          border-radius: 4px;
          transition: all 0.2s;
        }

        .referral-remove-btn:hover {
          background: #d1fae5;
        }

        .referral-info {
          margin-bottom: 1.5rem;
          padding: 0.75rem;
          background: #fef3c7;
          border: 1px solid #f59e0b;
          border-radius: 8px;
        }

        .referral-info p {
          margin: 0;
          font-size: 0.875rem;
          color: #92400e;
        }

        .payment-methods {
          margin-bottom: 2rem;
        }

        .payment-method-section h4 {
          font-size: 1rem;
          font-weight: 600;
          color: #374151;
          margin-bottom: 1rem;
        }

        .payment-method {
          width: 100%;
          display: flex;
          align-items: center;
          gap: 1rem;
          padding: 1.25rem;
          border: 2px solid #e5e7eb;
          border-radius: 8px;
          background: white;
          cursor: pointer;
          transition: all 0.2s;
          margin-bottom: 0.75rem;
          text-align: left;
        }

        .payment-method:hover {
          border-color: #0d9488;
          background: #f0fdfa;
        }

        .payment-method.selected {
          border-color: #0d9488;
          background: #f0fdfa;
          box-shadow: 0 0 0 3px rgba(13, 148, 136, 0.1);
        }

        .payment-method:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }

        .method-icon {
          color: #0d9488;
          flex-shrink: 0;
        }

        .method-info {
          flex: 1;
        }

        .method-info h5 {
          font-size: 1rem;
          font-weight: 600;
          color: #1f2937;
          margin-bottom: 0.25rem;
        }

        .method-info p {
          font-size: 0.875rem;
          color: #6b7280;
          margin-bottom: 0.5rem;
        }

        .method-features {
          display: flex;
          gap: 1rem;
          flex-wrap: wrap;
        }

        .method-features span {
          display: flex;
          align-items: center;
          gap: 0.25rem;
          font-size: 0.75rem;
          color: #059669;
          font-weight: 500;
        }

        .payment-actions {
          display: flex;
          gap: 1rem;
          margin-bottom: 2rem;
        }

        .btn {
          flex: 1;
          padding: 0.875rem 1.5rem;
          border-radius: 8px;
          font-weight: 600;
          font-size: 0.9rem;
          border: none;
          cursor: pointer;
          transition: all 0.2s;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 0.5rem;
        }

        .btn-secondary {
          background: #f3f4f6;
          color: #374151;
        }

        .btn-secondary:hover {
          background: #e5e7eb;
        }

        .btn-primary {
          background: #0d9488;
          color: white;
        }

        .btn-primary:hover {
          background: #0f766e;
        }

        .btn:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }

        .loading-spinner {
          display: flex;
          align-items: center;
          gap: 0.5rem;
        }

        .spinner {
          width: 16px;
          height: 16px;
          border: 2px solid #ffffff40;
          border-top-color: #ffffff;
          border-radius: 50%;
          animation: spin 1s linear infinite;
        }

        @keyframes spin {
          to { transform: rotate(360deg); }
        }

        .payment-security {
          text-align: center;
          padding-top: 1.5rem;
          border-top: 1px solid #e5e7eb;
        }

        .security-badges {
          display: flex;
          justify-content: center;
          gap: 1.5rem;
          margin-bottom: 1rem;
          flex-wrap: wrap;
        }

        .security-badges span {
          display: flex;
          align-items: center;
          gap: 0.25rem;
          font-size: 0.875rem;
          color: #059669;
          font-weight: 500;
        }

        .security-note {
          font-size: 0.8rem;
          color: #6b7280;
          line-height: 1.5;
          max-width: 400px;
          margin: 0 auto;
        }

        @media (max-width: 640px) {
          .payment-gateway {
            padding: 1.5rem;
          }
          
          .payment-actions {
            flex-direction: column;
          }
          
          .security-badges {
            flex-direction: column;
            gap: 0.75rem;
          }
        }
      `}</style>
    </div>
  );
};

export default PaymentGateway;