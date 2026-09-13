<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\PaymentTicket;
use App\Models\Business;
use App\Models\User;
use App\Services\PaymentManagementService;

/**
 * Legacy Payment Controller (maintained for backward compatibility)
 * New applications should use UnifiedPaymentController
 */
class PaymentController extends Controller
{
    protected PaymentManagementService $paymentService;

    public function __construct(PaymentManagementService $paymentService)
    {
        $this->paymentService = $paymentService;
    }

    /**
     * @deprecated Use UnifiedPaymentController::createPayment instead
     */
    public function createPayment(Request $request)
    {
        // Redirect to unified payment system
        return app(UnifiedPaymentController::class)->createPayment($request);
    }

    /**
     * @deprecated Use UnifiedPaymentController::handleWebhook instead
     */
    public function handlePaymentCallback(Request $request)
    {
        $gateway = $request->input('gateway', 'midtrans');
        return app(UnifiedPaymentController::class)->handleWebhook($request, $gateway);
    }

    /**
     * Get payment gateway configuration
     */
    public function getGatewayConfig(Request $request)
    {
        return response()->json([
            'gateways' => PaymentManagementService::SUPPORTED_GATEWAYS,
            'default_gateway' => 'midtrans',
            'test_mode' => config('app.env') !== 'production',
            'supported_currencies' => ['IDR'],
            'min_amount' => 10000,
            'max_amount' => 50000000
        ]);
    }

    private function getPaymentMethodName($method)
    {
        $names = [
            'dana' => 'DANA',
            'gopay' => 'GoPay',
            'ovo' => 'OVO',
            'shopeepay' => 'ShopeePay',
            'bca_va' => 'BCA Virtual Account',
            'bri_va' => 'BRI Virtual Account',
            'bni_va' => 'BNI Virtual Account',
            'mandiri_va' => 'Mandiri Virtual Account',
            'credit_card' => 'Credit Card',
            'bank_transfer' => 'Bank Transfer',
            'qris' => 'QRIS',
            'manual_transfer' => 'Transfer Manual'
        ];
        
        return $names[$method] ?? ucfirst(str_replace('_', ' ', $method));
    }

    private function createPaymentGatewayUrl($ticket, $request)
    {
        $method = $request->payment_method;
        $amount = $ticket->amount;
        $businessName = urlencode($ticket->business->title ?? 'Surade Premium');
        
        // Enhanced deep links with better fallback handling
        switch ($method) {
            case 'dana':
                return "dana://qr/pay?amount={$amount}&merchant={$businessName}&ref={$ticket->id}";
            
            case 'gopay':
                return "gojek://gopay/merchant?amount={$amount}&merchant={$businessName}&ref={$ticket->id}";
            
            case 'ovo':
                return "ovo://payment?amount={$amount}&merchant={$businessName}&ref={$ticket->id}";
                
            case 'shopeepay':
                return "shopeepay://payment?amount={$amount}&merchant={$businessName}&ref={$ticket->id}";
            
            case 'bca_va':
                return "bcamobile://transfer/virtual?amount={$amount}&ref={$ticket->id}";
                
            case 'bri_va':
                return "brimobile://transfer/virtual?amount={$amount}&ref={$ticket->id}";
                
            case 'bni_va':
                return "bnimobile://transfer/virtual?amount={$amount}&ref={$ticket->id}";

            case 'mandiri_va':
                return "mandiri://transfer/virtual?amount={$amount}&ref={$ticket->id}";

            case 'credit_card':
                // Return to unified payment system
                return url("/api/payments/create?method=credit_card&ticket_id={$ticket->id}");
            
            default:
                $frontendUrl = config('app.frontend_url', 'http://surade.latihan.co.id');
                return "{$frontendUrl}/premium-upgrade?step=3&ticket_id={$ticket->id}&payment_method={$method}";
        }
    }

    private function approvePremiumUpgrade($ticket)
    {
        // This now integrates with the subscription lifecycle service
        $business = $ticket->business;
        $plan = $ticket->plan;
        
        // Calculate expiration date
        $expirationDate = now();
        if ($plan === 'yearly') {
            $expirationDate->addYear();
        } elseif ($plan === 'quarterly') {
            $expirationDate->addMonths(3);
        } else {
            $expirationDate->addMonth();
        }
        
        // Update business to premium
        $business->update([
            'is_premium' => true,
            'premium_expires_at' => $expirationDate,
            'premium_plan' => $plan
        ]);
        
        // Update ticket status
        $ticket->update(['status' => 'approved']);
        
        // Log the approval
        \Log::info("Legacy premium upgrade approved", [
            'ticket_id' => $ticket->id,
            'business_id' => $business->id,
            'plan' => $plan,
            'expires_at' => $expirationDate
        ]);
    }
}