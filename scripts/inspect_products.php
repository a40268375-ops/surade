<?php
require __DIR__ . '/../backend/vendor/autoload.php';
$app = require_once __DIR__ . '/../backend/bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

use App\Models\Business;
use App\Models\Product;

foreach ([7, 8, 9, 10, 11] as $bizId) {
    $b = Business::find($bizId);
    echo "ID {$b->id}: {$b->name}\n";
    foreach ($b->products as $p) {
        echo "   -> {$p->name} | Img: {$p->image}\n";
    }
}
