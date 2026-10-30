const fs = require('fs');
const path = require('path');
const https = require('https');
const http = require('http');

const FRONTEND_DIR = path.join(__dirname, '../frontend/public/images/businesses');
const BACKEND_DIR = path.join(__dirname, '../backend/public/images/businesses');
const STORAGE_DIR_1 = path.join(__dirname, '../backend/storage/app/public/businesses/real_images');
const STORAGE_DIR_2 = path.join(__dirname, '../backend/public/storage/businesses/real_images');

function downloadImageDirect(url, destPath) {
  return new Promise((resolve) => {
    try {
      const client = url.startsWith('https') ? https : http;
      const req = client.get(url, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
          'Referer': 'https://www.bing.com/'
        }
      }, (res) => {
        if (res.statusCode === 301 || res.statusCode === 302) {
          const loc = res.headers.location;
          if (loc) return downloadImageDirect(loc, destPath).then(resolve);
          return resolve(false);
        }
        if (res.statusCode !== 200) return resolve(false);

        const file = fs.createWriteStream(destPath);
        res.pipe(file);
        file.on('finish', () => {
          file.close(() => {
            try {
              const stats = fs.statSync(destPath);
              if (stats.size > 5000) {
                const id = path.basename(destPath).replace('biz_real_', '').replace('.jpg', '');
                fs.copyFileSync(destPath, path.join(BACKEND_DIR, `biz_real_${id}.jpg`));
                fs.copyFileSync(destPath, path.join(STORAGE_DIR_1, `biz_${id}_banner.jpg`));
                fs.copyFileSync(destPath, path.join(STORAGE_DIR_1, `biz_${id}_logo.jpg`));
                fs.copyFileSync(destPath, path.join(STORAGE_DIR_2, `biz_${id}_banner.jpg`));
                fs.copyFileSync(destPath, path.join(STORAGE_DIR_2, `biz_${id}_logo.jpg`));
                console.log(`[POLISHED] Biz ${id} updated (${Math.round(stats.size/1024)} KB)`);
                resolve(true);
              } else {
                resolve(false);
              }
            } catch (e) { resolve(false); }
          });
        });
      });
      req.on('error', () => resolve(false));
      req.setTimeout(10000, () => { req.destroy(); resolve(false); });
    } catch(e) { resolve(false); }
  });
}

function searchBing(q) {
  return new Promise((resolve) => {
    const url = `https://www.bing.com/images/search?q=${encodeURIComponent(q)}&first=1&scenario=ImageBasicHover`;
    https.get(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept-Language': 'id-ID,id;q=0.9'
      }
    }, (res) => {
      let html = '';
      res.on('data', c => html += c);
      res.on('end', () => {
        const matches = [...html.matchAll(/murl&quot;:&quot;(http[^&]+)&quot;/g)].map(m => m[1]);
        resolve(matches);
      });
    }).on('error', () => resolve([]));
  });
}

async function polish() {
  // Polish specific businesses that deserve ultra-crisp local Indonesian photos
  const specialQueries = {
    24: 'warung sate kambing bakar bumbu kecap gule sunda',
    33: 'warung kopi sederhana gorengan pisang bala bala sunda',
    34: 'bibit durian bawor polybag jampang surade',
    35: 'kopi robusta sangrai pajampangan sukabumi jampang',
    106: 'curug cikaso surade sukabumi 3 air terjun',
    94: 'tpi pantai minajaya kapal perahu nelayan ikan segar surade'
  };

  for (const [id, q] of Object.entries(specialQueries)) {
    const urls = await searchBing(q);
    for (const url of urls.slice(0, 5)) {
      if (url.includes('.svg') || url.includes('.gif')) continue;
      const ok = await downloadImageDirect(url, path.join(FRONTEND_DIR, `biz_real_${id}.jpg`));
      if (ok) break;
    }
  }

  console.log("Polish complete!");
}

polish();
