<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     *
     * 1) Hapus unique constraint (seller_id, reviewer_id) di seller_reviews -
     *    sebelumnya ini yang bikin satu user cuma bisa kasih SATU ulasan
     *    untuk seller yang sama. Sekarang dihapus supaya user bisa kasih
     *    ulasan berkali-kali, sama seperti business_reviews yang memang
     *    dari awal tidak dibatasi.
     *
     *    CATATAN PENTING: index unique (seller_id, reviewer_id) itu dipakai
     *    MySQL sebagai "penyangga" foreign key seller_id -> users.id. Kalau
     *    langsung di-drop, MySQL menolak dengan error 1553 ("needed in a
     *    foreign key constraint"). Makanya kita tambah index BIASA dulu di
     *    kolom seller_id supaya FK punya penyangga baru, baru index unique-
     *    nya aman dihapus.
     * 2) Tambah kolom helpful_count di kedua tabel review (business &
     *    seller) buat fitur "X orang menganggap ulasan ini berguna".
     * 3) Bikin tabel review_helpful_votes buat mencatat SIAPA saja yang
     *    sudah like/berguna-in ulasan tertentu (biar 1 orang cuma bisa
     *    like 1x per ulasan, dan bisa di-toggle balik).
     */
    public function up(): void
    {
        // Langkah 1: index biasa dulu sebagai penyangga baru buat FK seller_id
        Schema::table('seller_reviews', function (Blueprint $table) {
            $table->index('seller_id', 'seller_reviews_seller_id_index');
        });

        // Langkah 2: baru sekarang unique index-nya aman dihapus
        Schema::table('seller_reviews', function (Blueprint $table) {
            $table->dropUnique(['seller_id', 'reviewer_id']);
        });

        Schema::table('seller_reviews', function (Blueprint $table) {
            $table->unsignedInteger('helpful_count')->default(0)->after('comment');
        });

        Schema::table('business_reviews', function (Blueprint $table) {
            $table->unsignedInteger('helpful_count')->default(0)->after('comment');
        });

        Schema::create('review_helpful_votes', function (Blueprint $table) {
            $table->id();
            // 'business' atau 'seller' - menunjuk ulasan jenis apa yang di-like
            $table->string('review_type');
            $table->unsignedBigInteger('review_id');
            $table->foreignId('user_id')->constrained()->onDelete('cascade');
            $table->timestamps();

            $table->unique(['review_type', 'review_id', 'user_id']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('review_helpful_votes');

        Schema::table('business_reviews', function (Blueprint $table) {
            $table->dropColumn('helpful_count');
        });

        Schema::table('seller_reviews', function (Blueprint $table) {
            $table->dropColumn('helpful_count');
        });

        Schema::table('seller_reviews', function (Blueprint $table) {
            $table->unique(['seller_id', 'reviewer_id']);
        });

        Schema::table('seller_reviews', function (Blueprint $table) {
            $table->dropIndex('seller_reviews_seller_id_index');
        });
    }
};