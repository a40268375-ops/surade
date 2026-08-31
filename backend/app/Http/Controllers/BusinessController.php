<?php

namespace App\Http\Controllers;

use App\Models\Business;
use App\Http\Requests\BusinessStoreRequest;
use App\Http\Requests\BusinessUpdateRequest;
use App\Http\Requests\ReviewStoreRequest;
use App\Http\Helpers\SecurityHelper;
use App\Services\PremiumFeatureService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Validator;

class BusinessController extends Controller
{
    // Jumlah maksimal bisnis yang boleh dimiliki akun non-premium (gratis).
    // Lihat pemakaiannya di store().
    const FREE_BUSINESS_LIMIT = 1;

    protected $premiumService;

    public function __construct(PremiumFeatureService $premiumService)
    {
        $this->premiumService = $premiumService;
    }

    /**
     * Ulasan bisnis terbaru buat widget "Ulasan Terbaru" di halaman Dasbor.
     * Admin: ulasan terbaru dari SELURUH bisnis di platform.
     * User biasa: cuma ulasan buat bisnis milik dia sendiri.
     */
    public function recentReviews(Request $request)
    {
        $user = $request->user();

        $query = \App\Models\BusinessReview::with(['business:id,title,user_id', 'reviewer:id,name,avatar'])
            ->latest();

        if ($user->role !== 'admin') {
            $businessIds = $user->businesses()->pluck('id');
            $query->whereIn('business_id', $businessIds);
        }

        $reviews = $query->take(5)->get()->map(function ($r) {
            return [
                'id' => $r->id,
                'business_name' => $r->business->title ?? '-',
                'reviewer_name' => $r->reviewer->name ?? 'Pengguna',
                'reviewer_avatar' => $r->reviewer->avatar ?? null,
                'rating' => $r->rating,
                'comment' => $r->comment,
                'created_at' => $r->created_at,
            ];
        });

        return response()->json($reviews);
    }

    public function index(Request $request)
    {
        $query = Business::with('category', 'user', 'menuItems', 'reviews');

        if ($request->has('category_id') && $request->category_id != 'all' && $request->category_id != '') {
            // Find by category slug or id
            $query->whereHas('category', function($q) use ($request) {
                if (is_numeric($request->category_id)) {
                    $q->where('id', $request->category_id);
                } else {
                    $q->where('slug', $request->category_id);
                }
            });
        }

        if ($request->has('q') && $request->q != '') {
            $search = $request->q;
            $query->where(function($q) use ($search) {
                $q->where('title', 'like', "%{$search}%")
                  ->orWhere('description', 'like', "%{$search}%")
                  ->orWhere('address', 'like', "%{$search}%");
            });
        }

        if ($request->has('location') && $request->location != '') {
            $location = $request->location;
            $query->where(function ($q) use ($location) {
                $q->where('village', $location)
                  ->orWhere('address', 'like', "%{$location}%");
            });
        }

       // PERBAIKAN: route GET /businesses ternyata terdaftar 2x di
       // routes/api.php - sekali di luar (publik, tanpa middleware login)
       // dan sekali lagi di dalam grup auth:sanctum. Laravel selalu pakai
       // route yang PERTAMA cocok, yaitu yang publik - jadi $request->user()
       // selalu null di sini (tidak lewat middleware yang membaca token
       // login), BAHKAN KETIKA ADMIN YANG SEDANG LOGIN yang mengakses.
       // Akibatnya Admin tidak pernah dianggap Admin di endpoint ini, dan
       // bisnis berstatus "Pending" ikut disembunyikan bahkan dari Admin.
       // Diperbaiki dengan membaca guard sanctum langsung (tidak bergantung
       // pada middleware route mana yang kebetulan cocok duluan).
       $authUser = $request->user() ?: \Illuminate\Support\Facades\Auth::guard('sanctum')->user();
       $isAdminRequest = $authUser && $authUser->role === 'admin';

        if ($request->has('status') && $request->status === 'all') {
            if (!$isAdminRequest) {
                // Only admins may see every status; everyone else still only sees approved.
                $query->where('status', 'approved');
            }
            // else: admin + status=all -> intentionally no filter, returns every status
        } elseif ($request->has('status') && $request->status != '') {
            $query->where('status', $request->status);
        } else {
            // No status param at all -> public default (approved only)
            if (!$isAdminRequest) {
                $query->where('status', 'approved');
            }
        }

        // Enhanced priority listing for premium businesses
        $query = $this->applyPriorityListingSort($query, $request);
        
        // Add pagination support
        $perPage = $request->get('per_page', 15); // Default 15 items per page
        $perPage = min($perPage, 50); // Maximum 50 items per page
        
        $businesses = $query->paginate($perPage);

        // Add priority indicators to response for frontend
        $businesses->getCollection()->transform(function ($business) {
            $business->priority_score = $this->calculatePriorityScore($business);
            $business->is_boosted = $business->is_premium_active;
            return $business;
        });

        return response()->json($businesses);
    }

    public function myBusinesses(Request $request)
    {
        $user = $request->user();
        $perPage = $request->get('per_page', 15); // Default 15 items per page
        $perPage = min($perPage, 50); // Maximum 50 items per page
        
        $businesses = Business::with('category')->where('user_id', $user->id)->paginate($perPage);
        return response()->json($businesses);
    }

    /**
     * Apply sophisticated priority listing for premium businesses
     */
    private function applyPriorityListingSort($query, Request $request)
    {
        // For search queries, use relevance-based priority scoring
        if ($request->has('q') && !empty($request->q)) {
            return $this->applySortByRelevanceAndPriority($query, $request->q);
        }
        
        // For category/location browsing, use engagement-based priority
        return $this->applySortByEngagementAndPriority($query);
    }

    /**
     * Sort by search relevance with premium boost
     */
    private function applySortByRelevanceAndPriority($query, string $searchTerm)
    {
        return $query->orderByRaw("
            CASE 
                WHEN is_premium = 1 AND premium_expires_at > NOW() THEN
                    CASE
                        WHEN title LIKE ? THEN 1000
                        WHEN description LIKE ? THEN 800
                        WHEN address LIKE ? THEN 600
                        ELSE 500
                    END
                WHEN title LIKE ? THEN 400
                WHEN description LIKE ? THEN 200
                WHEN address LIKE ? THEN 100
                ELSE 0
            END DESC,
            is_premium DESC,
            rating DESC,
            created_at DESC
        ", [
            "%{$searchTerm}%", "%{$searchTerm}%", "%{$searchTerm}%", // Premium matches
            "%{$searchTerm}%", "%{$searchTerm}%", "%{$searchTerm}%"  // Regular matches
        ]);
    }

    /**
     * Sort by engagement metrics with premium boost
     */
    private function applySortByEngagementAndPriority($query)
    {
        return $query
            ->leftJoin('business_reviews', 'businesses.id', '=', 'business_reviews.business_id')
            ->selectRaw('businesses.*, 
                COALESCE(AVG(business_reviews.rating), 0) as avg_rating,
                COUNT(business_reviews.id) as review_count,
                CASE 
                    WHEN businesses.is_premium = 1 AND businesses.premium_expires_at > NOW() THEN
                        (COALESCE(AVG(business_reviews.rating), 3) * 20) + 
                        (COUNT(business_reviews.id) * 5) + 
                        (DATEDIFF(NOW(), businesses.created_at) * -0.1) + 1000
                    ELSE
                        (COALESCE(AVG(business_reviews.rating), 3) * 10) + 
                        (COUNT(business_reviews.id) * 2) + 
                        (DATEDIFF(NOW(), businesses.created_at) * -0.05)
                END as priority_score')
            ->groupBy('businesses.id')
            ->orderBy('priority_score', 'desc')
            ->orderBy('businesses.created_at', 'desc');
    }

    /**
     * Calculate priority score for a business (for frontend display)
     */
    private function calculatePriorityScore($business): array
    {
        $score = 0;
        $factors = [];

        // Premium boost
        if ($business->is_premium_active) {
            $score += 1000;
            $factors[] = 'Premium listing boost (+1000)';
        }

        // Rating boost
        if ($business->rating > 0) {
            $ratingBoost = $business->rating * ($business->is_premium_active ? 20 : 10);
            $score += $ratingBoost;
            $factors[] = "Rating boost ({$business->rating}★ = +{$ratingBoost})";
        }

        // Review count boost
        $reviewBoost = $business->reviews_count * ($business->is_premium_active ? 5 : 2);
        if ($reviewBoost > 0) {
            $score += $reviewBoost;
            $factors[] = "Review count boost ({$business->reviews_count} reviews = +{$reviewBoost})";
        }

        // Recency factor (newer businesses get slight boost)
        $daysOld = $business->created_at->diffInDays(now());
        $recencyPenalty = $daysOld * ($business->is_premium_active ? -0.1 : -0.05);
        $score += $recencyPenalty;
        if ($recencyPenalty < -10) {
            $factors[] = "Age factor ({$daysOld} days = {$recencyPenalty})";
        }

        // Complete profile bonus (premium only)
        if ($business->is_premium_active) {
            $profileBonus = 0;
            $images = is_array($business->images) ? $business->images : (is_string($business->images) ? json_decode($business->images, true) : []);
            if ($images && is_array($images) && count($images) >= 3) $profileBonus += 50;
            if ($business->description && strlen($business->description) > 100) $profileBonus += 30;
            if ($business->operating_hours) $profileBonus += 20;
            if ($business->video_url) $profileBonus += 100;
            
            if ($profileBonus > 0) {
                $score += $profileBonus;
                $factors[] = "Complete profile bonus (+{$profileBonus})";
            }
        }

        return [
            'total_score' => round($score, 1),
            'factors' => $factors,
            'is_premium_boosted' => $business->is_premium_active
        ];
    }

    public function store(BusinessStoreRequest $request)
    {
        // Check business creation limits using PremiumFeatureService
        $canCreate = $this->premiumService->canPerformAction($request->user(), 'create_business');
        if (!$canCreate['allowed']) {
            return response()->json([
                'message' => $canCreate['reason'] === 'limit_exceeded' 
                    ? "Akun gratis maksimal punya {$canCreate['limit']} bisnis terdaftar. Upgrade salah satu bisnis kamu ke Premium untuk bisa menambah bisnis lain."
                    : 'Premium subscription required untuk membuat bisnis tambahan.',
                'error' => 'BUSINESS_LIMIT_EXCEEDED',
                'code' => 'FREE_LIMIT_REACHED',
                'current_count' => $canCreate['current'] ?? null,
                'limit' => $canCreate['limit'] ?? null,
                'upgrade_url' => '/dashboard?tab=premium'
            ], 403);
        }

        $data = $request->except(['image', 'images', 'video']);
        $data['user_id'] = $request->user()->id;
        $data['status'] = $request->user()->role === 'admin' ? 'approved' : 'pending';
        $data['package'] = $request->input('package');

        if ($request->input('package') === 'Bisnis' || $request->input('package') === 'Premium') {
            // If the user chose a paid package during business registration,
            // allow the business to be visible immediately while premium
            // activation/payment continues in the Premium tab.
            $data['status'] = 'approved';
        }

        if ($request->hasFile('image')) {
            $path = $request->file('image')->store('businesses', 'public');
            $data['image'] = '/storage/' . $path;
        }

        // Handle multiple images with premium limits
        if ($request->hasFile('images')) {
            $uploadedImages = [];
            $maxImages = $request->user()->hasActivePremiumBusiness() ? null : 3;
            
            foreach ($request->file('images') as $index => $file) {
                if ($maxImages && $index >= $maxImages) {
                    break; // Stop at free limit
                }
                $uploadedImages[] = '/storage/' . $file->store('businesses', 'public');
            }
            $data['images'] = $uploadedImages;
            
            // Notify if some images were skipped due to limits
            if ($maxImages && count($request->file('images')) > $maxImages) {
                $data['_image_limit_notice'] = "Hanya {$maxImages} foto pertama yang diupload. Upgrade ke Premium untuk foto unlimited!";
            }
        }

        // Video: only for premium users
        if ($request->hasFile('video')) {
            $canUploadVideo = $this->premiumService->canPerformAction($request->user(), 'upload_video');
            if ($canUploadVideo['allowed']) {
                $videoPath = $request->file('video')->store('businesses/videos', 'public');
                $data['video_url'] = '/storage/' . $videoPath;
            } else {
                return response()->json([
                    'message' => 'Upload video hanya tersedia untuk pengguna Premium. Upgrade sekarang untuk fitur video showcase!',
                    'error' => 'PREMIUM_REQUIRED',
                    'feature' => 'video_showcase',
                    'upgrade_url' => '/dashboard?tab=premium'
                ], 403);
            }
        }

        $business = Business::create($data);

        // Log security event
        SecurityHelper::logSecurityEvent('business_created', [
            'business_id' => $business->id,
            'user_id' => $request->user()->id,
            'business_title' => $business->title,
            'package' => $data['package'],
            'ip' => $request->ip()
        ]);

        // Create notification for admin about new business
        if ($request->user()->role !== 'admin') {
            \App\Http\Controllers\NotificationController::notifyAdminNewBusiness($business);
        }

        // Add usage stats to response for free users
        $response = $business->load('category');
        if (!$request->user()->hasActivePremiumBusiness()) {
            $response->usage_stats = $this->premiumService->getUserUsageStats($request->user());
        }

        return response()->json($response, 201);
    }

    public function show($id)
    {
        $business = Business::with(['category', 'user', 'reviews.reviewer:id,name,avatar'])->find($id);
        
        if (!$business) {
            return response()->json(['message' => 'Business not found'], 404);
        }

        return response()->json($business);
    }

    public function update(BusinessUpdateRequest $request, $id)
    {
        $business = Business::find($id);
        
        if (!$business) {
            return response()->json(['message' => 'Business not found'], 404);
        }

        // Authorize
        if ($request->user()->id !== $business->user_id && $request->user()->role !== 'admin') {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $data = $request->except(['image', 'images', 'remove_gallery', 'video', 'remove_images', 'remove_logo']);

        if ($request->hasFile('image')) {
            // Delete old image if exists
            if ($business->image) {
                Storage::disk('public')->delete(str_replace('/storage/', '', $business->image));
            }
            $path = $request->file('image')->store('businesses', 'public');
            $data['image'] = '/storage/' . $path;
        } elseif ($request->boolean('remove_logo')) {
            if ($business->image) {
                Storage::disk('public')->delete(str_replace('/storage/', '', $business->image));
                $data['image'] = null;
            }
        }

        // Video: file yang diunggah langsung menang atas link teks, dan
        // video lama (kalau berupa file storage, bukan link eksternal)
        // dihapus supaya tidak menumpuk sampah di server.
        if ($request->hasFile('video')) {
            $canUploadVideo = $this->premiumService->canPerformAction($request->user(), 'upload_video', $business);
            if (!$canUploadVideo['allowed']) {
                return response()->json([
                    'message' => 'Upload video hanya tersedia untuk pengguna Premium. Upgrade sekarang untuk fitur video showcase!',
                    'error' => 'PREMIUM_REQUIRED',
                    'feature' => 'video_showcase',
                    'upgrade_url' => '/dashboard?tab=premium'
                ], 403);
            }
            
            if ($business->video_url && str_starts_with($business->video_url, '/storage/')) {
                Storage::disk('public')->delete(str_replace('/storage/', '', $business->video_url));
            }
            $videoPath = $request->file('video')->store('businesses/videos', 'public');
            $data['video_url'] = '/storage/' . $videoPath;
        }

        // Handle new images with premium limits
        $gallery = $business->images ?? [];
        if ($request->has('remove_images')) {
            $toRemove = $request->input('remove_images', []);
            foreach ($toRemove as $removePath) {
                if (str_starts_with($removePath, '/storage/')) {
                    Storage::disk('public')->delete(str_replace('/storage/', '', $removePath));
                }
            }
            $gallery = array_values(array_diff($gallery, $toRemove));
        }
        
        if ($request->hasFile('images')) {
            $canUploadPhotos = $this->premiumService->canPerformAction($request->user(), 'upload_photos', $business);
            if (!$canUploadPhotos['allowed']) {
                return response()->json([
                    'message' => $canUploadPhotos['reason'] === 'limit_exceeded'
                        ? "Batas maksimal foto untuk akun gratis adalah {$canUploadPhotos['limit']} foto. Upgrade ke Premium untuk foto unlimited!"
                        : 'Premium subscription required untuk upload foto.',
                    'error' => 'PHOTO_LIMIT_EXCEEDED',
                    'feature' => 'unlimited_photos',
                    'current_count' => $canUploadPhotos['current'] ?? null,
                    'limit' => $canUploadPhotos['limit'] ?? null,
                    'upgrade_url' => '/dashboard?tab=premium'
                ], 403);
            }
            
            $maxPhotos = $business->is_premium_active ? null : 3;
            $currentCount = count($gallery);
            
            foreach ($request->file('images') as $file) {
                if ($maxPhotos && $currentCount >= $maxPhotos) {
                    break; // Stop at free limit
                }
                $gallery[] = '/storage/' . $file->store('businesses', 'public');
                $currentCount++;
            }
        }
        $data['images'] = $gallery;

        // Only admin can change status or premium status
        if ($request->user()->role !== 'admin') {
            unset($data['status']);
            unset($data['is_premium']);
        }

        $originalData = $business->toArray();
        $business->update($data);

        // Log security event with changes
        SecurityHelper::logSecurityEvent('business_updated', [
            'business_id' => $business->id,
            'user_id' => $request->user()->id,
            'business_title' => $business->title,
            'changes' => array_diff_assoc($data, $originalData),
            'ip' => $request->ip()
        ]);

        return response()->json($business->load('category'));
    }

    public function destroy(Request $request, $id)
    {
        $business = Business::find($id);

        if (!$business) {
            return response()->json(['message' => 'Business not found'], 404);
        }

        // Authorize
        if ($request->user()->id !== $business->user_id && $request->user()->role !== 'admin') {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        if ($business->image) {
            $oldPath = str_replace('/storage/', '', $business->image);
            Storage::disk('public')->delete($oldPath);
        }

        foreach ($business->images ?? [] as $galleryPath) {
            Storage::disk('public')->delete(str_replace('/storage/', '', $galleryPath));
        }

        $business->delete();

        return response()->json(['message' => 'Business deleted successfully']);
    }

    public function approve(Request $request, $id)
    {
        if ($request->user()->role !== 'admin') {
            return response()->json(['message' => 'Forbidden'], 403);
        }

        $business = Business::find($id);
        if (!$business) {
            return response()->json(['message' => 'Business not found'], 404);
        }

        $business->status = 'approved';
        $business->suspend_reason = null;
        $business->save();

        return response()->json($business);
    }

    // Suspend: sementara sembunyikan bisnis dari publik tanpa menghapusnya
    // (beda dari reject, yang untuk pendaftaran baru yang ditolak).
    public function suspend(Request $request, $id)
    {
        if ($request->user()->role !== 'admin') {
            return response()->json(['message' => 'Forbidden'], 403);
        }

        $business = Business::find($id);
        if (!$business) {
            return response()->json(['message' => 'Business not found'], 404);
        }

        $business->status = 'suspended';
        $business->suspend_reason = $request->input('reason');
        $business->save();

        return response()->json($business);
    }

    public function unsuspend(Request $request, $id)
    {
        if ($request->user()->role !== 'admin') {
            return response()->json(['message' => 'Forbidden'], 403);
        }

        $business = Business::find($id);
        if (!$business) {
            return response()->json(['message' => 'Business not found'], 404);
        }

        $business->status = 'approved';
        $business->suspend_reason = null;
        $business->save();

        return response()->json($business);
    }

    public function togglePremium(Request $request, $id)
    {
        if ($request->user()->role !== 'admin') {
            return response()->json(['message' => 'Forbidden'], 403);
        }

        $business = Business::find($id);
        if (!$business) {
            return response()->json(['message' => 'Business not found'], 404);
        }

        $business->is_premium = !$business->is_premium;
        // Manual admin grant: give 30 days by default; clearing removes the expiry too.
        $business->premium_expires_at = $business->is_premium
            ? now()->addDays(30)
            : null;
        $business->save();

        return response()->json($business);
    }

    /**
     * Tambah ulasan untuk sebuah bisnis.
     *
     * CATATAN: sebelumnya pakai updateOrCreate(business_id+reviewer_id)
     * yang bikin kirim ulasan kedua kali cuma nge-update yang lama -
     * padahal tabelnya sendiri memang didesain tanpa batasan 1x (lihat
     * migration create_business_reviews_table). Sekarang selalu bikin
     * baris baru (create) supaya user benar-benar bisa ngasih ulasan
     * berkali-kali.
     */
    public function addReview(Request $request, $id)
    {
        $business = Business::find($id);
        if (!$business) {
            return response()->json(['message' => 'Business not found'], 404);
        }

        $request->validate([
            'rating' => 'required|integer|min:1|max:5',
            'comment' => 'required|string|min:5|max:1000',
        ]);

        $review = \App\Models\BusinessReview::create([
            'business_id' => $id,
            'reviewer_id' => $request->user()->id,
            'rating' => $request->rating,
            'comment' => $request->comment,
            'helpful_count' => 0,
        ]);

        $review->load('reviewer:id,name,avatar');

        return response()->json($review, 201);
    }
}