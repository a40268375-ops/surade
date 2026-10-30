<?php
require __DIR__ . '/../backend/vendor/autoload.php';
$app = require_once __DIR__ . '/../backend/bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

$cats = App\Models\Category::select('id', 'name', 'slug', 'parent_id')->get();
file_put_contents(__DIR__ . '/all_categories.json', json_encode($cats, JSON_PRETTY_PRINT));
echo "Total Categories Exported: " . $cats->count() . PHP_EOL;
