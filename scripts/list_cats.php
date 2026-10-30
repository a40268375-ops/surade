<?php
require __DIR__ . '/../backend/vendor/autoload.php';
$app = require_once __DIR__ . '/../backend/bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

use App\Models\Category;

$cats = Category::all(['id', 'name', 'slug', 'parent_id']);
foreach ($cats as $c) {
    $prefix = $c->parent_id ? "  " : "";
    echo $prefix . "[{$c->id}] {$c->name} => {$c->slug}\n";
}
