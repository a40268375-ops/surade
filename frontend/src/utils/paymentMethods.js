/**
 * Unified Payment Methods Utility
 * Centralized payment method configuration untuk semua fitur
 */

// Bank logos
export const BANK_LOGOS = {
  "Bank Mandiri": "https://upload.wikimedia.org/wikipedia/commons/thumb/a/ad/Bank_Mandiri_logo_2016.svg/200px-Bank_Mandiri_logo_2016.svg.png",
  "Bank BNI": "https://upload.wikimedia.org/wikipedia/id/thumb/5/55/BNI_logo.svg/200px-BNI_logo.svg.png",
  "Bank BCA": "https://upload.wikimedia.org/wikipedia/commons/thumb/5/5c/Bank_Central_Asia.svg/200px-Bank_Central_Asia.svg.png",
  "Maybank": "https://upload.wikimedia.org/wikipedia/commons/thumb/e/e4/Maybank_Logo.svg/200px-Maybank_Logo.svg.png",
  "Bank BJB": "https://upload.wikimedia.org/wikipedia/id/thumb/2/27/Bank_bjb_logo.svg/200px-Bank_bjb_logo.svg.png",
  "OVO": "https://upload.wikimedia.org/wikipedia/commons/thumb/e/eb/Logo_ovo_purple.svg/200px-Logo_ovo_purple.svg.png",
  "DANA": "https://upload.wikimedia.org/wikipedia/commons/thumb/7/72/Logo_dana_blue.svg/200px-Logo_dana_blue.svg.png",
  "GoPay": "https://upload.wikimedia.org/wikipedia/commons/thumb/8/86/Gopay_logo.svg/200px-Gopay_logo.svg.png",
};

/**
 * Get official payment methods from backend settings
 * Returns standardized payment method objects
 */
export async function getOfficialPaymentMethods(apiClient) {
  try {
    // Fetch from settings API
    const response = await apiClient.get("/admin/settings");
    const settings = response.data;

    const methods = [
      {
        id: "mandiri",
        name: "Bank Mandiri",
        type: "bank",
        logo: BANK_LOGOS["Bank Mandiri"],
        account_number: settings?.payment_mandiri_account || "XXX",
        account_holder: settings?.payment_account_holder || "Surade.co.id",
      },
      {
        id: "bni",
        name: "Bank BNI",
        type: "bank",
        logo: BANK_LOGOS["Bank BNI"],
        account_number: settings?.payment_bni_account || "XXX",
        account_holder: settings?.payment_account_holder || "Surade.co.id",
      },
      {
        id: "bca",
        name: "Bank BCA",
        type: "bank",
        logo: BANK_LOGOS["Bank BCA"],
        account_number: settings?.payment_bca_account || "XXX",
        account_holder: settings?.payment_account_holder || "Surade.co.id",
      },
      {
        id: "maybank",
        name: "Maybank",
        type: "bank",
        logo: BANK_LOGOS["Maybank"],
        account_number: settings?.payment_maybank_account || "XXX",
        account_holder: settings?.payment_account_holder || "Surade.co.id",
      },
      {
        id: "bjb",
        name: "Bank BJB",
        type: "bank",
        logo: BANK_LOGOS["Bank BJB"],
        account_number: settings?.payment_bjb_account || "XXX",
        account_holder: settings?.payment_account_holder || "Surade.co.id",
      },
      {
        id: "ovo",
        name: "OVO",
        type: "ewallet",
        logo: BANK_LOGOS["OVO"],
        account_number: settings?.payment_ovo_number || "XXX",
        account_holder: settings?.payment_account_holder || "Surade.co.id",
      },
      {
        id: "dana",
        name: "DANA",
        type: "ewallet",
        logo: BANK_LOGOS["DANA"],
        account_number: settings?.payment_dana_number || "XXX",
        account_holder: settings?.payment_account_holder || "Surade.co.id",
      },
      {
        id: "gopay",
        name: "GoPay",
        type: "ewallet",
        logo: BANK_LOGOS["GoPay"],
        account_number: settings?.payment_gopay_number || "XXX",
        account_holder: settings?.payment_account_holder || "Surade.co.id",
      },
      {
        id: "qris",
        name: "QRIS (Semua E-Wallet & Bank)",
        type: "qris",
        logo: null,
        account_number: "Scan QRIS",
        account_holder: settings?.payment_account_holder || "Surade.co.id",
        qris_image: settings?.payment_qris_image || null,
      },
    ];

    return methods;
  } catch (error) {
    console.error("Failed to fetch official payment methods:", error);
    // Return default methods with XXX
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
      account_number: "XXX",
      account_holder: "Surade.co.id",
    },
    {
      id: "bni",
      name: "Bank BNI",
      type: "bank",
      logo: BANK_LOGOS["Bank BNI"],
      account_number: "XXX",
      account_holder: "Surade.co.id",
    },
    {
      id: "bca",
      name: "Bank BCA",
      type: "bank",
      logo: BANK_LOGOS["Bank BCA"],
      account_number: "XXX",
      account_holder: "Surade.co.id",
    },
    {
      id: "maybank",
      name: "Maybank",
      type: "bank",
      logo: BANK_LOGOS["Maybank"],
      account_number: "XXX",
      account_holder: "Surade.co.id",
    },
    {
      id: "bjb",
      name: "Bank BJB",
      type: "bank",
      logo: BANK_LOGOS["Bank BJB"],
      account_number: "XXX",
      account_holder: "Surade.co.id",
    },
    {
      id: "ovo",
      name: "OVO",
      type: "ewallet",
      logo: BANK_LOGOS["OVO"],
      account_number: "XXX",
      account_holder: "Surade.co.id",
    },
    {
      id: "dana",
      name: "DANA",
      type: "ewallet",
      logo: BANK_LOGOS["DANA"],
      account_number: "XXX",
      account_holder: "Surade.co.id",
    },
    {
      id: "gopay",
      name: "GoPay",
      type: "ewallet",
      logo: BANK_LOGOS["GoPay"],
      account_number: "XXX",
      account_holder: "Surade.co.id",
    },
    {
      id: "qris",
      name: "QRIS (Semua E-Wallet & Bank)",
      type: "qris",
      logo: null,
      account_number: "Scan QRIS",
      account_holder: "Surade.co.id",
    },
  ];
}

/**
 * Format account number for display
 */
export function formatAccountNumber(accountNumber) {
  if (!accountNumber || accountNumber === "XXX") {
    return "XXX";
  }
  
  // Format bank account: 1234-5678-90
  if (accountNumber.length >= 8) {
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
