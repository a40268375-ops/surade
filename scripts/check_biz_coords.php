<?php
require __DIR__ . '/../backend/vendor/autoload.php';
$app = require_once __DIR__ . '/../backend/bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

$businesses = \App\Models\Business::select('id', 'name', 'address', 'latitude', 'longitude')->get();
foreach ($businesses as $b) {
    echo "ID: {$b->id} | {$b->name} | Lat: {$b->latitude} | Lng: {$b->longitude} | Addr: {$b->address}\n";
}
