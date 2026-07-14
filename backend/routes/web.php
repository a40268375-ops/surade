<?php

use Illuminate\Support\Facades\Route;

Route::get('/', function () {
    return view('welcome');
});

// This app is API-only (no server-rendered login page), but Laravel's auth
// middleware calls route('login') to build a redirect target whenever an
// unauthenticated request doesn't explicitly ask for JSON. Without a route
// named "login", that call itself throws RouteNotFoundException before our
// app even gets a chance to return a clean 401 - which is exactly the crash
// seen when hitting a protected /api/* endpoint directly from a browser tab.
Route::get('/login', function () {
    return response()->json(['message' => 'Unauthenticated.'], 401);
})->name('login');

// Serve files from storage/app/public directly, bypassing the public/storage
// symlink entirely. The symlink php artisan storage:link creates is
// unreliable on Windows when php artisan serve doesn't have permission to
// create a real symlink (falls back to a broken junction/copy), so images
// uploaded to storage/app/public/... 404 even though the file exists on
// disk. This route reads the file straight from disk instead, so it works
// regardless of whether the symlink itself is healthy.
Route::get('/storage/{path}', function ($path) {
    $fullPath = storage_path('app/public/' . $path);

    if (!file_exists($fullPath) || !is_file($fullPath)) {
        abort(404);
    }

    return response()->file($fullPath);
})->where('path', '.*');