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
            // Lifecycle management fields
            $table->timestamp('cancelled_at')->nullable()->after('expires_at');
            $table->unsignedBigInteger('cancelled_by')->nullable()->after('cancelled_at');
            $table->text('cancellation_reason')->nullable()->after('cancelled_by');
            
            $table->timestamp('expired_at')->nullable()->after('cancellation_reason');
            $table->timestamp('renewed_at')->nullable()->after('expired_at');
            $table->unsignedBigInteger('renewed_by_subscription_id')->nullable()->after('renewed_at');
            
            // Refund management
            $table->decimal('refund_amount', 10, 2)->nullable()->after('renewed_by_subscription_id');
            $table->boolean('refund_eligible')->default(false)->after('refund_amount');
            $table->timestamp('refund_processed_at')->nullable()->after('refund_eligible');
            
            // Enhanced referral tracking
            $table->decimal('referral_discount_amount', 10, 2)->nullable()->after('refund_processed_at');
            
            // Notification tracking
            $table->timestamp('activation_notification_sent_at')->nullable()->after('referral_discount_amount');
            $table->timestamp('expiration_warning_sent_at')->nullable()->after('activation_notification_sent_at');
            $table->timestamp('renewal_reminder_sent_at')->nullable()->after('expiration_warning_sent_at');
            
            // Analytics fields
            $table->json('lifecycle_events')->nullable()->after('renewal_reminder_sent_at');
            $table->integer('auto_renewal_attempts')->default(0)->after('lifecycle_events');
            
            // Foreign key constraints
            $table->foreign('cancelled_by')->references('id')->on('users')->onDelete('set null');
            $table->foreign('renewed_by_subscription_id')->references('id')->on('subscriptions')->onDelete('set null');
            
            // Indexes for performance
            $table->index(['status', 'expires_at'], 'idx_subscriptions_status_expires');
            $table->index(['user_id', 'status'], 'idx_subscriptions_user_status');
            $table->index('cancelled_at', 'idx_subscriptions_cancelled_at');
            $table->index('expired_at', 'idx_subscriptions_expired_at');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('subscriptions', function (Blueprint $table) {
            // Drop foreign keys first
            $table->dropForeign(['cancelled_by']);
            $table->dropForeign(['renewed_by_subscription_id']);
            
            // Drop indexes
            $table->dropIndex('idx_subscriptions_status_expires');
            $table->dropIndex('idx_subscriptions_user_status');
            $table->dropIndex('idx_subscriptions_cancelled_at');
            $table->dropIndex('idx_subscriptions_expired_at');
            
            // Drop columns
            $table->dropColumn([
                'cancelled_at',
                'cancelled_by', 
                'cancellation_reason',
                'expired_at',
                'renewed_at',
                'renewed_by_subscription_id',
                'refund_amount',
                'refund_eligible',
                'refund_processed_at',
                'referral_discount_amount',
                'activation_notification_sent_at',
                'expiration_warning_sent_at',
                'renewal_reminder_sent_at',
                'lifecycle_events',
                'auto_renewal_attempts'
            ]);
        });
    }
};