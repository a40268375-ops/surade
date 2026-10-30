import React, { useState } from "react";
import { createPortal } from "react-dom";
import axios from "axios";
import toast from "react-hot-toast";
import {
  X,
  Wallet,
  Loader2,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  ArrowRight,
  ShieldCheck,
  Sparkles,
  Banknote,
  Building2,
  Clock,
  QrCode
} from "lucide-react";
import SuradeCoinIcon from "./SuradeCoinIcon";

const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:8000/api";

export default function GoldWithdrawModal({
  isOpen,
  onClose,
  goldBalance = 0,
  onSuccess,
  initialData = null,
}) {
  const [amount, setAmount] = useState(50);
  const [bankName, setBankName] = useState("QRIS");
  const [qrisImage, setQrisImage] = useState(null);
  const [qrisPreview, setQrisPreview] = useState(null);
  const [accountNumber, setAccountNumber] = useState("");
  const [accountName, setAccountName] = useState("");
  const [notes, setNotes] = useState("");
  const [loading, setLoading] = useState(false);

  React.useEffect(() => {
    if (initialData) {
      if (initialData.gold_amount) setAmount(Number(initialData.gold_amount));
      if (initialData.bank_name) setBankName(initialData.bank_name);
      if (initialData.account_number) setAccountNumber(initialData.account_number);
      if (initialData.account_name) setAccountName(initialData.account_name);
      if (initialData.notes) setNotes(initialData.notes);
    } else {
      setAmount(50);
      setBankName("QRIS");
      setQrisImage(null);
      setQrisPreview(null);
      setAccountNumber("");
      setAccountName("");
      setNotes("");
    }
  }, [initialData, isOpen]);

  if (!isOpen) return null;

  // Kurs resmi: 1 Gold = Rp 1.000
  const rateIdr = 1000;
  const numAmount = Number(amount || 0);
  const estimatedRupiah = numAmount * rateIdr;

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!numAmount || numAmount < 50) {
      toast.error("Minimal penarikan adalah 50 Poin Gold (Rp 50.000).");
      return;
    }

    if (numAmount > goldBalance) {
      toast.error(`Saldo Gold Anda tidak mencukupi. Saldo saat ini: ${goldBalance} Gold.`);
      return;
    }

    const isQris = bankName === "QRIS";
    if (isQris) {
      if (!qrisImage) {
        toast.error("Silakan upload gambar QRIS Anda terlebih dahulu.");
        return;
      }
    } else {
      if (!bankName.trim() || !accountNumber.trim() || !accountName.trim()) {
        toast.error("Wajib mengisi nama bank, nomor rekening, dan nama pemilik rekening.");
        return;
      }
    }

    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      let payload;
      let headers = { Authorization: `Bearer ${token}` };

      if (isQris) {
        const formData = new FormData();
        formData.append("gold_amount", numAmount);
        formData.append("amount", numAmount);
        formData.append("bank_name", "QRIS");
        formData.append("account_number", "QRIS");
        formData.append("account_name", accountName.trim() || "QRIS");
        if (notes.trim()) formData.append("notes", notes.trim());
        formData.append("qris_image", qrisImage);
        payload = formData;
        headers["Content-Type"] = "multipart/form-data";
      } else {
        payload = {
          gold_amount: numAmount,
          amount: numAmount,
          bank_name: bankName,
          account_number: accountNumber.trim(),
          account_name: accountName.trim(),
          notes: notes.trim(),
        };
      }

      const res = await axios.post(
        `${API_BASE}/coins/gold/withdraw`,
        payload,
        { headers }
      );

      if (res.data?.success) {
        toast.success(res.data.message || "Permohonan penarikan Poin Gold berhasil diajukan! Admin akan memprosesnya.", {
          duration: 5000,
          icon: "💰",
        });

        // Trigger balance update event across application
        window.dispatchEvent(
          new CustomEvent("poin-balance-updated", {
            detail: { gold_balance: Math.max(0, goldBalance - numAmount) },
          })
        );

        if (onSuccess) onSuccess();
        onClose();
      } else {
        toast.error(res.data?.message || "Gagal mengajukan penarikan Gold.");
      }
    } catch (err) {
      toast.error(err.response?.data?.message || "Terjadi kesalahan saat mengajukan penarikan.");
    } finally {
      setLoading(false);
    }
  };

  const modalNode = (
    <div className="fixed inset-0 z-[99999] flex items-center justify-center p-3 sm:p-5 bg-slate-950/80 backdrop-blur-xs animate-fade-in font-['Poppins',sans-serif] text-left">
      <div className="bg-[#fcfdfd] w-full max-w-3xl sm:max-w-4xl rounded-3xl shadow-2xl border border-amber-200/80 overflow-hidden flex flex-col max-h-[92vh] relative my-auto">
        {/* ── TOP HEADER GRADIENT ORANYE (SEPERTI GAMBAR 2) ── */}
        <div className="bg-gradient-to-r from-amber-600 via-yellow-600 to-amber-700 p-4 sm:p-5 text-white relative shrink-0">
          <button
            onClick={onClose}
            className="absolute top-3.5 right-3.5 sm:top-4 sm:right-4 w-8 h-8 rounded-full bg-black/20 hover:bg-black/35 text-white flex items-center justify-center transition-colors cursor-pointer border border-white/20"
            title="Tutup"
          >
            <X size={16} />
          </button>

          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 pr-9">
            <div className="flex items-center gap-2.5">
              <div className="w-10 h-10 rounded-2xl bg-white/15 backdrop-blur-md flex items-center justify-center border border-white/30 shadow-inner shrink-0">
                <SuradeCoinIcon size={26} type="gold" />
              </div>
              <div>
                <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-white/20 text-[10px] font-bold text-amber-100 mb-0.5 border border-white/20">
                  <Sparkles size={11} className="text-amber-300" />
                  <span>Pencairan Resmi Surade</span>
                </div>
                <h3 className="text-lg sm:text-xl font-black tracking-tight text-white leading-tight">
                  Tarik Saldo Gold
                </h3>
              </div>
            </div>

            {/* Saldo Saat Ini Badge */}
            <div className="px-3 py-1.5 rounded-xl bg-black/25 backdrop-blur-md border border-white/20 flex items-center gap-2 self-start sm:self-auto shadow-inner text-xs">
              <span className="text-[11px] text-amber-100 font-medium">Saldo Gold:</span>
              <div className="flex items-center gap-1.5 font-black text-amber-300 text-xs sm:text-sm">
                <SuradeCoinIcon size={16} type="gold" />
                <span>{Number(goldBalance || 0).toLocaleString("id-ID")} Gold</span>
              </div>
            </div>
          </div>
        </div>

        {/* ── SCROLLABLE MODAL BODY ── */}
        <div className="p-4 sm:p-6 overflow-y-auto flex-1 space-y-4">
          {initialData?.admin_notes && (
            <div className="p-3.5 rounded-2xl bg-rose-50 border border-rose-200 text-xs text-rose-800 space-y-1">
              <div className="flex items-center gap-2 font-black text-rose-900">
                <AlertCircle size={16} className="text-rose-600" />
                <span>Alasan Penolakan dari Admin Sebelumnya:</span>
              </div>
              <p className="italic pl-6">"{initialData.admin_notes}"</p>
              <p className="text-[11px] text-emerald-700 font-bold pl-6 pt-1">
                ✓ Saldo {initialData.gold_amount} Gold telah dikembalikan utuh ke akun Anda. Silakan periksa &amp; perbaiki data rekening bank di bawah ini, lalu klik "Kirim Permohonan Penarikan".
              </p>
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <div className="grid grid-cols-1 md:grid-cols-12 gap-5">
              
              {/* ── KOLOM KIRI (5 Kolom): Ringkasan & Kalkulator Nominal ── */}
              <div className="md:col-span-5 space-y-4">
                {/* Kartu Estimasi Nilai Rupiah */}
                <div className="rounded-2xl p-4 bg-gradient-to-br from-amber-50/80 via-yellow-50/60 to-white border border-amber-200/90 shadow-sm space-y-2">
                  <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">
                    Nilai Konversi Resmi
                  </span>
                  <div className="flex items-baseline gap-2">
                    <span className="text-2xl sm:text-3xl font-black text-amber-800">
                      Rp {estimatedRupiah.toLocaleString("id-ID")}
                    </span>
                  </div>
                  <div className="text-[11px] text-slate-500 pt-1.5 border-t border-amber-200/60 flex items-center justify-between">
                    <span>Minimal Penarikan:</span>
                    <strong className="text-amber-900">50 Gold (Rp 50.000)</strong>
                  </div>
                </div>

              {/* Input Nominal Gold */}
              <div>
                <label className="block text-xs font-black text-slate-800 uppercase tracking-wider mb-1.5">
                  Jumlah Poin Gold yang Ditarik
                </label>
                <div className="relative">
                  <div className="absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none">
                    <SuradeCoinIcon size={20} type="gold" />
                  </div>
                  <input
                    type="number"
                    min="50"
                    max={goldBalance}
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    className="w-full pl-11 pr-24 py-3 rounded-xl border border-slate-300 font-black text-slate-900 text-base focus:outline-hidden focus:ring-2 focus:ring-amber-500 focus:border-amber-500 bg-white shadow-xs"
                    placeholder="Minimal 50"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setAmount(goldBalance)}
                    className="absolute right-2 top-1/2 -translate-y-1/2 px-3 py-1.5 text-[11px] font-black bg-amber-100 hover:bg-amber-200 text-amber-950 rounded-lg cursor-pointer transition-colors"
                  >
                    Maksimal
                  </button>
                </div>
                <div className="flex items-center justify-between mt-1.5 text-[11px] text-slate-500 font-medium">
                  <span>Sisa saldo setelah ditarik:</span>
                  <strong className="text-slate-800">
                    {Math.max(0, goldBalance - numAmount).toLocaleString("id-ID")} Gold
                  </strong>
                </div>
              </div>

              {/* Box Ketentuan & Keamanan */}
              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200/90 text-xs text-slate-600 space-y-2">
                <div className="flex items-center gap-1.5 font-bold text-slate-900 text-[11.5px]">
                  <ShieldCheck size={16} className="text-emerald-600 shrink-0" />
                  <span>Jaminan Penarikan Aman</span>
                </div>
                <ul className="space-y-1.5 text-[11px] text-slate-500 pl-1">
                  <li className="flex items-start gap-1.5">
                    <span className="text-emerald-600 font-bold">•</span>
                    <span>Poin Gold akan otomatis dipotong saat permohonan diajukan.</span>
                  </li>
                  <li className="flex items-start gap-1.5">
                    <span className="text-emerald-600 font-bold">•</span>
                    <span>Admin Surade memverifikasi dan mentransfer dana dalam <strong>1x24 jam kerja</strong>.</span>
                  </li>
                  <li className="flex items-start gap-1.5">
                    <span className="text-emerald-600 font-bold">•</span>
                    <span>Jika ditolak, saldo Gold akan <strong>dikembalikan 100% tanpa potongan</strong>.</span>
                  </li>
                </ul>
              </div>
            </div>

            {/* ── KOLOM KANAN (7 Kolom): Formulir Rekening / E-Wallet ── */}
            <div className="lg:col-span-7 space-y-3.5 bg-white p-5 rounded-2xl border border-slate-200/90 shadow-sm flex flex-col justify-between">
              <div className="space-y-3.5">
                <div className="border-b border-slate-100 pb-2.5">
                  <h4 className="font-extrabold text-slate-900 text-sm flex items-center gap-1.5">
                    <Building2 size={16} className="text-amber-600" />
                    <span>Tujuan Transfer Bank / E-Wallet / QRIS</span>
                  </h4>
                  <p className="text-[11px] text-slate-400">Pastikan data tujuan pencairan benar dan aktif</p>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Pilih Bank / E-Wallet / QRIS <span className="text-rose-500">*</span>
                  </label>
                  <select
                    value={bankName}
                    onChange={(e) => setBankName(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 font-bold text-slate-800 text-xs focus:ring-2 focus:ring-amber-500 bg-white"
                  >
                    <optgroup label="Metode Instan QRIS">
                      <option value="QRIS">QRIS (Scan Barcode & Upload Gambar)</option>
                    </optgroup>
                    <optgroup label="Bank Transfer">
                      <option value="BCA">Bank BCA</option>
                      <option value="Mandiri">Bank Mandiri</option>
                      <option value="BRI">Bank BRI</option>
                      <option value="BNI">Bank BNI</option>
                      <option value="BJB">Bank BJB</option>
                      <option value="BSI">Bank BSI</option>
                    </optgroup>
                    <optgroup label="E-Wallet">
                      <option value="DANA">DANA</option>
                      <option value="GoPay">GoPay</option>
                      <option value="OVO">OVO</option>
                      <option value="ShopeePay">ShopeePay</option>
                    </optgroup>
                  </select>
                </div>

                {/* QRIS Upload (khusus jika pilih QRIS) */}
                {bankName === "QRIS" ? (
                  <div className="space-y-2.5">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">
                        Upload Gambar QRIS Anda <span className="text-rose-500">*</span>
                      </label>
                      <div
                        className="w-full border-2 border-dashed border-amber-300 rounded-xl p-4 flex flex-col items-center justify-center gap-2 cursor-pointer hover:border-amber-500 hover:bg-amber-50/30 transition-colors"
                        onClick={() => document.getElementById("qris-upload-gold").click()}
                      >
                        {qrisPreview ? (
                          <img src={qrisPreview} alt="Preview QRIS" className="max-h-32 rounded-lg object-contain border border-amber-200" />
                        ) : (
                          <>
                            <span className="text-2xl">📷</span>
                            <span className="text-xs text-slate-500 font-medium text-center">
                              Klik untuk upload foto QRIS Anda
                            </span>
                            <span className="text-[10px] text-slate-400">Contoh: Mohon proses ke QRIS saya untuk pencairan saldo</span>
                          </>
                        )}
                      </div>
                      <input
                        id="qris-upload-gold"
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={(e) => {
                          const f = e.target.files?.[0];
                          if (f) {
                            setQrisImage(f);
                            setQrisPreview(URL.createObjectURL(f));
                          }
                        }}
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">
                        Nama Pemilik QRIS <span className="text-rose-500">*</span>
                      </label>
                      <input
                        type="text"
                        value={accountName}
                        onChange={(e) => setAccountName(e.target.value)}
                        placeholder="Nama lengkap pemilik QRIS"
                        className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 font-bold text-slate-900 text-xs focus:ring-2 focus:ring-amber-500"
                        required
                      />
                    </div>
                  </div>
                ) : (
                  <>
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">
                        Nomor Rekening / No. HP E-Wallet <span className="text-rose-500">*</span>
                      </label>
                      <input
                        type="text"
                        value={accountNumber}
                        onChange={(e) => setAccountNumber(e.target.value)}
                        placeholder="Contoh: 0954152045 atau 08123456789"
                        className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 font-mono font-bold text-slate-900 text-xs focus:ring-2 focus:ring-amber-500"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">
                        Nama Pemilik Rekening <span className="text-rose-500">*</span>
                      </label>
                      <input
                        type="text"
                        value={accountName}
                        onChange={(e) => setAccountName(e.target.value)}
                        placeholder="Nama lengkap sesuai buku tabungan / e-wallet"
                        className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 font-bold text-slate-900 text-xs focus:ring-2 focus:ring-amber-500"
                        required
                      />
                    </div>
                  </>
                )}

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Catatan Tambahan (Opsional)
                  </label>
                  <input
                    type="text"
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="Contoh: Mohon proses segera untuk kebutuhan usaha..."
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs text-slate-700"
                  />
                </div>
              </div>

              {/* Tombol Eksekusi Penarikan */}
              <div className="pt-3 border-t border-slate-100">
                <button
                  type="submit"
                  disabled={loading || goldBalance < 50 || numAmount < 50 || numAmount > goldBalance}
                  className="w-full py-3.5 rounded-xl bg-gradient-to-r from-amber-500 via-amber-600 to-yellow-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-black text-xs sm:text-sm flex items-center justify-center gap-2 shadow-lg shadow-amber-500/25 cursor-pointer disabled:opacity-40 transition-all active:scale-98"
                >
                  {loading ? (
                    <>
                      <Loader2 size={16} className="animate-spin" />
                      <span>Mengirim Pengajuan Penarikan...</span>
                    </>
                  ) : (
                    <>
                      <Wallet size={16} />
                      <span>Ajukan Penarikan (Rp {estimatedRupiah.toLocaleString("id-ID")})</span>
                      <ArrowRight size={15} />
                    </>
                  )}
                </button>
              </div>
            </div>

          </div>
        </form>
      </div>
    </div>
  </div>
);

  return typeof document !== "undefined" ? createPortal(modalNode, document.body) : modalNode;
}
