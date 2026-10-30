const puppeteer = require('puppeteer');
const path = require('path');
const fs = require('fs');

const outDir = path.resolve(__dirname, '../src/assets/panduan');

async function captureModule1() {
  console.log('Capturing Module 1: Beranda & Pencarian...');
  const browser = await puppeteer.launch({
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
    defaultViewport: { width: 1280, height: 900, deviceScaleFactor: 2 }
  });

  const page = await browser.newPage();
  await page.goto('http://localhost:5173/', { waitUntil: 'domcontentloaded' });
  await new Promise(r => setTimeout(r, 2000));

  // Clean overlays & popups
  await page.evaluate(() => {
    localStorage.setItem('surade_welcome_modal_closed', 'true');
    localStorage.setItem('hasSeenWelcome', 'true');
    document.querySelectorAll('.welcome-modal, [class*="welcome"], [class*="backdrop"]').forEach(el => el.remove());
  });
  await new Promise(r => setTimeout(r, 500));

  // 1. Step 1: Hero Search Bar cleanly centered
  // Capture from y=0 to height 600 so the search bar and hero text are perfectly framed in the center
  await page.evaluate(() => window.scrollTo(0, 0));
  await new Promise(r => setTimeout(r, 400));
  await page.screenshot({
    path: path.join(outDir, 'panduan_home_hero.png'),
    clip: { x: 40, y: 0, width: 1200, height: 640 }
  });
  console.log('Captured panduan_home_hero.png');

  // 2. Step 2: 10 Categories Section
  await page.evaluate(() => {
    const catSec = document.querySelector('.category-grid') || document.querySelector('.categories-grid') || document.querySelector('section:nth-of-type(2)');
    if (catSec) {
      catSec.scrollIntoView({ block: 'center' });
    } else {
      window.scrollTo(0, 520);
    }
  });
  await new Promise(r => setTimeout(r, 600));
  const catRect = await page.evaluate(() => {
    const el = document.querySelector('.category-grid') || document.querySelector('.categories-grid') || document.querySelector('section:nth-of-type(2)');
    if (el) {
      const rect = el.getBoundingClientRect();
      return { x: 40, y: Math.max(0, rect.top + window.scrollY - 80), width: 1200, height: 600 };
    }
    return { x: 40, y: 460, width: 1200, height: 600 };
  });
  await page.screenshot({
    path: path.join(outDir, 'panduan_home_categories.png'),
    clip: { x: catRect.x, y: catRect.y, width: catRect.width, height: catRect.height }
  });
  console.log('Captured panduan_home_categories.png');

  // 3. Step 3: Featured UMKM Cards
  await page.evaluate(() => {
    const feat = document.querySelector('.featured-businesses') || document.querySelector('.business-grid') || document.querySelector('.home-recommendations') || document.querySelector('section:nth-of-type(3)');
    if (feat) {
      feat.scrollIntoView({ block: 'start' });
    } else {
      window.scrollTo(0, 1100);
    }
  });
  await new Promise(r => setTimeout(r, 600));
  const featRect = await page.evaluate(() => {
    const el = document.querySelector('.featured-businesses') || document.querySelector('.business-grid') || document.querySelector('section:nth-of-type(3)');
    if (el) {
      const rect = el.getBoundingClientRect();
      return { x: 40, y: Math.max(0, rect.top + window.scrollY - 30), width: 1200, height: 640 };
    }
    return { x: 40, y: 1050, width: 1200, height: 640 };
  });
  await page.screenshot({
    path: path.join(outDir, 'panduan_home_featured.png'),
    clip: { x: featRect.x, y: featRect.y, width: featRect.width, height: featRect.height }
  });
  console.log('Captured panduan_home_featured.png');

  await browser.close();
  console.log('Module 1 snapshots complete!');
}

captureModule1().catch(console.error);
