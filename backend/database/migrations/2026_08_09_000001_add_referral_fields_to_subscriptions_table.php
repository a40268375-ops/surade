<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::table('subscriptions', function (Blueprint $table) {
            $table->decimal('original_amount', 10, 2)->nullable()->after('amount');
            $table->decimal('discount_amount', 10, 2)->default(0)->after('original_amount');
            $table->string('referral_code')->nullable()->after('discount_amount');
            $table->foreignId('referrer_id')->nullable()->after('referral_code')->constrained('users')->nullOnDelete();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('subscriptions', function (Blueprint $table) {
            $table->dropForeign(['referrer_id']);
            $table->dropColumn(['original_amount', 'discount_amount', 'referral_code', 'referrer_id']);
        });
    }
};
