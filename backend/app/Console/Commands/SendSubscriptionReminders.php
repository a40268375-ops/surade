<?php

namespace App\Console\Commands;

use App\Models\Subscription;
use Illuminate\Console\Command;
use Illuminate\Support\Carbon;

class SendSubscriptionReminders extends Command
{
    /**
     * The name and signature of the console command.
     */
    protected $signature = 'subscriptions:send-reminders 
                            {--days=7 : Send reminders for subscriptions expiring within X days}
                            {--dry-run : Show what reminders would be sent without actually sending}';

    /**
     * The console command description.
     */
    protected $description = 'Send expiration reminders to users with subscriptions expiring soon';

    /**
     * Execute the console command.
     */
    public function handle()
    {
        $days = (int) $this->option('days');
        $dryRun = $this->option('dry-run');

        $this->info("Looking for subscriptions expiring within {$days} days...");

        $expiringSubscriptions = Subscription::with(['business', 'user'])
            ->expiringWithin($days)
            ->whereNull('expiration_warning_sent_at') // Haven't sent warning yet
            ->get();

        if ($expiringSubscriptions->isEmpty()) {
            $this->info('No subscriptions require expiration reminders.');
            return Command::SUCCESS;
        }

        if ($dryRun) {
            return $this->showDryRunResults($expiringSubscriptions);
        }

        $sent = 0;
        $errors = [];

        foreach ($expiringSubscriptions as $subscription) {
            try {
                $this->sendExpirationReminder($subscription);
                
                // Mark as sent
                $subscription->update([
                    'expiration_warning_sent_at' => Carbon::now()
                ]);
                
                $sent++;
                $this->info("✓ Sent reminder to {$subscription->user->name} (Business: {$subscription->business->title})");
                
            } catch (\Exception $e) {
                $errors[] = [
                    'subscription_id' => $subscription->id,
                    'error' => $e->getMessage()
                ];
                $this->error("✗ Failed to send reminder for subscription {$subscription->id}: {$e->getMessage()}");
            }
        }

        $this->info("Sent {$sent} expiration reminders successfully.");
        
        if (!empty($errors)) {
            $this->error("Encountered " . count($errors) . " errors while sending reminders.");
        }

        return Command::SUCCESS;
    }

    private function showDryRunResults($subscriptions): int
    {
        $this->warn('DRY RUN MODE - No reminders will be sent');
        
        $this->table(
            ['Subscription ID', 'User', 'Business', 'Expires At', 'Days Until Expiry'],
            $subscriptions->map(function($sub) {
                return [
                    $sub->id,
                    $sub->user->name ?? 'Unknown',
                    $sub->business->title ?? 'Unknown',
                    $sub->expires_at->format('Y-m-d H:i:s'),
                    $sub->getDaysUntilExpiration()
                ];
            })
        );

        $this->warn("Would send {$subscriptions->count()} expiration reminders");
        return Command::SUCCESS;
    }

    private function sendExpirationReminder(Subscription $subscription): void
    {
        // Here you would implement actual email/SMS sending
        // For now, just log the reminder
        \Illuminate\Support\Facades\Log::info('Subscription expiration reminder sent', [
            'subscription_id' => $subscription->id,
            'user_id' => $subscription->user_id,
            'business_id' => $subscription->business_id,
            'expires_at' => $subscription->expires_at,
            'days_until_expiry' => $subscription->getDaysUntilExpiration()
        ]);

        // Add lifecycle event
        $subscription->addLifecycleEvent('expiration_reminder_sent', [
            'days_until_expiry' => $subscription->getDaysUntilExpiration(),
            'notification_type' => 'email',
            'sent_at' => Carbon::now()->toISOString()
        ]);
    }
}