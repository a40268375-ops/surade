<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Business extends Model
{
    protected $fillable = [
        'user_id',
        'category_id',
        'name',
        'title',
        'slug',
        'description',
        'achievements',
        'address',
        'village',
        'city',
        'province',
        'postal_code',
        'latitude',
        'longitude',
        'phone',
        'whatsapp',
        'email',
        'website',
        'instagram',
        'facebook',
        'operating_hours',
        'opening_days',
        'closed_days',
        'price_category',
        'tags',
        'logo',
        'banner',
        'banners',
        'image',
        'images',
        'gallery',
        'video_url',
        'is_premium',
        'premium_expires_at',
        'premium_plan',
        'package',
        'featured',
        'status',
        'is_active',
        'views',
        'clicks',
        'rating',
        'rating_count',
        'referred_by',
        'verified_at',
        'verified_by',
        'rejection_reason',
        'suspend_reason',
        'suspended_at',
        'suspended_by',
    ];

    protected $casts = [
        'is_premium' => 'boolean',
        'is_active' => 'boolean',
        'premium_expires_at' => 'datetime',
        'verified_at' => 'datetime',
        'suspended_at' => 'datetime',
        'images' => 'array',
        'banners' => 'array',
        'gallery' => 'array',
        'closed_days' => 'array',
        'tags' => 'array',
        'opening_days' => 'json',
    ];

    public function getTitleAttribute()
    {
        return $this->attributes['title'] ?? $this->attributes['name'] ?? null;
    }

    public function getNameAttribute()
    {
        return $this->attributes['name'] ?? $this->attributes['title'] ?? null;
    }

    public function getTagsAttribute($value)
    {
        $decoded = is_string($value) ? json_decode($value, true) : $value;
        if (!empty($decoded) && is_array($decoded)) {
            return $decoded;
        }

        $tags = [];
        if ($this->relationLoaded('category') && $this->category) {
            $tags[] = $this->category->name;
        }
        if (!empty($this->village)) {
            $tags[] = $this->village;
        }
        return !empty($tags) ? array_values(array_unique($tags)) : ['UMKM Surade'];
    }

    // Rating rata-rata & jumlah ulasan dihitung otomatis dari business_reviews,
    // supaya tidak lagi angka statis (dulu selalu rating 4.5 / 0 ulasan).
    protected $appends = ['is_premium_active', 'starting_price', 'rating', 'reviews_count', 'is_open_now', 'premium_features', 'village', 'ad_info', 'has_active_ad', 'is_verified'];

    public function getIsVerifiedAttribute(): bool
    {
        return (bool) $this->is_premium_active;
    }

    public function advertisements(): \Illuminate\Database\Eloquent\Relations\HasMany
    {
        return $this->hasMany(\App\Models\Advertisement::class);
    }

    public function getAdInfoAttribute(): ?array
    {
        $ad = $this->relationLoaded('advertisements') 
            ? $this->advertisements->first() 
            : \App\Models\Advertisement::where('business_id', $this->id)->latest()->first();

        if (!$ad) {
            return null;
        }

        $isActive = ($ad->status === 'active') && (!$ad->end_date || $ad->end_date > now()) && (!$ad->expires_at || $ad->expires_at > now());

        return [
            'id' => $ad->id,
            'status' => $isActive ? 'active' : ($ad->status === 'active' ? 'expired' : $ad->status),
            'label' => $isActive ? 'Aktif' : ($ad->status === 'active' ? 'Kadaluarsa' : 'Tidak Aktif'),
            'package_name' => $ad->package_name ?? 'Paket Iklan',
            'package_type' => $ad->package_type ?? 'standard',
            'duration_days' => $ad->duration_days,
            'start_date' => $ad->start_date ? $ad->start_date->format('Y-m-d') : null,
            'end_date' => $ad->end_date ? $ad->end_date->format('Y-m-d') : null,
            'expired_at' => $ad->end_date ? $ad->end_date->format('d M Y') : null,
        ];
    }

    public function getHasActiveAdAttribute(): bool
    {
        $info = $this->ad_info;
        return $info && $info['status'] === 'active';
    }

    public function getVillageAttribute(): ?string
    {
        return $this->city ?? null;
    }

    public function getIsPremiumAttribute($value): bool
    {
        if (!$value) {
            return false;
        }
        if ($this->premium_expires_at && $this->premium_expires_at->isPast()) {
            return false;
        }
        return true;
    }

    public function getIsPremiumActiveAttribute(): bool
    {
        if (!$this->is_premium) {
            return false;
        }
        if ($this->premium_expires_at === null) {
            return true; // lifetime / manually granted by admin
        }
        return $this->premium_expires_at->isFuture();
    }

    public function getRatingAttribute(): float
    {
        if (isset($this->attributes['reviews_avg_rating'])) {
            return round((float) $this->attributes['reviews_avg_rating'], 1);
        }
        if (isset($this->attributes['rating']) && is_numeric($this->attributes['rating']) && $this->attributes['rating'] > 0) {
            return round((float) $this->attributes['rating'], 1);
        }
        if ($this->relationLoaded('reviews')) {
            $avg = $this->reviews->avg('rating');
            return $avg ? round((float) $avg, 1) : 0;
        }
        try {
            $avg = $this->reviews()->avg('rating');
            return $avg ? round((float) $avg, 1) : 0;
        } catch (\Throwable $e) {
            return 0;
        }
    }

    public function getReviewsCountAttribute(): int
    {
        if (isset($this->attributes['reviews_count'])) {
            return (int) $this->attributes['reviews_count'];
        }
        if ($this->relationLoaded('reviews')) {
            return $this->reviews->count();
        }
        try {
            return (int) $this->reviews()->count();
        } catch (\Throwable $e) {
            return 0;
        }
    }

    public function reviews(): \Illuminate\Database\Eloquent\Relations\HasMany
    {
        return $this->hasMany(Rating::class);
    }

    public function getStartingPriceAttribute(): ?int
    {
        if (!$this->relationLoaded('menuItems')) {
            return null;
        }
        return $this->menuItems->where('is_available', true)->min('price');
    }

    /**
     * Check if business is currently open based on operating hours and closed days
     */
    public function getIsOpenNowAttribute(): bool
    {
        $now = now()->setTimezone('Asia/Jakarta');
        $currentDay = $this->getCurrentDayInIndonesian($now);

        // PENTING: cek hari libur (closed_days) HARUS dilakukan duluan,
        // sebelum cek operating_hours kosong. Sebelumnya kalau jam
        // operasional belum diisi, fungsi ini langsung return true
        // (dianggap "selalu buka") tanpa pernah sampai mengecek apakah
        // hari ini termasuk hari libur — jadi status "Tutup" di hari
        // libur nggak pernah muncul untuk bisnis yang belum isi jam.
        $closedDays = $this->closed_days;
        if ($closedDays && is_array($closedDays) && in_array($currentDay, $closedDays)) {
            return false;
        }

        // Tanpa jam operasional = dianggap tutup (bukan selalu buka)
        if (!$this->operating_hours) {
            return false;
        }

        // Hanya "24 jam" eksplisit yang dianggap buka terus
        if (preg_match('/24\s*(jam|hours?)/i', $this->operating_hours)) {
            return true;
        }

        // Parse operating hours (format: "08:00 - 20:00", "08:00-20:00",
        // "08.00 - 20.00", or "08.00-20.00")
        $hours = $this->operating_hours;
        
        // Handle various formats. PENTING: pola dengan menit (":mm" atau
        // ".mm") harus dicoba lebih dulu dan menit HARUS persis 2 digit,
        // supaya jam bertitik seperti "08.00 - 17.00" tidak salah tertangkap
        // oleh pola jam-saja di bawahnya (dulu itu bikin "08.00" kebaca
        // jadi jam 00, karena titiknya dianggap bukan bagian dari jamnya).
        // Nama grup dipakai eksplisit (bukan index angka) supaya jam & menit
        // tidak ketuker walau jumlah grup antar pola beda-beda.
        $patterns = [
            '/(?<oh>\d{1,2})[:.](?<om>\d{2})\s*[-–—]\s*(?<ch>\d{1,2})[:.](?<cm>\d{2})/',
            '/(?<oh>\d{1,2})\s*[-–—]\s*(?<ch>\d{1,2})/',
        ];

        foreach ($patterns as $pattern) {
            if (preg_match($pattern, $hours, $matches)) {
                $openHour = (int) $matches['oh'];
                $openMinute = isset($matches['om']) && $matches['om'] !== '' ? (int) $matches['om'] : 0;
                $closeHour = (int) $matches['ch'];
                $closeMinute = isset($matches['cm']) && $matches['cm'] !== '' ? (int) $matches['cm'] : 0;

                $openTime = $now->copy()->hour($openHour)->minute($openMinute)->second(0);
                $closeTime = $now->copy()->hour($closeHour)->minute($closeMinute)->second(0);

                // Handle overnight hours (e.g., 22:00 - 06:00)
                if ($closeTime->lt($openTime)) {
                    $closeTime->addDay();
                    return $now->gte($openTime) || $now->lt($closeTime);
                }

                return $now->between($openTime, $closeTime);
            }
        }

        // Kalau format jam tidak bisa diparse, anggap tutup
        return false;
    }

    /**
     * Get current day name in Indonesian
     */
    private function getCurrentDayInIndonesian($date): string
    {
        $dayMap = [
            'Sunday' => 'Minggu',
            'Monday' => 'Senin', 
            'Tuesday' => 'Selasa',
            'Wednesday' => 'Rabu',
            'Thursday' => 'Kamis',
            'Friday' => 'Jumat',
            'Saturday' => 'Sabtu'
        ];

        return $dayMap[$date->englishDayOfWeek] ?? 'Unknown';
    }

    /**
     * Get premium features available for this business
     */
    public function getPremiumFeaturesAttribute(): array
    {
        $isPremium = $this->is_premium_active;

        return [
            // Core Features (Available for both)
            'basic_listing' => true,
            'contact_info' => true,
            'basic_description' => true,
            'location_map' => true,
            
            // Premium Only Features
            'unlimited_photos' => $isPremium, // Free: max 3 photos
            'video_showcase' => $isPremium,
            'detailed_description' => $isPremium,
            'contact_form' => $isPremium,
            'photo_gallery' => $isPremium,
            'social_media_links' => $isPremium,
            'website_link' => $isPremium,
            'operating_hours' => $isPremium,
            'announcements' => $isPremium,
            'price_list' => $isPremium,
            'faq_section' => $isPremium,
            'tags_keywords' => $isPremium,
            'promotional_banners' => $isPremium,
            'priority_listing' => $isPremium, // Show at top of search
            'advanced_analytics' => $isPremium,
            'customer_reviews_management' => $isPremium,
            'booking_system' => $isPremium,
            'promotional_offers' => $isPremium,
            
            // Limits
            'max_photos' => $isPremium ? null : 3, // null = unlimited
            'max_menu_items' => $isPremium ? null : 10,
            'max_announcements' => $isPremium ? null : 2,
        ];
    }

    public function menuItems(): \Illuminate\Database\Eloquent\Relations\HasMany
    {
        return $this->hasMany(MenuItem::class);
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function verifiedBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'verified_by');
    }

    public function suspendedBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'suspended_by');
    }

    public function category(): BelongsTo
    {
        return $this->belongsTo(Category::class);
    }

    public function bookings(): \Illuminate\Database\Eloquent\Relations\HasMany
    {
        return $this->hasMany(Booking::class);
    }

    public function subscriptions(): \Illuminate\Database\Eloquent\Relations\HasMany
    {
        return $this->hasMany(Subscription::class);
    }

    public function latestSubscription(): \Illuminate\Database\Eloquent\Relations\HasOne
    {
        return $this->hasOne(Subscription::class)->latestOfMany();
    }

    public function products(): \Illuminate\Database\Eloquent\Relations\HasMany
    {
        return $this->hasMany(Product::class);
    }

    /**
     * Retrieve the model for a bound value (supports both numeric ID and slug).
     *
     * @param  mixed  $value
     * @param  string|null  $field
     * @return \Illuminate\Database\Eloquent\Model|null
     */
    public function resolveRouteBinding($value, $field = null)
    {
        if (is_numeric($value)) {
            $record = $this->where('id', $value)->first();
            if ($record) return $record;
        }

        return $this->where('slug', $value)
            ->orWhere('id', $value)
            ->firstOrFail();
    }
}