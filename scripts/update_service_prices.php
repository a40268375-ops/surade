<?php

require __DIR__ . '/../backend/vendor/autoload.php';

$app = require_once __DIR__ . '/../backend/bootstrap/app.php';

$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

use App\Models\CoinService;
use Illuminate\Support\Facades\DB;

echo "Updating coin_services prices to align with 1 Poin = Rp 1.000...\n";

// 1. business_premium_30 -> 35 Poin
DB::table('coin_services')->where('code', 'business_premium_30')->update(['coin_price' => 35]);

// 2. ad_package_banner -> 25 Poin
DB::table('coin_services')->where('code', 'ad_package_banner')->update(['coin_price' => 25]);

// 3. info_event_post -> 15 Poin
DB::table('coin_services')->where('code', 'info_event_post')->update(['coin_price' => 15]);

// 4. whatsapp_access_unlock -> 10 Poin
DB::table('coin_services')->where('code', 'whatsapp_access_unlock')->update(['coin_price' => 10]);

$services = DB::table('coin_services')->get();
foreach ($services as $s) {
    echo "- {$s->code} ({$s->name}): {$s->coin_price} Poin\n";
}

echo "Done updating coin_services!\n";
