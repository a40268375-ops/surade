<?php
require __DIR__ . '/../backend/vendor/autoload.php';
$app = require_once __DIR__ . '/../backend/bootstrap/app.php';
$app->make('Illuminate\Contracts\Console\Kernel')->bootstrap();

echo "=== BUSINESSES (Total: " . \App\Models\Business::count() . ") ===\n";
foreach (\App\Models\Business::all() as $b) {
    echo "ID: {$b->id} | Name: {$b->name} | City/Desa: {$b->city} | Category: " . ($b->category->name ?? 'N/A') . "\n";
    echo "  Logo: {$b->logo}\n";
    echo "  Banner: {$b->banner}\n";
    echo "  Image: {$b->image}\n";
    echo "  Gallery: " . (is_array($b->gallery) ? implode(', ', $b->gallery) : $b->gallery) . "\n\n";
}

echo "\n=== ADVERTISEMENTS (Total: " . \App\Models\Advertisement::count() . ") ===\n";
foreach (\App\Models\Advertisement::with('business')->get() as $ad) {
    echo "Ad ID: {$ad->id} | Type: {$ad->package_type} | Status: {$ad->status} | Biz ID: {$ad->business_id} | Biz Name: " . ($ad->business->name ?? 'NULL') . "\n";
    echo "  Ad Image: {$ad->image}\n";
    echo "  Ad Banner: {$ad->banner}\n";
    echo "  Ad Logo: {$ad->logo}\n\n";
}
