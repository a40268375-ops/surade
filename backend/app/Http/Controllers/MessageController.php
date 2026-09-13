<?php

namespace App\Http\Controllers;

use App\Models\Business;
use App\Models\Message;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;

class MessageController extends Controller
{
    // Publik: siapa saja (pengunjung website) boleh kirim pesan ke sebuah
    // bisnis, tanpa login (sama seperti Booking). Kalau yang mengirim
    // sedang login, pesan ini otomatis jadi baris pertama di thread chat
    // dua arah miliknya (lihat reply() di bawah untuk balasan penjual).
    public function store(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'business_id' => 'required|exists:businesses,id',
            'sender_name' => 'required|string|max:255',
            'sender_contact' => 'nullable|string|max:255',
            'message' => 'required|string',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        $user = $request->user();

        $message = Message::create([
            'business_id' => $request->business_id,
            'customer_id' => $user?->id,
            'sender_id' => $user?->id,
            'sender_role' => 'customer',
            'sender_name' => $request->sender_name,
            'sender_contact' => $request->sender_contact,
            'message' => $request->message,
        ]);

        $this->notifyBusinessOwner($message);

        return response()->json($message, 201);
    }

    // Auth required. Mengembalikan SEMUA pesan yang relevan untuk akun yang
    // sedang login supaya Inbox bisa menyusunnya jadi percakapan dua arah:
    // - Sebagai pemilik bisnis: pesan masuk ke bisnis miliknya + balasannya.
    // - Sebagai pelanggan: pesan yang ia kirim ke penjual lain + balasannya.
    // Admin melihat semua pesan di seluruh platform.
    public function index(Request $request)
    {
        $user = $request->user();

        $query = Message::with(['business', 'customer', 'sender']);

        if ($user->role !== 'admin') {
            $query->where(function ($q) use ($user) {
                $q->whereHas('business', function ($q2) use ($user) {
                    $q2->where('user_id', $user->id);
                })->orWhere('customer_id', $user->id);
            });
        }

        return response()->json($query->latest()->get());
    }

    // Penjual (atau admin) membalas satu percakapan pelanggan tertentu.
    // Ini yang membuat Inbox jadi chat beneran, bukan cuma pesan sekali kirim.
    public function reply(Request $request, $businessId, $customerId)
    {
        $business = Business::find($businessId);
        if (!$business) {
            return response()->json(['message' => 'Bisnis tidak ditemukan'], 404);
        }

        $user = $request->user();
        if ($user->role !== 'admin' && $business->user_id !== $user->id) {
            return response()->json(['message' => 'Forbidden'], 403);
        }

        $validator = Validator::make($request->all(), [
            'message' => 'required|string|max:1000',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        $message = Message::create([
            'business_id' => $business->id,
            'customer_id' => $customerId,
            'sender_id' => $user->id,
            'sender_role' => 'seller',
            'sender_name' => $user->name,
            'sender_contact' => $user->email,
            'message' => $request->message,
        ]);

        NotificationController::createNotification(
            $customerId,
            'message',
            'Balasan Pesan Baru',
            "{$user->name} membalas pesan Anda di '{$business->title}'.",
            ['business_id' => $business->id, 'customer_id' => (int) $customerId]
        );

        return response()->json($message->load(['business', 'sender']), 201);
    }

    // Tandai satu baris pesan sudah dibaca. Boleh dilakukan pemilik bisnis
    // (membaca pesan pelanggan) MAUPUN pelanggan itu sendiri (membaca
    // balasan penjual), selama pesan itu ada di thread miliknya.
    public function update(Request $request, $id)
    {
        $message = Message::with('business')->find($id);

        if (!$message) {
            return response()->json(['message' => 'Pesan tidak ditemukan'], 404);
        }

        $user = $request->user();
        $isOwner = $user->role === 'admin' || $message->business->user_id === $user->id;
        $isCustomer = $message->customer_id && (int) $message->customer_id === (int) $user->id;

        if (!$isOwner && !$isCustomer) {
            return response()->json(['message' => 'Forbidden'], 403);
        }

        $message->update(['is_read' => true]);

        return response()->json($message->fresh());
    }

    public function destroy(Request $request, $id)
    {
        $message = Message::with('business')->find($id);

        if (!$message) {
            return response()->json(['message' => 'Pesan tidak ditemukan'], 404);
        }

        $user = $request->user();
        if ($user->role !== 'admin' && $message->business->user_id !== $user->id) {
            return response()->json(['message' => 'Forbidden'], 403);
        }

        $message->delete();

        return response()->json(['message' => 'Pesan dihapus']);
    }

    private function notifyBusinessOwner(Message $message)
    {
        $business = $message->business ?? Business::find($message->business_id);
        if (!$business) {
            return;
        }

        NotificationController::createNotification(
            $business->user_id,
            'message',
            'Pesan Baru',
            "{$message->sender_name} mengirim pesan baru di '{$business->title}'.",
            ['business_id' => $business->id, 'customer_id' => $message->customer_id]
        );
    }
}