<?php
require __DIR__ . '/../backend/vendor/autoload.php';
$app = require_once __DIR__ . '/../backend/bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

use App\Models\Business;
use App\Models\User;

echo "Total Businesses in DB: " . Business::count() . PHP_EOL;
$byUser = Business::all()->groupBy('user_id');
foreach ($byUser as $uid => $bizs) {
    echo "User ID {$uid}: " . $bizs->count() . " businesses" . PHP_EOL;
}

echo PHP_EOL . "First 10 businesses:" . PHP_EOL;
foreach (Business::take(10)->get() as $b) {
    echo "ID: {$b->id} | Name: {$b->name} | user_id: {$b->user_id} | city: {$b->city}" . PHP_EOL;
}
