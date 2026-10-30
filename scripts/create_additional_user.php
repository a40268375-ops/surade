<?php

require __DIR__ . '/../backend/vendor/autoload.php';
$app = require_once __DIR__ . '/../backend/bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

use App\Models\User;
use App\Models\CoinWallet;
use Illuminate\Support\Facades\Hash;

echo "--- CREATING USER SURADE ---\n";

// Create user@surade.com if not exists
$userSurade = User::where('email', 'user@surade.com')->first();
if (!$userSurade) {
    $userSurade = User::create([
        'name' => 'Pengguna Surade',
        'email' => 'user@surade.com',
        'password' => Hash::make('User123'),
        'role' => 'user',
        'account_type' => 'personal',
        'email_verified_at' => now(),
        'is_active' => true,
    ]);
    echo "[OK] Created user@surade.com with Password: User123 (ID: {$userSurade->id})\n";
} else {
    $userSurade->password = Hash::make('User123');
    $userSurade->role = 'user';
    $userSurade->is_active = true;
    $userSurade->save();
    echo "[OK] Updated user@surade.com with Password: User123\n";
}

// Ensure coin wallet
$wallet = CoinWallet::firstOrCreate(
    ['user_id' => $userSurade->id],
    [
        'balance' => 50,
        'total_earned' => 50,
        'total_spent' => 0,
    ]
);
// Make sure wallet has enough coins to test
if ($wallet->balance < 50) {
    $wallet->balance = 50;
    $wallet->save();
}
echo "[OK] Wallet ready with {$wallet->balance} coins\n";

// Also ensure user@gmail.com has 50 coins to easily test
$userGmail = User::where('email', 'user@gmail.com')->first();
if ($userGmail) {
    $wGmail = CoinWallet::firstOrCreate(['user_id' => $userGmail->id], ['balance' => 50, 'total_earned' => 50, 'total_spent' => 0]);
    if ($wGmail->balance < 50) {
        $wGmail->balance = 50;
        $wGmail->save();
    }
}

echo "\n=== VERIFYING ALL LOGINS ===\n";
$tests = [
    ['user@surade.com', 'User123'],
    ['user@gmail.com', 'User123'],
    ['reseller@surade.com', 'Reseller123'],
    ['admin@surade.com', 'Admin123'],
];
foreach ($tests as $t) {
    $u = User::where('email', $t[0])->first();
    $ok = $u && Hash::check($t[1], $u->password);
    echo "Login {$t[0]} ({$t[1]}): " . ($ok ? "BERHASIL (OK)" : "GAGAL") . "\n";
}

