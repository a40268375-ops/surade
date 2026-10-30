const puppeteer = require('puppeteer');

async function checkBiz() {
  const browser = await puppeteer.launch({
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
    defaultViewport: { width: 1280, height: 800 }
  });

  const page = await browser.newPage();
  page.on('console', msg => console.log('PAGE:', msg.text()));

  await page.goto('http://localhost:5173/business/34', { waitUntil: 'domcontentloaded' });
  await new Promise(r => setTimeout(r, 2500));
  let biz34 = await page.evaluate(() => {
    document.querySelectorAll('[class*="welcome-banner"], [class*="modal"], [class*="backdrop"]').forEach(el => el.remove());
    return {
      title: document.title,
      headings: Array.from(document.querySelectorAll('h1, h2, h3, h4')).map(h => h.textContent.trim()).filter(Boolean),
      mainContent: document.querySelector('.business-detail-container, main, #root')?.innerText.substring(0, 300)
    };
  });
  console.log('Biz 34 Details:', JSON.stringify(biz34, null, 2));

  await browser.close();
}

checkBiz().catch(console.error);
