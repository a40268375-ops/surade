<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        // Businesses: track when premium expires + which plan
        Schema::table('businesses', function (Blueprint $table) {
            $table->timestamp('premium_expires_at')->nullable()->after('is_premium');
            $table->string('premium_plan')->nullable()->after('premium_expires_at');
        });

        // Subscriptions = invoice / riwayat langganan premium per bisnis
        Schema::create('subscriptions', function (Blueprint $table) {
            $table->id();
            $table->string('invoice_number')->unique();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            $table->foreignId('business_id')->constrained()->cascadeOnDelete();
            $table->string('plan'); // monthly, quarterly, yearly
            $table->unsignedInteger('duration_days');
            $table->unsignedBigInteger('amount'); // in Rupiah
            $table->string('status')->default('paid'); // pending, paid, cancelled
            $table->timestamp('starts_at')->nullable();
            $table->timestamp('expires_at')->nullable();
            $table->timestamps();
        });

        // Events = agenda / event yang dikelola admin
        Schema::create('events', function (Blueprint $table) {
            $table->id();
            $table->string('title');
            $table->text('description')->nullable();
            $table->string('location')->nullable();
            $table->dateTime('event_date')->nullable();
            $table->string('image')->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('events');
        Schema::dropIfExists('subscriptions');
        Schema::table('businesses', function (Blueprint $table) {
            $table->dropColumn(['premium_expires_at', 'premium_plan']);
        });
    }
};
