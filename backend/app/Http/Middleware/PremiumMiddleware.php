<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use App\Http\Helpers\SecurityHelper;

class PremiumMiddleware
{
    /**
     * Handle an incoming request.
     *
     * This middleware checks if the authenticated user has access to premium features.
     * It can be used with parameters to check specific premium features.
     *
     * Usage examples:
     * - Route::middleware('premium') - Requires any active premium business
     * - Route::middleware('premium:unlimited_photos') - Requires specific feature
     * - Route::middleware('premium:create_advertisement') - Requires ad creation permission
     */
    public function handle(Request $request, Closure $next, string $feature = null): mixed
    {
        $user = $request->user();
        
        if (!$user) {
            return response()->json([
                'message' => 'Authentication required.',
                'error' => 'AUTHENTICATION_REQUIRED'
            ], 401);
        }

        // Admin bypass - admins have access to all features
        if ($user->role === 'admin') {
            return $next($request);
        }

        // If no specific feature is requested, just check for any premium business
        if (!$feature) {
            if (!$user->hasActivePremiumBusiness()) {
                return response()->json([
                    'message' => 'Premium subscription required. Upgrade to access this feature.',
                    'error' => 'PREMIUM_REQUIRED',
                    'upgrade_url' => '/dashboard?tab=premium'
                ], 403);
            }
            return $next($request);
        }

        // Check specific premium feature permissions
        if (!$this->hasFeatureAccess($user, $feature, $request)) {
            return $this->getPremiumRequiredResponse($feature);
        }

        return $next($request);
    }

    /**
     * Check if user has access to a specific premium feature
     */
    private function hasFeatureAccess($user, string $feature, Request $request): bool
    {
        switch ($feature) {
            case 'create_advertisement':
                return $user->hasActivePremiumBusiness() || $user->role === 'reseller';
            
            case 'unlimited_photos':
                return $user->hasActivePremiumBusiness();
            
            case 'video_showcase':
                return $user->hasActivePremiumBusiness();
            
            case 'advanced_analytics':
                return $user->hasActivePremiumBusiness();
            
            case 'booking_system':
                return $user->hasActivePremiumBusiness();
            
            case 'priority_listing':
                return $user->hasActivePremiumBusiness();
            
            case 'social_media_links':
                return $user->hasActivePremiumBusiness();
            
            case 'website_link':
                return $user->hasActivePremiumBusiness();
            
            case 'detailed_description':
                return $user->hasActivePremiumBusiness();
            
            case 'promotional_offers':
                return $user->hasActivePremiumBusiness();
            
            case 'unlimited_menu_items':
                return $user->hasActivePremiumBusiness();
            
            case 'unlimited_announcements':
                return $user->hasActivePremiumBusiness();
            
            case 'create_multiple_businesses':
                // Free users can have 1 business, premium users unlimited
                $businessCount = $user->businesses()->count();
                return $businessCount === 0 || $user->hasActivePremiumBusiness();
            
            case 'manage_business':
                // Check if user owns the specific business (from route parameter)
                $businessId = $request->route('id') ?? $request->route('business');
                if ($businessId) {
                    $business = \App\Models\Business::find($businessId);
                    return $business && $business->user_id === $user->id;
                }
                return false;
            
            default:
                // For unknown features, require premium subscription
                return $user->hasActivePremiumBusiness();
        }
    }

    /**
     * Get appropriate response for premium requirement
     */
    private function getPremiumRequiredResponse(string $feature): \Illuminate\Http\JsonResponse
    {
        $featureMessages = [
            'create_advertisement' => 'Posting iklan hanya tersedia untuk pengguna Premium. Upgrade sekarang untuk mulai beriklan!',
            'unlimited_photos' => 'Unggah foto unlimited hanya untuk pengguna Premium. Upgrade untuk menambah lebih banyak foto!',
            'video_showcase' => 'Video showcase adalah fitur Premium. Upgrade untuk menampilkan video bisnis Anda!',
            'advanced_analytics' => 'Analytics mendalam hanya tersedia untuk pengguna Premium.',
            'booking_system' => 'Sistem booking adalah fitur Premium. Upgrade untuk menerima reservasi online!',
            'social_media_links' => 'Link media sosial adalah fitur Premium. Upgrade untuk menampilkan profil sosial Anda!',
            'website_link' => 'Link website adalah fitur Premium. Upgrade untuk mengarahkan pelanggan ke website Anda!',
            'detailed_description' => 'Deskripsi detail adalah fitur Premium. Upgrade untuk cerita bisnis yang lebih menarik!',
            'promotional_offers' => 'Penawaran promosi adalah fitur Premium. Upgrade untuk menarik lebih banyak pelanggan!',
            'unlimited_menu_items' => 'Menu unlimited adalah fitur Premium. Akun gratis dibatasi 10 item menu.',
            'unlimited_announcements' => 'Pengumuman unlimited adalah fitur Premium. Akun gratis dibatasi 2 pengumuman.',
            'create_multiple_businesses' => 'Multiple bisnis adalah fitur Premium. Akun gratis dibatasi 1 bisnis saja.'
        ];

        $message = $featureMessages[$feature] ?? 'Fitur ini memerlukan subscription Premium.';

        return response()->json([
            'message' => $message,
            'error' => 'PREMIUM_FEATURE_REQUIRED',
            'feature' => $feature,
            'upgrade_url' => '/dashboard?tab=premium',
            'benefits' => $this->getFeatureBenefits($feature)
        ], 403);
    }

    /**
     * Get benefits description for premium features
     */
    private function getFeatureBenefits(string $feature): array
    {
        $benefits = [
            'create_advertisement' => [
                'Jangkauan lebih luas dengan iklan berbayar',
                'Targeting audience yang tepat',
                'Analytics performa iklan',
                'Prioritas tampil di hasil pencarian'
            ],
            'unlimited_photos' => [
                'Upload foto tanpa batas',
                'Gallery foto yang menarik',
                'Showcase produk/layanan lengkap',
                'Tingkatkan engagement pelanggan'
            ],
            'video_showcase' => [
                'Video profil bisnis yang menarik',
                'Demonstrasi produk/layanan',
                'Storytelling yang powerful',
                'Tingkatkan konversi pelanggan'
            ],
            'advanced_analytics' => [
                'Laporan kunjungan detail',
                'Analisis performa bisnis',
                'Insight perilaku pelanggan',
                'Data untuk optimasi strategi'
            ],
            'booking_system' => [
                'Terima reservasi 24/7',
                'Kelola jadwal otomatis',
                'Notifikasi booking realtime',
                'Tingkatkan efisiensi operasional'
            ]
        ];

        return $benefits[$feature] ?? [
            'Akses fitur premium lengkap',
            'Maksimalkan potensi bisnis',
            'Jangkauan pelanggan lebih luas',
            'Tools marketing yang powerful'
        ];
    }
}