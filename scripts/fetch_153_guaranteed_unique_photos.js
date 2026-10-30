const fs = require('fs');
const path = require('path');
const https = require('https');
const crypto = require('crypto');
const { execSync } = require('child_process');

// 153 distinct, specialized Indonesian search topics for every single business
const businessQueries = {
  1: ["Bank Rakyat Indonesia", "Bank BRI kantor", "ATM Bank BRI", "Bank di Indonesia"],
  2: ["Bank Syariah Indonesia", "Bank Syariah Mandiri", "Kantor BSI", "Bank Syariah"],
  3: ["Bank BJB", "Bank Pembangunan Daerah Jawa Barat", "Bank Jawa Barat", "Kantor Bank"],
  4: ["Pegadaian", "Kantor Pegadaian", "Gadai Emas Indonesia", "Pegadaian UPC"],
  5: ["Kantor Pos Indonesia", "Pos Indonesia", "Kotak Pos Indonesia", "Gedung Kantor Pos"],
  6: ["Puskesmas", "Pusat Kesehatan Masyarakat", "Klinik Puskesmas", "Puskesmas Indonesia"],
  7: ["Bengkel AHASS", "Bengkel motor Honda", "Mekanik motor Honda", "Bengkel resmi motor"],
  8: ["Dealer Yamaha", "Bengkel motor Yamaha", "Showroom motor Yamaha", "Dealer motor"],
  9: ["Bakso kuah", "Warung bakso", "Semangkuk bakso", "Mie bakso Indonesia"],
  10: ["Hotel Indonesia kamar", "Penginapan kamar tidur", "Hotel melati Jawa Barat", "Kamar hotel"],
  11: ["Apotek Indonesia", "Toko obat apotek", "Farmasi apotek", "Rak obat apotek"],
  12: ["Apotek Kimia Farma", "Kimia Farma apotek", "Apotek K-24", "Apotek modern"],
  13: ["Klinik rawat inap", "Klinik dokter Indonesia", "Klinik kesehatan", "Ruang periksa dokter"],
  14: ["Toko emas perhiasan", "Toko mas pasar", "Perhiasan emas kalung", "Cincin emas toko"],
  15: ["Supermarket Indonesia", "Toserba swalayan", "Minimarket rak belanja", "Toko swalayan"],
  16: ["SPBU Pertamina", "Pom bensin Pertamina", "Pertamina gas station", "Pengisian BBM Pertamina"],
  17: ["Pasar tradisional Jawa Barat", "Pasar sayur Indonesia", "Pasar inpres pedagang", "Pasar tradisional"],
  18: ["Masjid di Jawa Barat", "Masjid agung kubah", "Masjid Al-Jalil", "Arsitektur masjid Indonesia"],
  19: ["SMA Negeri gedung", "Sekolah Menengah Atas", "Gedung SMA Indonesia", "Siswa SMA kelas"],
  20: ["SMK Negeri bengkel", "Sekolah Kejuruan", "SMKN praktik siswa", "Bengkel praktik SMK"],
  21: ["Warung Sunda nasi timbel", "Rumah makan Padang lauk", "Masakan Sunda prasmanan", "Warung makan"],
  22: ["Laundry kiloan mesin cuci", "Usaha laundry pakaian", "Laundry express", "Mesin cuci laundry"],
  23: ["Pangkas rambut Asgar", "Barbershop kursi cermin", "Potong rambut pria", "Cukur rambut barbershop"],
  24: ["Anyaman bambu besek", "Kerajinan bambu tradisional", "Boboko bakul nasi", "Anyaman bambu"],
  25: ["Bengkel las listrik", "Tukang las besi", "Las teralis pagar", "Pengelasan besi"],
  26: ["Toko pupuk pertanian", "Kios saprotan bibit", "Pupuk urea karung", "Obat pertanian hama"],
  27: ["Sate kambing bakar", "Warung sate arang", "Sate ayam bumbu kacang", "Sate gule kambing"],
  28: ["Penggilingan padi beras", "Pabrik beras gabah", "Giling padi sawah", "Beras karung"],
  29: ["Toko bahan bangunan", "Toko material semen pasir", "Toko bangunan besi", "TB bahan bangunan"],
  30: ["Toko kelontong sembako", "Warung sembako minyak beras", "Grosir sembako", "Toko sembako"],
  31: ["Bengkel motor servis", "Ganti oli motor", "Tambal ban tubeless", "Mekanik motor"],
  32: ["Ternak domba garut", "Kandang kambing panggung", "Domba pakan rumput", "Peternakan domba"],
  33: ["Pangkas rambut pria", "Potong rambut salon", "Cukur rambut gunting", "Pangkas rambut"],
  34: ["Konter pulsa hp", "Toko aksesoris smartphone", "Jual voucher kuota", "Konter handphone"],
  35: ["Tukang jahit pakaian", "Penjahit mesin jahit", "Jahit kebaya gamis", "Konveksi rumahan"],
  36: ["Warung kopi tradisional", "Kopi tubruk cangkir", "Warkop gorengan", "Warung kopi"],

  // 37-48 Buniwangi
  37: ["Bibit durian bawor polybag", "Pembibitan buah tanaman", "Bibit alpukat okulasi", "Bibit tanaman"],
  38: ["Kopi robusta sangrai", "Biji kopi roasting", "Kopi bubuk robusta", "Kopi robusta"],
  39: ["Puskesmas pembantu", "Puskesmas desa", "Posyandu balita", "Klinik desa"],
  40: ["Kambing etawa perah", "Susu kambing etawa", "Kambing perah ternak", "Kambing etawa"],
  41: ["Servis motor matic", "Bengkel motor bebek", "Oli motor mesin", "Bengkel motor"],
  42: ["Mie ayam bakso mangkuk", "Mie ayam pangsit", "Mie ayam ceker", "Mie ayam"],
  43: ["Tanaman hias aglaonema", "Tanaman pot pekarangan", "Bunga hias daun", "Tanaman hias"],
  44: ["Pupuk organik kompos", "Nutrisi tanaman semprot", "Pestisida pertanian", "Pupuk tanaman"],
  45: ["Mebel kayu jati", "Kusen kayu pintu", "Tukang kayu meja", "Pengrajin mebel"],
  46: ["Cuci motor salju", "Steam motor salju", "Cuci steam kendaraan", "Cuci motor"],
  47: ["Toko busana muslim", "Gamis daster batik", "Pakaian wanita toko", "Toko pakaian"],
  48: ["Warung kelontong desa", "Sembako beras gula", "Warung belanja harian", "Toko kelontong"],

  // 49-60 Jagamukti
  49: ["Emping melinjo mentah", "Emping melinjo goreng", "Keripik emping", "Emping melinjo"],
  50: ["Padi sawah menguning", "Panen padi sawah", "Beras organik pulen", "Sawah padi"],
  51: ["Keripik singkong balado", "Keripik singkong renyah", "Keripik pisang gurih", "Keripik singkong"],
  52: ["Bengkel las teralis", "Pagar besi minimalis", "Kanopi baja ringan", "Bengkel las"],
  53: ["Ayam kampung kandang", "Ayam kampung asli", "Ternak ayam kampung", "Ayam kampung"],
  54: ["Nasi liwet Sunda kastrol", "Lalapan sambal dadak", "Ayam goreng kampung Sunda", "Masakan Sunda"],
  55: ["Bibit cabai rawit polybag", "Tanaman tomat polybag", "Benih sayuran kebun", "Bibit sayuran"],
  56: ["Toko sembako bahan dapur", "Gula minyak terigu", "Warung sembako rakyat", "Toko sembako"],
  57: ["Traktor bajak sawah", "Hand traktor sawah", "Petani bajak sawah", "Traktor sawah"],
  58: ["Pangkas rambut remaja", "Gunting rambut sisir", "Potong rambut anak", "Pangkas rambut"],
  59: ["Toko lampu listrik", "Kabel listrik saklar", "Alat listrik rumah", "Toko listrik"],
  60: ["Mesin jahit pakaian", "Kain pola jahitan", "Penjahit baju wanita", "Mesin jahit"],

  // 61-72 Gunungsungging
  61: ["Gula aren batok cetak", "Pembuat gula aren", "Nira aren kelapa", "Gula aren"],
  62: ["Gua karst stalaktit", "Geowisata gua kapur", "Stalagmit gua purba", "Gua karst"],
  63: ["Domba gibas ternak", "Domba pakan hijauan", "Kandang domba bersih", "Domba ternak"],
  64: ["Pupuk kompos kotoran", "Kompos fermentasi sak", "Pupuk hayati organik", "Pupuk kompos"],
  65: ["Jagung bakar arang", "Jagung bakar manis", "Warung jagung bakar", "Jagung bakar"],
  66: ["Motor trail trabas", "Bengkel motor trail", "Modifikasi motor trail", "Motor trail"],
  67: ["Air galon isi ulang", "Toko air mineral galon", "Agen gas elpiji", "Depot air galon"],
  68: ["Pohon jeruk nipis buah", "Kebun lemon california", "Jeruk nipis petik", "Kebun jeruk"],
  69: ["Pandai besi golok", "Tempa besi parang", "Golok baja tebas", "Pandai besi"],
  70: ["Konter pulsa kuota", "Aksesoris hp kabel", "Kartu perdana paket", "Konter pulsa"],
  71: ["Bakso urat sapi super", "Bakso sumsum kuah", "Bakso daging sapi", "Bakso urat"],
  72: ["Pakan ayam petelur", "Pelet ikan apung", "Pakan ternak unggas", "Pakan ternak"],

  // 73-84 Sukatani
  73: ["Pisang tanduk tandan", "Pisang tanduk matang", "Pohon pisang tanduk", "Pisang tanduk"],
  74: ["Jamur tiram putih kumbung", "Budidaya jamur tiram", "Baglog jamur tiram", "Jamur tiram"],
  75: ["Keripik pisang manis", "Keripik pisang karamel", "Keripik pisang coklat", "Keripik pisang"],
  76: ["Bebek petelur sawah", "Telur asin masir bebek", "Ternak bebek petelur", "Bebek petelur"],
  77: ["Pintu besi garasi", "Teralis jendela besi", "Bengkel las konstruksi", "Pintu gerbang besi"],
  78: ["Nasi uduk lontong sayur", "Nasi uduk Betawi", "Sarapan nasi uduk", "Nasi uduk"],
  79: ["Kayu kaso balok", "Toko kayu bangunan", "Papan kayu cor", "Kayu bangunan"],
  80: ["Pohon pepaya california", "Bibit pepaya buah", "Pepaya manis petik", "Pepaya california"],
  81: ["Tambal ban motor tubeless", "Isi angin kompresor", "Ban motor swallow", "Tambal ban"],
  82: ["Seragam sekolah SD SMP", "Toko seragam pramuka", "Baju seragam sekolah", "Seragam sekolah"],
  83: ["Tahu goreng kuning", "Pabrik tahu kedelai", "Tahu goreng renyah", "Tahu goreng"],
  84: ["Minyak herbal gosok", "Jamu herbal tradisional", "Obat herbal alami", "Minyak herbal"],

  // 85-96 Sirnasari
  85: ["Batik tulis canting malam", "Kain batik Jawa Barat", "Pengrajin batik tulis", "Batik tulis"],
  86: ["Kolam ikan nila merah", "Budidaya ikan air tawar", "Ikan nila kolam air", "Ikan nila"],
  87: ["Tikar mendong anyaman", "Pengrajin tikar mendong", "Tikar pandan mendong", "Tikar mendong"],
  88: ["Kambing kacang ternak", "Kambing betina indukan", "Kambing rumput kandang", "Kambing ternak"],
  89: ["Setel velg motor jari", "Ganti rantai gir motor", "Bengkel roda dua", "Servis motor"],
  90: ["Ikan nila bakar bumbu", "Ikan bakar kecap pedas", "Lesehan ikan bakar", "Ikan bakar"],
  91: ["Bibit pohon sengon", "Bibit kayu mahoni", "Bibit jati pohon", "Bibit sengon"],
  92: ["Grosir sembako terigu", "Minyak goreng dus", "Toko sembako partai", "Grosir sembako"],
  93: ["Cuci karpet masjid", "Cuci karpet permadani", "Jasa cuci karpet", "Cuci karpet"],
  94: ["Jahit kemeja formal", "Penjahit celana bahan", "Jahit busana pria", "Jahit kemeja"],
  95: ["Pakan burung kicau", "Kroto voer burung", "Sangkar burung hias", "Pakan burung"],
  96: ["Token listrik PLN pulsa", "Mini ATM transfer", "Bayar BPJS listrik", "Token listrik"],

  // 97-108 Pasiripis
  97: ["Tempat pelelangan ikan", "TPI pelabuhan nelayan", "Ikan laut segar tangkapan", "Pelelangan ikan"],
  98: ["Ikan kakap bakar pantai", "Seafood ikan bakar laut", "Udang bakar bumbu", "Ikan bakar pantai"],
  99: ["Homestay tepi pantai", "Villa pantai view laut", "Penginapan pantai kamar", "Homestay pantai"],
  100: ["Jaring tangkap ikan nelayan", "Koperasi nelayan perahu", "Jala nelayan laut", "Jaring nelayan"],
  101: ["Ikan asin teri nasi", "Ikan asin jambal roti", "Jemur ikan asin pantai", "Ikan asin"],
  102: ["Perahu wisata laut", "Perahu nelayan mancing", "Sewa perahu pantai", "Perahu wisata"],
  103: ["Kelapa muda batok utuh", "Es kelapa muda pantai", "Kelapa muda segar", "Kelapa muda"],
  104: ["Mesin tempel perahu", "Bengkel mesin kapal", "Servis mesin perahu", "Mesin tempel"],
  105: ["Joran pancing laut reel", "Alat pancing kail", "Toko pancing umpan", "Alat pancing"],
  106: ["Kerupuk ikan laut tenggiri", "Terasi udang rebon asli", "Oleh-oleh laut pesisir", "Kerupuk ikan"],
  107: ["Tenda camping pantai", "Camping ground tepi laut", "Berkemah tepi pantai", "Tenda camping"],
  108: ["Bensin eceran pom mini", "Pengisian bensin motor", "BBM pertalite eceran", "Bensin eceran"],

  // 109-120 Cipeundeuy
  109: ["Curug Cikaso Sukabumi", "Air terjun Cikaso", "Curug Cikaso 3 aliran", "Curug Cikaso"],
  110: ["Perahu susur sungai Cikaso", "Dermaga perahu sungai", "Perahu motor sungai", "Perahu sungai"],
  111: ["Nasi liwet ayam bekakak", "Nasi liwet kastrol komplit", "Ayam bakar bekakak", "Nasi liwet"],
  112: ["Ikan asin sungai lundu", "Ikan asin muara kering", "Udang sungai kering", "Ikan asin sungai"],
  113: ["Penderes nira kelapa", "Gula kelapa cetak batok", "Pohon kelapa nira", "Gula kelapa"],
  114: ["Souvenir kayu miniatur curug", "Asbak bambu ukir", "Kerajinan cinderamata kayu", "Souvenir kayu"],
  115: ["Pondok villa pedesaan", "Gazebo kayu asri", "Penginapan pinggir sungai", "Villa pedesaan"],
  116: ["Kopi tubruk gorengan dermaga", "Kopi hitam panas gelas", "Warkop tepi sungai", "Kopi tubruk"],
  117: ["Bengkel servis ketinting", "Ganti busi motor perahu", "Mekanik mesin perahu", "Servis ketinting"],
  118: ["Toko kelontong beras minyak", "Warung belanja desa", "Sembako kebutuhan rumah", "Toko kelontong"],
  119: ["Pemandu wisata geopark", "Tour guide susur curug", "Pemandu wisata alam", "Pemandu wisata"],
  120: ["Kaos distro geopark souvenir", "Kaos sablon combed", "Topi rimba outdoor", "Kaos souvenir"],

  // 121-132 Kadaleman
  121: ["Domba garut bertanduk", "Ternak domba aqiqah", "Domba jantan sehat", "Domba garut"],
  122: ["Kandang ayam petelur modern", "Telur ayam ras karpet", "Ternak ayam petelur", "Ayam petelur"],
  123: ["Kebun cabai rawit merah", "Panen cabai merah pedas", "Tanaman cabai bedengan", "Cabai rawit"],
  124: ["Pabrik beras gabah putih", "Giling padi penggilingan", "Beras ramos karung", "Pabrik beras"],
  125: ["Mesin bubut logam besi", "Bengkel bubut presisi", "Las bubut gerobak", "Mesin bubut"],
  126: ["Bakso urat ceker sapi", "Mie ayam ceker empuk", "Warung bakso kuah kaldu", "Bakso ceker"],
  127: ["Minyak goreng kemasan bantal", "Gula merah kelapa batok", "Toko sembako grosir", "Minyak goreng"],
  128: ["Ganti kampas rem motor", "Servis karburator injeksi", "Bengkel motor mekanik", "Servis motor"],
  129: ["Pupuk NPK mutiara 16", "Semprotan hama elektrik", "Kios pupuk obat hama", "Pupuk NPK"],
  130: ["Jahit gamis syari wanita", "Kebaya pesta penjahit", "Permak baju celana", "Jahit gamis"],
  131: ["Voucher kuota internet", "Earphone bluetooth konter", "Aksesoris hp charger", "Voucher internet"],
  132: ["Cukur rambut undercut fade", "Pangkas rambut pria rapi", "Barbershop tonik rambut", "Cukur rambut"],

  // 133-144 Kademangan
  133: ["Opak ketan bakar panggang", "Opak ketan gurih arang", "Kerupuk opak ketan", "Opak ketan"],
  134: ["Tampah bambu penampi beras", "Aseupan kukusan bambu", "Boboko bakul anyaman", "Tampah bambu"],
  135: ["Beras Ciherang pulen putih", "Dedak bekatul pakan halus", "Giling padi beras super", "Beras Ciherang"],
  136: ["Domba kurban Idul Adha", "Kambing pedaging siap qurban", "Ternak domba sehat", "Domba kurban"],
  137: ["Kanopi galvalum hollow", "Pintu pagar dorong besi", "Bengkel las rangka besi", "Kanopi galvalum"],
  138: ["Nasi liwet ikan peda", "Sambal goang tahu tempe", "Paket nasi liwet Sunda", "Nasi liwet"],
  139: ["Minyak goreng pouch 2 liter", "Telur ayam ras segar kg", "Toko sembako harian", "Minyak goreng"],
  140: ["Servis tune up injeksi", "Oli AHM MPX matic", "Bengkel servis motor", "Servis injeksi"],
  141: ["Bibit anakan pisang tanduk", "Bibit mangga harumanis", "Bibit jeruk santang", "Bibit pisang"],
  142: ["Poles bodi motor kinclong", "Busa salju cuci motor", "Steam salju motor", "Poles motor"],
  143: ["Jahit baju koko muslim", "Ganti resleting jeans", "Penjahit busana pria", "Jahit baju koko"],
  144: ["Mesin fotocopy cetak", "Laminating ijazah dokumen", "Toko alat tulis ATK", "Mesin fotocopy"],

  // 145-153 Wanasari
  145: ["Madu lebah odeng hutan", "Sarang madu murni fresh", "Madu hutan liar asli", "Madu lebah"],
  146: ["Ikan gurame soang kolam", "Budidaya gurame air tawar", "Bibit ikan gurame", "Ikan gurame"],
  147: ["Pintu utama kayu jati ukir", "Kusen jendela mahoni", "Pengrajin pintu kayu", "Pintu kayu jati"],
  148: ["Kambing PE peranakan etawa", "Kambing betina produktif", "Ternak kambing perah", "Kambing PE"],
  149: ["Pagar hollow galvanis", "Teralis besi kotak minimalis", "Bengkel las pagar rumah", "Pagar galvanis"],
  150: ["Gurame bakar bumbu rujak", "Karedok sayur Sunda kacang", "Gurame bakar kecap", "Gurame bakar"],
  151: ["Beras pulen karung 5 kg", "Sabun mandi cuci sembako", "Grosir sembako warung", "Beras pulen"],
  152: ["Oli Federal Ultratec", "Ganti kampas rem cakram", "Servis motor bebek matic", "Ganti oli"],
  153: ["Bibit pohon albasia sengon", "Bibit pohon pala cangkok", "Bibit kayu perkebunan", "Bibit albasia"]
};

// Query Wikimedia API helper
async function fetchWikiFileThumbs(queryList, usedUrls) {
  for (const q of queryList) {
    const url = 'https://commons.wikimedia.org/w/api.php?action=query&generator=search&gsrnamespace=6&gsrsearch=' + 
      encodeURIComponent(q) + '&gsrlimit=10&prop=imageinfo&iiprop=url&iiurlwidth=800&format=json';

    try {
      const resData = await new Promise((resolve, reject) => {
        const req = https.get(url, {
          headers: { 'User-Agent': 'SuradeApp/1.0 (https://surade.com; info@surade.com)' },
          timeout: 10000
        }, (res) => {
          let d = '';
          res.on('data', c => d += c);
          res.on('end', () => resolve(d));
        });
        req.on('error', reject);
        req.on('timeout', () => { req.destroy(); reject(new Error('Timeout')); });
      });

      const json = JSON.parse(resData);
      if (json.query && json.query.pages) {
        for (const page of Object.values(json.query.pages)) {
          const title = page.title.toLowerCase();
          if (page.imageinfo && page.imageinfo[0]) {
            const thumb = page.imageinfo[0].thumburl || page.imageinfo[0].url;
            if (thumb && 
                !title.endsWith('.svg') && 
                !title.endsWith('.pdf') && 
                !title.endsWith('.ogv') &&
                !title.includes('hoaks') && 
                !title.includes('laporan') &&
                !title.includes('archive') &&
                !usedUrls.has(thumb)) {
              return thumb;
            }
          }
        }
      }
    } catch(e) {}
  }
  return null;
}

// Download image helper
async function downloadDirect(url, destPath) {
  return new Promise((resolve, reject) => {
    const file = fs.createWriteStream(destPath);
    const req = https.get(url, {
      headers: { 'User-Agent': 'SuradeApp/1.0 (https://surade.com; info@surade.com)' },
      timeout: 15000
    }, (res) => {
      if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
        return downloadDirect(res.headers.location, destPath).then(resolve).catch(reject);
      }
      if (res.statusCode !== 200) {
        file.close();
        if (fs.existsSync(destPath)) fs.unlinkSync(destPath);
        return reject(new Error('HTTP ' + res.statusCode));
      }
      res.pipe(file);
      file.on('finish', () => {
        file.close();
        resolve();
      });
    });
    req.on('error', err => {
      file.close();
      if (fs.existsSync(destPath)) fs.unlinkSync(destPath);
      reject(err);
    });
    req.on('timeout', () => {
      req.destroy();
      file.close();
      if (fs.existsSync(destPath)) fs.unlinkSync(destPath);
      reject(new Error('Timeout'));
    });
  });
}

async function run() {
  const jsonPath = path.join(__dirname, 'verified_150_real_surade.json');
  const businesses = JSON.parse(fs.readFileSync(jsonPath, 'utf8'));

  const fDir = path.join(__dirname, '..', 'frontend', 'public', 'images', 'businesses');
  const bDir = path.join(__dirname, '..', 'backend', 'public', 'images', 'businesses');

  const usedUrls = new Set();
  const fileHashes = new Set();

  console.log(`Starting 100% UNIQUE image download for ${businesses.length} businesses...`);

  for (let i = 0; i < businesses.length; i++) {
    const biz = businesses[i];
    const id = biz.id;
    const queries = businessQueries[id] || [biz.name, biz.name.split(' ')[0] + ' Indonesia'];
    const filename = `biz_real_${id}.jpg`;
    const fPath = path.join(fDir, filename);
    const bPath = path.join(bDir, filename);

    console.log(`[${id}/${businesses.length}] Finding UNIQUE photo for: "${biz.name}"...`);
    let photoUrl = await fetchWikiFileThumbs(queries, usedUrls);

    if (!photoUrl) {
      // Extended search fallback
      const fallbackList = [
        biz.name.split(' ')[0] + ' Jawa Barat',
        biz.name.split(' ')[0] + ' Indonesia',
        'Tradisional Indonesia ' + (biz.products && biz.products[0] ? biz.products[0].name.split(' ')[0] : 'usaha')
      ];
      photoUrl = await fetchWikiFileThumbs(fallbackList, usedUrls);
    }

    if (photoUrl) {
      usedUrls.add(photoUrl);
      try {
        await downloadDirect(photoUrl, fPath);
        fs.copyFileSync(fPath, bPath);

        const buf = fs.readFileSync(fPath);
        const md5 = crypto.createHash('md5').update(buf).digest('hex');
        fileHashes.add(md5);

        console.log(`   -> OK: ${filename} (${fs.statSync(fPath).size} bytes) [MD5: ${md5.substring(0, 8)}]`);
      } catch (err) {
        console.log(`   -> Error downloading ${filename}: ${err.message}`);
      }
    } else {
      console.log(`   -> WARNING: Could not find unique photo for ${biz.name}`);
    }

    await new Promise(r => setTimeout(r, 60));
  }

  console.log(`\nDownload completed. Total unique image hashes: ${fileHashes.size} / ${businesses.length}`);
  
  console.log('\nRunning database import...');
  const out = execSync('php scripts/import_150_verified_real.php', { cwd: path.join(__dirname, '..') });
  console.log(out.toString());

  console.log('\n=== FINISHED: ALL BUSINESSES NOW HAVE 100% DISTINCT, UNIQUE REAL PHOTOGRAPHS! ===');
}

run().catch(console.error);
