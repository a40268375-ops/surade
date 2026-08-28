<?php

namespace App\Models;

use Illuminate\Contracts\Auth\MustVerifyEmail;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Sanctum\HasApiTokens;

class User extends Authenticatable implements MustVerifyEmail
{
    use HasApiTokens, HasFactory, Notifiable;

    protected $fillable = [
        'name',
        'email',
        'phone',
        'avatar',
        'bio',
        'location',
        'banner',
        'role',
        'password',
        'referral_code',
        'referral_code_status',
    ];

    protected $hidden = [
        'password',
        'remember_token',
    ];

    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
        ];
    }

    public function getReferralCodeAttribute($value)
    {
        if (!empty($value)) {
            return strtoupper($value);
        }

        $cleanUsername = preg_replace('/[^A-Za-z0-9]/', '', $this->username ?: $this->name);
        if (empty($cleanUsername)) {
            $cleanUsername = 'USER';
        }
        $generated = strtoupper("INFO-{$cleanUsername}-{$this->id}");

        // Save generated code lazily
        try {
            $this->attributes['referral_code'] = $generated;
            \Illuminate\Support\Facades\DB::table('users')
                ->where('id', $this->id)
                ->whereNull('referral_code')
                ->update(['referral_code' => $generated]);
        } catch (\Throwable $e) {
            // ignore fallback
        }

        return $generated;
    }

    public function referralsGiven()
    {
        return $this->hasMany(Referral::class, 'referrer_id');
    }

    public function referralsReceived()
    {
        return $this->hasMany(Referral::class, 'user_id');
    }

    /*
    |--------------------------------------------------------------------------
    | Business
    |--------------------------------------------------------------------------
    */

    public function businesses()
    {
        return $this->hasMany(Business::class);
    }

    /*
    |--------------------------------------------------------------------------
    | Subscription
    |--------------------------------------------------------------------------
    */

    public function subscription()
    {
        return $this->hasOne(Subscription::class);
    }

    /*
    |--------------------------------------------------------------------------
    | Ratings
    |--------------------------------------------------------------------------
    */

    public function ratings()
    {
        return $this->hasMany(Rating::class);
    }

    /*
    |--------------------------------------------------------------------------
    | Favorites
    |--------------------------------------------------------------------------
    */

    public function favorites()
    {
        return $this->hasMany(Favorite::class);
    }

    /*
    |--------------------------------------------------------------------------
    | Advertisements
    |--------------------------------------------------------------------------
    */

    public function advertisements()
    {
        return $this->hasMany(Advertisement::class);
    }

    /*
    |--------------------------------------------------------------------------
    | Conversations
    |--------------------------------------------------------------------------
    */

    // Sebagai customer
    public function customerConversations()
    {
        return $this->hasMany(Conversation::class, 'customer_id');
    }

    // Sebagai pemilik business
    public function ownerConversations()
    {
        return $this->hasMany(Conversation::class, 'owner_id');
    }

    /*
    |--------------------------------------------------------------------------
    | Messages
    |--------------------------------------------------------------------------
    */

    public function messages()
    {
        return $this->hasMany(Message::class, 'sender_id');
    }

    /*
    |--------------------------------------------------------------------------
    | Helpers
    |--------------------------------------------------------------------------
    */

    public function isAdmin()
    {
        return $this->role === 'admin';
    }

    public function isUser()
    {
        return $this->role === 'user';
    }
}
