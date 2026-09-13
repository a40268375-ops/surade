<?php

// FIX: File ini secara fisik ada di app/Http/Controllers/ (bukan Controllers/Admin/),
// dan routes/api.php mengimpornya sebagai App\Http\Controllers\CategoryController
// (untuk endpoint publik /categories). Namespace harus cocok dengan lokasi folder
// aslinya, kalau tidak akan bentrok dengan controller lain yang benar-benar
// berada di folder Admin/ dan memakai nama class yang sama - itu penyebab
// "Cannot declare class ... because the name is already in use".
namespace App\Http\Controllers;

use App\Models\Category;
use Illuminate\Http\Request;
use Illuminate\Support\Str;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Validator;

class CategoryController extends Controller
{
    public static function clearCache()
    {
        Cache::forget('categories_all');
        Cache::forget('categories_tree');
        Cache::forget('home_feed_public');
    }

    public function index()
    {
        $categories = Cache::remember('categories_all', 3600, function () {
            return Category::withCount('businesses')->orderBy('name')->get();
        });
        return response()->json($categories);
    }

    /** Kategori hierarkis (induk + anak) untuk navbar & form daftar bisnis. */
    public function tree()
    {
        $parents = Cache::remember('categories_tree', 3600, function () {
            return Category::with(['children' => fn ($q) => $q->withCount('businesses')])
                ->withCount('businesses')
                ->whereNull('parent_id')
                ->orderBy('name')
                ->get();
        });

        return response()->json($parents);
    }

    public function store(Request $request)
    {
        if ($request->user()->role !== 'admin') {
            return response()->json(['message' => 'Forbidden'], 403);
        }

        $validator = Validator::make($request->all(), [
            'name' => 'required|string|max:255|unique:categories',
            'icon' => 'nullable|string|max:255',
            'description' => 'nullable|string',
            'color' => 'nullable|string|max:50',
            'status' => 'nullable|string|max:20',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        $category = Category::create([
            'name' => $request->name,
            'slug' => Str::slug($request->name),
            'icon' => $request->icon,
            'description' => $request->description,
            'color' => $request->color ?? '#10b981',
            'status' => $request->status ?? 'active',
        ]);

        self::clearCache();

        return response()->json($category, 201);
    }

    public function update(Request $request, $id)
    {
        if ($request->user()->role !== 'admin') {
            return response()->json(['message' => 'Forbidden'], 403);
        }

        $category = Category::find($id);
        if (!$category) {
            return response()->json(['message' => 'Category not found'], 404);
        }

        $validator = Validator::make($request->all(), [
            'name' => 'required|string|max:255|unique:categories,name,' . $id,
            'icon' => 'nullable|string|max:255',
            'description' => 'nullable|string',
            'color' => 'nullable|string|max:50',
            'status' => 'nullable|string|max:20',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        $category->update([
            'name' => $request->name,
            'slug' => Str::slug($request->name),
            'icon' => $request->icon,
            'description' => $request->description,
            'color' => $request->color ?? $category->color ?? '#10b981',
            'status' => $request->status ?? $category->status ?? 'active',
        ]);

        self::clearCache();

        return response()->json($category);
    }

    public function destroy(Request $request, $id)
    {
        if ($request->user()->role !== 'admin') {
            return response()->json(['message' => 'Forbidden'], 403);
        }

        $category = Category::find($id);
        if (!$category) {
            return response()->json(['message' => 'Category not found'], 404);
        }

        $category->delete();
        self::clearCache();

        return response()->json(['message' => 'Category deleted successfully']);
    }
}