<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\User;
use Illuminate\Support\Facades\Hash;

class TestReferralSeeder extends Seeder
{
    public function run(): void
    {
        // Create or update users with specific referral codes for testing
        $testUsers = [
            [
                'name' => 'Admin Test',
                'email' => 'admin.test@surade.com',
                'role' => 'admin',
                'referral_code' => 'REFADMIN',
                'status' => 'active',
            ],
            [
                'name' => 'Reseller Test',
                'email' => 'reseller.test@surade.com', 
                'role' => 'reseller',
                'referral_code' => 'REF12345',
                'status' => 'active',
            ],
            [
                'name' => 'User Test',
                'email' => 'user.test@surade.com',
                'role' => 'user', 
                'referral_code' => 'REFUSER1',
                'status' => 'active',
            ]
        ];

        foreach ($testUsers as $userData) {
            $userData['password'] = Hash::make('password');
            
            User::updateOrCreate(
                ['email' => $userData['email']],
                $userData
            );
        }

        $this->command->info('Test referral codes ready:');
        $this->command->info('- REFADMIN (Admin - 15% discount)');
        $this->command->info('- REF12345 (Reseller - 12% discount)');  
        $this->command->info('- REFUSER1 (User - 10% discount)');
    }
}