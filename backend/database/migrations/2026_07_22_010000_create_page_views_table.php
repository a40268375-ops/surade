<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('page_views', function (Blueprint $table) {
            $table->id();
            // null business_id = kunjungan umum ke website (bukan ke halaman
            // bisnis tertentu), dipakai untuk grafik "Tren Pertumbuhan Platform".
            $table->foreignId('business_id')->nullable()->constrained()->nullOnDelete();
            $table->string('path')->nullable();
            $table->timestamp('created_at')->useCurrent();
            // Sengaja tanpa updated_at - baris ini tidak pernah diubah setelah dibuat.
        });

        Schema::table('page_views', function (Blueprint $table) {
            $table->index(['business_id', 'created_at']);
            $table->index('created_at');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('page_views');
    }
};