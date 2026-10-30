const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');

async function captureMapHighQuality() {
  const browser = await puppeteer.launch({
    headless: 'new',
    defaultViewport: { width: 1920, height: 1080 }
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 1920, height: 1080 });

  await page.goto('http://localhost:5173/business/1', { waitUntil: 'networkidle2' });
  await page.addStyleTag({
    content: `
      ::-webkit-scrollbar { display: none !important; }
      body, html { scrollbar-width: none !important; -ms-overflow-style: none !important; }
      .umkm-promo-modal-overlay { display: none !important; }
    `
  });

  await new Promise(r => setTimeout(r, 2500));

  // Scroll to map location
  await page.evaluate(() => {
    const mapHeader = Array.from(document.querySelectorAll('h2, h3, div')).find(el => el.textContent && el.textContent.includes('Lokasi & Peta'));
    if (mapHeader) {
      mapHeader.scrollIntoView({ behavior: 'instant', block: 'center' });
    } else {
      window.scrollTo(0, 950);
    }
  });

  await new Promise(r => setTimeout(r, 1200));

  const buf = await page.screenshot({
    clip: { x: 330, y: 150, width: 1260, height: 550 }
  });

  const destMap = path.join(__dirname, 'src/assets/panduan/panduan_m3_step4_maps.png');
  fs.writeFileSync(destMap, buf);
  console.log('✅ Maps screenshot captured:', destMap, '(' + buf.length + ' bytes)');

  await browser.close();
}

captureMapHighQuality().catch(console.error);
