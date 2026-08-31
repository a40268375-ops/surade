<?php

namespace App\Http\Controllers;

use App\Models\Business;
use App\Models\Subscription;
use App\Services\SubscriptionLifecycleService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Carbon;

class SubscriptionController extends Controller
{
    protected SubscriptionLifecycleService $lifecycleService;

    public function __construct(SubscriptionLifecycleService $lifecycleService)
    {
        $this->lifecycleService = $lifecycleService;
    }

    // List invoices: user sees their own, admin sees all
    public function index(Request $request)
    {
        $query = Subscription::with(['business', 'user']);

        if ($request->user()->role !== 'admin') {
            $query->where('user_id', $request->user()->id);
        }

        return response()->json($query->latest()->get());
    }

    // User berlangganan premium untuk salah satu bisnisnya.
    // Now uses SubscriptionLifecycleService for enhanced processing
    public function store(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'business_id' => 'required|exists:businesses,id',
            'plan' => 'required|string|in:monthly,quarterly,yearly',
            'payment_method' => 'required|string|in:dana,bni,bca',
            'proof' => 'required|image|max:5120', // max 5MB
            'referral_code' => 'sometimes|string|max:20',
            'notes' => 'sometimes|string|max:500'
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        $business = Business::find($request->business_id);

        if ($business->user_id !== $request->user()->id && $request->user()->role !== 'admin') {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        // Store proof file
        $proofPath = $request->file('proof')->store('payment-proofs', 'public');

        $subscriptionData = [
            'plan' => $request->plan,
            'payment_method' => $request->payment_method,
            'proof_path' => $proofPath,
            'referral_code' => $request->input('referral_code'),
            'notes' => $request->input('notes')
        ];

        $result = $this->lifecycleService->createSubscription(
            $request->user(),
            $business,
            $subscriptionData
        );

        if (!$result['success']) {
            return response()->json([
                'message' => $result['message'],
                'error' => $result['error'],
                'details' => $result['details'] ?? null
            ], 400);
        }

        return response()->json($result, 201);
    }

    public function show(Request $request, $id)
    {
        $subscription = Subscription::with(['business', 'user'])->find($id);

        if (!$subscription) {
            return response()->json(['message' => 'Invoice not found'], 404);
        }

        if ($subscription->user_id !== $request->user()->id && $request->user()->role !== 'admin') {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        return response()->json($subscription);
    }

    // Admin: menyetujui bukti pembayaran -> baru sekarang premium bisnisnya diaktifkan.
    // Now uses SubscriptionLifecycleService for proper activation
    public function verify(Request $request, $id)
    {
        if ($request->user()->role !== 'admin') {
            return response()->json(['message' => 'Forbidden'], 403);
        }

        $subscription = Subscription::with('business')->find($id);

        if (!$subscription) {
            return response()->json(['message' => 'Invoice not found'], 404);
        }

        if ($subscription->status !== 'pending') {
            return response()->json(['message' => 'Invoice ini sudah diproses sebelumnya.'], 422);
        }

        $result = $this->lifecycleService->activateSubscription($subscription, $request->user());

        if (!$result['success']) {
            return response()->json([
                'message' => $result['message'],
                'error' => $result['error']
            ], 400);
        }

        return response()->json($result);
    }

    // Admin: menolak bukti pembayaran (misalnya nominal tidak sesuai / bukti tidak jelas).
    public function reject(Request $request, $id)
    {
        if ($request->user()->role !== 'admin') {
            return response()->json(['message' => 'Forbidden'], 403);
        }

        $subscription = Subscription::find($id);

        if (!$subscription) {
            return response()->json(['message' => 'Invoice not found'], 404);
        }

        if ($subscription->status !== 'pending') {
            return response()->json(['message' => 'Invoice ini sudah diproses sebelumnya.'], 422);
        }

        $subscription->update([
            'status' => 'rejected',
            'verified_by' => $request->user()->id,
            'verified_at' => Carbon::now(),
            'rejection_reason' => $request->input('reason'),
        ]);

        return response()->json($subscription->fresh());
    }

    /**
     * Cancel subscription with lifecycle management
     */
    public function cancel(Request $request, $id)
    {
        $subscription = Subscription::find($id);

        if (!$subscription) {
            return response()->json(['message' => 'Subscription not found'], 404);
        }

        // Check authorization
        if ($subscription->user_id !== $request->user()->id && $request->user()->role !== 'admin') {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        if (!$subscription->canBeCancelled()) {
            return response()->json([
                'message' => 'Subscription tidak dapat dibatalkan',
                'current_status' => $subscription->status
            ], 422);
        }

        $validator = Validator::make($request->all(), [
            'reason' => 'sometimes|string|max:500'
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        $result = $this->lifecycleService->cancelSubscription(
            $subscription,
            $request->user(),
            $request->input('reason')
        );

        if (!$result['success']) {
            return response()->json([
                'message' => $result['message'],
                'error' => $result['error']
            ], 400);
        }

        return response()->json($result);
    }

    /**
     * Renew expired subscription
     */
    public function renew(Request $request, $id)
    {
        $expiredSubscription = Subscription::find($id);

        if (!$expiredSubscription) {
            return response()->json(['message' => 'Subscription not found'], 404);
        }

        // Check authorization
        if ($expiredSubscription->user_id !== $request->user()->id) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        if (!$expiredSubscription->canBeRenewed()) {
            return response()->json([
                'message' => 'Subscription tidak dapat diperpanjang',
                'current_status' => $expiredSubscription->status
            ], 422);
        }

        $validator = Validator::make($request->all(), [
            'plan' => 'required|string|in:monthly,quarterly,yearly',
            'payment_method' => 'required|string|in:dana,bni,bca',
            'proof' => 'required|image|max:5120',
            'referral_code' => 'sometimes|string'
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        // Store proof file
        $proofPath = $request->file('proof')->store('payment-proofs', 'public');

        $renewalData = [
            'plan' => $request->plan,
            'payment_method' => $request->payment_method,
            'proof_path' => $proofPath,
            'referral_code' => $request->input('referral_code'),
            'notes' => $request->input('notes')
        ];

        $result = $this->lifecycleService->renewSubscription($expiredSubscription, $renewalData);

        if (!$result['success']) {
            return response()->json([
                'message' => $result['message'],
                'error' => $result['error']
            ], 400);
        }

        return response()->json($result, 201);
    }

    /**
     * Get subscription analytics for user
     */
    public function analytics(Request $request)
    {
        $user = $request->user();
        $businessId = $request->query('business_id');
        
        $business = null;
        if ($businessId) {
            $business = Business::find($businessId);
            if (!$business || $business->user_id !== $user->id) {
                return response()->json(['message' => 'Business not found or unauthorized'], 404);
            }
        }

        $analytics = $this->lifecycleService->getSubscriptionAnalytics($user, $business);

        return response()->json([
            'analytics' => $analytics,
            'user_info' => [
                'id' => $user->id,
                'name' => $user->name,
                'is_premium' => $user->hasActivePremiumBusiness()
            ],
            'business_info' => $business ? [
                'id' => $business->id,
                'title' => $business->title,
                'is_premium' => $business->is_premium_active
            ] : null
        ]);
    }

    /**
     * Get subscription lifecycle details
     */
    public function lifecycle(Request $request, $id)
    {
        $subscription = Subscription::with([
            'business', 'user', 'cancelledBy', 'renewedBySubscription', 'renewalSubscriptions'
        ])->find($id);

        if (!$subscription) {
            return response()->json(['message' => 'Subscription not found'], 404);
        }

        // Check authorization
        if ($subscription->user_id !== $request->user()->id && $request->user()->role !== 'admin') {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        return response()->json([
            'subscription' => $subscription,
            'lifecycle_status' => [
                'is_active' => $subscription->isActive(),
                'is_expired' => $subscription->isExpired(),
                'is_cancelled' => $subscription->isCancelled(),
                'is_renewed' => $subscription->isRenewed(),
                'can_be_cancelled' => $subscription->canBeCancelled(),
                'can_be_renewed' => $subscription->canBeRenewed(),
                'days_until_expiration' => $subscription->getDaysUntilExpiration(),
                'usage_days' => $subscription->getUsageDays(),
                'refund_eligibility' => $subscription->getRefundEligibility()
            ],
            'lifecycle_events' => $subscription->lifecycle_events ?? [],
            'related_subscriptions' => [
                'renewed_from' => $subscription->renewedBySubscription,
                'renewed_to' => $subscription->renewalSubscriptions
            ]
        ]);
    }

    /**
     * Get subscription plans with enhanced details
     */
    public function plans()
    {
        return response()->json([
            'plans' => SubscriptionLifecycleService::PREMIUM_PLANS,
            'features_comparison' => [
                'free' => [
                    'businesses' => 1,
                    'photos_per_business' => 3,
                    'menu_items_per_business' => 10,
                    'announcements_per_business' => 2,
                    'videos_per_business' => 0,
                    'priority_listing' => false,
                    'advanced_analytics' => false,
                    'booking_system' => false
                ],
                'premium' => [
                    'businesses' => 'unlimited',
                    'photos_per_business' => 'unlimited',
                    'menu_items_per_business' => 'unlimited',
                    'announcements_per_business' => 'unlimited',
                    'videos_per_business' => 'unlimited',
                    'priority_listing' => true,
                    'advanced_analytics' => true,
                    'booking_system' => true
                ]
            ],
            'policies' => [
                'refund_policy' => 'Full refund within 7 days of activation',
                'cancellation_policy' => 'Cancel anytime, no questions asked',
                'renewal_policy' => 'Auto-renewal available, manual renewal supported'
            ]
        ]);
    }

    /**
     * Check expiring subscriptions (Admin only)
     */
    public function checkExpiring(Request $request)
    {
        if ($request->user()->role !== 'admin') {
            return response()->json(['message' => 'Forbidden'], 403);
        }

        $days = $request->query('days', 7); // Default to 7 days
        
        $expiringSubscriptions = Subscription::with(['business', 'user'])
            ->expiringWithin($days)
            ->get();

        return response()->json([
            'expiring_subscriptions' => $expiringSubscriptions,
            'count' => $expiringSubscriptions->count(),
            'days_ahead' => $days,
            'summary' => [
                'expiring_in_1_day' => $expiringSubscriptions->filter(fn($s) => $s->getDaysUntilExpiration() <= 1)->count(),
                'expiring_in_3_days' => $expiringSubscriptions->filter(fn($s) => $s->getDaysUntilExpiration() <= 3)->count(),
                'expiring_in_7_days' => $expiringSubscriptions->filter(fn($s) => $s->getDaysUntilExpiration() <= 7)->count()
            ]
        ]);
    }

    /**
     * Process expired subscriptions manually (Admin only)
     */
    public function processExpired(Request $request)
    {
        if ($request->user()->role !== 'admin') {
            return response()->json(['message' => 'Forbidden'], 403);
        }

        $result = $this->lifecycleService->processExpiredSubscriptions();

        return response()->json([
            'message' => 'Expired subscriptions processed successfully',
            'result' => $result
        ]);
    }
}