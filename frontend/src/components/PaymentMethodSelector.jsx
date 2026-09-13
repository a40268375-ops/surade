import { Check } from "lucide-react";

/**
 * Unified Payment Method Selector Component
 * Digunakan untuk Iklan, Blog, WhatsApp, dll dengan UI yang konsisten
 */

// Bank logos - You can replace with actual logo URLs
const BANK_LOGOS = {
  "Bank Mandiri": "https://upload.wikimedia.org/wikipedia/commons/thumb/a/ad/Bank_Mandiri_logo_2016.svg/200px-Bank_Mandiri_logo_2016.svg.png",
  "Bank BNI": "https://upload.wikimedia.org/wikipedia/id/thumb/5/55/BNI_logo.svg/200px-BNI_logo.svg.png",
  "Bank BCA": "https://upload.wikimedia.org/wikipedia/commons/thumb/5/5c/Bank_Central_Asia.svg/200px-Bank_Central_Asia.svg.png",
  "Maybank": "https://upload.wikimedia.org/wikipedia/commons/thumb/e/e4/Maybank_Logo.svg/200px-Maybank_Logo.svg.png",
  "Bank BJB": "https://upload.wikimedia.org/wikipedia/id/thumb/2/27/Bank_bjb_logo.svg/200px-Bank_bjb_logo.svg.png",
  "OVO": "https://upload.wikimedia.org/wikipedia/commons/thumb/e/eb/Logo_ovo_purple.svg/200px-Logo_ovo_purple.svg.png",
  "DANA": "https://upload.wikimedia.org/wikipedia/commons/thumb/7/72/Logo_dana_blue.svg/200px-Logo_dana_blue.svg.png",
  "GoPay": "https://upload.wikimedia.org/wikipedia/commons/thumb/8/86/Gopay_logo.svg/200px-Gopay_logo.svg.png",
  "QRIS": "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'%3E%3Crect fill='%23E53935' width='100' height='100' rx='8'/%3E%3Ctext x='50' y='60' text-anchor='middle' fill='white' font-size='28' font-weight='bold'%3EQRIS%3C/text%3E%3C/svg%3E"
};

export default function PaymentMethodSelector({ 
  methods = [], 
  selectedMethod, 
  onSelect,
  title = "Metode Pembayaran"
}) {
  // Group methods by category
  const bankMethods = methods.filter(m => 
    m.name.includes("Bank") || m.name.includes("Maybank") || m.name.includes("BJB")
  );
  
  const ewalletMethods = methods.filter(m => 
    ["OVO", "DANA", "GoPay"].includes(m.name)
  );
  
  const qrisMethods = methods.filter(m => 
    m.name.includes("QRIS")
  );

  const renderMethod = (method) => {
    const isSelected = selectedMethod === method.name || selectedMethod === method.id;
    const logo = BANK_LOGOS[method.name] || method.logo;
    const accountNumber = method.account_number || "XXX";
    const accountHolder = method.account_holder || "XXX";

    return (
      <button
        key={method.id || method.name}
        type="button"
        onClick={() => onSelect(method)}
        className={`
          relative w-full flex items-center justify-between gap-4 p-4 rounded-xl border-2 transition-all duration-200
          ${isSelected 
            ? "border-emerald-500 bg-emerald-50 shadow-md" 
            : "border-slate-200 bg-white hover:border-emerald-300 hover:bg-emerald-50/30"
          }
        `}
      >
        {/* Logo & Name */}
        <div className="flex items-center gap-3 flex-1 min-w-0">
          <div className="w-12 h-12 bg-white rounded-lg border border-slate-200 flex items-center justify-center p-1.5 shrink-0">
            {logo ? (
              <img 
                src={logo} 
                alt={method.name}
                className="w-full h-full object-contain"
              />
            ) : (
              <div className="w-full h-full bg-slate-100 rounded flex items-center justify-center text-slate-400 text-xs font-bold">
                {method.name.substring(0, 2)}
              </div>
            )}
          </div>
          
          <div className="flex flex-col items-start text-left min-w-0">
            <span className="text-sm font-bold text-slate-800 truncate w-full">
              {method.name}
            </span>
            <span className="text-xs text-slate-500">
              {accountNumber !== "XXX" ? accountNumber : "Nomor tidak tersedia"}
            </span>
          </div>
        </div>

        {/* Checkmark */}
        {isSelected && (
          <div className="w-6 h-6 rounded-full bg-emerald-500 flex items-center justify-center shrink-0">
            <Check size={14} className="text-white" />
          </div>
        )}
      </button>
    );
  };

  return (
    <div className="space-y-4">
      {/* Title */}
      {title && (
        <h3 className="text-sm font-bold text-slate-700 uppercase tracking-wider">
          {title}
        </h3>
      )}

      {/* Bank Transfer Section */}
      {bankMethods.length > 0 && (
        <div className="space-y-2">
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider px-1">
            Transfer Bank / Rekening Resmi
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {bankMethods.map(renderMethod)}
          </div>
        </div>
      )}

      {/* E-Wallet Section */}
      {ewalletMethods.length > 0 && (
        <div className="space-y-2">
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider px-1">
            E-Wallet
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {ewalletMethods.map(renderMethod)}
          </div>
        </div>
      )}

      {/* QRIS Section */}
      {qrisMethods.length > 0 && (
        <div className="space-y-2">
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider px-1">
            QRIS
          </p>
          <div className="grid grid-cols-1 gap-3">
            {qrisMethods.map(renderMethod)}
          </div>
        </div>
      )}

      {/* Account Details Panel */}
      {selectedMethod && (
        <div className="mt-4 p-4 bg-slate-50 rounded-xl border border-slate-200">
          <div className="space-y-3">
            <div>
              <p className="text-xs font-semibold text-slate-500 mb-1">Nama Bank</p>
              <p className="text-sm font-bold text-slate-800">
                {methods.find(m => m.name === selectedMethod || m.id === selectedMethod)?.name || "XXX"}
              </p>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-xs font-semibold text-slate-500 mb-1">Nomor Rekening</p>
                <p className="text-sm font-bold text-emerald-600">
                  {methods.find(m => m.name === selectedMethod || m.id === selectedMethod)?.account_number || "XXX"}
                </p>
              </div>
              <div>
                <p className="text-xs font-semibold text-slate-500 mb-1">Nama Pemilik</p>
                <p className="text-sm font-bold text-slate-800">
                  {methods.find(m => m.name === selectedMethod || m.id === selectedMethod)?.account_holder || "XXX"}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
