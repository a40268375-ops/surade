<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Advertisement extends Model
{
    protected $fillable = [
        'user_id',
        'business_id',
        'ad_package_id',
        'name',
        'package_type',
        'package_name',
        'duration_days',
        'image',
        'banner',
        'logo',
        'city',
        'province',
        'price',
        'original_price',
        'discount_amount',
        'coupon_code',
        'payment_method',
        'payment_proof',
        'status',
        'rejection_reason',
        'start_date',
        'end_date',
    ];

    protected $casts = [
        'start_date' => 'datetime',
        'end_date' => 'datetime',
        'price' => 'decimal:2',
        'original_price' => 'decimal:2',
        'discount_amount' => 'decimal:2',
    ];

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function business(): BelongsTo
    {
        return $this->belongsTo(Business::class);
    }

    public function adPackage(): BelongsTo
    {
        return $this->belongsTo(AdPackage::class);
    }

    public function category(): BelongsTo
    {
        return $this->belongsTo(Category::class);
    }

    public function getTitleAttribute()
    {
        return $this->attributes['title'] ?? $this->attributes['name'] ?? null;
    }

    public function getDurationDaysAttribute($value)
    {
        if (!empty($value)) {
            return (int) $value;
        }
        if ($this->start_date && $this->end_date) {
            return (int) $this->start_date->diffInDays($this->end_date);
        }
        return 30;
    }
}