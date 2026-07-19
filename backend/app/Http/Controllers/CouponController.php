<?php

namespace App\Http\Controllers;

use App\Models\Business;
use App\Models\Coupon;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;

class CouponController extends Controller
{
    // Pemilik bisnis: kupon milik bisnis-bisnisnya sendiri. Admin: semua kupon.
    public function index(Request $request)
    {
        $user = $request->user();

        $query = Coupon::with('business');

        if ($user->role !== 'admin') {
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
            'code' => 'required|string|max:50',
            'discount_type' => 'required|in:percentage,fixed',
            'discount_value' => 'required|integer|min:1',
            'max_uses' => 'nullable|integer|min:1',
            'expires_at' => 'nullable|date',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        $business = Business::find($request->business_id);
        $user = $request->user();

        if ($user->role !== 'admin' && $business->user_id !== $user->id) {
            return response()->json(['message' => 'Forbidden'], 403);
        }

        $coupon = Coupon::create($request->only([
            'business_id', 'code', 'discount_type', 'discount_value', 'max_uses', 'expires_at',
        ]));

        return response()->json($coupon->load('business'), 201);
    }

    public function update(Request $request, $id)
    {
        $coupon = Coupon::with('business')->find($id);

        if (!$coupon) {
            return response()->json(['message' => 'Kupon tidak ditemukan'], 404);
        }

        $user = $request->user();
        if ($user->role !== 'admin' && $coupon->business->user_id !== $user->id) {
            return response()->json(['message' => 'Forbidden'], 403);
        }

        $validator = Validator::make($request->all(), [
            'code' => 'sometimes|required|string|max:50',
            'discount_type' => 'sometimes|required|in:percentage,fixed',
            'discount_value' => 'sometimes|required|integer|min:1',
            'max_uses' => 'nullable|integer|min:1',
            'expires_at' => 'nullable|date',
            'is_active' => 'sometimes|boolean',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        $coupon->update($request->only([
            'code', 'discount_type', 'discount_value', 'max_uses', 'expires_at', 'is_active',
        ]));

        return response()->json($coupon->fresh('business'));
    }

    public function destroy(Request $request, $id)
    {
        $coupon = Coupon::with('business')->find($id);

        if (!$coupon) {
            return response()->json(['message' => 'Kupon tidak ditemukan'], 404);
        }

        $user = $request->user();
        if ($user->role !== 'admin' && $coupon->business->user_id !== $user->id) {
            return response()->json(['message' => 'Forbidden'], 403);
        }

        $coupon->delete();

        return response()->json(['message' => 'Kupon dihapus']);
    }
}