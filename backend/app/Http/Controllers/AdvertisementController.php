<?php

// FIX: File ini secara fisik ada di app/Http/Controllers/ (bukan Controllers/Admin/),
// dan routes/api.php mengimpornya sebagai App\Http\Controllers\AdvertisementController.
// Namespace harus cocok dengan lokasi folder aslinya.
namespace App\Http\Controllers;

use App\Models\Advertisement;
use App\Http\Requests\AdvertisementStoreRequest;
use App\Http\Helpers\SecurityHelper;
use App\Services\PremiumFeatureService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Validator;

class AdvertisementController extends Controller
{
    protected $premiumService;

    public function __construct(PremiumFeatureService $premiumService)
    {
        $this->premiumService = $premiumService;
    }

    public static function clearCache()
    {
        Cache::forget('advertisements_public');
        Cache::forget('home_feed_public');
    }

    public function index(Request $request)
    {
        if ($request->has('status') && $request->user() && $request->user()->role === 'admin') {
            $ads = Advertisement::with('category', 'user')->where('status', $request->status)->latest()->get();
            return response()->json($ads);
        } elseif ($request->has('status') && $request->user()) {
            $ads = Advertisement::with('category', 'user')
                ->where('status', $request->status)
                ->where('user_id', $request->user()->id)
                ->latest()
                ->get();
            return response()->json($ads);
        }

        // Public listing: cached and N+1 query fixed via SQL join
        $ads = Cache::remember('advertisements_public', 300, function () {
            return Advertisement::with([
                'category:id,name,slug,icon,color',
                'user:id,name,avatar'
            ])
            ->where('status', 'approved')
            ->where(function ($q) {
                $q->whereNull('expires_at')->orWhere('expires_at', '>', now());
            })
            ->whereHas('user.businesses', function ($q) {
                $q->where('is_premium', true)
                  ->where(function ($sq) {
                      $sq->whereNull('premium_expires_at')
                         ->orWhere('premium_expires_at', '>', now());
                  });
            })
            ->latest()
            ->get();
        });

        return response()->json($ads);
    }

    public function store(AdvertisementStoreRequest $request)
    {
        \App\Services\ContentModerationService::validateOrFail($request, 
            ['title', 'description', 'company_name', 'location', 'phone', 'website'], 
            ['image', 'payment_proof']
        );

        // Check premium permission using service
        $canCreateAd = $this->premiumService->canPerformAction($request->user(), 'create_advertisement');
        if (!$canCreateAd['allowed']) {
            return response()->json([
                'message' => 'Posting iklan hanya tersedia untuk pengguna Premium. Upgrade sekarang untuk mulai beriklan!',
                'error' => 'PREMIUM_REQUIRED',
                'feature' => 'create_advertisement',
                'upgrade_url' => '/dashboard?tab=premium',
                'benefits' => [
                    'Jangkauan lebih luas dengan iklan berbayar',
                    'Targeting audience yang tepat',
                    'Analytics performa iklan',
                    'Prioritas tampil di hasil pencarian'
                ]
            ], 403);
        }

        $data = $request->except(['image']);
        $data['user_id'] = $request->user()->id;
        $data['status'] = 'pending';

        if ($request->hasFile('image')) {
            $path = $request->file('image')->store('advertisements', 'public');
            $data['image'] = '/storage/' . $path;
        }

        $advertisement = Advertisement::create($data);
        self::clearCache();

        // Log security event
        SecurityHelper::logSecurityEvent('advertisement_created', [
            'advertisement_id' => $advertisement->id,
            'user_id' => $request->user()->id,
            'title' => $advertisement->title,
            'ip' => $request->ip()
        ]);

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

    // Admin menyetujui iklan yang masih pending, supaya tayang ke publik.
    public function verify(Request $request, $id)
    {
        if ($request->user()->role !== 'admin') {
            return response()->json(['message' => 'Forbidden'], 403);
        }

        $advertisement = Advertisement::find($id);

        if (!$advertisement) {
            return response()->json(['message' => 'Advertisement not found'], 404);
        }

        // PERBAIKAN: sebelumnya status di-set ke 'verified' - nilai ini
        // BUKAN salah satu pilihan enum kolom `status` di database (yang
        // hanya mengizinkan pending/approved/rejected), dan method
        // index() di atas mem-filter tampilan publik dengan
        // `where('status', 'approved')`. Akibatnya iklan yang "disetujui"
        // justru gagal disimpan (melanggar enum) ATAU tetap tidak akan
        // PERNAH muncul di beranda - persis keluhan "iklan yang di
        // website itu bukan iklan kita". Sekarang disamakan jadi
        // 'approved' supaya konsisten dari ujung ke ujung.
        $advertisement->status = 'approved';
        $advertisement->expires_at = now()->addDays($advertisement->duration_days ?? 30); // Masa tayang sesuai paket sejak disetujui
        $advertisement->save();
        self::clearCache();

        return response()->json($advertisement->load('category'));
    }

    // Admin menolak iklan yang masih pending.
    public function reject(Request $request, $id)
    {
        if ($request->user()->role !== 'admin') {
            return response()->json(['message' => 'Forbidden'], 403);
        }

        $advertisement = Advertisement::find($id);

        if (!$advertisement) {
            return response()->json(['message' => 'Advertisement not found'], 404);
        }

        $mode = $request->input('mode', 'reject');
        $reason = $request->input('rejection_reason') ?? $request->input('notes') ?? $request->input('reason');

        if ($mode === 'revision') {
            $advertisement->status = 'needs_revision';
        } else {
            $advertisement->status = 'rejected';
        }

        if ($reason) {
            // Save rejection_reason if column exists
            try {
                $advertisement->rejection_reason = $reason;
            } catch (\Exception $e) {
                // Column may not exist yet, skip silently
            }
        }

        $advertisement->save();
        self::clearCache();

        return response()->json($advertisement->load('category'));
    }

    public function update(Request $request, $id)
    {
        \App\Services\ContentModerationService::validateOrFail($request, 
            ['title', 'description', 'company_name', 'location', 'phone', 'website'], 
            ['image', 'payment_proof']
        );

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
            'image' => 'nullable|image|mimes:jpeg,png,jpg,gif,webp|max:5120',
            // PERBAIKAN: sebelumnya `in:pending,verified,rejected` - nilai
            // 'verified' tidak pernah valid (lihat penjelasan di verify()
            // di atas) dan 'approved' (nilai yang SEHARUSNYA dipakai)
            // malah tidak diizinkan sama sekali oleh validator ini.
            'status' => 'nullable|string|in:pending,approved,rejected,needs_revision,active,expired,cancelled',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        $data = $request->except(['image']);

        if ($request->user()->role !== 'admin') {
            unset($data['status']);
        }

        if ($request->hasFile('image')) {
            // Hapus foto lama supaya file di server tidak menumpuk.
            if ($advertisement->image) {
                $oldPath = str_replace('/storage/', '', $advertisement->image);
                Storage::disk('public')->delete($oldPath);
            }
            $path = $request->file('image')->store('advertisements', 'public');
            $data['image'] = '/storage/' . $path;
        }

        $advertisement->update($data);
        self::clearCache();

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

        // Store info for logging before deletion
        $advertisementInfo = [
            'id' => $advertisement->id,
            'title' => $advertisement->title,
            'user_id' => $advertisement->user_id
        ];

        if ($advertisement->image) {
            Storage::disk('public')->delete(str_replace('/storage/', '', $advertisement->image));
        }

        $advertisement->delete();
        self::clearCache();

        // Log security event
        SecurityHelper::logSecurityEvent('advertisement_deleted', [
            'advertisement_id' => $advertisementInfo['id'],
            'user_id' => $request->user()->id,
            'title' => $advertisementInfo['title'],
            'original_owner_id' => $advertisementInfo['user_id'],
            'ip' => $request->ip()
        ]);

        return response()->json(['message' => 'Advertisement deleted successfully']);
    }
}