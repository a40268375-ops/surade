<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     *
     * Hapus unique constraint (business_id, reviewer_id) di business_reviews —
     * sebelumnya constraint ini tidak sengaja ada di database meskipun
     * migration create_business_reviews_table sudah didesain tanpa unique.
     * Dengan dihapus, user bisa ngasih ulasan berkali-kali untuk bisnis
     * yang sama (misal: kunjungan kedua, rating dan komentar baru).
     *
     * CATATAN PENTING: index unique (business_id, reviewer_id) itu dipakai
     * MySQL sebagai "penyangga" foreign key business_id -> businesses.id.
     * Kalau langsung di-drop, MySQL menolak dengan error 1553 ("needed in a
     * foreign key constraint"). Makanya kita tambah index BIASA dulu di
     * kolom business_id supaya FK punya penyangga baru, baru index unique-
     * nya aman dihapus.
     */
    public function up(): void
    {
        // Langkah 1: index biasa sebagai penyangga baru FK business_id
        Schema::table('business_reviews', function (Blueprint $table) {
            if (!Schema::hasIndex('business_reviews', 'business_reviews_business_id_index')) {
                $table->index('business_id', 'business_reviews_business_id_index');
            }
        });

        // Langkah 2: baru unique index-nya aman dihapus (jika ada)
        Schema::table('business_reviews', function (Blueprint $table) {
            if (Schema::hasIndex('business_reviews', 'business_reviews_business_id_reviewer_id_unique')) {
                $table->dropUnique('business_reviews_business_id_reviewer_id_unique');
            }
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('business_reviews', function (Blueprint $table) {
            $table->unique(['business_id', 'reviewer_id'], 'business_reviews_business_id_reviewer_id_unique');
        });

        Schema::table('business_reviews', function (Blueprint $table) {
            $table->dropIndex('business_reviews_business_id_index');
        });
    }
};

