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
        $user = $request->user();

        $baseQuery = ReferralCommission::where('referrer_id', $user->id);

        $totalUsage = (clone $baseQuery)->distinct()->count('referred_user_id');
        $totalTransaksi = (clone $baseQuery)->count();

        $commissionByStatus = (clone $baseQuery)
            ->selectRaw('status, COUNT(*) as total, SUM(COALESCE(final_commission_amount, commission_amount)) as amount')
            ->groupBy('status')
            ->get()
            ->keyBy('status');

        $statuses = ['pending', 'approved', 'paid', 'rejected', 'cancelled'];
        $commissionSummary = [];
        foreach ($statuses as $status) {
            $row = $commissionByStatus->get($status);
            $commissionSummary[$status] = [
                'total_transaksi' => $row ? (int) $row->total : 0,
                'total_komisi' => $row ? (float) $row->amount : 0,
            ];
        }

        $totalKomisiDiterima = $commissionSummary['approved']['total_komisi'] + $commissionSummary['paid']['total_komisi'];
        $totalKomisiDibayar = $commissionSummary['paid']['total_komisi'];

        $riwayatTerbaru = (clone $baseQuery)
            ->with(['referredUser:id,name,email', 'business:id,name'])
            ->latest()
            ->take(10)
            ->get()
            ->map(function ($c) {
                return [
                    'id' => $c->id,
                    'transaction_id' => $c->transaction_id,
                    'referred_user' => $c->referredUser?->name,
                    'business' => $c->business?->name,
                    'discount_amount' => (float) $c->discount_amount,
                    'commission_amount' => (float) ($c->final_commission_amount ?? $c->commission_amount),
                    'status' => $c->status,
                    'created_at' => $c->created_at,
                ];
            });

        return response()->json([
            'success' => true,
            'data' => [
                'referral_code' => $user->referral_code,
                'has_referral_code' => (bool) $user->referral_code,
                'discount_percent' => 5,
                'commission_percent' => 15,
                'total_penggunaan' => $totalUsage,
                'total_transaksi' => $totalTransaksi,
                'total_komisi_diterima' => $totalKomisiDiterima,
                'total_komisi_dibayar' => $totalKomisiDibayar,
                'komisi_per_status' => $commissionSummary,
                'riwayat_terbaru' => $riwayatTerbaru,
            ],
        ]);
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

    public function generateReferralCode(User $user)
    {
        // Generate unique 8-character referral code
        do {
            $code = 'REF' . strtoupper(substr(md5(uniqid()), 0, 5));
        } while (User::where('referral_code', $code)->exists());

        return $code;
    }
}