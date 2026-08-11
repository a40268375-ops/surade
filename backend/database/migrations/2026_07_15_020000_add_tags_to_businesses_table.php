<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('businesses', function (Blueprint $table) {
            // Custom searchable tags/keywords for this business, e.g.
            // ["Tour Murah", "Wisata Keluarga"]. Stored separately from the
            // title so a business can have several tags of its own choosing
            // instead of the tag just always being a copy of its own name.
            $table->json('tags')->nullable()->after('closed_days');
        });
    }

    public function down(): void
    {
        Schema::table('businesses', function (Blueprint $table) {
            $table->dropColumn('tags');
        });
    }
};