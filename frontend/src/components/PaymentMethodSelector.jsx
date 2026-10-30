import React, { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { Check, Copy, ShieldCheck, Download, Maximize2, X, ZoomIn } from "lucide-react";
import api from "../services/api";

/**
 * Logo resmi lokal Surade.com
 */
export const PAYMENT_LOGOS = {
  "mandiri": "/logos/mandiri.png",
  "bank mandiri": "/logos/mandiri.png",
  "bni": "/logos/bni.png",
  "bank bni": "/logos/bni.png",
  "bca": "/logos/bca.png",
  "bank bca": "/logos/bca.png",
  "maybank": "/logos/maybank.png",
  "bank maybank": "/logos/maybank.png",
  "bjb": "/logos/bjb.png",
  "bank bjb": "/logos/bjb.png",
  "ovo": "/logos/ovo.png",
  "dana": "/logos/dana.png",
  "gopay": "/logos/gopay.png",
  "qris": "/logos/qris.png",
  "qris (semua e-wallet & bank)": "/logos/qris.png",
};

export const getPaymentLogo = (idOrName) => {
  if (!idOrName) return "/logos/qris.png";
  const raw = String(idOrName).toLowerCase().replace(/^transfer\s+/, "").replace(/^bank\s+/, "").trim();
  if (raw.includes("midtrans")) return "/logos/midtrans.png";
  if (raw.includes("mandiri")) return "/logos/mandiri.png";
  if (raw.includes("bni")) return "/logos/bni.png";
  if (raw.includes("bca")) return "/logos/bca.png";
  if (raw.includes("maybank")) return "/logos/maybank.png";
  if (raw.includes("bjb")) return "/logos/bjb.png";
  if (raw.includes("ovo")) return "/logos/ovo.png";
  if (raw.includes("dana")) return "/logos/dana.png";
  if (raw.includes("gopay")) return "/logos/gopay.png";
  if (raw.includes("qris")) return "/logos/qris.png";
  if (PAYMENT_LOGOS[raw]) return PAYMENT_LOGOS[raw];
  return `/logos/${raw}.png`;
};

export const DEFAULT_OFFICIAL_METHODS = [
  {
    category: "Transfer Bank / Rekening Resmi",
    items: [
      { id: "Mandiri", name: "Bank Mandiri", accountName: "Triwala Mitra Bestari", accountNumber: "133-0011-409-331", logo: "/logos/mandiri.png", badgeColor: "bg-[#003d79] text-white", isActive: true },
      { id: "BNI", name: "Bank BNI", accountName: "Triwala Mitra Bestari", accountNumber: "0973607008", logo: "/logos/bni.png", badgeColor: "bg-[#f15a24] text-white", isActive: true },
      { id: "BCA", name: "Bank BCA", accountName: "Triwala Mitra Bestari", accountNumber: "0954152045", logo: "/logos/bca.png", badgeColor: "bg-[#00529c] text-white", isActive: true },
      { id: "Maybank", name: "Maybank", accountName: "Triwala Mitra Bestari", accountNumber: "2097000009", logo: "/logos/maybank.png", badgeColor: "bg-[#ffc800] text-black", isActive: true },
      { id: "BJB", name: "Bank BJB", accountName: "Triwala Mitra Bestari", accountNumber: "0119213282001", logo: "/logos/bjb.png", badgeColor: "bg-[#0072bc] text-white", isActive: true },
    ]
  },
  {
    category: "E-Wallet",
    items: [
      { id: "OVO", name: "OVO", accountName: "Triwala Mitra Bestari", accountNumber: "0811-1919-711", logo: "/logos/ovo.png", badgeColor: "bg-[#4c2a86] text-white", isActive: true },
      { id: "DANA", name: "DANA", accountName: "0811-1919-711", accountNumber: "0811-1919-711", logo: "/logos/dana.png", badgeColor: "bg-[#008cff] text-white", isActive: true },
      { id: "GoPay", name: "GoPay", accountName: "0811-1919-711", accountNumber: "0811-1919-711", logo: "/logos/gopay.png", badgeColor: "bg-[#00a5cf] text-white", isActive: true },
    ]
  },
  {
    category: "QRIS",
    items: [
      { id: "QRIS", name: "QRIS (Semua E-Wallet & Bank)", accountName: "Triwala Mitra Bestari", accountNumber: "Scan QR Code", logo: "/logos/qris.png", badgeColor: "bg-[#007570] text-white", isQRIS: true, isActive: true },
    ]
  }
];

export default function PaymentMethodSelector({
  methods = null,
  selectedMethod = null,
  onSelect = null,
  title = null,
  showInstruction = true,
  qrisImage = null,
  customAccount = null,
  amount = null,
  finalPrice = null,
  allowPoints = false,
  pointsCost = null,
  pointsBalance = null,
  onPayWithPoints = null,
  payingWithPoints = false,
}) {
  const [copiedAccount, setCopiedAccount] = useState(false);
  const [isZoomed, setIsZoomed] = useState(false);
  const [apiMethods, setApiMethods] = useState(() => {
    try {
      const cached = localStorage.getItem("official_payment_methods_custom");
      return cached ? JSON.parse(cached) : null;
    } catch (error) {
      console.warn("Failed to parse cached payment methods:", error);
      return null;
    }
  });

  const [paymentRules, setPaymentRules] = useState(() => {
    try {
      const cached = localStorage.getItem("platform_payment_rules");
      return cached ? JSON.parse(cached) : {
        bank_transfer_enabled: true,
        bank_transfer_min_amount: 10000,
        qris_enabled: true,
        points_enabled: true,
        point_exchange_rate_idr: 1000,
      };
    } catch {
      return {
        bank_transfer_enabled: true,
        bank_transfer_min_amount: 10000,
        qris_enabled: true,
        points_enabled: true,
        point_exchange_rate_idr: 1000,
      };
    }
  });

  const [liveQrisImage, setLiveQrisImage] = useState(() => {
    return qrisImage || localStorage.getItem("platform_qris_image") || null;
  });

  useEffect(() => {
    if (qrisImage) {
      setLiveQrisImage(qrisImage);
    }
  }, [qrisImage]);

  // Fetch fresh live payment methods and official QRIS + Rules from backend API on mount
  useEffect(() => {
    let isMounted = true;
    const fetchMethods = async () => {
      try {
        const res = await api.get("/payment-methods");
        const data = res.data?.data?.methods;
        const fetchedQris = res.data?.data?.qris_image;
        const fetchedRules = res.data?.data?.rules;

        if (isMounted) {
          if (Array.isArray(data) && data.length > 0) {
            setApiMethods(data);
            localStorage.setItem("official_payment_methods_custom", JSON.stringify(data));
          }
          if (fetchedQris) {
            setLiveQrisImage(fetchedQris);
            localStorage.setItem("platform_qris_image", fetchedQris);
          }
          if (fetchedRules) {
            setPaymentRules(fetchedRules);
            localStorage.setItem("platform_payment_rules", JSON.stringify(fetchedRules));
          }
        }
      } catch (err) {
        console.warn("PaymentMethodSelector: failed to fetch live payment methods:", err);
        if (isMounted) {
          setApiMethods(null);
        }
      }
    };
    fetchMethods();
    return () => { isMounted = false; };
  }, []);

  // Strict check if a method is active
  const isItemActive = (m) => {
    if (!m) return false;
    if (m.isActive === false || m.isActive === "false" || m.isActive === 0 || m.isActive === "0") {
      return false;
    }
    return true;
  };

  // Normalize method matching (supports "BCA", "Bank BCA", "Transfer Bank BCA", id or name)
  const isMethodSelected = (item) => {
    if (!selectedMethod) return false;
    const sel = typeof selectedMethod === "object" ? selectedMethod.name || selectedMethod.id : selectedMethod;
    const s = String(sel).toLowerCase().replace(/^transfer\s+/, "").replace(/^bank\s+/, "").trim();
    const iId = String(item.id || "").toLowerCase().replace(/^transfer\s+/, "").replace(/^bank\s+/, "").trim();
    const iName = String(item.name || "").toLowerCase().replace(/^transfer\s+/, "").replace(/^bank\s+/, "").trim();
    
    return s === iId || s === iName || (s.includes("qris") && iId.includes("qris"));
  };

  // Clean helpers
  const cleanAccNum = (val) => (!val || val === "0123456789" || val === "XXX" || String(val).toLowerCase().includes("belum") ? "xxxx" : val);
  const cleanAccName = (val) => (!val || val === "Official Surade.com" || String(val).toLowerCase().includes("belum") ? (customAccount?.accountName || "Triwala Mitra Bestari") : val);

  // Calculation of effective transaction amount
  const effectiveAmount = (amount !== null && amount !== undefined) 
    ? Number(amount) 
    : (finalPrice !== null && finalPrice !== undefined ? Number(finalPrice) : null);

  const minBankAmount = Number(paymentRules?.bank_transfer_min_amount || 10000);
  const isUnderMinBank = effectiveAmount !== null && effectiveAmount < minBankAmount;
  const allowBank = paymentRules?.bank_transfer_enabled !== false && !isUnderMinBank;
  const allowQris = paymentRules?.qris_enabled !== false;

  const rawList = methods || apiMethods;
  let groups = [];

  if (Array.isArray(rawList) && rawList.length > 0) {
    if (rawList[0]?.category && Array.isArray(rawList[0]?.items)) {
      // Already grouped
      groups = rawList.map(g => {
        const catLower = String(g.category || "").toLowerCase();
        const isBankCat = catLower.includes("bank") || catLower.includes("transfer");
        const isQrisCat = catLower.includes("qris");

        if (isBankCat && !allowBank) return null;
        if (isQrisCat && !allowQris) return null;

        return {
          ...g,
          items: g.items.filter(isItemActive).map(item => ({
            ...item,
            logo: getPaymentLogo(item.name || item.id || item.logoUrl),
            accountNumber: cleanAccNum(item.accountNumber || item.account_number),
            accountName: cleanAccName(item.accountName || item.account_holder || customAccount?.accountName),
            isQRIS: item.isQRIS || String(item.id || item.name).toLowerCase().includes("qris"),
          }))
        };
      }).filter(Boolean).filter(g => g.items.length > 0);
    } else {
      // Flat list of methods -> group them with rules
      const gateWayList = [];
      const banks = [];
      const ewallets = [];
      const qrisList = [];

      rawList.filter(isItemActive).forEach((m) => {
        const itemObj = {
          ...m,
          logo: getPaymentLogo(m.name || m.id || m.logoUrl),
          accountNumber: cleanAccNum(m.accountNumber || m.account_number),
          accountName: cleanAccName(m.accountName || m.account_holder || customAccount?.accountName),
          isQRIS: m.isQRIS || String(m.id || m.name).toLowerCase().includes("qris"),
          isMidtrans: m.isMidtrans || String(m.id || m.name).toLowerCase().includes("midtrans"),
        };
        const n = String(m.name || m.id || "").toLowerCase();
        const cat = String(m.category || "").toLowerCase();
        if (n.includes("midtrans") || cat.includes("midtrans") || cat.includes("gateway")) {
          // Midtrans gateway
          if (allowBank || allowQris) {
            gateWayList.push(itemObj);
          }
        } else if (n.includes("qris") || cat === "qris") {
          if (allowQris) {
            qrisList.push(itemObj);
          }
        } else if (n.includes("ovo") || n.includes("dana") || n.includes("gopay") || n.includes("shopee") || cat === "ewallet") {
          ewallets.push(itemObj);
        } else {
          // Bank transfer
          if (allowBank) {
            banks.push(itemObj);
          }
        }
      });

      if (gateWayList.length > 0) {
        groups.push({ category: "Payment Gateway (Otomatis & Instant)", items: gateWayList });
      }
      if (banks.length > 0) {
        groups.push({ category: "Transfer Bank / Rekening Resmi", items: banks });
      }
      if (ewallets.length > 0) {
        groups.push({ category: "E-Wallet", items: ewallets });
      }
      if (qrisList.length > 0) {
        groups.push({ category: "QRIS", items: qrisList });
      }
    }
  } else {
    // Fallback to default filtered methods
    groups = DEFAULT_OFFICIAL_METHODS.map(g => {
      const catLower = String(g.category || "").toLowerCase();
      if ((catLower.includes("bank") || catLower.includes("transfer")) && !allowBank) return null;
      if (catLower.includes("qris") && !allowQris) return null;
      return {
        ...g,
        items: g.items.filter(isItemActive)
      };
    }).filter(Boolean).filter(g => g.items.length > 0);
  }

  // Find currently selected account object
  const allItems = groups.flatMap((g) => g.items);
  const currentAccount = allItems.find((item) => isMethodSelected(item)) || allItems[0];

  // Auto fallback selection if currently selected method is hidden due to amount rules or disabled by admin
  useEffect(() => {
    if (allItems.length > 0 && onSelect) {
      const hasSelectedInCurrent = allItems.some((item) => isMethodSelected(item));
      if (!hasSelectedInCurrent) {
        // Prioritize QRIS or first available
        const qrisItem = allItems.find(i => i.isQRIS || String(i.name).toLowerCase().includes("qris"));
        const fallback = qrisItem || allItems[0];
        if (fallback) {
          onSelect(fallback);
        }
      }
    }
  }, [allowBank, allowQris, allItems.length]);

  const handleCopy = (num) => {
    if (!num || !navigator.clipboard) return;
    try {
      navigator.clipboard.writeText(String(num).replace(/-/g, ""));
      setCopiedAccount(true);
      setTimeout(() => setCopiedAccount(false), 2500);
    } catch (error) {
      console.warn("Failed to copy to clipboard:", error);
    }
  };

  return (
    <div className="space-y-6">
      {title && (
        <h3 className="text-sm font-bold text-slate-700 uppercase tracking-wider">
          {title}
        </h3>
      )}

      {/* Info Banner when bank transfer is automatically hidden (< Rp 10.000) */}
      {isUnderMinBank && (
        <div className="flex items-start gap-3 p-3.5 bg-amber-50/90 border border-amber-200/90 rounded-2xl text-xs text-amber-900 animate-in fade-in duration-200">
          <div className="p-1 rounded-lg bg-amber-100 text-amber-700 shrink-0 mt-0.5">
            <ShieldCheck size={16} />
          </div>
          <div className="leading-relaxed">
            <span className="font-bold block text-amber-950 mb-0.5">Metode Pembayaran Khusus Transaksi Ringan:</span>
            Untuk total tagihan akhir <strong>Rp {Number(effectiveAmount).toLocaleString("id-ID")}</strong> (di bawah batas minimal Transfer Bank Rp {minBankAmount.toLocaleString("id-ID")}), sistem otomatis mengalihkan pembayaran ke <strong>QRIS Instan</strong> atau <strong>Poin</strong> demi kecepatan verifikasi.
          </div>
        </div>
      )}

      {/* Grid of Payment Methods */}
      <div className="space-y-6">
        {groups.map((group) => (
          <div key={group.category} className="space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">
              {group.category}
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {group.items.map((item) => {
                const isSelected = isMethodSelected(item);
                const logoSrc = getPaymentLogo(item.name || item.id || item.logoUrl || item.logo);

                return (
                  <div
                    key={item.id || item.name}
                    onClick={() => onSelect && onSelect(item)}
                    className={`p-4 rounded-xl border-2 cursor-pointer transition-all flex items-center justify-between ${
                      isSelected
                        ? "bg-[#f0fffe] border-[#007570] shadow-sm ring-1 ring-[#007570]/20"
                        : "bg-slate-50 border-slate-200 hover:border-slate-300 hover:bg-slate-100/60"
                    }`}
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      {/* Logo Images */}
                      <div className="w-14 h-14 rounded-lg flex items-center justify-center bg-white border border-slate-200 p-2 overflow-hidden shrink-0">
                        <img
                          src={logoSrc}
                          alt={item.name}
                          className="w-full h-full object-contain"
                          onError={(e) => {
                            const target = e.currentTarget;
                            const parent = target?.parentElement;
                            if (target && parent) {
                              target.style.display = "none";
                              const fallbackDiv = document.createElement('div');
                              fallbackDiv.className = `w-full h-full flex items-center justify-center ${item.badgeColor || 'bg-slate-700 text-white'} rounded`;
                              fallbackDiv.innerHTML = `<span class="text-xs font-bold">${item.id || item.name || 'N/A'}</span>`;
                              parent.appendChild(fallbackDiv);
                            }
                          }}
                        />
                      </div>
                      <span className="text-sm font-bold text-slate-800 truncate">
                        {item.name}
                      </span>
                    </div>

                    {/* Radio check indicator */}
                    <div
                      className={`w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 ml-2 ${
                        isSelected
                          ? "border-[#007570] bg-[#007570]"
                          : "border-slate-300 bg-white"
                      }`}
                    >
                      {isSelected && <Check size={12} className="text-white" strokeWidth={3} />}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      {/* Instruction Card (Matching Image 2 and 4) */}
      {showInstruction && currentAccount && (
        <div className="mt-8 bg-slate-50 border border-slate-200 rounded-2xl p-5 space-y-3">
          <h4 className="text-sm font-bold text-slate-800 flex items-center gap-2">
            <ShieldCheck size={18} className="text-[#007570]" />
            Instruksi Pembayaran {currentAccount.name}
          </h4>
          <p className="text-xs text-slate-600">
            {currentAccount.isMidtrans
              ? "Instruksi Otomatis via Midtrans Gateway:"
              : currentAccount.isQRIS
              ? "Scan QR Code di bawah menggunakan aplikasi e-wallet atau mobile banking kamu:"
              : "Silakan lakukan transfer sebesar total tagihan ke rekening / Virtual Account berikut:"}
          </p>

          {currentAccount.isMidtrans ? (
            <div className="bg-[#f0fffe] border-2 border-[#007570] rounded-xl p-5 text-center space-y-2">
              <div className="inline-flex items-center gap-2 px-3.5 py-1 bg-[#007570] text-white text-xs font-bold rounded-full mb-1 shadow-sm">
                ⚡ OTOMATIS &amp; INSTAN VIA MIDTRANS
              </div>
              <p className="text-sm font-bold text-slate-800">
                Pembayaran Serba Bisa (Kartu Kredit, Virtual Account, QRIS, E-Wallet)
              </p>
              <p className="text-xs text-slate-600 max-w-md mx-auto leading-relaxed">
                Popup pembayaran resmi Midtrans Snap akan langsung terbuka setelah Anda menekan tombol konfirmasi. Tidak perlu mengunggah bukti transfer manual.
              </p>
            </div>
          ) : currentAccount.isQRIS ? (
            /* QRIS Display */
            <div className="bg-white border-2 border-slate-200 rounded-xl p-6 flex flex-col items-center space-y-4">
              {(() => {
                const effectiveQris = qrisImage || liveQrisImage || localStorage.getItem("platform_qris_image");
                return (
                  <div className="flex flex-col items-center gap-3">
                    <div
                      onClick={() => effectiveQris && setIsZoomed(true)}
                      className="w-60 sm:w-72 bg-white border-4 border-[#007570] rounded-2xl p-3 flex flex-col items-center justify-center shadow-lg relative overflow-hidden group cursor-pointer transition-transform hover:scale-[1.02]"
                      title="Klik untuk memperbesar QRIS ke layar penuh"
                    >
                      {effectiveQris ? (
                        <img 
                          src={effectiveQris} 
                          alt="QRIS Resmi Platform" 
                          className="w-full h-auto max-h-72 object-contain rounded-xl bg-white" 
                        />
                      ) : (
                        <div className="flex flex-col items-center justify-center text-center p-4">
                          <img src="/logos/qris.png" alt="QRIS" className="w-28 h-auto object-contain mb-2" />
                          <span className="text-[11px] font-bold text-slate-600">Scan QRIS Resmi</span>
                        </div>
                      )}

                      {/* Hover Overlay */}
                      <div className="absolute inset-0 bg-slate-950/60 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center text-white gap-2 p-3 text-center">
                        <Maximize2 size={24} className="text-amber-400" />
                        <span className="text-xs font-bold">Klik untuk Perbesar QRIS</span>
                      </div>
                    </div>

                    {effectiveQris && (
                      <div className="flex items-center gap-2 w-full max-w-72">
                        <button
                          type="button"
                          onClick={() => setIsZoomed(true)}
                          className="flex-1 py-1.5 px-3 rounded-xl bg-teal-50 hover:bg-teal-100 text-[#007570] font-bold text-xs border border-teal-200 flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                        >
                          <Maximize2 size={13} />
                          <span>Perbesar QR</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            const link = document.createElement("a");
                            link.href = effectiveQris;
                            link.download = "QRIS-Resmi-Surade.png";
                            link.target = "_blank";
                            document.body.appendChild(link);
                            link.click();
                            document.body.removeChild(link);
                          }}
                          className="flex-1 py-1.5 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center justify-center gap-1.5 transition-colors cursor-pointer shadow-xs border-0"
                          title="Unduh QRIS untuk discan lewat galeri HP"
                        >
                          <Download size={13} />
                          <span>Unduh QR</span>
                        </button>
                      </div>
                    )}

                    {/* Lightbox Modal */}
                    {isZoomed && typeof document !== "undefined" && createPortal(
                      <div
                        onClick={() => setIsZoomed(false)}
                        className="fixed inset-0 z-[9999999] bg-black/85 backdrop-blur-md flex items-center justify-center p-4 animate-fade-in"
                      >
                        <div
                          onClick={(e) => e.stopPropagation()}
                          className="bg-white rounded-3xl p-6 max-w-md w-full shadow-2xl border-4 border-[#007570] flex flex-col items-center gap-4 text-center relative"
                        >
                          <button
                            type="button"
                            onClick={() => setIsZoomed(false)}
                            className="absolute top-3 right-3 w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-700 flex items-center justify-center cursor-pointer border border-slate-200"
                          >
                            <X size={16} />
                          </button>
                          <div className="space-y-1 w-full text-left">
                            <h4 className="font-extrabold text-slate-900 text-base">QRIS Resmi Surade.com</h4>
                            <p className="text-xs text-slate-500">Scan menggunakan aplikasi e-wallet atau perbankan Anda</p>
                          </div>
                          <div className="bg-slate-50 p-3 rounded-2xl border border-slate-200 w-full flex items-center justify-center shadow-inner">
                            <img src={effectiveQris} alt="QRIS Zoom" className="w-full max-h-[55vh] object-contain rounded-xl select-all" />
                          </div>
                          <div className="flex items-center gap-2 w-full">
                            <button
                              type="button"
                              onClick={() => {
                                const link = document.createElement("a");
                                link.href = effectiveQris;
                                link.download = "QRIS-Resmi-Surade.png";
                                link.target = "_blank";
                                document.body.appendChild(link);
                                link.click();
                                document.body.removeChild(link);
                              }}
                              className="flex-1 py-2.5 px-4 rounded-xl bg-[#007570] hover:bg-[#005f5b] text-white font-bold text-xs flex items-center justify-center gap-2 cursor-pointer border-0 shadow-xs"
                            >
                              <Download size={14} />
                              <span>Unduh Gambar</span>
                            </button>
                            <button
                              type="button"
                              onClick={() => setIsZoomed(false)}
                              className="py-2.5 px-5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs cursor-pointer border border-slate-200"
                            >
                              Tutup
                            </button>
                          </div>
                        </div>
                      </div>,
                      document.body
                    )}
                  </div>
                );
              })()}
              <div className="text-center space-y-2">
                <p className="text-sm font-bold text-slate-800">Scan QRIS untuk Pembayaran</p>
                <p className="text-xs text-slate-500">Kompatibel dengan semua e-wallet &amp; mobile banking</p>
                <div className="flex flex-wrap items-center justify-center gap-2 pt-2">
                  <span className="px-2 py-1 bg-[#4c2a86] text-white text-[10px] font-bold rounded">OVO</span>
                  <span className="px-2 py-1 bg-[#008cff] text-white text-[10px] font-bold rounded">DANA</span>
                  <span className="px-2 py-1 bg-[#00a5cf] text-white text-[10px] font-bold rounded">GoPay</span>
                  <span className="px-2 py-1 bg-[#003d79] text-white text-[10px] font-bold rounded">BCA</span>
                  <span className="px-2 py-1 bg-[#f15a24] text-white text-[10px] font-bold rounded">BNI</span>
                  <span className="px-2 py-1 bg-[#0072bc] text-white text-[10px] font-bold rounded">Mandiri</span>
                </div>
              </div>
            </div>
          ) : (
            /* Bank / E-Wallet Account Number Display */
            <div className="bg-white border border-slate-200 rounded-xl p-4 flex items-center justify-between">
              <div>
                <span className="text-xs text-slate-400 font-medium block">
                  {currentAccount.category === "E-Wallet" ? "Nomor E-Wallet" : "Nomor Rekening / Virtual Account"}
                </span>
                <span className="text-lg font-black text-[#0f172a] tracking-wide">
                  {(!currentAccount.accountNumber || currentAccount.accountNumber === "0123456789" || currentAccount.accountNumber === "XXX" || String(currentAccount.accountNumber).toLowerCase().includes("belum")) ? "xxxx" : (currentAccount.accountNumber || customAccount?.accountNumber || "xxxx")}
                </span>
                <span className="text-xs text-slate-500 block mt-0.5">
                  a.n {(!currentAccount.accountName || currentAccount.accountName === "Official Surade.com" || String(currentAccount.accountName).toLowerCase().includes("belum")) ? (currentAccount.accountName || "xxxx") : (currentAccount.accountName || customAccount?.accountName || "xxxx")}
                </span>
              </div>
              <button
                type="button"
                onClick={() => handleCopy(currentAccount.accountNumber || customAccount?.accountNumber)}
                className="px-3.5 py-2 bg-slate-100 border border-slate-200 rounded-lg text-xs font-bold text-slate-700 hover:bg-slate-200 cursor-pointer flex items-center gap-1.5 transition-colors"
              >
                {copiedAccount ? (
                  <>
                    <Check size={14} className="text-emerald-600" />
                    <span className="text-emerald-700">Tersalin!</span>
                  </>
                ) : (
                  <>
                    <Copy size={14} />
                    <span>Salin No</span>
                  </>
                )}
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
