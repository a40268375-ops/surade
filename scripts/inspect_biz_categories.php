<?php
require __DIR__ . '/../backend/vendor/autoload.php';
$app = require_once __DIR__ . '/../backend/bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

use App\Models\Business;
use App\Models\Category;
use App\Models\NavbarCategory;

echo "=== BUSINESSES & THEIR CURRENT CATEGORY_ID ===\n";
$businesses = Business::all(['id', 'name', 'category_id']);
foreach ($businesses as $b) {
    $cat = Category::find($b->category_id);
    $parent = $cat && $cat->parent_id ? Category::find($cat->parent_id) : null;
    $catStr = $cat ? ($parent ? "{$parent->name} > {$cat->name}" : $cat->name) : "NULL";
    echo "Business #{$b->id} '{$b->name}': category_id={$b->category_id} ({$catStr})\n";
}
