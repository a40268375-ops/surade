<?php

namespace App\Http\Controllers;

use App\Models\Business;
use App\Models\PageView;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;

class AnalyticsController extends Controller
{
    // Publik, dipanggil dari frontend setiap kali halaman dibuka (Home.jsx,
    // BusinessDetail.jsx dsb). business_id diisi kalau yang dibuka adalah
    // halaman detail sebuah bisnis, dikosongkan untuk kunjungan umum.
    public function track(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'business_id' => 'nullable|exists:businesses,id',
            'path' => 'nullable|string|max:255',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        PageView::create([
            'business_id' => $request->business_id,
            'path' => $request->path,
            'created_at' => Carbon::now(),
        ]);

        return response()->json(['message' => 'ok'], 201);
    }

    // Tren kunjungan 7 hari terakhir (termasuk hari ini). Lebih masuk akal
    // untuk data yang baru mulai dicatat dibanding "minggu ini vs minggu lalu"
    // (yang selalu 0% dulu di awal karena belum ada histori 2 minggu).
    public function weekly(Request $request)
    {
        $dayLabels = ['Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab', 'Min'];

        // Kalau migration 'page_views' belum pernah dijalankan di server ini,
        // jangan sampai query di bawah gagal (500) - itu yang bikin frontend
        // nampilin teks "Gagal memuat data grafik" seolah ada bug. Kasih tahu
        // dengan jelas & jujur lewat flag "migrated", biar frontend bisa
        // tampilkan pesan yang benar (bukan error) sambil grafik tetap
        // tampil normal dengan angka nol.
        if (!\Illuminate\Support\Facades\Schema::hasTable('page_views')) {
            return response()->json([
                'labels' => $dayLabels,
                'values' => array_fill(0, 7, 0),
                'total' => 0,
                'all_time_total' => 0,
                'migrated' => false,
            ]);
        }

        $user = $request->user();

        try {
            $query = PageView::query();

            if ($user->role !== 'admin') {
                $businessIds = Business::where('user_id', $user->id)->pluck('id');
                $query->whereIn('business_id', $businessIds);
            }

            // Total sepanjang waktu (bukan cuma 7 hari terakhir), dipakai untuk
            // kartu ringkasan "Pengguna yang Melihat" di overview dashboard.
            $allTimeTotal = (clone $query)->count();

            // 7 hari terakhir, dari 6 hari lalu sampai hari ini.
            $days = collect(range(6, 0))->map(fn ($i) => Carbon::now()->subDays($i)->startOfDay());

            $start = $days->first();
            $end = Carbon::now()->endOfDay();

            $views = (clone $query)->whereBetween('created_at', [$start, $end])->get();

            $values = $days->map(function ($day) use ($views) {
                return $views->filter(fn ($v) => $v->created_at->isSameDay($day))->count();
            })->values();

            $labels = $days->map(fn ($day) => $dayLabels[$day->dayOfWeekIso - 1])->values();

            return response()->json([
                'labels' => $labels,
                'values' => $values,
                'total' => $views->count(),
                'all_time_total' => $allTimeTotal,
                'migrated' => true,
            ]);
        } catch (\Throwable $e) {
            // Jangan biarkan error apa pun bikin endpoint ini 500 mentah-mentah
            // (itu yang bikin dashboard cuma nampilin "Gagal memuat" tanpa
            // penjelasan). Catat ke log Laravel, dan kalau APP_DEBUG=true di
            // .env, kirim juga pesan errornya supaya langsung kelihatan
            // penyebab aslinya di dashboard - tanpa perlu buka file log manual.
            \Illuminate\Support\Facades\Log::error('AnalyticsController@weekly gagal: ' . $e->getMessage());

            return response()->json([
                'labels' => $dayLabels,
                'values' => array_fill(0, 7, 0),
                'total' => 0,
                'all_time_total' => 0,
                'migrated' => true,
                'server_error' => config('app.debug')
                    ? $e->getMessage() . ' (' . class_basename($e) . ' di ' . basename($e->getFile()) . ':' . $e->getLine() . ')'
                    : 'Terjadi kesalahan di server. Cek storage/logs/laravel.log untuk detail.',
            ]);
        }
    }

    // Endpoint khusus untuk user dashboard - mengembalikan data analytics
    // dengan format yang sesuai untuk frontend user dashboard
    public function myBusinessViews(Request $request)
    {
        $dayLabels = ['Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab', 'Min'];

        if (!\Illuminate\Support\Facades\Schema::hasTable('page_views')) {
            return response()->json([
                'labels' => $dayLabels,
                'page_views' => array_fill(0, 7, 0),
                'total_views' => 0,
                'migrated' => false,
            ]);
        }

        $user = $request->user();

        try {
            $businessIds = Business::where('user_id', $user->id)->pluck('id');
            
            if ($businessIds->isEmpty()) {
                return response()->json([
                    'labels' => $dayLabels,
                    'page_views' => array_fill(0, 7, 0),
                    'total_views' => 0,
                    'migrated' => true,
                ]);
            }

            $query = PageView::whereIn('business_id', $businessIds);

            // Total sepanjang waktu untuk user's businesses
            $totalViews = (clone $query)->count();

            // 7 hari terakhir
            $days = collect(range(6, 0))->map(fn ($i) => Carbon::now()->subDays($i)->startOfDay());
            $start = $days->first();
            $end = Carbon::now()->endOfDay();

            $views = (clone $query)->whereBetween('created_at', [$start, $end])->get();

            $pageViews = $days->map(function ($day) use ($views) {
                return $views->filter(fn ($v) => $v->created_at->isSameDay($day))->count();
            })->values();

            $labels = $days->map(fn ($day) => $dayLabels[$day->dayOfWeekIso - 1])->values();

            return response()->json([
                'labels' => $labels,
                'page_views' => $pageViews,
                'total_views' => $totalViews,
                'migrated' => true,
            ]);
        } catch (\Throwable $e) {
            \Illuminate\Support\Facades\Log::error('AnalyticsController@myBusinessViews gagal: ' . $e->getMessage());

            return response()->json([
                'labels' => $dayLabels,
                'page_views' => array_fill(0, 7, 0),
                'total_views' => 0,
                'migrated' => true,
                'server_error' => config('app.debug')
                    ? $e->getMessage() . ' (' . class_basename($e) . ':' . $e->getLine() . ')'
                    : 'Terjadi kesalahan di server.',
            ]);
        }
    }

    // Grafik pendaftaran user 7 hari terakhir
    public function userRegistrations(Request $request)
    {
        $dayLabels = ['Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab', 'Min'];

        if ($request->user()->role !== 'admin') {
            return response()->json(['labels' => $dayLabels, 'values' => array_fill(0, 7, 0)], 403);
        }

        try {
            $days = collect(range(6, 0))->map(fn ($i) => Carbon::now()->subDays($i)->startOfDay());
            $start = $days->first();
            $end = Carbon::now()->endOfDay();

            $users = \App\Models\User::whereBetween('created_at', [$start, $end])->get();

            $values = $days->map(function ($day) use ($users) {
                return $users->filter(fn ($u) => $u->created_at->isSameDay($day))->count();
            })->values();

            $labels = $days->map(fn ($day) => $dayLabels[$day->dayOfWeekIso - 1])->values();

            return response()->json([
                'labels' => $labels,
                'values' => $values,
            ]);
        } catch (\Throwable $e) {
            \Illuminate\Support\Facades\Log::error('AnalyticsController@userRegistrations gagal: ' . $e->getMessage());
            return response()->json([
                'labels' => $dayLabels,
                'values' => array_fill(0, 7, 0),
                'server_error' => config('app.debug') ? $e->getMessage() : 'Server error',
            ]);
        }
    }

    // Grafik pendaftaran bisnis 7 hari terakhir
    public function businessRegistrations(Request $request)
    {
        $dayLabels = ['Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab', 'Min'];

        if ($request->user()->role !== 'admin') {
            return response()->json(['labels' => $dayLabels, 'values' => array_fill(0, 7, 0)], 403);
        }

        try {
            $days = collect(range(6, 0))->map(fn ($i) => Carbon::now()->subDays($i)->startOfDay());
            $start = $days->first();
            $end = Carbon::now()->endOfDay();

            $businesses = Business::whereBetween('created_at', [$start, $end])->get();

            $values = $days->map(function ($day) use ($businesses) {
                return $businesses->filter(fn ($b) => $b->created_at->isSameDay($day))->count();
            })->values();

            $labels = $days->map(fn ($day) => $dayLabels[$day->dayOfWeekIso - 1])->values();

            return response()->json([
                'labels' => $labels,
                'values' => $values,
            ]);
        } catch (\Throwable $e) {
            \Illuminate\Support\Facades\Log::error('AnalyticsController@businessRegistrations gagal: ' . $e->getMessage());
            return response()->json([
                'labels' => $dayLabels,
                'values' => array_fill(0, 7, 0),
                'server_error' => config('app.debug') ? $e->getMessage() : 'Server error',
            ]);
        }
    }
}