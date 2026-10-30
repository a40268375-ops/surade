import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import {
  X,
  CreditCard,
  CheckCircle2,
  AlertTriangle,
  Upload,
  Loader2,
  Sparkles,
  Zap,
  PlusCircle,
  Share2,
} from "lucide-react";
import toast from "react-hot-toast";
import api from "../services/api";
import WhatsAppIcon from "./icons/WhatsAppIcon";
import SuradeCoinIcon from "./SuradeCoinIcon";
import { BuyCoinModal } from "./SuradeCoinModal";

export default function WhatsAppAccessModal({
  isOpen,
  onClose,
  business,
  waSettings,
  product = null,
  onSuccess = () => {},
}) {
  const [isZoomedQris, setIsZoomedQris] = useState(false);
  const [waProofFile, setWaProofFile] = useState(null);
  const [waProofPreview, setWaProofPreview] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [payingWithPoin, setPayingWithPoin] = useState(false);
  const [poinBalance, setPoinBalance] = useState(null);
  const [silverBalance, setSilverBalance] = useState(0);
  const [goldBalance, setGoldBalance] = useState(0);
  const [selectedCoinType, setSelectedCoinType] = useState("silver");
  const [showBuyCoinModal, setShowBuyCoinModal] = useState(false);
  const [buyCoinModalInitialType, setBuyCoinModalInitialType] = useState("silver");

  // Referral states for WhatsApp access bonus
  const [referralCode, setReferralCode] = useState(() => {
    try {
      const u = JSON.parse(localStorage.getItem("user") || "{}");
      return u?.applied_referral?.code || u?.applied_referral?.referral_code || localStorage.getItem("applied_referral_code") || "";
    } catch {
      return "";
    }
  });
  const [appliedReferral, setAppliedReferral] = useState(() => {
    try {
      const u = JSON.parse(localStorage.getItem("user") || "{}");
      return u?.applied_referral || null;
    } catch {
      return null;
    }
  });
  const [referralLoading, setReferralLoading] = useState(false);
  const [referralError, setReferralError] = useState("");

  useEffect(() => {
    if (isOpen) {
      fetchPoinBalance();
    }
  }, [isOpen]);

  const fetchPoinBalance = async () => {
    try {
      const res = await api.get("/coins/balance");
      if (res.data?.success) {
        setPoinBalance(Number(res.data.balance || 0));
        setSilverBalance(Number(res.data.silver_balance || 0));
        setGoldBalance(Number(res.data.gold_balance || 0));

        // Auto select type based on balance availability
        if (Number(res.data.silver_balance || 0) >= 10) {
          setSelectedCoinType("silver");
        } else if (Number(res.data.gold_balance || 0) >= 10) {
          setSelectedCoinType("gold");
        }
      }
    } catch (e) {
      // Ignored if user not logged in
    }
  };

  const handleApplyReferral = async (targetCode = null) => {
    const code = (typeof targetCode === "string" ? targetCode : referralCode).trim().toUpperCase();
    if (!code) return;
    setReferralLoading(true);
    setReferralError("");
    try {
      const res = await api.post("/referrals/validate", {
        code,
        service_type: "whatsapp",
        amount: 10000,
      });
      if (res.data?.success && (res.data?.referral || res.data?.data)) {
        const refData = res.data.referral || res.data.data;
        setAppliedReferral(refData);
        setReferralCode(refData.code || refData.referral_code || code);
        toast.success(res.data.message || `Kode referral ${code} berhasil dipasang!`);
      } else {
        setReferralError(res.data?.message || "Kode referral tidak valid.");
        toast.error(res.data?.message || "Kode referral tidak valid.");
      }
    } catch (err) {
      const msg = err.response?.data?.message || "Kode referral tidak valid atau sedang nonaktif.";
      setReferralError(msg);
      toast.error(msg);
    } finally {
      setReferralLoading(false);
    }
  };

  if (!isOpen || !waSettings) return null;

  const baseAmount = Number(waSettings.amount || 5000);
  const poinCost = Math.max(1, Math.round(baseAmount / 1000));
  const activeBalance = selectedCoinType === "silver" ? silverBalance : goldBalance;
  const canAfford = activeBalance >= poinCost;

  const handlePayWithPoin = async () => {
    setPayingWithPoin(true);
    try {
      const refCodeToSend = appliedReferral?.code || appliedReferral?.referral_code || referralCode.trim().toUpperCase() || null;
      const res = await api.post("/coins/unlock-whatsapp", {
        business_id: business?.id,
        coin_type: selectedCoinType,
        referral_code: refCodeToSend,
      });

      if (res.data?.success) {
        toast.success(res.data.message || "Akses WhatsApp berhasil dibuka secara instan menggunakan Poin!");
        onSuccess(res.data.whatsapp || res.data.reference_id || null);
        onClose();
      } else {
        toast.error(res.data?.message || "Gagal melakukan pembayaran dengan Poin.");
      }
    } catch (err) {
      const msg = err.response?.data?.message || "Gagal bayar dengan Poin.";
      toast.error(msg);
    } finally {
      setPayingWithPoin(false);
    }
  };

  const handleSubmitProof = async () => {
    if (!waProofFile) {
      toast.error("Wajib mengunggah foto bukti pembayaran QRIS terlebih dahulu!");
      return;
    }

    setIsSubmitting(true);
    try {
      const formData = new FormData();
      if (business?.id) formData.append("business_id", business.id);
      if (business?.name) formData.append("business_name", business.name);
      formData.append("fee_amount", baseAmount);
      formData.append("discount_amount", 0);
      formData.append("payment_method", "QRIS (Semua E-Wallet & Bank)");

      try {
        const u = localStorage.getItem("user");
        if (u) {
          const parsed = JSON.parse(u);
          if (parsed?.id) formData.append("user_id", parsed.id);
          if (parsed?.name) formData.append("customer_name", parsed.name);
          if (parsed?.phone || parsed?.email) formData.append("customer_phone", parsed.phone || parsed.email);
        }
      } catch (e) {}

      if (waProofFile) {
        formData.append("proof_image", waProofFile);
      }

      const res = await api.post("/whatsapp-access-log", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      toast.success("Bukti pembayaran QRIS berhasil dikirim. Menunggu verifikasi admin.");
      onSuccess(res?.data?.id || null);
      onClose();
    } catch (e) {
      console.error("Error submitting WA access proof:", e);
      toast.error(
        e?.response?.data?.message ||
          "Gagal mengirim bukti pembayaran QRIS. Silakan coba lagi."
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const modalNode = (
    <div
      className="fixed inset-0 bg-slate-900/75 backdrop-blur-xs z-[99999] flex items-center justify-center p-4 overflow-y-auto font-['Poppins',sans-serif]"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-2xl w-full max-w-md shadow-2xl border border-slate-100 overflow-hidden my-4 transition-all"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-[#007570] to-[#00b3ab] px-5 py-4 text-white text-center relative">
          <button
            onClick={onClose}
            className="absolute top-3 right-3 w-7 h-7 rounded-full bg-white/20 hover:bg-white/30 flex items-center justify-center text-white cursor-pointer border-0 transition-all"
          >
            <X size={14} />
          </button>
          <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center mx-auto mb-2 backdrop-blur-sm shadow-inner">
            <CreditCard className="w-5 h-5 text-white" />
          </div>
          <h3 className="text-base font-black">Pembayaran &amp; Akses Layanan Surade.com</h3>
          <p className="text-[11px] text-white/80 mt-0.5">
            Biaya administrasi resmi &amp; transaksi terverifikasi Surade.com
          </p>
        </div>

        {/* Body */}
        <div className="px-5 py-4 space-y-3.5 max-h-[75vh] overflow-y-auto">
          {/* ── BAYAR INSTAN DENGAN POIN CARD ── */}
          <div className="p-4 rounded-2xl bg-gradient-to-r from-amber-500/15 via-emerald-500/10 to-teal-500/15 border-2 border-amber-400/80 shadow-sm space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <SuradeCoinIcon size={24} type={selectedCoinType} />
                <span className="text-xs font-black text-slate-900 uppercase tracking-wide">
                  Bayar dengan Poin ({poinCost} Poin)
                </span>
              </div>
              <span className="text-[11px] font-black px-2.5 py-0.5 rounded-full bg-amber-400 text-slate-950 flex items-center gap-1">
                <span>{poinCost} Poin</span>
              </span>
            </div>
            <p className="text-[11.5px] text-slate-600 leading-relaxed">
              Langsung terbuka otomatis <strong>tanpa upload bukti transfer</strong> dan <strong>tanpa menunggu verifikasi admin</strong>!
            </p>

            {/* Pilihan Jenis Poin: Silver vs Gold */}
            <div className="grid grid-cols-2 gap-2">
              {/* Poin Silver */}
              <div
                onClick={() => setSelectedCoinType("silver")}
                className={`p-2.5 rounded-xl border-2 transition-all cursor-pointer flex flex-col justify-between ${
                  selectedCoinType === "silver"
                    ? "border-slate-800 bg-white shadow-sm ring-2 ring-slate-400/30"
                    : "border-slate-200 bg-white/70 hover:border-slate-400"
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <div className="flex items-center gap-1.5">
                    <SuradeCoinIcon size={18} type="silver" />
                    <span className="text-xs font-black text-slate-900">Poin Silver</span>
                  </div>
                  <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${
                    selectedCoinType === "silver" ? "border-slate-900 bg-slate-900 text-white" : "border-slate-300"
                  }`}>
                    {selectedCoinType === "silver" && <div className="w-1.5 h-1.5 rounded-full bg-white" />}
                  </div>
                </div>
                <div className="text-[11px] text-slate-600 font-semibold">
                  Saldo: <strong className={silverBalance >= poinCost ? "text-emerald-700 font-extrabold" : "text-rose-600 font-extrabold"}>{silverBalance} Silver</strong>
                </div>
              </div>

              {/* Poin Gold */}
              <div
                onClick={() => setSelectedCoinType("gold")}
                className={`p-2.5 rounded-xl border-2 transition-all cursor-pointer flex flex-col justify-between ${
                  selectedCoinType === "gold"
                    ? "border-amber-500 bg-amber-50/70 shadow-sm ring-2 ring-amber-400/40"
                    : "border-slate-200 bg-white/70 hover:border-amber-300"
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <div className="flex items-center gap-1.5">
                    <SuradeCoinIcon size={18} type="gold" />
                    <span className="text-xs font-black text-slate-900">Poin Gold</span>
                  </div>
                  <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${
                    selectedCoinType === "gold" ? "border-amber-600 bg-amber-600 text-white" : "border-slate-300"
                  }`}>
                    {selectedCoinType === "gold" && <div className="w-1.5 h-1.5 rounded-full bg-white" />}
                  </div>
                </div>
                <div className="text-[11px] text-slate-600 font-semibold">
                  Saldo: <strong className={goldBalance >= poinCost ? "text-amber-800 font-extrabold" : "text-rose-600 font-extrabold"}>{goldBalance} Gold</strong>
                </div>
              </div>
            </div>

            {/* Top up shortcut if insufficient */}
            {!canAfford && (
              <div className="bg-amber-50 border border-amber-200/80 p-2.5 rounded-xl text-[11px] text-amber-950 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div className="leading-tight">
                  <span className="font-bold">Saldo {selectedCoinType === "silver" ? "Silver" : "Gold"} kurang ({activeBalance}/{poinCost}).</span>
                  {selectedCoinType === "silver" && (
                    <span className="block text-[10px] text-amber-800 mt-0.5">Silver didapat gratis dari absensi harian. Beralih ke Gold untuk top up instan.</span>
                  )}
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setBuyCoinModalInitialType("gold");
                    setShowBuyCoinModal(true);
                  }}
                  className="px-2.5 py-1 rounded-lg bg-amber-500 hover:bg-amber-600 text-slate-950 font-black text-[10.5px] cursor-pointer shrink-0 self-start sm:self-auto"
                >
                  + Top Up Gold
                </button>
              </div>
            )}

            {/* ── REFERRAL CODE INPUT & ATURAN BONUS REFERRAL ── */}
            <div className="bg-white/95 p-3 rounded-xl border border-slate-200/90 space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-[11px] font-black text-slate-800 flex items-center gap-1.5">
                  <Share2 size={13} className="text-[#007570]" />
                  <span>Kode Referral (Opsional)</span>
                </label>
                {appliedReferral && (
                  <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-300">
                    Terpasang: {appliedReferral.code || appliedReferral.referral_code}
                  </span>
                )}
              </div>

              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="Masukkan kode referral mitra..."
                  value={referralCode}
                  onChange={(e) => setReferralCode(e.target.value.toUpperCase())}
                  disabled={Boolean(appliedReferral?.is_bound)}
                  className="flex-1 px-3 py-1.5 text-xs font-mono font-bold uppercase tracking-wider border border-slate-300 rounded-lg bg-white focus:outline-none focus:border-[#007570]"
                />
                {appliedReferral ? (
                  !appliedReferral?.is_bound && (
                    <button
                      type="button"
                      onClick={() => {
                        setAppliedReferral(null);
                        setReferralCode("");
                        setReferralError("");
                      }}
                      className="px-2.5 py-1.5 text-[11px] font-bold text-rose-600 bg-rose-50 hover:bg-rose-100 rounded-lg transition-colors cursor-pointer border border-rose-200"
                    >
                      Hapus
                    </button>
                  )
                ) : (
                  <button
                    type="button"
                    onClick={() => handleApplyReferral()}
                    disabled={referralLoading || !referralCode.trim()}
                    className="px-3 py-1.5 text-xs font-bold bg-[#007570] hover:bg-[#005f5b] text-white rounded-lg disabled:opacity-50 transition-colors cursor-pointer border-0 flex items-center gap-1"
                  >
                    {referralLoading ? <Loader2 size={12} className="animate-spin" /> : "Gunakan"}
                  </button>
                )}
              </div>

              {referralError && (
                <p className="text-[10.5px] text-rose-600 font-semibold">{referralError}</p>
              )}

              {/* ── KETERANGAN 3 ATURAN BONUS REFERRAL ── */}
              {selectedCoinType === "gold" && appliedReferral ? (
                <div className="p-2 rounded-lg bg-amber-50 border border-amber-300/80 text-[11px] text-amber-950 flex items-start gap-1.5">
                  <Sparkles size={14} className="text-amber-600 shrink-0 mt-0.5" />
                  <div>
                    <strong className="text-amber-900 block font-bold">Bonus Referral Aktif: +1 Poin Gold!</strong>
                    <span>Pemilik kode referral <strong>{appliedReferral.referrer_name || appliedReferral.name || appliedReferral.code}</strong> akan mendapatkan bonus <strong>1 Poin Gold</strong> karena Anda membuka WhatsApp dengan Gold.</span>
                  </div>
                </div>
              ) : selectedCoinType === "gold" && !appliedReferral ? (
                <div className="p-2 rounded-lg bg-slate-50 border border-slate-200 text-[10.5px] text-slate-600 flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-slate-400 shrink-0" />
                  <span>Poin Gold tanpa kode referral: Tidak ada bonus referral untuk siapa pun.</span>
                </div>
              ) : null}
            </div>

            <button
              type="button"
              onClick={handlePayWithPoin}
              disabled={payingWithPoin || !canAfford}
              className={`w-full py-2.5 rounded-xl ${
                !canAfford
                  ? "bg-slate-200 text-slate-400 cursor-not-allowed border border-slate-300"
                  : selectedCoinType === "gold"
                  ? "bg-gradient-to-r from-amber-500 via-amber-600 to-amber-700 hover:from-amber-400 hover:to-amber-600 text-slate-950 font-black shadow-md cursor-pointer border border-amber-300"
                  : "bg-gradient-to-r from-slate-800 via-slate-900 to-teal-900 hover:opacity-95 text-white font-black shadow-md cursor-pointer border border-slate-700"
              } text-xs flex items-center justify-center gap-1.5 transition-all`}
            >
              {payingWithPoin ? (
                <>
                  <Loader2 size={14} className="animate-spin" />
                  <span>Memproses Pembayaran Poin...</span>
                </>
              ) : !canAfford ? (
                <span>Saldo Kurang (Butuh {poinCost} Poin {selectedCoinType === "silver" ? "Silver" : "Gold"})</span>
              ) : (
                <>
                  <Zap size={14} className={selectedCoinType === "gold" ? "text-amber-950 fill-amber-950" : "fill-white"} />
                  <span>Buka WhatsApp Sekarang ({poinCost} Poin {selectedCoinType === "silver" ? "Silver" : "Gold"})</span>
                </>
              )}
            </button>
          </div>

          <div className="relative flex py-1 items-center">
            <div className="flex-grow border-t border-slate-200"></div>
            <span className="flex-shrink mx-3 text-[11px] font-bold text-slate-400 uppercase">atau bayar via QRIS</span>
            <div className="flex-grow border-t border-slate-200"></div>
          </div>

          {/* Product note if accessed from product */}
          {product && (
            <div className="p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-600 flex items-center gap-2">
              <span className="font-bold text-slate-700">Tujuan Kontak:</span>
              <span className="truncate font-semibold text-[#007570]">{product.name}</span>
            </div>
          )}

          {/* Instruction alert */}
          <p className="text-xs text-slate-600 leading-relaxed text-center bg-amber-50 border border-amber-100 rounded-xl px-3.5 py-2.5">
            {waSettings.instruction ||
              "Akses kontak langsung WhatsApp penjual dikenakan biaya administrasi resmi untuk keamanan dan pencegahan spam."}
          </p>

          {/* QRIS Official Section */}
          <div className="border border-teal-100 bg-gradient-to-br from-teal-50/60 to-emerald-50/40 rounded-2xl p-4 text-center space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-black text-slate-800 uppercase tracking-wide">
                Scan QRIS Resmi Surade.com
              </span>
              <span className="text-[10px] font-bold bg-teal-100 text-[#007570] px-2 py-0.5 rounded-full">
                Semua Bank &amp; E-Wallet
              </span>
            </div>

            {/* QR Image Display */}
            <div className="bg-white p-3 rounded-2xl border border-slate-200/80 shadow-xs inline-block mx-auto max-w-[210px]">
              <img
                src={waSettings?.qris_image || "/logos/qris.png"}
                alt="QRIS Pembayaran Resmi"
                className="w-44 h-44 object-contain rounded-lg mx-auto"
                onError={(e) => {
                  e.currentTarget.src = "/logos/qris.png";
                }}
              />
              <p className="text-[10px] text-slate-500 font-semibold mt-2">
                Merchant: <strong>Surade.com</strong>
              </p>
            </div>

            {/* Total Nominal */}
            <div className="bg-white/80 p-2.5 rounded-xl border border-teal-100 flex items-center justify-between text-xs">
              <span className="font-semibold text-slate-600">Total Biaya Akses QRIS:</span>
              <span className="text-base font-black text-[#007570]">
                Rp {baseAmount.toLocaleString("id-ID")}
              </span>
            </div>

            <p className="text-[11px] text-slate-500 leading-relaxed text-left bg-slate-50 p-2.5 rounded-xl border border-slate-200">
              💡 Buka m-Banking (BCA, Mandiri, BRI, BNI) atau E-Wallet (GoPay, OVO, DANA, ShopeePay), scan kode QR di atas, bayar tepat <strong>Rp {baseAmount.toLocaleString("id-ID")}</strong>, lalu upload bukti transfer di bawah ini.
            </p>
          </div>

          {/* Upload Proof Section */}
          <div className="space-y-1.5 pt-1">
            <label className="block text-xs font-bold text-slate-800 flex items-center justify-between">
              <span>Kirim Bukti Pembayaran:</span>
              <span className="text-[10.5px] text-rose-600 font-extrabold uppercase bg-rose-50 border border-rose-200 px-2 py-0.5 rounded-md">
                * Wajib Diunggah
              </span>
            </label>
            <div className="flex items-center gap-3">
              <label
                className={`flex-1 border-2 border-dashed ${
                  waProofFile
                    ? "border-emerald-400 bg-emerald-50/50"
                    : "border-teal-300 hover:border-[#007570] bg-teal-50/40 hover:bg-teal-50"
                } p-3.5 rounded-2xl cursor-pointer transition-all flex items-center justify-center gap-2 text-xs font-bold ${
                  waProofFile ? "text-emerald-700" : "text-[#007570]"
                }`}
              >
                <Upload size={16} />
                <span>
                  {waProofFile ? "Ganti Foto Bukti Transfer" : "Unggah Foto Bukti Transfer (Wajib)"}
                </span>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) {
                      setWaProofFile(file);
                      setWaProofPreview(URL.createObjectURL(file));
                    }
                  }}
                  className="hidden"
                />
              </label>
            </div>
            {waProofPreview && (
              <div className="relative mt-2 rounded-2xl overflow-hidden border-2 border-emerald-300 w-full h-36 bg-slate-900/5 flex items-center justify-center">
                <img src={waProofPreview} alt="Bukti Transfer" className="h-full object-contain" />
                <button
                  type="button"
                  onClick={() => {
                    setWaProofFile(null);
                    setWaProofPreview(null);
                  }}
                  className="absolute top-2 right-2 w-7 h-7 rounded-full bg-slate-900/80 text-white flex items-center justify-center border-0 cursor-pointer hover:bg-rose-600 transition-colors"
                  title="Hapus bukti"
                >
                  <X size={14} />
                </button>
              </div>
            )}
          </div>

          {/* Action buttons */}
          <div className="pt-2 space-y-2">
            <button
              onClick={handleSubmitProof}
              disabled={isSubmitting || !waProofFile}
              className={`w-full py-3.5 rounded-2xl ${
                waProofFile
                  ? "bg-gradient-to-r from-[#25D366] to-[#128C7E] hover:from-[#22bf5b] hover:to-[#0f7a6e]"
                  : "bg-slate-300 cursor-not-allowed"
              } text-white font-black text-sm shadow-md hover:shadow-lg transition-all cursor-pointer border-0 flex items-center justify-center gap-2 disabled:opacity-60`}
            >
              {isSubmitting ? (
                <>
                  <Loader2 size={16} className="animate-spin" />
                  <span>Mengirim Bukti...</span>
                </>
              ) : (
                <>
                  <WhatsAppIcon size={18} />
                  <span>Kirim Bukti Pembayaran QRIS</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      <BuyCoinModal
        isOpen={showBuyCoinModal}
        onClose={() => {
          setShowBuyCoinModal(false);
          fetchPoinBalance();
        }}
        initialCoinType={buyCoinModalInitialType}
        onSuccess={() => {
          fetchPoinBalance();
        }}
      />
    </div>
  );

  return typeof document !== "undefined" ? createPortal(modalNode, document.body) : null;
}
