<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Notification extends Model
{
    protected $fillable = [
        'user_id',
        'type',
        'source_type',
        'source_id',
        'title',
        'message',
        'description',
        'data',
        'is_read',
        'action_url',
        'icon',
        'priority',
    ];

    protected $casts = [
        'is_read' => 'boolean',
        'data' => 'array',
        'created_at' => 'datetime',
        'updated_at' => 'datetime',
    ];

    public function setMessageAttribute($value)
    {
        $this->attributes['message'] = $value;
        if (!isset($this->attributes['description']) || empty($this->attributes['description'])) {
            $this->attributes['description'] = $value;
        }
    }

    public function setDescriptionAttribute($value)
    {
        $this->attributes['description'] = $value;
        if (!isset($this->attributes['message']) || empty($this->attributes['message'])) {
            $this->attributes['message'] = $value;
        }
    }

    public function getMessageAttribute($value)
    {
        return $value ?? $this->attributes['description'] ?? null;
    }

    public function getDescriptionAttribute($value)
    {
        return $value ?? $this->attributes['message'] ?? null;
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    // Helper method to create notifications
    public static function createNotification($userId, $type, $title, $message, $data = null, $actionUrl = null, $icon = null, $priority = 'normal')
    {
        return self::create([
            'user_id' => $userId,
            'type' => $type,
            'title' => $title,
            'message' => $message,
            'description' => $message,
            'data' => $data,
            'action_url' => $actionUrl,
            'icon' => $icon,
            'priority' => $priority,
            'is_read' => false,
        ]);
    }

    /**
     * Create notification for admin when new business needs verification
     */
    public static function notifyAdminBusinessVerification($business)
    {
        $admins = \App\Models\User::where('role', 'admin')->get();
        
        foreach ($admins as $admin) {
            self::createNotification(
                $admin->id,
                'business_verification',
                '🔔 Bisnis Baru Perlu Verifikasi',
                "Bisnis '{$business->title}' telah didaftarkan oleh {$business->user->name} dan menunggu verifikasi Anda.",
                [
                    'business_id' => $business->id,
                    'business_title' => $business->title,
                    'user_name' => $business->user->name,
                    'user_id' => $business->user_id,
                    'submitted_at' => $business->created_at,
                ],
                "/admin/verification/businesses/{$business->id}",
                'bell',
                'high'
            );
        }
    }

    /**
     * Get notification types with icons
     */
    public static function getNotificationTypes()
    {
        return [
            'business_verification' => ['icon' => '🔔', 'color' => '#f59e0b'],
            'business_verified' => ['icon' => '✅', 'color' => '#10b981'],
            'business_rejected' => ['icon' => '❌', 'color' => '#ef4444'],
            'business_suspended' => ['icon' => '⚠️', 'color' => '#f97316'],
            'business_activated' => ['icon' => '✅', 'color' => '#10b981'],
            'business' => ['icon' => '🏪', 'color' => '#3b82f6'],
            'payment' => ['icon' => '💰', 'color' => '#8b5cf6'],
            'message' => ['icon' => '💬', 'color' => '#06b6d4'],
            'review' => ['icon' => '⭐', 'color' => '#eab308'],
        ];
    }
}
