<?php

require __DIR__ . '/../backend/vendor/autoload.php';

$app = require_once __DIR__ . '/../backend/bootstrap/app.php';

$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;
use App\Models\CoinPackage;
use App\Models\CoinService;
use App\Models\CoinWallet;
use App\Models\CoinTransaction;
use App\Models\User;

echo "=== Updating Poin System Database Records ===\n";

try {
    // 1. Reset and insert the 6 official Poin Packages requested by user
    // Packages: 10 (11k), 25 (26k), 50 (51k), 100 (101k), 250 (251k), 425 (426k)
    DB::table('coin_packages')->delete();

    $packages = [
        [
            'name' => 'Paket 10 Poin',
            'coin_amount' => 10,
            'bonus_coin' => 0,
            'price_idr' => 11000,
            'badge_label' => 'STARTER',
            'is_popular' => false,
            'is_active' => true,
            'sort_order' => 1,
            'created_at' => now(),
            'updated_at' => now(),
        ],
        [
            'name' => 'Paket 25 Poin',
            'coin_amount' => 25,
            'bonus_coin' => 0,
            'price_idr' => 26000,
            'badge_label' => 'HEMAT',
            'is_popular' => false,
            'is_active' => true,
            'sort_order' => 2,
            'created_at' => now(),
            'updated_at' => now(),
        ],
        [
            'name' => 'Paket 50 Poin',
            'coin_amount' => 50,
            'bonus_coin' => 0,
            'price_idr' => 51000,
            'badge_label' => 'POPULER',
            'is_popular' => true,
            'is_active' => true,
            'sort_order' => 3,
            'created_at' => now(),
            'updated_at' => now(),
        ],
        [
            'name' => 'Paket 100 Poin',
            'coin_amount' => 100,
            'bonus_coin' => 0,
            'price_idr' => 101000,
            'badge_label' => 'BEST VALUE',
            'is_popular' => false,
            'is_active' => true,
            'sort_order' => 4,
            'created_at' => now(),
            'updated_at' => now(),
        ],
        [
            'name' => 'Paket 250 Poin',
            'coin_amount' => 250,
            'bonus_coin' => 0,
            'price_idr' => 251000,
            'badge_label' => 'BISNIS',
            'is_popular' => false,
            'is_active' => true,
            'sort_order' => 5,
            'created_at' => now(),
            'updated_at' => now(),
        ],
        [
            'name' => 'Paket 425 Poin',
            'coin_amount' => 425,
            'bonus_coin' => 0,
            'price_idr' => 426000,
            'badge_label' => 'SUPER VALUE',
            'is_popular' => false,
            'is_active' => true,
            'sort_order' => 6,
            'created_at' => now(),
            'updated_at' => now(),
        ],
    ];

    DB::table('coin_packages')->insert($packages);
    echo "Inserted 6 official Poin Packages successfully!\n";

    // 2. Update Coin Services to match Poin values
    DB::table('coin_services')->delete();
    $services = [
        [
            'code' => 'business_premium_30',
            'name' => 'Bisnis Premium 30 Hari',
            'category' => 'premium',
            'coin_price' => 50,
            'duration_days' => 30,
            'description' => 'Tingkatkan profil bisnis menjadi Premium selama 30 hari dengan badge emas, prioritas pencarian, dan fitur lengkap.',
            'is_active' => true,
            'sort_order' => 1,
            'created_at' => now(),
            'updated_at' => now(),
        ],
        [
            'code' => 'business_premium_90',
            'name' => 'Bisnis Premium 90 Hari',
            'category' => 'premium',
            'coin_price' => 100,
            'duration_days' => 90,
            'description' => 'Paket hemat Bisnis Premium 3 bulan penuh untuk visibilitas maksimal di Surade.com.',
            'is_active' => true,
            'sort_order' => 2,
            'created_at' => now(),
            'updated_at' => now(),
        ],
        [
            'code' => 'business_premium_365',
            'name' => 'Bisnis Premium 1 Tahun',
            'category' => 'premium',
            'coin_price' => 250,
            'duration_days' => 365,
            'description' => 'Paket tahunan Bisnis Premium 365 hari dengan dukungan promosi prioritas tanpa henti.',
            'is_active' => true,
            'sort_order' => 3,
            'created_at' => now(),
            'updated_at' => now(),
        ],
        [
            'code' => 'ad_package_banner',
            'name' => 'Pasang Iklan Banner Promosi',
            'category' => 'advertisement',
            'coin_price' => 50,
            'duration_days' => 30,
            'description' => 'Penayangan iklan banner bisnis di posisi strategis beranda dan halaman kategori Surade.com.',
            'is_active' => true,
            'sort_order' => 4,
            'created_at' => now(),
            'updated_at' => now(),
        ],
        [
            'code' => 'info_event_post',
            'name' => 'Publikasi Info & Event (1 Tahun)',
            'category' => 'event',
            'coin_price' => 25,
            'duration_days' => 365,
            'description' => 'Publikasi artikel liputan, berita info warga, atau jadwal event aktif selama 1 tahun di Surade.com.',
            'is_active' => true,
            'sort_order' => 5,
            'created_at' => now(),
            'updated_at' => now(),
        ],
        [
            'code' => 'info_event_featured',
            'name' => 'Promosi Featured Info & Event',
            'category' => 'event',
            'coin_price' => 10,
            'duration_days' => 30,
            'description' => 'Tampilkan artikel Info atau Event di baris teratas / rekomendasi selama 30 hari.',
            'is_active' => true,
            'sort_order' => 6,
            'created_at' => now(),
            'updated_at' => now(),
        ],
        [
            'code' => 'whatsapp_access_unlock',
            'name' => 'Buka Akses WhatsApp Penjual',
            'category' => 'contact',
            'coin_price' => 10,
            'duration_days' => null,
            'description' => 'Buka akses nomor kontak WhatsApp bisnis/penjual secara instan dan permanen.',
            'is_active' => true,
            'sort_order' => 7,
            'created_at' => now(),
            'updated_at' => now(),
        ],
    ];
    DB::table('coin_services')->insert($services);
    echo "Inserted official Poin Services successfully!\n";

    // 3. Give 10 Free Poin to all users whose wallet balance is 0 or uninitialized
    $users = User::all();
    $bonusCount = 0;
    foreach ($users as $u) {
        $wallet = CoinWallet::where('user_id', $u->id)->first();
        if (!$wallet) {
            $wallet = CoinWallet::create([
                'user_id' => $u->id,
                'balance' => 10,
                'total_earned' => 10,
                'total_spent' => 0,
            ]);
            CoinTransaction::create([
                'transaction_number' => 'CTX-BONUS-' . date('Ymd') . '-' . strtoupper(\Illuminate\Support\Str::random(6)),
                'user_id' => $u->id,
                'type' => 'credit',
                'amount' => 10,
                'balance_before' => 0,
                'balance_after' => 10,
                'service_code' => 'welcome_bonus',
                'service_name' => 'Bonus Registrasi (+10 Poin)',
                'description' => 'Bonus 10 Poin gratis selamat datang pengguna baru Surade.com',
                'status' => 'success',
            ]);
            $bonusCount++;
        } elseif ($wallet->balance == 0 && $wallet->total_earned == 0) {
            $wallet->balance = 10;
            $wallet->total_earned = 10;
            $wallet->save();
            CoinTransaction::create([
                'transaction_number' => 'CTX-BONUS-' . date('Ymd') . '-' . strtoupper(\Illuminate\Support\Str::random(6)),
                'user_id' => $u->id,
                'type' => 'credit',
                'amount' => 10,
                'balance_before' => 0,
                'balance_after' => 10,
                'service_code' => 'welcome_bonus',
                'service_name' => 'Bonus Registrasi (+10 Poin)',
                'description' => 'Bonus 10 Poin gratis selamat datang pengguna baru Surade.com',
                'status' => 'success',
            ]);
            $bonusCount++;
        }
    }
    echo "Granted 10 free Poin bonus to {$bonusCount} users!\n";

} catch (\Throwable $e) {
    echo "Error updating poin database: " . $e->getMessage() . "\n";
}
