<?php
require __DIR__ . '/../backend/vendor/autoload.php';
$app = require_once __DIR__ . '/../backend/bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

$tables = [
    'users',
    'coin_wallets',
    'coin_transactions',
    'coin_purchases',
    'coin_packages',
    'coin_services',
    'whatsapp_unlocked_contacts',
    'daily_rewards',
    'referrals',
    'referral_transactions',
    'referral_withdrawals',
    'businesses',
    'conversations',
    'messages'
];

$result = [];
foreach ($tables as $t) {
    if (Schema::hasTable($t)) {
        $result[$t] = Schema::getColumnListing($t);
    } else {
        $result[$t] = 'NOT_EXISTS';
    }
}

echo json_encode($result, JSON_PRETTY_PRINT);
