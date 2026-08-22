<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     *
     * Nambahin kolom buat pemilik bisnis membalas ulasan pelanggan
     * (dipakai di Dashboard > Ulasan).
     */
    public function up(): void
    {
        Schema::table('business_reviews', function (Blueprint $table) {
            $table->text('owner_reply')->nullable()->after('comment');
            $table->timestamp('owner_reply_at')->nullable()->after('owner_reply');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('business_reviews', function (Blueprint $table) {
            $table->dropColumn(['owner_reply', 'owner_reply_at']);
        });
    }
};