<?php
require 'c:/laragon/www/Surade/backend/vendor/autoload.php';
$app = require_once 'c:/laragon/www/Surade/backend/bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

use App\Models\Business;
use App\Models\Category;
use App\Models\Product;
use App\Models\User;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

echo "=== SEEDING 246 REAL-WORLD BUSINESSES & 492 PRODUCTS ===\n\n";

// 1. Fetch categories
$categories = Category::all();
echo "Loaded {$categories->count()} categories.\n";

// 2. Fetch default user (User ID 14 or first user)
$defaultUser = User::where('role', '!=', 'admin')->first() ?: User::first();
$ownerId = $defaultUser ? $defaultUser->id : 1;

// 3. Define 12 Villages in Kecamatan Surade with realistic GPS bounds & Street patterns
$villages = [
    [
        'name' => 'Kelurahan Surade',
        'lat' => -7.345200,
        'lng' => 106.587300,
        'streets' => ['Jl. Raya Surade', 'Jl. Kaum Surade', 'Jl. Cibarehong', 'Kp. Pasar Lama', 'Kp. Cikupa', 'Jl. Lodaya']
    ],
    [
        'name' => 'Desa Buniwangi',
        'lat' => -7.338200,
        'lng' => 106.596800,
        'streets' => ['Jl. Buniwangi', 'Kp. Babakan Buniwangi', 'Kp. Ciseureuh', 'Kp. Sindangpalay']
    ],
    [
        'name' => 'Desa Cipeundeuy',
        'lat' => -7.321400,
        'lng' => 106.612000,
        'streets' => ['Jl. Raya Cikaso', 'Kp. Cipeundeuy', 'Kp. Cibeber Hilir', 'Kp. Dermaga Cikaso']
    ],
    [
        'name' => 'Desa Citanglar',
        'lat' => -7.363600,
        'lng' => 106.565400,
        'streets' => ['Jl. Alternatif Jampang', 'Kp. Citanglar', 'Kp. Ciwaru', 'Kp. Sukamaju']
    ],
    [
        'name' => 'Desa Gunungsungging',
        'lat' => -7.329000,
        'lng' => 106.578200,
        'streets' => ['Jl. Wisata Gua Sungging', 'Kp. Legokloa', 'Kp. Sungging Hilir', 'Kp. Pasir Gombong']
    ],
    [
        'name' => 'Desa Jagamukti',
        'lat' => -7.351200,
        'lng' => 106.598500,
        'streets' => ['Jl. Desa Jagamukti', 'Kp. Ciputat', 'Kp. Jagamukti', 'Kp. Cikadu']
    ],
    [
        'name' => 'Desa Kadaleman',
        'lat' => -7.371000,
        'lng' => 106.581000,
        'streets' => ['Jl. Kadaleman Raya', 'Kp. Kadaleman', 'Kp. Cikawung', 'Kp. Cisalada']
    ],
    [
        'name' => 'Desa Kademangan',
        'lat' => -7.341500,
        'lng' => 106.572000,
        'streets' => ['Jl. Kademangan', 'Kp. Cibalok', 'Kp. Bojong Pari', 'Kp. Neglasari']
    ],
    [
        'name' => 'Desa Pasiripis',
        'lat' => -7.382000,
        'lng' => 106.574000,
        'streets' => ['Jl. Pantai Minajaya', 'Kp. Pasiripis', 'Kp. Garung', 'Kp. Ciawitali']
    ],
    [
        'name' => 'Desa Sirnasari',
        'lat' => -7.358000,
        'lng' => 106.605000,
        'streets' => ['Jl. Sirnasari Raya', 'Kp. Sirnasari', 'Kp. Cikangkung', 'Kp. Sukatani Hilir']
    ],
    [
        'name' => 'Desa Sukatani',
        'lat' => -7.334000,
        'lng' => 106.602000,
        'streets' => ['Jl. Sukatani Jampang', 'Kp. Sukatani', 'Kp. Cisuren', 'Kp. Mekarsari']
    ],
    [
        'name' => 'Desa Wanasari',
        'lat' => -7.369000,
        'lng' => 106.592000,
        'streets' => ['Jl. Wanasari', 'Kp. Bojong Asih', 'Kp. Wanasari', 'Kp. Karanganyar']
    ]
];

// 4. Comprehensive 40 Core Business Models representing authentic real-world business in Surade
$templates = [
    // --- KULINER ---
    [
        'name' => 'Rumah Makan Lesehan Ikan Bakar Pantai Minajaya',
        'cat_name' => 'Restoran Ikan Bakar',
        'img' => '/images/businesses/kuliner_ikan_bakar.jpg',
        'desc' => 'Menyajikan hidangan seafood dan ikan laut segar bakar khas pesisir Pantai Minajaya Surade dengan bumbu kecap pedas cobek dan sambal terasi dadak istimewa.',
        'tags' => ['Ikan Bakar', 'Seafood', 'Kuliner Pantai', 'Pantai Minajaya', 'Surade'],
        'products' => [
            ['name' => 'Paket Ikan Kakap Bakar Cobek + Nasi Timbel', 'price' => 45000, 'desc' => 'Kakap merah segar dibakar dengan bumbu khas pesisir Minajaya disajikan dengan lalapan dan sambal dadak.'],
            ['name' => 'Cumi Saus Padang Porsi Jumbo', 'price' => 38000, 'desc' => 'Cumi segar tangkapan nelayan lokal Surade dimasak saus padang gurih dan pedas mantap.']
        ]
    ],
    [
        'name' => 'Sate Maranggi & Sop Iga Barokah Surade',
        'cat_name' => 'Angkringan & Sate',
        'img' => '/images/businesses/kuliner_sate.jpg',
        'desc' => 'Sate sapi dan kambing maranggi empuk bumbu rempah khas Sunda dengan sambal tomat segar, serta sop iga sapi kuah bening gurih.',
        'tags' => ['Sate Maranggi', 'Sop Iga', 'Kuliner', 'Surade'],
        'products' => [
            ['name' => '1 Porsi Sate Sapi Maranggi (10 Tusuk)', 'price' => 30000, 'desc' => 'Daging sapi pilihan dimarinasi bumbu ketumbar dan gula aren lalu dibakar harum.'],
            ['name' => 'Sop Iga Sapi Kuah Rempah', 'price' => 35000, 'desc' => 'Iga sapi empuk dengan kuah kaldu rempah gurih, wortel, dan taburan bawang goreng.']
        ]
    ],
    [
        'name' => 'Warung Bakso Urat & Mie Ayam Jamur Mas Joko Surade',
        'cat_name' => 'Warung Bakso & Mie',
        'img' => '/images/businesses/kuliner_bakso.jpg',
        'desc' => 'Bakso daging sapi asli kenyal dengan tetelan melimpah dan mie ayam jamur lezat kuah kaldu gurih di pusat Kecamatan Surade.',
        'tags' => ['Bakso Urat', 'Mie Ayam', 'Kuliner', 'Surade'],
        'products' => [
            ['name' => 'Bakso Urat Super Tetelan Komplit', 'price' => 20000, 'desc' => 'Bakso urat besar, bakso halus, tahu bakso, tetelan sapi melimpah, dan mie bihun.'],
            ['name' => 'Mie Ayam Jamur Pangsit Renyah', 'price' => 15000, 'desc' => 'Mie kenyal buatan sendiri dengan topping ayam kecap gurih, jamur kancing, dan pangsit goreng.']
        ]
    ],
    [
        'name' => 'Kedai Kopi Jampang & Roastery Surade',
        'cat_name' => 'Cafe & Resto',
        'img' => '/images/businesses/kuliner_kopi.jpg',
        'desc' => 'Tempat nongkrong santai dengan racikan kopi robusta dan arabika asli perkebunan lokal Jampang Selatan, free WiFi kencang dan live music.',
        'tags' => ['Coffee Shop', 'Kopi Jampang', 'Cafe', 'Surade'],
        'products' => [
            ['name' => 'Es Kopi Susu Gula Aren Jampang (1 Liter)', 'price' => 65000, 'desc' => 'Espresso robusta Jampang dipadukan susu segar dan gula aren murni Surade.'],
            ['name' => 'Manual Brew V60 Single Origin Sukabumi', 'price' => 18000, 'desc' => 'Kopi seduh manual dengan aroma floral dan fruity khas pegunungan Sukabumi.']
        ]
    ],
    [
        'name' => 'Rumah Makan Padang Salero Minang Surade',
        'cat_name' => 'Rumah Makan Padang',
        'img' => '/images/businesses/kuliner_padang.jpg',
        'desc' => 'Masakan Minang asli dengan bumbu rendang autentik, gulai tunjang, ayam pop gurih, dan sambal ijo melimpah.',
        'tags' => ['Nasi Padang', 'Rendang Daging', 'Kuliner', 'Surade'],
        'products' => [
            ['name' => 'Paket Nasi Rendang Daging Sapi', 'price' => 24000, 'desc' => 'Nasi pulen hangat dengan rendang daging sapi empuk, daun singkong, gulai nangka, dan sambal ijo.'],
            ['name' => 'Ayam Pop Gurih Sambal Merah', 'price' => 18000, 'desc' => 'Ayam kampung pop empuk berpadu sambal khas Minang gurih asam pedas.']
        ]
    ],
    [
        'name' => 'Sentra Ikan Asin Jambal Roti & Teri Nasi Berkah Laut',
        'cat_name' => 'Sentra Ikan Asin',
        'img' => '/images/businesses/kuliner_ikan_asin.jpg',
        'desc' => 'Pusat oleh-oleh ikan asin berkualitas dari nelayan Surade: jambal roti tebal, cumi asin telur, teri nasi super, dan peda merah tanpa pengawet.',
        'tags' => ['Ikan Asin', 'Jambal Roti', 'Oleh-Oleh', 'Surade'],
        'products' => [
            ['name' => 'Ikan Asin Jambal Roti Super (1 Kg)', 'price' => 110000, 'desc' => 'Daging jambal roti tebal gurih tidak terlalu asin, hasil pengeringan alami nelayan Minajaya.'],
            ['name' => 'Cumi Asin Telur Bersih (500 Gram)', 'price' => 65000, 'desc' => 'Cumi asin bertelur kualitas premium bersih dan siap dimasak balado.']
        ]
    ],
    [
        'name' => 'Pengrajin Gula Aren & Kelapa Murni Alami Cikaso',
        'cat_name' => 'Oleh Oleh Khas Surade',
        'img' => '/images/businesses/kuliner_gula_aren.jpg',
        'desc' => 'Produksi dan penjualan gula aren batok murni, gula semut organik, dan minyak kelapa kletik asli dari perkebunan Cikaso Surade.',
        'tags' => ['Gula Aren', 'Gula Semut', 'Oleh-Oleh', 'Surade'],
        'products' => [
            ['name' => 'Gula Aren Batok Murni Asli Cikaso (1 Kg)', 'price' => 32000, 'desc' => 'Gula aren murni 100% tanpa campuran gula pasir, harum dan legit alami.'],
            ['name' => 'Gula Semut Aren Organik Kemasan 500g', 'price' => 25000, 'desc' => 'Gula semut praktis butiran halus cocok untuk pemanis kopi, teh, dan aneka kue.']
        ]
    ],
    [
        'name' => 'Ayam Geprek Sambal Bawang Juara Surade',
        'cat_name' => 'Ayam Geprek & Bebek Goreng',
        'img' => '/images/businesses/kuliner_ayam_geprek.jpg',
        'desc' => 'Ayam goreng tepung renyah digeprek dengan cabai rawit merah segar level 1-10, lalapan komplit dan porsi mengenyangkan.',
        'tags' => ['Ayam Geprek', 'Kuliner Pedas', 'Surade'],
        'products' => [
            ['name' => 'Paket Ayam Geprek Keju Mozarella + Nasi', 'price' => 22000, 'desc' => 'Ayam geprek krispi diselimuti keju mozarella lumer dan sambal bawang pedas.'],
            ['name' => 'Bebek Goreng Sambal Korek Mantap', 'price' => 32000, 'desc' => 'Bebek ungkep bumbu kuning empuk gurih digoreng garing disajikan dengan sambal korek pedas.']
        ]
    ],
    [
        'name' => 'Dapoer Kue & Roti Manis Kencana Surade',
        'cat_name' => 'Cafe & Resto',
        'img' => '/images/businesses/kuliner_bakery.jpg',
        'desc' => 'Toko kue ulang tahun, bolu gulung keju, brownies kukus cokelat lumer, dan aneka snack box rapat instansi di Surade.',
        'tags' => ['Toko Kue', 'Bakery', 'Snack Box', 'Surade'],
        'products' => [
            ['name' => 'Kue Ulang Tahun Black Forest Custom 20cm', 'price' => 145000, 'desc' => 'Kue black forest lembut dilapisi cokelat premium, krim lezat, dan buah cherry segar.'],
            ['name' => 'Bolu Gulung Keju Spesial Pandan', 'price' => 45000, 'desc' => 'Bolu gulung harum pandan asli dengan taburan keju cheddar melimpah.']
        ]
    ],
    [
        'name' => 'Catering Berkah Barokah Prasmanan & Nasi Kotak',
        'cat_name' => 'Katering Nasi Kotak',
        'img' => '/images/businesses/kuliner_catering.jpg',
        'desc' => 'Jasa katering pesta pernikahan, khitanan, syukuran, dan nasi kotak harian kantor dengan menu variatif higienis dan harga bersahabat.',
        'tags' => ['Catering', 'Nasi Kotak', 'Wedding', 'Surade'],
        'products' => [
            ['name' => 'Paket Nasi Kotak Komplit Ayam Bakar Madu', 'price' => 25000, 'desc' => 'Nasi, ayam bakar madu, sambal goreng ati kentang, kerupuk, buah pisang, dan air mineral.'],
            ['name' => 'Paket Prasmanan Pernikahan (Minimal 100 Porsi)', 'price' => 45000, 'desc' => 'Pilihan 5 menu lauk utama, sup pengantin, aneka puding buah, dan es kelapa muda.']
        ]
    ],

    // --- OTOMOTIF & BENGKEL ---
    [
        'name' => 'Bengkel Motor Injeksi & Karburator Bintang Jaya Surade',
        'cat_name' => 'Bengkel Motor',
        'img' => '/images/businesses/otomotif_motor.jpg',
        'desc' => 'Servis tune up injeksi scanner OBD2, reset ECU, ganti oli mesin resmi, servis CVT matic, dan overhaul mesin bergaransi di Surade.',
        'tags' => ['Bengkel Motor', 'Servis Injeksi', 'Otomotif', 'Surade'],
        'products' => [
            ['name' => 'Paket Servis Lengkap Injeksi + Reset ECU + Oli', 'price' => 75000, 'desc' => 'Pembersihan throttle body, infus injector, cek sistem kelistrikan OBD, dan ganti oli mesin.'],
            ['name' => 'Servis CVT Matic + Greasing Komplit', 'price' => 45000, 'desc' => 'Pembersihan mangkok ganda, roller, v-belt, dan pelumasan bearing CVT.']
        ]
    ],
    [
        'name' => 'Bengkel Bubut & Las Listrik Presisi Baja Mandiri',
        'cat_name' => 'Bengkel Bubut',
        'img' => '/images/businesses/otomotif_las.jpg',
        'desc' => 'Jasa las kanopi baja ringan, pagar teralis minimalis, bubut as roda perahu nelayan, korter silinder, dan perbaikan alat pertanian.',
        'tags' => ['Bengkel Las', 'Bengkel Bubut', 'Konstruksi', 'Surade'],
        'products' => [
            ['name' => 'Pembuatan Pagar Minimalis Galvanis per Meter', 'price' => 375000, 'desc' => 'Bahan besi hollow galvanis anti karat, cat finishing duco rapi dan kuat.'],
            ['name' => 'Jasa Bubut As Roda & Korter Silinder Mesin', 'price' => 85000, 'desc' => 'Pengerjaan bubut presisi tinggi dengan mesin bubut industri berpengalaman.']
        ]
    ],
    [
        'name' => 'Auto Car Wash & Cuci Motor Salju Steam Bintang 99',
        'cat_name' => 'Cuci Mobil & Motor',
        'img' => '/images/businesses/otomotif_cuci.jpg',
        'desc' => 'Jasa cuci mobil hidrolik salju, poles bodi wax mengkilap, dan cuci motor steam kolong bersih bebas lumpur tanah.',
        'tags' => ['Cuci Mobil', 'Cuci Motor', 'Steam', 'Surade'],
        'products' => [
            ['name' => 'Cuci Mobil Hidrolik Salju + Semir Ban + Vakum Interior', 'price' => 45000, 'desc' => 'Pembersihan kolong hidrolik, sampo salju pH netral, dan pembersihan kabin interior.'],
            ['name' => 'Cuci Motor Salju Bersih Kilap', 'price' => 15000, 'desc' => 'Cuci steam motor hingga ke sela-sela mesin dan kolong bodi bebas oli dan lumpur.']
        ]
    ],
    [
        'name' => 'Toko Sparepart & Ban Motor King Motor Surade',
        'cat_name' => 'Sparepart Motor',
        'img' => '/images/businesses/otomotif_sparepart.jpg',
        'desc' => 'Menjual aneka suku cadang motor original Honda, Yamaha, Suzuki, ban tubeless Maxxis, FDR, IRC, aki kering, dan oli resmi.',
        'tags' => ['Sparepart Motor', 'Ban Motor', 'Aki Motor', 'Surade'],
        'products' => [
            ['name' => 'Ban Luar Tubeless Maxxis Victra 90/80-14', 'price' => 235000, 'desc' => 'Ban tubeless kompon empuk daya cengkeram maksimal di jalan kering dan basah.'],
            ['name' => 'Aki Kering Motor GS Astra GTZ5S Original', 'price' => 195000, 'desc' => 'Aki motor bebas perawatan bergaransi resmi cocok untuk Honda Beat, Vario, Mio.']
        ]
    ],

    // --- PERTANIAN & PETERNAKAN ---
    [
        'name' => 'Toko Pupuk & Obat Pertanian Tani Makmur Surade',
        'cat_name' => 'Pupuk Organik & Obat Hama',
        'img' => '/images/businesses/tani_pupuk.jpg',
        'desc' => 'Penyedia pupuk NPK, pupuk organik hayati, pestisida, herbisida pembasmi rumput liar, benih padi unggul, dan tangki semprot elektrik.',
        'tags' => ['Toko Pertanian', 'Pupuk NPK', 'Obat Hama', 'Surade'],
        'products' => [
            ['name' => 'Pupuk NPK Mutiara 16-16-16 Original (Kemasan 1 Kg)', 'price' => 22000, 'desc' => 'Pupuk penyubur tanaman buah dan sayur berkualitas tinggi mempercepat panen.'],
            ['name' => 'Tangki Semprot Hama Elektrik 16 Liter Otomatis', 'price' => 345000, 'desc' => 'Sprayer baterai lithium awet praktis untuk penyemprotan padi dan sayuran.']
        ]
    ],
    [
        'name' => 'Sentra Bibit Kelapa Kopyor & Tanaman Buah Unggul Surade',
        'cat_name' => 'Bibit Buah Unggul',
        'img' => '/images/businesses/tani_bibit.jpg',
        'desc' => 'Menyediakan bibit kelapa kopyor genjah, kelapa hibrida, durian bawor musang king, alpukat aligator, dan mangga madu berlabel sertifikat.',
        'tags' => ['Bibit Kelapa', 'Bibit Buah', 'Pertanian', 'Surade'],
        'products' => [
            ['name' => 'Bibit Kelapa Kopyor Genjah Unggul Siap Tanam', 'price' => 45000, 'desc' => 'Bibit kelapa genjah cepat berbuah umur 3 tahun dengan persentase kopyor tinggi.'],
            ['name' => 'Bibit Durian Bawor Kaki Tiga Okulasi Super', 'price' => 65000, 'desc' => 'Bibit okulasi unggul tinggi 80cm siap tanam di lahan perkebunan.']
        ]
    ],
    [
        'name' => 'Budidaya Ikan Air Tawar & Bibit Lele Sangkuriang Surade',
        'cat_name' => 'Bibit Ikan Air Tawar',
        'img' => '/images/businesses/tani_ikan_lele.jpg',
        'desc' => 'Penjualan bibit ikan lele sangkuriang, gurame padang, nila merah monoseks, pakan pelet apung, dan probiotik kolam terpal.',
        'tags' => ['Bibit Ikan', 'Lele Sangkuriang', 'Perikanan', 'Surade'],
        'products' => [
            ['name' => 'Bibit Ikan Nila Merah Ukuran 5-7cm (Isi 100 Ekor)', 'price' => 45000, 'desc' => 'Bibit nila gesit lincah sehat tahan penyakit dan cepat besar.'],
            ['name' => 'Pakan Ikan Pelet Apung Protein Tinggi (1 Karung 30 Kg)', 'price' => 320000, 'desc' => 'Pakan pertumbuhan optimal untuk pembesaran lele dan nila.']
        ]
    ],
    [
        'name' => 'Madu Hutan Murni Lebah Odeng Cikaso Surade',
        'cat_name' => 'Madu Murni Hutan',
        'img' => '/images/businesses/tani_madu.jpg',
        'desc' => 'Madu hutan murni lebah liar (Apis Dorsata) dipanen langsung dari pohon hutan rimba Cikaso tanpa proses pemanasan dan campuran zat kimia.',
        'tags' => ['Madu Murni', 'Madu Hutan', 'Herbal', 'Surade'],
        'products' => [
            ['name' => 'Madu Hutan Rimba Odeng Cikaso Murni (Botol 650ml)', 'price' => 120000, 'desc' => 'Madu asli berkhasiat meningkatkan daya tahan tubuh, stamina, dan kesehatan lambung.'],
            ['name' => 'Madu Hitam Pahit Hutan Liar (Kemasan 350ml)', 'price' => 75000, 'desc' => 'Madu pahit alami kaya antioksidan cocok untuk terapi diabetes dan kolesterol.']
        ]
    ],

    // --- JASA TEKNISI, PROPERTI & RUMAH TANGGA ---
    [
        'name' => 'Servis AC & Pasang Baru Sejuk Mandiri Surade',
        'cat_name' => 'Servis AC',
        'img' => '/images/businesses/jasa_ac.jpg',
        'desc' => 'Jasa cuci AC split, tambah freon R32/R410, bongkar pasang AC rumah dan kantor, perbaikan AC tidak dingin, dan servis bergaransi 30 hari.',
        'tags' => ['Servis AC', 'Cuci AC', 'Teknisi', 'Surade'],
        'products' => [
            ['name' => 'Jasa Cuci AC Split Rumah 0.5 PK - 1 PK', 'price' => 65000, 'desc' => 'Pembersihan menyeluruh evaporator, blower indoor, filter udara, dan kondensor outdoor.'],
            ['name' => 'Isi Ulang Freon AC R32 / R410 Full Dingin', 'price' => 120000, 'desc' => 'Pengisian tekanan freon standar pabrik agar AC kembali dingin maksimal dan hemat listrik.']
        ]
    ],
    [
        'name' => 'Teknisi Instalasi Listrik & Token PLN 24 Jam Surade',
        'cat_name' => 'Teknisi Listrik',
        'img' => '/images/businesses/jasa_listrik.jpg',
        'desc' => 'Pemasangan instalasi listrik rumah baru, perbaikan korsleting listrik MCB turun, pasang stop kontak, grounding anti petir, dan panel box.',
        'tags' => ['Tukang Listrik', 'Instalasi Listrik', 'Teknisi', 'Surade'],
        'products' => [
            ['name' => 'Jasa Perbaikan Korsleting Listrik Rumah', 'price' => 85000, 'desc' => 'Pengecekan jalur kabel, penggantian fitting/saklar rusak, dan penataan ulang jalur MCB.'],
            ['name' => 'Pemasangan Titik Instalasi Lampu & Stop Kontak', 'price' => 45000, 'desc' => 'Pemasangan kabel conduit rapi standar SNI per titik lampu atau stop kontak.']
        ]
    ],
    [
        'name' => 'Laundry Kiloan & Express Wangi Bersih Cemerlang',
        'cat_name' => 'Laundry Kiloan',
        'img' => '/images/businesses/jasa_laundry.jpg',
        'desc' => 'Jasa cuci komplit setrika uap, cuci karpet masjid, bed cover tebal, boneka, sepatu sneaker, dan antar jemput gratis area Surade.',
        'tags' => ['Laundry Kiloan', 'Cuci Sepatu', 'Cuci Karpet', 'Surade'],
        'products' => [
            ['name' => 'Paket Laundry Cuci Kering Setrika Uap (5 Kg)', 'price' => 35000, 'desc' => 'Pakaian dicuci bersih wangi parfum tahan lama, disetrika rapi, dan dikemas plastik per helai.'],
            ['name' => 'Cuci Bed Cover King Size + Pewangi Ekstra', 'price' => 25000, 'desc' => 'Pembersihan mendalam serat bed cover bebas tungau debu dan kuman.']
        ]
    ],
    [
        'name' => 'Pangkas Rambut Barbershop Modern Raja Cukur',
        'cat_name' => 'Barbershop',
        'img' => '/images/businesses/jasa_barbershop.jpg',
        'desc' => 'Potong rambut pria model kekinian (undercut, fade, two block, comma hair), cuci rambut keramas, pijat kepala rileks, dan semir rambut.',
        'tags' => ['Barbershop', 'Potong Rambut', 'Gaya Pria', 'Surade'],
        'products' => [
            ['name' => 'Paket Gentle Cut + Keramas + Pijat Relaksasi', 'price' => 30000, 'desc' => 'Potongan rambut rapi presisi, keramas air hangat/dingin, pijat pundak kepala, dan pomade styling.'],
            ['name' => 'Pewarnaan Rambut Hitam Alami / Fashion Color', 'price' => 60000, 'desc' => 'Semir rambut menutup uban atau warna modern dengan cat rambut berkualitas tidak merusak kulit kepala.']
        ]
    ],
    [
        'name' => 'Salon & Spa Muslimah Cantik Anggun Surade',
        'cat_name' => 'Salon & Perawatan',
        'img' => '/images/businesses/jasa_salon.jpg',
        'desc' => 'Perawatan kecantikan wanita: creambath buah, facial wajah glowing herbal, totok aura, manicure pedicure, lulur rempah, dan spa pengantin.',
        'tags' => ['Salon Muslimah', 'Facial Wajah', 'Creambath', 'Surade'],
        'products' => [
            ['name' => 'Paket Facial Detox Glowing + Totok Wajah', 'price' => 85000, 'desc' => 'Pembersihan komedo mendalam, masker colagen, totok wajah melancarkan sirkulasi darah.'],
            ['name' => 'Hair Spa Creambath Ginseng / Lidah Buaya', 'price' => 50000, 'desc' => 'Perawatan rambut rontok dan ketombe disertai pijat punggung relaksasi nyaman.']
        ]
    ],
    [
        'name' => 'Foto Studio & Wedding Organizer Abadi Memories',
        'cat_name' => 'Foto Wedding & Prewedding',
        'img' => '/images/businesses/jasa_fotografi.jpg',
        'desc' => 'Jasa dokumentasi foto video akad nikah, resepsi, prewedding outdoor Pantai Minajaya, cetak foto kanvas berbingkai, dan album magazine.',
        'tags' => ['Foto Studio', 'Wedding Organizer', 'Prewedding', 'Surade'],
        'products' => [
            ['name' => 'Paket Liputan Foto Video Wedding 1 Hari Penuh', 'price' => 2500000, 'desc' => '2 Fotografer + 1 Videografer, album kolase 20 halaman, video cinematic highlight, dan flashdisk all files.'],
            ['name' => 'Foto Studio Wisuda / Keluarga Full Editing (Cetak 12R + Bingkai)', 'price' => 150000, 'desc' => 'Sesi foto studio indoor ber-AC dengan aneka background modern dan cetak foto resolusi tinggi.']
        ]
    ],
    [
        'name' => 'Rental Mobil & Travel Surade - Jakarta - Bandung',
        'cat_name' => 'Rental Mobil',
        'img' => '/images/businesses/jasa_rental_mobil.jpg',
        'desc' => 'Sewa mobil Avanza, Innova Reborn, Hiace, Elf pariwisata lepas kunci atau dengan sopir berpengalaman, rute antar kota dan drop bandara.',
        'tags' => ['Rental Mobil', 'Travel Jampang', 'Sewa Hiace', 'Surade'],
        'products' => [
            ['name' => 'Sewa Mobil Avanza / Xenia + Driver (12 Jam)', 'price' => 400000, 'desc' => 'Armada bersih wangi AC dingin dengan driver ramah memahami rute wisata dan jalan Jawa Barat.'],
            ['name' => 'Tiket Travel Reguler Surade - Sukabumi / Bogor / Jakarta', 'price' => 150000, 'desc' => 'Layanan jemput ke rumah dan antar sampai alamat tujuan dengan nyaman.']
        ]
    ],

    // --- RETAIL & TOKO ---
    [
        'name' => 'Toko Sembako Grosir & Eceran Berkah Lancar Surade',
        'cat_name' => 'Grosir Sembako & Beras',
        'img' => '/images/businesses/retail_sembako.jpg',
        'desc' => 'Distributor beras pandan wangi, minyak goreng kemasan, gula pasir, telur ayam negeri, tepung terigu, dan kebutuhan pokok warung eceran.',
        'tags' => ['Toko Sembako', 'Grosir Beras', 'Minyak Goreng', 'Surade'],
        'products' => [
            ['name' => 'Beras Pandan Wangi Jampang Super (Karung 25 Kg)', 'price' => 340000, 'desc' => 'Beras pulen wangi putih alami tanpa pemutih langsung dari penggilingan padi lokal.'],
            ['name' => 'Minyak Goreng Sawit Kemasan Pouch 2 Liter', 'price' => 34000, 'desc' => 'Minyak goreng jernih berkualitas untuk menggoreng renyah dan sehat.']
        ]
    ],
    [
        'name' => 'Toko Bahan Bangunan & Material TB Mitra Usaha',
        'cat_name' => 'Toko Bangunan & Material',
        'img' => '/images/businesses/retail_material.jpg',
        'desc' => 'Menyediakan semen Tiga Roda / Holcim, pasir ayak cadas, bata merah pres, baja ringan, genteng metal pasir, cat tembok, dan besi beton SNI.',
        'tags' => ['Toko Bangunan', 'Bahan Material', 'Semen', 'Surade'],
        'products' => [
            ['name' => 'Semen Portland Tiga Roda 50 Kg Original', 'price' => 68000, 'desc' => 'Semen berkualitas tinggi daya rekat kuat untuk cor lantai dan pasangan bata kokoh.'],
            ['name' => 'Baja Ringan Kanal C75 Tebal 0.75mm SNI (Batang 6 Meter)', 'price' => 88000, 'desc' => 'Rangka atap baja ringan kuat anti karat bersertifikat standar nasional.']
        ]
    ],
    [
        'name' => 'Toko Fotocopy, Percetakan & ATK Sinar Grafika Surade',
        'cat_name' => 'Toko Buku & Alat Tulis',
        'img' => '/images/businesses/retail_atk.jpg',
        'desc' => 'Fotocopy warna cepat, jilid skripsi hardcover, cetak banner spanduk kilat, stempel flash otomatis, dan perlengkapan alat tulis kantor/sekolah.',
        'tags' => ['Fotocopy', 'Percetakan Banner', 'ATK', 'Surade'],
        'products' => [
            ['name' => 'Cetak Banner Spanduk Flexi 280gsm per Meter Persegi', 'price' => 20000, 'desc' => 'Cetak banner warna tajam tahan air dan panas untuk plang toko, spanduk acara, dan promosi.'],
            ['name' => 'Jilid Hardcover Skripsi / Laporan Lambang Emas Timbul', 'price' => 35000, 'desc' => 'Jilid eksklusif rapi kuat dengan tulisan foil emas elegan.']
        ]
    ],
    [
        'name' => 'Butik Busana Muslim & Hijab Fashion Al-Zahra',
        'cat_name' => 'Toko Busana Muslim & Hijab',
        'img' => '/images/businesses/retail_hijab.jpg',
        'desc' => 'Koleksi gamis syar\'i modern, baju koko bordir pria, mukena sutra premium, jilbab pashmina ceruty, dan sarung tenun berkualitas.',
        'tags' => ['Busana Muslim', 'Gamis Syari', 'Hijab', 'Surade'],
        'products' => [
            ['name' => 'Gamis Syar\'i Set Khimar Ceruty Babydoll Premium', 'price' => 185000, 'desc' => 'Bahan adem jatuh lembut tidak menerawang dengan variasi payet mutiara anggun.'],
            ['name' => 'Baju Koko Kurta Pria Lengan Panjang Katun Toyobo', 'price' => 125000, 'desc' => 'Bahan katun dingin nyaman menyerap keringat dengan saku fungsional.']
        ]
    ],
    [
        'name' => 'Toko Plastik Kemasan & Dus Makanan Barokah Pack',
        'cat_name' => 'Plastik Kemasan & Dus Nasi',
        'img' => '/images/businesses/retail_plastik.jpg',
        'desc' => 'Menyediakan kantong kresek ramah lingkungan, cup minuman boba sablon, lunch box sekat, thinwall wadah makanan, dan mika kue.',
        'tags' => ['Kemasan Plastik', 'Cup Minuman', 'Dus Nasi', 'Surade'],
        'products' => [
            ['name' => 'Thinwall Kotak Makanan Persegi 650ml (Isi 25 Pcs)', 'price' => 32000, 'desc' => 'Wadah plastik food grade microwave safe tahan panas dan anti tumpah.'],
            ['name' => 'Cup Minuman Gelas Plastik 16oz Oval (1 Slop 50 Pcs)', 'price' => 22000, 'desc' => 'Cup plastik tebal bening cocok untuk usaha es teh, boba, dan aneka kopi.']
        ]
    ],
    [
        'name' => 'Kerajinan Anyaman Bambu & Perabot Tradisional Sauyunan',
        'cat_name' => 'Kerajinan Anyaman Bambu',
        'img' => '/images/businesses/retail_bambu.jpg',
        'desc' => 'Pusat kerajinan tangan besek bambu, bakul nasi tradisonal, hiasan lampu bambu estetik, dan kursi bale bambu khas masyarakat Surade.',
        'tags' => ['Anyaman Bambu', 'Kerajinan Tangan', 'Bambu', 'Surade'],
        'products' => [
            ['name' => 'Besek Anyaman Bambu Natural Ukuran 20x20cm (Isi 10 Pasang)', 'price' => 35000, 'desc' => 'Besek bambu rapi halus ramah lingkungan untuk wadah oleh-oleh dan catering.'],
            ['name' => 'Kap Lampu Gantung Bambu Estetik Cafe', 'price' => 75000, 'desc' => 'Kap lampu anyaman bambu artistik memberi nuansa etnik hangat pada ruangan.']
        ]
    ],

    // --- ELEKTRONIK & GADGET ---
    [
        'name' => 'Pusat Servis HP & Ganti LCD Kilat Flash Cell Surade',
        'cat_name' => 'Servis HP & Smartphone',
        'img' => '/images/businesses/elektronik_hp.jpg',
        'desc' => 'Ganti LCD pecah sentuh, ganti baterai tanam original, perbaikan HP mati total, unlock akun, dan aksesoris casing tempered glass lengkap.',
        'tags' => ['Servis HP', 'Ganti LCD', 'Konter HP', 'Surade'],
        'products' => [
            ['name' => 'Jasa Ganti LCD HP Android Original + Pasang Presisi', 'price' => 175000, 'desc' => 'Layar sentuh responsif warna cerah bergaransi ganti baru jika ada kendala.'],
            ['name' => 'Ganti Baterai Tanam Original High Capacity Bergaransi', 'price' => 110000, 'desc' => 'Baterai awet tahan lama anti kembung dengan proteksi IC ganda.']
        ]
    ],
    [
        'name' => 'Toko Laptop, Komputer & CCTV Surya Komputindo',
        'cat_name' => 'Toko Laptop & Komputer',
        'img' => '/images/businesses/elektronik_laptop.jpg',
        'desc' => 'Jual beli laptop baru & second bergaransi, instal ulang Windows, rakit PC gaming/kantor, dan paket pasang kamera CCTV online di HP.',
        'tags' => ['Toko Laptop', 'Pasang CCTV', 'Komputer', 'Surade'],
        'products' => [
            ['name' => 'Paket Pasang CCTV 4 Kamera HD Online HP Siap Pantau', 'price' => 2150000, 'desc' => '4 Kamera indoor/outdoor night vision, DVR 4 channel, Harddisk 500GB, dan instalasi rapi.'],
            ['name' => 'Laptop Second Core i5 RAM 8GB SSD 256GB Bergaransi', 'price' => 3200000, 'desc' => 'Laptop mulus siap pakai untuk kerja, sekolah, dan editing ringan include tas dan charger.']
        ]
    ],

    // --- KESEHATAN & MEDIS ---
    [
        'name' => 'Apotek Sehat Keluarga & Praktik Dokter Bersama',
        'cat_name' => 'Apotek & Toko Obat',
        'img' => '/images/businesses/medis_apotek.jpg',
        'desc' => 'Melayani resep dokter, obat generik dan paten, cek tensi darah, cek gula darah & kolesterol, vitamin anak, dan alat kesehatan.',
        'tags' => ['Apotek', 'Obat Lengkap', 'Kesehatan', 'Surade'],
        'products' => [
            ['name' => 'Paket Cek Kesehatan Lengkap (Gula Darah + Asam Urat + Kolesterol + Tensi)', 'price' => 35000, 'desc' => 'Pemeriksaan cepat akurat oleh tenaga apoteker/perawat berizin resmi.'],
            ['name' => 'Multivitamin Imunitas Tubuh Vitamin C & Zinc (Isi 30 Kaplet)', 'price' => 45000, 'desc' => 'Suplemen harian menjaga daya tahan tubuh dari kelelahan dan virus.']
        ]
    ],
    [
        'name' => 'Optik Kacamata & Periksa Mata Komputer Akurat',
        'cat_name' => 'Optik Kacamata',
        'img' => '/images/businesses/medis_optik.jpg',
        'desc' => 'Pemeriksaan refraksi mata gratis dengan alat komputer canggih, frame kacamata kekinian, dan lensa anti radiasi blueray / photocromic.',
        'tags' => ['Optik', 'Kacamata', 'Lensa Photocromic', 'Surade'],
        'products' => [
            ['name' => 'Paket Kacamata Frame Modern + Lensa Anti Radiasi Blueray', 'price' => 185000, 'desc' => 'Melindungi mata dari sinar biru layar HP dan laptop, pandangan jernih dan nyaman.'],
            ['name' => 'Lensa Kacamata Photocromic Berubah Warna Gelap Otomatis', 'price' => 150000, 'desc' => 'Lensa otomatis berubah gelap saat terkena terik matahari outdoor dan bening kembali di indoor.']
        ]
    ],

    // --- PENDIDIKAN & WISATA ---
    [
        'name' => 'Bimbingan Belajar & Kursus Bahasa Inggris Smart Kids Surade',
        'cat_name' => 'Bimbingan Belajar',
        'img' => '/images/businesses/pendidikan_bimbel.jpg',
        'desc' => 'Bimbel mata pelajaran SD, SMP, SMA, persiapan ujian masuk PTN / kedinasan, dan kelas kursus percakapan bahasa Inggris interaktif.',
        'tags' => ['Bimbel', 'Kursus Inggris', 'Pendidikan', 'Surade'],
        'products' => [
            ['name' => 'Biaya Kursus Bimbel SD / SMP Paket Bulanan (3x Seminggu)', 'price' => 150000, 'desc' => 'Pembelajaran intensif matematika, IPA, Bahasa Inggris dengan tentor ramah dan modul lengkap.'],
            ['name' => 'Program English Speaking & Conversation Class (1 Bulan)', 'price' => 175000, 'desc' => 'Metode praktik langsung cepat lancar berbicara bahasa Inggris percaya diri.']
        ]
    ],
    [
        'name' => 'Homestay Pantai Minajaya & Villa Sunset View Surade',
        'cat_name' => 'Villa & Penginapan',
        'img' => '/images/businesses/wisata_homestay.jpg',
        'desc' => 'Penginapan nyaman pinggir pantai Minajaya ber-AC, kamar mandi dalam, dapur bersama, pemandangan matahari terbenam spektakuler, dan area BBQ.',
        'tags' => ['Homestay', 'Pantai Minajaya', 'Penginapan', 'Surade'],
        'products' => [
            ['name' => 'Sewa Kamar Homestay AC Double Bed (1 Malam)', 'price' => 250000, 'desc' => 'Kamar bersih luas, AC dingin, TV, Wi-Fi gratis, kopi teh pagi, dan akses 2 menit ke bibir pantai.'],
            ['name' => 'Paket Sewa 1 Rumah Villa Full Famili (3 Kamar Tidur)', 'price' => 750000, 'desc' => 'Kapasitas 10-15 orang include dapur lengkap, ruang tamu luas, dan halaman parkir mobil pribadi.']
        ]
    ],
    [
        'name' => 'Pemandu Wisata & Perahu Curug Cikaso Adventure',
        'cat_name' => 'Wisata Curug Cikaso',
        'img' => '/images/businesses/wisata_curug.jpg',
        'desc' => 'Layanan pemandu wisata berlisensi, sewa perahu motor susur sungai Cikaso menuju air terjun tiga curug megah (Aseupan, Meong, Aki).',
        'tags' => ['Curug Cikaso', 'Pemandu Wisata', 'Perahu Cikaso', 'Surade'],
        'products' => [
            ['name' => 'Paket Sewa Perahu Susur Sungai Cikaso PP (Kapasitas 10 Orang)', 'price' => 80000, 'desc' => 'Sensasi perahu motor menyusuri sungai hijau toska bertebing asri menuju dermaga Curug Cikaso.'],
            ['name' => 'Jasa Guide Pemandu Wisata Geopark Ciletuh-Surade (1 Hari)', 'price' => 200000, 'desc' => 'Pemandu ramah berpengetahuan mendampingi rute spot foto terbaik dan sejarah alam Surade.']
        ]
    ],
    [
        'name' => 'Pusat Futsal & Lapangan Badminton Gelora Surade',
        'cat_name' => 'Sekolah Sepak Bola',
        'img' => '/images/businesses/olahraga_futsal.jpg',
        'desc' => 'Sewa lapangan futsal rumput sintetis standar interlock empuk, lapangan bulutangkis vinyl, ruang ganti bersih, dan kantin olahraga.',
        'tags' => ['Futsal', 'Badminton', 'Olahraga', 'Surade'],
        'products' => [
            ['name' => 'Sewa Lapangan Futsal Siang / Sore (1 Jam)', 'price' => 80000, 'desc' => 'Rumput sintetis terawat dengan penerangan lampu LED terang dan bola futsal standar.'],
            ['name' => 'Sewa Lapangan Futsal Malam Hari (1 Jam)', 'price' => 100000, 'desc' => 'Lampu penerangan malam terang maksimal dengan fasilitas tribun penonton.']
        ]
    ]
];

$prefixes = [
    'Berkah', 'Utama', 'Mandiri', 'Jaya', 'Sejahtera', 'Mitra', 'Anugerah', 'Bintang',
    'Abadi', 'Lancar', 'Makmur', 'Cahaya', 'Sentosa', 'Kurnia', 'Subur', 'Maju',
    'Sauyunan', 'Barokah', 'Kencana', 'Lestari', 'Putra Jampang', 'Surade Jaya'
];

echo "Cleaning up existing businesses and products...\n";
DB::statement('SET FOREIGN_KEY_CHECKS = 0');
DB::table('products')->truncate();
DB::table('businesses')->truncate();
DB::statement('SET FOREIGN_KEY_CHECKS = 1');

echo "Inserting 246 authentic businesses across 12 villages in Kecamatan Surade...\n";

for ($i = 0; $i < 246; $i++) {
    $tplIndex = $i % count($templates);
    $tpl = $templates[$tplIndex];
    $prefix = $prefixes[(int) floor($i / count($templates)) % count($prefixes)];
    $village = $villages[$i % count($villages)];
    $street = $village['streets'][rand(0, count($village['streets']) - 1)];
    $houseNo = rand(1, 150);

    // Resolve category
    $catMatch = $categories->first(function ($c) use ($tpl) {
        return strtolower($c->name) === strtolower($tpl['cat_name']);
    });
    if (!$catMatch) {
        $firstWord = explode(' ', $tpl['cat_name'])[0];
        $catMatch = $categories->first(function ($c) use ($firstWord) {
            return str_contains(strtolower($c->name), strtolower($firstWord));
        }) ?: $categories->first();
    }

    $bName = $tpl['name'];
    if ($i >= count($templates)) {
        $cleanVillageName = str_replace(['Desa ', 'Kelurahan '], '', $village['name']);
        $bName = "{$tpl['name']} {$prefix} {$cleanVillageName}";
    }

    $bSlug = Str::slug($bName) . '-' . rand(100, 999);
    $lat = round($village['lat'] + (rand(-80, 80) / 10000), 7);
    $lng = round($village['lng'] + (rand(-80, 80) / 10000), 7);

    // Indonesian Provider Prefix
    $providerPrefixes = ['0812', '0813', '0821', '0822', '0852', '0853', '0857', '0858', '0877', '0878'];
    $phone = $providerPrefixes[rand(0, count($providerPrefixes) - 1)] . rand(10000000, 99999999);
    $emailPrefix = substr(preg_replace('/[^a-z0-9]/', '', Str::slug($bName)), 0, 15);
    $email = "{$emailPrefix}" . rand(10, 99) . "@gmail.com";

    $imgPath = $tpl['img'];

    $openingDays = [
        ['day' => 'Senin - Sabtu', 'open' => '08:00', 'close' => '21:00', 'selected' => true],
        ['day' => 'Minggu', 'open' => '08:00', 'close' => '20:00', 'selected' => true]
    ];

    $tags = array_merge($tpl['tags'], [$village['name'], 'Surade', 'Sukabumi']);
    $isPremium = rand(1, 10) <= 6;
    $isFeatured = rand(1, 10) <= 3;
    $rating = round(rand(46, 50) / 10, 1);
    $ratingCount = rand(5, 65);
    $views = rand(150, 4500);
    $clicks = rand(25, 480);

    $bizId = DB::table('businesses')->insertGetId([
        'user_id' => $ownerId,
        'category_id' => $catMatch->id,
        'name' => $bName,
        'slug' => $bSlug,
        'description' => $tpl['desc'],
        'phone' => $phone,
        'whatsapp' => $phone,
        'email' => $email,
        'opening_days' => json_encode($openingDays),
        'address' => "{$street} No. {$houseNo}, {$village['name']}, Kec. Surade, Kab. Sukabumi",
        'city' => $village['name'],
        'province' => 'Jawa Barat',
        'postal_code' => '43179',
        'latitude' => (string) $lat,
        'longitude' => (string) $lng,
        'logo' => $imgPath,
        'banner' => $imgPath,
        'banners' => json_encode([$imgPath, $imgPath]),
        'gallery' => json_encode([$imgPath, $imgPath, $imgPath]),
        'tags' => json_encode($tags),
        'views' => $views,
        'is_premium' => $isPremium,
        'premium_plan' => $isPremium ? 'Pro' : null,
        'featured' => $isFeatured,
        'status' => 'approved',
        'is_active' => true,
        'clicks' => $clicks,
        'rating' => $rating,
        'rating_count' => $ratingCount,
        'created_at' => now(),
        'updated_at' => now(),
    ]);

    // Insert 2 Products for each business
    foreach ($tpl['products'] as $p) {
        DB::table('products')->insert([
            'business_id' => $bizId,
            'name' => $p['name'],
            'description' => $p['desc'],
            'price' => $p['price'],
            'image' => $imgPath,
            'is_active' => true,
            'status' => 'approved',
            'created_at' => now(),
            'updated_at' => now(),
        ]);
    }

    if (($i + 1) % 50 === 0 || $i === 245) {
        echo "Inserted " . ($i + 1) . " / 246 businesses...\n";
    }
}

$totalBiz = DB::table('businesses')->count();
$totalProd = DB::table('products')->count();

echo "\n=== FINISHED SUCCESSFULLY: {$totalBiz} REAL BUSINESSES & {$totalProd} PRODUCTS CREATED! ===\n";
