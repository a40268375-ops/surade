import { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { CheckCircle, ArrowRight } from 'lucide-react';

export default function PaymentSuccess() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  useEffect(() => {
    document.title = "Pembayaran Berhasil - Surade.com";
    // Auto redirect after 5 seconds
    const timer = setTimeout(() => {
      navigate('/dashboard?tab=businesses');
    }, 5000);

    return () => clearTimeout(timer);
  }, [navigate]);

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
      padding: '2rem'
    }}>
      <div style={{
        background: 'white',
        borderRadius: '16px',
        padding: '3rem',
        textAlign: 'center',
        maxWidth: '500px',
        width: '100%',
        boxShadow: '0 20px 40px rgba(0, 0, 0, 0.15)'
      }}>
        <div style={{
          color: '#10b981',
          marginBottom: '1.5rem',
          display: 'flex',
          justifyContent: 'center'
        }}>
          <CheckCircle size={80} />
        </div>
        
        <h1 style={{
          fontSize: '1.875rem',
          fontWeight: '700',
          color: '#1f2937',
          marginBottom: '1rem'
        }}>
          Pembayaran Berhasil!
        </h1>
        
        <p style={{
          color: '#6b7280',
          marginBottom: '2rem',
          lineHeight: '1.6'
        }}>
          Terima kasih! Pembayaran premium Anda telah berhasil diproses. 
          Status premium akan aktif dalam beberapa menit.
        </p>

        <button
          onClick={() => navigate('/dashboard?tab=businesses')}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.5rem',
            background: '#10b981',
            color: 'white',
            border: 'none',
            padding: '0.875rem 1.5rem',
            borderRadius: '8px',
            fontWeight: '600',
            cursor: 'pointer',
            transition: 'all 0.2s',
            textDecoration: 'none'
          }}
        >
          Kembali ke Dashboard
          <ArrowRight size={16} />
        </button>

        <p style={{
          fontSize: '0.875rem',
          color: '#9ca3af',
          marginTop: '1.5rem'
        }}>
          Anda akan diarahkan otomatis dalam 5 detik...
        </p>
      </div>
    </div>
  );
}