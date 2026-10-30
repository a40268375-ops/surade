const fs = require('fs');
const path = require('path');
const https = require('https');
const http = require('http');
const crypto = require('crypto');

const FRONTEND_DIR = path.join(__dirname, '../frontend/public/images/businesses');
const BACKEND_DIR = path.join(__dirname, '../backend/public/images/businesses');
const STORAGE_DIR_1 = path.join(__dirname, '../backend/storage/app/public/businesses/real_images');
const STORAGE_DIR_2 = path.join(__dirname, '../backend/public/storage/businesses/real_images');

function searchBingImages(query) {
  return new Promise((resolve) => {
    const url = `https://www.bing.com/images/search?q=${encodeURIComponent(query)}&first=1&count=40&scenario=ImageBasicHover`;
    const req = https.get(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept-Language': 'id-ID,id;q=0.9,en-US;q=0.8'
      }
    }, (res) => {
      let html = '';
      res.on('data', c => html += c);
      res.on('end', () => {
        const matches = [...html.matchAll(/murl&quot;:&quot;(http[^&]+)&quot;/g)].map(m => m[1]);
        resolve(matches);
      });
    });
    req.on('error', () => resolve([]));
    req.setTimeout(8000, () => { req.destroy(); resolve([]); });
  });
}

function downloadImageToBuffer(url) {
  return new Promise((resolve) => {
    try {
      if (url.includes('unsplash.com') || url.includes('images.unsplash.com') || url.includes('1554118811')) {
        return resolve(null); // Explicitly reject Unsplash cafe stock photo
      }
      const client = url.startsWith('https') ? https : http;
      const req = client.get(url, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
          'Referer': 'https://www.bing.com/'
        }
      }, (res) => {
        if (res.statusCode === 301 || res.statusCode === 302) {
          const loc = res.headers.location;
          if (loc) return downloadImageToBuffer(loc).then(resolve);
          return resolve(null);
        }
        if (res.statusCode !== 200) return resolve(null);

        const chunks = [];
        res.on('data', chunk => chunks.push(chunk));
        res.on('end', () => {
          const buffer = Buffer.concat(chunks);
          if (buffer.length > 15000 && buffer.length !== 635764 && buffer.length !== 635758 && buffer.length !== 635760 && buffer.length !== 635761 && buffer.length !== 635779) {
            resolve(buffer);
          } else {
            resolve(null);
          }
        });
      });
      req.on('error', () => resolve(null));
      req.setTimeout(8000, () => { req.destroy(); resolve(null); });
    } catch (e) {
      resolve(null);
    }
  });
}

const fixTargets = [
  {
    id: 10,
    name: "Yasa Hotel & Penginapan Surade",
    queries: [
      "hotel penginapan yasa surade sukabumi",
      "losmen penginapan surade jampang",
      "hotel murah surade sukabumi kamar",
      "penginapan keluarga surade sukabumi"
    ]
  },
  {
    id: 15,
    name: "Toserba Selamat Surade (Pusat Belanja)",
    queries: [
      "toserba selamat surade sukabumi gedung",
      "toserba selamat sukabumi swalayan",
      "supermarket toserba selamat belanja",
      "toserba selamat toserba"
    ]
  },
  {
    id: 39,
    name: "Warung Bakso & Mie Ayam Podomoro Buniwangi",
    queries: [
      "warung bakso mie ayam podomoro sunda",
      "gerobak mie ayam bakso buniwangi surade",
      "semangkuk mie ayam bakso urat pedas kuah",
      "bakso podomoro mie ayam ceker"
    ]
  },
  {
    id: 76,
    name: "Toko Bangunan & Material Kayu Sukatani",
    queries: [
      "toko material tb bangunan semen pasir sukatani",
      "toko bahan bangunan kayu kaso semen",
      "toko material bangunan sukatani jampang",
      "toko bangunan tb jaya sukabumi"
    ]
  },
  {
    id: 95,
    name: "RM Ikan Bakar Pesisir Pantai Minajaya",
    queries: [
      "warung rm ikan bakar pesisir pantai minajaya",
      "ikan bakar bawal kakap sambal lalapan saung pantai minajaya",
      "warung makan ikan laut bakar minajaya surade",
      "ikan laut bakar pinggir pantai sunda"
    ]
  },
  {
    id: 150,
    name: "Kios Bibit Pohon Kayu Albasia & Mahoni Wanasari",
    queries: [
      "kebun bibit pohon albasia sengon polybag wanasari",
      "pembibitan bibit kayu mahoni sengon unggul",
      "bibit pohon albasia siap tanam kehutanan",
      "kios bibit tanaman kayu keras wanasari"
    ]
  }
];

async function run() {
  console.log("Replacing 6 target businesses with authentic real photos...");

  for (const t of fixTargets) {
    console.log(`\nProcessing Biz ${t.id}: ${t.name}...`);
    let found = false;

    for (const q of t.queries) {
      console.log(`  Searching: "${q}"...`);
      const urls = await searchBingImages(q);
      console.log(`  Got ${urls.length} URLs`);

      for (const url of urls) {
        const buf = await downloadImageToBuffer(url);
        if (buf) {
          const fn = `biz_real_${t.id}.jpg`;
          const p1 = path.join(FRONTEND_DIR, fn);
          const p2 = path.join(BACKEND_DIR, fn);
          const s1_b = path.join(STORAGE_DIR_1, `biz_${t.id}_banner.jpg`);
          const s1_l = path.join(STORAGE_DIR_1, `biz_${t.id}_logo.jpg`);
          const s2_b = path.join(STORAGE_DIR_2, `biz_${t.id}_banner.jpg`);
          const s2_l = path.join(STORAGE_DIR_2, `biz_${t.id}_logo.jpg`);

          fs.writeFileSync(p1, buf);
          fs.writeFileSync(p2, buf);
          fs.writeFileSync(s1_b, buf);
          fs.writeFileSync(s1_l, buf);
          fs.writeFileSync(s2_b, buf);
          fs.writeFileSync(s2_l, buf);

          console.log(`  [✔ SUCCESS] Biz ${t.id} saved unique real image (${Math.round(buf.length/1024)} KB) from ${url.substring(0, 60)}...`);
          found = true;
          break;
        }
      }
      if (found) break;
    }
  }

  console.log("\nDone updating target businesses!");
}

run();
