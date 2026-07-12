<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\BusinessController;
use App\Http\Controllers\CategoryController;
use App\Http\Controllers\UserController;
use App\Http\Controllers\AdvertisementController;
use App\Http\Controllers\SubscriptionController;
use App\Http\Controllers\EventController;

// Public routes
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

// Protected routes
Route::middleware('auth:sanctum')->group(function () {
    Route::post('logout', [AuthController::class, 'logout']);
    Route::get('profile', [AuthController::class, 'profile']);
    
    // User business management
    Route::get('my-businesses', [BusinessController::class, 'myBusinesses']);
    Route::post('businesses', [BusinessController::class, 'store']);
    Route::post('businesses/{id}', [BusinessController::class, 'update']); // Using POST to allow multipart form data with images
    Route::delete('businesses/{id}', [BusinessController::class, 'destroy']);

    // User advertisement management
    Route::post('advertisements', [AdvertisementController::class, 'store']);
    Route::put('advertisements/{id}', [AdvertisementController::class, 'update']);
    Route::delete('advertisements/{id}', [AdvertisementController::class, 'destroy']);

    // Subscriptions / invoices (langganan premium per bisnis)
    Route::get('subscriptions', [SubscriptionController::class, 'index']);
    Route::post('subscriptions', [SubscriptionController::class, 'store']);
    Route::get('subscriptions/{id}', [SubscriptionController::class, 'show']);

    // Reseller
    Route::get('reseller/businesses', [UserController::class, 'resellerBusinesses']);

    // Admin routes
    Route::apiResource('users', UserController::class);
    Route::post('categories', [CategoryController::class, 'store']);
    Route::put('categories/{id}', [CategoryController::class, 'update']);
    Route::delete('categories/{id}', [CategoryController::class, 'destroy']);
    Route::post('businesses/{id}/approve', [BusinessController::class, 'approve']);
    Route::post('businesses/{id}/toggle-premium', [BusinessController::class, 'togglePremium']);
    Route::post('events', [EventController::class, 'store']);
    Route::put('events/{id}', [EventController::class, 'update']);
    Route::delete('events/{id}', [EventController::class, 'destroy']);
});