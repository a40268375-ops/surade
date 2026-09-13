<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use App\Models\Notification;

class CleanupNotifications extends Command
{
    protected $signature = 'notifications:cleanup';
    protected $description = 'Clean up old notifications and show statistics';

    public function handle()
    {
        // Cleanup notifications older than 7 days
        $deleted = Notification::where('created_at', '<', now()->subDays(7))->delete();
        $this->info("Deleted {$deleted} old notifications");

        // Show current notification count per user
        $counts = Notification::selectRaw('user_id, count(*) as total, sum(case when is_read = 0 then 1 else 0 end) as unread')
            ->groupBy('user_id')
            ->get();

        $this->info("Current notification counts:");
        foreach ($counts as $count) {
            $this->line("User {$count->user_id}: {$count->total} total, {$count->unread} unread");
        }

        $this->info("Cleanup completed.");
        return 0;
    }
}
