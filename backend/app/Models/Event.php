<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Event extends Model
{
    protected $fillable = [
        'title',
        'description',
        'location',
        'event_date',
        'image',
        'category',
        'image_url',
    ];

    protected $casts = [
        'event_date' => 'datetime',
    ];
}
