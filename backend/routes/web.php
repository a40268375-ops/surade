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