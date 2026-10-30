<?php
require __DIR__ . '/../backend/vendor/autoload.php';
$app = require_once __DIR__ . '/../backend/bootstrap/app.php';
$app->make(Illuminate\Contracts\Console\Kernel::class)->bootstrap();

use App\Models\Business;

$b = Business::where('name', 'like', '%Badut%')->first();
if ($b) {
    echo "Found business: ID {$b->id}\n";
    echo "Name: {$b->name}\n";
    echo "is_premium: " . var_export($b->is_premium, true) . "\n";
    echo "is_verified: " . var_export($b->is_verified, true) . "\n";
    echo "status: {$b->status}\n";
    echo "package: {$b->package}\n";
    echo "user_id: {$b->user_id}\n";
    if ($b->user) {
        echo "user role: {$b->user->role}\n";
    }
} else {
    echo "Business not found\n";
}
