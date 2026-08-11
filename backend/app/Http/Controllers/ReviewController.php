<?php

namespace App\Http\Controllers;

use App\Models\BusinessReview;
use App\Models\ReviewHelpfulVote;
use App\Models\SellerReview;
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
}