<?php
require __DIR__ . '/../backend/vendor/autoload.php';
$app = require_once __DIR__ . '/../backend/bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

use App\Models\Business;
use App\Models\User;
use App\Models\Conversation;
use App\Models\Message;
use App\Models\WhatsAppUnlockedContact;

$b = Business::where('name', 'like', '%Minajaya%')->first();
if ($b) {
    echo "Business ID: {$b->id}\n";
    echo "Name: {$b->name}\n";
    echo "is_premium: " . var_export($b->is_premium, true) . "\n";
    echo "package: {$b->package}\n";
    echo "premium_expires_at: {$b->premium_expires_at}\n";
}

$testUser = User::where('name', 'like', '%Test User%')->orWhere('email', 'like', '%test%')->first();
if ($testUser) {
    echo "\nTest User ID: {$testUser->id} | Name: {$testUser->name}\n";
    $unlocks = WhatsAppUnlockedContact::where('user_id', $testUser->id)->get();
    echo "Unlocked businesses count: " . $unlocks->count() . "\n";
    foreach ($unlocks as $u) {
        echo " - Unlocked Business ID: {$u->business_id} at {$u->unlocked_at}\n";
    }
}
