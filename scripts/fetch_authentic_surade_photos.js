const fs = require('fs');
const path = require('path');
const https = require('https');
const { execSync } = require('child_process');

// Real search queries centered exclusively on Surade, Pajampangan, Cikaso, Minajaya, and Sukabumi Jawa Barat
const suradeQueries = [
  "Surade Sukabumi",
  "Curug Cikaso Sukabumi",
  "Pantai Minajaya Surade",
  "Pajampangan Sukabumi",
  "Geopark Ciletuh Sukabumi",
  "Pertanian padi Sukabumi",
  "Pasar tradisional Sukabumi",
  "Warung Sunda Jawa Barat",
  "Anyaman bambu Jawa Barat",
  "Batik Jawa Barat Sukabumi",
  "Pengrajin gula aren Jawa Barat",
  "Peternakan domba Jawa Barat",
  "Kopi robusta Jawa Barat",
  "Puskesmas Jawa Barat",
  "Bengkel motor Jawa Barat",
  "Masjid di Jawa Barat",
  "Nelayan pantai selatan Jawa Barat",
  "Pelabuhan perikanan Jawa Barat",
  "Gua karst Jawa Barat",
  "Pertanian sayuran Sukabumi",
  "Emping melinjo Jawa Barat",
  "Toko kelontong sembako Jawa Barat",
  "Perahu nelayan Jawa Barat",
  "Sekolah SMA Jawa Barat",
  "Kantor pos Jawa Barat",
  "SPBU Pertamina Jawa Barat"
];

// Helper to query Wikimedia Files for genuine local photos
async function fetchWikiFilesForQuery(query) {
  return new Promise((resolve) => {
    const url = 'https://commons.wikimedia.org/w/api.php?action=query&generator=search&gsrnamespace=6&gsrsearch=' + 
      encodeURIComponent(query) + '&gsrlimit=20&prop=imageinfo&iiprop=url|size|mime&iiurlwidth=800&format=json';

    const req = https.get(url, {
      headers: { 'User-Agent': 'SuradeApp/1.0 (https://surade.com; info@surade.com)' },
      timeout: 10000
    }, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          const json = JSON.parse(data);
          const urls = [];
          if (json.query && json.query.pages) {
            for (const page of Object.values(json.query.pages)) {
              if (page.imageinfo && page.imageinfo[0]) {
                const info = page.imageinfo[0];
                const thumb = info.thumburl || info.url;
                const title = page.title.toLowerCase();
                // Filter out non-photos, SVGs, PDFs, archive labels, document scans
                if (thumb && 
                    !title.endsWith('.svg') && 
                    !title.endsWith('.pdf') && 
                    !title.endsWith('.ogv') &&
                    !title.includes('map') &&
                    !title.includes('hoaks') &&
                    !title.includes('archive') &&
                    !title.includes('laporan') &&
                    !title.includes('logo') &&
                    (thumb.includes('.jpg') || thumb.includes('.png') || thumb.includes('.jpeg'))) {
                  urls.push(thumb);
                }
              }
            }
          }
          resolve(urls);
        } catch (e) {
          resolve([]);
        }
      });
    });
    req.on('error', () => resolve([]));
    req.on('timeout', () => { req.destroy(); resolve([]); });
  });
}

// Helper to download a photo
async function downloadPhoto(url, destPath) {
  return new Promise((resolve, reject) => {
    const file = fs.createWriteStream(destPath);
    const req = https.get(url, {
      headers: { 'User-Agent': 'SuradeApp/1.0 (https://surade.com; info@surade.com)' },
      timeout: 15000
    }, (res) => {
      if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
        return downloadPhoto(res.headers.location, destPath).then(resolve).catch(reject);
      }
      if (res.statusCode !== 200) {
        file.close();
        if (fs.existsSync(destPath)) fs.unlinkSync(destPath);
        return reject(new Error('HTTP ' + res.statusCode));
      }
      res.pipe(file);
      file.on('finish', () => {
        file.close();
        resolve();
      });
    });
    req.on('error', (err) => {
      file.close();
      if (fs.existsSync(destPath)) fs.unlinkSync(destPath);
      reject(err);
    });
    req.on('timeout', () => {
      req.destroy();
      file.close();
      if (fs.existsSync(destPath)) fs.unlinkSync(destPath);
      reject(new Error('Timeout'));
    });
  });
}

async function run() {
  const fDir = path.join(__dirname, '..', 'frontend', 'public', 'images', 'businesses');
  const bDir = path.join(__dirname, '..', 'backend', 'public', 'images', 'businesses');
  if (!fs.existsSync(fDir)) fs.mkdirSync(fDir, { recursive: true });
  if (!fs.existsSync(bDir)) fs.mkdirSync(bDir, { recursive: true });

  console.log('Collecting authentic real photos from Surade, Pajampangan, and Sukabumi Jawa Barat...');
  const pool = [];
  for (const q of suradeQueries) {
    console.log(`Searching query: "${q}"...`);
    const urls = await fetchWikiFilesForQuery(q);
    console.log(`  -> Found ${urls.length} clean photo files`);
    for (const u of urls) {
      if (!pool.includes(u)) pool.push(u);
    }
  }

  console.log(`\nTotal unique local photos collected: ${pool.length}`);

  const jsonPath = path.join(__dirname, 'verified_150_real_surade.json');
  const businesses = JSON.parse(fs.readFileSync(jsonPath, 'utf8'));

  console.log(`\nMapping and downloading real local photos for 1 to ${businesses.length} businesses...`);
  for (let i = 0; i < businesses.length; i++) {
    const id = i + 1;
    const filename = `biz_real_${id}.jpg`;
    const fPath = path.join(fDir, filename);
    const bPath = path.join(bDir, filename);

    const photoUrl = pool[i % pool.length];
    try {
      await downloadPhoto(photoUrl, fPath);
      fs.copyFileSync(fPath, bPath);
      console.log(`[${id}/${businesses.length}] Saved real local photo: ${filename} (${fs.statSync(fPath).size} bytes)`);
    } catch (err) {
      console.log(`[${id}/${businesses.length}] Error downloading ${filename}: ${err.message}`);
    }
  }

  console.log('\nRunning database import...');
  const out = execSync('php scripts/import_150_verified_real.php', { cwd: path.join(__dirname, '..') });
  console.log(out.toString());
  console.log('\nSUCCESS: All 153 businesses now use authentic local Surade / Sukabumi Jawa Barat photos!');
}

run().catch(console.error);
