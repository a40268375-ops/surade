const https = require('https');

async function test(query) {
  const url = 'https://commons.wikimedia.org/w/api.php?action=query&generator=search&gsrnamespace=6&gsrsearch=' + 
    encodeURIComponent(query) + '&gsrlimit=10&prop=imageinfo&iiprop=url&iiurlwidth=800&format=json';
  return new Promise(r => {
    https.get(url, { headers: { 'User-Agent': 'SuradeApp/1.0 (https://surade.com; info@surade.com)' } }, res => {
      let d = '';
      res.on('data', c => d += c);
      res.on('end', () => {
        try {
          const j = JSON.parse(d);
          const pages = j.query && j.query.pages ? Object.values(j.query.pages) : [];
          console.log(`\n=== Query: "${query}" -> ${pages.length} files ===`);
          pages.forEach(p => {
            if (p.imageinfo && p.imageinfo[0]) {
              console.log(`- ${p.title}`);
              console.log(`  ${p.imageinfo[0].thumburl}`);
            }
          });
        } catch (e) {
          console.log('Err:', e.message);
        }
        r();
      });
    });
  });
}

async function run() {
  await test('Surade');
  await test('Curug Cikaso');
  await test('Minajaya');
  await test('Ciletuh');
  await test('Jampang Sukabumi');
  await test('Pajampangan');
  await test('Sukabumi Jawa Barat');
}
run();
