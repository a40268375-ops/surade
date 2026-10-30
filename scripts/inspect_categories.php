<?php
require __DIR__ . '/../backend/vendor/autoload.php';
$app = require_once __DIR__ . '/../backend/bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

echo "=== CATEGORIES TABLE (Category model) ===\n";
$cats = App\Models\Category::with('children')->whereNull('parent_id')->orderBy('order')->orderBy('name')->get();
$totalSub = 0;
foreach ($cats as $c) {
    $cnt = $c->children->count();
    $totalSub += $cnt;
    echo "ID {$c->id} | {$c->name} (slug: {$c->slug}) | Subcategories: {$cnt}\n";
    foreach ($c->children as $ch) {
        $bizCount = App\Models\Business::where('category_id', $ch->id)->count();
        echo "   - [ID: {$ch->id}] {$ch->name} (slug: {$ch->slug}) -> Biz count: {$bizCount}\n";
    }
}
echo "\nTotal Main Categories: " . $cats->count() . "\n";
echo "Total Subcategories: " . $totalSub . "\n";
