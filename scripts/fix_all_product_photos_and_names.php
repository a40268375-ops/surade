<?php
require __DIR__ . '/../backend/vendor/autoload.php';
$app = require_once __DIR__ . '/../backend/bootstrap/app.php';
$app->make(Illuminate\Contracts\Console\Kernel::class)->bootstrap();

use Illuminate\Support\Facades\DB;

// Curated high quality authentic product image pools per category
$categoryPhotos = [
    // Kuliner / Makanan / Minuman
    'food' => [
        "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=800&auto=format&fit=crop&q=80",
        "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=800&auto=format&fit=crop&q=80",
        "https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=800&auto=format&fit=crop&q=80",
        "https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=800&auto=format&fit=crop&q=80",
        "https://images.unsplash.com/photo-1509722747041-616f39b57569?w=800&auto=format&fit=crop&q=80",
        "https://images.unsplash.com/photo-1540420773420-3366772f4999?w=800&auto=format&fit=crop&q=80",
        "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=800&auto=format&fit=crop&q=80",
        "https://images.unsplash.com/photo-1513104890138-7c749659a591?w=800&auto=format&fit=crop&q=80",
        "https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?w=800&auto=format&fit=crop&q=80",
        "https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=800&auto=format&fit=crop&q=80",
        "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=800&auto=format&fit=crop&q=80",
        "https://images.unsplash.com/photo-1551024709-8f23befc6f87?w=800&auto=format&fit=crop&q=80",
    ],
    // Automotive / Bengkel
    'auto' => [
        "https://images.unsplash.com/photo-1486006920555-c77dce18193b?w=800&auto=format&fit=crop&q=80",
        "https://images.unsplash.com/photo-1617814076367-b759c7d7e738?w=800&auto=format&fit=crop&q=80",
        "https://images.unsplash.com/photo-1552519507-da3b142c6e3d?w=800&auto=format&fit=crop&q=80",
        "https://images.unsplash.com/photo-1580273916550-e323be2ae537?w=800&auto=format&fit=crop&q=80",
        "https://images.unsplash.com/photo-1530046339160-ce3e530c7d2f?w=800&auto=format&fit=crop&q=80",
        "https://images.unsplash.com/photo-1492144534655-ae79c964c9d7?w=800&auto=format&fit=crop&q=80",
    ],
    // Health / Kesehatan / Apotek / Puskesmas
    'health' => [
        "https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=800&auto=format&fit=crop&q=80",
        "https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?w=800&auto=format&fit=crop&q=80",
        "https://images.unsplash.com/photo-1583324113626-70df0f4deaab?w=800&auto=format&fit=crop&q=80",
        "https://images.unsplash.com/photo-1505751172876-fa1923c5c528?w=800&auto=format&fit=crop&q=80",
        "https://images.unsplash.com/photo-1526256262350-7da7584cf5eb?w=800&auto=format&fit=crop&q=80",
    ],
    // Hotel / Penginapan / Homestay
    'hotel' => [
        "https://images.unsplash.com/photo-1611892440504-42a792e24d32?w=800&auto=format&fit=crop&q=80",
        "https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800&auto=format&fit=crop&q=80",
        "https://images.unsplash.com/photo-1590490360182-c33d57733427?w=800&auto=format&fit=crop&q=80",
        "https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=800&auto=format&fit=crop&q=80",
        "https://images.unsplash.com/photo-1540555700478-4be289fbecef?w=800&auto=format&fit=crop&q=80",
    ],
    // Finance / Banking / Pos / Pegadaian
    'finance' => [
        "https://images.unsplash.com/photo-1559526324-4b87b5e36e44?w=800&auto=format&fit=crop&q=80",
        "https://images.unsplash.com/photo-1601597111158-2fceff292cdc?w=800&auto=format&fit=crop&q=80",
        "https://images.unsplash.com/photo-1563986768609-322da13575f3?w=800&auto=format&fit=crop&q=80",
        "https://images.unsplash.com/photo-1526304640581-d334cdbbf45e?w=800&auto=format&fit=crop&q=80",
    ],
    // Retail / Sembako / Toko / Minimarket
    'retail' => [
        "https://images.unsplash.com/photo-1578916171728-46686eac8d58?w=800&auto=format&fit=crop&q=80",
        "https://images.unsplash.com/photo-1542838132-92c53300491e?w=800&auto=format&fit=crop&q=80",
        "https://images.unsplash.com/photo-1604719312566-8912e9227c6a?w=800&auto=format&fit=crop&q=80",
        "https://images.unsplash.com/photo-1534723452862-4c874018d66d?w=800&auto=format&fit=crop&q=80",
    ],
    // Fashion / Pakaian / Distro
    'fashion' => [
        "https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=800&auto=format&fit=crop&q=80",
        "https://images.unsplash.com/photo-1523381210434-271e8be1f52b?w=800&auto=format&fit=crop&q=80",
        "https://images.unsplash.com/photo-1489987707025-afc232f7ea0f?w=800&auto=format&fit=crop&q=80",
    ],
    // Tourism / Wisata / Curug / Pantai
    'tourism' => [
        "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=800&auto=format&fit=crop&q=80",
        "https://images.unsplash.com/photo-1432405972618-c60b0225b8f9?w=800&auto=format&fit=crop&q=80",
        "https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=800&auto=format&fit=crop&q=80",
        "https://images.unsplash.com/photo-1506744038136-46273834b3fb?w=800&auto=format&fit=crop&q=80",
    ],
    // Electronics / HP / Pulsa / Servis Laptop
    'tech' => [
        "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=800&auto=format&fit=crop&q=80",
        "https://images.unsplash.com/photo-1597872200969-2b65d56bd16b?w=800&auto=format&fit=crop&q=80",
        "https://images.unsplash.com/photo-1588872657578-7efd1f1555ed?w=800&auto=format&fit=crop&q=80",
    ],
    // General / Services / Pertanian / Lainnya
    'general' => [
        "https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?w=800&auto=format&fit=crop&q=80",
        "https://images.unsplash.com/photo-1521791136064-7986c2920216?w=800&auto=format&fit=crop&q=80",
        "https://images.unsplash.com/photo-1581092160607-ee22621dd758?w=800&auto=format&fit=crop&q=80",
    ],
];

// Product name generators based on business category/name
function getCustomProductsForBusiness($bizName, $catId) {
    $bizLower = strtolower($bizName);

    if (str_contains($bizLower, 'bank') || str_contains($bizLower, 'pos') || str_contains($bizLower, 'pegadaian')) {
        return [
            ['name' => 'Layanan Setor & Tarik Tunai Rekening', 'price' => 0, 'cat' => 'finance'],
            ['name' => 'Pengajuan Pinjaman Modal Usaha UMKM', 'price' => 0, 'cat' => 'finance'],
            ['name' => 'Pembayaran Tagihan Listrik & BPJS', 'price' => 2500, 'cat' => 'finance'],
        ];
    }
    if (str_contains($bizLower, 'puskesmas') || str_contains($bizLower, 'apotek') || str_contains($bizLower, 'klinik') || str_contains($bizLower, 'dokter')) {
        return [
            ['name' => 'Pemeriksaan Kesehatan & Konsultasi Dokter Umum', 'price' => 35000, 'cat' => 'health'],
            ['name' => 'Paket Cek Darah Lengkap (Gula, Asam Urat, Kolesterol)', 'price' => 75000, 'cat' => 'health'],
            ['name' => 'Tebus Obat & Vitamin Daya Tahan Tubuh', 'price' => 25000, 'cat' => 'health'],
        ];
    }
    if (str_contains($bizLower, 'bengkel') || str_contains($bizLower, 'ahass') || str_contains($bizLower, 'motor') || str_contains($bizLower, 'ban')) {
        return [
            ['name' => 'Paket Servis Tune Up Lengkap Motor', 'price' => 65000, 'cat' => 'auto'],
            ['name' => 'Ganti Oli Mesin + Jasa Pasang Free Checkup', 'price' => 55000, 'cat' => 'auto'],
            ['name' => 'Jasa Tambal Ban & Press Velg Cepat', 'price' => 15000, 'cat' => 'auto'],
        ];
    }
    if (str_contains($bizLower, 'bakso') || str_contains($bizLower, 'mie') || str_contains($bizLower, 'warung') || str_contains($bizLower, 'rumah makan') || str_contains($bizLower, 'cafe') || str_contains($bizLower, 'nasi') || str_contains($bizLower, 'seafood') || str_contains($bizLower, 'sate') || str_contains($bizLower, 'resto')) {
        return [
            ['name' => 'Menu Spesial Favorit Pelanggan', 'price' => 25000, 'cat' => 'food'],
            ['name' => 'Paket Hemat Makan Minum Segar', 'price' => 18000, 'cat' => 'food'],
            ['name' => 'Minuman Es Segar Khas Surade', 'price' => 8000, 'cat' => 'food'],
        ];
    }
    if (str_contains($bizLower, 'hotel') || str_contains($bizLower, 'penginapan') || str_contains($bizLower, 'villa') || str_contains($bizLower, 'resort') || str_contains($bizLower, 'homestay')) {
        return [
            ['name' => 'Kamar Standard AC + Free Breakfast', 'price' => 250000, 'cat' => 'hotel'],
            ['name' => 'Kamar VIP Deluxe Kasur Springbed', 'price' => 400000, 'cat' => 'hotel'],
            ['name' => 'Sewa Ruang Pertemuan / Event Paket', 'price' => 750000, 'cat' => 'hotel'],
        ];
    }
    if (str_contains($bizLower, 'curug') || str_contains($bizLower, 'pantai') || str_contains($bizLower, 'wisata') || str_contains($bizLower, 'puncak') || str_contains($bizLower, 'muara')) {
        return [
            ['name' => 'Tiket Masuk Wahana & Area Wisata', 'price' => 15000, 'cat' => 'tourism'],
            ['name' => 'Sewa Perahu / Alat Keselamatan Air', 'price' => 50000, 'cat' => 'tourism'],
            ['name' => 'Jasa Pemandu Lokal (Tour Guide)', 'price' => 100000, 'cat' => 'tourism'],
        ];
    }
    if (str_contains($bizLower, 'toko') || str_contains($bizLower, 'mart') || str_contains($bizLower, 'grosir') || str_contains($bizLower, 'pasar') || str_contains($bizLower, 'warung sembako')) {
        return [
            ['name' => 'Paket Sembako Lengkap Berkualitas', 'price' => 85000, 'cat' => 'retail'],
            ['name' => 'Beras Lokal Super Surade 5kg', 'price' => 68000, 'cat' => 'retail'],
            ['name' => 'Minyak Goreng Pilihan 2 Liter', 'price' => 34000, 'cat' => 'retail'],
        ];
    }
    if (str_contains($bizLower, 'cell') || str_contains($bizLower, 'hp') || str_contains($bizLower, 'counter') || str_contains($bizLower, 'komputer') || str_contains($bizLower, 'laptop')) {
        return [
            ['name' => 'Voucher Paket Data Internet All Operator', 'price' => 35000, 'cat' => 'tech'],
            ['name' => 'Aksesoris Charger & Fast Charging Cable', 'price' => 45000, 'cat' => 'tech'],
            ['name' => 'Jasa Servis HP & Ganti Tempered Glass', 'price' => 25000, 'cat' => 'tech'],
        ];
    }

    // Default fallback templates
    return [
        ['name' => "Layanan Utama Usaha " . $bizName, 'price' => 50000, 'cat' => 'general'],
        ['name' => "Produk Pilihan Paket Hemat", 'price' => 30000, 'cat' => 'general'],
        ['name' => "Paket Spesial Konsultasi / Pemesanan", 'price' => 75000, 'cat' => 'general'],
    ];
}

$products = DB::table('products')->get();
$photoCounters = [];
$updatedCount = 0;

foreach ($products as $idx => $prod) {
    $biz = DB::table('businesses')->where('id', $prod->business_id)->first();
    if (!$biz) continue;

    $customProds = getCustomProductsForBusiness($biz->name, $biz->category_id);
    // Find index of this product in business
    $bizProds = DB::table('products')->where('business_id', $biz->id)->orderBy('id')->pluck('id')->toArray();
    $prodIndex = array_search($prod->id, $bizProds);
    if ($prodIndex === false) $prodIndex = 0;

    $template = $customProds[$prodIndex % count($customProds)];
    $catKey = $template['cat'];
    $photos = $categoryPhotos[$catKey] ?? $categoryPhotos['general'];

    // Pick unique photo using counter
    if (!isset($photoCounters[$catKey])) $photoCounters[$catKey] = 0;
    $photoUrl = $photos[($photoCounters[$catKey] + $prodIndex) % count($photos)];
    $photoCounters[$catKey]++;

    // Build specific clear name
    $newName = $template['name'];
    // Avoid generic numbers if already named specifically
    if ($newName === "Produk / Layanan Unggulan 1" || str_contains($newName, "Unggulan 1") || str_contains($newName, "Pilihan 2")) {
        $newName = "Paket Layanan / Produk Unggulan " . ($prodIndex + 1) . " - " . $biz->name;
    }

    $newPrice = $prod->price && $prod->price > 0 ? $prod->price : ($template['price'] > 0 ? $template['price'] : 25000);

    DB::table('products')->where('id', $prod->id)->update([
        'name' => $newName,
        'image' => $photoUrl,
        'price' => $newPrice,
        'updated_at' => now(),
    ]);

    $updatedCount++;
}

echo "Successfully updated $updatedCount products with authentic names and unique high quality photos!\n";
