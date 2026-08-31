<?php

namespace App\Services;

use App\Models\User;
use App\Models\Business;
use App\Models\Subscription;
use App\Models\ReferralCommission;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Str;

/**
 * Comprehensive subscription lifecycle management service
 * Handles creation, activation, renewal, cancellation, expiration, and notifications
 */
class SubscriptionLifecycleService
{
    protected PremiumFeatureService $premiumService;

    public function __construct(PremiumFeatureService $premiumService)
    {
        $this->premiumService = $premiumService;
    }

    // Plan definitions with enhanced metadata
    public const PREMIUM_PLANS = [
        'monthly' => [
            'label' => 'Premium Bulanan',
            'duration_days' => 30,
            'amount' => 150000,
            'original_amount' => 150000,
            'discount_percentage' => 0,
            'popular' => false,
            'features' => ['unlimited_photos', 'unlimited_menu_items', 'video_showcase', 'priority_listing'],
            'recommended_for' => 'Bisnis yang ingin mencoba Premium'
        ],
        'quarterly' => [
            'label' => 'Premium 3 Bulan',
            'duration_days' => 90,
            'amount' => 399000,
            'original_amount' => 450000,
            'discount_percentage' => 11,
            'popular' => true,
            'features' => ['unlimited_photos', 'unlimited_menu_items', 'video_showcase', 'priority_listing', 'advanced_analytics'],
            'recommended_for' => 'Pilihan paling populer untuk bisnis berkembang'
        ],
        'yearly' => [
            'label' => 'Premium Tahunan',
            'duration_days' => 365,
            'amount' => 1500000,
            'original_amount' => 1800000,
            'discount_percentage' => 17,
            'popular' => false,
            'features' => ['unlimited_photos', 'unlimited_menu_items', 'video_showcase', 'priority_listing', 'advanced_analytics', 'booking_system'],
            'recommended_for' => 'Bisnis serius dengan komitmen jangka panjang'
        ]
    ];

    /**
     * Create new subscription with enhanced validation and processing
     */
    public function createSubscription(User $user, Business $business, array $subscriptionData): array
    {
        DB::beginTransaction();
        
        try {
            // Validate subscription eligibility
            $eligibilityCheck = $this->validateSubscriptionEligibility($user, $business, $subscriptionData);
            if (!$eligibilityCheck['eligible']) {
                return [
                    'success' => false,
                    'error' => 'ELIGIBILITY_FAILED',
                    'message' => $eligibilityCheck['reason'],
                    'details' => $eligibilityCheck
                ];
            }

            // Calculate pricing with discounts and referrals
            $pricingDetails = $this->calculateSubscriptionPricing($subscriptionData);
            
            // Handle referral code if provided
            $referralData = null;
            if (!empty($subscriptionData['referral_code'])) {
                $referralData = $this->processReferralCode($subscriptionData['referral_code'], $user);
                if ($referralData && $referralData['valid']) {
                    $pricingDetails['discount_amount'] += $referralData['discount_amount'];
                    $pricingDetails['final_amount'] = $pricingDetails['original_amount'] - $pricingDetails['discount_amount'];
                }
            }

            // Create subscription record
            $subscription = Subscription::create([
                'invoice_number' => $this->generateInvoiceNumber(),
                'user_id' => $user->id,
                'business_id' => $business->id,
                'plan' => $subscriptionData['plan'],
                'duration_days' => $pricingDetails['duration_days'],
                'amount' => $pricingDetails['final_amount'],
                'original_amount' => $pricingDetails['original_amount'],
                'discount_amount' => $pricingDetails['discount_amount'],
                'referral_code' => $subscriptionData['referral_code'] ?? null,
                'referrer_id' => $referralData['referrer_id'] ?? null,
                'referral_status' => $referralData ? 'pending' : null,
                'payment_method' => $subscriptionData['payment_method'],
                'notes' => $subscriptionData['notes'] ?? null,
                'proof_path' => $subscriptionData['proof_path'] ?? null,
                'status' => 'pending'
            ]);

            // Schedule lifecycle events
            $this->scheduleLifecycleEvents($subscription);
            
            DB::commit();

            return [
                'success' => true,
                'subscription' => $subscription->fresh(['business', 'user']),
                'pricing_details' => $pricingDetails,
                'referral_applied' => $referralData !== null
            ];

        } catch (\Exception $e) {
            DB::rollback();
            Log::error('Subscription creation failed', [
                'user_id' => $user->id,
                'business_id' => $business->id,
                'error' => $e->getMessage()
            ]);

            return [
                'success' => false,
                'error' => 'CREATION_FAILED',
                'message' => 'Gagal membuat subscription: ' . $e->getMessage()
            ];
        }
    }

    /**
     * Activate subscription after payment verification
     */
    public function activateSubscription(Subscription $subscription, User $verifiedBy): array
    {
        DB::beginTransaction();
        
        try {
            if ($subscription->status !== 'pending') {
                return [
                    'success' => false,
                    'error' => 'INVALID_STATUS',
                    'message' => 'Subscription sudah diproses sebelumnya'
                ];
            }

            $business = $subscription->business;
            
            // Calculate start and end dates
            $startDate = Carbon::now();
            $endDate = $this->calculateSubscriptionEndDate($business, $subscription->duration_days);

            // Update subscription status
            $subscription->update([
                'status' => 'active',
                'starts_at' => $startDate,
                'expires_at' => $endDate,
                'verified_by' => $verifiedBy->id,
                'verified_at' => Carbon::now()
            ]);

            // Activate premium for business
            $business->update([
                'is_premium' => true,
                'premium_expires_at' => $endDate,
                'premium_plan' => $subscription->plan
            ]);

            // Process referral commission if applicable
            if ($subscription->hasReferral()) {
                $this->processReferralCommission($subscription);
            }

            // Send activation notifications
            $this->sendSubscriptionActivatedNotification($subscription);
            
            // Schedule expiration reminders
            $this->scheduleExpirationReminders($subscription);

            DB::commit();

            return [
                'success' => true,
                'subscription' => $subscription->fresh(),
                'business' => $business->fresh(),
                'activated_at' => $startDate,
                'expires_at' => $endDate
            ];

        } catch (\Exception $e) {
            DB::rollback();
            Log::error('Subscription activation failed', [
                'subscription_id' => $subscription->id,
                'error' => $e->getMessage()
            ]);

            return [
                'success' => false,
                'error' => 'ACTIVATION_FAILED',
                'message' => 'Gagal mengaktifkan subscription: ' . $e->getMessage()
            ];
        }
    }

    /**
     * Process subscription renewal
     */
    public function renewSubscription(Subscription $expiredSubscription, array $renewalData): array
    {
        DB::beginTransaction();
        
        try {
            // Create new subscription for renewal
            $newSubscriptionResult = $this->createSubscription(
                $expiredSubscription->user,
                $expiredSubscription->business,
                array_merge($renewalData, [
                    'is_renewal' => true,
                    'previous_subscription_id' => $expiredSubscription->id
                ])
            );

            if (!$newSubscriptionResult['success']) {
                return $newSubscriptionResult;
            }

            // Mark expired subscription as renewed
            $expiredSubscription->update([
                'status' => 'renewed',
                'renewed_at' => Carbon::now(),
                'renewed_by_subscription_id' => $newSubscriptionResult['subscription']->id
            ]);

            DB::commit();

            return [
                'success' => true,
                'new_subscription' => $newSubscriptionResult['subscription'],
                'expired_subscription' => $expiredSubscription->fresh(),
                'message' => 'Subscription berhasil diperpanjang'
            ];

        } catch (\Exception $e) {
            DB::rollback();
            Log::error('Subscription renewal failed', [
                'subscription_id' => $expiredSubscription->id,
                'error' => $e->getMessage()
            ]);

            return [
                'success' => false,
                'error' => 'RENEWAL_FAILED',
                'message' => 'Gagal memperpanjang subscription: ' . $e->getMessage()
            ];
        }
    }

    /**
     * Cancel active subscription
     */
    public function cancelSubscription(Subscription $subscription, User $cancelledBy, string $reason = null): array
    {
        DB::beginTransaction();
        
        try {
            if (!in_array($subscription->status, ['active', 'pending'])) {
                return [
                    'success' => false,
                    'error' => 'INVALID_STATUS',
                    'message' => 'Subscription tidak dapat dibatalkan'
                ];
            }

            // Calculate refund if applicable
            $refundDetails = $this->calculateCancellationRefund($subscription);

            // Update subscription
            $subscription->update([
                'status' => 'cancelled',
                'cancelled_at' => Carbon::now(),
                'cancelled_by' => $cancelledBy->id,
                'cancellation_reason' => $reason,
                'refund_amount' => $refundDetails['refund_amount'],
                'refund_eligible' => $refundDetails['eligible']
            ]);

            // Deactivate premium if subscription was active
            if ($subscription->status === 'active') {
                $business = $subscription->business;
                $business->update([
                    'is_premium' => false,
                    'premium_expires_at' => Carbon::now(),
                    'premium_plan' => null
                ]);
            }

            // Send cancellation notification
            $this->sendSubscriptionCancelledNotification($subscription, $refundDetails);

            DB::commit();

            return [
                'success' => true,
                'subscription' => $subscription->fresh(),
                'refund_details' => $refundDetails,
                'message' => 'Subscription berhasil dibatalkan'
            ];

        } catch (\Exception $e) {
            DB::rollback();
            Log::error('Subscription cancellation failed', [
                'subscription_id' => $subscription->id,
                'error' => $e->getMessage()
            ]);

            return [
                'success' => false,
                'error' => 'CANCELLATION_FAILED',
                'message' => 'Gagal membatalkan subscription: ' . $e->getMessage()
            ];
        }
    }

    /**
     * Process expired subscriptions
     */
    public function processExpiredSubscriptions(): array
    {
        $expiredSubscriptions = Subscription::where('status', 'active')
            ->where('expires_at', '<=', Carbon::now())
            ->with(['business', 'user'])
            ->get();

        $processed = 0;
        $errors = [];

        foreach ($expiredSubscriptions as $subscription) {
            try {
                DB::beginTransaction();

                // Update subscription status
                $subscription->update([
                    'status' => 'expired',
                    'expired_at' => Carbon::now()
                ]);

                // Deactivate premium for business
                $business = $subscription->business;
                $business->update([
                    'is_premium' => false,
                    'premium_expires_at' => Carbon::now(),
                    'premium_plan' => null
                ]);

                // Send expiration notification
                $this->sendSubscriptionExpiredNotification($subscription);

                DB::commit();
                $processed++;

            } catch (\Exception $e) {
                DB::rollback();
                $errors[] = [
                    'subscription_id' => $subscription->id,
                    'error' => $e->getMessage()
                ];
                Log::error('Failed to process expired subscription', [
                    'subscription_id' => $subscription->id,
                    'error' => $e->getMessage()
                ]);
            }
        }

        return [
            'processed_count' => $processed,
            'total_expired' => count($expiredSubscriptions),
            'errors' => $errors
        ];
    }

    /**
     * Get subscription analytics for user or business
     */
    public function getSubscriptionAnalytics(User $user, Business $business = null): array
    {
        $query = Subscription::where('user_id', $user->id);
        
        if ($business) {
            $query->where('business_id', $business->id);
        }

        $subscriptions = $query->with('business')->get();

        return [
            'total_subscriptions' => $subscriptions->count(),
            'active_subscriptions' => $subscriptions->where('status', 'active')->count(),
            'expired_subscriptions' => $subscriptions->where('status', 'expired')->count(),
            'cancelled_subscriptions' => $subscriptions->where('status', 'cancelled')->count(),
            'total_spent' => $subscriptions->where('status', 'active')->sum('amount'),
            'average_subscription_duration' => $this->calculateAverageSubscriptionDuration($subscriptions),
            'renewal_rate' => $this->calculateRenewalRate($subscriptions),
            'churn_rate' => $this->calculateChurnRate($subscriptions),
            'next_expiration' => $this->getNextExpiration($subscriptions),
            'subscription_history' => $subscriptions->map(function($sub) {
                return [
                    'id' => $sub->id,
                    'plan' => $sub->plan,
                    'status' => $sub->status,
                    'amount' => $sub->amount,
                    'starts_at' => $sub->starts_at,
                    'expires_at' => $sub->expires_at,
                    'business_name' => $sub->business->title ?? 'Unknown'
                ];
            })
        ];
    }

    /**
     * Private helper methods
     */
    private function validateSubscriptionEligibility(User $user, Business $business, array $data): array
    {
        $result = ['eligible' => true, 'reasons' => []];

        // Check if business belongs to user
        if ($business->user_id !== $user->id) {
            $result['eligible'] = false;
            $result['reasons'][] = 'Business tidak dimiliki oleh user';
        }

        // Check if plan exists
        if (!isset(self::PREMIUM_PLANS[$data['plan']])) {
            $result['eligible'] = false;
            $result['reasons'][] = 'Plan tidak valid';
        }

        // Check if business already has active subscription
        $activeSubscription = Subscription::where('business_id', $business->id)
            ->where('status', 'active')
            ->first();

        if ($activeSubscription) {
            $result['eligible'] = false;
            $result['reasons'][] = 'Business sudah memiliki subscription aktif';
            $result['active_subscription'] = $activeSubscription;
        }

        $result['reason'] = implode(', ', $result['reasons']);
        return $result;
    }

    private function calculateSubscriptionPricing(array $data): array
    {
        $plan = self::PREMIUM_PLANS[$data['plan']];
        
        return [
            'plan' => $data['plan'],
            'duration_days' => $plan['duration_days'],
            'original_amount' => $plan['amount'],
            'discount_amount' => 0, // Will be calculated with referrals/coupons
            'final_amount' => $plan['amount'],
            'discount_percentage' => $plan['discount_percentage']
        ];
    }

    private function processReferralCode(string $referralCode, User $user): ?array
    {
        // Find referrer by referral code
        $referrer = User::where('referral_code', $referralCode)
            ->where('id', '!=', $user->id) // Can't refer yourself
            ->first();

        if (!$referrer) {
            return null;
        }

        // Calculate referral discount (5% for referrer, 5% for referee)
        $discountPercentage = 5;
        
        return [
            'valid' => true,
            'referrer_id' => $referrer->id,
            'referrer_name' => $referrer->name,
            'discount_percentage' => $discountPercentage,
            'discount_amount' => 0 // Will be calculated based on plan amount
        ];
    }

    private function calculateSubscriptionEndDate(Business $business, int $durationDays): Carbon
    {
        // If business has active premium, extend from current expiration
        if ($business->premium_expires_at && $business->premium_expires_at->isFuture()) {
            return $business->premium_expires_at->addDays($durationDays);
        }
        
        // Otherwise start from now
        return Carbon::now()->addDays($durationDays);
    }

    private function generateInvoiceNumber(): string
    {
        return 'INV-' . date('Ymd') . '-' . strtoupper(Str::random(6));
    }

    private function scheduleLifecycleEvents(Subscription $subscription): void
    {
        // This would integrate with Laravel's job queue system
        // For now, just log the scheduling
        Log::info('Scheduled lifecycle events for subscription', [
            'subscription_id' => $subscription->id,
            'events' => ['activation_reminder', 'expiration_warnings']
        ]);
    }

    private function processReferralCommission(Subscription $subscription): void
    {
        if (!$subscription->hasReferral()) {
            return;
        }

        // Create referral commission record
        ReferralCommission::create([
            'subscription_id' => $subscription->id,
            'referrer_id' => $subscription->referrer_id,
            'referee_id' => $subscription->user_id,
            'commission_amount' => $subscription->amount * 0.05, // 5% commission
            'status' => 'pending'
        ]);
    }

    private function sendSubscriptionActivatedNotification(Subscription $subscription): void
    {
        // Implementation would send email/SMS notifications
        Log::info('Sent subscription activated notification', [
            'subscription_id' => $subscription->id,
            'user_id' => $subscription->user_id
        ]);
    }

    private function sendSubscriptionExpiredNotification(Subscription $subscription): void
    {
        Log::info('Sent subscription expired notification', [
            'subscription_id' => $subscription->id,
            'user_id' => $subscription->user_id
        ]);
    }

    private function sendSubscriptionCancelledNotification(Subscription $subscription, array $refundDetails): void
    {
        Log::info('Sent subscription cancelled notification', [
            'subscription_id' => $subscription->id,
            'user_id' => $subscription->user_id,
            'refund_eligible' => $refundDetails['eligible']
        ]);
    }

    private function scheduleExpirationReminders(Subscription $subscription): void
    {
        // Schedule reminders at 7 days, 3 days, and 1 day before expiration
        Log::info('Scheduled expiration reminders', [
            'subscription_id' => $subscription->id,
            'expires_at' => $subscription->expires_at
        ]);
    }

    private function calculateCancellationRefund(Subscription $subscription): array
    {
        // Simple refund policy: full refund if cancelled within 7 days of activation
        $refundEligible = false;
        $refundAmount = 0;

        if ($subscription->starts_at && $subscription->starts_at->diffInDays(Carbon::now()) <= 7) {
            $refundEligible = true;
            $refundAmount = $subscription->amount;
        }

        return [
            'eligible' => $refundEligible,
            'refund_amount' => $refundAmount,
            'policy' => 'Full refund within 7 days of activation'
        ];
    }

    private function calculateAverageSubscriptionDuration($subscriptions): float
    {
        $completed = $subscriptions->whereIn('status', ['expired', 'cancelled']);
        if ($completed->isEmpty()) return 0;

        $totalDays = $completed->sum(function($sub) {
            return $sub->starts_at && $sub->expires_at 
                ? $sub->starts_at->diffInDays($sub->expires_at) 
                : 0;
        });

        return round($totalDays / $completed->count(), 1);
    }

    private function calculateRenewalRate($subscriptions): float
    {
        $expired = $subscriptions->where('status', 'expired');
        if ($expired->isEmpty()) return 0;

        $renewed = $expired->where('renewed_at', '!=', null);
        return round(($renewed->count() / $expired->count()) * 100, 1);
    }

    private function calculateChurnRate($subscriptions): float
    {
        $total = $subscriptions->count();
        if ($total === 0) return 0;

        $churned = $subscriptions->whereIn('status', ['cancelled', 'expired'])
            ->where('renewed_at', null)
            ->count();

        return round(($churned / $total) * 100, 1);
    }

    private function getNextExpiration($subscriptions): ?Carbon
    {
        $active = $subscriptions->where('status', 'active')->sortBy('expires_at')->first();
        return $active ? $active->expires_at : null;
    }
}