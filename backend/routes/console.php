<?php

use Illuminate\Foundation\Inspiring;
use Illuminate\Support\Facades\Artisan;
use Illuminate\Support\Facades\Schedule;
use App\Services\AutoExpiryService;

Artisan::command('inspire', function () {
    $this->comment(Inspiring::quote());
})->purpose('Display an inspiring quote');

Artisan::command('surade:process-expiries', function () {
    $this->info('Memeriksa masa berlaku iklan dan paket premium bisnis...');
    $res = AutoExpiryService::checkAndExpire(true);
    $this->info("Selesai! Iklan expired: {$res['ads_expired']}, Bisnis kembali ke Free: {$res['businesses_expired']}, Subscriptions expired: {$res['subscriptions_expired']}");
})->purpose('Memproses iklan dan bisnis premium yang sudah habis masa berlakunya');

Schedule::command('surade:process-expiries')->everyMinute();
Schedule::command('subscriptions:process-expired')->hourly();
