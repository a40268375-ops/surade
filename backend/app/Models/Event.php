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
        'gallery',
        'category',
        'status',
        'latitude',
        'longitude',
    ];

    protected $casts = [
        'event_date' => 'datetime',
        'gallery' => 'array',
        'latitude' => 'float',
        'longitude' => 'float',
    ];
}