const puppeteer = require('puppeteer');
const path = require('path');

async function testLoggedIn() {
  const browser = await puppeteer.launch({
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
    defaultViewport: { width: 390, height: 844, deviceScaleFactor: 2, isMobile: true }
  });

  const page = await browser.newPage();
  page.on('pageerror', err => console.log('PAGE ERROR STACK:', err.stack));
  page.on('console', msg => {
    console.log('PAGE CONSOLE:', msg.text());
  });

  const outDir = path.join('C:', 'Users', 'a4026', '.gemini', 'antigravity-ide', 'brain', '575f3acc-37f3-4b99-a584-b35bfa9bfd6f');

  await page.goto('http://localhost:5173/', { waitUntil: 'domcontentloaded' });
  await page.evaluate(() => {
    document.cookie = 'surade_welcome_banner_shown=1; path=/; SameSite=Lax';
    document.querySelectorAll('.welcome-banner-modal, [class*="welcome-banner"]').forEach(el => el.remove());
  });

  await page.goto('http://localhost:5173/', { waitUntil: 'domcontentloaded' });
  await new Promise(r => setTimeout(r, 2500));

  // Scroll to featured ads section
  await page.evaluate(() => {
    const el = document.querySelector('.prem-ads-wrap');
    if (el) el.scrollIntoView({ behavior: 'instant', block: 'center' });
    else window.scrollTo(0, 450);
  });
  await new Promise(r => setTimeout(r, 1200));

  await page.screenshot({ path: path.join(outDir, 'verify_home_hero_no_arrows_mobile.png') });
  console.log('Captured home hero mobile without arrows and with new logo');

  await browser.close();
}

testLoggedIn().catch(console.error);
