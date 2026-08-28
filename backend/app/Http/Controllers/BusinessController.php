<?php

namespace App\Http\Controllers;

use App\Models\Business;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Validator;

class BusinessController extends Controller
{
    // Jumlah maksimal bisnis yang boleh dimiliki akun non-premium (gratis).
    // Lihat pemakaiannya di store().
    const FREE_BUSINESS_LIMIT = 1;

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

        // Premium first
        $businesses = $query->orderBy('is_premium', 'desc')->orderBy('created_at', 'desc')->get();

        return response()->json($businesses);
    }

    public function myBusinesses(Request $request)
    {
        $user = $request->user();
        $businesses = Business::with('category')->where('user_id', $user->id)->get();
        return response()->json($businesses);
    }

    public function store(Request $request)
    {
        if ($request->has('category_id') && !is_numeric($request->input('category_id'))) {
            $catId = $request->input('category_id');
            if (!empty($catId)) {
                $cat = \App\Models\Category::firstOrCreate(
                    ['name' => $catId],
                    ['slug' => \Illuminate\Support\Str::slug($catId), 'icon' => 'tag']
                );
                $request->merge(['category_id' => $cat->id]);
            }
        }

        $validator = Validator::make($request->all(), [
            'category_id' => 'required',
            'title' => 'required|string|max:255',
            'description' => 'required|string',
            'address' => 'required|string',
            'village' => 'nullable|string',
            'latitude' => 'nullable|numeric|between:-90,90',
            'longitude' => 'nullable|numeric|between:-180,180',
            'phone' => 'required|string',
            'email' => 'nullable|email',
            'operating_hours' => 'nullable|string',
            'closed_days' => 'nullable|array',
            'closed_days.*' => 'string',
            'price_category' => 'nullable|integer|in:1,2,3',
            'tags' => 'nullable|array',
            'tags.*' => 'string',
            'website' => 'nullable|string',
            'video_url' => 'nullable|string',
            'video' => 'nullable|file|mimetypes:video/mp4,video/webm,video/quicktime|max:20480',
            'image' => 'nullable|image|mimes:jpeg,png,jpg,gif|max:5120',
            'images.*' => 'nullable|image|mimes:jpeg,png,jpg,gif|max:5120',
            'referred_by' => 'nullable|string',
            'package' => 'nullable|string|in:Gratis,Bisnis,Premium',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        // ── Batas paket gratis ──────────────────────────────────────────
        // User yang belum premium (tidak punya satu pun bisnis is_premium
        // aktif) cuma boleh punya maksimal FREE_BUSINESS_LIMIT bisnis
        // terdaftar. Untuk daftar bisnis tambahan, salah satu bisnisnya
        // harus di-upgrade ke Premium dulu (lihat tab "Premium & Invoice").
        // Admin tidak kena batasan ini.
        if ($request->user()->role !== 'admin') {
            $ownedBusinessCount = Business::where('user_id', $request->user()->id)->count();
            $hasActivePremium = Business::where('user_id', $request->user()->id)
                ->where('is_premium', true)
                ->get()
                ->contains(fn ($b) => $b->is_premium_active);

            if (!$hasActivePremium && $ownedBusinessCount >= self::FREE_BUSINESS_LIMIT) {
                return response()->json([
                    'message' => "Akun gratis maksimal punya " . self::FREE_BUSINESS_LIMIT . " bisnis terdaftar. Upgrade salah satu bisnis kamu ke Premium untuk bisa menambah bisnis lain.",
                    'code' => 'FREE_LIMIT_REACHED',
                ], 403);
            }
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

        if ($request->hasFile('images')) {
            $galleryPaths = [];
            foreach ($request->file('images') as $file) {
                $galleryPaths[] = '/storage/' . $file->store('businesses', 'public');
            }
            $data['images'] = $galleryPaths;
        }

        // Video: kalau ada file video yang diunggah langsung, itu yang dipakai
        // (path storage-nya disimpan di kolom video_url yang sama), timpa link
        // video_url dari teks kalau ada dua-duanya.
        if ($request->hasFile('video')) {
            $videoPath = $request->file('video')->store('businesses/videos', 'public');
            $data['video_url'] = '/storage/' . $videoPath;
        }

        $business = Business::create($data);

        // Create notification for admin about new business
        if ($request->user()->role !== 'admin') {
            \App\Http\Controllers\NotificationController::notifyAdminNewBusiness($business);
        }

        return response()->json($business->load('category'), 201);
    }

    public function show($id)
    {
        $business = Business::with(['category', 'user', 'reviews.reviewer:id,name,avatar'])->find($id);
        
        if (!$business) {
            return response()->json(['message' => 'Business not found'], 404);
        }

        return response()->json($business);
    }

    public function update(Request $request, $id)
    {
        $business = Business::find($id);
        
        if (!$business) {
            return response()->json(['message' => 'Business not found'], 404);
        }

        // Authorize
        if ($request->user()->id !== $business->user_id && $request->user()->role !== 'admin') {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        if ($request->has('category_id') && !is_numeric($request->input('category_id'))) {
            $catId = $request->input('category_id');
            if (!empty($catId)) {
                $cat = \App\Models\Category::firstOrCreate(
                    ['name' => $catId],
                    ['slug' => \Illuminate\Support\Str::slug($catId), 'icon' => 'tag']
                );
                $request->merge(['category_id' => $cat->id]);
            }
        }

        $validator = Validator::make($request->all(), [
            'category_id' => 'sometimes|required',
            'title' => 'sometimes|required|string|max:255',
            'description' => 'sometimes|required|string',
            'address' => 'sometimes|required|string',
            'village' => 'nullable|string',
            'latitude' => 'nullable|numeric|between:-90,90',
            'longitude' => 'nullable|numeric|between:-180,180',
            'phone' => 'sometimes|required|string',
            'email' => 'nullable|email',
            'operating_hours' => 'nullable|string',
            'closed_days' => 'nullable|array',
            'closed_days.*' => 'string',
            'price_category' => 'nullable|integer|in:1,2,3',
            'tags' => 'nullable|array',
            'tags.*' => 'string',
            'website' => 'nullable|string',
            'video_url' => 'nullable|string',
            'video' => 'nullable|file|mimetypes:video/mp4,video/webm,video/quicktime|max:20480',
            'image' => 'nullable|image|mimes:jpeg,png,jpg,gif|max:5120', // could be a new uploaded file
            'images.*' => 'nullable|image|mimes:jpeg,png,jpg,gif|max:5120',
            'remove_gallery' => 'nullable|array',
            'remove_gallery.*' => 'string',
            'is_premium' => 'nullable|boolean',
            'status' => 'nullable|string|in:pending,approved,rejected',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        $data = $request->except(['image', 'images', 'remove_gallery', 'video']);

        if ($request->hasFile('image')) {
            // Delete old image if exists
            if ($business->image) {
                $oldPath = str_replace('/storage/', '', $business->image);
                Storage::disk('public')->delete($oldPath);
            }
            $path = $request->file('image')->store('businesses', 'public');
            $data['image'] = '/storage/' . $path;
        }

        // Video: file yang diunggah langsung menang atas link teks, dan
        // video lama (kalau berupa file storage, bukan link eksternal)
        // dihapus supaya tidak menumpuk sampah di server.
        if ($request->hasFile('video')) {
            if ($business->video_url && str_starts_with($business->video_url, '/storage/')) {
                Storage::disk('public')->delete(str_replace('/storage/', '', $business->video_url));
            }
            $videoPath = $request->file('video')->store('businesses/videos', 'public');
            $data['video_url'] = '/storage/' . $videoPath;
        }

        // Start from the existing gallery, drop any paths the user asked to
        // remove, then append any newly-uploaded files.
        $gallery = $business->images ?? [];
        if ($request->has('remove_gallery')) {
            $toRemove = $request->input('remove_gallery', []);
            foreach ($toRemove as $removePath) {
                Storage::disk('public')->delete(str_replace('/storage/', '', $removePath));
            }
            $gallery = array_values(array_diff($gallery, $toRemove));
        }
        if ($request->hasFile('images')) {
            foreach ($request->file('images') as $file) {
                $gallery[] = '/storage/' . $file->store('businesses', 'public');
            }
        }
        $data['images'] = $gallery;

        // Only admin can change status or premium status
        if ($request->user()->role !== 'admin') {
            unset($data['status']);
            unset($data['is_premium']);
        }

        $business->update($data);

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