/**
 * Client-side Content Moderation Helper
 * Provides instant safety checks and error messaging conforming to platform policy.
 */

const FORBIDDEN_PATTERNS = [
  // 1. Judi / Slot Online
  /\b(slot|judi|judol|gacor|maxwin|zeus\s*slot|pragmatic|togel|casino|sbobet|poker\s*online|taruhan\s*bola|depo\s*pulsa|rtp\s*slot|link\s*gacor|bocoran\s*slot)\b/i,
  // 2. Pornografi / Seksualitas
  /\b(bokep|porno|porn|bugil|open\s*bo|vcs|bispak|prostitusi|escort|pijat\s*plus|lendir|ngentot|memek|pepek|kontol|titit|masturbasi|hentai|onlyfans|xxx)\b/i,
  // 3. Narkoba / Obat Terlarang
  /\b(narkoba|sabu|ganja|tembakau\s*gorila|sinte|ekstasi|inex|heroin|putau|kokain|tramadol|obat\s*penenang|pil\s*koplo|cytotec)\b/i,
  // 4. Kekerasan / Mutilasi / Terorisme
  /\b(mutilasi|pembunuhan|gorok|senpi\s*rakitan|bom\s*bunuh\s*diri|teroris|terorisme)\b/i,
  // 5. Penipuan / Skema Gelap
  /\b(gandakan\s*uang|pesugihan|investasi\s*bodong|skema\s*ponzi|jual\s*kartu\s*kredit|jual\s*data\s*ktp)\b/i
];

export const MODERATION_ERROR_MSG = "Konten tidak dapat dipublikasikan. Konten yang Anda masukkan mengandung materi yang tidak diperbolehkan di platform ini. Silakan gunakan konten lain.";

/**
 * Validates text content against safety rules.
 * @param {string} text
 * @returns {{ safe: boolean, error?: string }}
 */
export function checkTextModeration(text) {
  if (!text || typeof text !== "string") return { safe: true };

  for (const pattern of FORBIDDEN_PATTERNS) {
    if (pattern.test(text)) {
      return {
        safe: false,
        error: MODERATION_ERROR_MSG
      };
    }
  }

  return { safe: true };
}

/**
 * Validates uploaded image file safely.
 * @param {File} file
 * @returns {{ safe: boolean, error?: string }}
 */
export function checkImageModeration(file) {
  if (!file) return { safe: true };

  const fileName = file.name || "";
  const textCheck = checkTextModeration(fileName);
  if (!textCheck.safe) {
    return textCheck;
  }

  const validTypes = ["image/jpeg", "image/png", "image/jpg", "image/gif", "image/webp"];
  if (!validTypes.includes(file.type)) {
    return {
      safe: false,
      error: "Format file gambar tidak didukung atau tidak aman."
    };
  }

  if (file.size > 10 * 1024 * 1024) {
    return {
      safe: false,
      error: "Ukuran gambar melebihi batas maksimal (10MB)."
    };
  }

  return { safe: true };
}
