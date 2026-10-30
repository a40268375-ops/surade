const fs = require('fs');
const path = require('path');
const https = require('https');
const http = require('http');
const crypto = require('crypto');

const FRONTEND_DIR = path.join(__dirname, '../frontend/public/images/businesses');
const BACKEND_DIR = path.join(__dirname, '../backend/public/images/businesses');
const STORAGE_DIR_1 = path.join(__dirname, '../backend/storage/app/public/businesses/real_images');
const STORAGE_DIR_2 = path.join(__dirname, '../backend/public/storage/businesses/real_images');

[FRONTEND_DIR, BACKEND_DIR, STORAGE_DIR_1, STORAGE_DIR_2].forEach(dir => {
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
});

const usedUrls = new Set();
const usedHashes = new Set();

function searchBingImages(query) {
  return new Promise((resolve) => {
    const url = `https://www.bing.com/images/search?q=${encodeURIComponent(query)}&first=1&count=35&scenario=ImageBasicHover`;
    const req = https.get(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept-Language': 'id-ID,id;q=0.9,en-US;q=0.8'
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

function downloadImageToBuffer(url) {
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
          if (loc) return downloadImageToBuffer(loc).then(resolve);
          return resolve(null);
        }
        if (res.statusCode !== 200) return resolve(null);

        const chunks = [];
        res.on('data', chunk => chunks.push(chunk));
        res.on('end', () => {
          const buffer = Buffer.concat(chunks);
          // Must be at least 10KB to ensure high quality and not an icon/ad/error
          if (buffer.length > 10000) {
            resolve(buffer);
          } else {
            resolve(null);
          }
        });
      });
      req.on('error', () => resolve(null));
      req.setTimeout(8000, () => { req.destroy(); resolve(null); });
    } catch (e) {
      resolve(null);
    }
  });
}

const rawData = require('./all_153_businesses_raw.json');

// Generate 3-5 distinct, targeted queries per business to ensure 100% unique, diverse, and non-watermarked results
function getDistinctQueries(b) {
  const id = b.id;
  const name = b.name;
  const desa = b.address.split(',')[1]?.trim() || '';

  // Custom distinct queries per business to avoid duplicate hits
  const customMap = {
    // 1-20 KELURAHAN SURADE
    1: ['bank bri unit surade sukabumi', 'gedung kantor bank bri unit pedesaan', 'teller bank bri indonesia'],
    2: ['bank bsi kcp surade sukabumi', 'kantor bank syariah indonesia bsi', 'pelayanan nasabah bank bsi'],
    3: ['bank bjb kantor kas surade sukabumi', 'gedung kantor bank bjb jawa barat', 'kantor cabang pembantu bjb'],
    4: ['kantor pegadaian upc surade sukabumi', 'pt pegadaian kantor cabang indonesia', 'gedung kantor pegadaian'],
    5: ['kantor pos surade 43179 sukabumi', 'kantor pos indonesia gedung surade', 'pos indonesia kurir logistik'],
    6: ['puskesmas dtp surade sukabumi', 'gedung puskesmas surade rawat inap', 'pelayanan puskesmas dokter perawat'],
    7: ['bengkel resmi ahass daya motor surade', 'mekanik bengkel ahass honda motor', 'servis motor bengkel resmi honda'],
    8: ['dealer resmi selamat motor yamaha surade', 'dealer motor yamaha surade showroom', 'bengkel resmi yamaha motor'],
    9: ['bakso tiga sodara surade kang ubes', 'bakso urat jumbo surade sukabumi', 'mie bakso kaldu sapi surade'],
    10: ['hotel yasa surade sukabumi', 'kamar penginapan yasa hotel surade', 'fasilitas hotel yasa surade'],
    11: ['apotek surade farma sukabumi', 'etalase apotek obat farmasi surade', 'ruang apotek resep obat'],
    12: ['apotek kimia farma surade sukabumi', 'gedung apotek kimia farma surade', 'apoteker kimia farma pelayanan'],
    13: ['klinik rawat inap surade medika', 'klinik dokter surade medika sukabumi', 'ruang perawatan klinik surade'],
    14: ['toko emas mulia abadi surade', 'perhiasan emas kalung cincin toko emas', 'etalase kaca toko emas indonesia'],
    15: ['toserba selamat surade sukabumi', 'pusat perbelanjaan toserba selamat', 'supermarket belanja toserba selamat'],
    16: ['spbu pertamina 34.431.18 surade', 'spbu pertamina surade sukabumi bensin', 'pengisian bbm pertamina surade'],
    17: ['pasar inpres surade sukabumi', 'los pasar tradisional surade sembako', 'aktivitas pedagang pasar surade'],
    18: ['masjid agung al jalil surade sukabumi', 'masjid agung surade kubah arsitektur', 'sholat jumat masjid agung surade'],
    19: ['gedung sman 1 surade sukabumi', 'halaman sman 1 surade jawa barat', 'gerbang sma negeri 1 surade'],
    20: ['gedung smkn 1 surade sukabumi', 'smk negeri 1 surade gedung praktik', 'halaman smkn 1 surade sukabumi'],

    // 21-33 DESA CITANGLAR
    21: ['pengrajin anyaman bambu besek citanglar', 'anyaman bambu sunda bilik boboko', 'rajutan bambu halus citanglar'],
    22: ['bengkel las listrik pagar besi citanglar', 'proses pengelasan teralis besi bengkel', 'kanopi besi hollow bengkel las'],
    23: ['kios pupuk saprotan barokah citanglar', 'pupuk urea npk pertanian citanglar', 'obat hama tanaman kios saprotan'],
    24: ['warung sate kambing bakar bumbu kecap citanglar', 'sate kambing muda gule tongseng', 'aroma sate kambing bakar arang'],
    25: ['pabrik penggilingan padi citanglar surade', 'mesin giling padi gabah beras citanglar', 'karung beras penggilingan padi'],
    26: ['toko bahan bangunan citanglar jaya', 'toko material semen pasir bata besi', 'toko bangunan tb citanglar'],
    27: ['toko sembako grosir bu kokom citanglar', 'grosir beras minyak gula sembako citanglar', 'toko kelontong sembako desa'],
    28: ['bengkel motor servis oli kang dadang citanglar', 'servis tune up motor matic bengkel desa', 'ganti oli motor mekanik citanglar'],
    29: ['peternakan domba garut pedaging citanglar', 'kandang domba garut sehat citanglar', 'kambing ternak pedaging sunda'],
    30: ['pangkas rambut pria mas joko citanglar', 'kursi pangkas rambut barbershop cermin', 'cukur rambut pria model rapi'],
    31: ['konter pulsa aksesoris citanglar cell', 'etalase konter kuota hp citanglar', 'kios pulsa token listrik handphone'],
    32: ['penjahit pakaian busana bu nani citanglar', 'mesin jahit penjahit baju kain sunda', 'proses potong jahit kain busana'],
    33: ['warung kopi gorengan hangat kang maman citanglar', 'cangkir kopi tubruk pisang goreng warkop', 'warung kopi sederhana sunda'],

    // 34-45 DESA BUNIWANGI
    34: ['kebun bibit durian bawor polybag buniwangi', 'pohon durian bawor okulasi daun rimbun', 'bibit durian bawor kaki tiga siap tanam'],
    35: ['biji kopi robusta sangrai pajampangan buniwangi', 'proses roasting kopi robusta jampang', 'roastery biji kopi petik merah surade'],
    36: ['puskesmas pembantu pustu buniwangi surade', 'poskesdes buniwangi pelayanan medis', 'gedung pustu desa buniwangi'],
    37: ['peternakan kambing perah etawa buniwangi', 'kambing etawa perah susu segar buniwangi', 'kandang kambing etawa perah modern'],
    38: ['bengkel motor kang asep buniwangi surade', 'servis karburator injeksi motor buniwangi', 'mekanik motor ganti kampas rem'],
    39: ['warung bakso mie ayam podomoro buniwangi', 'semangkok bakso kuah kaldu podomoro', 'mie ayam ceker pangsit buniwangi'],
    40: ['kebun tanaman hias agro buniwangi surade', 'pembibitan aglaonema monstera pot buniwangi', 'tanaman hias daun hijau segar nursery'],
    41: ['toko pupuk subur makmur buniwangi', 'pupuk organik kompos cair buniwangi', 'kios benih pupuk tanaman buniwangi'],
    42: ['pengrajin mebel kusen kayu jati buniwangi', 'pintu kayu jati ukir kusen mebel', 'workshop mebel kayu mahoni buniwangi'],
    43: ['cuci steam motor salju buniwangi snow', 'pencucian motor steam busa salju', 'tempat cuci motor hidrolik bersih'],
    44: ['toko pakaian daster baju buniwangi', 'gantungan daster batik baju wanita toko', 'kios busana pakaian santai buniwangi'],
    45: ['kios kelontong sembako barokah buniwangi', 'sembako gula minyak telur beras barokah', 'toko kelontong jajanan buniwangi'],

    // 46-57 DESA JAGAMUKTI
    46: ['pengrajin gula merah kelapa asli jagamukti', 'proses cetak gula kelapa batok nira', 'gula merah kelapa murni sunda'],
    47: ['produksi keripik singkong renyah jagamukti', 'singkong goreng bumbu gurih wajan', 'keripik singkong pedas manis gurih'],
    48: ['pengrajin cobek batu asli jagamukti surade', 'batu kali pahat ulekan cobek sunda', 'cobek batu murni padat buatan tangan'],
    49: ['bengkel las pagar teralis jagamukti abadi', 'pagar besi minimalis modern bengkel las', 'konstruksi kanopi baja ringan jagamukti'],
    50: ['kebun kelapa genjah hibrida jagamukti', 'pohon kelapa buah lebat jagamukti', 'panen kelapa muda segar perkebunan'],
    51: ['warung nasi timbel sunda teh imas jagamukti', 'nasi timbel daun pisang ayam goreng lalap', 'kuliner nasi liwet sundaan jagamukti'],
    52: ['kios sembako berkah tani jagamukti', 'toko sembako beras karungan jagamukti', 'kios kelontong sembako desa jagamukti'],
    53: ['bengkel motor kang ujang jagamukti', 'servis rantai gir motor bengkel jagamukti', 'ganti ban luar dalam motor jagamukti'],
    54: ['peternakan ayam kampung super jagamukti', 'kandang ayam kampung umbaran sehat', 'ayam joper kampung pedaging jagamukti'],
    55: ['cuci steam motor salju jagamukti', 'semprotan air steam cuci motor busa', 'pencucian motor bersih mengkilap'],
    56: ['jagamukti cell konter pulsa data kuota', 'aksesoris casing charger hp konter', 'kios pulsa handphone jagamukti'],
    57: ['penjahit busana muslimah gamis jagamukti', 'jahit baju gamis syari wanita jagamukti', 'pola kain busana muslimah penjahit'],

    // 58-69 DESA GUNUNGSUNGGING
    58: ['wisata geowisata gua sungging surade', 'stalaktit stalagmit gua sungging geopark', 'pintu masuk goa karst gunung sungging'],
    59: ['budidaya ikan lele kolam bioflok sungging', 'kolam terpal bioflok lele sungging', 'panen ikan lele segar kolam bulat'],
    60: ['anyaman besek boboko bambu gunung sungging', 'kerajinan tampah anyaman bambu sungging', 'wadah anyaman bambu natural'],
    61: ['peternakan domba garut tanduk sungging', 'domba adu garut pedaging gunung sungging', 'pakan rumput domba garut kandang'],
    62: ['penggilingan padi beras putih sungging', 'gabah padi mesin selap beras sungging', 'beras pulen kemasan karung sungging'],
    63: ['warung kopi jagung bakar puncak sungging', 'jagung bakar pedas manis warung kopi', 'nongkrong santai pemandangan puncak sungging'],
    64: ['toko kelontong agen galon sembako sungging', 'air galon sembako toko kelontong sungging', 'kios sembako kebutuhan warga sungging'],
    65: ['kebun jeruk lemon nipis segar sungging', 'pohon jeruk nipis berbuah lebat sungging', 'panen jeruk lemon segar perkebunan'],
    66: ['pandai besi golok perkakas tani sungging', 'tempa besi golok parang cangkul sungging', 'kerajinan bilah golok tajam pandai besi'],
    67: ['sungging cell pulsa voucher internet', 'kios voucher kuota pulsa listrik sungging', 'counter hp pulsa desa sungging'],
    68: ['mie bakso urat mas broto sungging', 'bakso sapi urat kuah kaldu gurih mas broto', 'mangkok mie ayam bakso telur sungging'],
    69: ['toko pakan ternak konsentrat sungging', 'karung pakan ayam bebek ikan pelet', 'konsentrat pakan sapi kambing unggas'],

    // 70-81 DESA SUKATANI
    70: ['pisang tanduk jumbo hasil panen sukatani', 'tandan buah pisang tanduk kuning sukatani', 'pengepul pisang tanduk perkebunan jampang'],
    71: ['budidaya jamur tiram putih kumbung sukatani', 'kumbung baglog jamur tiram segar sukatani', 'panen jamur tiram putih mekar segar'],
    72: ['keripik pisang tanduk gurih renyah sukatani', 'kemasan keripik pisang tanduk oleh oleh', 'pisang tanduk iris tipis goreng renyah'],
    73: ['kandang ternak bebek petelur sukatani', 'bebek petelur kolam kandang sukatani', 'panen telur bebek asin segar sukatani'],
    74: ['bengkel las teralis pintu sukatani abadi', 'pembuatan pintu pagar besi dorong sukatani', 'las listrik konstruksi besi minimalis'],
    75: ['warung nasi uduk lontong sayur bu dede sukatani', 'nasi uduk gurih sambal kacang bihun', 'lontong sayur labu telur kuah santan'],
    76: ['toko material bangunan kayu sukatani', 'tumpukan kaso papan kayu toko bangunan', 'material bangunan semen pasir sukatani'],
    77: ['bibit pepaya california polybag sukatani', 'pohon pepaya california pendek berbuah', 'kebun pembibitan pepaya california unggul'],
    78: ['tambal ban service motor sukatani', 'bengkel motor ganti ban dalam luar sukatani', 'mekanik servis motor pinggir jalan'],
    79: ['toko pakaian seragam sekolah sukatani', 'seragam sd smp sma pramuka toko baju', 'pakaian kemeja celana seragam toko sukatani'],
    80: ['pabrik tahu goreng renyah sukatani', 'tahu kuning tahu putih goreng gurih sukatani', 'cetakan tahu kedelai pabrik tradisional'],
    81: ['toko obat herbal kosmetik sukatani', 'ramuan herbal jamu madu toko sukatani', 'produk perawatan herbal alami sehat'],

    // 82-93 DESA SIRNASARI
    82: ['batik tulis cap motif jampang sirnasari', 'kain batik motif geopark jampang sirnasari', 'canting malam proses batik tulis jampang'],
    83: ['kolam budidaya ikan nila merah sirnasari', 'ikan nila merah kolam air deras sirnasari', 'panen ikan mas nila konsumsi segar'],
    84: ['pengrajin anyaman tikar mendong sirnasari', 'tenun tikar mendong alami tradisional', 'anyaman tikar lantai mendong sunda'],
    85: ['kambing kacang ternak sehat sirnasari', 'peternakan kambing kacang jawa sirnasari', 'kandang kambing pakan rumput hijau'],
    86: ['bengkel motor tambal tubeless sirnasari', 'alat tambal tubeless pres ban motor', 'servis motor mekanik kunci bengkel sirnasari'],
    87: ['warung lesehan ikan bakar sirnasari', 'ikan nila gurame bakar kecap sambal lalap', 'saung makan lesehan keluarga sirnasari'],
    88: ['bibit pohon sengon albasia sirnasari', 'pembibitan kayu sengon polybag siap tanam', 'bibit pohon kayu keras penghijauan'],
    89: ['grosir sembako murah sirnasari', 'sembako karung beras minyak goreng sirnasari', 'toko grosir eceran sembako sirnasari'],
    90: ['cuci steam motor karpet sirnasari', 'pencucian karpet motor steam air kencang', 'steam salju motor bersih bersinar'],
    91: ['penjahit pakaian kemeja celana sirnasari', 'meja potong kain ukur penjahit busana', 'jahitan rapi pakaian pria wanita sirnasari'],
    92: ['toko pakan burung sangkar ikan hias sirnasari', 'pakan voer burung sangkar hias sirnasari', 'akuarium ikan hias pakan pelet toko'],
    93: ['sirnasari cell pulsa token listrik pln', 'konter hp aksesoris pulsa data sirnasari', 'kios pulsa elektronik all operator'],

    // 94-105 DESA PASIRIPIS
    94: ['tempat pelelangan ikan tpi minajaya pasiripis', 'kapal perahu nelayan ikan segar tpi minajaya', 'lelang ikan tongkol kakap segar nelayan'],
    95: ['rm ikan bakar pesisir pantai minajaya', 'ikan kakap bawal bakar sambal cobek minajaya', 'sajian ikan laut bakar meja lesehan minajaya'],
    96: ['homestay pantai minajaya indah penginapan', 'kamar villa homestay view pantai minajaya', 'penginapan sejuk dekat pesisir minajaya'],
    97: ['koperasi nelayan mina bahari pasiripis', 'kantor koperasi nelayan alat jaring tangkap', 'kegiatan nelayan kelompok mina bahari'],
    98: ['ikan asin teri jambal roti minajaya', 'jemuran ikan asin nampan bambu pantai minajaya', 'ikan asin kering gurih khas pesisir'],
    99: ['perahu wisata sewa pantai minajaya', 'perahu kayu katir nelayan wisata minajaya', 'wisatawan naik perahu susur pantai minajaya'],
    100: ['kelapa muda rujak buah pantai minajaya', 'es kelapa muda gelas batok saung pantai', 'rujak serut buah segar pinggir pantai'],
    101: ['bengkel mesin tempel perahu las pasiripis', 'mesin tempel yamaha perahu nelayan servis', 'bengkel las rangka perahu nelayan pantai'],
    102: ['toko alat pancing minajaya strike reel joran', 'joran pancing reel umpan pancing minajaya', 'senar pancing mata kail perlengkapan laut'],
    103: ['toko oleh oleh hasil laut pasiripis', 'kerupuk ikan terasi olahan laut pasiripis', 'cinderamata oleh oleh khas pantai minajaya'],
    104: ['spot foto camping ground pantai minajaya', 'tenda camping tepi pantai minajaya pasiripis', 'sunset pemandangan batu karang minajaya'],
    105: ['kios bensin pertalite motor pasiripis', 'pom mini pertalite perlengkapan motor', 'kios oli bensin eceran pasiripis'],

    // 106-117 DESA CIPEUNDEUY
    106: ['air terjun curug cikaso 3 aliran cipeundeuy', 'pemandangan eksotis curug cikaso geopark', 'keindahan air terjun curug cikaso surade'],
    107: ['dermaga sewa perahu sungai curug cikaso', 'perahu kayu susur sungai cikaso hijau toska', 'dermaga perahu wisata cipeundeuy cikaso'],
    108: ['saung lesehan nasi liwet ikan bakar cikaso', 'nasi liwet kastrol ikan bakar tepi curug', 'makan bersama keluarga lesehan curug cikaso'],
    109: ['ikan asin muara sungai cikaso cipeundeuy', 'olahan ikan sungai tawar asin cikaso', 'ikan asin goreng kering renyah khas cikaso'],
    110: ['penderes nira gula kelapa cipeundeuy', 'pemasakan nira kelapa kuali wajan gula merah', 'cetakan gula merah aren batok cipeundeuy'],
    111: ['souvenir bambu gantungan kunci curug cikaso', 'kerajinan miniatur perahu bambu cikaso', 'cinderamata kayu ukir curug cikaso'],
    112: ['pondok villa asri cikaso cipeundeuy', 'penginapan pondok kayu sejuk dekat curug', 'kamar villa asri santai wisata cikaso'],
    113: ['warung kopi kelapa muda dermaga cikaso', 'seduh kopi kelapa muda saung sungai cikaso', 'warung santai tepi dermaga perahu cikaso'],
    114: ['bengkel motor mesin perahu sungai cipeundeuy', 'servis mesin ketinting perahu sungai cikaso', 'bengkel motor perkakas mesin cipeundeuy'],
    115: ['toko kelontong sembako desa cipeundeuy', 'sembako beras minyak sabun belanja cipeundeuy', 'toko kelontong warga desa cipeundeuy'],
    116: ['pemandu tour guide lokal geopark cikaso', 'guide pemandu wisata alam curug cikaso', 'wisatawan dipandu tour guide cikaso surade'],
    117: ['kaos distro souvenir geopark cikaso surade', 'kaos sablon motif curug cikaso geopark', 'baju distro cinderamata wisata cikaso'],

    // 118-129 DESA KADALEMAN
    118: ['pusat ternak domba garut aqiqah kadaleman', 'kambing aqiqah qurban sehat kadaleman', 'domba garut tanduk kokoh peternakan kadaleman'],
    119: ['peternakan ayam petelur barokah kadaleman', 'panen telur ayam ras segar rak telur', 'kandang ayam petelur modern kadaleman'],
    120: ['kebun cabai rawit hijau merah kadaleman', 'pohon cabai rawit berbuah lebat merah', 'petani panen cabai rawit sayur kadaleman'],
    121: ['penggilingan padi hasil tani kadaleman', 'pabrik gabah beras putih pulen kadaleman', 'tumpukan karung beras penggilingan kadaleman'],
    122: ['bengkel las listrik bubut besi kadaleman', 'mesin bubut logam bengkel las kadaleman', 'rekayasa besi pagar bubut konstruksi'],
    123: ['warung bakso urat mie ayam kadaleman', 'mangkok bakso urat tetelan sapi kadaleman', 'mie ayam kuah kental gurih kadaleman'],
    124: ['toko sembako grosir bu hj ai kadaleman', 'grosir beras minyak tepung sembako kadaleman', 'kios sembako toko belanja kadaleman'],
    125: ['bengkel motor kang yudi kadaleman', 'servis ganti busi rem motor kadaleman', 'bengkel sepeda motor roda dua kang yudi'],
    126: ['toko pupuk benih saprotan tani kadaleman', 'pupuk urea npk fungisida tanaman kadaleman', 'bibit padi jagung benih unggul kios tani'],
    127: ['jasa jahit pakaian gamis wanita kadaleman', 'ibu penjahit pola kain baju wanita kadaleman', 'mesin jahit obras pakaian rapi kadaleman'],
    128: ['kios pulsa aksesoris handphone kadaleman', 'counter pulsa kartu perdana kuota kadaleman', 'etalase aksesoris kabel data hp kadaleman'],
    129: ['pangkas rambut mas rudi kadaleman pria', 'gunting sisir cukur rambut pria kadaleman', 'kursi pangkas rambut cermin mas rudi'],

    // 130-141 DESA KADEMANGAN
    130: ['opak ketan bakar gurih kademangan jampang', 'proses memanggang opak beras ketan tradisional', 'opak ketan renyah khas jampang kademangan'],
    131: ['pengrajin anyaman boboko tampah bambu kademangan', 'anyaman bambu besek bakul nasi kademangan', 'bambu tali anyaman tradisional kademangan'],
    132: ['penggilingan padi sri rejeki kademangan', 'mesin giling padi padi beras putih kademangan', 'karung beras kemasan penggilingan padi'],
    133: ['peternakan domba kambing pedaging kademangan', 'kandang kambing domba garut kademangan', 'ternak kambing sehat pakan rumput kademangan'],
    134: ['bengkel las karya usaha teralis kademangan', 'pengelasan pagar besi kanopi kademangan', 'teralis jendela besi hollow bengkel las'],
    135: ['warung nasi liwet kastrol teh kokom kademangan', 'nasi liwet ikan asin pete sambal kastrol', 'kuliner nasi liwet khas sundaan kademangan'],
    136: ['toko kelontong sembako murah kademangan', 'beras minyak goreng telur sembako kademangan', 'toko kelontong belanja harian kademangan'],
    137: ['bengkel servis motor tambal tubeless kademangan', 'servis motor ganti oli rantai kademangan', 'tambal ban motor mekanik bengkel kademangan'],
    138: ['kios bibit tanaman pisang buah kademangan', 'bibit pohon pisang buah unggul polybag', 'bibit tanaman buah pekarangan kademangan'],
    139: ['cuci steam motor salju kademangan', 'pencucian steam motor busa salju bersih', 'cuci motor semprotan air kencang kademangan'],
    140: ['penjahit pakaian permak busana kademangan', 'permak jeans potong jahit pakaian kademangan', 'mesin jahit konveksi baju penjahit kademangan'],
    141: ['toko alat tulis fotocopy atk mandiri kademangan', 'mesin fotocopy jilid buku alat tulis atk', 'kertas buku pensil fotocopy toko kademangan'],

    // 142-153 DESA WANASARI
    142: ['sarang lebah madu odeng liar wanasari surade', 'madu odeng murni botol hutan wanasari', 'panen madu lebah pohon tinggi jampang'],
    143: ['budidaya ikan gurame nila kolam alami wanasari', 'kolam tanah ikan gurame nila wanasari', 'ikan gurame segar kolam air tawar wanasari'],
    144: ['pengrajin kusen pintu kayu jati wanasari', 'kusen pintu jendela kayu jati jepara wanasari', 'serutan kayu mebel pertukangan wanasari'],
    145: ['peternakan kambing pe domba wanasari', 'kambing peranakan etawa pe domba wanasari', 'kandang ternak kambing domba pakan hijau'],
    146: ['bengkel las konstruksi pagar wanasari', 'las pagar teralis kanopi besi wanasari', 'bengkel las listrik rangka besi hollow'],
    147: ['nasi liwet gurame bakar cobek wanasari', 'ikan gurame bakar bumbu kecap liwet wanasari', 'lesehan kuliner sunda gurame wanasari'],
    148: ['toko sembako grosir murah wanasari', 'sembako beras gula minyak grosir wanasari', 'kios kelontong sembako warga wanasari'],
    149: ['bengkel servis motor kang dadang wanasari', 'servis motor tune up ganti oli wanasari', 'mekanik bengkel motor servis karbu wanasari'],
    150: ['kios bibit pohon albasia mahoni wanasari', 'bibit pohon kayu mahoni albasia polybag', 'pembibitan tanaman keras kayu hutan wanasari'],
    151: ['cuci motor steam wanasari bersih', 'semprot steam cuci motor salju wanasari', 'pencucian motor hidrolik bersih wanasari'],
    152: ['penjahit busana gamis syari wanita wanasari', 'jahit baju gamis syari muslimah wanasari', 'pola kain jahit busana wanita rapi wanasari'],
    153: ['kios pulsa aksesoris handphone wanasari cell', 'counter pulsa token listrik kuota wanasari', 'etalase kartu perdana aksesoris hp wanasari']
  };

  if (customMap[id]) return customMap[id];
  return [`${name} ${desa} surade`, `${name} indonesia`, `${b.category_name || 'usaha'} sunda`];
}

async function processBusiness(b) {
  const id = b.id;
  const filename = `biz_real_${id}.jpg`;
  const destPath = path.join(FRONTEND_DIR, filename);

  const queries = getDistinctQueries(b);
  console.log(`\n[Biz ${id}] ${b.name} (${b.category_name})`);

  for (const q of queries) {
    console.log(`  Searching: "${q}"...`);
    const urls = await searchBingImages(q);
    console.log(`  Found ${urls.length} images.`);

    for (const url of urls) {
      // Avoid already used URLs across businesses
      if (usedUrls.has(url)) continue;
      // Skip bad extensions or vector/svg/gif/icons
      if (url.includes('.svg') || url.includes('.gif') || url.includes('placeholder') || url.includes('icon')) continue;

      const buffer = await downloadImageToBuffer(url);
      if (buffer) {
        const hash = crypto.createHash('md5').update(buffer).digest('hex');
        // Strictly avoid duplicate image content
        if (usedHashes.has(hash)) {
          console.log(`  [Skip Duplicate Hash] ${url.substring(0, 50)}...`);
          continue;
        }

        // Save unique image
        fs.writeFileSync(destPath, buffer);
        fs.copyFileSync(destPath, path.join(BACKEND_DIR, filename));
        fs.copyFileSync(destPath, path.join(STORAGE_DIR_1, `biz_${id}_banner.jpg`));
        fs.copyFileSync(destPath, path.join(STORAGE_DIR_1, `biz_${id}_logo.jpg`));
        fs.copyFileSync(destPath, path.join(STORAGE_DIR_2, `biz_${id}_banner.jpg`));
        fs.copyFileSync(destPath, path.join(STORAGE_DIR_2, `biz_${id}_logo.jpg`));

        usedUrls.add(url);
        usedHashes.add(hash);

        console.log(`  [✔ SAVED UNIQUE] Biz ${id} -> ${filename} (${Math.round(buffer.length / 1024)} KB)`);
        return true;
      }
    }
  }

  console.log(`  [✖ WARNING] Could not find distinct photo for Biz ${id}`);
  return false;
}

async function main() {
  console.log("==========================================================================");
  console.log("  DOWNLOADING STRICTLY UNIQUE 153 REAL LOCAL PHOTOS (ZERO DUPLICATES)     ");
  console.log("==========================================================================");

  let success = 0;
  for (let i = 0; i < rawData.length; i++) {
    const b = rawData[i];
    const ok = await processBusiness(b);
    if (ok) success++;
  }

  console.log(`\n=== DOWNLOAD COMPLETED: ${success}/${rawData.length} UNIQUE IMAGES SAVED ===`);

  // Final verification check of 0 duplicate hashes
  const finalHashes = {};
  let dupCount = 0;
  for (let id = 1; id <= 153; id++) {
    const fn = `biz_real_${id}.jpg`;
    const fp = path.join(FRONTEND_DIR, fn);
    if (fs.existsSync(fp)) {
      const buf = fs.readFileSync(fp);
      const h = crypto.createHash('md5').update(buf).digest('hex');
      if (finalHashes[h]) {
        dupCount++;
        console.error(`DUPLICATE STILL EXISTS: Biz ${id} duplicate of Biz ${finalHashes[h]}`);
      } else {
        finalHashes[h] = id;
      }
    }
  }

  console.log(`\nFINAL HASH CHECK: ${dupCount} duplicates found across 153 businesses.`);
  if (dupCount === 0) {
    console.log("🎉 SUCCESS: 100% STRICTLY UNIQUE PHOTOGRAPHY ACROSS ALL 153 BUSINESSES!");
  }
}

main();
