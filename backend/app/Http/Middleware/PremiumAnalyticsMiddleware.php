<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

/**
 * Premium Analytics Middleware
 * Ensures only premium users can access advanced analytics features
 */
class PremiumAnalyticsMiddleware
{
    /**
     * Handle an incoming request.
     *
     * @param  \Closure(\Illuminate\Http\Request): (\Symfony\Component\HttpFoundation\Response)  $next
     */
    public function handle(Request $request, Closure $next): Response
    {
        $user = $request->user();
        
        // Allow admin users full access
        if ($user && $user->role === 'admin') {
            return $next($request);
        }
        
        // Check if user is authenticated
        if (!$user) {
            return response()->json([
                'error' => 'AUTHENTICATION_REQUIRED',
                'message' => 'Login diperlukan untuk mengakses analytics'
            ], 401);
        }
        
        // Check if user has premium access
        if (!$user->hasActivePremiumBusiness()) {
            return response()->json([
                'error' => 'PREMIUM_REQUIRED',
                'message' => 'Advanced Analytics hanya tersedia untuk pengguna Premium',
                'features' => [
                    'Detailed traffic analytics',
                    'Conversion tracking',
                    'Competitive analysis', 
                    'Revenue insights',
                    'Customer behavior analysis',
                    'Performance trends',
                    'Data export capabilities',
                    'Real-time metrics'
                ],
                'upgrade_benefits' => [
                    'Unlimited data history',
                    'Advanced filtering options',
                    'Custom date ranges',
                    'Automated reports',
                    'API access for integrations'
                ],
                'upgrade_url' => '/dashboard?tab=premium',
                'plans' => [
                    'monthly' => ['price' => 150000, 'duration' => '30 days'],
                    'quarterly' => ['price' => 399000, 'duration' => '90 days', 'discount' => '11%'],
                    'yearly' => ['price' => 1500000, 'duration' => '365 days', 'discount' => '17%']
                ]
            ], 403);
        }
        
        return $next($request);
    }
}