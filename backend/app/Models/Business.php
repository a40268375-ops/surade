<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Business extends Model
{
    protected $fillable = [
        'user_id',
        'category_id',
        'title',
        'description',
        'address',
        'latitude',
        'longitude',
        'phone',
        'email',
        'operating_hours',
        'closed_days',
        'tags',
        'website',
        'image',
        'images',
        'video_url',
        'is_premium',
        'premium_expires_at',
        'premium_plan',
        'status',
        'referred_by',
    ];

    protected $casts = [
        'is_premium' => 'boolean',
        'premium_expires_at' => 'datetime',
        'images' => 'array',
        'closed_days' => 'array',
        'tags' => 'array',
    ];

    // Computed field sent to the frontend so the UI (and ads) automatically
    // "hilang sendiri" (disappear) once the subscription period has passed,
    // without needing the admin to manually turn it off.
    protected $appends = ['is_premium_active'];

    public function getIsPremiumActiveAttribute(): bool
    {
        if (!$this->is_premium) {
            return false;
        }
        if ($this->premium_expires_at === null) {
            return true; // lifetime / manually granted by admin
        }
        return $this->premium_expires_at->isFuture();
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function category(): BelongsTo
    {
        return $this->belongsTo(Category::class);
    }

    public function bookings(): \Illuminate\Database\Eloquent\Relations\HasMany
    {
        return $this->hasMany(Booking::class);
    }

    public function subscriptions(): \Illuminate\Database\Eloquent\Relations\HasMany
    {
        return $this->hasMany(Subscription::class);
    }
}