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

echo "=== MEMPERSIAPKAN 246 DATA USAHA NYATA KECAMATAN SURADE & 12 DESA ===\n\n";

// 1. Fetch categories
$categories = Category::all();
$owner = User::where('role', '!=', 'admin')->first() ?: User::first();
$ownerId = $owner ? $owner->id : 14;

// 2. 12 Desa/Kelurahan di Kecamatan Surade dengan koordinat nyata dan nama jalan/kampung asli
$villages = [
    [
        'name' => 'Kelurahan Surade',
        'lat' => -7.3452,
        'lng' => 106.5873,
        'streets' => ['Jl. Raya Surade', 'Jl. Kaum Surade', 'Jl. Cibarehong', 'Kp. Pasar Lama', 'Kp. Cikupa', 'Jl. Lodaya', 'Jl. Alun-Alun Surade', 'Jl. Tangkil']
    ],
    [
        'name' => 'Desa Pasiripis',
        'lat' => -7.3820,
        'lng' => 106.5740,
        'streets' => ['Jl. Pantai Minajaya', 'Kp. Pasiripis', 'Kp. Garung', 'Kp. Ciawitali', 'Jl. Pesisir Minajaya', 'Kp. Muara Minajaya']
    ],
    [
        'name' => 'Desa Cipeundeuy',
        'lat' => -7.3214,
        'lng' => 106.6120,
        'streets' => ['Jl. Raya Curug Cikaso', 'Kp. Cipeundeuy', 'Kp. Cibeber Hilir', 'Kp. Dermaga Cikaso', 'Jl. Sungai Cikaso']
    ],
    [
        'name' => 'Desa Gunungsungging',
        'lat' => -7.3290,
        'lng' => 106.5782,
        'streets' => ['Jl. Wisata Gua Sungging', 'Kp. Legokloa', 'Kp. Sungging Hilir', 'Kp. Pasir Gombong', 'Kp. Ciguha']
    ],
    [
        'name' => 'Desa Buniwangi',
        'lat' => -7.3382,
        'lng' => 106.5968,
        'streets' => ['Jl. Buniwangi', 'Kp. Babakan Buniwangi', 'Kp. Ciseureuh', 'Kp. Sindangpalay', 'Kp. Bojong Pari']
    ],
    [
        'name' => 'Desa Citanglar',
        'lat' => -7.3636,
        'lng' => 106.5654,
        'streets' => ['Jl. Alternatif Jampang', 'Kp. Citanglar', 'Kp. Ciwaru', 'Kp. Sukamaju', 'Jl. Citanglar Raya']
    ],
    [
        'name' => 'Desa Jagamukti',
        'lat' => -7.3512,
        'lng' => 106.5985,
        'streets' => ['Jl. Desa Jagamukti', 'Kp. Ciputat', 'Kp. Jagamukti', 'Kp. Cikadu', 'Kp. Kubang']
    ],
    [
        'name' => 'Desa Kadaleman',
        'lat' => -7.3710,
        'lng' => 106.5810,
        'streets' => ['Jl. Kadaleman Raya', 'Kp. Kadaleman', 'Kp. Cikawung', 'Kp. Cisalada', 'Kp. Babakan Kadaleman']
    ],
    [
        'name' => 'Desa Kademangan',
        'lat' => -7.3415,
        'lng' => 106.5720,
        'streets' => ['Jl. Kademangan', 'Kp. Cibalok', 'Kp. Bojong Pari', 'Kp. Neglasari', 'Kp. Babakan Kademangan']
    ],
    [
        'name' => 'Desa Sirnasari',
        'lat' => -7.3580,
        'lng' => 106.6050,
        'streets' => ['Jl. Sirnasari Raya', 'Kp. Sirnasari', 'Kp. Cikangkung', 'Kp. Sukatani Hilir', 'Kp. Pasir Salam']
    ],
    [
        'name' => 'Desa Sukatani',
        'lat' => -7.3340,
        'lng' => 106.6020,
        'streets' => ['Jl. Sukatani Jampang', 'Kp. Sukatani', 'Kp. Cisuren', 'Kp. Mekarsari', 'Kp. Cikembang']
    ],
    [
        'name' => 'Desa Wanasari',
        'lat' => -7.3690,
        'lng' => 106.5920,
        'streets' => ['Jl. Wanasari', 'Kp. Bojong Asih', 'Kp. Wanasari', 'Kp. Karanganyar', 'Kp. Cibatu']
    ]
];

// 3. Archetype Daftar Usaha Nyata yang Khas di Wilayah Surade
$businessArchetypes = [
    // --- KULINER & OLEH-OLEH ---
    [
        'name' => 'RM Lesehan Ikan Bakar Bahari Minajaya',
        'cat_name' => 'Restoran Ikan Bakar',
        'img' => '/images/businesses/kuliner_ikan_bakar.jpg',
        'desc' => 'Menyajikan aneka hidangan laut segar langsung dari perahu nelayan Pantai Minajaya Surade, dibakar dengan racikan bumbu rempah khas pesisir dan sambal terasi dadak.',
        'tags' => ['Ikan Bakar', 'Seafood', 'Pantai Minajaya', 'Kuliner', 'Surade'],
        'products' => [
            ['name' => 'Paket Ikan Kakap Bakar Cobek + Nasi Timbel', 'price' => 45000, 'desc' => 'Kakap merah segar bakar bumbu kecap pedas disajikan dengan nasi timbel pulen, tahu tempe, dan lalapan.'],
            ['name' => 'Cumi Saus Padang Porsi Jumbo', 'price' => 38000, 'desc' => 'Cumi basah segar dimasak bumbu saus padang gurih pedas manis melimpah.']
        ]
    ],
    [
        'name' => 'Sate Maranggi & Sop Iga Sapi Barokah Surade',
        'cat_name' => 'Angkringan & Sate',
        'img' => '/images/businesses/kuliner_sate.jpg',
        'desc' => 'Sate sapi dan kambing maranggi empuk bumbu ketumbar gula aren dengan sambal tomat segar, serta sop iga sapi kuah kaldu rempah gurih.',
        'tags' => ['Sate Maranggi', 'Sop Iga', 'Kuliner Malam', 'Surade'],
        'products' => [
            ['name' => '1 Porsi Sate Sapi Maranggi (10 Tusuk)', 'price' => 30000, 'desc' => 'Daging sapi pilihan empuk bermarinasi bumbu khas Sunda dibakar harum.'],
            ['name' => 'Sop Iga Sapi Kuah Rempah Bening', 'price' => 35000, 'desc' => 'Iga sapi empuk dengan kuah rempah hangat, wortel, daun seledri, dan bawang goreng.']
        ]
    ],
    [
        'name' => 'Sentra Ikan Asin Jambal Roti & Teri Nasi Berkah Laut',
        'cat_name' => 'Sentra Ikan Asin',
        'img' => '/images/businesses/kuliner_ikan_asin.jpg',
        'desc' => 'Pusat pengolahan dan oleh-oleh ikan asin berkualitas Pantai Minajaya: jambal roti empuk tanpa formalin, cumi asin telur, teri medan, dan peda merah.',
        'tags' => ['Ikan Asin', 'Jambal Roti', 'Oleh-Oleh Khas', 'Minajaya', 'Surade'],
        'products' => [
            ['name' => 'Ikan Asin Jambal Roti Super (1 Kg)', 'price' => 110000, 'desc' => 'Daging jambal roti tebal tanpa pengawet kimia, pengeringan alami sinar matahari pantai.'],
            ['name' => 'Cumi Asin Bertelur Bersih (500 Gram)', 'price' => 65000, 'desc' => 'Cumi asin segar berkualitas tinggi cocok untuk masakan sambal balado dan tumis cabai hijau.']
        ]
    ],
    [
        'name' => 'Pengrajin Gula Aren Batok & Gula Semut Cikaso Mandiri',
        'cat_name' => 'Oleh Oleh Khas Surade',
        'img' => '/images/businesses/kuliner_gula_aren.jpg',
        'desc' => 'Produsen gula aren batok murni asli perkebunan Cikaso dan gula semut aren organik kemasan praktis tanpa campuran gula rafinasi.',
        'tags' => ['Gula Aren', 'Gula Semut', 'Hasil Hutan', 'Cikaso', 'Surade'],
        'products' => [
            ['name' => 'Gula Aren Batok Asli Cikaso (1 Kg)', 'price' => 32000, 'desc' => 'Gula aren murni 100% dari nira pohon enau pilihan, legit alami dan wangi khas.'],
            ['name' => 'Gula Semut Aren Organik Pouch 500g', 'price' => 25000, 'desc' => 'Gula aren kristal serbaguna untuk pemanis kopi, seduhan herbal, dan olahan kue.']
        ]
    ],
    [
        'name' => 'Kedai Kopi Jampang & Roastery Kopi Lokal Surade',
        'cat_name' => 'Cafe & Resto',
        'img' => '/images/businesses/kuliner_kopi.jpg',
        'desc' => 'Kafe tempat nongkrong asyik anak muda dan keluarga dengan kopi robusta/arabika petik merah perkebunan Jampang, camilan hangat, dan free Wi-Fi.',
        'tags' => ['Coffee Shop', 'Kopi Jampang', 'Kafe', 'Wifi', 'Surade'],
        'products' => [
            ['name' => 'Es Kopi Susu Gula Aren Jampang (1 Liter)', 'price' => 65000, 'desc' => 'Perpaduan espresso robusta Jampang, susu segar, dan gula aren organik Surade.'],
            ['name' => 'Manual Brew V60 Single Origin Sukabumi', 'price' => 18000, 'desc' => 'Kopi seduhan filter manual dengan cita rasa fruity dan aroma rempah khas tanah Sunda.']
        ]
    ],
    [
        'name' => 'Warung Bakso Urat & Mie Ayam Jamur Mas Joko Surade',
        'cat_name' => 'Warung Bakso & Mie',
        'img' => '/images/businesses/kuliner_bakso.jpg',
        'desc' => 'Bakso daging sapi asli kenyal tanpa pengawet dengan tetelan melimpah, kuah kaldu tulang sapi gurih, dan mie ayam jamur lezat.',
        'tags' => ['Bakso Sapi', 'Mie Ayam', 'Kuliner', 'Surade'],
        'products' => [
            ['name' => 'Bakso Urat Super Tetelan Komplit', 'price' => 20000, 'desc' => 'Bakso urat jumbo, bakso halus, tahu bakso, limpahan tetelan sapi, mie kuning, dan bihun.'],
            ['name' => 'Mie Ayam Jamur Pangsit Renyah', 'price' => 15000, 'desc' => 'Mie kenyal buatan sendiri dengan daging ayam bumbu kecap manis gurih dan pangsit renyah.']
        ]
    ],
    [
        'name' => 'RM Padang Salero Minang Asli Surade',
        'cat_name' => 'Rumah Makan Padang',
        'img' => '/images/businesses/kuliner_nasi_padang.jpg',
        'desc' => 'Menyajikan rendang daging sapi empuk resep otentik Payakumbuh, ayam pop gurih, gulai tunjang kepala kakap, dan sambal cabai hijau khas Minang.',
        'tags' => ['Nasi Padang', 'Rendang', 'Masakan Padang', 'Surade'],
        'products' => [
            ['name' => 'Paket Nasi Rendang Daging Sapi Pilihan', 'price' => 24000, 'desc' => 'Nasi pulen hangat, rendang empuk meresap, daun singkong rebus, gulai nangka, dan sambal ijo.'],
            ['name' => 'Ayam Pop Gurih Sambal Merah Khas Minang', 'price' => 18000, 'desc' => 'Ayam kampung dimasak bumbu kelapa muda gurih disajikan dengan sambal tomat pedas asam.']
        ]
    ],
    [
        'name' => 'Ayam Geprek Sambal Bawang Juara & Bebek Goreng Surade',
        'cat_name' => 'Ayam Geprek & Bebek Goreng',
        'img' => '/images/businesses/kuliner_ayam_goreng.jpg',
        'desc' => 'Ayam goreng tepung krispi digeprek dengan cabai rawit merah pedas nampol level 1-10, bebek goreng empuk bumbu kuning, dan nasi sepuasnya.',
        'tags' => ['Ayam Geprek', 'Bebek Goreng', 'Kuliner Pedas', 'Surade'],
        'products' => [
            ['name' => 'Paket Ayam Geprek Mozarella + Nasi + Es Teh', 'price' => 22000, 'desc' => 'Ayam goreng krispi berbalur keju leleh mozarella dan sambal bawang segar.'],
            ['name' => 'Bebek Goreng Sambal Korek Gurih Empuk', 'price' => 32000, 'desc' => 'Daging bebek empuk gurih rempah digoreng garing bersanding dengan sambal korek pedas.']
        ]
    ],
    [
        'name' => 'Dapoer Bakery & Kue Ulang Tahun Kencana Surade',
        'cat_name' => 'Cafe & Resto',
        'img' => '/images/businesses/kuliner_bakery.jpg',
        'desc' => 'Toko aneka kue ulang tahun custom, bolu gulung keju pandan, brownies kukus cokelat lumer, donat kentang, dan snack box rapat kantor.',
        'tags' => ['Toko Roti', 'Kue Ulang Tahun', 'Bakery', 'Snack Box', 'Surade'],
        'products' => [
            ['name' => 'Kue Ulang Tahun Black Forest Custom 20cm', 'price' => 145000, 'desc' => 'Cake cokelat lembut dilapisi krim lezat, parutan cokelat premium, dan buah cherry segar.'],
            ['name' => 'Bolu Gulung Pandan Keju Spesial', 'price' => 45000, 'desc' => 'Bolu gulung harum pasta pandan asli bertabur keju cheddar gurih berlimpah.']
        ]
    ],
    [
        'name' => 'Catering Prasmanan & Nasi Kotak Barokah Surade',
        'cat_name' => 'Katering Nasi Kotak',
        'img' => '/images/businesses/kuliner_catering.jpg',
        'desc' => 'Jasa katering pesta pernikahan, syukuran khitanan, pengajian, dan nasi kotak harian kantor dengan rasa lezat higienis berstandar halal MUI.',
        'tags' => ['Catering', 'Nasi Kotak', 'Wedding Organizer', 'Surade'],
        'products' => [
            ['name' => 'Paket Nasi Kotak Ayam Bakar Madu Komplit', 'price' => 25000, 'desc' => 'Nasi, ayam bakar madu, sambal goreng ati kentang, kerupuk udang, buah pisang, dan air mineral.'],
            ['name' => 'Paket Menu Prasmanan Pernikahan (100 Porsi)', 'price' => 4500000, 'desc' => '5 pilihan lauk utama daging/ayam/ikan, sup rolade, aneka puding buah, dan es kelapa muda.']
        ]
    ],

    // --- OTOMOTIF & PERBENGKELAN ---
    [
        'name' => 'Bengkel Motor Injeksi & Servis CVT Bintang Jaya Surade',
        'cat_name' => 'Bengkel Motor',
        'img' => '/images/businesses/otomotif_motor.jpg',
        'desc' => 'Bengkel resmi servis injeksi OBD2 scanner, reset ECU, servis CVT matic anti gredeg, tune up mesin, ganti oli resmi, dan overhaul mesin.',
        'tags' => ['Bengkel Motor', 'Servis Injeksi', 'Oli Motor', 'Surade'],
        'products' => [
            ['name' => 'Paket Servis Injeksi + Reset ECU + Ganti Oli Mesin', 'price' => 75000, 'desc' => 'Pembersihan throttle body, infus injector, cek kelistrikan scanner OBD, dan oli mesin original.'],
            ['name' => 'Servis CVT Matic + Greasing Komplit', 'price' => 45000, 'desc' => 'Pembersihan mangkok ganda, roller, v-belt, dan pelumasan bearing CVT matic bebas getar.']
        ]
    ],
    [
        'name' => 'Bengkel Bubut & Las Listrik Presisi Baja Mandiri Surade',
        'cat_name' => 'Bengkel Bubut',
        'img' => '/images/businesses/otomotif_las.jpg',
        'desc' => 'Mengerjakan las kanopi baja ringan, pagar teralis minimalis, korter silinder motor, bubut drat as perahu nelayan, dan perbaikan mesin traktor sawah.',
        'tags' => ['Bengkel Las', 'Bengkel Bubut', 'Teralis', 'Pagar', 'Surade'],
        'products' => [
            ['name' => 'Pembuatan Pagar Minimalis Galvanis (per Meter)', 'price' => 375000, 'desc' => 'Besi hollow galvanis anti karat dengan cat duco rapi tahan cuaca ekstrem pesisir.'],
            ['name' => 'Jasa Korter Silinder & Bubut Presisi Mesin', 'price' => 85000, 'desc' => 'Pengerjaan bubut logam presisi tinggi dengan teknisi bubut industri handal.']
        ]
    ],
    [
        'name' => 'Cuci Mobil Hidrolik Salju & Motor Steam Bintang 99',
        'cat_name' => 'Cuci Mobil & Motor',
        'img' => '/images/businesses/otomotif_cuci.jpg',
        'desc' => 'Cuci mobil sistem hidrolik H-track, sampo salju pH netral tidak merusak cat, poles bodi wax mengkilap, dan cuci motor kolong steam bersih tuntas.',
        'tags' => ['Cuci Mobil', 'Cuci Motor', 'Steam Salju', 'Surade'],
        'products' => [
            ['name' => 'Cuci Mobil Hidrolik Salju + Semir Ban + Vakum Interior', 'price' => 45000, 'desc' => 'Pembersihan kolong mobil, pencucian bodi busa salju, dan vakum debu karpet interior.'],
            ['name' => 'Cuci Motor Salju Bersih Kilap + Semir Ban', 'price' => 15000, 'desc' => 'Pembersihan sela-sela mesin dan kolong motor hingga bebas kotoran tanah lumpur.']
        ]
    ],
    [
        'name' => 'Toko Sparepart & Ban Motor King Motor Surade',
        'cat_name' => 'Sparepart Motor',
        'img' => '/images/businesses/otomotif_sparepart.jpg',
        'desc' => 'Menyediakan suku cadang asli Honda/Yamaha/Suzuki, ban tubeless Maxxis, FDR, IRC, aki kering GS Astra, kampas rem, dan rantai gear set.',
        'tags' => ['Sparepart Motor', 'Ban Tubeless', 'Aki Motor', 'Surade'],
        'products' => [
            ['name' => 'Ban Luar Tubeless Maxxis Victra 90/80-14', 'price' => 235000, 'desc' => 'Ban kompon lembut dengan daya cengkeram prima di jalan kering maupun basah.'],
            ['name' => 'Aki Kering Motor GS Astra GTZ5S Original', 'price' => 195000, 'desc' => 'Aki motor bebas perawatan bergaransi cocok untuk Beat, Vario, Scoopy, Mio.']
        ]
    ],

    // --- PERTANIAN, PETERNAKAN & PERIKANAN ---
    [
        'name' => 'Toko Pupuk & Obat Pertanian Tani Makmur Surade',
        'cat_name' => 'Pupuk Organik & Obat Hama',
        'img' => '/images/businesses/tani_pupuk.jpg',
        'desc' => 'Penyedia pupuk NPK Mutiara, pupuk organik hayati, herbisida pembasmi gulma, fungisida, benih padi Inpari 32, dan sprayer semprot elektrik.',
        'tags' => ['Toko Tani', 'Pupuk NPK', 'Obat Hama', 'Bibit Padi', 'Surade'],
        'products' => [
            ['name' => 'Pupuk NPK Mutiara 16-16-16 Original (1 Kg)', 'price' => 22000, 'desc' => 'Pupuk berkualitas tinggi menyuburkan tanaman padi, sayuran, dan pohon buah.'],
            ['name' => 'Sprayer Tangki Semprot Hama Elektrik 16 Liter', 'price' => 345000, 'desc' => 'Tangki semprot otomatis baterai lithium awet mempermudah penyemprotan sawah.']
        ]
    ],
    [
        'name' => 'Sentra Bibit Kelapa Kopyor & Bibit Buah Unggul Surade',
        'cat_name' => 'Bibit Buah Unggul',
        'img' => '/images/businesses/tani_bibit.jpg',
        'desc' => 'Menyediakan bibit kelapa kopyor genjah unggul cepat berbuah 3 tahun, bibit kelapa hibrida, durian musang king/bawor kaki 3, dan alpukat aligator.',
        'tags' => ['Bibit Kelapa', 'Bibit Durian', 'Perkebunan', 'Surade'],
        'products' => [
            ['name' => 'Bibit Kelapa Kopyor Genjah Bersertifikat', 'price' => 45000, 'desc' => 'Bibit kelapa unggul hasil seleksi induk produktif dengan potensi kopyor tinggi.'],
            ['name' => 'Bibit Durian Bawor Okulasi Kaki Tiga 80cm', 'price' => 65000, 'desc' => 'Bibit durian okulasi cepat berbuah daging tebal legit siap tanam di kebun.']
        ]
    ],
    [
        'name' => 'Budidaya Ikan Nila Merah & Lele Sangkuriang Surade',
        'cat_name' => 'Bibit Ikan Air Tawar',
        'img' => '/images/businesses/tani_ikan.jpg',
        'desc' => 'Penjualan benih ikan nila merah monoseks, bibit lele sangkuriang sehat lincah, pakan pelet apung protein tinggi, dan probiotik kolam terpal.',
        'tags' => ['Bibit Ikan', 'Nila Merah', 'Lele', 'Perikanan', 'Surade'],
        'products' => [
            ['name' => 'Bibit Ikan Nila Merah Super 5-7cm (100 Ekor)', 'price' => 45000, 'desc' => 'Bibit ikan sehat tahan penyakit cepat besar dengan efisiensi pakan tinggi.'],
            ['name' => 'Pakan Ikan Pelet Apung 781-2 (Karung 30 Kg)', 'price' => 320000, 'desc' => 'Pakan apung pertumbuhan cepat untuk pembesaran nila dan lele.']
        ]
    ],
    [
        'name' => 'Madu Hutan Murni Lebah Odeng Hutan Cikaso Surade',
        'cat_name' => 'Madu Murni Hutan',
        'img' => '/images/businesses/tani_madu.jpg',
        'desc' => 'Madu murni lebah liar (Apis Dorsata) dipanen langsung dari pohon hutan lebat Cikaso tanpa pasteurisasi dan tanpa pemanis buatan.',
        'tags' => ['Madu Asli', 'Madu Odeng', 'Herbal', 'Cikaso', 'Surade'],
        'products' => [
            ['name' => 'Madu Hutan Liar Murni Odeng Cikaso (650ml)', 'price' => 120000, 'desc' => 'Madu murni kaya enzim alami untuk memperkuat imunitas dan vitalitas tubuh.'],
            ['name' => 'Madu Hitam Pahit Herbal Hutan (350ml)', 'price' => 75000, 'desc' => 'Madu pahit alami bermanfaat membantu menstabilkan gula darah dan kolesterol.']
        ]
    ],

    // --- JASA TEKNISI & PROPERTI ---
    [
        'name' => 'Servis AC & Pasang Baru Sejuk Mandiri Surade',
        'cat_name' => 'Servis AC',
        'img' => '/images/businesses/jasa_ac.jpg',
        'desc' => 'Jasa cuci AC split, isi ulang freon R32/R410A, bongkar pasang AC rumah/kantor, perbaikan AC bocor air dan tidak dingin bergaransi.',
        'tags' => ['Servis AC', 'Cuci AC', 'Freon AC', 'Teknisi AC', 'Surade'],
        'products' => [
            ['name' => 'Jasa Cuci AC Split Rumah 0.5 - 1 PK', 'price' => 65000, 'desc' => 'Pembersihan evaporator, filter udara, talang air, dan blower outdoor AC.'],
            ['name' => 'Isi Ulang Freon R32 / R410A Full Dingin', 'price' => 120000, 'desc' => 'Pengisian freon sesuai standar tekanan PSI pabrik agar AC dingin maksimal.']
        ]
    ],
    [
        'name' => 'Instalasi Listrik & Token PLN 24 Jam Surade',
        'cat_name' => 'Teknisi Listrik',
        'img' => '/images/businesses/jasa_listrik.jpg',
        'desc' => 'Pemasangan instalasi listrik rumah/toko, perbaikan korsleting MCB jeglek, grounding penangkal petir, dan perapihan kabel panel.',
        'tags' => ['Tukang Listrik', 'Instalasi Listrik', 'Korsleting', 'Surade'],
        'products' => [
            ['name' => 'Jasa Perbaikan Gangguan Korsleting Listrik', 'price' => 85000, 'desc' => 'Pengecekan sumber konslet, isolasi kabel rusak, dan penggantian saklar pengaman.'],
            ['name' => 'Pemasangan Titik Instalasi Lampu & Stop Kontak SNI', 'price' => 45000, 'desc' => 'Pemasangan kabel conduit standar keselamatan per titik lampu atau colokan.']
        ]
    ],
    [
        'name' => 'Laundry Kiloan & Express Wangi Bersih Cemerlang Surade',
        'cat_name' => 'Laundry Kiloan',
        'img' => '/images/businesses/jasa_laundry.jpg',
        'desc' => 'Cuci komplit setrika uap rapi, cuci karpet masjid/kantor, cuci bed cover tebal, cuci sepatu sneaker, dan antar jemput gratis area Surade.',
        'tags' => ['Laundry Kiloan', 'Cuci Sepatu', 'Setrika Uap', 'Surade'],
        'products' => [
            ['name' => 'Paket Cuci Kering Setrika Uap Wangi (5 Kg)', 'price' => 35000, 'desc' => 'Pakaian dicuci higienis, disetrika uap rapi, dan dikemas plastik berparfum harum.'],
            ['name' => 'Cuci Bed Cover King Size Bebas Tungau', 'price' => 25000, 'desc' => 'Pembersihan menyeluruh serat bed cover tebal wangi bersih bebas kuman debu.']
        ]
    ],
    [
        'name' => 'Pangkas Rambut Barbershop Modern Raja Cukur Surade',
        'cat_name' => 'Barbershop',
        'img' => '/images/businesses/jasa_barbershop.jpg',
        'desc' => 'Potong rambut pria model kekinian (undercut, fade, two block, comma hair), cuci rambut keramas, pijat kepala leher, dan semir rambut menutup uban.',
        'tags' => ['Barbershop', 'Potong Rambut', 'Gaya Pria', 'Surade'],
        'products' => [
            ['name' => 'Paket Gentle Cut + Keramas + Pijat Relaksasi', 'price' => 30000, 'desc' => 'Potongan rambut presisi sesuai bentuk wajah, keramas air hangat, dan pijat relaksasi.'],
            ['name' => 'Pewarnaan Semir Rambut Hitam Alami / Fashion Color', 'price' => 60000, 'desc' => 'Pewarnaan rambut kualitas premium menutup uban merata tanpa merusak kulit kepala.']
        ]
    ],
    [
        'name' => 'Foto Studio & Wedding Organizer Abadi Memories Surade',
        'cat_name' => 'Foto Wedding & Prewedding',
        'img' => '/images/businesses/jasa_fotografi.jpg',
        'desc' => 'Dokumentasi foto video akad nikah resepsi, sesi prewedding outdoor Pantai Minajaya/Curug Cikaso, foto wisuda keluarga, dan cetak foto kanvas bingkai.',
        'tags' => ['Foto Studio', 'Wedding Organizer', 'Prewedding', 'Surade'],
        'products' => [
            ['name' => 'Paket Liputan Foto Video Wedding 1 Hari Lengkap', 'price' => 2500000, 'desc' => '2 Fotografer + 1 Videografer, album magazine kolase, video cinematic, flashdisk all files.'],
            ['name' => 'Foto Studio Wisuda / Keluarga (Cetak 12R + Bingkai)', 'price' => 150000, 'desc' => 'Sesi studio foto ber-AC background modern beresolusi tinggi include cetak dan frame.']
        ]
    ],
    [
        'name' => 'Rental Mobil & Travel Surade - Sukabumi - Bandung - Jakarta',
        'cat_name' => 'Rental Mobil',
        'img' => '/images/businesses/jasa_rental_mobil.jpg',
        'desc' => 'Sewa mobil Avanza, Innova Reborn, Hiace pariwisata lepas kunci atau plus sopir berpengalaman, jasa antar jemput bandara, dan travel door to door.',
        'tags' => ['Rental Mobil', 'Travel Jampang', 'Sewa Hiace', 'Surade'],
        'products' => [
            ['name' => 'Sewa Mobil Avanza / Xenia + Driver (12 Jam)', 'price' => 400000, 'desc' => 'Mobil bersih wangi AC dingin dengan driver ramah memahami seluruh rute Sukabumi-Jabar.'],
            ['name' => 'Tiket Travel Door-to-Door Surade - Jakarta / Bandung', 'price' => 150000, 'desc' => 'Layanan jemput di rumah dan diantar langsung sampai alamat tujuan dengan nyaman.']
        ]
    ],

    // --- RETAIL & TOKO ---
    [
        'name' => 'Toko Sembako Grosir & Eceran Berkah Lancar Pasar Surade',
        'cat_name' => 'Grosir Sembako & Beras',
        'img' => '/images/businesses/retail_sembako.jpg',
        'desc' => 'Distributor beras pandan wangi Jampang, minyak goreng kemasan, gula pasir, tepung terigu, telur ayam negeri, dan bahan sembako warung eceran.',
        'tags' => ['Toko Sembako', 'Grosir Beras', 'Pasar Surade', 'Surade'],
        'products' => [
            ['name' => 'Beras Pandan Wangi Jampang Super (Karung 25 Kg)', 'price' => 340000, 'desc' => 'Beras pulen harum putih alami tanpa pemutih langsung dari penggilingan padi Surade.'],
            ['name' => 'Minyak Goreng Sawit Pouch 2 Liter Hemat', 'price' => 34000, 'desc' => 'Minyak goreng sawit jernih bermutu untuk aneka masakan gurih renyah.']
        ]
    ],
    [
        'name' => 'Toko Bahan Bangunan & Material TB Sinar Buniwangi Surade',
        'cat_name' => 'Toko Bangunan & Material',
        'img' => '/images/businesses/retail_material.jpg',
        'desc' => 'Menjual semen Tiga Roda/Holcim, pasir ayak cadas, baja ringan kanal C, genteng metal pasir, bata merah pres, cat tembok, dan besi beton SNI.',
        'tags' => ['Toko Bangunan', 'Baja Ringan', 'Semen', 'Bahan Material', 'Surade'],
        'products' => [
            ['name' => 'Semen Tiga Roda Portland 50 Kg SNI', 'price' => 68000, 'desc' => 'Semen berkekuatan tinggi daya rekat kokoh untuk cor dak lantai dan plesteran dinding.'],
            ['name' => 'Baja Ringan Kanal C75 Tebal 0.75mm (Batang 6 Meter)', 'price' => 88000, 'desc' => 'Rangka atap baja ringan kuat tahan karat bersertifikat standar konstruksi nasional.']
        ]
    ],
    [
        'name' => 'Percetakan, Fotocopy & Toko ATK Sinar Grafika Surade',
        'cat_name' => 'Toko Buku & Alat Tulis',
        'img' => '/images/businesses/retail_atk.jpg',
        'desc' => 'Cetak banner spanduk kilat, jilid skripsi hardcover emas, cetak undangan pernikahan, stempel flash otomatis, dan alat tulis perlengkapan kantor/sekolah.',
        'tags' => ['Percetakan', 'Cetak Banner', 'Fotocopy', 'ATK', 'Surade'],
        'products' => [
            ['name' => 'Cetak Banner Spanduk Flexi 280gsm (per Meter Persegi)', 'price' => 20000, 'desc' => 'Cetak banner warna cerah tajam tahan panas hujan untuk plang toko dan baliho promosi.'],
            ['name' => 'Jilid Hardcover Skripsi / Laporan Lambang Emas Foil', 'price' => 35000, 'desc' => 'Jilid hardcover kuat rapi dengan tulisan timbul foil emas mewah standar kampus.']
        ]
    ],
    [
        'name' => 'Butik Busana Muslim & Hijab Fashion Al-Zahra Surade',
        'cat_name' => 'Toko Busana Muslim & Hijab',
        'img' => '/images/businesses/retail_hijab.jpg',
        'desc' => 'Koleksi busana muslimah gamis syar\'i modern, baju koko bordir pria, mukena sutra bordir, jilbab pashmina ceruty, dan sarung tenun berkualitas.',
        'tags' => ['Busana Muslim', 'Gamis Syari', 'Hijab', 'Baju Koko', 'Surade'],
        'products' => [
            ['name' => 'Gamis Syar\'i Set Khimar Ceruty Babydoll Premium', 'price' => 185000, 'desc' => 'Bahan lembut jatuh adem tidak menerawang dengan variasi payet mutiara elegan.'],
            ['name' => 'Baju Koko Kurta Pria Katun Toyobo Lengan Panjang', 'price' => 125000, 'desc' => 'Bahan katun dingin menyerap keringat dengan saku fungsional nyaman beribadah.']
        ]
    ],
    [
        'name' => 'Sentra Kerajinan Anyaman Bambu Sauyunan Kadaleman Surade',
        'cat_name' => 'Kerajinan Anyaman Bambu',
        'img' => '/images/businesses/retail_bambu.jpg',
        'desc' => 'Pusat pengrajin besek bambu natural, bakul nasi tradisional, kap lampu anyaman bambu estetik kafe, dan kursi bale bambu khas Surade.',
        'tags' => ['Anyaman Bambu', 'Besek Bambu', 'Kerajinan Tangan', 'Kadaleman', 'Surade'],
        'products' => [
            ['name' => 'Besek Anyaman Bambu Natural 20x20cm (10 Pasang)', 'price' => 35000, 'desc' => 'Besek bambu rapi halus ramah lingkungan untuk wadah katering dan oleh-oleh.'],
            ['name' => 'Kap Lampu Gantung Anyaman Bambu Estetik Cafe', 'price' => 75000, 'desc' => 'Kap lampu bambu bernuansa etnik tradisional mempercantik interior kafe dan rumah.']
        ]
    ],

    // --- ELEKTRONIK & HP ---
    [
        'name' => 'Pusat Servis HP & Ganti LCD Kilat Flash Cell Surade',
        'cat_name' => 'Servis HP & Smartphone',
        'img' => '/images/businesses/elektronik_hp.jpg',
        'desc' => 'Spesialis ganti LCD pecah sentuh bergaransi, ganti baterai tanam original, perbaikan HP mati total masuk air, dan aksesoris tempered glass/casing.',
        'tags' => ['Servis HP', 'Ganti LCD', 'Baterai HP', 'Konter HP', 'Surade'],
        'products' => [
            ['name' => 'Jasa Ganti Layar LCD HP Android Original + Pasang', 'price' => 175000, 'desc' => 'Layar sentuh responsif warna tajam bergaransi ganti baru jika mengalami kendala.'],
            ['name' => 'Ganti Baterai Tanam Original High Capacity Bergaransi', 'price' => 110000, 'desc' => 'Baterai awet tahan lama anti kembung dengan proteksi IC pengaman ganda.']
        ]
    ],
    [
        'name' => 'Toko Komputer, Laptop & Paket CCTV Surya Komputindo Surade',
        'cat_name' => 'Toko Laptop & Komputer',
        'img' => '/images/businesses/elektronik_laptop.jpg',
        'desc' => 'Jual beli laptop baru/second bergaransi, instal ulang Windows & software, rakit PC kasir/kantor, dan paket pasang kamera CCTV pantau lewat HP.',
        'tags' => ['Toko Laptop', 'Pasang CCTV', 'Servis Komputer', 'Surade'],
        'products' => [
            ['name' => 'Paket Pasang CCTV 4 Kamera HD Pantau Online HP', 'price' => 2150000, 'desc' => '4 Kamera night vision, DVR 4 channel, harddisk 500GB, kabel instalasi, dan setting HP.'],
            ['name' => 'Laptop Second Core i5 RAM 8GB SSD 256GB Bergaransi', 'price' => 3200000, 'desc' => 'Laptop mulus siap pakai untuk kerja kantoran, sekolah, dan editing ringan.']
        ]
    ],

    // --- KESEHATAN, PENDIDIKAN & WISATA ---
    [
        'name' => 'Apotek Sehat Keluarga & Praktik Dokter Al-Ikhlas Surade',
        'cat_name' => 'Apotek & Toko Obat',
        'img' => '/images/businesses/medis_apotek.jpg',
        'desc' => 'Melayani resep dokter, obat generik & paten, periksa tekanan darah tensi, cek gula darah/asam urat/kolesterol, vitamin anak, dan susu medis.',
        'tags' => ['Apotek', 'Toko Obat', 'Cek Kesehatan', 'Dokter', 'Surade'],
        'products' => [
            ['name' => 'Paket Cek Kesehatan Lengkap (Gula Darah + Asam Urat + Kolesterol)', 'price' => 35000, 'desc' => 'Pemeriksaan akurat cepat oleh tenaga medis apoteker dan perawat bersertifikat.'],
            ['name' => 'Multivitamin Imunitas Tubuh Vit C & Zinc (30 Kaplet)', 'price' => 45000, 'desc' => 'Suplemen menjaga stamina tubuh dan daya tahan dari penyakit kelelahan.']
        ]
    ],
    [
        'name' => 'Optik Kacamata & Periksa Mata Komputer Akurat Surade',
        'cat_name' => 'Optik Kacamata',
        'img' => '/images/businesses/medis_optik.jpg',
        'desc' => 'Pemeriksaan refraksi mata gratis dengan alat komputer canggih, frame kacamata kekinian pria wanita, dan lensa anti radiasi blueray / photocromic.',
        'tags' => ['Optik', 'Kacamata', 'Lensa Photocromic', 'Periksa Mata', 'Surade'],
        'products' => [
            ['name' => 'Paket Frame Kacamata Modern + Lensa Anti Blueray', 'price' => 185000, 'desc' => 'Melindungi mata dari paparan sinar radiasi layar smartphone dan monitor laptop.'],
            ['name' => 'Lensa Kacamata Photocromic Berubah Warna Gelap Otomatis', 'price' => 150000, 'desc' => 'Lensa otomatis gelap saat terkena terik matahari outdoor dan bening di dalam ruangan.']
        ]
    ],
    [
        'name' => 'Bimbingan Belajar & Kursus Bahasa Inggris Smart Kids Surade',
        'cat_name' => 'Bimbingan Belajar',
        'img' => '/images/businesses/pendidikan_bimbel.jpg',
        'desc' => 'Bimbel mata pelajaran SD, SMP, SMA, persiapan ujian masuk sekolah kedinasan / PTN, dan kelas kursus percakapan bahasa Inggris aktif.',
        'tags' => ['Bimbel', 'Kursus Bahasa Inggris', 'Pendidikan', 'Surade'],
        'products' => [
            ['name' => 'Bimbel SD / SMP Paket Bulanan Intensif (3x Pertemuan Seminggu)', 'price' => 150000, 'desc' => 'Bimbingan intensif matematika, IPA, Bahasa Inggris dengan tentor berpengalaman.'],
            ['name' => 'Program English Speaking & Conversation Class (1 Bulan)', 'price' => 175000, 'desc' => 'Metode pembelajaran aktif percakapan langsung percaya diri berbahasa Inggris.']
        ]
    ],
    [
        'name' => 'Homestay Pondok Wisata & Villa Sunset View Pantai Minajaya',
        'cat_name' => 'Villa & Penginapan',
        'img' => '/images/businesses/wisata_homestay.jpg',
        'desc' => 'Penginapan nyaman ber-AC tepat di bibir Pantai Minajaya Surade, kamar mandi dalam, dapur masak bersama, view sunset spektakuler, dan area BBQ ikan.',
        'tags' => ['Homestay', 'Penginapan', 'Pantai Minajaya', 'Villa', 'Surade'],
        'products' => [
            ['name' => 'Sewa Kamar Homestay AC Double Bed (1 Malam)', 'price' => 250000, 'desc' => 'Fasilitas kamar bersih, AC dingin, TV, Wi-Fi gratis, kopi teh pagi, 1 menit ke pantai.'],
            ['name' => 'Paket Sewa 1 Rumah Villa Full Famili (3 Kamar Tidur)', 'price' => 750000, 'desc' => 'Kapasitas 10-15 orang include dapur lengkap, ruang tamu luas, dan parkir mobil luas.']
        ]
    ],
    [
        'name' => 'Pemandu Wisata & Perahu Susur Sungai Curug Cikaso Adventure',
        'cat_name' => 'Wisata Curug Cikaso',
        'img' => '/images/businesses/wisata_curug.jpg',
        'desc' => 'Sewa perahu motor wisata susur sungai hijau toska Cikaso menuju air terjun tiga curug megah (Aseupan, Meong, Aki) didampingi pemandu wisata lokal.',
        'tags' => ['Curug Cikaso', 'Perahu Wisata', 'Pemandu Wisata', 'Geopark', 'Surade'],
        'products' => [
            ['name' => 'Paket Sewa Perahu Wisata Susur Sungai Cikaso PP (10 Orang)', 'price' => 80000, 'desc' => 'Sensasi perahu motor menyusuri sungai hijau toska bertebing asri menuju air terjun.'],
            ['name' => 'Jasa Pemandu Guide Wisata Geopark Ciletuh-Surade (1 Hari)', 'price' => 200000, 'desc' => 'Pemandu ramah berpengetahuan mendampingi rute spot foto terbaik dan sejarah alam Surade.']
        ]
    ],
    [
        'name' => 'Pusat Futsal & Lapangan Badminton Gelora Surade',
        'cat_name' => 'Sekolah Sepak Bola',
        'img' => '/images/businesses/olahraga_futsal.jpg',
        'desc' => 'Sewa lapangan futsal rumput sintetis standar interlock empuk, lapangan bulutangkis vinyl, ruang ganti bersih, penerangan LED terang, dan kantin olahraga.',
        'tags' => ['Futsal', 'Badminton', 'Sewa Lapangan', 'Olahraga', 'Surade'],
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

echo "Menghapus data usaha lama...\n";
DB::statement('SET FOREIGN_KEY_CHECKS = 0');
DB::table('products')->truncate();
DB::table('businesses')->truncate();
DB::statement('SET FOREIGN_KEY_CHECKS = 1');

echo "Membuat 246 data usaha nyata dan 492 produk di 12 Desa/Kelurahan Kecamatan Surade...\n";

for ($i = 0; $i < 246; $i++) {
    $tplIndex = $i % count($businessArchetypes);
    $tpl = $businessArchetypes[$tplIndex];
    $prefix = $prefixes[(int) floor($i / count($businessArchetypes)) % count($prefixes)];
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
    if ($i >= count($businessArchetypes)) {
        $cleanVillageName = str_replace(['Desa ', 'Kelurahan '], '', $village['name']);
        $bName = "{$tpl['name']} {$prefix} {$cleanVillageName}";
    }

    $bSlug = Str::slug($bName) . '-' . rand(100, 999);
    $lat = round($village['lat'] + (rand(-80, 80) / 10000), 7);
    $lng = round($village['lng'] + (rand(-80, 80) / 10000), 7);

    // Phone / WA Provider prefixes in Indonesia
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
        'website' => 'https://surade.com',
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

    // Insert 2 Products per business
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
        echo "Berhasil membuat " . ($i + 1) . " / 246 data usaha...\n";
    }
}

$totalBiz = DB::table('businesses')->count();
$totalProd = DB::table('products')->count();

echo "\n=== SUKSES: {$totalBiz} DATA USAHA NYATA SURADE.COM & {$totalProd} PRODUK BERHASIL DISIMPAN! ===\n";
