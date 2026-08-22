<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\PaymentTicket;
use App\Models\Business;
use App\Models\User;

class PaymentController extends Controller
{
    public function createPayment(Request $request)
    {
        try {
            \Log::info('Payment request received:', $request->all());
            
            $request->validate([
                'business_id' => 'required|exists:businesses,id',
                'category' => 'required', // Accept both string and object
                'phone' => 'required|string',
                'address' => 'required|string',
                'latitude' => 'nullable|numeric',
                'longitude' => 'nullable|numeric',
                'plan' => 'required|string|in:monthly,yearly',
                'original_amount' => 'required|numeric',
                'final_amount' => 'required|numeric',
                'payment_method' => 'required|string',
                'referral_code' => 'nullable|string',
                'discount_percent' => 'nullable|numeric|min:0|max:100',
            ]);

            $user = auth()->user();
            \Log::info('Authenticated user:', ['user_id' => $user->id, 'name' => $user->name]);
            
            // Get and update business
            $business = Business::where('id', $request->business_id)
                               ->where('user_id', $user->id)
                               ->first();
            
            if (!$business) {
                \Log::error('Business not found', ['business_id' => $request->business_id, 'user_id' => $user->id]);
                return response()->json(['success' => false, 'message' => 'Business not found'], 404);
            }

            // Handle category - can be string or object
            $categoryName = is_array($request->category) || is_object($request->category) 
                ? ($request->category['name'] ?? $request->category->name ?? 'Unknown') 
                : $request->category;

            // Update business info
            $business->update([
                'category' => $categoryName,
                'phone' => $request->phone,
                'address' => $request->address,
                'latitude' => $request->latitude,
                'longitude' => $request->longitude,
            ]);

            // Validate referral if provided
            $referrer = null;
            if ($request->referral_code) {
                $referrer = User::where('referral_code', $request->referral_code)->first();
                if (!$referrer) {
                    return response()->json(['success' => false, 'message' => 'Invalid referral code'], 400);
                }
            }

            // Create payment ticket
            $ticketData = [
                'user_id' => $user->id,
                'business_id' => $business->id,
                'plan' => $request->plan,
                'amount' => $request->final_amount,
                'original_amount' => $request->original_amount,
                'payment_method' => $request->payment_method,
                'status' => 'pending',
                'notes' => "Premium upgrade untuk bisnis: {$business->title}",
            ];

            if ($request->referral_code && $referrer) {
                $ticketData['referral_code'] = $request->referral_code;
                $ticketData['discount_percent'] = $request->discount_percent;
                $ticketData['referrer_id'] = $referrer->id;
            }

            $ticket = PaymentTicket::create($ticketData);
            \Log::info('Payment ticket created:', ['ticket_id' => $ticket->id]);

            // Handle payment method
            if ($request->payment_method === 'manual_transfer') {
                // For manual transfer, return success and let user upload proof
                return response()->json([
                    'success' => true,
                    'ticket_id' => $ticket->id,
                    'message' => 'Silakan lanjutkan dengan upload bukti pembayaran',
                    'redirect_to_upload' => true
                ]);
            }

            // For payment gateway methods, create direct app links
            $paymentUrl = $this->createPaymentGatewayUrl($ticket, $request);
            $paymentMethodName = $this->getPaymentMethodName($request->payment_method);
            
            return response()->json([
                'success' => true,
                'payment_url' => $paymentUrl,
                'ticket_id' => $ticket->id,
                'payment_method' => $request->payment_method,
                'payment_method_name' => $paymentMethodName,
                'amount' => $ticket->amount,
                'message' => "Mengarahkan ke aplikasi {$paymentMethodName}..."
            ]);

        } catch (\Illuminate\Validation\ValidationException $e) {
            \Log::error('Validation error:', $e->errors());
            return response()->json([
                'success' => false,
                'message' => 'Data tidak valid',
                'errors' => $e->errors()
            ], 422);
        } catch (\Exception $e) {
            \Log::error('Payment creation error:', ['message' => $e->getMessage(), 'trace' => $e->getTraceAsString()]);
            return response()->json([
                'success' => false,
                'message' => 'Terjadi kesalahan sistem: ' . $e->getMessage()
            ], 500);
        }
    }

    private function getPaymentMethodName($method)
    {
        $names = [
            'dana' => 'DANA',
            'gopay' => 'GoPay',
            'ovo' => 'OVO',
            'bca_va' => 'BCA Virtual Account',
            'bri_va' => 'BRI Virtual Account',
            'bni_va' => 'BNI Virtual Account',
            'manual_transfer' => 'Transfer Manual'
        ];
        
        return $names[$method] ?? ucfirst(str_replace('_', ' ', $method));
    }

    private function createPaymentGatewayUrl($ticket, $request)
    {
        $method = $request->payment_method;
        $amount = $ticket->amount;
        $businessName = urlencode($ticket->business->title ?? 'Surade Premium');
        
        // Direct deep links to actual payment apps with web fallbacks
        switch ($method) {
            case 'dana':
                // Try DANA app first, fallback to web
                return "dana://qr/pay?amount={$amount}&merchant={$businessName}&ref={$ticket->id}";
            
            case 'gopay':
                // Try GoPay/Gojek app first
                return "gojek://gopay/merchant?amount={$amount}&merchant={$businessName}&ref={$ticket->id}";
            
            case 'ovo':
                // Try OVO app first
                return "ovo://payment?amount={$amount}&merchant={$businessName}&ref={$ticket->id}";
            
            case 'bca_va':
                // BCA mobile app
                return "bcamobile://transfer/virtual?amount={$amount}&ref={$ticket->id}";
                
            case 'bri_va':
                // BRI mobile app
                return "brimobile://transfer/virtual?amount={$amount}&ref={$ticket->id}";
                
            case 'bni_va':
                // BNI mobile app
                return "bnimobile://transfer/virtual?amount={$amount}&ref={$ticket->id}";
            
            default:
                // Fallback to upload step
                $frontendUrl = config('app.frontend_url', 'http://surade.latihan.co.id');
                return "{$frontendUrl}/premium-upgrade?step=3&ticket_id={$ticket->id}&payment_method={$method}";
        }
    }

    public function handlePaymentCallback(Request $request)
    {
        // Handle payment gateway callback/webhook
        // Update payment ticket status based on payment result
        
        $ticketId = $request->ticket_id;
        $status = $request->status; // success, failed, pending
        
        if ($ticketId) {
            $ticket = PaymentTicket::find($ticketId);
            if ($ticket) {
                $ticket->update([
                    'status' => $status === 'success' ? 'paid' : 'failed'
                ]);
                
                if ($status === 'success') {
                    // Auto-approve if payment gateway confirms success
                    $this->approvePremiumUpgrade($ticket);
                }
            }
        }

        return response()->json(['success' => true]);
    }

    private function approvePremiumUpgrade($ticket)
    {
        $business = $ticket->business;
        $plan = $ticket->plan;
        
        // Calculate expiration date
        $expirationDate = now();
        if ($plan === 'yearly') {
            $expirationDate->addYear();
        } else {
            $expirationDate->addMonth();
        }
        
        // Update business to premium
        $business->update([
            'is_premium' => true,
            'premium_expires_at' => $expirationDate
        ]);
        
        // Update ticket status
        $ticket->update(['status' => 'approved']);
    }
}