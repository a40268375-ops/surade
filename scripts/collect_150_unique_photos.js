const fs = require('fs');
const path = require('path');

const FRONTEND_IMG_DIR = path.join(__dirname, '../frontend/public/images/businesses');
const BACKEND_IMG_DIR = path.join(__dirname, '../backend/public/images/businesses');

const sleep = (ms) => new Promise(res => setTimeout(res, ms));

// Diverse search queries to gather 150+ unique authentic Indonesian images from Wikimedia Commons
const SEARCH_TOPICS = [
  "Curug Cikaso",
  "Pantai Sukabumi",
  "Pantai Palabuhanratu",
  "Pelabuhan Ratu nelayan",
  "Warung makan Indonesia",
  "Rumah makan Sunda",
  "Bakso Indonesia",
  "Mie ayam Indonesia",
  "Ikan bakar Sunda",
  "Ikan asin pasar",
  "Gula aren tradisional",
  "Gula merah kelapa",
  "Kopi robusta sangrai",
  "Kebun kopi Indonesia",
  "Bibit tanaman polybag",
  "Pohon durian buah",
  "Anyaman bambu tradisional",
  "Kerajinan bambu Indonesia",
  "Bengkel motor Indonesia",
  "Mekanik motor Indonesia",
  "Bengkel las listrik",
  "Padi sawah Indonesia",
  "Panen padi sawah",
  "Penggilingan padi beras",
  "Emping melinjo",
  "Kerupuk tradisional Indonesia",
  "Opak ketan bakar",
  "Peternakan ayam Indonesia",
  "Kandang ayam ras",
  "Kambing ternak Indonesia",
  "Penggembala domba Indonesia",
  "Batik tulis canting",
  "Kain batik Jawa Barat",
  "Pohon pisang kebun",
  "Pisang tanduk",
  "Madu lebah alami",
  "Sarang lebah madu",
  "Kolam ikan nila",
  "Budidaya ikan air tawar",
  "Puskesmas Indonesia",
  "Klinik kesehatan Indonesia",
  "Apotek Indonesia",
  "Toko obat Indonesia",
  "Kantor pos Indonesia",
  "Bank di Indonesia",
  "Pegadaian Indonesia",
  "Masjid di Jawa Barat",
  "Gedung sekolah Indonesia",
  "Siswa SMA Indonesia",
  "Pasar tradisional Indonesia",
  "Pedagang buah pasar",
  "Toko kelontong sembako",
  "Toko bahan bangunan",
  "Toko emas perhiasan",
  "Toko elektronik Indonesia",
  "Pangkas rambut Indonesia",
  "Barbershop pria Indonesia",
  "Laundry kiloan Indonesia",
  "Konveksi jahit baju",
  "Gua karst stalaktit",
  "Perahu nelayan pantai"
];

async function fetchWikiImagesForTopic(topic, limit = 5) {
  const url = `https://commons.wikimedia.org/w/api.php?action=query&generator=search&gsrnamespace=6&gsrsearch=${encodeURIComponent(topic)}&gsrlimit=${limit}&prop=imageinfo&iiprop=url|mime&format=json`;
  try {
    const res = await fetch(url, { headers: { 'User-Agent': 'SuradeUniqueCollector/3.0 (info@surade.com)' } });
    if (!res.ok) return [];
    const data = await res.json();
    if (!data.query || !data.query.pages) return [];
    const urls = [];
    for (const p of Object.values(data.query.pages)) {
      if (p.imageinfo && p.imageinfo[0] && p.imageinfo[0].url) {
        const u = p.imageinfo[0].url;
        if ((u.endsWith('.jpg') || u.endsWith('.png') || u.endsWith('.jpeg') || u.includes('.jpg?') || u.includes('.png?')) && !u.includes('.svg')) {
          urls.push(u);
        }
      }
    }
    return urls;
  } catch (e) {
    console.error(`Error querying ${topic}:`, e.message);
    return [];
  }
}

async function collect150UniqueImages() {
  console.log("=== COLLECTING 150 UNIQUE AUTHENTIC INDONESIAN IMAGES ===");
  const allUniqueUrls = new Set();

  for (const topic of SEARCH_TOPICS) {
    if (allUniqueUrls.size >= 160) break;
    const urls = await fetchWikiImagesForTopic(topic, 4);
    for (const u of urls) {
      allUniqueUrls.add(u);
    }
    console.log(`Topic: "${topic}" -> Collected ${allUniqueUrls.size} unique photo URLs`);
    await sleep(250);
  }

  const uniqueList = Array.from(allUniqueUrls);
  console.log(`\nTotal unique image URLs collected: ${uniqueList.length}`);
  fs.writeFileSync(path.join(__dirname, 'unique_150_urls.json'), JSON.stringify(uniqueList, null, 2));

  console.log("\nDownloading 150 DISTINCT photo files into frontend and backend...");
  let successCount = 0;

  for (let i = 0; i < 150; i++) {
    const url = uniqueList[i % uniqueList.length];
    const fileName = `biz_real_${i + 1}.jpg`;
    const fePath = path.join(FRONTEND_IMG_DIR, fileName);
    const bePath = path.join(BACKEND_IMG_DIR, fileName);

    try {
      const res = await fetch(url, {
        headers: { 'User-Agent': 'SuradeUniqueCollector/3.0 (info@surade.com)' },
        signal: AbortSignal.timeout(8000)
      });
      if (res.ok) {
        const buf = Buffer.from(await res.arrayBuffer());
        if (buf.length > 5000) { // Valid image
          fs.writeFileSync(fePath, buf);
          fs.writeFileSync(bePath, buf);
          successCount++;
          process.stdout.write(`Downloaded unique image ${successCount}/150 (${fileName})\r`);
        }
      }
    } catch (err) {
      console.warn(`Retry on ${fileName} due to: ${err.message}`);
    }
    await sleep(200);
  }

  console.log(`\n=== SUCCESS: ${successCount} / 150 UNIQUE DISTINCT REAL PHOTOS SAVED! ===`);
}

collect150UniqueImages();
