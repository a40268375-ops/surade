<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    public function run(): void
    {
        $this->call([
            CategorySeeder::class,
            NavbarCategorySeeder::class,
            PlanSeeder::class,
            UserSeeder::class,
            AdminUserSeeder::class,
            RealDataSeeder::class,
            BusinessProductSeeder::class, // Add products to all businesses
            ContentPackageSeeder::class,
            SmartCitySeeder::class,
            AuthenticSuradeBusinessesSeeder::class,
        ]);
    }
}