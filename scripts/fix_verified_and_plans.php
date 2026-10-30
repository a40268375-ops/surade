<?php
require __DIR__ . '/../backend/vendor/autoload.php';
$app = require_once __DIR__ . '/../backend/bootstrap/app.php';
$app->make(Illuminate\Contracts\Console\Kernel::class)->bootstrap();

use Illuminate\Support\Facades\DB;
use App\Models\Business;
use App\Models\Plan;

// 1. Reset is_verified to false for non-premium businesses
$updatedVerified = DB::table('businesses')
    ->where(function($q) {
        $q->where('is_premium', 0)->orWhereNull('is_premium');
    })
    ->update(['is_verified' => false]);

echo "Updated $updatedVerified non-premium businesses: is_verified set to false.\n";

// 2. Ensure default plan "Premium 1" exists with standard price Rp 35.000
$plan = Plan::find(2);
if ($plan) {
    echo "Plan ID 2: {$plan->name}, price: {$plan->price}\n";
} else {
    Plan::create([
        'id' => 2,
        'name' => 'Premium 1',
        'price' => 35000,
        'duration_days' => 365,
        'is_active' => true,
    ]);
    echo "Created default Plan ID 2 (Premium 1) with price 35000.\n";
}

// 3. Fix any payments/subscriptions for recent business submissions where proof is present on business or payment
$subs = DB::table('subscriptions')->get();
foreach ($subs as $s) {
    $biz = DB::table('businesses')->where('id', $s->business_id)->first();
    $pay = DB::table('payments')->where('subscription_id', $s->id)->first();
    
    $proof = $pay->proof ?? $s->proof_path ?? $biz->proof_document ?? null;
    if ($proof) {
        if (!$s->proof_path) {
            DB::table('subscriptions')->where('id', $s->id)->update(['proof_path' => $proof]);
        }
        if ($pay && !$pay->proof) {
            DB::table('payments')->where('id', $pay->id)->update(['proof' => $proof]);
        }
        if ($biz && !$biz->proof_document) {
            DB::table('businesses')->where('id', $biz->id)->update(['proof_document' => $proof]);
        }
    }
}
echo "Synced proofs across businesses, subscriptions, and payments.\n";
