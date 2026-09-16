import React, { useState, useEffect } from "react";
import { Check, Copy, ShieldCheck } from "lucide-react";
import api from "../services/api";

/**
 * Logo resmi lokal Surade.co.id
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
}) {
  const [copiedAccount, setCopiedAccount] = useState(false);
  const [apiMethods, setApiMethods] = useState(() => {
    try {
      const cached = localStorage.getItem("official_payment_methods_custom");
      return cached ? JSON.parse(cached) : null;
    } catch (error) {
      console.warn("Failed to parse cached payment methods:", error);
      return null;
    }
  });

  // Fetch fresh live payment methods from backend API on mount
  useEffect(() => {
    let isMounted = true;
    const fetchMethods = async () => {
      try {
        const res = await api.get("/payment-methods");
        const data = res.data?.data?.methods;
        if (isMounted && Array.isArray(data) && data.length > 0) {
          setApiMethods(data);
          localStorage.setItem("official_payment_methods_custom", JSON.stringify(data));
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
  const cleanAccName = (val) => (!val || val === "Official Surade.co.id" || String(val).toLowerCase().includes("belum") ? (customAccount?.accountName || "Triwala Mitra Bestari") : val);

  const rawList = methods || apiMethods;
  let groups = [];

  if (Array.isArray(rawList) && rawList.length > 0) {
    if (rawList[0]?.category && Array.isArray(rawList[0]?.items)) {
      // Already grouped
      groups = rawList.map(g => ({
        ...g,
        items: g.items.filter(isItemActive).map(item => ({
          ...item,
          logo: getPaymentLogo(item.name || item.id || item.logoUrl),
          accountNumber: cleanAccNum(item.accountNumber || item.account_number),
          accountName: cleanAccName(item.accountName || item.account_holder || customAccount?.accountName),
          isQRIS: item.isQRIS || String(item.id || item.name).toLowerCase().includes("qris"),
        }))
      })).filter(g => g.items.length > 0);
    } else {
      // Flat list of methods -> group them
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
        };
        const n = String(m.name || m.id || "").toLowerCase();
        const cat = String(m.category || "").toLowerCase();
        if (n.includes("qris") || cat === "qris") {
          qrisList.push(itemObj);
        } else if (n.includes("ovo") || n.includes("dana") || n.includes("gopay") || n.includes("shopee") || cat === "ewallet") {
          ewallets.push(itemObj);
        } else {
          banks.push(itemObj);
        }
      });

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
    groups = DEFAULT_OFFICIAL_METHODS.map(g => ({
      ...g,
      items: g.items.filter(isItemActive)
    })).filter(g => g.items.length > 0);
  }

  // Find currently selected account object
  const allItems = groups.flatMap((g) => g.items);
  const currentAccount = allItems.find((item) => isMethodSelected(item)) || allItems[0];

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
            {currentAccount.isQRIS
              ? "Scan QR Code di bawah menggunakan aplikasi e-wallet atau mobile banking kamu:"
              : "Silakan lakukan transfer sebesar total tagihan ke rekening / Virtual Account berikut:"}
          </p>

          {currentAccount.isQRIS ? (
            /* QRIS Display */
            <div className="bg-white border-2 border-slate-200 rounded-xl p-6 flex flex-col items-center space-y-4">
              <div className="w-56 h-56 sm:w-64 sm:h-64 bg-white border-4 border-[#007570] rounded-2xl p-4 flex items-center justify-center shadow-lg">
                {qrisImage ? (
                  <img src={qrisImage} alt="QRIS Code" className="w-full h-full object-contain" />
                ) : (
                  <svg viewBox="0 0 200 200" className="w-full h-full">
                    <rect width="200" height="200" fill="white"/>
                    <rect x="10" y="10" width="60" height="60" fill="black"/>
                    <rect x="20" y="20" width="40" height="40" fill="white"/>
                    <rect x="30" y="30" width="20" height="20" fill="black"/>
                    <rect x="130" y="10" width="60" height="60" fill="black"/>
                    <rect x="140" y="20" width="40" height="40" fill="white"/>
                    <rect x="150" y="30" width="20" height="20" fill="black"/>
                    <rect x="10" y="130" width="60" height="60" fill="black"/>
                    <rect x="20" y="140" width="40" height="40" fill="white"/>
                    <rect x="30" y="150" width="20" height="20" fill="black"/>
                    <rect x="80" y="20" width="10" height="10" fill="black"/>
                    <rect x="95" y="20" width="10" height="10" fill="black"/>
                    <rect x="110" y="20" width="10" height="10" fill="black"/>
                    <rect x="20" y="80" width="10" height="10" fill="black"/>
                    <rect x="35" y="80" width="10" height="10" fill="black"/>
                    <rect x="50" y="80" width="10" height="10" fill="black"/>
                    <rect x="80" y="80" width="10" height="10" fill="black"/>
                    <rect x="95" y="80" width="10" height="10" fill="black"/>
                    <rect x="110" y="80" width="10" height="10" fill="black"/>
                    <rect x="140" y="80" width="10" height="10" fill="black"/>
                    <rect x="155" y="80" width="10" height="10" fill="black"/>
                    <rect x="170" y="80" width="10" height="10" fill="black"/>
                    <rect x="80" y="95" width="10" height="10" fill="black"/>
                    <rect x="110" y="95" width="10" height="10" fill="black"/>
                    <rect x="140" y="95" width="10" height="10" fill="black"/>
                    <rect x="170" y="95" width="10" height="10" fill="black"/>
                    <rect x="20" y="110" width="10" height="10" fill="black"/>
                    <rect x="50" y="110" width="10" height="10" fill="black"/>
                    <rect x="80" y="110" width="10" height="10" fill="black"/>
                    <rect x="110" y="110" width="10" height="10" fill="black"/>
                    <rect x="140" y="110" width="10" height="10" fill="black"/>
                    <rect x="170" y="110" width="10" height="10" fill="black"/>
                    <rect x="80" y="140" width="10" height="10" fill="black"/>
                    <rect x="95" y="140" width="10" height="10" fill="black"/>
                    <rect x="110" y="140" width="10" height="10" fill="black"/>
                    <rect x="140" y="140" width="10" height="10" fill="black"/>
                    <rect x="155" y="140" width="10" height="10" fill="black"/>
                    <rect x="170" y="140" width="10" height="10" fill="black"/>
                    <rect x="80" y="155" width="10" height="10" fill="black"/>
                    <rect x="110" y="155" width="10" height="10" fill="black"/>
                    <rect x="140" y="155" width="10" height="10" fill="black"/>
                    <rect x="170" y="155" width="10" height="10" fill="black"/>
                    <rect x="80" y="170" width="10" height="10" fill="black"/>
                    <rect x="95" y="170" width="10" height="10" fill="black"/>
                    <rect x="110" y="170" width="10" height="10" fill="black"/>
                    <rect x="140" y="170" width="10" height="10" fill="black"/>
                    <rect x="155" y="170" width="10" height="10" fill="black"/>
                    <rect x="170" y="170" width="10" height="10" fill="black"/>
                    <rect x="35" y="95" width="10" height="10" fill="black"/>
                    <rect x="50" y="95" width="10" height="10" fill="black"/>
                    <rect x="35" y="110" width="10" height="10" fill="black"/>
                  </svg>
                )}
              </div>
              <div className="text-center space-y-2">
                <p className="text-sm font-bold text-slate-800">Scan QRIS untuk Pembayaran</p>
                <p className="text-xs text-slate-500">Kompatibel dengan semua e-wallet & mobile banking</p>
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
                  a.n {(!currentAccount.accountName || currentAccount.accountName === "Official Surade.co.id" || String(currentAccount.accountName).toLowerCase().includes("belum")) ? (currentAccount.accountName || "xxxx") : (currentAccount.accountName || customAccount?.accountName || "xxxx")}
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
