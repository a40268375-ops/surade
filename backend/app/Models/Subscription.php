<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Subscription extends Model
{
    protected $fillable = [
        'invoice_number',
        'user_id',
        'business_id',
        'plan',
        'duration_days',
        'amount',
        'original_amount',
        'discount_amount',
        'referral_code',
        'referrer_id',
        'referral_status',
        'referral_approved_at',
        'referral_approved_by',
        'referral_rejected_at',
        'referral_rejected_by',
        'referral_rejection_reason',
        'payment_method',
        'notes',
        'proof_path',
        'status',
        'verified_by',
        'verified_at',
        'rejection_reason',
        'starts_at',
        'expires_at',
    ];

    protected $appends = ['proof_url'];

    public function getProofUrlAttribute(): ?string
    {
        return $this->proof_path ? asset('storage/' . $this->proof_path) : null;
    }

    protected $casts = [
        'starts_at' => 'datetime',
        'expires_at' => 'datetime',
        'verified_at' => 'datetime',
        'referral_approved_at' => 'datetime',
        'referral_rejected_at' => 'datetime',
    ];

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function business(): BelongsTo
    {
        return $this->belongsTo(Business::class);
    }

    public function transaction()
    {
        return $this->hasOne(PaymentTransaction::class);
    }

    // Referral relationships
    public function referrer(): BelongsTo
    {
        return $this->belongsTo(User::class, 'referrer_id');
    }

    public function referralApprovedBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'referral_approved_by');
    }

    public function referralRejectedBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'referral_rejected_by');
    }

    public function referralCommission()
    {
        return $this->hasOne(ReferralCommission::class);
    }

    // Referral status constants
    const REFERRAL_STATUS_PENDING = 'pending';
    const REFERRAL_STATUS_APPROVED = 'approved';
    const REFERRAL_STATUS_REJECTED = 'rejected';
    const REFERRAL_STATUS_CANCELLED = 'cancelled';

    // Check if subscription has referral
    public function hasReferral(): bool
    {
        return !empty($this->referral_code) && !empty($this->referrer_id);
    }

    // Check if referral is approved
    public function isReferralApproved(): bool
    {
        return $this->referral_status === self::REFERRAL_STATUS_APPROVED;
    }

    // Scopes for referral filtering
    public function scopeWithReferral($query)
    {
        return $query->whereNotNull('referrer_id');
    }

    public function scopeReferralStatus($query, $status)
    {
        return $query->where('referral_status', $status);
    }
}