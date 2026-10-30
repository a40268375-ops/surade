<?php
require 'c:/laragon/www/Surade/backend/vendor/autoload.php';
$app = require_once 'c:/laragon/www/Surade/backend/bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

$users = \App\Models\User::all();
echo "Total users: " . $users->count() . "\n";
foreach ($users as $u) {
    echo "ID: {$u->id} | Name: {$u->name} | Email: {$u->email} | DB Code: " . $u->getRawOriginal('referral_code') . " | Accessor Code: {$u->referral_code}\n";
}
