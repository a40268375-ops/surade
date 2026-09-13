<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class PageView extends Model
{
    public $timestamps = false; // hanya pakai created_at, diisi manual/default DB

    protected $fillable = ['business_id', 'path', 'created_at'];

    protected $casts = [
        'created_at' => 'datetime',
    ];

    public function business()
    {
        return $this->belongsTo(Business::class);
    }
}