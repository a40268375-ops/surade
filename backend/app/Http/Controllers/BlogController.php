<?php

namespace App\Http\Controllers;

use App\Models\Blog;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;

class BlogController extends Controller
{
    public function index(Request $request)
    {
        // Endpoint ini dipakai untuk 2 tujuan: halaman publik Blog (GET
        // /blogs, tanpa login) dan halaman Admin Blog Management (GET
        // /admin/blogs, wajib login sebagai admin). Supaya draft tidak
        // bocor ke pengunjung biasa, request yang bukan admin (guest atau
        // user biasa) hanya diberi blog berstatus "published". Pakai guard
        // 'sanctum' secara eksplisit karena route publik /blogs tidak
        // dibungkus middleware auth:sanctum, jadi $request->user() default
        // tidak akan mendeteksi token Bearer yang tetap dikirim frontend.
        $user = $request->user('sanctum');
        $query = Blog::with('author')->latest();

        if (!$user || $user->role !== 'admin') {
            $query->where('status', 'published');
        }

        return response()->json($query->get());
    }

    // Dipakai halaman detail blog publik (BlogDetail.jsx).
    public function show(Request $request, $id)
    {
        $blog = Blog::with('author')->find($id);
        if (!$blog) {
            return response()->json(['message' => 'Blog tidak ditemukan'], 404);
        }

        $user = $request->user('sanctum');
        if ($blog->status !== 'published' && (!$user || $user->role !== 'admin')) {
            // Blog masih draft dan yang minta bukan admin - perlakukan
            // seolah tidak ada, jangan bocorkan konten draft.
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
            // 'image' bisa berupa file upload ATAU url/path langsung (dikirim
            // frontend sebagai 'image' kalau File, atau 'image_url' kalau
            // string). PENTING: sebelumnya kode ini malah cek field
            // 'thumbnail' yang TIDAK PERNAH dikirim frontend manapun, jadi
            // upload foto blog nggak pernah kesimpan dengan benar.
            'image' => 'nullable',
            'image_url' => 'nullable|string|max:500',
            'banners.*' => 'nullable|image|mimes:jpeg,png,jpg,webp|max:5120',
            'gallery.*' => 'nullable|image|mimes:jpeg,png,jpg,webp|max:5120',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        $imagePath = null;
        if ($request->hasFile('image')) {
            $imagePath = '/storage/' . $request->file('image')->store('blogs/thumbnails', 'public');
        } elseif ($request->filled('image_url')) {
            $imagePath = $request->input('image_url');
        } elseif ($request->filled('image') && is_string($request->input('image'))) {
            $imagePath = $request->input('image');
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
            // Sama seperti store(): 'image' boleh file upload ATAU string.
            // Sebelumnya divalidasi 'nullable|url' yang menolak path
            // storage internal (mis. "/storage/blogs/xxx.jpg") karena itu
            // bukan url absolut, jadi ganti foto blog yang sudah ada selalu
            // gagal validasi.
            'image' => 'nullable',
            'image_url' => 'nullable|string|max:500',
            'banners.*' => 'nullable|image|mimes:jpeg,png,jpg,webp|max:5120',
            'gallery.*' => 'nullable|image|mimes:jpeg,png,jpg,webp|max:5120',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        $data = $request->only(['title', 'content', 'excerpt', 'category', 'status']);

        if ($request->hasFile('image')) {
            $data['image'] = '/storage/' . $request->file('image')->store('blogs/thumbnails', 'public');
        } elseif ($request->filled('image_url')) {
            $data['image'] = $request->input('image_url');
        } elseif ($request->filled('image') && is_string($request->input('image'))) {
            $data['image'] = $request->input('image');
        }

        if ($request->hasFile('banners')) {
            $bannerPaths = [];
            foreach ($request->file('banners') as $file) {
                $bannerPaths[] = '/storage/' . $file->store('blogs/banners', 'public');
            }
            $data['banners'] = $bannerPaths;
        }

        if ($request->hasFile('gallery')) {
            $galleryPaths = [];
            foreach ($request->file('gallery') as $file) {
                $galleryPaths[] = '/storage/' . $file->store('blogs/gallery', 'public');
            }
            $data['gallery'] = $galleryPaths;
        }

        $blog->update($data);

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