const puppeteer = require('puppeteer');
const path = require('path');

async function testScreens() {
  const browser = await puppeteer.launch({
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
    defaultViewport: { width: 1280, height: 720 }
  });

  const page = await browser.newPage();
  const outDir = path.join('C:', 'Users', 'a4026', '.gemini', 'antigravity-ide', 'brain', '575f3acc-37f3-4b99-a584-b35bfa9bfd6f');

  // Test Login Page on 1280x720 (standard laptop resolution)
  await page.goto('http://localhost:5173/login', { waitUntil: 'domcontentloaded' });
  await page.evaluate(() => {
    document.cookie = 'surade_welcome_banner_shown=1; path=/; SameSite=Lax';
    document.querySelectorAll('.welcome-banner-modal, [class*="welcome-banner"]').forEach(el => el.remove());
  });
  await new Promise(r => setTimeout(r, 600));
  await page.screenshot({ path: path.join(outDir, 'verify_login_fixed_720p.png') });
  console.log('Captured login 720p screenshot');

  await browser.close();
}

testScreens().catch(console.error);
