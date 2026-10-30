<?php

require __DIR__ . '/../backend/vendor/autoload.php';

$app = require_once __DIR__ . '/../backend/bootstrap/app.php';

$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

echo "=== Updating Database records from surade.co.id to surade.com ===\n";

try {
    // 1. Users table
    if (Schema::hasTable('users')) {
        $updatedUsers = DB::table('users')
            ->where('email', 'like', '%@surade.co.id')
            ->get();
        
        foreach ($updatedUsers as $u) {
            $newEmail = str_ireplace('@surade.co.id', '@surade.com', $u->email);
            DB::table('users')->where('id', $u->id)->update(['email' => $newEmail]);
            echo "Updated user ID {$u->id}: {$u->email} -> {$newEmail}\n";
        }
    }

    // 2. Settings table
    if (Schema::hasTable('settings')) {
        $settings = DB::table('settings')->get();
        foreach ($settings as $s) {
            if (stripos($s->value, 'surade.co.id') !== false) {
                $newVal = str_ireplace('surade.co.id', 'surade.com', $s->value);
                DB::table('settings')->where('id', $s->id)->update(['value' => $newVal]);
                echo "Updated setting {$s->key}\n";
            }
        }
    }

    // 3. Businesses table
    if (Schema::hasTable('businesses')) {
        $bizs = DB::table('businesses')->where('email', 'like', '%surade.co.id%')->orWhere('website', 'like', '%surade.co.id%')->get();
        foreach ($bizs as $b) {
            $newEmail = str_ireplace('surade.co.id', 'surade.com', $b->email);
            $newWeb = str_ireplace('surade.co.id', 'surade.com', $b->website);
            DB::table('businesses')->where('id', $b->id)->update([
                'email' => $newEmail,
                'website' => $newWeb
            ]);
            echo "Updated business ID {$b->id}\n";
        }
    }

    // 4. Blogs table
    if (Schema::hasTable('blogs')) {
        $blogs = DB::table('blogs')->where('content', 'like', '%surade.co.id%')->orWhere('excerpt', 'like', '%surade.co.id%')->get();
        foreach ($blogs as $bg) {
            $newContent = str_ireplace('surade.co.id', 'surade.com', $bg->content);
            $newExcerpt = str_ireplace('surade.co.id', 'surade.com', $bg->excerpt);
            DB::table('blogs')->where('id', $bg->id)->update([
                'content' => $newContent,
                'excerpt' => $newExcerpt
            ]);
            echo "Updated blog ID {$bg->id}\n";
        }
    }

    // 5. Reviews table
    if (Schema::hasTable('reviews')) {
        $reviews = DB::table('reviews')->where('comment', 'like', '%surade.co.id%')->get();
        foreach ($reviews as $rev) {
            $newComment = str_ireplace('surade.co.id', 'surade.com', $rev->comment);
            DB::table('reviews')->where('id', $rev->id)->update(['comment' => $newComment]);
            echo "Updated review ID {$rev->id}\n";
        }
    }

    echo "Database records check & update finished successfully!\n";
} catch (\Throwable $e) {
    echo "Notice/Error connecting to DB: " . $e->getMessage() . "\n";
}
