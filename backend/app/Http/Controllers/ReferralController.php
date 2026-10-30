<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\User;
use App\Models\ReferralCommission;

class ReferralController extends Controller
{
    /**
     * Statistik referral milik user yang sedang login, untuk ditampilkan
     * di tab "Referral" pada Dashboard user (menggantikan tab Reseller lama).
     *
     * Semua angka diambil langsung dari database (referral_commissions),
     * tidak ada dummy data.
     */
    public function myReferralStats(Request $request)
    {
        return app(\App\Http\Controllers\Api\ReferralController::class)->myStats($request);
    }

    public function checkReferralCode(Request $request)
    {
        $request->validate([
            'code' => 'required|string',
        ]);

        // Find user with this referral code
        $referrer = User::where('referral_code', $request->code)->first();

        if (!$referrer) {
            return response()->json([
                'valid' => false,
                'discount_percent' => 0,
                'message' => 'Kode referral tidak valid'
            ], 200);
        }

        // Check if referrer is active and has referral privileges
        if ($referrer->status !== 'active' || !$referrer->is_active) {
            return response()->json([
                'valid' => false,
                'discount_percent' => 0,
                'message' => 'Kode referral tidak aktif'
            ], 200);
        }

        // Fixed 5% discount for all referrals (no role-based differences)
        $discountPercent = 5;

        return response()->json([
            'valid' => true,
            'discount_percent' => $discountPercent,
            'referrer_name' => $referrer->name,
            'referrer_id' => $referrer->id,
            'message' => "Kode referral valid! Anda mendapat diskon {$discountPercent}%"
        ], 200);
    }

    public function validateReferral(Request $request)
    {
        try {
            $request->validate([
                'code' => 'required|string',
                'plan' => 'required|string',
                'business_id' => 'required|integer',
            ]);

            // Find user with this referral code
            $referrer = User::where('referral_code', $request->code)->first();

            if (!$referrer) {
                return response()->json([
                    'success' => false,
                    'discount' => 0,
                    'message' => 'Kode referral tidak valid'
                ], 200);
            }

            // Check if referrer is active (check both status and is_active fields)
            if (($referrer->status && $referrer->status !== 'active') || (!$referrer->is_active)) {
                return response()->json([
                    'success' => false,
                    'discount' => 0,
                    'message' => 'Kode referral tidak aktif'
                ], 200);
            }

            // Get plan amount - DO NOT trust frontend values, get from backend config
            $planAmounts = [
                'monthly' => 49000,
                'quarterly' => 129000,
                'yearly' => 449000,
            ];

            $planAmount = $planAmounts[$request->plan] ?? 49000;

            // Fixed 5% discount for all referrals (not random)
            $discountPercent = 5;
            $discountAmount = floor($planAmount * ($discountPercent / 100));

            return response()->json([
                'success' => true,
                'discount' => $discountAmount,
                'discount_percent' => $discountPercent,
                'referrer_id' => $referrer->id,
                'referrer_name' => $referrer->name,
                'original_amount' => $planAmount,
                'final_amount' => $planAmount - $discountAmount,
                'message' => "Kode referral valid! Anda mendapat diskon {$discountPercent}% (Rp " . number_format($discountAmount, 0, ',', '.') . ")"
            ], 200);
        } catch (\Exception $e) {
            \Log::error('Referral validation error: ' . $e->getMessage(), [
                'request' => $request->all(),
                'trace' => $e->getTraceAsString()
            ]);
            
            return response()->json([
                'success' => false,
                'discount' => 0,
                'message' => 'Terjadi kesalahan saat memvalidasi kode referral'
            ], 500);
        }
    }

    public function generateReferralCodeForUser(Request $request)
    {
        $user = auth()->user();
        
        // Only admin can generate their own referral code, or admin can generate for others
        if ($user->role !== 'admin') {
            return response()->json([
                'message' => 'Unauthorized. Only admin can generate referral codes.'
            ], 403);
        }
        
        // Check if user already has referral code
        if ($user->referral_code) {
            return response()->json([
                'message' => 'User already has a referral code',
                'referral_code' => $user->referral_code
            ], 400);
        }
        
        // Generate new referral code
        $referralCode = $this->generateReferralCode($user);
        
        // Update user with new referral code
        $user->referral_code = $referralCode;
        $user->save();
        
        return response()->json([
            'message' => 'Referral code generated successfully',
            'referral_code' => $referralCode
        ]);
    }

    public function updateCustomReferralCode(Request $request)
    {
        $user = $request->user();

        $request->validate([
            'referral_code' => [
                'required',
                'string',
                'min:4',
                'max:30',
                'regex:/^[A-Za-z0-9\-_]+$/',
                'unique:users,referral_code,' . $user->id,
            ],
        ], [
            'referral_code.required' => 'Kode referral wajib diisi.',
            'referral_code.min' => 'Kode referral minimal 4 karakter.',
            'referral_code.max' => 'Kode referral maksimal 30 karakter.',
            'referral_code.regex' => 'Kode referral hanya boleh angka, huruf, dan tanda hubung.',
            'referral_code.unique' => 'Kode referral ini sudah digunakan oleh pengguna lain. Silakan pilih kode unik lain.',
        ]);

        $newCode = strtoupper(trim($request->referral_code));
        $user->referral_code = $newCode;
        $user->save();

        return response()->json([
            'success' => true,
            'message' => 'Kode referral Anda berhasil diperbarui!',
            'referral_code' => $newCode,
        ]);
    }

    public function generateReferralCode(User $user)
    {
        $words = preg_split('/\s+/', trim($user->name ?? ''));
        $firstName = !empty($words[0]) ? $words[0] : 'SRD';
        $clean = strtoupper(preg_replace('/[^A-Za-z0-9]/', '', $firstName));
        $threeLetters = strtoupper(substr($clean, 0, 3));
        if (strlen($threeLetters) < 3) {
            $threeLetters = str_pad($threeLetters, 3, 'X');
        }

        do {
            $code = "SURADE-{$threeLetters}-" . rand(100, 999);
        } while (User::where('referral_code', $code)->exists());

        return $code;
    }
}