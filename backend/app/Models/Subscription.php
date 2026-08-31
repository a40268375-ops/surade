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
        'referral_discount_amount',
        'payment_method',
        'notes',
        'proof_path',
        'status',
        'verified_by',
        'verified_at',
        'rejection_reason',
        'starts_at',
        'expires_at',
        // Lifecycle fields
        'cancelled_at',
        'cancelled_by',
        'cancellation_reason',
        'expired_at',
        'renewed_at',
        'renewed_by_subscription_id',
        'refund_amount',
        'refund_eligible',
        'refund_processed_at',
        'activation_notification_sent_at',
        'expiration_warning_sent_at',
        'renewal_reminder_sent_at',
        'lifecycle_events',
        'auto_renewal_attempts',
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
        // Lifecycle casts
        'cancelled_at' => 'datetime',
        'expired_at' => 'datetime',
        'renewed_at' => 'datetime',
        'refund_processed_at' => 'datetime',
        'activation_notification_sent_at' => 'datetime',
        'expiration_warning_sent_at' => 'datetime',
        'renewal_reminder_sent_at' => 'datetime',
        'lifecycle_events' => 'array',
        'refund_eligible' => 'boolean',
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

    // Subscription status constants
    const STATUS_PENDING = 'pending';
    const STATUS_ACTIVE = 'active';
    const STATUS_EXPIRED = 'expired';
    const STATUS_CANCELLED = 'cancelled';
    const STATUS_RENEWED = 'renewed';
    const STATUS_REJECTED = 'rejected';

    // Lifecycle helper methods
    public function isActive(): bool
    {
        return $this->status === self::STATUS_ACTIVE && 
               $this->expires_at && 
               $this->expires_at->isFuture();
    }

    public function isExpired(): bool
    {
        return $this->status === self::STATUS_EXPIRED || 
               ($this->expires_at && $this->expires_at->isPast());
    }

    public function isCancelled(): bool
    {
        return $this->status === self::STATUS_CANCELLED;
    }

    public function isRenewed(): bool
    {
        return $this->status === self::STATUS_RENEWED;
    }

    public function canBeCancelled(): bool
    {
        return in_array($this->status, [self::STATUS_PENDING, self::STATUS_ACTIVE]);
    }

    public function canBeRenewed(): bool
    {
        return in_array($this->status, [self::STATUS_ACTIVE, self::STATUS_EXPIRED]);
    }

    public function getDaysUntilExpiration(): int
    {
        if (!$this->expires_at) {
            return 0;
        }
        
        return max(0, $this->expires_at->diffInDays(now(), false));
    }

    public function getUsageDays(): int
    {
        if (!$this->starts_at) {
            return 0;
        }
        
        $endDate = $this->cancelled_at ?? $this->expired_at ?? now();
        return $this->starts_at->diffInDays($endDate);
    }

    public function getRefundEligibility(): array
    {
        if (!$this->isActive() || !$this->starts_at) {
            return ['eligible' => false, 'reason' => 'Subscription not active'];
        }
        
        $daysSinceStart = $this->starts_at->diffInDays(now());
        $refundEligible = $daysSinceStart <= 7; // 7-day refund policy
        
        return [
            'eligible' => $refundEligible,
            'days_since_start' => $daysSinceStart,
            'refund_period_days' => 7,
            'refund_amount' => $refundEligible ? $this->amount : 0
        ];
    }

    // Lifecycle event logging
    public function addLifecycleEvent(string $event, array $data = []): void
    {
        $events = $this->lifecycle_events ?? [];
        $events[] = [
            'event' => $event,
            'timestamp' => now()->toISOString(),
            'data' => $data
        ];
        
        $this->update(['lifecycle_events' => $events]);
    }

    // Relationships for lifecycle fields
    public function cancelledBy()
    {
        return $this->belongsTo(User::class, 'cancelled_by');
    }

    public function renewedBySubscription()
    {
        return $this->belongsTo(Subscription::class, 'renewed_by_subscription_id');
    }

    public function renewalSubscriptions()
    {
        return $this->hasMany(Subscription::class, 'renewed_by_subscription_id');
    }

    // Scopes for lifecycle queries
    public function scopeActive($query)
    {
        return $query->where('status', self::STATUS_ACTIVE)
                    ->where('expires_at', '>', now());
    }

    public function scopeExpired($query)
    {
        return $query->where('status', self::STATUS_EXPIRED)
                    ->orWhere(function($q) {
                        $q->where('status', self::STATUS_ACTIVE)
                          ->where('expires_at', '<=', now());
                    });
    }

    public function scopeExpiringWithin($query, int $days)
    {
        return $query->where('status', self::STATUS_ACTIVE)
                    ->where('expires_at', '>', now())
                    ->where('expires_at', '<=', now()->addDays($days));
    }

    public function scopeCancellable($query)
    {
        return $query->whereIn('status', [self::STATUS_PENDING, self::STATUS_ACTIVE]);
    }

    public function scopeRenewable($query)
    {
        return $query->whereIn('status', [self::STATUS_ACTIVE, self::STATUS_EXPIRED]);
    }
}