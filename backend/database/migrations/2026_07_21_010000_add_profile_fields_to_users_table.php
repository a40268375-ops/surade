<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

// Menambahkan kolom yang dipakai oleh form "Pengaturan Profil" di Dashboard:
// nomor HP, bio (Tentang Saya - disimpan sebagai HTML dari rich text editor),
// dan foto profil (avatar). Sebelumnya kolom-kolom ini tidak ada sama sekali
// di tabel users, jadi form profil gagal tersimpan walau tampak "berhasil".
return new class extends Migration
{
    public function up(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->string('phone')->nullable()->after('email');
            $table->text('bio')->nullable()->after('phone');
            $table->string('avatar')->nullable()->after('bio');
        });
    }

    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->dropColumn(['phone', 'bio', 'avatar']);
        });
    }
};