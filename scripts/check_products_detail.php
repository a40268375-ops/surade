<?php
require __DIR__ . '/../backend/vendor/autoload.php';
$app = require_once __DIR__ . '/../backend/bootstrap/app.php';
$app->make(Illuminate\Contracts\Console\Kernel::class)->bootstrap();

use Illuminate\Support\Facades\DB;

$totalProducts = DB::table('products')->count();
echo "Total products: $totalProducts\n";

$businessesWithProducts = DB::table('businesses')
    ->join('products', 'businesses.id', '=', 'products.business_id')
    ->select('businesses.id', 'businesses.name', 'businesses.category_id', DB::raw('count(products.id) as prod_count'))
    ->groupBy('businesses.id', 'businesses.name', 'businesses.category_id')
    ->limit(10)
    ->get();

echo json_encode($businessesWithProducts, JSON_PRETTY_PRINT | JSON_UNESCAPED_SLASHES);
