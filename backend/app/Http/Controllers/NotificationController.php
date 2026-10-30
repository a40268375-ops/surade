<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Notification;
use Illuminate\Support\Facades\Auth;

class NotificationController extends Controller
{
    /**
     * Get notifications for the authenticated user
     */
    public function index(Request $request)
    {
        $user = Auth::user();
        
        // Clean up old notifications (older than 30 days) to prevent spam
        Notification::where('user_id', $user->id)
            ->where('created_at', '<', now()->subDays(30))
            ->delete();
        
        $notifications = Notification::where('user_id', $user->id)
            ->orderBy('created_at', 'desc')
            ->limit(20) // Limit to recent 20 notifications instead of 50
            ->get();
            
        $unreadCount = Notification::where('user_id', $user->id)
            ->where('is_read', false)
            ->count();
            
        return response()->json([
            'notifications' => $notifications,
            'unread_count' => $unreadCount
        ]);
    }

    /**
     * Mark notification as read
     */
    public function markAsRead($id)
    {
        $user = Auth::user();
        
        $notification = Notification::where('id', $id)
            ->where('user_id', $user->id)
            ->firstOrFail();
            
        $notification->update(['is_read' => true]);
        
        return response()->json(['message' => 'Notification marked as read']);
    }

    /**
     * Mark all notifications as read
     */
    public function markAllAsRead()
    {
        $user = Auth::user();
        
        Notification::where('user_id', $user->id)
            ->where('is_read', false)
            ->update(['is_read' => true]);
            
        return response()->json(['message' => 'All notifications marked as read']);
    }

    /**
     * Delete notification
     */
    public function destroy($id)
    {
        $user = Auth::user();
        
        $notification = Notification::where('id', $id)
            ->where('user_id', $user->id)
            ->firstOrFail();
            
        $notification->delete();
        
        return response()->json(['message' => 'Notification deleted']);
    }

    /**
     * Create notification (for system use)
     */
    public static function createNotification($userId, $type, $title, $message, $data = null)
    {
        // Check if similar notification already exists (prevent spam)
        $existingCount = Notification::where('user_id', $userId)
            ->where('type', $type)
            ->where('title', $title)
            ->where('created_at', '>', now()->subHours(1)) // Within last hour
            ->count();
            
        // If more than 2 similar notifications in the last hour, skip
        if ($existingCount >= 2) {
            return null;
        }
        
        return Notification::create([
            'user_id' => $userId,
            'type' => $type,
            'title' => $title,
            'message' => $message,
            'data' => $data,
            'is_read' => false
        ]);
    }

    /**
     * Create notification for admin when new business is created
     */
    public static function notifyAdminNewBusiness($business)
    {
        // Gunakan method dari model Notification
        \App\Models\Notification::notifyAdminBusinessVerification($business);
    }

    /**
     * Create notification for user when business is approved/rejected
     */
    public static function notifyBusinessStatus($business, $status)
    {
        $statusText = $status === 'approved' ? 'disetujui' : 'ditolak';
        
        self::createNotification(
            $business->user_id,
            'business',
            'Status Bisnis Diperbarui',
            "Bisnis '{$business->title}' telah {$statusText}.",
            ['business_id' => $business->id]
        );
    }

    /**
     * Create notification for admin when new payment ticket is created
     */
    public static function notifyAdminNewPaymentTicket($ticket)
    {
        $admins = \App\Models\User::where('role', 'admin')->get();
        
        foreach ($admins as $admin) {
            self::createNotification(
                $admin->id,
                'payment',
                'Tiket Pembayaran Baru',
                "Tiket pembayaran baru dari {$ticket->user->name} menunggu verifikasi.",
                ['ticket_id' => $ticket->id]
            );
        }
    }

    /**
     * Create notification for user when payment ticket is approved/rejected
     */
    public static function notifyPaymentTicketStatus($ticket, $status)
    {
        $statusText = $status === 'approved' ? 'disetujui' : 'ditolak';
        $icon = $status === 'approved' ? '✅' : '❌';
        
        $message = $status === 'approved' ? 
            "Selamat! Pembayaran premium untuk bisnis '{$ticket->business->title}' telah disetujui. Bisnis Anda sekarang sudah premium." :
            "Pembayaran premium untuk bisnis '{$ticket->business->title}' ditolak. Silakan hubungi admin untuk informasi lebih lanjut.";
        
        self::createNotification(
            $ticket->user_id,
            'payment',
            "{$icon} Pembayaran Premium " . ucfirst($statusText),
            $message,
            [
                'ticket_id' => $ticket->id,
                'business_id' => $ticket->business_id,
                'status' => $status
            ]
        );
    }

    /**
     * Create notification for user when they receive a new message
     */
    public static function notifyNewMessage($message)
    {
        self::createNotification(
            $message->receiver_id,
            'message',
            'Pesan Baru',
            "Anda menerima pesan baru dari {$message->sender->name}.",
            ['message_id' => $message->id]
        );
    }

    /**
     * Create notification for business owner when they receive a new review
     */
    public static function notifyNewReview($review)
    {
        self::createNotification(
            $review->business->user_id,
            'review',
            'Ulasan Baru',
            "Bisnis '{$review->business->title}' mendapat ulasan baru dari {$review->user->name}.",
            ['review_id' => $review->id, 'business_id' => $review->business_id]
        );
    }

    /**
     * Test endpoint to create sample notifications (for development)
     */
    public function createTestNotifications()
    {
        $user = auth()->user();
        
        // Create a few test notifications
        $notifications = [
            [
                'type' => 'business_verification',
                'title' => '🔔 Bisnis Baru Perlu Verifikasi',
                'message' => 'Bisnis "Warung Makan Sederhana" telah didaftarkan oleh John Doe dan menunggu verifikasi Anda.',
                'data' => [
                    'business_id' => 1,
                    'business_title' => 'Warung Makan Sederhana',
                    'user_name' => 'John Doe',
                ],
                'action_url' => '/admin/verification/businesses/1',
                'priority' => 'high'
            ],
            [
                'type' => 'business',
                'title' => 'Bisnis Baru Disetujui',
                'message' => 'Bisnis "Test Business" telah disetujui dan sekarang aktif.',
            ],
            [
                'type' => 'payment',
                'title' => 'Pembayaran Berhasil',
                'message' => 'Pembayaran premium Anda telah dikonfirmasi.',
            ],
            [
                'type' => 'message',
                'title' => 'Pesan Baru',
                'message' => 'Anda memiliki pesan baru dari pelanggan.',
            ]
        ];
        
        foreach ($notifications as $notif) {
            Notification::create([
                'user_id' => $user->id,
                'type' => $notif['type'],
                'title' => $notif['title'],
                'message' => $notif['message'],
                'data' => $notif['data'] ?? null,
                'action_url' => $notif['action_url'] ?? null,
                'priority' => $notif['priority'] ?? 'normal',
                'is_read' => false
            ]);
        }
        
        return response()->json(['message' => 'Test notifications created']);
    }

    /**
     * Clean up old notifications (for scheduled task)
     */
    public function cleanupOldNotifications()
    {
        $deletedCount = Notification::where('created_at', '<', now()->subDays(30))
            ->delete();
            
        return response()->json([
            'message' => 'Cleanup completed',
            'deleted_count' => $deletedCount
        ]);
    }

    /**
     * Get admin notifications (untuk panel admin)
     */
    public function adminIndex(Request $request)
    {
        $user = Auth::user();
        
        if ($user->role !== 'admin') {
            return response()->json(['message' => 'Unauthorized'], 403);
        }
        
        $query = Notification::where('user_id', $user->id)
            ->orderByRaw("FIELD(priority, 'urgent', 'high', 'normal', 'low')")
            ->orderBy('created_at', 'desc');
        
        // Filter by type
        if ($request->has('type') && $request->type !== 'all') {
            $query->where('type', $request->type);
        }
        
        // Filter by read status
        if ($request->has('read_status')) {
            $isRead = $request->read_status === 'read';
            $query->where('is_read', $isRead);
        }
        
        $perPage = $request->get('per_page', 20);
        $notifications = $query->paginate($perPage);
        
        $unreadCount = Notification::where('user_id', $user->id)
            ->where('is_read', false)
            ->count();
        
        $pendingVerificationCount = Notification::where('user_id', $user->id)
            ->where('type', 'business_verification')
            ->where('is_read', false)
            ->count();
        
        return response()->json([
            'notifications' => $notifications,
            'unread_count' => $unreadCount,
            'pending_verification_count' => $pendingVerificationCount,
            'notification_types' => Notification::getNotificationTypes()
        ]);
    }

    /**
     * Mark admin notification as read
     */
    public function adminMarkRead(Request $request, $id)
    {
        $user = Auth::user();
        
        if ($user->role !== 'admin') {
            return response()->json(['message' => 'Unauthorized'], 403);
        }
        
        $notification = Notification::where('id', $id)
            ->where('user_id', $user->id)
            ->firstOrFail();
        
        $notification->update(['is_read' => true]);
        
        return response()->json([
            'message' => 'Notification marked as read',
            'notification' => $notification
        ]);
    }

    /**
     * Mark all admin notifications as read
     */
    public function adminMarkAllRead(Request $request)
    {
        $user = Auth::user();
        
        if ($user->role !== 'admin') {
            return response()->json(['message' => 'Unauthorized'], 403);
        }
        
        $updated = Notification::where('user_id', $user->id)
            ->where('is_read', false)
            ->update(['is_read' => true]);
        
        return response()->json([
            'message' => 'All notifications marked as read',
            'updated_count' => $updated
        ]);
    }
}