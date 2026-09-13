<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     *
     * Tabel buat menyimpan laporan pelanggaran/kesalahan pada sebuah
     * bisnis, yang dikirim pelanggan lewat tombol "Laporkan" di halaman
     * detail bisnis. Admin bisa menindaklanjutinya lewat Dashboard >
     * Laporan Report.
     */
    public function up(): void
    {
        Schema::create('business_reports', function (Blueprint $table) {
            $table->id();
            $table->foreignId('business_id')->constrained('businesses')->onDelete('cascade');
            $table->foreignId('reporter_id')->nullable()->constrained('users')->onDelete('set null');
            $table->string('reporter_name')->nullable();
            $table->string('reason'); // mis. "Informasi Palsu / Penipuan", "Konten Tidak Pantas", dll.
            $table->text('description')->nullable();
            $table->enum('status', ['baru', 'diproses', 'selesai', 'ditolak'])->default('baru');
            $table->text('admin_note')->nullable();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('business_reports');
    }
};