const fs = require('fs');
const path = require('path');
const https = require('https');

// Reliable direct high-res Unsplash photos
const fallbackMap = {
  16: "https://images.unsplash.com/photo-1545454675-3531b543be5d?auto=format&fit=crop&w=800&q=80", // SPBU Pertamina gas station
  28: "https://images.unsplash.com/photo-1558981403-c5f9899a28bc?auto=format&fit=crop&w=800&q=80", // Bengkel motor mechanics
  43: "https://images.unsplash.com/photo-1520340356584-f9917d1eea6f?auto=format&fit=crop&w=800&q=80", // Cuci steam wash
  48: "https://images.unsplash.com/photo-1566478989037-eec170784d0b?auto=format&fit=crop&w=800&q=80", // Keripik singkong snacks
  59: "https://images.unsplash.com/photo-1509042239860-f550ce710b93?auto=format&fit=crop&w=800&q=80", // Warung kopi
  63: "https://images.unsplash.com/photo-1558981403-c5f9899a28bc?auto=format&fit=crop&w=800&q=80", // Bengkel motor trail
  66: "https://images.unsplash.com/photo-1569718212165-3a8278d5f624?auto=format&fit=crop&w=800&q=80", // Bakso urat
  78: "https://images.unsplash.com/photo-1608571423902-eed4a5ad8108?auto=format&fit=crop&w=800&q=80", // Toko obat herbal
  84: "https://images.unsplash.com/photo-1522069169874-c58ec4b76be5?auto=format&fit=crop&w=800&q=80", // Kolam ikan nila
  86: "https://images.unsplash.com/photo-1558981403-c5f9899a28bc?auto=format&fit=crop&w=800&q=80", // Bengkel motor
  90: "https://images.unsplash.com/photo-1520340356584-f9917d1eea6f?auto=format&fit=crop&w=800&q=80", // Cuci motor steam
  101: "https://images.unsplash.com/photo-1544551763-46a013bb70d5?auto=format&fit=crop&w=800&q=80", // Bengkel mesin tempel perahu
  105: "https://images.unsplash.com/photo-1545454675-3531b543be5d?auto=format&fit=crop&w=800&q=80", // Pom bensin eceran
  114: "https://images.unsplash.com/photo-1558981403-c5f9899a28bc?auto=format&fit=crop&w=800&q=80", // Bengkel servis motor perahu
  125: "https://images.unsplash.com/photo-1558981403-c5f9899a28bc?auto=format&fit=crop&w=800&q=80", // Bengkel motor Kang Yudi
  137: "https://images.unsplash.com/photo-1558981403-c5f9899a28bc?auto=format&fit=crop&w=800&q=80", // Bengkel servis motor Kademangan
  139: "https://images.unsplash.com/photo-1520340356584-f9917d1eea6f?auto=format&fit=crop&w=800&q=80", // Jasa cuci steam salju
  149: "https://images.unsplash.com/photo-1558981403-c5f9899a28bc?auto=format&fit=crop&w=800&q=80", // Bengkel motor Kang Dadang
  151: "https://images.unsplash.com/photo-1520340356584-f9917d1eea6f?auto=format&fit=crop&w=800&q=80"  // Jasa cuci steam bersih
};

async function downloadDirect(url, destPath) {
  return new Promise((resolve, reject) => {
    const file = fs.createWriteStream(destPath);
    const req = https.get(url, { timeout: 15000 }, res => {
      if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
        return downloadDirect(res.headers.location, destPath).then(resolve).catch(reject);
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
    req.on('error', err => {
      file.close();
      if (fs.existsSync(destPath)) fs.unlinkSync(destPath);
      reject(err);
    });
  });
}

async function run() {
  const fDir = path.join(__dirname, '..', 'frontend', 'public', 'images', 'businesses');
  const bDir = path.join(__dirname, '..', 'backend', 'public', 'images', 'businesses');

  for (const [idStr, url] of Object.entries(fallbackMap)) {
    const filename = `biz_real_${idStr}.jpg`;
    const fPath = path.join(fDir, filename);
    const bPath = path.join(bDir, filename);
    console.log(`Downloading missing photo ${filename}...`);
    await downloadDirect(url, fPath);
    fs.copyFileSync(fPath, bPath);
    console.log(`Saved ${filename} (${fs.statSync(fPath).size} bytes)`);
  }
  console.log('Finished downloading all missing photos!');
}

run().catch(console.error);
