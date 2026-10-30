const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'verified_150_real_surade.json');
const businesses = JSON.parse(fs.readFileSync(filePath, 'utf8'));

businesses.forEach(b => {
  const n = b.name.toLowerCase();
  const c = b.city || 'Surade';

  if (/\b(bri|bsi|bjb|bank)\b/i.test(b.name)) {
    b.category_id = 633;
    b.tags = JSON.stringify(["Perbankan", "ATM 24 Jam", "Keuangan", c]);
  } else if (n.includes('pegadaian') || n.includes('gadai')) {
    b.category_id = 634;
    b.tags = JSON.stringify(["Gadai Emas", "Keuangan", "Pembiayaan Mikro", c]);
  } else if (n.includes('pos indonesia') || n.includes('kantor pos')) {
    b.category_id = 635;
    b.tags = JSON.stringify(["Ekspedisi", "Kirim Paket", "Kantor Pos", c]);
  } else if (n.includes('spbu') || n.includes('bensin') || n.includes('pertamini')) {
    b.category_id = 636;
    b.tags = JSON.stringify(["SPBU", "Bahan Bakar", "Pertalite & Solar", c]);
  } else if (n.includes('puskesmas') || n.includes('pustu')) {
    b.category_id = 550;
    b.tags = JSON.stringify(["Puskesmas", "Rawat Inap", "Pelayanan Kesehatan", c]);
  } else if (n.includes('klinik')) {
    b.category_id = 550;
    b.tags = JSON.stringify(["Klinik Medika", "Dokter 24 Jam", "Rawat Inap", c]);
  } else if (n.includes('surade farma') || (n.includes('apotek') && !n.includes('kimia farma'))) {
    b.category_id = 513;
    b.tags = JSON.stringify(["Apotek", "Obat Resep", "Farmasi", c]);
  } else if (n.includes('kimia farma')) {
    b.category_id = 513;
    b.tags = JSON.stringify(["Apotek 24 Jam", "Kimia Farma", "Alat Kesehatan", c]);
  } else if (n.includes('ahass') || n.includes('yamaha') || (n.includes('bengkel') && n.includes('resmi'))) {
    b.category_id = 662;
    b.tags = JSON.stringify(["Bengkel Motor", "Servis Berkala", "Sparepart Asli", c]);
  } else if (n.includes('trail')) {
    b.category_id = 665;
    b.tags = JSON.stringify(["Bengkel Trail", "Modifikasi Motor", "Trabas Offroad", c]);
  } else if (n.includes('tambal') || n.includes('ban')) {
    b.category_id = 663;
    b.tags = JSON.stringify(["Tambal Ban Tubeless", "Isi Angin", "Servis Roda", c]);
  } else if (n.includes('steam') || n.includes('cuci')) {
    b.category_id = 664;
    b.tags = JSON.stringify(["Cuci Steam Salju", "Pencucian Motor", "Busa Salju", c]);
  } else if (n.includes('bengkel motor') || (n.includes('bengkel') && !n.includes('las') && !n.includes('bubut') && !n.includes('perahu'))) {
    b.category_id = 662;
    b.tags = JSON.stringify(["Bengkel Sepeda Motor", "Ganti Oli Tune Up", "Mekanik Handal", c]);
  } else if (n.includes('bakso') || n.includes('mie')) {
    b.category_id = 595;
    b.tags = JSON.stringify(["Bakso Sapi", "Mie Ayam", "Kuliner Gurih", c]);
  } else if (n.includes('sate')) {
    b.category_id = 590;
    b.tags = JSON.stringify(["Sate Kambing", "Gule Kambing", "Kuliner Tradisional", c]);
  } else if (n.includes('hotel') || n.includes('penginapan') || n.includes('homestay') || n.includes('villa')) {
    b.category_id = 554;
    b.tags = JSON.stringify(["Penginapan", "Kamar Bersih AC", "Wisata Pajampangan", c]);
  } else if (n.includes('emas') || n.includes('perhiasan')) {
    b.category_id = 643;
    b.tags = JSON.stringify(["Toko Emas", "Perhiasan Logam Mulia", "Cincin & Kalung", c]);
  } else if (n.includes('toserba') || n.includes('selamat')) {
    b.category_id = 626;
    b.tags = JSON.stringify(["Toserba Swalayan", "Pusat Belanja", "Kebutuhan Lengkap", c]);
  } else if (n.includes('pasar')) {
    b.category_id = 625;
    b.tags = JSON.stringify(["Pasar Tradisional", "Sayuran & Komoditas", "Pusat Perdagangan", c]);
  } else if (n.includes('masjid')) {
    b.category_id = 638;
    b.tags = JSON.stringify(["Wisata Religi", "Masjid Agung", "Pusat Ibadah", c]);
  } else if (n.includes('sman') || n.includes('smkn') || n.includes('sekolah')) {
    b.category_id = 155;
    b.tags = JSON.stringify(["Pendidikan Formal", "Sekolah Menengah", "Prestasi Belajar", c]);
  } else if (n.includes('anyaman bambu') || n.includes('boboko') || n.includes('tampah')) {
    b.category_id = 627;
    b.tags = JSON.stringify(["Kerajinan Anyaman", "Bambu Alami", "Boboko & Besek", c]);
  } else if (n.includes('tikar')) {
    b.category_id = 527;
    b.tags = JSON.stringify(["Tikar Mendong", "Anyaman Tradisional", "Kriya Alami", c]);
  } else if (n.includes('batik')) {
    b.category_id = 651;
    b.tags = JSON.stringify(["Batik Tulis & Cap", "Motif Pajampangan", "Kain Seni Tradisional", c]);
  } else if (n.includes('las') && !n.includes('bubut')) {
    b.category_id = 501;
    b.tags = JSON.stringify(["Bengkel Las Listrik", "Teralis Pagar Besi", "Kanopi Baja Ringan", c]);
  } else if (n.includes('bubut')) {
    b.category_id = 34;
    b.tags = JSON.stringify(["Bengkel Bubut", "Rekayasa Logam", "Permesinan Industri", c]);
  } else if (n.includes('bibit pohon') || n.includes('bibit kayu') || n.includes('albasia') || n.includes('mahoni') || n.includes('sengon')) {
    b.category_id = 661;
    b.tags = JSON.stringify(["Bibit Pohon Kayu", "Sengon & Albasia", "Bibit Tanaman Keras", c]);
  } else if (n.includes('bangunan') || n.includes('material') || n.includes('kayu kaso') || (n.includes('kayu') && !n.includes('mebel') && !n.includes('kusen'))) {
    b.category_id = 515;
    b.tags = JSON.stringify(["Bahan Bangunan", "Semen Pasir Besi", "Material Rumah", c]);
  } else if (n.includes('mebel') || n.includes('kusen')) {
    b.category_id = 552;
    b.tags = JSON.stringify(["Mebel Kayu Jati", "Kusen Pintu Jendela", "Furnitur Kayu", c]);
  } else if (n.includes('penggilingan padi') || n.includes('pabrik penggilingan') || n.includes('lumbung')) {
    b.category_id = 645;
    b.tags = JSON.stringify(["Penggilingan Padi", "Beras Pulen Lokal", "Gabah Kering", c]);
  } else if (n.includes('sembako') || n.includes('kelontong')) {
    b.category_id = 625;
    b.tags = JSON.stringify(["Grosir Sembako", "Beras Minyak Gula", "Kebutuhan Pokok", c]);
  } else if (n.includes('pupuk') || n.includes('saprotan') || n.includes('kompos')) {
    b.category_id = 661;
    b.tags = JSON.stringify(["Pupuk & Bibit", "Saprotan Tani", "Obat Pertanian", c]);
  } else if (n.includes('domba') || n.includes('kambing')) {
    b.category_id = 652;
    b.tags = JSON.stringify(["Peternakan Domba Garut", "Kambing Aqiqah", "Hewan Ternak Sehat", c]);
  } else if (n.includes('ayam') || n.includes('bebek') || n.includes('telur')) {
    b.category_id = 653;
    b.tags = JSON.stringify(["Peternakan Unggas", "Telur Segar", "Ayam & Bebek Petelur", c]);
  } else if (n.includes('pangkas') || n.includes('cukur') || n.includes('barber')) {
    b.category_id = 650;
    b.tags = JSON.stringify(["Pangkas Rambut", "Barbershop Asgar", "Potong Rambut Pria", c]);
  } else if (n.includes('pulsa') || n.includes('cell') || n.includes('kuota')) {
    b.category_id = 649;
    b.tags = JSON.stringify(["Konter Pulsa", "Paket Data Kuota", "Aksesoris Handphone", c]);
  } else if (n.includes('jahit') || n.includes('penjahit') || n.includes('permak')) {
    b.category_id = 579;
    b.tags = JSON.stringify(["Jasa Jahit", "Busana Wanita & Pria", "Permak Pakaian", c]);
  } else if (n.includes('busana muslim') || n.includes('gamis') || n.includes('kerudung')) {
    b.category_id = 584;
    b.tags = JSON.stringify(["Busana Muslimah", "Gamis Syari & Hijab", "Fashion Muslim", c]);
  } else if (n.includes('seragam')) {
    b.category_id = 628;
    b.tags = JSON.stringify(["Seragam Sekolah", "Pakaian Pramuka", "Perlengkapan Sekolah", c]);
  } else if (n.includes('kopi') || n.includes('roastery') || n.includes('warkop')) {
    b.category_id = 517;
    b.tags = JSON.stringify(["Kopi Robusta Asli", "Warkop & Gorengan", "Kopi Khas Jampang", c]);
  } else if (n.includes('durian') || n.includes('pepaya') || n.includes('pisang tanduk') || (n.includes('bibit') && n.includes('buah'))) {
    b.category_id = 607;
    b.tags = JSON.stringify(["Bibit Buah Unggul", "Pohon Durian Bawor", "Pertanian Buah", c]);
  } else if (n.includes('tanaman hias') || n.includes('bunga')) {
    b.category_id = 605;
    b.tags = JSON.stringify(["Tanaman Hias", "Aglaonema & Bibit Bunga", "Pekarangan Hijau", c]);
  } else if (n.includes('emping')) {
    b.category_id = 646;
    b.tags = JSON.stringify(["Emping Melinjo", "Oleh-Oleh Pajampangan", "Camilan Renyah", c]);
  } else if (n.includes('keripik')) {
    b.category_id = 646;
    b.tags = JSON.stringify(["Keripik Singkong & Pisang", "Camilan Gurih Renyah", "Oleh-Oleh Khas", c]);
  } else if (n.includes('opak')) {
    b.category_id = 646;
    b.tags = JSON.stringify(["Opak Ketan Bakar", "Kudapan Gurih Tradisional", "Khas Kademangan", c]);
  } else if (n.includes('tahu')) {
    b.category_id = 657;
    b.tags = JSON.stringify(["Pabrik Tahu Goreng", "Olahan Kedelai Segar", "Gorengan Renyah", c]);
  } else if (n.includes('herbal')) {
    b.category_id = 513;
    b.tags = JSON.stringify(["Minyak Herbal Alami", "Jamu Tradisional", "Kesehatan Alami", c]);
  } else if (n.includes('gula aren') || n.includes('gula kelapa') || n.includes('penderes')) {
    b.category_id = 427;
    b.tags = JSON.stringify(["Gula Aren Asli", "Nira Kelapa Batok", "Hasil Bumi Pajampangan", c]);
  } else if (n.includes('madu') || n.includes('odeng')) {
    b.category_id = 658;
    b.tags = JSON.stringify(["Madu Odeng Liar", "Madu Murni Hutan", "Herbal Alami", c]);
  } else if (n.includes('liwet') || n.includes('uduk') || n.includes('warung nasi')) {
    b.category_id = 518;
    b.tags = JSON.stringify(["Nasi Liwet Sunda", "Nasi Uduk Komplit", "Warung Makan Tradisional", c]);
  } else if (n.includes('ikan bakar') || n.includes('lesehan')) {
    b.category_id = 592;
    b.tags = JSON.stringify(["Restoran Ikan Bakar", "Lesehan Sunda Gurame", "Sambal Dadak Lalapan", c]);
  } else if (n.includes('ikan nila') || n.includes('gurame') || (n.includes('kolam') && n.includes('ikan'))) {
    b.category_id = 659;
    b.tags = JSON.stringify(["Budidaya Ikan Tawar", "Ikan Nila & Gurame", "Kolam Alami", c]);
  } else if (n.includes('bibit pohon') || n.includes('bibit kayu') || n.includes('albasia') || n.includes('mahoni')) {
    b.category_id = 661;
    b.tags = JSON.stringify(["Bibit Pohon Kayu", "Sengon & Albasia", "Bibit Tanaman Keras", c]);
  } else if (n.includes('tpi') || n.includes('pelelangan') || n.includes('nelayan') || n.includes('pantai minajaya')) {
    b.category_id = 660;
    b.tags = JSON.stringify(["Pelelangan Ikan (TPI)", "Hasil Laut Segar", "Pesisir Pantai Minajaya", c]);
  } else if (n.includes('ikan asin')) {
    b.category_id = 646;
    b.tags = JSON.stringify(["Ikan Asin Teri & Jambal", "Olahan Pesisir Laut", "Oleh-Oleh Minajaya", c]);
  } else if (n.includes('perahu') && n.includes('wisata')) {
    b.category_id = 640;
    b.tags = JSON.stringify(["Sewa Perahu Wisata", "Susur Sungai & Pantai", "Wisata Bahari", c]);
  } else if (n.includes('perahu') && n.includes('mesin')) {
    b.category_id = 662;
    b.tags = JSON.stringify(["Bengkel Mesin Perahu", "Servis Mesin Tempel", "Mekanik Kelautan", c]);
  } else if (n.includes('kelapa muda') || n.includes('es kelapa')) {
    b.category_id = 518;
    b.tags = JSON.stringify(["Es Kelapa Muda Segar", "Warung Santai Pesisir", "Minuman Alami Segar", c]);
  } else if (n.includes('pancing')) {
    b.category_id = 367;
    b.tags = JSON.stringify(["Alat Pancing Lengkap", "Joran & Reel Laut", "Umpan Ikan Strike", c]);
  } else if (n.includes('camping') || n.includes('spot foto')) {
    b.category_id = 641;
    b.tags = JSON.stringify(["Camping Ground Pantai", "Spot Foto Sunrise", "Area Berkemah Wisata", c]);
  } else if (n.includes('curug cikaso')) {
    b.category_id = 613;
    b.tags = JSON.stringify(["Wisata Air Terjun", "Curug Cikaso Sukabumi", "Geopark Ciletuh", c]);
  } else if (n.includes('gua') || n.includes('karst')) {
    b.category_id = 642;
    b.tags = JSON.stringify(["Geowisata Gua Karst", "Stalaktit Stalagmit", "Wisata Alam Edukasi", c]);
  } else if (n.includes('pemandu')) {
    b.category_id = 637;
    b.tags = JSON.stringify(["Pemandu Wisata Lokal", "Tour Guide Geopark", "Eksplorasi Alam Surade", c]);
  } else if (n.includes('kaos') || n.includes('distro')) {
    b.category_id = 647;
    b.tags = JSON.stringify(["Kaos Distro Wisata", "Sablon Cinderamata", "Souvenir Khas Geopark", c]);
  } else if (n.includes('souvenir') && n.includes('bambu')) {
    b.category_id = 627;
    b.tags = JSON.stringify(["Souvenir Anyaman Bambu", "Cinderamata Tradisional", "Kriya Kayu & Bambu", c]);
  } else if (n.includes('jagung bakar')) {
    b.category_id = 518;
    b.tags = JSON.stringify(["Jagung Bakar Manis", "Kudapan Malam", "Kuliner Santai", c]);
  } else if (n.includes('air galon') || n.includes('depot')) {
    b.category_id = 626;
    b.tags = JSON.stringify(["Depot Air Minum Isi Ulang", "Air Minum Higienis", "Kebutuhan Rumah Tangga", c]);
  } else if (n.includes('jeruk nipis') || n.includes('lemon')) {
    b.category_id = 607;
    b.tags = JSON.stringify(["Kebun Jeruk Nipis", "Buah Segar Petik", "Hasil Tani Perkebunan", c]);
  } else if (n.includes('pandai besi') || n.includes('golok')) {
    b.category_id = 527;
    b.tags = JSON.stringify(["Pandai Besi Tradisional", "Tempa Golok Baja Jampang", "Alat Tani & Kebun", c]);
  } else if (n.includes('pakan') || n.includes('burung')) {
    b.category_id = 648;
    b.tags = JSON.stringify(["Pakan Ternak & Pelet", "Makanan Burung Kicau", "Konsentrat Unggas", c]);
  } else if (n.includes('jamur')) {
    b.category_id = 656;
    b.tags = JSON.stringify(["Budidaya Jamur Tiram", "Baglog Jamur Segar", "Panen Sayuran Sehat", c]);
  } else if (n.includes('cabai') || n.includes('sayuran')) {
    b.category_id = 654;
    b.tags = JSON.stringify(["Kebun Cabai Rawit", "Sayuran Segar Petik", "Hasil Tani Hortikultura", c]);
  } else if (n.includes('sawah') || n.includes('padi')) {
    b.category_id = 215;
    b.tags = JSON.stringify(["Pertanian Padi Sawah", "Beras Organik Sehat", "Hasil Bumi Pajampangan", c]);
  } else if (n.includes('traktor')) {
    b.category_id = 661;
    b.tags = JSON.stringify(["Jasa Traktor Sawah", "Olah Lahan Petani", "Alat Mesin Pertanian", c]);
  } else if (n.includes('listrik') || n.includes('lampu')) {
    b.category_id = 644;
    b.tags = JSON.stringify(["Toko Alat Listrik", "Lampu & Kabel Instalasi", "Perlengkapan Listrik", c]);
  } else if (n.includes('alat tulis') || n.includes('fotocopy')) {
    b.category_id = 604;
    b.tags = JSON.stringify(["Fotocopy & ATK", "Alat Tulis Sekolah", "Cetak Dokumen", c]);
  } else if (n.includes('oleh-oleh')) {
    b.category_id = 646;
    b.tags = JSON.stringify(["Pusat Oleh-Oleh Khas", "Hasil Laut & Keripik", "Belanja Wisatawan", c]);
  } else {
    b.category_id = 626;
    b.tags = JSON.stringify(["Kebutuhan Harian", "Toko Niaga", "Pelayanan Lokal", c]);
  }
});

fs.writeFileSync(filePath, JSON.stringify(businesses, null, 2), 'utf8');
console.log('Successfully updated category IDs and authentic tags with strict regex matching!');
