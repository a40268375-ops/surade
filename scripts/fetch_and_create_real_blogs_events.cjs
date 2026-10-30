process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';
const fs = require('fs');
const path = require('path');
const https = require('https');
const http = require('http');

const STORAGE_DIR_1 = path.join(__dirname, '../backend/storage/app/public/blogs/real_images');
const STORAGE_DIR_2 = path.join(__dirname, '../backend/public/storage/blogs/real_images');
const FRONTEND_DIR = path.join(__dirname, '../frontend/public/images/real_blogs');

[STORAGE_DIR_1, STORAGE_DIR_2, FRONTEND_DIR].forEach(dir => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
});

const BLOGS_AND_EVENTS = [
  // ==========================================
  // 10 REAL BLOGS
  // ==========================================
  {
    index: 1,
    type: 'blog',
    title: 'Pesona Pantai Minajaya Surade: Keindahan Hamparan Karang dan Sunset Eksotis Pesisir Selatan',
    category: 'Travel & Wisata',
    excerpt: 'Pantai Minajaya di Surade menawarkan bentang karang laut yang landai dengan air jernih, keindahan panorama matahari terbenam, dan deretan warung kuliner ikan bakar segar.',
    content: `
<p>Kecamatan Surade di Kabupaten Sukabumi menyimpan mutiara tersembunyi yang menjadi magnet bagi wisatawan lokal maupun luar daerah, yaitu <strong>Pantai Minajaya</strong>. Terletak di perbatasan Desa Pasiripis dan Desa Buniwangi, pantai ini memiliki karakteristik unik yang membedakannya dari pantai selatan pada umumnya.</p>

<h3>Keunikan Hamparan Karang Laut yang Landai</h3>
<p>Salah satu daya tarik utama Pantai Minajaya adalah formasi karang datar yang membentang ratusan meter ke arah laut saat air surut. Karang ini menyerupai permadani alami yang dipenuhi biota laut kecil seperti rumput laut hijau, kepiting karang, bintang laut, dan ikan-ikan karang warna-warni yang memikat.</p>

<p>Ketika sore hari tiba, langit di atas Pantai Minajaya bertransformasi menjadi kanvas senja berwarna jingga keemasan. Gradasi cahaya matahari yang memantul di atas genangan air laut di sela-sela karang menciptakan lanskap fotografi yang sangat memukau.</p>

<h3>Fasilitas dan Kuliner Ikan Bakar Pesisir</h3>
<p>Di sepanjang tepi pantai berjejer pohon kelapa yang teduh serta saung-saung santai tempat pengunjung beristirahat. Pengunjung juga dapat menikmati olahan hasil tangkapan nelayan setempat seperti ikan kakap merah bakar bumbu kecap pedas, udang windu, dan es kelapa muda segar langsung dari pohonnya.</p>
`,
    queries: [
      'Pantai Minajaya Surade Sukabumi',
      'sunset pantai minajaya pasiripis surade',
      'pantai minajaya geopark ciletuh sukabumi',
      'pantai pasir putih karang minajaya'
    ],
    published_at: '2026-09-20 08:30:00',
    event_date: null,
    event_end_date: null,
    event_location: null
  },
  {
    index: 2,
    type: 'blog',
    title: 'Menyingkap Misteri dan Keindahan Gua Sungging: Geowisata Karst Purba di Jantung Surade',
    category: 'Travel & Wisata',
    excerpt: 'Gua Sungging di Desa Gunungsungging menawarkan stalaktit dan stalagmit kristal aktif yang megah peninggalan formasi batuan purba kawasan Geopark Ciletuh - Palabuhanratu.',
    content: `
<p>Bagi pencinta wisata petualangan dan speleologi (penelusuran gua), <strong>Gua Sungging</strong> yang berada di Desa Gunungsungging, Kecamatan Surade, merupakan destinasi geowisata karst purba yang sangat eksotis.</p>

<h3>Keagungan Formasi Karst Bawah Tanah</h3>
<p>Gua ini memiliki lorong utama yang lapang dengan ornamen alam berupa stalaktit tajam di langit-langit gua dan stalagmit yang menjulang dari dasar gua. Sebagian besar batuan kapur di Gua Sungging masih aktif dan terus meneteskan air mineral yang berkilauan saat terkena sorotan lampu senter.</p>

<p>Keberadaan aliran sungai bawah tanah dengan air jernih menyegarkan di dalam gua semakin menambah sensasi penjelajahan. Suasana sejuk dan hening di dalam gua memberikan ketenangan batin yang kontras dengan hiruk-pikuk aktivitas perkotaan.</p>

<h3>Aksesibilitas dan Potensi Wisata Desa</h3>
<p>Pemerintah Desa Gunungsungging bersama kelompok sadar wisata (Pokdarwis) setempat terus mengembangkan sarana pendukung seperti jalur setapak yang aman, penyewaan helm pelindung kepala dan lampu senter, serta pemandu lokal yang siap menemani penjelajahan dengan aman.</p>
`,
    queries: [
      'Gua Sungging Gunung Sungging Surade Geopark Ciletuh Sukabumi',
      'wisata goa sungging surade sukabumi',
      'stalaktit goa sungging gunungsungging sukabumi',
      'keindahan gua sungging surade'
    ],
    published_at: '2026-09-18 10:15:00',
    event_date: null,
    event_end_date: null,
    event_location: null
  },
  {
    index: 3,
    type: 'blog',
    title: 'Mengenal Tradisi \'Ngaderes\' Nira Kelapa dan Gurihnya Gula Merah Asli Pajampangan',
    category: 'Bisnis & UMKM',
    excerpt: 'Sentra perajin gula kelapa dan gula semut di Desa Kademangan dan Kadaleman tetap lestari dengan teknik memasak nira tradisional di wajan kuali tanah liat.',
    content: `
<p>Aroma manis karamel khas gula kelapa yang mengepul dari tungku kayu bakar menjadi pemandangan harian di kawasan selatan Surade, khususnya di Desa Kademangan dan Desa Kadaleman. Tradisi <strong>ngaderes</strong> (menyadap air nira kelapa) telah menjadi tumpuan ekonomi keluarga secara turun-temurun.</p>

<h3>Perjuangan Para Penderes Kelapa</h3>
<p>Setiap pagi dan sore, para penderes dengan lincah memanjat pohon kelapa setinggi belasan meter menggunakan tangga bambu (<em>lodong</em>). Air nira segar hasil sadapan dikumpulkan kemudian disaring bersih sebelum masuk ke proses perebusan panjang selama 4 hingga 5 jam.</p>

<p>Penggunaan kayu bakar dari pelepah dan tempurung kelapa memberikan aroma harum yang khas pada gula merah Surade. Cetakan yang digunakan sebagian besar masih alami berupa batok kelapa setengah lingkaran, menghasilkan tekstur padat, legit, dan bebas dari bahan kimia pengawet.</p>

<h3>Inovasi Gula Semut untuk Pasar Modern</h3>
<p>Selain gula merah cetak batok konvensional, kini para petani milenial di Surade mulai memproduksi <strong>gula semut (palm sugar powder)</strong> organik dengan kemasan higienis yang dipasok ke berbagai kedai kopi kekinian dan toko oleh-oleh di kota-kota besar.</p>
`,
    queries: [
      'pembuatan gula kelapa nira gula aren jampang surade sukabumi',
      'pengrajin gula kelapa cetak batok jampang',
      'gula semut gula merah kelapa tradisional sukabumi',
      'penderes mengolah nira gula kelapa wajan besar'
    ],
    published_at: '2026-09-16 14:00:00',
    event_date: null,
    event_end_date: null,
    event_location: null
  },
  {
    index: 4,
    type: 'blog',
    title: 'Sentra Pembuatan Opak Ketan Khas Jampang di Sirnasari yang Renyah Melegenda',
    category: 'Kuliner & Kafe',
    excerpt: 'Opak ketan bakar khas Sirnasari Surade diproduksi secara tradisional dengan bahan baku ketan putih murni lokal dan kelapa parut sangrai yang gurih renyah.',
    content: `
<p>Bila Anda melintasi jalur Desa Sirnasari, Anda akan disuguhi deretan tampah bambu berjejer di halaman rumah warga yang menjemur lembaran opak ketan putih bundar di bawah sinar matahari tropis. Opak Jampang merupakan kuliner ikonik yang tak terpisahkan dari identitas budaya kuliner Pajampangan.</p>

<h3>Proses Pembuatan Tradisional yang Rumit</h3>
<p>Membuat opak berkualitas tinggi membutuhkan ketelatenan tinggi. Beras ketan putih pilihan ditanak lalu ditumbuk halus di dalam lesung kayu bersama santan kelapa kental, parutan kelapa, dan garam. Adonan kemudian dipipihkan secara manual menjadi lingkaran tipis sebelum dijemur hingga kering sempurna.</p>

<p>Proses pematangan opak Sirnasari tidak digoreng dengan minyak, melainkan dipanggang atau dibakar di atas bara arang kayu sambil dibolak-balik menggunakan jepitan bambu. Teknik ini menghasilkan tekstur opak yang renyah mekar sempurna, harum, dan bebas kolesterol minyak.</p>

<h3>Oleh-Oleh Favorit Wisatawan</h3>
<p>Kini kemasan opak ketan Sirnasari telah dipadukan dengan berbagai varian rasa seperti original gurih, rasa manis gula aren, hingga rasa pedas daun jeruk yang digemari kalangan muda.</p>
`,
    queries: [
      'sentra opak jampang kerupuk opak bakar singkong ketan surade sirnasari sukabumi',
      'opak jampang sukabumiupdate',
      'pembuatan opak ketan opak bakar jampang tradisional',
      'opak ketan gurih jampang oleh oleh khas sukabumi'
    ],
    published_at: '2026-09-14 11:20:00',
    event_date: null,
    event_end_date: null,
    event_location: null
  },
  {
    index: 5,
    type: 'blog',
    title: 'Mengenal Sejarah Peradaban Pajampangan dan Warisan Pendekar Pasundan di Surade',
    category: 'Berita & Informasi',
    excerpt: 'Wilayah Surade menyimpan sejarah panjang sebagai benteng kesatria Pasundan di pesisir maritim selatan Sukabumi dengan falsafah hidup luhur.',
    content: `
<p>Kecamatan Surade menempati posisi strategis di pusat kawasan Pajampangan. Sejak masa kerajaan Sunda hingga era perjuangan kemerdekaan, tanah Jampang dikenal sebagai lumbung pendekar tangguh yang menjunjung tinggi kebenaran, keberanian, dan keselarasan dengan alam semesta.</p>

<h3>Filosofi Pendekar Jampang dan Seni Bela Diri Silat</h3>
<p>Karakter masyarakat Pajampangan tercermin dalam seni bela diri tradisional <em>Pencak Silat Aliran Jampang</em> yang mengutamakan kelenturan jurus, ketahanan fisik di medan perbukitan dan pesisir, serta kearifan sikap rendah hati. Nilai luhur <em>silih asah, silih asih, silih asuh</em> senantiasa dipraktikkan dalam kehidupan bertetangga.</p>

<p>Surade tempo dulu menjadi urat nadi perniagaan yang menghubungkan jalur pelayaran selatan dengan wilayah pedalaman Sukabumi. Beras ketan, rempah pala, cengkeh, dan hasil laut diperdagangkan di pasar-pasar kuno yang menjadi cikal bakal Pasar Surade saat ini.</p>
`,
    queries: [
      'budaya pajampangan surade sukabumi pencak silat',
      'sejarah jampang surade sukabumi',
      'masyarakat adat sunda pajampangan sukabumi',
      'pesona budaya jampang sukabumi'
    ],
    published_at: '2026-09-12 09:00:00',
    event_date: null,
    event_end_date: null,
    event_location: null
  },
  {
    index: 6,
    type: 'blog',
    title: 'Keberhasilan Sistem Mina Padi Sukatani: Menggabungkan Budidaya Ikan dan Panen Padi Organik',
    category: 'Bisnis & UMKM',
    excerpt: 'Petani di Desa Sukatani sukses melipatgandakan pendapatan melalui integrasi sawah padi organik dengan budidaya ikan nila dan mas sistem mina padi.',
    content: `
<p>Inovasi agribisnis ramah lingkungan berhasil diterapkan oleh kelompok tani di Desa Sukatani, Kecamatan Surade, melalui penerapan budidaya <strong>Mina Padi</strong>. Sistem ini menggabungkan penanaman padi sawah dengan pemeliharaan ikan air tawar di petak sawah yang sama.</p>

<h3>Manfaat Ekologis dan Peningkatan Nilai Ekonomi</h3>
<p>Keberadaan ikan di sela-sela rumpun padi memberikan manfaat mutualisme yang luar biasa. Ikan memangsa hama serangga, wereng, dan jentik nyamuk, sementara kotoran ikan berfungsi sebagai pupuk organik alami bagi tanaman padi.</p>

<p>Hasilnya, tanaman padi tumbuh lebih subur tanpa ketergantungan pada pestisida kimia sintetis, dan petani dapat memanen dua komoditas sekaligus: gabah padi organik berkualitas prima dan ikan konsumsi segar seperti ikan mas, nila, dan gurame dengan harga jual tinggi.</p>
`,
    queries: [
      'mina padi sukatani sukabumi antaranews',
      'koperasi tani mina padi panen raya padi sawah sukatani surade sukabumi',
      'petani sawah panen padi sukabumi surade',
      'panen raya padi hamparan sawah hijau petani'
    ],
    published_at: '2026-09-10 13:45:00',
    event_date: null,
    event_end_date: null,
    event_location: null
  },
  {
    index: 7,
    type: 'blog',
    title: 'Anyaman Bambu Jagamukti: Kriya Tradisional yang Tembus Pasar Nasional',
    category: 'Bisnis & UMKM',
    excerpt: 'Keterampilan tangan warga Desa Jagamukti menghasilkan aneka produk anyaman bambu seperti besek, tudung saji, kap lampu, dan hampers ramah lingkungan.',
    content: `
<p>Di Desa Jagamukti, batang bambu tali dan bambu gombong yang melimpah di tepi aliran sungai disulap menjadi aneka produk kerajinan bernilai seni tinggi. Kaum ibu dan perajin sepuh dengan cekatan mengiris bambu menjadi bilah-bilah halus kemudian menganyamnya dengan pola geometris yang rapi.</p>

<h3>Dari Perabot Tradisional Menuju Produk Eco-Friendly</h3>
<p>Jika dahulu anyaman bambu hanya dibuat menjadi wadah nasi (bakul), kukusan tumpeng, dan besek tape, kini perajin Jagamukti berinovasi menciptakan produk dekorasi interior modern seperti kap lampu gantung cafe, tempat tisu estetik, keranjang laundry, hingga hampers kemasan ramah lingkungan pengganti plastik.</p>

<p>Permintaan produk anyaman Jagamukti terus mengalir dari berbagai kota seperti Bandung, Jakarta, dan Yogyakarta berkat promosi digital dan katalog online.</p>
`,
    queries: [
      'kerajinan anyaman bambu besek bakul tudung saji jampang sukabumi',
      'pengrajin anyaman bambu jagamukti surade',
      'anyaman bambu tradisional kukusan tampah besek sunda',
      'pembuat anyaman bambu pengrajin tradisional'
    ],
    published_at: '2026-09-08 16:30:00',
    event_date: null,
    event_end_date: null,
    event_location: null
  },
  {
    index: 8,
    type: 'blog',
    title: 'Panduan Berbelanja di Pasar Tradisional Surade: Tips Mendapatkan Hasil Laut & Sayur Segar Termurah',
    category: 'Tips & Tutorial',
    excerpt: 'Pasar Surade sebagai sentra perniagaan utama Jampang menyediakan aneka tangkapan laut segar harian dan sayuran langsung dari petani.',
    content: `
<p>Sebagai pusat perdagangan terbesar di belahan selatan Sukabumi, <strong>Pasar Tradisional Surade</strong> menjadi urat nadi perputaran ekonomi warga. Bagi Anda yang ingin berbelanja hemat dengan kesegaran maksimal, berikut beberapa tips praktis saat berbelanja di Pasar Surade:</p>

<h3>1. Datang di Waktu Subuh (Pukul 04.30 - 06.30 WIB)</h3>
<p>Waktu subuh adalah saat di mana mobil bak pengangkut ikan laut langsung dari dermaga pendaratan kapal nelayan dan sayuran dari petani perbukitan tiba di pasar. Anda akan mendapatkan cumi segar, ikan tongkol, kakap, dan udang dengan kondisi mata bening dan insang merah segar dengan harga tangan pertama.</p>

<h3>2. Manfaatkan Transaksi Non-Tunai QRIS</h3>
<p>Banyak pedagang sembako, daging, dan toko kelontong di Pasar Surade kini telah dilengkapi kode QRIS resmi, mempermudah pembayaran digital tanpa repot mencari uang kembalian.</p>
`,
    queries: [
      'Pasar Surade Sukabumi',
      'pasar tradisional surade jampang',
      'pasar surade jawa barat',
      'pasar tradisional los sayur sembako indonesia'
    ],
    published_at: '2026-09-06 07:15:00',
    event_date: null,
    event_end_date: null,
    event_location: null
  },
  {
    index: 9,
    type: 'blog',
    title: 'Kiat Menjaga Kesehatan Keluarga di Musim Pancaroba dari Tenaga Medis Puskesmas Surade',
    category: 'Kesehatan & Gaya Hidup',
    excerpt: 'Dokter dan petugas kesehatan Puskesmas Surade membagikan langkah preventif menghadapi perubahan cuaca ekstrem di kawasan pesisir dan perbukitan.',
    content: `
<p>Perubahan cuaca di wilayah pesisir selatan Sukabumi seringkali memicu penurunan daya tahan tubuh, terutama pada anak-anak dan lansia. Tim medis <strong>Puskesmas Surade</strong> mengingatkan pentingnya langkah pencegahan dini terhadap penyakit ISPA, flu, dan demam berdarah.</p>

<h3>Langkah Preventif Pola Hidup Bersih & Sehat (PHBS)</h3>
<ul>
  <li><strong>Konsumsi Air Putih Cukup:</strong> Udara pesisir yang lembap dan terik sering memicu dehidrasi tanpa disadari.</li>
  <li><strong>Pemberantasan Sarang Nyamuk (3M Plus):</strong> Menguras dan menutup tempat penampungan air secara rutin untuk mencegah jentik nyamuk Aedes aegypti.</li>
  <li><strong>Konsumsi Makanan Bergizi:</strong> Memanfaatkan kekayaan lokal seperti ikan laut tinggi protein dan sayuran hijau segar.</li>
  <li><strong>Layanan Konsultasi 24 Jam:</strong> Manfaatkan fasilitas IGD dan poli umum Puskesmas Surade untuk pemeriksaan dini jika demam berlangsung lebih dari 2 hari.</li>
</ul>
`,
    queries: [
      'Puskesmas Surade Sukabumi',
      'gedung puskesmas surade sukabumi',
      'puskesmas surade jawa barat',
      'pelayanan puskesmas dokter rawat inap indonesia'
    ],
    published_at: '2026-09-04 10:00:00',
    event_date: null,
    event_end_date: null,
    event_location: null
  },
  {
    index: 10,
    type: 'blog',
    title: 'Menikmati Kuliner Ikan Laut Bakar Khas Pesisir Surade & Citanglar dengan Sambal Cobek Asli',
    category: 'Kuliner & Kafe',
    excerpt: 'Eksplorasi cita rasa kuliner laut khas pesisir Surade dengan racikan bumbu bakar rempah terasi dan sambal jahe cobek lalapan segar.',
    content: `
<p>Perjalanan menyusuri pesisir selatan Surade dan Citanglar terasa belum lengkap tanpa mencicipi kelezatan <strong>Ikan Laut Bakar Khas Pajampangan</strong>. Kesegaran ikan yang baru diturunkan dari perahu nelayan memberikan tekstur daging yang manis alami tanpa bau amis.</p>

<h3>Rahasia Bumbu Oles dan Sambal Cobek Dadakan</h3>
<p>Ikan kakap merah, bawal laut, atau cumi-cumi dilumuri bumbu racikan bawang putih, ketumbar, dan kecap manis asli gula kelapa Surade sebelum dibakar perlahan di atas arang batok kelapa. Disajikan bersama sambal cobek terasi dadakan dengan perasan jeruk limau dan lalapan pucuk daun surawung (kemangi), petai, dan mentimun renyah.</p>
`,
    queries: [
      'warung seafood ikan bakar udang kepiting pinggir pantai citanglar',
      'seafood bahari surade sukabumi',
      'warung nasi sunda ikan bakar cobek sambal terasi lalapan sukabumi',
      'kuliner ikan bakar cumi saus padang seafood indonesia'
    ],
    published_at: '2026-09-02 15:30:00',
    event_date: null,
    event_end_date: null,
    event_location: null
  },

  // ==========================================
  // 10 REAL EVENTS
  // ==========================================
  {
    index: 11,
    type: 'event',
    title: 'Festival Adat Pesta Nelayan & Syukuran Nelayan Palangpang - Ujung Genteng 2026',
    category: 'Event & Festival',
    excerpt: 'Prosesi larung sesaji adat bahari, parade perahu hias nelayan pesisir, pertunjukan seni wayang golek, dan pesta kuliner ikan bakar rakyat.',
    content: `
<p>Sebagai wujud rasa syukur masyarakat pesisir selatan atas limpahan rezeki hasil laut dan keselamatan para nelayan, kembali digelar <strong>Festival Adat Pesta Nelayan & Syukuran Bahari 2026</strong> yang berpusat di kawasan pesisir Palangpang dan Ujung Genteng, perbatasan selatan Surade.</p>

<h3>Rangkaian Kegiatan Utama:</h3>
<ul>
  <li><strong>Pawai Perahu Hias Nelayan:</strong> Puluhan perahu nelayan dihias warna-warni berlayar beriringan di perairan teluk.</li>
  <li><strong>Upacara Adat Larung Saji:</strong> Tradisi sakral simbol doa keberkahan dan pelestarian ekosistem laut.</li>
  <li><strong>Bazar Kuliner Ikan Laut Gratis:</strong> Bakar ikan massal sepanjang 200 meter untuk dinikmati bersama warga dan wisatawan.</li>
  <li><strong>Pentas Seni & Wayang Golek:</strong> Pagelaran semalam suntuk kesenian tradisional Jawa Barat.</li>
</ul>
`,
    queries: [
      'pesta laut syukuran nelayan palangpang sukabumi',
      'syukuran laut ciletuh geopark sukabumi',
      'perahu nelayan hias syukuran laut sukabumi',
      'festival nelayan pesisir pantai sukabumi'
    ],
    published_at: '2026-09-22 09:00:00',
    event_date: '2026-10-15 08:00:00',
    event_end_date: '2026-10-17 22:00:00',
    event_location: 'Pantai Palangpang & Pesisir Dermaga Nelayan Surade - Ujung Genteng'
  },
  {
    index: 12,
    type: 'event',
    title: 'Pajampangan Surade Culture & Art Festival 2026: Karnaval Seni Tari & Silat Jampang',
    category: 'Event & Festival',
    excerpt: 'Parade akbar kebudayaan tatar Pasundan menampilkan 500 pendekar silat Jampang, pertunjukan tari jaipong massal, calung, dan pawai dongdang desa.',
    content: `
<p>Pemerintah Kecamatan Surade bersama para budayawan Pajampangan menggelar <strong>Pajampangan Surade Culture & Art Festival 2026</strong> di Lapangan Lodaya Setra. Acara ini merayakan kekayaan seni tutur, silat tradisional, dan kriya khas masyarakat Jampang.</p>

<h3>Sorotan Acara:</h3>
<ul>
  <li><strong>Parade Silat 1000 Jurus Jampang:</strong> Atraksi seni pencak silat dari berbagai padepokan perguruan silat se-Kabupaten Sukabumi.</li>
  <li><strong>Pawai Dongdang Hasil Bumi:</strong> Arak-arakan gunungan hasil tani buah, kelapa, dan padi dari 12 desa se-Kecamatan Surade.</li>
  <li><strong>Panggung Gamelan & Jaipongan:</strong> Kolaborasi seniman muda dan dalang sepuh melestarikan karawitan Sunda.</li>
</ul>
`,
    queries: [
      'festival seni budaya sukabumi jampang',
      'karnaval seni budaya tatar sunda sukabumi',
      'pencak silat jampang festival sukabumi',
      'pawai budaya sunda sukabumi'
    ],
    published_at: '2026-09-20 11:00:00',
    event_date: '2026-11-08 08:30:00',
    event_end_date: '2026-11-10 21:00:00',
    event_location: 'Alun-Alun & Lapangan Lodaya Setra, Kelurahan Surade'
  },
  {
    index: 13,
    type: 'event',
    title: 'Gelar Bazar Kuliner Tradisional & Pameran UMKM Se-Kecamatan Surade',
    category: 'Kuliner & Kafe',
    excerpt: 'Pesta kuliner khas Pajampangan menghadirkan 70 stand UMKM olahan opak, gula semut, kue jojorong, soto jampang, dan kerajinan bambu.',
    content: `
<p>Dukung pertumbuhan ekonomi lokal dan nikmati aneka sajian lezat dalam <strong>Bazar Kuliner Tradisional & Pameran Produk UMKM Surade</strong> yang berlangsung selama 3 hari penuh di halaman Kantor Kecamatan Surade.</p>

<h3>Aktivitas Menarik:</h3>
<ul>
  <li><strong>Live Cooking Soto Jampang Kuali Raksasa:</strong> Demo memasak soto daging kuah rempah kuning oleh koki legendaris Surade.</li>
  <li><strong>Etalase Produk Olahan Desa:</strong> Menampilkan aneka cemilan opak ketan, rengginang, keripik pisang, madu hutan, dan kopi robusta Jampang.</li>
  <li><strong>Diskon dan Promo Menarik:</strong> Dapatkan voucher potongan harga khusus transaksi via aplikasi Surade.com.</li>
</ul>
`,
    queries: [
      'bazar kuliner umkm sukabumi pasar rakyat',
      'pameran umkm kuliner jawa barat',
      'stand bazar makanan tradisional sunda sukabumi',
      'festival kuliner umkm indonesia'
    ],
    published_at: '2026-09-18 14:00:00',
    event_date: '2026-11-20 09:00:00',
    event_end_date: '2026-11-22 21:00:00',
    event_location: 'Halaman Kantor Kecamatan Surade, Jl. Raya Surade No. 42'
  },
  {
    index: 14,
    type: 'event',
    title: 'Geopark Ciletuh - Surade Adventure Trail Run & Fun Walk 2026',
    category: 'Event & Festival',
    excerpt: 'Lomba lari lintas alam 10K dan jalan sehat keluarga melintasi rute perbukitan hijau, mulut Gua Sungging, dan panorama alam tebing karst.',
    content: `
<p>Tantang stamina Anda sambil menikmati keasrian alam pedesaan dalam ajang <strong>Surade Adventure Trail Run & Fun Walk 2026</strong>. Rute lari menyusuri jalan setapak perkebunan cengkeh, perbukitan karst Gunungsungging, dan hamparan sawah bertingkat.</p>

<h3>Kategori Lomba:</h3>
<ul>
  <li><strong>Trail Run 10K (Kategori Dewasa):</strong> Jalur teknikal menanjak melewati bebatuan karst dan rintangan alam dengan total hadiah belasan juta rupiah.</li>
  <li><strong>Fun Walk 5K (Kategori Keluarga):</strong> Jalan santai menyenangkan bersama keluarga melintasi desa asri dan sentra kriya anyaman bambu.</li>
  <li><strong>Medali Finisher & Jersey Eksklusif:</strong> Fasilitas lengkap termasuk pos hidrasi air mineral dan buah segar di setiap 2,5 km.</li>
</ul>
`,
    queries: [
      'trail run geopark ciletuh sukabumi',
      'fun walk petualangan ciletuh sukabumi',
      'lari lintas alam perbukitan sukabumi',
      'event lari trail run jawa barat'
    ],
    published_at: '2026-09-15 16:00:00',
    event_date: '2026-12-05 06:30:00',
    event_end_date: '2026-12-05 14:00:00',
    event_location: 'Kawasan Wisata Gua Sungging, Desa Gunungsungging, Kec. Surade'
  },
  {
    index: 15,
    type: 'event',
    title: 'Workshop & Pelatihan Digitalisasi Produk UMKM Surade Menuju Marketplace Global',
    category: 'Pendidikan & Edukasi',
    excerpt: 'Pelatihan intensif gratis untuk 100 pelaku usaha mikro: teknik foto produk smartphone, copywriting promosi WhatsApp, dan manajemen toko digital.',
    content: `
<p>Tingkatkan kapasitas bisnis lokal Anda melalui <strong>Workshop Digital Marketing & Fotografi Produk UMKM Surade 2026</strong> yang diselenggarakan oleh Dinas Koperasi UKM bekerjasama dengan platform Surade.com.</p>

<h3>Materi Pelatihan:</h3>
<ul>
  <li><strong>Fotografi Produk dengan Ponsel Pintar:</strong> Memanfaatkan pencahayaan alami dan properti mini studio untuk foto produk berkualitas katalog profesional.</li>
  <li><strong>Optimasi Profil Usaha & SEO Lokal:</strong> Cara mendaftarkan tempat usaha dan katalog produk agar mudah ditemukan calon pembeli di mesin pencari.</li>
  <li><strong>Fasilitas:</strong> Sertifikat pelatihan resmi, modul panduan praktis, mini lightbox foto produk, dan pendampingan bisnis gratis.</li>
</ul>
`,
    queries: [
      'pelatihan digital marketing umkm sukabumi',
      'workshop foto produk umkm jawa barat',
      'pelatihan kewirausahaan umkm dinas koperasi sukabumi',
      'workshop bisnis digital umkm indonesia'
    ],
    published_at: '2026-09-13 10:30:00',
    event_date: '2026-12-12 08:30:00',
    event_end_date: '2026-12-13 16:00:00',
    event_location: 'Aula Serbaguna SMAN 1 Surade, Kelurahan Surade'
  },
  {
    index: 16,
    type: 'event',
    title: 'Panen Raya & Pesta Tani Mina Padi Desa Sukatani 2027',
    category: 'Event & Festival',
    excerpt: 'Perayaan keberhasilan panen raya padi organik bersama para petani, lomba tangkap ikan mas di petak sawah, dan kenduri syukuran tumpeng tani.',
    content: `
<p>Saksikan kemeriahan <strong>Pesta Tani & Panen Raya Mina Padi 2027</strong> di hamparan sawah hijau Desa Sukatani. Acara tahunan ini menjadi wujud rasa syukur atas keberhasilan panen padi organik dan budidaya ikan air tawar.</p>

<h3>Aktivitas Pesta Tani:</h3>
<ul>
  <li><strong>Lomba 'Ngagubyag' Tangkap Ikan di Sawah:</strong> Keseruan warga menangkap ratusan kilogram ikan nila dan mas di petak sawah tanpa jaring.</li>
  <li><strong>Bazar Beras Organik & Ikan Segar:</strong> Penjualan beras organik hasil panen langsung dari petani dengan harga spesial.</li>
  <li><strong>Makan Bersama Nasi Liwet Tumpeng Sawah:</strong> Menikmati hidangan nasi liwet hangat beralaskan daun pisang di pematang sawah.</li>
</ul>
`,
    queries: [
      'panen raya padi mina padi sukabumi',
      'pesta tani panen raya sukabumi',
      'lomba tangkap ikan ngagubyag sawah kolam sunda sukabumi',
      'panen raya padi sawah petani sukabumi'
    ],
    published_at: '2026-09-10 13:00:00',
    event_date: '2027-01-18 08:00:00',
    event_end_date: '2027-01-19 17:00:00',
    event_location: 'Kawasan Agrowisata Mina Padi Desa Sukatani, Kec. Surade'
  },
  {
    index: 17,
    type: 'event',
    title: 'Lomba Dayung Perahu Tradisional & Mancing Mania Muara Cikarang Surade',
    category: 'Event & Festival',
    excerpt: 'Adu kecepatan perahu dayung nelayan tradisional melintasi muara dan kompetisi memancing ikan muara berhadiah jutaan rupiah.',
    content: `
<p>Menyambut musim angin teduh di muara sungai pesisir selatan, digelar turnamen <strong>Lomba Dayung Perahu Tradisional & Mancing Mania Muara Cikarang 2027</strong> di kawasan muara pantai Minajaya.</p>

<h3>Agenda Perlombaan:</h3>
<ul>
  <li><strong>Lomba Dayung Perahu Kayu 2 Pendayung:</strong> Ketangkasan mengendalikan perahu tradisional menembus arus muara.</li>
  <li><strong>Turnamen Mancing Ikan Mangrove Jack & Kakap Putih:</strong> Perlombaan strike terberat ikan muara dengan kategori master dan pemula.</li>
  <li><strong>Pentas Musik Pesisir & Kuliner Tepi Muara:</strong> Hiburan akustik dan jajanan es kelapa muda di pinggir muara.</li>
</ul>
`,
    queries: [
      'lomba perahu dayung tradisional indonesia',
      'mancing mania muara muara pantai sukabumi',
      'lomba perahu nelayan tradisional muara sungai',
      'turnamen mancing pantai pesisir muara'
    ],
    published_at: '2026-09-08 15:00:00',
    event_date: '2027-02-14 07:00:00',
    event_end_date: '2027-02-14 17:30:00',
    event_location: 'Muara Sungai Cikarang & Pesisir Pantai Minajaya, Kec. Surade'
  },
  {
    index: 18,
    type: 'event',
    title: 'Kemah Bakti Pemuda & Konservasi Penyu Pesisir Pantai Selatan Sukabumi',
    category: 'Pendidikan & Edukasi',
    excerpt: 'Aksi peduli lingkungan: bersih pantai pesisir, penanaman 1.000 bibit cemara laut & mangrove, serta edukasi pelepasan tukik penyu ke samudera.',
    content: `
<p>Ajak generasi muda dan komunitas pecinta alam dalam aksi nyata pelestarian alam bertajuk <strong>Kemah Bakti & Konservasi Pesisir Pantai Selatan 2027</strong> yang diselenggarakan oleh Generasi Peduli Lingkungan Surade.</p>

<h3>Program Aksi Lingkungan:</h3>
<ul>
  <li><strong>Beach Clean Up Massal:</strong> Pembersihan sampah anorganik di sepanjang 3 kilometer bibir pantai pesisir.</li>
  <li><strong>Penanaman Pohon Cemara Laut & Mangrove:</strong> Upaya mitigasi abrasi pantai di kawasan muara sungai.</li>
  <li><strong>Edukasi & Pelepasan Tukik Penyu:</strong> Melepas ratusan anak penyu hijau ke laut lepas bersama petugas balai konservasi.</li>
  <li><strong>Malam Keakraban Api Unggun & Diskusi Ekologi:</strong> Diskusi peran pemuda dalam pariwisata berkelanjutan (ecotourism).</li>
</ul>
`,
    queries: [
      'kemah konservasi penyu pangumbahan sukabumi',
      'pelepasan tukik penyu pesisir sukabumi',
      'penanaman mangrove pantai pesisir sukabumi',
      'aksi bersih pantai pemuda sukabumi'
    ],
    published_at: '2026-09-05 09:30:00',
    event_date: '2027-03-06 08:00:00',
    event_end_date: '2027-03-08 12:00:00',
    event_location: 'Bumi Perkemahan Pasiripis & Kawasan Konservasi Pesisir Surade'
  },
  {
    index: 19,
    type: 'event',
    title: 'Pemeriksaan Kesehatan Gratis, Donor Darah & Khitanan Massal Puskesmas Surade',
    category: 'Kesehatan & Gaya Hidup',
    excerpt: 'Bakti sosial kesehatan terpadu: cek gula darah, tensi, konsultasi dokter spesialis anak, donor darah PMI, dan khitanan berkah 50 anak yatim.',
    content: `
<p>Dalam rangka Hari Bhakti Kesehatan Masyarakat, <strong>Puskesmas Surade</strong> bersama Ikatan Dokter Indonesia (IDI) menggelar bakti sosial pelayanan kesehatan terpadu gratis bagi seluruh warga Kecamatan Surade dan sekitarnya.</p>

<h3>Layanan Medis Gratis yang Disediakan:</h3>
<ul>
  <li><strong>Pemeriksaan Penyakit Tidak Menular (PTM):</strong> Skrining kolesterol, gula darah sewaktu, asam urat, dan konsultasi dokter umum.</li>
  <li><strong>Aksi Donor Darah Peduli Kemanusiaan:</strong> Bekerjasama dengan Unit Donor Darah PMI Sukabumi.</li>
  <li><strong>Khitanan Massal Berkah:</strong> Layanan sirkumsisi metode modern higienis bagi 50 anak disertai bingkisan baju koko, sarung, dan santunan pendidikan.</li>
  <li><strong>Penyuluhan Gizi & Stunting:</strong> Konseling nutrisi ibu hamil dan pemberian vitamin balita.</li>
</ul>
`,
    queries: [
      'pengobatan gratis baksos puskesmas sukabumi',
      'donor darah khitanan massal sukabumi',
      'pelayanan kesehatan gratis puskesmas jawa barat',
      'bakti sosial kesehatan pengobatan gratis warga'
    ],
    published_at: '2026-09-03 08:00:00',
    event_date: '2027-03-20 07:30:00',
    event_end_date: '2027-03-20 15:00:00',
    event_location: 'Halaman Gedung Puskesmas Surade & Aula Kelurahan Surade'
  },
  {
    index: 20,
    type: 'event',
    title: 'Turnamen Sepak Bola Antar Desa \'Surade Champion Cup 2027\'',
    category: 'Event & Festival',
    excerpt: 'Kompetisi sepak bola bergengsi memperebutkan Piala Camat Surade mempertemukan kesebelasan terbaik dari 12 desa se-Kecamatan Surade.',
    content: `
<p>Ajang olahraga paling dinanti masyarakat Pajampangan, <strong>Turnamen Sepak Bola Surade Champion Cup 2027</strong>, kembali bergulir di Lapangan Lodaya Setra Surade. Turnamen ini menjadi wadah unjuk bakat pesepakbola muda potensial daerah.</p>

<h3>Format dan Jadwal Turnamen:</h3>
<ul>
  <li><strong>Peserta:</strong> 16 tim kesebelasan perwakilan desa dan kelurahan se-Kecamatan Surade.</li>
  <li><strong>Sistem Pertandingan:</strong> Babak penyisihan grup dilanjutkan dengan sistem gugur hingga partai final akbar.</li>
  <li><strong>Fasilitas:</strong> Tribun penonton tertata rapi, tim medis siaga, dan bazar jajanan UMKM di area luar stadion.</li>
</ul>
`,
    queries: [
      'turnamen sepak bola antar desa sukabumi',
      'pertandingan sepak bola liga desa lodaya surade',
      'turnamen bola piala camat sukabumi',
      'sepak bola lapangan lodaya sukabumi'
    ],
    published_at: '2026-09-01 10:00:00',
    event_date: '2027-04-10 14:00:00',
    event_end_date: '2027-04-25 18:00:00',
    event_location: 'Stadion & Lapangan Lodaya Setra, Kelurahan Surade'
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
          if (buffer.length < 5000) {
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

async function run() {
  console.log(`Starting real images fetching for 10 Blogs and 10 Events...`);

  const results = [];

  for (const item of BLOGS_AND_EVENTS) {
    console.log(`\n========================================`);
    console.log(`[${item.index}/20] [${item.type.toUpperCase()}] ${item.title}`);

    let candidateUrls = [];
    for (const q of item.queries) {
      const urls = await searchBingImages(q);
      candidateUrls.push(...urls);
      await new Promise(r => setTimeout(r, 200));
    }
    candidateUrls = [...new Set(candidateUrls)];
    console.log(`Found ${candidateUrls.length} candidate URLs from web queries.`);

    let downloadedThumbnail = null;
    let urlIndex = 0;
    const filename = `${item.type}_${item.index}_thumb.jpg`;

    while (urlIndex < candidateUrls.length && !downloadedThumbnail) {
      const url = candidateUrls[urlIndex++];
      const ok = await downloadImage(url, filename);
      if (ok) {
        downloadedThumbnail = `blogs/real_images/${filename}`;
        console.log(`  ✅ Downloaded Image from: ${url}`);
      }
    }

    if (!downloadedThumbnail) {
      console.warn(`  ⚠️ Warning: Could not download image for ${item.title}`);
      downloadedThumbnail = `blogs/real_images/${filename}`;
    }

    results.push({
      ...item,
      thumbnail: downloadedThumbnail
    });
  }

  // Save to JSON
  const jsonPath = path.join(__dirname, '../real_downloaded_blogs.json');
  fs.writeFileSync(jsonPath, JSON.stringify(results, null, 2));
  console.log(`\n🎉 Successfully fetched and saved 20 real Blogs & Events to ${jsonPath}!`);
}

run();
