const fs = require('fs');
const path = require('path');
const https = require('https');
const http = require('http');

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
      if (url.includes('lookaside.instagram.com') || url.includes('unsplash.com') || url.includes('1554118811')) {
        return resolve(null); // Reject lookaside & unsplash
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
          if (buffer.length > 20000 && Math.abs(buffer.length - 635756) > 5000) {
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

const targets = [
  {
    id: 15,
    name: "Toserba Selamat Surade (Pusat Belanja)",
    queries: [
      "gedung toserba selamat sukabumi toko",
      "rak belanja toserba selamat swalayan",
      "pembelanjaan supermarket toserba selamat",
      "toserba selamat minimarket toko"
    ]
  },
  {
    id: 39,
    name: "Warung Bakso & Mie Ayam Podomoro Buniwangi",
    queries: [
      "gerobak bakso mie ayam podomoro jawa",
      "bakso urat mie ayam ceker sunda mangkok",
      "warung tenda bakso mie ayam sedap",
      "semangkok bakso sapi kuah kaldu tetelan gurih"
    ]
  }
];

async function run() {
  for (const t of targets) {
    console.log(`Fixing Biz ${t.id}: ${t.name}...`);
    let done = false;
    for (const q of t.queries) {
      console.log(`  Query: ${q}`);
      const urls = await searchBingImages(q);
      for (const u of urls) {
        const buf = await downloadImageToBuffer(u);
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

          console.log(`  [✔ SAVED] Biz ${t.id} -> ${Math.round(buf.length/1024)} KB from ${u.substring(0, 60)}`);
          done = true;
          break;
        }
      }
      if (done) break;
    }
  }
}

run();
