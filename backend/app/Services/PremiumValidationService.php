<?php

namespace App\Services;

use App\Models\User;
use App\Models\Business;
use Illuminate\Support\Collection;

/**
 * Dedicated service for premium feature validation
 * Provides comprehensive validation for complex premium feature scenarios
 */
class PremiumValidationService
{
    protected PremiumFeatureService $premiumService;

    public function __construct(PremiumFeatureService $premiumService)
    {
        $this->premiumService = $premiumService;
    }

    /**
     * Validate business profile completeness for premium features
     */
    public function validateBusinessProfileCompleteness(Business $business): array
    {
        $result = [
            'is_complete' => false,
            'completion_percentage' => 0,
            'missing_fields' => [],
            'recommendations' => [],
            'premium_required_fields' => []
        ];

        $requiredFields = [
            'title' => ['weight' => 20, 'premium_only' => false],
            'description' => ['weight' => 15, 'premium_only' => false],
            'address' => ['weight' => 10, 'premium_only' => false],
            'phone' => ['weight' => 10, 'premium_only' => false],
            'operating_hours' => ['weight' => 10, 'premium_only' => true],
            'images' => ['weight' => 15, 'premium_only' => false],
            'video_url' => ['weight' => 10, 'premium_only' => true],
            'website' => ['weight' => 5, 'premium_only' => true],
            'category_id' => ['weight' => 5, 'premium_only' => false]
        ];

        $totalWeight = 0;
        $achievedWeight = 0;
        $isPremium = $business->is_premium_active;

        foreach ($requiredFields as $field => $config) {
            $totalWeight += $config['weight'];
            
            $fieldValue = $business->{$field};
            $isFieldComplete = false;

            switch ($field) {
                case 'images':
                    $isFieldComplete = is_array($fieldValue) && count($fieldValue) > 0;
                    break;
                case 'description':
                    $isFieldComplete = !empty($fieldValue) && strlen($fieldValue) >= 50;
                    break;
                default:
                    $isFieldComplete = !empty($fieldValue);
            }

            if ($isFieldComplete) {
                $achievedWeight += $config['weight'];
            } else {
                if (!$config['premium_only'] || $isPremium) {
                    $result['missing_fields'][] = $field;
                    
                    if ($config['premium_only']) {
                        $result['premium_required_fields'][] = $field;
                    }
                }
            }
        }

        $result['completion_percentage'] = round(($achievedWeight / $totalWeight) * 100, 1);
        $result['is_complete'] = $result['completion_percentage'] >= 80;

        // Generate recommendations
        if (!$result['is_complete']) {
            $result['recommendations'] = $this->generateProfileCompletionRecommendations(
                $result['missing_fields'], 
                $isPremium
            );
        }

        return $result;
    }

    /**
     * Validate premium subscription eligibility
     */
    public function validatePremiumEligibility(User $user): array
    {
        $result = [
            'eligible' => true,
            'reasons' => [],
            'requirements_met' => [],
            'requirements_failed' => [],
            'recommendations' => []
        ];

        // Check if user has at least one business
        $businessCount = $user->businesses()->count();
        if ($businessCount === 0) {
            $result['eligible'] = false;
            $result['requirements_failed'][] = 'no_business';
            $result['reasons'][] = 'Anda perlu memiliki minimal 1 bisnis untuk upgrade Premium';
            $result['recommendations'][] = 'Daftarkan bisnis Anda terlebih dahulu';
        } else {
            $result['requirements_met'][] = 'has_business';
        }

        // Check if user has complete profile
        if (empty($user->name) || empty($user->email)) {
            $result['eligible'] = false;
            $result['requirements_failed'][] = 'incomplete_profile';
            $result['reasons'][] = 'Profil pengguna belum lengkap';
            $result['recommendations'][] = 'Lengkapi nama dan email di profil Anda';
        } else {
            $result['requirements_met'][] = 'complete_profile';
        }

        // Check for existing active premium
        if ($user->hasActivePremiumBusiness()) {
            $result['eligible'] = false;
            $result['requirements_failed'][] = 'already_premium';
            $result['reasons'][] = 'Anda sudah memiliki paket Premium aktif';
            $result['recommendations'][] = 'Kelola subscription Premium di dashboard';
        }

        // Check account age (prevent immediate premium after registration)
        if ($user->created_at->diffInDays(now()) < 1) {
            $result['eligible'] = false;
            $result['requirements_failed'][] = 'account_too_new';
            $result['reasons'][] = 'Akun terlalu baru, tunggu minimal 24 jam setelah registrasi';
            $result['recommendations'][] = 'Lengkapi profil bisnis sambil menunggu';
        } else {
            $result['requirements_met'][] = 'account_age_valid';
        }

        return $result;
    }

    /**
     * Validate feature usage patterns and suggest optimizations
     */
    public function analyzeFeatureUsagePatterns(User $user): array
    {
        $businesses = $user->businesses()->with(['menuItems', 'reviews'])->get();
        
        $analysis = [
            'usage_patterns' => [],
            'optimization_suggestions' => [],
            'premium_value_score' => 0,
            'recommended_features' => []
        ];

        foreach ($businesses as $business) {
            $businessAnalysis = $this->analyzeBusinessUsage($business);
            $analysis['usage_patterns'][$business->id] = $businessAnalysis;
            
            if ($businessAnalysis['premium_potential'] > 70) {
                $analysis['recommended_features'][] = [
                    'business_id' => $business->id,
                    'business_name' => $business->title,
                    'features' => $businessAnalysis['recommended_premium_features']
                ];
            }
        }

        // Calculate overall premium value score
        $totalScore = collect($analysis['usage_patterns'])->avg('premium_potential');
        $analysis['premium_value_score'] = round($totalScore, 1);

        // Generate optimization suggestions
        $analysis['optimization_suggestions'] = $this->generateOptimizationSuggestions(
            $analysis['usage_patterns'], 
            $user->hasActivePremiumBusiness()
        );

        return $analysis;
    }

    /**
     * Batch validate multiple businesses for premium readiness
     */
    public function batchValidateBusinessReadiness(Collection $businesses): array
    {
        $results = [];
        
        foreach ($businesses as $business) {
            $profileValidation = $this->validateBusinessProfileCompleteness($business);
            $usageAnalysis = $this->analyzeBusinessUsage($business);
            
            $results[$business->id] = [
                'business_info' => [
                    'id' => $business->id,
                    'title' => $business->title,
                    'is_premium' => $business->is_premium_active,
                    'created_at' => $business->created_at
                ],
                'profile_completeness' => $profileValidation,
                'usage_analysis' => $usageAnalysis,
                'premium_readiness_score' => $this->calculatePremiumReadinessScore(
                    $profileValidation, 
                    $usageAnalysis
                )
            ];
        }

        // Sort by readiness score
        uasort($results, function($a, $b) {
            return $b['premium_readiness_score'] <=> $a['premium_readiness_score'];
        });

        return [
            'businesses' => $results,
            'summary' => [
                'total_businesses' => count($results),
                'premium_ready' => count(array_filter($results, fn($r) => $r['premium_readiness_score'] >= 70)),
                'needs_improvement' => count(array_filter($results, fn($r) => $r['premium_readiness_score'] < 70)),
                'average_readiness_score' => round(collect($results)->avg('premium_readiness_score'), 1)
            ]
        ];
    }

    /**
     * Private helper methods
     */
    private function generateProfileCompletionRecommendations(array $missingFields, bool $isPremium): array
    {
        $recommendations = [];
        
        $fieldMessages = [
            'title' => 'Tambahkan nama bisnis yang menarik dan mudah diingat',
            'description' => 'Tulis deskripsi bisnis minimal 50 karakter untuk SEO yang lebih baik',
            'address' => 'Lengkapi alamat lengkap untuk memudahkan pelanggan menemukan Anda',
            'phone' => 'Tambahkan nomor telepon untuk kontak langsung',
            'operating_hours' => 'Isi jam operasional agar pelanggan tahu kapan bisnis buka',
            'images' => 'Upload foto produk/layanan untuk menarik lebih banyak pelanggan',
            'video_url' => 'Tambahkan video showcase untuk meningkatkan engagement (Premium)',
            'website' => 'Link website resmi untuk kredibilitas bisnis (Premium)',
        ];

        foreach ($missingFields as $field) {
            if (isset($fieldMessages[$field])) {
                $recommendations[] = $fieldMessages[$field];
            }
        }

        if (!$isPremium && in_array('video_url', $missingFields)) {
            $recommendations[] = 'Upgrade ke Premium untuk fitur video showcase dan website link';
        }

        return $recommendations;
    }

    private function analyzeBusinessUsage(Business $business): array
    {
        $analysis = [
            'photo_usage' => is_array($business->images) ? count($business->images) : 0,
            'menu_items_count' => $business->menuItems()->count(),
            'reviews_count' => $business->reviews()->count(),
            'has_video' => !empty($business->video_url),
            'has_website' => !empty($business->website),
            'premium_potential' => 0,
            'recommended_premium_features' => []
        ];

        // Calculate premium potential score
        $score = 0;
        
        if ($analysis['photo_usage'] >= 3) $score += 20;
        if ($analysis['menu_items_count'] >= 5) $score += 25;
        if ($analysis['reviews_count'] >= 3) $score += 25;
        if (!empty($business->description) && strlen($business->description) > 100) $score += 15;
        if (!empty($business->operating_hours)) $score += 10;
        if (!empty($business->phone)) $score += 5;

        $analysis['premium_potential'] = $score;

        // Recommend premium features based on usage
        if ($analysis['photo_usage'] >= 2 && !$business->is_premium_active) {
            $analysis['recommended_premium_features'][] = 'unlimited_photos';
        }
        
        if ($analysis['menu_items_count'] >= 8) {
            $analysis['recommended_premium_features'][] = 'unlimited_menu_items';
        }
        
        if ($analysis['reviews_count'] >= 2) {
            $analysis['recommended_premium_features'][] = 'reviews_management';
        }

        return $analysis;
    }

    private function calculatePremiumReadinessScore(array $profileValidation, array $usageAnalysis): int
    {
        $profileScore = $profileValidation['completion_percentage'] * 0.6; // 60% weight
        $usageScore = $usageAnalysis['premium_potential'] * 0.4; // 40% weight
        
        return round($profileScore + $usageScore);
    }

    private function generateOptimizationSuggestions(array $usagePatterns, bool $isPremium): array
    {
        $suggestions = [];

        foreach ($usagePatterns as $businessId => $pattern) {
            if ($pattern['photo_usage'] < 3 && !$isPremium) {
                $suggestions[] = [
                    'business_id' => $businessId,
                    'type' => 'photo_optimization',
                    'message' => 'Tambah lebih banyak foto produk untuk menarik pelanggan',
                    'priority' => 'medium'
                ];
            }

            if ($pattern['menu_items_count'] < 5) {
                $suggestions[] = [
                    'business_id' => $businessId,
                    'type' => 'menu_expansion',
                    'message' => 'Perluas menu/layanan untuk memberikan lebih banyak pilihan',
                    'priority' => 'low'
                ];
            }

            if ($pattern['premium_potential'] > 70 && !$isPremium) {
                $suggestions[] = [
                    'business_id' => $businessId,
                    'type' => 'premium_upgrade',
                    'message' => 'Bisnis Anda siap untuk Premium! Tingkatkan visibilitas dengan upgrade',
                    'priority' => 'high'
                ];
            }
        }

        return $suggestions;
    }
}