<?php

require __DIR__ . '/../backend/vendor/autoload.php';
$app = require_once __DIR__ . '/../backend/bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

use App\Models\User;
use App\Models\CoinWallet;
use Illuminate\Support\Facades\Hash;

echo "--- PROCESSING USER UPDATES & CREATION ---\n";

// 1. Update / Setup Admin
$admin = User::where('role', 'admin')->first();
if (!$admin) {
    $admin = User::where('email', 'admin@surade.com')->first();
}
if ($admin) {
    $admin->email = 'admin@surade.com';
    $admin->password = Hash::make('Admin123');
    $admin->role = 'admin';
    $admin->email_verified_at = $admin->email_verified_at ?? now();
    $admin->is_active = true;
    $admin->save();
    echo "[OK] Admin updated: ID {$admin->id} | {$admin->name} | Email: {$admin->email} | Password: Admin123\n";
} else {
    $admin = User::create([
        'name' => 'Admin Surade',
        'email' => 'admin@surade.com',
        'password' => Hash::make('Admin123'),
        'role' => 'admin',
        'account_type' => 'personal',
        'email_verified_at' => now(),
        'is_active' => true,
    ]);
    echo "[OK] Admin created: ID {$admin->id} | {$admin->name} | Email: {$admin->email} | Password: Admin123\n";
}

// 2. Update Reseller (user@surade.com -> reseller@surade.com)
$reseller = User::where('email', 'user@surade.com')->first();
if (!$reseller) {
    $reseller = User::where('email', 'reseller@surade.com')->first();
}
if (!$reseller) {
    $reseller = User::where('role', 'reseller')->first();
}

if ($reseller) {
    $reseller->email = 'reseller@surade.com';
    $reseller->name = 'Reseller';
    $reseller->password = Hash::make('Reseller123');
    $reseller->role = 'reseller';
    $reseller->email_verified_at = $reseller->email_verified_at ?? now();
    $reseller->is_active = true;
    $reseller->save();
    echo "[OK] Reseller updated: ID {$reseller->id} | {$reseller->name} | Email: {$reseller->email} | Password: Reseller123\n";
} else {
    $reseller = User::create([
        'name' => 'Reseller',
        'email' => 'reseller@surade.com',
        'password' => Hash::make('Reseller123'),
        'role' => 'reseller',
        'account_type' => 'personal',
        'email_verified_at' => now(),
        'is_active' => true,
    ]);
    echo "[OK] Reseller created: ID {$reseller->id} | {$reseller->name} | Email: {$reseller->email} | Password: Reseller123\n";
}

// Ensure Reseller has wallet
CoinWallet::getOrCreate($reseller->id);

// 3. Create / Update User Biasa (user@gmail.com / User123)
$normalUser = User::where('email', 'user@gmail.com')->first();
if ($normalUser) {
    $normalUser->name = 'User Biasa';
    $normalUser->password = Hash::make('User123');
    $normalUser->role = 'user';
    $normalUser->account_type = 'personal';
    $normalUser->email_verified_at = $normalUser->email_verified_at ?? now();
    $normalUser->is_active = true;
    $normalUser->save();
    echo "[OK] User Biasa updated: ID {$normalUser->id} | {$normalUser->name} | Email: {$normalUser->email} | Password: User123\n";
} else {
    $normalUser = User::create([
        'name' => 'User Biasa',
        'email' => 'user@gmail.com',
        'password' => Hash::make('User123'),
        'role' => 'user',
        'account_type' => 'personal',
        'email_verified_at' => now(),
        'is_active' => true,
    ]);
    echo "[OK] User Biasa created: ID {$normalUser->id} | {$normalUser->name} | Email: {$normalUser->email} | Password: User123\n";
}

// Ensure normal user has wallet with welcome bonus
$wallet = CoinWallet::firstOrCreate(
    ['user_id' => $normalUser->id],
    [
        'balance' => 10,
        'total_earned' => 10,
        'total_spent' => 0,
    ]
);
echo "[OK] Normal user coin wallet ready: Balance {$wallet->balance} coins\n";

echo "\n=== VERIFYING CREDENTIALS ===\n";
$tests = [
    ['user@gmail.com', 'User123'],
    ['reseller@surade.com', 'Reseller123'],
    ['admin@surade.com', 'Admin123'],
];
foreach ($tests as $t) {
    $u = User::where('email', $t[0])->first();
    $matches = $u && Hash::check($t[1], $u->password);
    echo "Login {$t[0]} with '{$t[1]}': " . ($matches ? "VALIDATED (OK)" : "FAILED") . "\n";
}

