<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\User;
use App\Models\ReferralCommission;
use App\Models\Subscription;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

class ReferralManagementController extends Controller
{
    public function __construct()
    {
        $this->middleware('auth:sanctum');
        $this->middleware(function ($request, $next) {
            if (auth()->user()->role !== 'admin') {
                return response()->json(['message' => 'Unauthorized. Admin access required.'], 403);
            }
            return $next($request);
        });
    }

    // ================================
    // DASHBOARD STATISTICS
    // ================================
    
    public function getDashboardStats()
    {
        try {
            $stats = [
                'total_referral_codes' => User::whereNotNull('referral_code')->count(),
                'active_referral_codes' => User::whereNotNull('referral_code')
                    ->where('status', 'active')
                    ->where('is_active', true)
                    ->count(),
                'pending_transactions' => Subscription::where('referral_status', 'pending')->count(),
                'total_commission' => ReferralCommission::where('status', '!=', 'cancelled')->sum('commission_amount'),
                'total_usage' => Subscription::whereNotNull('referrer_id')->count(),
                'total_transactions' => Subscription::whereNotNull('referrer_id')
                    ->where('status', 'paid')
                    ->count(),
                'total_discount_given' => Subscription::whereNotNull('referrer_id')->sum('discount_amount'),
                'pending_commission' => ReferralCommission::where('status', 'pending')->sum('commission_amount'),
                'approved_commission' => ReferralCommission::where('status', 'approved')->sum('commission_amount'),
                'paid_commission' => ReferralCommission::where('status', 'paid')->sum('commission_amount'),
                'rejected_commission' => ReferralCommission::where('status', 'rejected')->sum('commission_amount'),
            ];

            return response()->json(['success' => true, 'data' => $stats]);
        } catch (\Exception $e) {
            Log::error('Error fetching referral dashboard stats: ' . $e->getMessage());
            return response()->json(['success' => false, 'message' => 'Error fetching statistics'], 500);
        }
    }

    // ================================
    // REFERRAL CODES MANAGEMENT
    // ================================

    public function getReferralCodes(Request $request)
    {
        try {
            $query = User::whereNotNull('referral_code')
                ->with(['businesses' => function ($q) {
                    $q->select('id', 'user_id', 'title');
                }]);

            // Search functionality
            if ($request->search) {
                $search = $request->search;
                $query->where(function ($q) use ($search) {
                    $q->where('name', 'LIKE', "%{$search}%")
                      ->orWhere('email', 'LIKE', "%{$search}%")
                      ->orWhere('referral_code', 'LIKE', "%{$search}%");
                });
            }

            // Status filter
            if ($request->status && $request->status !== 'all') {
                if ($request->status === 'active') {
                    $query->where('status', 'active')->where('is_active', true);
                } elseif ($request->status === 'inactive') {
                    $query->where(function ($q) {
                        $q->where('status', '!=', 'active')->orWhere('is_active', false);
                    });
                }
            }

            $referrals = $query->paginate($request->per_page ?? 10);

            // Add usage statistics for each referral
            $referrals->getCollection()->transform(function ($user) {
                $user->usage_count = Subscription::where('referrer_id', $user->id)->count();
                $user->transaction_count = Subscription::where('referrer_id', $user->id)
                    ->where('status', 'paid')
                    ->count();
                $user->total_commission = ReferralCommission::where('referrer_id', $user->id)
                    ->where('status', '!=', 'cancelled')
                    ->sum('commission_amount');
                return $user;
            });

            return response()->json(['success' => true, 'data' => $referrals]);
        } catch (\Exception $e) {
            Log::error('Error fetching referral codes: ' . $e->getMessage());
            return response()->json(['success' => false, 'message' => 'Error fetching referral codes'], 500);
        }
    }

    public function getReferralDetail($id)
    {
        try {
            $user = User::with(['businesses'])
                ->whereNotNull('referral_code')
                ->findOrFail($id);

            // Get usage statistics
            $stats = [
                'total_usage' => Subscription::where('referrer_id', $user->id)->count(),
                'total_transactions' => Subscription::where('referrer_id', $user->id)
                    ->where('status', 'paid')
                    ->count(),
                'total_commission' => ReferralCommission::where('referrer_id', $user->id)
                    ->where('status', '!=', 'cancelled')
                    ->sum('commission_amount'),
                'pending_commission' => ReferralCommission::where('referrer_id', $user->id)
                    ->where('status', 'pending')
                    ->sum('commission_amount'),
            ];

            // Get users who used this referral code
            $referral_users = Subscription::with(['user', 'business'])
                ->where('referrer_id', $user->id)
                ->orderBy('created_at', 'desc')
                ->limit(10)
                ->get();

            // Get recent transactions
            $transactions = Subscription::with(['user', 'business', 'referralCommission'])
                ->where('referrer_id', $user->id)
                ->orderBy('created_at', 'desc')
                ->limit(10)
                ->get();

            // Get commissions
            $commissions = ReferralCommission::with(['referredUser', 'business', 'subscription'])
                ->where('referrer_id', $user->id)
                ->orderBy('created_at', 'desc')
                ->limit(10)
                ->get();

            return response()->json([
                'success' => true,
                'data' => [
                    'user' => $user,
                    'statistics' => $stats,
                    'referral_users' => $referral_users,
                    'transactions' => $transactions,
                    'commissions' => $commissions,
                ]
            ]);
        } catch (\Exception $e) {
            Log::error('Error fetching referral detail: ' . $e->getMessage());
            return response()->json(['success' => false, 'message' => 'Referral not found'], 404);
        }
    }

    public function updateReferralCode(Request $request, $id)
    {
        $request->validate([
            'referral_code' => 'sometimes|required|string|min:4|max:30|unique:users,referral_code,' . $id,
            'status' => 'sometimes|nullable|string',
            'is_active' => 'sometimes|nullable|boolean',
        ]);

        try {
            $user = User::findOrFail($id);
            
            $oldCode = $user->referral_code;
            if ($request->filled('referral_code')) {
                $user->referral_code = strtoupper(trim($request->referral_code));
            }
            
            if ($request->has('is_active')) {
                $user->is_active = (bool) $request->is_active;
            }

            if ($request->has('status')) {
                if ($request->status === 'active') {
                    $user->status = 'active';
                    $user->is_active = true;
                } elseif ($request->status === 'inactive') {
                    $user->is_active = false;
                } elseif ($request->status === 'suspended') {
                    $user->status = 'suspended';
                    $user->is_active = false;
                }
            }
            
            $user->save();

            Log::info('Referral code updated by admin', [
                'admin_id' => auth()->id(),
                'user_id' => $user->id,
                'old_code' => $oldCode,
                'new_code' => $user->referral_code,
                'status' => $request->status
            ]);

            return response()->json([
                'success' => true,
                'message' => 'Referral code updated successfully',
                'data' => $user
            ]);
        } catch (\Exception $e) {
            Log::error('Error updating referral code: ' . $e->getMessage());
            return response()->json(['success' => false, 'message' => 'Error updating referral code'], 500);
        }
    }

    public function generateReferralCode(Request $request)
    {
        $request->validate([
            'user_id' => 'required|exists:users,id',
        ]);

        try {
            $user = User::findOrFail($request->user_id);
            
            if ($user->referral_code) {
                return response()->json([
                    'success' => false,
                    'message' => 'User already has a referral code'
                ], 400);
            }

            $words = preg_split('/\s+/', trim($user->name ?? ''));
            $firstName = !empty($words[0]) ? $words[0] : 'SRD';
            $cleanFirstName = strtoupper(preg_replace('/[^A-Za-z0-9]/', '', $firstName));
            $threeLetters = strtoupper(substr($cleanFirstName, 0, 3));
            if (strlen($threeLetters) < 3) {
                $threeLetters = str_pad($threeLetters, 3, 'X');
            }

            // Generate unique referral code with SURADE-[3LETTERS]-[RANDOM]
            do {
                $code = "SURADE-{$threeLetters}-" . rand(100, 999);
            } while (User::where('referral_code', $code)->exists());

            $user->referral_code = $code;
            $user->save();

            Log::info('Referral code generated by admin', [
                'admin_id' => auth()->id(),
                'user_id' => $user->id,
                'referral_code' => $code
            ]);

            return response()->json([
                'success' => true,
                'message' => 'Referral code generated successfully',
                'data' => $user
            ]);
        } catch (\Exception $e) {
            Log::error('Error generating referral code: ' . $e->getMessage());
            return response()->json(['success' => false, 'message' => 'Error generating referral code'], 500);
        }
    }

    public function regenerateReferralCode(Request $request, $id)
    {
        try {
            $user = User::findOrFail($id);
            $oldCode = $user->referral_code;

            $words = preg_split('/\s+/', trim($user->name ?? ''));
            $firstName = !empty($words[0]) ? $words[0] : 'SRD';
            $cleanFirstName = strtoupper(preg_replace('/[^A-Za-z0-9]/', '', $firstName));
            $threeLetters = strtoupper(substr($cleanFirstName, 0, 3));
            if (strlen($threeLetters) < 3) {
                $threeLetters = str_pad($threeLetters, 3, 'X');
            }

            // Generate new unique referral code with SURADE-[3LETTERS]-[RANDOM]
            do {
                $code = "SURADE-{$threeLetters}-" . rand(100, 999);
            } while (User::where('referral_code', $code)->exists());

            $user->referral_code = $code;
            $user->save();

            Log::info('Referral code regenerated by admin', [
                'admin_id' => auth()->id(),
                'user_id' => $user->id,
                'old_code' => $oldCode,
                'new_code' => $code
            ]);

            return response()->json([
                'success' => true,
                'message' => 'Referral code regenerated successfully',
                'data' => $user
            ]);
        } catch (\Exception $e) {
            Log::error('Error regenerating referral code: ' . $e->getMessage());
            return response()->json(['success' => false, 'message' => 'Error regenerating referral code'], 500);
        }
    }

    // ================================
    // REFERRAL TRANSACTIONS MANAGEMENT
    // ================================

    public function getReferralTransactions(Request $request)
    {
        try {
            $query = Subscription::with([
                'user',
                'business', 
                'referrer',
                'transaction',
                'referralCommission'
            ])->whereNotNull('referrer_id');

            // Search functionality
            if ($request->search) {
                $search = $request->search;
                $query->where(function ($q) use ($search) {
                    $q->where('invoice_number', 'LIKE', "%{$search}%")
                      ->orWhereHas('user', function ($sq) use ($search) {
                          $sq->where('name', 'LIKE', "%{$search}%")
                            ->orWhere('email', 'LIKE', "%{$search}%");
                      })
                      ->orWhereHas('referrer', function ($sq) use ($search) {
                          $sq->where('name', 'LIKE', "%{$search}%")
                            ->orWhere('referral_code', 'LIKE', "%{$search}%");
                      });
                });
            }

            // Payment status filter
            if ($request->payment_status && $request->payment_status !== 'all') {
                $query->where('status', $request->payment_status);
            }

            // Referral status filter
            if ($request->referral_status && $request->referral_status !== 'all') {
                $query->where('referral_status', $request->referral_status);
            }

            // Plan filter
            if ($request->plan && $request->plan !== 'all') {
                $query->where('plan', $request->plan);
            }

            // Referrer filter
            if ($request->referrer_id && $request->referrer_id !== 'all') {
                $query->where('referrer_id', $request->referrer_id);
            }

            // Date range filter
            if ($request->date_from) {
                $query->whereDate('created_at', '>=', $request->date_from);
            }
            if ($request->date_to) {
                $query->whereDate('created_at', '<=', $request->date_to);
            }

            $transactions = $query->orderBy('created_at', 'desc')
                ->paginate($request->per_page ?? 15);

            return response()->json(['success' => true, 'data' => $transactions]);
        } catch (\Exception $e) {
            Log::error('Error fetching referral transactions: ' . $e->getMessage());
            return response()->json(['success' => false, 'message' => 'Error fetching transactions'], 500);
        }
    }

    public function approveReferralTransaction(Request $request, $id)
    {
        try {
            $subscription = Subscription::with(['referralCommission'])->findOrFail($id);

            if ($subscription->referral_status === 'approved') {
                return response()->json([
                    'success' => false,
                    'message' => 'Referral transaction already approved'
                ], 400);
            }

            if ($subscription->status !== 'paid') {
                return response()->json([
                    'success' => false,
                    'message' => 'Payment must be completed before approving referral'
                ], 400);
            }

            DB::beginTransaction();
            
            // Update subscription referral status
            $subscription->update([
                'referral_status' => 'approved',
                'referral_approved_at' => now(),
                'referral_approved_by' => auth()->id()
            ]);

            // Create or update commission if it doesn't exist
            if (!$subscription->referralCommission) {
                $finalAmount = $subscription->amount;
                $commissionPercent = 15;
                $commissionAmount = floor($finalAmount * ($commissionPercent / 100));

                ReferralCommission::create([
                    'referrer_id' => $subscription->referrer_id,
                    'referred_user_id' => $subscription->user_id,
                    'business_id' => $subscription->business_id,
                    'subscription_id' => $subscription->id,
                    'transaction_id' => $subscription->invoice_number,
                    'discount_amount' => $subscription->discount_amount,
                    'commission_amount' => $commissionAmount,
                    'commission_percent' => $commissionPercent,
                    'original_commission_amount' => $commissionAmount,
                    'final_commission_amount' => $commissionAmount,
                    'status' => 'pending',
                ]);
            }

            DB::commit();

            Log::info('Referral transaction approved by admin', [
                'admin_id' => auth()->id(),
                'subscription_id' => $subscription->id,
                'referrer_id' => $subscription->referrer_id
            ]);

            return response()->json([
                'success' => true,
                'message' => 'Referral transaction approved successfully'
            ]);
        } catch (\Exception $e) {
            DB::rollBack();
            Log::error('Error approving referral transaction: ' . $e->getMessage());
            return response()->json(['success' => false, 'message' => 'Error approving transaction'], 500);
        }
    }

    public function rejectReferralTransaction(Request $request, $id)
    {
        $request->validate([
            'reason' => 'required|string|max:1000'
        ]);

        try {
            $subscription = Subscription::findOrFail($id);

            if ($subscription->referral_status === 'rejected') {
                return response()->json([
                    'success' => false,
                    'message' => 'Referral transaction already rejected'
                ], 400);
            }

            DB::beginTransaction();

            // Update subscription referral status
            $subscription->update([
                'referral_status' => 'rejected',
                'referral_rejected_at' => now(),
                'referral_rejected_by' => auth()->id(),
                'referral_rejection_reason' => $request->reason
            ]);

            // Cancel any existing commission
            if ($subscription->referralCommission) {
                $subscription->referralCommission->update([
                    'status' => 'cancelled',
                    'rejected_at' => now(),
                    'rejected_by' => auth()->id(),
                    'rejection_reason' => $request->reason
                ]);
            }

            DB::commit();

            Log::info('Referral transaction rejected by admin', [
                'admin_id' => auth()->id(),
                'subscription_id' => $subscription->id,
                'reason' => $request->reason
            ]);

            return response()->json([
                'success' => true,
                'message' => 'Referral transaction rejected successfully'
            ]);
        } catch (\Exception $e) {
            DB::rollBack();
            Log::error('Error rejecting referral transaction: ' . $e->getMessage());
            return response()->json(['success' => false, 'message' => 'Error rejecting transaction'], 500);
        }
    }

    // ================================
    // COMMISSION MANAGEMENT
    // ================================

    public function getReferralCommissions(Request $request)
    {
        try {
            $query = ReferralCommission::with([
                'referrer',
                'referredUser',
                'business',
                'subscription',
                'approvedBy',
                'rejectedBy',
                'paidBy',
                'adjustedBy'
            ]);

            // Search functionality
            if ($request->search) {
                $search = $request->search;
                $query->where(function ($q) use ($search) {
                    $q->where('transaction_id', 'LIKE', "%{$search}%")
                      ->orWhereHas('referrer', function ($sq) use ($search) {
                          $sq->where('name', 'LIKE', "%{$search}%")
                            ->orWhere('email', 'LIKE', "%{$search}%");
                      })
                      ->orWhereHas('referredUser', function ($sq) use ($search) {
                          $sq->where('name', 'LIKE', "%{$search}%");
                      });
                });
            }

            // Status filter
            if ($request->status && $request->status !== 'all') {
                $query->where('status', $request->status);
            }

            // Referrer filter
            if ($request->referrer_id && $request->referrer_id !== 'all') {
                $query->where('referrer_id', $request->referrer_id);
            }

            // Date range filter
            if ($request->date_from) {
                $query->whereDate('created_at', '>=', $request->date_from);
            }
            if ($request->date_to) {
                $query->whereDate('created_at', '<=', $request->date_to);
            }

            $commissions = $query->orderBy('created_at', 'desc')
                ->paginate($request->per_page ?? 15);

            return response()->json(['success' => true, 'data' => $commissions]);
        } catch (\Exception $e) {
            Log::error('Error fetching referral commissions: ' . $e->getMessage());
            return response()->json(['success' => false, 'message' => 'Error fetching commissions'], 500);
        }
    }

    public function approveCommission(Request $request, $id)
    {
        try {
            $commission = ReferralCommission::findOrFail($id);

            if ($commission->status === 'approved' || $commission->status === 'paid') {
                return response()->json([
                    'success' => false,
                    'message' => 'Commission already processed'
                ], 400);
            }

            $commission->update([
                'status' => 'approved',
                'approved_at' => now(),
                'approved_by' => auth()->id()
            ]);

            Log::info('Commission approved by admin', [
                'admin_id' => auth()->id(),
                'commission_id' => $commission->id,
                'referrer_id' => $commission->referrer_id
            ]);

            return response()->json([
                'success' => true,
                'message' => 'Commission approved successfully'
            ]);
        } catch (\Exception $e) {
            Log::error('Error approving commission: ' . $e->getMessage());
            return response()->json(['success' => false, 'message' => 'Error approving commission'], 500);
        }
    }

    public function rejectCommission(Request $request, $id)
    {
        $request->validate([
            'reason' => 'required|string|max:1000'
        ]);

        try {
            $commission = ReferralCommission::findOrFail($id);

            if ($commission->status === 'rejected') {
                return response()->json([
                    'success' => false,
                    'message' => 'Commission already rejected'
                ], 400);
            }

            $commission->update([
                'status' => 'rejected',
                'rejected_at' => now(),
                'rejected_by' => auth()->id(),
                'rejection_reason' => $request->reason
            ]);

            Log::info('Commission rejected by admin', [
                'admin_id' => auth()->id(),
                'commission_id' => $commission->id,
                'reason' => $request->reason
            ]);

            return response()->json([
                'success' => true,
                'message' => 'Commission rejected successfully'
            ]);
        } catch (\Exception $e) {
            Log::error('Error rejecting commission: ' . $e->getMessage());
            return response()->json(['success' => false, 'message' => 'Error rejecting commission'], 500);
        }
    }

    public function markCommissionPaid(Request $request, $id)
    {
        try {
            $commission = ReferralCommission::findOrFail($id);

            if ($commission->status === 'paid') {
                return response()->json([
                    'success' => false,
                    'message' => 'Commission already marked as paid'
                ], 400);
            }

            if ($commission->status !== 'approved') {
                return response()->json([
                    'success' => false,
                    'message' => 'Commission must be approved before marking as paid'
                ], 400);
            }

            $commission->update([
                'status' => 'paid',
                'paid_at' => now(),
                'paid_by' => auth()->id()
            ]);

            Log::info('Commission marked as paid by admin', [
                'admin_id' => auth()->id(),
                'commission_id' => $commission->id,
                'referrer_id' => $commission->referrer_id
            ]);

            return response()->json([
                'success' => true,
                'message' => 'Commission marked as paid successfully'
            ]);
        } catch (\Exception $e) {
            Log::error('Error marking commission as paid: ' . $e->getMessage());
            return response()->json(['success' => false, 'message' => 'Error updating commission'], 500);
        }
    }

    public function adjustCommission(Request $request, $id)
    {
        $request->validate([
            'adjustment_amount' => 'required|numeric',
            'reason' => 'required|string|max:1000'
        ]);

        try {
            $commission = ReferralCommission::findOrFail($id);

            if ($commission->status === 'paid') {
                return response()->json([
                    'success' => false,
                    'message' => 'Cannot adjust paid commission'
                ], 400);
            }

            $originalAmount = $commission->original_commission_amount ?? $commission->commission_amount;
            $adjustmentAmount = $request->adjustment_amount;
            $finalAmount = $originalAmount + $adjustmentAmount;

            if ($finalAmount < 0) {
                return response()->json([
                    'success' => false,
                    'message' => 'Final commission amount cannot be negative'
                ], 400);
            }

            $commission->update([
                'original_commission_amount' => $originalAmount,
                'adjustment_amount' => $adjustmentAmount,
                'final_commission_amount' => $finalAmount,
                'adjustment_reason' => $request->reason,
                'adjusted_at' => now(),
                'adjusted_by' => auth()->id()
            ]);

            Log::info('Commission adjusted by admin', [
                'admin_id' => auth()->id(),
                'commission_id' => $commission->id,
                'original_amount' => $originalAmount,
                'adjustment_amount' => $adjustmentAmount,
                'final_amount' => $finalAmount,
                'reason' => $request->reason
            ]);

            return response()->json([
                'success' => true,
                'message' => 'Commission adjusted successfully',
                'data' => $commission->fresh()
            ]);
        } catch (\Exception $e) {
            Log::error('Error adjusting commission: ' . $e->getMessage());
            return response()->json(['success' => false, 'message' => 'Error adjusting commission'], 500);
        }
    }

    // ================================
    // REFERRAL SETTINGS
    // ================================

    public function getReferralSettings()
    {
        // For now, return hardcoded settings. In the future, these could be stored in a settings table
        $settings = [
            'referral_system_enabled' => true,
            'referral_discount_percent' => 5,
            'referral_commission_percent' => 15,
            'approval_required' => true,
            'referral_only_for_premium' => true,
            'referral_code_format' => 'REF-{RANDOM}',
            'minimum_transaction_amount' => null,
            'maximum_commission_amount' => null,
            'commission_payout_method' => 'manual',
        ];

        return response()->json(['success' => true, 'data' => $settings]);
    }

    public function updateReferralSettings(Request $request)
    {
        $request->validate([
            'referral_system_enabled' => 'required|boolean',
            'referral_discount_percent' => 'required|numeric|min:0|max:100',
            'referral_commission_percent' => 'required|numeric|min:0|max:100',
            'approval_required' => 'required|boolean',
            'referral_only_for_premium' => 'required|boolean',
            'referral_code_format' => 'required|string',
            'minimum_transaction_amount' => 'nullable|numeric|min:0',
            'maximum_commission_amount' => 'nullable|numeric|min:0',
            'commission_payout_method' => 'required|in:manual,automatic',
        ]);

        try {
            // In a real implementation, save these settings to a database table
            // For now, just return success (settings are hardcoded in business logic)
            
            Log::info('Referral settings updated by admin', [
                'admin_id' => auth()->id(),
                'settings' => $request->all()
            ]);

            return response()->json([
                'success' => true,
                'message' => 'Referral settings updated successfully'
            ]);
        } catch (\Exception $e) {
            Log::error('Error updating referral settings: ' . $e->getMessage());
            return response()->json(['success' => false, 'message' => 'Error updating settings'], 500);
        }
    }

    // ================================
    // HELPER METHODS
    // ================================

    public function getReferrers()
    {
        try {
            $referrers = User::whereNotNull('referral_code')
                ->where('status', 'active')
                ->select('id', 'name', 'email', 'referral_code')
                ->orderBy('name')
                ->get();

            return response()->json(['success' => true, 'data' => $referrers]);
        } catch (\Exception $e) {
            Log::error('Error fetching referrers: ' . $e->getMessage());
            return response()->json(['success' => false, 'message' => 'Error fetching referrers'], 500);
        }
    }

    public function getAvailableUsers()
    {
        try {
            $users = User::whereNull('referral_code')
                ->where('status', 'active')
                ->select('id', 'name', 'email')
                ->orderBy('name')
                ->get();

            return response()->json(['success' => true, 'data' => $users]);
        } catch (\Exception $e) {
            Log::error('Error fetching available users: ' . $e->getMessage());
            return response()->json(['success' => false, 'message' => 'Error fetching users'], 500);
        }
    }
}