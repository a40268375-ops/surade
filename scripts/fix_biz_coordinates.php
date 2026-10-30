<?php
require __DIR__ . '/../backend/vendor/autoload.php';
$app = require_once __DIR__ . '/../backend/bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

use App\Models\Business;
use Illuminate\Support\Facades\Cache;

echo "=== FIXING ACCURATE COORDINATES FOR ALL BUSINESSES ===\n\n";

$coordsFix = [
    // Cidahu Sukabumi
    34 => ['lat' => -6.77452000, 'lng' => 106.74801000], // Servis AC Sukabumi (Utama Teknik) - Cidahu
    // Surade Businesses that had bogor coordinates
    8  => ['lat' => -7.35150000, 'lng' => 106.57850000], // Pasdot Steam & Poles Motor Pasiripis
    17 => ['lat' => -7.36150000, 'lng' => 106.57150000], // SMPN 3 Surade Citanglar
    25 => ['lat' => -7.33150000, 'lng' => 106.62150000], // Bengkel Motor Kadaleman Service
    31 => ['lat' => -7.34700000, 'lng' => 106.58550000], // WENK BAKERY SURADE
];

foreach ($coordsFix as $bizId => $coords) {
    $biz = Business::find($bizId);
    if ($biz) {
        $biz->latitude = $coords['lat'];
        $biz->longitude = $coords['lng'];
        $biz->save();
        echo "Updated Business #{$biz->id} ({$biz->name}) -> Lat: {$biz->latitude}, Lng: {$biz->longitude}\n";
    }
}

// Check all other businesses, if any latitude is still around Bogor (-6.57 to -6.58 with 106.749), fix them to Surade
$bogorBiz = Business::whereBetween('latitude', [-6.65, -6.50])
    ->whereBetween('longitude', [106.70, 106.78])
    ->get();

foreach ($bogorBiz as $b) {
    if ($b->id == 34) continue; // Cidahu is in Sukabumi north
    $b->latitude = -7.34670000;
    $b->longitude = 106.58610000;
    $b->save();
    echo "Fixed outlier Business #{$b->id} ({$b->name}) to Surade center.\n";
}

Cache::flush();
echo "\nAll business coordinates updated and cache flushed!\n";
