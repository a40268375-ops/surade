const puppeteer = require('puppeteer');

async function testClick() {
  const browser = await puppeteer.launch({
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
    defaultViewport: { width: 1280, height: 800 }
  });

  const page = await browser.newPage();
  await page.goto('http://localhost:5173/', { waitUntil: 'networkidle2' });

  // Close welcome banner if any
  await page.evaluate(() => {
    document.querySelectorAll('.welcome-banner-modal, [class*="welcome-banner"]').forEach(el => el.remove());
  });

  console.log('Current URL before click:', page.url());

  // Find the Bibit Durian thumb
  const clicked = await page.evaluate(() => {
    const thumbs = Array.from(document.querySelectorAll('.prem-ads-thumb'));
    for (const thumb of thumbs) {
      if (thumb.textContent.includes('Durian')) {
        const link = thumb.querySelector('a');
        console.log('Found thumb link:', link.href);
        link.click();
        return link.href;
      }
    }
    return null;
  });

  console.log('Clicked href:', clicked);
  await new Promise(r => setTimeout(r, 1000));
  console.log('URL after click:', page.url());

  const pageTitle = await page.evaluate(() => {
    return document.querySelector('h1')?.textContent || document.title;
  });
  console.log('Page Title / H1:', pageTitle);

  await browser.close();
}

testClick().catch(console.error);
