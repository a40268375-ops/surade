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
        'gender',
        'avatar',
        'bio',
        'location',
        'banner',
        'role',
        'account_type',
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

        $cleanName = preg_replace('/[^A-Za-z0-9]/', '', $this->name ?: 'USER');
        if (empty($cleanName)) {
            $cleanName = 'USER';
        }
        $generated = strtoupper("INFO-{$cleanName}-{$this->id}");

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

    /**
     * Pastikan `avatar` yang dikirim ke frontend selalu berupa URL utuh.
     * Sebelumnya kolom ini kadang berisi path relatif hasil upload
     * (mis. "avatars/xxx.jpg") yang tidak bisa dibuka langsung oleh
     * browser karena bukan alamat lengkap ke server backend — makanya
     * muncul ikon foto rusak untuk user yang pernah upload avatar.
     */
    public function getAvatarAttribute($value)
    {
        if (empty($value)) {
            return null;
        }

        // Sudah berupa URL lengkap (http/https) atau data URI, biarkan.
        if (preg_match('/^(https?:\/\/|data:)/i', $value)) {
            return $value;
        }

        // Path relatif hasil Storage::disk('public')->store(...)
        return \Illuminate\Support\Facades\Storage::disk('public')->url(ltrim($value, '/'));
    }

    public function referralsGiven()
    {
        return $this->hasMany(Referral::class, 'referrer_id');
    }

    public function referralsReceived()
    {
        return $this->hasMany(Referral::class, 'user_id');
    }

    public function businesses()
    {
        return $this->hasMany(Business::class);
    }

    public function subscription()
    {
        return $this->hasOne(Subscription::class);
    }

    public function ratings()
    {
        return $this->hasMany(Rating::class);
    }

    public function favorites()
    {
        return $this->hasMany(Favorite::class);
    }

    public function advertisements()
    {
        return $this->hasMany(Advertisement::class);
    }

    public function customerConversations()
    {
        return $this->hasMany(Conversation::class, 'customer_id');
    }

    public function ownerConversations()
    {
        return $this->hasMany(Conversation::class, 'owner_id');
    }

    public function messages()
    {
        return $this->hasMany(Message::class, 'sender_id');
    }

    public function userPackages()
    {
        return $this->hasMany(UserPackage::class);
    }

    public function packageTransactions()
    {
        return $this->hasMany(PackageTransaction::class);
    }

    public function contentTransactions()
    {
        return $this->hasMany(ContentTransaction::class);
    }

    public function isAdmin()
    {
        return $this->role === 'admin';
    }

    public function isUser()
    {
        return $this->role === 'user';
    }
}
