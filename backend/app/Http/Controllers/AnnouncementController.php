<?php

namespace App\Http\Controllers;

use App\Models\Announcement;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;

class AnnouncementController extends Controller
{
    // Semua user login (pemilik bisnis & admin) bisa membaca pengumuman.
    public function index()
    {
        return response()->json(Announcement::with('author')->latest()->get());
    }

    // Hanya admin (route ini ada di grup admin/) yang boleh membuat pengumuman.
    public function store(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'title' => 'required|string|max:255',
            'body' => 'required|string',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        $announcement = Announcement::create([
            'title' => $request->title,
            'body' => $request->body,
            'created_by' => $request->user()->id,
        ]);

        return response()->json($announcement->load('author'), 201);
    }

    public function update(Request $request, $id)
    {
        $announcement = Announcement::find($id);

        if (!$announcement) {
            return response()->json(['message' => 'Pengumuman tidak ditemukan'], 404);
        }

        $validator = Validator::make($request->all(), [
            'title' => 'sometimes|required|string|max:255',
            'body' => 'sometimes|required|string',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        $announcement->update($request->only(['title', 'body']));

        return response()->json($announcement->fresh('author'));
    }

    public function destroy($id)
    {
        $announcement = Announcement::find($id);

        if (!$announcement) {
            return response()->json(['message' => 'Pengumuman tidak ditemukan'], 404);
        }

        $announcement->delete();

        return response()->json(['message' => 'Pengumuman dihapus']);
    }
}