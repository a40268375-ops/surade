const puppeteer = require('puppeteer');
const path = require('path');

async function testMobile() {
  const browser = await puppeteer.launch({
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
    defaultViewport: { width: 390, height: 844, deviceScaleFactor: 2, isMobile: true }
  });

  const page = await browser.newPage();
  await page.goto('http://localhost:5173/', { waitUntil: 'domcontentloaded' });

  await page.evaluate(() => {
    localStorage.setItem('surade_welcome_modal_closed', 'true');
    localStorage.setItem('hasSeenWelcome', 'true');
    document.querySelectorAll('.welcome-modal, [class*="welcome"], [class*="backdrop"]').forEach(el => el.remove());
  });

  await new Promise(r => setTimeout(r, 1500));

  const blogSec = await page.$('#blog-section');
  if (blogSec) {
    await blogSec.scrollIntoView();
    await new Promise(r => setTimeout(r, 500));
    const outPath = path.join('C:', 'Users', 'a4026', '.gemini', 'antigravity-ide', 'brain', '575f3acc-37f3-4b99-a584-b35bfa9bfd6f', 'blog_mobile_verified.png');
    await blogSec.screenshot({ path: outPath });
    console.log('Successfully captured #blog-section for mobile:', outPath);
  }

  await browser.close();
}

testMobile().catch(console.error);
