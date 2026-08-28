<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class ReferralCommission extends Model
{
    protected $fillable = [
        'referrer_id',
        'referred_user_id',
        'business_id',
        'subscription_id',
        'transaction_id',
        'discount_amount',
        'commission_amount',
        'commission_percent',
        'original_commission_amount',
        'adjustment_amount',
        'final_commission_amount',
        'adjustment_reason',
        'status',
        'paid_at',
        'paid_by',
        'approved_at',
        'approved_by',
        'rejected_at',
        'rejected_by',
        'rejection_reason',
        'adjusted_at',
        'adjusted_by',
    ];

    protected $casts = [
        'discount_amount' => 'decimal:2',
        'commission_amount' => 'decimal:2',
        'original_commission_amount' => 'decimal:2',
        'adjustment_amount' => 'decimal:2', 
        'final_commission_amount' => 'decimal:2',
        'commission_percent' => 'decimal:2',
        'paid_at' => 'datetime',
        'approved_at' => 'datetime',
        'rejected_at' => 'datetime',
        'adjusted_at' => 'datetime',
    ];

    // Status constants for better code maintainability
    const STATUS_PENDING = 'pending';
    const STATUS_APPROVED = 'approved';
    const STATUS_PAID = 'paid';
    const STATUS_REJECTED = 'rejected';
    const STATUS_CANCELLED = 'cancelled';

    // Get final commission amount (with adjustments if any)
    public function getFinalAmountAttribute()
    {
        return $this->final_commission_amount ?? $this->commission_amount;
    }

    // Check if commission has been adjusted
    public function getIsAdjustedAttribute()
    {
        return !is_null($this->adjustment_amount) && $this->adjustment_amount != 0;
    }

    public function referrer(): BelongsTo
    {
        return $this->belongsTo(User::class, 'referrer_id');
    }

    public function referredUser(): BelongsTo
    {
        return $this->belongsTo(User::class, 'referred_user_id');
    }

    public function business(): BelongsTo
    {
        return $this->belongsTo(Business::class);
    }

    public function subscription(): BelongsTo
    {
        return $this->belongsTo(Subscription::class);
    }

    // Admin relationship for approval tracking
    public function approvedBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'approved_by');
    }

    // Admin relationship for rejection tracking  
    public function rejectedBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'rejected_by');
    }

    // Admin relationship for payment tracking
    public function paidBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'paid_by');
    }

    // Admin relationship for adjustment tracking
    public function adjustedBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'adjusted_by');
    }

    // Scope for filtering by status
    public function scopeByStatus($query, $status)
    {
        return $query->where('status', $status);
    }

    // Scope for pending commissions
    public function scopePending($query)
    {
        return $query->where('status', self::STATUS_PENDING);
    }

    // Scope for approved commissions
    public function scopeApproved($query) 
    {
        return $query->where('status', self::STATUS_APPROVED);
    }

    // Scope for paid commissions
    public function scopePaid($query)
    {
        return $query->where('status', self::STATUS_PAID);
    }

    // Scope for rejected commissions
    public function scopeRejected($query)
    {
        return $query->where('status', self::STATUS_REJECTED);
    }
}
