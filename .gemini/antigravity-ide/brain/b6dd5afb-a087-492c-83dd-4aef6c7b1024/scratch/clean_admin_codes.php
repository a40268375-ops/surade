<?php
require 'c:/laragon/www/Surade/backend/vendor/autoload.php';
$app = require_once 'c:/laragon/www/Surade/backend/bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

$count = \Illuminate\Support\Facades\DB::table('users')
    ->where('role', 'admin')
    ->update(['referral_code' => null]);

echo "Cleaned referral codes for {$count} admin users.\n";
