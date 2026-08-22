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
            // Referral transaction tracking (separate from payment status)
            $table->enum('referral_status', ['pending', 'approved', 'rejected', 'cancelled'])->nullable()->after('referrer_id');
            $table->timestamp('referral_approved_at')->nullable()->after('referral_status');
            $table->foreignId('referral_approved_by')->nullable()->constrained('users')->nullOnDelete()->after('referral_approved_at');
            $table->timestamp('referral_rejected_at')->nullable()->after('referral_approved_by');
            $table->foreignId('referral_rejected_by')->nullable()->constrained('users')->nullOnDelete()->after('referral_rejected_at');
            $table->text('referral_rejection_reason')->nullable()->after('referral_rejected_by');
            
            // Add indexes
            $table->index(['referrer_id', 'referral_status']);
            $table->index(['referral_status', 'referral_approved_at']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('subscriptions', function (Blueprint $table) {
            $table->dropColumn([
                'referral_status',
                'referral_approved_at',
                'referral_approved_by',
                'referral_rejected_at',
                'referral_rejected_by',
                'referral_rejection_reason'
            ]);
        });
    }
};