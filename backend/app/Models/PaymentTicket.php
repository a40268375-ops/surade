<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class PaymentTicket extends Model
{
    protected $fillable = [
        'user_id',
        'business_id',
        'plan',
        'amount',
        'original_amount',
        'payment_method',
        'payment_proof',
        'referral_code',
        'discount_percent',
        'referrer_id',
        'notes',
        'admin_notes',
        'status',
    ];

    protected $casts = [
        'status' => 'string',
        'amount' => 'decimal:2',
        'original_amount' => 'decimal:2',
        'discount_percent' => 'decimal:2',
    ];

    protected $appends = [
        'payment_proof_url'
    ];

    public function getPaymentProofUrlAttribute()
    {
        if (!$this->payment_proof) {
            return null;
        }
        
        // If already a full URL, return as is
        if (str_starts_with($this->payment_proof, 'http')) {
            return $this->payment_proof;
        }
        
        // Generate full URL for storage path
        return url('storage/' . $this->payment_proof);
    }

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function business()
    {
        return $this->belongsTo(Business::class);
    }

    public function referrer()
    {
        return $this->belongsTo(User::class, 'referrer_id');
    }
}
