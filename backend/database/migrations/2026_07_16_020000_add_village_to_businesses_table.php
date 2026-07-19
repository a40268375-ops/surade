<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('businesses', function (Blueprint $table) {
            // Desa/Kelurahan tempat bisnis ini berada (mis. "Desa Pasiripis").
            // Satu desa boleh punya banyak bisnis — ini bukan relasi 1:1,
            // cuma label pengelompokan/filter lokasi.
            $table->string('village')->nullable()->after('address');
        });
    }

    public function down(): void
    {
        Schema::table('businesses', function (Blueprint $table) {
            $table->dropColumn('village');
        });
    }
};