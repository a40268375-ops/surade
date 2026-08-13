<?php

namespace App\Http\Controllers;

use App\Models\Chat;
use App\Models\ChatMessage;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class ChatController extends Controller
{
    /**
     * Get all chats untuk user/reseller yang login
     */
    public function index(Request $request)
    {
        $user = Auth::user();
        
        // Untuk reseller: cari chat dimana dia adalah reseller
        // Untuk user: cari chat dimana dia adalah user
        $chats = Chat::where(function ($query) use ($user) {
            $query->where('user_id', $user->id)
                  ->orWhere('reseller_id', $user->id);
        })
        ->with(['user', 'reseller', 'business'])
        ->orderByDesc('last_message_at')
        ->paginate($request->get('per_page', 20));

        return response()->json([
            'chats' => $chats->items(),
            'pagination' => [
                'total' => $chats->total(),
                'per_page' => $chats->perPage(),
                'current_page' => $chats->currentPage(),
                'last_page' => $chats->lastPage(),
            ]
        ]);
    }

    /**
     * Buat atau ambil chat dengan reseller tertentu
     */
    public function getOrCreate(Request $request)
    {
        $request->validate([
            'reseller_id' => 'required|exists:users,id',
            'business_id' => 'nullable|exists:businesses,id',
        ]);

        $user = Auth::user();
        $resellerId = $request->reseller_id;
        $businessId = $request->business_id;

        // Cek apakah chat sudah ada
        $chat = Chat::where(function ($query) use ($user, $resellerId) {
            $query->where([
                ['user_id', $user->id],
                ['reseller_id', $resellerId],
            ])->orWhere([
                ['user_id', $resellerId],
                ['reseller_id', $user->id],
            ]);
        })->first();

        // Jika belum ada, buat chat baru
        if (!$chat) {
            // Ensure user_id adalah customer (non-reseller) dan reseller_id adalah reseller
            $userId = $user->role === 'reseller' ? $resellerId : $user->id;
            $actualResellerId = $user->role === 'reseller' ? $user->id : $resellerId;

            $chat = Chat::create([
                'user_id' => $userId,
                'reseller_id' => $actualResellerId,
                'business_id' => $businessId,
            ]);
        }

        return response()->json([
            'chat' => $chat->load(['user', 'reseller', 'business']),
        ]);
    }

    /**
     * Get detail chat dengan pesan-pesannya
     */
    public function show($chatId, Request $request)
    {
        $chat = Chat::with(['user', 'reseller', 'business'])
            ->findOrFail($chatId);

        // Verifikasi user punya akses ke chat ini
        $user = Auth::user();
        if ($chat->user_id !== $user->id && $chat->reseller_id !== $user->id) {
            return response()->json(['error' => 'Unauthorized'], 403);
        }

        // Get messages
        $messages = ChatMessage::where('chat_id', $chatId)
            ->with('sender')
            ->orderBy('created_at', 'asc')
            ->paginate($request->get('per_page', 50));

        // Mark messages sebagai read
        ChatMessage::where('chat_id', $chatId)
            ->where('sender_id', '!=', $user->id)
            ->where('is_read', false)
            ->update([
                'is_read' => true,
                'read_at' => now(),
            ]);

        return response()->json([
            'chat' => $chat,
            'messages' => $messages->items(),
            'pagination' => [
                'total' => $messages->total(),
                'per_page' => $messages->perPage(),
                'current_page' => $messages->currentPage(),
                'last_page' => $messages->lastPage(),
            ]
        ]);
    }

    /**
     * Send message dalam chat
     */
    public function sendMessage(Request $request, $chatId)
    {
        $request->validate([
            'message' => 'required|string|max:5000',
        ]);

        $chat = Chat::findOrFail($chatId);
        $user = Auth::user();

        // Verifikasi user punya akses ke chat ini
        if ($chat->user_id !== $user->id && $chat->reseller_id !== $user->id) {
            return response()->json(['error' => 'Unauthorized'], 403);
        }

        // Create message
        $message = ChatMessage::create([
            'chat_id' => $chatId,
            'sender_id' => $user->id,
            'message' => $request->message,
            'is_read' => false,
        ]);

        // Update chat last message
        $chat->update([
            'last_message' => $request->message,
            'last_message_at' => now(),
        ]);

        return response()->json([
            'message' => $message->load('sender'),
        ]);
    }

    /**
     * Mark message as read
     */
    public function markAsRead($messageId)
    {
        $message = ChatMessage::findOrFail($messageId);
        $user = Auth::user();

        // Only the receiver can mark as read
        if ($message->sender_id === $user->id) {
            return response()->json(['error' => 'Unauthorized'], 403);
        }

        $message->update([
            'is_read' => true,
            'read_at' => now(),
        ]);

        return response()->json([
            'message' => $message,
        ]);
    }

    /**
     * Delete chat
     */
    public function destroy($chatId)
    {
        $chat = Chat::findOrFail($chatId);
        $user = Auth::user();

        // Verifikasi user punya akses ke chat ini
        if ($chat->user_id !== $user->id && $chat->reseller_id !== $user->id) {
            return response()->json(['error' => 'Unauthorized'], 403);
        }

        $chat->delete();

        return response()->json([
            'message' => 'Chat deleted successfully',
        ]);
    }

    /**
     * Get unread chat count
     */
    public function unreadCount()
    {
        $user = Auth::user();

        $count = Chat::where(function ($query) use ($user) {
            $query->where('user_id', $user->id)
                  ->orWhere('reseller_id', $user->id);
        })
        ->withCount(['messages' => function ($q) use ($user) {
            $q->where('sender_id', '!=', $user->id)
              ->where('is_read', false);
        }])
        ->get()
        ->sum('messages_count');

        return response()->json([
            'unread_count' => $count,
        ]);
    }
}
