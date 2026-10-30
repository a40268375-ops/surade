<?php
require __DIR__ . '/../backend/vendor/autoload.php';
$app = require_once __DIR__ . '/../backend/bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

use App\Models\Business;
use App\Models\User;

$admin = User::where('role', 'admin')->first();
$reseller = User::find(14);

echo "Admin ID: " . ($admin ? $admin->id : 'none') . PHP_EOL;
echo "Reseller ID: " . ($reseller ? $reseller->id : 'none') . PHP_EOL;

// Assign all 246 businesses to Admin (user id 94) first
Business::where('user_id', 14)->update(['user_id' => $admin->id]);

// Assign 2 businesses specifically to Reseller (User 14)
$b1 = Business::where('name', 'like', '%Toko Sarana Pertanian%')->first();
if (!$b1) $b1 = Business::first();
if ($b1) {
    $b1->update(['user_id' => 14]);
    echo "Assigned to Reseller: {$b1->id} - {$b1->name}" . PHP_EOL;
}

$b2 = Business::where('name', 'like', '%Bengkel Motor AHASS%')->first();
if (!$b2) $b2 = Business::skip(1)->first();
if ($b2) {
    $b2->update(['user_id' => 14]);
    echo "Assigned to Reseller: {$b2->id} - {$b2->name}" . PHP_EOL;
}

echo PHP_EOL . "Updated counts:" . PHP_EOL;
echo "Reseller (ID 14) businesses: " . Business::where('user_id', 14)->count() . PHP_EOL;
echo "Admin (ID {$admin->id}) businesses: " . Business::where('user_id', $admin->id)->count() . PHP_EOL;
