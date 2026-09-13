<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     *
     * Kupon diskon tingkat platform (dikelola admin), dipakai saat user
     * checkout Paket Premium atau Paket Iklan. Beda dari tabel `coupons`
     * yang isinya kupon milik masing-masing bisnis untuk pelanggannya.
     */
    public function up(): void
    {
        Schema::create('platform_coupons', function (Blueprint $table) {
            $table->id();
            $table->string('code')->unique();
            $table->string('name')->nullable(); // "Nama / Deskripsi" singkat
            $table->enum('discount_type', ['percentage', 'fixed'])->default('percentage');
            $table->unsignedInteger('discount_value');
            $table->enum('applies_to', ['semua', 'premium', 'iklan'])->default('semua');
            $table->unsignedBigInteger('min_purchase')->nullable(); // minimum transaksi (Rp)
            $table->unsignedInteger('max_uses')->nullable(); // null = tak terbatas
            $table->unsignedInteger('used_count')->default(0);
            $table->date('expires_at')->nullable(); // null = selamanya
            $table->boolean('is_active')->default(true);
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('platform_coupons');
    }
};