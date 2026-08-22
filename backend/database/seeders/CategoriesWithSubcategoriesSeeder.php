<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Category;

class CategoriesWithSubcategoriesSeeder extends Seeder
{
    public function run()
    {
        // First, clear existing categories to avoid conflicts
        Category::query()->delete();

        // Define main categories with their subcategories
        $categoriesData = [
            [
                'name' => 'Makanan & Minuman',
                'slug' => 'makanan-minuman',
                'icon' => 'utensils',
                'color' => '#f59e0b',
                'description' => 'Semua jenis usaha kuliner dan minuman',
                'subcategories' => [
                    'Restoran',
                    'Warung Makan',
                    'Kafe & Coffee Shop',
                    'Bakery & Pastry',
                    'Street Food',
                    'Catering',
                    'Minuman Segar',
                    'Fast Food'
                ]
            ],
            [
                'name' => 'Jasa & Servis',
                'slug' => 'jasa-servis',
                'icon' => 'wrench',
                'color' => '#10b981',
                'description' => 'Layanan jasa profesional dan servis',
                'subcategories' => [
                    'Salon & Barbershop',
                    'Spa & Massage',
                    'Laundry',
                    'Reparasi Elektronik',
                    'Jasa Cleaning',
                    'Jasa Fotografer',
                    'Event Organizer',
                    'Konsultan'
                ]
            ],
            [
                'name' => 'Retail & Belanja',
                'slug' => 'retail-belanja',
                'icon' => 'shopping-bag',
                'color' => '#8b5cf6',
                'description' => 'Toko dan tempat belanja',
                'subcategories' => [
                    'Fashion & Pakaian',
                    'Aksesoris',
                    'Sepatu & Tas',
                    'Elektronik',
                    'Handphone & Gadget',
                    'Buku & Alat Tulis',
                    'Mainan Anak',
                    'Souvenir & Gift'
                ]
            ],
            [
                'name' => 'Kesehatan & Kecantikan',
                'slug' => 'kesehatan-kecantikan',
                'icon' => 'heart',
                'color' => '#ef4444',
                'description' => 'Layanan kesehatan dan kecantikan',
                'subcategories' => [
                    'Klinik & Dokter',
                    'Apotek',
                    'Dentist',
                    'Optik',
                    'Salon Kecantikan',
                    'Fitness & Gym',
                    'Yoga Studio',
                    'Terapi & Rehabilitasi'
                ]
            ],
            [
                'name' => 'Transportasi',
                'slug' => 'transportasi',
                'icon' => 'car',
                'color' => '#3b82f6',
                'description' => 'Jasa transportasi dan otomotif',
                'subcategories' => [
                    'Rental Mobil',
                    'Ojek Online',
                    'Travel & Tour',
                    'Bengkel Mobil',
                    'Bengkel Motor',
                    'Cuci Mobil',
                    'Parkir',
                    'SPBU'
                ]
            ],
            [
                'name' => 'Pendidikan',
                'slug' => 'pendidikan',
                'icon' => 'book',
                'color' => '#06b6d4',
                'description' => 'Layanan pendidikan dan kursus',
                'subcategories' => [
                    'Sekolah',
                    'Universitas',
                    'Bimbingan Belajar',
                    'Kursus Bahasa',
                    'Kursus Komputer',
                    'Kursus Musik',
                    'Les Privat',
                    'Daycare'
                ]
            ],
            [
                'name' => 'Hiburan & Rekreasi',
                'slug' => 'hiburan-rekreasi',
                'icon' => 'gamepad',
                'color' => '#f97316',
                'description' => 'Tempat hiburan dan rekreasi',
                'subcategories' => [
                    'Bioskop',
                    'Karaoke',
                    'Game Center',
                    'Bowling',
                    'Billiard',
                    'Taman Bermain',
                    'Wisata Alam',
                    'Museum'
                ]
            ],
            [
                'name' => 'Properti & Konstruksi',
                'slug' => 'properti-konstruksi',
                'icon' => 'home',
                'color' => '#84cc16',
                'description' => 'Jasa properti dan konstruksi',
                'subcategories' => [
                    'Developer',
                    'Agen Properti',
                    'Kontraktor',
                    'Arsitek',
                    'Interior Design',
                    'Tukang Bangunan',
                    'Material Bangunan',
                    'Furniture'
                ]
            ],
            [
                'name' => 'Hotel & Penginapan',
                'slug' => 'hotel-penginapan',
                'icon' => 'bed',
                'color' => '#ec4899',
                'description' => 'Akomodasi dan penginapan',
                'subcategories' => [
                    'Hotel',
                    'Guest House',
                    'Homestay',
                    'Villa',
                    'Penginapan Budget',
                    'Resort',
                    'Kos-kosan',
                    'Apartemen'
                ]
            ],
            [
                'name' => 'Keuangan & Asuransi',
                'slug' => 'keuangan-asuransi',
                'icon' => 'dollar-sign',
                'color' => '#059669',
                'description' => 'Layanan keuangan dan asuransi',
                'subcategories' => [
                    'Bank',
                    'ATM',
                    'Money Changer',
                    'Asuransi',
                    'Investasi',
                    'Pegadaian',
                    'Koperasi',
                    'Fintech'
                ]
            ]
        ];

        // Create main categories and their subcategories
        foreach ($categoriesData as $categoryData) {
            $mainCategory = Category::create([
                'parent_id' => null,
                'name' => $categoryData['name'],
                'slug' => $categoryData['slug'],
                'icon' => $categoryData['icon'],
                'color' => $categoryData['color'],
                'description' => $categoryData['description'],
                'status' => 'active',
            ]);

            // Create subcategories
            foreach ($categoryData['subcategories'] as $subcategoryName) {
                Category::create([
                    'parent_id' => $mainCategory->id,
                    'name' => $subcategoryName,
                    'slug' => \Str::slug($subcategoryName),
                    'icon' => 'tag',
                    'color' => $categoryData['color'],
                    'description' => "Kategori $subcategoryName dalam {$categoryData['name']}",
                    'status' => 'active',
                ]);
            }
        }

        $this->command->info('Categories and subcategories have been seeded successfully!');
    }
}