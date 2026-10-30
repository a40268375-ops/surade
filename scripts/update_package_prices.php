<?php
require __DIR__ . '/../backend/vendor/autoload.php';
$app = require_once __DIR__ . '/../backend/bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

use App\Models\CoinPackage;

$packages = [
    [
        'name' => 'Paket 10 Poin',
        'coin_amount' => 10,
        'bonus_coin' => 0,
        'price_idr' => 11000,
        'badge_label' => 'STARTER',
        'is_popular' => false,
        'sort_order' => 1,
    ],
    [
        'name' => 'Paket 25 Poin',
        'coin_amount' => 25,
        'bonus_coin' => 0,
        'price_idr' => 27000,
        'badge_label' => 'HEMAT',
        'is_popular' => false,
        'sort_order' => 2,
    ],
    [
        'name' => 'Paket 50 Poin',
        'coin_amount' => 50,
        'bonus_coin' => 0,
        'price_idr' => 53000,
        'badge_label' => 'POPULER',
        'is_popular' => true,
        'sort_order' => 3,
    ],
    [
        'name' => 'Paket 100 Poin',
        'coin_amount' => 100,
        'bonus_coin' => 0,
        'price_idr' => 104000,
        'badge_label' => 'BEST VALUE',
        'is_popular' => false,
        'sort_order' => 4,
    ],
    [
        'name' => 'Paket 250 Poin',
        'coin_amount' => 250,
        'bonus_coin' => 0,
        'price_idr' => 255000,
        'badge_label' => 'BISNIS',
        'is_popular' => false,
        'sort_order' => 5,
    ],
    [
        'name' => 'Paket 425 Poin',
        'coin_amount' => 425,
        'bonus_coin' => 0,
        'price_idr' => 430000,
        'badge_label' => 'SUPER VALUE',
        'is_popular' => false,
        'sort_order' => 6,
    ],
];

CoinPackage::query()->delete();

foreach ($packages as $pkg) {
    CoinPackage::create(array_merge($pkg, ['is_active' => true]));
    echo "Created: {$pkg['name']} with price Rp " . number_format($pkg['price_idr'], 0, ',', '.') . PHP_EOL;
}

echo "All 6 packages successfully updated!" . PHP_EOL;
