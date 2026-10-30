<?php
require __DIR__ . '/../backend/vendor/autoload.php';
$app = require_once __DIR__ . '/../backend/bootstrap/app.php';
$app->make('Illuminate\Contracts\Console\Kernel')->bootstrap();

use Illuminate\Support\Facades\DB;

echo "=== CHECKING DUPLICATES IN DATABASE ===\n";

// 1. Businesses
$dupBiz = DB::table('businesses')
    ->select('name', DB::raw('count(*) as count'), DB::raw('GROUP_CONCAT(id) as ids'))
    ->groupBy('name')
    ->having('count', '>', 1)
    ->get();

echo "Duplicate businesses found: " . count($dupBiz) . "\n";
foreach ($dupBiz as $d) {
    echo "  - {$d->name}: count={$d->count} (IDs: {$d->ids})\n";
    $ids = explode(',', $d->ids);
    $keepId = array_shift($ids);
    foreach ($ids as $removeId) {
        echo "    -> Deleting duplicate business ID {$removeId} (keeping ID {$keepId})\n";
        DB::table('businesses')->where('id', $removeId)->delete();
    }
}

// 2. Blogs / Events
$dupBlogs = DB::table('blogs')
    ->select('title', 'type', DB::raw('count(*) as count'), DB::raw('GROUP_CONCAT(id) as ids'))
    ->groupBy('title', 'type')
    ->having('count', '>', 1)
    ->get();

echo "Duplicate blogs/events found: " . count($dupBlogs) . "\n";
foreach ($dupBlogs as $d) {
    echo "  - [{$d->type}] {$d->title}: count={$d->count} (IDs: {$d->ids})\n";
    $ids = explode(',', $d->ids);
    $keepId = array_shift($ids);
    foreach ($ids as $removeId) {
        echo "    -> Deleting duplicate blog ID {$removeId} (keeping ID {$keepId})\n";
        DB::table('blogs')->where('id', $removeId)->delete();
    }
}

// 3. Advertisements
$dupAds = DB::table('advertisements')
    ->select('business_id', 'package_type', DB::raw('count(*) as count'), DB::raw('GROUP_CONCAT(id) as ids'))
    ->whereNotNull('business_id')
    ->groupBy('business_id', 'package_type')
    ->having('count', '>', 1)
    ->get();

echo "Duplicate advertisements found: " . count($dupAds) . "\n";
foreach ($dupAds as $d) {
    echo "  - Business ID {$d->business_id} [{$d->package_type}]: count={$d->count} (IDs: {$d->ids})\n";
    $ids = explode(',', $d->ids);
    $keepId = array_shift($ids);
    foreach ($ids as $removeId) {
        echo "    -> Deleting duplicate ad ID {$removeId} (keeping ID {$keepId})\n";
        DB::table('advertisements')->where('id', $removeId)->delete();
    }
}

echo "\nDone!\n";
