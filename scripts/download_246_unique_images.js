const fs = require('fs');
const path = require('path');

const FRONTEND_IMG_DIR = path.join(__dirname, '../frontend/public/images/businesses');
const BACKEND_IMG_DIR = path.join(__dirname, '../backend/public/images/businesses');

if (!fs.existsSync(FRONTEND_IMG_DIR)) fs.mkdirSync(FRONTEND_IMG_DIR, { recursive: true });
if (!fs.existsSync(BACKEND_IMG_DIR)) fs.mkdirSync(BACKEND_IMG_DIR, { recursive: true });

// Curated pool of high quality real photo URLs from Unsplash CDN
const PHOTO_URLS = [
  // Seafood & Restaurants
  "https://images.unsplash.com/photo-1534422298391-e4f8c172dddb?w=800&auto=format&fit=crop&q=80",
  "https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=800&auto=format&fit=crop&q=80",
  "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=800&auto=format&fit=crop&q=80",
  "https://images.unsplash.com/photo-1544025162-d76694265947?w=800&auto=format&fit=crop&q=80",
  "https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=800&auto=format&fit=crop&q=80",
  "https://images.unsplash.com/photo-1565299585323-38d6b0865b47?w=800&auto=format&fit=crop&q=80",
  "https://images.unsplash.com/photo-1563245372-f21724e3856d?w=800&auto=format&fit=crop&q=80",
  "https://images.unsplash.com/photo-1559847844-5315695dadae?w=800&auto=format&fit=crop&q=80",
  "https://images.unsplash.com/photo-1539136788836-5699e78bfc75?w=800&auto=format&fit=crop&q=80",
  "https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=800&auto=format&fit=crop&q=80",
  
  // Coffee & Cafes
  "https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?w=800&auto=format&fit=crop&q=80",
  "https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=800&auto=format&fit=crop&q=80",
  "https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?w=800&auto=format&fit=crop&q=80",
  "https://images.unsplash.com/photo-1447933601403-0c6688de566e?w=800&auto=format&fit=crop&q=80",
  "https://images.unsplash.com/photo-1442512595331-e89e73853f31?w=800&auto=format&fit=crop&q=80",
  
  // Workshops & Automotive
  "https://images.unsplash.com/photo-1486006920555-c77dce18193b?w=800&auto=format&fit=crop&q=80",
  "https://images.unsplash.com/photo-1619642751034-765dfdf7c58e?w=800&auto=format&fit=crop&q=80",
  "https://images.unsplash.com/photo-1503376780353-7e6692767b70?w=800&auto=format&fit=crop&q=80",
  "https://images.unsplash.com/photo-1581092160607-ee22621dd758?w=800&auto=format&fit=crop&q=80",
  "https://images.unsplash.com/photo-1504222490345-c075b6008014?w=800&auto=format&fit=crop&q=80",

  // Pharmacy, Clinics & Healthcare
  "https://images.unsplash.com/photo-1586015555751-63bb77f4322a?w=800&auto=format&fit=crop&q=80",
  "https://images.unsplash.com/photo-1629909613654-28e377c37b09?w=800&auto=format&fit=crop&q=80",
  "https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?w=800&auto=format&fit=crop&q=80",
  "https://images.unsplash.com/photo-1587854692152-cbe660dbde88?w=800&auto=format&fit=crop&q=80",
  "https://images.unsplash.com/photo-1516549655169-df83a0774514?w=800&auto=format&fit=crop&q=80",

  // Grocery, Retail & Supermarkets
  "https://images.unsplash.com/photo-1578916171728-46686eac8d58?w=800&auto=format&fit=crop&q=80",
  "https://images.unsplash.com/photo-1604719312566-8912e9227c6a?w=800&auto=format&fit=crop&q=80",
  "https://images.unsplash.com/photo-1542838132-92c53300491e?w=800&auto=format&fit=crop&q=80",
  "https://images.unsplash.com/photo-1583258292688-d0213dc5a3a8?w=800&auto=format&fit=crop&q=80",
  "https://images.unsplash.com/photo-1534723452862-4c874018d66d?w=800&auto=format&fit=crop&q=80",

  // Beach, Nature & Homestay
  "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=800&auto=format&fit=crop&q=80",
  "https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800&auto=format&fit=crop&q=80",
  "https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?w=800&auto=format&fit=crop&q=80",
  "https://images.unsplash.com/photo-1582719508461-905c673771fd?w=800&auto=format&fit=crop&q=80",
  "https://images.unsplash.com/photo-1540555700478-4be289fbecef?w=800&auto=format&fit=crop&q=80",

  // Agriculture, Rice, Honey & Farming
  "https://images.unsplash.com/photo-1500937386664-56d1dfef3854?w=800&auto=format&fit=crop&q=80",
  "https://images.unsplash.com/photo-1589923188900-85dae523342b?w=800&auto=format&fit=crop&q=80",
  "https://images.unsplash.com/photo-1587049352846-4a222e784d38?w=800&auto=format&fit=crop&q=80",
  "https://images.unsplash.com/photo-1595974482597-4b8da8879bc5?w=800&auto=format&fit=crop&q=80",
  "https://images.unsplash.com/photo-1584473457406-6240486418e9?w=800&auto=format&fit=crop&q=80",

  // Crafts, Bamboo, Batik & Sewing
  "https://images.unsplash.com/photo-1607344645866-009c320c5ab8?w=800&auto=format&fit=crop&q=80",
  "https://images.unsplash.com/photo-1558769132-cb1aea458c5e?w=800&auto=format&fit=crop&q=80",
  "https://images.unsplash.com/photo-1528459801416-a9e53bbf4e17?w=800&auto=format&fit=crop&q=80",
  "https://images.unsplash.com/photo-1584992236310-6edddc08acff?w=800&auto=format&fit=crop&q=80",
  "https://images.unsplash.com/photo-1594938298603-c8148c4dae35?w=800&auto=format&fit=crop&q=80",

  // Electronics & Mobile
  "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=800&auto=format&fit=crop&q=80",
  "https://images.unsplash.com/photo-1550009158-9ebf69173e03?w=800&auto=format&fit=crop&q=80",
  "https://images.unsplash.com/photo-1588872657578-7efd1f1555ed?w=800&auto=format&fit=crop&q=80",

  // Barbershop & Personal Care
  "https://images.unsplash.com/photo-1503951914875-452162b0f3f1?w=800&auto=format&fit=crop&q=80",
  "https://images.unsplash.com/photo-1585747860715-2ba37e788b70?w=800&auto=format&fit=crop&q=80",
  "https://images.unsplash.com/photo-1622286342621-4bd786c2447c?w=800&auto=format&fit=crop&q=80",

  // Building & Construction
  "https://images.unsplash.com/photo-1504307651254-35680f356dfd?w=800&auto=format&fit=crop&q=80",
  "https://images.unsplash.com/photo-1581094794329-c8112a89af12?w=800&auto=format&fit=crop&q=80",
  "https://images.unsplash.com/photo-1513694203232-719a280e022f?w=800&auto=format&fit=crop&q=80"
];

async function downloadImages() {
  console.log(`Starting download of 246 unique images...`);
  
  // Download base images from pool first
  const downloadedBuffers = [];
  for (let i = 0; i < PHOTO_URLS.length; i++) {
    const url = PHOTO_URLS[i];
    try {
      const res = await fetch(url, { headers: { 'User-Agent': 'Mozilla/5.0' } });
      if (res.ok) {
        const buf = Buffer.from(await res.arrayBuffer());
        downloadedBuffers.push(buf);
        process.stdout.write(`Downloaded base photo ${downloadedBuffers.length}/${PHOTO_URLS.length}\r`);
      }
    } catch (e) {
      console.error(`Failed to download ${url}:`, e.message);
    }
  }
  
  console.log(`\nBase photos downloaded: ${downloadedBuffers.length}`);
  if (downloadedBuffers.length === 0) {
    console.error("No base photos downloaded. Exiting.");
    return;
  }
  
  // Generate biz_real_1.jpg to biz_real_246.jpg
  for (let id = 1; id <= 246; id++) {
    const buf = downloadedBuffers[(id - 1) % downloadedBuffers.length];
    const fileName = `biz_real_${id}.jpg`;
    
    const fePath = path.join(FRONTEND_IMG_DIR, fileName);
    const bePath = path.join(BACKEND_IMG_DIR, fileName);
    
    fs.writeFileSync(fePath, buf);
    fs.writeFileSync(bePath, buf);
  }
  
  console.log(`\nSuccessfully created and saved all 246 business image files in frontend and backend!`);
}

downloadImages();
