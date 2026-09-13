<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

// Menambahkan kolom-kolom baru yang dipakai form "Buat Blog Baru" versi baru:
// - excerpt: ringkasan singkat blog
// - status: draft / published
// - banners, gallery: disimpan sebagai JSON array path gambar (banner maks 4,
//   galeri bebas jumlahnya) - dibuat kolom JSON biasa (bukan tabel relasi
//   terpisah) supaya tetap ringan buat kebutuhan saat ini.
return new class extends Migration
{
    public function up(): void
    {
        Schema::table('blogs', function (Blueprint $table) {
            $table->text('excerpt')->nullable()->after('content');
            $table->string('status')->default('draft')->after('category');
            $table->json('banners')->nullable()->after('image');
            $table->json('gallery')->nullable()->after('banners');
        });
    }

    public function down(): void
    {
        Schema::table('blogs', function (Blueprint $table) {
            $table->dropColumn(['excerpt', 'status', 'banners', 'gallery']);
        });
    }
};