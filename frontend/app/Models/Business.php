<?php
namespace App\Models;
use Illuminate\Database\Eloquent\Model;

class Business extends Model {
    protected $fillable = ['user_id', 'category_id', 'title', 'description', 'address', 'phone', 'email', 'operating_hours', 'website', 'image', 'is_premium', 'status', 'referred_by'];
}