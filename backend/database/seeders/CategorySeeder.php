<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Category;

class CategorySeeder extends Seeder
{
    public function run(): void
    {
        $categories = [
            ['name' => 'Bisnis & Market', 'slug' => 'bisnis-market', 'icon' => 'store'],
            ['name' => 'Cafe & Restaurant', 'slug' => 'cafe-restaurant', 'icon' => 'coffee'],
            ['name' => 'Elektronik & Gadget', 'slug' => 'elektronik-gadget', 'icon' => 'smartphone'],
            ['name' => 'Fashion', 'slug' => 'fashion', 'icon' => 'shirt'],
            ['name' => 'Servis & Tukang', 'slug' => 'servis-tukang', 'icon' => 'wrench'],
            ['name' => 'Wisata', 'slug' => 'wisata', 'icon' => 'map-pin'],
        ];

        foreach ($categories as $category) {
            Category::firstOrCreate(
                ['slug' => $category['slug']],
                $category
            );
        }
    }
}
