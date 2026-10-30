const fs = require('fs');
const path = require('path');

const FRONTEND_IMG_DIR = path.join(__dirname, '../frontend/public/images/businesses');
const BACKEND_IMG_DIR = path.join(__dirname, '../backend/public/images/businesses');

const sleep = (ms) => new Promise(res => setTimeout(res, ms));

async function downloadWithRetry(url, maxRetries = 3) {
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      const res = await fetch(url, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
        },
        signal: AbortSignal.timeout(12000)
      });
      if (res.ok) {
        const buf = Buffer.from(await res.arrayBuffer());
        if (buf.length > 2000) return buf;
      }
    } catch (e) {
      // retry
    }
    await sleep(400);
  }
  return null;
}

async function run() {
  console.log("=== DOWNLOADING 150 STRICTLY UNIQUE AUTHENTIC INDONESIAN PHOTOS ===");
  const urls = JSON.parse(fs.readFileSync(path.join(__dirname, 'unique_150_urls.json'), 'utf8'));
  console.log(`Available unique URLs: ${urls.length}`);

  let success = 0;
  for (let i = 0; i < 150; i++) {
    const url = urls[i];
    const fileName = `biz_real_${i + 1}.jpg`;
    const fePath = path.join(FRONTEND_IMG_DIR, fileName);
    const bePath = path.join(BACKEND_IMG_DIR, fileName);

    const buf = await downloadWithRetry(url);
    if (buf) {
      fs.writeFileSync(fePath, buf);
      fs.writeFileSync(bePath, buf);
      success++;
      console.log(`[${i + 1}/150] Saved UNIQUE photo: ${fileName} (${buf.length} bytes) <- ${url.substring(0, 70)}...`);
    } else {
      console.warn(`[${i + 1}/150] Failed to download from: ${url}`);
    }
    await sleep(150);
  }

  console.log(`\n=== COMPLETED: ${success}/150 STRICTLY UNIQUE PHOTOS SAVED! ===`);
}

run();
