<?php

namespace App\Http\Controllers;

use App\Models\PlatformCoupon;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;

class PlatformCouponController extends Controller
{
    /**
     * Admin: daftar semua kupon diskon platform, dipakai di
     * Dashboard Admin > Kupon Diskon.
     */
    public function index(Request $request)
    {
        $query = PlatformCoupon::latest();

        if ($request->filled('search')) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('code', 'like', "%{$search}%")
                  ->orWhere('name', 'like', "%{$search}%");
            });
        }

        if ($request->filled('applies_to') && $request->applies_to !== 'all') {
            $query->where('applies_to', $request->applies_to);
        }

        if ($request->filled('status') && $request->status !== 'all') {
            $query->where('is_active', $request->status === 'active');
        }

        return response()->json($query->get());
    }

    public function store(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'code' => 'required|string|max:50|unique:platform_coupons,code',
            'name' => 'nullable|string|max:255',
            'discount_type' => 'required|in:percentage,fixed',
            'discount_value' => 'required|integer|min:1',
            'applies_to' => 'required|in:semua,premium,iklan',
            'min_purchase' => 'nullable|integer|min:0',
            'max_uses' => 'nullable|integer|min:1',
            'expires_at' => 'nullable|date',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        $coupon = PlatformCoupon::create([
            'code' => strtoupper($request->code),
            'name' => $request->name,
            'discount_type' => $request->discount_type,
            'discount_value' => $request->discount_value,
            'applies_to' => $request->applies_to,
            'min_purchase' => $request->min_purchase,
            'max_uses' => $request->max_uses,
            'expires_at' => $request->expires_at,
            'is_active' => true,
        ]);

        return response()->json($coupon, 201);
    }

    public function update(Request $request, $id)
    {
        $coupon = PlatformCoupon::find($id);
        if (!$coupon) {
            return response()->json(['message' => 'Kupon tidak ditemukan'], 404);
        }

        $validator = Validator::make($request->all(), [
            'code' => 'sometimes|required|string|max:50|unique:platform_coupons,code,' . $coupon->id,
            'name' => 'nullable|string|max:255',
            'discount_type' => 'sometimes|required|in:percentage,fixed',
            'discount_value' => 'sometimes|required|integer|min:1',
            'applies_to' => 'sometimes|required|in:semua,premium,iklan',
            'min_purchase' => 'nullable|integer|min:0',
            'max_uses' => 'nullable|integer|min:1',
            'expires_at' => 'nullable|date',
            'is_active' => 'sometimes|boolean',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        $data = $request->all();
        if (isset($data['code'])) {
            $data['code'] = strtoupper($data['code']);
        }

        $coupon->update($data);

        return response()->json($coupon);
    }

    public function destroy($id)
    {
        $coupon = PlatformCoupon::find($id);
        if (!$coupon) {
            return response()->json(['message' => 'Kupon tidak ditemukan'], 404);
        }

        $coupon->delete();

        return response()->json(['message' => 'Kupon berhasil dihapus']);
    }

    /**
     * Auth required (bukan admin-only): dipakai di halaman checkout Premium
     * atau Iklan untuk mengecek & menerapkan kode kupon yang diketik user.
     */
    public function validateCode(Request $request)
    {
        $request->validate([
            'code' => 'required|string',
            'context' => 'required|in:premium,iklan',
            'amount' => 'required|integer|min:0',
        ]);

        $coupon = PlatformCoupon::where('code', strtoupper($request->code))
            ->where('is_active', true)
            ->first();

        if (!$coupon) {
            return response()->json(['message' => 'Kode kupon tidak ditemukan atau sudah tidak aktif'], 404);
        }

        $user = $request->user('sanctum') ?? auth('sanctum')->user() ?? auth()->user();
        if (!$user && $request->filled('user_id')) {
            $user = \App\Models\User::find($request->input('user_id'));
        }

        if ($user && \App\Models\Coupon::hasUserUsed($user->id, $coupon->code)) {
            return response()->json(['message' => 'Anda sudah pernah menggunakan kode kupon ini sebelumnya. Setiap kupon hanya dapat digunakan 1 kali per pengguna.'], 422);
        }

        if ($coupon->applies_to !== 'semua' && $coupon->applies_to !== $request->context) {
            return response()->json(['message' => 'Kupon ini tidak berlaku untuk pembelian ini'], 422);
        }

        if ($coupon->expires_at && now()->gt($coupon->expires_at)) {
            return response()->json(['message' => 'Kupon sudah kedaluwarsa'], 422);
        }

        if ($coupon->max_uses && $coupon->used_count >= $coupon->max_uses) {
            return response()->json(['message' => 'Kupon sudah mencapai batas penggunaan'], 422);
        }

        if ($coupon->min_purchase && $request->amount < $coupon->min_purchase) {
            return response()->json(['message' => 'Belum memenuhi minimum transaksi untuk kupon ini'], 422);
        }

        $discount = $coupon->discount_type === 'percentage'
            ? intval($request->amount * $coupon->discount_value / 100)
            : $coupon->discount_value;
        $discount = min($discount, $request->amount);

        return response()->json([
            'coupon' => $coupon,
            'discount' => $discount,
            'final_amount' => $request->amount - $discount,
        ]);
    }
}