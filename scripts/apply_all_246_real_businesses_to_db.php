<?php
require __DIR__ . '/../backend/vendor/autoload.php';
$app = require_once __DIR__ . '/../backend/bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

use App\Models\Business;
use App\Models\Product;
use App\Models\Category;
use App\Models\User;
use Illuminate\Support\Str;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Cache;

echo "=== SEEDING 246 REAL AUTHENTIC BUSINESSES TO DATABASE ===\n";

$jsonPath = __DIR__ . '/real_businesses_246_data.json';
if (!file_exists($jsonPath)) {
    die("Error: real_businesses_246_data.json not found!\n");
}

$businessesData = json_decode(file_get_contents($jsonPath), true);
if (!is_array($businessesData) || empty($businessesData)) {
    die("Error: real_businesses_246_data.json is empty or invalid!\n");
}

echo "Total businesses in dataset: " . count($businessesData) . "\n";

// 1. Get or create primary owner user
$user = User::where('email', 'user@surade.com')->first() 
     ?? User::where('role', 'admin')->first()
     ?? User::first();

$userId = $user ? $user->id : 1;
echo "Assigning businesses to User ID: $userId ({$user->name})\n";

// 2. Clear old mock business data and relations
echo "Clearing old mock business data and relations...\n";
DB::statement('SET FOREIGN_KEY_CHECKS=0;');

$tablesToTruncate = [
    'ratings', 'rating_replies', 'rating_likes', 'products', 'favorites', 
    'business_analytics', 'whatsapp_access_logs', 'advertisements', 
    'subscriptions', 'saved_businesses', 'businesses'
];

foreach ($tablesToTruncate as $t) {
    if (DB::getSchemaBuilder()->hasTable($t)) {
        DB::table($t)->truncate();
    }
}

DB::statement('SET FOREIGN_KEY_CHECKS=1;');
echo "✅ Old mock businesses successfully cleared.\n\n";

// 3. Insert each real business and its products
$insertedCount = 0;
$productsCount = 0;

foreach ($businessesData as $item) {
    $cat = Category::find($item['category_id']);
    if (!$cat) {
        $cat = Category::where('slug', $item['sub_slug'])->first();
    }
    
    if (!$cat) {
        echo "⚠️ Warning: Category ID {$item['category_id']} / Slug {$item['sub_slug']} not found, skipping {$item['name']}\n";
        continue;
    }

    $uniqueSlug = Str::slug($item['name']) . '-' . $cat->id . '-' . rand(100, 999);
    
    $biz = Business::create([
        'user_id' => $userId,
        'category_id' => $cat->id,
        'name' => $item['name'],
        'slug' => $uniqueSlug,
        'description' => $item['description'],
        'address' => $item['address'],
        'city' => $item['village'],
        'province' => 'Jawa Barat',
        'postal_code' => '43179',
        'latitude' => $item['latitude'],
        'longitude' => $item['longitude'],
        'phone' => $item['phone'],
        'whatsapp' => $item['whatsapp'],
        'email' => $item['email'],
        'opening_days' => $item['opening_days'],
        'tags' => $item['tags'],
        'logo' => $item['logo'],
        'banner' => $item['banner'],
        'banners' => [$item['banner']],
        'gallery' => $item['gallery'],
        'is_premium' => $item['is_premium'],
        'premium_plan' => $item['is_premium'] ? 'Pro' : null,
        'is_active' => true,
        'status' => 'approved',
        'views' => rand(120, 3500),
        'clicks' => rand(25, 480),
        'rating' => rand(45, 50) / 10.0,
        'rating_count' => rand(5, 38),
        'verified_at' => now(),
        'verified_by' => $userId,
    ]);

    $insertedCount++;

    // Insert products
    if (!empty($item['products'])) {
        foreach ($item['products'] as $prod) {
            Product::create([
                'business_id' => $biz->id,
                'name' => $prod['name'],
                'description' => $prod['description'],
                'price' => $prod['price'],
                'image' => $prod['image'] ?? $item['logo'],
                'is_active' => true,
                'status' => 'approved',
            ]);
            $productsCount++;
        }
    }
}

echo "\n🎉 Inserted $insertedCount businesses across all subcategories!\n";
echo "🎉 Inserted $productsCount products!\n";

// 4. Clear all caches
Cache::flush();
Cache::forget('categories_public_v1');
Cache::forget('categories_all');
Cache::forget('categories_tree');
Cache::forget('home_feed_public');

echo "\n✅ All caches cleared! Live DB ready.\n";
