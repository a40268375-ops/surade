<?php

namespace App\Http\Controllers;

use App\Models\PaymentTransaction;
use App\Models\Subscription;
use App\Models\Business;
use App\Services\PaymentManagementService;
use App\Services\SubscriptionLifecycleService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;

/**
 * Unified Payment Controller
 * Consolidates all payment processing functionality into a single, comprehensive controller
 */
class UnifiedPaymentController extends Controller
{
    protected PaymentManagementService $paymentService;
    protected SubscriptionLifecycleService $subscriptionService;

    public function __construct(
        PaymentManagementService $paymentService,
        SubscriptionLifecycleService $subscriptionService
    ) {
        $this->paymentService = $paymentService;
        $this->subscriptionService = $subscriptionService;
    }

    /**
     * Create payment for premium subscription
     */
    public function createPayment(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'business_id' => 'required|exists:businesses,id',
            'plan' => 'required|string|in:monthly,quarterly,yearly',
            'payment_method' => 'required|string',
            'amount' => 'required|numeric|min:10000|max:50000000',
            'referral_code' => 'sometimes|string|max:20',
            'coupon_code' => 'sometimes|string|max:20',
            'return_url' => 'sometimes|url',
            'notes' => 'sometimes|string|max:500'
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'error' => 'VALIDATION_FAILED',
                'message' => 'Data pembayaran tidak valid',
                'errors' => $validator->errors()
            ], 422);
        }

        $user = $request->user();
        $business = Business::find($request->business_id);

        // Verify business ownership
        if (!$business || $business->user_id !== $user->id) {
            return response()->json([
                'success' => false,
                'error' => 'UNAUTHORIZED',
                'message' => 'Anda tidak memiliki akses ke bisnis ini'
            ], 403);
        }

        // Check if business already has active subscription
        $activeSubscription = Subscription::where('business_id', $business->id)
            ->where('status', 'active')
            ->first();

        if ($activeSubscription) {
            return response()->json([
                'success' => false,
                'error' => 'SUBSCRIPTION_EXISTS',
                'message' => 'Bisnis ini sudah memiliki subscription Premium aktif',
                'current_subscription' => [
                    'plan' => $activeSubscription->plan,
                    'expires_at' => $activeSubscription->expires_at
                ]
            ], 409);
        }

        $paymentData = $request->only([
            'business_id', 'plan', 'payment_method', 'amount', 
            'referral_code', 'coupon_code', 'return_url', 'notes'
        ]);

        $result = $this->paymentService->createPayment($user, $paymentData);

        if ($result['success']) {
            return response()->json($result, 201);
        } else {
            return response()->json($result, 400);
        }
    }

    /**
     * Handle payment gateway webhooks/notifications
     */
    public function handleWebhook(Request $request, string $gateway)
    {
        $supportedGateways = ['midtrans', 'xendit', 'manual'];
        
        if (!in_array($gateway, $supportedGateways)) {
            return response()->json([
                'success' => false,
                'error' => 'UNSUPPORTED_GATEWAY',
                'message' => 'Gateway tidak didukung'
            ], 400);
        }

        $notificationData = $request->all();
        $result = $this->paymentService->handlePaymentNotification($gateway, $notificationData);

        return response()->json($result);
    }

    /**
     * Get payment status
     */
    public function getPaymentStatus(Request $request, string $transactionId)
    {
        $user = $request->user();
        
        $transaction = PaymentTransaction::with(['subscription.business'])
            ->where('transaction_id', $transactionId)
            ->first();

        if (!$transaction) {
            return response()->json([
                'success' => false,
                'error' => 'TRANSACTION_NOT_FOUND',
                'message' => 'Transaksi tidak ditemukan'
            ], 404);
        }

        // Verify access (user owns the business or is admin)
        $business = $transaction->subscription->business;
        if ($business->user_id !== $user->id && $user->role !== 'admin') {
            return response()->json([
                'success' => false,
                'error' => 'UNAUTHORIZED',
                'message' => 'Anda tidak memiliki akses ke transaksi ini'
            ], 403);
        }

        return response()->json([
            'success' => true,
            'transaction' => [
                'id' => $transaction->transaction_id,
                'status' => $transaction->status,
                'amount' => $transaction->amount,
                'gateway' => $transaction->gateway,
                'created_at' => $transaction->created_at,
                'updated_at' => $transaction->updated_at
            ],
            'subscription' => [
                'id' => $transaction->subscription->id,
                'plan' => $transaction->subscription->plan,
                'status' => $transaction->subscription->status
            ],
            'business' => [
                'id' => $business->id,
                'title' => $business->title,
                'is_premium' => $business->is_premium_active
            ]
        ]);
    }

    /**
     * Process payment refund
     */
    public function processRefund(Request $request, string $transactionId)
    {
        $validator = Validator::make($request->all(), [
            'amount' => 'sometimes|numeric|min:1000',
            'reason' => 'required|string|max:500',
            'cancel_subscription' => 'sometimes|boolean'
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'error' => 'VALIDATION_FAILED',
                'message' => 'Data refund tidak valid',
                'errors' => $validator->errors()
            ], 422);
        }

        $user = $request->user();
        $transaction = PaymentTransaction::with(['subscription.business'])
            ->where('transaction_id', $transactionId)
            ->first();

        if (!$transaction) {
            return response()->json([
                'success' => false,
                'error' => 'TRANSACTION_NOT_FOUND',
                'message' => 'Transaksi tidak ditemukan'
            ], 404);
        }

        // Only admin or business owner can request refund
        $business = $transaction->subscription->business;
        if ($business->user_id !== $user->id && $user->role !== 'admin') {
            return response()->json([
                'success' => false,
                'error' => 'UNAUTHORIZED',
                'message' => 'Anda tidak memiliki akses untuk meminta refund'
            ], 403);
        }

        $refundData = [
            'amount' => $request->input('amount', $transaction->amount),
            'reason' => $request->input('reason'),
            'cancel_subscription' => $request->input('cancel_subscription', false),
            'requested_by' => $user->id
        ];

        $result = $this->paymentService->processRefund($transaction, $refundData);

        return response()->json($result);
    }

    /**
     * Get available payment methods
     */
    public function getPaymentMethods(Request $request)
    {
        $user = $request->user();
        $context = [
            'user_id' => $user->id,
            'plan' => $request->query('plan'),
            'amount' => $request->query('amount')
        ];

        $methods = $this->paymentService->getAvailablePaymentMethods($user, $context);

        return response()->json([
            'success' => true,
            'payment_methods' => $methods
        ]);
    }

    /**
     * Get user's payment history
     */
    public function getPaymentHistory(Request $request)
    {
        $user = $request->user();
        $limit = min($request->query('limit', 20), 100);
        $offset = $request->query('offset', 0);

        $query = PaymentTransaction::with(['subscription.business'])
            ->whereHas('subscription.business', function($q) use ($user) {
                if ($user->role !== 'admin') {
                    $q->where('user_id', $user->id);
                }
            })
            ->orderBy('created_at', 'desc');

        // Apply filters
        if ($request->has('status')) {
            $query->where('status', $request->query('status'));
        }

        if ($request->has('gateway')) {
            $query->where('gateway', $request->query('gateway'));
        }

        if ($request->has('date_from')) {
            $query->whereDate('created_at', '>=', $request->query('date_from'));
        }

        if ($request->has('date_to')) {
            $query->whereDate('created_at', '<=', $request->query('date_to'));
        }

        $total = $query->count();
        $transactions = $query->limit($limit)->offset($offset)->get();

        return response()->json([
            'success' => true,
            'data' => $transactions->map(function($transaction) {
                return [
                    'transaction_id' => $transaction->transaction_id,
                    'amount' => $transaction->amount,
                    'status' => $transaction->status,
                    'gateway' => $transaction->gateway,
                    'business' => [
                        'id' => $transaction->subscription->business->id,
                        'title' => $transaction->subscription->business->title
                    ],
                    'subscription_plan' => $transaction->subscription->plan,
                    'created_at' => $transaction->created_at,
                    'updated_at' => $transaction->updated_at
                ];
            }),
            'pagination' => [
                'total' => $total,
                'limit' => $limit,
                'offset' => $offset,
                'has_more' => ($offset + $limit) < $total
            ]
        ]);
    }

    /**
     * Get payment analytics (Admin only)
     */
    public function getPaymentAnalytics(Request $request)
    {
        if ($request->user()->role !== 'admin') {
            return response()->json([
                'success' => false,
                'error' => 'FORBIDDEN',
                'message' => 'Hanya admin yang dapat mengakses analytics pembayaran'
            ], 403);
        }

        $filters = $request->only(['date_from', 'date_to', 'gateway', 'status']);
        $analytics = $this->paymentService->getPaymentAnalytics($filters);

        return response()->json([
            'success' => true,
            'analytics' => $analytics,
            'generated_at' => now()->toISOString()
        ]);
    }

    /**
     * Retry failed payment
     */
    public function retryPayment(Request $request, string $transactionId)
    {
        $user = $request->user();
        $transaction = PaymentTransaction::with(['subscription.business'])
            ->where('transaction_id', $transactionId)
            ->first();

        if (!$transaction) {
            return response()->json([
                'success' => false,
                'error' => 'TRANSACTION_NOT_FOUND',
                'message' => 'Transaksi tidak ditemukan'
            ], 404);
        }

        // Verify access
        $business = $transaction->subscription->business;
        if ($business->user_id !== $user->id) {
            return response()->json([
                'success' => false,
                'error' => 'UNAUTHORIZED',
                'message' => 'Anda tidak memiliki akses ke transaksi ini'
            ], 403);
        }

        // Check if payment can be retried
        if (!in_array($transaction->status, ['failed', 'cancelled'])) {
            return response()->json([
                'success' => false,
                'error' => 'CANNOT_RETRY',
                'message' => 'Transaksi ini tidak dapat diulang',
                'current_status' => $transaction->status
            ], 400);
        }

        // Create new payment with same details
        $paymentData = [
            'business_id' => $business->id,
            'plan' => $transaction->subscription->plan,
            'payment_method' => $request->input('payment_method', 
                $transaction->gateway_response['payment_method'] ?? 'dana'
            ),
            'amount' => $transaction->amount,
            'notes' => 'Retry payment for transaction ' . $transaction->transaction_id
        ];

        $result = $this->paymentService->createPayment($user, $paymentData);

        return response()->json($result);
    }

    /**
     * Cancel pending payment
     */
    public function cancelPayment(Request $request, string $transactionId)
    {
        $user = $request->user();
        $transaction = PaymentTransaction::with(['subscription.business'])
            ->where('transaction_id', $transactionId)
            ->first();

        if (!$transaction) {
            return response()->json([
                'success' => false,
                'error' => 'TRANSACTION_NOT_FOUND',
                'message' => 'Transaksi tidak ditemukan'
            ], 404);
        }

        // Verify access
        $business = $transaction->subscription->business;
        if ($business->user_id !== $user->id && $user->role !== 'admin') {
            return response()->json([
                'success' => false,
                'error' => 'UNAUTHORIZED',
                'message' => 'Anda tidak memiliki akses ke transaksi ini'
            ], 403);
        }

        // Check if payment can be cancelled
        if (!in_array($transaction->status, ['pending', 'processing'])) {
            return response()->json([
                'success' => false,
                'error' => 'CANNOT_CANCEL',
                'message' => 'Transaksi ini tidak dapat dibatalkan',
                'current_status' => $transaction->status
            ], 400);
        }

        // Update transaction status
        $transaction->update([
            'status' => 'cancelled',
            'gateway_response' => array_merge(
                $transaction->gateway_response ?? [],
                [
                    'cancelled_at' => now()->toISOString(),
                    'cancelled_by' => $user->id,
                    'cancellation_reason' => $request->input('reason', 'User requested cancellation')
                ]
            )
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Pembayaran berhasil dibatalkan',
            'transaction' => [
                'id' => $transaction->transaction_id,
                'status' => $transaction->status,
                'cancelled_at' => now()->toISOString()
            ]
        ]);
    }
}