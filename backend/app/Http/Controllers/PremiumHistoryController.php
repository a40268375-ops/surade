<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\PaymentTicket;
use App\Models\Subscription;
use App\Models\Business;

class PremiumHistoryController extends Controller
{
    public function adminPremiumHistory()
    {
        // Get all approved payment tickets with complete information
        $approvedTickets = PaymentTicket::with(['user:id,name,email', 'business:id,title,is_premium,premium_expires_at'])
            ->where('status', 'approved')
            ->orderBy('updated_at', 'desc')
            ->get()
            ->map(function($ticket) {
                $planPrice = $this->getPlanPrice($ticket->plan);
                
                return [
                    'id' => 'ticket_' . $ticket->id,
                    'type' => 'payment_ticket',
                    'status' => 'approved',
                    'user_name' => $ticket->user->name ?? 'Unknown User',
                    'user_email' => $ticket->user->email ?? 'unknown@email.com',
                    'business_name' => $ticket->business->title ?? 'Unknown Business',
                    'plan' => $ticket->plan,
                    'plan_display' => $ticket->plan === 'yearly' ? 'Tahunan' : ($ticket->plan === 'quarterly' ? '3 Bulan' : 'Bulanan'),
                    'amount' => $planPrice,
                    'expires_at' => $ticket->business->premium_expires_at,
                    'is_active' => $ticket->business->is_premium_active,
                    'notes' => $ticket->notes,
                    'admin_notes' => $ticket->admin_notes,
                    'payment_proof' => $ticket->payment_proof,
                    'created_at' => $ticket->created_at,
                    'updated_at' => $ticket->updated_at,
                    'approved_at' => $ticket->updated_at
                ];
            });

        // Get all pending payment tickets so admin can see incoming requests
        $pendingTickets = PaymentTicket::with(['user:id,name,email', 'business:id,title'])
            ->where('status', 'pending')
            ->orderBy('updated_at', 'desc')
            ->get()
            ->map(function($ticket) {
                $planPrice = $this->getPlanPrice($ticket->plan);
                
                return [
                    'id' => 'pending_' . $ticket->id,
                    'type' => 'payment_ticket',
                    'status' => 'pending',
                    'user_name' => $ticket->user->name ?? 'Unknown User',
                    'user_email' => $ticket->user->email ?? 'unknown@email.com',
                    'business_name' => $ticket->business->title ?? 'Unknown Business',
                    'plan' => $ticket->plan,
                    'plan_display' => $ticket->plan === 'yearly' ? 'Tahunan' : ($ticket->plan === 'quarterly' ? '3 Bulan' : 'Bulanan'),
                    'amount' => $planPrice,
                    'expires_at' => null,
                    'is_active' => false,
                    'notes' => $ticket->notes,
                    'admin_notes' => $ticket->admin_notes,
                    'payment_proof' => $ticket->payment_proof,
                    'created_at' => $ticket->created_at,
                    'updated_at' => $ticket->updated_at,
                ];
            });

        // Get all premium businesses (includes manually set and payment-based)
        $premiumBusinesses = Business::with(['user:id,name,email'])
            ->where('is_premium', true)
            ->orderBy('updated_at', 'desc')
            ->get()
            ->map(function($business) {
                return [
                    'id' => 'business_' . $business->id,
                    'type' => 'premium_business',
                    'status' => $business->is_premium_active ? 'active' : 'expired',
                    'user_name' => $business->user->name ?? 'Unknown User',
                    'user_email' => $business->user->email ?? 'unknown@email.com',
                    'business_name' => $business->title,
                    'plan' => $business->premium_plan ?? 'unknown',
                    'plan_display' => ($business->premium_plan === 'yearly') ? 'Tahunan' : 
                                     (($business->premium_plan === 'quarterly') ? '3 Bulan' : 
                                      (($business->premium_plan === 'monthly') ? 'Bulanan' : 'Manual')),
                    'expires_at' => $business->premium_expires_at,
                    'is_active' => $business->is_premium_active,
                    'created_at' => $business->created_at,
                    'updated_at' => $business->updated_at
                ];
            });

        // Get rejected payment tickets for complete history
        $rejectedTickets = PaymentTicket::with(['user:id,name,email', 'business:id,title'])
            ->where('status', 'rejected')
            ->orderBy('updated_at', 'desc')
            ->limit(50) // Limit rejected to recent 50
            ->get()
            ->map(function($ticket) {
                $planPrice = $this->getPlanPrice($ticket->plan);
                
                return [
                    'id' => 'rejected_' . $ticket->id,
                    'type' => 'payment_ticket',
                    'status' => 'rejected',
                    'user_name' => $ticket->user->name ?? 'Unknown User',
                    'user_email' => $ticket->user->email ?? 'unknown@email.com',
                    'business_name' => $ticket->business->title ?? 'Unknown Business',
                    'plan' => $ticket->plan,
                    'plan_display' => $ticket->plan === 'yearly' ? 'Tahunan' : ($ticket->plan === 'quarterly' ? '3 Bulan' : 'Bulanan'),
                    'amount' => $planPrice,
                    'expires_at' => null,
                    'is_active' => false,
                    'notes' => $ticket->notes,
                    'admin_notes' => $ticket->admin_notes,
                    'payment_proof' => $ticket->payment_proof,
                    'created_at' => $ticket->created_at,
                    'updated_at' => $ticket->updated_at,
                    'rejected_at' => $ticket->updated_at
                ];
            });

        // Combine all histories and sort by updated_at (most recent first)
        $history = collect()
            ->merge($approvedTickets)
            ->merge($premiumBusinesses)
            ->merge($rejectedTickets)
            ->sortByDesc('updated_at')
            ->values();

        return response()->json([
            'history' => $history,
            'total' => $history->count(),
            'approved_count' => $approvedTickets->count(),
            'active_businesses' => $premiumBusinesses->where('is_active', true)->count(),
            'expired_businesses' => $premiumBusinesses->where('is_active', false)->count(),
            'rejected_count' => $rejectedTickets->count()
        ]);
    }

    /**
     * Get plan pricing for display
     */
    private function getPlanPrice($plan)
    {
        return match($plan) {
            'monthly' => 49000,
            'quarterly' => 129000,
            'yearly' => 449000,
            default => 0
        };
    }
}