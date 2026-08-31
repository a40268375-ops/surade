<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class AdminMiddleware
{
    /**
     * Handle an incoming request for admin-only routes.
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

        if ($user->role !== 'admin') {
            return response()->json([
                'message' => 'Admin access required',
                'error' => 'FORBIDDEN'
            ], 403);
        }

        if (!$user->is_active) {
            return response()->json([
                'message' => 'Account is inactive',
                'error' => 'ACCOUNT_INACTIVE'
            ], 403);
        }

        return $next($request);
    }
}