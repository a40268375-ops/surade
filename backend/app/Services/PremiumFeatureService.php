<?php

namespace App\Services;

use App\Models\User;
use App\Models\Business;
use Illuminate\Support\Collection;

class PremiumFeatureService
{
    /**
     * Premium feature limits for free users
     */
    const FREE_LIMITS = [
        'businesses' => 1,
        'photos_per_business' => 3,
        'menu_items_per_business' => 10,
        'announcements_per_business' => 2,
        'videos_per_business' => 0, // No videos for free users
        'social_links_per_business' => 0,
        'promotional_offers_per_business' => 0,
    ];

    /**
     * Premium pricing plans
     */
    const PREMIUM_PLANS = [
        'monthly' => [
            'label' => 'Premium Bulanan',
            'days' => 30,
            'price' => 150000,
            'savings' => 0,
            'popular' => false
        ],
        'quarterly' => [
            'label' => 'Premium 3 Bulan',
            'days' => 90,
            'price' => 399000,
            'savings' => 51000, // vs 3x monthly
            'popular' => true
        ],
        'yearly' => [
            'label' => 'Premium Tahunan',
            'days' => 365,
            'price' => 1500000,
            'savings' => 300000, // vs 12x monthly
            'popular' => false
        ]
    ];

    /**
     * Check if user can perform a specific action
     */
    public function canPerformAction(User $user, string $action, $resource = null): array
    {
        // Admin can do everything
        if ($user->role === 'admin') {
            return ['allowed' => true, 'reason' => 'admin'];
        }

        $hasPremium = $user->hasActivePremiumBusiness();

        switch ($action) {
            case 'create_business':
                return $this->checkBusinessCreationLimit($user);

            case 'upload_photos':
                return $this->checkPhotoUploadLimit($user, $resource);

            case 'add_menu_item':
                return $this->checkMenuItemLimit($user, $resource);

            case 'create_announcement':
                return $this->checkAnnouncementLimit($user, $resource);

            case 'upload_video':
                return $this->checkVideoUploadLimit($user, $resource);

            case 'add_social_links':
                return $hasPremium 
                    ? ['allowed' => true, 'reason' => 'premium']
                    : ['allowed' => false, 'reason' => 'premium_required', 'feature' => 'social_media_links'];

            case 'create_advertisement':
                return $hasPremium || $user->role === 'reseller'
                    ? ['allowed' => true, 'reason' => 'premium']
                    : ['allowed' => false, 'reason' => 'premium_required', 'feature' => 'create_advertisement'];

            case 'access_advanced_analytics':
                return $hasPremium
                    ? ['allowed' => true, 'reason' => 'premium']
                    : ['allowed' => false, 'reason' => 'premium_required', 'feature' => 'advanced_analytics'];

            case 'use_booking_system':
                return $hasPremium
                    ? ['allowed' => true, 'reason' => 'premium']
                    : ['allowed' => false, 'reason' => 'premium_required', 'feature' => 'booking_system'];

            default:
                return ['allowed' => false, 'reason' => 'unknown_action'];
        }
    }

    /**
     * Check business creation limits
     */
    private function checkBusinessCreationLimit(User $user): array
    {
        $businessCount = $user->businesses()->count();
        $hasPremium = $user->hasActivePremiumBusiness();

        if ($businessCount < self::FREE_LIMITS['businesses'] || $hasPremium) {
            return ['allowed' => true, 'reason' => $hasPremium ? 'premium' : 'within_limit'];
        }

        return [
            'allowed' => false,
            'reason' => 'limit_exceeded',
            'feature' => 'create_multiple_businesses',
            'current' => $businessCount,
            'limit' => self::FREE_LIMITS['businesses']
        ];
    }

    /**
     * Check photo upload limits for a business
     */
    private function checkPhotoUploadLimit(User $user, Business $business = null): array
    {
        if (!$business) {
            return ['allowed' => false, 'reason' => 'no_business'];
        }

        $hasPremium = $business->is_premium_active;
        
        if ($hasPremium) {
            return ['allowed' => true, 'reason' => 'premium'];
        }

        $currentPhotos = is_array($business->images) ? count($business->images) : 0;
        $limit = self::FREE_LIMITS['photos_per_business'];

        if ($currentPhotos < $limit) {
            return [
                'allowed' => true, 
                'reason' => 'within_limit',
                'remaining' => $limit - $currentPhotos
            ];
        }

        return [
            'allowed' => false,
            'reason' => 'limit_exceeded',
            'feature' => 'unlimited_photos',
            'current' => $currentPhotos,
            'limit' => $limit
        ];
    }

    /**
     * Check menu item limits for a business
     */
    private function checkMenuItemLimit(User $user, Business $business = null): array
    {
        if (!$business) {
            return ['allowed' => false, 'reason' => 'no_business'];
        }

        $hasPremium = $business->is_premium_active;
        
        if ($hasPremium) {
            return ['allowed' => true, 'reason' => 'premium'];
        }

        $currentMenuItems = $business->menuItems()->count();
        $limit = self::FREE_LIMITS['menu_items_per_business'];

        if ($currentMenuItems < $limit) {
            return [
                'allowed' => true,
                'reason' => 'within_limit',
                'remaining' => $limit - $currentMenuItems
            ];
        }

        return [
            'allowed' => false,
            'reason' => 'limit_exceeded',
            'feature' => 'unlimited_menu_items',
            'current' => $currentMenuItems,
            'limit' => $limit
        ];
    }

    /**
     * Check announcement limits for a business
     */
    private function checkAnnouncementLimit(User $user, Business $business = null): array
    {
        if (!$business) {
            return ['allowed' => false, 'reason' => 'no_business'];
        }

        $hasPremium = $business->is_premium_active;
        
        if ($hasPremium) {
            return ['allowed' => true, 'reason' => 'premium'];
        }

        // Count announcements for this business (assuming there's a business_id field)
        $currentAnnouncements = \App\Models\Announcement::where('business_id', $business->id)->count();
        $limit = self::FREE_LIMITS['announcements_per_business'];

        if ($currentAnnouncements < $limit) {
            return [
                'allowed' => true,
                'reason' => 'within_limit',
                'remaining' => $limit - $currentAnnouncements
            ];
        }

        return [
            'allowed' => false,
            'reason' => 'limit_exceeded',
            'feature' => 'unlimited_announcements',
            'current' => $currentAnnouncements,
            'limit' => $limit
        ];
    }

    /**
     * Check video upload limits
     */
    private function checkVideoUploadLimit(User $user, Business $business = null): array
    {
        if (!$business) {
            return ['allowed' => false, 'reason' => 'no_business'];
        }

        $hasPremium = $business->is_premium_active;
        
        if (!$hasPremium) {
            return [
                'allowed' => false,
                'reason' => 'premium_required',
                'feature' => 'video_showcase',
                'limit' => self::FREE_LIMITS['videos_per_business']
            ];
        }

        return ['allowed' => true, 'reason' => 'premium'];
    }

    /**
     * Get premium feature comparison for marketing
     */
    public function getFeatureComparison(): array
    {
        return [
            'basic' => [
                'name' => 'Gratis',
                'price' => 0,
                'features' => [
                    'business_limit' => self::FREE_LIMITS['businesses'] . ' bisnis',
                    'photos' => self::FREE_LIMITS['photos_per_business'] . ' foto per bisnis',
                    'menu_items' => self::FREE_LIMITS['menu_items_per_business'] . ' menu item',
                    'announcements' => self::FREE_LIMITS['announcements_per_business'] . ' pengumuman',
                    'videos' => 'Tidak ada',
                    'analytics' => 'Basic',
                    'support' => 'Community',
                    'ads' => 'Tidak bisa',
                    'priority_listing' => 'Tidak',
                    'social_links' => 'Tidak'
                ]
            ],
            'premium' => [
                'name' => 'Premium',
                'price' => self::PREMIUM_PLANS['monthly']['price'],
                'features' => [
                    'business_limit' => 'Unlimited bisnis',
                    'photos' => 'Unlimited foto',
                    'menu_items' => 'Unlimited menu item',
                    'announcements' => 'Unlimited pengumuman',
                    'videos' => 'Video showcase',
                    'analytics' => 'Advanced analytics',
                    'support' => 'Priority support',
                    'ads' => 'Bisa pasang iklan',
                    'priority_listing' => 'Ya',
                    'social_links' => 'Semua platform'
                ]
            ]
        ];
    }

    /**
     * Get user's current usage statistics
     */
    public function getUserUsageStats(User $user): array
    {
        $businesses = $user->businesses;
        
        $stats = [
            'businesses' => [
                'current' => $businesses->count(),
                'limit' => $user->hasActivePremiumBusiness() ? null : self::FREE_LIMITS['businesses'],
                'percentage' => $user->hasActivePremiumBusiness() ? 0 : 
                    ($businesses->count() / self::FREE_LIMITS['businesses']) * 100
            ]
        ];

        foreach ($businesses as $business) {
            $businessId = $business->id;
            
            // Photo usage
            $photoCount = is_array($business->images) ? count($business->images) : 0;
            $photoLimit = $business->is_premium_active ? null : self::FREE_LIMITS['photos_per_business'];
            
            // Menu item usage
            $menuCount = $business->menuItems()->count();
            $menuLimit = $business->is_premium_active ? null : self::FREE_LIMITS['menu_items_per_business'];
            
            // Announcement usage
            $announcementCount = \App\Models\Announcement::where('business_id', $businessId)->count();
            $announcementLimit = $business->is_premium_active ? null : self::FREE_LIMITS['announcements_per_business'];

            $stats['businesses_detail'][$businessId] = [
                'name' => $business->title,
                'is_premium' => $business->is_premium_active,
                'photos' => [
                    'current' => $photoCount,
                    'limit' => $photoLimit,
                    'percentage' => $photoLimit ? ($photoCount / $photoLimit) * 100 : 0
                ],
                'menu_items' => [
                    'current' => $menuCount,
                    'limit' => $menuLimit,
                    'percentage' => $menuLimit ? ($menuCount / $menuLimit) * 100 : 0
                ],
                'announcements' => [
                    'current' => $announcementCount,
                    'limit' => $announcementLimit,
                    'percentage' => $announcementLimit ? ($announcementCount / $announcementLimit) * 100 : 0
                ]
            ];
        }

        return $stats;
    }

    /**
     * Get premium conversion suggestions for user
     */
    public function getPremiumSuggestions(User $user): array
    {
        $suggestions = [];
        $stats = $this->getUserUsageStats($user);

        // Check if user is near limits
        if (!$user->hasActivePremiumBusiness()) {
            // Business limit suggestion
            if ($stats['businesses']['percentage'] >= 100) {
                $suggestions[] = [
                    'type' => 'limit_reached',
                    'feature' => 'businesses',
                    'message' => 'Anda sudah mencapai batas maksimal bisnis. Upgrade ke Premium untuk menambah bisnis unlimited!',
                    'urgency' => 'high'
                ];
            }

            // Photo limit suggestions
            foreach ($stats['businesses_detail'] as $businessStats) {
                if ($businessStats['photos']['percentage'] >= 80) {
                    $suggestions[] = [
                        'type' => 'approaching_limit',
                        'feature' => 'photos',
                        'business' => $businessStats['name'],
                        'message' => "Foto bisnis '{$businessStats['name']}' hampir mencapai batas. Upgrade untuk upload foto unlimited!",
                        'urgency' => $businessStats['photos']['percentage'] >= 100 ? 'high' : 'medium'
                    ];
                }

                if ($businessStats['menu_items']['percentage'] >= 80) {
                    $suggestions[] = [
                        'type' => 'approaching_limit',
                        'feature' => 'menu_items',
                        'business' => $businessStats['name'],
                        'message' => "Menu bisnis '{$businessStats['name']}' hampir penuh. Upgrade untuk menu item unlimited!",
                        'urgency' => $businessStats['menu_items']['percentage'] >= 100 ? 'high' : 'medium'
                    ];
                }
            }

            // Feature suggestions
            $suggestions[] = [
                'type' => 'feature_unlock',
                'feature' => 'advertisements',
                'message' => 'Tingkatkan visibilitas bisnis dengan iklan berbayar! Hanya tersedia untuk Premium.',
                'urgency' => 'low'
            ];
        }

        return $suggestions;
    }

    /**
     * Validate premium feature access with detailed checks
     */
    public function validateFeatureAccess(User $user, string $feature, array $context = []): array
    {
        $result = [
            'allowed' => false,
            'reason' => '',
            'validation_details' => [],
            'upgrade_suggestions' => []
        ];

        // Admin users bypass all restrictions
        if ($user->role === 'admin') {
            $result['allowed'] = true;
            $result['reason'] = 'admin_access';
            return $result;
        }

        // Check user's premium status
        $isPremium = $user->hasActivePremiumBusiness();
        $result['validation_details']['is_premium'] = $isPremium;
        $result['validation_details']['premium_expires_at'] = $user->premium_expires_at;

        switch ($feature) {
            case 'advanced_analytics':
                return $this->validateAdvancedAnalytics($user, $context, $result);
            
            case 'booking_system':
                return $this->validateBookingSystem($user, $context, $result);
            
            case 'social_media_links':
                return $this->validateSocialMediaLinks($user, $context, $result);
            
            case 'promotional_banners':
                return $this->validatePromotionalBanners($user, $context, $result);
            
            case 'customer_reviews_management':
                return $this->validateReviewsManagement($user, $context, $result);
            
            case 'bulk_operations':
                return $this->validateBulkOperations($user, $context, $result);
            
            default:
                $result['reason'] = 'unknown_feature';
                $result['upgrade_suggestions'] = ['Fitur tidak dikenali'];
                return $result;
        }
    }

    /**
     * Validate advanced analytics access
     */
    private function validateAdvancedAnalytics(User $user, array $context, array $result): array
    {
        if ($user->hasActivePremiumBusiness()) {
            $result['allowed'] = true;
            $result['reason'] = 'premium_access';
            return $result;
        }

        $result['reason'] = 'premium_required';
        $result['validation_details']['required_plan'] = 'any_premium';
        $result['upgrade_suggestions'] = [
            'Dapatkan analisis mendalam dengan data pengunjung, konversi, dan performa bisnis',
            'Lihat tren bulanan dan perbandingan dengan kompetitor',
            'Export laporan untuk presentasi dan evaluasi bisnis'
        ];

        return $result;
    }

    /**
     * Validate booking system access
     */
    private function validateBookingSystem(User $user, array $context, array $result): array
    {
        if (!$user->hasActivePremiumBusiness()) {
            $result['reason'] = 'premium_required';
            $result['validation_details']['required_plan'] = 'any_premium';
            $result['upgrade_suggestions'] = [
                'Terima reservasi online dari pelanggan',
                'Kelola jadwal dan kapasitas dengan mudah',
                'Kirim konfirmasi otomatis via email/SMS'
            ];
            return $result;
        }

        // Check if business category supports booking
        if (isset($context['business'])) {
            $business = $context['business'];
            $bookingSupportedCategories = ['restaurant', 'salon', 'clinic', 'hotel', 'spa', 'gym'];
            
            if (!in_array($business->category->slug ?? '', $bookingSupportedCategories)) {
                $result['reason'] = 'category_not_supported';
                $result['validation_details']['supported_categories'] = $bookingSupportedCategories;
                $result['upgrade_suggestions'] = [
                    'Sistem booking tersedia untuk kategori: ' . implode(', ', $bookingSupportedCategories)
                ];
                return $result;
            }
        }

        $result['allowed'] = true;
        $result['reason'] = 'premium_access';
        return $result;
    }

    /**
     * Validate social media links access
     */
    private function validateSocialMediaLinks(User $user, array $context, array $result): array
    {
        if ($user->hasActivePremiumBusiness()) {
            $result['allowed'] = true;
            $result['reason'] = 'premium_access';
            
            // Validate social media URLs if provided
            if (isset($context['social_links'])) {
                $validationErrors = [];
                $allowedPlatforms = ['facebook', 'instagram', 'twitter', 'tiktok', 'youtube', 'whatsapp'];
                
                foreach ($context['social_links'] as $platform => $url) {
                    if (!in_array($platform, $allowedPlatforms)) {
                        $validationErrors[] = "Platform '$platform' tidak didukung";
                    }
                    
                    if (!filter_var($url, FILTER_VALIDATE_URL)) {
                        $validationErrors[] = "URL tidak valid untuk platform '$platform'";
                    }
                }
                
                if (!empty($validationErrors)) {
                    $result['allowed'] = false;
                    $result['reason'] = 'invalid_social_links';
                    $result['validation_details']['errors'] = $validationErrors;
                    $result['validation_details']['allowed_platforms'] = $allowedPlatforms;
                }
            }
            
            return $result;
        }

        $result['reason'] = 'premium_required';
        $result['validation_details']['required_plan'] = 'any_premium';
        $result['upgrade_suggestions'] = [
            'Tambahkan link media sosial ke profil bisnis',
            'Tingkatkan engagement dengan pelanggan',
            'Sinkronisasi promosi lintas platform'
        ];

        return $result;
    }

    /**
     * Validate promotional banners access
     */
    private function validatePromotionalBanners(User $user, array $context, array $result): array
    {
        if (!$user->hasActivePremiumBusiness()) {
            $result['reason'] = 'premium_required';
            $result['validation_details']['required_plan'] = 'any_premium';
            $result['upgrade_suggestions'] = [
                'Buat banner promosi menarik untuk bisnis',
                'Tampilkan di halaman utama dengan prioritas tinggi',
                'Desain template profesional tersedia'
            ];
            return $result;
        }

        // Check banner limits and quality
        if (isset($context['banner_data'])) {
            $banner = $context['banner_data'];
            $validationErrors = [];
            
            // Check image dimensions
            if (isset($banner['width']) && isset($banner['height'])) {
                if ($banner['width'] < 800 || $banner['height'] < 400) {
                    $validationErrors[] = 'Ukuran minimum banner: 800x400 pixels';
                }
                
                if ($banner['width'] > 1920 || $banner['height'] > 1080) {
                    $validationErrors[] = 'Ukuran maksimum banner: 1920x1080 pixels';
                }
            }
            
            // Check file size
            if (isset($banner['file_size']) && $banner['file_size'] > 2 * 1024 * 1024) {
                $validationErrors[] = 'Ukuran file maksimum: 2MB';
            }
            
            if (!empty($validationErrors)) {
                $result['allowed'] = false;
                $result['reason'] = 'invalid_banner_specs';
                $result['validation_details']['errors'] = $validationErrors;
                return $result;
            }
        }

        $result['allowed'] = true;
        $result['reason'] = 'premium_access';
        return $result;
    }

    /**
     * Validate customer reviews management access
     */
    private function validateReviewsManagement(User $user, array $context, array $result): array
    {
        if ($user->hasActivePremiumBusiness()) {
            $result['allowed'] = true;
            $result['reason'] = 'premium_access';
            
            // Validate review management action
            if (isset($context['action'])) {
                $allowedActions = ['respond_to_review', 'request_review_removal', 'highlight_review', 'export_reviews'];
                
                if (!in_array($context['action'], $allowedActions)) {
                    $result['allowed'] = false;
                    $result['reason'] = 'invalid_action';
                    $result['validation_details']['allowed_actions'] = $allowedActions;
                }
            }
            
            return $result;
        }

        $result['reason'] = 'premium_required';
        $result['validation_details']['required_plan'] = 'any_premium';
        $result['upgrade_suggestions'] = [
            'Respon langsung ke ulasan pelanggan',
            'Kelola reputasi bisnis dengan lebih baik',
            'Highlight ulasan terbaik di profil'
        ];

        return $result;
    }

    /**
     * Validate bulk operations access
     */
    private function validateBulkOperations(User $user, array $context, array $result): array
    {
        if (!$user->hasActivePremiumBusiness()) {
            $result['reason'] = 'premium_required';
            $result['validation_details']['required_plan'] = 'any_premium';
            $result['upgrade_suggestions'] = [
                'Upload produk dalam jumlah besar sekaligus',
                'Edit multiple items dengan template',
                'Export/import data bisnis'
            ];
            return $result;
        }

        // Validate bulk operation limits
        if (isset($context['operation_size'])) {
            $maxBulkSize = 100; // Premium users can process up to 100 items at once
            
            if ($context['operation_size'] > $maxBulkSize) {
                $result['allowed'] = false;
                $result['reason'] = 'bulk_limit_exceeded';
                $result['validation_details']['max_bulk_size'] = $maxBulkSize;
                $result['validation_details']['requested_size'] = $context['operation_size'];
                return $result;
            }
        }

        $result['allowed'] = true;
        $result['reason'] = 'premium_access';
        return $result;
    }

    /**
     * Batch validate multiple features at once
     */
    public function batchValidateFeatures(User $user, array $features): array
    {
        $results = [];
        
        foreach ($features as $feature => $context) {
            $results[$feature] = $this->validateFeatureAccess($user, $feature, $context ?? []);
        }
        
        // Add summary
        $allowedCount = count(array_filter($results, fn($r) => $r['allowed']));
        $results['_summary'] = [
            'total_features' => count($features),
            'allowed_features' => $allowedCount,
            'denied_features' => count($features) - $allowedCount,
            'user_is_premium' => $user->hasActivePremiumBusiness()
        ];
        
        return $results;
    }

    /**
     * Get comprehensive feature access report for user
     */
    public function getFeatureAccessReport(User $user): array
    {
        $allFeatures = [
            'advanced_analytics' => [],
            'booking_system' => [],
            'social_media_links' => [],
            'promotional_banners' => [],
            'customer_reviews_management' => [],
            'bulk_operations' => []
        ];
        
        $report = $this->batchValidateFeatures($user, $allFeatures);
        
        // Add user context
        $report['user_info'] = [
            'id' => $user->id,
            'name' => $user->name,
            'email' => $user->email,
            'is_premium' => $user->hasActivePremiumBusiness(),
            'premium_expires_at' => $user->premium_expires_at,
            'business_count' => $user->businesses()->count(),
            'role' => $user->role
        ];
        
        return $report;
    }
}