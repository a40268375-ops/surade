<?php
require __DIR__ . '/../backend/vendor/autoload.php';
$app = require_once __DIR__ . '/../backend/bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

use App\Models\Business;
use App\Models\Product;
use Illuminate\Support\Facades\DB;

echo "=== MEMPERBARUI 246 DATA USAHA DAN 492 PRODUK DI SURADE_DB ===\n\n";

$jsonPath = __DIR__ . '/final_246_businesses_data.json';
if (!file_exists($jsonPath)) {
    die("File JSON tidak ditemukan: {$jsonPath}\n");
}

$businessesData = json_decode(file_get_contents($jsonPath), true);
if (!is_array($businessesData) || count($businessesData) === 0) {
    die("Data JSON kosong atau tidak valid.\n");
}

echo "Membaca " . count($businessesData) . " data usaha dari JSON...\n";

// Disable foreign key checks for clean replacement
DB::statement('SET FOREIGN_KEY_CHECKS=0;');

echo "Menghapus data usaha dan produk lama...\n";
DB::table('products')->truncate();
DB::table('businesses')->truncate();

DB::statement('SET FOREIGN_KEY_CHECKS=1;');

$now = now();
$firstUser = DB::table('users')->first();
$defaultUserId = $firstUser ? $firstUser->id : 1;
echo "Menggunakan user_id: {$defaultUserId} (" . ($firstUser ? $firstUser->name : 'none') . ")\n";

$insertedBiz = 0;
$insertedProd = 0;

$validCategoryIds = DB::table('categories')->pluck('id')->toArray();
$defaultCatId = !empty($validCategoryIds) ? $validCategoryIds[0] : null;
$validCategorySet = array_flip($validCategoryIds);

$validColumns = array_flip(\Illuminate\Support\Facades\Schema::getColumnListing('businesses'));
$validProductCols = array_flip(\Illuminate\Support\Facades\Schema::getColumnListing('products'));

foreach ($businessesData as $item) {
    $products = $item['products'] ?? [];
    unset($item['products'], $item['keyword'], $item['village']);

    $item['user_id'] = $defaultUserId;
    if (!isset($validCategorySet[$item['category_id']])) {
        $item['category_id'] = $defaultCatId;
    }

    // Ensure fields format
    $item['created_at'] = $now;
    $item['updated_at'] = $now;

    if (isset($item['is_premium']) && $item['is_premium']) {
        $item['premium_expires_at'] = now()->addMonths(6);
        $item['premium_plan'] = 'premium_plus';
    }

    $bizRecord = array_intersect_key($item, $validColumns);
    $bizId = DB::table('businesses')->insertGetId($bizRecord);
    $insertedBiz++;

    foreach ($products as $p) {
        $pSlug = strtolower(preg_replace('/[^a-z0-9]+/i', '-', $p['name'])) . '-' . $bizId . '-' . rand(100, 999);
        $pRecord = [
            'business_id' => $bizId,
            'name' => $p['name'],
            'slug' => $pSlug,
            'title' => $p['name'],
            'description' => $p['desc'] ?? $p['description'] ?? '',
            'price' => $p['price'] ?? 15000,
            'image' => $item['banner'] ?? null,
            'image_url' => $item['banner'] ?? null,
            'images' => json_encode([$item['banner'] ?? null]),
            'is_active' => true,
            'is_available' => true,
            'status' => 'approved',
            'created_at' => $now,
            'updated_at' => $now
        ];
        $pInsert = array_intersect_key($pRecord, $validProductCols);
        DB::table('products')->insert($pInsert);
        $insertedProd++;
    }

    if ($insertedBiz % 50 === 0 || $insertedBiz === count($businessesData)) {
        echo "Berhasil memproses {$insertedBiz} / " . count($businessesData) . " data usaha...\n";
    }
}


echo "\n=== SUKSES: {$insertedBiz} DATA USAHA & {$insertedProd} PRODUK BERHASIL DIINPUT! ===\n";
