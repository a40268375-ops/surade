const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');

async function captureProductSection() {
  const browser = await puppeteer.launch({
    headless: 'new',
    defaultViewport: { width: 1920, height: 1080 }
  });
  const page = await browser.newPage();
  await page.setViewport({ width: 1920, height: 1080 });
  
  await page.goto('http://localhost:5173/business/1', { waitUntil: 'networkidle2' });
  await page.addStyleTag({
    content: '::-webkit-scrollbar { display: none !important; } .umkm-promo-modal-overlay { display: none !important; }'
  });
  await new Promise(r => setTimeout(r, 1500));

  // Ambil area produk yang proporsional
  await page.evaluate(() => {
    window.scrollTo(0, 450);
  });
  await new Promise(r => setTimeout(r, 1000));

  const buf = await page.screenshot({
    clip: { x: 340, y: 150, width: 1240, height: 600 }
  });

  const dest = path.join(__dirname, 'src/assets/panduan/panduan_m3_step2_products.png');
  fs.writeFileSync(dest, buf);
  console.log('Saved clean product catalog screenshot to:', dest, '(' + buf.length + ' bytes)');

  await browser.close();
}

captureProductSection().catch(console.error);
