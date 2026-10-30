<?php
require __DIR__ . '/../backend/vendor/autoload.php';
$app = require_once __DIR__ . '/../backend/bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

use Illuminate\Support\Facades\DB;
use App\Models\User;

$cols = DB::select('DESCRIBE users');
foreach ($cols as $c) {
    echo "{$c->Field} | {$c->Type} | {$c->Null} | {$c->Default}\n";
}

$u = User::first();
if ($u) {
    echo "\nSample user: ID={$u->id}, name={$u->name}, gender=" . var_export($u->gender, true) . "\n";
}
