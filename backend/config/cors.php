<?php

// Laravel didn't have this file at all, which is why every request from the
// React dev server (localhost:5173) to the API (127.0.0.1:8000) was being
// blocked by the browser before it ever reached the controller - the fetch()
// call just throws "Failed to fetch", which the frontend shows as a generic
// "Gagal melakukan registrasi/login" message with no real detail.

return [

    /*
    |--------------------------------------------------------------------------
    | Which routes this applies to
    |--------------------------------------------------------------------------
    | All /api/* routes, plus Sanctum's CSRF cookie route just in case it's
    | ever used.
    */
    'paths' => ['api/*', 'sanctum/csrf-cookie'],

    'allowed_methods' => ['*'],

    /*
    |--------------------------------------------------------------------------
    | Allowed origins
    |--------------------------------------------------------------------------
    | The Vite dev server can be reached as either localhost or 127.0.0.1,
    | and its default port is 5173 (but Vite will bump to 5174, 5175... if
    | 5173 is already taken) - so we allow the whole local dev range instead
    | of a single hardcoded origin.
    */
    'allowed_origins' => [],

    'allowed_origins_patterns' => [
        '#^http://localhost:\d+$#',
        '#^http://127\.0\.0\.1:\d+$#',
    ],

    'allowed_headers' => ['*'],

    'exposed_headers' => [],

    'max_age' => 0,

    /*
    |--------------------------------------------------------------------------
    | Credentials
    |--------------------------------------------------------------------------
    | Auth here uses Sanctum's Bearer-token API tokens (Authorization header),
    | not cookie/session auth, so credentials don't need to be true. Leaving
    | it false is also required for the wildcard-style origin patterns above
    | to work in the browser.
    */
    'supports_credentials' => false,

];
