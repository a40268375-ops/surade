<?php

namespace App\Http\Helpers;

use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\RateLimiter;
use Illuminate\Http\Request;
use Illuminate\Support\Str;

class SecurityHelper
{
    /**
     * Check if IP is being rate limited for failed login attempts
     */
    public static function checkLoginRateLimit(Request $request): array
    {
        $key = 'login_attempts:' . $request->ip();
        $maxAttempts = 5;
        $decayMinutes = 15;

        if (RateLimiter::tooManyAttempts($key, $maxAttempts)) {
            $seconds = RateLimiter::availableIn($key);
            return [
                'blocked' => true,
                'retry_after' => $seconds,
                'message' => "Terlalu banyak percobaan login. Coba lagi dalam {$seconds} detik."
            ];
        }

        return ['blocked' => false];
    }

    /**
     * Record failed login attempt
     */
    public static function recordFailedLogin(Request $request): void
    {
        $key = 'login_attempts:' . $request->ip();
        RateLimiter::hit($key, 15 * 60); // 15 minutes decay
    }

    /**
     * Clear failed login attempts on successful login
     */
    public static function clearFailedLoginAttempts(Request $request): void
    {
        $key = 'login_attempts:' . $request->ip();
        RateLimiter::clear($key);
    }

    /**
     * Check OTP rate limiting
     */
    public static function checkOtpRateLimit(string $email, string $type = 'general'): array
    {
        $key = "otp_requests:{$type}:" . md5($email);
        $maxAttempts = 3;
        $decayMinutes = 10;

        if (RateLimiter::tooManyAttempts($key, $maxAttempts)) {
            $seconds = RateLimiter::availableIn($key);
            return [
                'blocked' => true,
                'retry_after' => $seconds,
                'message' => "Terlalu banyak permintaan OTP. Coba lagi dalam " . ceil($seconds / 60) . " menit."
            ];
        }

        return ['blocked' => false];
    }

    /**
     * Record OTP request
     */
    public static function recordOtpRequest(string $email, string $type = 'general'): void
    {
        $key = "otp_requests:{$type}:" . md5($email);
        RateLimiter::hit($key, 10 * 60); // 10 minutes decay
    }

    /**
     * Validate file upload security
     */
    public static function validateFileUpload($file, array $allowedTypes = ['image'], int $maxSize = 2048): array
    {
        if (!$file) {
            return ['valid' => true];
        }

        // Check file size (in KB)
        if ($file->getSize() > $maxSize * 1024) {
            return [
                'valid' => false,
                'message' => "Ukuran file melebihi batas maksimal {$maxSize}KB."
            ];
        }

        // Check MIME type
        $mimeType = $file->getMimeType();
        $extension = $file->getClientOriginalExtension();
        
        $validMimes = [];
        if (in_array('image', $allowedTypes)) {
            $validMimes = array_merge($validMimes, ['image/jpeg', 'image/png', 'image/jpg', 'image/webp']);
        }
        if (in_array('video', $allowedTypes)) {
            $validMimes = array_merge($validMimes, ['video/mp4', 'video/avi', 'video/mov', 'video/wmv']);
        }
        if (in_array('document', $allowedTypes)) {
            $validMimes = array_merge($validMimes, ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document']);
        }

        if (!in_array($mimeType, $validMimes)) {
            return [
                'valid' => false,
                'message' => 'Tipe file tidak diperbolehkan.'
            ];
        }

        // Check for executable file extensions (security)
        $dangerousExtensions = ['exe', 'bat', 'cmd', 'sh', 'php', 'js', 'html', 'htm'];
        if (in_array(strtolower($extension), $dangerousExtensions)) {
            return [
                'valid' => false,
                'message' => 'Ekstensi file tidak diperbolehkan untuk alasan keamanan.'
            ];
        }

        return ['valid' => true];
    }

    /**
     * Generate secure filename
     */
    public static function generateSecureFilename(string $originalName, string $prefix = ''): string
    {
        $extension = pathinfo($originalName, PATHINFO_EXTENSION);
        $timestamp = now()->format('YmdHis');
        $random = Str::random(8);
        
        return $prefix . $timestamp . '_' . $random . '.' . $extension;
    }

    /**
     * Sanitize user input for XSS prevention
     */
    public static function sanitizeInput(string $input): string
    {
        // Remove potentially dangerous HTML tags and attributes
        $input = strip_tags($input);
        
        // Convert special characters to HTML entities
        $input = htmlspecialchars($input, ENT_QUOTES, 'UTF-8');
        
        // Remove null bytes
        $input = str_replace("\0", '', $input);
        
        return trim($input);
    }

    /**
     * Validate coordinates format and range
     */
    public static function validateCoordinates(string $coordinates): array
    {
        if (!$coordinates) {
            return ['valid' => true];
        }

        $coords = explode(',', $coordinates);
        if (count($coords) !== 2) {
            return [
                'valid' => false,
                'message' => 'Format koordinat tidak valid. Gunakan format: latitude,longitude'
            ];
        }

        $lat = floatval(trim($coords[0]));
        $lng = floatval(trim($coords[1]));

        if ($lat < -90 || $lat > 90) {
            return [
                'valid' => false,
                'message' => 'Latitude harus berada dalam rentang -90 hingga 90.'
            ];
        }

        if ($lng < -180 || $lng > 180) {
            return [
                'valid' => false,
                'message' => 'Longitude harus berada dalam rentang -180 hingga 180.'
            ];
        }

        return ['valid' => true];
    }

    /**
     * Check if user has permission to perform action
     */
    public static function hasPermission($user, string $action, $resource = null): bool
    {
        if (!$user) {
            return false;
        }

        // Admin has all permissions
        if ($user->role === 'admin') {
            return true;
        }

        // Check if user account is active
        if (!$user->is_active) {
            return false;
        }

        // Permission rules based on action
        switch ($action) {
            case 'create_business':
                // Free users limited to 1 business
                if ($user->role === 'user') {
                    $businessCount = $user->businesses()->count();
                    return $businessCount < 1 || $user->hasActivePremiumBusiness();
                }
                return true;

            case 'create_advertisement':
                // Only premium users can create ads
                return $user->hasActivePremiumBusiness() || $user->role === 'reseller';

            case 'manage_business':
                // User can only manage own businesses
                if ($resource && $resource instanceof \App\Models\Business) {
                    return $resource->user_id === $user->id;
                }
                return false;

            case 'view_admin_data':
                return $user->role === 'admin';

            default:
                return false;
        }
    }

    /**
     * Log security event
     */
    public static function logSecurityEvent(string $event, array $data = []): void
    {
        \Log::warning("Security Event: {$event}", array_merge($data, [
            'ip' => request()->ip(),
            'user_agent' => request()->userAgent(),
            'timestamp' => now()
        ]));
    }
}