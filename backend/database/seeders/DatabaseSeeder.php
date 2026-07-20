<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    public function run(): void
    {
        $this->call([
            CategorySeeder::class,
            PlanSeeder::class,
            UserSeeder::class,
            BusinessSeeder::class,
            BusinessMediaSeeder::class,
            BlogSeeder::class,
        ]);
    }
}