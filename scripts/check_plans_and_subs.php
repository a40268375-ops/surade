<?php
require __DIR__ . '/../backend/vendor/autoload.php';
$app = require_once __DIR__ . '/../backend/bootstrap/app.php';
$app->make(Illuminate\Contracts\Console\Kernel::class)->bootstrap();

use App\Models\Plan;
use App\Models\Subscription;
use App\Models\Payment;
use App\Models\Business;

echo "--- PLANS ---\n";
$plans = Plan::all();
foreach ($plans as $p) {
    echo "ID: {$p->id} | Name: {$p->name} | Price: {$p->price} | Duration: {$p->duration_days} days\n";
}

echo "\n--- RECENT SUBSCRIPTIONS ---\n";
$subs = Subscription::with('payment', 'plan', 'business')->latest()->limit(5)->get();
foreach ($subs as $s) {
    echo "Sub ID: {$s->id} | Biz: {$s->business?->name} (ID: {$s->business_id}) | Plan: {$s->plan?->name} | Price: {$s->price} | Final: {$s->final_price} | Status: {$s->status} | Proof: {$s->payment?->proof}\n";
}

echo "\n--- RECENT PAYMENTS ---\n";
$payments = Payment::latest()->limit(5)->get();
foreach ($payments as $pay) {
    echo "Pay ID: {$pay->id} | Sub ID: {$pay->subscription_id} | Amount: {$pay->amount} | Method: {$pay->payment_method} | Status: {$pay->status} | Proof: {$pay->proof}\n";
}

echo "\n--- RECENT BUSINESSES PROOFS ---\n";
$bizs = Business::whereNotNull('proof_document')->orWhereNotNull('is_premium')->latest()->limit(5)->get();
foreach ($bizs as $b) {
    echo "Biz ID: {$b->id} | Name: {$b->name} | ProofDoc: {$b->proof_document} | is_premium: {$b->is_premium} | is_verified: {$b->is_verified}\n";
}
