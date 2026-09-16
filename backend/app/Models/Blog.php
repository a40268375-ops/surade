<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Blog extends Model
{
    protected $fillable = [
        'user_id',
        'title',
        'slug',
        'content',
        'excerpt',
        'thumbnail',
        'images',
        'blog_category_id',
        'blog_category',
        'type',
        'status',
        'payment_proof',
        'payment_method',
        'coupon_code',
        'original_price',
        'discount_amount',
        'final_price',
        'published_at',
        'event_date',
        'event_end_date',
        'event_location',
        'rejection_reason',
        'views',
    ];

    protected $casts = [
        'images' => 'array',
        'published_at' => 'datetime',
        'event_date' => 'datetime',
        'event_end_date' => 'datetime',
    ];

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class, 'user_id');
    }

    public function author(): BelongsTo
    {
        return $this->belongsTo(User::class, 'user_id');
    }

    public function blogCategory(): BelongsTo
    {
        return $this->belongsTo(BlogCategory::class, 'blog_category_id');
    }

    // Fallback accessors for backwards compatibility
    public function getImageAttribute()
    {
        return $this->attributes['image'] ?? $this->attributes['thumbnail'] ?? null;
    }

    public function getCategoryAttribute()
    {
        return $this->attributes['category'] ?? $this->attributes['blog_category'] ?? null;
    }
}