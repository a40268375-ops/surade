const puppeteer = require('puppeteer');
const path = require('path');
const fs = require('fs');

const outDir = path.resolve(__dirname, '../src/assets/panduan');

async function captureMissing() {
  const browser = await puppeteer.launch({
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
    defaultViewport: { width: 1280, height: 800, deviceScaleFactor: 2 }
  });

  const page = await browser.newPage();

  async function setSellerAuth(p) {
    await p.evaluate(() => {
      localStorage.setItem('token', 'mock-valid-token-surade-umkm');
      localStorage.setItem('user', JSON.stringify({
        id: 1,
        name: 'Haji Ahmad Fauzi',
        username: 'ahmad_surade',
        email: 'ahmad@surade.com',
        role: 'seller',
        phone: '081234567890'
      }));
    });
  }

  // 1. Add business modal / form
  await page.goto('http://localhost:5173/dashboard/businesses', { waitUntil: 'domcontentloaded' });
  await setSellerAuth(page);
  await page.goto('http://localhost:5173/dashboard/businesses', { waitUntil: 'domcontentloaded' });
  await new Promise(r => setTimeout(r, 1500));
  await page.evaluate(() => {
    const btns = Array.from(document.querySelectorAll('button'));
    const addBtn = btns.find(b => b.textContent.includes('Tambah') || b.textContent.includes('+') || b.className.includes('add'));
    if (addBtn) addBtn.click();
  });
  await new Promise(r => setTimeout(r, 1000));
  await page.screenshot({
    path: path.join(outDir, 'panduan_add_business.png'),
    clip: { x: 0, y: 0, width: 1280, height: 720 }
  });
  console.log('Saved panduan_add_business.png');

  // 2. Pricing / QRIS payment modal
  await page.goto('http://localhost:5173/pricing', { waitUntil: 'domcontentloaded' });
  await new Promise(r => setTimeout(r, 1500));
  await page.evaluate(() => {
    const btns = Array.from(document.querySelectorAll('button'));
    const planBtn = btns.find(b => b.textContent.includes('Pilih') || b.textContent.includes('Upgrade') || b.textContent.includes('Langganan'));
    if (planBtn) planBtn.click();
  });
  await new Promise(r => setTimeout(r, 1000));
  await page.screenshot({
    path: path.join(outDir, 'panduan_dash_bayar.png'),
    clip: { x: 0, y: 0, width: 1280, height: 720 }
  });
  fs.copyFileSync(path.join(outDir, 'panduan_dash_bayar.png'), path.join(outDir, 'panduan_bayar.png'));
  console.log('Saved panduan_dash_bayar.png and panduan_bayar.png');

  await browser.close();
  console.log('DONE RE-CAPTURING MISSING ITEMS!');
}

captureMissing().catch(console.error);
