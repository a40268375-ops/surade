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

    // User berlangganan premium untuk salah satu bisnisnya.
    // Tidak langsung aktif - status jadi 'pending' sampai admin verifikasi
    // bukti pembayarannya lewat verify().
    public function store(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'business_id' => 'required|exists:businesses,id',
            'plan' => 'required|string|in:monthly,quarterly,yearly',
            'payment_method' => 'required|string|in:dana,bni,bca',
            'proof' => 'required|image|max:5120', // max 5MB
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        $business = Business::find($request->business_id);

        if ($business->user_id !== $request->user()->id && $request->user()->role !== 'admin') {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $plan = self::PLANS[$request->plan];
        $proofPath = $request->file('proof')->store('payment-proofs', 'public');

        $subscription = Subscription::create([
            'invoice_number' => 'INV-' . strtoupper(Str::random(8)),
            'user_id' => $request->user()->id,
            'business_id' => $business->id,
            'plan' => $request->plan,
            'duration_days' => $plan['days'],
            'amount' => $plan['amount'],
            'payment_method' => $request->payment_method,
            'proof_path' => $proofPath,
            'status' => 'pending',
        ]);

        return response()->json([
            'subscription' => $subscription,
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

    // Admin: menyetujui bukti pembayaran -> baru sekarang premium bisnisnya diaktifkan.
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

        $business = $subscription->business;

        // Extend from current expiry if still active, otherwise start from now
        $start = ($business->premium_expires_at && $business->premium_expires_at->isFuture())
            ? $business->premium_expires_at
            : Carbon::now();

        $expiresAt = (clone $start)->addDays($subscription->duration_days);

        $subscription->update([
            'status' => 'paid',
            'starts_at' => Carbon::now(),
            'expires_at' => $expiresAt,
            'verified_by' => $request->user()->id,
            'verified_at' => Carbon::now(),
        ]);

        $business->update([
            'is_premium' => true,
            'premium_expires_at' => $expiresAt,
            'premium_plan' => $subscription->plan,
        ]);

        return response()->json([
            'subscription' => $subscription->fresh(),
            'business' => $business->fresh(),
        ]);
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
}