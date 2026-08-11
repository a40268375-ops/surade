<?php

namespace App\Http\Controllers;

use App\Models\Blog;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;

class BlogController extends Controller
{
    public function index()
    {
        return response()->json(Blog::with('author')->latest()->get());
    }

    // Dipakai halaman detail blog publik (BlogDetail.jsx).
    public function show($id)
    {
        $blog = Blog::with('author')->find($id);
        if (!$blog) {
            return response()->json(['message' => 'Blog tidak ditemukan'], 404);
        }
        return response()->json($blog);
    }

    public function store(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'title' => 'required|string|max:255',
            'content' => 'required|string',
            'excerpt' => 'nullable|string|max:500',
            'category' => 'required|string',
            'status' => 'nullable|string|in:draft,published',
            // 'image' bisa berupa file upload ATAU url langsung (kompatibel
            // dengan cara lama yang masih mengirim image_url).
            'image' => 'nullable',
            'thumbnail' => 'nullable|image|mimes:jpeg,png,jpg,webp|max:5120',
            'banners.*' => 'nullable|image|mimes:jpeg,png,jpg,webp|max:5120',
            'gallery.*' => 'nullable|image|mimes:jpeg,png,jpg,webp|max:5120',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        $imagePath = $request->image;
        if ($request->hasFile('thumbnail')) {
            $imagePath = '/storage/' . $request->file('thumbnail')->store('blogs/thumbnails', 'public');
        }

        $bannerPaths = [];
        if ($request->hasFile('banners')) {
            foreach ($request->file('banners') as $file) {
                $bannerPaths[] = '/storage/' . $file->store('blogs/banners', 'public');
            }
        }

        $galleryPaths = [];
        if ($request->hasFile('gallery')) {
            foreach ($request->file('gallery') as $file) {
                $galleryPaths[] = '/storage/' . $file->store('blogs/gallery', 'public');
            }
        }

        $blog = Blog::create([
            'title' => $request->title,
            'content' => $request->content,
            'excerpt' => $request->excerpt,
            'category' => $request->category,
            'status' => $request->status ?? 'draft',
            'image' => $imagePath,
            'banners' => $bannerPaths,
            'gallery' => $galleryPaths,
            'created_by' => $request->user()->id,
        ]);

        return response()->json($blog->load('author'), 201);
    }

    public function update(Request $request, $id)
    {
        $blog = Blog::find($id);

        if (!$blog) {
            return response()->json(['message' => 'Blog not found'], 404);
        }

        $validator = Validator::make($request->all(), [
            'title' => 'sometimes|required|string|max:255',
            'content' => 'sometimes|required|string',
            'excerpt' => 'nullable|string|max:500',
            'category' => 'sometimes|required|string',
            'status' => 'nullable|string|in:draft,published',
            'image' => 'nullable|url',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        $blog->update($request->only(['title', 'content', 'excerpt', 'category', 'status', 'image']));

        return response()->json($blog->fresh('author'));
    }

    public function destroy($id)
    {
        $blog = Blog::find($id);

        if (!$blog) {
            return response()->json(['message' => 'Blog not found'], 404);
        }

        $blog->delete();

        return response()->json(['message' => 'Blog deleted']);
    }

    public function history()
    {
        // Return audit trail for blog changes (simplified version)
        return response()->json(Blog::withTrashed()->with('author')->latest()->get());
    }
}