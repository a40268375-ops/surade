const fs = require('fs');
const path = require('path');

// 1. Download image helper
async function downloadImage(url, destPath) {
  if (fs.existsSync(destPath) && fs.statSync(destPath).size > 1000) {
    return true;
  }
  try {
    const res = await fetch(url, { headers: { 'User-Agent': 'Mozilla/5.0' } });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const buffer = Buffer.from(await res.arrayBuffer());
    fs.writeFileSync(destPath, buffer);
    return true;
  } catch (e) {
    console.warn(`Failed to download ${url}: ${e.message}`);
    return false;
  }
}

function syncImage(sourceFile, targetFile) {
  try {
    if (fs.existsSync(sourceFile)) {
      const dir = path.dirname(targetFile);
      if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
      fs.copyFileSync(sourceFile, targetFile);
    }
  } catch (e) {}
}

async function main() {
  console.log('=== STEP 1: DOWNLOADING REAL-WORLD BUSINESS & PRODUCT IMAGES ===');

  const imageMap = {
    // Kuliner / Resto / Cafe
    'kuliner_sate': 'https://images.unsplash.com/photo-1529193591184-b1d58069ecdd?w=700&q=80',
    'kuliner_bakso': 'https://images.unsplash.com/photo-1569718212165-3a8278d5f624?w=700&q=80',
    'kuliner_ikan_bakar': 'https://images.unsplash.com/photo-1534939561126-855b8675edd7?w=700&q=80',
    'kuliner_padang': 'https://images.unsplash.com/photo-1626777552726-4a6b54c97e46?w=700&q=80',
    'kuliner_cafe': 'https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?w=700&q=80',
    'kuliner_kopi': 'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=700&q=80',
    'kuliner_nasi_goreng': 'https://images.unsplash.com/photo-1603133872878-684f208fb84b?w=700&q=80',
    'kuliner_ayam_geprek': 'https://images.unsplash.com/photo-1626082927389-6cd097cdc6ec?w=700&q=80',
    'kuliner_martabak': 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=700&q=80',
    'kuliner_jus': 'https://images.unsplash.com/photo-1553530666-ba11a7da3888?w=700&q=80',
    'kuliner_bakery': 'https://images.unsplash.com/photo-1509440159596-0249088772ff?w=700&q=80',
    'kuliner_kue_basah': 'https://images.unsplash.com/photo-1587314168485-3236d6710814?w=700&q=80',
    'kuliner_ikan_asin': 'https://images.unsplash.com/photo-1519708227418-c8fd9a32b7a2?w=700&q=80',
    'kuliner_gula_aren': 'https://images.unsplash.com/photo-1607958996333-41aef7caefaa?w=700&q=80',
    'kuliner_catering': 'https://images.unsplash.com/photo-1555244162-803834f70033?w=700&q=80',
    'kuliner_mie_ayam': 'https://images.unsplash.com/photo-1582878826629-29b7ad1cdc43?w=700&q=80',
    'kuliner_seafood': 'https://images.unsplash.com/photo-1565680018434-b513d5e5fd47?w=700&q=80',

    // Otomotif & Bengkel
    'otomotif_motor': 'https://images.unsplash.com/photo-1558981403-c5f9899a28bc?w=700&q=80',
    'otomotif_mobil': 'https://images.unsplash.com/photo-1486006920555-c77dce18193b?w=700&q=80',
    'otomotif_las': 'https://images.unsplash.com/photo-1504307651254-35680f356dfd?w=700&q=80',
    'otomotif_cuci': 'https://images.unsplash.com/photo-1520340356584-f9917d1eea6f?w=700&q=80',
    'otomotif_tambal_ban': 'https://images.unsplash.com/photo-1578844251758-2f71da64c96f?w=700&q=80',
    'otomotif_variasi': 'https://images.unsplash.com/photo-1568772585407-9361f9bf3a87?w=700&q=80',
    'otomotif_sparepart': 'https://images.unsplash.com/photo-1486262715619-67b85e0b08d3?w=700&q=80',

    // Pertanian / Peternakan / Perkebunan
    'tani_bibit': 'https://images.unsplash.com/photo-1530836369250-ef72a3f5cda8?w=700&q=80',
    'tani_pupuk': 'https://images.unsplash.com/photo-1585314062340-f1a5a7c9328d?w=700&q=80',
    'tani_tanaman_hias': 'https://images.unsplash.com/photo-1485955900006-10f4d324d411?w=700&q=80',
    'tani_madu': 'https://images.unsplash.com/photo-1587049352846-4a222e784d38?w=700&q=80',
    'tani_ikan_lele': 'https://images.unsplash.com/photo-1522069169874-c58ec4b76be5?w=700&q=80',
    'tani_ternak': 'https://images.unsplash.com/photo-1516467508483-a7212febe31a?w=700&q=80',
    'tani_kelapa': 'https://images.unsplash.com/photo-1544376798-89aa6b82c6cd?w=700&q=80',
    'tani_sayur': 'https://images.unsplash.com/photo-1540420773420-3366772f4999?w=700&q=80',

    // Jasa & Properti
    'jasa_ac': 'https://images.unsplash.com/photo-1621905251189-08b45d6a269e?w=700&q=80',
    'jasa_listrik': 'https://images.unsplash.com/photo-1621905252507-b35492cc74b4?w=700&q=80',
    'jasa_ledeng': 'https://images.unsplash.com/photo-1584622650111-993a426fbf0a?w=700&q=80',
    'jasa_laundry': 'https://images.unsplash.com/photo-1545173168-9f1947eebb7f?w=700&q=80',
    'jasa_barbershop': 'https://images.unsplash.com/photo-1503951914875-452162b0f3f1?w=700&q=80',
    'jasa_salon': 'https://images.unsplash.com/photo-1560066984-138dadb4c035?w=700&q=80',
    'jasa_fotografi': 'https://images.unsplash.com/photo-1537633552985-df8429e8048b?w=700&q=80',
    'jasa_drone': 'https://images.unsplash.com/photo-1508614589041-895b88991e3e?w=700&q=80',
    'jasa_jahit': 'https://images.unsplash.com/photo-1528459801416-a9e53bbf4e17?w=700&q=80',
    'jasa_bangunan': 'https://images.unsplash.com/photo-1503387762-592deb58ef4e?w=700&q=80',
    'jasa_rental_mobil': 'https://images.unsplash.com/photo-1549317661-bd32c8ce0db2?w=700&q=80',
    'jasa_paving_taman': 'https://images.unsplash.com/photo-1558904541-efa8c4a08931?w=700&q=80',
    'jasa_kunci': 'https://images.unsplash.com/photo-1582139329536-e7284fece509?w=700&q=80',
    'jasa_hukum': 'https://images.unsplash.com/photo-1589829545856-d10d557cf95f?w=700&q=80',
    'jasa_pest_control': 'https://images.unsplash.com/photo-1628177142898-93e36e4e3a50?w=700&q=80',

    // Retail & Toko
    'retail_sembako': 'https://images.unsplash.com/photo-1578916171728-46686eac8d58?w=700&q=80',
    'retail_material': 'https://images.unsplash.com/photo-1504307651254-35680f356dfd?w=700&q=80',
    'retail_atk': 'https://images.unsplash.com/photo-1583485088034-697b5bc54ccd?w=700&q=80',
    'retail_pakaian': 'https://images.unsplash.com/photo-1489987707025-afc232f7ea0f?w=700&q=80',
    'retail_hijab': 'https://images.unsplash.com/photo-1584917865442-de89df76afd3?w=700&q=80',
    'retail_mainan': 'https://images.unsplash.com/photo-1558060370-d644479cb6f7?w=700&q=80',
    'retail_perabot': 'https://images.unsplash.com/photo-1583847268964-b28dc8f51f92?w=700&q=80',
    'retail_plastik': 'https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?w=700&q=80',
    'retail_sepatu': 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=700&q=80',
    'retail_bambu': 'https://images.unsplash.com/photo-1513836279014-a89f7a76ae86?w=700&q=80',
    'retail_pancing': 'https://images.unsplash.com/photo-1544717305-2782549b5136?w=700&q=80',
    'retail_buah': 'https://images.unsplash.com/photo-1610832958506-aa56368176cf?w=700&q=80',

    // Elektronik & Gadget
    'elektronik_hp': 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=700&q=80',
    'elektronik_laptop': 'https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=700&q=80',
    'elektronik_cctv': 'https://images.unsplash.com/photo-1557597774-9d273605dfa9?w=700&q=80',
    'elektronik_tv': 'https://images.unsplash.com/photo-1593359677879-a4bb92f829d1?w=700&q=80',
    'elektronik_speaker': 'https://images.unsplash.com/photo-1545454675-3531b543be5d?w=700&q=80',

    // Kesehatan & Medis
    'medis_apotek': 'https://images.unsplash.com/photo-1586015555751-63bb77f4322a?w=700&q=80',
    'medis_klinik': 'https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?w=700&q=80',
    'medis_optik': 'https://images.unsplash.com/photo-1574258495973-f010dfbb5371?w=700&q=80',
    'medis_herbal': 'https://images.unsplash.com/photo-1540555700478-4be289fbecef?w=700&q=80',
    'medis_bidan': 'https://images.unsplash.com/photo-1584515979956-d9f6e5d09982?w=700&q=80',

    // Pendidikan & Kursus
    'pendidikan_bimbel': 'https://images.unsplash.com/photo-1503676260728-1c00da094a0b?w=700&q=80',
    'pendidikan_komputer': 'https://images.unsplash.com/photo-1531482615713-2afd69097998?w=700&q=80',
    'pendidikan_menjahit': 'https://images.unsplash.com/photo-1528459801416-a9e53bbf4e17?w=700&q=80',
    'pendidikan_pesantren': 'https://images.unsplash.com/photo-1542810634-71277d95dcbb?w=700&q=80',

    // Wisata & Homestay
    'wisata_pantai': 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=700&q=80',
    'wisata_curug': 'https://images.unsplash.com/photo-1432405972618-c60b0225b8f9?w=700&q=80',
    'wisata_homestay': 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=700&q=80',
    'wisata_camping': 'https://images.unsplash.com/photo-1504280390367-361c6d9f38f4?w=700&q=80',

    // Olahraga & Komunitas
    'olahraga_futsal': 'https://images.unsplash.com/photo-1574629810360-7efbbe195018?w=700&q=80',
    'olahraga_fitness': 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=700&q=80',
    'komunitas_seni': 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=700&q=80'
  };

  const localImageMap = {};
  for (const [key, url] of Object.entries(imageMap)) {
    const filename = `${key}.jpg`;
    const frontendDest = path.join(__dirname, '../frontend/public/images/businesses', filename);
    const backendDest = path.join(__dirname, '../backend/public/images/businesses', filename);
    
    console.log(`Downloading real image for [${key}]...`);
    await downloadImage(url, frontendDest);
    syncImage(frontendDest, backendDest);
    localImageMap[key] = `/images/businesses/${filename}`;
  }

  console.log('Saved all real-world business photos to local storage.');
}

main().catch(err => {
  console.error('Fatal Error:', err);
  process.exit(1);
});
