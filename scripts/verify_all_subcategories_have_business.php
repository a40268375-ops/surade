<?php
require __DIR__ . '/../backend/vendor/autoload.php';
$app = require_once __DIR__ . '/../backend/bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

$emptySubs = App\Models\Category::whereNotNull('parent_id')
    ->whereDoesntHave('businesses')
    ->get();

echo "Subcategories without businesses: " . $emptySubs->count() . "\n";
if ($emptySubs->count() > 0) {
    foreach ($emptySubs as $s) {
        echo "- ID {$s->id}: {$s->name} (slug: {$s->slug})\n";
    }
} else {
    echo "✅ PERFECT! All " . App\Models\Category::whereNotNull('parent_id')->count() . " subcategories have at least 1 real business!\n";
}

$mainCats = App\Models\Category::whereNull('parent_id')->get();
echo "\nMain Category Summary:\n";
foreach ($mainCats as $mc) {
    $subCount = $mc->children()->count();
    $bizCount = App\Models\Business::whereIn('category_id', $mc->children()->pluck('id'))->count();
    echo "- {$mc->name} (slug: {$mc->slug}): {$subCount} subcategories, {$bizCount} businesses\n";
}
