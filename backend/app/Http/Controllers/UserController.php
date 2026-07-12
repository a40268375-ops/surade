<?php

namespace App\Http\Controllers;

use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Validator;

class UserController extends Controller
{
    // Reseller dashboard: daftar bisnis yang mendaftar memakai kode referral
    // milik reseller ini + ringkasan benefit (komisi per bisnis premium).
    public function resellerBusinesses(Request $request)
    {
        $user = $request->user();

        if (!$user->referral_code) {
            return response()->json(['referral_code' => null, 'referred_businesses' => [], 'benefit' => ['total_referrals' => 0, 'premium_referrals' => 0, 'estimated_commission' => 0]]);
        }

        $businesses = \App\Models\Business::with('category', 'user')
            ->where('referred_by', $user->referral_code)
            ->get();

        $premiumCount = $businesses->filter(fn ($b) => $b->is_premium_active)->count();
        $commissionPerPremium = 20000; // contoh: Rp20.000 per bisnis premium aktif

        return response()->json([
            'referral_code' => $user->referral_code,
            'referred_businesses' => $businesses,
            'benefit' => [
                'total_referrals' => $businesses->count(),
                'premium_referrals' => $premiumCount,
                'estimated_commission' => $premiumCount * $commissionPerPremium,
            ],
        ]);
    }

    public function index(Request $request)
    {
        if ($request->user()->role !== 'admin') {
            return response()->json(['message' => 'Forbidden'], 403);
        }

        return response()->json(User::all());
    }

    public function store(Request $request)
    {
        if ($request->user()->role !== 'admin') {
            return response()->json(['message' => 'Forbidden'], 403);
        }

        $validator = Validator::make($request->all(), [
            'name' => 'required|string|max:255',
            'email' => 'required|string|email|max:255|unique:users',
            'password' => 'required|string|min:6',
            'role' => 'required|string|in:user,admin,reseller',
            'referral_code' => 'nullable|string',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        $user = User::create([
            'name' => $request->name,
            'email' => $request->email,
            'password' => Hash::make($request->password),
            'role' => $request->role,
            'referral_code' => $request->referral_code,
        ]);

        return response()->json($user, 201);
    }

    public function update(Request $request, $id)
    {
        if ($request->user()->role !== 'admin') {
            return response()->json(['message' => 'Forbidden'], 403);
        }

        $user = User::find($id);
        if (!$user) {
            return response()->json(['message' => 'User not found'], 404);
        }

        $validator = Validator::make($request->all(), [
            'name' => 'sometimes|required|string|max:255',
            'email' => 'sometimes|required|string|email|max:255|unique:users,email,' . $id,
            'password' => 'nullable|string|min:6',
            'role' => 'sometimes|required|string|in:user,admin,reseller',
            'referral_code' => 'nullable|string',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        $data = $request->only('name', 'email', 'role', 'referral_code');
        if ($request->filled('password')) {
            $data['password'] = Hash::make($request->password);
        }

        $user->update($data);

        return response()->json($user);
    }

    public function destroy(Request $request, $id)
    {
        if ($request->user()->role !== 'admin') {
            return response()->json(['message' => 'Forbidden'], 403);
        }

        $user = User::find($id);
        if (!$user) {
            return response()->json(['message' => 'User not found'], 404);
        }

        // Prevent self-deletion
        if ($request->user()->id === $user->id) {
            return response()->json(['message' => 'Cannot delete your own account'], 400);
        }

        $user->delete();

        return response()->json(['message' => 'User deleted successfully']);
    }
}
