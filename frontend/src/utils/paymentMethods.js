/**
 * Unified Payment Methods Utility
 * Centralized payment method configuration untuk semua fitur
 */

// Bank logos
export const BANK_LOGOS = {
  "Bank Mandiri": "/logos/mandiri.png",
  "Bank BNI": "/logos/bni.png",
  "Bank BCA": "/logos/bca.png",
  "Maybank": "/logos/maybank.png",
  "Bank BJB": "/logos/bjb.png",
  "OVO": "/logos/ovo.png",
  "DANA": "/logos/dana.png",
  "GoPay": "/logos/gopay.png",
  "QRIS": "/logos/qris.png",
  "QRIS (Semua E-Wallet & Bank)": "/logos/qris.png",
};

/**
 * Get official payment methods from backend settings
 * Returns standardized payment method objects
 */
export async function getOfficialPaymentMethods(apiClient) {
  try {
    // 1. Try public payment methods endpoint
    try {
      const pmRes = await apiClient.get("/payment-methods");
      const list = pmRes.data?.data?.methods;
      if (Array.isArray(list) && list.length > 0) {
        return list.map(m => ({
          ...m,
          account_number: m.accountNumber || m.account_number,
          account_holder: m.accountName || m.account_holder,
          logo: BANK_LOGOS[m.name] || m.logoUrl || m.logo,
        }));
      }
    } catch (_) {}

    // 2. Fallback to settings API if user has admin privileges
    let settings = null;
    try {
      const response = await apiClient.get("/admin/settings");
      settings = response.data;
    } catch (_) {}

    const methods = [
      {
        id: "mandiri",
        name: "Bank Mandiri",
        type: "bank",
        logo: BANK_LOGOS["Bank Mandiri"],
        account_number: settings?.payment_mandiri_account || "133-0011-409-331",
        account_holder: settings?.payment_account_holder || "Triwala Mitra Bestari",
      },
      {
        id: "bni",
        name: "Bank BNI",
        type: "bank",
        logo: BANK_LOGOS["Bank BNI"],
        account_number: settings?.payment_bni_account || "0973607008",
        account_holder: settings?.payment_account_holder || "Triwala Mitra Bestari",
      },
      {
        id: "bca",
        name: "Bank BCA",
        type: "bank",
        logo: BANK_LOGOS["Bank BCA"],
        account_number: settings?.payment_bca_account || "0954152045",
        account_holder: settings?.payment_account_holder || "Triwala Mitra Bestari",
      },
      {
        id: "maybank",
        name: "Maybank",
        type: "bank",
        logo: BANK_LOGOS["Maybank"],
        account_number: settings?.payment_maybank_account || "2097000009",
        account_holder: settings?.payment_account_holder || "Triwala Mitra Bestari",
      },
      {
        id: "bjb",
        name: "Bank BJB",
        type: "bank",
        logo: BANK_LOGOS["Bank BJB"],
        account_number: settings?.payment_bjb_account || "0119213282001",
        account_holder: settings?.payment_account_holder || "Triwala Mitra Bestari",
      },
      {
        id: "ovo",
        name: "OVO",
        type: "ewallet",
        logo: BANK_LOGOS["OVO"],
        account_number: settings?.payment_ovo_number || "0811-1919-711",
        account_holder: settings?.payment_account_holder || "Triwala Mitra Bestari",
      },
      {
        id: "dana",
        name: "DANA",
        type: "ewallet",
        logo: BANK_LOGOS["DANA"],
        account_number: settings?.payment_dana_number || "xxxx",
        account_holder: settings?.payment_account_holder || "xxxx",
      },
      {
        id: "gopay",
        name: "GoPay",
        type: "ewallet",
        logo: BANK_LOGOS["GoPay"],
        account_number: settings?.payment_gopay_number || "xxxx",
        account_holder: settings?.payment_account_holder || "xxxx",
      },
      {
        id: "qris",
        name: "QRIS (Semua E-Wallet & Bank)",
        type: "qris",
        logo: BANK_LOGOS["QRIS"],
        account_number: "Scan QRIS",
        account_holder: settings?.payment_account_holder || "Triwala Mitra Bestari",
        qris_image: settings?.payment_qris_image || null,
        isQRIS: true,
      },
    ];

    return methods;
  } catch (error) {
    console.error("Failed to fetch official payment methods:", error);
    // Return default methods
    return getDefaultPaymentMethods();
  }
}

/**
 * Get default payment methods (fallback)
 */
export function getDefaultPaymentMethods() {
  return [
    {
      id: "mandiri",
      name: "Bank Mandiri",
      type: "bank",
      logo: BANK_LOGOS["Bank Mandiri"],
      account_number: "133-0011-409-331",
      account_holder: "Triwala Mitra Bestari",
    },
    {
      id: "bni",
      name: "Bank BNI",
      type: "bank",
      logo: BANK_LOGOS["Bank BNI"],
      account_number: "0973607008",
      account_holder: "Triwala Mitra Bestari",
    },
    {
      id: "bca",
      name: "Bank BCA",
      type: "bank",
      logo: BANK_LOGOS["Bank BCA"],
      account_number: "0954152045",
      account_holder: "Triwala Mitra Bestari",
    },
    {
      id: "maybank",
      name: "Maybank",
      type: "bank",
      logo: BANK_LOGOS["Maybank"],
      account_number: "2097000009",
      account_holder: "Triwala Mitra Bestari",
    },
    {
      id: "bjb",
      name: "Bank BJB",
      type: "bank",
      logo: BANK_LOGOS["Bank BJB"],
      account_number: "0119213282001",
      account_holder: "Triwala Mitra Bestari",
    },
    {
      id: "ovo",
      name: "OVO",
      type: "ewallet",
      logo: BANK_LOGOS["OVO"],
      account_number: "0811-1919-711",
      account_holder: "Triwala Mitra Bestari",
    },
    {
      id: "dana",
      name: "DANA",
      type: "ewallet",
      logo: BANK_LOGOS["DANA"],
      account_number: "xxxx",
      account_holder: "xxxx",
    },
    {
      id: "gopay",
      name: "GoPay",
      type: "ewallet",
      logo: BANK_LOGOS["GoPay"],
      account_number: "xxxx",
      account_holder: "xxxx",
    },
    {
      id: "qris",
      name: "QRIS (Semua E-Wallet & Bank)",
      type: "qris",
      logo: BANK_LOGOS["QRIS"],
      account_number: "Scan QRIS",
      account_holder: "Triwala Mitra Bestari",
      isQRIS: true,
    },
  ];
}

/**
 * Format account number for display
 */
export function formatAccountNumber(accountNumber) {
  if (!accountNumber || accountNumber === "XXX" || accountNumber === "xxxx" || String(accountNumber).toLowerCase().includes("belum")) {
    return "xxxx";
  }
  
  // Format bank account: 1234-5678-90
  if (accountNumber.length >= 8 && /^\d+$/.test(accountNumber)) {
    return accountNumber.replace(/(\d{4})(\d{4})(\d+)/, "$1-$2-$3");
  }
  
  return accountNumber;
}

/**
 * Get payment method by ID
 */
export function getPaymentMethodById(methods, id) {
  return methods.find(m => m.id === id || m.name === id);
}

/**
 * Filter payment methods according to amount and admin rules:
 * - Amount < Rp 10.000: Hide Transfer Bank, show QRIS & E-Wallet & Points only
 * - Amount >= Rp 10.000: Show Transfer Bank, QRIS, E-Wallet & Points
 * - If disabled by admin, don't show method
 */
export function filterPaymentMethodsByAmount(methods, amount = 0, rules = null) {
  if (!Array.isArray(methods)) return [];

  const defaultRules = {
    bank_transfer_enabled: true,
    bank_transfer_min_amount: 10000,
    qris_enabled: true,
    points_enabled: true,
  };
  const activeRules = { ...defaultRules, ...(rules || {}) };
  const numericAmount = Number(amount || 0);

  return methods.filter((m) => {
    if (m.isActive === false || m.isActive === "false" || m.isActive === 0 || m.isActive === "0") {
      return false;
    }

    const name = String(m.name || m.id || "").toLowerCase();
    const cat = String(m.category || m.type || "").toLowerCase();
    const isQris = m.isQRIS || name.includes("qris") || cat === "qris";
    const isBank = !isQris && (cat === "bank" || name.includes("bank") || name.includes("transfer") || name.includes("bca") || name.includes("mandiri") || name.includes("bni") || name.includes("bjb") || name.includes("maybank"));

    // Check QRIS
    if (isQris) {
      return activeRules.qris_enabled !== false;
    }

    // Check Bank Transfer
    if (isBank) {
      if (activeRules.bank_transfer_enabled === false) {
        return false;
      }
      if (numericAmount < Number(activeRules.bank_transfer_min_amount || 10000)) {
        return false;
      }
      return true;
    }

    return true;
  });
}
