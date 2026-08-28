<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * PERBAIKAN: form "Pasang Iklan Baru" di Dashboard belum bisa upload
     * foto sama sekali karena tabel advertisements memang belum punya
     * kolom untuk menyimpan path gambarnya.
     */
    public function up(): void
    {
        Schema::table('advertisements', function (Blueprint $table) {
            $table->string('image')->nullable()->after('website');
        });
    }

    public function down(): void
    {
        Schema::table('advertisements', function (Blueprint $table) {
            $table->dropColumn('image');
        });
    }
};