<?php

namespace App\Http\Controllers;

use App\Services\PremiumFeatureService;
use App\Services\PremiumValidationService;
use Illuminate\Http\Request;

class PremiumController extends Controller
{
    protected $premiumService;
    protected $validationService;

    public function __construct(
        PremiumFeatureService $premiumService, 
        PremiumValidationService $validationService
    ) {
        $this->premiumService = $premiumService;
        $this->validationService = $validationService;
    }

    /**
     * Get user's premium status and usage statistics
     */
    public function getStatus(Request $request)
    {
        $user = $request->user();
        
        return response()->json([
            'is_premium' => $user->hasActivePremiumBusiness(),
            'usage_stats' => $this->premiumService->getUserUsageStats($user),
            'suggestions' => $this->premiumService->getPremiumSuggestions($user),
            'premium_businesses' => $user->businesses()
                ->where('is_premium', true)
                ->with(['subscriptions' => function($q) {
                    $q->where('status', 'paid')->latest();
                }])
                ->get()
                ->map(function($business) {
                    return [
                        'id' => $business->id,
                        'title' => $business->title,
                        'is_active' => $business->is_premium_active,
                        'expires_at' => $business->premium_expires_at,
                        'plan' => $business->premium_plan
                    ];
                })
        ]);
    }

    /**
     * Get premium feature comparison and pricing
     */
    public function getPlans(Request $request)
    {
        return response()->json([
            'plans' => PremiumFeatureService::PREMIUM_PLANS,
            'features' => $this->premiumService->getFeatureComparison(),
            'user_stats' => $request->user() ? $this->premiumService->getUserUsageStats($request->user()) : null
        ]);
    }

    /**
     * Check if user can perform a specific action
     */
    public function checkPermission(Request $request)
    {
        $action = $request->input('action');
        $businessId = $request->input('business_id');
        
        if (!$action) {
            return response()->json(['error' => 'Action parameter required'], 422);
        }

        $business = null;
        if ($businessId) {
            $business = \App\Models\Business::find($businessId);
        }

        $permission = $this->premiumService->canPerformAction($request->user(), $action, $business);

        return response()->json($permission);
    }

    /**
     * Get premium feature limits and current usage
     */
    public function getLimits(Request $request)
    {
        $user = $request->user();
        $businessId = $request->input('business_id');

        $limits = [
            'businesses' => [
                'free_limit' => PremiumFeatureService::FREE_LIMITS['businesses'],
                'current' => $user->businesses()->count(),
                'is_premium' => $user->hasActivePremiumBusiness()
            ]
        ];

        if ($businessId) {
            $business = \App\Models\Business::find($businessId);
            if ($business && $business->user_id === $user->id) {
                $limits['business_specific'] = [
                    'photos' => [
                        'free_limit' => PremiumFeatureService::FREE_LIMITS['photos_per_business'],
                        'current' => is_array($business->images) ? count($business->images) : 0,
                        'is_premium' => $business->is_premium_active
                    ],
                    'menu_items' => [
                        'free_limit' => PremiumFeatureService::FREE_LIMITS['menu_items_per_business'],
                        'current' => $business->menuItems()->count(),
                        'is_premium' => $business->is_premium_active
                    ],
                    'videos' => [
                        'free_limit' => PremiumFeatureService::FREE_LIMITS['videos_per_business'],
                        'current' => $business->video_url ? 1 : 0,
                        'is_premium' => $business->is_premium_active
                    ]
                ];
            }
        }

        return response()->json($limits);
    }

    /**
     * Get premium upgrade suggestions based on user's current usage
     */
    public function getSuggestions(Request $request)
    {
        $suggestions = $this->premiumService->getPremiumSuggestions($request->user());
        
        return response()->json([
            'suggestions' => $suggestions,
            'conversion_benefits' => [
                'unlimited_businesses' => 'Buat bisnis sebanyak yang Anda mau',
                'unlimited_photos' => 'Upload foto produk tanpa batas',
                'video_showcase' => 'Tampilkan video menarik bisnis Anda',
                'advertisement_access' => 'Pasang iklan untuk jangkauan lebih luas',
                'advanced_analytics' => 'Lihat statistik kunjungan detail',
                'priority_listing' => 'Bisnis tampil di hasil pencarian teratas',
                'booking_system' => 'Terima reservasi online otomatis'
            ]
        ]);
    }

    /**
     * Validate specific premium feature access
     */
    public function validateFeature(Request $request)
    {
        $request->validate([
            'feature' => 'required|string',
            'context' => 'sometimes|array'
        ]);

        $user = $request->user();
        $feature = $request->input('feature');
        $context = $request->input('context', []);

        $validation = $this->premiumService->validateFeatureAccess($user, $feature, $context);

        return response()->json([
            'success' => true,
            'feature' => $feature,
            'validation_result' => $validation,
            'timestamp' => now()->toISOString()
        ]);
    }

    /**
     * Batch validate multiple features
     */
    public function batchValidateFeatures(Request $request)
    {
        $request->validate([
            'features' => 'required|array',
            'features.*' => 'array'
        ]);

        $user = $request->user();
        $features = $request->input('features');

        $results = $this->premiumService->batchValidateFeatures($user, $features);

        return response()->json([
            'success' => true,
            'validation_results' => $results,
            'timestamp' => now()->toISOString()
        ]);
    }

    /**
     * Get comprehensive feature access report
     */
    public function getFeatureAccessReport(Request $request)
    {
        $user = $request->user();
        $report = $this->premiumService->getFeatureAccessReport($user);

        return response()->json([
            'success' => true,
            'report' => $report,
            'generated_at' => now()->toISOString()
        ]);
    }

    /**
     * Check premium feature requirements
     */
    public function getFeatureRequirements(Request $request)
    {
        $feature = $request->query('feature');
        
        $requirements = [
            'advanced_analytics' => [
                'required_plan' => 'any_premium',
                'description' => 'Analisis mendalam bisnis dengan data pengunjung dan konversi',
                'benefits' => [
                    'Dashboard analytics detail',
                    'Data pengunjung real-time', 
                    'Laporan performa bulanan',
                    'Export data ke Excel/PDF'
                ]
            ],
            'booking_system' => [
                'required_plan' => 'any_premium',
                'description' => 'Sistem reservasi online untuk pelanggan',
                'benefits' => [
                    'Terima booking 24/7',
                    'Manajemen jadwal otomatis',
                    'Konfirmasi via email/SMS',
                    'Kalendar terintegrasi'
                ],
                'supported_categories' => ['restaurant', 'salon', 'clinic', 'hotel', 'spa', 'gym']
            ],
            'social_media_links' => [
                'required_plan' => 'any_premium',
                'description' => 'Integrasi dengan platform media sosial',
                'benefits' => [
                    'Link ke semua platform sosial',
                    'Sinkronisasi promosi',
                    'Peningkatan engagement',
                    'Cross-platform marketing'
                ],
                'supported_platforms' => ['facebook', 'instagram', 'twitter', 'tiktok', 'youtube', 'whatsapp']
            ],
            'promotional_banners' => [
                'required_plan' => 'any_premium',
                'description' => 'Banner promosi untuk meningkatkan visibilitas',
                'benefits' => [
                    'Banner di halaman utama',
                    'Template desain profesional',
                    'Prioritas tampilan tinggi',
                    'Tracking performa banner'
                ],
                'specifications' => [
                    'min_size' => '800x400 pixels',
                    'max_size' => '1920x1080 pixels', 
                    'max_file_size' => '2MB',
                    'formats' => ['JPEG', 'PNG', 'WebP']
                ]
            ],
            'customer_reviews_management' => [
                'required_plan' => 'any_premium',
                'description' => 'Kelola ulasan dan interaksi pelanggan',
                'benefits' => [
                    'Respon langsung ke review',
                    'Highlight review terbaik',
                    'Request removal review tidak pantas',
                    'Export laporan review'
                ],
                'allowed_actions' => ['respond_to_review', 'request_review_removal', 'highlight_review', 'export_reviews']
            ],
            'bulk_operations' => [
                'required_plan' => 'any_premium',
                'description' => 'Operasi massal untuk efisiensi tinggi',
                'benefits' => [
                    'Upload batch produk/menu',
                    'Edit multiple items',
                    'Export/import data Excel',
                    'Template untuk batch operations'
                ],
                'limits' => [
                    'max_batch_size' => 100
                ]
            ]
        ];

        if ($feature && isset($requirements[$feature])) {
            return response()->json([
                'success' => true,
                'feature' => $feature,
                'requirements' => $requirements[$feature]
            ]);
        }

        return response()->json([
            'success' => true,
            'all_features' => $requirements
        ]);
    }

    /**
     * Validate business profile completeness
     */
    public function validateBusinessProfile(Request $request)
    {
        $businessId = $request->input('business_id');
        
        if (!$businessId) {
            return response()->json(['error' => 'business_id required'], 422);
        }

        $business = \App\Models\Business::find($businessId);
        
        if (!$business || $business->user_id !== $request->user()->id) {
            return response()->json(['error' => 'Business not found or unauthorized'], 404);
        }

        $validation = $this->validationService->validateBusinessProfileCompleteness($business);

        return response()->json([
            'success' => true,
            'business' => [
                'id' => $business->id,
                'title' => $business->title,
                'is_premium' => $business->is_premium_active
            ],
            'profile_validation' => $validation
        ]);
    }

    /**
     * Check premium eligibility for user
     */
    public function checkPremiumEligibility(Request $request)
    {
        $user = $request->user();
        $eligibility = $this->validationService->validatePremiumEligibility($user);

        return response()->json([
            'success' => true,
            'eligibility' => $eligibility,
            'user_info' => [
                'id' => $user->id,
                'name' => $user->name,
                'business_count' => $user->businesses()->count(),
                'account_age_days' => $user->created_at->diffInDays(now())
            ]
        ]);
    }

    /**
     * Analyze feature usage patterns
     */
    public function analyzeUsagePatterns(Request $request)
    {
        $user = $request->user();
        $analysis = $this->validationService->analyzeFeatureUsagePatterns($user);

        return response()->json([
            'success' => true,
            'analysis' => $analysis,
            'generated_at' => now()->toISOString()
        ]);
    }

    /**
     * Get business readiness report for premium upgrade
     */
    public function getBusinessReadinessReport(Request $request)
    {
        $user = $request->user();
        $businesses = $user->businesses()->with(['menuItems', 'reviews'])->get();
        
        $report = $this->validationService->batchValidateBusinessReadiness($businesses);

        return response()->json([
            'success' => true,
            'readiness_report' => $report,
            'user_info' => [
                'id' => $user->id,
                'name' => $user->name,
                'is_premium' => $user->hasActivePremiumBusiness()
            ],
            'generated_at' => now()->toISOString()
        ]);
    }
}