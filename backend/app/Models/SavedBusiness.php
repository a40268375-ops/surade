<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class SavedBusiness extends Model
{
    protected $fillable = ['user_id', 'business_id'];

    public function business()
    {
        return $this->belongsTo(Business::class);
    }

    public function user()
    {
        return $this->belongsTo(User::class);
    }
}