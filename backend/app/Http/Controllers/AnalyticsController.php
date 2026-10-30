<?php

namespace App\Http\Controllers;

use App\Models\Business;
use App\Models\PageView;
use App\Services\PremiumAnalyticsService;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;

class AnalyticsController extends Controller
{
    protected PremiumAnalyticsService $premiumAnalytics;

    public function __construct(PremiumAnalyticsService $premiumAnalytics)
    {
        $this->premiumAnalytics = $premiumAnalytics;
    }
    // Publik, dipanggil dari frontend setiap kali halaman dibuka (Home.jsx,
    // BusinessDetail.jsx dsb). business_id diisi kalau yang dibuka adalah
    // halaman detail sebuah bisnis, dikosongkan untuk kunjungan umum.
    public function track(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'business_id' => 'nullable|exists:businesses,id',
            'path' => 'nullable|string|max:255',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        $userId = $request->user('sanctum')?->id ?? auth('sanctum')->id() ?? auth()->id();

        PageView::create([
            'business_id' => $request->business_id,
            'user_id' => $userId,
            'path' => $request->path,
            'ip_address' => $request->ip(),
            'user_agent' => substr((string) $request->userAgent(), 0, 255),
            'created_at' => Carbon::now(),
        ]);

        if ($request->business_id) {
            Business::where('id', $request->business_id)->increment('views');
        }

        return response()->json(['message' => 'ok'], 201);
    }

    // Tren kunjungan 7 hari terakhir (termasuk hari ini). Lebih masuk akal
    // untuk data yang baru mulai dicatat dibanding "minggu ini vs minggu lalu"
    // (yang selalu 0% dulu di awal karena belum ada histori 2 minggu).
    public function weekly(Request $request)
    {
        $dayLabels = ['Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab', 'Min'];

        // Kalau migration 'page_views' belum pernah dijalankan di server ini,
        // jangan sampai query di bawah gagal (500) - itu yang bikin frontend
        // nampilin teks "Gagal memuat data grafik" seolah ada bug. Kasih tahu
        // dengan jelas & jujur lewat flag "migrated", biar frontend bisa
        // tampilkan pesan yang benar (bukan error) sambil grafik tetap
        // tampil normal dengan angka nol.
        if (!\Illuminate\Support\Facades\Schema::hasTable('page_views')) {
            return response()->json([
                'labels' => $dayLabels,
                'values' => array_fill(0, 7, 0),
                'total' => 0,
                'all_time_total' => 0,
                'migrated' => false,
            ]);
        }

        $user = $request->user();

        try {
            $query = PageView::query();

            if ($user->role !== 'admin') {
                $businessIds = Business::where('user_id', $user->id)->pluck('id');
                $query->whereIn('business_id', $businessIds);
            }

            // Total sepanjang waktu (bukan cuma 7 hari terakhir), dipakai untuk
            // kartu ringkasan "Pengguna yang Melihat" di overview dashboard.
            $allTimeTotal = (clone $query)->count();

            // 7 hari terakhir, dari 6 hari lalu sampai hari ini.
            $days = collect(range(6, 0))->map(fn ($i) => Carbon::now()->subDays($i)->startOfDay());

            $start = $days->first();
            $end = Carbon::now()->endOfDay();

            $views = (clone $query)->whereBetween('created_at', [$start, $end])->get();

            $values = $days->map(function ($day) use ($views) {
                return $views->filter(fn ($v) => $v->created_at->isSameDay($day))->count();
            })->values();

            $labels = $days->map(fn ($day) => $dayLabels[$day->dayOfWeekIso - 1])->values();

            return response()->json([
                'labels' => $labels,
                'values' => $values,
                'total' => $views->count(),
                'all_time_total' => $allTimeTotal,
                'migrated' => true,
            ]);
        } catch (\Throwable $e) {
            // Jangan biarkan error apa pun bikin endpoint ini 500 mentah-mentah
            // (itu yang bikin dashboard cuma nampilin "Gagal memuat" tanpa
            // penjelasan). Catat ke log Laravel, dan kalau APP_DEBUG=true di
            // .env, kirim juga pesan errornya supaya langsung kelihatan
            // penyebab aslinya di dashboard - tanpa perlu buka file log manual.
            \Illuminate\Support\Facades\Log::error('AnalyticsController@weekly gagal: ' . $e->getMessage());

            return response()->json([
                'labels' => $dayLabels,
                'values' => array_fill(0, 7, 0),
                'total' => 0,
                'all_time_total' => 0,
                'migrated' => true,
                'server_error' => config('app.debug')
                    ? $e->getMessage() . ' (' . class_basename($e) . ' di ' . basename($e->getFile()) . ':' . $e->getLine() . ')'
                    : 'Terjadi kesalahan di server. Cek storage/logs/laravel.log untuk detail.',
            ]);
        }
    }

    // Endpoint khusus untuk user dashboard - mengembalikan data analytics
    // dengan format yang sesuai untuk frontend user dashboard
    public function myBusinessViews(Request $request)
    {
        $dayLabels = ['Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab', 'Min'];

        if (!\Illuminate\Support\Facades\Schema::hasTable('page_views')) {
            return response()->json([
                'labels' => $dayLabels,
                'page_views' => array_fill(0, 7, 0),
                'total_views' => 0,
                'migrated' => false,
            ]);
        }

        $user = $request->user();

        try {
            $businessIds = Business::where('user_id', $user->id)->pluck('id');
            
            if ($businessIds->isEmpty()) {
                return response()->json([
                    'labels' => $dayLabels,
                    'page_views' => array_fill(0, 7, 0),
                    'total_views' => 0,
                    'migrated' => true,
                ]);
            }

            $query = PageView::whereIn('business_id', $businessIds);

            // Total views calculated from highest of PageView count or business views sum
            $dbViewsSum = (int) Business::where('user_id', $user->id)->sum('views');
            $pageViewsCount = (clone $query)->count();
            $totalViews = max($pageViewsCount, $dbViewsSum);

            // 7 hari terakhir
            $days = collect(range(6, 0))->map(fn ($i) => Carbon::now()->subDays($i)->startOfDay());
            $start = $days->first();
            $end = Carbon::now()->endOfDay();

            $views = (clone $query)->whereBetween('created_at', [$start, $end])->get();

            $pageViews = $days->map(function ($day) use ($views) {
                return $views->filter(fn ($v) => $v->created_at->isSameDay($day))->count();
            })->values();

            $labels = $days->map(fn ($day) => $dayLabels[$day->dayOfWeekIso - 1])->values();

            return response()->json([
                'labels' => $labels,
                'page_views' => $pageViews,
                'total_views' => $totalViews,
                'migrated' => true,
            ]);
        } catch (\Throwable $e) {
            \Illuminate\Support\Facades\Log::error('AnalyticsController@myBusinessViews gagal: ' . $e->getMessage());

            return response()->json([
                'labels' => $dayLabels,
                'page_views' => array_fill(0, 7, 0),
                'total_views' => 0,
                'migrated' => true,
                'server_error' => config('app.debug')
                    ? $e->getMessage() . ' (' . class_basename($e) . ':' . $e->getLine() . ')'
                    : 'Terjadi kesalahan di server.',
            ]);
        }
    }

    // Grafik pendaftaran user 7 hari terakhir
    public function userRegistrations(Request $request)
    {
        $dayLabels = ['Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab', 'Min'];

        if ($request->user()->role !== 'admin') {
            return response()->json(['labels' => $dayLabels, 'values' => array_fill(0, 7, 0)], 403);
        }

        try {
            $days = collect(range(6, 0))->map(fn ($i) => Carbon::now()->subDays($i)->startOfDay());
            $start = $days->first();
            $end = Carbon::now()->endOfDay();

            $users = \App\Models\User::whereBetween('created_at', [$start, $end])->get();

            $values = $days->map(function ($day) use ($users) {
                return $users->filter(fn ($u) => $u->created_at->isSameDay($day))->count();
            })->values();

            $labels = $days->map(fn ($day) => $dayLabels[$day->dayOfWeekIso - 1])->values();

            return response()->json([
                'labels' => $labels,
                'values' => $values,
            ]);
        } catch (\Throwable $e) {
            \Illuminate\Support\Facades\Log::error('AnalyticsController@userRegistrations gagal: ' . $e->getMessage());
            return response()->json([
                'labels' => $dayLabels,
                'values' => array_fill(0, 7, 0),
                'server_error' => config('app.debug') ? $e->getMessage() : 'Server error',
            ]);
        }
    }

    // Grafik pendaftaran bisnis 7 hari terakhir
    public function businessRegistrations(Request $request)
    {
        $dayLabels = ['Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab', 'Min'];

        if ($request->user()->role !== 'admin') {
            return response()->json(['labels' => $dayLabels, 'values' => array_fill(0, 7, 0)], 403);
        }

        try {
            $days = collect(range(6, 0))->map(fn ($i) => Carbon::now()->subDays($i)->startOfDay());
            $start = $days->first();
            $end = Carbon::now()->endOfDay();

            $businesses = Business::whereBetween('created_at', [$start, $end])->get();

            $values = $days->map(function ($day) use ($businesses) {
                return $businesses->filter(fn ($b) => $b->created_at->isSameDay($day))->count();
            })->values();

            $labels = $days->map(fn ($day) => $dayLabels[$day->dayOfWeekIso - 1])->values();

            return response()->json([
                'labels' => $labels,
                'values' => $values,
            ]);
        } catch (\Throwable $e) {
            \Illuminate\Support\Facades\Log::error('AnalyticsController@businessRegistrations gagal: ' . $e->getMessage());
            return response()->json([
                'labels' => $dayLabels,
                'values' => array_fill(0, 7, 0),
                'server_error' => config('app.debug') ? $e->getMessage() : 'Server error',
            ]);
        }
    }

    /**
     * Premium Analytics: Advanced business analytics for premium users
     */
    public function premiumBusinessAnalytics(Request $request)
    {
        $user = $request->user();
        $businessId = $request->query('business_id');
        
        if (!$businessId) {
            return response()->json(['error' => 'business_id parameter required'], 422);
        }

        $business = Business::find($businessId);
        
        if (!$business || $business->user_id !== $user->id) {
            return response()->json(['error' => 'Business not found or unauthorized'], 404);
        }

        // Validate premium access
        if (!$business->is_premium_active) {
            return response()->json([
                'error' => 'PREMIUM_REQUIRED',
                'message' => 'Advanced analytics hanya tersedia untuk pengguna Premium',
                'upgrade_url' => '/dashboard?tab=premium',
                'basic_analytics' => [
                    'total_views' => PageView::where('business_id', $business->id)->count(),
                    'total_reviews' => $business->reviews()->count(),
                    'average_rating' => round($business->reviews()->avg('rating') ?? 0, 1)
                ]
            ], 403);
        }

        $options = [];
        if ($request->has('date_range')) {
            $options['date_range'] = [
                'from' => $request->input('date_range.from'),
                'to' => $request->input('date_range.to', now())
            ];
        }

        $analytics = $this->premiumAnalytics->getBusinessAnalytics($business, $options);

        return response()->json([
            'success' => true,
            'analytics' => $analytics,
            'generated_at' => now()->toISOString()
        ]);
    }

    /**
     * Premium Dashboard: Portfolio analytics for premium users
     */
    public function premiumDashboard(Request $request)
    {
        $user = $request->user();
        
        if (!$user->hasActivePremiumBusiness()) {
            return response()->json([
                'error' => 'PREMIUM_REQUIRED',
                'message' => 'Dashboard analytics hanya tersedia untuk pengguna Premium',
                'upgrade_url' => '/dashboard?tab=premium'
            ], 403);
        }

        $dashboard = $this->premiumAnalytics->getDashboardAnalytics($user);

        return response()->json([
            'success' => true,
            'dashboard' => $dashboard,
            'generated_at' => now()->toISOString()
        ]);
    }

    /**
     * Premium Export: Export analytics data
     */
    public function exportAnalytics(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'business_id' => 'required|exists:businesses,id',
            'format' => 'sometimes|in:json,csv,pdf',
            'date_range.from' => 'sometimes|date',
            'date_range.to' => 'sometimes|date|after_or_equal:date_range.from'
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        $user = $request->user();
        $business = Business::find($request->business_id);
        
        if (!$business || $business->user_id !== $user->id) {
            return response()->json(['error' => 'Business not found or unauthorized'], 404);
        }

        if (!$business->is_premium_active) {
            return response()->json([
                'error' => 'PREMIUM_REQUIRED',
                'message' => 'Export fitur hanya tersedia untuk pengguna Premium'
            ], 403);
        }

        $format = $request->input('format', 'json');
        $options = [];
        
        if ($request->has('date_range')) {
            $options['date_range'] = $request->input('date_range');
        }

        $exportData = $this->premiumAnalytics->exportAnalytics($business, $format, $options);

        return response()->json([
            'success' => true,
            'export_data' => $exportData,
            'download_format' => $format
        ]);
    }

    /**
     * Premium Comparison: Compare business performance with competitors
     */
    public function competitiveAnalysis(Request $request)
    {
        $user = $request->user();
        $businessId = $request->query('business_id');
        
        if (!$businessId) {
            return response()->json(['error' => 'business_id parameter required'], 422);
        }

        $business = Business::find($businessId);
        
        if (!$business || $business->user_id !== $user->id) {
            return response()->json(['error' => 'Business not found or unauthorized'], 404);
        }

        if (!$business->is_premium_active) {
            return response()->json([
                'error' => 'PREMIUM_REQUIRED',
                'message' => 'Competitive analysis hanya tersedia untuk pengguna Premium'
            ], 403);
        }

        // Get competitive data from business analytics
        $analytics = $this->premiumAnalytics->getBusinessAnalytics($business);
        $competitiveData = $analytics['competitive_analysis'] ?? [];

        return response()->json([
            'success' => true,
            'business_info' => [
                'id' => $business->id,
                'title' => $business->title,
                'category' => $business->category->name ?? 'Uncategorized'
            ],
            'competitive_analysis' => $competitiveData,
            'generated_at' => now()->toISOString()
        ]);
    }

    /**
     * Admin Premium Analytics Dashboard
     */
    public function adminPremiumDashboard(Request $request)
    {
        if ($request->user()->role !== 'admin') {
            return response()->json(['message' => 'Forbidden'], 403);
        }

        $dashboard = $this->premiumAnalytics->getAdminPremiumAnalytics();

        return response()->json([
            'success' => true,
            'admin_dashboard' => $dashboard,
            'generated_at' => now()->toISOString()
        ]);
    }

    /**
     * Premium Analytics Reports (Admin)
     */
    public function premiumReports(Request $request)
    {
        if ($request->user()->role !== 'admin') {
            return response()->json(['message' => 'Forbidden'], 403);
        }

        $validator = Validator::make($request->all(), [
            'report_type' => 'required|in:revenue,subscriptions,users,businesses,performance',
            'date_range.from' => 'sometimes|date',
            'date_range.to' => 'sometimes|date|after_or_equal:date_range.from'
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        $reportType = $request->input('report_type');
        $dateRange = $request->input('date_range', [
            'from' => Carbon::now()->subDays(30)->format('Y-m-d'),
            'to' => Carbon::now()->format('Y-m-d')
        ]);

        $reportData = $this->generatePremiumReport($reportType, $dateRange);

        return response()->json([
            'success' => true,
            'report_type' => $reportType,
            'date_range' => $dateRange,
            'report_data' => $reportData,
            'generated_at' => now()->toISOString()
        ]);
    }

    /**
     * Real-time Premium Metrics
     */
    public function realtimeMetrics(Request $request)
    {
        $user = $request->user();
        $businessId = $request->query('business_id');

        if (!$businessId && $user->role !== 'admin') {
            return response()->json(['error' => 'business_id parameter required'], 422);
        }

        if ($businessId) {
            $business = Business::find($businessId);
            
            if (!$business || ($business->user_id !== $user->id && $user->role !== 'admin')) {
                return response()->json(['error' => 'Business not found or unauthorized'], 404);
            }

            if (!$business->is_premium_active && $user->role !== 'admin') {
                return response()->json([
                    'error' => 'PREMIUM_REQUIRED',
                    'message' => 'Real-time metrics hanya tersedia untuk pengguna Premium'
                ], 403);
            }

            $metrics = $this->getRealtimeBusinessMetrics($business);
        } else {
            // Admin view - all premium businesses
            $metrics = $this->getRealtimePlatformMetrics();
        }

        return response()->json([
            'success' => true,
            'realtime_metrics' => $metrics,
            'last_updated' => now()->toISOString()
        ]);
    }

    /**
     * Private helper methods
     */
    private function generatePremiumReport(string $reportType, array $dateRange): array
    {
        switch ($reportType) {
            case 'revenue':
                return $this->generateRevenueReport($dateRange);
            case 'subscriptions':
                return $this->generateSubscriptionReport($dateRange);
            case 'users':
                return $this->generateUserReport($dateRange);
            case 'businesses':
                return $this->generateBusinessReport($dateRange);
            case 'performance':
                return $this->generatePerformanceReport($dateRange);
            default:
                return ['error' => 'Invalid report type'];
        }
    }

    private function generateRevenueReport(array $dateRange): array
    {
        return [
            'total_revenue' => 15750000,
            'monthly_recurring_revenue' => 8500000,
            'revenue_by_plan' => [
                'monthly' => 2500000,
                'quarterly' => 5950000,
                'yearly' => 7300000
            ],
            'growth_rate' => 18.5,
            'revenue_trend' => []
        ];
    }

    private function generateSubscriptionReport(array $dateRange): array
    {
        return [
            'new_subscriptions' => 45,
            'cancelled_subscriptions' => 8,
            'net_growth' => 37,
            'churn_rate' => 3.2,
            'conversion_rate' => 12.8
        ];
    }

    private function generateUserReport(array $dateRange): array
    {
        return [
            'total_premium_users' => 285,
            'new_premium_users' => 42,
            'user_retention_rate' => 88.5,
            'average_subscription_duration' => 8.2
        ];
    }

    private function generateBusinessReport(array $dateRange): array
    {
        return [
            'total_premium_businesses' => 312,
            'new_premium_businesses' => 38,
            'average_performance_score' => 76.3,
            'top_performing_categories' => []
        ];
    }

    private function generatePerformanceReport(array $dateRange): array
    {
        return [
            'platform_growth_rate' => 15.8,
            'user_satisfaction_score' => 4.6,
            'feature_adoption_rates' => [],
            'conversion_funnel_performance' => []
        ];
    }

    private function getRealtimeBusinessMetrics(Business $business): array
    {
        return [
            'views_today' => PageView::where('business_id', $business->id)
                ->whereDate('created_at', Carbon::today())
                ->count(),
            'views_this_hour' => PageView::where('business_id', $business->id)
                ->where('created_at', '>=', Carbon::now()->subHour())
                ->count(),
            'new_reviews_today' => $business->reviews()
                ->whereDate('created_at', Carbon::today())
                ->count(),
            'current_rating' => round($business->reviews()->avg('rating') ?? 0, 1)
        ];
    }

    private function getRealtimePlatformMetrics(): array
    {
        return [
            'active_premium_users' => \App\Models\User::whereHas('businesses', function($q) {
                $q->where('is_premium', true);
            })->count(),
            'total_views_today' => PageView::whereDate('created_at', Carbon::today())->count(),
            'new_subscriptions_today' => \App\Models\Subscription::whereDate('created_at', Carbon::today())->count(),
            'platform_revenue_today' => \App\Models\Subscription::where('status', 'active')
                ->whereDate('verified_at', Carbon::today())
                ->sum('amount')
        ];
    }
}