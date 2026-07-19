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

// Menu sebuah bisnis (dipanggil publik lewat ?business_id=)
Route::get('menu-items', [MenuItemController::class, 'index']);

// Inbox: siapa saja (pengunjung, tanpa login) boleh kirim pesan ke sebuah bisnis
Route::post('messages', [MessageController::class, 'store']);


/*
|--------------------------------------------------------------------------
| Protected Routes (Wajib Login / Menggunakan Token Sanctum)
|--------------------------------------------------------------------------
*/
Route::middleware('auth:sanctum')->group(function () {
    
    // Auth & Profile
    Route::post('logout', [AuthController::class, 'logout']);
    Route::get('profile', [AuthController::class, 'profile']);
    
    // -------------------------------------------------------------
    // Fitur User Biasa / Pemilik Bisnis
    // -------------------------------------------------------------
    Route::get('my-businesses', [BusinessController::class, 'myBusinesses']);
    Route::post('businesses', [BusinessController::class, 'store']);
    Route::post('businesses/{id}', [BusinessController::class, 'update']); // POST untuk support multipart form-data (gambar)
    Route::delete('businesses/{id}', [BusinessController::class, 'destroy']);

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

    // Inbox pesan masuk ke bisnis sendiri
    Route::get('my-messages', [MessageController::class, 'index']);
    Route::put('messages/{id}', [MessageController::class, 'update']); // tandai dibaca
    Route::delete('messages/{id}', [MessageController::class, 'destroy']);

    // Simpan / bookmark bisnis
    Route::get('my-saved-businesses', [SavedBusinessController::class, 'index']);
    Route::post('saved-businesses', [SavedBusinessController::class, 'store']);
    Route::delete('saved-businesses/{id}', [SavedBusinessController::class, 'destroy']);

    // -------------------------------------------------------------
    // Fitur Khusus ADMIN (Grouped & Prefixed dengan 'admin/')
    // -------------------------------------------------------------
    Route::prefix('admin')->group(function () {
        
        // 1. CRUD Users (Otomatis mencakup index, store, show, update, destroy)
        Route::apiResource('users', UserController::class);

        // 2. CRUD Kategori Bisnis (Index menggunakan route public di atas)
        Route::post('categories', [CategoryController::class, 'store']);
        Route::put('categories/{id}', [CategoryController::class, 'update']);
        Route::delete('categories/{id}', [CategoryController::class, 'destroy']);

        // 3. CRUD & Manajemen Bisnis oleh Admin
        Route::get('businesses', [BusinessController::class, 'index']); // Melihat semua bisnis untuk moderasi
        Route::post('businesses/{id}/approve', [BusinessController::class, 'approve']);
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
    });

});