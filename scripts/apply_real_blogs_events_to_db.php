<?php
require __DIR__ . '/../backend/vendor/autoload.php';
$app = require_once __DIR__ . '/../backend/bootstrap/app.php';
$app->make('Illuminate\Contracts\Console\Kernel')->bootstrap();

use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

$jsonFile = __DIR__ . '/../real_downloaded_blogs.json';
if (!file_exists($jsonFile)) {
    die("File {$jsonFile} belum ada. Tunggu proses scraping selesai.\n");
}

$items = json_decode(file_get_contents($jsonFile), true);
if (!$items || !is_array($items)) {
    die("Format JSON tidak valid.\n");
}

// 1. Get test user / admin user id for authoring
$adminUser = DB::table('users')->where('email', 'admin@surade.com')->first();
$user = DB::table('users')->where('email', 'user@surade.com')->first();
$authorId = $adminUser ? $adminUser->id : ($user ? $user->id : 1);

// 2. Categories lookup map
$categories = DB::table('blog_categories')->pluck('id', 'name')->toArray();

echo "🔄 Menghapus seluruh data Blog & Event lama di database...\n";
DB::statement('SET FOREIGN_KEY_CHECKS=0;');
DB::table('blogs')->truncate();
DB::statement('SET FOREIGN_KEY_CHECKS=1;');
echo "✅ Data lama berhasil dibersihkan.\n";

echo "🔄 Memasukkan 10 Data Blog dan 10 Data Event Asli...\n";

foreach ($items as $item) {
    $catId = $categories[$item['category']] ?? 1;
    $slug = Str::slug($item['title']);

    // Ensure unique slug
    $baseSlug = $slug;
    $counter = 1;
    while (DB::table('blogs')->where('slug', $slug)->exists()) {
        $slug = $baseSlug . '-' . $counter;
        $counter++;
    }

    DB::table('blogs')->insert([
        'user_id' => $authorId,
        'title' => $item['title'],
        'slug' => $slug,
        'excerpt' => $item['excerpt'],
        'content' => trim($item['content']),
        'thumbnail' => $item['thumbnail'],
        'images' => json_encode([$item['thumbnail']]),
        'blog_category_id' => $catId,
        'blog_category' => $item['category'],
        'type' => $item['type'],
        'status' => 'published',
        'published_at' => $item['published_at'] ?? now(),
        'event_date' => $item['event_date'],
        'event_end_date' => $item['event_end_date'],
        'event_location' => $item['event_location'],
        'views' => rand(85, 340),
        'created_at' => $item['published_at'] ?? now(),
        'updated_at' => now(),
    ]);

    echo "✅ [{$item['type']}] {$item['title']} berhasil dimasukkan.\n";
}

echo "\n🎉 Sukses memasukkan 10 Blog dan 10 Event asli ke database!\n";
