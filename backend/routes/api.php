<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

use App\Http\Controllers\Auth\AuthenticatedSessionController;
use App\Http\Controllers\Auth\RegisteredUserController;
use App\Http\Controllers\Auth\VerifyEmailController;
use App\Http\Controllers\Auth\EmailVerificationNotificationController;

use App\Http\Controllers\Api\BusinessController;
use App\Http\Controllers\Api\BlogController;
use App\Http\Controllers\Api\FavoriteController;
use App\Http\Controllers\Api\ConversationController;
use App\Http\Controllers\Api\MessageController;
use App\Http\Controllers\Api\RatingController;

/*
|--------------------------------------------------------------------------
| Authentication
|--------------------------------------------------------------------------
*/

Route::post('/register', [RegisteredUserController::class, 'store']);
Route::post('/login', [AuthenticatedSessionController::class, 'store']);

// Email Verification Routes
Route::get('/email/verify/{id}/{hash}', VerifyEmailController::class)
    ->middleware(['auth:sanctum', 'signed', 'throttle:6,1'])
    ->name('verification.verify');

Route::post('/email/verification-notification', [EmailVerificationNotificationController::class, 'store'])
    ->middleware(['auth:sanctum', 'throttle:6,1'])
    ->name('verification.send');

/*
|--------------------------------------------------------------------------
| Public Business
|--------------------------------------------------------------------------
*/

Route::get('/businesses', [BusinessController::class, 'index']);
Route::get('/businesses/{business}', [BusinessController::class, 'show']);
Route::get('/categories', function () {
    return response()->json(App\Models\Category::all());
});

/*
|--------------------------------------------------------------------------
| Public Blog
|--------------------------------------------------------------------------
*/

Route::get('/blogs', [BlogController::class, 'index']);
Route::get('/blogs/{blog}', [BlogController::class, 'show']);
Route::get('/published-blogs', [BlogController::class, 'published']);
Route::get('/events', [BlogController::class, 'events']);
Route::get('/latest-blogs', [BlogController::class, 'latest']);

/*
|--------------------------------------------------------------------------
| Protected Routes
|--------------------------------------------------------------------------
*/

Route::middleware('auth:sanctum')->group(function () {

    /*
    |--------------------------------------------------------------------------
    | User
    |--------------------------------------------------------------------------
    */

    Route::post('/logout', [AuthenticatedSessionController::class, 'destroy']);

    Route::get('/user', function (Request $request) {
        return $request->user();
    });

    /*
    |--------------------------------------------------------------------------
    | Business
    |--------------------------------------------------------------------------
    */

    Route::post('/businesses', [BusinessController::class, 'store']);

    Route::put('/businesses/{business}', [BusinessController::class, 'update']);

    Route::delete('/businesses/{business}', [BusinessController::class, 'destroy']);

    Route::post('/businesses/{business}/logo', [
        BusinessController::class,
        'uploadLogo'
    ]);

    Route::post('/businesses/{business}/banner', [
        BusinessController::class,
        'uploadBanner'
    ]);

    Route::post('/businesses/{business}/gallery', [
        BusinessController::class,
        'uploadGallery'
    ]);

    Route::delete('/business-media/{media}', [
        BusinessController::class,
        'destroyMedia'
    ]);

    /*
    |--------------------------------------------------------------------------
    | Blog
    |--------------------------------------------------------------------------
    */

    Route::get('/my-blogs', [
        BlogController::class,
        'myBlogs'
    ]);

    Route::post('/blogs', [
        BlogController::class,
        'store'
    ]);

    Route::put('/blogs/{blog}', [
        BlogController::class,
        'update'
    ]);

    Route::delete('/blogs/{blog}', [
        BlogController::class,
        'destroy'
    ]);

    Route::post('/blogs/{blog}/thumbnail', [
        BlogController::class,
        'uploadThumbnail'
    ]);

    /*
    |--------------------------------------------------------------------------
    | Favorite
    |--------------------------------------------------------------------------
    */

    Route::get('/my-favorites', [
        FavoriteController::class,
        'index'
    ]);

    Route::post('/favorites/{business}', [
        FavoriteController::class,
        'store'
    ]);

    Route::delete('/favorites/{business}', [
        FavoriteController::class,
        'destroy'
    ]);

    /*
    |--------------------------------------------------------------------------
    | Rating
    |--------------------------------------------------------------------------
    */

    Route::get('/businesses/{business}/ratings', [
        RatingController::class,
        'index'
    ]);

    Route::post('/businesses/{business}/ratings', [
        RatingController::class,
        'store'
    ]);

    Route::delete('/businesses/{business}/ratings', [
        RatingController::class,
        'destroy'
    ]);

    /*
    |--------------------------------------------------------------------------
    | Conversation
    |--------------------------------------------------------------------------
    */

    Route::get('/conversations', [
        ConversationController::class,
        'index'
    ]);

    Route::post('/conversations', [
        ConversationController::class,
        'store'
    ]);

    Route::get('/conversations/{conversation}', [
        ConversationController::class,
        'show'
    ]);

    Route::delete('/conversations/{conversation}', [
        ConversationController::class,
        'destroy'
    ]);

    /*
    |--------------------------------------------------------------------------
    | Messages
    |--------------------------------------------------------------------------
    */

    Route::get('/conversations/{conversation}/messages', [
        MessageController::class,
        'index'
    ]);

    Route::post('/conversations/{conversation}/messages', [
        MessageController::class,
        'store'
    ]);

    Route::put('/messages/{message}/read', [
        MessageController::class,
        'read'
    ]);

    Route::delete('/messages/{message}', [
        MessageController::class,
        'destroy'
    ]);

});