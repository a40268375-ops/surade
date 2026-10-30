/**
 * Chat Moderation Validator (Frontend)
 *
 * Rules:
 * 1. Blocks URLs, web links, domain shorteners (.com, .id, bit.ly, wa.me, etc.)
 * 2. Blocks Social media platforms, keywords, handles, and disguised names
 *    (WhatsApp, Instagram, Facebook, TikTok, Telegram, Twitter, etc.)
 * 3. Blocks Phone numbers (direct, disguised with spaces/symbols, word numbers, or leetspeak)
 * 4. Blocks Email addresses
 */

export const detectForbiddenChatContent = (text) => {
  if (!text || typeof text !== "string") return false;
  const raw = text.trim();
  if (!raw) return false;

  const lower = raw.toLowerCase();

  // 1. Explicit URLs, protocols, and shorteners
  const urlPatterns = [
    /https?:\/\//i,
    /ftp:\/\//i,
    /\bwww\.[a-z0-9\-]+\.[a-z]{2,}/i,
    /\b(bit\.ly|tinyurl\.com|s\.id|cutt\.ly|linktr\.ee|lynk\.id|t\.me|wa\.me|ig\.me|fb\.me)\b/i,
    /\b[a-z0-9\-]+(\.|\s+dot\s+|\s+titik\s+)(com|id|co\.id|net|org|xyz|site|online|me|link|io|app|my\.id|web\.id|biz|info|top|vip|cc|to|gg|ly|shopee|tokopedia|lazada|tiktok|instagram|facebook|whatsapp)(\b|\/)/i,
  ];

  for (const pattern of urlPatterns) {
    if (pattern.test(lower)) return true;
  }

  // 2. Email detection
  if (/[a-z0-9._%+\-]+(\s*@\s*|\s+at\s+)[a-z0-9.\-]+\s*(\.|\s+dot\s+)[a-z]{2,}/i.test(lower)) {
    return true;
  }

  // ─────────────────────────────────────────────────────────────
  // 2b. Username Handles, Mentions, and Variations ("Belokan")
  // ─────────────────────────────────────────────────────────────

  // Direct "@username" or "@ username" (e.g. @arynugraha._, @toko_surade)
  if (/@\s*[a-z0-9_.-]{2,}/i.test(lower)) {
    return true;
  }

  // Disguised "[at]username", "(at)username", " at username "
  if (/(\[at\]|\(at\)|\bat\b)\s*[a-z0-9_.-]{2,}/i.test(lower)) {
    return true;
  }

  // Keywords: username / user / akun / handle / id with any handle or name
  if (/\b(username|user\s*name|user|akun|profil|profile|handle|id)\s*[:=\-\s]+\s*@?[a-z0-9_.-]{2,}/i.test(lower)) {
    return true;
  }

  // Words referring to account ownership or follow action
  if (/\b(akun\s*saya|username\s*saya|id\s*saya|nama\s*akun|cek\s*bio|lihat\s*bio|cek\s*profil|kepoin)\b/i.test(lower)) {
    return true;
  }

  // ─────────────────────────────────────────────────────────────
  // 3. Social Media & Chat Platforms (Keywords, Abbreviations, Obfuscations)
  // ─────────────────────────────────────────────────────────────

  // 3a. WhatsApp
  if (/wa\.me|api\.whatsapp|chat\.whatsapp/i.test(lower)) return true;
  if (/\b(whatsapp|watsap|watsapp|wasap|wapp|wh4tsapp|wh4ts4pp)\b/i.test(lower)) return true;
  if (/\b(w\.a|w\/a|w-a)\b/i.test(lower)) return true;
  // Disguised spaced "w h a t s a p p"
  if (/w[\s\.\-_*]*h?[\s\.\-_*]*a[\s\.\-_*]*t[\s\.\-_*]*s?[\s\.\-_*]*a[\s\.\-_*]*p[\s\.\-_*]*p?/i.test(lower)) return true;
  // "wa" preceded or followed by call-to-action words
  if (/\b(chat|hub|hubungi|kontak|save|pc|pm|japri|inbox|ke|lewat|pindah|nomor|no)\s*(ke|di)?\s*(wa|whatsapp)\b/i.test(lower)) return true;
  if (/\b(wa|whatsapp)\s*(ke|di|saya|aja|ya|nya|admin)?\s*(:\s*|\s+)?(\d|[a-z0-9_])/i.test(lower)) return true;

  // 3b. Instagram
  if (/(instagram\.com|ig\.me)/i.test(lower)) return true;
  if (/\b(instagram|insta|instagr\.am|inst4|inst4gram)\b/i.test(lower)) return true;
  if (/\b(ig|i\.g|i-g)\s*[:=\-\s]*@?[a-z0-9_.-]{2,}/i.test(lower)) return true;
  // Disguised spaced "i n s t a g r a m"
  if (/i[\s\.\-_*]*n[\s\.\-_*]*s[\s\.\-_*]*t[\s\.\-_*]*a[\s\.\-_*]*g[\s\.\-_*]*r[\s\.\-_*]*a[\s\.\-_*]*m/i.test(lower)) return true;
  if (/\b(follow|cek|dm|lihat|pantau|akun|profil)\s*(ke|di)?\s*(ig|instagram)\b/i.test(lower)) return true;
  if (/\b(ig|instagram)\s*(saya|baru|olshop|toko|admin|nya)?\b/i.test(lower)) return true;

  // 3c. Facebook
  if (/(facebook\.com|fb\.com|fb\.me)/i.test(lower)) return true;
  if (/\b(facebook|face book|fcbk)\b/i.test(lower)) return true;
  if (/\b(fb|f\.b|f-b)\s*[:=\-\s]*@?[a-z0-9_.-]{2,}/i.test(lower)) return true;
  if (/\b(inbox|add|akun|grup)\s*(ke|di)?\s*(fb|facebook)\b/i.test(lower)) return true;
  if (/f[\s\.\-_*]*a[\s\.\-_*]*c[\s\.\-_*]*e[\s\.\-_*]*b[\s\.\-_*]*o[\s\.\-_*]*o[\s\.\-_*]*k/i.test(lower)) return true;

  // 3d. TikTok
  if (/(tiktok\.com|vt\.tiktok)/i.test(lower)) return true;
  if (/\b(tiktok|tik tok)\b/i.test(lower)) return true;
  if (/\b(tt|vt)\s*[:=\-\s]*@?[a-z0-9_.-]{2,}/i.test(lower)) return true;
  if (/t[\s\.\-_*]*i[\s\.\-_*]*k[\s\.\-_*]*t[\s\.\-_*]*o[\s\.\-_*]*k/i.test(lower)) return true;

  // 3e. Telegram
  if (/(telegram\.me|t\.me|telegram\.org)/i.test(lower)) return true;
  if (/\b(telegram|tele)\b/i.test(lower)) return true;
  if (/t[\s\.\-_*]*e[\s\.\-_*]*l[\s\.\-_*]*e[\s\.\-_*]*g[\s\.\-_*]*r[\s\.\-_*]*a[\s\.\-_*]*m/i.test(lower)) return true;

  // 3f. Other socials & external marketplaces
  if (/\b(twitter|x\.com|youtube|youtu\.be|shopee|tokopedia|bukalapak|lazada|blibli|threads)\b/i.test(lower)) return true;

  // 3g. General Direct Contact / Social Call-To-Action words
  if (/\b(dm|japri|pm|pc)\b/i.test(lower)) return true;

  // 4. Phone Numbers & Obfuscations
  const wordMap = {
    kosong: "0", nol: "0", satu: "1", dua: "2", tiga: "3",
    empat: "4", lima: "5", enam: "6", tujuh: "7", delapan: "8", sembilan: "9",
  };

  let wordNormalized = lower;
  Object.keys(wordMap).forEach((w) => {
    wordNormalized = wordNormalized.replace(new RegExp(`\\b${w}\\b`, "gi"), wordMap[w]);
  });

  const leetMap = {
    o: "0", b: "8", s: "5", i: "1", l: "1", e: "3", a: "4", g: "9", t: "7", z: "2",
  };

  // 4a. Pure digits
  const pureDigits = raw.replace(/[^\d]/g, "");
  if (pureDigits.length >= 8 && /(08|628)/.test(pureDigits)) return true;
  if (pureDigits.length >= 9) return true;

  // 4b. Word normalized digits
  const wordDigits = wordNormalized.replace(/[^\d]/g, "");
  if (wordDigits.length >= 8 && /(08|628)/.test(wordDigits)) return true;
  if (wordDigits.length >= 9) return true;

  // 4c. Token check for leetspeak
  const tokens = raw.split(/[\s,\n]+/);
  for (const token of tokens) {
    const cleanTok = token.replace(/[^a-zA-Z0-9]/g, "").toLowerCase();
    const leetTok = cleanTok.split("").map((c) => leetMap[c] || c).join("");
    if (/(08|628)\d{5,}/.test(leetTok)) return true;
    if (cleanTok.length >= 8 && /^(0|o|62)/i.test(cleanTok)) {
      const dCount = (cleanTok.match(/\d/g) || []).length;
      if (dCount >= 5) return true;
    }
  }

  // 4d. Full stripped leetspeak
  const cleanFull = lower.replace(/[^a-zA-Z0-9]/g, "");
  const fullLeet = cleanFull.split("").map((c) => leetMap[c] || c).join("");
  if (/(08|628)\d{6,}/.test(fullLeet)) return true;

  // Check stripped cleanFull for hidden social media words (e.g. "w-h-a-t-s-a-p-p" -> "whatsapp")
  if (/(whatsapp|watsap|wasap|instagram|facebook|tiktok|telegram)/.test(cleanFull)) {
    return true;
  }

  return false;
};

export default detectForbiddenChatContent;
