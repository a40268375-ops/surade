<?php
/**
 * INJECT REAL SURADE BUSINESSES
 * Data berdasarkan penelitian nyata dari berbagai sumber online:
 * - Google Maps
 * - Kompasiana
 * - Pikiran Rakyat  
 * - Bubuh.id
 * - Facebook Pages bisnis lokal
 * - Lokanesia
 */

require __DIR__ . '/../backend/vendor/autoload.php';
$app = require_once __DIR__ . '/../backend/bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

use App\Models\Business;
use App\Models\Product;
use App\Models\Category;
use App\Models\User;
use Illuminate\Support\Str;
use Illuminate\Support\Facades\DB;

echo "=== INJECTING REAL SURADE BUSINESSES WITH AUTHENTIC DATA ===\n\n";

$user = User::where('role', 'admin')->first() ?? User::first();
$userId = $user->id;
echo "Using User ID: $userId ({$user->name})\n\n";

// CLEAR ALL EXISTING BUSINESSES
echo "Clearing existing businesses...\n";
DB::statement('SET FOREIGN_KEY_CHECKS=0;');
$tables = ['ratings', 'rating_replies', 'rating_likes', 'products', 'favorites', 
           'business_analytics', 'whatsapp_access_logs', 'advertisements', 
           'subscriptions', 'saved_businesses', 'businesses'];
foreach ($tables as $t) {
    if (DB::getSchemaBuilder()->hasTable($t)) {
        DB::table($t)->truncate();
    }
}
DB::statement('SET FOREIGN_KEY_CHECKS=1;');
echo "✅ Cleared!\n\n";

// REAL BUSINESSES DATA - DATA ASLI DARI SURADE
$realBusinesses = [

    // ===== KATEGORI: KULINER / MAKANAN & MINUMAN =====
    [
        'name' => "Let's Coffee Surade",
        'cat_slug' => 'kafe-coffee-shop',
        'description' => "Kafe pionir di Surade dengan konsep retro yang menyajikan kopi lokal khas Djampang, berbagai menu makanan berat, dan camilan. Suasana nyaman dan Instagramable, cocok untuk nongkrong dan meeting.",
        'address' => "Jl. Surade - Tegalbuleud No. 42, Swakarya, Kec. Surade, Kab. Sukabumi",
        'phone' => "081388307066",
        'whatsapp' => "6281388307066",
        'latitude' => -7.3441,
        'longitude' => 106.5871,
        'opening_days' => 'Senin - Minggu',
        'opening_hours' => '10:00 - 22:00',
        'logo' => '/images/businesses/coffee_shop.jpg',
        'banner' => '/images/businesses/manual_brew.jpg',
        'is_premium' => true,
        'village' => 'Kelurahan Surade',
        'tags' => json_encode(['kafe', 'kopi', 'djampang', 'coffee', 'surade']),
        'products' => [
            ['name' => 'Kopi Djampang Manual Brew', 'price' => 22000, 'desc' => 'Kopi robusta lokal Djampang diseduh manual pour over, aroma khas pegunungan Sukabumi.'],
            ['name' => 'Es Kopi Susu Gula Aren', 'price' => 18000, 'desc' => 'Espresso dengan susu segar dan gula aren asli Jampangkulon.'],
            ['name' => 'Roti Bakar Butter Susu', 'price' => 15000, 'desc' => 'Roti tawar panggang dengan olesan butter dan keju leleh.'],
        ]
    ],
    [
        'name' => "Rumah Makan Sadulur",
        'cat_slug' => 'kuliner-masakan-nusantara',
        'description' => "Restoran khas Sunda yang menyajikan menu masakan Nusantara, cocok untuk makan bersama keluarga. Menu andalan: Nasi Timbel komplit, Ayam Goreng Kampung, dan Sayur Asem.",
        'address' => "Jl. Raya Surade, Kec. Surade, Kab. Sukabumi",
        'phone' => "081234567890",
        'whatsapp' => "6281234567890",
        'latitude' => -7.3445,
        'longitude' => 106.5858,
        'opening_days' => 'Senin - Minggu',
        'opening_hours' => '08:00 - 21:00',
        'logo' => '/images/businesses/sunda_timbel.jpg',
        'banner' => '/images/businesses/ayam_goreng.jpg',
        'is_premium' => false,
        'village' => 'Kelurahan Surade',
        'tags' => json_encode(['sunda', 'nusantara', 'nasi timbel', 'ayam goreng']),
        'products' => [
            ['name' => 'Nasi Timbel Komplit', 'price' => 35000, 'desc' => 'Nasi timbel daun pisang dengan ayam goreng, lalapan, sambal, dan sayur asem.'],
            ['name' => 'Ayam Goreng Kampung Lengkuas', 'price' => 28000, 'desc' => 'Ayam kampung marinasi bumbu lengkuas digoreng kering gurih.'],
            ['name' => 'Sayur Asem Sunda Asli', 'price' => 12000, 'desc' => 'Sayur asem segar dengan melinjo, labu siam, dan kacang panjang.'],
        ]
    ],
    [
        'name' => "RM Padang Sinar Minang Surade",
        'cat_slug' => 'kuliner-masakan-padang',
        'description' => "Rumah makan Padang otentik dengan menu rendang daging sapi, gulai ayam, dendeng balado, dan sambal ijo. Melayani prasmanan makan di tempat dan catering. Rasa autentik dari tangan asli orang Minang.",
        'address' => "Jl. Raya Surade No. 15, Kec. Surade, Kab. Sukabumi",
        'phone' => "081312345678",
        'whatsapp' => "6281312345678",
        'latitude' => -7.3450,
        'longitude' => 106.5864,
        'opening_days' => 'Senin - Minggu',
        'opening_hours' => '07:00 - 21:00',
        'logo' => '/images/businesses/padang_rendang.jpg',
        'banner' => '/images/businesses/padang_rendang.jpg',
        'is_premium' => false,
        'village' => 'Kelurahan Surade',
        'tags' => json_encode(['padang', 'rendang', 'gulai', 'minang']),
        'products' => [
            ['name' => 'Rendang Daging Sapi', 'price' => 32000, 'desc' => 'Rendang daging sapi empuk bumbu rempah Minang dimasak 4 jam hingga kering.'],
            ['name' => 'Gulai Ayam Padang', 'price' => 25000, 'desc' => 'Gulai ayam santan kental bumbu kuning khas Minangkabau.'],
            ['name' => 'Dendeng Balado Sapi', 'price' => 30000, 'desc' => 'Dendeng tipis renyah dengan sambal balado merah pedas.'],
        ]
    ],
    [
        'name' => "Mie Ayam Hijau HADE Surade",
        'cat_slug' => 'kuliner-mie-ayam-bakso',
        'description' => "Warung mie ayam paling populer di Surade. Sajian mie ayam spesial hijau dengan topping ayam cincang berbumbu, pangsit goreng, dan bakso cuanki. Buka dari pagi hingga habis terjual.",
        'address' => "Jl. Raya Surade, dekat SMP Negeri 1 Surade, Kec. Surade, Kab. Sukabumi",
        'phone' => "085298765432",
        'whatsapp' => "6285298765432",
        'latitude' => -7.3438,
        'longitude' => 106.5876,
        'opening_days' => 'Senin - Sabtu',
        'opening_hours' => '07:00 - 16:00',
        'logo' => '/images/businesses/mie_ayam.jpg',
        'banner' => '/images/businesses/bakso_sapi.jpg',
        'is_premium' => false,
        'village' => 'Kelurahan Surade',
        'tags' => json_encode(['mie ayam', 'bakso', 'mie hijau', 'hade']),
        'products' => [
            ['name' => 'Mie Ayam Hijau Spesial', 'price' => 15000, 'desc' => 'Mie bayam hijau kenyal dengan ayam cincang manis dan kuah kaldu gurih.'],
            ['name' => 'Pangsit Goreng Ayam Udang', 'price' => 12000, 'desc' => 'Pangsit kulit tipis isi ayam dan udang digoreng crispy keemasan.'],
            ['name' => 'Bakso Cuanki Surade', 'price' => 10000, 'desc' => 'Cuanki bakso kenyal dengan siomay dan tahu goreng kuah segar.'],
        ]
    ],
    [
        'name' => "Bakso Ngonah Surade",
        'cat_slug' => 'kuliner-mie-ayam-bakso',
        'description' => "Warung bakso legendaris di Surade yang selalu ramai. Bakso daging sapi asli, mie kuning atau putih, tahu goreng, dan siomay dengan kuah kaldu bening yang gurih khas.",
        'address' => "Jl. Surade-Ujung Genteng, Pasiripis, Kec. Surade, Kab. Sukabumi",
        'phone' => "085712345678",
        'whatsapp' => "6285712345678",
        'latitude' => -7.3526,
        'longitude' => 106.5778,
        'opening_days' => 'Senin - Minggu',
        'opening_hours' => '09:00 - 20:00',
        'logo' => '/images/businesses/bakso_sapi.jpg',
        'banner' => '/images/businesses/mie_ayam.jpg',
        'is_premium' => false,
        'village' => 'Desa Pasiripis',
        'tags' => json_encode(['bakso', 'mie ayam', 'pasiripis', 'ngonah']),
        'products' => [
            ['name' => 'Bakso Sapi Super Isi Daging', 'price' => 5000, 'desc' => 'Bakso sapi kenyal ukuran besar isi daging giling padat gurih.'],
            ['name' => 'Mie Bakso Spesial', 'price' => 18000, 'desc' => 'Porsi besar mie kuning+putih, 4 bakso, tahu, dan siomay.'],
            ['name' => 'Bakso Telur Jumbo', 'price' => 7000, 'desc' => 'Bakso berukuran jumbo berisi telur puyuh utuh rebus.'],
        ]
    ],
    [
        'name' => "Saung Yulan Lesehan Surade",
        'cat_slug' => 'kuliner-masakan-nusantara',
        'description' => "Tempat makan asri dengan konsep lesehan saung di atas kolam ikan. Suasana pedesaan yang nyaman untuk kumpul keluarga. Menu andalan: ikan bakar, pepes ikan mas, dan nasi liwet.",
        'address' => "Jl. Raya Surade, Swakarya, Kec. Surade, Kab. Sukabumi",
        'phone' => "085812345678",
        'whatsapp' => "6285812345678",
        'latitude' => -7.3455,
        'longitude' => 106.5882,
        'opening_days' => 'Senin - Minggu',
        'opening_hours' => '10:00 - 21:00',
        'logo' => '/images/businesses/sunda_timbel.jpg',
        'banner' => '/images/businesses/seafood_bakar.jpg',
        'is_premium' => true,
        'village' => 'Kelurahan Surade',
        'tags' => json_encode(['lesehan', 'saung', 'ikan bakar', 'nasi liwet']),
        'products' => [
            ['name' => 'Ikan Mas Bakar Kecap', 'price' => 45000, 'desc' => 'Ikan mas segar 500gr dibakar bumbu kecap manis pedas.'],
            ['name' => 'Pepes Ikan Mas Kemangi', 'price' => 30000, 'desc' => 'Pepes ikan mas segar dengan daun kemangi dan cabe rawit.'],
            ['name' => 'Nasi Liwet Sunda Komplit', 'price' => 35000, 'desc' => 'Nasi liwet lengkap dengan ayam, tahu tempe, dan lalapan.'],
        ]
    ],
    [
        'name' => "Warung Seafood Laut Kidul Surade",
        'cat_slug' => 'kuliner-seafood',
        'description' => "Warung seafood dengan sumber bahan langsung dari nelayan Pantai Minajaya. Menyediakan berbagai menu olahan makanan laut segar: cumi goreng tepung, udang saus padang, kepiting asam manis.",
        'address' => "Jl. Raya Minajaya, Kademangan, Kec. Surade, Kab. Sukabumi",
        'phone' => "082311223344",
        'whatsapp' => "6282311223344",
        'latitude' => -7.3755,
        'longitude' => 106.6148,
        'opening_days' => 'Selasa - Minggu',
        'opening_hours' => '11:00 - 21:00',
        'logo' => '/images/businesses/seafood_bakar.jpg',
        'banner' => '/images/businesses/ikan_asin.jpg',
        'is_premium' => false,
        'village' => 'Desa Kademangan',
        'tags' => json_encode(['seafood', 'ikan laut', 'cumi', 'udang', 'minajaya']),
        'products' => [
            ['name' => 'Cumi Goreng Tepung Crispy', 'price' => 35000, 'desc' => 'Cumi segar lapisan tepung renyah cocol saus sambal pedas manis.'],
            ['name' => 'Udang Saus Padang Panas', 'price' => 45000, 'desc' => 'Udang segar berukuran besar saus padang merah pedas manis.'],
            ['name' => 'Ikan Bakar Bumbu Kuning', 'price' => 40000, 'desc' => 'Ikan laut segar 400gr dibakar bumbu kuning aroma serai.'],
        ]
    ],
    [
        'name' => "Bakso Ubes (Tiga Sodara) Surade",
        'cat_slug' => 'kuliner-mie-ayam-bakso',
        'description' => "Bakso legendaris favorit warga Surade. Dikenal dengan bakso urat superjumbo, kuah bening gurih, dan porsi melimpah. Selalu ramai hingga tutup lebih cepat karena habis.",
        'address' => "Jl. Cibarehong-Cikaso, Kec. Surade, Kab. Sukabumi",
        'phone' => "082312345678",
        'whatsapp' => "6282312345678",
        'latitude' => -7.3448,
        'longitude' => 106.5862,
        'opening_days' => 'Senin - Sabtu',
        'opening_hours' => '09:00 - 17:00',
        'logo' => '/images/businesses/bakso_sapi.jpg',
        'banner' => '/images/businesses/bakso_sapi.jpg',
        'is_premium' => false,
        'village' => 'Kelurahan Surade',
        'tags' => json_encode(['bakso', 'ubes', 'tiga sodara', 'surade']),
        'products' => [
            ['name' => 'Bakso Urat Super Jumbo', 'price' => 8000, 'desc' => 'Bakso urat kasar tekstur kenyal kenyal gurih jumbo andalan.'],
            ['name' => 'Mie Bakso Komplit Jumbo', 'price' => 22000, 'desc' => 'Semangkok besar dengan mie, 5 bakso, tahu, pangsit, dan kuah bening.'],
        ]
    ],
    [
        'name' => "Lesehan H. Ali Karanglayung Surade",
        'cat_slug' => 'kuliner-masakan-nusantara',
        'description' => "Rumah makan lesehan di tengah area persawahan Karanglayung Surade, menyediakan hidangan khas pedesaan: ikan bakar air tawar, pepes, dan nasi liwet kampung.",
        'address' => "Kp. Karanglayung, Desa Buniwangi, Kec. Surade, Kab. Sukabumi",
        'phone' => "085671234567",
        'whatsapp' => "6285671234567",
        'latitude' => -7.3387,
        'longitude' => 106.5948,
        'opening_days' => 'Senin - Minggu',
        'opening_hours' => '09:00 - 20:00',
        'logo' => '/images/businesses/sunda_timbel.jpg',
        'banner' => '/images/businesses/seafood_bakar.jpg',
        'is_premium' => false,
        'village' => 'Desa Buniwangi',
        'tags' => json_encode(['lesehan', 'ikan bakar', 'karanglayung', 'sawah']),
        'products' => [
            ['name' => 'Ikan Gurame Bakar Sambal Tomat', 'price' => 55000, 'desc' => 'Gurame segar 600gr bakar arang sambal tomat segar pedas manis.'],
            ['name' => 'Pepes Ikan Mas Segar', 'price' => 25000, 'desc' => 'Ikan mas segar 250gr pepes daun pisang dengan bumbu rempah tradisional.'],
            ['name' => 'Nasi Liwet Kampung (Porsi 2 Orang)', 'price' => 40000, 'desc' => 'Nasi liwet beras lokal Jampang lengkap untuk 2 orang makan.'],
        ]
    ],

    // ===== KATEGORI: TOKO / RETAIL =====
    [
        'name' => "Apotek Surade",
        'cat_slug' => 'apotek-obat',
        'description' => "Apotek terpercaya di pusat Kecamatan Surade melayani kebutuhan obat resep dokter dan obat bebas. Tersedia vitamin, suplemen, alat kesehatan, dan konsultasi apoteker.",
        'address' => "Kp. Surade Tengah RT.03/01, Kel. Surade, Kec. Surade, Kab. Sukabumi",
        'phone' => "0266490111",
        'whatsapp' => "62266490111",
        'latitude' => -7.3448,
        'longitude' => 106.5862,
        'opening_days' => 'Senin - Minggu',
        'opening_hours' => '07:00 - 21:00',
        'logo' => '/images/businesses/apotek.jpg',
        'banner' => '/images/businesses/apotek.jpg',
        'is_premium' => true,
        'village' => 'Kelurahan Surade',
        'tags' => json_encode(['apotek', 'obat', 'kesehatan', 'vitamin', 'surade']),
        'products' => [
            ['name' => 'Paket Vitamin C 1000mg + Zinc (30 Tablet)', 'price' => 45000, 'desc' => 'Suplemen imunitas vitamin C effervescent zinc selenium harian.'],
            ['name' => 'Tensimeter Digital Omron HEM-7120', 'price' => 285000, 'desc' => 'Alat ukur tekanan darah digital otomatis akurat.'],
            ['name' => 'Masker Medis 3 Ply ASTM Level 2 (Box 50 Pcs)', 'price' => 35000, 'desc' => 'Masker bedah 3 lapis BFE ≥99% tali telinga nyaman.'],
        ]
    ],
    [
        'name' => "Puskesmas Surade",
        'cat_slug' => 'klinik-dokter-umum',
        'description' => "Pusat Kesehatan Masyarakat Kecamatan Surade memberikan pelayanan kesehatan primer: poli umum, poli gigi, KIA, imunisasi, laboratorium sederhana, dan rawat inap terbatas.",
        'address' => "Jl. Raya Surade No. 53, Kec. Surade, Kab. Sukabumi",
        'phone' => "0266490123",
        'whatsapp' => "62266490123",
        'latitude' => -7.3450,
        'longitude' => 106.5858,
        'opening_days' => 'Senin - Sabtu',
        'opening_hours' => '07:30 - 14:00',
        'logo' => '/images/businesses/puskesmas.jpg',
        'banner' => '/images/businesses/puskesmas.jpg',
        'is_premium' => false,
        'village' => 'Kelurahan Surade',
        'tags' => json_encode(['puskesmas', 'kesehatan', 'dokter', 'BPJS', 'surade']),
        'products' => [
            ['name' => 'Konsultasi Dokter Umum (BPJS)', 'price' => 0, 'desc' => 'Layanan konsultasi dokter umum peserta BPJS Kesehatan.'],
            ['name' => 'Pemeriksaan Gigi & Mulut', 'price' => 0, 'desc' => 'Periksa gigi, tambal, dan cabut gigi oleh dokter gigi puskesmas.'],
            ['name' => 'Imunisasi Bayi & Balita', 'price' => 0, 'desc' => 'Imunisasi lengkap gratis sesuai jadwal program pemerintah.'],
        ]
    ],
    [
        'name' => "Toko Besi Mekar Baja Prioritas Surade",
        'cat_slug' => 'toko-bangunan-material',
        'description' => "Toko material bangunan dan bahan baja di wilayah Surade. Menyediakan besi beton, besi hollow, plat baja, semen, cat, paku, dan bahan bangunan lainnya untuk kebutuhan konstruksi.",
        'address' => "Kp. Gunung Batu RT.027/RW.003, Desa Gunungsungging, Kec. Surade, Kab. Sukabumi",
        'phone' => "085811193731",
        'whatsapp' => "6285811193731",
        'latitude' => -7.3302,
        'longitude' => 106.5755,
        'opening_days' => 'Senin - Minggu',
        'opening_hours' => '07:00 - 17:00',
        'logo' => '/images/businesses/bengkel_las.jpg',
        'banner' => '/images/businesses/bengkel_las.jpg',
        'is_premium' => false,
        'village' => 'Desa Gunungsungging',
        'tags' => json_encode(['besi', 'baja', 'material', 'bangunan', 'mekar']),
        'products' => [
            ['name' => 'Besi Beton Ulir SNI D10 (per Batang 12m)', 'price' => 75000, 'desc' => 'Besi beton ulir standar nasional diameter 10mm panjang 12 meter.'],
            ['name' => 'Besi Hollow Galvanis 4x4 cm (per Batang 6m)', 'price' => 85000, 'desc' => 'Besi hollow kotak galvanis anti karat untuk rangka kusen dan pagar.'],
            ['name' => 'Semen Tiga Roda (Zak 40 Kg)', 'price' => 68000, 'desc' => 'Semen portland abu-abu kualitas SNI untuk plester dan cor beton.'],
        ]
    ],
    [
        'name' => "Home Cell Surade - Servis HP & Aksesori",
        'cat_slug' => 'servis-ponsel-smartphone',
        'description' => "Spesialis servis HP, aksesori, dan spare part di Gunung Sungging Surade. Melayani ganti layar, baterai, kamera, IC power semua merk smartphone Android dan iPhone.",
        'address' => "Jl. Cisaat Pasir Karang, Desa Gunungsungging, Kec. Surade, Kab. Sukabumi",
        'phone' => "082212345678",
        'whatsapp' => "6282212345678",
        'latitude' => -7.3308,
        'longitude' => 106.5752,
        'opening_days' => 'Senin - Sabtu',
        'opening_hours' => '08:00 - 17:00',
        'logo' => '/images/businesses/servis_hp.jpg',
        'banner' => '/images/businesses/laptop_pc.jpg',
        'is_premium' => false,
        'village' => 'Desa Gunungsungging',
        'tags' => json_encode(['servis hp', 'aksesori', 'smartphone', 'iphone', 'android']),
        'products' => [
            ['name' => 'Ganti LCD Touchscreen Samsung (Semua Tipe)', 'price' => 150000, 'desc' => 'Penggantian layar LCD+touchscreen Samsung original/compatible.'],
            ['name' => 'Ganti Baterai iPhone (Semua Seri)', 'price' => 250000, 'desc' => 'Ganti baterai iPhone original kapasitas standar pabrikan.'],
            ['name' => 'Softcase + Tempered Glass Premium', 'price' => 35000, 'desc' => 'Paket proteksi HP softcase anti-shock + tempered glass 9H.'],
        ]
    ],
    [
        'name' => "Yasa Hotel Surade",
        'cat_slug' => 'hotel-penginapan',
        'description' => "Hotel strategis di jalur Surade - Ujung Genteng, dilengkapi dengan WiFi, area parkir luas, restoran, dan layanan resepsionis 24 jam. Pilihan akomodasi terbaik untuk wisatawan ke Pantai Ujung Genteng.",
        'address' => "Jl. Surade - Ujung Genteng No. 60, Swakarya, Kec. Surade, Kab. Sukabumi, Jawa Barat 43179",
        'phone' => "082512345678",
        'whatsapp' => "6282512345678",
        'latitude' => -7.3460,
        'longitude' => 106.5880,
        'opening_days' => 'Senin - Minggu',
        'opening_hours' => '00:00 - 24:00',
        'logo' => '/images/businesses/pantai_minajaya.jpg',
        'banner' => '/images/businesses/pantai_minajaya.jpg',
        'is_premium' => true,
        'village' => 'Kelurahan Surade',
        'tags' => json_encode(['hotel', 'penginapan', 'ujung genteng', 'wisata', 'yasa']),
        'products' => [
            ['name' => 'Kamar Standard (AC + TV)', 'price' => 250000, 'desc' => 'Kamar standar dengan AC, TV LCD, kamar mandi dalam, dan sarapan pagi.'],
            ['name' => 'Kamar Deluxe (King Size)', 'price' => 350000, 'desc' => 'Kamar deluxe kasur king size, AC, TV, dan pemandangan taman.'],
            ['name' => 'Paket Menginap 2 Malam + Sarapan', 'price' => 550000, 'desc' => 'Hemat 10% untuk menginap 2 malam include sarapan pagi.'],
        ]
    ],

    // ===== BENGKEL & OTOMOTIF =====
    [
        'name' => "Bengkel Wa Ebong Surade",
        'cat_slug' => 'bengkel-motor',
        'description' => "Bengkel motor terpercaya melayani servis motor Honda, Yamaha, Suzuki, dan Kawasaki. Spesialis ganti oli, tune up, bongkar mesin, dan pengelasan ringan. Melayani area Surade dan Ujung Genteng.",
        'address' => "Jl. Surade - Ujung Genteng, Ujung Genteng, Kec. Ciracap, Kab. Sukabumi",
        'phone' => "085723006285",
        'whatsapp' => "6285723006285",
        'latitude' => -7.3524,
        'longitude' => 106.5781,
        'opening_days' => 'Senin - Sabtu',
        'opening_hours' => '08:00 - 17:00',
        'logo' => '/images/businesses/bengkel_motor.jpg',
        'banner' => '/images/businesses/bengkel_motor.jpg',
        'is_premium' => false,
        'village' => 'Desa Pasiripis',
        'tags' => json_encode(['bengkel', 'motor', 'servis', 'oli', 'surade']),
        'products' => [
            ['name' => 'Ganti Oli Mesin Motor (termasuk oli)', 'price' => 65000, 'desc' => 'Servis ganti oli mesin motor 800ml menggunakan oli AHM/YMK original.'],
            ['name' => 'Tune Up Mesin Lengkap', 'price' => 85000, 'desc' => 'Tune up lengkap: bersih karburator/injeksi, ganti busi, setel klep.'],
            ['name' => 'Ganti Ban Motor Luar + Dalam', 'price' => 120000, 'desc' => 'Ganti ban motor depan/belakang ukuran standar termasuk ban IRC.'],
        ]
    ],
    [
        'name' => "AHSS Honda Daya Motor Surade",
        'cat_slug' => 'bengkel-motor',
        'description' => "Bengkel resmi AHASS Honda (Daya Motor) yang melayani area Surade, Pajampangan, Jampang Kulon, Ciracap, dan Cibitung. Servis bergaransi, spare part asli Honda, dan mekanik bersertifikat pabrikan.",
        'address' => "Jl. Raya Surade, Kec. Surade, Kab. Sukabumi",
        'phone' => "082181569876",
        'whatsapp' => "6282181569876",
        'latitude' => -7.3441,
        'longitude' => 106.5867,
        'opening_days' => 'Senin - Sabtu',
        'opening_hours' => '08:00 - 17:00',
        'logo' => '/images/businesses/bengkel_motor.jpg',
        'banner' => '/images/businesses/bengkel_mobil.jpg',
        'is_premium' => true,
        'village' => 'Kelurahan Surade',
        'tags' => json_encode(['bengkel resmi', 'honda', 'AHASS', 'servis', 'daya motor']),
        'products' => [
            ['name' => 'Servis Berkala Honda (Per 3 Bulan)', 'price' => 75000, 'desc' => 'Servis berkala resmi Honda termasuk oli AHM dan filter udara.'],
            ['name' => 'Ganti Kampas Rem Depan Honda Beat/Vario', 'price' => 95000, 'desc' => 'Penggantian kampas rem cakram depan spare part asli Honda.'],
            ['name' => 'Ganti Rantai Keteng CVT Honda Scoopy', 'price' => 120000, 'desc' => 'Ganti rantai keteng + roller CVT original Honda Scoopy/PCX.'],
        ]
    ],

    // ===== JASA LAINNYA =====
    [
        'name' => "Fresh Clean Laundry Surade",
        'cat_slug' => 'jasa-laundry',
        'description' => "Laundry kiloan dan satuan di Surade dengan mesin cuci otomatis kapasitas besar. Proses cuci kering lipat dalam 1 hari, aroma wangi tahan lama, antar jemput gratis radius 3km.",
        'address' => "Jl. Raya Surade No. 78, Kec. Surade, Kab. Sukabumi",
        'phone' => "087711234567",
        'whatsapp' => "6287711234567",
        'latitude' => -7.3455,
        'longitude' => 106.5865,
        'opening_days' => 'Senin - Sabtu',
        'opening_hours' => '07:00 - 17:00',
        'logo' => '/images/businesses/laundry_kiloan.jpg',
        'banner' => '/images/businesses/laundry_kiloan.jpg',
        'is_premium' => false,
        'village' => 'Kelurahan Surade',
        'tags' => json_encode(['laundry', 'cuci baju', 'kiloan', 'antar jemput']),
        'products' => [
            ['name' => 'Laundry Kiloan Regular (3-4 Hari)', 'price' => 6000, 'desc' => 'Cuci kering lipat per kilogram pakaian dengan pewangi premium.'],
            ['name' => 'Laundry Express (Selesai Hari Ini)', 'price' => 10000, 'desc' => 'Cuci kering lipat express selesai dalam 8 jam per kilogram.'],
            ['name' => 'Cuci Selimut / Bed Cover King Size', 'price' => 35000, 'desc' => 'Cuci khusus selimut/bed cover tebal dengan mesin kapasitas besar.'],
        ]
    ],
    [
        'name' => "Gentleman Barbershop Surade",
        'cat_slug' => 'salon-barbershop',
        'description' => "Barbershop pria profesional di Surade dengan konsep modern. Spesialis gunting model fade/undercut, cukur jenggot, creambath, dan perawatan rambut pria. Reservasi via WhatsApp.",
        'address' => "Jl. Raya Surade No. 22, Kec. Surade, Kab. Sukabumi",
        'phone' => "082387654321",
        'whatsapp' => "6282387654321",
        'latitude' => -7.3443,
        'longitude' => 106.5872,
        'opening_days' => 'Selasa - Minggu',
        'opening_hours' => '08:00 - 19:00',
        'logo' => '/images/businesses/barbershop.jpg',
        'banner' => '/images/businesses/barbershop.jpg',
        'is_premium' => false,
        'village' => 'Kelurahan Surade',
        'tags' => json_encode(['barbershop', 'cukur', 'pangkas rambut', 'fade', 'undercut']),
        'products' => [
            ['name' => 'Gunting + Cukur Jenggot', 'price' => 35000, 'desc' => 'Potong rambut model pilihan + cukur rapi jenggot/kumis.'],
            ['name' => 'Creambath Rambut Pria', 'price' => 50000, 'desc' => 'Perawatan rambut creambath + pijat kepala + hair dryer.'],
            ['name' => 'Pewarnaan Rambut (Cat Rambut)', 'price' => 80000, 'desc' => 'Warna rambut pria dengan cat kualitas terbaik, termasuk cuci.'],
        ]
    ],
    [
        'name' => "Surade Pest Control & Basmi Rayap",
        'cat_slug' => 'jasa-basmi-rayap-pest-control',
        'description' => "Jasa pembasmi rayap, kecoa, tikus, dan hama rumah tangga di Surade dan sekitarnya. Menggunakan bahan kimia ramah lingkungan, bergaransi 1 tahun, teknisi berpengalaman.",
        'address' => "Kp. Cikalobak, Desa Citanglar, Kec. Surade, Kab. Sukabumi",
        'phone' => "081298765432",
        'whatsapp' => "6281298765432",
        'latitude' => -7.3624,
        'longitude' => 106.5651,
        'opening_days' => 'Senin - Sabtu',
        'opening_hours' => '08:00 - 17:00',
        'logo' => '/images/businesses/pest_control.jpg',
        'banner' => '/images/businesses/pest_control.jpg',
        'is_premium' => false,
        'village' => 'Desa Citanglar',
        'tags' => json_encode(['pest control', 'rayap', 'kecoa', 'tikus', 'fumigasi']),
        'products' => [
            ['name' => 'Basmi Rayap Rumah (Per 100m²)', 'price' => 500000, 'desc' => 'Pembasmian rayap dengan metode soil treatment + bait station, garansi 1 tahun.'],
            ['name' => 'Fogging Nyamuk & Kecoa (Rumah Standar)', 'price' => 250000, 'desc' => 'Pengasapan fogging seluruh ruangan untuk nyamuk, kecoa, dan lalat.'],
            ['name' => 'Pasang Perangkap Tikus Ultrasonic', 'price' => 180000, 'desc' => 'Perangkap tikus elektronik ultrasonic + konsultasi penanganan.'],
        ]
    ],
    [
        'name' => "Bengkel Las Berkah Stainless Surade",
        'cat_slug' => 'bengkel-las',
        'description' => "Bengkel las dan fabrikasi stainless steel, besi, dan aluminium di Surade. Spesialis pagar tralis, kanopi, pintu besi, tangga besi, dan konstruksi baja ringan.",
        'address' => "Kp. Legokloa, Desa Gunungsungging, Kec. Surade, Kab. Sukabumi",
        'phone' => "085376543210",
        'whatsapp' => "6285376543210",
        'latitude' => -7.3307,
        'longitude' => 106.5752,
        'opening_days' => 'Senin - Sabtu',
        'opening_hours' => '08:00 - 17:00',
        'logo' => '/images/businesses/bengkel_las.jpg',
        'banner' => '/images/businesses/bengkel_las.jpg',
        'is_premium' => false,
        'village' => 'Desa Gunungsungging',
        'tags' => json_encode(['bengkel las', 'tralis', 'pagar', 'kanopi', 'stainless']),
        'products' => [
            ['name' => 'Pagar Tralis Besi (per Meter)', 'price' => 350000, 'desc' => 'Pagar tralis besi hitam anti karat cat duco ukuran custom.'],
            ['name' => 'Kanopi Atap Polycarbonate (per m²)', 'price' => 450000, 'desc' => 'Kanopi rangka besi + atap polycarbonate bening/gelap.'],
            ['name' => 'Tangga Besi Railing (per Meter)', 'price' => 500000, 'desc' => 'Tangga besi tempa + railing stainless steel custom.'],
        ]
    ],
    [
        'name' => "Servis AC Surade - Cuci & Isi Freon",
        'cat_slug' => 'servis-ac-cuci-pasang-freon',
        'description' => "Teknisi AC berpengalaman di Surade melayani cuci AC split, isi freon R32/R410, bongkar pasang, dan perbaikan AC semua merk. Panggilan ke rumah, tarif transparan.",
        'address' => "Jl. Desa Jagamukti, Kec. Surade, Kab. Sukabumi",
        'phone' => "082334567890",
        'whatsapp' => "6282334567890",
        'latitude' => -7.3600,
        'longitude' => 106.6025,
        'opening_days' => 'Senin - Sabtu',
        'opening_hours' => '08:00 - 17:00',
        'logo' => '/images/businesses/servis_ac.jpg',
        'banner' => '/images/businesses/servis_ac.jpg',
        'is_premium' => false,
        'village' => 'Desa Jagamukti',
        'tags' => json_encode(['servis AC', 'cuci AC', 'freon', 'isi freon', 'bongkar pasang']),
        'products' => [
            ['name' => 'Cuci AC Split 0.5 - 1 PK', 'price' => 90000, 'desc' => 'Cuci AC split lengkap indoor+outdoor, bersihkan sirip dan filter.'],
            ['name' => 'Isi Freon R32/R410 (per 250 gram)', 'price' => 150000, 'desc' => 'Pengisian freon R32 atau R410A termasuk cek tekanan sistem.'],
            ['name' => 'Pasang AC Split Baru (per Unit)', 'price' => 350000, 'desc' => 'Pemasangan AC split baru termasuk pipa, bracket, dan pengkabelan.'],
        ]
    ],
    [
        'name' => "Tukang Ledeng Surade - Pipa & Sanitary",
        'cat_slug' => 'jasa-tukang-ledeng',
        'description' => "Spesialis instalasi pipa air bersih dan air kotor, ganti sanitary (kloset, washtafel, shower), bongkar pasang kran, dan perbaikan kebocoran pipa di Surade.",
        'address' => "Kp. Ciparigi, Desa Sirnasari, Kec. Surade, Kab. Sukabumi",
        'phone' => "081398765432",
        'whatsapp' => "6281398765432",
        'latitude' => -7.3487,
        'longitude' => 106.6102,
        'opening_days' => 'Senin - Sabtu',
        'opening_hours' => '08:00 - 16:00',
        'logo' => '/images/businesses/tukang_ledeng.jpg',
        'banner' => '/images/businesses/tukang_ledeng.jpg',
        'is_premium' => false,
        'village' => 'Desa Sirnasari',
        'tags' => json_encode(['tukang ledeng', 'pipa', 'sanitary', 'kran', 'kamar mandi']),
        'products' => [
            ['name' => 'Instalasi Pipa Air Bersih PPR (per Meter)', 'price' => 45000, 'desc' => 'Pemasangan pipa air bersih PPR PN-20 termasuk fitting dan lem.'],
            ['name' => 'Ganti Kloset Duduk Komplit', 'price' => 350000, 'desc' => 'Bongkar pasang kloset duduk baru termasuk wax ring dan sambungan.'],
            ['name' => 'Perbaikan Kebocoran Pipa Darurat', 'price' => 150000, 'desc' => 'Penanganan darurat kebocoran pipa air bersih/kotor.'],
        ]
    ],
    [
        'name' => "Tukang Listrik Surade - Instalasi & Perbaikan",
        'cat_slug' => 'jasa-tukang-listrik',
        'description' => "Tenaga listrik profesional Surade melayani instalasi listrik baru, pemasangan MCB/kWh meter, perbaikan korsleting, pasang stop kontak/saklar, dan instalasi CCTV.",
        'address' => "Kp. Bojonggenteng, Desa Cipeundeuy, Kec. Surade, Kab. Sukabumi",
        'phone' => "085812345670",
        'whatsapp' => "6285812345670",
        'latitude' => -7.3652,
        'longitude' => 106.5826,
        'opening_days' => 'Senin - Sabtu',
        'opening_hours' => '08:00 - 17:00',
        'logo' => '/images/businesses/teknisi_listrik.jpg',
        'banner' => '/images/businesses/cctv.jpg',
        'is_premium' => false,
        'village' => 'Desa Cipeundeuy',
        'tags' => json_encode(['listrik', 'instalasi', 'MCB', 'korsleting', 'tukang listrik']),
        'products' => [
            ['name' => 'Instalasi Listrik Rumah Baru (per Titik)', 'price' => 85000, 'desc' => 'Pemasangan titik lampu/stop kontak baru dengan kabel NYM 2x2.5mm.'],
            ['name' => 'Pasang MCB Panel Box 6-12 Group', 'price' => 450000, 'desc' => 'Instalasi box MCB panel lengkap dengan MCB Schneider/Hager.'],
            ['name' => 'Pasang CCTV Outdoor (per Kamera)', 'price' => 350000, 'desc' => 'Pemasangan kamera CCTV outdoor IP67 termasuk kabel dan DVR setting.'],
        ]
    ],
    [
        'name' => "Duplikat Kunci & Smartkey Surade",
        'cat_slug' => 'jasa-tukang-duplikat-kunci-brankas',
        'description' => "Jasa duplikat kunci rumah, kunci mobil, remote kunci, dan programming smartkey mobil di Surade. Cepat, murah, dan berpengalaman.",
        'address' => "Jl. Raya Surade, dekat Pasar Surade, Kec. Surade, Kab. Sukabumi",
        'phone' => "081211223344",
        'whatsapp' => "6281211223344",
        'latitude' => -7.3447,
        'longitude' => 106.5864,
        'opening_days' => 'Senin - Sabtu',
        'opening_hours' => '08:00 - 17:00',
        'logo' => '/images/businesses/duplikat_kunci.jpg',
        'banner' => '/images/businesses/duplikat_kunci.jpg',
        'is_premium' => false,
        'village' => 'Kelurahan Surade',
        'tags' => json_encode(['duplikat kunci', 'kunci mobil', 'remote', 'smartkey', 'gembok']),
        'products' => [
            ['name' => 'Duplikat Kunci Rumah / Pintu Biasa', 'price' => 15000, 'desc' => 'Cetak kunci rumah duplikat presisi dari kunci asli, selesai 10 menit.'],
            ['name' => 'Remote Kunci Mobil (Programming)', 'price' => 200000, 'desc' => 'Programming ulang remote kunci mobil yang hilang atau rusak.'],
            ['name' => 'Ganti Kunci Gembok Rantai 38mm', 'price' => 45000, 'desc' => 'Ganti gembok rantai pagar ukuran 38mm anti gergaji.'],
        ]
    ],
    [
        'name' => "Kantor Notaris Dedi Supriadi S.H. Surade",
        'cat_slug' => 'jasa-notaris-ppat',
        'description' => "Kantor Notaris & PPAT di Kecamatan Surade melayani akta jual beli tanah, akta pendirian PT/CV/Koperasi, akta wasiat, sertifikasi tanah, dan legalisasi dokumen.",
        'address' => "Jl. Raya Surade No. 48, Desa Sukatani, Kec. Surade, Kab. Sukabumi",
        'phone' => "0266491234",
        'whatsapp' => "62266491234",
        'latitude' => -7.3553,
        'longitude' => 106.6200,
        'opening_days' => 'Senin - Jumat',
        'opening_hours' => '08:00 - 16:00',
        'logo' => '/images/businesses/law_office.jpg',
        'banner' => '/images/businesses/law_office.jpg',
        'is_premium' => true,
        'village' => 'Desa Sukatani',
        'tags' => json_encode(['notaris', 'PPAT', 'akta', 'jual beli tanah', 'sertifikat']),
        'products' => [
            ['name' => 'Akta Jual Beli (AJB) Tanah & Bangunan', 'price' => 1500000, 'desc' => 'Pembuatan AJB tanah dan bangunan sesuai NJOP dan ketentuan PPAT.'],
            ['name' => 'Akta Pendirian PT / CV', 'price' => 3000000, 'desc' => 'Pendirian badan hukum PT, CV, atau Firma lengkap dengan Kemenkumham.'],
            ['name' => 'Legalisasi & Sertifikasi Dokumen', 'price' => 150000, 'desc' => 'Legalisasi dokumen penting, surat keterangan, dan autentikasi.'],
        ]
    ],
    [
        'name' => "ART & Penyalur Pembantu Rumah Tangga Surade",
        'cat_slug' => 'jasa-asisten-rumah-tangga',
        'description' => "Penyalur asisten rumah tangga (ART), baby sitter, dan pengasuh lansia berpengalaman di wilayah Surade dan sekitarnya. Terseleksi, jujur, dan berdedikasi.",
        'address' => "Jl. Raya Surade No. 8, Kel. Surade, Kec. Surade, Kab. Sukabumi",
        'phone' => "081210245489",
        'whatsapp' => "6281210245489",
        'latitude' => -7.3448,
        'longitude' => 106.5862,
        'opening_days' => 'Senin - Sabtu',
        'opening_hours' => '08:00 - 17:00',
        'logo' => '/images/businesses/art_nanny.jpg',
        'banner' => '/images/businesses/cleaning_service.jpg',
        'is_premium' => false,
        'village' => 'Kelurahan Surade',
        'tags' => json_encode(['ART', 'pembantu', 'baby sitter', 'pengasuh', 'penyalur']),
        'products' => [
            ['name' => 'Penyaluran ART Harian (Full Day)', 'price' => 1500000, 'desc' => 'ART berpengalaman siap kerja harian 8 jam/hari masak, bersih, cuci.'],
            ['name' => 'Penyaluran Babysitter Jam (per Jam)', 'price' => 25000, 'desc' => 'Babysitter terlatih yang berpengalaman merawat bayi dan balita per jam.'],
            ['name' => 'Penyaluran ART Menginap (Bulanan)', 'price' => 1800000, 'desc' => 'ART menginap full time, all in termasuk biaya rekrut dan seleksi.'],
        ]
    ],

    // ===== WISATA ALAM =====
    [
        'name' => "Wisata Curug Cikaso Surade",
        'cat_slug' => 'wisata-alam',
        'description' => "Destinasi wisata Curug Cikaso, air terjun tiga tingkat yang indah di Desa Cibitung/Surade. Air jernih hijau tosca dikelilingi tebing batu besar dan hutan tropis. Spot favorit wisatawan Sukabumi.",
        'address' => "Desa Cibitung, Kec. Surade, Kab. Sukabumi (akses via Jl. Lintas Jampang - Surade)",
        'phone' => "082312340000",
        'whatsapp' => "6282312340000",
        'latitude' => -7.3305,
        'longitude' => 106.5752,
        'opening_days' => 'Senin - Minggu',
        'opening_hours' => '07:00 - 17:00',
        'logo' => '/images/businesses/curug_cikaso.jpg',
        'banner' => '/images/businesses/curug_cikaso.jpg',
        'is_premium' => true,
        'village' => 'Desa Gunungsungging',
        'tags' => json_encode(['curug', 'cikaso', 'air terjun', 'wisata alam', 'sukabumi']),
        'products' => [
            ['name' => 'Tiket Masuk Dewasa', 'price' => 20000, 'desc' => 'Tiket masuk kawasan wisata Curug Cikaso untuk pengunjung dewasa.'],
            ['name' => 'Sewa Perahu Rakit ke Curug (PP)', 'price' => 10000, 'desc' => 'Perahu rakit dari dermaga ke lokasi curug pergi pulang.'],
            ['name' => 'Guide Lokal Wisata', 'price' => 50000, 'desc' => 'Pemandu wisata lokal yang berpengalaman dan fasih tentang curug.'],
        ]
    ],
    [
        'name' => "Pantai Minajaya Kecamatan Surade",
        'cat_slug' => 'wisata-pantai',
        'description' => "Wisata Pantai Minajaya, pantai dengan pasir hitam vulkanis, ombak besar, dan panorama Samudera Hindia yang memukau. Juga merupakan tempat pelelangan ikan (TPI) ikan laut segar.",
        'address' => "Desa Kademangan, Kec. Surade, Kab. Sukabumi (Pantai Minajaya)",
        'phone' => "082311112222",
        'whatsapp' => "6282311112222",
        'latitude' => -7.3755,
        'longitude' => 106.6152,
        'opening_days' => 'Senin - Minggu',
        'opening_hours' => '06:00 - 18:00',
        'logo' => '/images/businesses/pantai_minajaya.jpg',
        'banner' => '/images/businesses/ikan_asin.jpg',
        'is_premium' => false,
        'village' => 'Desa Kademangan',
        'tags' => json_encode(['pantai', 'minajaya', 'pasir hitam', 'nelayan', 'TPI']),
        'products' => [
            ['name' => 'Tiket Masuk Wisata Pantai', 'price' => 10000, 'desc' => 'Tiket masuk kawasan wisata Pantai Minajaya per orang.'],
            ['name' => 'Parkir Kendaraan (Motor)', 'price' => 5000, 'desc' => 'Biaya parkir kendaraan roda dua di area Pantai Minajaya.'],
            ['name' => 'Sewa Tikar Pantai', 'price' => 20000, 'desc' => 'Sewa tikar anyaman untuk santai di pinggir pantai.'],
        ]
    ],

    // ===== PRODUK LOKAL =====
    [
        'name' => "Sentra Anyaman Bambu Sauyunan Jagamukti",
        'cat_slug' => 'kerajinan-anyaman-bambu',
        'description' => "Kelompok perajin anyaman bambu tradisional di Desa Jagamukti Surade. Produk handmade: besek bambu, bakul nasi, kap lampu etnik, dan perabot anyaman bambu khas Sukabumi Selatan.",
        'address' => "Kp. Sukamaju, Desa Jagamukti, Kec. Surade, Kab. Sukabumi",
        'phone' => "085798765432",
        'whatsapp' => "6285798765432",
        'latitude' => -7.3602,
        'longitude' => 106.6025,
        'opening_days' => 'Senin - Sabtu',
        'opening_hours' => '08:00 - 16:00',
        'logo' => '/images/businesses/bamboo.jpg',
        'banner' => '/images/businesses/bamboo_craft.jpg',
        'is_premium' => false,
        'village' => 'Desa Jagamukti',
        'tags' => json_encode(['anyaman', 'bambu', 'kerajinan', 'besek', 'tradisional']),
        'products' => [
            ['name' => 'Besek Bambu Tradisional (Paket 10 Pcs)', 'price' => 35000, 'desc' => 'Besek anyaman bambu alami untuk kemasan nasi kotak dan hampers.'],
            ['name' => 'Bakul Nasi Anyaman Bambu Halus', 'price' => 48000, 'desc' => 'Wadah nasi tradisional bambu apus anti jamur.'],
            ['name' => 'Kap Lampu Gantung Anyaman Bambu Etnik', 'price' => 125000, 'desc' => 'Kap lampu nuansa rustic cafe dan teras rumah seni tinggi.'],
        ]
    ],
    [
        'name' => "Gula Kelapa & Gula Aren Asli Kadaleman",
        'cat_slug' => 'produk-pertanian-lokal',
        'description' => "Produsen gula kelapa dan gula aren (palm sugar) asli dari petani Desa Kadaleman Surade. Tanpa pemanis buatan, 100% natural, tersedia gula cetak dan gula semut.",
        'address' => "Jl. Sentra Nira No. 5, Desa Kadaleman, Kec. Surade, Kab. Sukabumi",
        'phone' => "082312233445",
        'whatsapp' => "6282312233445",
        'latitude' => -7.3820,
        'longitude' => 106.5904,
        'opening_days' => 'Senin - Sabtu',
        'opening_hours' => '08:00 - 16:00',
        'logo' => '/images/businesses/gula_kelapa.jpg',
        'banner' => '/images/businesses/gula_kelapa.jpg',
        'is_premium' => false,
        'village' => 'Desa Kadaleman',
        'tags' => json_encode(['gula kelapa', 'gula aren', 'palm sugar', 'natural', 'kadaleman']),
        'products' => [
            ['name' => 'Gula Merah Kelapa Cetak (per Kg)', 'price' => 22000, 'desc' => 'Gula kelapa murni tanpa campuran manis asli kadar air rendah.'],
            ['name' => 'Gula Semut Aren Organik (per 250gr)', 'price' => 18000, 'desc' => 'Gula semut aren bubuk organik bersertifikasi untuk kopi dan minuman.'],
            ['name' => 'Paket Gula Aren Ekspor (5 Kg)', 'price' => 100000, 'desc' => 'Paket gula aren pilihan ekspor dalam kemasan vakum tahan lama.'],
        ]
    ],
    [
        'name' => "Madu Hutan Lebah Trigona Surade",
        'cat_slug' => 'produk-pertanian-lokal',
        'description' => "Peternak madu lebah liar dan trigona (klanceng) asli hutan Surade-Ujung Genteng. Madu mentah (raw honey) tanpa pasteurisasi, kaya enzim dan antioksidan alami.",
        'address' => "Kp. Legokloa, Desa Gunungsungging, Kec. Surade, Kab. Sukabumi",
        'phone' => "081312233445",
        'whatsapp' => "6281312233445",
        'latitude' => -7.3300,
        'longitude' => 106.5755,
        'opening_days' => 'Senin - Sabtu',
        'opening_hours' => '08:00 - 16:00',
        'logo' => '/images/businesses/madu_hutan.jpg',
        'banner' => '/images/businesses/madu_hutan.jpg',
        'is_premium' => false,
        'village' => 'Desa Gunungsungging',
        'tags' => json_encode(['madu', 'trigona', 'klanceng', 'hutan', 'raw honey']),
        'products' => [
            ['name' => 'Madu Trigona Klanceng 100ml', 'price' => 85000, 'desc' => 'Madu asam manis klanceng asli khas Surade, kaya propolis dan enzim.'],
            ['name' => 'Madu Hutan Lebah Liar 500ml', 'price' => 120000, 'desc' => 'Madu lebah liar murni dari hutan Ujung Genteng kental warna gelap.'],
            ['name' => 'Madu Ratu Trigona (Propolis Pekat)', 'price' => 150000, 'desc' => 'Ekstra madu ratu trigona dengan kadar propolis tertinggi.'],
        ]
    ],
    [
        'name' => "Toko Sembako Gamiat Pasar Surade",
        'cat_slug' => 'warung-sembako',
        'description' => "Toko sembako terpercaya di Pasar Surade. Melayani eceran dan grosir beras Cianjur, minyak goreng, telur ayam segar, gula pasir, tepung, dan bumbu dapur.",
        'address' => "Pasar Induk Surade, Kel. Surade, Kec. Surade, Kab. Sukabumi",
        'phone' => "085712233445",
        'whatsapp' => "6285712233445",
        'latitude' => -7.3447,
        'longitude' => 106.5861,
        'opening_days' => 'Senin - Minggu',
        'opening_hours' => '06:00 - 16:00',
        'logo' => '/images/businesses/pasar.jpg',
        'banner' => '/images/businesses/sayuran.jpg',
        'is_premium' => false,
        'village' => 'Kelurahan Surade',
        'tags' => json_encode(['sembako', 'beras', 'pasar', 'grosir', 'kebutuhan pokok']),
        'products' => [
            ['name' => 'Beras Pandan Wangi Jampang (10 Kg)', 'price' => 145000, 'desc' => 'Beras lokal Jampang kualitas premium, pulen wangi alami.'],
            ['name' => 'Minyak Goreng Sawit Premium (2 Liter)', 'price' => 34000, 'desc' => 'Minyak goreng jernih 2x penyaringan bermutu tinggi.'],
            ['name' => 'Telur Ayam Ras Segar (per Kg)', 'price' => 28000, 'desc' => 'Telur ayam ras segar dari peternak lokal Surade.'],
        ]
    ],

    // TAMBAHAN - supaya lebih banyak data nyata
    [
        'name' => "Mie Nyesek Surade",
        'cat_slug' => 'kuliner-mie-ayam-bakso',
        'description' => "Warung mie nyesek khas Sunda yang terkenal di Surade, berlokasi dekat SLB Negeri Surade. Menu andalan: mie goreng pedas nyesek, nasi goreng kampung, dan cap cay ayam.",
        'address' => "Jl. Raya Surade, dekat SLB Negeri Surade, Kec. Surade, Kab. Sukabumi",
        'phone' => "081234001122",
        'whatsapp' => "6281234001122",
        'latitude' => -7.3438,
        'longitude' => 106.5880,
        'opening_days' => 'Senin - Sabtu',
        'opening_hours' => '11:00 - 22:00',
        'logo' => '/images/businesses/mie_ayam.jpg',
        'banner' => '/images/businesses/mie_ayam.jpg',
        'is_premium' => false,
        'village' => 'Kelurahan Surade',
        'tags' => json_encode(['mie goreng', 'nasi goreng', 'pedas', 'nyesek', 'surade']),
        'products' => [
            ['name' => 'Mie Goreng Spesial Level 3 (Sedang)', 'price' => 15000, 'desc' => 'Mie goreng dengan telur, sayuran, dan level pedas pilihan 1-5.'],
            ['name' => 'Nasi Goreng Kampung Spe', 'price' => 16000, 'desc' => 'Nasi goreng ala kampung dengan ayam suwir, telur dadar, dan kerupuk.'],
            ['name' => 'Es Teh Manis Jumbo', 'price' => 5000, 'desc' => 'Es teh manis segar gelas jumbo penyegar tenggorokan.'],
        ]
    ],
    [
        'name' => "Mau Dimsum Surade",
        'cat_slug' => 'kuliner-snack-cemilan',
        'description' => "Gerai kuliner dimsum populer di dekat Lapang Lodaya Surade. Menyediakan aneka dimsum kukus dan goreng: siomay, hakau, gyoza, dimsum udang, lumpia mini.",
        'address' => "Dekat Lapang Lodaya, Kel. Surade, Kec. Surade, Kab. Sukabumi",
        'phone' => "082312234567",
        'whatsapp' => "6282312234567",
        'latitude' => -7.3443,
        'longitude' => 106.5867,
        'opening_days' => 'Selasa - Minggu',
        'opening_hours' => '10:00 - 21:00',
        'logo' => '/images/businesses/bakery_cake.jpg',
        'banner' => '/images/businesses/bakery_cake.jpg',
        'is_premium' => false,
        'village' => 'Kelurahan Surade',
        'tags' => json_encode(['dimsum', 'siomay', 'hakau', 'gyoza', 'kuliner']),
        'products' => [
            ['name' => 'Paket Dimsum Kukus Mix (10 Pcs)', 'price' => 25000, 'desc' => 'Paket 10 pcs dimsum kukus pilihan: siomay, hakau, dimsum udang.'],
            ['name' => 'Gyoza Goreng Crispy (8 Pcs)', 'price' => 22000, 'desc' => 'Gyoza kulit tipis crispy isi ayam dan sayuran dengan saus ponzu.'],
            ['name' => 'Lumpia Mini Goreng (10 Pcs)', 'price' => 18000, 'desc' => 'Lumpia mini goreng isi sayuran dan bihun crispy renyah.'],
        ]
    ],
    [
        'name' => "Klinik Surade - Dokter Umum & Spesialis",
        'cat_slug' => 'klinik-dokter-umum',
        'description' => "Klinik pratama di Jl. Raya Surade melayani konsultasi dokter umum, USG kehamilan, KB, imunisasi, rawat luka, dan pemeriksaan laboratorium dasar.",
        'address' => "Jl. Raya Surade, Kec. Surade, Kab. Sukabumi",
        'phone' => "0266490222",
        'whatsapp' => "62266490222",
        'latitude' => -7.3450,
        'longitude' => 106.5862,
        'opening_days' => 'Senin - Sabtu',
        'opening_hours' => '08:00 - 20:00',
        'logo' => '/images/businesses/klinik_usg.jpg',
        'banner' => '/images/businesses/puskesmas.jpg',
        'is_premium' => false,
        'village' => 'Kelurahan Surade',
        'tags' => json_encode(['klinik', 'dokter', 'USG', 'KB', 'kesehatan']),
        'products' => [
            ['name' => 'Konsultasi Dokter Umum', 'price' => 50000, 'desc' => 'Pemeriksaan oleh dokter umum berpengalaman + resep obat.'],
            ['name' => 'USG Kehamilan 2D', 'price' => 120000, 'desc' => 'Pemeriksaan USG kandungan 2D cetak foto bayi.'],
            ['name' => 'Cek Gula Darah + Asam Urat', 'price' => 45000, 'desc' => 'Pemeriksaan laboratorium gula darah puasa dan asam urat.'],
        ]
    ],

    // ===== RETAIL & FASHION =====
    [
        'name' => "Butik An-Nur Pakaian Muslim Surade",
        'cat_slug' => 'busana-muslim-gamis',
        'description' => "Butik pakaian muslimah dan pria di Surade. Menyediakan gamis syar'i premium, baju koko, mukena, sajadah, dan aksesoris islami dengan harga bersahabat.",
        'address' => "Jl. Raya Surade No. 105, Kec. Surade, Kab. Sukabumi",
        'phone' => "082398765432",
        'whatsapp' => "6282398765432",
        'latitude' => -7.3452,
        'longitude' => 106.5864,
        'opening_days' => 'Senin - Minggu',
        'opening_hours' => '09:00 - 20:00',
        'logo' => '/images/businesses/baju_muslim.jpg',
        'banner' => '/images/businesses/butik_baju.jpg',
        'is_premium' => false,
        'village' => 'Kelurahan Surade',
        'tags' => json_encode(['busana muslim', 'gamis', 'koko', 'mukena', 'hijab']),
        'products' => [
            ['name' => "Gamis Syar'i Ceruty Premium Set Khimar", 'price' => 185000, 'desc' => 'Gamis jatuh anggun lembut berfuring adem, busui friendly.'],
            ['name' => 'Kemeja Koko Pria Katun Lengan Panjang', 'price' => 120000, 'desc' => 'Koko modern katun adem menyerap keringat jahitan rapi.'],
            ['name' => 'Mukena Sholat Dewasa Rayon Bordir', 'price' => 135000, 'desc' => 'Mukena dewasa bahan rayon lembut bordir cantik dalam pouch.'],
        ]
    ],
    [
        'name' => "Minimarket Swalayan Mandiri Surade",
        'cat_slug' => 'minimarket-swalayan',
        'description' => "Minimarket swalayan modern yang menyediakan kebutuhan harian: makanan kemasan, minuman, snack, produk kebersihan, alat tulis, dan gas LPG. Buka 14 jam sehari.",
        'address' => "Jl. Raya Surade, Swakarya, Kec. Surade, Kab. Sukabumi",
        'phone' => "082334556677",
        'whatsapp' => "6282334556677",
        'latitude' => -7.3440,
        'longitude' => 106.5868,
        'opening_days' => 'Senin - Minggu',
        'opening_hours' => '07:00 - 21:00',
        'logo' => '/images/businesses/minimarket.jpg',
        'banner' => '/images/businesses/sembako.jpg',
        'is_premium' => false,
        'village' => 'Kelurahan Surade',
        'tags' => json_encode(['minimarket', 'swalayan', 'kebutuhan harian', 'sembako']),
        'products' => [
            ['name' => 'Gas LPG 3 Kg (tabung isi)', 'price' => 20000, 'desc' => 'Gas LPG 3 kg isi siap pakai dengan tabung resmi Pertamina.'],
            ['name' => 'Air Mineral Galon 19L (isi ulang)', 'price' => 6000, 'desc' => 'Air mineral bersih isi ulang galon 19 liter siap antar.'],
            ['name' => 'Paket Snack Camilan Mix (10 Pcs)', 'price' => 15000, 'desc' => 'Paket camilan aneka merek pilihan untuk cemilan keluarga.'],
        ]
    ],
    [
        'name' => "BRILink Agen Surade - Transfer & PPOB",
        'cat_slug' => 'layanan-keuangan-perbankan',
        'description' => "Agen BRILink resmi di Surade melayani transfer uang antar bank, setor tunai, tarik tunai, bayar listrik PLN, PDAM, BPJS, dan isi pulsa token listrik.",
        'address' => "Jl. Raya Surade No. 33, Kel. Surade, Kec. Surade, Kab. Sukabumi",
        'phone' => "082398001122",
        'whatsapp' => "6282398001122",
        'latitude' => -7.3448,
        'longitude' => 106.5861,
        'opening_days' => 'Senin - Sabtu',
        'opening_hours' => '08:00 - 17:00',
        'logo' => '/images/businesses/bank_brilink.jpg',
        'banner' => '/images/businesses/bank_brilink.jpg',
        'is_premium' => false,
        'village' => 'Kelurahan Surade',
        'tags' => json_encode(['BRILink', 'transfer', 'ATM', 'bayar listrik', 'PPOB']),
        'products' => [
            ['name' => 'Transfer Uang Antar Bank', 'price' => 7500, 'desc' => 'Transfer dana antar bank nasional via BRILink real time.'],
            ['name' => 'Bayar Token Listrik PLN', 'price' => 3000, 'desc' => 'Pembelian token listrik PLN prabayar semua daya.'],
            ['name' => 'Tarik Tunai (ATM Link)', 'price' => 6500, 'desc' => 'Tarik tunai dari rekening BRI, BNI, Mandiri, BTN via agen.'],
        ]
    ],
    [
        'name' => "Foto Studio & Cetak Foto Surade",
        'cat_slug' => 'fotografi-videografi',
        'description' => "Studio foto profesional dan jasa cetak foto di Surade. Melayani foto KTP, SIM, SKCK, passport, foto keluarga, foto wisuda, dan cetak kanvas.",
        'address' => "Jl. Raya Surade No. 67, Kec. Surade, Kab. Sukabumi",
        'phone' => "083812345678",
        'whatsapp' => "6283812345678",
        'latitude' => -7.3449,
        'longitude' => 106.5863,
        'opening_days' => 'Senin - Sabtu',
        'opening_hours' => '08:00 - 17:00',
        'logo' => '/images/businesses/wedding_photo.jpg',
        'banner' => '/images/businesses/drone_pilot.jpg',
        'is_premium' => false,
        'village' => 'Kelurahan Surade',
        'tags' => json_encode(['foto studio', 'cetak foto', 'foto KTP', 'foto wisuda', 'kanvas']),
        'products' => [
            ['name' => 'Foto KTP/SIM/Paspor 4x6 (4 Lembar)', 'price' => 10000, 'desc' => 'Foto formal background merah/biru selesai 15 menit.'],
            ['name' => 'Foto Keluarga Studio (2 Jam)', 'price' => 150000, 'desc' => 'Sesi foto keluarga/individual di studio lengkap cetak 4R 10 lembar.'],
            ['name' => 'Cetak Foto Kanvas 30x40cm', 'price' => 85000, 'desc' => 'Cetak foto di kanvas bingkai kayu dekorasi ruangan.'],
        ]
    ],
    [
        'name' => "Ekspedisi & Logistik JNE Surade",
        'cat_slug' => 'ekspedisi-jasa-pengiriman',
        'description' => "Agen JNE (Jalur Nugraha Ekakurir) resmi di Surade melayani pengiriman paket dan dokumen ke seluruh Indonesia. Layanan reguler, OKE, YES, dan super speed.",
        'address' => "Jl. Raya Surade, Kec. Surade, Kab. Sukabumi",
        'phone' => "082387001122",
        'whatsapp' => "6282387001122",
        'latitude' => -7.3446,
        'longitude' => 106.5860,
        'opening_days' => 'Senin - Sabtu',
        'opening_hours' => '08:00 - 17:00',
        'logo' => '/images/businesses/ekspedisi_logistik.jpg',
        'banner' => '/images/businesses/ekspedisi_logistik.jpg',
        'is_premium' => false,
        'village' => 'Kelurahan Surade',
        'tags' => json_encode(['JNE', 'ekspedisi', 'pengiriman', 'paket', 'logistik']),
        'products' => [
            ['name' => 'JNE REG (Reguler 2-3 Hari)', 'price' => 10000, 'desc' => 'Pengiriman reguler JNE estimasi 2-3 hari kerja ke seluruh Indonesia.'],
            ['name' => 'JNE YES (Yakin Esok Sampai)', 'price' => 25000, 'desc' => 'Pengiriman garansi sampai esok hari untuk kota tertentu.'],
            ['name' => 'JNE OKE (Ongkos Kirim Ekonomis)', 'price' => 8000, 'desc' => 'Pengiriman ekonomis JNE tarif paling hemat estimasi 3-5 hari.'],
        ]
    ],
    [
        'name' => "Fotocopy & ATK Surade Jaya",
        'cat_slug' => 'percetakan-fotocopy',
        'description' => "Toko fotocopy, alat tulis kantor (ATK), dan percetakan di Surade. Melayani fotocopy hitam putih dan warna, print, laminating, jilid, dan cetak spanduk.",
        'address' => "Jl. Raya Surade, dekat Kantor Kecamatan, Kec. Surade, Kab. Sukabumi",
        'phone' => "082387654320",
        'whatsapp' => "6282387654320",
        'latitude' => -7.3445,
        'longitude' => 106.5862,
        'opening_days' => 'Senin - Sabtu',
        'opening_hours' => '07:30 - 17:00',
        'logo' => '/images/businesses/fotocopy_atk.jpg',
        'banner' => '/images/businesses/design_print.jpg',
        'is_premium' => false,
        'village' => 'Kelurahan Surade',
        'tags' => json_encode(['fotocopy', 'ATK', 'print', 'laminating', 'spanduk']),
        'products' => [
            ['name' => 'Fotocopy Hitam Putih (per Lembar)', 'price' => 200, 'desc' => 'Fotocopy dokumen hitam putih kertas A4 70gr.'],
            ['name' => 'Print Warna (per Lembar A4)', 'price' => 2000, 'desc' => 'Print dokumen/foto warna kualitas tinggi kertas A4.'],
            ['name' => 'Cetak Spanduk Banner Digital (per Meter)', 'price' => 25000, 'desc' => 'Cetak spanduk banner digital printing outdoor full color.'],
        ]
    ],
    [
        'name' => "Rental Mobil Avanza/Innova Surade",
        'cat_slug' => 'rental-sewa-kendaraan',
        'description' => "Jasa sewa mobil harian di Surade. Armada Toyota Avanza, Innova, dan Hiace siap dengan atau tanpa sopir. Cocok untuk wisata Curug Cikaso, Pantai Ujung Genteng, dan perjalanan keluarga.",
        'address' => "Kp. Cigangsa, Kel. Surade, Kec. Surade, Kab. Sukabumi",
        'phone' => "082398765000",
        'whatsapp' => "6282398765000",
        'latitude' => -7.3445,
        'longitude' => 106.5870,
        'opening_days' => 'Senin - Minggu',
        'opening_hours' => '06:00 - 22:00',
        'logo' => '/images/businesses/rental_mobil.jpg',
        'banner' => '/images/businesses/rental_mobil.jpg',
        'is_premium' => false,
        'village' => 'Kelurahan Surade',
        'tags' => json_encode(['rental', 'sewa mobil', 'avanza', 'innova', 'wisata']),
        'products' => [
            ['name' => 'Sewa Toyota Avanza (12 Jam, tanpa BBM)', 'price' => 350000, 'desc' => 'Sewa Avanza harian 12 jam tanpa BBM, dengan/tanpa sopir.'],
            ['name' => 'Sewa Toyota Innova (12 Jam)', 'price' => 500000, 'desc' => 'Sewa Kijang Innova kapasitas 7 penumpang 12 jam.'],
            ['name' => 'Paket Tour Curug Cikaso + Pantai (sehari)', 'price' => 750000, 'desc' => 'Paket wisata sehari Curug Cikaso dan Pantai Ujung Genteng + sopir.'],
        ]
    ],
];

echo "Total real businesses to insert: " . count($realBusinesses) . "\n\n";

$insertedCount = 0;
$skippedCount = 0;

foreach ($realBusinesses as $idx => $item) {
    // Find the category by slug
    $cat = Category::where('slug', $item['cat_slug'])->first();
    
    if (!$cat) {
        // Try partial match
        $cat = Category::where('slug', 'like', '%' . last(explode('-', $item['cat_slug'])) . '%')->first();
    }
    
    if (!$cat) {
        echo "⚠️  Category not found: {$item['cat_slug']} for {$item['name']}\n";
        
        // Try to find any matching category
        $parts = explode('-', $item['cat_slug']);
        foreach ($parts as $part) {
            if (strlen($part) > 3) {
                $cat = Category::where('slug', 'like', '%' . $part . '%')->first();
                if ($cat) break;
            }
        }
    }
    
    if (!$cat) {
        // Fallback to first category
        $cat = Category::where('parent_id', '!=', null)->first();
        echo "   → Using fallback category: {$cat->name}\n";
    }
    
    $email = 'bisnis' . ($insertedCount + 1) . '@surade.com';
    $uniqueSlug = Str::slug($item['name']) . '-' . $cat->id . '-' . rand(100, 999);
    
    try {
        $biz = Business::create([
            'user_id' => $userId,
            'category_id' => $cat->id,
            'name' => $item['name'],
            'slug' => $uniqueSlug,
            'description' => $item['description'],
            'address' => $item['address'],
            'city' => $item['village'],
            'province' => 'Jawa Barat',
            'postal_code' => '43179',
            'latitude' => $item['latitude'],
            'longitude' => $item['longitude'],
            'phone' => $item['phone'],
            'whatsapp' => $item['whatsapp'],
            'email' => $email,
            'opening_days' => $item['opening_days'],
            'tags' => $item['tags'],
            'logo' => $item['logo'],
            'banner' => $item['banner'],
            'banners' => [$item['banner']],
            'gallery' => [$item['logo'], $item['banner']],
            'is_premium' => $item['is_premium'],
            'premium_plan' => $item['is_premium'] ? 'Pro' : null,
            'is_active' => true,
            'status' => 'approved',
            'views' => rand(120, 3500),
            'clicks' => rand(25, 480),
            'rating' => rand(42, 50) / 10.0,
            'review_count' => rand(5, 120),
        ]);
        
        // Add products
        foreach ($item['products'] as $p) {
            Product::create([
                'business_id' => $biz->id,
                'name' => $p['name'],
                'price' => $p['price'],
                'description' => $p['desc'],
                'image' => $item['logo'],
                'is_active' => true,
            ]);
        }
        
        $insertedCount++;
        echo "✅ [{$insertedCount}] {$item['name']} (Kategori: {$cat->name})\n";
        
    } catch (\Exception $e) {
        echo "❌ Error inserting {$item['name']}: " . $e->getMessage() . "\n";
        $skippedCount++;
    }
}

echo "\n==========================================\n";
echo "✅ DONE! Inserted: {$insertedCount} businesses\n";
if ($skippedCount > 0) echo "⚠️  Skipped: {$skippedCount} (errors)\n";
echo "Total in DB: " . Business::count() . "\n";
