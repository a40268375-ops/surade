<?php

namespace App\Http\Controllers;

use App\Models\Message;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;

class MessageController extends Controller
{
    // Publik: siapa saja (pengunjung website) boleh kirim pesan ke sebuah
    // bisnis, tanpa login (sama seperti Booking).
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

        $message = Message::create($request->only([
            'business_id', 'sender_name', 'sender_contact', 'message',
        ]));

        return response()->json($message, 201);
    }

    // Auth required: pemilik bisnis melihat pesan masuk ke bisnisnya sendiri,
    // admin melihat semua pesan.
    public function index(Request $request)
    {
        $user = $request->user();

        $query = Message::with('business');

        if ($user->role !== 'admin') {
            $query->whereHas('business', function ($q) use ($user) {
                $q->where('user_id', $user->id);
            });
        }

        return response()->json($query->latest()->get());
    }

    // Tandai sudah dibaca.
    public function update(Request $request, $id)
    {
        $message = Message::with('business')->find($id);

        if (!$message) {
            return response()->json(['message' => 'Pesan tidak ditemukan'], 404);
        }

        $user = $request->user();
        if ($user->role !== 'admin' && $message->business->user_id !== $user->id) {
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
}