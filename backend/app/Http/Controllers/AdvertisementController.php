<?php

namespace App\Http\Controllers\Admin; // DIUBAH: Sesuai struktur folder admin

use App\Http\Controllers\Controller; // DITAMBAHKAN: Supaya bisa extend Controller utama
use App\Models\Advertisement;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;

class AdvertisementController extends Controller
{
    public function index(Request $request)
    {
        $query = Advertisement::with('category', 'user');

        if ($request->has('status') && $request->user() && $request->user()->role === 'admin') {
            $query->where('status', $request->status);
        } elseif ($request->has('status') && $request->user()) {
            $query->where('status', $request->status)->where('user_id', $request->user()->id);
        } else {
            // DIUBAH: Di api.php kamu menggunakan status 'verified' untuk iklan tayang
            $query->where('status', 'verified'); 
        }

        $ads = $query->latest()->get();

        if (!$request->has('status')) {
            $ads = $ads->filter(fn ($ad) => $ad->user && $ad->user->hasActivePremiumBusiness())->values();
        }

        return response()->json($ads);
    }

    public function store(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'category_id' => 'required|exists:categories,id',
            'title' => 'required|string|max:255',
            'description' => 'required|string',
            'company_name' => 'required|string|max:255',
            'location' => 'required|string|max:255',
            'phone' => 'nullable|string',
            'website' => 'nullable|string',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        if ($request->user()->role !== 'admin' && !$request->user()->hasActivePremiumBusiness()) {
            return response()->json([
                'message' => 'Hanya bisnis dengan langganan Premium aktif yang bisa memasang iklan. Silakan berlangganan premium terlebih dahulu.',
            ], 403);
        }

        $data = $request->all();
        $data['user_id'] = $request->user()->id;
        $data['status'] = 'pending';

        $advertisement = Advertisement::create($data);

        return response()->json($advertisement->load('category'), 201);
    }

    public function show($id)
    {
        $advertisement = Advertisement::with('category', 'user')->find($id);

        if (!$advertisement) {
            return response()->json(['message' => 'Advertisement not found'], 404);
        }

        return response()->json($advertisement);
    }

    // DITAMBAHKAN: Fungsi verify untuk memenuhi Route::put('advertisements/{id}/verify') di api.php kamu
    public function verify(Request $request, $id)
    {
        if ($request->user()->role !== 'admin') {
            return response()->json(['message' => 'Forbidden'], 403);
        }

        $advertisement = Advertisement::find($id);

        if (!$advertisement) {
            return response()->json(['message' => 'Advertisement not found'], 404);
        }

        $advertisement->status = 'verified'; // Status disetujui admin agar tayang ke publik
        $advertisement->save();

        return response()->json($advertisement->load('category'));
    }

    public function update(Request $request, $id)
    {
        $advertisement = Advertisement::find($id);

        if (!$advertisement) {
            return response()->json(['message' => 'Advertisement not found'], 404);
        }

        if ($request->user()->id !== $advertisement->user_id && $request->user()->role !== 'admin') {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $validator = Validator::make($request->all(), [
            'category_id' => 'sometimes|required|exists:categories,id',
            'title' => 'sometimes|required|string|max:255',
            'description' => 'sometimes|required|string',
            'company_name' => 'sometimes|required|string|max:255',
            'location' => 'sometimes|required|string|max:255',
            'phone' => 'nullable|string',
            'website' => 'nullable|string',
            'status' => 'nullable|string|in:pending,verified,rejected', // Diubah dari approved ke verified sesuai sistem api.php
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        $data = $request->all();

        if ($request->user()->role !== 'admin') {
            unset($data['status']);
        }

        $advertisement->update($data);

        return response()->json($advertisement->load('category'));
    }

    public function destroy(Request $request, $id)
    {
        $advertisement = Advertisement::find($id);

        if (!$advertisement) {
            return response()->json(['message' => 'Advertisement not found'], 404);
        }

        if ($request->user()->id !== $advertisement->user_id && $request->user()->role !== 'admin') {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $advertisement->delete();

        return response()->json(['message' => 'Advertisement deleted successfully']);
    }
}
