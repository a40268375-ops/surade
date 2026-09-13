<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use App\Models\Business;
use App\Models\PaymentTicket;
use App\Models\User;

class PremiumUpgradeController extends Controller
{
    public function store(Request $request)
    {
        $request->validate([
            'business_id' => 'required|exists:businesses,id',
            'category' => 'required|string|in:perkantoran,bisnis,rekreasi-hiburan,jasa-servis,fasilitas,otomotif,pendidikan,kesehatan,elektronik,fashion,musik,komunitas,informasi-umum,kuliner',
            'phone' => 'required|string|max:50',
            'address' => 'required|string|max:500',
            'latitude' => 'nullable|numeric',
            'longitude' => 'nullable|numeric',
            'payment_method' => 'required|string|max:100',
            'plan' => 'required|string|in:monthly,yearly',
            'original_amount' => 'required|numeric',
            'final_amount' => 'required|numeric',
            'referral_code' => 'nullable|string|max:20',
            'discount_percent' => 'nullable|numeric|min:0|max:100',
            'payment_proof' => 'required|image|mimes:jpeg,png,jpg|max:5120',
        ]);

        $user = auth()->user();
        
        // Get the selected business
        $business = Business::where('id', $request->business_id)
                           ->where('user_id', $user->id)
                           ->first();
        
        if (!$business) {
            return response()->json(['message' => 'Business not found or not owned by user'], 404);
        }
        
        // Validate referral code if provided
        $referrer = null;
        if ($request->referral_code) {
            $referrer = User::where('referral_code', $request->referral_code)->first();
            if (!$referrer || $referrer->status !== 'active') {
                return response()->json(['message' => 'Invalid referral code'], 400);
            }
        }
        
        // Update business info including coordinates
        $updateData = [
            'category' => $request->category,
            'phone' => $request->phone,
            'address' => $request->address,
        ];
        
        if ($request->latitude && $request->longitude) {
            $updateData['latitude'] = $request->latitude;
            $updateData['longitude'] = $request->longitude;
        }
        
        $business->update($updateData);

        // Handle payment proof upload
        $proofPath = $request->file('payment_proof')->store('payment-proofs', 'public');

        // Use final amount from frontend (already calculated with discount)
        $finalAmount = $request->final_amount;

        // Create payment ticket
        $ticketData = [
            'user_id' => $user->id,
            'business_id' => $business->id,
            'plan' => $request->plan,
            'amount' => $finalAmount,
            'original_amount' => $request->original_amount,
            'payment_method' => $request->payment_method,
            'payment_proof' => $proofPath,
            'notes' => "Premium upgrade untuk bisnis: {$business->title}",
            'status' => 'pending',
        ];
        
        // Add referral information if used
        if ($request->referral_code && $referrer) {
            $ticketData['referral_code'] = $request->referral_code;
            $ticketData['discount_percent'] = $request->discount_percent;
            $ticketData['referrer_id'] = $referrer->id;
        }

        $ticket = PaymentTicket::create($ticketData);

        return response()->json([
            'message' => 'Premium upgrade request submitted successfully',
            'ticket_id' => $ticket->id,
            'business_id' => $business->id,
            'final_amount' => $finalAmount,
            'discount_applied' => $request->discount_percent ?? 0,
        ], 201);
    }

    public function getSubscriptionPlans()
    {
        return response()->json([
            'monthly' => [
                'name' => 'Premium — Bulanan',
                'price' => 150000,
                'duration' => 30,
                'description' => 'Akses premium selama 30 hari',
            ],
            'yearly' => [
                'name' => 'Premium — Tahunan',
                'price' => 1500000,
                'duration' => 365,
                'description' => 'Akses premium selama 365 hari (hemat 25%)',
            ],
        ]);
    }
}