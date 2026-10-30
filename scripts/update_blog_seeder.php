<?php
require __DIR__ . '/../backend/vendor/autoload.php';

$jsonFile = __DIR__ . '/../real_downloaded_blogs.json';
$seederFile = __DIR__ . '/../backend/database/seeders/BlogSeeder.php';

$items = json_decode(file_get_contents($jsonFile), true);

$code = "<?php\n\nnamespace Database\\Seeders;\n\nuse Illuminate\\Database\\Seeder;\nuse App\\Models\\Blog;\nuse App\\Models\\User;\nuse Illuminate\\Support\\Str;\nuse Illuminate\\Support\\Facades\\DB;\n\nclass BlogSeeder extends Seeder\n{\n    public function run(): void\n    {\n        \$user = User::where('email', 'admin@surade.com')->first() ?? User::first();\n        \$userId = \$user ? \$user->id : 1;\n        \$categories = DB::table('blog_categories')->pluck('id', 'name')->toArray();\n\n        \$blogs = " . var_export($items, true) . ";\n\n        foreach (\$blogs as \$item) {\n            \$catId = \$categories[\$item['category']] ?? 1;\n            \$slug = Str::slug(\$item['title']);\n\n            Blog::updateOrCreate(\n                ['slug' => \$slug],\n                [\n                    'user_id' => \$userId,\n                    'title' => \$item['title'],\n                    'slug' => \$slug,\n                    'excerpt' => \$item['excerpt'],\n                    'content' => trim(\$item['content']),\n                    'thumbnail' => \$item['thumbnail'],\n                    'images' => [\$item['thumbnail']],\n                    'blog_category_id' => \$catId,\n                    'blog_category' => \$item['category'],\n                    'type' => \$item['type'],\n                    'status' => 'published',\n                    'published_at' => \$item['published_at'] ?? now(),\n                    'event_date' => \$item['event_date'],\n                    'event_end_date' => \$item['event_end_date'],\n                    'event_location' => \$item['event_location'],\n                    'views' => rand(90, 420),\n                ]\n            );\n        }\n    }\n}\n";

file_put_contents($seederFile, $code);
echo "BlogSeeder.php successfully updated with 20 real Blogs & Events!\n";
