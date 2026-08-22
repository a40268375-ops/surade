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
        Schema::table('referral_commissions', function (Blueprint $table) {
            // Update status enum to include more states
            $table->dropColumn('status');
        });
        
        Schema::table('referral_commissions', function (Blueprint $table) {
            $table->enum('status', ['pending', 'approved', 'paid', 'rejected', 'cancelled'])->default('pending')->after('commission_percent');
            
            // Approval tracking
            $table->timestamp('approved_at')->nullable()->after('paid_at');
            $table->foreignId('approved_by')->nullable()->constrained('users')->nullOnDelete()->after('approved_at');
            
            // Rejection tracking
            $table->timestamp('rejected_at')->nullable()->after('approved_by');
            $table->foreignId('rejected_by')->nullable()->constrained('users')->nullOnDelete()->after('rejected_at');
            $table->text('rejection_reason')->nullable()->after('rejected_by');
            
            // Paid tracking (admin who marked as paid)
            $table->foreignId('paid_by')->nullable()->constrained('users')->nullOnDelete()->after('rejection_reason');
            
            // Commission adjustment tracking
            $table->decimal('original_commission_amount', 10, 2)->nullable()->after('commission_amount');
            $table->decimal('adjustment_amount', 10, 2)->default(0)->after('original_commission_amount');
            $table->decimal('final_commission_amount', 10, 2)->nullable()->after('adjustment_amount');
            $table->text('adjustment_reason')->nullable()->after('final_commission_amount');
            $table->foreignId('adjusted_by')->nullable()->constrained('users')->nullOnDelete()->after('adjustment_reason');
            $table->timestamp('adjusted_at')->nullable()->after('adjusted_by');
            
            // Transaction reference for admin tracking
            $table->string('transaction_id')->nullable()->after('subscription_id');
            
            // Add indexes for performance
            $table->index(['status', 'created_at']);
            $table->index(['referrer_id', 'status', 'created_at']);
            $table->index(['approved_at']);
            $table->index(['paid_at']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('referral_commissions', function (Blueprint $table) {
            $table->dropColumn([
                'approved_at',
                'approved_by',
                'rejected_at',
                'rejected_by', 
                'rejection_reason',
                'paid_by',
                'original_commission_amount',
                'adjustment_amount',
                'final_commission_amount',
                'adjustment_reason',
                'adjusted_by',
                'adjusted_at',
                'transaction_id'
            ]);
            
            $table->dropColumn('status');
        });
        
        Schema::table('referral_commissions', function (Blueprint $table) {
            $table->enum('status', ['pending', 'paid', 'cancelled'])->default('pending')->after('commission_percent');
        });
    }
};