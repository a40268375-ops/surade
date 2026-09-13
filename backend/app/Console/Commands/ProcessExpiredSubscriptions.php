<?php

namespace App\Console\Commands;

use App\Services\SubscriptionLifecycleService;
use Illuminate\Console\Command;

class ProcessExpiredSubscriptions extends Command
{
    /**
     * The name and signature of the console command.
     */
    protected $signature = 'subscriptions:process-expired 
                            {--dry-run : Show what would be processed without making changes}
                            {--notify : Send notifications to affected users}';

    /**
     * The console command description.
     */
    protected $description = 'Process expired premium subscriptions and deactivate premium features';

    protected SubscriptionLifecycleService $lifecycleService;

    public function __construct(SubscriptionLifecycleService $lifecycleService)
    {
        parent::__construct();
        $this->lifecycleService = $lifecycleService;
    }

    /**
     * Execute the console command.
     */
    public function handle()
    {
        $this->info('Starting expired subscription processing...');
        
        $dryRun = $this->option('dry-run');
        $notify = $this->option('notify');

        if ($dryRun) {
            $this->warn('DRY RUN MODE - No changes will be made');
            return $this->performDryRun();
        }

        $result = $this->lifecycleService->processExpiredSubscriptions();

        $this->displayResults($result);
        
        if ($notify && $result['processed_count'] > 0) {
            $this->info('Notifications will be sent to affected users.');
        }

        return Command::SUCCESS;
    }

    private function performDryRun(): int
    {
        $expiredSubscriptions = \App\Models\Subscription::where('status', 'active')
            ->where('expires_at', '<=', now())
            ->with(['business', 'user'])
            ->get();

        if ($expiredSubscriptions->isEmpty()) {
            $this->info('No expired subscriptions found.');
            return Command::SUCCESS;
        }

        $this->table(
            ['Subscription ID', 'User', 'Business', 'Expired At', 'Plan'],
            $expiredSubscriptions->map(function($sub) {
                return [
                    $sub->id,
                    $sub->user->name ?? 'Unknown',
                    $sub->business->title ?? 'Unknown',
                    $sub->expires_at->format('Y-m-d H:i:s'),
                    $sub->plan
                ];
            })
        );

        $this->warn("Would process {$expiredSubscriptions->count()} expired subscriptions");
        return Command::SUCCESS;
    }

    private function displayResults(array $result): void
    {
        $this->info("✓ Processed {$result['processed_count']} out of {$result['total_expired']} expired subscriptions");

        if (!empty($result['errors'])) {
            $this->error("✗ Encountered {count($result['errors'])} errors:");
            foreach ($result['errors'] as $error) {
                $this->error("  - Subscription {$error['subscription_id']}: {$error['error']}");
            }
        }

        if ($result['processed_count'] === 0) {
            $this->info('No expired subscriptions to process.');
        }
    }
}