<?php

namespace App\Http\Controllers;

use App\Models\Business;
use App\Models\PaymentTransaction;
use App\Models\Subscription;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Str;
use Carbon\Carbon;

class PaymentGatewayController extends Controller
{
    // Plan definitions
    private const PLANS = [
        'monthly'   => ['label' => '1 Bulan Premium', 'days' => 30,  'amount' => 49000],
        'quarterly' => ['label' => '3 Bulan Premium', 'days' => 90,  'amount' => 129000],
        'yearly'    => ['label' => '12 Bulan Premium', 'days' => 365, 'amount' => 449000],
    ];

    /**
     * Create payment with Midtrans Snap
     */
    public function createMidtransPayment(Request $request)
    {
        $request->validate([
            'business_id' => 'required|exists:businesses,id',
            'plan' => 'required|in:monthly,quarterly,yearly',
            'referral_code' => 'nullable|string',
            'discount' => 'nullable|integer|min:0',
        ]);

        $user = $request->user();
        $business = Business::findOrFail($request->business_id);
        
        // Verify user owns the business
        if ($business->user_id !== $user->id && $user->role !== 'admin') {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $plan = self::PLANS[$request->plan];
        $orderId = 'PREMIUM-' . $business->id . '-' . time();

        // Calculate final amount with discount
        $discount = $request->discount ?? 0;
        $finalAmount = max(0, $plan['amount'] - $discount);

        // Find referrer if code provided
        $referrerId = null;
        if ($request->referral_code) {
            $referrer = \App\Models\User::where('referral_code', $request->referral_code)->first();
            if ($referrer) {
                $referrerId = $referrer->id;
            }
        }

        try {
            // Create subscription record first
            $subscription = Subscription::create([
                'invoice_number' => $orderId,
                'user_id' => $user->id,
                'business_id' => $business->id,
                'plan' => $request->plan,
                'duration_days' => $plan['days'],
                'amount' => $finalAmount,
                'original_amount' => $plan['amount'],
                'discount_amount' => $discount,
                'referral_code' => $request->referral_code,
                'referrer_id' => $referrerId,
                'referral_status' => $referrerId ? 'pending' : null,
                'payment_method' => 'midtrans',
                'status' => 'pending',
            ]);

            // Prepare Midtrans payload
            $payload = [
                'transaction_details' => [
                    'order_id' => $orderId,
                    'gross_amount' => $finalAmount,
                ],
                'customer_details' => [
                    'first_name' => $user->name,
                    'email' => $user->email,
                    'phone' => $user->phone ?? '',
                ],
                'item_details' => [
                    [
                        'id' => 'premium_' . $request->plan,
                        'price' => $finalAmount,
                        'quantity' => 1,
                        'name' => $plan['label'] . ' - ' . $business->title,
                    ]
                ],
                'callbacks' => [
                    'finish' => config('app.url') . '/payment/success',
                    'error' => config('app.url') . '/payment/failed',
                    'pending' => config('app.url') . '/payment/pending',
                ],
                'expiry' => [
                    'start_time' => date('Y-m-d H:i:s O'),
                    'unit' => 'minutes',
                    'duration' => 60, // 1 hour expiry
                ],
            ];

            // Call Midtrans Snap API
            $serverKey = config('services.midtrans.server_key');

            if (empty($serverKey)) {
                return response()->json([
                    'success' => false,
                    'message' => 'Midtrans server key belum dikonfigurasi. Periksa .env dan config/services.php.',
                ], 500);
            }

            // --- MOCK MODE ---
            if (str_contains($serverKey, 'YOUR_')) {
                PaymentTransaction::create([
                    'subscription_id' => $subscription->id,
                    'transaction_id' => $orderId,
                    'gateway' => 'midtrans',
                    'amount' => $finalAmount,
                    'status' => 'settled',
                    'gateway_response' => ['mock' => true],
                ]);

                $subscription->update(['status' => 'active']);
                $business->update([
                    'is_premium' => true,
                    'premium_expires_at' => Carbon::now()->addDays($subscription->duration_days),
                    'status' => 'approved'
                ]);

                return response()->json([
                    'success' => true,
                    'snap_token' => 'mock',
                    'mock_mode' => true,
                    'redirect_url' => config('app.url') . '/payment/success',
                    'subscription_id' => $subscription->id,
                ]);
            }
            // --- END MOCK MODE ---

            $isProduction = config('services.midtrans.is_production', false);
            $snapUrl = $isProduction ? 'https://app.midtrans.com/snap/v1/transactions' : 'https://app.sandbox.midtrans.com/snap/v1/transactions';

            $response = Http::withHeaders([
                'Accept' => 'application/json',
                'Content-Type' => 'application/json',
                'Authorization' => 'Basic ' . base64_encode($serverKey . ':'),
            ])->post($snapUrl, $payload);

            if ($response->successful()) {
                $snapData = $response->json();
                
                // Save transaction details
                PaymentTransaction::create([
                    'subscription_id' => $subscription->id,
                    'transaction_id' => $orderId,
                    'gateway' => 'midtrans',
                    'amount' => $finalAmount,
                    'status' => 'pending',
                    'gateway_response' => $snapData,
                ]);

                return response()->json([
                    'success' => true,
                    'snap_token' => $snapData['token'],
                    'redirect_url' => $snapData['redirect_url'],
                    'subscription_id' => $subscription->id,
                ]);
            } else {
                Log::error('Midtrans API Error', [
                    'response' => $response->body(),
                    'status' => $response->status()
                ]);
                
                return response()->json([
                    'success' => false,
                    'message' => 'Failed to create payment. Please try again.',
                ], 500);
            }

        } catch (\Exception $e) {
            Log::error('Midtrans Payment Creation Error', [
                'message' => $e->getMessage(),
                'user_id' => $user->id,
                'business_id' => $business->id,
            ]);

            return response()->json([
                'success' => false,
                'message' => 'Payment creation failed. Please try again.',
            ], 500);
        }
    }

    /**
     * Create payment with Xendit
     */
    public function createXenditPayment(Request $request)
    {
        $request->validate([
            'business_id' => 'required|exists:businesses,id',
            'plan' => 'required|in:monthly,quarterly,yearly',
            'referral_code' => 'nullable|string',
            'discount' => 'nullable|integer|min:0',
        ]);

        $user = $request->user();
        $business = Business::findOrFail($request->business_id);
        
        // Verify user owns the business
        if ($business->user_id !== $user->id && $user->role !== 'admin') {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $plan = self::PLANS[$request->plan];
        $externalId = 'PREMIUM-' . $business->id . '-' . time();

        // Calculate final amount with discount
        $discount = $request->discount ?? 0;
        $finalAmount = max(0, $plan['amount'] - $discount);

        // Find referrer if code provided
        $referrerId = null;
        if ($request->referral_code) {
            $referrer = \App\Models\User::where('referral_code', $request->referral_code)->first();
            if ($referrer) {
                $referrerId = $referrer->id;
            }
        }

        try {
            // Create subscription record first
            $subscription = Subscription::create([
                'invoice_number' => $externalId,
                'user_id' => $user->id,
                'business_id' => $business->id,
                'plan' => $request->plan,
                'duration_days' => $plan['days'],
                'amount' => $finalAmount,
                'original_amount' => $plan['amount'],
                'discount_amount' => $discount,
                'referral_code' => $request->referral_code,
                'referrer_id' => $referrerId,
                'referral_status' => $referrerId ? 'pending' : null,
                'payment_method' => 'xendit',
                'status' => 'pending',
            ]);

            // Prepare Xendit payload
            $payload = [
                'external_id' => $externalId,
                'payer_email' => $user->email,
                'description' => $plan['label'] . ' untuk ' . $business->title,
                'amount' => $finalAmount,
                'success_redirect_url' => config('app.url') . '/payment/success',
                'failure_redirect_url' => config('app.url') . '/payment/failed',
                'invoice_duration' => 3600, // 1 hour
                'customer' => [
                    'given_names' => $user->name,
                    'email' => $user->email,
                    'mobile_number' => $user->phone ?? '',
                ],
                'customer_notification_preference' => [
                    'invoice_created' => ['whatsapp', 'sms', 'email'],
                    'invoice_reminder' => ['whatsapp', 'sms', 'email'],
                    'invoice_paid' => ['whatsapp', 'sms', 'email'],
                    'invoice_expired' => ['whatsapp', 'sms', 'email'],
                ],
                'fees' => [
                    [
                        'type' => 'Premium Subscription',
                        'value' => $finalAmount
                    ]
                ]
            ];

            // Call Xendit Invoice API
            $secretKey = config('services.xendit.secret_key');
            
            if (empty($secretKey)) {
                return response()->json([
                    'success' => false,
                    'message' => 'Xendit secret key belum dikonfigurasi. Periksa .env dan config/services.php.',
                ], 500);
            }

            // --- MOCK MODE ---
            if (str_contains($secretKey, 'YOUR_')) {
                PaymentTransaction::create([
                    'subscription_id' => $subscription->id,
                    'transaction_id' => $externalId,
                    'gateway' => 'xendit',
                    'amount' => $finalAmount,
                    'status' => 'settled',
                    'gateway_response' => ['mock' => true],
                ]);

                $subscription->update(['status' => 'active']);
                $business->update([
                    'is_premium' => true,
                    'premium_expires_at' => Carbon::now()->addDays($subscription->duration_days),
                    'status' => 'approved'
                ]);

                return response()->json([
                    'success' => true,
                    'invoice_url' => config('app.url') . '/payment/success',
                    'mock_mode' => true,
                    'invoice_id' => 'mock_inv_' . time(),
                    'subscription_id' => $subscription->id,
                ]);
            }
            // --- END MOCK MODE ---

            $response = Http::withHeaders([
                'Authorization' => 'Basic ' . base64_encode($secretKey . ':'),
                'Content-Type' => 'application/json',
            ])->post('https://api.xendit.co/v2/invoices', $payload);

            if ($response->successful()) {
                $invoiceData = $response->json();
                
                // Save transaction details
                PaymentTransaction::create([
                    'subscription_id' => $subscription->id,
                    'transaction_id' => $externalId,
                    'gateway' => 'xendit',
                    'amount' => $finalAmount,
                    'status' => 'pending',
                    'gateway_response' => $invoiceData,
                ]);

                return response()->json([
                    'success' => true,
                    'invoice_url' => $invoiceData['invoice_url'],
                    'invoice_id' => $invoiceData['id'],
                    'subscription_id' => $subscription->id,
                ]);
            } else {
                Log::error('Xendit API Error', [
                    'response' => $response->body(),
                    'status' => $response->status()
                ]);
                
                return response()->json([
                    'success' => false,
                    'message' => 'Failed to create payment. Please try again.',
                ], 500);
            }

        } catch (\Exception $e) {
            Log::error('Xendit Payment Creation Error', [
                'message' => $e->getMessage(),
                'user_id' => $user->id,
                'business_id' => $business->id,
            ]);

            return response()->json([
                'success' => false,
                'message' => 'Payment creation failed. Please try again.',
            ], 500);
        }
    }

    /**
     * Handle Midtrans webhook notification
     */
    public function midtransNotification(Request $request)
    {
        try {
            $serverKey = config('services.midtrans.server_key');
            $orderId = $request->order_id;
            $statusCode = $request->status_code;
            $grossAmount = $request->gross_amount;
            $signatureKey = $request->signature_key;

            // Verify signature
            $input = $orderId . $statusCode . $grossAmount . $serverKey;
            $signature = hash("sha512", $input);

            if ($signature !== $signatureKey) {
                Log::error('Midtrans Invalid Signature', ['request' => $request->all()]);
                return response()->json(['message' => 'Invalid signature'], 400);
            }

            // Find transaction
            $transaction = PaymentTransaction::where('transaction_id', $orderId)->first();
            if (!$transaction) {
                Log::error('Midtrans Transaction Not Found', ['order_id' => $orderId]);
                return response()->json(['message' => 'Transaction not found'], 404);
            }

            $transactionStatus = $request->transaction_status;
            $fraudStatus = $request->fraud_status ?? 'accept';

            Log::info('Midtrans Notification', [
                'order_id' => $orderId,
                'transaction_status' => $transactionStatus,
                'fraud_status' => $fraudStatus
            ]);

            // Update transaction status
            if ($transactionStatus == 'capture' && $fraudStatus == 'accept') {
                $this->activatePremiumSubscription($transaction);
                $transaction->update(['status' => 'paid']);
            } elseif ($transactionStatus == 'settlement') {
                $this->activatePremiumSubscription($transaction);
                $transaction->update(['status' => 'paid']);
            } elseif ($transactionStatus == 'pending') {
                $transaction->update(['status' => 'pending']);
            } elseif (in_array($transactionStatus, ['deny', 'expire', 'cancel'])) {
                $transaction->update(['status' => 'failed']);
            }

            return response()->json(['message' => 'OK']);

        } catch (\Exception $e) {
            Log::error('Midtrans Notification Error', [
                'message' => $e->getMessage(),
                'request' => $request->all()
            ]);
            return response()->json(['message' => 'Server error'], 500);
        }
    }

    /**
     * Handle Xendit webhook notification
     */
    public function xenditNotification(Request $request)
    {
        try {
            $externalId = $request->external_id;
            $status = $request->status;

            Log::info('Xendit Notification', [
                'external_id' => $externalId,
                'status' => $status
            ]);

            // Find transaction
            $transaction = PaymentTransaction::where('transaction_id', $externalId)->first();
            if (!$transaction) {
                Log::error('Xendit Transaction Not Found', ['external_id' => $externalId]);
                return response()->json(['message' => 'Transaction not found'], 404);
            }

            // Update transaction status
            if ($status == 'PAID') {
                $this->activatePremiumSubscription($transaction);
                $transaction->update(['status' => 'paid']);
            } elseif ($status == 'EXPIRED') {
                $transaction->update(['status' => 'expired']);
            } elseif ($status == 'PENDING') {
                $transaction->update(['status' => 'pending']);
            }

            return response()->json(['message' => 'OK']);

        } catch (\Exception $e) {
            Log::error('Xendit Notification Error', [
                'message' => $e->getMessage(),
                'request' => $request->all()
            ]);
            return response()->json(['message' => 'Server error'], 500);
        }
    }

    /**
     * Activate premium subscription when payment is successful
     */
    private function activatePremiumSubscription($transaction)
    {
        $subscription = $transaction->subscription;
        $business = $subscription->business;

        // Calculate expiration date
        $start = ($business->premium_expires_at && $business->premium_expires_at->isFuture())
            ? $business->premium_expires_at
            : Carbon::now();

        $expiresAt = (clone $start)->addDays($subscription->duration_days);

        // Update subscription
        $subscription->update([
            'status' => 'paid',
            'starts_at' => Carbon::now(),
            'expires_at' => $expiresAt,
        ]);

        // Update business
        $business->update([
            'is_premium' => true,
            'premium_expires_at' => $expiresAt,
            'premium_plan' => $subscription->plan,
        ]);

        Log::info('Premium Subscription Activated', [
            'subscription_id' => $subscription->id,
            'business_id' => $business->id,
            'expires_at' => $expiresAt
        ]);

        // Track referral commission if referral code was used
        if ($subscription->referrer_id && $subscription->discount_amount > 0) {
            $this->trackReferralCommission($subscription);
        }

        // Send notification to user
        try {
            \App\Http\Controllers\NotificationController::notifyPremiumActivated($subscription);
        } catch (\Exception $e) {
            Log::error('Failed to send premium activation notification', [
                'error' => $e->getMessage(),
                'subscription_id' => $subscription->id
            ]);
        }
    }

    /**
     * Track referral commission for reseller
     */
    private function trackReferralCommission($subscription)
    {
        try {
            $referrer = \App\Models\User::find($subscription->referrer_id);
            if (!$referrer) {
                Log::warning('Referrer not found for commission tracking', [
                    'referrer_id' => $subscription->referrer_id,
                    'subscription_id' => $subscription->id
                ]);
                return;
            }

            // NEW BUSINESS LOGIC:
            // Commission = 15% of final price (after 5% discount)
            // Formula: commission = final_amount * 15%
            $finalAmount = $subscription->amount; // This is already the final amount after discount
            $commissionPercent = 15;
            $commissionAmount = floor($finalAmount * ($commissionPercent / 100));

            // Create or update referral commission record
            \App\Models\ReferralCommission::updateOrCreate(
                [
                    'subscription_id' => $subscription->id,
                    'referrer_id' => $referrer->id,
                ],
                [
                    'referred_user_id' => $subscription->user_id,
                    'business_id' => $subscription->business_id,
                    'transaction_id' => $subscription->invoice_number,
                    'discount_amount' => $subscription->discount_amount,
                    'commission_amount' => $commissionAmount,
                    'commission_percent' => $commissionPercent,
                    'original_commission_amount' => $commissionAmount,
                    'final_commission_amount' => $commissionAmount,
                    'status' => 'pending',
                ]
            );

            Log::info('Referral Commission Tracked', [
                'referrer_id' => $referrer->id,
                'subscription_id' => $subscription->id,
                'original_amount' => $subscription->original_amount,
                'discount_amount' => $subscription->discount_amount,
                'final_amount' => $finalAmount,
                'commission_percent' => $commissionPercent,
                'commission_amount' => $commissionAmount
            ]);
        } catch (\Exception $e) {
            Log::error('Failed to track referral commission', [
                'error' => $e->getMessage(),
                'subscription_id' => $subscription->id
            ]);
        }
    }

    /**
     * Get payment status
     */
    public function getPaymentStatus($subscriptionId)
    {
        $subscription = Subscription::with(['transaction', 'business'])
            ->findOrFail($subscriptionId);

        return response()->json([
            'subscription' => $subscription,
            'status' => $subscription->status,
            'transaction' => $subscription->transaction,
        ]);
    }
}