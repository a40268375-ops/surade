const puppeteer = require('puppeteer');
const path = require('path');

const outDir = path.resolve(__dirname, '../src/assets/panduan');

async function snapCategoryFilter() {
  const browser = await puppeteer.launch({
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
    defaultViewport: { width: 1280, height: 900, deviceScaleFactor: 2 }
  });

  const page = await browser.newPage();
  await page.goto('http://localhost:5173/category/all', { waitUntil: 'domcontentloaded' });
  await new Promise(r => setTimeout(r, 2000));

  await page.evaluate(() => {
    localStorage.setItem('surade_welcome_modal_closed', 'true');
    localStorage.setItem('hasSeenWelcome', 'true');
    document.querySelectorAll('.welcome-modal, [class*="welcome"], [class*="backdrop"]').forEach(el => el.remove());
  });
  await new Promise(r => setTimeout(r, 500));

  // Find the directory filter controls / business list section
  const filterSection = await page.$('.category-controls, .category-filter-bar, .filter-section, .category-content, main, .category-container, div[class*="filter"]');
  
  // Let's scroll slightly so the filter bar (Search, Filter Desa, Sort By) and business cards are right in the center of the viewport
  await page.evaluate(() => {
    const el = document.querySelector('.category-filter-bar') || document.querySelector('.category-controls') || document.querySelector('.business-grid') || document.querySelector('main');
    if (el) {
      el.scrollIntoView({ block: 'start' });
      window.scrollBy(0, -80);
    } else {
      window.scrollTo(0, 320);
    }
  });
  await new Promise(r => setTimeout(r, 800));

  await page.screenshot({
    path: path.join(outDir, 'panduan_category_filter.png')
  });
  console.log('Saved clean panduan_category_filter.png!');

  await browser.close();
}

snapCategoryFilter().catch(console.error);
