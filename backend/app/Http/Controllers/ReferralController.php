<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\User;

class ReferralController extends Controller
{
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
            ], 200); // Return 200, not 404
        }

        // Check if referrer is active and has referral privileges
        if ($referrer->status !== 'active') {
            return response()->json([
                'valid' => false,
                'discount_percent' => 0,
                'message' => 'Kode referral tidak aktif'
            ], 200); // Return 200, not 400
        }

        // Return discount percentage (you can customize this logic)
        $discountPercent = 10; // Default 10% discount
        
        // Admin or reseller might have higher discount
        if ($referrer->role === 'admin') {
            $discountPercent = 15;
        } elseif ($referrer->role === 'reseller') {
            $discountPercent = 12;
        }

        return response()->json([
            'valid' => true,
            'discount_percent' => $discountPercent,
            'referrer_name' => $referrer->name,
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

            // Get plan amount
            $planAmounts = [
                'monthly' => 49000,
                'quarterly' => 129000,
                'yearly' => 449000,
            ];

            $planAmount = $planAmounts[$request->plan] ?? 49000;

            // Calculate random discount between 10-50%
            $discountPercent = rand(10, 50);
            $discountAmount = floor($planAmount * ($discountPercent / 100));

            return response()->json([
                'success' => true,
                'discount' => $discountAmount,
                'discount_percent' => $discountPercent,
                'referrer_id' => $referrer->id,
                'referrer_name' => $referrer->name,
                'message' => "Kode referral valid! Anda mendapat diskon {$discountPercent}% (Rp {$discountAmount})"
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

    public function generateReferralCode(User $user)
    {
        // Generate unique 8-character referral code
        do {
            $code = 'REF' . strtoupper(substr(md5(uniqid()), 0, 5));
        } while (User::where('referral_code', $code)->exists());

        return $code;
    }
}