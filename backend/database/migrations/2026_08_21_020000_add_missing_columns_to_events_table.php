<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

// Form "Buat Event Baru" di Dashboard.jsx sudah lama mengirim field
// category, status, latitude, longitude, dan gallery[] - tapi kolom-kolom
// itu ternyata belum pernah dibuat di tabel events. Makanya walau
// tampilannya sudah ada, datanya nggak pernah beneran kesimpan (bahkan
// bisa gagal total kalau ada nama kolom yang belum ada tapi coba di-insert).
return new class extends Migration
{
    public function up(): void
    {
        Schema::table('events', function (Blueprint $table) {
            $table->string('category')->nullable()->after('image');
            $table->string('status')->default('draft')->after('category');
            $table->decimal('latitude', 10, 7)->nullable()->after('location');
            $table->decimal('longitude', 10, 7)->nullable()->after('latitude');
            $table->json('gallery')->nullable()->after('image');
        });
    }

    public function down(): void
    {
        Schema::table('events', function (Blueprint $table) {
            $table->dropColumn(['category', 'status', 'latitude', 'longitude', 'gallery']);
        });
    }
};