<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Report;
use App\Models\Notification;
use Illuminate\Http\Request;

class ReportController extends Controller
{
    /**
     * Get all reports (for admin)
     */
    public function index(Request $request)
    {
        $query = Report::with(['user', 'business', 'blog']);

        // Filter by status
        if ($request->has('status') && $request->status !== 'all') {
            $query->where('status', $request->status);
        }

        // Filter by type
        if ($request->has('type')) {
            if ($request->type === 'business') {
                $query->whereNotNull('business_id');
            } elseif ($request->type === 'blog') {
                $query->whereNotNull('blog_id');
            }
        }

        // Search
        if ($request->has('search')) {
            $search = $request->search;
            $query->where(function($q) use ($search) {
                $q->where('reason', 'like', "%{$search}%")
                  ->orWhere('description', 'like', "%{$search}%");
            });
        }

        $reports = $query->latest()->get();

        // Transform data untuk frontend
        $formattedReports = $reports->map(function($report) {
            $reportableType = $report->business_id ? 'business' : ($report->blog_id ? 'blog' : 'event');
            $content = $report->business_id ? $report->business : $report->blog;
            
            return [
                'id' => $report->id,
                'reportable_type' => $reportableType,
                'reporter_name' => $report->user->name ?? 'Unknown',
                'reporter_email' => $report->user->email ?? '',
                'content_name' => $content->name ?? $content->title ?? 'Konten Dihapus',
                'content_owner' => $content->user->name ?? 'Unknown',
                'content_image' => $content->logo ?? $content->banner ?? $content->thumbnail ?? null,
                'reason' => $report->reason,
                'description' => $report->description,
                'status' => $this->mapStatus($report->status),
                'admin_notes' => $report->admin_notes,
                'created_at' => $report->created_at,
                'resolved_at' => $report->resolved_at,
            ];
        });

        // Hitung stats
        $stats = [
            'total' => $reports->count(),
            'baru' => $reports->where('status', 'pending')->count(),
            'diproses' => $reports->where('status', 'investigating')->count(),
            'selesai' => $reports->where('status', 'resolved')->count(),
            'ditolak' => $reports->where('status', 'dismissed')->count(),
            'businessCount' => $reports->where('business_id', '!=', null)->count(),
            'blogCount' => $reports->where('blog_id', '!=', null)->count(),
            'eventCount' => 0, // Placeholder untuk event
        ];

        return response()->json([
            'reports' => $formattedReports,
            'stats' => $stats
        ]);
    }

    /**
     * Map status dari backend ke frontend
     */
    private function mapStatus($status)
    {
        $map = [
            'pending' => 'baru',
            'investigating' => 'diproses',
            'resolved' => 'selesai',
            'dismissed' => 'ditolak'
        ];
        
        return $map[$status] ?? $status;
    }

    /**
     * Get single report
     */
    public function show($id)
    {
        $report = Report::with(['user', 'business', 'blog'])->findOrFail($id);
        return response()->json($report);
    }

    /**
     * Submit a new report
     */
    public function store(Request $request)
    {
        $businessId = $request->input('business_id');
        $blogId = $request->input('blog_id');

        if (!$businessId && $request->input('reportable_type') === 'business') {
            $businessId = $request->input('reportable_id');
        }
        if (!$blogId && $request->input('reportable_type') === 'blog') {
            $blogId = $request->input('reportable_id');
        }

        $request->merge([
            'business_id' => $businessId,
            'blog_id' => $blogId,
        ]);

        $validated = $request->validate([
            'business_id' => 'nullable|exists:businesses,id',
            'blog_id' => 'nullable|exists:blogs,id',
            'reason' => 'required|string|max:255',
            'description' => 'required|string|max:1000',
        ]);

        // At least one of business_id or blog_id must be provided
        if (empty($validated['business_id']) && empty($validated['blog_id'])) {
            return response()->json([
                'message' => 'Target laporan (Bisnis atau Blog) wajib dipilih.'
            ], 422);
        }

        $user = $request->user() ?? auth('sanctum')->user() ?? auth()->user();
        $validated['user_id'] = $user ? $user->id : (\App\Models\User::first()?->id ?? 1);
        $validated['status'] = 'pending';

        $report = Report::create($validated);

        // Kabari admin: ada laporan baru masuk.
        try {
            Notification::firstOrCreate(
                [
                    'source_type' => 'report',
                    'source_id' => $report->id,
                    'type' => 'report_pending',
                ],
                [
                    'title' => 'Laporan baru masuk',
                    'description' => 'Alasan: ' . $report->reason,
                    'is_read' => false,
                ]
            );
        } catch (\Throwable $e) {
            \Log::warning('Failed to create report notification: ' . $e->getMessage());
        }

        return response()->json([
            'message' => 'Laporan berhasil dikirim. Tim kami akan meninjau laporan Anda.',
            'report' => $report->load(['user', 'business', 'blog'])
        ], 201);
    }

    /**
     * Update report status (admin only)
     */
    public function updateStatus(Request $request, $id)
    {
        // Log request untuk debugging
        \Log::info('ReportController updateStatus called', [
            'id' => $id,
            'all_input' => $request->all(),
            'status' => $request->input('status'),
            'admin_notes' => $request->input('admin_notes')
        ]);

        $validated = $request->validate([
            'status' => 'required|string',
            'admin_notes' => 'nullable|string|max:1000',
        ]);

        $report = Report::findOrFail($id);
        
        // Map status dari frontend ke backend
        $statusMap = [
            'baru' => 'pending',
            'diproses' => 'investigating',
            'selesai' => 'resolved',
            'ditolak' => 'dismissed',
            // Also accept backend status directly
            'pending' => 'pending',
            'investigating' => 'investigating',
            'resolved' => 'resolved',
            'dismissed' => 'dismissed'
        ];

        $backendStatus = $statusMap[$validated['status']] ?? $validated['status'];
        
        \Log::info('Status mapping', [
            'input_status' => $validated['status'],
            'mapped_status' => $backendStatus
        ]);
        
        // Validate final status
        if (!in_array($backendStatus, ['pending', 'investigating', 'resolved', 'dismissed'])) {
            \Log::error('Invalid status', [
                'backend_status' => $backendStatus,
                'valid_statuses' => ['pending', 'investigating', 'resolved', 'dismissed']
            ]);
            return response()->json([
                'message' => 'Status tidak valid: ' . $backendStatus
            ], 422);
        }

        $report->status = $backendStatus;
        if (isset($validated['admin_notes'])) {
            $report->admin_notes = $validated['admin_notes'];
        }

        if ($backendStatus === 'resolved' || $backendStatus === 'dismissed') {
            $report->resolved_at = now();
        }

        $report->save();

        // Kalau laporan sudah tidak "pending" lagi, tandai notifikasinya dibaca
        if ($backendStatus !== 'pending') {
            Notification::where('source_type', 'report')
                ->where('source_id', $report->id)
                ->where('type', 'report_pending')
                ->update(['is_read' => true]);
        }

        \Log::info('Report status updated successfully', [
            'report_id' => $report->id,
            'new_status' => $report->status
        ]);

        return response()->json([
            'message' => 'Status laporan berhasil diupdate',
            'report' => $report->load(['user', 'business', 'blog'])
        ]);
    }

    /**
     * Delete reported content (admin only)
     */
    public function destroyContent($id)
    {
        $report = Report::with(['business', 'blog'])->findOrFail($id);

        // Delete the reported content if still exists
        $message = 'Konten berhasil dihapus.';
        if ($report->business_id && $report->business) {
            $report->business->delete();
            $message = 'Bisnis yang dilaporkan berhasil dihapus dari sistem.';
        } elseif ($report->blog_id && $report->blog) {
            $report->blog->delete();
            $message = 'Blog/Artikel yang dilaporkan berhasil dihapus dari sistem.';
        } else {
            $message = 'Konten sudah tidak ditemukan atau telah dihapus sebelumnya. Status laporan ditandai selesai.';
        }

        // Update report status
        $report->status = 'resolved';
        $report->admin_notes = 'Konten telah dihapus/dibersihkan oleh admin.';
        $report->resolved_at = now();
        $report->save();

        return response()->json([
            'success' => true,
            'message' => $message,
            'report' => $report->load(['user', 'business', 'blog'])
        ]);
    }
}
