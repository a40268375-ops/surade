import React, { useState } from 'react';
import { CheckCircle2, AlertCircle, Loader2, Sparkles, Tag, X } from 'lucide-react';
import api from '../services/api';

/**
 * DiscountCodeInput - Komponen reusable untuk input kode referral atau kupon
 * 
 * @param {string} type - "referral" atau "coupon"
 * @param {number} amount - Harga total untuk kalkulasi diskon
 * @param {function} onApplied - Callback saat kode berhasil diterapkan, menerima data diskon
 * @param {function} onRemoved - Callback saat kode dihapus
 * @param {object} appliedCode - Data kode yang sudah diterapkan (null jika belum ada)
 * @param {boolean} disabled - Disable input (misalnya untuk paket free)
 */
const DiscountCodeInput = ({ 
  type = 'coupon', 
  amount = 0, 
  onApplied, 
  onRemoved, 
  appliedCode = null,
  disabled = false,
  className = '',
  prefillCode = '', // isi otomatis dari luar (mis. klik chip "Kupon Tersedia") lalu langsung diterapkan
}) => {
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const isReferral = type === 'referral';
  const endpoint = isReferral ? '/referrals/validate' : '/coupons/validate';
  const label = isReferral ? 'Kode Referral' : 'Kode Kupon';
  const placeholder = isReferral ? 'Masukkan kode referral' : 'Masukkan kode kupon';
  const Icon = isReferral ? Sparkles : Tag;
  const colorScheme = isReferral 
    ? { bg: 'bg-teal-50', border: 'border-teal-200', text: 'text-[#007570]', hover: 'hover:bg-teal-100' }
    : { bg: 'bg-emerald-50', border: 'border-emerald-200', text: 'text-emerald-700', hover: 'hover:bg-emerald-100' };

  const [isBound, setIsBound] = useState(false);
  const [boundInfo, setBoundInfo] = useState(null);

  // Cek keterikatan referral permanen pada pengguna saat ini
  React.useEffect(() => {
    if (isReferral) {
      let currentUserId = null;
      try {
        const u = localStorage.getItem("user");
        if (u) currentUserId = JSON.parse(u)?.id;
      } catch (e) {}

      api.get(`/referrals/public-codes${currentUserId ? `?user_id=${currentUserId}` : ''}`)
        .then((res) => {
          if (res?.data?.is_bound) {
            setIsBound(true);
            const boundCode = res.data.bound_code;
            const boundName = res.data.bound_owner_name || res.data.bound_name;
            setBoundInfo({
              code: boundCode,
              name: boundName,
            });
            // Otomatis terapkan kode yang mengikat jika belum diaplikasikan
            if (boundCode && !appliedCode) {
              handleApply(boundCode);
            }
          }
        })
        .catch(() => {});
    }
  }, [isReferral]);

  // Kalau parent kasih `prefillCode` baru (mis. user klik salah satu chip
  // "Kupon Tersedia"), isi kotak inputnya saja — TIDAK otomatis diterapkan,
  // biar user yang klik tombol "Terapkan" sendiri (hanya jika belum terikat permanen).
  React.useEffect(() => {
    if (!isBound && prefillCode && prefillCode.trim()) {
      setInput(prefillCode.trim().toUpperCase());
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [prefillCode, isBound]);

  const handleApply = async (codeOverride) => {
    const codeToApply = (codeOverride ?? input).trim();
    if (!codeToApply) {
      setError(`Masukkan ${label.toLowerCase()} terlebih dahulu.`);
      return;
    }

    setLoading(true);
    setError('');
    setSuccess('');

    try {
      let currentUserId = null;
      try {
        const u = localStorage.getItem("user");
        if (u) currentUserId = JSON.parse(u)?.id;
      } catch (e) {}

      const res = await api.post(endpoint, {
        code: codeToApply,
        amount: amount || 0,
        user_id: currentUserId,
      });

      if (res.data?.valid === true || res.data?.is_valid === true) {
        setSuccess(res.data.message || `${label} berhasil diterapkan!`);
        if (onApplied) {
          onApplied(res.data);
        }
        // Clear input setelah berhasil
        setInput('');
      } else {
        setError(res.data?.message || `${label} tidak valid.`);
        if (onApplied) {
          onApplied(null);
        }
      }
    } catch (e) {
      const msg = e?.response?.data?.message || `${label} tidak valid atau sudah tidak berlaku.`;
      setError(msg);
      if (onApplied) {
        onApplied(null);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleRemove = () => {
    if (isBound && isReferral) {
      setError("Kode referral terikat permanen dengan akun Anda dan tidak dapat dihapus.");
      return;
    }
    setInput('');
    setError('');
    setSuccess('');
    if (onRemoved) {
      onRemoved();
    }
  };

  if (disabled) {
    return null;
  }

  return (
    <div className={`border border-slate-200 rounded-2xl p-5 bg-white ${className}`}>
      <label className="text-sm font-bold text-slate-800 flex items-center gap-2 mb-2">
        <Icon size={16} className="text-[#007570]" />
        {label}
        {isReferral && (
          <span className="text-xs font-normal text-slate-400">
            (Opsional - Diskon 10%{amount > 0 ? ` / Hemat Rp ${Math.round(amount * 0.10).toLocaleString('id-ID')}` : ''})
          </span>
        )}
      </label>

      {appliedCode ? (
        <div className={`flex items-center justify-between ${colorScheme.bg} ${colorScheme.border} border rounded-xl p-3.5`}>
          <div className="flex items-center gap-2.5">
            <CheckCircle2 size={20} className={colorScheme.text} />
            <div>
              <span className={`text-xs font-bold ${colorScheme.text} uppercase block`}>
                {isReferral ? 'Referral' : 'Kupon'} Terpasang: {appliedCode.code || appliedCode.referral_code}
                {isBound && isReferral && <span className="ml-2 text-[10px] normal-case bg-teal-100 text-[#007570] px-2 py-0.5 rounded-full font-bold">Terikat Permanen</span>}
              </span>
              <span className="text-xs text-slate-600 font-medium">
                Diskon Rp {Number(appliedCode.discount_amount || appliedCode.discount || 0).toLocaleString('id-ID')}
              </span>
            </div>
          </div>
          {!isBound || !isReferral ? (
            <button
              type="button"
              onClick={handleRemove}
              className="text-xs font-semibold text-red-600 bg-white border border-red-200 px-3 py-1.5 rounded-lg hover:bg-red-50 cursor-pointer transition-colors flex items-center gap-1"
            >
              <X size={14} />
              Hapus
            </button>
          ) : (
            <span className="text-[11px] font-semibold text-slate-500 bg-slate-100 px-2.5 py-1 rounded-md">
              Terkunci
            </span>
          )}
        </div>
      ) : (
        <div className="space-y-2">
          {isBound && isReferral && (
            <div className="text-xs text-[#007570] bg-teal-50 border border-teal-200 rounded-lg p-2.5 font-medium">
              Akun Anda telah terikat permanen dengan agen <strong>{boundInfo?.name || 'Referral'}</strong>. Kode ini otomatis terkunci dan tidak dapat diganti dengan milik orang lain.
            </div>
          )}
          <div className="flex gap-2">
            <input
              type="text"
              placeholder={isBound && isReferral ? `Terkunci: ${boundInfo?.code}` : placeholder}
              value={isBound && isReferral ? (boundInfo?.code || '') : input}
              onChange={(e) => {
                if (!isBound || !isReferral) {
                  setInput(e.target.value.toUpperCase());
                }
              }}
              readOnly={isBound && isReferral}
              onKeyDown={(e) => e.key === 'Enter' && handleApply(isBound && isReferral ? boundInfo?.code : undefined)}
              className={`flex-1 px-4 py-2.5 border rounded-xl text-sm outline-none transition-all ${
                isBound && isReferral
                  ? 'bg-slate-100 border-slate-300 text-slate-700 cursor-not-allowed font-semibold'
                  : 'border-slate-200 focus:border-[#007570] focus:ring-2 focus:ring-[#007570]/20'
              }`}
            />
            <button
              type="button"
              onClick={() => handleApply(isBound && isReferral ? boundInfo?.code : undefined)}
              disabled={loading}
              className="px-5 py-2.5 bg-[#007570] text-white rounded-xl text-sm font-semibold border-0 cursor-pointer hover:bg-[#005a58] disabled:opacity-60 disabled:cursor-not-allowed flex items-center gap-2 transition-all"
            >
              {loading ? (
                <>
                  <Loader2 size={16} className="animate-spin" />
                  <span>Memvalidasi...</span>
                </>
              ) : (
                'Terapkan'
              )}
            </button>
          </div>

          {error && (
            <div className="flex items-start gap-1.5 text-xs text-red-600 font-medium bg-red-50 border border-red-200 rounded-lg p-2.5">
              <AlertCircle size={14} className="shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          {success && (
            <div className="flex items-start gap-1.5 text-xs text-emerald-600 font-medium bg-emerald-50 border border-emerald-200 rounded-lg p-2.5">
              <CheckCircle2 size={14} className="shrink-0 mt-0.5" />
              <span>{success}</span>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default DiscountCodeInput;