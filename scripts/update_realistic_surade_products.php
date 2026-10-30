<?php
require __DIR__ . '/../backend/vendor/autoload.php';
$app = require_once __DIR__ . '/../backend/bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

use App\Models\Business;
use App\Models\Product;

// Curated authentic image pools with realistic product names for different Surade business niches:
$catalogThemes = [
    'kopi' => [
        [
            'name' => 'Kopi Robusta Pajampangan Biji Sangrai (250g)',
            'description' => 'Biji kopi robusta pilihan asli Pajampangan Buniwangi dengan profil roasting medium-dark, aroma cokelat karamel khas tanah selatan Sukabumi.',
            'price' => 35000,
            'image' => 'https://images.unsplash.com/photo-1559056199-641a0ac8b55e?w=800&auto=format&fit=crop&q=80',
        ],
        [
            'name' => 'Kopi Bubuk Robusta Buniwangi Fresh Ground (200g)',
            'description' => 'Bubuk kopi murni giling segar tanpa bahan pengawet/campuran jagung. Cocok untuk seduh tubruk, V60, atau kopi susu aren.',
            'price' => 28000,
            'image' => 'https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?w=800&auto=format&fit=crop&q=80',
        ],
        [
            'name' => 'Cold Brew Coffee Robusta Pajampangan Bottle (250ml)',
            'description' => 'Ekstrak seduh dingin 12 jam, rasa mantap, tingkat keasaman rendah, sangat segar disajikan dingin.',
            'price' => 20000,
            'image' => 'https://images.unsplash.com/photo-1517701550927-30cf4ba1dba5?w=800&auto=format&fit=crop&q=80',
        ],
        [
            'name' => 'Paket Oleh-Oleh Kopi Khas Surade Premium Gift Box',
            'description' => 'Hampers spesial berisi 2 pouch biji sangrai + 1 tumbler kayu eksklusif khas Pajampangan.',
            'price' => 95000,
            'image' => 'https://images.unsplash.com/photo-1511920170033-f8396924c348?w=800&auto=format&fit=crop&q=80',
        ]
    ],
    'kuliner' => [
        [
            'name' => 'Nasi Liwet Komplit Khas Pajampangan',
            'description' => 'Sajian nasi liwet pulen dengan teri medan, sambal terasi goang, lalapan segar surade, dan ayam goreng kampung.',
            'price' => 35000,
            'image' => 'https://images.unsplash.com/photo-1626082927389-6cd097cdc6ec?w=800&auto=format&fit=crop&q=80',
        ],
        [
            'name' => 'Bakso Sapi Urat Super Kuah Kaldu Gurih',
            'description' => 'Daging sapi segar lokal dengan tekstur urat kenyal dan kuah kaldu rempah lezat.',
            'price' => 22000,
            'image' => 'https://images.unsplash.com/photo-1569718212165-3a8278d5f624?w=800&auto=format&fit=crop&q=80',
        ],
        [
            'name' => 'Ayam Bakar Madu Sambal Lalap Surade',
            'description' => 'Potongan ayam empuk bumbu madu bakar rempah disajikan dengan nasi hangat dan sambal khas.',
            'price' => 28000,
            'image' => 'https://images.unsplash.com/photo-1598515214211-89d3c73ae83b?w=800&auto=format&fit=crop&q=80',
        ],
        [
            'name' => 'Es Kelapa Muda Gula Aren Asli Pajampangan',
            'description' => 'Kelapa segar langsung dari pohon dengan sirup gula aren kental asli petani lokal.',
            'price' => 12000,
            'image' => 'https://images.unsplash.com/photo-1556881286-fc6915169721?w=800&auto=format&fit=crop&q=80',
        ]
    ],
    'sedot_wc' => [
        [
            'name' => 'Layanan Sedot WC & Septic Tank Rumah Tangga',
            'description' => 'Jasa kuras septic tank cepat, bersih, tanpa bau dan didukung selang panjang hingga 50 meter ke dalam gang.',
            'price' => 350000,
            'image' => 'https://images.unsplash.com/photo-1581578731548-c64695cc6952?w=800&auto=format&fit=crop&q=80',
        ],
        [
            'name' => 'Pelancaran Saluran Pipa Mampet & Wastafel',
            'description' => 'Layanan atasi saluran air mampet di rumah, ruko, restoran dengan mesin spiral canggih tanpa bongkar pipa.',
            'price' => 200000,
            'image' => 'https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=800&auto=format&fit=crop&q=80',
        ],
        [
            'name' => 'Perawatan & Kuras Saluran Limbah Gedung / Usaha',
            'description' => 'Paket berkala untuk instansi, hotel, sekolah, tempat ibadah dan ruko di seluruh area Surade dan sekitarnya.',
            'price' => 500000,
            'image' => 'https://images.unsplash.com/photo-1621905251189-08b45d6a269e?w=800&auto=format&fit=crop&q=80',
        ]
    ],
    'bengkel' => [
        [
            'name' => 'Paket Servis Rutin & Ganti Oli Mesin Motor',
            'description' => 'Tune up lengkap, pembersihan karbu/injeksi, cek rem, kelistrikan, dan oli mesin berkualitas.',
            'price' => 65000,
            'image' => 'https://images.unsplash.com/photo-1486006920555-c77dce18193b?w=800&auto=format&fit=crop&q=80',
        ],
        [
            'name' => 'Ganti Ban Tubeless Motor Segala Ukuran',
            'description' => 'Tersedia berbagai merk ban resmi standar dan balap dengan pemasangan hidrolik presisi.',
            'price' => 185000,
            'image' => 'https://images.unsplash.com/photo-1578844251758-2f71da64c96f?w=800&auto=format&fit=crop&q=80',
        ],
        [
            'name' => 'Servis CVT & Pembersihan Throttle Body Injeksi',
            'description' => 'Perawatan transmisi matic agar tarikan enteng, getaran hilang, dan konsumsi bensin hemat.',
            'price' => 75000,
            'image' => 'https://images.unsplash.com/photo-1580273916550-e323be2ae537?w=800&auto=format&fit=crop&q=80',
        ]
    ],
    'pertanian' => [
        [
            'name' => 'Gula Kelapa Asli Cetak Pajampangan (1 Kg)',
            'description' => 'Gula merah kelapa murni tanpa campuran kimia hasil nira segar pohon kelapa pesisir Surade.',
            'price' => 24000,
            'image' => 'https://images.unsplash.com/photo-1607623814075-e51df1bdc82f?w=800&auto=format&fit=crop&q=80',
        ],
        [
            'name' => 'Beras Organik Pandan Wangi Sukabumi (5 Kg)',
            'description' => 'Beras lokal pulen alami beraroma wangi daun pandan dari sawah irigasi pegunungan.',
            'price' => 72000,
            'image' => 'https://images.unsplash.com/photo-1586201375761-83865001e31c?w=800&auto=format&fit=crop&q=80',
        ],
        [
            'name' => 'Pupuk Kompos Organik Fermentasi (10 Kg)',
            'description' => 'Penyubur tanah alami siap pakai ramah lingkungan untuk tanaman sayuran dan buah.',
            'price' => 25000,
            'image' => 'https://images.unsplash.com/photo-1585320806297-9794b3e4eeae?w=800&auto=format&fit=crop&q=80',
        ]
    ],
    'toko' => [
        [
            'name' => 'Paket Sembako Hemat Keluarga Berkah',
            'description' => 'Beras 2.5kg, Minyak Goreng 1L, Gula Pasir 1kg, Teh Celup & Mie Instan pilihan.',
            'price' => 68000,
            'image' => 'https://images.unsplash.com/photo-1542838132-92c53300491e?w=800&auto=format&fit=crop&q=80',
        ],
        [
            'name' => 'Minyak Goreng Kemasan Pouch (2 Liter)',
            'description' => 'Minyak goreng kelapa sawit jernih berkualitas tinggi untuk memasak renyah higienis.',
            'price' => 36000,
            'image' => 'https://images.unsplash.com/photo-1471193945509-9ad0617afabf?w=800&auto=format&fit=crop&q=80',
        ],
        [
            'name' => 'Telur Ayam Ras Segar Peternakan Lokal (1 Kg)',
            'description' => 'Telur ayam fresh panen setiap hari dengan cangkang tebal dan kualitas terjamin.',
            'price' => 29000,
            'image' => 'https://images.unsplash.com/photo-1516467508483-a7212febe31a?w=800&auto=format&fit=crop&q=80',
        ]
    ],
    'jasa' => [
        [
            'name' => 'Jasa Laundry Kiloan Cuci Komplit Setrika Wangi',
            'description' => 'Pencucian higienis terpisah antar pelanggan dengan detergen wangi premium dan setrika uap rapi.',
            'price' => 7000,
            'image' => 'https://images.unsplash.com/photo-1517677208171-0bc6725a3e60?w=800&auto=format&fit=crop&q=80',
        ],
        [
            'name' => 'Paket Cuci Bedcover & Selimut Tebal',
            'description' => 'Perawatan khusus bahan tebal dan wol agar tetap halus, wangi tahan lama dan bebas tungau.',
            'price' => 25000,
            'image' => 'https://images.unsplash.com/photo-1582735689369-4fe89db7114c?w=800&auto=format&fit=crop&q=80',
        ],
        [
            'name' => 'Layanan Cuci Sepatu & Helm Deep Clean',
            'description' => 'Pembersihan mendalam noda kotoran luar dalam dengan anti-bakteri fresh deodorant.',
            'price' => 30000,
            'image' => 'https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?w=800&auto=format&fit=crop&q=80',
        ]
    ],
    'elektronik' => [
        [
            'name' => 'Servis & Perbaikan HP / Smartphone Ganti LCD',
            'description' => 'Pengerjaan cepat profesional, suku cadang original dengan garansi pengerjaan 30 hari.',
            'price' => 150000,
            'image' => 'https://images.unsplash.com/photo-1591799264318-7e6ef8ddb7ea?w=800&auto=format&fit=crop&q=80',
        ],
        [
            'name' => 'Instalasi & Servis Cuci AC Rumah Dingin Maksimal',
            'description' => 'Pembersihan evaporator, cek tekanan freon, dan perbaikan kebocoran pipa AC.',
            'price' => 75000,
            'image' => 'https://images.unsplash.com/photo-1621905252507-b35492cc74b4?w=800&auto=format&fit=crop&q=80',
        ],
        [
            'name' => 'Aksesoris Fast Charging Adaptor & Kabel Data',
            'description' => 'Charger cepat 33W-67W support semua tipe ponsel Android dan iPhone.',
            'price' => 65000,
            'image' => 'https://images.unsplash.com/photo-1583863788434-e58a36330cf0?w=800&auto=format&fit=crop&q=80',
        ]
    ],
    'hewan_ikan' => [
        [
            'name' => 'Pakan Burung Kicau Voer Super Protein & Vitamin (400g)',
            'description' => 'Pakan bergizi tinggi untuk murai batu, kacer, kenari, dan lovebird agar gacor, bulu mengkilap, dan daya tahan tubuh prima.',
            'price' => 18000,
            'image' => 'https://images.unsplash.com/photo-1552728089-57bdde30beb3?w=800&auto=format&fit=crop&q=80',
        ],
        [
            'name' => 'Pelet Pakan Ikan Hias & Kolam Air Tawar (1 Kg)',
            'description' => 'Pelet apung kaya spirulina & protein untuk pertumbuhan cepat ikan nila, lele, koi, koki dan cupang.',
            'price' => 22000,
            'image' => 'https://images.unsplash.com/photo-1522069169874-c58ec4b76be5?w=800&auto=format&fit=crop&q=80',
        ],
        [
            'name' => 'Bibit Ikan Nila / Ikan Mas Unggul Air Tawar (Per 100 Ekor)',
            'description' => 'Bibit ikan sehat pilihan hasil pemijahan lokal berkualitas siap tebar di kolam terpal atau tanah.',
            'price' => 50000,
            'image' => 'https://images.unsplash.com/photo-1535591273668-578e31182c4f?w=800&auto=format&fit=crop&q=80',
        ]
    ]
];

$businesses = Business::all();
echo "Processing " . $businesses->count() . " businesses...\n";

foreach ($businesses as $biz) {
    $bizNameLower = strtolower($biz->name . ' ' . ($biz->description ?? ''));
    
    // Choose appropriate theme
    $themeKey = 'toko';
    if (str_contains($bizNameLower, 'kopi') || str_contains($bizNameLower, 'coffee') || str_contains($bizNameLower, 'roastery') || str_contains($bizNameLower, 'cafe') || str_contains($bizNameLower, 'kafe')) {
        $themeKey = 'kopi';
    } elseif (str_contains($bizNameLower, 'burung') || str_contains($bizNameLower, 'ikan') || str_contains($bizNameLower, 'pakan') || str_contains($bizNameLower, 'pet') || str_contains($bizNameLower, 'aquarium') || str_contains($bizNameLower, 'unggas') || str_contains($bizNameLower, 'ternak')) {
        $themeKey = 'hewan_ikan';
    } elseif (str_contains($bizNameLower, 'sedot wc') || str_contains($bizNameLower, 'wc') || str_contains($bizNameLower, 'septic')) {
        $themeKey = 'sedot_wc';
    } elseif (str_contains($bizNameLower, 'makan') || str_contains($bizNameLower, 'resto') || str_contains($bizNameLower, 'bakso') || str_contains($bizNameLower, 'kuliner') || str_contains($bizNameLower, 'warung') || str_contains($bizNameLower, 'sate') || str_contains($bizNameLower, 'ayam') || str_contains($bizNameLower, 'nasi')) {
        $themeKey = 'kuliner';
    } elseif (str_contains($bizNameLower, 'bengkel') || str_contains($bizNameLower, 'motor') || str_contains($bizNameLower, 'mobil') || str_contains($bizNameLower, 'tambal ban')) {
        $themeKey = 'bengkel';
    } elseif (str_contains($bizNameLower, 'tani') || str_contains($bizNameLower, 'pertanian') || str_contains($bizNameLower, 'kebun') || str_contains($bizNameLower, 'gula') || str_contains($bizNameLower, 'beras') || str_contains($bizNameLower, 'pupuk')) {
        $themeKey = 'pertanian';
    } elseif (str_contains($bizNameLower, 'laundry') || str_contains($bizNameLower, 'cuci') || str_contains($bizNameLower, 'potong rambut') || str_contains($bizNameLower, 'barber') || str_contains($bizNameLower, 'salon') || str_contains($bizNameLower, 'jahit') || str_contains($bizNameLower, 'service') || str_contains($bizNameLower, 'jasa')) {
        $themeKey = 'jasa';
    } elseif (str_contains($bizNameLower, 'hp') || str_contains($bizNameLower, 'komputer') || str_contains($bizNameLower, 'elektronik') || str_contains($bizNameLower, 'ponsel') || str_contains($bizNameLower, 'ac')) {
        $themeKey = 'elektronik';
    }

    $themeItems = $catalogThemes[$themeKey];
    $products = Product::where('business_id', $biz->id)->get();

    if ($products->count() === 0) {
        // Create 3 products for this business
        foreach (array_slice($themeItems, 0, 3) as $item) {
            Product::create([
                'business_id' => $biz->id,
                'name' => $item['name'],
                'description' => $item['description'],
                'price' => $item['price'],
                'image' => $item['image'],
                'is_active' => true,
            ]);
        }
    } else {
        // Update existing products to have unique realistic images & info
        foreach ($products as $idx => $prod) {
            $item = $themeItems[$idx % count($themeItems)];
            $prod->name = $item['name'];
            $prod->description = $item['description'];
            $prod->price = $item['price'];
            $prod->image = $item['image'];
            $prod->is_active = true;
            $prod->save();
        }
    }
}

echo "Successfully updated all business products with realistic, unique Surade data and photos!\n";
