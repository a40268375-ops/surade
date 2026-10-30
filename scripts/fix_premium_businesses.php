<?php

require __DIR__ . '/../backend/vendor/autoload.php';

$app = require_once __DIR__ . '/../backend/bootstrap/app.php';

$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

use App\Models\Business;

echo "Checking premium businesses with non-approved status...\n";

$bizs = Business::where('is_premium', true)->where('status', '!=', 'approved')->get();

echo "Found: " . $bizs->count() . " businesses.\n";

foreach ($bizs as $b) {
    echo "Updating {$b->name} (ID: {$b->id}) from status '{$b->status}' to 'approved'...\n";
    $b->status = 'approved';
    $b->verified_at = now();
    $b->is_active = true;
    $b->save();
}

echo "Done!\n";
