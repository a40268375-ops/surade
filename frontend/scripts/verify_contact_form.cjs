const puppeteer = require('puppeteer');
const path = require('path');

async function testContactForm() {
  const browser = await puppeteer.launch({
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
    defaultViewport: { width: 1200, height: 900 }
  });

  const page = await browser.newPage();
  const outDir = path.join('C:', 'Users', 'a4026', '.gemini', 'antigravity-ide', 'brain', '575f3acc-37f3-4b99-a584-b35bfa9bfd6f');

  await page.goto('http://localhost:5173/contact', { waitUntil: 'domcontentloaded' });
  await page.evaluate(() => {
    document.cookie = 'surade_welcome_banner_shown=1; path=/; SameSite=Lax';
    document.querySelectorAll('.welcome-banner-modal, [class*="welcome-banner"]').forEach(el => el.remove());
  });
  await new Promise(r => setTimeout(r, 600));
  await page.evaluate(() => {
    const el = document.querySelector('.contact-form-card');
    if (el) el.scrollIntoView({ behavior: 'instant', block: 'center' });
    else window.scrollTo(0, 900);
  });
  await new Promise(r => setTimeout(r, 800));
  await page.screenshot({ path: path.join(outDir, 'verify_contact_form_captcha.png') });
  console.log('Captured contact form screenshot');

  await browser.close();
}

testContactForm().catch(console.error);
