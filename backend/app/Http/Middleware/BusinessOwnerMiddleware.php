<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;
use App\Models\Business;

class BusinessOwnerMiddleware
{
    /**
     * Ensure the user owns the business they're trying to modify.
     */
    public function handle(Request $request, Closure $next): Response
    {
        $user = $request->user();

        if (!$user) {
            return response()->json([
                'message' => 'Authentication required',
                'error' => 'UNAUTHORIZED'
            ], 401);
        }

        // Skip check for admin users
        if ($user->role === 'admin') {
            return $next($request);
        }

        // Get business ID from route parameter
        $businessId = $request->route('id') ?? $request->route('business');

        if ($businessId) {
            $business = Business::find($businessId);

            if (!$business) {
                return response()->json([
                    'message' => 'Business not found',
                    'error' => 'NOT_FOUND'
                ], 404);
            }

            if ($business->user_id !== $user->id) {
                return response()->json([
                    'message' => 'You can only access your own businesses',
                    'error' => 'FORBIDDEN'
                ], 403);
            }
        }

        return $next($request);
    }
}