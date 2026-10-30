<?php
require __DIR__ . '/../backend/vendor/autoload.php';
$app = require_once __DIR__ . '/../backend/bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

use App\Models\Blog;
use App\Models\Business;
use App\Models\User;

echo "=== BLOGS FOR USER 14 ===" . PHP_EOL;
$blogs = Blog::where('user_id', 14)->get();
echo "Count: " . $blogs->count() . PHP_EOL;
foreach ($blogs as $b) {
    echo "ID: {$b->id} | Title: {$b->title} | Type: {$b->type} | Status: {$b->status} | user_id: {$b->user_id}" . PHP_EOL;
}

echo PHP_EOL . "=== ALL BLOGS COUNT BY USER ===" . PHP_EOL;
$allBlogs = Blog::all();
echo "Total Blogs: " . $allBlogs->count() . PHP_EOL;
$grouped = $allBlogs->groupBy('user_id');
foreach ($grouped as $uid => $list) {
    echo "User ID {$uid}: {$list->count()} blogs" . PHP_EOL;
}
