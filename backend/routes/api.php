<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\BusinessController;
use App\Http\Controllers\Api\ProductController;
use App\Http\Controllers\Api\BlogController;
use App\Http\Controllers\Api\FavoriteController;
use App\Http\Controllers\Api\RatingController;
use App\Models\Category;
use App\Http\Controllers\Api\ConversationController;
use App\Http\Controllers\Api\MessageController;
use App\Http\Controllers\Api\ProfileController;
use App\Http\Controllers\Api\AdminController;
use App\Http\Controllers\Api\SettingController;
use App\Http\Controllers\Api\AdvertisementController;
use App\Http\Controllers\Api\CouponController;
use App\Http\Controllers\Api\ReferralController;
use App\Http\Controllers\Api\LocationController;
use App\Http\Controllers\Api\AdPackageController;
use App\Http\Controllers\Api\ReportController;
use App\Http\Controllers\Api\AdminReferralController;
use App\Http\Controllers\Api\PasswordResetController;
use App\Http\Controllers\Api\PackageController;
use App\Http\Controllers\Api\ContentPricingController;
use App\Http\Controllers\Api\ContentTransactionController;
use App\Http\Controllers\Api\ContactController;
use App\Http\Controllers\Api\NavbarCategoryController;

// OTP-based registration (3-step flow)
Route::post('/register/send-otp',     [AuthController::class, 'sendOtp']);
Route::post('/register/verify-otp',   [AuthController::class, 'verifyOtpAndRegister']);
Route::post('/register/resend-otp',   [AuthController::class, 'resendOtp']);

Route::post('/login', [AuthController::class, 'login'])->name('login');

// Handle OPTIONS preflight for login
Route::options('/login', function() {
    return response()->json(['status' => 'ok'], 200);
});

// Debug endpoint untuk test request dari browser
Route::post('/debug-login', function (Request $request) {
    return response()->json([
        'received' => [
            'all' => $request->all(),
            'json' => $request->json()->all(),
            'input' => $request->input(),
            'method' => $request->method(),
            'content_type' => $request->header('Content-Type'),
            'accept' => $request->header('Accept'),
            'origin' => $request->header('Origin'),
        ],
        'checks' => [
            'has_email' => $request->has('email'),
            'has_password' => $request->has('password'),
            'email_value' => $request->input('email'),
            'password_exists' => $request->has('password'),
        ]
    ]);
});

// Password reset (4-step flow)
Route::post('/forgot-password',      [PasswordResetController::class, 'sendResetOtp']);
Route::post('/verify-reset-code',    [PasswordResetController::class, 'verifyResetCode']);
Route::post('/resend-reset-code',    [PasswordResetController::class, 'resendResetCode']);
Route::post('/reset-password',       [PasswordResetController::class, 'resetPassword']);


Route::get('/smart-cities', [LocationController::class, 'smartCities']);
Route::get('/smart-cities/counts', [LocationController::class, 'cityCounts']);
Route::get('/locations/{slug}', [LocationController::class, 'showLocation']);

Route::get('/home-summary', [BusinessController::class, 'homeSummary']);
Route::get('/search', [BusinessController::class, 'search']);
Route::get('/search-suggestions', [BusinessController::class, 'searchSuggestions']);
Route::get('/search/popular', [BusinessController::class, 'popularSearches']);
Route::get('/businesses', [BusinessController::class, 'index']);
Route::get('/businesses/{business}', [BusinessController::class, 'show']);
Route::post('/businesses/{business}/view', [BusinessController::class, 'trackView']);
Route::post('/businesses/{business}/click', [BusinessController::class, 'trackClick']);
Route::get('/businesses/{business}/ratings', [RatingController::class, 'index']);
Route::get('/categories', function () {
    return response()->json(Illuminate\Support\Facades\Cache::remember('categories_public_v1', 300, function () {
        return Category::with('children')->whereNull('parent_id')->where('is_active', true)->orderBy('order')->orderBy('name')->get();
    }));
});
Route::get('/navbar-categories', [NavbarCategoryController::class, 'index']);
Route::get('/blogs', [BlogController::class, 'index']);
Route::get('/blogs/{blog}', [BlogController::class, 'show']);
Route::get('/blog-categories', function () {
    return response()->json(
        DB::table('blog_categories')
            ->where('is_active', true)
            ->orderBy('order')
            ->get(['id', 'name', 'slug', 'description', 'icon'])
    );
});
Route::get('/events', [BlogController::class, 'events']);
Route::get('/events/{event}', [BlogController::class, 'show']);
Route::get('/advertisements', [AdvertisementController::class, 'index']);
Route::get('/ad-packages', [AdPackageController::class, 'publicIndex']);
Route::get('/packages', [PackageController::class, 'publicIndex']);
Route::get('/content-pricing', [ContentPricingController::class, 'getPricing']);
Route::post('/contact', [ContactController::class, 'submit']);
Route::get('/users', [AdminController::class, 'users']);
Route::get('/users/{id}', [ProfileController::class, 'showUser']);
Route::get('/businesses/{business}/products', [ProductController::class, 'getByBusiness']);
Route::get('/plans', [AdminController::class, 'publicPlans']);

// Public WhatsApp fee settings (no auth needed)
Route::get('/whatsapp-settings', [SettingController::class, 'getWhatsAppSettings']);

// Public Coupon routes (can be accessed by users & guests)
Route::get('/coupons/public-codes', [CouponController::class, 'publicCodes']);
Route::post('/coupons/validate', [CouponController::class, 'validateCoupon']);


Route::middleware('auth:sanctum')->group(function () {
    Route::post('/logout', [AuthController::class, 'destroy']);
    Route::get('/user', function (Request $request) { return $request->user(); });
    Route::match(['put', 'post'], '/users/profile', [ProfileController::class, 'update']);
    Route::get('/user/profile', [ProfileController::class, 'show']);
    Route::get('/users/profile', [ProfileController::class, 'show']); // Alias untuk frontend
    Route::match(['put', 'post'], '/user/profile', [ProfileController::class, 'update']);
    Route::get('/user/dashboard-stats', [ProfileController::class, 'dashboardStats']);
    Route::get('/user/analytics-stats', [ProfileController::class, 'analyticsStats']);
    Route::get('/my-subscriptions', [PackageController::class, 'mySubscriptions']);
    Route::get('/my-package-transactions', [PackageController::class, 'myTransactions']);
    Route::post('/package-purchase', [PackageController::class, 'purchase']);
    Route::post('/blogs/{id}/checkout', [ContentTransactionController::class, 'checkout']);
    Route::get('/blogs/{id}/transaction', [ContentTransactionController::class, 'getTransactionForBlog']);
    Route::get('/my-content-transactions', [ContentTransactionController::class, 'myTransactions']);
    Route::post('/reports', [ReportController::class, 'store']);
    Route::post('/whatsapp-access-log', [SettingController::class, 'logWhatsAppAccess']);
    Route::get('/whatsapp-access-status', [SettingController::class, 'checkWhatsAppAccessStatus']);
    Route::post('/products', [ProductController::class, 'store']);
    Route::get('/my-products', [ProductController::class, 'myProducts']);
    Route::match(['put', 'post'], '/products/{id}', [ProductController::class, 'update']);
    Route::delete('/products/{id}', [ProductController::class, 'destroy']);

    Route::middleware('role:user')->group(function () {
        Route::post('/businesses', [BusinessController::class, 'store']);
        Route::match(['put', 'post'], '/businesses/{business}', [BusinessController::class, 'update']);
        Route::delete('/businesses/{business}', [BusinessController::class, 'destroy']);
        Route::get('/my-businesses', [BusinessController::class, 'myBusinesses']);
        Route::post('/businesses/{business}/logo', [BusinessController::class, 'uploadLogo']);
        Route::post('/businesses/{business}/banner', [BusinessController::class, 'uploadBanner']);
        Route::post('/businesses/{business}/proof', [BusinessController::class, 'uploadProof']);
        Route::post('/businesses/{business}/gallery', [BusinessController::class, 'uploadGallery']);
        Route::delete('/business-media/{media}', [BusinessController::class, 'destroyMedia']);
        Route::post('/businesses/{business}/products', [ProductController::class, 'storeForBusiness']);
        Route::get('/my-blogs', [BlogController::class, 'myBlogs']);
        Route::post('/blogs', [BlogController::class, 'store']);
        Route::match(['put', 'post'], '/blogs/{blog}', [BlogController::class, 'update']);
        Route::delete('/blogs/{blog}', [BlogController::class, 'destroy']);
        Route::delete('/events/{blog}', [BlogController::class, 'destroy']);
        Route::post('/blogs/{blog}/thumbnail', [BlogController::class, 'uploadThumbnail']);
        Route::post('/blogs/{blog}/images', [BlogController::class, 'uploadImages']);
        Route::get('/my-favorites', [FavoriteController::class, 'index']);
        Route::post('/favorites/{business}', [FavoriteController::class, 'store']);
        Route::delete('/favorites/{business}', [FavoriteController::class, 'destroy']);
        Route::get('/my-blog-favorites', [FavoriteController::class, 'blogFavorites']);
        Route::post('/blog-favorites/{blog}', [FavoriteController::class, 'storeBlog']);
        Route::delete('/blog-favorites/{blog}', [FavoriteController::class, 'destroyBlog']);
        Route::post('/businesses/{business}/ratings', [RatingController::class, 'store']);
        Route::get('/my-ratings', [RatingController::class, 'myRatings']);
        Route::put('/ratings/{rating}', [RatingController::class, 'update']);
        Route::delete('/ratings/{rating}', [RatingController::class, 'destroy']);
        Route::post('/ratings/{rating}/react', [RatingController::class, 'react']);
        Route::post('/ratings/{rating}/replies', [RatingController::class, 'storeReply']);
        Route::delete('/rating-replies/{reply}', [RatingController::class, 'destroyReply']);
        Route::post('/businesses/{business}/conversation', [ConversationController::class, 'storeForBusiness']);
        Route::get('/inbox', [ConversationController::class, 'index']);
        Route::get('/inbox/unread-count', [ConversationController::class, 'unreadCount']);
        Route::get('/inbox/{conversation}', [ConversationController::class, 'show']);
        Route::post('/inbox/{conversation}/messages', [MessageController::class, 'store']);
        Route::post('/inbox/{conversation}/read', [ConversationController::class, 'markRead']);
        Route::get('/conversations', [ConversationController::class, 'index']);
        Route::post('/conversations', [ConversationController::class, 'store']);
        Route::get('/conversations/{conversation}', [ConversationController::class, 'show']);
        Route::post('/conversations/{conversation}/read', [ConversationController::class, 'markRead']);
        Route::delete('/conversations/{conversation}', [ConversationController::class, 'destroy']);
        Route::get('/conversations/{conversation}/messages', [MessageController::class, 'index']);
        Route::post('/conversations/{conversation}/messages', [MessageController::class, 'store']);
        Route::put('/messages/{message}/read', [MessageController::class, 'read']);
        Route::post('/messages/{message}/read', [MessageController::class, 'read']);
        Route::delete('/messages/{message}', [MessageController::class, 'destroy']);
        Route::get('/my-advertisements', [AdvertisementController::class, 'myAdvertisements']);
        Route::post('/advertisements', [AdvertisementController::class, 'store']);
        Route::get('/advertisements/{id}', [AdvertisementController::class, 'show']);
        Route::put('/advertisements/{id}', [AdvertisementController::class, 'update']);
        Route::delete('/advertisements/{id}', [AdvertisementController::class, 'destroy']);
        Route::match(['put', 'post'], '/advertisements/{id}/pay', [AdvertisementController::class, 'pay']);
        Route::post('/referrals/validate', [ReferralController::class, 'validateCode']);
        Route::get('/referrals/my-stats', [ReferralController::class, 'myStats']);
        Route::post('/referrals/withdraw', [ReferralController::class, 'requestWithdrawal']);
        // PERBAIKAN: kedua fungsi ini (publicCodes & leaderboard) sudah lengkap
        // ditulis di ReferralController, tapi rutenya lupa didaftarkan di sini -
        // itu sebabnya frontend selalu dapat 404 Not Found waktu memanggilnya.
        Route::get('/referrals/public-codes', [ReferralController::class, 'publicCodes']);
        Route::get('/referrals/leaderboard', [ReferralController::class, 'leaderboard']);
        Route::post('/subscriptions', [BusinessController::class, 'subscribeBusiness']);
    });

    Route::middleware(\App\Http\Middleware\AdminMiddleware::class)->prefix('admin')->group(function () {
        Route::get('/stats', [AdminController::class, 'stats']);
        Route::get('/activities', [AdminController::class, 'activities']);
        Route::get('/users', [AdminController::class, 'users']);
        Route::post('/users', [AdminController::class, 'createUser']);
        Route::put('/users/{user}', [AdminController::class, 'updateUser']);
        Route::put('/users/{user}/toggle-status', [AdminController::class, 'toggleUserStatus']);
        Route::delete('/users/{user}', [AdminController::class, 'destroyUser']);
        Route::get('/businesses', [AdminController::class, 'allBusinesses']);
        Route::put('/businesses/{business}/approve', [AdminController::class, 'approveBusiness']);
        Route::post('/businesses/{business}/approve', [AdminController::class, 'approveBusiness']);
        Route::put('/businesses/{business}/reject', [AdminController::class, 'rejectBusiness']);
        Route::post('/businesses/{business}/reject', [AdminController::class, 'rejectBusiness']);
        Route::put('/businesses/{business}/suspend', [AdminController::class, 'suspendBusiness']);
        Route::put('/businesses/{business}', [AdminController::class, 'updateBusiness']);
        Route::delete('/businesses/{business}', [AdminController::class, 'destroyBusiness']);
        Route::get('/categories', [AdminController::class, 'allCategories']);
        Route::post('/categories', [AdminController::class, 'storeCategory']);
        Route::put('/categories/{category}', [AdminController::class, 'updateCategory']);
        Route::put('/categories/{category}/toggle-status', [AdminController::class, 'toggleCategoryStatus']);
        Route::delete('/categories/{category}', [AdminController::class, 'destroyCategory']);
        
        // Navbar Categories (Informasi dropdown) Management
        Route::get('/navbar-categories', [NavbarCategoryController::class, 'adminGetAll']);
        Route::post('/navbar-categories', [NavbarCategoryController::class, 'store']);
        Route::get('/navbar-categories/{id}', [NavbarCategoryController::class, 'show']);
        Route::put('/navbar-categories/{id}', [NavbarCategoryController::class, 'update']);
        Route::delete('/navbar-categories/{id}', [NavbarCategoryController::class, 'destroy']);
        Route::put('/navbar-categories/{id}/toggle-status', [NavbarCategoryController::class, 'toggleStatus']);
        Route::post('/navbar-categories/reorder', [NavbarCategoryController::class, 'reorder']);
        Route::get('/navbar-categories/parents/list', [NavbarCategoryController::class, 'getParents']);
        
        Route::get('/blogs', [AdminController::class, 'allBlogs']);
        Route::put('/blogs/{id}/approve', [AdminController::class, 'approveBlog']);
        Route::post('/blogs/{id}/approve', [AdminController::class, 'approveBlog']);
        Route::put('/blogs/{id}/reject', [AdminController::class, 'rejectBlog']);
        Route::post('/blogs/{id}/reject', [AdminController::class, 'rejectBlog']);
        Route::delete('/blogs/{id}', [AdminController::class, 'destroyBlog']);
        Route::get('/reviews', [AdminController::class, 'allReviews']);
        Route::delete('/reviews/{rating}', [AdminController::class, 'destroyReview']);
        Route::get('/subscriptions', [AdminController::class, 'allSubscriptions']);
        Route::put('/subscriptions/{subscription}', [AdminController::class, 'updateSubscription']);
        Route::get('/plans', [AdminController::class, 'allPlans']);
        Route::post('/plans', [AdminController::class, 'storePlan']);
        Route::put('/plans/{plan}', [AdminController::class, 'updatePlan']);
        Route::delete('/plans/{plan}', [AdminController::class, 'destroyPlan']);
        Route::put('/plans/{plan}/toggle-status', [AdminController::class, 'togglePlanStatus']);
        Route::get('/payments', [AdminController::class, 'allPayments']);
        Route::put('/payments/{payment}/approve', [AdminController::class, 'approvePayment']);
        Route::put('/payments/{payment}/reject', [AdminController::class, 'rejectPayment']);
        Route::get('/coupons', [CouponController::class, 'index']);
        Route::post('/coupons', [CouponController::class, 'store']);
        Route::get('/coupons/{coupon}', [CouponController::class, 'show']);
        Route::put('/coupons/{coupon}', [CouponController::class, 'update']);
        Route::delete('/coupons/{coupon}', [CouponController::class, 'destroy']);
        Route::put('/coupons/{coupon}/toggle-status', [CouponController::class, 'toggleStatus']);
        Route::patch('/coupons/{coupon}/toggle-status', [CouponController::class, 'toggleStatus']);
        Route::get('/settings', [SettingController::class, 'index']);
        Route::post('/settings', [SettingController::class, 'update']);
        Route::put('/settings/{setting}', [AdminController::class, 'updateSetting']);
        Route::delete('/settings/{setting}', [AdminController::class, 'destroySetting']);
        Route::put('/profile', [AdminController::class, 'updateProfile']);
        Route::put('/password', [AdminController::class, 'updatePassword']);
        Route::get('/reports', [ReportController::class, 'index']);
        Route::get('/reports/{report}', [ReportController::class, 'show']);
        Route::put('/reports/{report}/status', [ReportController::class, 'updateStatus']);
        Route::delete('/reports/{report}/content', [ReportController::class, 'destroyContent']);
        Route::get('/analytics-reports', [AdminController::class, 'reports']);
        Route::get('/notifications', [AdminController::class, 'notifications']);
        Route::patch('/notifications/{id}/read', [AdminController::class, 'markNotificationRead']);
        Route::put('/notifications/{id}/read', [AdminController::class, 'markNotificationRead']);
        Route::patch('/notifications/read-all', [AdminController::class, 'markAllNotificationsRead']);
        Route::put('/notifications/read-all', [AdminController::class, 'markAllNotificationsRead']);
        Route::get('/advertisements', [AdvertisementController::class, 'adminIndex']);
        Route::put('/advertisements/{id}', [AdvertisementController::class, 'adminUpdate']);
        Route::delete('/advertisements/{id}', [AdvertisementController::class, 'adminDestroy']);
        Route::put('/advertisements/{id}/approve', [AdvertisementController::class, 'approve']);
        Route::put('/advertisements/{id}/reject', [AdvertisementController::class, 'reject']);
        Route::put('/advertisements/{id}/expire', [AdvertisementController::class, 'expire']);
        Route::put('/advertisements/{id}/toggle-status', [AdvertisementController::class, 'toggleStatus']);
        Route::get('/ad-packages', [AdPackageController::class, 'index']);
        Route::post('/ad-packages', [AdPackageController::class, 'store']);
        Route::put('/ad-packages/{id}', [AdPackageController::class, 'update']);
        Route::delete('/ad-packages/{id}', [AdPackageController::class, 'destroy']);
        Route::put('/ad-packages/{id}/toggle-status', [AdPackageController::class, 'toggleStatus']);

        // Admin Blog & Event Package Management
        Route::get('/packages', [PackageController::class, 'adminIndex']);
        Route::post('/packages', [PackageController::class, 'store']);
        Route::put('/packages/{package}', [PackageController::class, 'update']);
        Route::delete('/packages/{package}', [PackageController::class, 'destroy']);
        Route::put('/packages/{package}/toggle-status', [PackageController::class, 'toggleStatus']);
        Route::get('/package-transactions', [PackageController::class, 'adminTransactions']);
        Route::put('/package-transactions/{transaction}/approve', [PackageController::class, 'approveTransaction']);
        Route::put('/package-transactions/{transaction}/reject', [PackageController::class, 'rejectTransaction']);

        // Admin Blog & Event Pay-Per-Post Pricing & Transactions
        Route::get('/content-pricing', [ContentPricingController::class, 'adminGetPricing']);
        Route::put('/content-pricing', [ContentPricingController::class, 'adminUpdatePricing']);
        Route::put('/content-pricing/{type}', [ContentPricingController::class, 'adminUpdateType']);
        Route::get('/content-transactions', [ContentTransactionController::class, 'adminTransactions']);
        Route::put('/content-transactions/{transaction}/approve', [ContentTransactionController::class, 'adminApprove']);
        Route::put('/content-transactions/{transaction}/reject', [ContentTransactionController::class, 'adminReject']);

        // Admin Referral Management
        Route::get('/referrals/stats', [AdminReferralController::class, 'stats']);
        Route::get('/referrals/codes', [AdminReferralController::class, 'codes']);
        Route::put('/referrals/codes/{user}', [AdminReferralController::class, 'updateCode']);
        Route::patch('/referrals/codes/{user}/status', [AdminReferralController::class, 'toggleCodeStatus']);
        Route::post('/referrals/codes/{user}/generate', [AdminReferralController::class, 'generateCode']);
        Route::get('/referrals/transactions', [AdminReferralController::class, 'transactions']);
        Route::get('/referrals/transactions/{referral}', [AdminReferralController::class, 'showTransaction']);
        Route::post('/referrals/transactions/{referral}/approve', [AdminReferralController::class, 'approveTransaction']);
        Route::put('/referrals/transactions/{referral}/approve', [AdminReferralController::class, 'approveTransaction']);
        Route::post('/referrals/transactions/{referral}/reject', [AdminReferralController::class, 'rejectTransaction']);
        Route::put('/referrals/transactions/{referral}/reject', [AdminReferralController::class, 'rejectTransaction']);
        Route::get('/referrals/commissions', [AdminReferralController::class, 'commissions']);
        Route::post('/referrals/commissions/{referral}/approve', [AdminReferralController::class, 'approveCommission']);
        Route::put('/referrals/commissions/{referral}/approve', [AdminReferralController::class, 'approveCommission']);
        Route::post('/referrals/commissions/{referral}/reject', [AdminReferralController::class, 'rejectCommission']);
        Route::put('/referrals/commissions/{referral}/reject', [AdminReferralController::class, 'rejectCommission']);
        Route::post('/referrals/commissions/{referral}/paid', [AdminReferralController::class, 'markCommissionPaid']);
        Route::put('/referrals/commissions/{referral}/paid', [AdminReferralController::class, 'markCommissionPaid']);
        Route::post('/referrals/commissions/{referral}/adjust', [AdminReferralController::class, 'adjustCommission']);
        Route::put('/referrals/commissions/{referral}/adjust', [AdminReferralController::class, 'adjustCommission']);
        Route::get('/referrals/withdrawals', [AdminReferralController::class, 'withdrawals']);
        Route::post('/referrals/withdrawals/{withdrawal}/approve', [AdminReferralController::class, 'approveWithdrawal']);
        Route::put('/referrals/withdrawals/{withdrawal}/approve', [AdminReferralController::class, 'approveWithdrawal']);
        Route::post('/referrals/withdrawals/{withdrawal}/reject', [AdminReferralController::class, 'rejectWithdrawal']);
        Route::put('/referrals/withdrawals/{withdrawal}/reject', [AdminReferralController::class, 'rejectWithdrawal']);
        Route::post('/referrals/withdrawals/{withdrawal}/paid', [AdminReferralController::class, 'markWithdrawalPaid']);
        Route::put('/referrals/withdrawals/{withdrawal}/paid', [AdminReferralController::class, 'markWithdrawalPaid']);
        Route::get('/referrals/settings', [AdminReferralController::class, 'getSettings']);
        Route::put('/referrals/settings', [AdminReferralController::class, 'updateSettings']);
        Route::post('/referrals/settings', [AdminReferralController::class, 'updateSettings']);

        // Contact Messages Management
        Route::get('/contacts', [ContactController::class, 'index']);
        Route::put('/contacts/{id}/status', [ContactController::class, 'updateStatus']);

        // WhatsApp Payment Wall Management
        Route::get('/whatsapp-settings', [SettingController::class, 'getWhatsAppSettings']);
        Route::post('/whatsapp-settings', [SettingController::class, 'updateWhatsAppSettings']);
        Route::put('/whatsapp-settings', [SettingController::class, 'updateWhatsAppSettings']);
        Route::get('/whatsapp-logs', [SettingController::class, 'getWhatsAppLogs']);
        Route::delete('/whatsapp-logs/{id}', [SettingController::class, 'deleteWhatsAppLog']);
        Route::put('/whatsapp-logs/{id}/approve', [SettingController::class, 'approveWhatsAppAccess']);
        Route::post('/whatsapp-logs/{id}/approve', [SettingController::class, 'approveWhatsAppAccess']);
        Route::put('/whatsapp-logs/{id}/reject', [SettingController::class, 'rejectWhatsAppAccess']);
        Route::post('/whatsapp-logs/{id}/reject', [SettingController::class, 'rejectWhatsAppAccess']);
    });
});