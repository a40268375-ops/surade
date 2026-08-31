<?php

namespace App\Http\Controllers;

use App\Models\Business;
use App\Models\Category;
use App\Models\Advertisement;
use App\Models\Event;
use App\Models\Blog;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cache;

class HomeController extends Controller
{
    /**
     * Unified home feed endpoint to deliver all public data needed by the home page in a single request.
     * Dramatically reduces roundtrips and server serialization overhead.
     */
    public function feed(Request $request)
    {
        $feed = Cache::remember('home_feed_public', 300, function () {
            // 1. Categories
            $categories = Category::withCount('businesses')->orderBy('name')->get();

            // 2. Advertisements (approved and active)
            $advertisements = Advertisement::with([
                'category:id,name,slug,icon,color',
                'user:id,name,avatar'
            ])
            ->where('status', 'approved')
            ->where(function ($q) {
                $q->whereNull('expires_at')->orWhere('expires_at', '>', now());
            })
            ->whereHas('user.businesses', function ($q) {
                $q->where('is_premium', true)
                  ->where(function ($sq) {
                      $sq->whereNull('premium_expires_at')
                         ->orWhere('premium_expires_at', '>', now());
                  });
            })
            ->latest()
            ->get();

            // 3. Events (published)
            $events = Event::where('status', 'published')
                ->orderBy('event_date', 'desc')
                ->take(10)
                ->get();

            // 4. Blogs (published)
            $blogs = Blog::with('author:id,name,avatar')
                ->where('status', 'published')
                ->latest()
                ->take(10)
                ->get();

            // 5. Businesses (approved, prioritized)
            $businessesQuery = Business::with([
                'category:id,name,slug,icon,color',
                'user:id,name,avatar'
            ])
            ->withCount('reviews')
            ->withAvg('reviews', 'rating')
            ->where('status', 'approved')
            ->orderBy('is_premium', 'desc')
            ->orderBy('created_at', 'desc');

            $businesses = $businessesQuery->paginate(24);

            return [
                'categories' => $categories,
                'advertisements' => $advertisements,
                'events' => $events,
                'blogs' => $blogs,
                'businesses' => $businesses,
            ];
        });

        return response()->json($feed);
    }
}
