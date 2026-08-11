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
        Schema::table('users', function (Blueprint $table) {
            if (!Schema::hasColumn('users', 'referral_code')) {
                $table->string('referral_code', 20)->nullable()->unique()->after('role');
            }
            if (!Schema::hasColumn('users', 'status')) {
                $table->string('status')->default('active')->after('referral_code');
            }
        });

        Schema::table('payment_tickets', function (Blueprint $table) {
            if (!Schema::hasColumn('payment_tickets', 'amount')) {
                $table->decimal('amount', 10, 2)->nullable()->after('plan');
            }
            if (!Schema::hasColumn('payment_tickets', 'original_amount')) {
                $table->decimal('original_amount', 10, 2)->nullable()->after('amount');
            }
            if (!Schema::hasColumn('payment_tickets', 'payment_method')) {
                $table->string('payment_method')->nullable()->after('original_amount');
            }
            if (!Schema::hasColumn('payment_tickets', 'referral_code')) {
                $table->string('referral_code', 20)->nullable()->after('payment_method');
            }
            if (!Schema::hasColumn('payment_tickets', 'discount_percent')) {
                $table->decimal('discount_percent', 5, 2)->default(0)->after('referral_code');
            }
            if (!Schema::hasColumn('payment_tickets', 'referrer_id')) {
                $table->unsignedBigInteger('referrer_id')->nullable()->after('discount_percent');
                $table->foreign('referrer_id')->references('id')->on('users')->onDelete('set null');
            }
        });

        Schema::table('businesses', function (Blueprint $table) {
            if (!Schema::hasColumn('businesses', 'latitude')) {
                $table->decimal('latitude', 10, 8)->nullable()->after('address');
            }
            if (!Schema::hasColumn('businesses', 'longitude')) {
                $table->decimal('longitude', 11, 8)->nullable()->after('latitude');
            }
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            if (Schema::hasColumn('users', 'referral_code')) {
                $table->dropColumn('referral_code');
            }
            if (Schema::hasColumn('users', 'status')) {
                $table->dropColumn('status');
            }
        });

        Schema::table('payment_tickets', function (Blueprint $table) {
            if (Schema::hasColumn('payment_tickets', 'referrer_id')) {
                $table->dropForeign(['referrer_id']);
                $table->dropColumn('referrer_id');
            }
            if (Schema::hasColumn('payment_tickets', 'discount_percent')) {
                $table->dropColumn('discount_percent');
            }
            if (Schema::hasColumn('payment_tickets', 'referral_code')) {
                $table->dropColumn('referral_code');
            }
            if (Schema::hasColumn('payment_tickets', 'payment_method')) {
                $table->dropColumn('payment_method');
            }
            if (Schema::hasColumn('payment_tickets', 'original_amount')) {
                $table->dropColumn('original_amount');
            }
            if (Schema::hasColumn('payment_tickets', 'amount')) {
                $table->dropColumn('amount');
            }
        });

        Schema::table('businesses', function (Blueprint $table) {
            if (Schema::hasColumn('businesses', 'latitude')) {
                $table->dropColumn('latitude');
            }
            if (Schema::hasColumn('businesses', 'longitude')) {
                $table->dropColumn('longitude');
            }
        });
    }
};