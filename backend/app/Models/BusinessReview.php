<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class BusinessReview extends Model
{
    use HasFactory;

    protected $fillable = [
        'business_id',
        'reviewer_id',
        'rating',
        'comment',
        'helpful_count',
        'owner_reply',
        'owner_reply_at',
    ];

    protected $casts = [
        'rating' => 'integer',
        'helpful_count' => 'integer',
        'owner_reply_at' => 'datetime',
    ];

    public function business(): BelongsTo
    {
        return $this->belongsTo(Business::class);
    }

    public function reviewer(): BelongsTo
    {
        return $this->belongsTo(User::class, 'reviewer_id');
    }
}