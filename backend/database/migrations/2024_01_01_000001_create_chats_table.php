<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Buat table untuk menyimpan percakapan chat antara user/customer dan reseller
     */
    public function up(): void
    {
        // Table untuk percakapan chat (grouping pesan)
        Schema::create('chats', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->onDelete('cascade'); // customer/user yang chat
            $table->foreignId('reseller_id')->constrained('users')->onDelete('cascade'); // reseller yang di-chat
            $table->foreignId('business_id')->nullable()->constrained()->onDelete('cascade'); // bisnis yang di-chat
            $table->text('last_message')->nullable(); // preview pesan terakhir
            $table->timestamp('last_message_at')->nullable(); // timestamp pesan terakhir
            $table->timestamps();
            
            // Index untuk query cepat
            $table->index(['user_id', 'reseller_id']);
        });

        // Table untuk menyimpan pesan individual dalam chat
        Schema::create('chat_messages', function (Blueprint $table) {
            $table->id();
            $table->foreignId('chat_id')->constrained()->onDelete('cascade');
            $table->foreignId('sender_id')->constrained('users')->onDelete('cascade'); // siapa yang mengirim (user atau reseller)
            $table->text('message');
            $table->boolean('is_read')->default(false);
            $table->timestamp('read_at')->nullable();
            $table->timestamps();
            
            // Index untuk query cepat
            $table->index(['chat_id', 'sender_id']);
            $table->index('is_read');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('chat_messages');
        Schema::dropIfExists('chats');
    }
};
