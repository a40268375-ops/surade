<?php
require __DIR__ . '/../backend/vendor/autoload.php';
$app = require_once __DIR__ . '/../backend/bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

use Illuminate\Support\Facades\DB;
use Carbon\Carbon;

echo "=== MASTER SURADE ECOSYSTEM ENHANCEMENT SCRIPT ===\n";

$pdo = DB::connection()->getPdo();

// 1. UPDATE BUSINESSES (Verified: 90, Free: 63, plus realistic opening hours, descriptions, achievements, views, clicks)
$businesses = $pdo->query("SELECT id, name, category_id, city, address FROM businesses ORDER BY id ASC")->fetchAll(PDO::FETCH_ASSOC);
$totalBiz = count($businesses);
echo "Processing $totalBiz businesses...\n";

// Indonesian real names for reviews
$reviewers = [
    ['name' => 'Asep Kurniawan', 'email' => 'asep.kurniawan@gmail.com', 'avatar' => null],
    ['name' => 'Siti Nurhaliza', 'email' => 'siti.nurhaliza@gmail.com', 'avatar' => null],
    ['name' => 'Dedi Supriadi', 'email' => 'dedi.supriadi@yahoo.co.id', 'avatar' => null],
    ['name' => 'Rina Marlina', 'email' => 'rina.marlina88@gmail.com', 'avatar' => null],
    ['name' => 'Hendra Gunawan', 'email' => 'hendra.gunawan@gmail.com', 'avatar' => null],
    ['name' => 'Yudi Pratama', 'email' => 'yudi.pratama@gmail.com', 'avatar' => null],
    ['name' => 'Eneng Sulastri', 'email' => 'eneng.sulastri@gmail.com', 'avatar' => null],
    ['name' => 'Budi Santoso', 'email' => 'budi.santoso@yahoo.com', 'avatar' => null],
    ['name' => 'Agus Hermawan', 'email' => 'agus.hermawan@gmail.com', 'avatar' => null],
    ['name' => 'Dewi Anggraeni', 'email' => 'dewi.anggraeni@gmail.com', 'avatar' => null],
    ['name' => 'Iwan Setiawan', 'email' => 'iwan.setiawan@gmail.com', 'avatar' => null],
    ['name' => 'Maman Sulaeman', 'email' => 'maman.sulaeman@gmail.com', 'avatar' => null],
    ['name' => 'Tuti Handayani', 'email' => 'tuti.handayani@gmail.com', 'avatar' => null],
    ['name' => 'Wawan Darmawan', 'email' => 'wawan.darmawan@gmail.com', 'avatar' => null],
    ['name' => 'Ai Rohayati', 'email' => 'ai.rohayati@gmail.com', 'avatar' => null],
];

// Clean existing ratings and products for a clean, perfectly structured rebuild
$pdo->exec("DELETE FROM ratings");
$pdo->exec("DELETE FROM products");
$pdo->exec("DELETE FROM advertisements");

$stmtUpdateBiz = $pdo->prepare("
    UPDATE businesses SET
        description = :description,
        achievements = :achievements,
        opening_days = :opening_days,
        views = :views,
        clicks = :clicks,
        is_premium = :is_premium,
        premium_plan = :premium_plan,
        verified_at = :verified_at,
        status = 'approved',
        is_active = 1,
        rating = :rating,
        rating_count = :rating_count
    WHERE id = :id
");

$stmtInsertProduct = $pdo->prepare("
    INSERT INTO products (business_id, name, description, price, image, is_active, status, created_at, updated_at)
    VALUES (:business_id, :name, :description, :price, :image, 1, 'approved', :created_at, :updated_at)
");

$stmtInsertRating = $pdo->prepare("
    INSERT INTO ratings (business_id, user_id, user_name, user_email, user_avatar, rating, review, created_at, updated_at)
    VALUES (:business_id, :user_id, :user_name, :user_email, :user_avatar, :rating, :review, :created_at, :updated_at)
");

$verifiedCount = 0;
$freeCount = 0;

foreach ($businesses as $index => $b) {
    $id = (int)$b['id'];
    $name = $b['name'];
    $desa = trim(explode(',', $b['address'])[1] ?? 'Kelurahan Surade');
    
    // Exactly 90 businesses verified (first 90 in diverse villages), remaining 63 Free
    $isVerified = ($index < 90);
    if ($isVerified) {
        $verifiedCount++;
        $verifiedAt = Carbon::now()->subDays(rand(10, 180));
        $isPremium = 1;
        $premiumPlan = 'Mitra Bisnis Terverifikasi';
    } else {
        $freeCount++;
        $verifiedAt = null;
        $isPremium = 0;
        $premiumPlan = null;
    }

    $views = rand(180, 890);
    $clicks = rand(45, 260);

    // Determine Hours, Description, Achievements, Products, Reviews by Niche
    $nicheData = generateNicheData($b, $desa);

    $stmtUpdateBiz->execute([
        ':id' => $id,
        ':description' => $nicheData['description'],
        ':achievements' => $nicheData['achievements'],
        ':opening_days' => json_encode($nicheData['opening_days']),
        ':views' => $views,
        ':clicks' => $clicks,
        ':is_premium' => $isPremium,
        ':premium_plan' => $premiumPlan,
        ':verified_at' => $verifiedAt,
        ':rating' => $nicheData['rating'],
        ':rating_count' => count($nicheData['reviews']),
    ]);

    // Insert Products
    foreach ($nicheData['products'] as $p) {
        $stmtInsertProduct->execute([
            ':business_id' => $id,
            ':name' => $p['name'],
            ':description' => $p['description'],
            ':price' => $p['price'],
            ':image' => "/images/businesses/biz_real_{$id}.jpg",
            ':created_at' => Carbon::now()->subDays(rand(5, 60)),
            ':updated_at' => Carbon::now()->subDays(rand(1, 4)),
        ]);
    }

    // Insert Ratings / Reviews
    $availableUserIds = [94, 14, 166, 169, 170, 171, 172, 173, 174];
    foreach ($nicheData['reviews'] as $rIdx => $revText) {
        $uId = $availableUserIds[$rIdx % count($availableUserIds)];
        $revUser = $reviewers[($id + $rIdx * 3) % count($reviewers)];
        $stmtInsertRating->execute([
            ':business_id' => $id,
            ':user_id' => $uId,
            ':user_name' => $revUser['name'],
            ':user_email' => $revUser['email'],
            ':user_avatar' => null,
            ':rating' => ($rIdx == 0 ? 5 : rand(4, 5)),
            ':review' => $revText,
            ':created_at' => Carbon::now()->subDays(rand(2, 90)),
            ':updated_at' => Carbon::now()->subDays(rand(1, 90)),
        ]);
    }
}

echo "Businesses updated: Verified = $verifiedCount, Free = $freeCount\n";

// 2. INSERT 6 TOP PREMIUM ADS + 5 BOTTOM STANDARD ADS
echo "\nInserting 6 Top Premium Ads + 5 Bottom Standard Ads...\n";

$premiumAds = [
    [
        'business_id' => 35,
        'name' => 'Roastery Kopi Robusta Pajampangan Buniwangi',
        'package_type' => 'premium',
        'package_name' => 'Paket Banner Hero Premium',
        'price' => 150000.00,
        'city' => 'Desa Buniwangi',
        'province' => 'Jawa Barat',
        'banner' => '/images/businesses/biz_real_35.jpg',
        'logo' => '/images/businesses/biz_real_35.jpg',
    ],
    [
        'business_id' => 34,
        'name' => 'Sentra Pembibitan Durian Bawor Buniwangi',
        'package_type' => 'premium',
        'package_name' => 'Paket Banner Hero Premium',
        'price' => 150000.00,
        'city' => 'Desa Buniwangi',
        'province' => 'Jawa Barat',
        'banner' => '/images/businesses/biz_real_34.jpg',
        'logo' => '/images/businesses/biz_real_34.jpg',
    ],
    [
        'business_id' => 106,
        'name' => 'Kawasan Wisata Alam Curug Cikaso Geopark',
        'package_type' => 'premium',
        'package_name' => 'Paket Banner Hero Premium',
        'price' => 150000.00,
        'city' => 'Desa Cipeundeuy',
        'province' => 'Jawa Barat',
        'banner' => '/images/businesses/biz_real_106.jpg',
        'logo' => '/images/businesses/biz_real_106.jpg',
    ],
    [
        'business_id' => 95,
        'name' => 'RM Ikan Bakar Pesisir Pantai Minajaya',
        'package_type' => 'premium',
        'package_name' => 'Paket Banner Hero Premium',
        'price' => 150000.00,
        'city' => 'Desa Pasiripis',
        'province' => 'Jawa Barat',
        'banner' => '/images/businesses/biz_real_95.jpg',
        'logo' => '/images/businesses/biz_real_95.jpg',
    ],
    [
        'business_id' => 9,
        'name' => 'Bakso Tiga Sodara Kang Ubes Surade',
        'package_type' => 'premium',
        'package_name' => 'Paket Banner Hero Premium',
        'price' => 150000.00,
        'city' => 'Kelurahan Surade',
        'province' => 'Jawa Barat',
        'banner' => '/images/businesses/biz_real_9.jpg',
        'logo' => '/images/businesses/biz_real_9.jpg',
    ],
    [
        'business_id' => 10,
        'name' => 'Yasa Hotel & Penginapan Surade',
        'package_type' => 'premium',
        'package_name' => 'Paket Banner Hero Premium',
        'price' => 150000.00,
        'city' => 'Kelurahan Surade',
        'province' => 'Jawa Barat',
        'banner' => '/images/businesses/biz_real_10.jpg',
        'logo' => '/images/businesses/biz_real_10.jpg',
    ],
];

$standardAds = [
    [
        'business_id' => 142,
        'name' => 'Sentra Madu Hutan Odeng Liar Wanasari',
        'package_type' => 'standard',
        'package_name' => 'Paket Standard Usaha Pilihan',
        'price' => 75000.00,
        'city' => 'Desa Wanasari',
        'province' => 'Jawa Barat',
        'banner' => '/images/businesses/biz_real_142.jpg',
        'logo' => '/images/businesses/biz_real_142.jpg',
    ],
    [
        'business_id' => 130,
        'name' => 'Sentra Opak Ketan Bakar Gurih Renyah Kademangan',
        'package_type' => 'standard',
        'package_name' => 'Paket Standard Usaha Pilihan',
        'price' => 75000.00,
        'city' => 'Desa Kademangan',
        'province' => 'Jawa Barat',
        'banner' => '/images/businesses/biz_real_130.jpg',
        'logo' => '/images/businesses/biz_real_130.jpg',
    ],
    [
        'business_id' => 110,
        'name' => 'Sentra Penderes & Pengrajin Gula Kelapa Cipeundeuy',
        'package_type' => 'standard',
        'package_name' => 'Paket Standard Usaha Pilihan',
        'price' => 75000.00,
        'city' => 'Desa Cipeundeuy',
        'province' => 'Jawa Barat',
        'banner' => '/images/businesses/biz_real_110.jpg',
        'logo' => '/images/businesses/biz_real_110.jpg',
    ],
    [
        'business_id' => 7,
        'name' => 'Bengkel Resmi Honda AHASS Daya Motor Surade',
        'package_type' => 'standard',
        'package_name' => 'Paket Standard Usaha Pilihan',
        'price' => 75000.00,
        'city' => 'Kelurahan Surade',
        'province' => 'Jawa Barat',
        'banner' => '/images/businesses/biz_real_7.jpg',
        'logo' => '/images/businesses/biz_real_7.jpg',
    ],
    [
        'business_id' => 82,
        'name' => 'Rumah Batik Tulis & Cap Motif Jampang Sirnasari',
        'package_type' => 'standard',
        'package_name' => 'Paket Standard Usaha Pilihan',
        'price' => 75000.00,
        'city' => 'Desa Sirnasari',
        'province' => 'Jawa Barat',
        'banner' => '/images/businesses/biz_real_82.jpg',
        'logo' => '/images/businesses/biz_real_82.jpg',
    ],
];

$stmtInsertAd = $pdo->prepare("
    INSERT INTO advertisements (
        user_id, business_id, name, package_type, package_name, duration_days,
        image, banner, logo, city, province, price, original_price, discount_amount,
        status, start_date, end_date, created_at, updated_at
    ) VALUES (
        94, :business_id, :name, :package_type, :package_name, 30,
        :image, :banner, :logo, :city, :province, :price, :original_price, 0,
        'active', :start_date, :end_date, :created_at, :updated_at
    )
");

foreach ($premiumAds as $ad) {
    $stmtInsertAd->execute([
        ':business_id' => $ad['business_id'],
        ':name' => $ad['name'],
        ':package_type' => $ad['package_type'],
        ':package_name' => $ad['package_name'],
        ':image' => $ad['banner'],
        ':banner' => $ad['banner'],
        ':logo' => $ad['logo'],
        ':city' => $ad['city'],
        ':province' => $ad['province'],
        ':price' => $ad['price'],
        ':original_price' => $ad['price'],
        ':start_date' => Carbon::now()->subDays(2),
        ':end_date' => Carbon::now()->addDays(28),
        ':created_at' => Carbon::now()->subDays(2),
        ':updated_at' => Carbon::now()->subDays(2),
    ]);
}

foreach ($standardAds as $ad) {
    $stmtInsertAd->execute([
        ':business_id' => $ad['business_id'],
        ':name' => $ad['name'],
        ':package_type' => $ad['package_type'],
        ':package_name' => $ad['package_name'],
        ':image' => $ad['banner'],
        ':banner' => $ad['banner'],
        ':logo' => $ad['logo'],
        ':city' => $ad['city'],
        ':province' => $ad['province'],
        ':price' => $ad['price'],
        ':original_price' => $ad['price'],
        ':start_date' => Carbon::now()->subDays(1),
        ':end_date' => Carbon::now()->addDays(29),
        ':created_at' => Carbon::now()->subDays(1),
        ':updated_at' => Carbon::now()->subDays(1),
    ]);
}

echo "Total advertisements inserted: " . (count($premiumAds) + count($standardAds)) . " (6 Premium + 5 Standard)\n";

echo "\n=== MASTER SCRIPT COMPLETED SUCCESSFULLY ===\n";

// HELPER FUNCTION TO GENERATE RICH AUTHENTIC NICHE DATA
function generateNicheData($b, $desa) {
    $name = $b['name'];
    $nLower = strtolower($name);

    $openingDays = [
        ['day' => 'Senin - Minggu', 'open' => '08:00', 'close' => '21:00', 'is_open' => true]
    ];
    $achievements = null;
    $desc = "Pilihan usaha terpercaya di kawasan Pajampangan Surade, melayani warga dan pengunjung dengan produk berkualitas serta pelayanan terbaik.";
    $rating = 4.8;
    $products = [];
    $reviews = [];

    if (str_contains($nLower, 'kopi') || str_contains($nLower, 'roastery') || str_contains($nLower, 'warkop')) {
        $openingDays = [
            ['day' => 'Senin - Minggu', 'open' => '06:00', 'close' => '23:00', 'is_open' => true]
        ];
        if (str_contains($nLower, 'roastery') || str_contains($nLower, 'robusta')) {
            $desc = "Sentra Roastery Kopi Robusta Pajampangan di {$desa} mengolah biji kopi petik merah pilihan dari perkebunan rakyat Surade. Melayani penjualan biji sangrai (roast beans), bubuk kopi murni fresh, serta edukasi seduh manual khas Jampang.";
            $achievements = "🏆 Juara 1 Kontes Kopi Robusta Sukabumi Festival Pajampangan 2024\n📜 Sertifikasi Halal Kemenag RI (ID321100018928)\n🎖️ Mitra Binaan Dinas Perkebunan & Perdagangan Kab. Sukabumi";
            $products = [
                ['name' => 'Kopi Robusta Sangrai Asli Jampang 250g', 'price' => 35000, 'description' => 'Biji kopi robusta petik merah sangrai medium dark dengan aroma cokelat nutty khas Pajampangan.'],
                ['name' => 'Kopi Robusta Bubuk Murni Halus 500g', 'price' => 65000, 'description' => 'Bubuk kopi murni tanpa campuran, digiling fresh siap seduh tubruk atau filter.'],
                ['name' => 'Paket Kopi Robusta Gift Box Pajampangan 1kg', 'price' => 95000, 'description' => 'Paket oleh-oleh eksklusif kopi robusta khas Surade lengkap dengan kemasan kedap udara ziplock.']
            ];
            $reviews = [
                "Kopi robustanya mantap banget! Aromanya wangi nutty khas Jampang, nggak ada asemnya dan pahitnya pas.",
                "Sangat recommended buat pecinta kopi tubruk, biji kopinya fresh baru diroasting.",
                "Pelayanan ramah, bisa beli bubuk sesuai pesanan tingkat gilingan."
            ];
        } else {
            $desc = "Warung kopi tradisional di {$desa} yang menyajikan seduhan kopi tubruk hangat, teh manis, serta aneka gorengan hangat seperti pisang goreng, bala-bala, dan gehu gurih renyah.";
            $products = [
                ['name' => 'Kopi Tubruk Hitam Cangkir Khas Warkop', 'price' => 5000, 'description' => 'Seduhan kopi hitam bubuk murni gula manis pas penghangat suasana.'],
                ['name' => 'Aneka Gorengan Hangat (Pisang, Bala-bala, Gehu)', 'price' => 1500, 'description' => 'Gorengan renyah gurih baru diangkat dari wajan panas.'],
                ['name' => 'Paket Kopi + 3 Gorengan Hangat', 'price' => 8000, 'description' => 'Kombinasi sarapan atau nongkrong sore hemat nikmat.']
            ];
            $reviews = [
                "Tempat nongkrong asik, kopinya sedap dan gorengannya selalu baru digoreng hangat-hangat.",
                "Harga murah meriah, Kang Maman pelayanannya selalu ramah dan guyub.",
                "Cocok banget buat istirahat ngopi santai di pinggir jalan."
            ];
        }
    }
    elseif (str_contains($nLower, 'durian') || str_contains($nLower, 'bibit') || str_contains($nLower, 'pembibitan')) {
        $openingDays = [
            ['day' => 'Senin - Minggu', 'open' => '07:00', 'close' => '17:30', 'is_open' => true]
        ];
        $desc = "Sentra penangkar dan pembibitan tanaman buah unggul di {$desa}, menyediakan bibit durian bawor okulasi, montong kani, mangga, alpukat, dan pepaya bersertifikat mutu siap tanam.";
        $achievements = "🌱 Sertifikasi Mutu Benih & Sertifikat Penangkar Resmi BPSBTPH Jawa Barat\n🥇 Juara Stand Pertanian Hortikultura Unggulan Sukabumi\n🛡️ Garansi Varietas Asli 100% Okulasi Super";
        $products = [
            ['name' => 'Bibit Pohon Durian Bawor Okulasi Super (80-100cm)', 'price' => 45000, 'description' => 'Bibit durian bawor polybag siap tanam, batang kokoh dan cepat berbuah dalam 3-4 tahun.'],
            ['name' => 'Bibit Durian Montong Kani Kaki Tiga (1 Meter)', 'price' => 65000, 'description' => 'Bibit durian okulasi kaki ganda untuk penyerapan nutrisi maksimal dan tahan hama.'],
            ['name' => 'Pupuk Organik Khusus Pertumbuhan Bibit Durian 5kg', 'price' => 30000, 'description' => 'Nutrisi lengkap penyubur daun dan perangsang akar pohon buah.']
        ];
        $reviews = [
            "Bibit durian bawornya subur dan sehat, akarnya kuat di polybag. Sekarang sudah mulai tumbuh tunas baru.",
            "Penjualnya paham teknis perawatan dan sabar ngasih tips pemupukan.",
            "Bibit asli bersertifikat, pengemasan aman dan kualitasnya terjamin."
        ];
    }
    elseif (str_contains($nLower, 'curug cikaso') || str_contains($nLower, 'wisata')) {
        $openingDays = [
            ['day' => 'Senin - Minggu', 'open' => '07:00', 'close' => '18:00', 'is_open' => true]
        ];
        $desc = "Destinasi wisata alam air terjun legendaris Geopark Ciletuh-Surade di {$desa} dengan tiga aliran air terjun berdampingan (Aseupan, Meong, dan Aki) dengan kolam hijau toska yang eksotis.";
        $achievements = "🌟 Destinasi Unggulan UNESCO Global Geopark Ciletuh-Palabuhanratu\n🏆 Pemenang Anugerah Pesona Indonesia (API) Kategori Surga Tersembunyi\n🛡️ Pengelolaan Berstandar Sapta Pesona Pariwisata";
        $products = [
            ['name' => 'Tiket Masuk Kawasan Wisata Alam Curug Cikaso', 'price' => 10000, 'description' => 'Tiket masuk area air terjun dan fasilitas spot foto pemandangan alam.'],
            ['name' => 'Sewa Perahu Susur Sungai Cikaso (PP Pulang Pergi)', 'price' => 60000, 'description' => 'Perahu wisata kapasitas hingga 10 orang melintasi sungai berair jernih kehijauan.'],
            ['name' => 'Jasa Pemandu Wisata Lokal & Spot Foto Curug', 'price' => 50000, 'description' => 'Pemandu lokal ramah mendampingi eksplorasi dan pengambilan foto terbaik.']
        ];
        $reviews = [
            "Pemandangan air terjunnya luar biasa indah! Airnya hijau toska jernih dan suasananya sejuk asri.",
            "Naik perahu susur sungai Cikaso seru banget, pemandangannya kayak di film petualangan.",
            "Wajib dikunjungi kalau ke Surade, salah satu curug terindah di Jawa Barat."
        ];
    }
    elseif (str_contains($nLower, 'ikan bakar') || str_contains($nLower, 'minajaya') || str_contains($nLower, 'pelelangan') || str_contains($nLower, 'tpi')) {
        $openingDays = [
            ['day' => 'Senin - Minggu', 'open' => '08:00', 'close' => '22:00', 'is_open' => true]
        ];
        $desc = "Pusat hidangan kuliner seafood laut segar dan pelelangan ikan di pesisir {$desa}. Menyajikan ikan kakap, bawal laut, cumi, dan udang bakar bumbu cobek kecap khas nelayan Pajampangan.";
        $achievements = "🐟 Sertifikasi Higiene & Sanitasi Pangan Dinas Kesehatan\n🏆 Rekomendasi Restoran Kuliner Bahari Terbaik Pantai Minajaya oleh Pokdarwis\n🌊 Pasokan Ikan Segar Langsung dari Kapal Nelayan Lokal";
        $products = [
            ['name' => 'Paket Ikan Kakap Bakar Cobek Timbel Komplit', 'price' => 45000, 'description' => 'Ikan kakap segar bakar arang bumbu cobek pedas gurih disajikan dengan nasi timbel, tahu tempe, dan lalapan.'],
            ['name' => 'Ikan Bawal Laut Bakar Madu Pedas Porsi Sedang', 'price' => 35000, 'description' => 'Bawal laut segar bakar bumbu madu kecap manis gurih meresap sampai ke tulang.'],
            ['name' => 'Kelapa Muda Murni Utuh Pantai Minajaya', 'price' => 15000, 'description' => 'Air kelapa muda segar langsung dipetik dari pohon pesisir pantai.']
        ];
        $reviews = [
            "Ikan bakarnya manis segar tanpa bau amis, bumbu cobeknya nendang pedas gurih.",
            "Makan seafood sambil menikmati angin sejuk Pantai Minajaya nikmat banget.",
            "Harganya transparan dan terjangkau, pelayanannya cepat."
        ];
    }
    elseif (str_contains($nLower, 'bakso') || str_contains($nLower, 'mie ayam')) {
        $openingDays = [
            ['day' => 'Senin - Minggu', 'open' => '09:30', 'close' => '21:00', 'is_open' => true]
        ];
        $desc = "Kuliner bakso sapi urat dan mie ayam lezat di {$desa}, dibuat dari olahan daging sapi segar pilihan dengan kuah kaldu sapi gurih pekat hangat.";
        $achievements = "🍜 Sertifikasi Halal MUI untuk Olahan Daging Sapi Murni\n🏆 Kuliner Bakso Favorit Warga Pajampangan";
        $products = [
            ['name' => 'Bakso Urat Super Komplit Tetelan Sapi', 'price' => 20000, 'description' => 'Bakso urat jumbo kenyal dengan taburan tetelan daging sapi melimpah, tahu bakso, mie, dan kuah kaldu sapi.'],
            ['name' => 'Mie Ayam Bakso Telur Spesial', 'price' => 16000, 'description' => 'Mie kenyal gurih topping ayam kecap manis legit, sawi hijau segar, dan bakso bulat.'],
            ['name' => 'Es Campur Segar Manis Podomoro', 'price' => 8000, 'description' => 'Minuman penutup segar dengan sirup manis, cincau, kelapa, dan susu kental.']
        ];
        $reviews = [
            "Bakso uratnya mantap, kenyal berurat asli daging sapi bukan tepung doang.",
            "Kuah kaldunya gurih ngaldu banget, mie ayamnya juga manis gurih pas.",
            "Tempatnya bersih dan pelayanannya sigap."
        ];
    }
    elseif (str_contains($nLower, 'madu') || str_contains($nLower, 'odeng')) {
        $openingDays = [
            ['day' => 'Senin - Minggu', 'open' => '08:00', 'close' => '20:00', 'is_open' => true]
        ];
        $desc = "Sentra madu hutan murni dari lebah pohon odeng liar di kawasan hutan {$desa}. Madu dipanen secara tradisional tanpa pemanasan atau campuran, menjaga kemurnian enzim dan khasiat alaminya.";
        $achievements = "🐝 Juara 1 Produk Madu Alami Unggulan Binaan Kehutanan Jabar\n🔬 Hasil Uji Laboratorium Kemurnian 100% Madu Asli Tanpa Gula Tambahan\n📜 Sertifikat Halal & P-IRT Resmi";
        $products = [
            ['name' => 'Madu Hutan Odeng Asli Pajampangan Botol 350ml', 'price' => 85000, 'description' => 'Madu murni nektar bunga hutan liar kaya antioksidan dan stamina.'],
            ['name' => 'Madu Hutan Odeng Kemasan Jerigen 1 Liter', 'price' => 220000, 'description' => 'Kemasan hemat untuk konsumsi keluarga dan pengobatan herbal.'],
            ['name' => 'Sarang Lebah Madu Odeng Fresh Cut 250g', 'price' => 65000, 'description' => 'Potongan sarang lebah madu asli langsung dari pohon hutan.']
        ];
        $reviews = [
            "Madu odengnya beneran asli! Manisnya ada aroma floral khas hutan Jampang, badan jadi fit.",
            "Sudah langganan beli buat kesehatan orang tua, kualitasnya terjamin asli tanpa campuran.",
            "Kemasan rapi anti bocor, pengiriman aman."
        ];
    }
    elseif (str_contains($nLower, 'opak') || str_contains($nLower, 'gula kelapa') || str_contains($nLower, 'gula aren') || str_contains($nLower, 'emping') || str_contains($nLower, 'keripik') || str_contains($nLower, 'tahu')) {
        $openingDays = [
            ['day' => 'Senin - Minggu', 'open' => '07:30', 'close' => '19:00', 'is_open' => true]
        ];
        $desc = "Sentra produksi olahan pangan tradisional khas Pajampangan di {$desa}, diolah secara higienis menggunakan bahan baku alami lokal pilihan menghasilkan cita rasa gurih otentik.";
        $achievements = "🏅 Penghargaan Pelestari Kuliner Tradisional Khas Pajampangan Diskoperindag\n📜 Izin Edar P-IRT Dinkes Kab. Sukabumi & Halal LPPOM MUI";
        $products = [
            ['name' => 'Opak Ketan Bakar Khas Jampang Gurih Renyah 1 Toples', 'price' => 35000, 'description' => 'Opak beras ketan bakar gurih tanpa pengawet renyah resep turun temurun.'],
            ['name' => 'Gula Kelapa Cetak Batok Asli Murni 1kg', 'price' => 22000, 'description' => 'Gula merah kelapa murni tanpa campuran obat, manis legit wangi alami.'],
            ['name' => 'Keripik Pisang Tanduk Gurih Renyah 250g', 'price' => 18000, 'description' => 'Keripik pisang tanduk renyah gurih manis asin pas di lidah.']
        ];
        $reviews = [
            "Opak ketannya enak banget, renyah dan gurih kelapanya berasa.",
            "Gula kelapanya beneran murni manis wangi, cocok buat bikin kue atau kopi.",
            "Oleh-oleh wajib kalau main ke wilayah Surade Jampang."
        ];
    }
    elseif (str_contains($nLower, 'bengkel') || str_contains($nLower, 'ahass') || str_contains($nLower, 'yamaha') || str_contains($nLower, 'las') || str_contains($nLower, 'tambal')) {
        $openingDays = [
            ['day' => 'Senin - Sabtu', 'open' => '08:00', 'close' => '17:00', 'is_open' => true],
            ['day' => 'Minggu', 'open' => '08:00', 'close' => '14:00', 'is_open' => true]
        ];
        $desc = "Layanan servis kendaraan roda dua, tune-up injeksi, ganti oli, dan pengelasan konstruksi teralis di {$desa} dengan mekanik berpengalaman dan suku cadang terjamin.";
        $achievements = "🔧 Sertifikat Teknisi Ahli Otomotif Sepeda Motor Injeksi\n🛡️ Garansi Servis & Jaminan Suku Cadang Asli Original";
        $products = [
            ['name' => 'Paket Servis Tune Up Lengkap Motor Matic/Bebek', 'price' => 45000, 'description' => 'Pembersihan throttle body/karbu, cek busi, rem, rantai/CVT, dan kelistrikan.'],
            ['name' => 'Ganti Oli Mesin Matic 0.8L + Jasa Pengerjaan', 'price' => 55000, 'description' => 'Oli mesin berkualitas pelindung mesin matic dari panas dan gesekan.'],
            ['name' => 'Jasa Tambal Ban Tubeless Cepat & Kuat', 'price' => 15000, 'description' => 'Tambal ban tubeless metode tusuk string karet anti bocor ulang.']
        ];
        $reviews = [
            "Mekaniknya ramah dan teliti, tarikan motor jadi enteng setelah diservis di sini.",
            "Biaya servis terjangkau dan transparan, nggak dipaksa ganti sparepart kalau masih bagus.",
            "Pengerjaan cepat dan hasilnya memuaskan."
        ];
    }
    elseif (str_contains($nLower, 'hotel') || str_contains($nLower, 'homestay') || str_contains($nLower, 'penginapan') || str_contains($nLower, 'villa')) {
        $openingDays = [
            ['day' => 'Setiap Hari (24 Jam)', 'open' => '00:00', 'close' => '23:59', 'is_open' => true]
        ];
        $desc = "Akomodasi penginapan dan kamar nyaman di {$desa}, berlokasi strategis dekat dengan pusat aktivitas dan destinasi wisata alam Surade. Dilengkapi fasilitas AC, Wi-Fi, dan kamar mandi bersih.";
        $achievements = "🏆 Sertifikat CHSE (Cleanliness, Health, Safety, Environment) Kemenparekraf\n⭐ Akomodasi Nyaman Favorit Wisatawan Geopark Ciletuh-Surade";
        $products = [
            ['name' => 'Kamar Standard AC Double Bed (Per Malam)', 'price' => 175000, 'description' => 'Kamar ber-AC, spring bed nyaman, TV, Wi-Fi gratis, dan kamar mandi dalam.'],
            ['name' => 'Kamar VIP Family Room Kapasitas 4 Orang', 'price' => 300000, 'description' => 'Kamar luas untuk keluarga lengkap dengan ruang tamu dan sarapan pagi.'],
            ['name' => 'Sewa Homestay 1 Rumah Lengkap Per Hari', 'price' => 650000, 'description' => 'Rumah singgah komplit 3 kamar tidur, dapur, dan parkir mobil luas.']
        ];
        $reviews = [
            "Kamarnya bersih dan wangi, kasurnya empuk bikin istirahat nyaman setelah seharian keliling wisata.",
            "Lokasi sangat strategis, stafnya ramah dan siap membantu 24 jam.",
            "Harga bersahabat dengan fasilitas yang memadai."
        ];
    }
    elseif (str_contains($nLower, 'puskesmas') || str_contains($nLower, 'klinik') || str_contains($nLower, 'apotek') || str_contains($nLower, 'medika')) {
        $openingDays = [
            ['day' => 'Setiap Hari (24 Jam)', 'open' => '00:00', 'close' => '23:59', 'is_open' => true]
        ];
        $desc = "Fasilitas pelayanan kesehatan masyarakat dan kefarmasian di {$desa}, melayani konsultasi dokter umum, rawat jalan, rawat inap, persalinan 24 jam, serta tebus resep obat lengkap.";
        $achievements = "🏥 Akreditasi Paripurna (Tingkat Tertinggi) Kementerian Kesehatan RI\n🚑 Pelayanan IGD PONEK & Rawat Inap Siaga 24 Jam\n💊 Apotek Berizin Resmi Dinkes & BPOM";
        $products = [
            ['name' => 'Pelayanan Pemeriksaan Dokter & Konsultasi Umum', 'price' => 20000, 'description' => 'Pemeriksaan kesehatan fisik, tensi darah, dan diagnosa medis dokter umum.'],
            ['name' => 'Paket Cek Kesehatan Lengkap (Gula Darah, Kolesterol, Asam Urat)', 'price' => 35000, 'description' => 'Pemeriksaan laboratorium cepat digital dengan hasil akurat langsung keluar.'],
            ['name' => 'Tebus Resep Obat Generik & Vitamin Daya Tahan Tubuh', 'price' => 25000, 'description' => 'Penyediaan obat resmi berizin BPOM dengan konsultasi apoteker profesional.']
        ];
        $reviews = [
            "Pelayanan dokter dan perawatnya sangat sabar dan ramah menangani pasien.",
            "Obat-obatannya lengkap, ruang tunggu nyaman dan bersih.",
            "Sangat membantu warga sekitar saat butuh penanganan medis darurat 24 jam."
        ];
    }
    elseif (str_contains($nLower, 'batik')) {
        $openingDays = [
            ['day' => 'Senin - Minggu', 'open' => '08:00', 'close' => '17:30', 'is_open' => true]
        ];
        $desc = "Rumah produksi batik tulis dan cap di {$desa} yang melestarikan motif khas Pajampangan seperti motif koral laut, hanjeli, dan geopark dengan pewarna alam dan katun primissima halus.";
        $achievements = "🎨 Warisan Budaya Takbenda Binaan Dekranasda Kab. Sukabumi\n🏆 Juara Kriya Batik Inovatif Tingkat Jawa Barat";
        $products = [
            ['name' => 'Kain Batik Cap Katun Motif Geopark Jampang (2 Meter)', 'price' => 125000, 'description' => 'Kain batik halus adem dengan motif khas alam dan budaya Pajampangan.'],
            ['name' => 'Kemeja Batik Pria Lengan Pendek Motif Pajampangan', 'price' => 165000, 'description' => 'Kemeja batik rapi jahitan halus berlapis furing nyaman untuk acara resmi.'],
            ['name' => 'Kain Batik Tulis Sutra Eksklusif Edisi Terbatas', 'price' => 450000, 'description' => 'Karya batik tulis canting tangan asli dengan tingkat kerumitan motif tinggi.']
        ];
        $reviews = [
            "Motif batiknya unik dan sarat makna lokal Jampang, bahannya adem dipakai.",
            "Kualitas jahitan kemejanya rapi banget, bangga pakai batik khas daerah sendiri.",
            "Bisa custom motif dan warna sesuai keinginan."
        ];
    }
    elseif (str_contains($nLower, 'anyaman') || str_contains($nLower, 'bambu')) {
        $openingDays = [
            ['day' => 'Senin - Minggu', 'open' => '08:00', 'close' => '17:00', 'is_open' => true]
        ];
        $desc = "Pengrajin kerajinan anyaman bambu tradisional Sunda di {$desa}, memproduksi boboko, besek, tampah, hiasan lampu, dan wadah ramah lingkungan dari bambu tali pilihan.";
        $achievements = "🎋 Kriya Bambu Ramah Lingkungan Unggulan Dinas Koperasi & UMKM\n🏅 Pemasok Kerajinan Tradisional Restoran Sunda se-Jawa Barat";
        $products = [
            ['name' => 'Boboko Anyaman Bambu Halus Tradisional (Ukuran Sedang)', 'price' => 25000, 'description' => 'Wadah nasi tradisional Sunda dari anyaman bambu alami tanpa vernis kimia.'],
            ['name' => 'Besek Bambu Paket Hantaran / Souvenir (Isi 10 Pcs)', 'price' => 35000, 'description' => 'Kotak besek anyaman bambu multifungsi untuk kemasan makanan atau souvenir.'],
            ['name' => 'Tampah Anyaman Bambu Diameter 50cm', 'price' => 20000, 'description' => 'Alat penampi beras dan wadah jemur olahan pangan tradisional yang kokoh.']
        ];
        $reviews = [
            "Anyamannya rapat dan halus, kualitas bambunya bagus nggak gampang patah.",
            "Beli besek buat kemasan oleh-oleh, tampilannya estetik dan ramah lingkungan.",
            "Pengrajinnya ramah dan melayani pesanan partai banyak tepat waktu."
        ];
    }
    else {
        // Default general retail / services in Surade
        $openingDays = [
            ['day' => 'Senin - Minggu', 'open' => '07:30', 'close' => '20:30', 'is_open' => true]
        ];
        $desc = "Usaha terpercaya di {$desa} melayani pemenuhan kebutuhan warga sekitar Surade dengan produk berkualitas, pelayanan ramah, dan harga yang bersaing.";
        $products = [
            ['name' => 'Produk / Layanan Unggulan 1', 'price' => 25000, 'description' => 'Pilihan utama pelanggan dengan kualitas terjamin dan harga terjangkau.'],
            ['name' => 'Produk / Layanan Pilihan 2', 'price' => 50000, 'description' => 'Paket kebutuhan harian yang praktis dan efisien untuk pelanggan.'],
        ];
        $reviews = [
            "Pelayanan sangat memuaskan, tempatnya mudah dijangkau dan harganya wajar.",
            "Sudah beberapa kali transaksi di sini, selalu puas dengan pelayanannya."
        ];
    }

    return [
        'description' => $desc,
        'achievements' => $achievements,
        'opening_days' => $openingDays,
        'rating' => $rating,
        'products' => $products,
        'reviews' => $reviews,
    ];
}
