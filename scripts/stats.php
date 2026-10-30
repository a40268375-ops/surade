<?php
require __DIR__ . '/../backend/vendor/autoload.php';
$app = require_once __DIR__ . '/../backend/bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

use App\Models\Category;
use App\Models\Business;

$parents = Category::whereNull('parent_id')->get();
$subs = Category::whereNotNull('parent_id')->get();
$totalBiz = Business::count();

echo "Parent categories: " . $parents->count() . "\n";
echo "Subcategories: " . $subs->count() . "\n";
echo "Total businesses: " . $totalBiz . "\n\n";

$subsWithoutBiz = [];
foreach ($subs as $sub) {
    $count = Business::where('category_id', $sub->id)->count();
    if ($count === 0) {
        $subsWithoutBiz[] = "[{$sub->id}] {$sub->name} (slug: {$sub->slug})";
    }
}

echo "Subcategories without business: " . count($subsWithoutBiz) . " out of " . $subs->count() . "\n";
if (count($subsWithoutBiz) > 0) {
    echo "First 15 missing:\n";
    foreach (array_slice($subsWithoutBiz, 0, 15) as $m) {
        echo " - $m\n";
    }
}

$activeBiz = Business::where('is_active', 1)->where('status', 'approved')->count();
$premiumBiz = Business::where('is_premium', 1)->count();
$totalProducts = \App\Models\Product::count();
$activeProducts = \App\Models\Product::where('is_active', 1)->where('status', 'approved')->count();

echo "\nActive & Approved Businesses: {$activeBiz} / {$totalBiz}\n";
echo "Premium Businesses: {$premiumBiz} / {$totalBiz}\n";
echo "Total Products: {$totalProducts}\n";
echo "Active & Approved Products: {$activeProducts} / {$totalProducts}\n";

