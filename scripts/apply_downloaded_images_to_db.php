<?php
require __DIR__ . '/../backend/vendor/autoload.php';
$app = require_once __DIR__ . '/../backend/bootstrap/app.php';
$app->make('Illuminate\Contracts\Console\Kernel')->bootstrap();

use Illuminate\Support\Facades\DB;

$jsonFile = __DIR__ . '/../real_downloaded_images.json';
if (!file_exists($jsonFile)) {
    die("File {$jsonFile} belum dibuat.\n");
}

$data = json_decode(file_get_contents($jsonFile), true);
if (!$data || !is_array($data)) {
    die("Format data tidak valid.\n");
}

echo "Memulai update gambar ke database untuk " . count($data) . " bisnis...\n";

foreach ($data as $bizId => $info) {
    $business = \App\Models\Business::find($bizId);
    if (!$business) {
        echo "⚠️ Bisnis ID {$bizId} tidak ditemukan.\n";
        continue;
    }

    $logo = $info['logo'] ?? null;
    $banner = $info['banner'] ?? null;
    $gallery = $info['gallery'] ?? [];

    $updateData = [];
    if ($logo) {
        $updateData['logo'] = $logo;
    }
    if ($banner) {
        $updateData['banner'] = $banner;
    }
    if (!empty($gallery)) {
        $updateData['gallery'] = $gallery;
    }

    $business->update($updateData);
    echo "✅ Bisnis ID {$bizId} ({$business->name}) diupdate:\n";
    echo "   Logo: {$logo}\n";
    echo "   Banner: {$banner}\n";

    // Update advertisements if any
    $ads = \App\Models\Advertisement::where('business_id', $bizId)->get();
    foreach ($ads as $ad) {
        $adUpdate = [];
        if ($banner) {
            $adUpdate['image'] = $banner;
            $adUpdate['banner'] = $banner;
        }
        if ($logo) {
            $adUpdate['logo'] = $logo;
        }
        if (!empty($adUpdate)) {
            $ad->update($adUpdate);
            echo "   📢 Advertisement ID {$ad->id} ({$ad->package_type}) diupdate.\n";
        }
    }
}

echo "\n🎉 Selesai update seluruh 30 bisnis dan seluruh iklan ke database!\n";
