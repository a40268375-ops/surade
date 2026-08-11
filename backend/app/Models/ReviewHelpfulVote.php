<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class ReviewHelpfulVote extends Model
{
    use HasFactory;

    protected $fillable = [
        'review_type', // 'business' atau 'seller'
        'review_id',
        'user_id',
    ];
}