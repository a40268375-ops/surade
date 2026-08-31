<?php

namespace App\Http\Controllers;

use App\Models\BusinessReview;
use App\Models\ReviewHelpfulVote;
use App\Models\SellerReview;
use App\Http\Helpers\SecurityHelper;
use Illuminate\Http\Request;

class ReviewController extends Controller
{
    /**
     * Toggle "berguna" (like) untuk satu ulasan.
     * $type: 'business' atau 'seller'
     *
     * Kalau user ini belum pernah nge-like ulasan tersebut -> ditambahkan
     * (helpful_count +1). Kalau sudah pernah -> dihapus (helpful_count -1),
     * jadi tombolnya bisa di-klik lagi buat batalin like (toggle).
     */
    public function toggleHelpful(Request $request, string $type, $id)
    {
        if (!in_array($type, ['business', 'seller'])) {
            return response()->json(['message' => 'Tipe ulasan tidak valid'], 422);
        }

        $review = $type === 'business'
            ? BusinessReview::find($id)
            : SellerReview::find($id);

        if (!$review) {
            return response()->json(['message' => 'Ulasan tidak ditemukan'], 404);
        }

        $userId = $request->user()->id;

        $existingVote = ReviewHelpfulVote::where('review_type', $type)
            ->where('review_id', $id)
            ->where('user_id', $userId)
            ->first();

        if ($existingVote) {
            $existingVote->delete();
            $review->decrement('helpful_count');
            $review->refresh();

            return response()->json([
                'helpful_count' => $review->helpful_count,
                'helpful_by_me' => false,
            ]);
        }

        ReviewHelpfulVote::create([
            'review_type' => $type,
            'review_id' => $id,
            'user_id' => $userId,
        ]);
        $review->increment('helpful_count');
        $review->refresh();

        return response()->json([
            'helpful_count' => $review->helpful_count,
            'helpful_by_me' => true,
        ]);
    }

    /**
     * Auth required: semua ulasan yang masuk ke bisnis-bisnis milik user
     * yang sedang login (admin melihat semua ulasan). Dipakai di
     * Dashboard > Ulasan.
     */
    public function myReviews(Request $request)
    {
        $user = $request->user();

        $query = BusinessReview::with(['business:id,title,image,user_id', 'reviewer:id,name,avatar'])
            ->latest();

        if ($user->role !== 'admin') {
            $businessIds = $user->businesses()->pluck('id');
            $query->whereIn('business_id', $businessIds);
        }

        return response()->json($query->get());
    }

    /**
     * Auth required: pemilik bisnis (atau admin) membalas/mengedit balasan
     * atas sebuah ulasan pelanggan.
     */
    public function reply(Request $request, $id)
    {
        $review = BusinessReview::with('business')->find($id);
        if (!$review) {
            return response()->json(['message' => 'Ulasan tidak ditemukan'], 404);
        }

        $user = $request->user();
        if ($user->role !== 'admin' && $review->business->user_id !== $user->id) {
            return response()->json(['message' => 'Forbidden'], 403);
        }

        $request->validate([
            'reply' => 'required|string|max:1000',
        ]);

        // Sanitize the reply content
        $sanitizedReply = SecurityHelper::sanitizeInput($request->reply);

        $review->update([
            'owner_reply' => $sanitizedReply,
            'owner_reply_at' => now(),
        ]);

        // Log security event
        SecurityHelper::logSecurityEvent('review_replied', [
            'review_id' => $review->id,
            'business_id' => $review->business_id,
            'user_id' => $user->id,
            'reply_length' => strlen($sanitizedReply),
            'ip' => $request->ip()
        ]);

        return response()->json($review->load(['business:id,title,image,user_id', 'reviewer:id,name,avatar']));
    }

    /**
     * Auth required: pemilik bisnis (atau admin) menghapus ulasan, mis.
     * karena melanggar atau spam.
     */
    public function destroyReview(Request $request, $id)
    {
        $review = BusinessReview::with('business')->find($id);
        if (!$review) {
            return response()->json(['message' => 'Ulasan tidak ditemukan'], 404);
        }

        $user = $request->user();
        if ($user->role !== 'admin' && $review->business->user_id !== $user->id) {
            return response()->json(['message' => 'Forbidden'], 403);
        }

        // Store info for logging before deletion
        $reviewInfo = [
            'id' => $review->id,
            'business_id' => $review->business_id,
            'reviewer_id' => $review->user_id,
            'rating' => $review->rating,
            'comment_length' => strlen($review->comment ?? '')
        ];

        $review->delete();

        // Log security event
        SecurityHelper::logSecurityEvent('review_deleted', [
            'review_id' => $reviewInfo['id'],
            'business_id' => $reviewInfo['business_id'],
            'deleted_by_user_id' => $user->id,
            'original_reviewer_id' => $reviewInfo['reviewer_id'],
            'rating' => $reviewInfo['rating'],
            'ip' => $request->ip()
        ]);

        return response()->json(['message' => 'Ulasan berhasil dihapus']);
    }
}