const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');

async function captureWhatsAppAndMaps() {
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
      .umkm-promo-modal-overlay, [class*="modal-backdrop"], .umkm-promo-popup {
        display: none !important;
      }
    `
  });

  await new Promise(r => setTimeout(r, 2000));

  // 1. Capture WhatsApp Button Card
  console.log('📸 Mengambil screenshot tombol Chat WhatsApp...');
  await page.evaluate(() => {
    window.scrollTo(0, 700);
  });
  await new Promise(r => setTimeout(r, 800));

  const waBtnEl = await page.$('.business-whatsapp-btn') || 
                  await page.$('.biz-contact-actions') || 
                  await page.$('.biz-cta-box') ||
                  await page.$('.biz-sidebar-card') ||
                  await page.$('.contact-actions');

  let waBuf;
  if (waBtnEl) {
    waBuf = await waBtnEl.screenshot();
  } else {
    // Scroll and clip the contact / WhatsApp area
    waBuf = await page.screenshot({
      clip: { x: 1050, y: 180, width: 520, height: 480 }
    });
  }

  const destWA = path.join(__dirname, 'src/assets/panduan/panduan_m3_step3_whatsapp.png');
  fs.writeFileSync(destWA, waBuf);
  console.log('✅ Tersimpan WhatsApp:', destWA, '(' + waBuf.length + ' bytes)');

  // 2. Capture Google Maps & Petunjuk Arah Section
  console.log('📸 Mengambil screenshot Peta Lokasi Google Maps...');
  await page.evaluate(() => {
    window.scrollTo(0, 1100);
  });
  await new Promise(r => setTimeout(r, 1000));

  const mapEl = await page.$('.business-map-section') || 
                await page.$('.leaflet-container') || 
                await page.$('.biz-map-card') ||
                await page.$('.map-container');

  let mapBuf;
  if (mapEl) {
    mapBuf = await mapEl.screenshot();
  } else {
    // Clip the map area on page
    mapBuf = await page.screenshot({
      clip: { x: 340, y: 150, width: 1240, height: 550 }
    });
  }

  const destMap = path.join(__dirname, 'src/assets/panduan/panduan_m3_step4_maps.png');
  fs.writeFileSync(destMap, mapBuf);
  console.log('✅ Tersimpan Maps:', destMap, '(' + mapBuf.length + ' bytes)');

  await browser.close();
  console.log('🎉 Selesai memperbarui WhatsApp & Maps screenshot!');
}

captureWhatsAppAndMaps().catch(console.error);
