<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

// Menambahkan kolom foto sampul (cover/banner) di atas foto profil - dipakai
// di "Pengaturan Profil" (Dashboard) dan ditampilkan juga di halaman profil
// publik penjual/reseller (SellerProfile), mirip cover foto di WhatsApp.
return new class extends Migration
{
    public function up(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->string('cover_photo')->nullable()->after('avatar');
        });
    }

    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->dropColumn('cover_photo');
        });
    }
};