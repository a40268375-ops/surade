<?php
require 'c:/laragon/www/Surade/backend/vendor/autoload.php';
$app = require_once 'c:/laragon/www/Surade/backend/bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

$users = \App\Models\User::all();
$updated = 0;

foreach ($users as $u) {
    $words = preg_split('/\s+/', trim($u->name ?: ''));
    $firstName = !empty($words[0]) ? $words[0] : 'USER';
    $cleanFirstName = strtoupper(preg_replace('/[^A-Za-z0-9]/', '', $firstName));
    if (empty($cleanFirstName)) {
        $cleanFirstName = 'USER';
    }

    $rawCode = $u->getRawOriginal('referral_code');
    if (empty($rawCode)) {
        $newCode = "SURADE-{$cleanFirstName}-{$u->id}";
        \Illuminate\Support\Facades\DB::table('users')->where('id', $u->id)->update(['referral_code' => $newCode]);
        echo "Updated User ID {$u->id} null code -> {$newCode}\n";
        $updated++;
    } else if (str_starts_with(strtoupper($rawCode), 'INFO-')) {
        $parts = explode('-', $rawCode);
        $suffix = count($parts) > 2 ? end($parts) : $u->id;
        $newCode = "SURADE-{$cleanFirstName}-{$suffix}";
        \Illuminate\Support\Facades\DB::table('users')->where('id', $u->id)->update(['referral_code' => $newCode]);
        echo "Updated User ID {$u->id} '{$rawCode}' -> '{$newCode}'\n";
        $updated++;
    } else if (str_starts_with(strtoupper($rawCode), 'SURADE-')) {
        $parts = explode('-', $rawCode);
        if (count($parts) >= 3) {
            $suffix = end($parts);
            $newCode = "SURADE-{$cleanFirstName}-{$suffix}";
            if ($newCode !== strtoupper($rawCode)) {
                \Illuminate\Support\Facades\DB::table('users')->where('id', $u->id)->update(['referral_code' => $newCode]);
                echo "Sanitized User ID {$u->id} '{$rawCode}' -> '{$newCode}'\n";
                $updated++;
            }
        }
    }
}

echo "Finished updating {$updated} user referral codes.\n";
