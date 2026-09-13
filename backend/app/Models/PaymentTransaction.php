<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class PaymentTransaction extends Model
{
    use HasFactory;

    protected $fillable = [
        'subscription_id',
        'transaction_id',
        'gateway',
        'amount',
        'status',
        'gateway_response',
    ];

    protected $casts = [
        'gateway_response' => 'array',
        'amount' => 'integer',
    ];

    public function subscription()
    {
        return $this->belongsTo(Subscription::class);
    }
}