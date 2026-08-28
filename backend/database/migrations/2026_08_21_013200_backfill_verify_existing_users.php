<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

/**
 * Backfill: tandai semua akun yang SUDAH ADA sebelum migration ini sebagai
 * "sudah terverifikasi" (email_verified_at diisi), supaya mereka tidak
 * mendadak diminta OTP saat login gara-gara sistem OTP baru ditambahkan
 * belakangan. Akun BARU yang mendaftar setelah ini tetap wajib OTP seperti
 * biasa — migration ini cuma jalan sekali untuk akun lama.
 */
return new class extends Migration
{
    public function up(): void
    {
        DB::table('users')
            ->whereNull('email_verified_at')
            ->update(['email_verified_at' => now()]);
    }

    public function down(): void
    {
        // Sengaja tidak dikembalikan (tidak ada cara aman untuk tahu akun
        // mana yang sebelumnya null vs yang memang baru saja diverifikasi
        // asli lewat OTP), jadi rollback migration ini tidak melakukan apa-apa.
    }
};