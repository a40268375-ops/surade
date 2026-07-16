<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Booking extends Model
{
    use HasFactory;

    protected $fillable = [
        'business_id',
        'customer_name',
        'customer_phone',
        'customer_email',
        'booking_date',
        'booking_time',
        'notes',
        'status',
    ];

    protected $casts = [
        'booking_date' => 'date',
    ];

    public function business()
    {
        return $this->belongsTo(Business::class);
    }
}