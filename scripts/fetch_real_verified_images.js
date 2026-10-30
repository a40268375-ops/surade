const fs = require('fs');
const path = require('path');
const https = require('https');

const businesses = JSON.parse(fs.readFileSync(path.join(__dirname, 'verified_150_real_surade.json'), 'utf8'));

function getQueriesForBusiness(b) {
  const name = b.name.toLowerCase();
  
  if (name.includes('bri')) {
    return ["Bank Rakyat Indonesia kantor", "Bank BRI kantor", "Bank BRI Unit", "Bank Rakyat Indonesia"];
  }
  if (name.includes('bsi') || name.includes('syariah')) {
    return ["Bank Syariah Mandiri", "Bank Syariah Indonesia", "Kantor BSI"];
  }
  if (name.includes('bjb')) {
    return ["Bandung city centre, July 2014", "Bank BJB kantor", "Bank Pembangunan Daerah Jawa Barat"];
  }
  if (name.includes('pegadaian')) {
    return ["Pegadaian Majalengka 02", "Kantor Pegadaian", "Pegadaian Indonesia"];
  }
  if (name.includes('kantor pos') || name.includes('pos indonesia')) {
    return ["Kantor Pos Salatiga (1)", "Kantor Pos Indonesia", "Gedung Kantor Pos"];
  }
  if (name.includes('puskesmas') || name.includes('pustu')) {
    return ["Puskesmas Sumber", "Puskesmas Panyingkiran Majalengka", "Puskesmas Beber", "Puskesmas Jabon", "Puskesmas Indonesia"];
  }
  if (name.includes('ahass') || name.includes('honda')) {
    return ["Bengkel Mandiri motor Semanan kalideres", "Bengkel motor Honda", "Bengkel resmi motor AHASS"];
  }
  if (name.includes('yamaha')) {
    return ["Bengkel Cakra Motor 11", "Bengkel motor Yamaha", "Bengkel sepeda motor"];
  }
  if (name.includes('bakso') && name.includes('mie ayam')) {
    return ["Indonesian bakso, with noodle and bean sprouts", "Bakmi Bangka Bakso Kuah", "Bakso mekar", "Semangkuk bakso"];
  }
  if (name.includes('bakso')) {
    return ["Bakso Indonesian Meatball Soup from Solo", "Indonesian bakso, with noodle and bean sprouts", "Bakso kuah kaldu"];
  }
  if (name.includes('hotel') || name.includes('penginapan') || name.includes('homestay') || name.includes('villa')) {
    return ["Penginapan kamar tidur hotel", "Kamar hotel melati Indonesia", "Hotel room bed Indonesia"];
  }
  if (name.includes('surade farma') || (name.includes('apotek') && !name.includes('kimia farma'))) {
    return ["Apotek Pemuda Farma jie73", "Apotek Budi Farma Kebumen", "Apotek Indonesia"];
  }
  if (name.includes('kimia farma')) {
    return ["Apotek K-24 Margomulyo Ngawi", "Apotek K 24 Depok", "Apotek modern Indonesia"];
  }
  if (name.includes('klinik')) {
    return ["Klinik Merah Putih Ngawi", "Puskesmas Pembantu Kenanga", "Ruang periksa klinik"];
  }
  if (name.includes('emas') || name.includes('perhiasan')) {
    return ["Etalase toko emas pasar", "Perhiasan emas kalung gelang", "Toko mas tradisional"];
  }
  if (name.includes('toserba') || name.includes('selamat')) {
    return ["Ceria Mart at Mampir, Cileungsi", "Minimarket rak belanja Indonesia", "Supermarket Indonesia"];
  }
  if (name.includes('spbu') || name.includes('pertamina')) {
    return ["SPBU Pertamina 34-16112. Pom Bensin Bubulak", "SPBU Pertamina Indonesia", "Pom bensin Pertamina"];
  }
  if (name.includes('pasar')) {
    return ["Pasar tradisional sayuran pedagang", "Pedagang Pasar Tradisional", "Pasar inpres sayur"];
  }
  if (name.includes('masjid')) {
    return ["Kubah Masjid Agung Yogyakarta", "Masjid di Jawa Barat", "Masjid agung kubah"];
  }
  if (name.includes('sman')) {
    return ["Smanisda gedung kecil", "Gedung SMA Negeri Indonesia", "Gedung sekolah SMA"];
  }
  if (name.includes('smkn')) {
    return ["Halaman depan SMK Negeri 2 Yogyakarta", "SMKN praktik siswa", "Gedung SMK Negeri"];
  }
  if (name.includes('anyaman') || name.includes('boboko') || name.includes('tampah') || name.includes('bambu')) {
    return ["Anyaman bambu-Kalo", "Kerajinan anyaman bambu besek", "Bakul nasi tampah bambu", "Anyaman bambu"];
  }
  if (name.includes('las') || name.includes('bubut')) {
    return ["Pemagar", "Pengelasan pagar besi minimalis", "Tukang las listrik besi", "Bengkel las teralis"];
  }
  if (name.includes('pupuk') || name.includes('saprotan') || name.includes('kompos')) {
    return ["Kamalan", "Pupuk urea pertanian karung", "Kios pupuk bibit tanaman", "Pupuk kompos karung"];
  }
  if (name.includes('sate')) {
    return ["Sate Kambing Sate Ayam", "Sate kambing dan nasi", "Sate ayam bumbu kacang"];
  }
  if (name.includes('penggilingan') || name.includes('pabrik beras') || name.includes('lumbung')) {
    return ["Penggilingan Padi Keliling Di Kebumen", "Pabrik beras gabah padi", "Gilingan gabah padi"];
  }
  if (name.includes('bangunan') || name.includes('material') || name.includes('kayu') || name.includes('kusen')) {
    return ["Toko Bangunan (TB) Sri Mekarwangi, Lebakwangi, Kuningan", "Toko material bahan bangunan", "Kayu kaso papan reng"];
  }
  if (name.includes('sembako') || name.includes('kelontong')) {
    return ["Toko kelontong sembako beras", "Warung sembako grosir eceran", "Warung belanja sembako dapur"];
  }
  if (name.includes('domba') || name.includes('kambing')) {
    return ["Kambing etawa", "Domba Garut tanduk kandang", "Ternak domba kambing rumput", "Kandang kambing ternak"];
  }
  if (name.includes('pangkas') || name.includes('cukur') || name.includes('barber')) {
    return ["Pangkas rambut pria kursi cermin", "Potong rambut pria Asgar", "Barbershop pria Indonesia"];
  }
  if (name.includes('pulsa') || name.includes('cell')) {
    return ["Neon Box Konter Pulsa", "Konter hp jual pulsa voucher", "Toko aksesoris casing hp"];
  }
  if (name.includes('jahit') || name.includes('penjahit') || name.includes('gamis') || name.includes('permak')) {
    return ["Pekerjaan Penjahit Yg Sedang Mengukur Bahan Kain Untuk Di Jahit Di Pasar Sem Kebumen", "Penjahit mesin jahit kain", "Tukang jahit pakaian busana"];
  }
  if (name.includes('kopi') || name.includes('roastery') || name.includes('warkop')) {
    return ["Kopi tubruk cangkir hitam", "Biji kopi robusta sangrai roasting", "Warung kopi tradisional warkop"];
  }
  if (name.includes('durian') || name.includes('pepaya') || name.includes('pisang') || name.includes('bibit')) {
    return ["Pedagang bibit tanaman buah serta sayur", "Bibit tanaman polybag kebun", "Pohon pisang buah tandan"];
  }
  if (name.includes('emping')) {
    return ["Fried emping chips", "Emping Melinjo", "Emping melinjo mentah goreng"];
  }
  if (name.includes('padi') || name.includes('sawah')) {
    return ["Panen padi sawah menguning", "Sawah terasering padi hijau", "Petani di sawah"];
  }
  if (name.includes('keripik')) {
    return ["Keripik singkong renyah gurih", "Keripik pisang manis gurih", "Camilan keripik renyah"];
  }
  if (name.includes('ayam') || name.includes('bebek') || name.includes('unggas')) {
    return ["Ayam kampung asli jantan kandang", "Kandang bebek petelur sawah", "Ternak ayam petelur"];
  }
  if (name.includes('liwet') || name.includes('uduk') || name.includes('sunda') || name.includes('lesehan')) {
    return ["Nasi liwet Sunda kastrol komplit", "Nasi timbel ayam goreng sambal", "Masakan Sunda lesehan"];
  }
  if (name.includes('cabai') || name.includes('sayuran') || name.includes('tomat')) {
    return ["Kebun cabai rawit merah petik", "Tanaman cabai polybag merah", "Panen sayuran kebun"];
  }
  if (name.includes('traktor')) {
    return ["Petani membajak sawah traktor", "Hand traktor bajak sawah", "Traktor sawah"];
  }
  if (name.includes('listrik') || name.includes('lampu')) {
    return ["Toko perlengkapan alat listrik lampu", "Kabel saklar stopkontak listrik", "Toko listrik"];
  }
  if (name.includes('gula aren') || name.includes('gula kelapa') || name.includes('penderes')) {
    return ["Gula aren Baduy", "Gula Aren sudah Jadi", "Katang-katang(Serang,Banten)"];
  }
  if (name.includes('gua') || name.includes('karst')) {
    return ["Goa kapur karst stalaktit alam", "Gua stalaktit stalagmit kapur", "Gua karst"];
  }
  if (name.includes('jagung')) {
    return ["Jagung bakar arang manis pedas", "Warung jagung bakar tepi jalan", "Jagung bakar manis"];
  }
  if (name.includes('trail')) {
    return ["Motor trail offroad hutan", "Bengkel modifikasi motor trail", "Motor cross trail"];
  }
  if (name.includes('air galon') || name.includes('depot')) {
    return ["Depot air minum galon isi ulang", "Toko air mineral galon isi ulang", "Air galon isi ulang"];
  }
  if (name.includes('jeruk')) {
    return ["Pohon jeruk nipis berbuah lebat", "Buah jeruk nipis pohon kebun", "Jeruk nipis pohon"];
  }
  if (name.includes('pandai besi') || name.includes('golok')) {
    return ["Pandai besi tempa golok pisau", "Tempa besi tradisional pandai", "Golok baja tempa"];
  }
  if (name.includes('pakan') || name.includes('burung')) {
    return ["Pelet pakan ternak unggas ayam", "Pakan konsentrat ternak karung", "Pakan ternak"];
  }
  if (name.includes('jamur')) {
    return ["Jamur tiram putih kumbung baglog", "Budidaya jamur tiram putih", "Kumbung jamur tiram"];
  }
  if (name.includes('tahu')) {
    return ["Tahu goreng kedelai panas gurih", "Gorengan tahu kuning renyah", "Pabrik tahu kedelai"];
  }
  if (name.includes('herbal')) {
    return ["Botol minyak obat herbal tradisional", "Jamu herbal alami tradisional", "Minyak herbal gosok"];
  }
  if (name.includes('batik')) {
    return ["Batik tulis canting motif tradisional", "Kain batik tradisional cap tulis", "Batik motif Jampang"];
  }
  if (name.includes('ikan nila') || name.includes('gurame') || name.includes('kolam')) {
    return ["Kolam ikan nila air tawar kolam", "Budidaya pembesaran ikan gurame", "Kolam budidaya ikan"];
  }
  if (name.includes('tikar')) {
    return ["Anyaman tikar mendong daun pandan", "Pengrajin tikar mendong anyaman", "Tikar mendong"];
  }
  if (name.includes('ikan bakar')) {
    return ["Ikan bakar bumbu kecap pedas arang", "Lesehan ikan gurame bakar Sunda", "Ikan laut bakar arang"];
  }
  if (name.includes('tpi') || name.includes('pelelangan') || name.includes('minajaya') || name.includes('pantai') || name.includes('nelayan')) {
    return ["Perahu nelayan kayu di pantai", "Tempat Pelelangan Ikan TPI pantai", "Perahu nelayan bersandar pantai"];
  }
  if (name.includes('ikan asin')) {
    return ["Ikan asin teri jambal jemur pantai", "Penjemuran ikan asin tradisional", "Ikan asin tampah jemur"];
  }
  if (name.includes('kelapa muda') || name.includes('es kelapa')) {
    return ["Es kelapa muda batok segar", "Kelapa muda segar di saung", "Warung es kelapa muda"];
  }
  if (name.includes('pancing')) {
    return ["Alat pancing joran reel umpan", "Toko alat pancing ikan laut", "Joran pancing rel"];
  }
  if (name.includes('camping') || name.includes('spot foto')) {
    return ["Tenda camping di tepi pantai", "Camping ground tenda tepi pantai", "Kemah tenda pantai"];
  }
  if (name.includes('curug') || name.includes('cikaso')) {
    return ["Curug Cikaso, Sukabumi", "Beauty of Curug Cikaso (cikaso waterfall)", "Air terjun Cikaso"];
  }
  if (name.includes('dermaga') || name.includes('perahu wisata')) {
    return ["Perahu kayu sungai wisata dermaga", "Perahu sungai Curug Cikaso", "Dermaga perahu sungai"];
  }
  if (name.includes('kaos') || name.includes('distro') || name.includes('souvenir')) {
    return ["Kaos sablon distro souvenir toko", "Toko pakaian kaos distro sablon", "Kaos oleh oleh"];
  }
  if (name.includes('opak')) {
    return ["Opak ketan panggang arang gurih", "Kerupuk opak bakar renyah", "Opak ketan bakar"];
  }
  if (name.includes('fotocopy') || name.includes('atk')) {
    return ["Toko alat tulis fotocopy ATK", "Mesin fotocopy kertas ATK buku", "Toko ATK fotokopi"];
  }
  if (name.includes('madu') || name.includes('odeng')) {
    return ["Sarang madu lebah hutan odeng", "Panen madu lebah odeng liar", "Madu hutan murni"];
  }
  if (name.includes('steam') || name.includes('cuci motor')) {
    return ["Cuci motor salju steam bersih", "Jasa cuci steam motor hidrolik", "Cuci motor steam"];
  }
  if (name.includes('motor') || name.includes('bengkel')) {
    return ["Bengkel motor tune up ganti oli", "Mekanik servis motor roda dua", "Bengkel sepeda motor"];
  }

  return [b.name, "Usaha di Jawa Barat", "UMKM Indonesia"];
}

// Search Wikimedia Commons API
async function searchCommons(query) {
  return new Promise((resolve) => {
    const url = 'https://commons.wikimedia.org/w/api.php?action=query&format=json&generator=search&gsrnamespace=6&gsrlimit=12&gsrsearch=' + encodeURIComponent(query) + '&prop=imageinfo&iiprop=url|size|mime&iiurlwidth=800';
    
    https.get(url, { headers: { 'User-Agent': 'SuradeCoIdBot/2.0 (admin@surade.co.id)' } }, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          const json = JSON.parse(data);
          const pages = json.query ? Object.values(json.query.pages) : [];
          const results = [];
          for (const p of pages) {
            if (!p.imageinfo || !p.imageinfo[0]) continue;
            const info = p.imageinfo[0];
            const mime = info.mime || '';
            const title = p.title.toLowerCase();
            // Strictly images, no PDFs, no SVGs, no DjVu
            if (!mime.startsWith('image/')) continue;
            if (mime.includes('svg') || title.endsWith('.svg') || title.endsWith('.pdf') || title.endsWith('.djvu')) continue;
            
            const thumbUrl = info.thumburl || info.url;
            results.push({
              title: p.title,
              url: thumbUrl,
              width: info.width || 800,
              size: info.size || 0
            });
          }
          resolve(results);
        } catch (e) {
          resolve([]);
        }
      });
    }).on('error', () => resolve([]));
  });
}

// Download file helper
function downloadFile(url, destPath) {
  return new Promise((resolve, reject) => {
    const file = fs.createWriteStream(destPath);
    https.get(url, { headers: { 'User-Agent': 'SuradeCoIdBot/2.0 (admin@surade.co.id)' } }, (res) => {
      if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
        https.get(res.headers.location, { headers: { 'User-Agent': 'SuradeCoIdBot/2.0 (admin@surade.co.id)' } }, (redirectRes) => {
          redirectRes.pipe(file);
          file.on('finish', () => {
            file.close(() => resolve(true));
          });
        }).on('error', (err) => {
          fs.unlink(destPath, () => {});
          reject(err);
        });
      } else if (res.statusCode === 200) {
        res.pipe(file);
        file.on('finish', () => {
          file.close(() => resolve(true));
        });
      } else {
        fs.unlink(destPath, () => {});
        reject(new Error('Status: ' + res.statusCode));
      }
    }).on('error', (err) => {
      fs.unlink(destPath, () => {});
      reject(err);
    });
  });
}

async function run() {
  console.log('=== MEMULAI PENCARIAN & DOWNLOAD 153 FOTO NYATA INDONESIA KHUSUS SURADE ===\n');

  const frontendDir = path.join(__dirname, '../frontend/public/images/businesses');
  const backendDir = path.join(__dirname, '../backend/public/images/businesses');
  fs.mkdirSync(frontendDir, { recursive: true });
  fs.mkdirSync(backendDir, { recursive: true });

  const usedUrls = new Set();
  const results = [];

  for (let id = 1; id <= 153; id++) {
    const b = businesses.find(x => x.id === id);
    const queries = getQueriesForBusiness(b);
    const fileName = `biz_real_${id}.jpg`;
    const frontendPath = path.join(frontendDir, fileName);
    const backendPath = path.join(backendDir, fileName);

    let chosenImage = null;

    for (const query of queries) {
      const candidates = await searchCommons(query);
      for (const cand of candidates) {
        if (!usedUrls.has(cand.url)) {
          chosenImage = cand;
          usedUrls.add(cand.url);
          break;
        }
      }
      if (chosenImage) break;
    }

    if (!chosenImage) {
      console.warn(`[!] Peringatan: Tidak ditemukan kandidat unik untuk Bisnis ID ${id}: ${b.name}`);
    } else {
      try {
        await downloadFile(chosenImage.url, frontendPath);
        fs.copyFileSync(frontendPath, backendPath);
        const stats = fs.statSync(frontendPath);
        console.log(`[OK] ID ${id}: ${b.name.padEnd(45)} -> ${chosenImage.title} (${(stats.size / 1024).toFixed(1)} KB)`);
        results.push({ id, name: b.name, file: fileName, title: chosenImage.title });
      } catch (err) {
        console.error(`[ERR] Gagal download untuk ID ${id}: ${err.message}`);
      }
    }
  }

  console.log(`\n=== TOTAL FOTO BERHASIL DIDOWNLOAD: ${results.length} / 153 ===`);
}

run();
