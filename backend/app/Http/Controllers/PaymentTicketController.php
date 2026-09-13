<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\PaymentTicket;
use App\Models\Business;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Auth;

class PaymentTicketController extends Controller
{
    public function index(Request $request)
    {
        $user = Auth::user();
        
        if ($user->role === 'admin') {
            // Admin can see all tickets
            $tickets = PaymentTicket::with(['user', 'business'])
                ->orderBy('created_at', 'desc')
                ->get();
        } else {
            // Regular users can only see their own tickets
            $tickets = PaymentTicket::with(['business'])
                ->where('user_id', $user->id)
                ->orderBy('created_at', 'desc')
                ->get();
        }
        
        return response()->json($tickets);
    }

    public function myTickets(Request $request)
    {
        $user = Auth::user();
        
        // Regular users can only see their own tickets
        $tickets = PaymentTicket::with(['business'])
            ->where('user_id', $user->id)
            ->orderBy('created_at', 'desc')
            ->get();
        
        return response()->json($tickets);
    }

    public function store(Request $request)
    {
        $request->validate([
            'business_id' => 'required|exists:businesses,id',
            'plan' => 'required|in:monthly,yearly',
            'payment_proof' => 'required|image|max:5120', // Max 5MB
            'notes' => 'nullable|string|max:1000',
        ]);

        $user = Auth::user();
        
        // Verify user owns the business
        $business = Business::findOrFail($request->business_id);
        if ($business->user_id !== $user->id && $user->role !== 'admin') {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $proofPath = null;
        if ($request->hasFile('payment_proof')) {
            $proofPath = $request->file('payment_proof')->store('payment-proofs', 'public');
        }

        $ticket = PaymentTicket::create([
            'user_id' => $user->id,
            'business_id' => $request->business_id,
            'plan' => $request->plan,
            'payment_proof' => $proofPath,
            'notes' => $request->notes,
            'status' => 'pending',
        ]);

        // Notify admin about new payment ticket
        \App\Http\Controllers\NotificationController::notifyAdminNewPaymentTicket($ticket->load(['user', 'business']));

        return response()->json($ticket->load(['user', 'business']), 201);
    }

    public function show($id)
    {
        $user = Auth::user();
        $ticket = PaymentTicket::with(['user', 'business'])->findOrFail($id);

        if ($user->role !== 'admin' && $ticket->user_id !== $user->id) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        return response()->json($ticket);
    }

    public function update(Request $request, $id)
    {
        $user = Auth::user();
        $ticket = PaymentTicket::findOrFail($id);

        if ($user->role !== 'admin' && $ticket->user_id !== $user->id) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        // Admin can update status, users can only update pending tickets
        if ($user->role === 'admin') {
            $request->validate([
                'status' => 'required|in:pending,approved,rejected',
                'admin_notes' => 'nullable|string|max:1000',
            ]);
            
            $ticket->status = $request->status;
            
            if ($request->admin_notes) {
                $ticket->admin_notes = $request->admin_notes;
            }
            
            // If approved, activate the premium subscription
            if ($request->status === 'approved') {
                $this->approvePremiumUpgrade($ticket);
            }
            
            // If rejected, can optionally deactivate premium if was previously active
            if ($request->status === 'rejected') {
                $business = $ticket->business;
                // Only deactivate if this ticket was the reason for premium status
                if ($business->is_premium && $business->premium_expires_at) {
                    $business->update([
                        'is_premium' => false,
                        'premium_expires_at' => null
                    ]);
                }
            }
            
            // Notify user about payment ticket status change
            \App\Http\Controllers\NotificationController::notifyPaymentTicketStatus($ticket, $request->status);
            
        } else {
            // Regular user can only update pending tickets
            if ($ticket->status !== 'pending') {
                return response()->json(['message' => 'Can only update pending tickets'], 403);
            }

            $request->validate([
                'business_id' => 'sometimes|required|exists:businesses,id',
                'plan' => 'sometimes|required|in:monthly,yearly',
                'payment_proof' => 'sometimes|required|image|max:5120',
                'notes' => 'nullable|string|max:1000',
            ]);

            if ($request->has('business_id')) {
                $business = Business::findOrFail($request->business_id);
                if ($business->user_id !== $user->id) {
                    return response()->json(['message' => 'Unauthorized'], 403);
                }
                $ticket->business_id = $request->business_id;
            }

            if ($request->has('plan')) {
                $ticket->plan = $request->plan;
            }

            if ($request->has('notes')) {
                $ticket->notes = $request->notes;
            }

            if ($request->hasFile('payment_proof')) {
                // Delete old proof if exists
                if ($ticket->payment_proof) {
                    Storage::disk('public')->delete($ticket->payment_proof);
                }
                $ticket->payment_proof = $request->file('payment_proof')->store('payment-proofs', 'public');
            }
        }

        $ticket->save();

        return response()->json($ticket->load(['user', 'business']));
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
        
        // Log the approval
        \Log::info("Premium upgrade approved", [
            'ticket_id' => $ticket->id,
            'business_id' => $business->id,
            'plan' => $plan,
            'expires_at' => $expirationDate
        ]);
    }

    public function destroy($id)
    {
        $user = Auth::user();
        $ticket = PaymentTicket::findOrFail($id);

        if ($user->role !== 'admin' && $ticket->user_id !== $user->id) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        // Delete proof file if exists
        if ($ticket->payment_proof) {
            Storage::disk('public')->delete($ticket->payment_proof);
        }

        $ticket->delete();

        return response()->json(['message' => 'Ticket deleted successfully']);
    }
}
