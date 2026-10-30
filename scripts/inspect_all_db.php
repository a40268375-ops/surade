<?php
require __DIR__ . '/../backend/vendor/autoload.php';
$app = require_once __DIR__ . '/../backend/bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

echo "Total businesses: " . App\Models\Business::count() . "\n";
echo "Total products: " . App\Models\Product::count() . "\n";
echo "Total categories (main): " . App\Models\Category::whereNull('parent_id')->count() . "\n";
echo "Total subcategories: " . App\Models\Category::whereNotNull('parent_id')->count() . "\n";
echo "Total navbar_categories (main): " . App\Models\NavbarCategory::whereNull('parent_id')->count() . "\n";
echo "Total navbar subcategories: " . App\Models\NavbarCategory::whereNotNull('parent_id')->count() . "\n";

$sampleBiz = App\Models\Business::with(['category', 'subcategory', 'products'])->first();
if ($sampleBiz) {
    echo "\nSample Business Attributes:\n";
    print_r(array_keys($sampleBiz->getAttributes()));
    echo "\nSample Business Data:\n";
    print_r($sampleBiz->toArray());
}

$sampleProd = App\Models\Product::first();
if ($sampleProd) {
    echo "\nSample Product Data:\n";
    print_r($sampleProd->toArray());
}
