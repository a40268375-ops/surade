<?php

// FIX: File ini secara fisik ada di app/Http/Controllers/ (bukan Controllers/Admin/),
// dan routes/api.php mengimpornya sebagai App\Http\Controllers\EventController.
// Namespace harus cocok dengan lokasi folder aslinya.
namespace App\Http\Controllers;

use App\Models\Event;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Validator;

class EventController extends Controller
{
    public static function clearCache()
    {
        Cache::forget('events_published');
        Cache::forget('home_feed_public');
    }

    public function index(Request $request)
    {
        $user = $request->user('sanctum');

        if ($user && $user->role === 'admin') {
            return response()->json(Event::orderBy('event_date', 'desc')->get());
        }

        $events = Cache::remember('events_published', 600, function () {
            return Event::where('status', 'published')
                ->orderBy('event_date', 'desc')
                ->get();
        });

        return response()->json($events);
    }

    public function show(Request $request, $id)
    {
        $event = Event::find($id);
        if (!$event) {
            return response()->json(['message' => 'Event not found'], 404);
        }

        $user = $request->user('sanctum');
        if ($event->status !== 'published' && (!$user || $user->role !== 'admin')) {
            return response()->json(['message' => 'Event not found'], 404);
        }

        return response()->json($event);
    }

    public function store(Request $request)
    {
        \App\Services\ContentModerationService::validateOrFail($request, 
            ['title', 'description', 'location', 'category'], 
            ['image', 'gallery']
        );

        // PERBAIKAN: sebelumnya endpoint ini menolak (403) semua user yang
        // bukan admin. Tapi tab "Event" di Dashboard sekarang ditampilkan
        // untuk semua role (sama seperti tab "Blog", yang memang sudah bisa
        // dipakai user biasa) - jadi aturan di sini disamakan dengan Blog:
        // cukup harus login (dijamin middleware auth:sanctum di routes/api.php),
        // tidak wajib admin.
        $validator = Validator::make($request->all(), [
            'title' => 'required|string|max:255',
            'description' => 'nullable|string',
            'location' => 'nullable|string|max:255',
            'event_date' => 'nullable|date',
            'category' => 'nullable|string|max:100',
            'status' => 'nullable|string|in:draft,published',
            'latitude' => 'nullable|numeric',
            'longitude' => 'nullable|numeric',
            // 'image' bisa berupa file upload ATAU string (url/path langsung).
            // 'image_url' dipakai frontend sebagai nama field terpisah kalau
            // yang dikirim bukan file, bukan url absolut wajib - makanya
            // aturan validasinya cuma 'string', bukan 'url' (path storage
            // internal seperti "/storage/events/xxx.jpg" bukan url absolut).
            'image' => 'nullable',
            'image_url' => 'nullable|string|max:500',
            'gallery.*' => 'nullable|image|mimes:jpeg,png,jpg,webp|max:5120',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        $data = $request->only(['title', 'description', 'location', 'event_date', 'category', 'status', 'latitude', 'longitude']);
        $data['status'] = $data['status'] ?? 'draft';

        // Gambar utama: file upload menang atas image_url/image string.
        if ($request->hasFile('image')) {
            $data['image'] = '/storage/' . $request->file('image')->store('events', 'public');
        } elseif ($request->filled('image_url')) {
            $data['image'] = $request->input('image_url');
        } elseif ($request->filled('image') && is_string($request->input('image'))) {
            $data['image'] = $request->input('image');
        }

        if ($request->hasFile('gallery')) {
            $galleryPaths = [];
            foreach ($request->file('gallery') as $file) {
                $galleryPaths[] = '/storage/' . $file->store('events/gallery', 'public');
            }
            $data['gallery'] = $galleryPaths;
        }

        $event = Event::create($data);
        self::clearCache();

        return response()->json($event, 201);
    }

    public function update(Request $request, $id)
    {
        \App\Services\ContentModerationService::validateOrFail($request, 
            ['title', 'description', 'location', 'category'], 
            ['image', 'gallery']
        );

        $event = Event::find($id);
        if (!$event) {
            return response()->json(['message' => 'Event not found'], 404);
        }

        $validator = Validator::make($request->all(), [
            'title' => 'sometimes|required|string|max:255',
            'description' => 'nullable|string',
            'location' => 'nullable|string|max:255',
            'event_date' => 'nullable|date',
            'category' => 'nullable|string|max:100',
            'status' => 'nullable|string|in:draft,published',
            'latitude' => 'nullable|numeric',
            'longitude' => 'nullable|numeric',
            'image' => 'nullable',
            'image_url' => 'nullable|string|max:500',
            'gallery.*' => 'nullable|image|mimes:jpeg,png,jpg,webp|max:5120',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        $data = $request->only(['title', 'description', 'location', 'event_date', 'category', 'status', 'latitude', 'longitude']);

        if ($request->hasFile('image')) {
            $data['image'] = '/storage/' . $request->file('image')->store('events', 'public');
        } elseif ($request->filled('image_url')) {
            $data['image'] = $request->input('image_url');
        } elseif ($request->filled('image') && is_string($request->input('image'))) {
            $data['image'] = $request->input('image');
        }

        if ($request->hasFile('gallery')) {
            $galleryPaths = [];
            foreach ($request->file('gallery') as $file) {
                $galleryPaths[] = '/storage/' . $file->store('events/gallery', 'public');
            }
            $data['gallery'] = $galleryPaths;
        }

        $event->update($data);
        self::clearCache();

        return response()->json($event->fresh());
    }

    public function destroy(Request $request, $id)
    {
        $event = Event::find($id);
        if (!$event) {
            return response()->json(['message' => 'Event not found'], 404);
        }

        $event->delete();
        self::clearCache();

        return response()->json(['message' => 'Event deleted successfully']);
    }
}