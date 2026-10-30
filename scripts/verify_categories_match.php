<?php
require __DIR__ . '/../backend/vendor/autoload.php';
$app = require_once __DIR__ . '/../backend/bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

use App\Models\Category;

$data = json_decode(file_get_contents(__DIR__ . '/real_businesses_246_data.json'), true);
echo "Checking " . count($data) . " items in real_businesses_246_data.json against DB...\n";

$missing = 0;
$matchedById = 0;
$matchedBySlug = 0;

foreach ($data as $item) {
    $c = Category::find($item['category_id']);
    if ($c) {
        $matchedById++;
    } else {
        $c = Category::where('slug', $item['sub_slug'])->first();
        if ($c) {
            $matchedBySlug++;
        } else {
            $missing++;
            echo "Missing: ID={$item['category_id']} Slug={$item['sub_slug']} Name={$item['sub_name']}\n";
        }
    }
}

echo "\nSummary:\n";
echo "Matched by ID: $matchedById\n";
echo "Matched by Slug: $matchedBySlug\n";
echo "Missing: $missing\n";
