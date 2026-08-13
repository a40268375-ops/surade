<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\BusinessController;
use App\Http\Controllers\CategoryController;
use App\Http\Controllers\UserController;
use App\Http\Controllers\AdvertisementController;
use App\Http\Controllers\SubscriptionController;
use App\Http\Controllers\EventController;
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

/*
|--------------------------------------------------------------------------
| Public Routes (Bisa diakses tanpa login)
|--------------------------------------------------------------------------
*/
Route::post('register', [AuthController::class, 'register']);
Route::post('login', [AuthController::class, 'login']);

Route::get('businesses', [BusinessController::class, 'index']);
Route::get('businesses/{id}', [BusinessController::class, 'show']);

Route::get('categories', [CategoryController::class, 'index']);

Route::get('advertisements', [AdvertisementController::class, 'index']);
Route::get('advertisements/{id}', [AdvertisementController::class, 'show']);

Route::get('events', [EventController::class, 'index']);
Route::get('events/{id}', [EventController::class, 'show']);

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
    Route::get('analytics/weekly', [AnalyticsController::class, 'weekly']);
    Route::get('analytics/my-business-views', [AnalyticsController::class, 'myBusinessViews']);
    Route::get('analytics/user-registrations', [AnalyticsController::class, 'userRegistrations']);
    Route::get('analytics/business-registrations', [AnalyticsController::class, 'businessRegistrations']);
    Route::post('user/profile', [AuthController::class, 'updateProfile']); // POST untuk support multipart form-data (foto profil)
    
    // -------------------------------------------------------------
    // Fitur User Biasa / Pemilik Bisnis
    // -------------------------------------------------------------
    Route::get('my-businesses', [BusinessController::class, 'myBusinesses']);
    Route::get('dashboard/recent-reviews', [BusinessController::class, 'recentReviews']);
    Route::post('businesses', [BusinessController::class, 'store']);
    Route::post('businesses/{id}', [BusinessController::class, 'update']); // POST untuk support multipart form-data (gambar)
    Route::delete('businesses/{id}', [BusinessController::class, 'destroy']);
    Route::post('businesses/{id}/reviews', [BusinessController::class, 'addReview']);

    Route::post('advertisements', [AdvertisementController::class, 'store']);
    Route::put('advertisements/{id}', [AdvertisementController::class, 'update']);
    Route::delete('advertisements/{id}', [AdvertisementController::class, 'destroy']);

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

    // Premium Upgrade
    Route::post('premium-upgrade', [PremiumUpgradeController::class, 'store']);
    Route::get('subscription-plans', [PremiumUpgradeController::class, 'getSubscriptionPlans']);
    
    // Referral Code (protected routes)
    Route::post('generate-referral-code', [ReferralController::class, 'generateReferralCodeForUser']);
    
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

    // -------------------------------------------------------------
    // Fitur Khusus ADMIN (Grouped & Prefixed dengan 'admin/')
    // -------------------------------------------------------------
    Route::prefix('admin')->group(function () {
        
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
        Route::put('advertisements/{id}/verify', [AdvertisementController::class, 'verify']); // Contoh status tayang iklan
        Route::delete('advertisements/{id}', [AdvertisementController::class, 'destroy']);

        // 6. CRUD / Manajemen Reseller oleh Admin
        Route::get('resellers', [UserController::class, 'indexResellers']); // Melihat daftar semua reseller
        Route::post('resellers/{id}/toggle-status', [UserController::class, 'toggleResellerStatus']); // Aktif/nonaktifkan reseller
        // 7. Verifikasi Pembayaran Premium (Admin Control)
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
    });

});