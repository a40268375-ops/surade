<?php

namespace App\Http\Controllers;

use App\Models\SavedBusiness;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;

class SavedBusinessController extends Controller
{
    // Auth required: daftar bisnis yang disimpan user yang sedang login.
    public function index(Request $request)
    {
        $saved = SavedBusiness::with('business.category')
            ->where('user_id', $request->user()->id)
            ->latest()
            ->get();

        return response()->json($saved);
    }

    // Auth required: simpan sebuah bisnis untuk user yang sedang login.
    public function store(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'business_id' => 'required|exists:businesses,id',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        // Cegah simpan dua kali untuk bisnis yang sama.
        $existing = SavedBusiness::where('user_id', $request->user()->id)
            ->where('business_id', $request->business_id)
            ->first();

        if ($existing) {
            return response()->json($existing->load('business.category'));
        }

        $saved = SavedBusiness::create([
            'user_id' => $request->user()->id,
            'business_id' => $request->business_id,
        ]);

        return response()->json($saved->load('business.category'), 201);
    }

    // Auth required: hapus dari daftar simpanan. $id di sini adalah id baris
    // saved_businesses itu sendiri (bukan id bisnisnya).
    public function destroy(Request $request, $id)
    {
        $saved = SavedBusiness::find($id);

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