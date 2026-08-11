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
        // If no operating hours specified, assume always open
        if (!$this->operating_hours) {
            return true;
        }

        // If marked as 24 hours, always open
        if (stripos($this->operating_hours, '24') !== false || stripos($this->operating_hours, 'jam') !== false) {
            return true;
        }

        $now = now()->setTimezone('Asia/Jakarta');
        $currentDay = $this->getCurrentDayInIndonesian($now);
        
        // Check if today is a closed day
        if ($this->closed_days && in_array($currentDay, $this->closed_days)) {
            return false;
        }

        // Parse operating hours (format: "08:00 - 20:00" or "08:00-20:00")
        $hours = $this->operating_hours;
        
        // Handle various formats
        $patterns = [
            '/(\d{1,2}):?(\d{0,2})\s*[-–—]\s*(\d{1,2}):?(\d{0,2})/',
            '/(\d{1,2})\.(\d{2})\s*[-–—]\s*(\d{1,2})\.(\d{2})/',
            '/(\d{1,2})\s*[-–—]\s*(\d{1,2})/',
        ];

        foreach ($patterns as $pattern) {
            if (preg_match($pattern, $hours, $matches)) {
                $openHour = (int) $matches[1];
                $openMinute = isset($matches[2]) && $matches[2] !== '' ? (int) $matches[2] : 0;
                $closeHour = (int) $matches[3];
                $closeMinute = isset($matches[4]) && $matches[4] !== '' ? (int) $matches[4] : 0;

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

        // If can't parse, assume open
        return true;
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