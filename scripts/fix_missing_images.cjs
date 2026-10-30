const fs = require('fs');
const path = require('path');
const https = require('https');
const http = require('http');

const FRONTEND_DIR = path.join(__dirname, '../frontend/public/images/businesses');
const BACKEND_DIR = path.join(__dirname, '../backend/public/images/businesses');
const STORAGE_DIR_1 = path.join(__dirname, '../backend/storage/app/public/businesses/real_images');
const STORAGE_DIR_2 = path.join(__dirname, '../backend/public/storage/businesses/real_images');

function downloadImage(url, filename) {
  return new Promise((resolve) => {
    const dest = path.join(FRONTEND_DIR, filename);
    const client = url.startsWith('https') ? https : http;

    const req = client.get(url, { headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)' } }, (res) => {
      if (res.statusCode === 301 || res.statusCode === 302) {
        return downloadImage(res.headers.location, filename).then(resolve);
      }
      if (res.statusCode !== 200) {
        console.error(`[FAIL ${res.statusCode}] ${filename}`);
        return resolve(false);
      }

      const file = fs.createWriteStream(dest);
      res.pipe(file);
      file.on('finish', () => {
        file.close(() => {
          try {
            const stats = fs.statSync(dest);
            if (stats.size > 3000) {
              fs.copyFileSync(dest, path.join(BACKEND_DIR, filename));
              const id = filename.replace('biz_real_', '').replace('.jpg', '');
              fs.copyFileSync(dest, path.join(STORAGE_DIR_1, `biz_${id}_banner.jpg`));
              fs.copyFileSync(dest, path.join(STORAGE_DIR_1, `biz_${id}_logo.jpg`));
              fs.copyFileSync(dest, path.join(STORAGE_DIR_2, `biz_${id}_banner.jpg`));
              fs.copyFileSync(dest, path.join(STORAGE_DIR_2, `biz_${id}_logo.jpg`));
              console.log(`[FIXED OK] Biz ${id} -> ${filename} (${Math.round(stats.size / 1024)} KB)`);
              resolve(true);
            } else {
              console.error(`[FAIL SMALL] ${filename}`);
              resolve(false);
            }
          } catch (e) { resolve(false); }
        });
      });
    });
    req.on('error', (err) => {
      console.error(`[ERR] ${filename}: ${err.message}`);
      resolve(false);
    });
  });
}

const missingUrls = {
  23: "https://images.unsplash.com/photo-1585320806297-9794b3e4eeae?w=800&auto=format&fit=crop&q=80", // Pupuk & Bibit
  28: "https://images.unsplash.com/photo-1558981806-ec527fa84c39?w=800&auto=format&fit=crop&q=80", // Bengkel Motor Kang Dadang
  37: "https://images.unsplash.com/photo-1535591273668-578e31182c4f?w=800&auto=format&fit=crop&q=80", // Kambing Perah Etawa
  69: "https://images.unsplash.com/photo-1585320806297-9794b3e4eeae?w=800&auto=format&fit=crop&q=80", // Pakan Ternak Sungging
  77: "https://images.unsplash.com/photo-1589923188900-85dae523342b?w=800&auto=format&fit=crop&q=80", // Bibit Pepaya California
  78: "https://images.unsplash.com/photo-1619642751034-765dfdf7c58e?w=800&auto=format&fit=crop&q=80", // Tambal Ban & Service Motor
  114: "https://images.unsplash.com/photo-1568772585407-9361f9bf3a87?w=800&auto=format&fit=crop&q=80", // Bengkel Mesin Perahu Cipeundeuy
  120: "https://images.unsplash.com/photo-1590736969955-71cc94801759?w=800&auto=format&fit=crop&q=80", // Kebun Cabai Sayuran Kadaleman
  137: "https://images.unsplash.com/photo-1568772585407-9361f9bf3a87?w=800&auto=format&fit=crop&q=80", // Bengkel Tambal Ban Kademangan
};

async function fixMissing() {
  for (const [id, url] of Object.entries(missingUrls)) {
    const filename = `biz_real_${id}.jpg`;
    await downloadImage(url, filename);
  }

  console.log("\n=== VERIFYING ALL 153 FILES EXIST AND ARE VALID ===");
  let missingCount = 0;
  for (let id = 1; id <= 153; id++) {
    const fn = `biz_real_${id}.jpg`;
    const fp = path.join(FRONTEND_DIR, fn);
    if (!fs.existsSync(fp) || fs.statSync(fp).size < 3000) {
      console.error(`MISSING/INVALID: ${fn}`);
      missingCount++;
    }
  }
  if (missingCount === 0) {
    console.log("SUCCESS: All 153 business images exist and are healthy!");
  } else {
    console.log(`Still missing ${missingCount} images.`);
  }
}

fixMissing();
