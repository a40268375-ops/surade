<?php

namespace App\Http\Controllers;

use App\Models\SavedContent;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;

class SavedContentController extends Controller
{
    // Auth required: daftar blog/event yang disimpan user yang sedang login.
    public function index(Request $request)
    {
        $saved = SavedContent::where('user_id', $request->user()->id)
            ->latest()
            ->get()
            ->map(function ($item) {
                return [
                    'id' => $item->id,
                    'content_type' => $item->content_type,
                    'content_id' => $item->content_id,
                    'content' => $item->content,
                ];
            });

        return response()->json($saved);
    }

    // Auth required: simpan sebuah blog/event untuk user yang sedang login.
    public function store(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'content_type' => 'required|in:blog,event',
            'content_id' => 'required|integer',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        // Cegah simpan dua kali untuk konten yang sama.
        $existing = SavedContent::where('user_id', $request->user()->id)
            ->where('content_type', $request->content_type)
            ->where('content_id', $request->content_id)
            ->first();

        if ($existing) {
            return response()->json($existing);
        }

        $saved = SavedContent::create([
            'user_id' => $request->user()->id,
            'content_type' => $request->content_type,
            'content_id' => $request->content_id,
        ]);

        return response()->json($saved, 201);
    }

    // Auth required: hapus dari daftar simpanan. $id di sini adalah id baris
    // saved_contents itu sendiri (bukan id blog/event-nya).
    public function destroy(Request $request, $id)
    {
        $saved = SavedContent::find($id);

        if (!$saved) {
            return response()->json(['message' => 'Data tidak ditemukan'], 404);
        }

        if ($saved->user_id !== $request->user()->id) {
            return response()->json(['message' => 'Forbidden'], 403);
        }

        $saved->delete();

        return response()->json(['message' => 'Berhasil dihapus dari simpanan']);
    }
}