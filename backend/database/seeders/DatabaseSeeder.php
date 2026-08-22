<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class DatabaseSeeder extends Seeder
{
    public function run(): void
    {
        // Create sample users first
        $admin = User::firstOrCreate(
            ['email' => 'admin@surade.co.id'],
            [
                'name' => 'Admin Surade',
                'password' => Hash::make('admin123'),
                'role' => 'admin',
                'email_verified_at' => now(),
            ]
        );

        $reseller = User::firstOrCreate(
            ['email' => 'reseller@surade.co.id'],
            [
                'name' => 'Reseller Surade',
                'password' => Hash::make('reseller123'),
                'role' => 'reseller',
                'referral_code' => 'SURADE001',
                'email_verified_at' => now(),
            ]
        );

        $user = User::firstOrCreate(
            ['email' => 'user@surade.co.id'],
            [
                'name' => 'Pemilik Bisnis',
                'password' => Hash::make('user123'),
                'role' => 'user',
                'phone' => '081234567890',
                'email_verified_at' => now(),
            ]
        );

        // Run comprehensive seeders
        $this->call([
            CategoriesWithSubcategoriesSeeder::class,
            BusinessesSeeder::class,
            AdvertisementsSeeder::class,
        ]);

        $this->command->info('All data has been seeded successfully!');
        $this->command->info('Default accounts:');
        $this->command->info('Admin: admin@surade.co.id / admin123');
        $this->command->info('Reseller: reseller@surade.co.id / reseller123');
        $this->command->info('User: user@surade.co.id / user123');
    }
}
