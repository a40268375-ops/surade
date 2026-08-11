<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\User;
use Illuminate\Support\Facades\Hash;

class ReferralUserSeeder extends Seeder
{
    public function run(): void
    {
        // Create admin user with referral code
        $admin = User::create([
            'name' => 'Admin Referral',
            'email' => 'admin@referral.com',
            'password' => Hash::make('password'),
            'role' => 'admin',
            'referral_code' => 'REFADMIN',
            'status' => 'active',
        ]);

        // Create some test users with referral codes
        $testUsers = [
            [
                'name' => 'Test User 1',
                'email' => 'test1@example.com',
                'password' => Hash::make('password'),
                'role' => 'user',
                'referral_code' => 'REF12345',
                'status' => 'active',
            ],
            [
                'name' => 'Reseller Test',
                'email' => 'reseller@example.com',
                'password' => Hash::make('password'),
                'role' => 'reseller',
                'referral_code' => 'REFRSLLR',
                'status' => 'active',
            ]
        ];

        foreach ($testUsers as $userData) {
            User::create($userData);
        }

        $this->command->info('Created referral test users with codes: REFADMIN, REF12345, REFRSLLR');
    }
}