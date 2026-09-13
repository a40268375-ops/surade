<?php

namespace App\Services;

use App\Models\User;
use App\Models\Business;
use App\Models\PageView;
use App\Models\Subscription;
use App\Models\BusinessReview;
use App\Models\MenuItem;
use App\Models\Booking;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Collection;

/**
 * Premium Analytics Service
 * Provides advanced analytics and reporting exclusively for premium users
 */
class PremiumAnalyticsService
{
    protected PremiumFeatureService $premiumService;

    public function __construct(PremiumFeatureService $premiumService)
    {
        $this->premiumService = $premiumService;
    }

    /**
     * Get comprehensive business analytics for premium users
     */
    public function getBusinessAnalytics(Business $business, array $options = []): array
    {
        if (!$business->is_premium_active) {
            return $this->getBasicAnalytics($business);
        }

        $dateRange = $this->parseDateRange($options);
        $previousRange = $this->getPreviousPeriodRange($dateRange);

        return [
            'business_info' => [
                'id' => $business->id,
                'title' => $business->title,
                'is_premium' => true,
                'premium_plan' => $business->premium_plan,
                'premium_expires_at' => $business->premium_expires_at
            ],
            'date_range' => $dateRange,
            'overview' => $this->getOverviewMetrics($business, $dateRange, $previousRange),
            'traffic_analytics' => $this->getTrafficAnalytics($business, $dateRange),
            'engagement_metrics' => $this->getEngagementMetrics($business, $dateRange),
            'conversion_analytics' => $this->getConversionAnalytics($business, $dateRange),
            'revenue_insights' => $this->getRevenueInsights($business, $dateRange),
            'customer_insights' => $this->getCustomerInsights($business, $dateRange),
            'performance_trends' => $this->getPerformanceTrends($business, $dateRange),
            'competitive_analysis' => $this->getCompetitiveAnalysis($business, $dateRange),
            'recommendations' => $this->getAnalyticsRecommendations($business, $dateRange)
        ];
    }

    /**
     * Get dashboard analytics for premium user
     */
    public function getDashboardAnalytics(User $user): array
    {
        if (!$user->hasActivePremiumBusiness()) {
            return ['error' => 'Premium subscription required for advanced analytics'];
        }

        $businesses = $user->businesses()->where('is_premium', true)->get();
        $dateRange = ['from' => Carbon::now()->subDays(30), 'to' => Carbon::now()];

        $analytics = [
            'user_info' => [
                'id' => $user->id,
                'name' => $user->name,
                'premium_businesses_count' => $businesses->count()
            ],
            'date_range' => $dateRange,
            'portfolio_overview' => $this->getPortfolioOverview($businesses, $dateRange),
            'top_performing_businesses' => $this->getTopPerformingBusinesses($businesses, $dateRange),
            'revenue_summary' => $this->getRevenueSummary($businesses, $dateRange),
            'traffic_summary' => $this->getTrafficSummary($businesses, $dateRange),
            'growth_trends' => $this->getGrowthTrends($businesses, $dateRange),
            'alerts_and_insights' => $this->getAlertsAndInsights($businesses, $dateRange)
        ];

        return $analytics;
    }

    /**
     * Get admin premium analytics dashboard
     */
    public function getAdminPremiumAnalytics(): array
    {
        $dateRange = ['from' => Carbon::now()->subDays(30), 'to' => Carbon::now()];

        return [
            'premium_overview' => $this->getPremiumOverview($dateRange),
            'subscription_analytics' => $this->getSubscriptionAnalytics($dateRange),
            'revenue_analytics' => $this->getPremiumRevenueAnalytics($dateRange),
            'user_analytics' => $this->getPremiumUserAnalytics($dateRange),
            'business_analytics' => $this->getPremiumBusinessAnalytics($dateRange),
            'conversion_funnel' => $this->getPremiumConversionFunnel($dateRange),
            'churn_analysis' => $this->getChurnAnalysis($dateRange),
            'growth_metrics' => $this->getGrowthMetrics($dateRange)
        ];
    }

    /**
     * Export analytics data for premium users
     */
    public function exportAnalytics(Business $business, string $format = 'json', array $options = []): array
    {
        if (!$business->is_premium_active) {
            return ['error' => 'Premium subscription required for data export'];
        }

        $analytics = $this->getBusinessAnalytics($business, $options);
        
        $exportData = [
            'business' => $analytics['business_info'],
            'date_range' => $analytics['date_range'],
            'summary' => $analytics['overview'],
            'detailed_metrics' => [
                'traffic' => $analytics['traffic_analytics'],
                'engagement' => $analytics['engagement_metrics'],
                'conversions' => $analytics['conversion_analytics'],
                'revenue' => $analytics['revenue_insights']
            ],
            'export_info' => [
                'format' => $format,
                'generated_at' => Carbon::now()->toISOString(),
                'exported_by' => auth()->user()->name ?? 'System'
            ]
        ];

        return $exportData;
    }

    /**
     * Private helper methods for analytics calculations
     */
    private function getBasicAnalytics(Business $business): array
    {
        return [
            'message' => 'Upgrade to Premium for advanced analytics',
            'basic_stats' => [
                'total_views' => PageView::where('business_id', $business->id)->count(),
                'total_reviews' => $business->reviews()->count(),
                'average_rating' => round($business->reviews()->avg('rating') ?? 0, 1)
            ],
            'upgrade_url' => '/dashboard?tab=premium'
        ];
    }

    private function parseDateRange(array $options): array
    {
        $defaultRange = ['from' => Carbon::now()->subDays(30), 'to' => Carbon::now()];
        
        if (isset($options['date_range'])) {
            $range = $options['date_range'];
            return [
                'from' => isset($range['from']) ? Carbon::parse($range['from']) : $defaultRange['from'],
                'to' => isset($range['to']) ? Carbon::parse($range['to']) : $defaultRange['to']
            ];
        }
        
        return $defaultRange;
    }

    private function getPreviousPeriodRange(array $dateRange): array
    {
        $days = $dateRange['from']->diffInDays($dateRange['to']);
        
        return [
            'from' => $dateRange['from']->copy()->subDays($days + 1),
            'to' => $dateRange['from']->copy()->subDay()
        ];
    }

    private function getOverviewMetrics(Business $business, array $dateRange, array $previousRange): array
    {
        $currentViews = PageView::where('business_id', $business->id)
            ->whereBetween('created_at', [$dateRange['from'], $dateRange['to']])
            ->count();
            
        $previousViews = PageView::where('business_id', $business->id)
            ->whereBetween('created_at', [$previousRange['from'], $previousRange['to']])
            ->count();

        $currentReviews = $business->reviews()
            ->whereBetween('created_at', [$dateRange['from'], $dateRange['to']])
            ->count();
            
        $previousReviews = $business->reviews()
            ->whereBetween('created_at', [$previousRange['from'], $previousRange['to']])
            ->count();

        return [
            'total_views' => $currentViews,
            'views_change_percentage' => $this->calculatePercentageChange($currentViews, $previousViews),
            'total_reviews' => $currentReviews,
            'reviews_change_percentage' => $this->calculatePercentageChange($currentReviews, $previousReviews),
            'average_rating' => round($business->reviews()->avg('rating') ?? 0, 1),
            'total_menu_items' => $business->menuItems()->count(),
            'profile_completeness' => $this->calculateProfileCompleteness($business)
        ];
    }

    private function getTrafficAnalytics(Business $business, array $dateRange): array
    {
        $dailyViews = PageView::where('business_id', $business->id)
            ->whereBetween('created_at', [$dateRange['from'], $dateRange['to']])
            ->selectRaw('DATE(created_at) as date, COUNT(*) as views')
            ->groupBy('date')
            ->orderBy('date')
            ->get();

        $hourlyViews = PageView::where('business_id', $business->id)
            ->whereBetween('created_at', [$dateRange['from'], $dateRange['to']])
            ->selectRaw('HOUR(created_at) as hour, COUNT(*) as views')
            ->groupBy('hour')
            ->orderBy('hour')
            ->get();

        return [
            'daily_views' => $dailyViews,
            'hourly_distribution' => $hourlyViews,
            'peak_hours' => $hourlyViews->sortByDesc('views')->take(3),
            'total_unique_days' => $dailyViews->count(),
            'average_daily_views' => round($dailyViews->avg('views'), 1),
            'best_day' => $dailyViews->sortByDesc('views')->first()
        ];
    }

    private function getEngagementMetrics(Business $business, array $dateRange): array
    {
        $reviews = $business->reviews()
            ->whereBetween('created_at', [$dateRange['from'], $dateRange['to']])
            ->get();

        $ratingDistribution = $reviews->groupBy('rating')->map->count();
        
        return [
            'total_reviews' => $reviews->count(),
            'rating_distribution' => $ratingDistribution,
            'average_rating' => round($reviews->avg('rating') ?? 0, 1),
            'review_response_rate' => $this->calculateReviewResponseRate($reviews),
            'customer_satisfaction_score' => $this->calculateSatisfactionScore($reviews),
            'review_sentiment' => $this->analyzeReviewSentiment($reviews)
        ];
    }

    private function getConversionAnalytics(Business $business, array $dateRange): array
    {
        $totalViews = PageView::where('business_id', $business->id)
            ->whereBetween('created_at', [$dateRange['from'], $dateRange['to']])
            ->count();
            
        $totalReviews = $business->reviews()
            ->whereBetween('created_at', [$dateRange['from'], $dateRange['to']])
            ->count();

        $conversionRate = $totalViews > 0 ? round(($totalReviews / $totalViews) * 100, 2) : 0;

        return [
            'view_to_review_rate' => $conversionRate,
            'total_conversions' => $totalReviews,
            'conversion_trend' => $this->getConversionTrend($business, $dateRange),
            'best_converting_days' => $this->getBestConvertingDays($business, $dateRange)
        ];
    }

    private function getRevenueInsights(Business $business, array $dateRange): array
    {
        // This would be enhanced with actual booking/order data when available
        $menuItems = $business->menuItems()->where('is_available', true)->get();
        
        return [
            'total_menu_items' => $menuItems->count(),
            'average_price' => round($menuItems->avg('price') ?? 0, 0),
            'price_range' => [
                'min' => $menuItems->min('price') ?? 0,
                'max' => $menuItems->max('price') ?? 0
            ],
            'premium_subscription_value' => $this->calculatePremiumValue($business),
            'estimated_revenue_impact' => $this->estimateRevenueImpact($business, $dateRange)
        ];
    }

    private function getCustomerInsights(Business $business, array $dateRange): array
    {
        $reviews = $business->reviews()
            ->whereBetween('created_at', [$dateRange['from'], $dateRange['to']])
            ->with('reviewer')
            ->get();

        return [
            'total_customers' => $reviews->count(),
            'repeat_customers' => $this->countRepeatCustomers($reviews),
            'customer_locations' => $this->analyzeCustomerLocations($reviews),
            'most_active_reviewers' => $this->getMostActiveReviewers($reviews),
            'customer_feedback_themes' => $this->analyzeCustomerFeedback($reviews)
        ];
    }

    private function getPerformanceTrends(Business $business, array $dateRange): array
    {
        $weeklyData = [];
        $startDate = $dateRange['from']->copy();
        
        while ($startDate->lte($dateRange['to'])) {
            $weekEnd = $startDate->copy()->addDays(6);
            if ($weekEnd->gt($dateRange['to'])) {
                $weekEnd = $dateRange['to']->copy();
            }
            
            $weekViews = PageView::where('business_id', $business->id)
                ->whereBetween('created_at', [$startDate, $weekEnd])
                ->count();
                
            $weekReviews = $business->reviews()
                ->whereBetween('created_at', [$startDate, $weekEnd])
                ->count();
            
            $weeklyData[] = [
                'week_start' => $startDate->format('Y-m-d'),
                'week_end' => $weekEnd->format('Y-m-d'),
                'views' => $weekViews,
                'reviews' => $weekReviews
            ];
            
            $startDate->addWeek();
        }
        
        return [
            'weekly_trends' => $weeklyData,
            'growth_trajectory' => $this->calculateGrowthTrajectory($weeklyData),
            'performance_score' => $this->calculatePerformanceScore($business, $dateRange)
        ];
    }

    private function getCompetitiveAnalysis(Business $business, array $dateRange): array
    {
        $competitors = Business::where('category_id', $business->category_id)
            ->where('id', '!=', $business->id)
            ->where('status', 'approved')
            ->with(['reviews'])
            ->limit(10)
            ->get();

        $categoryAverage = $competitors->avg(function($competitor) {
            return $competitor->reviews->avg('rating') ?? 0;
        });

        return [
            'category_average_rating' => round($categoryAverage, 1),
            'business_vs_category' => round(($business->rating - $categoryAverage), 1),
            'category_position' => $this->calculateCategoryPosition($business, $competitors),
            'competitive_advantages' => $this->identifyCompetitiveAdvantages($business, $competitors)
        ];
    }

    private function getAnalyticsRecommendations(Business $business, array $dateRange): array
    {
        $recommendations = [];
        
        // Traffic recommendations
        $averageViews = PageView::where('business_id', $business->id)
            ->whereBetween('created_at', [$dateRange['from'], $dateRange['to']])
            ->count() / $dateRange['from']->diffInDays($dateRange['to']);
            
        if ($averageViews < 5) {
            $recommendations[] = [
                'type' => 'traffic',
                'priority' => 'high',
                'title' => 'Tingkatkan Visibilitas Bisnis',
                'description' => 'Traffic harian masih rendah. Pertimbangkan untuk mengoptimalkan profil dan menambah konten menarik.'
            ];
        }
        
        // Review recommendations
        if ($business->reviews->count() < 5) {
            $recommendations[] = [
                'type' => 'reviews',
                'priority' => 'medium',
                'title' => 'Kumpulkan Lebih Banyak Ulasan',
                'description' => 'Minta pelanggan untuk memberikan ulasan. Ulasan positif meningkatkan kredibilitas bisnis.'
            ];
        }
        
        return $recommendations;
    }

    // Additional helper methods for admin analytics
    private function getPremiumOverview(array $dateRange): array
    {
        $totalPremiumUsers = User::whereHas('businesses', function($q) {
            $q->where('is_premium', true);
        })->count();

        $totalRevenue = Subscription::where('status', 'active')
            ->sum('amount');

        return [
            'total_premium_users' => $totalPremiumUsers,
            'total_premium_businesses' => Business::where('is_premium', true)->count(),
            'total_revenue' => $totalRevenue,
            'monthly_recurring_revenue' => $this->calculateMRR(),
            'growth_rate' => $this->calculateGrowthRate($dateRange)
        ];
    }

    private function getSubscriptionAnalytics(array $dateRange): array
    {
        $subscriptions = Subscription::whereBetween('created_at', [$dateRange['from'], $dateRange['to']])
            ->get();

        return [
            'new_subscriptions' => $subscriptions->count(),
            'plan_distribution' => $subscriptions->groupBy('plan')->map->count(),
            'conversion_rate' => $this->calculateSubscriptionConversionRate($dateRange),
            'churn_rate' => $this->calculateChurnRate($dateRange)
        ];
    }

    // Utility methods
    private function calculatePercentageChange(int $current, int $previous): float
    {
        if ($previous === 0) {
            return $current > 0 ? 100 : 0;
        }
        
        return round((($current - $previous) / $previous) * 100, 1);
    }

    private function calculateProfileCompleteness(Business $business): float
    {
        $fields = ['title', 'description', 'address', 'phone', 'operating_hours', 'images'];
        $completed = 0;
        
        foreach ($fields as $field) {
            if ($field === 'images') {
                if (is_array($business->images) && count($business->images) > 0) {
                    $completed++;
                }
            } else {
                if (!empty($business->{$field})) {
                    $completed++;
                }
            }
        }
        
        return round(($completed / count($fields)) * 100, 1);
    }

    private function calculateMRR(): float
    {
        return Subscription::where('status', 'active')
            ->where('plan', 'monthly')
            ->sum('amount');
    }

    private function calculateGrowthRate(array $dateRange): float
    {
        // Implementation for growth rate calculation
        return 15.5; // Placeholder
    }

    private function calculateSubscriptionConversionRate(array $dateRange): float
    {
        // Implementation for conversion rate calculation
        return 8.2; // Placeholder
    }

    private function calculateChurnRate(array $dateRange): float
    {
        // Implementation for churn rate calculation
        return 3.1; // Placeholder
    }

    // Additional placeholder methods that would be fully implemented
    private function calculateReviewResponseRate($reviews): float { return 75.5; }
    private function calculateSatisfactionScore($reviews): float { return 4.3; }
    private function analyzeReviewSentiment($reviews): array { return ['positive' => 80, 'neutral' => 15, 'negative' => 5]; }
    private function getConversionTrend($business, $dateRange): array { return []; }
    private function getBestConvertingDays($business, $dateRange): array { return []; }
    private function calculatePremiumValue($business): float { return 2500000; }
    private function estimateRevenueImpact($business, $dateRange): array { return ['estimated_increase' => 35]; }
    private function countRepeatCustomers($reviews): int { return 5; }
    private function analyzeCustomerLocations($reviews): array { return []; }
    private function getMostActiveReviewers($reviews): array { return []; }
    private function analyzeCustomerFeedback($reviews): array { return []; }
    private function calculateGrowthTrajectory($weeklyData): string { return 'growing'; }
    private function calculatePerformanceScore($business, $dateRange): float { return 85.5; }
    private function calculateCategoryPosition($business, $competitors): int { return 3; }
    private function identifyCompetitiveAdvantages($business, $competitors): array { return []; }
    private function getPortfolioOverview($businesses, $dateRange): array { return []; }
    private function getTopPerformingBusinesses($businesses, $dateRange): array { return []; }
    private function getRevenueSummary($businesses, $dateRange): array { return []; }
    private function getTrafficSummary($businesses, $dateRange): array { return []; }
    private function getGrowthTrends($businesses, $dateRange): array { return []; }
    private function getAlertsAndInsights($businesses, $dateRange): array { return []; }
    private function getPremiumRevenueAnalytics($dateRange): array { return []; }
    private function getPremiumUserAnalytics($dateRange): array { return []; }
    private function getPremiumBusinessAnalytics($dateRange): array { return []; }
    private function getPremiumConversionFunnel($dateRange): array { return []; }
    private function getChurnAnalysis($dateRange): array { return []; }
    private function getGrowthMetrics($dateRange): array { return []; }
}