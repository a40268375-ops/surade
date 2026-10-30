<?php
require __DIR__ . '/../backend/vendor/autoload.php';
$app = require_once __DIR__ . '/../backend/bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

use App\Models\Business;

$total = Business::count();
echo "Total businesses in DB: $total\n\n";

$businesses = Business::take(20)->get(['id','name','phone','address','logo','banner']);
foreach ($businesses as $b) {
    echo "ID:{$b->id} | {$b->name} | Phone:{$b->phone}\n";
    echo "  Address: {$b->address}\n";
    echo "  Logo: {$b->logo}\n";
    echo "  Banner: {$b->banner}\n\n";
}
