<?php
require __DIR__ . '/../backend/vendor/autoload.php';
$app = require_once __DIR__ . '/../backend/bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

$cats = App\Models\Category::with('children')->whereNull('parent_id')->orderBy('order')->orderBy('name')->get();
$data = [];
$totalSubs = 0;
foreach ($cats as $c) {
    $subs = [];
    foreach ($c->children as $ch) {
        $subs[] = [
            'id' => $ch->id,
            'name' => $ch->name,
            'slug' => $ch->slug
        ];
        $totalSubs++;
    }
    $data[] = [
        'id' => $c->id,
        'name' => $c->name,
        'slug' => $c->slug,
        'count' => count($subs),
        'subcategories' => $subs
    ];
}
file_put_contents(__DIR__ . '/all_categories_dump.json', json_encode($data, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE));
echo "Dumped " . count($data) . " categories and $totalSubs subcategories to scripts/all_categories_dump.json\n";
