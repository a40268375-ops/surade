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
        'payment_method',
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
    ];

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function business(): BelongsTo
    {
        return $this->belongsTo(Business::class);
    }
}