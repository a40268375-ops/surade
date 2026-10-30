<?php

namespace App\Http\Controllers;

use App\Models\Business;
use App\Models\MenuItem;
use App\Services\PremiumFeatureService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;

class MenuItemController extends Controller
{
    protected $premiumService;

    public function __construct(PremiumFeatureService $premiumService)
    {
        $this->premiumService = $premiumService;
    }
    // Publik: menu sebuah bisnis lewat ?business_id=. Login tanpa filter:
    // menu milik bisnis-bisnisnya sendiri (admin: semua menu).
    public function index(Request $request)
    {
        $query = MenuItem::with('business');

        if ($request->has('business_id')) {
            $query->where('business_id', $request->business_id);
        } elseif ($request->user() && $request->user()->role !== 'admin') {
            $user = $request->user();
            $query->whereHas('business', function ($q) use ($user) {
                $q->where('user_id', $user->id);
            });
        }

        return response()->json($query->latest()->get());
    }

    public function store(Request $request)
    {
        \App\Services\ContentModerationService::validateOrFail($request, ['name', 'description'], ['image']);

        $validator = Validator::make($request->all(), [
            'business_id' => 'required|exists:businesses,id',
            'name' => 'required|string|max:255',
            'description' => 'nullable|string',
            'price' => 'required|integer|min:0',
            'image' => 'nullable|image|mimes:jpeg,png,jpg,gif|max:5120',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        $business = Business::find($request->business_id);
        $user = $request->user();

        if ($user->role !== 'admin' && $business->user_id !== $user->id) {
            return response()->json(['message' => 'Forbidden'], 403);
        }

        // Check premium limits for menu items
        $canAdd = $this->premiumService->canPerformAction($user, 'add_menu_item', $business);
        if (!$canAdd['allowed']) {
            return response()->json([
                'message' => $canAdd['reason'] === 'limit_exceeded' 
                    ? "Batas maksimal menu item untuk akun gratis adalah {$canAdd['limit']} item. Upgrade ke Premium untuk menu unlimited!"
                    : 'Premium subscription required untuk menambah menu item.',
                'error' => 'PREMIUM_LIMIT_EXCEEDED',
                'feature' => $canAdd['feature'] ?? 'unlimited_menu_items',
                'current_count' => $canAdd['current'] ?? null,
                'limit' => $canAdd['limit'] ?? null,
                'upgrade_url' => '/dashboard?tab=premium'
            ], 403);
        }

        $data = $request->only(['business_id', 'name', 'description', 'price']);

        if ($request->hasFile('image')) {
            $data['image'] = '/storage/' . $request->file('image')->store('menu-items', 'public');
        }

        $menuItem = MenuItem::create($data);

        // Return with usage stats for frontend
        $response = $menuItem->load('business');
        if (!$business->is_premium_active) {
            $stats = $this->premiumService->getUserUsageStats($user);
            $response->usage_stats = $stats['businesses_detail'][$business->id]['menu_items'] ?? null;
        }

        return response()->json($response, 201);
    }

    public function update(Request $request, $id)
    {
        \App\Services\ContentModerationService::validateOrFail($request, ['name', 'description'], ['image']);

        $menuItem = MenuItem::with('business')->find($id);

        if (!$menuItem) {
            return response()->json(['message' => 'Menu tidak ditemukan'], 404);
        }

        $user = $request->user();
        if ($user->role !== 'admin' && $menuItem->business->user_id !== $user->id) {
            return response()->json(['message' => 'Forbidden'], 403);
        }

        $validator = Validator::make($request->all(), [
            'name' => 'sometimes|required|string|max:255',
            'description' => 'nullable|string',
            'price' => 'sometimes|required|integer|min:0',
            'is_available' => 'sometimes|boolean',
            'image' => 'nullable|image|mimes:jpeg,png,jpg,gif|max:5120',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        $data = $request->only(['name', 'description', 'price', 'is_available']);

        if ($request->hasFile('image')) {
            $data['image'] = '/storage/' . $request->file('image')->store('menu-items', 'public');
        }

        $menuItem->update($data);

        return response()->json($menuItem->fresh('business'));
    }

    public function destroy(Request $request, $id)
    {
        $menuItem = MenuItem::with('business')->find($id);

        if (!$menuItem) {
            return response()->json(['message' => 'Menu tidak ditemukan'], 404);
        }

        $user = $request->user();
        if ($user->role !== 'admin' && $menuItem->business->user_id !== $user->id) {
            return response()->json(['message' => 'Forbidden'], 403);
        }

        $menuItem->delete();

        return response()->json(['message' => 'Menu dihapus']);
    }
}