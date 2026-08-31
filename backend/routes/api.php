<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\BusinessController;
use App\Http\Controllers\CategoryController;
use App\Http\Controllers\UserController;
use App\Http\Controllers\AdvertisementController;
use App\Http\Controllers\SubscriptionController;
use App\Http\Controllers\EventController;
use App\Http\Controllers\GeocodeController;
use App\Http\Controllers\BookingController;
use App\Http\Controllers\AnnouncementController;
use App\Http\Controllers\CouponController;
use App\Http\Controllers\MenuItemController;
use App\Http\Controllers\MessageController;
use App\Http\Controllers\SavedBusinessController;
use App\Http\Controllers\AnalyticsController;
use App\Http\Controllers\PaymentTicketController;
use App\Http\Controllers\SellerController;
use App\Http\Controllers\ReviewController;
use App\Http\Controllers\NotificationController;
use App\Http\Controllers\BlogController;
use App\Http\Controllers\PremiumUpgradeController;
use App\Http\Controllers\ReferralController;
use App\Http\Controllers\PaymentController;
use App\Http\Controllers\PremiumHistoryController;
use App\Http\Controllers\BusinessReportController;
use App\Http\Controllers\PlatformCouponController;
use App\Http\Controllers\SiteSettingController;
use App\Http\Controllers\PremiumController;
use App\Http\Controllers\UnifiedPaymentController;

/*
|--------------------------------------------------------------------------
| Public Routes (Bisa diakses tanpa login)
|--------------------------------------------------------------------------
*/
// Route diagnostik: kirim email tes langsung dan tampilkan hasil/error-nya
// di layar, supaya gampang cari tahu kenapa OTP tidak sampai - TANPA perlu
// buka file log. HANYA aktif kalau APP_DEBUG=true (otomatis nonaktif di
// production). Buka di browser: /api/test-mail?email=email_kamu@gmail.com
Route::get('test-mail', function (\Illuminate\Http\Request $request) {
    if (!config('app.debug')) {
        return response()->json(['message' => 'Route ini hanya aktif saat APP_DEBUG=true.'], 403);
    }
    $email = $request->query('email');
    if (!$email) {
        return response()->json(['message' => 'Tambahkan ?email=alamat@gmail.com di URL-nya.'], 422);
    }
    try {
        \Illuminate\Support\Facades\Mail::to($email)->send(new \App\Mail\OtpMail('Tes', '123456', 'register'));
        return response()->json([
            'success' => true,
            'message' => "Email tes berhasil dikirim ke $email. Cek inbox (dan folder Spam) dalam 1-2 menit.",
            'mail_config' => [
                'mailer' => config('mail.default'),
                'host' => config('mail.mailers.smtp.host'),
                'port' => config('mail.mailers.smtp.port'),
                'from' => config('mail.from.address'),
            ],
        ]);
    } catch (\Exception $e) {
        return response()->json([
            'success' => false,
            'error_message' => $e->getMessage(),
            'error_class' => get_class($e),
            'mail_config' => [
                'mailer' => config('mail.default'),
                'host' => config('mail.mailers.smtp.host'),
                'port' => config('mail.mailers.smtp.port'),
                'username' => config('mail.mailers.smtp.username'),
                'from' => config('mail.from.address'),
            ],
        ], 500);
    }
});

Route::post('register', [AuthController::class, 'register']);
Route::post('login', [AuthController::class, 'login']);

// OTP Verification Routes
Route::post('verify-otp', [AuthController::class, 'verifyOtp']);
Route::post('resend-otp', [AuthController::class, 'resendOtp']);

// Password Reset Routes
Route::post('forgot-password', [AuthController::class, 'forgotPassword']);
Route::post('verify-reset-otp', [AuthController::class, 'verifyResetOtp']);
Route::post('resend-reset-otp', [AuthController::class, 'resendResetOtp']);
Route::post('reset-password', [AuthController::class, 'resetPassword']);

Route::get('home-feed', [\App\Http\Controllers\HomeController::class, 'feed']);
Route::get('businesses', [BusinessController::class, 'index']);
Route::get('businesses/{id}', [BusinessController::class, 'show']);

Route::get('categories', [CategoryController::class, 'index']);
Route::get('categories/tree', [CategoryController::class, 'tree']);

Route::get('advertisements', [AdvertisementController::class, 'index']);
Route::get('advertisements/{id}', [AdvertisementController::class, 'show']);

Route::get('events', [EventController::class, 'index']);
Route::get('events/{id}', [EventController::class, 'show']);

// Proxy pencarian lokasi (peta) untuk form Buat Event Baru - lihat
// GeocodeController untuk alasannya (hindari CORS/429 dari Nominatim).
Route::get('geocode', [GeocodeController::class, 'search']);

Route::get('subscription-plans', [SubscriptionController::class, 'plans']);

// Booking: siapa saja (pengunjung, tanpa login) boleh mengajukan booking ke sebuah bisnis
Route::post('bookings', [BookingController::class, 'store']);

// Payment Gateway Webhooks (tidak perlu auth karena dipanggil dari payment gateway)
Route::post('webhooks/midtrans', [\App\Http\Controllers\PaymentGatewayController::class, 'midtransNotification']);
Route::post('webhooks/xendit', [\App\Http\Controllers\PaymentGatewayController::class, 'xenditNotification']);

// Pelacakan kunjungan halaman (dipanggil publik, tanpa login, dari setiap halaman)
Route::post('track-view', [AnalyticsController::class, 'track']);

// Menu sebuah bisnis (dipanggil publik lewat ?business_id=)
Route::get('menu-items', [MenuItemController::class, 'index']);

// Inbox: siapa saja (pengunjung, tanpa login) boleh kirim pesan ke sebuah bisnis
Route::post('messages', [MessageController::class, 'store']);

// Seller Profile Routes (public access)
Route::get('sellers/{id}', [SellerController::class, 'show']);
Route::get('sellers/{id}/businesses', [SellerController::class, 'businesses']);
Route::get('sellers/{id}/reviews', [SellerController::class, 'reviews']);

// PERBAIKAN: Blog/Event dibuat lewat halaman admin, tapi selama ini
// GET /blogs cuma bisa diakses kalau sedang login (didaftarkan di dalam
// grup auth:sanctum di bawah) - jadi pengunjung yang belum login ke halaman
// /blog cuma lihat data contoh statis, bukan blog yang sungguhan dibuat.
// Didaftarkan publik di sini (dan Laravel akan pakai route PALING ATAS yang
// cocok, jadi versi di dalam grup auth:sanctum di bawah otomatis tidak
// kepakai lagi buat GET, tidak perlu dihapus manual).
Route::get('blogs', [BlogController::class, 'index']);
Route::get('blogs/{id}', [BlogController::class, 'show']);

// Payment callback (public access for webhooks)
Route::post('payment/callback', [PaymentController::class, 'handlePaymentCallback']);

// Referral code check (public access)
Route::post('check-referral', [ReferralController::class, 'checkReferralCode']);
Route::post('referral/validate', [ReferralController::class, 'validateReferral']);


/*
|--------------------------------------------------------------------------
| Protected Routes (Wajib Login / Menggunakan Token Sanctum)
|--------------------------------------------------------------------------
*/
Route::middleware('auth:sanctum')->group(function () {
    
    // Auth & Profile
    Route::post('logout', [AuthController::class, 'logout']);
    Route::get('profile', [AuthController::class, 'profile']);

    // Grafik tren kunjungan (admin: seluruh platform, user: bisnis miliknya)
    // Grafik tren kunjungan (admin: seluruh platform, user: bisnis miliknya)
    Route::get('analytics/weekly', [AnalyticsController::class, 'weekly']);
    Route::get('analytics/my-business-views', [AnalyticsController::class, 'myBusinessViews']);
    Route::get('analytics/user-registrations', [AnalyticsController::class, 'userRegistrations']);
    Route::get('analytics/business-registrations', [AnalyticsController::class, 'businessRegistrations']);
    
    // Premium Analytics (Premium users only)
    Route::middleware('premium.analytics')->group(function () {
        Route::get('analytics/premium/business', [AnalyticsController::class, 'premiumBusinessAnalytics']);
        Route::get('analytics/premium/dashboard', [AnalyticsController::class, 'premiumDashboard']);
        Route::post('analytics/premium/export', [AnalyticsController::class, 'exportAnalytics']);
        Route::get('analytics/premium/competitive', [AnalyticsController::class, 'competitiveAnalysis']);
        Route::get('analytics/premium/realtime', [AnalyticsController::class, 'realtimeMetrics']);
    });
    Route::post('user/profile', [AuthController::class, 'updateProfile']); // POST untuk support multipart form-data (foto profil)
    
    // -------------------------------------------------------------
    // Fitur User Biasa / Pemilik Bisnis
    // -------------------------------------------------------------
    Route::get('my-businesses', [BusinessController::class, 'myBusinesses']);
    Route::get('dashboard/recent-reviews', [BusinessController::class, 'recentReviews']);
    Route::post('businesses', [BusinessController::class, 'store']);
    Route::middleware('business.owner')->group(function () {
        Route::post('businesses/{id}', [BusinessController::class, 'update']); // POST untuk support multipart form-data (gambar)
        Route::delete('businesses/{id}', [BusinessController::class, 'destroy']);
    });
    Route::post('businesses/{id}/reviews', [BusinessController::class, 'addReview']);

    Route::post('advertisements', [AdvertisementController::class, 'store'])->middleware('premium:create_advertisement');
    Route::put('advertisements/{id}', [AdvertisementController::class, 'update']);
    Route::delete('advertisements/{id}', [AdvertisementController::class, 'destroy']);

    // Consolidated Payment System (replaces multiple payment controllers)
    Route::post('payments/create', [UnifiedPaymentController::class, 'createPayment']);
    Route::get('payments/methods', [UnifiedPaymentController::class, 'getPaymentMethods']);
    Route::get('payments/history', [UnifiedPaymentController::class, 'getPaymentHistory']);
    Route::get('payments/{transactionId}/status', [UnifiedPaymentController::class, 'getPaymentStatus']);
    Route::post('payments/{transactionId}/retry', [UnifiedPaymentController::class, 'retryPayment']);
    Route::post('payments/{transactionId}/cancel', [UnifiedPaymentController::class, 'cancelPayment']);
    Route::post('payments/{transactionId}/refund', [UnifiedPaymentController::class, 'processRefund']);

    // Payment Gateway Webhooks (public, no auth required)
    Route::post('webhooks/payments/{gateway}', [UnifiedPaymentController::class, 'handleWebhook'])->withoutMiddleware(['auth:sanctum']);

    // Existing subscriptions (enhanced)
    Route::get('subscriptions/analytics', [SubscriptionController::class, 'analytics']);
    Route::get('subscriptions/{id}/lifecycle', [SubscriptionController::class, 'lifecycle']);
    Route::post('subscriptions/{id}/cancel', [SubscriptionController::class, 'cancel']);
    Route::post('subscriptions/{id}/renew', [SubscriptionController::class, 'renew']);
    Route::get('subscription-plans', [SubscriptionController::class, 'plans']);
    
    // Existing subscription routes
    Route::get('subscriptions', [SubscriptionController::class, 'index']);
    Route::post('subscriptions', [SubscriptionController::class, 'store']);
    Route::get('subscriptions/{id}', [SubscriptionController::class, 'show']);

    // Booking: pemilik bisnis melihat/mengelola booking yang masuk ke bisnis miliknya
    Route::get('my-bookings', [BookingController::class, 'index']);
    Route::put('bookings/{id}', [BookingController::class, 'update']);
    Route::delete('bookings/{id}', [BookingController::class, 'destroy']);

    // Jalur khusus untuk user bertipe Reseller melihat bisnisnya
    Route::get('reseller/businesses', [UserController::class, 'resellerBusinesses']);

    // Blog & Event CRUD untuk user biasa
    // PERBAIKAN: GET blogs & GET events di sini DIHAPUS - route publik
    // dengan URI yang SAMA sudah didaftarkan di atas (di luar grup
    // auth:sanctum). Laravel TIDAK memakai "route pertama yang cocok"
    // untuk URI statis yang identik persis - route yang didaftarkan
    // BELAKANGAN justru menimpa yang duluan. Jadi selama GET blogs/GET
    // events juga didaftarkan di sini (di dalam grup yang wajib login),
    // route publiknya ketiban dan SEMUA request (termasuk dari
    // pengunjung yang belum login) ikut kena middleware auth:sanctum -
    // itulah sebabnya muncul error 401 Unauthorized di halaman Home
    // padahal harusnya bisa diakses siapa saja.
    Route::post('blogs', [BlogController::class, 'store']);
    Route::put('blogs/{id}', [BlogController::class, 'update']);
    Route::delete('blogs/{id}', [BlogController::class, 'destroy']);

    Route::post('events', [EventController::class, 'store']);
    Route::put('events/{id}', [EventController::class, 'update']);
    Route::delete('events/{id}', [EventController::class, 'destroy']);

    // Pengumuman (read-only untuk pemilik bisnis, CRUD di grup admin di bawah)
    Route::get('announcements', [AnnouncementController::class, 'index']);

    // Kupon milik bisnis sendiri
    Route::get('my-coupons', [CouponController::class, 'index']);
    Route::post('coupons', [CouponController::class, 'store']);
    Route::put('coupons/{id}', [CouponController::class, 'update']);
    Route::delete('coupons/{id}', [CouponController::class, 'destroy']);

    // Menu milik bisnis sendiri (POST dipakai juga untuk update agar mendukung upload gambar)
    Route::get('my-menu-items', [MenuItemController::class, 'index']);
    Route::post('menu-items', [MenuItemController::class, 'store']);
    Route::post('menu-items/{id}', [MenuItemController::class, 'update']);
    Route::delete('menu-items/{id}', [MenuItemController::class, 'destroy']);

    // Inbox pesan masuk ke bisnis sendiri - sekarang dua arah (chat), bukan
    // cuma pesan sekali kirim. "my-messages" mengembalikan semua pesan yang
    // relevan buat akun yang login, baik sebagai penjual maupun pelanggan.
    Route::get('my-messages', [MessageController::class, 'index']);
    Route::put('messages/{id}', [MessageController::class, 'update']); // tandai dibaca
    Route::delete('messages/{id}', [MessageController::class, 'destroy']);
    Route::post('businesses/{business}/messages/{customer}/reply', [MessageController::class, 'reply']);

    // Simpan / bookmark bisnis
    Route::get('my-saved-businesses', [SavedBusinessController::class, 'index']);
    Route::post('saved-businesses', [SavedBusinessController::class, 'store']);
    Route::delete('saved-businesses/{id}', [SavedBusinessController::class, 'destroy']);

    // Tiket Pembayaran Premium
    Route::get('my-payment-tickets', [PaymentTicketController::class, 'myTickets']);
    Route::post('payment-tickets', [PaymentTicketController::class, 'store']);
    Route::put('payment-tickets/{id}', [PaymentTicketController::class, 'update']);
    Route::delete('payment-tickets/{id}', [PaymentTicketController::class, 'destroy']);

    // Premium features and usage
    Route::get('premium/status', [PremiumController::class, 'getStatus']);
    Route::get('premium/plans', [PremiumController::class, 'getPlans']);
    Route::post('premium/check-permission', [PremiumController::class, 'checkPermission']);
    Route::get('premium/limits', [PremiumController::class, 'getLimits']);
    Route::get('premium/suggestions', [PremiumController::class, 'getSuggestions']);
    
    // Premium feature validation (new)
    Route::post('premium/validate-feature', [PremiumController::class, 'validateFeature']);
    Route::post('premium/batch-validate', [PremiumController::class, 'batchValidateFeatures']);
    Route::get('premium/feature-access-report', [PremiumController::class, 'getFeatureAccessReport']);
    Route::get('premium/feature-requirements', [PremiumController::class, 'getFeatureRequirements']);
    
    // Business profile and readiness validation
    Route::post('premium/validate-business-profile', [PremiumController::class, 'validateBusinessProfile']);
    Route::get('premium/check-eligibility', [PremiumController::class, 'checkPremiumEligibility']);
    Route::get('premium/analyze-usage-patterns', [PremiumController::class, 'analyzeUsagePatterns']);
    Route::get('premium/business-readiness-report', [PremiumController::class, 'getBusinessReadinessReport']);
    
    // Premium Upgrade
    Route::post('premium-upgrade', [PremiumUpgradeController::class, 'store']);
    Route::get('premium/subscription-plans', [PremiumUpgradeController::class, 'getSubscriptionPlans']);
    
    // Referral Code & Withdrawals (protected routes)
    Route::post('generate-referral-code', [ReferralController::class, 'generateReferralCodeForUser']);
    Route::get('my-referral-stats', [ReferralController::class, 'myReferralStats']);
    Route::post('withdrawals', [\App\Http\Controllers\WithdrawalController::class, 'store']);
    Route::get('my-withdrawals', [\App\Http\Controllers\WithdrawalController::class, 'myWithdrawals']);
    
    // Payment
    Route::post('create-payment', [PaymentController::class, 'createPayment']);
    
    // Payment Gateway Integration
    Route::post('payment/midtrans/create', [\App\Http\Controllers\PaymentGatewayController::class, 'createMidtransPayment']);
    Route::post('payment/xendit/create', [\App\Http\Controllers\PaymentGatewayController::class, 'createXenditPayment']);
    Route::get('payment/status/{subscriptionId}', [\App\Http\Controllers\PaymentGatewayController::class, 'getPaymentStatus']);

    // Seller Profile Protected Routes
    Route::get('sellers/{id}/is-saved', [SellerController::class, 'isSaved']);
    Route::post('sellers/{id}/save', [SellerController::class, 'save']);

    // Notifications
    Route::get('notifications', [NotificationController::class, 'index']);
    Route::post('notifications/{id}/read', [NotificationController::class, 'markAsRead']);
    Route::post('notifications/mark-all-read', [NotificationController::class, 'markAllAsRead']);
    Route::delete('notifications/{id}', [NotificationController::class, 'destroy']);
    
    // Test notifications (for development)
    Route::post('notifications/test', [NotificationController::class, 'createTestNotifications']);
    Route::post('notifications/cleanup', [NotificationController::class, 'cleanupOldNotifications']);
    Route::delete('sellers/{id}/unsave', [SellerController::class, 'unsave']);
    Route::post('sellers/{id}/reviews', [SellerController::class, 'addReview']);
    Route::post('sellers/{id}/messages', [SellerController::class, 'sendMessage']);

    // Toggle like/"berguna" untuk ulasan (bisnis maupun seller). {type} nilainya
    // 'business' atau 'seller'.
    Route::post('reviews/{type}/{id}/helpful', [ReviewController::class, 'toggleHelpful']);

    // Ulasan yang masuk ke bisnis milik user yang login, dipakai di
    // Dashboard > Ulasan (balas, hapus, lihat bisnis).
    Route::get('my-business-reviews', [ReviewController::class, 'myReviews']);
    Route::post('reviews/{id}/reply', [ReviewController::class, 'reply']);
    Route::delete('reviews/{id}', [ReviewController::class, 'destroyReview']);

    // Laporkan sebuah bisnis (kesalahan/pelanggaran) dari halaman detail bisnis.
    Route::post('businesses/{id}/report', [BusinessReportController::class, 'store']);

    // Validasi kode kupon diskon platform saat checkout Premium/Iklan.
    Route::post('platform-coupons/validate', [PlatformCouponController::class, 'validateCode']);

    // -------------------------------------------------------------
    // Fitur Khusus ADMIN (Grouped & Prefixed dengan 'admin/')
    // -------------------------------------------------------------
    Route::prefix('admin')->middleware('admin')->group(function () {
        
        // 1. CRUD Users (Otomatis mencakup index, store, show, update, destroy)
        Route::apiResource('users', UserController::class);
        Route::post('users/{id}/toggle-active', [UserController::class, 'toggleActive']);

        // 2. CRUD Kategori Bisnis (Index menggunakan route public di atas)
        Route::post('categories', [CategoryController::class, 'store']);
        Route::put('categories/{id}', [CategoryController::class, 'update']);
        Route::delete('categories/{id}', [CategoryController::class, 'destroy']);

        // 3. CRUD & Manajemen Bisnis oleh Admin
        Route::get('businesses', [BusinessController::class, 'index']); // Melihat semua bisnis untuk moderasi
        Route::post('businesses/{id}/approve', [BusinessController::class, 'approve']);
        Route::post('businesses/{id}/suspend', [BusinessController::class, 'suspend']);
        Route::post('businesses/{id}/unsuspend', [BusinessController::class, 'unsuspend']);
        Route::post('businesses/{id}/toggle-premium', [BusinessController::class, 'togglePremium']);
        Route::delete('businesses/{id}', [BusinessController::class, 'destroy']); // Admin bisa hapus bisnis melanggar

        // 4. CRUD Event
        Route::post('events', [EventController::class, 'store']);
        Route::put('events/{id}', [EventController::class, 'update']);
        Route::delete('events/{id}', [EventController::class, 'destroy']);

        // 5. CRUD Iklan (Admin Control)
        Route::get('advertisements', [AdvertisementController::class, 'index']);
        Route::put('advertisements/{id}/verify', [AdvertisementController::class, 'verify']); // Setujui iklan supaya tayang ke publik
        Route::put('advertisements/{id}/reject', [AdvertisementController::class, 'reject']); // Tolak iklan
        Route::delete('advertisements/{id}', [AdvertisementController::class, 'destroy']);

        // 6. CRUD / Manajemen Reseller oleh Admin
        Route::get('resellers', [UserController::class, 'indexResellers']); // Melihat daftar semua reseller
        Route::post('resellers/{id}/toggle-status', [UserController::class, 'toggleResellerStatus']); // Aktif/nonaktifkan reseller
        // 7. Verifikasi Pembayaran Premium (Admin Control)
        Route::get('subscriptions/expiring', [SubscriptionController::class, 'checkExpiring']);
        Route::post('subscriptions/process-expired', [SubscriptionController::class, 'processExpired']);
        Route::put('subscriptions/{id}/verify', [SubscriptionController::class, 'verify']);
        Route::put('subscriptions/{id}/reject', [SubscriptionController::class, 'reject']);

        // 8. CRUD Pengumuman (Admin Control)
        Route::post('announcements', [AnnouncementController::class, 'store']);
        Route::put('announcements/{id}', [AnnouncementController::class, 'update']);
        Route::delete('announcements/{id}', [AnnouncementController::class, 'destroy']);

        // 9. Tiket Pembayaran Premium (Admin Control)
        Route::get('payment-tickets', [PaymentTicketController::class, 'index']);
        Route::put('payment-tickets/{id}', [PaymentTicketController::class, 'update']);
        Route::delete('payment-tickets/{id}', [PaymentTicketController::class, 'destroy']);

        // 10. Notifications (Admin Control)
        Route::get('notifications', [NotificationController::class, 'index']);
        Route::put('notifications/{id}/read', [NotificationController::class, 'markAsRead']);
        Route::post('notifications/mark-all-read', [NotificationController::class, 'markAllAsRead']);

        // 11. Blog Management (Admin Control) - URL aslinya jadi admin/blogs
        // dst. (karena grup ini dibungkus prefix('admin') di atas), JADI
        // BUKAN duplikat dari route publik GET /blogs di luar sana - dua
        // URI yang beda, aman didaftarkan berdampingan.
        Route::get('blogs', [BlogController::class, 'index']);
        Route::post('blogs', [BlogController::class, 'store']);
        Route::put('blogs/{id}', [BlogController::class, 'update']);
        Route::delete('blogs/{id}', [BlogController::class, 'destroy']);
        Route::get('blog-history', [BlogController::class, 'history']);
        
        // 12. Premium History (Admin Control)
        Route::get('premium-history', [PremiumHistoryController::class, 'adminPremiumHistory']);

        // 13. Laporan Report - laporan pelanggaran/kesalahan pada bisnis (Admin Control)
        Route::get('business-reports', [BusinessReportController::class, 'adminIndex']);
        Route::put('business-reports/{id}', [BusinessReportController::class, 'adminUpdateStatus']);
        Route::delete('business-reports/{id}', [BusinessReportController::class, 'adminDestroy']);
        Route::post('business-reports/{id}/remove-content', [BusinessReportController::class, 'adminRemoveContent']);

        // 14. Kupon Diskon - kupon diskon tingkat platform untuk Paket Premium/Iklan (Admin Control)
        Route::get('platform-coupons', [PlatformCouponController::class, 'index']);
        Route::post('platform-coupons', [PlatformCouponController::class, 'store']);
        Route::put('platform-coupons/{id}', [PlatformCouponController::class, 'update']);
        Route::delete('platform-coupons/{id}', [PlatformCouponController::class, 'destroy']);
        
        // 15. Premium Analytics (Admin Control)
        Route::get('analytics/premium/admin-dashboard', [AnalyticsController::class, 'adminPremiumDashboard']);
        Route::get('analytics/premium/reports', [AnalyticsController::class, 'premiumReports']);
        
        // 16. Payment Analytics (Admin Control)
        Route::get('payments/analytics', [UnifiedPaymentController::class, 'getPaymentAnalytics']);

        // 15. Pengaturan Situs (Admin Control)
        Route::get('settings', [SiteSettingController::class, 'index']);
        Route::put('settings', [SiteSettingController::class, 'update']);
        
        // 16. Referral Management (Admin Control)
        Route::prefix('referrals')->group(function () {
            // Dashboard stats
            Route::get('dashboard/stats', [\App\Http\Controllers\Admin\ReferralManagementController::class, 'getDashboardStats']);
            
            // Referral codes management
            Route::get('/', [\App\Http\Controllers\Admin\ReferralManagementController::class, 'getReferralCodes']);
            Route::get('{id}', [\App\Http\Controllers\Admin\ReferralManagementController::class, 'getReferralDetail']);
            Route::put('{id}', [\App\Http\Controllers\Admin\ReferralManagementController::class, 'updateReferralCode']);
            Route::post('generate', [\App\Http\Controllers\Admin\ReferralManagementController::class, 'generateReferralCode']);
            Route::post('{id}/regenerate', [\App\Http\Controllers\Admin\ReferralManagementController::class, 'regenerateReferralCode']);
            
            // Helper routes
            Route::get('helper/referrers', [\App\Http\Controllers\Admin\ReferralManagementController::class, 'getReferrers']);
            Route::get('helper/users', [\App\Http\Controllers\Admin\ReferralManagementController::class, 'getAvailableUsers']);
        });
        
        Route::prefix('referral-transactions')->group(function () {
            // Referral transactions management
            Route::get('/', [\App\Http\Controllers\Admin\ReferralManagementController::class, 'getReferralTransactions']);
            Route::post('{id}/approve', [\App\Http\Controllers\Admin\ReferralManagementController::class, 'approveReferralTransaction']);
            Route::post('{id}/reject', [\App\Http\Controllers\Admin\ReferralManagementController::class, 'rejectReferralTransaction']);
        });
        
        Route::prefix('referral-commissions')->group(function () {
            // Commission management
            Route::get('/', [\App\Http\Controllers\Admin\ReferralManagementController::class, 'getReferralCommissions']);
            Route::post('{id}/approve', [\App\Http\Controllers\Admin\ReferralManagementController::class, 'approveCommission']);
            Route::post('{id}/reject', [\App\Http\Controllers\Admin\ReferralManagementController::class, 'rejectCommission']);
            Route::post('{id}/paid', [\App\Http\Controllers\Admin\ReferralManagementController::class, 'markCommissionPaid']);
            Route::post('{id}/adjust', [\App\Http\Controllers\Admin\ReferralManagementController::class, 'adjustCommission']);
        });
        
        Route::prefix('referral-settings')->group(function () {
            // Referral settings
            Route::get('/', [\App\Http\Controllers\Admin\ReferralManagementController::class, 'getReferralSettings']);
            Route::put('/', [\App\Http\Controllers\Admin\ReferralManagementController::class, 'updateReferralSettings']);
        });

        // 17. Penarikan Saldo Komisi (Admin Control)
        Route::get('withdrawals', [\App\Http\Controllers\WithdrawalController::class, 'index']);
        Route::put('withdrawals/{id}/status', [\App\Http\Controllers\WithdrawalController::class, 'updateStatus']);
    });

});