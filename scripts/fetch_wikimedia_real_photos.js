const fs = require('fs');

async function searchWikiFile(query) {
  const url = `https://commons.wikimedia.org/w/api.php?action=query&generator=search&gsrnamespace=6&gsrsearch=${encodeURIComponent(query)}&gsrlimit=3&prop=imageinfo&iiprop=url|mime&format=json`;
  try {
    const res = await fetch(url, { headers: { 'User-Agent': 'SuradeRealApp/1.0 (info@surade.com)' } });
    const data = await res.json();
    if (!data.query || !data.query.pages) return null;
    const pages = Object.values(data.query.pages);
    for (const p of pages) {
      if (p.imageinfo && p.imageinfo[0] && p.imageinfo[0].url) {
        const u = p.imageinfo[0].url;
        if (u.endsWith('.jpg') || u.endsWith('.png') || u.endsWith('.jpeg') || u.includes('.jpg?') || u.includes('.png?')) {
          return u;
        }
      }
    }
  } catch (e) {
    console.error(query, e.message);
  }
  return null;
}

const queries = [
  { key: 'cikaso', q: 'Curug Cikaso' },
  { key: 'minajaya', q: 'Pantai Sukabumi' },
  { key: 'emping', q: 'Emping' },
  { key: 'gula_aren', q: 'Gula aren' },
  { key: 'bakso', q: 'Bakso' },
  { key: 'ikan_bakar', q: 'Ikan bakar' },
  { key: 'warung', q: 'Warung Indonesia' },
  { key: 'bengkel', q: 'Bengkel sepeda motor' },
  { key: 'apotek', q: 'Apotek Indonesia' },
  { key: 'puskesmas', q: 'Puskesmas' },
  { key: 'bank_bri', q: 'Bank Rakyat Indonesia' },
  { key: 'batik', q: 'Batik Indonesia' },
  { key: 'anyaman', q: 'Anyaman bambu' },
  { key: 'beras', q: 'Beras padi' },
  { key: 'bibit', q: 'Pembibitan durian tanaman' },
  { key: 'ternak_ayam', q: 'Peternakan ayam' },
  { key: 'ternak_kambing', q: 'Kambing ternak Indonesia' },
  { key: 'madu', q: 'Madu lebah' },
  { key: 'pisang', q: 'Pohon pisang kebun' },
  { key: 'masjid', q: 'Masjid di Jawa Barat' },
  { key: 'sekolah_sma', q: 'Sekolah Menengah Atas' },
  { key: 'pos_indonesia', q: 'Kantor Pos Indonesia' }
];

async function run() {
  const results = {};
  for (const item of queries) {
    const url = await searchWikiFile(item.q);
    results[item.key] = url;
    console.log(`${item.key} (${item.q}) => ${url}`);
  }
  fs.writeFileSync('scripts/wikimedia_real_photos.json', JSON.stringify(results, null, 2));
}

run();
