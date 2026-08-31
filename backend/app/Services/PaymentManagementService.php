<?php

namespace App\Services;

use App\Models\User;
use App\Models\Business;
use App\Models\Subscription;
use App\Models\PaymentTransaction;
use App\Models\PaymentTicket;
use App\Models\ReferralCommission;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Str;

/**
 * Consolidated Payment Management Service
 * Handles all payment processing, gateway integration, and payment lifecycle management
 */
class PaymentManagementService
{
    protected SubscriptionLifecycleService $subscriptionService;
    protected PremiumFeatureService $premiumService;

    // Supported payment gateways
    public const SUPPORTED_GATEWAYS = [
        'midtrans' => [
            'name' => 'Midtrans',
            'methods' => ['credit_card', 'bank_transfer', 'gopay', 'dana', 'ovo', 'shopeepay'],
            'active' => true
        ],
        'xendit' => [
            'name' => 'Xendit',
            'methods' => ['va_bca', 'va_bni', 'va_bri', 'va_mandiri', 'qris', 'dana', 'ovo'],
            'active' => true
        ],
        'manual_transfer' => [
            'name' => 'Manual Bank Transfer',
            'methods' => ['manual_bca', 'manual_bni', 'manual_bri', 'manual_mandiri'],
            'active' => true
        ]
    ];

    // Payment status constants
    public const STATUS_PENDING = 'pending';
    public const STATUS_PROCESSING = 'processing';
    public const STATUS_SUCCESS = 'success';
    public const STATUS_FAILED = 'failed';
    public const STATUS_CANCELLED = 'cancelled';
    public const STATUS_REFUNDED = 'refunded';

    public function __construct(
        SubscriptionLifecycleService $subscriptionService,
        PremiumFeatureService $premiumService
    ) {
        $this->subscriptionService = $subscriptionService;
        $this->premiumService = $premiumService;
    }

    /**
     * Create payment for premium subscription
     */
    public function createPayment(User $user, array $paymentData): array
    {
        DB::beginTransaction();
        
        try {
            // Validate payment data
            $validationResult = $this->validatePaymentData($paymentData);
            if (!$validationResult['valid']) {
                return [
                    'success' => false,
                    'error' => 'VALIDATION_FAILED',
                    'message' => $validationResult['message'],
                    'details' => $validationResult['errors']
                ];
            }

            // Get or create subscription
            $subscription = $this->getOrCreateSubscription($user, $paymentData);
            if (!$subscription) {
                return [
                    'success' => false,
                    'error' => 'SUBSCRIPTION_CREATION_FAILED',
                    'message' => 'Failed to create subscription'
                ];
            }

            // Calculate payment amount with discounts
            $paymentAmount = $this->calculatePaymentAmount($paymentData);

            // Create payment transaction record
            $transaction = $this->createPaymentTransaction($subscription, $paymentAmount, $paymentData);

            // Process payment based on method
            $paymentResult = $this->processPaymentByMethod($transaction, $paymentData);

            if ($paymentResult['success']) {
                DB::commit();
                
                return [
                    'success' => true,
                    'transaction' => $transaction->fresh(),
                    'subscription' => $subscription->fresh(),
                    'payment_info' => $paymentResult['payment_info'],
                    'next_action' => $paymentResult['next_action']
                ];
            } else {
                DB::rollback();
                return $paymentResult;
            }

        } catch (\Exception $e) {
            DB::rollback();
            Log::error('Payment creation failed', [
                'user_id' => $user->id,
                'payment_data' => $paymentData,
                'error' => $e->getMessage()
            ]);

            return [
                'success' => false,
                'error' => 'PAYMENT_CREATION_FAILED',
                'message' => 'Gagal membuat pembayaran: ' . $e->getMessage()
            ];
        }
    }

    /**
     * Process payment gateway webhook/notification
     */
    public function handlePaymentNotification(string $gateway, array $notificationData): array
    {
        try {
            // Find transaction by gateway transaction ID
            $transaction = PaymentTransaction::where('gateway', $gateway)
                ->where('transaction_id', $notificationData['transaction_id'] ?? null)
                ->first();

            if (!$transaction) {
                Log::warning('Payment notification for unknown transaction', [
                    'gateway' => $gateway,
                    'data' => $notificationData
                ]);
                
                return [
                    'success' => false,
                    'error' => 'TRANSACTION_NOT_FOUND',
                    'message' => 'Transaction not found'
                ];
            }

            // Verify notification authenticity (implement gateway-specific verification)
            $isVerified = $this->verifyPaymentNotification($gateway, $notificationData);
            if (!$isVerified) {
                Log::warning('Invalid payment notification received', [
                    'gateway' => $gateway,
                    'transaction_id' => $transaction->id,
                    'data' => $notificationData
                ]);

                return [
                    'success' => false,
                    'error' => 'INVALID_NOTIFICATION',
                    'message' => 'Notification verification failed'
                ];
            }

            // Process the notification
            $result = $this->processPaymentNotification($transaction, $notificationData);

            Log::info('Payment notification processed', [
                'transaction_id' => $transaction->id,
                'gateway' => $gateway,
                'status' => $result['status']
            ]);

            return $result;

        } catch (\Exception $e) {
            Log::error('Payment notification processing failed', [
                'gateway' => $gateway,
                'data' => $notificationData,
                'error' => $e->getMessage()
            ]);

            return [
                'success' => false,
                'error' => 'NOTIFICATION_PROCESSING_FAILED',
                'message' => 'Failed to process payment notification'
            ];
        }
    }

    /**
     * Process payment refund
     */
    public function processRefund(PaymentTransaction $transaction, array $refundData): array
    {
        DB::beginTransaction();
        
        try {
            // Validate refund eligibility
            $eligibility = $this->validateRefundEligibility($transaction);
            if (!$eligibility['eligible']) {
                return [
                    'success' => false,
                    'error' => 'REFUND_NOT_ELIGIBLE',
                    'message' => $eligibility['reason'],
                    'details' => $eligibility
                ];
            }

            // Calculate refund amount
            $refundAmount = $refundData['amount'] ?? $transaction->amount;
            if ($refundAmount > $transaction->amount) {
                return [
                    'success' => false,
                    'error' => 'INVALID_REFUND_AMOUNT',
                    'message' => 'Refund amount cannot exceed original payment amount'
                ];
            }

            // Process refund through gateway
            $gatewayResult = $this->processGatewayRefund($transaction, $refundAmount, $refundData);
            
            if ($gatewayResult['success']) {
                // Update transaction status
                $transaction->update([
                    'status' => self::STATUS_REFUNDED,
                    'gateway_response' => array_merge(
                        $transaction->gateway_response ?? [],
                        ['refund' => $gatewayResult['refund_data']]
                    )
                ]);

                // Handle subscription cancellation if needed
                $subscription = $transaction->subscription;
                if ($subscription && $refundData['cancel_subscription'] ?? false) {
                    $this->subscriptionService->cancelSubscription(
                        $subscription,
                        auth()->user(),
                        $refundData['reason'] ?? 'Payment refunded'
                    );
                }

                DB::commit();

                return [
                    'success' => true,
                    'refund_id' => $gatewayResult['refund_id'],
                    'refund_amount' => $refundAmount,
                    'transaction' => $transaction->fresh(),
                    'message' => 'Refund berhasil diproses'
                ];
            }

            return $gatewayResult;

        } catch (\Exception $e) {
            DB::rollback();
            Log::error('Refund processing failed', [
                'transaction_id' => $transaction->id,
                'refund_data' => $refundData,
                'error' => $e->getMessage()
            ]);

            return [
                'success' => false,
                'error' => 'REFUND_PROCESSING_FAILED',
                'message' => 'Gagal memproses refund: ' . $e->getMessage()
            ];
        }
    }

    /**
     * Get payment analytics and reports
     */
    public function getPaymentAnalytics(array $filters = []): array
    {
        $dateRange = [
            'from' => Carbon::parse($filters['date_from'] ?? now()->subDays(30)),
            'to' => Carbon::parse($filters['date_to'] ?? now())
        ];

        $transactions = PaymentTransaction::whereBetween('created_at', [$dateRange['from'], $dateRange['to']]);

        if (isset($filters['gateway'])) {
            $transactions->where('gateway', $filters['gateway']);
        }

        if (isset($filters['status'])) {
            $transactions->where('status', $filters['status']);
        }

        $transactionData = $transactions->get();

        return [
            'summary' => [
                'total_transactions' => $transactionData->count(),
                'total_amount' => $transactionData->sum('amount'),
                'success_rate' => $this->calculateSuccessRate($transactionData),
                'average_amount' => $transactionData->avg('amount')
            ],
            'by_gateway' => $this->analyzeByGateway($transactionData),
            'by_status' => $this->analyzeByStatus($transactionData),
            'daily_trends' => $this->analyzeDailyTrends($transactionData, $dateRange),
            'monthly_comparison' => $this->analyzeMonthlyComparison($dateRange)
        ];
    }

    /**
     * Get available payment methods for user
     */
    public function getAvailablePaymentMethods(User $user, array $context = []): array
    {
        $methods = [];
        
        foreach (self::SUPPORTED_GATEWAYS as $gatewayKey => $gateway) {
            if (!$gateway['active']) continue;

            foreach ($gateway['methods'] as $method) {
                $methods[] = [
                    'gateway' => $gatewayKey,
                    'method' => $method,
                    'name' => $this->getMethodDisplayName($method),
                    'icon' => $this->getMethodIcon($method),
                    'fee_percentage' => $this->getMethodFee($method),
                    'is_recommended' => $this->isRecommendedMethod($method, $user, $context)
                ];
            }
        }

        return [
            'available_methods' => $methods,
            'recommended_gateway' => $this->getRecommendedGateway($user, $context),
            'payment_info' => [
                'min_amount' => 10000, // Rp 10,000
                'max_amount' => 50000000, // Rp 50,000,000
                'supported_currencies' => ['IDR']
            ]
        ];
    }

    /**
     * Private helper methods
     */
    private function validatePaymentData(array $paymentData): array
    {
        $errors = [];
        $required = ['business_id', 'plan', 'payment_method', 'amount'];

        foreach ($required as $field) {
            if (!isset($paymentData[$field]) || empty($paymentData[$field])) {
                $errors[] = "Field {$field} is required";
            }
        }

        // Validate plan
        $validPlans = ['monthly', 'quarterly', 'yearly'];
        if (isset($paymentData['plan']) && !in_array($paymentData['plan'], $validPlans)) {
            $errors[] = 'Invalid plan selected';
        }

        // Validate amount
        if (isset($paymentData['amount']) && ($paymentData['amount'] < 10000 || $paymentData['amount'] > 50000000)) {
            $errors[] = 'Payment amount must be between Rp 10,000 and Rp 50,000,000';
        }

        return [
            'valid' => empty($errors),
            'message' => empty($errors) ? 'Valid' : 'Validation failed',
            'errors' => $errors
        ];
    }

    private function getOrCreateSubscription(User $user, array $paymentData): ?Subscription
    {
        $business = Business::find($paymentData['business_id']);
        if (!$business || $business->user_id !== $user->id) {
            return null;
        }

        // Check for existing pending subscription
        $existingSubscription = Subscription::where('business_id', $business->id)
            ->where('status', 'pending')
            ->first();

        if ($existingSubscription) {
            return $existingSubscription;
        }

        // Create new subscription using SubscriptionLifecycleService
        $subscriptionData = [
            'plan' => $paymentData['plan'],
            'payment_method' => $paymentData['payment_method'],
            'referral_code' => $paymentData['referral_code'] ?? null,
            'notes' => $paymentData['notes'] ?? null
        ];

        $result = $this->subscriptionService->createSubscription($user, $business, $subscriptionData);
        
        return $result['success'] ? $result['subscription'] : null;
    }

    private function calculatePaymentAmount(array $paymentData): array
    {
        $baseAmount = $paymentData['amount'];
        $discounts = [];
        $totalDiscount = 0;

        // Apply referral discount if applicable
        if (!empty($paymentData['referral_code'])) {
            $referralDiscount = $baseAmount * 0.05; // 5% referral discount
            $discounts['referral'] = $referralDiscount;
            $totalDiscount += $referralDiscount;
        }

        // Apply coupon discount if applicable
        if (!empty($paymentData['coupon_code'])) {
            // Implement coupon validation and discount calculation
            // This would integrate with existing PlatformCouponController logic
        }

        return [
            'base_amount' => $baseAmount,
            'discounts' => $discounts,
            'total_discount' => $totalDiscount,
            'final_amount' => $baseAmount - $totalDiscount,
            'currency' => 'IDR'
        ];
    }

    private function createPaymentTransaction(Subscription $subscription, array $paymentAmount, array $paymentData): PaymentTransaction
    {
        return PaymentTransaction::create([
            'subscription_id' => $subscription->id,
            'transaction_id' => 'TXN-' . strtoupper(Str::random(12)),
            'gateway' => $this->determineGateway($paymentData['payment_method']),
            'amount' => $paymentAmount['final_amount'],
            'status' => self::STATUS_PENDING,
            'gateway_response' => [
                'payment_method' => $paymentData['payment_method'],
                'amount_breakdown' => $paymentAmount,
                'created_at' => now()->toISOString()
            ]
        ]);
    }

    private function processPaymentByMethod(PaymentTransaction $transaction, array $paymentData): array
    {
        $method = $paymentData['payment_method'];
        $gateway = $transaction->gateway;

        switch ($gateway) {
            case 'midtrans':
                return $this->processMidtransPayment($transaction, $paymentData);
            case 'xendit':
                return $this->processXenditPayment($transaction, $paymentData);
            case 'manual_transfer':
                return $this->processManualTransferPayment($transaction, $paymentData);
            default:
                return [
                    'success' => false,
                    'error' => 'UNSUPPORTED_GATEWAY',
                    'message' => 'Unsupported payment gateway'
                ];
        }
    }

    private function determineGateway(string $paymentMethod): string
    {
        $gatewayMap = [
            'credit_card' => 'midtrans',
            'bank_transfer' => 'midtrans',
            'gopay' => 'midtrans',
            'dana' => 'midtrans',
            'ovo' => 'midtrans',
            'shopeepay' => 'midtrans',
            'va_bca' => 'xendit',
            'va_bni' => 'xendit',
            'va_bri' => 'xendit',
            'va_mandiri' => 'xendit',
            'qris' => 'xendit',
            'manual_bca' => 'manual_transfer',
            'manual_bni' => 'manual_transfer',
            'manual_bri' => 'manual_transfer',
            'manual_mandiri' => 'manual_transfer'
        ];

        return $gatewayMap[$paymentMethod] ?? 'manual_transfer';
    }

    // Placeholder methods for gateway-specific implementations
    private function processMidtransPayment($transaction, $paymentData): array
    {
        // Implement Midtrans payment processing
        return [
            'success' => true,
            'payment_info' => ['redirect_url' => 'https://app.midtrans.com/snap/...'],
            'next_action' => 'redirect_to_gateway'
        ];
    }

    private function processXenditPayment($transaction, $paymentData): array
    {
        // Implement Xendit payment processing
        return [
            'success' => true,
            'payment_info' => ['va_number' => '12345678901'],
            'next_action' => 'show_va_number'
        ];
    }

    private function processManualTransferPayment($transaction, $paymentData): array
    {
        // For manual transfer, just return bank account details
        return [
            'success' => true,
            'payment_info' => [
                'bank_accounts' => $this->getBankAccountDetails(),
                'transfer_amount' => $transaction->amount,
                'unique_code' => substr($transaction->transaction_id, -3)
            ],
            'next_action' => 'upload_proof'
        ];
    }

    private function verifyPaymentNotification(string $gateway, array $notificationData): bool
    {
        // Implement gateway-specific notification verification
        return true; // Placeholder
    }

    private function processPaymentNotification(PaymentTransaction $transaction, array $notificationData): array
    {
        // Update transaction status based on notification
        $status = $this->mapGatewayStatusToInternal($notificationData['status'] ?? 'unknown');
        
        $transaction->update([
            'status' => $status,
            'gateway_response' => array_merge(
                $transaction->gateway_response ?? [],
                ['notification' => $notificationData]
            )
        ]);

        // If payment successful, activate subscription
        if ($status === self::STATUS_SUCCESS) {
            $this->subscriptionService->activateSubscription(
                $transaction->subscription,
                auth()->user() ?? User::where('role', 'admin')->first()
            );
        }

        return [
            'success' => true,
            'status' => $status,
            'transaction' => $transaction
        ];
    }

    private function mapGatewayStatusToInternal(string $gatewayStatus): string
    {
        $statusMap = [
            'success' => self::STATUS_SUCCESS,
            'settlement' => self::STATUS_SUCCESS,
            'capture' => self::STATUS_SUCCESS,
            'pending' => self::STATUS_PENDING,
            'processing' => self::STATUS_PROCESSING,
            'failed' => self::STATUS_FAILED,
            'cancelled' => self::STATUS_CANCELLED,
            'expire' => self::STATUS_FAILED
        ];

        return $statusMap[strtolower($gatewayStatus)] ?? self::STATUS_FAILED;
    }

    // Additional helper methods (implementations would be expanded based on requirements)
    private function validateRefundEligibility($transaction): array { return ['eligible' => true]; }
    private function processGatewayRefund($transaction, $amount, $data): array { return ['success' => true, 'refund_id' => 'REF-123']; }
    private function calculateSuccessRate($transactions): float { return 95.5; }
    private function analyzeByGateway($transactions): array { return []; }
    private function analyzeByStatus($transactions): array { return []; }
    private function analyzeDailyTrends($transactions, $dateRange): array { return []; }
    private function analyzeMonthlyComparison($dateRange): array { return []; }
    private function getMethodDisplayName($method): string { return ucfirst(str_replace('_', ' ', $method)); }
    private function getMethodIcon($method): string { return "/icons/{$method}.png"; }
    private function getMethodFee($method): float { return 2.9; }
    private function isRecommendedMethod($method, $user, $context): bool { return $method === 'dana'; }
    private function getRecommendedGateway($user, $context): string { return 'midtrans'; }
    private function getBankAccountDetails(): array {
        return [
            'bca' => ['account_number' => '1234567890', 'account_name' => 'PT Surade Indonesia'],
            'bni' => ['account_number' => '0987654321', 'account_name' => 'PT Surade Indonesia'],
            'bri' => ['account_number' => '1122334455', 'account_name' => 'PT Surade Indonesia']
        ];
    }
}