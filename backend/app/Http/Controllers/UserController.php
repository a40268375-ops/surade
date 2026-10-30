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

        $query = User::query();

        if ($request->filled('search')) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                  ->orWhere('email', 'like', "%{$search}%");
            });
        }

        $onlineThreshold = now()->subMinutes(5);
        $activeUserIds = \DB::table('personal_access_tokens')
            ->where('tokenable_type', User::class)
            ->where(function ($q) use ($onlineThreshold) {
                $q->where('last_used_at', '>=', $onlineThreshold)
                  ->orWhere(function ($q2) use ($onlineThreshold) {
                      $q2->whereNull('last_used_at')
                         ->where('created_at', '>=', $onlineThreshold);
                  });
            })
            ->pluck('tokenable_id')
            ->unique()
            ->toArray();

        $latestTokens = \DB::table('personal_access_tokens')
            ->where('tokenable_type', User::class)
            ->select('tokenable_id', \DB::raw('MAX(COALESCE(last_used_at, created_at)) as latest_seen'))
            ->groupBy('tokenable_id')
            ->pluck('latest_seen', 'tokenable_id')
            ->toArray();

        $users = $query->latest()->get()->map(function ($u) use ($activeUserIds, $latestTokens, $onlineThreshold) {
            $isOnline = (bool) $u->is_online || in_array($u->id, $activeUserIds) || ($u->last_seen_at && $u->last_seen_at >= $onlineThreshold);
            $u->is_online = $isOnline;
            $u->last_seen_at = $u->last_seen_at ?: ($latestTokens[$u->id] ?? null);
            return $u;
        });

        return response()->json($users);
    }

    // Aktifkan/nonaktifkan akun. User yang dinonaktifkan tidak bisa login
    // (dicek di AuthController::login).
    public function toggleActive(Request $request, $id)
    {
        if ($request->user()->role !== 'admin') {
            return response()->json(['message' => 'Forbidden'], 403);
        }

        $user = User::find($id);
        if (!$user) {
            return response()->json(['message' => 'User not found'], 404);
        }

        if ($request->user()->id === $user->id) {
            return response()->json(['message' => 'Tidak bisa menonaktifkan akun sendiri'], 400);
        }

        $user->is_active = !$user->is_active;
        $user->save();

        return response()->json($user);
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
            'referral_code' => 'nullable|string|max:20|unique:users,referral_code',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        // Auto-generate referral code if not provided and user is reseller
        $referralCode = $request->referral_code;
        if (!$referralCode && $request->role === 'reseller') {
            $referralCode = $this->generateUniqueReferralCode($request->name);
        } else if ($referralCode) {
            // Validate custom referral code format
            if (!preg_match('/^[A-Z0-9\-_]{3,30}$/', $referralCode)) {
                return response()->json([
                    'errors' => [
                        'referral_code' => ['Kode referral harus 3-30 karakter']
                    ]
                ], 422);
            }
        }

        $user = User::create([
            'name' => $request->name,
            'email' => $request->email,
            'password' => Hash::make($request->password),
            'role' => $request->role,
            'status' => 'active',
            'is_active' => true,
            'referral_code' => $referralCode,
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
            'referral_code' => 'nullable|string|max:20|unique:users,referral_code,' . $id,
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        // Validate custom referral code format if provided
        if ($request->filled('referral_code')) {
            $referralCode = $request->referral_code;
            if (!preg_match('/^[A-Z0-9]{3,20}$/', $referralCode)) {
                return response()->json([
                    'errors' => [
                        'referral_code' => ['Kode referral harus 3-20 karakter, huruf besar dan angka saja']
                    ]
                ], 422);
            }
        }

        $data = $request->only('name', 'email', 'role', 'referral_code');
        if ($request->filled('password')) {
            $data['password'] = Hash::make($request->password);
        }

        // Auto-generate referral code if user becomes reseller and doesn't have one
        if ($request->role === 'reseller' && empty($data['referral_code']) && empty($user->referral_code)) {
            $data['referral_code'] = $this->generateUniqueReferralCode($request->name ?? $user->name);
        }

        // Clear referral code if user is no longer reseller and no custom code was provided
        if ($request->role !== 'reseller' && !$request->filled('referral_code')) {
            $data['referral_code'] = null;
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

    private function generateUniqueReferralCode($name = null)
    {
        $words = preg_split('/\s+/', trim($name ?? ''));
        $firstName = !empty($words[0]) ? $words[0] : 'SRD';
        $clean = strtoupper(preg_replace('/[^A-Za-z0-9]/', '', $firstName));
        $threeLetters = strtoupper(substr($clean, 0, 3));
        if (strlen($threeLetters) < 3) {
            $threeLetters = str_pad($threeLetters, 3, 'X');
        }

        $code = "{$threeLetters}001";
        $counter = 1;
        while (User::where('referral_code', $code)->exists()) {
            $counter++;
            $suffix = str_pad($counter, 3, '0', STR_PAD_LEFT);
            $code = "{$threeLetters}{$suffix}";
        }

        return $code;
    }
}