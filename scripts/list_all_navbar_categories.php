<?php
require __DIR__ . '/../backend/vendor/autoload.php';
$app = require_once __DIR__ . '/../backend/bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

use App\Models\Category;
use App\Models\NavbarCategory;
use App\Models\Business;
use Illuminate\Support\Str;

echo "=== CHECKING NAVBAR CATEGORIES AND CATEGORIES ===\n";

// Let's list all Navbar Categories
$parents = NavbarCategory::whereNull('parent_id')->orderBy('order')->get();
foreach ($parents as $p) {
    echo "\n[PARENT] {$p->name} (slug: {$p->slug}, id: {$p->id})\n";
    $children = NavbarCategory::where('parent_id', $p->id)->orderBy('order')->get();
    foreach ($children as $c) {
        echo "  - {$c->name} (slug: {$c->slug}, id: {$c->id})\n";
    }
}
