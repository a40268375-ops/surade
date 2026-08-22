<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Business extends Model
{
    protected $fillable = [
        'user_id',
        'category_id',
        'title',
        'description',
        'address',
        'village',
        'latitude',
        'longitude',
        'phone',
        'email',
        'operating_hours',
        'closed_days',
        'price_category',
        'tags',
        'website',
        'image',
        'images',
        'video_url',
        'is_premium',
        'premium_expires_at',
        'premium_plan',
        'package',
        'status',
        'referred_by',
    ];

    protected $casts = [
        'is_premium' => 'boolean',
        'premium_expires_at' => 'datetime',
        'images' => 'array',
        'closed_days' => 'array',
        'tags' => 'array',
    ];

    // Rating rata-rata & jumlah ulasan dihitung otomatis dari business_reviews,
    // supaya tidak lagi angka statis (dulu selalu rating 4.5 / 0 ulasan).
    protected $appends = ['is_premium_active', 'starting_price', 'rating', 'reviews_count', 'is_open_now', 'premium_features'];

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
        if ($this->relationLoaded('reviews')) {
            $avg = $this->reviews->avg('rating');
        } else {
            $avg = $this->reviews()->avg('rating');
        }
        return $avg ? round($avg, 1) : 0;
    }

    public function getReviewsCountAttribute(): int
    {
        return $this->relationLoaded('reviews') ? $this->reviews->count() : $this->reviews()->count();
    }

    public function reviews(): \Illuminate\Database\Eloquent\Relations\HasMany
    {
        return $this->hasMany(BusinessReview::class);
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
}