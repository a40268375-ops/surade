<?php
require __DIR__ . '/../backend/vendor/autoload.php';
$app = require_once __DIR__ . '/../backend/bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

use App\Models\User;
use App\Models\Business;
use App\Models\Blog;

echo "=== USER LIST ===" . PHP_EOL;
foreach (User::all() as $u) {
    $bizCount = Business::where('user_id', $u->id)->count();
    $blogCount = Blog::where('user_id', $u->id)->count();
    echo "ID: {$u->id} | Name: {$u->name} | Email: {$u->email} | Role: {$u->role} | Businesses: {$bizCount} | Blogs: {$blogCount}" . PHP_EOL;
}
