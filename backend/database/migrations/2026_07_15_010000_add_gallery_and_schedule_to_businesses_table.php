<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('businesses', function (Blueprint $table) {
            // Extra gallery photos beyond the single main "image". Stored as
            // a JSON array of storage paths, e.g. ["/storage/businesses/a.jpg", ...]
            $table->json('images')->nullable()->after('image');

            // Optional promo/profile video, just a plain URL (e.g. YouTube
            // link) rather than an uploaded file, to keep storage simple.
            $table->string('video_url')->nullable()->after('images');

            // Which days of the week this business is closed, stored as a
            // JSON array of day names in Indonesian, e.g. ["Minggu"].
            // Empty/null means open every day.
            $table->json('closed_days')->nullable()->after('operating_hours');
        });
    }

    public function down(): void
    {
        Schema::table('businesses', function (Blueprint $table) {
            $table->dropColumn(['images', 'video_url', 'closed_days']);
        });
    }
};