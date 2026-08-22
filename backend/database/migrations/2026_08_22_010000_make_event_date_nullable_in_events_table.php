<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

// Form "Buat Event Baru" di Dashboard.jsx memang mengizinkan tanggal event
// dikosongkan (validasi di EventController.php sudah 'nullable|date'), tapi
// kolom event_date di database masih NOT NULL tanpa default sejak dibuat
// pertama kali - jadi kalau tanggal dikosongkan, penyimpanan selalu gagal
// dengan error SQL "Field 'event_date' doesn't have a default value".
// Migration ini menyamakan aturan database dengan validasi backend.
//
// Pakai raw SQL (bukan ->change()) karena ->change() butuh package
// doctrine/dbal yang belum terpasang di project ini.
return new class extends Migration
{
    public function up(): void
    {
        DB::statement('ALTER TABLE events MODIFY event_date DATETIME NULL');
    }

    public function down(): void
    {
        DB::statement('ALTER TABLE events MODIFY event_date DATETIME NOT NULL');
    }
};