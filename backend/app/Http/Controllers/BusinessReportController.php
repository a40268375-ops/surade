<?php

namespace App\Http\Controllers;

use App\Models\Business;
use App\Models\BusinessReport;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;

class BusinessReportController extends Controller
{
    /**
     * Auth required: pelanggan mengirim laporan pelanggaran/kesalahan
     * pada sebuah bisnis dari halaman detail bisnis (tombol "Laporkan").
     */
    public function store(Request $request, $businessId)
    {
        $business = Business::find($businessId);
        if (!$business) {
            return response()->json(['message' => 'Bisnis tidak ditemukan'], 404);
        }

        $validator = Validator::make($request->all(), [
            'reason' => 'required|string|max:255',
            'description' => 'nullable|string|max:2000',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        $report = BusinessReport::create([
            'business_id' => $business->id,
            'reporter_id' => $request->user()->id,
            'reporter_name' => $request->user()->name,
            'reason' => $request->reason,
            'description' => $request->description,
            'status' => 'baru',
        ]);

        return response()->json([
            'message' => 'Laporan berhasil dikirim. Tim kami akan meninjaunya secepatnya.',
            'report' => $report,
        ], 201);
    }

    /**
     * Admin: daftar semua laporan bisnis, buat halaman
     * Dashboard > Laporan Report.
     */
    public function adminIndex(Request $request)
    {
        $query = BusinessReport::with(['business:id,title,image,user_id', 'reporter:id,name'])->latest();

        if ($request->filled('status') && $request->status !== 'all') {
            $query->where('status', $request->status);
        }

        if ($request->filled('search')) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('reporter_name', 'like', "%{$search}%")
                  ->orWhere('reason', 'like', "%{$search}%")
                  ->orWhereHas('business', function ($bq) use ($search) {
                      $bq->where('title', 'like', "%{$search}%");
                  });
            });
        }

        return response()->json($query->get());
    }

    /**
     * Admin: ubah status tindak lanjut laporan (mis. "diproses", "selesai",
     * "ditolak") beserta catatan admin (opsional).
     */
    public function adminUpdateStatus(Request $request, $id)
    {
        $report = BusinessReport::find($id);
        if (!$report) {
            return response()->json(['message' => 'Laporan tidak ditemukan'], 404);
        }

        $validator = Validator::make($request->all(), [
            'status' => 'required|in:baru,diproses,selesai,ditolak',
            'admin_note' => 'nullable|string|max:2000',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        $report->update($request->only('status', 'admin_note'));

        return response()->json($report->load('business:id,title,image,user_id'));
    }

    /**
     * Admin: hapus laporan (bukan bisnisnya, cuma catatan laporannya).
     */
    public function adminDestroy($id)
    {
        $report = BusinessReport::find($id);
        if (!$report) {
            return response()->json(['message' => 'Laporan tidak ditemukan'], 404);
        }

        $report->delete();

        return response()->json(['message' => 'Laporan berhasil dihapus']);
    }

    /**
     * Admin: hapus konten bisnis yang dilaporkan (tombol "Hapus Konten"),
     * lalu tandai semua laporan terkait bisnis itu sebagai "selesai".
     */
    public function adminRemoveContent($id)
    {
        $report = BusinessReport::find($id);
        if (!$report) {
            return response()->json(['message' => 'Laporan tidak ditemukan'], 404);
        }

        $business = $report->business;
        if ($business) {
            $business->delete();
        }

        BusinessReport::where('business_id', $report->business_id)
            ->update(['status' => 'selesai']);

        return response()->json(['message' => 'Konten bisnis berhasil dihapus']);
    }
}