<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class PlatformCoupon extends Model
{
    protected $fillable = [
        'code',
        'name',
        'discount_type',
        'discount_value',
        'applies_to',
        'min_purchase',
        'max_uses',
        'used_count',
        'expires_at',
        'is_active',
    ];

    protected $casts = [
        'discount_value' => 'integer',
        'min_purchase' => 'integer',
        'max_uses' => 'integer',
        'used_count' => 'integer',
        'expires_at' => 'date',
        'is_active' => 'boolean',
    ];
}