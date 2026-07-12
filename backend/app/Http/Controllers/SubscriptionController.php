<?php

namespace App\Http\Controllers;

use App\Models\Business;
use App\Models\Subscription;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Str;
use Illuminate\Support\Carbon;

class SubscriptionController extends Controller
{
    // Plan definitions: id => [label, days, price]
    private const PLANS = [
        'monthly'   => ['label' => '1 Bulan', 'days' => 30,  'amount' => 49000],
        'quarterly' => ['label' => '3 Bulan', 'days' => 90,  'amount' => 129000],
        'yearly'    => ['label' => '12 Bulan', 'days' => 365, 'amount' => 449000],
    ];

    public function plans()
    {
        return response()->json(self::PLANS);
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

    // User berlangganan premium untuk salah satu bisnisnya
    public function store(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'business_id' => 'required|exists:businesses,id',
            'plan' => 'required|string|in:monthly,quarterly,yearly',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        $business = Business::find($request->business_id);

        if ($business->user_id !== $request->user()->id && $request->user()->role !== 'admin') {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $plan = self::PLANS[$request->plan];

        // Extend from current expiry if still active, otherwise start from now
        $start = ($business->premium_expires_at && $business->premium_expires_at->isFuture())
            ? $business->premium_expires_at
            : Carbon::now();

        $expiresAt = (clone $start)->addDays($plan['days']);

        $subscription = Subscription::create([
            'invoice_number' => 'INV-' . strtoupper(Str::random(8)),
            'user_id' => $request->user()->id,
            'business_id' => $business->id,
            'plan' => $request->plan,
            'duration_days' => $plan['days'],
            'amount' => $plan['amount'],
            'status' => 'paid',
            'starts_at' => Carbon::now(),
            'expires_at' => $expiresAt,
        ]);

        $business->update([
            'is_premium' => true,
            'premium_expires_at' => $expiresAt,
            'premium_plan' => $request->plan,
        ]);

        return response()->json([
            'subscription' => $subscription,
            'business' => $business->fresh(),
        ], 201);
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
}
