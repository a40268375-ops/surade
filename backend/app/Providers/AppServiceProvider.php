<?php

namespace App\Providers;

use App\Models\Blog;
use App\Models\Business;
use App\Models\Conversation;

use App\Policies\BlogPolicy;
use App\Policies\BusinessPolicy;
use App\Policies\ConversationPolicy;

use Illuminate\Auth\Notifications\ResetPassword;
use Illuminate\Support\Facades\Gate;
use Illuminate\Support\ServiceProvider;

class AppServiceProvider extends ServiceProvider
{
    /**
     * Register any application services.
     */
    public function register(): void
    {
        //
    }

    /**
     * Bootstrap any application services.
     */
    public function boot(): void
    {
        /*
        |--------------------------------------------------------------------------
        | Reset Password URL
        |--------------------------------------------------------------------------
        */

        ResetPassword::createUrlUsing(function (object $notifiable, string $token) {
            return config('app.frontend_url')
                ."/password-reset/$token?email={$notifiable->getEmailForPasswordReset()}";
        });

        /*
        |--------------------------------------------------------------------------
        | Policies
        |--------------------------------------------------------------------------
        */

        Gate::policy(Business::class, BusinessPolicy::class);

        Gate::policy(Blog::class, BlogPolicy::class);

        Gate::policy(Conversation::class, ConversationPolicy::class);
    }
}