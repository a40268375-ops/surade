<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Advertisement;
use App\Models\Category;
use App\Models\User;

class AdvertisementsSeeder extends Seeder
{
    public function run()
    {
        // Clear existing advertisements
        Advertisement::query()->delete();

        // Get categories and users
        $categories = Category::whereNotNull('parent_id')->get();
        $users = User::all();

        if ($categories->isEmpty() || $users->isEmpty()) {
            $this->command->warn('Missing categories or users. Please run other seeders first.');
            return;
        }

        $adsData = [
            [
                'title' => 'Grand Opening Restoran Nusantara',
                'description' => 'Nikmati promo grand opening dengan diskon 50% untuk semua menu makanan tradisional Indonesia. Berlaku sampai akhir bulan!',
                'company_name' => 'Restoran Nusantara',
                'location' => 'Jakarta Pusat',
                'phone' => '021-12345678',
                'website' => 'https://restonusantara.com',
                'status' => 'approved',
                'category_search' => 'Restoran'
            ],
            [
                'title' => 'Promo Spesial Salon Kecantikan',
                'description' => 'Dapatkan paket perawatan lengkap dengan harga spesial. Creambath + Potong + Blow dry hanya Rp 150.000. Book sekarang!',
                'company_name' => 'Bella Beauty Salon',
                'location' => 'Bandung',
                'phone' => '022-87654321',
                'website' => null,
                'status' => 'approved',
                'category_search' => 'Salon'
            ],
            [
                'title' => 'Kursus Programming Intensif',
                'description' => 'Belajar web development dari dasar hingga mahir. Batch baru dimulai bulan depan. Dapatkan sertifikat dan job guarantee!',
                'company_name' => 'Tech Academy Indonesia',
                'location' => 'Surabaya',
                'phone' => '031-11223344',
                'website' => 'https://techacademy.id',
                'status' => 'approved',
                'category_search' => 'Kursus'
            ],
            [
                'title' => 'Fitness Center Membership Promo',
                'description' => 'Join sekarang dan dapatkan 3 bulan membership gratis! Fasilitas lengkap dengan trainer profesional.',
                'company_name' => 'Power Gym',
                'location' => 'Yogyakarta',
                'phone' => '0274-55667788',
                'website' => 'https://powergym.com',
                'status' => 'approved',
                'category_search' => 'Fitness'
            ],
            [
                'title' => 'Elektronik Sale Up to 70%',
                'description' => 'Mega sale elektronik rumah tangga! TV, AC, Kulkas, dan banyak lagi dengan diskon hingga 70%. Stok terbatas!',
                'company_name' => 'Elektronik Murah',
                'location' => 'Medan',
                'phone' => '061-99887766',
                'website' => null,
                'status' => 'pending',
                'category_search' => 'Elektronik'
            ]
        ];

        foreach ($adsData as $data) {
            // Find category by name
            $category = $categories->first(function ($cat) use ($data) {
                return stripos($cat->name, $data['category_search']) !== false;
            });

            if (!$category) {
                $category = $categories->random();
            }

            Advertisement::create([
                'user_id' => $users->random()->id,
                'category_id' => $category->id,
                'title' => $data['title'],
                'description' => $data['description'],
                'company_name' => $data['company_name'],
                'location' => $data['location'],
                'phone' => $data['phone'],
                'website' => $data['website'],
                'status' => $data['status'],
                'created_at' => now()->subDays(rand(1, 10)),
                'updated_at' => now()->subDays(rand(0, 3)),
            ]);
        }

        $this->command->info('Sample advertisements have been seeded successfully!');
    }
}