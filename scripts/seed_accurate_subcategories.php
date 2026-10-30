<?php
$pdo = new PDO('mysql:host=127.0.0.1;dbname=surade_db', 'root', '');

$newSubcategories = [
    // Parent 31: Jasa
    ['parent_id' => 31, 'name' => 'Perbankan & ATM', 'slug' => 'jasa-perbankan-atm', 'icon' => 'building-bank'],
    ['parent_id' => 31, 'name' => 'Layanan Gadai & Finansial', 'slug' => 'jasa-layanan-gadai-finansial', 'icon' => 'cash'],
    ['parent_id' => 31, 'name' => 'Ekspedisi & Pos', 'slug' => 'jasa-ekspedisi-pos', 'icon' => 'mail'],
    ['parent_id' => 31, 'name' => 'SPBU & Pengisian BBM', 'slug' => 'jasa-spbu-pengisian-bbm', 'icon' => 'gas-station'],
    ['parent_id' => 31, 'name' => 'Pemandu Wisata & Tour', 'slug' => 'jasa-pemandu-wisata-tour', 'icon' => 'map-pin'],

    // Parent 25: Wisata & Destinasi
    ['parent_id' => 25, 'name' => 'Wisata Religi & Tempat Ibadah', 'slug' => 'hiburan-wisata-religi-masjid', 'icon' => 'moon'],
    ['parent_id' => 25, 'name' => 'Wisata Pantai & Bahari', 'slug' => 'hiburan-wisata-pantai-bahari', 'icon' => 'waves'],
    ['parent_id' => 25, 'name' => 'Sewa Perahu Wisata', 'slug' => 'hiburan-sewa-perahu-wisata', 'icon' => 'anchor'],
    ['parent_id' => 25, 'name' => 'Camping Ground & Spot Foto', 'slug' => 'hiburan-camping-ground-spot-foto', 'icon' => 'tent'],
    ['parent_id' => 25, 'name' => 'Geowisata Gua Karst', 'slug' => 'hiburan-geowisata-gua-karst', 'icon' => 'compass'],

    // Parent 59: Retail & Belanja
    ['parent_id' => 59, 'name' => 'Toko Emas & Perhiasan', 'slug' => 'retail-toko-emas-perhiasan', 'icon' => 'diamond'],
    ['parent_id' => 59, 'name' => 'Toko Alat Listrik & Lampu', 'slug' => 'retail-toko-alat-listrik-lampu', 'icon' => 'bulb'],
    ['parent_id' => 59, 'name' => 'Penggilingan Padi & Beras', 'slug' => 'retail-penggilingan-padi-beras', 'icon' => 'grain'],
    ['parent_id' => 59, 'name' => 'Sentra Oleh-Oleh & Keripik', 'slug' => 'retail-sentra-oleh-oleh-keripik', 'icon' => 'gift'],
    ['parent_id' => 59, 'name' => 'Toko Kaos & Distro', 'slug' => 'retail-toko-kaos-distro', 'icon' => 'shirt'],
    ['parent_id' => 59, 'name' => 'Toko Pakan Ternak & Burung', 'slug' => 'retail-toko-pakan-ternak-burung', 'icon' => 'feather'],

    // Parent 368: Elektronik
    ['parent_id' => 368, 'name' => 'Konter Pulsa & Kuota HP', 'slug' => 'elektronik-konter-pulsa-kuota-hp', 'icon' => 'device-mobile'],

    // Parent 378: Fashion
    ['parent_id' => 378, 'name' => 'Pangkas Rambut Pria & Barbershop', 'slug' => 'fashion-pangkas-rambut-pria-asgar', 'icon' => 'scissors'],
    ['parent_id' => 378, 'name' => 'Batik Tulis & Kerajinan Kain', 'slug' => 'fashion-batik-tulis-kerajinan-kain', 'icon' => 'palette'],

    // Parent 74: Pertanian & Ternak
    ['parent_id' => 74, 'name' => 'Peternakan Domba & Kambing', 'slug' => 'pertanian-peternakan-domba-kambing', 'icon' => 'bug'],
    ['parent_id' => 74, 'name' => 'Peternakan Ayam & Bebek', 'slug' => 'pertanian-peternakan-ayam-bebek', 'icon' => 'egg'],
    ['parent_id' => 74, 'name' => 'Kebun Sayuran & Cabai Rawit', 'slug' => 'pertanian-kebun-sayuran-cabai-rawit', 'icon' => 'plant'],
    ['parent_id' => 74, 'name' => 'Perkebunan Buah & Pisang', 'slug' => 'pertanian-perkebunan-buah-pisang', 'icon' => 'apple'],
    ['parent_id' => 74, 'name' => 'Budidaya Jamur Tiram', 'slug' => 'pertanian-budidaya-jamur-tiram', 'icon' => 'leaf'],
    ['parent_id' => 74, 'name' => 'Pabrik Pengolahan Tahu & Tempe', 'slug' => 'pertanian-pabrik-pengolahan-tahu-tempe', 'icon' => 'box'],
    ['parent_id' => 74, 'name' => 'Sentra Madu Odeng Hutan', 'slug' => 'pertanian-sentra-madu-odeng-hutan', 'icon' => 'droplet'],
    ['parent_id' => 74, 'name' => 'Budidaya Ikan Nila & Gurame', 'slug' => 'pertanian-budidaya-ikan-nila-gurame', 'icon' => 'fish'],
    ['parent_id' => 74, 'name' => 'Pelelangan Ikan & Nelayan', 'slug' => 'pertanian-pelelangan-ikan-nelayan', 'icon' => 'anchor'],
    ['parent_id' => 74, 'name' => 'Toko Pertanian & Bibit Tanaman', 'slug' => 'pertanian-toko-pertanian-bibit-tanaman', 'icon' => 'seedling'],

    // Parent 48: Otomotif
    ['parent_id' => 48, 'name' => 'Bengkel Motor & Servis Resmi', 'slug' => 'otomotif-bengkel-motor-servis-resmi', 'icon' => 'tool'],
    ['parent_id' => 48, 'name' => 'Tambal Ban & Pengisian Angin', 'slug' => 'otomotif-tambal-ban-pengisian-angin', 'icon' => 'disc'],
    ['parent_id' => 48, 'name' => 'Cuci Motor Steam Salju', 'slug' => 'otomotif-cuci-motor-steam-salju', 'icon' => 'sparkles'],
    ['parent_id' => 48, 'name' => 'Bengkel Motor Trail & Modifikasi', 'slug' => 'otomotif-bengkel-motor-trail-modifikasi', 'icon' => 'bike']
];

foreach ($newSubcategories as $cat) {
    $stmt = $pdo->prepare("SELECT id FROM categories WHERE slug = ?");
    $stmt->execute([$cat['slug']]);
    $exists = $stmt->fetchColumn();

    if (!$exists) {
        $ins = $pdo->prepare("INSERT INTO categories (parent_id, name, slug, icon, created_at, updated_at) VALUES (?, ?, ?, ?, NOW(), NOW())");
        $ins->execute([$cat['parent_id'], $cat['name'], $cat['slug'], $cat['icon']]);
        echo "Inserted subcategory: {$cat['name']} (ID: " . $pdo->lastInsertId() . ")\n";
    } else {
        echo "Subcategory already exists: {$cat['name']} (ID: {$exists})\n";
    }
}
