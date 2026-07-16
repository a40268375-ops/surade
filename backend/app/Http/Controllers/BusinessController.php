<?php

namespace App\Http\Controllers;

use App\Models\Business;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Validator;

class BusinessController extends Controller
{
    public function index(Request $request)
    {
        $query = Business::with('category', 'user');

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
            $query->where('address', 'like', "%{$request->location}%");
        }

       $isAdminRequest = $request->user() && $request->user()->role === 'admin';

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
        $validator = Validator::make($request->all(), [
            'category_id' => 'required',
            'title' => 'required|string|max:255',
            'description' => 'required|string',
            'address' => 'required|string',
            'latitude' => 'nullable|numeric|between:-90,90',
            'longitude' => 'nullable|numeric|between:-180,180',
            'phone' => 'required|string',
            'email' => 'nullable|email',
            'operating_hours' => 'nullable|string',
            'closed_days' => 'nullable|array',
            'closed_days.*' => 'string',
            'tags' => 'nullable|array',
            'tags.*' => 'string',
            'website' => 'nullable|string',
            'video_url' => 'nullable|string',
            'image' => 'nullable|image|mimes:jpeg,png,jpg,gif|max:2048',
            'images.*' => 'nullable|image|mimes:jpeg,png,jpg,gif|max:2048',
            'referred_by' => 'nullable|string',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        $data = $request->except(['image', 'images']);
        $data['user_id'] = $request->user()->id;
        $data['status'] = $request->user()->role === 'admin' ? 'approved' : 'pending';

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

        $business = Business::create($data);

        return response()->json($business->load('category'), 201);
    }

    public function show($id)
    {
        $business = Business::with('category', 'user')->find($id);
        
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

        $validator = Validator::make($request->all(), [
            'category_id' => 'sometimes|required',
            'title' => 'sometimes|required|string|max:255',
            'description' => 'sometimes|required|string',
            'address' => 'sometimes|required|string',
            'latitude' => 'nullable|numeric|between:-90,90',
            'longitude' => 'nullable|numeric|between:-180,180',
            'phone' => 'sometimes|required|string',
            'email' => 'nullable|email',
            'operating_hours' => 'nullable|string',
            'closed_days' => 'nullable|array',
            'closed_days.*' => 'string',
            'tags' => 'nullable|array',
            'tags.*' => 'string',
            'website' => 'nullable|string',
            'video_url' => 'nullable|string',
            'image' => 'nullable', // could be string URL or file
            'images.*' => 'nullable|image|mimes:jpeg,png,jpg,gif|max:2048',
            'remove_gallery' => 'nullable|array',
            'remove_gallery.*' => 'string',
            'is_premium' => 'nullable|boolean',
            'status' => 'nullable|string|in:pending,approved,rejected',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        $data = $request->except(['image', 'images', 'remove_gallery']);

        if ($request->hasFile('image')) {
            // Delete old image if exists
            if ($business->image) {
                $oldPath = str_replace('/storage/', '', $business->image);
                Storage::disk('public')->delete($oldPath);
            }
            $path = $request->file('image')->store('businesses', 'public');
            $data['image'] = '/storage/' . $path;
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
}