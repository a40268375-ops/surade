<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Business;
use App\Models\Category;
use App\Models\User;

class BusinessesSeeder extends Seeder
{
    public function run()
    {
        // Clear existing businesses
        Business::query()->delete();

        // Get users and categories
        $users = User::where('role', 'user')->get();
        $categories = Category::whereNotNull('parent_id')->get(); // Get subcategories only

        if ($users->isEmpty()) {
            $this->command->warn('No users found. Creating sample user first...');
            $sampleUser = User::create([
                'name' => 'Sample Business Owner',
                'email' => 'owner@example.com',
                'password' => bcrypt('password'),
                'role' => 'user',
                'phone' => '081234567890',
                'email_verified_at' => now(),
            ]);
            $users = collect([$sampleUser]);
        }

        if ($categories->isEmpty()) {
            $this->command->error('No categories found. Please run CategoriesWithSubcategoriesSeeder first.');
            return;
        }

        // Sample business data with various price ranges
        $businessData = [
            [
                'title' => 'Warung Bu Sari',
                'description' => 'Warung makan tradisional dengan masakan rumahan yang lezat dan harga terjangkau. Menyajikan nasi gudeg, soto ayam, dan aneka lauk pauk.',
                'long_description' => 'Warung Bu Sari telah melayani masyarakat sekitar selama lebih dari 15 tahun. Kami bangga dengan cita rasa autentik masakan Jawa yang diwariskan turun temurun. Menu unggulan kami adalah gudeg Bu Sari yang terkenal dengan kelezatannya.',
                'address' => 'Jl. Malioboro No. 123, Yogyakarta',
                'village' => 'Desa Tegalrejo',
                'phone' => '0274-123456',
                'email' => 'info@warungbusari.com',
                'website' => 'https://warungbusari.com',
                'hours' => '06:00-22:00',
                'tags' => 'gudeg,soto,tradisional,murah',
                'status' => 'approved',
                'price_range' => 'murah',
                'latitude' => -7.7956,
                'longitude' => 110.3695,
                'category_search' => 'Warung Makan'
            ],
            [
                'title' => 'Salon Cantik Indah',
                'description' => 'Salon kecantikan modern dengan layanan lengkap untuk perawatan rambut, facial, dan nail art. Menggunakan produk berkualitas tinggi.',
                'long_description' => 'Salon Cantik Indah menghadirkan pengalaman kecantikan terbaik dengan tim stylist berpengalaman dan peralatan modern. Kami menyediakan berbagai treatment untuk mempercantik penampilan Anda.',
                'address' => 'Jl. Sudirman No. 45, Jakarta',
                'village' => 'Desa Menteng',
                'phone' => '021-789012',
                'email' => 'info@saloncantikindah.com',
                'website' => null,
                'hours' => '09:00-21:00',
                'tags' => 'salon,kecantikan,rambut,facial',
                'status' => 'approved',
                'price_range' => 'sedang',
                'latitude' => -6.2088,
                'longitude' => 106.8456,
                'category_search' => 'Salon Kecantikan'
            ],
            [
                'title' => 'Restoran Le Gourmet',
                'description' => 'Fine dining restaurant dengan menu fusion Asia-Eropa. Suasana elegan dan pelayanan premium untuk pengalaman kuliner tak terlupakan.',
                'long_description' => 'Le Gourmet menghadirkan konsep fine dining dengan perpaduan cita rasa Asia dan Eropa. Chef berpengalaman internasional menciptakan kreasi kuliner yang memanjakan lidah dengan presentation yang memukau.',
                'address' => 'Jl. Gatot Subroto Kav. 18, Jakarta',
                'village' => 'Desa Kuningan',
                'phone' => '021-456789',
                'email' => 'reservation@legourmet.com',
                'website' => 'https://legourmet.com',
                'hours' => '17:00-23:00',
                'tags' => 'fine dining,fusion,premium,romantis',
                'status' => 'approved',
                'price_range' => 'mahal',
                'latitude' => -6.2297,
                'longitude' => 106.8253,
                'category_search' => 'Restoran'
            ],
            [
                'title' => 'Kafe Corner Coffee',
                'description' => 'Kafe cozy dengan specialty coffee dan berbagai pilihan pastry. Tempat yang cocok untuk bekerja atau hangout bersama teman.',
                'long_description' => 'Corner Coffee menghadirkan pengalaman ngopi yang autentik dengan biji kopi pilihan dari berbagai daerah di Indonesia. Suasana yang nyaman dan wifi gratis menjadikan tempat ini favorit para freelancer dan mahasiswa.',
                'address' => 'Jl. Dago No. 78, Bandung',
                'village' => 'Desa Coblong',
                'phone' => '022-345678',
                'email' => 'hello@cornercoffee.id',
                'website' => 'https://cornercoffee.id',
                'hours' => '07:00-22:00',
                'tags' => 'kopi,pastry,wifi,coworking',
                'status' => 'approved',
                'price_range' => 'sedang',
                'latitude' => -6.8951,
                'longitude' => 107.6069,
                'category_search' => 'Kafe & Coffee Shop'
            ],
            [
                'title' => 'Toko Elektronik Maju Jaya',
                'description' => 'Toko elektronik terlengkap dengan berbagai merk dan harga bersaing. Menyediakan AC, TV, kulkas, dan elektronik rumah tangga lainnya.',
                'long_description' => 'Toko Elektronik Maju Jaya telah dipercaya masyarakat selama 20 tahun dalam menyediakan peralatan elektronik berkualitas. Kami memberikan garansi resmi dan after sales service yang memuaskan.',
                'address' => 'Jl. Ahmad Yani No. 234, Surabaya',
                'village' => 'Desa Gubeng',
                'phone' => '031-567890',
                'email' => 'info@majujaya.com',
                'website' => null,
                'hours' => '08:00-20:00',
                'tags' => 'elektronik,AC,TV,kulkas,garansi',
                'status' => 'approved',
                'price_range' => 'sedang',
                'latitude' => -7.2756,
                'longitude' => 112.7378,
                'category_search' => 'Elektronik'
            ],
            [
                'title' => 'Fitness Center Strong Body',
                'description' => 'Gym modern dengan peralatan lengkap dan trainer berpengalaman. Menyediakan program fitness, aerobik, dan personal training.',
                'long_description' => 'Strong Body Fitness Center adalah tempat ideal untuk mencapai tubuh sehat dan ideal Anda. Dengan fasilitas lengkap dan program training yang disesuaikan dengan kebutuhan, kami membantu Anda mencapai target fitness.',
                'address' => 'Jl. Diponegoro No. 56, Semarang',
                'village' => 'Desa Semarang Tengah',
                'phone' => '024-678901',
                'email' => 'info@strongbody.fit',
                'website' => 'https://strongbody.fit',
                'hours' => '05:00-22:00',
                'tags' => 'gym,fitness,aerobik,training',
                'status' => 'approved',
                'price_range' => 'sedang',
                'latitude' => -6.9787,
                'longitude' => 110.4100,
                'category_search' => 'Fitness & Gym'
            ],
            [
                'title' => 'Laundry Express 24 Jam',
                'description' => 'Layanan laundry kiloan dan satuan 24 jam dengan pickup dan delivery gratis. Bersih, wangi, dan harga terjangkau.',
                'long_description' => 'Laundry Express hadir untuk memudahkan hidup Anda dengan layanan cuci pakaian profesional. Kami menggunakan deterjen berkualitas dan proses pencucian yang higienis.',
                'address' => 'Jl. Veteran No. 89, Malang',
                'village' => 'Desa Klojen',
                'phone' => '0341-789012',
                'email' => 'order@laundryexpress.com',
                'website' => null,
                'hours' => '24 Jam',
                'tags' => 'laundry,kiloan,24jam,pickup',
                'status' => 'approved',
                'price_range' => 'murah',
                'latitude' => -7.9666,
                'longitude' => 112.6326,
                'category_search' => 'Laundry'
            ],
            [
                'title' => 'Hotel Bintang Lima Megah',
                'description' => 'Hotel mewah bintang lima dengan fasilitas lengkap. Kamar yang elegant, restoran berkelas, spa, dan kolam renang.',
                'long_description' => 'Hotel Bintang Lima Megah menghadirkan kemewahan dan kenyamanan tingkat internasional. Setiap detail dirancang untuk memberikan pengalaman menginap yang tak terlupakan.',
                'address' => 'Jl. Thamrin No. 1, Jakarta',
                'village' => 'Desa Menteng',
                'phone' => '021-890123',
                'email' => 'reservation@hotelmegah.com',
                'website' => 'https://hotelmegah.com',
                'hours' => '24 Jam',
                'tags' => 'hotel,mewah,bintang lima,spa',
                'status' => 'approved',
                'price_range' => 'mahal',
                'latitude' => -6.1944,
                'longitude' => 106.8229,
                'category_search' => 'Hotel'
            ]
        ];

        foreach ($businessData as $data) {
            // Find category by name
            $category = $categories->first(function ($cat) use ($data) {
                return stripos($cat->name, $data['category_search']) !== false;
            });

            if (!$category) {
                // Fall back to random category if not found
                $category = $categories->random();
            }

            // Assign to random user
            $user = $users->random();

            // Create business
            Business::create([
                'user_id' => $user->id,
                'category_id' => $category->id,
                'title' => $data['title'],
                'description' => $data['description'],
                'address' => $data['address'],
                'village' => $data['village'],
                'latitude' => $data['latitude'],
                'longitude' => $data['longitude'],
                'phone' => $data['phone'],
                'email' => $data['email'],
                'website' => $data['website'],
                'operating_hours' => $data['hours'],
                'tags' => $data['tags'],
                'status' => $data['status'],
                'is_premium' => rand(0, 1) == 1, // Random premium status
                'images' => json_encode([]), // Empty gallery for now
                'closed_days' => json_encode([]), // Open all days
                'created_at' => now()->subDays(rand(1, 30)),
                'updated_at' => now()->subDays(rand(0, 7)),
            ]);
        }

        $this->command->info('Sample businesses have been seeded successfully!');
    }
}