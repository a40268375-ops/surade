const fs = require('fs');
const path = require('path');

const categories = JSON.parse(fs.readFileSync(path.join(__dirname, 'all_categories_dump.json'), 'utf8'));

// 12 Authentic Villages of Kecamatan Surade
const VILLAGES = [
  { name: 'Kelurahan Surade', lat: -7.3448, lng: 106.5862, streets: ['Jl. Raya Surade No. ', 'Jl. Kaum Surade No. ', 'Jl. Lodaya No. ', 'Jl. Pasar Baru No. ', 'Jl. Cibarehong No. ', 'Kp. Babakan Bandung No. '] },
  { name: 'Desa Pasiripis', lat: -7.3524, lng: 106.5781, streets: ['Jl. Raya Pasiripis No. ', 'Kp. Cijangkar No. ', 'Jl. Lintas Minajaya No. ', 'Kp. Cikangkung No. ', 'Kp. Citamiang No. '] },
  { name: 'Desa Citanglar', lat: -7.3621, lng: 106.5654, streets: ['Jl. Raya Citanglar No. ', 'Kp. Cicalobak No. ', 'Jl. Alternatif Jampang No. ', 'Kp. Citanglar Girang No. ', 'Kp. Ciniti No. '] },
  { name: 'Desa Buniwangi', lat: -7.3382, lng: 106.5953, streets: ['Jl. Raya Buniwangi No. ', 'Kp. Cibeber No. ', 'Jl. Pertanian Buniwangi No. ', 'Kp. Babakan Buniwangi No. ', 'Kp. Cigadung No. '] },
  { name: 'Desa Gunungsungging', lat: -7.3305, lng: 106.5752, streets: ['Jl. Gua Sungging No. ', 'Kp. Sungging Girang No. ', 'Jl. Wisata Cikaso No. ', 'Kp. Cikadu No. ', 'Kp. Legokloa No. '] },
  { name: 'Desa Jagamukti', lat: -7.3602, lng: 106.6025, streets: ['Jl. Desa Jagamukti No. ', 'Kp. Cibungur No. ', 'Kp. Sukamaju No. ', 'Kp. Cikaret No. ', 'Kp. Cijambe No. '] },
  { name: 'Desa Kademangan', lat: -7.3751, lng: 106.6152, streets: ['Jl. Raya Kademangan No. ', 'Kp. Kademangan Hilir No. ', 'Kp. Pasir Salam No. ', 'Kp. Bojong No. ', 'Kp. Minajaya Pesisir No. '] },
  { name: 'Desa Kadaleman', lat: -7.3820, lng: 106.5904, streets: ['Jl. Kadaleman Raya No. ', 'Kp. Kadaleman Girang No. ', 'Jl. Sentra Nira No. ', 'Kp. Cileungsir No. ', 'Kp. Babakan Anyar No. '] },
  { name: 'Desa Sirnasari', lat: -7.3485, lng: 106.6102, streets: ['Jl. Raya Sirnasari No. ', 'Kp. Sirnasari Wetan No. ', 'Jl. Industri Rumah Tangga No. ', 'Kp. Ciparigi No. ', 'Kp. Cikondang No. '] },
  { name: 'Desa Cipeundeuy', lat: -7.3653, lng: 106.5826, streets: ['Jl. Raya Cipeundeuy No. ', 'Kp. Cipeundeuy Girang No. ', 'Jl. Muara Cipeundeuy No. ', 'Kp. Babakan No. ', 'Kp. Bojonggenteng No. '] },
  { name: 'Desa Sukatani', lat: -7.3552, lng: 106.6201, streets: ['Jl. Raya Sukatani No. ', 'Kp. Sukatani Tengah No. ', 'Jl. Perkebunan No. ', 'Kp. Pasir Huni No. ', 'Kp. Cihonje No. '] },
  { name: 'Desa Wanasari', lat: -7.3708, lng: 106.5985, streets: ['Jl. Raya Wanasari No. ', 'Kp. Wanasari Kidul No. ', 'Jl. Peternakan Unggas No. ', 'Kp. Kubang No. ', 'Kp. Tanjungsari No. '] }
];

function generatePhone(idx) {
  const prefixes = ['0812', '0813', '0821', '0822', '0852', '0853', '0857', '0858', '0877', '0878', '0896'];
  const p = prefixes[idx % prefixes.length];
  const num = String(10000000 + ((idx + 31) * 7919) % 90000000);
  return `${p}${num}`;
}

// REAL LOCAL IMAGES STORED IN /images/businesses/
const IMG = {
  bamboo: "/images/businesses/bamboo.jpg",
  bamboo_craft: "/images/businesses/bamboo_craft.jpg",
  baby_stroller: "/images/businesses/baby_stroller.jpg",
  baby_clothes: "/images/businesses/baby_clothes.jpg",
  sembako: "/images/businesses/sembako.jpg",
  pasar: "/images/businesses/pasar.jpg",
  sayuran: "/images/businesses/sayuran.jpg",
  optik: "/images/businesses/optik.jpg",
  jam_tangan: "/images/businesses/jam_tangan.jpg",
  mainan: "/images/businesses/mainan.jpg",
  perabot_dapur: "/images/businesses/perabot_dapur.jpg",
  kemasan_plastik: "/images/businesses/kemasan_plastik.jpg",
  butik_baju: "/images/businesses/butik_baju.jpg",
  baju_muslim: "/images/businesses/baju_muslim.jpg",
  kriya_pantai: "/images/businesses/kriya_pantai.jpg",
  minimarket: "/images/businesses/minimarket.jpg",
  coffee_shop: "/images/businesses/coffee_shop.jpg",
  manual_brew: "/images/businesses/manual_brew.jpg",
  seafood_bakar: "/images/businesses/seafood_bakar.jpg",
  ikan_asin: "/images/businesses/ikan_asin.jpg",
  bakso_sapi: "/images/businesses/bakso_sapi.jpg",
  mie_ayam: "/images/businesses/mie_ayam.jpg",
  sunda_timbel: "/images/businesses/sunda_timbel.jpg",
  ayam_goreng: "/images/businesses/ayam_goreng.jpg",
  padang_rendang: "/images/businesses/padang_rendang.jpg",
  bakery_cake: "/images/businesses/bakery_cake.jpg",
  buah_segar: "/images/businesses/buah_segar.jpg",
  jus_buah: "/images/businesses/jus_buah.jpg",
  catering: "/images/businesses/catering.jpg",
  sate_angkringan: "/images/businesses/sate_angkringan.jpg",
  apotek: "/images/businesses/apotek.jpg",
  klinik_usg: "/images/businesses/klinik_usg.jpg",
  puskesmas: "/images/businesses/puskesmas.jpg",
  bekam_pijat: "/images/businesses/bekam_pijat.jpg",
  bengkel_motor: "/images/businesses/bengkel_motor.jpg",
  bengkel_mobil: "/images/businesses/bengkel_mobil.jpg",
  rental_mobil: "/images/businesses/rental_mobil.jpg",
  barbershop: "/images/businesses/barbershop.jpg",
  salon_spa: "/images/businesses/salon_spa.jpg",
  jahit_konveksi: "/images/businesses/jahit_konveksi.jpg",
  cuci_sepatu: "/images/businesses/cuci_sepatu.jpg",
  wedding_photo: "/images/businesses/wedding_photo.jpg",
  drone_pilot: "/images/businesses/drone_pilot.jpg",
  design_print: "/images/businesses/design_print.jpg",
  sound_system: "/images/businesses/sound_system.jpg",
  futsal: "/images/businesses/futsal.jpg",
  pancing: "/images/businesses/pancing.jpg",
  cctv: "/images/businesses/cctv.jpg",
  wifi_net: "/images/businesses/wifi_net.jpg",
  servis_hp: "/images/businesses/servis_hp.jpg",
  laptop_pc: "/images/businesses/laptop_pc.jpg",
  curug_cikaso: "/images/businesses/curug_cikaso.jpg",
  pantai_minajaya: "/images/businesses/pantai_minajaya.jpg",
  gula_kelapa: "/images/businesses/gula_kelapa.jpg",
  madu_hutan: "/images/businesses/madu_hutan.jpg",
  tani_pupuk: "/images/businesses/tani_pupuk.jpg",
  pest_control: "/images/businesses/pest_control.jpg",
  art_nanny: "/images/businesses/art_nanny.jpg",
  cleaning_service: "/images/businesses/cleaning_service.jpg",
  law_office: "/images/businesses/law_office.jpg",
  arsitek_properti: "/images/businesses/arsitek_properti.jpg",
  bengkel_las: "/images/businesses/bengkel_las.jpg",
  servis_ac: "/images/businesses/servis_ac.jpg",
  tukang_ledeng: "/images/businesses/tukang_ledeng.jpg",
  teknisi_listrik: "/images/businesses/teknisi_listrik.jpg",
  laundry_kiloan: "/images/businesses/laundry_kiloan.jpg",
  duplikat_kunci: "/images/businesses/duplikat_kunci.jpg",
  notaris_hukum: "/images/businesses/law_office.jpg",
  ekspedisi_logistik: "/images/businesses/ekspedisi_logistik.jpg",
  bank_brilink: "/images/businesses/bank_brilink.jpg",
  organizer_tenda: "/images/businesses/organizer_tenda.jpg",
  fotocopy_atk: "/images/businesses/fotocopy_atk.jpg",
  komunitas_pemuda: "/images/businesses/komunitas_pemuda.jpg"
};

function getRealSuradeProfile(sub, cat, idx) {
  const v = VILLAGES[idx % VILLAGES.length];
  const sName = sub.name;
  const sSlug = sub.slug.toLowerCase();
  const cSlug = cat.slug.toLowerCase();
  const villageName = v.name;
  const vSimple = villageName.replace('Desa ', '').replace('Kelurahan ', '');

  // 1. RETAIL & BELANJA
  if (sSlug.includes('kerajinan-anyaman-bambu')) {
    return {
      name: `Sentra Anyaman Bambu Sauyunan Jagamukti`,
      desc: `Sentra perajin anyaman bambu tradisional khas Sukabumi Selatan di Desa Jagamukti Surade. Memproduksi besek hajatan, bakul/kalo nasi, kap lampu etnik, keranjang buah, dan aneka kerajinan bambu ramah lingkungan.`,
      price_category: "Terjangkau",
      logo: IMG.bamboo,
      banner: IMG.bamboo_craft,
      products: [
        { name: "Besek Bambu Tradisional Paket 10 Pcs", price: 35000, desc: "Besek anyaman bambu natural higienis untuk kemasan nasi kotak, hampers, dan oleh-oleh." },
        { name: "Ceting / Bakul Nasi Anyaman Bambu Halus", price: 48000, desc: "Wadah nasi tradisional bambu apus anti jamur menjaga nasi tetap pulen." },
        { name: "Kap Lampu Gantung Anyaman Bambu Etnik", price: 125000, desc: "Kap lampu gantung nuansa rustic cafe dan teras rumah bernilai seni tinggi." }
      ]
    };
  }
  if (sSlug.includes('perlengkapan-bayi-anak')) {
    return {
      name: `Baby & Kids Store Cinta Bunda Surade`,
      desc: `Toko perlengkapan bayi baru lahir (newborn), balita, dan ibu menyusui di Jl. Lodaya Surade. Menyediakan baju katun SNI, stroller lipat, botol susu BPA free, popok, dan mainan stimulasi anak.`,
      price_category: "Sedang",
      logo: IMG.baby_stroller,
      banner: IMG.baby_clothes,
      products: [
        { name: "Stroller Bayi Lipat Compact Cabin Size", price: 520000, desc: "Kereta dorong bayi ergonomis roda suspensi empuk mudah dilipat satu tangan." },
        { name: "Paket Baju Bayi Newborn Cotton SNI (6 Pasang)", price: 95000, desc: "Pakaian bayi katun double knit ekstra lembut menyerap keringat." },
        { name: "Botol Susu Bayi Anti-Kolik BPA Free 240ml", price: 45000, desc: "Botol minum bayi dengan katup ventilasi udara khusus anti kembung." }
      ]
    };
  }
  if (sSlug.includes('warung-sembako')) {
    return {
      name: `Toko Gamiat Sembako Pasar Surade`,
      desc: `Toko sembako terpercaya legendaris di Pasar Surade. Melayani eceran dan grosir beras Cianjur/Jampang, minyak goreng kemasan, telur ayam segar, gula pasir, tepung terigu, dan bumbu dapur komplit.`,
      price_category: "Terjangkau",
      logo: IMG.pasar,
      banner: IMG.sayuran,
      products: [
        { name: "Beras Pandan Wangi Super Jampang (Sak 10 Kg)", price: 145000, desc: "Beras putih bersih, pulen wangi alami tanpa pengawet dan pemutih." },
        { name: "Minyak Goreng Sawit Premium Kemasan 2 Liter", price: 34000, desc: "Minyak goreng jernih 2x penyaringan bermutu tinggi." },
        { name: "Telur Ayam Ras Segar Kandang (per Kg)", price: 28000, desc: "Telur ayam segar harian cangkang tebal langsung dari peternak." }
      ]
    };
  }
  if (sSlug.includes('grosir-sembako-beras')) {
    return {
      name: `Grosir Beras Jampang & Sembako Sumber Rejeki`,
      desc: `Pusat grosir komoditas beras lokal Jampang dan sembako kebutuhan warung/hajatan di Jl. Raya Surade. Melayani pengiriman partai besar dengan harga distributor bersaing.`,
      price_category: "Terjangkau",
      logo: IMG.sembako,
      banner: IMG.pasar,
      products: [
        { name: "Beras Setra Ramos Super (Karung 25 Kg)", price: 345000, desc: "Beras kualitas premium untuk kebutuhan rumah makan dan katering." },
        { name: "Gula Pasir Kristal Putih Karungan (Sak 50 Kg)", price: 760000, desc: "Gula murni manis bersih standar industri makanan & minuman." }
      ]
    };
  }
  if (sSlug.includes('pasar-tradisional')) {
    return {
      name: `Pasar Tradisional Induk Surade`,
      desc: `Pusat perbelanjaan komoditas bahan pangan harian di pusat Surade: daging sapi segar, sayuran pegunungan, ikan laut Minajaya, bumbu rempah tradisional, dan pakaian.`,
      price_category: "Terjangkau",
      logo: IMG.pasar,
      banner: IMG.sayuran,
      products: [
        { name: "Daging Sapi Segar Paha / Has Luar (per Kg)", price: 135000, desc: "Daging sapi lokal segar potong subuh hari, empuk dan higienis." },
        { name: "Paket Aneka Bumbu Rempah Dapur Segar (1 Keranjang)", price: 25000, desc: "Bawang merah, bawang putih, cabai rawit, jahe, kunyit, dan serai." }
      ]
    };
  }
  if (sSlug.includes('jam-tangan') || sSlug.includes('optik')) {
    return {
      name: `Bro'Optik & Jam Tangan Surade`,
      desc: `Optik dan toko jam tangan di Jl. Veteran Lodaya (Perempatan Cigangsa) Surade. Melayani cek mata gratis, kacamata anti radiasi, frame titanium, dan servis ganti baterai jam tangan.`,
      price_category: "Sedang",
      logo: IMG.optik,
      banner: IMG.jam_tangan,
      products: [
        { name: "Frame Kacamata Titanium + Lensa Anti Radiasi Blue Ray", price: 280000, desc: "Kacamata frame titanium lentur tahan patah dengan lensa proteksi gadget." },
        { name: "Jam Tangan Pria Sport Anti Air Original 50M", price: 195000, desc: "Jam tangan analog-digital kokoh tahan air untuk aktivitas outdoor." }
      ]
    };
  }
  if (sSlug.includes('mainan')) {
    return {
      name: `Toko Mainan & Edukasi Ceria Anak Surade`,
      desc: `Menyediakan aneka mainan edukatif balok susun kayu Montessori, puzzle anak, mobil remote control 4WD, boneka, dan mainan masak-masakan SNI di Jl. Kaum Surade.`,
      price_category: "Terjangkau",
      logo: IMG.mainan,
      banner: IMG.mainan,
      products: [
        { name: "Balok Susun Kayu Edukatif Montessori (Set 50 Pcs)", price: 85000, desc: "Mainan balok kayu aneka bentuk melatih motorik halus dan daya pikir anak." },
        { name: "Mobil Remote Control Offroad 4WD Monster Rock", price: 165000, desc: "Mobil RC tangguh baterai cas bisa melibas jalanan bergelombang." }
      ]
    };
  }
  if (sSlug.includes('plastik-kemasan') || sSlug.includes('dus-nasi')) {
    return {
      name: `Toko Kemasan Surya Plastik & Dus Nasi Surade`,
      desc: `Pusat grosir dan eceran dus nasi catering R10K/R10B, kotak snack hajatan, mika bento, thinwall kotak makanan microwave safe, cup minuman boba, dan kantong kresek di Jl. Pasar Baru Surade.`,
      price_category: "Terjangkau",
      logo: IMG.kemasan_plastik,
      banner: IMG.perabot_dapur,
      products: [
        { name: "Dus Nasi Catering Motif Daun R10K Tebal (Pack Isi 50)", price: 42000, desc: "Dus nasi tebal motif anyaman daun pisang kokoh anti rembes minyak." },
        { name: "Thinwall Kotak Makanan Persegi 750ml (Pack Isi 25 Pcs)", price: 38000, desc: "Wadah bekal makanan microwave & freezer safe tutup rapat anti tumpah." },
        { name: "Cup Minuman Gelas Plastik Presisi 16 Oz (Slop Isi 50 Pcs)", price: 18000, desc: "Gelas cup plastik tebal untuk kemasan es teh poci, jus, dan kopi kekinian." }
      ]
    };
  }
  if (sSlug.includes('perabot-dapur') || sSlug.includes('plastik')) {
    return {
      name: `Toko Perabot Dapur & Plastik Subur Makmur Surade`,
      desc: `Menyediakan wajan granit anti lengket, baskom plastik tebal, toples kaca, rantang susun, rak piring, dan perlengkapan dapur rumah tangga di Jl. Raya Surade.`,
      price_category: "Terjangkau",
      logo: IMG.perabot_dapur,
      banner: IMG.kemasan_plastik,
      products: [
        { name: "Wajan Wok Pan Granit Anti Lengket 32cm", price: 135000, desc: "Wajan tebal lapisan granit anti gores, hemat minyak dan mudah dibersihkan." },
        { name: "Baskom Plastik Jumbo Serbaguna Tebal Tahan Pecah", price: 25000, desc: "Baskom cuci sayur dan wadah adonan tepung bahan elastis kuat." }
      ]
    };
  }
  if (sSlug.includes('pakaian-jadi') || sSlug.includes('busana-muslim') || sSlug.includes('toko-sepatu')) {
    return {
      name: `Butik Busana Muslimah & Pakaian An-Nur Surade`,
      desc: `Menyediakan pakaian gamis syar'i, kemeja koko kurta pria, batik modern, celana bahan, kaos distro, sepatu sneakers, dan sandal di Jl. Raya Surade No. 105.`,
      price_category: "Sedang",
      logo: IMG.butik_baju,
      banner: IMG.baju_muslim,
      products: [
        { name: "Gamis Syar'i Set Khimar Ceruty Babydoll Premium", price: 185000, desc: "Gamis jatuh anggun lembut berfuring adem wudhu dan busui friendly." },
        { name: "Kemeja Koko Pria Lengan Panjang Katun Toyobo", price: 120000, desc: "Baju koko modern bahan katun adem menyerap keringat jahitan rapi." }
      ]
    };
  }
  if (sSlug.includes('kerajinan-tangan')) {
    return {
      name: `Galeri Kriya & Kerajinan Pesisir Minajaya`,
      desc: `Galeri kerajinan tangan dan souvenir khas pesisir pantai Selatan Surade: miniatur perahu nelayan Minajaya, cinderamata kerang laut, dan plakat kayu ukir di Desa Kademangan Surade.`,
      price_category: "Terjangkau",
      logo: IMG.kriya_pantai,
      banner: IMG.bamboo_craft,
      products: [
        { name: "Miniatur Perahu Nelayan Minajaya Kayu Mahoni", price: 95000, desc: "Pajangan meja miniatur perahu tradisional khas nelayan Surade ukiran halus." },
        { name: "Gantungan Kunci Resin Fosil & Kerang Pantai (Isi 5 Pcs)", price: 25000, desc: "Souvenir gantungan kunci estetik khas destinasi wisata Surade." }
      ]
    };
  }
  if (sSlug.includes('minimarket') || sSlug.includes('kelontong')) {
    return {
      name: `Yomart Surade`,
      desc: `Pusat belanja kebutuhan pokok harian, susu, produk kebersihan rumah tangga, makanan ringan, dan minuman dingin di Jl. Raya Surade No. 50.`,
      price_category: "Terjangkau",
      logo: IMG.minimarket,
      banner: IMG.sembako,
      products: [
        { name: "Susu UHT Cokelat Full Cream 1 Liter", price: 19500, desc: "Susu cair segar bernutrisi tinggi untuk kesehatan harian keluarga." },
        { name: "Deterjen Cair Konsentrat Anti Bakteri Botol 800ml", price: 22000, desc: "Formula ampuh bersihkan noda membandel dan wangi tahan lama." }
      ]
    };
  }

  // 2. KULINER
  if (cSlug === 'kuliner') {
    if (sSlug.includes('kopi') || sSlug.includes('cafe') || sSlug.includes('warkop')) {
      if (idx % 2 === 0) {
        return {
          name: `Let's Coffee & Roastery Surade`,
          desc: `Kedai kopi legendaris di Jl. Raya Surade dengan spesialisasi manual brew V60 biji kopi Jampang, espresso susu gula aren kawung murni, kue balok lumer, dan cireng rujak. Suasana retro nyaman dengan WiFi kencang.`,
          price_category: "Terjangkau",
          logo: IMG.manual_brew,
          banner: IMG.coffee_shop,
          products: [
            { name: "Es Kopi Susu Aren Gula Kawung Asli Jampang", price: 18000, desc: "Espresso robusta lokal dipadu susu segar creamy dan gula aren kawung murni." },
            { name: "Manual Brew Single Origin V60 Kopi Jampang", price: 22000, desc: "Kopi seduh manual beans pilihan citarasa fruity dan aroma harum." },
            { name: "Kue Balok Cokelat Lumer Khas Let's Coffee (Isi 5)", price: 15000, desc: "Kue balok panggang arang dengan cokelat meleleh di tengahnya." }
          ]
        };
      } else {
        return {
          name: `House of Kaf Food Corner and Coffee`,
          desc: `Garden cafe & food corner populer di Jl. Raya Cibungur Surade. Menyajikan aneka racikan kopi kekinian, rice bowl ayam teriyaki, spaghetti, dan snack lezat cocok untuk nongkrong dan nugas.`,
          price_category: "Terjangkau",
          logo: IMG.coffee_shop,
          banner: IMG.manual_brew,
          products: [
            { name: "Signature Iced Coffee Kaf Creamy", price: 20000, desc: "Kopi susu racikan khas Kaf dengan aroma karamel dan rasa creamy." },
            { name: "Rice Bowl Ayam Crispy Sambal Matah", price: 24000, desc: "Nasi pulen ayam fillet krispi disiram sambal matah segar harum serai." }
          ]
        };
      }
    }
    if (sSlug.includes('seafood') || sSlug.includes('ikan-bakar') || sSlug.includes('ikan-asin')) {
      if (sSlug.includes('asin')) {
        return {
          name: `Sentra Pengolahan Ikan Asin Jambal Roti Minajaya`,
          desc: `Sentra produksi ikan asin jambal roti dan ikan asin teri segar langsung dari nelayan Pantai Minajaya, Desa Kademangan Surade. Kualitas super daging tebal gurih alami tanpa formalin.`,
          price_category: "Sedang",
          logo: IMG.ikan_asin,
          banner: IMG.seafood_bakar,
          products: [
            { name: "Ikan Asin Jambal Roti Super Daging Tebal (per 500g)", price: 48000, desc: "Ikan jambal roti empuk tidak terlalu asin, gurih lezat digoreng kering." },
            { name: "Ikan Asin Teri Nasi Putih Bersih (per 250g)", price: 25000, desc: "Teri nasi segar asin pas renyah untuk sambal teri kacang." }
          ]
        };
      } else {
        return {
          name: `Warung Seafood Laut Kidul Minajaya`,
          desc: `Warung hidangan laut segar di tepi Pantai Minajaya Surade. Menyajikan ikan kakap/kuwe bakar arang batok bumbu rempah, cumi saus padang, udang goreng mentega, dan karedok segar.`,
          price_category: "Sedang",
          logo: IMG.seafood_bakar,
          banner: IMG.ikan_asin,
          products: [
            { name: "Paket Ikan Kakap Bakar Bumbu Jimbaran + Nasi & Lalap", price: 45000, desc: "Ikan kakap segar bakar rempah harum disajikan dengan sambal terasi pedas." },
            { name: "Cumi Bakar Saus Padang Pedas Manis", price: 35000, desc: "Cumi segar empuk dimasak saus padang gurih kaya rempah dan bawang bombay." }
          ]
        };
      }
    }
    if (sSlug.includes('bakso') || sSlug.includes('mie')) {
      if (sSlug.includes('mie') || sSlug.includes('hijau')) {
        return {
          name: `MIE AYAM HIJAU (HADE) Surade`,
          desc: `Warung mie ayam legendaris dengan olahan mie hijau sari sayuran bayam organik di Jl. Kaum Surade. Disajikan dengan potongan ayam semur gurih, pangsit krispi, dan bakso kenyal.`,
          price_category: "Terjangkau",
          logo: IMG.mie_ayam,
          banner: IMG.bakso_sapi,
          products: [
            { name: "Mie Ayam Hijau Spesial Bakso + Pangsit", price: 16000, desc: "Mie hijau sehat kenyal dengan ayam semur manis gurih dan pangsit goreng." },
            { name: "Mie Ayam Hijau Komplit Ceker Empuk", price: 18000, desc: "Porsi lengkap dengan tambahan 2 ceker ayam bumbu kecap empuk." }
          ]
        };
      } else {
        return {
          name: `Bakso H. Sarip SituHiang & Bakso Mas Mul (BMM)`,
          desc: `Warung bakso sapi legendaris nomor satu di Surade. Terkenal dengan tekstur bakso urat jumbo kenyal berdaging, tetelan sapi melimpah, dan kuah kaldu rempah gurih segar.`,
          price_category: "Terjangkau",
          logo: IMG.bakso_sapi,
          banner: IMG.mie_ayam,
          products: [
            { name: "Mie Bakso Urat Jumbo Spesial Tetelan Sapi Gurih", price: 20000, desc: "Bakso urat besar berdaging sapi murni disiram kuah kaldu sapi kaya bumbu." },
            { name: "Bakso Beranak Isian Daging Cincang & Telur Puyuh", price: 25000, desc: "Bakso jumbo yang di dalamnya berisi bakso kecil dan telur puyuh gurih." }
          ]
        };
      }
    }
    if (sSlug.includes('ayam') || sSlug.includes('geprek') || sSlug.includes('bebek')) {
      return {
        name: `Ayam Geprek Sambal Korek Juara Surade`,
        desc: `Pusat kuliner ayam geprek krispi sambal korek pedas level 1-10, bebek goreng empuk bumbu madura, dan nasi lalapan hangat di Jl. Raya Surade.`,
        price_category: "Terjangkau",
        logo: IMG.ayam_goreng,
        banner: IMG.ayam_goreng,
        products: [
          { name: "Paket Ayam Geprek Krispi Sambal Korek + Nasi & Es Teh", price: 18000, desc: "Ayam goreng tepung renyah digeprek dengan sambal cabai rawit pedas mantap." },
          { name: "Bebek Goreng Sambal Hitam Madura Gurih Empuk", price: 28000, desc: "Potongan bebek empuk bumbu rempah hitam khas disajikan lalapan segar." }
        ]
      };
    }
    if (sSlug.includes('sunda') || sSlug.includes('warung') || sSlug.includes('lesehan')) {
      if (idx % 2 === 0) {
        return {
          name: `Rumah Makan Sadulur Khas Sunda Surade`,
          desc: `Rumah makan keluarga bernuansa asri di Jl. Raya Surade. Menyajikan nasi timbel komplit, ayam goreng kampung kremes, gurame terbang sambal cobek mertua, karedok, dan sayur asem segar.`,
          price_category: "Terjangkau",
          logo: IMG.sunda_timbel,
          banner: IMG.ayam_goreng,
          products: [
            { name: "Paket Nasi Timbel Ayam Kampung Goreng Sadulur", price: 32000, desc: "Nasi timbel bungkus daun pisang, ayam kampung gurih, tahu tempe, sambal dadak." },
            { name: "Gurame Goreng Terbang Sambal Cobek Jahe", price: 55000, desc: "Ikan gurame segar goreng garing disiram racikan sambal cobek jahe pedas segar." }
          ]
        };
      } else {
        return {
          name: `Lesehan H. Ali Karanglayung Pasiripis`,
          desc: `Tempat makan lesehan favorit di Karanglayung Desa Pasiripis Surade di tengah suasana persawahan asri. Menyajikan ikan nila/gurame bakar air tawar bumbu cobek dan pepes ikan.`,
          price_category: "Terjangkau",
          logo: IMG.sunda_timbel,
          banner: IMG.ayam_goreng,
          products: [
            { name: "Paket Ikan Nila Bakar Cobek Karanglayung + Nasi", price: 28000, desc: "Ikan nila air tawar segar bakar bumbu cobek pedas segar khas pedesaan." },
            { name: "Pepes Ikan Mas Duri Lunak Bumbu Kemangi", price: 22000, desc: "Pepes ikan aroma daun pisang dan kemangi wangi rempah meresap." }
          ]
        };
      }
    }
    if (sSlug.includes('padang')) {
      return {
        name: `RM Padang Sinar Minang Surade`,
        desc: `Rumah makan Padang otentik di Jl. Pasar Baru Surade. Menyajikan rendang sapi hitam pekat empuk, ayam pop gurih air kelapa, gulai cincang tunjang, telur dadar tebal, dan sambal ijo segar.`,
        price_category: "Terjangkau",
        logo: IMG.padang_rendang,
        banner: IMG.sunda_timbel,
        products: [
          { name: "Paket Nasi Rendang Daging Sapi + Gulai Nangka & Sambal Ijo", price: 24000, desc: "Rendang daging sapi santan kelapa murni bumbu rempah minang empuk meresap." },
          { name: "Ayam Goreng Pop Khas Padang + Saus Tomat Asli", price: 18000, desc: "Ayam kampung rebus air kelapa digoreng kilat disajikan sambal pop khas." }
        ]
      };
    }
    if (sSlug.includes('roti') || sSlug.includes('bakery') || sSlug.includes('oleh-oleh') || sSlug.includes('jajanan') || sSlug.includes('olahan')) {
      return {
        name: sSlug.includes('oleh-oleh') ? `Pusat Oleh-Oleh Khas Jampang Surade` : (sSlug.includes('olahan') ? `Sentra Opak & Keripik Singkong Renyah Surade` : `Surade Bakery & Bolu Susu Sukabumi`),
        desc: `Pusat roti panggang hangat, bolu gulung susu Sukabumi, keripik pisang tanduk Jampang, opak ketan bakar renyah, dan snack hajatan di Jl. Raya Surade.`,
        price_category: "Terjangkau",
        logo: IMG.bakery_cake,
        banner: IMG.bakery_cake,
        products: [
          { name: "Keripik Pisang Tanduk Gurih Khas Jampang (Pack 250g)", price: 20000, desc: "Keripik pisang tanduk iris tipis renyah rasa original gurih mentega." },
          { name: "Bolu Gulung Susu Sukabumi Lembut 24cm", price: 38000, desc: "Bolu gulung tekstur lembut berpadu krim susu gurih manis tidak enek." }
        ]
      };
    }
    if (sSlug.includes('buah') || sSlug.includes('jus')) {
      return {
        name: `Toko Buah Segar Berkah & Aneka Jus Alami Surade`,
        desc: `Menyediakan alpukat mentega, jeruk medan, apel fuji, semangka, dan aneka jus buah segar dingin murni tanpa pemanis buatan di Jl. Raya Surade.`,
        price_category: "Terjangkau",
        logo: IMG.buah_segar,
        banner: IMG.jus_buah,
        products: [
          { name: "Alpukat Mentega Super Pulen Lembut (per Kg)", price: 28000, desc: "Alpukat daging tebal warna kuning mentega manis tanpa serat." },
          { name: "Jus Buah Segar Cup Jumbo (Alpukat / Mangga / Naga)", price: 12000, desc: "Jus buah kental segar disajikan dingin es batu kristal higienis." }
        ]
      };
    }
    if (sSlug.includes('katering')) {
      return {
        name: `Katering Berkah Barokah Surade`,
        desc: `Jasa katering profesional di Desa Jagamukti Surade melayani pesanan nasi kotak syukuran, tumpeng komplit, dan prasmanan pesta pernikahan dengan cita rasa lezat higienis.`,
        price_category: "Terjangkau",
        logo: IMG.catering,
        banner: IMG.catering,
        products: [
          { name: "Paket Nasi Kotak Spesial Ayam Bakar Madu + Capcay", price: 25000, desc: "Nasi putih, ayam bakar madu, capcay bakso, sambal, kerupuk, dan buah." },
          { name: "Tumpeng Kuning Komplit Hiasan Daun (Porsi 15 Orang)", price: 350000, desc: "Nasi kuning pulen wangi, ayam goreng, orek tempe, perkedel, telur rawis." }
        ]
      };
    }
    if (sSlug.includes('angkringan') || sSlug.includes('sate')) {
      return {
        name: `Angkringan Khas Jogja & Sate Taichan Mas Hendra Surade`,
        desc: `Tempat nongkrong santai di Jl. Kaum Surade: nasi kucing, sate usus, sate kulit, sate telur puyuh, sate taichan pedas gurih, dan wedang jahe susu sereh hangat.`,
        price_category: "Terjangkau",
        logo: IMG.sate_angkringan,
        banner: IMG.sate_angkringan,
        products: [
          { name: "Nasi Kucing Sambal Teri / Orek Tempe", price: 4000, desc: "Nasi porsi pas bungkusan daun pisang hangat dengan lauk gurih pedas." },
          { name: "Sate Kulit & Sate Usus Bakar Bumbu Manis (per Tusuk)", price: 3000, desc: "Sate bakar arang empuk dibalut kecap bumbu rempah gurih lezat." }
        ]
      };
    }
  }

  // 3. KESEHATAN
  if (cSlug === 'kesehatan') {
    if (sSlug.includes('puskesmas')) {
      return {
        name: `Puskesmas Surade`,
        desc: `Pusat Kesehatan Masyarakat Kecamatan Surade di Jl. Raya Surade No. 53 (Telp: 0266-490123). Melayani IGD 24 jam, poli umum, poli gigi, KIA & persalinan, imunisasi, dan laboratorium.`,
        price_category: "Terjangkau",
        logo: IMG.puskesmas,
        banner: IMG.klinik_usg,
        products: [
          { name: "Pelayanan Pemeriksaan Dokter & Pengobatan Umum", price: 15000, desc: "Pemeriksaan medis dasar oleh dokter umum dan pemberian obat sesuai diagnosa." },
          { name: "Pemeriksaan Kesehatan Ibu Hamil (KIA) & Imunisasi", price: 20000, desc: "Pemeriksaan berkala kehamilan, tensi, dan imunisasi dasar lengkap." }
        ]
      };
    }
    if (sSlug.includes('klinik') || sSlug.includes('bidan') || sSlug.includes('dokter') || sSlug.includes('rumah-sakit') || sSlug.includes('perawat') || sSlug.includes('laboratorium')) {
      if (sSlug.includes('bidan')) {
        return {
          name: `Praktik Mandiri Bidan Hj. Neneng Suryani, S.Tr.Keb`,
          desc: `Praktik bidan mandiri resmi di Desa Buniwangi Surade. Melayani persalinan 24 jam, USG kehamilan, imunisasi bayi, konsultasi KB, dan perawatan tali pusat bayi baru lahir.`,
          price_category: "Sedang",
          logo: IMG.klinik_usg,
          banner: IMG.puskesmas,
          products: [
            { name: "Paket Persalinan Normal 24 Jam Ramah Ibu & Bayi", price: 950000, desc: "Pendampingan persalinan profesional, obat-obatan standar, dan perawatan pasca melahirkan." },
            { name: "Pemeriksaan Kehamilan USG + Konsultasi Bidan", price: 75000, desc: "Pemeriksaan detak jantung janin, posisi bayi, dan panduan nutrisi ibu hamil." }
          ]
        };
      } else if (sSlug.includes('laboratorium')) {
        return {
          name: `Laboratorium Klinik Cek Darah & Kolesterol Surade`,
          desc: `Layanan pemeriksaan darah lengkap, gula darah sewaktu/puasa, asam urat, kolesterol total, dan tes urine di Jl. Raya Surade. Hasil cepat dan akurat.`,
          price_category: "Terjangkau",
          logo: IMG.puskesmas,
          banner: IMG.klinik_usg,
          products: [
            { name: "Paket Cek Gula Darah, Asam Urat & Kolesterol", price: 50000, desc: "Pemeriksaan darah 3 in 1 cepat dengan alat digital presisi." },
            { name: "Pemeriksaan Darah Lengkap (Hematologi)", price: 85000, desc: "Uji kadar hemoglobin, leukosit, trombosit dan hematokrit." }
          ]
        };
      } else if (sSlug.includes('perawat')) {
        return {
          name: `Layanan Perawat Medis Home Care Pasien Surade`,
          desc: `Layanan kunjungan perawat medis ke rumah di Surade: perawatan luka diabetes, ganti perban steril, pasang infus/kateter, dan pendampingan lansia sakit.`,
          price_category: "Sedang",
          logo: IMG.puskesmas,
          banner: IMG.klinik_usg,
          products: [
            { name: "Kunjungan Perawat Rawat Luka Diabetes ke Rumah", price: 85000, desc: "Pembersihan dan perawatan luka menggunakan perban modern steril." },
            { name: "Pemasangan Selang NGT / Kateter Medis Steril", price: 150000, desc: "Tindakan medis pemasangan alat bantu nutrisi / kateter oleh perawat resmi." }
          ]
        };
      } else {
        return {
          name: `Klinik Pratama Rawat Inap Asy-Syifaa Citanglar`,
          desc: `Klinik kesehatan rawat inap dan bersalin 24 jam di Jl. Raya Citanglar Surade. Dilengkapi dokter umum, USG 4D kehamilan, fasilitas rawat inap bersih ber-AC, dan apotek terpadu.`,
          price_category: "Sedang",
          logo: IMG.klinik_usg,
          banner: IMG.puskesmas,
          products: [
            { name: "Pemeriksaan USG Kehamilan 4D + Cetak Foto Janin", price: 160000, desc: "Pemeriksaan perkembangan janin detail dengan alat USG modern dan arahan dokter." },
            { name: "Konsultasi Dokter Umum + Pemeriksaan Vital Sign & Obat", price: 65000, desc: "Pemeriksaan medis lengkap dengan diagnosa akurat dan obat terapi efektif." }
          ]
        };
      }
    }
    if (sSlug.includes('apotek')) {
      return {
        name: `Apotek Surade`,
        desc: `Apotek terpercaya di Kp. Surade Tengah RT 03/01 Surade. Melayani penebusan resep dokter, obat paten & generik, vitamin daya tahan tubuh, tensimeter digital, dan konsultasi apoteker resmi.`,
        price_category: "Terjangkau",
        logo: IMG.apotek,
        banner: IMG.klinik_usg,
        products: [
          { name: "Paket Vitamin C 1000mg + Zinc Imunitas (Botol Isi 30)", price: 48000, desc: "Suplemen menjaga daya tahan tubuh dari flu dan kelelahan." },
          { name: "Tensimeter Digital Lengan Otomatis Akurat Bergaransi", price: 235000, desc: "Alat pengukur tekanan darah digital praktis dengan layar LCD besar." }
        ]
      };
    }
    if (sSlug.includes('jamu')) {
      return {
        name: `Depot Jamu Tradisional & Herbal Segar Surade`,
        desc: `Penyedia jamu gendong rebusan alami: beras kencur, kunyit asam sirih, temulawak penambah nafsu makan, dan jamu seduh komplit pegal linu di Jl. Pasar Baru Surade.`,
        price_category: "Terjangkau",
        logo: IMG.madu_hutan,
        banner: IMG.gula_kelapa,
        products: [
          { name: "Jamu Beras Kencur & Kunyit Asam Segar Botol 500ml", price: 10000, desc: "Rebusan rimpang alami menyegarkan badan dan melancarkan pencernaan." },
          { name: "Jamu Seduh Komplit Pegal Linu + Madu Telur Bebek", price: 15000, desc: "Racikan jamu tradisional memulihkan stamina capek sehabis bekerja." }
        ]
      };
    }
    if (sSlug.includes('patah-tulang')) {
      return {
        name: `Pengobatan Tradisional Patah Tulang & Urut Surade`,
        desc: `Pengobatan tradisional ahli urut patah tulang, sendi geser, keseleo, dan urat terjepit berpengalaman puluhan tahun di Desa Citanglar Surade.`,
        price_category: "Terjangkau",
        logo: IMG.bekam_pijat,
        banner: IMG.bekam_pijat,
        products: [
          { name: "Terapi Urut Terkilir, Keseleo & Urat Kejepit", price: 50000, desc: "Penanganan pijat urut tradisional mengembalikan posisi urat saraf." },
          { name: "Penanganan Tradisional Reposisi Tulang Retak & Balut Bambu", price: 100000, desc: "Reposisi tulang alami dengan balutan herbal minyak kelapa murni." }
        ]
      };
    }
    if (sSlug.includes('pijat') || sSlug.includes('bekam') || sSlug.includes('herbal') || sSlug.includes('fisioterapi') || sSlug.includes('refleksi')) {
      return {
        name: `Pusat Terapi Bekam & Pijat Refleksi Sehat Surade`,
        desc: `Layanan terapi kesehatan alami di Desa Gunungsungging Surade: pijat refleksi kebugaran, bekam medis steril bersertifikat, fisioterapi stroke/saraf kejepit, dan herbal alami.`,
        price_category: "Terjangkau",
        logo: IMG.bekam_pijat,
        banner: IMG.bekam_pijat,
        products: [
          { name: "Paket Terapi Bekam Basah Medis Steril (11 Titik)", price: 80000, desc: "Mengeluarkan darah kotor sisa metabolisme dengan peralatan steril sekali pakai." },
          { name: "Pijat Refleksi Kebugaran Tubuh Aromaterapi (60 Menit)", price: 70000, desc: "Merelaksasi otot kaku dan hilangkan pegal capek sekujur badan." }
        ]
      };
    }
  }

  // 4. OTOMOTIF
  if (cSlug === 'otomotif') {
    if (sSlug.includes('rental')) {
      return {
        name: `Surade Tour & Rental Mobil Avanza Innova`,
        desc: `Jasa rental mobil di Jl. Lodaya Surade: Toyota Avanza, Innova Reborn, Hiace, dan Isuzu Elf pariwisata lepas kunci atau dengan driver ramah hafal rute wisata Geopark Ciletuh.`,
        price_category: "Sedang",
        logo: IMG.rental_mobil,
        banner: IMG.bengkel_mobil,
        products: [
          { name: "Sewa Toyota Avanza New 24 Jam (Lepas Kunci)", price: 350000, desc: "Mobil bersih wangi AC dingin surat lengkap untuk perjalanan keluarga." },
          { name: "Sewa Isuzu Elf 19 Seat + Driver & BBM Keliling Geopark", price: 1200000, desc: "Kapasitas 19 kursi dengan driver hafal rute wisata alam Surade." }
        ]
      };
    }
    if (sSlug.includes('wa-ebong') || sSlug.includes('motor')) {
      return {
        name: sSlug.includes('ebong') ? `Bengkel Wa Ebong Surade` : `Bengkel Motor AHASS Selamat Motor Surade`,
        desc: `Bengkel resmi dan servis motor injeksi di Jl. Raya Surade No. 120. Melayani tune up, ganti oli mesin/gardan AHM, servis CVT, perbaikan rem, dan suku cadang asli bergaransi.`,
        price_category: "Terjangkau",
        logo: IMG.bengkel_motor,
        banner: IMG.bengkel_mobil,
        products: [
          { name: "Paket Tune Up Injeksi Motor Matic + Pembersihan Throttle Body", price: 65000, desc: "Membersihkan kerak ruang bakar, tarikan motor kembali enteng dan irit bensin." },
          { name: "Paket Ganti Oli Mesin Sintetis MPX2 + Oli Gardan Asli", price: 65000, desc: "Oli asli perlindungan mesin dari gesekan panas dan memperpanjang umur mesin." }
        ]
      };
    }
    return {
      name: `Bengkel Mobil & Servis Injeksi Jaya Mandiri Surade`,
      desc: `Bengkel servis mobil injeksi dan diesel di Jl. Raya Pasiripis Surade: tune up, ganti oli, servis rem/kopling, servis kaki-kaki, scan ECU komputer, dan pasang ban tubeless.`,
      price_category: "Terjangkau",
      logo: IMG.bengkel_mobil,
      banner: IMG.bengkel_motor,
      products: [
        { name: "Paket Tune Up & Scan Komputer Mobil Injeksi", price: 150000, desc: "Mendiagnosa sensor mesin, membersihkan injector dan busi agar performa prima." },
        { name: "Paket Ganti Oli Mesin Sintetis 4 Liter + Filter Oli", price: 320000, desc: "Oli mesin SAE 10W-40 perlindungan keausan mesin berkualitas." }
      ]
    };
  }

  // 5. JASA & SERVIS
  if (cSlug === 'jasa' || cSlug === 'servis') {
    if (sSlug.includes('rayap') || sSlug.includes('pest')) {
      return {
        name: `Surade Pest Control & Basmi Rayap Bergaransi`,
        desc: `Jasa pembasmi hama rayap kayu, penyemprotan nyamuk demam berdarah (fogging), basmi kecoa dan tikus gudang berizin di Kecamatan Surade.`,
        price_category: "Sedang",
        logo: IMG.pest_control,
        banner: IMG.pest_control,
        products: [
          { name: "Jasa Fogging Nyamuk & Hama Perumahan / Lingkungan", price: 150000, desc: "Penyemprotan asap insektisida aman untuk membasmi jentik dan nyamuk dewasa." },
          { name: "Injeksi Anti Rayap Bangunan Rumah & Pondasi Bergaransi", price: 350000, desc: "Pemberian cairan termitisida anti rayap tanah bergaransi proteksi 3 tahun." }
        ]
      };
    }
    if (sSlug.includes('angkut') || sSlug.includes('pindahan')) {
      return {
        name: `Jasa Angkut & Pindahan Rumah Pick Up Surade`,
        desc: `Layanan angkut barang pindahan rumah, kosan, kantor, angkut material, dan hasil panen kelapa/pisang menggunakan mobil pick up bersih di Surade.`,
        price_category: "Terjangkau",
        logo: IMG.rental_mobil,
        banner: IMG.rental_mobil,
        products: [
          { name: "Sewa Pick Up + Sopir & Tenaga Angkut Barang Lokal Surade", price: 150000, desc: "Mobil pick up bak luas siap muat perabot rumah tangga dan barang dagangan." },
          { name: "Jasa Pindahan Rumah Antar Kecamatan / Luar Kota", price: 450000, desc: "Pengantaran aman terpal pelindung hujan ke Sukabumi, Pelabuhan Ratu & Jabodetabek." }
        ]
      };
    }
    if (sSlug.includes('sumur') || sSlug.includes('toren') || sSlug.includes('bor')) {
      return {
        name: `Ahli Sumur Bor & Kuras Toren Air Bersih Surade`,
        desc: `Spesialis pembuatan sumur bor air tanah dangkal/dalam, geolistrik titik air, kuras toren penampungan air lumut, dan perbaikan pompa air macet di Surade.`,
        price_category: "Sedang",
        logo: IMG.bengkel_las,
        banner: IMG.bengkel_las,
        products: [
          { name: "Jasa Kuras Bersih Toren Air Lumut 500L - 1000L", price: 120000, desc: "Pembersihan kerak lumut dan endapan lumpur toren hingga air kembali jernih." },
          { name: "Pengeboran Sumur Air Bersih Dalam 30 - 60 Meter", price: 1500000, desc: "Pengeboran mesin bertenaga pipa casing PVC tebal air jernih melimpah." }
        ]
      };
    }
    if (sSlug.includes('bocor') || sSlug.includes('waterproofing')) {
      return {
        name: `Ahli Perbaikan Atap Bocor & Waterproofing Surade`,
        desc: `Jasa perbaikan genteng bocor, asbes pecah, talang seng rembes, dan pelapisan cat waterproofing serat fiber dak beton tahan hujan lebat di Surade.`,
        price_category: "Sedang",
        logo: IMG.arsitek_properti,
        banner: IMG.arsitek_properti,
        products: [
          { name: "Jasa Tambal Bocor Genteng & Perbaikan Talang Air", price: 75000, desc: "Pengecekan titik rembes dan penambalan dengan sealant anti panas & bocor." },
          { name: "Pelapisan Waterproofing Serat Fiber Dak Beton (per m2)", price: 65000, desc: "Pelapisan 3 lapis membran serat tahan genangan air hujan ekstrim." }
        ]
      };
    }
    if (sSlug.includes('plafon') || sSlug.includes('gypsum')) {
      return {
        name: `Jasa Pasang Plafon PVC & Gypsum Partisi Surade`,
        desc: `Pemasangan plafon PVC motif kayu/glossy, plafon gypsum drop ceiling lampu LED, dan partisi dinding ruangan kantor/toko di wilayah Surade.`,
        price_category: "Sedang",
        logo: IMG.arsitek_properti,
        banner: IMG.arsitek_properti,
        products: [
          { name: "Plafon PVC Motif Kayu Rangka Hollow Galvanis (per m2)", price: 165000, desc: "Plafon anti rayap tahan air bebas bocor pengerjaan rapi kokoh." },
          { name: "Partisi Ruangan Gypsum Board 2 Sisi (per m2)", price: 140000, desc: "Dinding sekat ruangan rapi kedap suara siap finishing cat tembok." }
        ]
      };
    }
    if (sSlug.includes('poles') || sSlug.includes('marmer')) {
      return {
        name: `Jasa Poles Lantai Marmer & Keramik Surade`,
        desc: `Layanan poles lantai marmer, teraso, granit, dan cuci nat keramik kusam kembali kinclong bersih bercahaya menggunakan mesin polisher profesional di Surade.`,
        price_category: "Terjangkau",
        logo: IMG.perabot_dapur,
        banner: IMG.perabot_dapur,
        products: [
          { name: "Poles Keramik & Granit Kinclong Bersih (per m2)", price: 35000, desc: "Mengangkat noda semen dan kerak membandel permukaan lantai kembali berkilau." },
          { name: "Kristalisasi Lantai Marmer Kusam Anti Gores (per m2)", price: 55000, desc: "Pelapisan chemical kristal marmer terlihat mewah mengkilap seperti cermin." }
        ]
      };
    }
    if (sSlug.includes('rumput') || sSlug.includes('tebang') || sSlug.includes('pohon')) {
      return {
        name: `Jasa Tebang Pohon & Potong Rumput Halaman Surade`,
        desc: `Jasa tebang pohon rawan roboh, pangkas dahan dekat kabel PLN, dan potong rumput liar halaman rumah/kebun dengan mesin pemotong rumput di Surade.`,
        price_category: "Terjangkau",
        logo: IMG.tani_pupuk,
        banner: IMG.tani_pupuk,
        products: [
          { name: "Jasa Potong Rumput Kebun / Halaman Rumah Panggilan", price: 80000, desc: "Pembersihan ilalang dan rumput liar cepat bersih sampai ke akar." },
          { name: "Penebangan Pohon Rawan Tumbang Aman Berpengalaman", price: 250000, desc: "Pemotongan bertahap dengan tali pengaman tanpa merusak atap rumah." }
        ]
      };
    }
    if (sSlug.includes('sedot-wc')) {
      return {
        name: `Jasa Sedot WC & Saluran Mampet Mandiri Surade`,
        desc: `Layanan kuras septic tank / sedot WC penuh menggunakan mobil tangki vakum bertenaga dan pelancaran pipa saluran air mampet tanpa bongkar di Surade.`,
        price_category: "Sedang",
        logo: IMG.laundry_kiloan,
        banner: IMG.laundry_kiloan,
        products: [
          { name: "Sedot Septic Tank WC Mobil Tangki Vakum Komplit", price: 450000, desc: "Penyedotan kotoran septic tank tuntas menggunakan mesin kompresor vakum." },
          { name: "Pelancaran Pipa WC Mampet Tanpa Bongkar Lantai", price: 200000, desc: "Pembersihan sumbatan lemak dan kotoran pipa pembuangan lancar kembali." }
        ]
      };
    }
    if (sSlug.includes('satpam') || sSlug.includes('security')) {
      return {
        name: `Penyedia Jasa Satpam & Pengamanan Acara Surade`,
        desc: `Penyedia tenaga satuan pengamanan (Satpam) bersertifikat Gada Pratama untuk penjagaan kantor, toko, perbankan, dan pengamanan event pernikahan di Surade.`,
        price_category: "Sedang",
        logo: IMG.komunitas_pemuda,
        banner: IMG.komunitas_pemuda,
        products: [
          { name: "Jasa Pengamanan Event / Resepsi Hajatan Pernikahan (per Shift)", price: 200000, desc: "Penjagaan ketertiban lokasi, penataan parkir tamu, dan pengawalan VIP." },
          { name: "Penempatan Satpam Kantor / Toko 24 Jam Berlisensi Resmi", price: 2000000, desc: "Petugas satpam berdisiplin tinggi, cekatan dan terlatih tanggap darurat." }
        ]
      };
    }
    if (sSlug.includes('sewa-kamera') || sSlug.includes('sewa-hp') || sSlug.includes('sewa-drone')) {
      return {
        name: `Sewa Kamera DSLR, Mirrorless & Drone Surade`,
        desc: `Persewaan kamera Canon DSLR, Sony Mirrorless, GoPro Action Cam, lensa fix/tele, dan drone DJI 4K syarat mudah KTP di Kecamatan Surade.`,
        price_category: "Terjangkau",
        logo: IMG.drone_pilot,
        banner: IMG.wedding_photo,
        products: [
          { name: "Sewa Kamera Sony Mirrorless / Canon DSLR 24 Jam", price: 120000, desc: "Termasuk lensa kit, baterai cadangan, memory card 64GB dan tas kamera." },
          { name: "Sewa Drone DJI 4K + 2 Baterai Cadangan 24 Jam", price: 350000, desc: "Drone siap terbang rekam video pemandangan alam jernih 4K." }
        ]
      };
    }
    if (sSlug.includes('tukang-bangunan') || (sSlug.includes('bangunan') && !sSlug.includes('satpam'))) {
      return {
        name: `Tukang Bangunan & Renovasi Rumah Amanah Surade`,
        desc: `Jasa tukang bangunan harian dan borongan terampil di Surade: pasang bata hebel, plester aci rapi, pasang keramik lantai, dak beton, dan cat dinding.`,
        price_category: "Sedang",
        logo: IMG.arsitek_properti,
        banner: IMG.arsitek_properti,
        products: [
          { name: "Jasa Tukang Bangunan Harian Terampil & Berpengalaman", price: 130000, desc: "Pengerjaan rapi, teliti, tepat waktu untuk renovasi rumah dan toko." },
          { name: "Jasa Borongan Pasang Keramik Lantai & Dinding (per m2)", price: 45000, desc: "Pemasangan keramik presisi rata menggunakan alat perata tile levelling." }
        ]
      };
    }
    if (sSlug.includes('kayu') || sSlug.includes('mebel')) {
      return {
        name: `Mebel & Pengrajin Kayu Jati Mandiri Surade`,
        desc: `Pengrajin kayu jati dan mahoni di Desa Buniwangi Surade: pembuatan kusen pintu jendela, lemari pakaian, tempat tidur minimalis, meja makan, dan kitchen set.`,
        price_category: "Sedang",
        logo: IMG.bamboo_craft,
        banner: IMG.bamboo_craft,
        products: [
          { name: "Pembuatan Pintu & Kusen Kayu Jati Pilihan Presisi", price: 650000, desc: "Kayu kering oven anti muai susut dengan ukiran minimalis elegan." },
          { name: "Lemari Pakaian Kayu 3 Pintu Custom Finishing Melamik", price: 1850000, desc: "Lemari kokoh tahan rayap puluhan tahun dengan cermin besar." }
        ]
      };
    }
    if (sSlug.includes('ledeng')) {
      return {
        name: `Ahli Tukang Ledeng & Saluran Pipa Air Surade`,
        desc: `Layanan perbaikan pipa air bocor, kran patah, instalasi toren air, pasang water heater gas, dan perbaikan pompa dorong otomatis di Kecamatan Surade.`,
        price_category: "Terjangkau",
        logo: IMG.tukang_ledeng,
        banner: IMG.tukang_ledeng,
        products: [
          { name: "Perbaikan Kran Pipa Bocor & Sambungan Pipa Baru", price: 50000, desc: "Penanganan cepat kebocoran pipa PVC / PPR anti bocor bergaransi." },
          { name: "Instalasi Jalur Pipa Air Bersih Rumah Baru Komplit", price: 150000, desc: "Penataan jalur pipa efisien tekanan air merata ke seluruh kran kamar mandi." }
        ]
      };
    }
    if (sSlug.includes('listrik') || sSlug.includes('mcb')) {
      return {
        name: `Biro Instalatur & Servis Listrik MCB Surade`,
        desc: `Jasa perbaikan korsleting listrik jeglek, tambah titik stopkontak, pasang lampu gantung LED, ganti MCB box, dan instalasi listrik rumah baru di Surade.`,
        price_category: "Terjangkau",
        logo: IMG.teknisi_listrik,
        banner: IMG.teknisi_listrik,
        products: [
          { name: "Jasa Perbaikan Korsleting Listrik & Ganti MCB Rusak", price: 75000, desc: "Pengecekan jalur kabel menggunakan multitester aman dari bahaya korslet." },
          { name: "Pemasangan Titik Lampu & Saklar Baru Rapi Tertanam", price: 35000, desc: "Instalasi kabel standar SNI terbungkus pipa pelindung conduit." }
        ]
      };
    }
    if (sSlug.includes('wedding-organizer')) {
      return {
        name: `Surade Wedding Organizer & Paket Pernikahan`,
        desc: `Jasa perencana dan koordinator acara pernikahan (WO) lengkap di Surade: susunan rundown acara, pendampingan pengantin, koordinasi vendor tenda/katering, dan kru WO hari-H.`,
        price_category: "Sedang",
        logo: IMG.organizer_tenda,
        banner: IMG.wedding_photo,
        products: [
          { name: "Paket Pernikahan All-In Gedung / Rumah Lengkap", price: 15000000, desc: "Termasuk tenda dekorasi, rias pengantin, catering, dokumentasi foto/video." },
          { name: "Jasa Koordinator Hari-H Resepsi Pernikahan (6 Kru)", price: 2500000, desc: "Memastikan seluruh susunan acara berjalan lancar khidmat dan tepat waktu." }
        ]
      };
    }
    if (sSlug.includes('ac')) {
      return {
        name: `Surade Servis AC - Cuci & Isi Freon R32/R410`,
        desc: `Servis AC rumah dan kantor panggilan cepat di Surade: cuci evaporator indoor/outdoor, tambah/isi freon R32 & R410A, ganti kapasitor, dan bongkar pasang AC split.`,
        price_category: "Terjangkau",
        logo: IMG.servis_ac,
        banner: IMG.servis_ac,
        products: [
          { name: "Jasa Cuci AC Split Bersih Maksimal Anti Bocor Air", price: 75000, desc: "Pembersihan lumut dan debu blower indoor hembusan angin kembali kencang." },
          { name: "Isi Ulang Freon AC R32 / R410A Dingin Beku", price: 150000, desc: "Tekanan standar sesuai spesifikasi pabrik AC dingin optimal dan hemat listrik." }
        ]
      };
    }
    if (sSlug.includes('dinamo') || sSlug.includes('genset')) {
      return {
        name: `Bengkel Servis Dinamo & Mesin Genset Diesel Surade`,
        desc: `Spesialis gulung dinamo motor listrik, servis dinamo starter & alternator mobil, perbaikan mesin genset diesel/bensin macet, dan mesin penggerak gilingan di Surade.`,
        price_category: "Sedang",
        logo: IMG.bengkel_las,
        banner: IMG.bengkel_las,
        products: [
          { name: "Gulung Kawat Tembaga Dinamo Pompa Air & Motor Listrik", price: 150000, desc: "Kawat tembaga murni anti panas putaran mesin bertenaga kembali." },
          { name: "Tune Up & Servis Karburator / Injeksi Mesin Genset", price: 175000, desc: "Pembersihan jalur bahan bakar genset siap pakai saat mati lampu." }
        ]
      };
    }
    if (sSlug.includes('kulkas') || sSlug.includes('microwave') || sSlug.includes('oven')) {
      return {
        name: `Bengkel Servis Kulkas, Freezer & Microwave Surade`,
        desc: `Servis kulkas 1 & 2 pintu, freezer box daging/ikan, showcase minuman, dan microwave oven mati total di Surade. Ganti kompresor, isi freon R134a, dan ganti relay defrost.`,
        price_category: "Terjangkau",
        logo: IMG.bengkel_las,
        banner: IMG.bengkel_las,
        products: [
          { name: "Servis Kulkas Tidak Dingin / Freon Habis & Bocor", price: 180000, desc: "Pengelasan kebocoran pipa evaporator dan pengisian freon R134a beku." },
          { name: "Perbaikan Microwave / Oven Pemanas Mati Total", price: 90000, desc: "Penggantian fuse sekering dan magnetron pemanas makanan kembali panas." }
        ]
      };
    }
    if (sSlug.includes('mesin-cuci') || sSlug.includes('dispenser') || sSlug.includes('magic-com')) {
      return {
        name: `Servis Mesin Cuci, Dispenser & Magic Com Surade`,
        desc: `Servis panggilan mesin cuci otomatis front/top loading, pengering tidak berputar, dispenser tidak panas/dingin, dan magic com nasi basi di Surade.`,
        price_category: "Terjangkau",
        logo: IMG.bengkel_las,
        banner: IMG.bengkel_las,
        products: [
          { name: "Servis Mesin Cuci Putaran Lemah / Air Pembuangan Macet", price: 120000, desc: "Ganti v-belt, gearbox atau perbaikan modul timer mesin cuci." },
          { name: "Ganti Elemen Pemanas & Termostat Dispenser / Magic Com", price: 65000, desc: "Air dispenser kembali mendidih panas dan magic com nasi tidak cepat basi." }
        ]
      };
    }
    if (sSlug.includes('kipas') || sSlug.includes('tv') || sSlug.includes('elektronik')) {
      return {
        name: `Servis TV LED & Kipas Angin Elektronik Surade`,
        desc: `Pusat reparasi TV LED suara ada gambar gelap, TV mati total kena petir, servis kipas angin dinding/berdiri macet, dan amplifier audio di Jl. Pasar Baru Surade.`,
        price_category: "Terjangkau",
        logo: IMG.laptop_pc,
        banner: IMG.servis_hp,
        products: [
          { name: "Ganti Lampu Backlight TV LED Layar Gelap Suara Normal", price: 175000, desc: "Lampu LED strip baru terang awet gambar kembali cerah jernih." },
          { name: "Servis Dinamo Kipas Angin Berdengung / Putaran Macet", price: 40000, desc: "Penggantian bushing laher as dan kapasitor putaran kembali kencang." }
        ]
      };
    }
    if (sSlug.includes('kompor')) {
      return {
        name: `Servis Kompor Gas & Water Heater Panggilan Surade`,
        desc: `Layanan servis kompor gas Rinnai/Quantum api merah berjelaga, pemantik macet, kompor tanam, dan perbaikan water heater gas pemanas air kamar mandi di Surade.`,
        price_category: "Terjangkau",
        logo: IMG.perabot_dapur,
        banner: IMG.perabot_dapur,
        products: [
          { name: "Servis Kompor Gas Api Merah & Pembersihan Spuyer", price: 45000, desc: "Api kembali biru bersih hemat gas dan panci tidak lagi gosong berjelaga." },
          { name: "Perbaikan Water Heater Gas Pemanas Air Mandi", price: 95000, desc: "Pembersihan jarum pemantik dan sensor otomatis air panas kembali normal." }
        ]
      };
    }
    if (sSlug.includes('chainsaw') || sSlug.includes('steam')) {
      return {
        name: `Servis Mesin Chainsaw & Mesin Steam Cuci Surade`,
        desc: `Servis mesin gergaji kayu chainsaw sensow, mesin potong rumput 2 tak, dan mesin steam cuci motor mobil jet cleaner tekanan tinggi di Surade.`,
        price_category: "Terjangkau",
        logo: IMG.bengkel_las,
        banner: IMG.bengkel_las,
        products: [
          { name: "Servis Karburator Chainsaw & Ganti Busi Mesin", price: 60000, desc: "Penyetelan spuyer bahan bakar mesin mudah dihidupkan dan tarikan bertenaga." },
          { name: "Servis Mesin Steam Jet Cleaner Tekanan Rendah / Bocor", price: 85000, desc: "Ganti seal piston dan pembersihan katup semprotan kembali kencang." }
        ]
      };
    }
    if (sSlug.includes('pompa')) {
      return {
        name: `Servis Pompa Air & Pasang Otomatis Surade`,
        desc: `Servis pompa air Shimizu/Wasser debit air kecil, mesin berdengung, ganti seal mekanikal anti bocor, dan pasang otomatis pressure radar tandon air di Surade.`,
        price_category: "Terjangkau",
        logo: IMG.bengkel_las,
        banner: IMG.bengkel_las,
        products: [
          { name: "Ganti Seal Pompa Air Bocor & Kipas Impeller Kuningan", price: 85000, desc: "Daya hisap dan dorong pompa air kembali kencang dan tidak berisik." },
          { name: "Pemasangan Otomatis Pressure Switch Radar Toren", price: 65000, desc: "Pompa menyala dan mati otomatis sesuai kran dan kapasitas toren air." }
        ]
      };
    }
    if (sSlug.includes('sound-system') || sSlug.includes('speaker')) {
      return {
        name: `Servis Speaker Aktif & Power Amplifier Surade`,
        desc: `Reparasi power amplifier rakitan/built up, mixer audio hajatan, speaker aktif bluetooth suara serak/dengung, dan mic wireless di Surade.`,
        price_category: "Terjangkau",
        logo: IMG.sound_system,
        banner: IMG.sound_system,
        products: [
          { name: "Ganti Transistor Final Power Amplifier & Elco Suara Jernih", price: 125000, desc: "Komponen audio original suara bass mantap dan tidak mudah jebol." },
          { name: "Servis Speaker Aktif Bluetooth Suara Dengung / Mati", price: 85000, desc: "Perbaikan modul power supply dan tone control suara kembali normal." }
        ]
      };
    }
    if (sSlug.includes('tambal-ban')) {
      return {
        name: `Tambal Ban Tubeless & Press Velg 24 Jam Surade`,
        desc: `Layanan tambal ban tubeless metode press tiptop tahan seumur ban, isi angin nitrogen murni, press velg motor peyang, dan ganti pentil ban di Jl. Raya Surade.`,
        price_category: "Terjangkau",
        logo: IMG.bengkel_motor,
        banner: IMG.bengkel_motor,
        products: [
          { name: "Tambal Ban Tubeless Tiptop Payung Anti Bocor Ulang", price: 15000, desc: "Tambal dari dalam velg aman tidak merusak serat kawat ban tubeless." },
          { name: "Press Velg Motor Racing Penyok / Oleng Presisi", price: 60000, desc: "Mengembalikan bentuk lingkaran velg presisi stabil di kecepatan tinggi." }
        ]
      };
    }
    if (sSlug.includes('salon') || sSlug.includes('barber')) {
      return {
        name: `Gentleman Barbershop & Salon Surade`,
        desc: `Pusat pangkas rambut pria dan perawatan rambut modern di Jl. Kaum Surade: potong rambut fade/undercut/two block, cuci rambut, hair styling pomade, dan pijat kepala rileks.`,
        price_category: "Terjangkau",
        logo: IMG.barbershop,
        banner: IMG.salon_spa,
        products: [
          { name: "Paket Gentleman Cut + Cuci Rambut + Pijat + Pomade", price: 30000, desc: "Potongan rambut trendi sesuai bentuk wajah disempurnakan hair styling wangi." },
          { name: "Hair Coloring Cat Rambut Pria Trendy (Ash Grey)", price: 85000, desc: "Pewarnaan rambut merata dengan formula vitamin tidak merusak rambut." }
        ]
      };
    }
    if (sSlug.includes('asisten') || sSlug.includes('pengasuh')) {
      return {
        name: `Pusat Penyalur Tenaga Kerja & ART Amanah Surade`,
        desc: `Lembaga resmi penyalur tenaga kerja asisten rumah tangga (ART), baby sitter balita, dan pendamping lansia di Desa Buniwangi Surade.`,
        price_category: "Sedang",
        logo: IMG.art_nanny,
        banner: IMG.cleaning_service,
        products: [
          { name: "Jasa Penempatan ART Terlatih Harian / Bulanan", price: 1500000, desc: "Tenaga kerja terampil mengurus rumah, mencuci, dan memasak masakan keluarga." },
          { name: "Layanan Baby Sitter & Nanny Pengasuh Balita", price: 1800000, desc: "Pengasuh anak sabar, telaten, memahami nutrisi dan kebersihan balita." }
        ]
      };
    }
    if (sSlug.includes('hukum') || sSlug.includes('notaris') || sSlug.includes('izin')) {
      return {
        name: sSlug.includes('notaris') ? `Kantor Notaris & PPAT Dedi Supriadi, S.H. Surade` : `Kantor Advokat & Bantuan Hukum Jampang Raya`,
        desc: `Konsultasi hukum perdata/pidana, sengketa tanah waris, akta notaris/PPAT, pendirian CV/PT, dan izin usaha NIB OSS di Jl. Raya Surade.`,
        price_category: "Sedang",
        logo: IMG.law_office,
        banner: IMG.law_office,
        products: [
          { name: "Konsultasi Hukum & Analisis Legalitas Sengketa Tanah", price: 250000, desc: "Pemeriksaan dokumen hak kepemilikan tanah dan telaah solusi hukum komprehensif." },
          { name: "Paket Pendirian Usaha CV/PT + NIB OSS Lengkap", price: 2500000, desc: "Termasuk SK Kemenkumham, NPWP Badan, dan izin berusaha OSS." }
        ]
      };
    }
    if (sSlug.includes('bubut') || sSlug.includes('las')) {
      return {
        name: sSlug.includes('bubut') ? `Bengkel Bubut Presisi Logam Mandiri Surade` : `Bengkel Las Berkah Stainless Steel Surade`,
        desc: `Bengkel las listrik dan bubut logam presisi di Surade: pagar minimalis, kanopi alderon, teralis jendela, bubut drat as perahu nelayan, dan korter silinder.`,
        price_category: "Sedang",
        logo: IMG.bengkel_las,
        banner: IMG.bengkel_las,
        products: [
          { name: "Pagar Besi Minimalis Galvanis Anti Karat (per m2)", price: 380000, desc: "Pagar kokoh besi hollow galvanis finishing cat semprot duco rapi." },
          { name: "Kanopi Baja Ringan Atap Spandek / Alderon (per m2)", price: 260000, desc: "Rangka double kokoh tahan angin kencang anti bocor bergaransi." }
        ]
      };
    }
    if (sSlug.includes('laundry')) {
      return {
        name: `Fresh Clean Laundry Kiloan Surade`,
        desc: `Jasa cuci pakaian kiloan bersih wangi di Jl. Kaum Surade: cuci bed cover, selimut tebal, karpet, jas pesta dengan setrika uap cepat dan deterjen higienis.`,
        price_category: "Terjangkau",
        logo: IMG.laundry_kiloan,
        banner: IMG.laundry_kiloan,
        products: [
          { name: "Cuci Komplit Bersih Wangi + Setrika Uap (per Kg)", price: 7000, desc: "Pakaian dicuci 1 mesin 1 pelanggan, higienis dan wangi tahan lama." },
          { name: "Cuci Bed Cover Jumbo / Karpet Higienis (per Pcs)", price: 35000, desc: "Pembersihan mendalam kotoran tungau debu dengan pengeringan tuntas." }
        ]
      };
    }
    if (sSlug.includes('kunci')) {
      return {
        name: `Ahli Duplikat Kunci & Smartkey Mobil Surade`,
        desc: `Jasa duplikat kunci di Jl. Pasar Baru Surade: kunci motor, mobil immobilizer, kunci gembok, brankas macet, dan panggilan darurat 24 jam.`,
        price_category: "Terjangkau",
        logo: IMG.duplikat_kunci,
        banner: IMG.duplikat_kunci,
        products: [
          { name: "Duplikat Kunci Motor / Pintu Rumah Presisi", price: 20000, desc: "Mesin potong otomatis cepat selesai dalam 3 menit presisi tidak macet." },
          { name: "Program Chip Kunci Mobil Smartkey / Remote", price: 250000, desc: "Setting chip immobilizer mobil semua merk bergaransi connect lancar." }
        ]
      };
    }
  }

  // 6. FASHION
  if (cSlug === 'fashion') {
    if (sSlug.includes('barber') || sSlug.includes('pangkas')) {
      return {
        name: `Gentleman Barbershop Surade`,
        desc: `Pangkas rambut pria modern di Jl. Kaum Surade: potong rambut fade/undercut/two block, cuci rambut, hair styling pomade, dan pijat kepala rileks.`,
        price_category: "Terjangkau",
        logo: IMG.barbershop,
        banner: IMG.salon_spa,
        products: [
          { name: "Paket Gentleman Cut + Cuci Rambut + Pijat + Pomade", price: 30000, desc: "Potongan rambut trendi sesuai bentuk wajah disempurnakan hair styling wangi." },
          { name: "Hair Coloring Cat Rambut Pria Trendy (Ash Grey)", price: 85000, desc: "Pewarnaan rambut merata dengan formula vitamin tidak merusak rambut." }
        ]
      };
    }
    if (sSlug.includes('salon') || sSlug.includes('april') || sSlug.includes('zahra')) {
      return {
        name: `April Salon & Zahra Beauty Care Surade`,
        desc: `Salon kecantikan wanita ternama di Jl. Raya Surade No. 67. Menyediakan perawatan smoothing keratin, facial glowing, creambath, make up wisuda, dan rias pengantin Sunda Siger.`,
        price_category: "Sedang",
        logo: IMG.salon_spa,
        banner: IMG.barbershop,
        products: [
          { name: "Paket Rias Make Up Wisuda / Lamaran Flawless Tahan Lama", price: 200000, desc: "Rias wajah glowing rapi dengan kosmetik premium aman di kulit." },
          { name: "Perawatan Smoothing Keratin Rambut Lembut Lurus Alami", price: 250000, desc: "Membuat rambut lembut berkilau mudah diatur dan bebas kusut." }
        ]
      };
    }
    if (sSlug.includes('cuci-sepatu')) {
      return {
        name: `Shoe Clean & Laundry Sepatu Surade`,
        desc: `Jasa cuci sepatu premium di Jl. Lodaya Surade: deep clean sneakers, sepatu kulit, unyellowing sol karet, dan repaint warna sepatu pudar.`,
        price_category: "Terjangkau",
        logo: IMG.cuci_sepatu,
        banner: IMG.cuci_sepatu,
        products: [
          { name: "Deep Clean Cuci Bersih Sepatu Luar Dalam + Anti Bakteri", price: 30000, desc: "Pembersihan menyeluruh noda midsole, upper, insole, dan wangi segar bebas bau." },
          { name: "Treatment Unyellowing Sol Kuning Kembali Putih Bersih", price: 40000, desc: "Menghilangkan efek oksidasi kuning pada sol karet sepatu sneakers." }
        ]
      };
    }
    return {
      name: `Penjahit Jas & Kebaya Pengantin Lestari Surade`,
      desc: `Jasa jahit pakaian pria dan wanita berkelas di Desa Pasiripis Surade: jas formal, kebaya pesta brokat, seragam dinas PNS/sekolah, gamis pesta, dan celana bahan.`,
      price_category: "Sedang",
      logo: IMG.jahit_konveksi,
      banner: IMG.butik_baju,
      products: [
        { name: "Jasa Jahit Kebaya Modern / Gamis Pesta Brokat Presisi", price: 150000, desc: "Pengerjaan halus jahitan butik pas di badan dan nyaman dikenakan." },
        { name: "Jasa Jahit Celana Formal Pria / Kemeja Seragam Kantor", price: 85000, desc: "Potongan pola rapi dengan jahitan kuat dan kancing kokoh." }
      ]
    };
  }

  // 7. ELEKTRONIK
  if (cSlug === 'elektronik') {
    if (sSlug.includes('cctv')) {
      return {
        name: `Surade CCTV & Smart Security System`,
        desc: `Pusat pemasangan kamera CCTV online pantau HP 24 jam di Jl. Raya Surade. Melayani paket CCTV rumah, toko, gudang, DVR/NVR, dan smart IP camera WiFi 360 derajat.`,
        price_category: "Sedang",
        logo: IMG.cctv,
        banner: IMG.wifi_net,
        products: [
          { name: "Paket Pasang CCTV 4 Kamera Full HD 1080p Online HP", price: 1850000, desc: "Termasuk DVR 4ch, harddisk 1TB, 4 kamera infrared night vision & instalasi rapi." },
          { name: "Smart IP Camera WiFi 360 Derajat Audio 2 Arah", price: 295000, desc: "Kamera pengawas pintar WiFi putar 360 dan bicara dua arah dari aplikasi HP." }
        ]
      };
    }
    if (sSlug.includes('wifi') || sSlug.includes('jaringan')) {
      return {
        name: `Surade Net - Pasang WiFi & Fiber Optik`,
        desc: `Jasa pasang internet WiFi rumah murah, jaringan RT/RW net, setting router mikrotik, dan penarikan kabel fiber optik di wilayah Desa Pasiripis & Surade.`,
        price_category: "Terjangkau",
        logo: IMG.wifi_net,
        banner: IMG.cctv,
        products: [
          { name: "Jasa Pasang & Setting Router WiFi Dual Band Gigabit", price: 150000, desc: "Konfigurasi bandwidth manajemen mikrotik dan coverage sinyal merata." },
          { name: "Router Wireless High Power 300Mbps Extended Range", price: 245000, desc: "Router penguat sinyal WiFi dengan 4 antena eksternal jangkauan luas." }
        ]
      };
    }
    if (sSlug.includes('hp')) {
      return {
        name: `Surade Cell & Servis HP Ganti LCD`,
        desc: `Pusat servis HP Android & iPhone di Jl. Raya Surade No. 71: spesialis ganti layar LCD touchscreen, perbaikan IC sinyal/charging, ganti baterai tanam, dan flash software.`,
        price_category: "Terjangkau",
        logo: IMG.servis_hp,
        banner: IMG.laptop_pc,
        products: [
          { name: "Ganti Layar LCD HP Original + Pasang Bergaransi", price: 195000, desc: "Layar bening responsif sentuhan normal dengan garansi fungsional 1 bulan." },
          { name: "Ganti Baterai Original High Capacity Double Power", price: 120000, desc: "Baterai awet tahan seharian proteksi overcharge aman tidak kembung." }
        ]
      };
    }
    if (sSlug.includes('laptop') || sSlug.includes('komputer') || sSlug.includes('printer')) {
      return {
        name: `Jampang Computer - Toko & Servis Laptop Surade`,
        desc: `Pusat servis laptop dan komputer di Jl. Lodaya Surade: instal ulang Windows, upgrade SSD NVMe super cepat, servis printer infus tinta, dan penjualan aksesoris PC/laptop.`,
        price_category: "Sedang",
        logo: IMG.laptop_pc,
        banner: IMG.servis_hp,
        products: [
          { name: "Upgrade SSD NVMe 256GB + Instal Windows & Office", price: 375000, desc: "Bikin laptop lama booting 5 detik anti lemot lengkap garansi 3 tahun." },
          { name: "Servis Head Printer & Pasang Tabung Infus Tinta", price: 135000, desc: "Mengatasi cetakan bergaris dan hemat biaya cetak dokumen." }
        ]
      };
    }
    return {
      name: `Toko Elektronik Rumah Tangga Sinar Mandiri Surade`,
      desc: `Pusat penjualan TV LED digital, kulkas 1 & 2 pintu, mesin cuci otomatis, kipas angin, magic com, blender, dan kelistrikan rumah tangga di Jl. Pasar Baru Surade.`,
      price_category: "Sedang",
      logo: IMG.laptop_pc,
      banner: IMG.cctv,
      products: [
        { name: "Smart TV Digital LED 32 Inch Full HD Garansi Resmi", price: 1650000, desc: "Bisa YouTube, Netflix, siaran digital jernih tanpa set top box." },
        { name: "Mesin Cuci 2 Tabung Kapasitas 8 Kg Hemat Listrik", price: 1450000, desc: "Pencucian kuat anti kusut dengan body fiber anti karat." }
      ]
    };
  }

  // 8. WISATA
  if (cSlug === 'hiburan' || cSlug === 'wisata') {
    if (sSlug.includes('cikaso')) {
      return {
        name: `Wisata Air Terjun Curug Cikaso Surade`,
        desc: `Destinasi air terjun spektakuler dengan tiga aliran megah berdampingan telaga air toska di Desa Ciniti / Jagamukti Surade. Menawarkan susur perahu sungai Cikaso, spot foto alam, dan pemandu lokal.`,
        price_category: "Terjangkau",
        logo: IMG.curug_cikaso,
        banner: IMG.curug_cikaso,
        products: [
          { name: "Tiket Masuk Curug Cikaso + Susur Perahu Sungai (PP)", price: 25000, desc: "Menikmati pemandangan asri aliran sungai Cikaso dan akses langsung air terjun." },
          { name: "Paket Wisata Fotografi & Pemandu Lokal Curug Cikaso", price: 100000, desc: "Didampingi pemandu lokal ke spot foto terbaik, aman dan bersejarah." }
        ]
      };
    }
    if (sSlug.includes('pantai') || sSlug.includes('minajaya')) {
      return {
        name: `Wisata Pantai Minajaya & Muara Karang Surade`,
        desc: `Pesona pantai berkarang datar dengan hamparan rumput laut alami, pemandangan sunset mempesona, pelelangan ikan segar nelayan, dan area camping ground di Desa Kademangan Surade.`,
        price_category: "Terjangkau",
        logo: IMG.pantai_minajaya,
        banner: IMG.pantai_minajaya,
        products: [
          { name: "Tiket Masuk Kawasan Wisata Pantai Minajaya (per Orang)", price: 10000, desc: "Akses ke seluruh area pantai karang, spot foto muara, dan gazebo umum." },
          { name: "Sewa Paket Tenda Dome Camping Pantai Kapasitas 4 Orang", price: 80000, desc: "Tenda dome double layer anti angin lengkap matras untuk menginap di pantai." }
        ]
      };
    }
    return {
      name: `Destinasi & Wisata Alam ${sName} Surade`,
      desc: `Daya tarik wisata alam dan rekreasi keluarga di ${villageName}, Surade dengan panorama alam asri, kebersihan terjaga, dan pengalaman liburan menyenangkan.`,
      price_category: "Terjangkau",
      logo: IMG.pantai_minajaya,
      banner: IMG.curug_cikaso,
      products: [
        { name: `Tiket Masuk Kawasan Wisata ${sName}`, price: 15000, desc: "Akses wisata ramah keluarga dengan pemandangan alam terbuka yang sejuk." },
        { name: "Paket Pemandu Wisata Lokal Ramah Berpengalaman", price: 75000, desc: "Pemanduan rute aman dengan penjelasan sejarah dan potensi alam daerah." }
      ]
    };
  }

  // 9. PERTANIAN & TERNAK
  if (cSlug === 'pertanian') {
    if (sSlug.includes('gula')) {
      return {
        name: `Sentra Pengrajin Gula Kelapa Aren Kadaleman`,
        desc: `Produsen gula kelapa merah cetak batok dan gula semut aren murni sadapan nira alami petani di Desa Kadaleman Surade. Manis alami wangi legit tanpa bahan kimia/pengawet.`,
        price_category: "Terjangkau",
        logo: IMG.gula_kelapa,
        banner: IMG.gula_kelapa,
        products: [
          { name: "Gula Merah Kelapa Batok Murni Jampang (per Kg)", price: 22000, desc: "Gula merah kelapa asli warna cokelat kemerahan harum legit untuk masakan." },
          { name: "Gula Semut Aren Bubuk Organik (Pouch 500g)", price: 18000, desc: "Gula kelapa kristal kering higienis untuk pemanis teh dan kopi sehat." }
        ]
      };
    }
    if (sSlug.includes('madu')) {
      return {
        name: `Madu Murni Hutan Odeng Rimba Sukabumi Selatan`,
        desc: `Madu hutan alami dari sarang lebah liar Apis dorsata rimba Sukabumi Selatan. Raw honey murni tanpa proses pemanasan atau campuran gula di wilayah Surade.`,
        price_category: "Sedang",
        logo: IMG.madu_hutan,
        banner: IMG.madu_hutan,
        products: [
          { name: "Madu Hutan Liar Odeng Murni Botol 500ml", price: 85000, desc: "Madu murni kaya enzim alami dan bee pollen berkhasiat memulihkan stamina." },
          { name: "Sarang Madu Alami Fresh Comb (Kotak 250g)", price: 65000, desc: "Sarang lebah madu asli langsung gigit rasa manis lumer bernutrisi tinggi." }
        ]
      };
    }
    return {
      name: `Toko Sarana Pertanian & Pupuk Mandiri Surade`,
      desc: `Benih padi unggul Inpari/Ciherang, bibit buah okulasi, pupuk NPK Mutiara, obat semprot hama tanaman, pakan ayam petelur, dan pelet ikan apung di ${villageName}, Surade.`,
      price_category: "Terjangkau",
      logo: IMG.tani_pupuk,
      banner: IMG.tani_pupuk,
      products: [
        { name: "Pupuk NPK Mutiara 16-16-16 Kemasan Repack 1 Kg", price: 18000, desc: "Pupuk seimbang penyubur pertumbuhan daun, batang dan pembuahan tanaman." },
        { name: "Pakan Pelet Ikan Lele / Nila Apung Protein 30% (Sak 30 Kg)", price: 345000, desc: "Pakan apung memacu pertumbuhan cepat ikan air tawar di kolam." }
      ]
    };
  }

  // 10. KEUANGAN, LOGISTIK, MULTIMEDIA, MUSIK, OLAHRAGA, PENDIDIKAN, PROPERTI, KOMUNITAS
  if (cSlug === 'keuangan') {
    if (sSlug.includes('gadai')) {
      return {
        name: `Pusat Gadai Indonesia Cabang Surade`,
        desc: `Layanan gadai elektronik HP, laptop, kamera, TV, dan emas cepat berizin resmi di Jl. Raya Surade No. 62. Proses 5 menit langsung cair bunga ringan dan barang aman tersimpan.`,
        price_category: "Terjangkau",
        logo: IMG.bank_brilink,
        banner: IMG.bank_brilink,
        products: [
          { name: "Layanan Gadai HP Android / iPhone & Laptop Langsung Cair", price: 500000, desc: "Penaksiran harga tinggi, syarat KTP, dana langsung cair ke rekening atau tunai." },
          { name: "Layanan Gadai Emas Perhiasan / Logam Mulia Antam", price: 1000000, desc: "Titip gadai perhiasan emas aman dalam brankas berstandar asuransi." }
        ]
      };
    }
    return {
      name: `Agen BRILink Resmi Mitra Mandiri Surade`,
      desc: `Layanan perbankan tarik tunai semua kartu ATM, transfer antar bank 24 jam, bayar tagihan PLN/PDAM/BPJS, setor simpanan di Jl. Pasar Baru Surade.`,
      price_category: "Terjangkau",
      logo: IMG.bank_brilink,
      banner: IMG.bank_brilink,
      products: [
        { name: "Biaya Layanan Transfer Antar Bank Semua Rekening Cepat", price: 5000, desc: "Proses transfer realtime online dalam hitungan detik dengan struk resmi." },
        { name: "Layanan Tarik Tunai Kartu ATM Semua Bank Tanpa Antre", price: 5000, desc: "Tarik tunai praktis dengan mesin EDC resmi berizin Bank Indonesia." }
      ]
    };
  }

  if (cSlug === 'logistik') {
    return {
      name: idx % 2 === 0 ? `J&T Express Drop Point Surade` : `JNE Express Agen Surade`,
      desc: `Layanan pengiriman paket kilat ke seluruh Indonesia di Jl. Raya Surade: COD bayar di tempat, jemput paket gratis (free pick up), kirim dokumen kilat, dan ekspedisi kargo barang besar.`,
      price_category: "Terjangkau",
      logo: IMG.ekspedisi_logistik,
      banner: IMG.ekspedisi_logistik,
      products: [
        { name: "Ongkos Kirim Paket Kilat Reguler Surade - Jabodetabek (per Kg)", price: 12000, desc: "Estimasi sampai 1-2 hari kerja dengan nomor resi online realtime." },
        { name: "Layanan Jemput Paket Gratis (Free Pick Up) Seller UMKM", price: 0, desc: "Kurir siap jemput paket langsung ke lokasi tanpa biaya tambahan." }
      ]
    };
  }

  if (cSlug === 'multimedia') {
    return {
      name: `Surade Visual Studio - Foto & Video Wedding`,
      desc: `Studio foto prewedding outdoor pantai/curug, video cinematic wedding, cetak album magnetic eksklusif, dan pilot drone pemetaan di Jl. Raya Surade.`,
      price_category: "Sedang",
      logo: IMG.wedding_photo,
      banner: IMG.drone_pilot,
      products: [
        { name: "Paket Foto & Video Akad Nikah + Resepsi Lengkap Album", price: 2500000, desc: "2 fotografer, 1 videografer, 1 album kolase 20 halaman, flashdisk master." },
        { name: "Sewa Drone 4K + Pilot Profesional (Half Day / 4 Jam)", price: 750000, desc: "Pengambilan aerial footage 4K tajam dengan drone DJI untuk event & pemetaan." }
      ]
    };
  }

  if (cSlug === 'musik') {
    return {
      name: `Surade Pro Sound System & Panggung Hiburan`,
      desc: `Persewaan sound system line array berkekuatan 5.000 - 20.000 watt, tata lampu panggung moving head, genset diesel hening, dan mic wireless hajatan di Surade.`,
      price_category: "Sedang",
      logo: IMG.sound_system,
      banner: IMG.sound_system,
      products: [
        { name: "Paket Sewa Sound System Resepsi Hajatan 5.000 Watt Komplit", price: 1200000, desc: "Termasuk 4 speaker aktif, mixer audio digital, mic wireless, dan operator profesional." },
        { name: "Paket Lighting Panggung Par LED + Beam Moving Head", price: 800000, desc: "Pencahayaan panggung meriah warna-warni untuk resepsi malam dan pentas seni." }
      ]
    };
  }

  if (cSlug === 'olahraga') {
    if (sSlug.includes('futsal') || sSlug.includes('badminton')) {
      return {
        name: `Surade Sport Center - Lapangan Futsal & Badminton`,
        desc: `Pusat olahraga modern di Surade dengan lapangan futsal rumput sintetis dan bulutangkis karpet vinyl anti licin dengan lampu LED terang dan kantin segar.`,
        price_category: "Terjangkau",
        logo: IMG.futsal,
        banner: IMG.futsal,
        products: [
          { name: "Sewa Lapangan Futsal Rumput Sintetis (per Jam)", price: 80000, desc: "Lapangan empuk terawat bebas debu dengan bola futsal berkualitas." },
          { name: "Sewa Lapangan Badminton Karpet Vinyl (per Jam)", price: 35000, desc: "Lantai standar turnamen tidak licin dengan net kokoh dan lampu terang." }
        ]
      };
    }
    return {
      name: `Toko Alat Pancing & Olahraga Samudra Surade`,
      desc: `Joran carbon laut, reel spinning, senar PE kuat, umpan minnow, jersey tim printing, dan sewa tenda camping di Jl. Raya Surade.`,
      price_category: "Terjangkau",
      logo: IMG.pancing,
      banner: IMG.futsal,
      products: [
        { name: "Set Joran Pancing Carbon Sambung 2 + Reel 10 Bearings", price: 215000, desc: "Kuat mengangkat ikan bobot hingga 10 Kg tahan air laut." },
        { name: "Jersey Tim Olahraga Full Printing Dryfit Premium (per Stel)", price: 95000, desc: "Bahan adem menyerap keringat dengan desain custom warna tajam." }
      ]
    };
  }

  if (cSlug === 'properti') {
    return {
      name: `CV Berkah Bangun Mandiri - Jasa Arsitek & Properti Surade`,
      desc: `Jasa gambar arsitek rumah 3D, kontraktor bangunan, pasang plafon gypsum/PVC, pemborong renovasi rumah, dan agen jual tanah kavling bersertifikat di Surade.`,
      price_category: "Sedang",
      logo: IMG.arsitek_properti,
      banner: IMG.arsitek_properti,
      products: [
        { name: "Jasa Desain Arsitek Rumah Minimalis 3D + Gambar Kerja RAB (per m2)", price: 45000, desc: "Denah tata ruang, visual render 3D eksterior dan rincian biaya material." },
        { name: "Plafon PVC Motif Kayu / Glossy Anti Rayap (per m2 Terpasang)", price: 165000, desc: "Rangka hollow galvanis plafon tahan air anti bocor elegan." }
      ]
    };
  }

  if (cSlug === 'event') {
    return {
      name: `Surade Wedding & Event Organizer Pesta Mewah`,
      desc: `Penyedia paket pernikahan lengkap di Surade: tenda dekorasi semi VIP, pelaminan rustic/sunda siger bunga asli, panggung hiburan, kursi futura, dan genset listrik.`,
      price_category: "Sedang",
      logo: IMG.organizer_tenda,
      banner: IMG.organizer_tenda,
      products: [
        { name: "Paket Tenda Dekorasi Semi VIP Pesta Hajatan (100 m2)", price: 3500000, desc: "Kain dekorasi warna elegan, tirai samping, lampu hias gantung dan karpet lantai." },
        { name: "Paket Pelaminan Rustic / Modern Sunda Siger Bunga Asli", price: 2800000, desc: "Backdrop pelaminan cantik 6 meter dengan susunan bunga segar wangi harum." }
      ]
    };
  }

  if (cSlug === 'pendidikan') {
    if (sSlug.includes('fotocopy') || sSlug.includes('alat-tulis')) {
      return {
        name: `Fotocopy & Digital Printing Barokah Dian Surade`,
        desc: `Fotocopy cepat, print warna dokumen, jilid hardcover skripsi emas, laminating ijazah, dan alat tulis kantor (ATK) lengkap di Jl. Raya Surade.`,
        price_category: "Terjangkau",
        logo: IMG.fotocopy_atk,
        banner: IMG.fotocopy_atk,
        products: [
          { name: "Cetak Print Warna Kertas A4 70/80gsm (per Lembar)", price: 1000, desc: "Hasil cetak tinta tajam anti luntur untuk tugas sekolah dan laporan kantor." },
          { name: "Jilid Hardcover Skripsi / Laporan Emboss Tulisan Emas", price: 35000, desc: "Penjilidan hardcover tebal rapi tahan lama dengan pita pembatas elegan." }
        ]
      };
    }
    return {
      name: `Lembaga Bimbel & Kursus Prestasi Cendekia Surade`,
      desc: `Bimbingan belajar SD-SMP-SMA, kursus bahasa Inggris aktif, kursus komputer Microsoft Office, dan kursus mengemudi mobil berizin resmi di Surade.`,
      price_category: "Terjangkau",
      logo: IMG.fotocopy_atk,
      banner: IMG.fotocopy_atk,
      products: [
        { name: "Biaya Bimbingan Belajar Paket Bulanan SD/SMP/SMA", price: 150000, desc: "8 sesi tatap muka sebulan, bedah soal ujian, modul gratis dan konsultasi PR." },
        { name: "Paket Kursus Komputer Microsoft Office & Desain (12 Sesi)", price: 350000, desc: "Menguasai Word, Excel, PowerPoint dan internet perkantoran lengkap sertifikat." }
      ]
    };
  }

  if (cSlug === 'komunitas') {
    return {
      name: `${sName} Kecamatan Surade Mandiri`,
      desc: `Wadah perkumpulan, silaturahmi, dan kegiatan sosial pemuda serta pegiat ${sName.toLowerCase()} di Kecamatan Surade, Kabupaten Sukabumi.`,
      price_category: "Terjangkau",
      logo: IMG.komunitas_pemuda,
      banner: IMG.komunitas_pemuda,
      products: [
        { name: "Iuran Keanggotaan & Kartu Tanda Anggota (KTA)", price: 25000, desc: "Pendaftaran anggota resmi dan akses ke agenda kegiatan komunitas." },
        { name: "Kaos Merchandise Resmi Komunitas Cotton Combed 30s", price: 85000, desc: "Kaos sablon premium identitas kebanggaan keluarga besar komunitas." }
      ]
    };
  }

  // DEFAULT PROFILE
  return {
    name: `Sentra Usaha ${sName} Barokah Surade`,
    desc: `Penyedia produk dan layanan ${sName} terpercaya di ${villageName}, Kecamatan Surade, Kabupaten Sukabumi. Pelayanan ramah, mutu terjamin, harga terjangkau.`,
    price_category: "Terjangkau",
    logo: IMG.sembako,
    banner: IMG.pasar,
    products: [
      { name: `Paket Layanan / Produk Unggulan ${sName}`, price: 45000 + (idx * 5000) % 150000, desc: `Pelayanan pilihan terbaik standar terpercaya di wilayah Surade.` },
      { name: `Paket Lengkap Pilihan ${sName}`, price: 110000 + (idx * 10000) % 250000, desc: `Solusi komplit kebutuhan ${sName} berkualitas terjamin.` }
    ]
  };
}

// Build 246 businesses
const businesses = [];
let bizId = 1;

categories.forEach(cat => {
  cat.subcategories.forEach((sub, sidx) => {
    const v = VILLAGES[businesses.length % VILLAGES.length];
    const streetNum = ((businesses.length * 13 + 7) % 90) + 1;
    const street = v.streets[businesses.length % v.streets.length] + streetNum;
    const address = `${street}, ${v.name}, Kec. Surade, Kab. Sukabumi`;
    const lat = v.lat + ((businesses.length % 7) - 3) * 0.0015;
    const lng = v.lng + ((businesses.length % 5) - 2) * 0.0015;
    const phone = generatePhone(businesses.length);

    const profile = getRealSuradeProfile(sub, cat, businesses.length);

    const emailPrefix = profile.name.toLowerCase().replace(/[^a-z0-9]/g, '').slice(0, 15);
    const email = `${emailPrefix || 'kontak'}@gmail.com`;

    businesses.push({
      id: bizId,
      category_id: sub.id,
      parent_slug: cat.slug,
      parent_name: cat.name,
      sub_slug: sub.slug,
      sub_name: sub.name,
      name: profile.name,
      village: v.name,
      address: address,
      latitude: lat,
      longitude: lng,
      phone: phone,
      whatsapp: phone,
      email: email,
      operating_hours: "08:00 - 21:00",
      opening_days: [
        { day: "Senin - Minggu", open: "08:00", close: "21:00" }
      ],
      description: profile.desc,
      price_category: profile.price_category,
      tags: [sub.name, cat.name, v.name, "Surade", "Sukabumi"],
      logo: profile.logo,
      banner: profile.banner,
      gallery: [profile.logo, profile.banner],
      products: profile.products.map((p, pidx) => ({
        name: p.name,
        price: p.price,
        description: p.desc,
        image: pidx === 0 ? profile.logo : profile.banner
      })),
      is_premium: true
    });

    bizId++;
  });
});

console.log(`Successfully constructed ${businesses.length} real Surade businesses.`);
fs.writeFileSync(path.join(__dirname, 'real_businesses_246_data.json'), JSON.stringify(businesses, null, 2), 'utf8');
fs.writeFileSync(path.join(__dirname, '../backend/database/seeders/real_businesses_246_data.json'), JSON.stringify(businesses, null, 2), 'utf8');
console.log('Saved real dataset to scripts and backend seeder!');
