process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';
const fs = require('fs');
const path = require('path');
const https = require('https');
const http = require('http');
const { execSync } = require('child_process');

const STORAGE_DIR_1 = path.join(__dirname, '../backend/storage/app/public/businesses/real_images');
const STORAGE_DIR_2 = path.join(__dirname, '../backend/public/storage/businesses/real_images');
const FRONTEND_DIR = path.join(__dirname, '../frontend/public/images/real_businesses');

[STORAGE_DIR_1, STORAGE_DIR_2, FRONTEND_DIR].forEach(dir => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
});

const BUSINESS_CONFIGS = [
  {
    id: 1,
    name: "Let's Coffee Cafe Surade",
    desa: "Kelurahan Surade",
    category: "Warung Kopi",
    queries: [
      "Let's Coffee Surade Sukabumi",
      "cafe nongkrong surade sukabumi",
      "kedai kopi surade jampang",
      "cafe kopi modern barista espresso indonesia"
    ]
  },
  {
    id: 2,
    name: "Puskesmas Surade",
    desa: "Kelurahan Surade",
    category: "Puskesmas",
    queries: [
      "Puskesmas Surade Sukabumi",
      "gedung puskesmas surade sukabumi",
      "puskesmas surade jawa barat",
      "pelayanan puskesmas dokter rawat inap indonesia"
    ]
  },
  {
    id: 3,
    name: "Pasar Tradisional Surade",
    desa: "Kelurahan Surade",
    category: "Pasar Tradisional",
    queries: [
      "Pasar Surade Sukabumi",
      "pasar tradisional surade jampang",
      "pasar surade jawa barat",
      "pasar tradisional los sayur sembako indonesia"
    ]
  },
  {
    id: 4,
    name: "SMAN 1 Surade",
    desa: "Kelurahan Surade",
    category: "Pendidikan",
    queries: [
      "SMAN 1 Surade Sukabumi",
      "gedung sma negeri 1 surade",
      "sman 1 surade jawa barat",
      "sekolah sma negeri indonesia gedung kelas"
    ]
  },
  {
    id: 5,
    name: "Apotek Surade",
    desa: "Kelurahan Surade",
    category: "Apotek",
    queries: [
      "Apotek Surade Sukabumi",
      "apotek di surade sukabumi",
      "sidak apotek di sukabumi detik",
      "etalase apotek farmasi obat indonesia"
    ]
  },
  {
    id: 6,
    name: "Bengkel Wa Ebong Surade",
    desa: "Kelurahan Surade",
    category: "Bengkel Motor",
    queries: [
      "bengkel motor surade sukabumi",
      "bengkel motor servis motor cibarehong surade",
      "montir servis motor matic indonesia",
      "bengkel motor terdekat indonesia"
    ]
  },
  {
    id: 7,
    name: "Lesehan H. Ali Pasiripis",
    desa: "Desa Pasiripis",
    category: "Warung Makan",
    queries: [
      "Lesehan Pasiripis Surade",
      "saung lesehan makan surade sukabumi",
      "rumah makan lesehan sunda sukabumi",
      "kuliner saung lesehan pasiripis"
    ]
  },
  {
    id: 8,
    name: "Pasdot Steam & Poles Motor Pasiripis",
    desa: "Desa Pasiripis",
    category: "Cuci Mobil/Motor",
    queries: [
      "cuci motor salju steam hidrolik indonesia",
      "tempat cuci motor steam salju surade",
      "steam motor salju pasiripis",
      "doorsmeer cuci motor hidrolik salju"
    ]
  },
  {
    id: 9,
    name: "Bakso Asli Pasiripis",
    desa: "Desa Pasiripis",
    category: "Warung Makan",
    queries: [
      "bakso enak mangkok kuah bakso urat tetelan indonesia",
      "warung bakso pasiripis surade",
      "bakso asli sukabumi surade",
      "semangkuk bakso urat tetelan solo"
    ]
  },
  {
    id: 10,
    name: "Bengkel Las Putra Pasiripis",
    desa: "Desa Pasiripis",
    category: "Bengkel Las",
    queries: [
      "bengkel las pagar besi kanopi teralis pasiripis surade",
      "bengkel las listrik indonesia teralis",
      "tukang las listrik pagar besi canopy bengkel",
      "proses pembuatan kanopi bengkel las"
    ]
  },
  {
    id: 11,
    name: "Saung Lesehan & Kuliner Teh Yulan",
    desa: "Desa Buniwangi",
    category: "Warung Makan",
    queries: [
      "saung lesehan kuliner buniwangi surade",
      "warung lesehan nasi liwet ikan bakar sunda sukabumi",
      "saung makan lesehan sunda jawa barat",
      "nasi liwet komplit timbel ayam bakar tahu tempe lalapan"
    ]
  },
  {
    id: 12,
    name: "Puskesmas Buniwangi",
    desa: "Desa Buniwangi",
    category: "Puskesmas",
    queries: [
      "Puskesmas Buniwangi Surade Sukabumi",
      "puskesmas buniwangi sukabumi",
      "faskes puskesmas pembantu buniwangi",
      "gedung puskesmas rawat jalan desa indonesia"
    ]
  },
  {
    id: 13,
    name: "AHASS Selamat Motor Buniwangi",
    desa: "Desa Buniwangi",
    category: "Bengkel Motor",
    queries: [
      "bengkel resmi AHASS honda motor servis indonesia",
      "AHASS buniwangi surade honda",
      "mekanik servis motor bengkel ahass honda",
      "servis berkala pit ahass motor honda"
    ]
  },
  {
    id: 14,
    name: "Toko Bangunan Berkah Buniwangi",
    desa: "Desa Buniwangi",
    category: "Toko Bangunan",
    queries: [
      "toko material bangunan indonesia tampak depan",
      "toko bahan bangunan buniwangi surade",
      "toko bangunan semen cat besi pipa kelontong material",
      "toko bahan bangunan murah terdekat"
    ]
  },
  {
    id: 15,
    name: "Toko Besi Mekar Baja Citanglar",
    desa: "Desa Citanglar",
    category: "Toko Bangunan",
    queries: [
      "toko besi baja mekar baja ringan hollow spandek distributor",
      "gudang toko besi citanglar surade",
      "toko baja ringan hollow galvalum besi beton indonesia",
      "distributor besi hollow plat baja pipa kotak"
    ]
  },
  {
    id: 16,
    name: "Warung Seafood Bahari Citanglar",
    desa: "Desa Citanglar",
    category: "Perikanan",
    queries: [
      "warung seafood ikan bakar udang kepiting pinggir pantai citanglar",
      "seafood bahari surade sukabumi",
      "warung seafood ujung genteng sukabumi ikan bakar",
      "kuliner ikan bakar cumi saus padang seafood indonesia"
    ]
  },
  {
    id: 17,
    name: "SMPN 3 Surade Citanglar",
    desa: "Desa Citanglar",
    category: "Pendidikan",
    queries: [
      "SMPN 3 Surade Sukabumi",
      "sekolah smpn 3 surade citanglar",
      "gedung smpn 3 surade sukabumi",
      "sekolah smp negeri gedung kelas upacara indonesia"
    ]
  },
  {
    id: 18,
    name: "Sentra Gula Kelapa & Gula Semut Jampang",
    desa: "Desa Kademangan",
    category: "Produk Olahan",
    queries: [
      "pembuatan gula kelapa nira gula aren jampang surade sukabumi",
      "pengrajin gula kelapa cetak batok jampang",
      "gula semut gula merah kelapa tradisional sukabumi",
      "penderes mengolah nira gula kelapa wajan besar"
    ]
  },
  {
    id: 19,
    name: "Toko Pertanian Tani Jaya Kademangan",
    desa: "Desa Kademangan",
    category: "Pertanian & Hasil Bumi",
    queries: [
      "kios toko pertanian pupuk obat hama bibit benih tanaman indonesia",
      "toko tani jaya kademangan surade",
      "etalase toko obat pertanian pestisida pupuk subsidi",
      "toko bibit obat tanaman pertanian kios tani"
    ]
  },
  {
    id: 20,
    name: "Sentra Kerajinan Anyaman Bambu Jagamukti",
    desa: "Desa Jagamukti",
    category: "Kerajinan Tangan",
    queries: [
      "kerajinan anyaman bambu besek bakul tudung saji jampang sukabumi",
      "pengrajin anyaman bambu jagamukti surade",
      "anyaman bambu tradisional kukusan tampah besek sunda",
      "pembuat anyaman bambu pengrajin tradisional"
    ]
  },
  {
    id: 21,
    name: "Penggilingan Padi Sri Rejeki Jagamukti",
    desa: "Desa Jagamukti",
    category: "Pertanian & Hasil Bumi",
    queries: [
      "penggilingan padi heler gabah beras karung mesin padi indonesia",
      "pabrik penggilingan padi jagamukti surade",
      "mesin penggiling gabah padi beras karungan",
      "pabrik beras selep padi desa"
    ]
  },
  {
    id: 22,
    name: "Wisata Alam & Homestay Gua Sungging",
    desa: "Desa Gunungsungging",
    category: "Wisata",
    queries: [
      "Gua Sungging Gunung Sungging Surade Geopark Ciletuh Sukabumi",
      "wisata goa sungging surade",
      "stalaktit goa sungging gunungsungging sukabumi",
      "keindahan gua sungging surade"
    ]
  },
  {
    id: 23,
    name: "Mebel & Pengrajin Kayu Jati Sungging",
    desa: "Desa Gunungsungging",
    category: "Tukang Kayu",
    queries: [
      "workshop mebel pengrajin kayu lemari kursi meja jati perabot",
      "tukang kayu mebel furniture lemari pintu kusen kayu",
      "pengrajin kayu jati belanda mebel perabot workshop",
      "bengkel mebel kayu lemari kursi meja jepara"
    ]
  },
  {
    id: 24,
    name: "Kelompok Tani Nira Kelapa Kadaleman",
    desa: "Desa Kadaleman",
    category: "Pertanian & Hasil Bumi",
    queries: [
      "penderes nira kelapa panjat pohon kelapa jampang sukabumi",
      "petani penderes nira pohon kelapa lodong bambu",
      "panjat pohon kelapa deres nira sukabumi",
      "kebun pohon kelapa penderes nira jampang"
    ]
  },
  {
    id: 25,
    name: "Bengkel Motor Kadaleman Service",
    desa: "Desa Kadaleman",
    category: "Bengkel Motor",
    queries: [
      "bengkel motor servis tambal ban ganti oli montir motor desa indonesia",
      "bengkel motor kadaleman surade",
      "servis motor karburator injeksi tambal ban desa",
      "bengkel motor sederhana pinggir jalan montir"
    ]
  },
  {
    id: 26,
    name: "Warung Nasi Ikan Bakar Cipeundeuy",
    desa: "Desa Cipeundeuy",
    category: "Warung Makan",
    queries: [
      "warung nasi sunda ikan bakar cobek sambal terasi lalapan sukabumi",
      "ikan bakar cobek warung makan sunda cipeundeuy",
      "warung nasi sunda prasmanan lauk pauk komplit",
      "ikan nila gurame bakar kecap sambal terasi sunda"
    ]
  },
  {
    id: 27,
    name: "Toko Sembako Barokah Cipeundeuy",
    desa: "Desa Cipeundeuy",
    category: "Toko Sembako",
    queries: [
      "warung sembako kelontong etalase beras minyak telur warung madura indonesia",
      "toko sembako barokah warung kelontong desa",
      "toko kelontong sembako rak dagangan warung sembako",
      "etalase warung sembako kebutuhan pokok komplit"
    ]
  },
  {
    id: 28,
    name: "Koperasi Tani Makmur Sukatani",
    desa: "Desa Sukatani",
    category: "Pertanian & Hasil Bumi",
    queries: [
      "koperasi tani mina padi panen raya padi sawah sukatani surade sukabumi",
      "petani sawah panen padi sukabumi surade",
      "mina padi sukatani sukabumi antaranews",
      "panen raya padi hamparan sawah hijau petani"
    ]
  },
  {
    id: 29,
    name: "Sentra Olahan Kerupuk & Opak Sirnasari",
    desa: "Desa Sirnasari",
    category: "Produk Olahan",
    queries: [
      "sentra opak jampang kerupuk opak bakar singkong ketan surade sirnasari sukabumi",
      "opak jampang sukabumiupdate",
      "pembuatan opak ketan opak bakar jampang tradisional",
      "opak ketan gurih jampang oleh oleh khas sukabumi"
    ]
  },
  {
    id: 30,
    name: "Peternakan Ayam Petelur Wanasari Farm",
    desa: "Desa Wanasari",
    category: "Peternakan Ayam",
    queries: [
      "kandang peternakan ayam petelur telur ayam ras modern wanasari sukabumi",
      "peternakan ayam petelur kandang baterai telur ayam coklat",
      "panen telur ayam di kandang peternakan ayam layer",
      "kandang ayam petelur modern indonesia"
    ]
  }
];

async function searchBingImages(query) {
  const url = `https://www.bing.com/images/search?q=${encodeURIComponent(query)}&form=HDRSC2&first=1`;
  try {
    const res = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36',
        'Accept-Language': 'id-ID,id;q=0.9,en-US;q=0.8,en;q=0.7'
      }
    });
    const html = await res.text();
    const matches = [...html.matchAll(/murl&quot;:&quot;(https?:\/\/[^&"]+?\.(?:jpg|png|jpeg|webp))/gi)];
    if (matches && matches.length > 0) {
      return [...new Set(matches.map(m => m[1]))];
    }
  } catch (err) {
    console.error(`Search error for "${query}":`, err.message);
  }
  return [];
}

async function downloadImage(url, filename) {
  const dest1 = path.join(STORAGE_DIR_1, filename);
  const dest2 = path.join(STORAGE_DIR_2, filename);
  const dest3 = path.join(FRONTEND_DIR, filename);

  return new Promise((resolve) => {
    try {
      const parsedUrl = new URL(url);
      const client = parsedUrl.protocol === 'https:' ? https : http;

      const req = client.get(url, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36',
          'Referer': parsedUrl.origin
        },
        timeout: 10000,
        rejectUnauthorized: false
      }, (res) => {
        if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
          downloadImage(res.headers.location, filename).then(resolve);
          return;
        }

        if (res.statusCode !== 200) {
          resolve(false);
          return;
        }

        const chunks = [];
        res.on('data', (c) => chunks.push(c));
        res.on('end', () => {
          const buffer = Buffer.concat(chunks);
          if (buffer.length < 5000) { // Too small / corrupted
            resolve(false);
            return;
          }

          fs.writeFileSync(dest1, buffer);
          fs.writeFileSync(dest2, buffer);
          fs.writeFileSync(dest3, buffer);
          resolve(true);
        });
      });

      req.on('error', () => resolve(false));
      req.on('timeout', () => {
        req.destroy();
        resolve(false);
      });
    } catch (e) {
      resolve(false);
    }
  });
}

async function processAllBusinesses() {
  console.log(`Starting real images fetching for ${BUSINESS_CONFIGS.length} businesses...`);

  const results = {};

  for (const biz of BUSINESS_CONFIGS) {
    console.log(`\n========================================`);
    console.log(`[${biz.id}/${BUSINESS_CONFIGS.length}] Processing: ${biz.name} (${biz.desa})`);
    
    // Gather image URLs from all queries
    let candidateUrls = [];
    for (const q of biz.queries) {
      const urls = await searchBingImages(q);
      candidateUrls.push(...urls);
      // Small pause
      await new Promise(r => setTimeout(r, 200));
    }
    candidateUrls = [...new Set(candidateUrls)];
    console.log(`Found ${candidateUrls.length} candidate URLs from web queries.`);

    // Download logo, banner, and 3 gallery images
    const downloadedFiles = {
      logo: null,
      banner: null,
      gallery: []
    };

    let urlIndex = 0;

    // 1. Download Logo
    while (urlIndex < candidateUrls.length && !downloadedFiles.logo) {
      const filename = `biz_${biz.id}_logo.jpg`;
      const url = candidateUrls[urlIndex++];
      const ok = await downloadImage(url, filename);
      if (ok) {
        downloadedFiles.logo = `businesses/real_images/${filename}`;
        console.log(`  ✅ Downloaded Logo from: ${url}`);
      }
    }

    // 2. Download Banner
    while (urlIndex < candidateUrls.length && !downloadedFiles.banner) {
      const filename = `biz_${biz.id}_banner.jpg`;
      const url = candidateUrls[urlIndex++];
      const ok = await downloadImage(url, filename);
      if (ok) {
        downloadedFiles.banner = `businesses/real_images/${filename}`;
        console.log(`  ✅ Downloaded Banner from: ${url}`);
      }
    }

    // 3. Download Gallery (up to 3 images)
    let galleryCount = 1;
    while (urlIndex < candidateUrls.length && downloadedFiles.gallery.length < 3) {
      const filename = `biz_${biz.id}_gallery_${galleryCount}.jpg`;
      const url = candidateUrls[urlIndex++];
      const ok = await downloadImage(url, filename);
      if (ok) {
        downloadedFiles.gallery.push(`businesses/real_images/${filename}`);
        console.log(`  ✅ Downloaded Gallery ${galleryCount} from: ${url}`);
        galleryCount++;
      }
    }

    // Fallbacks if some failed
    if (!downloadedFiles.logo && downloadedFiles.banner) {
      downloadedFiles.logo = downloadedFiles.banner;
    }
    if (!downloadedFiles.banner && downloadedFiles.logo) {
      downloadedFiles.banner = downloadedFiles.logo;
    }
    if (downloadedFiles.gallery.length === 0) {
      if (downloadedFiles.banner) downloadedFiles.gallery.push(downloadedFiles.banner);
      if (downloadedFiles.logo) downloadedFiles.gallery.push(downloadedFiles.logo);
    }

    results[biz.id] = {
      id: biz.id,
      name: biz.name,
      ...downloadedFiles
    };
  }

  // Save results to JSON file
  const jsonPath = path.join(__dirname, '../real_downloaded_images.json');
  fs.writeFileSync(jsonPath, JSON.stringify(results, null, 2));
  console.log(`\n🎉 All images downloaded and saved to ${jsonPath}!`);
}

processAllBusinesses();
