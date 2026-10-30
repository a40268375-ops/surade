<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Http;

class GeocodeController extends Controller
{
    // Proxy pencarian lokasi (dipakai form "Buat Event Baru" di Dashboard)
    // lewat backend, bukan langsung dari browser ke Nominatim.
    //
    // Alasannya:
    // - Nominatim (OpenStreetMap) mewajibkan header User-Agent yang jelas
    //   dan membatasi 1 request/detik per klien. Browser tidak bisa
    //   mengatur User-Agent dengan bebas, jadi sering ditolak (CORS
    //   error/429 Too Many Requests) walau sudah di-debounce di frontend.
    // - Dari server, kita bisa kirim User-Agent yang benar dan simpan hasil
    //   pencarian yang sama di cache, supaya kata kunci yang sudah pernah
    //   dicari tidak perlu tembak ulang ke Nominatim.
    public function search(Request $request)
    {
        $query = trim((string) $request->query('q', ''));

        if (mb_strlen($query) < 2) {
            return response()->json([]);
        }

        $cacheKey = 'geocode:' . md5(mb_strtolower($query));

        $results = Cache::remember($cacheKey, now()->addDays(7), function () use ($query) {
            try {
                $response = Http::withHeaders([
                    // Wajib diisi sesuai kebijakan penggunaan Nominatim -
                    // request tanpa User-Agent yang jelas sering ditolak.
                    'User-Agent' => 'Surade.com/1.0 (contact: support@surade.com)',
                ])
                    ->timeout(6)
                    ->get('https://nominatim.openstreetmap.org/search', [
                        'format' => 'json',
                        'q' => $query,
                        'limit' => 1,
                        'countrycodes' => 'id',
                    ]);

                if (!$response->successful()) {
                    return [];
                }

                return $response->json() ?? [];
            } catch (\Throwable $e) {
                // Nominatim lagi bermasalah / timeout - jangan sampai bikin
                // form event ikut error, cukup kembalikan hasil kosong.
                return [];
            }
        });

        return response()->json($results);
    }
}