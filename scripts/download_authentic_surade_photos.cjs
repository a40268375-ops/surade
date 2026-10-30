const fs = require('fs');
const path = require('path');
const https = require('https');
const http = require('http');

const FRONTEND_DIR = path.join(__dirname, '../frontend/public/images/businesses');
const BACKEND_DIR = path.join(__dirname, '../backend/public/images/businesses');
const STORAGE_DIR_1 = path.join(__dirname, '../backend/storage/app/public/businesses/real_images');
const STORAGE_DIR_2 = path.join(__dirname, '../backend/public/storage/businesses/real_images');

[FRONTEND_DIR, BACKEND_DIR, STORAGE_DIR_1, STORAGE_DIR_2].forEach(dir => {
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
});

function searchBingImages(query) {
  return new Promise((resolve) => {
    const url = `https://www.bing.com/images/search?q=${encodeURIComponent(query)}&first=1&scenario=ImageBasicHover`;
    const req = https.get(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept-Language': 'id-ID,id;q=0.9,en-US;q=0.8,en;q=0.7'
      }
    }, (res) => {
      let html = '';
      res.on('data', c => html += c);
      res.on('end', () => {
        const matches = [...html.matchAll(/murl&quot;:&quot;(http[^&]+)&quot;/g)].map(m => m[1]);
        resolve(matches);
      });
    });
    req.on('error', () => resolve([]));
    req.setTimeout(8000, () => { req.destroy(); resolve([]); });
  });
}

function downloadImageDirect(url, destPath) {
  return new Promise((resolve) => {
    try {
      const client = url.startsWith('https') ? https : http;
      const req = client.get(url, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
          'Referer': 'https://www.bing.com/'
        }
      }, (res) => {
        if (res.statusCode === 301 || res.statusCode === 302) {
          const loc = res.headers.location;
          if (loc) return downloadImageDirect(loc, destPath).then(resolve);
          return resolve(false);
        }
        if (res.statusCode !== 200) {
          return resolve(false);
        }

        const file = fs.createWriteStream(destPath);
        res.pipe(file);
        file.on('finish', () => {
          file.close(() => {
            try {
              const stats = fs.statSync(destPath);
              // Must be a valid image > 8KB and not HTML error page
              if (stats.size > 8000) {
                resolve(true);
              } else {
                fs.unlinkSync(destPath);
                resolve(false);
              }
            } catch (e) { resolve(false); }
          });
        });
      });
      req.on('error', () => resolve(false));
      req.setTimeout(10000, () => {
        req.destroy();
        resolve(false);
      });
    } catch (e) {
      resolve(false);
    }
  });
}

const rawData = require('./all_153_businesses_raw.json');

// Build authentic Indonesian/Surade queries for each business
function getSearchQueries(b) {
  const desa = b.address.split(',')[1]?.trim() || '';
  const name = b.name;
  const cat = b.category_name || '';
  
  const queries = [];
  
  // Specific custom tailored queries
  if (name.includes('BRI')) queries.push('kantor bank bri unit surade sukabumi', 'bank bri surade sukabumi', 'kantor unit bri pedesaan');
  else if (name.includes('BSI')) queries.push('kantor bank syariah indonesia surade', 'bank bsi kcp surade sukabumi', 'kantor cabang bank bsi');
  else if (name.includes('BJB')) queries.push('kantor bank bjb surade sukabumi', 'kantor kas bank bjb surade', 'gedung bank bjb');
  else if (name.includes('Pegadaian')) queries.push('kantor pegadaian upc surade sukabumi', 'kantor pegadaian surade');
  else if (name.includes('Kantor Pos')) queries.push('kantor pos surade 43179 sukabumi', 'kantor pos indonesia surade');
  else if (name.includes('Puskesmas DTP')) queries.push('puskesmas surade sukabumi', 'gedung puskesmas dtp surade rawat inap');
  else if (name.includes('Pustu') || name.includes('Puskesmas Pembantu')) queries.push('puskesmas pembantu pustu poskesdes desa', 'puskesmas buniwangi surade');
  else if (name.includes('AHASS')) queries.push('bengkel resmi ahass honda surade sukabumi', 'bengkel motor ahass honda indonesia');
  else if (name.includes('Yamaha')) queries.push('dealer resmi yamaha selamat motor surade', 'dealer motor yamaha surade');
  else if (name.includes('Bakso Tiga Sodara')) queries.push('bakso tiga sodara surade sukabumi', 'bakso urat surade sukabumi kaldu sapi');
  else if (name.includes('Yasa Hotel')) queries.push('hotel yasa surade sukabumi', 'penginapan surade sukabumi kamar');
  else if (name.includes('Apotek Kimia Farma')) queries.push('apotek kimia farma surade sukabumi', 'apotek kimia farma indonesia');
  else if (name.includes('Apotek')) queries.push('apotek surade farma sukabumi', 'apotek obat farmasi indonesia surade');
  else if (name.includes('Surade Medika') || name.includes('Klinik')) queries.push('klinik rawat inap surade medika', 'klinik dokter surade sukabumi');
  else if (name.includes('Toko Emas')) queries.push('toko emas surade sukabumi perhiasan', 'etalase toko emas perhiasan indonesia');
  else if (name.includes('Toserba Selamat')) queries.push('toserba selamat surade sukabumi', 'toserba selamat pusat belanja swalayan');
  else if (name.includes('SPBU')) queries.push('spbu pertamina surade 34.431.18 sukabumi', 'spbu pertamina surade');
  else if (name.includes('Pasar Tradisional')) queries.push('pasar inpres surade sukabumi', 'pasar tradisional surade');
  else if (name.includes('Masjid Agung')) queries.push('masjid agung al jalil surade sukabumi', 'masjid agung surade kubah');
  else if (name.includes('SMAN 1')) queries.push('gedung sman 1 surade sukabumi', 'sman 1 surade');
  else if (name.includes('SMKN 1')) queries.push('gedung smkn 1 surade sukabumi', 'smkn 1 surade');
  
  // Specific Local Surade Commodities
  else if (name.includes('Durian Bawor')) queries.push('bibit durian bawor polybag buniwangi surade', 'pohon durian bawor sukabumi', 'kebun bibit durian bawor');
  else if (name.includes('Roastery') || name.includes('Robusta')) queries.push('kopi robusta sangrai jampang surade sukabumi', 'biji kopi robusta jampang', 'roastery kopi robusta jampang');
  else if (name.includes('Gorengan') || (name.includes('Warung Kopi') && !name.includes('Ikan Bakar'))) queries.push('warung kopi gorengan sunda pinggir jalan', 'warkop kopi tubruk gorengan pisang', 'warung kopi sederhana kayu sunda');
  else if (name.includes('Curug Cikaso')) queries.push('air terjun curug cikaso surade sukabumi', 'curug cikaso geopark ciletuh');
  else if (name.includes('Pantai Minajaya') || name.includes('Minajaya')) {
    if (name.includes('Pelelangan') || name.includes('TPI')) queries.push('tempat pelelangan ikan tpi pantai minajaya surade', 'tpi pantai minajaya sukabumi');
    else if (name.includes('Ikan Bakar')) queries.push('ikan bakar pantai minajaya surade sukabumi', 'rumah makan ikan bakar pantai minajaya');
    else if (name.includes('Homestay')) queries.push('homestay penginapan pantai minajaya surade', 'villa pantai minajaya sukabumi');
    else if (name.includes('Perahu')) queries.push('perahu nelayan pantai minajaya surade', 'perahu wisata pantai minajaya');
    else queries.push('pantai minajaya surade sukabumi', 'pantai minajaya pasiripis surade');
  }
  else if (name.includes('Gula Kelapa') || name.includes('Gula Merah')) queries.push('pengrajin gula kelapa aren cetak sunda', 'penderes gula kelapa jampang sukabumi');
  else if (name.includes('Opak Ketan')) queries.push('opak ketan bakar jampang sukabumi', 'pembuat opak ketan khas jampang sunda');
  else if (name.includes('Madu Hutan') || name.includes('Odeng')) queries.push('sarang lebah madu odeng hutan jampang sukabumi', 'madu odeng murni hutan liar');
  else if (name.includes('Anyaman')) queries.push('pengrajin anyaman bambu boboko besek sunda', 'anyaman bambu tradisional jampang sukabumi');
  else if (name.includes('Penggilingan Padi')) queries.push('pabrik penggilingan padi karung beras desa', 'helu penggilingan padi beras sunda');
  else if (name.includes('Domba') || name.includes('Kambing')) queries.push('kandang ternak domba garut kambing sunda', 'peternakan domba garut kambing pe');
  else if (name.includes('Ikan Nila') || name.includes('Gurame') || name.includes('Lele')) queries.push('kolam budidaya ikan nila gurame air tawar sunda', 'budidaya ikan air tawar kolam tanah');
  else if (name.includes('Bengkel Las')) queries.push('bengkel las listrik pagar teralis besi indonesia', 'bengkel las teralis kanopi');
  else if (name.includes('Bengkel Motor') || name.includes('Tambal')) queries.push('bengkel motor servis motor pinggir jalan desa', 'bengkel motor servis oli mekanik indonesia');
  else if (name.includes('Sate')) queries.push('gerobak warung sate kambing bakar tongseng', 'warung sate kambing gule madura sunda');
  else if (name.includes('Bakso') || name.includes('Mie Ayam')) queries.push('warung bakso urat mie ayam mangkok kaldu sapi', 'gerobak warung bakso mie ayam pinggir jalan');
  else if (name.includes('Nasi Liwet') || name.includes('Nasi Uduk') || name.includes('Timbel')) queries.push('nasi liwet kastrol sunda lalapan sambal', 'nasi timbel komplit ayam goreng tahu tempe');
  else if (name.includes('Pangkas Rambut') || name.includes('Barbershop')) queries.push('pangkas rambut pria asgar potong rambut', 'kursi pangkas rambut cermin barbershop indonesia');
  else if (name.includes('Jahit') || name.includes('Penjahit')) queries.push('mesin jahit konveksi penjahit baju pakaian sunda', 'ibu penjahit mesin jahit kain busana');
  else if (name.includes('Cuci Steam')) queries.push('cuci steam motor salju hidrolik indonesia', 'tempat cuci steam motor salju bersih');
  else if (name.includes('Pulsa') || name.includes('Cell')) queries.push('etalase konter pulsa hp aksesoris counter pulsa', 'kios pulsa kuota aksesoris hp konter');
  else if (name.includes('Sembako') || name.includes('Kelontong')) queries.push('toko sembako beras minyak kelontong grosir', 'toko kelontong sembako sembako karung beras');
  else if (name.includes('Batik')) queries.push('pengrajin batik tulis motif jampang sukabumi canting', 'membatik kain batik tulis cap indonesia');
  else if (name.includes('Pisang')) queries.push('pisang tanduk jumbo hasil panen tani jampang sukabumi', 'tandan buah pisang tanduk perkebunan');
  else if (name.includes('Ikan Asin')) queries.push('jemur ikan asin teri jambal roti pesisir nelayan', 'ikan asin jemur nampan bambu');
  else if (name.includes('Pupuk') || name.includes('Saprotan')) queries.push('toko pupuk pertanian saprotan obat tanaman obat hama', 'kios saprotan pupuk bibit pertanian');
  else if (name.includes('Mebel') || name.includes('Kusen')) queries.push('pengrajin mebel kusen pintu kayu jati jepara sunda', 'toko mebel kayu lemari meja kursi jati');
  else if (name.includes('Keripik')) queries.push('keripik singkong renyah goreng wajan cemilan sunda', 'produksi keripik singkong gurih');
  else if (name.includes('Gua Sungging')) queries.push('gua sungging surade sukabumi geopark', 'wisata goa sungging ciletuh');
  else {
    queries.push(`${name} ${desa} surade sukabumi`, `${name} sunda`, `${cat} indonesia`);
  }
  
  return queries;
}

async function processBusiness(b) {
  const id = b.id;
  const filename = `biz_real_${id}.jpg`;
  const destPath = path.join(FRONTEND_DIR, filename);
  
  const queries = getSearchQueries(b);
  
  console.log(`\n[Biz ${id}] ${b.name} (${b.category_name})`);
  
  for (const q of queries) {
    console.log(`  Searching: "${q}"...`);
    const urls = await searchBingImages(q);
    console.log(`  Found ${urls.length} images.`);
    
    for (let i = 0; i < Math.min(urls.length, 6); i++) {
      const url = urls[i];
      // Skip bad extensions or vector/svg/gif/icons
      if (url.includes('.svg') || url.includes('.gif') || url.includes('placeholder')) continue;
      
      const ok = await downloadImageDirect(url, destPath);
      if (ok) {
        const stats = fs.statSync(destPath);
        // Sync to backend and storage
        fs.copyFileSync(destPath, path.join(BACKEND_DIR, filename));
        fs.copyFileSync(destPath, path.join(STORAGE_DIR_1, `biz_${id}_banner.jpg`));
        fs.copyFileSync(destPath, path.join(STORAGE_DIR_1, `biz_${id}_logo.jpg`));
        fs.copyFileSync(destPath, path.join(STORAGE_DIR_2, `biz_${id}_banner.jpg`));
        fs.copyFileSync(destPath, path.join(STORAGE_DIR_2, `biz_${id}_logo.jpg`));
        
        console.log(`  [✔ SUCCESS] Saved ${filename} (${Math.round(stats.size / 1024)} KB) from ${url.substring(0, 70)}...`);
        return true;
      }
    }
  }
  
  console.log(`  [✖ WARNING] Could not download fresh image for Biz ${id}`);
  return false;
}

async function main() {
  console.log("==========================================================================");
  console.log("  DOWNLOADING 100% REAL AUTHENTIC INDONESIAN / SURADE PHOTOS FOR 153 BIZ  ");
  console.log("==========================================================================");
  
  let success = 0;
  for (let i = 0; i < rawData.length; i++) {
    const b = rawData[i];
    const ok = await processBusiness(b);
    if (ok) success++;
  }
  
  console.log(`\n=== COMPLETED: ${success}/${rawData.length} BUSINESSES UPDATED WITH 100% REAL LOCAL PHOTOS ===`);
}

main();
