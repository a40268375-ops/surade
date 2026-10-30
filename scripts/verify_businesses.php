<?php
require __DIR__ . '/../backend/vendor/autoload.php';
$app = require_once __DIR__ . '/../backend/bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

use App\Models\Business;
use App\Models\Product;
use Illuminate\Support\Facades\DB;

echo "Total Businesses: " . Business::count() . PHP_EOL;
echo "Total Products: " . Product::count() . PHP_EOL;
echo "Columns in businesses:\n";
print_r(\Illuminate\Support\Facades\Schema::getColumnListing('businesses'));

echo "\nSample 3 Businesses:\n";
$samples = Business::with(['category', 'products'])->take(5)->get();
foreach ($samples as $s) {
    echo "====================================\n";
    echo "ID: {$s->id} | Nama: {$s->name}\n";
    echo "Kategori: " . ($s->category ? $s->category->name : 'None') . "\n";
    echo "Banner: {$s->banner}\n";
    echo "Logo: {$s->logo}\n";
    echo "Gallery: " . (is_array($s->gallery) ? json_encode($s->gallery) : $s->gallery) . "\n";
    echo "Alamat: {$s->address} ({$s->city})\n";
    echo "Produk Count: " . $s->products->count() . "\n";
}


