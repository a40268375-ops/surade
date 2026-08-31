<?php

return [

    /*
    |--------------------------------------------------------------------------
    | Rate Limiting Configuration
    |--------------------------------------------------------------------------
    */

    'rate_limits' => [
        
        // Login rate limiting
        'login' => [
            'max_attempts' => 5,           // Maximum attempts per time window
            'decay_minutes' => 15,         // Time window in minutes
            'lockout_minutes' => 30,       // How long to lock out after max attempts
        ],

        // OTP rate limiting
        'otp' => [
            'max_attempts' => 3,           // Maximum OTP requests per time window
            'decay_minutes' => 10,         // Time window in minutes
            'lockout_minutes' => 60,       // How long to lock out after max attempts
        ],

        // Password reset rate limiting
        'password_reset' => [
            'max_attempts' => 3,           // Maximum reset attempts per time window
            'decay_minutes' => 60,         // Time window in minutes
        ],

        // API rate limiting (general)
        'api' => [
            'max_attempts' => 100,         // Maximum API calls per time window
            'decay_minutes' => 1,          // Time window in minutes
        ],
    ],

    /*
    |--------------------------------------------------------------------------
    | Security Logging Configuration
    |--------------------------------------------------------------------------
    */

    'security_logging' => [
        'enabled' => env('SECURITY_LOGGING_ENABLED', true),
        'log_channel' => env('SECURITY_LOG_CHANNEL', 'stack'),
        
        // Events to log
        'log_events' => [
            'user_login',
            'user_logout',
            'failed_login',
            'user_registered',
            'password_reset',
            'otp_sent',
            'otp_verified',
            'business_created',
            'business_updated',
            'business_deleted',
            'advertisement_created',
            'advertisement_deleted',
            'review_created',
            'review_deleted',
            'review_replied',
            'admin_action',
            'suspicious_activity',
        ],
    ],

    /*
    |--------------------------------------------------------------------------
    | Input Sanitization Configuration
    |--------------------------------------------------------------------------
    */

    'input_sanitization' => [
        'enabled' => true,
        
        // Characters to remove/replace during sanitization
        'remove_tags' => true,
        'encode_quotes' => true,
        'trim_whitespace' => true,
        
        // Allowed HTML tags (if any)
        'allowed_tags' => '<p><br><strong><em><u>',
    ],

    /*
    |--------------------------------------------------------------------------
    | IP Whitelist/Blacklist Configuration
    |--------------------------------------------------------------------------
    */

    'ip_filtering' => [
        'enabled' => env('IP_FILTERING_ENABLED', false),
        
        // Trusted IP addresses (bypass rate limiting)
        'whitelist' => [
            '127.0.0.1',
            '::1',
        ],
        
        // Blocked IP addresses
        'blacklist' => [
            // Add suspicious IPs here
        ],
    ],

    /*
    |--------------------------------------------------------------------------
    | File Upload Security Configuration
    |--------------------------------------------------------------------------
    */

    'file_uploads' => [
        'max_file_size' => 5120, // 5MB in KB
        'allowed_image_types' => ['jpeg', 'jpg', 'png', 'gif', 'webp'],
        'allowed_video_types' => ['mp4', 'webm', 'quicktime'],
        'allowed_document_types' => ['pdf', 'doc', 'docx'],
        
        // Virus scanning (if available)
        'virus_scan_enabled' => env('VIRUS_SCAN_ENABLED', false),
    ],

    /*
    |--------------------------------------------------------------------------
    | CSRF Protection Configuration
    |--------------------------------------------------------------------------
    */

    'csrf' => [
        'enabled' => true,
        'exclude_routes' => [
            'api/webhooks/*',
            'api/payment/callback',
        ],
    ],

];