<?php

namespace App\Http\Controllers;

use App\Models\Business;
use App\Models\MenuItem;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;

class MenuItemController extends Controller
{
    // Publik: menu sebuah bisnis lewat ?business_id=. Login tanpa filter:
    // menu milik bisnis-bisnisnya sendiri (admin: semua menu).
    public function index(Request $request)
    {
        $query = MenuItem::with('business');

        if ($request->has('business_id')) {
            $query->where('business_id', $request->business_id);
        } elseif ($request->user() && $request->user()->role !== 'admin') {
            $user = $request->user();
            $query->whereHas('business', function ($q) use ($user) {
                $q->where('user_id', $user->id);
            });
        }

        return response()->json($query->latest()->get());
    }

    public function store(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'business_id' => 'required|exists:businesses,id',
            'name' => 'required|string|max:255',
            'description' => 'nullable|string',
            'price' => 'required|integer|min:0',
            'image' => 'nullable|image|mimes:jpeg,png,jpg,gif|max:5120',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        $business = Business::find($request->business_id);
        $user = $request->user();

        if ($user->role !== 'admin' && $business->user_id !== $user->id) {
            return response()->json(['message' => 'Forbidden'], 403);
        }

        $data = $request->only(['business_id', 'name', 'description', 'price']);

        if ($request->hasFile('image')) {
            $data['image'] = '/storage/' . $request->file('image')->store('menu-items', 'public');
        }

        $menuItem = MenuItem::create($data);

        return response()->json($menuItem->load('business'), 201);
    }

    public function update(Request $request, $id)
    {
        $menuItem = MenuItem::with('business')->find($id);

        if (!$menuItem) {
            return response()->json(['message' => 'Menu tidak ditemukan'], 404);
        }

        $user = $request->user();
        if ($user->role !== 'admin' && $menuItem->business->user_id !== $user->id) {
            return response()->json(['message' => 'Forbidden'], 403);
        }

        $validator = Validator::make($request->all(), [
            'name' => 'sometimes|required|string|max:255',
            'description' => 'nullable|string',
            'price' => 'sometimes|required|integer|min:0',
            'is_available' => 'sometimes|boolean',
            'image' => 'nullable|image|mimes:jpeg,png,jpg,gif|max:5120',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        $data = $request->only(['name', 'description', 'price', 'is_available']);

        if ($request->hasFile('image')) {
            $data['image'] = '/storage/' . $request->file('image')->store('menu-items', 'public');
        }

        $menuItem->update($data);

        return response()->json($menuItem->fresh('business'));
    }

    public function destroy(Request $request, $id)
    {
        $menuItem = MenuItem::with('business')->find($id);

        if (!$menuItem) {
            return response()->json(['message' => 'Menu tidak ditemukan'], 404);
        }

        $user = $request->user();
        if ($user->role !== 'admin' && $menuItem->business->user_id !== $user->id) {
            return response()->json(['message' => 'Forbidden'], 403);
        }

        $menuItem->delete();

        return response()->json(['message' => 'Menu dihapus']);
    }
}