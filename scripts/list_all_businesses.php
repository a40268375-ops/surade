<?php
require __DIR__ . '/../backend/vendor/autoload.php';
$app = require_once __DIR__ . '/../backend/bootstrap/app.php';
$app->make('Illuminate\Contracts\Console\Kernel')->bootstrap();

$businesses = \App\Models\Business::all();
echo "Total businesses: " . $businesses->count() . "\n";
foreach ($businesses as $b) {
    $cat = $b->category->name ?? 'None';
    echo "ID: {$b->id} | Name: {$b->name} | Desa: {$b->city} | Category: {$cat}\n";
}
