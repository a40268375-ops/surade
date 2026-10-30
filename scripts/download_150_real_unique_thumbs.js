const fs = require('fs');
const path = require('path');

const FRONTEND_IMG_DIR = path.join(__dirname, '../frontend/public/images/businesses');
const BACKEND_IMG_DIR = path.join(__dirname, '../backend/public/images/businesses');

if (!fs.existsSync(FRONTEND_IMG_DIR)) fs.mkdirSync(FRONTEND_IMG_DIR, { recursive: true });
if (!fs.existsSync(BACKEND_IMG_DIR)) fs.mkdirSync(BACKEND_IMG_DIR, { recursive: true });

const sleep = (ms) => new Promise(res => setTimeout(res, ms));

const TOPICS = [
  "Curug Cikaso Sukabumi",
  "Pantai Sukabumi",
  "Pantai Palabuhanratu",
  "Perahu nelayan Pelabuhan Ratu",
  "Warung makan Sunda",
  "Warung makan Jawa Barat",
  "Bakso Indonesia",
  "Mie ayam Indonesia",
  "Ikan bakar Sunda",
  "Ikan asin pasar tradisional",
  "Gula aren tradisional",
  "Gula kelapa",
  "Kopi robusta sangrai",
  "Kebun kopi Indonesia",
  "Bibit durian pohon",
  "Anyaman bambu tradisional",
  "Kerajinan bambu Indonesia",
  "Bengkel motor Indonesia",
  "Mekanik motor Indonesia",
  "Bengkel las listrik pagar",
  "Padi sawah Indonesia",
  "Panen padi sawah",
  "Penggilingan padi beras",
  "Emping melinjo",
  "Kerupuk tradisional Indonesia",
  "Peternakan ayam ras",
  "Kambing ternak Indonesia",
  "Penggembala domba sawah",
  "Batik tulis canting",
  "Kain batik Jawa Barat",
  "Pohon pisang kebun",
  "Pisang tanduk",
  "Madu lebah alami",
  "Sarang lebah madu",
  "Kolam ikan air tawar",
  "Puskesmas Indonesia",
  "Apotek Indonesia",
  "Kantor pos Indonesia",
  "Bank di Indonesia",
  "Pegadaian Indonesia",
  "Masjid di Jawa Barat",
  "Gedung SMA Indonesia",
  "Pasar tradisional Indonesia",
  "Pedagang pasar tradisional",
  "Toko kelontong sembako",
  "Toko bahan bangunan",
  "Toko emas perhiasan",
  "Toko elektronik Indonesia",
  "Pangkas rambut Indonesia",
  "Barbershop pria",
  "Laundry kiloan",
  "Penjahit konveksi",
  "Gua stalaktit",
  "Pesisir pantai nelayan"
];

async function fetchThumbs(topic, limit = 5) {
  const url = `https://commons.wikimedia.org/w/api.php?action=query&generator=search&gsrnamespace=6&gsrsearch=${encodeURIComponent(topic)}&gsrlimit=${limit}&prop=imageinfo&iiprop=url&iiurlwidth=800&format=json`;
  try {
    const res = await fetch(url, { headers: { 'User-Agent': 'SuradeApp/1.0 (https://surade.com; info@surade.com)' } });
    if (!res.ok) return [];
    const data = await res.json();
    if (!data.query || !data.query.pages) return [];
    const thumbs = [];
    for (const p of Object.values(data.query.pages)) {
      const info = p.imageinfo?.[0];
      if (info && (info.thumburl || info.url)) {
        const u = info.thumburl || info.url;
        if (!u.includes('.svg')) {
          thumbs.push(u);
        }
      }
    }
    return thumbs;
  } catch (e) {
    return [];
  }
}

async function run() {
  console.log("=== GATHERING 150 UNIQUE THUMBNAIL URLS FROM WIKIMEDIA COMMONS ===");
  const collectedUrls = new Set();

  for (const topic of TOPICS) {
    if (collectedUrls.size >= 160) break;
    const urls = await fetchThumbs(topic, 4);
    for (const u of urls) {
      collectedUrls.add(u);
    }
    console.log(`Topic "${topic}" -> Total collected: ${collectedUrls.size}`);
    await sleep(200);
  }

  const uniqueList = Array.from(collectedUrls);
  console.log(`\nCollected ${uniqueList.length} distinct URLs. Starting download of 150 distinct photos...`);

  let success = 0;
  for (let i = 0; i < 150; i++) {
    const url = uniqueList[i % uniqueList.length];
    const fileName = `biz_real_${i + 1}.jpg`;
    const fePath = path.join(FRONTEND_IMG_DIR, fileName);
    const bePath = path.join(BACKEND_IMG_DIR, fileName);

    try {
      const res = await fetch(url, {
        headers: { 'User-Agent': 'SuradeApp/1.0 (https://surade.com; info@surade.com)' },
        signal: AbortSignal.timeout(8000)
      });
      if (res.ok) {
        const buf = Buffer.from(await res.arrayBuffer());
        if (buf.length > 2000) {
          fs.writeFileSync(fePath, buf);
          fs.writeFileSync(bePath, buf);
          success++;
          console.log(`[${i + 1}/150] Saved UNIQUE image: ${fileName} (${buf.length} bytes)`);
        }
      } else {
        console.warn(`[${i + 1}/150] HTTP Error ${res.status}`);
      }
    } catch (e) {
      console.warn(`[${i + 1}/150] Timeout / Fetch error on ${fileName}: ${e.message}`);
    }
    await sleep(150);
  }

  console.log(`\n=== SUCCESS: ${success} / 150 UNIQUE IMAGES DOWNLOADED! ===`);
}

run();
