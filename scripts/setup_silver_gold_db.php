<?php
require __DIR__ . '/../backend/vendor/autoload.php';
$app = require_once __DIR__ . '/../backend/bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

use Illuminate\Support\Facades\Schema;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;

echo "Starting database setup for Silver/Gold, Daily Rewards, and Referral...\n";

// 1. Update coin_wallets
if (Schema::hasTable('coin_wallets')) {
    Schema::table('coin_wallets', function (Blueprint $table) {
        if (!Schema::hasColumn('coin_wallets', 'silver_balance')) {
            $table->bigInteger('silver_balance')->default(10)->after('balance');
        }
        if (!Schema::hasColumn('coin_wallets', 'gold_balance')) {
            $table->bigInteger('gold_balance')->default(0)->after('silver_balance');
        }
        if (!Schema::hasColumn('coin_wallets', 'total_silver_earned')) {
            $table->bigInteger('total_silver_earned')->default(10)->after('total_earned');
        }
        if (!Schema::hasColumn('coin_wallets', 'total_silver_spent')) {
            $table->bigInteger('total_silver_spent')->default(0)->after('total_silver_earned');
        }
        if (!Schema::hasColumn('coin_wallets', 'total_gold_earned')) {
            $table->bigInteger('total_gold_earned')->default(0)->after('total_silver_spent');
        }
        if (!Schema::hasColumn('coin_wallets', 'total_gold_spent')) {
            $table->bigInteger('total_gold_spent')->default(0)->after('total_gold_earned');
        }
    });
    echo "- Updated coin_wallets columns.\n";

    // Set initial silver_balance to 10 for users where balance is 0 or silver_balance is 0
    DB::table('coin_wallets')->where('silver_balance', 0)->update(['silver_balance' => 10, 'total_silver_earned' => 10]);
}

// 2. Update coin_transactions
if (Schema::hasTable('coin_transactions')) {
    Schema::table('coin_transactions', function (Blueprint $table) {
        if (!Schema::hasColumn('coin_transactions', 'coin_type')) {
            $table->enum('coin_type', ['silver', 'gold'])->default('silver')->after('type');
        }
    });
    echo "- Updated coin_transactions columns.\n";
}

// 3. Update coin_packages
if (Schema::hasTable('coin_packages')) {
    Schema::table('coin_packages', function (Blueprint $table) {
        if (!Schema::hasColumn('coin_packages', 'coin_type')) {
            $table->enum('coin_type', ['silver', 'gold'])->default('gold')->after('name');
        }
    });
    echo "- Updated coin_packages columns.\n";
}

// 4. Update coin_purchases
if (Schema::hasTable('coin_purchases')) {
    Schema::table('coin_purchases', function (Blueprint $table) {
        if (!Schema::hasColumn('coin_purchases', 'coin_type')) {
            $table->enum('coin_type', ['silver', 'gold'])->default('gold')->after('total_coin');
        }
    });
    echo "- Updated coin_purchases columns.\n";
}

// 5. Update whatsapp_unlocked_contacts
if (Schema::hasTable('whatsapp_unlocked_contacts')) {
    Schema::table('whatsapp_unlocked_contacts', function (Blueprint $table) {
        if (!Schema::hasColumn('whatsapp_unlocked_contacts', 'coin_type')) {
            $table->enum('coin_type', ['silver', 'gold'])->default('silver')->after('coin_cost');
        }
    });
    echo "- Updated whatsapp_unlocked_contacts columns.\n";
}

// 6. Create chat_unlocked_contacts
if (!Schema::hasTable('chat_unlocked_contacts')) {
    Schema::create('chat_unlocked_contacts', function (Blueprint $table) {
        $table->id();
        $table->foreignId('user_id')->constrained('users')->onDelete('cascade');
        $table->foreignId('business_id')->constrained('businesses')->onDelete('cascade');
        $table->integer('coin_cost')->default(4);
        $table->enum('coin_type', ['silver', 'gold'])->default('silver');
        $table->timestamp('unlocked_at')->useCurrent();
        $table->timestamps();

        $table->unique(['user_id', 'business_id']);
    });
    echo "- Created chat_unlocked_contacts table.\n";
}

// 7. Create daily_rewards table
if (!Schema::hasTable('daily_rewards')) {
    Schema::create('daily_rewards', function (Blueprint $table) {
        $table->id();
        $table->foreignId('user_id')->constrained('users')->onDelete('cascade');
        $table->date('reward_date');
        $table->tinyInteger('day_of_week'); // 1 = Senin, ..., 7 = Minggu
        $table->integer('streak_count')->default(1);
        $table->integer('points_rewarded')->default(1);
        $table->timestamp('claimed_at')->useCurrent();
        $table->timestamps();

        $table->unique(['user_id', 'reward_date']);
    });
    echo "- Created daily_rewards table.\n";
}

// 8. Create gold_withdrawals table if not exists
if (!Schema::hasTable('gold_withdrawals')) {
    Schema::create('gold_withdrawals', function (Blueprint $table) {
        $table->id();
        $table->foreignId('user_id')->constrained('users')->onDelete('cascade');
        $table->integer('gold_amount');
        $table->decimal('idr_amount', 12, 2);
        $table->string('payment_method')->default('bank_transfer'); // bank_transfer, ewallet
        $table->string('bank_name');
        $table->string('account_number');
        $table->string('account_name');
        $table->enum('status', ['pending', 'approved', 'paid', 'rejected'])->default('pending');
        $table->text('admin_notes')->nullable();
        $table->timestamp('processed_at')->nullable();
        $table->timestamps();
    });
    echo "- Created gold_withdrawals table.\n";
}

// 9. Update users referral columns if needed
if (Schema::hasTable('users')) {
    Schema::table('users', function (Blueprint $table) {
        if (!Schema::hasColumn('users', 'referral_code')) {
            $table->string('referral_code', 50)->nullable()->unique()->after('account_type');
        }
        if (!Schema::hasColumn('users', 'referred_by')) {
            $table->foreignId('referred_by')->nullable()->after('referral_code')->constrained('users')->onDelete('set null');
        }
    });
    echo "- Checked users referral columns.\n";
}

// 10. Update referral_transactions if needed
if (Schema::hasTable('referral_transactions')) {
    Schema::table('referral_transactions', function (Blueprint $table) {
        if (!Schema::hasColumn('referral_transactions', 'service_type')) {
            $table->string('service_type')->default('premium')->after('referral_code'); // premium, coin, advertisement, blog
        }
    });
    echo "- Checked referral_transactions columns.\n";
}

// 11. Seed Packages for Silver & Gold if not set
// Check if we have packages for silver and gold
$silverPackagesCount = DB::table('coin_packages')->where('coin_type', 'silver')->count();
if ($silverPackagesCount === 0) {
    DB::table('coin_packages')->insert([
        [
            'name' => 'Paket Silver Hemat 10',
            'coin_type' => 'silver',
            'coin_amount' => 10,
            'bonus_coin' => 0,
            'price_idr' => 5000,
            'badge_label' => 'SILVER',
            'is_popular' => false,
            'is_active' => true,
            'sort_order' => 1,
            'created_at' => now(),
            'updated_at' => now(),
        ],
        [
            'name' => 'Paket Silver Komplit 50',
            'coin_type' => 'silver',
            'coin_amount' => 50,
            'bonus_coin' => 5,
            'price_idr' => 20000,
            'badge_label' => '+5 BONUS',
            'is_popular' => true,
            'is_active' => true,
            'sort_order' => 2,
            'created_at' => now(),
            'updated_at' => now(),
        ],
        [
            'name' => 'Paket Silver Super 100',
            'coin_type' => 'silver',
            'coin_amount' => 100,
            'bonus_coin' => 15,
            'price_idr' => 35000,
            'badge_label' => '+15 BONUS',
            'is_popular' => false,
            'is_active' => true,
            'sort_order' => 3,
            'created_at' => now(),
            'updated_at' => now(),
        ],
    ]);
    echo "- Seeded default Silver packages.\n";
}

$goldPackagesCount = DB::table('coin_packages')->where('coin_type', 'gold')->count();
if ($goldPackagesCount === 0) {
    DB::table('coin_packages')->insert([
        [
            'name' => 'Paket Gold Basic 10',
            'coin_type' => 'gold',
            'coin_amount' => 10,
            'bonus_coin' => 0,
            'price_idr' => 10000,
            'badge_label' => 'GOLD',
            'is_popular' => false,
            'is_active' => true,
            'sort_order' => 11,
            'created_at' => now(),
            'updated_at' => now(),
        ],
        [
            'name' => 'Paket Gold Pro 50',
            'coin_type' => 'gold',
            'coin_amount' => 50,
            'bonus_coin' => 5,
            'price_idr' => 45000,
            'badge_label' => '+5 BONUS',
            'is_popular' => true,
            'is_active' => true,
            'sort_order' => 12,
            'created_at' => now(),
            'updated_at' => now(),
        ],
        [
            'name' => 'Paket Gold Sultan 100',
            'coin_type' => 'gold',
            'coin_amount' => 100,
            'bonus_coin' => 15,
            'price_idr' => 85000,
            'badge_label' => '+15 BONUS',
            'is_popular' => false,
            'is_active' => true,
            'sort_order' => 13,
            'created_at' => now(),
            'updated_at' => now(),
        ],
    ]);
    echo "- Seeded default Gold packages.\n";
}

echo "Setup completed successfully!\n";
