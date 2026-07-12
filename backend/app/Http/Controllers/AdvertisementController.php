<?php

namespace App\Http\Controllers;

use App\Models\Advertisement;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;

class AdvertisementController extends Controller
{
    public function index(Request $request)
    {
        $query = Advertisement::with('category', 'user');

        if ($request->has('status') && $request->user() && $request->user()->role === 'admin') {
            $query->where('status', $request->status);
        } elseif ($request->has('status') && $request->user()) {
            $query->where('status', $request->status)->where('user_id', $request->user()->id);
        } else {
            $query->where('status', 'approved');
        }

        $ads = $query->latest()->get();

        // Free users have no ads: an ad only stays visible on the public
        // website as long as the owner still has an active (non-expired)
        // premium business subscription. Once it expires, the ad disappears
        // automatically ("websitenya ilang sendiri") without any manual step.
        // This filter only applies to the public listing (no ?status= param) -
        // owners and admins managing ads in the dashboard still see everything.
        if (!$request->has('status')) {
            $ads = $ads->filter(fn ($ad) => $ad->user && $ad->user->hasActivePremiumBusiness())->values();
        }

        return response()->json($ads);
    }

    public function store(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'category_id' => 'required|exists:categories,id',
            'title' => 'required|string|max:255',
            'description' => 'required|string',
            'company_name' => 'required|string|max:255',
            'location' => 'required|string|max:255',
            'phone' => 'nullable|string',
            'website' => 'nullable|string',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        // Gate: only businesses with an active premium subscription can
        // post iklan. Free (non-premium / expired) users are blocked here.
        if ($request->user()->role !== 'admin' && !$request->user()->hasActivePremiumBusiness()) {
            return response()->json([
                'message' => 'Hanya bisnis dengan langganan Premium aktif yang bisa memasang iklan. Silakan berlangganan premium terlebih dahulu.',
            ], 403);
        }

        $data = $request->all();
        $data['user_id'] = $request->user()->id;
        $data['status'] = 'pending';

        $advertisement = Advertisement::create($data);

        return response()->json($advertisement->load('category'), 201);
    }

    public function show($id)
    {
        $advertisement = Advertisement::with('category', 'user')->find($id);

        if (!$advertisement) {
            return response()->json(['message' => 'Advertisement not found'], 404);
        }

        return response()->json($advertisement);
    }

    public function update(Request $request, $id)
    {
        $advertisement = Advertisement::find($id);

        if (!$advertisement) {
            return response()->json(['message' => 'Advertisement not found'], 404);
        }

        if ($request->user()->id !== $advertisement->user_id && $request->user()->role !== 'admin') {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $validator = Validator::make($request->all(), [
            'category_id' => 'sometimes|required|exists:categories,id',
            'title' => 'sometimes|required|string|max:255',
            'description' => 'sometimes|required|string',
            'company_name' => 'sometimes|required|string|max:255',
            'location' => 'sometimes|required|string|max:255',
            'phone' => 'nullable|string',
            'website' => 'nullable|string',
            'status' => 'nullable|string|in:pending,approved,rejected',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        $data = $request->all();

        if ($request->user()->role !== 'admin') {
            unset($data['status']);
        }

        $advertisement->update($data);

        return response()->json($advertisement->load('category'));
    }

    public function destroy(Request $request, $id)
    {
        $advertisement = Advertisement::find($id);

        if (!$advertisement) {
            return response()->json(['message' => 'Advertisement not found'], 404);
        }

        if ($request->user()->id !== $advertisement->user_id && $request->user()->role !== 'admin') {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $advertisement->delete();

        return response()->json(['message' => 'Advertisement deleted successfully']);
    }
}
