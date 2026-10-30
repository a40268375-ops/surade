<?php
require __DIR__ . '/../backend/vendor/autoload.php';
$app = require_once __DIR__ . '/../backend/bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

use App\Models\Business;
use App\Models\Product;
use Illuminate\Support\Facades\DB;

echo "=== MEMASUKKAN 150 DATA USAHA TERVERIFIKASI KE DATABASE SURADE ===\n\n";

$jsonPath = __DIR__ . '/verified_150_real_surade.json';
if (!file_exists($jsonPath)) {
    die("File JSON tidak ditemukan: {$jsonPath}\n");
}

$businessesData = json_decode(file_get_contents($jsonPath), true);
if (!is_array($businessesData) || count($businessesData) === 0) {
    die("Data JSON kosong atau tidak valid.\n");
}

DB::statement('SET FOREIGN_KEY_CHECKS=0;');
echo "Membersihkan tabel produk dan usaha...\n";
DB::table('products')->truncate();
DB::table('businesses')->truncate();
DB::statement('SET FOREIGN_KEY_CHECKS=1;');

DB::beginTransaction();

try {
    $now = now();

    $validColumns = array_flip(\Illuminate\Support\Facades\Schema::getColumnListing('businesses'));
    $validProductCols = array_flip(\Illuminate\Support\Facades\Schema::getColumnListing('products'));

    $firstUser = DB::table('users')->first();
    $userId = $firstUser ? $firstUser->id : 14;

    $validCategoryIds = DB::table('categories')->pluck('id')->toArray();
    $defaultCatId = !empty($validCategoryIds) ? $validCategoryIds[0] : null;
    $validCategorySet = array_flip($validCategoryIds);

    $insertedBiz = 0;
    $insertedProd = 0;

    foreach ($businessesData as $item) {
        $products = $item['products'] ?? [];
        unset($item['products'], $item['source_name'], $item['source_url'], $item['achievement_source_url']);

        $item['user_id'] = $userId;
        if (!isset($validCategorySet[$item['category_id']])) {
            $item['category_id'] = $defaultCatId;
        }

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
                'price' => $p['price'] ?? 0,
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
    }

    DB::commit();
    echo "\n=== SUKSES: {$insertedBiz} DATA USAHA TERVERIFIKASI & {$insertedProd} PRODUK BERHASIL DIIMPORT SECARA AMAN! ===\n";
} catch (\Exception $e) {
    DB::rollBack();
    echo "ERROR: " . $e->getMessage() . "\n";
}
