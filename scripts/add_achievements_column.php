<?php
require __DIR__ . '/../backend/vendor/autoload.php';
$app = require_once __DIR__ . '/../backend/bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

use Illuminate\Support\Facades\Schema;
use Illuminate\Database\Schema\Blueprint;

if (!Schema::hasColumn('businesses', 'achievements')) {
    Schema::table('businesses', function (Blueprint $table) {
        $table->text('achievements')->nullable()->after('description');
    });
    echo "Column 'achievements' added successfully to businesses table.\n";
} else {
    echo "Column 'achievements' already exists.\n";
}
