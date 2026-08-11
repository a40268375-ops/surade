<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::table('subscriptions', function (Blueprint $table) {
            // dana, bni, bca
            $table->string('payment_method')->nullable()->after('amount');
            // path to the uploaded transfer-proof image (storage/app/public/payment-proofs)
            $table->string('proof_path')->nullable()->after('payment_method');
            // filled in when an admin approves/rejects the payment
            $table->foreignId('verified_by')->nullable()->after('status')->constrained('users')->nullOnDelete();
            $table->timestamp('verified_at')->nullable()->after('verified_by');
            $table->string('rejection_reason')->nullable()->after('verified_at');
        });
    }

    public function down(): void
    {
        Schema::table('subscriptions', function (Blueprint $table) {
            $table->dropConstrainedForeignId('verified_by');
            $table->dropColumn(['payment_method', 'proof_path', 'verified_at', 'rejection_reason']);
        });
    }
};