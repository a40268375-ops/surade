<?php

namespace Database\Seeders;

use App\Models\User;
use App\Models\Category;
use App\Models\Business;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;

class DatabaseSeeder extends Seeder
{
    public function run(): void
    {
        // 1. Seed Admin
        $admin = User::create([
            'name' => 'Admin Surade',
            'email' => 'admin@surade.co.id',
            'password' => Hash::make('admin123'),
            'role' => 'admin',
        ]);

        // Seed Reseller
        $reseller = User::create([
            'name' => 'Reseller Surade',
            'email' => 'reseller@surade.co.id',
            'password' => Hash::make('reseller123'),
            'role' => 'reseller',
            'referral_code' => 'SURADE001',
        ]);

        // Seed Regular User
        $user = User::create([
            'name' => 'Budi Santoso',
            'email' => 'budi@example.com',
            'password' => Hash::make('user123'),
            'role' => 'user',
        ]);

        // 2. Seed Categories
        $categoriesList = [
            ['name' => 'Perkantoran', 'icon' => 'Building2'],
            ['name' => 'Bisnis & Market', 'icon' => 'Store'],
            ['name' => 'Rekreasi & Hiburan', 'icon' => 'MapPin'],
            ['name' => 'Jasa & Servis', 'icon' => 'Wrench'],
            ['name' => 'Fasilitas', 'icon' => 'Fuel'],
            ['name' => 'Otomotif', 'icon' => 'Car'],
            ['name' => 'Pendidikan', 'icon' => 'GraduationCap'],
            ['name' => 'Kesehatan', 'icon' => 'Activity'],
            ['name' => 'Elektronik & Gadget', 'icon' => 'Smartphone'],
            ['name' => 'Fashion', 'icon' => 'Shirt'],
            ['name' => 'Musik', 'icon' => 'Music'],
            ['name' => 'Komunitas', 'icon' => 'Users'],
            ['name' => 'Informasi Umum', 'icon' => 'Info'],
        ];

        $categories = [];
        foreach ($categoriesList as $cat) {
            $categories[$cat['name']] = Category::create([
                'name' => $cat['name'],
                'slug' => Str::slug($cat['name']),
                'icon' => $cat['icon'],
            ]);
        }

        // 3. Seed Businesses
        $businesses = [
            [
                'user_id' => $user->id,
                'category_id' => $categories['Bisnis & Market']->id,
                'title' => 'Amel Irwanto Cake',
                'description' => 'Kue lezat berkualitas tinggi untuk momen istimewa Anda. Kami menyediakan berbagai macam kue ulang tahun, pernikahan, dan kue kering dengan cita rasa premium.',
                'address' => 'Kabupaten Bogor, Jawa Barat',
                'phone' => '081234567890',
                'email' => 'amelirwanto@example.com',
                'operating_hours' => '08:00 - 20:00',
                'website' => 'https://amelirwantocake.com',
                'image' => 'https://images.unsplash.com/photo-1565958011703-44f9829ba187?w=800&fit=crop',
                'is_premium' => true,
                'status' => 'approved',
            ],
            [
                'user_id' => $user->id,
                'category_id' => $categories['Bisnis & Market']->id,
                'title' => 'Global Bakery Leuwiliang',
                'description' => 'Toko roti terhangat dengan roti tawar, kue basah, dan donat segar setiap harinya.',
                'address' => 'Kabupaten Bogor, Jawa Barat',
                'phone' => '085678901234',
                'email' => 'globalbakery@example.com',
                'operating_hours' => '07:00 - 21:00',
                'website' => '',
                'image' => 'https://images.unsplash.com/photo-1509440159596-0249088772ff?w=800&fit=crop',
                'is_premium' => false,
                'status' => 'approved',
            ],
            [
                'user_id' => $user->id,
                'category_id' => $categories['Jasa & Servis']->id,
                'title' => 'Bengkel Motor Makmur',
                'description' => 'Pusat servis motor Honda, Yamaha, Suzuki terpercaya dengan mekanik ahli dan suku cadang orisinal.',
                'address' => 'Kabupaten Bekasi, Jawa Barat',
                'phone' => '08991234567',
                'email' => 'makmurbengkel@example.com',
                'operating_hours' => '08:00 - 17:00',
                'website' => '',
                'image' => 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800&fit=crop',
                'is_premium' => false,
                'status' => 'approved',
            ],
            [
                'user_id' => $user->id,
                'category_id' => $categories['Rekreasi & Hiburan']->id,
                'title' => 'Wisata Alam Puncak',
                'description' => 'Nikmati udara segar dan pemandangan kebun teh yang menakjubkan di kawasan wisata alam Puncak.',
                'address' => 'Kabupaten Bogor, Jawa Barat',
                'phone' => '08111222333',
                'email' => 'puncakwisata@example.com',
                'operating_hours' => '24 Jam',
                'website' => 'https://wisatapuncak.com',
                'image' => 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&fit=crop',
                'is_premium' => true,
                'status' => 'approved',
            ]
        ];

        foreach ($businesses as $b) {
            Business::create($b);
        }
    }
}
