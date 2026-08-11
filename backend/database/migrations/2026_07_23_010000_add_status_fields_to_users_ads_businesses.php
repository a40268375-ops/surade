<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->boolean('is_active')->default(true)->after('role');
        });

        Schema::table('advertisements', function (Blueprint $table) {
            // Masa tayang iklan - diisi otomatis (30 hari) saat admin approve.
            $table->timestamp('expires_at')->nullable()->after('status');
        });

        Schema::table('businesses', function (Blueprint $table) {
            // Alasan suspend, ditampilkan ke pemilik bisnis biar tahu kenapa
            // bisnisnya disuspend admin.
            $table->string('suspend_reason')->nullable()->after('status');
        });
    }

    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->dropColumn('is_active');
        });

        Schema::table('advertisements', function (Blueprint $table) {
            $table->dropColumn('expires_at');
        });

        Schema::table('businesses', function (Blueprint $table) {
            $table->dropColumn('suspend_reason');
        });
    }
};