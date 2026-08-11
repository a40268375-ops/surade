<?php

namespace App\Models;

// use Illuminate\Contracts\Auth\MustVerifyEmail;
use Database\Factories\UserFactory;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Laravel\Sanctum\HasApiTokens;
use Illuminate\Notifications\Notifiable;

class User extends Authenticatable
{
    /** @use HasFactory<UserFactory> */
    use HasApiTokens, HasFactory, Notifiable;

    /**
     * The attributes that are mass assignable.
     *
     * @var list<string>
     */
    protected $fillable = [
        'name',
        'email',
        'password',
        'role',
        'status',
        'referral_code',
        'phone',
        'bio',
        'avatar',
        'cover_photo',
        'is_active',
    ];

    /**
     * The attributes that should be hidden for serialization.
     *
     * @var list<string>
     */
    protected $hidden = [
        'password',
        'remember_token',
    ];

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'password' => 'hashed',
            'is_active' => 'boolean',
        ];
    }

    public function businesses(): \Illuminate\Database\Eloquent\Relations\HasMany
    {
        return $this->hasMany(Business::class);
    }

    public function subscriptions(): \Illuminate\Database\Eloquent\Relations\HasMany
    {
        return $this->hasMany(Subscription::class);
    }

    // True if the user owns at least one business with an active (not expired)
    // premium subscription. Used to gate posting iklan (ads): free users can't.
    public function hasActivePremiumBusiness(): bool
    {
        return $this->businesses()->get()->contains(fn ($b) => $b->is_premium_active);
    }

    // Reviews given by this user (as reviewer)
    public function reviewsGiven()
    {
        return $this->hasMany(SellerReview::class, 'reviewer_id');
    }

    // Reviews received by this user (as seller)
    public function reviewsReceived()
    {
        return $this->hasMany(SellerReview::class, 'seller_id');
    }

    // Saved businesses by this user
    public function savedBusinesses()
    {
        return $this->hasMany(SavedBusiness::class);
    }
}