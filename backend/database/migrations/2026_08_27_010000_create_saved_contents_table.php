<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

// Tabel simpanan/favorit untuk konten Blog & Event. Dipisah dari
// 'saved_businesses' (yang khusus bisnis) karena blog & event bukan
// bisnis - jadi butuh kolom 'content_type' untuk membedakan mana yang
// blog dan mana yang event, plus 'content_id' merujuk ke id di tabel
// blogs atau events sesuai tipenya.
return new class extends Migration
{
    public function up(): void
    {
        Schema::create('saved_contents', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->onDelete('cascade');
            $table->enum('content_type', ['blog', 'event']);
            $table->unsignedBigInteger('content_id');
            $table->timestamps();
            $table->unique(['user_id', 'content_type', 'content_id']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('saved_contents');
    }
};