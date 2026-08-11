<?php

namespace App\Http\Controllers;

use App\Models\User;
use App\Models\Business;
use App\Models\SellerReview;
use App\Models\SavedBusiness;
use App\Models\Message;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class SellerController extends Controller
{
    /**
     * Get seller profile information
     */
    public function show($id)
    {
        try {
            $seller = User::with(['businesses', 'reviewsReceived.reviewer'])
                ->findOrFail($id);

            // Calculate average rating
            $avgRating = $seller->reviewsReceived()->avg('rating') ?: 0;
            $reviewCount = $seller->reviewsReceived()->count();
            $businessCount = $seller->businesses()->where('status', 'approved')->count();
            
            // Calculate total views from PageView tracking
            $businessIds = $seller->businesses()->pluck('id');
            $totalViews = \App\Models\PageView::whereIn('business_id', $businessIds)->count();

            return response()->json([
                'id' => $seller->id,
                'name' => $seller->name,
                'avatar' => $seller->avatar,
                'cover_photo' => $seller->cover_photo,
                'bio' => $seller->bio,
                'phone' => $seller->phone,
                'email' => $seller->email,
                'location' => $seller->location ?? 'Sukabumi, Jawa Barat',
                'joined' => $seller->created_at->format('F Y'),
                'rating' => round($avgRating, 1),
                'reviewCount' => $reviewCount,
                'businessCount' => $businessCount,
                'totalViews' => $totalViews,
            ]);
        } catch (\Exception $e) {
            \Log::error('Seller profile error: ' . $e->getMessage());
            return response()->json([
                'message' => 'Failed to load seller profile',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Get seller's businesses
     *
     * CATATAN PERBAIKAN: query lama pakai nama kolom yang TIDAK ADA di
     * tabel `businesses` ('name', 'img', 'rating', 'reviews', 'is_active' -
     * kolom asli tabelnya adalah 'title', 'image', 'status'). Query lama
     * selalu gagal dengan SQL error "Unknown column", sehingga frontend
     * (yang membungkus fetch ini dengan try/catch) diam-diam jatuh ke data
     * dummy ("Warung Makan Pak Budi", dst) alih-alih bisnis asli milik
     * penjual ini. Sekarang query memakai kolom asli + hanya menampilkan
     * bisnis yang sudah disetujui admin (status = approved), dan bentuk
     * responsnya disesuaikan dengan field yang dipakai SellerProfile.jsx.
     */
    public function businesses($id)
    {
        try {
            $seller = User::findOrFail($id);

            $businesses = $seller->businesses()
                ->with('category:id,name')
                ->where('status', 'approved')
                ->select(['id', 'category_id', 'title', 'image', 'address', 'description', 'is_premium', 'premium_expires_at'])
                ->latest()
                ->get()
                ->map(function ($biz) {
                    return [
                        'id' => $biz->id,
                        'name' => $biz->title,
                        'category' => $biz->category?->name,
                        'image' => $biz->image,
                        'address' => $biz->address,
                        'description' => $biz->description,
                        'is_premium_active' => $biz->is_premium_active,
                    ];
                });

            return response()->json($businesses);
        } catch (\Exception $e) {
            // Kalau masih ada error di sini, sekarang tercatat jelas di
            // storage/logs/laravel.log (bukan diam-diam gagal ke frontend).
            \Log::error('Seller businesses error: ' . $e->getMessage());
            return response()->json([
                'message' => 'Failed to load seller businesses',
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Get seller's reviews
     */
    public function reviews($id)
    {
        $seller = User::findOrFail($id);
        
        $reviews = $seller->reviewsReceived()
            ->with('reviewer:id,name,avatar')
            ->orderBy('created_at', 'desc')
            ->get()
            ->map(function ($review) {
                return [
                    'id' => $review->id,
                    'user_name' => $review->reviewer->name,
                    'user_avatar' => $review->reviewer->avatar,
                    'rating' => $review->rating,
                    'comment' => $review->comment,
                    'created_at' => $review->created_at,
                    'helpful_count' => $review->helpful_count,
                ];
            });

        return response()->json($reviews);
    }

    /**
     * Check if current user has saved this seller
     */
    public function isSaved($id)
    {
        if (!Auth::check()) {
            return response()->json(['is_saved' => false]);
        }

        $saved = SavedBusiness::where('user_id', Auth::id())
            ->whereHas('business', function ($query) use ($id) {
                $query->where('user_id', $id);
            })
            ->exists();

        return response()->json(['is_saved' => $saved]);
    }

    /**
     * Save seller (save all their businesses)
     */
    public function save($id)
    {
        if (!Auth::check()) {
            return response()->json(['message' => 'Unauthorized'], 401);
        }

        $seller = User::findOrFail($id);
        
        // Get all seller's businesses
        $businesses = $seller->businesses()->pluck('id');
        
        foreach ($businesses as $businessId) {
            SavedBusiness::firstOrCreate([
                'user_id' => Auth::id(),
                'business_id' => $businessId,
            ]);
        }

        return response()->json(['message' => 'Seller berhasil disimpan']);
    }

    /**
     * Unsave seller (remove all their businesses from saved)
     */
    public function unsave($id)
    {
        if (!Auth::check()) {
            return response()->json(['message' => 'Unauthorized'], 401);
        }

        SavedBusiness::where('user_id', Auth::id())
            ->whereHas('business', function ($query) use ($id) {
                $query->where('user_id', $id);
            })
            ->delete();

        return response()->json(['message' => 'Seller berhasil dihapus dari favorit']);
    }

    /**
     * Add review for seller.
     *
     * CATATAN: sebelumnya pakai updateOrCreate(seller_id+reviewer_id) yang
     * artinya kirim ulasan kedua kali cuma nge-update yang lama (efeknya
     * kelihatan "cuma bisa 1x"). Sekarang selalu bikin baris baru (create)
     * supaya user bisa ngasih ulasan berkali-kali. Constraint unique di
     * tabelnya juga sudah dihapus lewat migration terbaru. Pengecekan
     * "tidak boleh review diri sendiri" juga dihapus sesuai permintaan -
     * sekarang siapa pun (termasuk pemilik profil sendiri) boleh mengisi
     * ulasan.
     */
    public function addReview(Request $request, $id)
    {
        if (!Auth::check()) {
            return response()->json(['message' => 'Unauthorized'], 401);
        }

        $request->validate([
            'rating' => 'required|integer|min:1|max:5',
            'comment' => 'required|string|min:10|max:1000',
        ]);

        $seller = User::findOrFail($id);

        $review = SellerReview::create([
            'seller_id' => $id,
            'reviewer_id' => Auth::id(),
            'rating' => $request->rating,
            'comment' => $request->comment,
        ]);

        // Load reviewer data for response
        $review->load('reviewer:id,name,avatar');

        return response()->json([
            'id' => $review->id,
            'user_name' => $review->reviewer->name,
            'user_avatar' => $review->reviewer->avatar,
            'rating' => $review->rating,
            'comment' => $review->comment,
            'created_at' => $review->created_at,
            'helpful_count' => $review->helpful_count,
        ]);
    }

    /**
     * Send message to seller
     */
    public function sendMessage(Request $request, $id)
    {
        if (!Auth::check()) {
            return response()->json(['message' => 'Unauthorized'], 401);
        }

        $request->validate([
            'message' => 'required|string|min:5|max:1000',
        ]);

        $seller = User::findOrFail($id);
        
        // Get seller's first business for message association
        $business = $seller->businesses()->first();
        
        if (!$business) {
            return response()->json(['message' => 'Seller tidak memiliki bisnis aktif'], 400);
        }

        $message = Message::create([
            'business_id' => $business->id,
            'sender_name' => Auth::user()->name,
            'sender_contact' => Auth::user()->email,
            'message' => $request->message,
            'is_read' => false,
        ]);

        return response()->json(['message' => 'Pesan berhasil dikirim']);
    }
}