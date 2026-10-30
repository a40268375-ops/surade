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
        'is_active',
        'account_type',
        'password',
        'referral_code',
        'referral_code_status',
        'referral_used',
        'referred_by',
        'is_online',
        'last_seen_at',
    ];

    protected $hidden = [
        'password',
        'remember_token',
    ];

    protected $appends = [
        'applied_referral',
    ];

    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'is_active' => 'boolean',
            'referral_used' => 'boolean',
            'is_online' => 'boolean',
            'last_seen_at' => 'datetime',
        ];
    }

    public function referrer()
    {
        return $this->belongsTo(User::class, 'referred_by');
    }

    public function referrals()
    {
        return $this->hasMany(User::class, 'referred_by');
    }

    protected ?array $cachedBoundReferrer = null;

    /**
     * Dapatkan detail mitra referrer/upline yang terikat dengan user ini
     */
    public function getBoundReferrerDetails(): ?array
    {
        if ($this->cachedBoundReferrer !== null) {
            return $this->cachedBoundReferrer;
        }

        if (empty($this->referred_by)) {
            // Cek apakah ada riwayat referral di tabel referrals untuk auto-sync
            try {
                $lastRef = \Illuminate\Support\Facades\DB::table('referrals')
                    ->where('referred_user_id', $this->id)
                    ->whereNotNull('referrer_id')
                    ->orderBy('id', 'asc')
                    ->first();
                if ($lastRef && !empty($lastRef->referrer_id)) {
                    $this->referred_by = $lastRef->referrer_id;
                    $this->referral_used = true;
                    $this->save();
                } else {
                    return null;
                }
            } catch (\Throwable $e) {
                return null;
            }
        }

        $referrer = User::find($this->referred_by);
        if (!$referrer) {
            return null;
        }

        $avatar = null;
        if ($referrer->avatar) {
            $avatar = str_starts_with($referrer->avatar, 'http')
                ? $referrer->avatar
                : asset('storage/' . $referrer->avatar);
        }

        $details = [
            'is_bound'         => true,
            'referrer_id'      => $referrer->id,
            'referrer_name'    => $referrer->name,
            'referral_code'    => $referrer->referral_code,
            'code'             => $referrer->referral_code,
            'referrer_avatar'  => $avatar,
            'discount_percent' => 10,
            'is_agent_active'  => $referrer->isReferralAgent(),
        ];

        $this->cachedBoundReferrer = $details;
        return $details;
    }

    public function getAppliedReferralAttribute(): ?array
    {
        return $this->getBoundReferrerDetails();
    }

    public static function generateUniqueReferralCode(?string $name = null, $excludeUserId = null): string
    {
        $words = preg_split('/\s+/', trim($name ?? ''));
        $firstName = !empty($words[0]) ? $words[0] : 'SRD';
        $clean = strtoupper(preg_replace('/[^A-Za-z0-9]/', '', $firstName));
        $threeLetters = strtoupper(substr($clean, 0, 3));
        if (strlen($threeLetters) < 3) {
            $threeLetters = str_pad($threeLetters, 3, 'X');
        }

        do {
            $randomSuffix = str_pad((string) random_int(100, 999), 3, '0', STR_PAD_LEFT);
            $code = "{$threeLetters}{$randomSuffix}";
        } while (
            static::whereRaw('UPPER(referral_code) = ?', [$code])
                ->when($excludeUserId, fn($q) => $q->where('id', '!=', $excludeUserId))
                ->exists()
        );

        return $code;
    }

    /**
     * Cek apakah user berstatus sebagai Agen Referral Aktif:
     * Syarat: Memiliki usaha yang berstatus Premium aktif dan disetujui
     */
    public function isReferralAgent(): bool
    {
        if ($this->role === 'admin') {
            return false;
        }

        // Reseller atau Agent resmi otomatis berstatus Agen Referral Aktif
        if ($this->role === 'reseller' || $this->role === 'agent') {
            return true;
        }

        // Penjual dengan usaha Premium aktif (tidak berstatus rejected)
        return $this->businesses()
            ->where('is_premium', true)
            ->where(function ($q) {
                $q->whereNull('premium_expires_at')
                  ->orWhere('premium_expires_at', '>', now());
            })
            ->whereNotIn('status', ['rejected'])
            ->exists();
    }

    /**
     * Cek apakah user pernah memiliki usaha Premium yang kini kedaluwarsa
     */
    public function hasExpiredPremiumBusiness(): bool
    {
        return $this->businesses()
            ->where('is_premium', true)
            ->whereNotNull('premium_expires_at')
            ->where('premium_expires_at', '<=', now())
            ->exists();
    }

    /**
     * Cek apakah user memiliki usaha (penjual)
     */
    public function hasBusiness(): bool
    {
        return $this->businesses()->exists();
    }

    public function getReferralCodeAttribute($value)
    {
        if ($this->role === 'admin') {
            return null;
        }

        // Jika sudah ada kode referral tersimpan di database
        if (!empty($value)) {
            return $value;
        }

        // HANYA penjual dengan usaha Premium aktif yang berhak digeneratekan kode referral otomatis
        if ($this->exists && !empty($this->id) && $this->isReferralAgent()) {
            $generated = static::generateUniqueReferralCode($this->name, $this->id);
            try {
                \Illuminate\Support\Facades\DB::table('users')
                    ->where('id', $this->id)
                    ->update([
                        'referral_code' => $generated,
                        'referral_code_status' => 'active'
                    ]);
                $this->attributes['referral_code'] = $generated;
                $this->attributes['referral_code_status'] = 'active';
            } catch (\Throwable $e) {}
            return $generated;
        }

        // User biasa atau penjual free yang belum upgrade Premium tidak memiliki kode referral
        return null;
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

    public function blogs()
    {
        return $this->hasMany(Blog::class);
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

    public function coinWallet()
    {
        return $this->hasOne(CoinWallet::class);
    }

    public function coinPurchases()
    {
        return $this->hasMany(CoinPurchase::class);
    }

    public function coinTransactions()
    {
        return $this->hasMany(CoinTransaction::class);
    }

    public function unlockedWhatsAppContacts()
    {
        return $this->hasMany(WhatsAppUnlockedContact::class);
    }

    public function getCoinBalanceAttribute(): int
    {
        return $this->coinWallet ? (int)$this->coinWallet->balance : 0;
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
