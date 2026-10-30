<?php

require __DIR__ . '/../backend/vendor/autoload.php';
$app = require_once __DIR__ . '/../backend/bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

use App\Models\User;
use App\Models\Business;

echo "=== USER BUSINESS CHECK ===\n";
$users = User::all();
foreach ($users as $u) {
    $bizCount = Business::where('user_id', $u->id)->count();
    echo "ID: {$u->id} | {$u->name} ({$u->email}) | Role: {$u->role} | Type: {$u->account_type} | Punya Usaha: {$bizCount}\n";
}
