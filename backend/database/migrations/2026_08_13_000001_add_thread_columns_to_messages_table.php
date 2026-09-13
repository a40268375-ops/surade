<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

// Migrasi ini mengubah tabel "messages" yang tadinya cuma satu arah
// (pengunjung -> pemilik bisnis) menjadi mendukung percakapan dua arah
// seperti chat WhatsApp: pemilik bisnis sekarang bisa membalas dan
// pelanggan bisa melihat balasannya.
//
// - customer_id  : akun pelanggan pemilik percakapan ini (dipakai untuk
//                  mengelompokkan pesan jadi satu thread per pelanggan).
// - sender_id    : akun yang benar-benar mengirim baris pesan ini
//                  (bisa pelanggan ATAU pemilik bisnis/admin yang membalas).
// - sender_role  : 'customer' atau 'seller', dipakai front-end untuk
//                  menentukan bubble chat ada di kiri atau kanan.
return new class extends Migration
{
    public function up(): void
    {
        Schema::table('messages', function (Blueprint $table) {
            $table->foreignId('customer_id')->nullable()->after('business_id')
                ->constrained('users')->nullOnDelete();
            $table->foreignId('sender_id')->nullable()->after('customer_id')
                ->constrained('users')->nullOnDelete();
            $table->string('sender_role')->default('customer')->after('sender_id');
        });
    }

    public function down(): void
    {
        Schema::table('messages', function (Blueprint $table) {
            $table->dropConstrainedForeignId('customer_id');
            $table->dropConstrainedForeignId('sender_id');
            $table->dropColumn('sender_role');
        });
    }
};