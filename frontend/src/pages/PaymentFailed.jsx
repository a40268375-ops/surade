import { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { XCircle, ArrowLeft, RefreshCw } from 'lucide-react';

export default function PaymentFailed() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const reason = searchParams.get('reason') || 'Terjadi kesalahan dalam proses pembayaran';

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)',
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
          color: '#ef4444',
          marginBottom: '1.5rem',
          display: 'flex',
          justifyContent: 'center'
        }}>
          <XCircle size={80} />
        </div>
        
        <h1 style={{
          fontSize: '1.875rem',
          fontWeight: '700',
          color: '#1f2937',
          marginBottom: '1rem'
        }}>
          Pembayaran Gagal
        </h1>
        
        <p style={{
          color: '#6b7280',
          marginBottom: '2rem',
          lineHeight: '1.6'
        }}>
          {reason}
        </p>

        <div style={{
          display: 'flex',
          gap: '1rem',
          justifyContent: 'center',
          flexWrap: 'wrap'
        }}>
          <button
            onClick={() => navigate('/premium-upgrade')}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.5rem',
              background: '#ef4444',
              color: 'white',
              border: 'none',
              padding: '0.875rem 1.5rem',
              borderRadius: '8px',
              fontWeight: '600',
              cursor: 'pointer',
              transition: 'all 0.2s'
            }}
          >
            <RefreshCw size={16} />
            Coba Lagi
          </button>

          <button
            onClick={() => navigate('/dashboard')}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.5rem',
              background: '#f3f4f6',
              color: '#374151',
              border: 'none',
              padding: '0.875rem 1.5rem',
              borderRadius: '8px',
              fontWeight: '600',
              cursor: 'pointer',
              transition: 'all 0.2s'
            }}
          >
            <ArrowLeft size={16} />
            Kembali ke Dashboard
          </button>
        </div>

        <div style={{
          marginTop: '2rem',
          padding: '1rem',
          background: '#f9fafb',
          borderRadius: '8px',
          fontSize: '0.875rem',
          color: '#6b7280'
        }}>
          <p><strong>Tips:</strong></p>
          <ul style={{ textAlign: 'left', margin: '0.5rem 0', paddingLeft: '1rem' }}>
            <li>Pastikan saldo atau limit kartu Anda mencukupi</li>
            <li>Periksa koneksi internet Anda</li>
            <li>Coba menggunakan metode pembayaran lain</li>
          </ul>
        </div>
      </div>
    </div>
  );
}