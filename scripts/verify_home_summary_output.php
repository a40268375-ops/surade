<?php
require 'backend/vendor/autoload.php';
$app = require_once 'backend/bootstrap/app.php';
$app->make('Illuminate\Contracts\Console\Kernel')->bootstrap();

$controller = new \App\Http\Controllers\Api\BusinessController();
$res = $controller->homeSummary();
$data = json_decode($res->getContent(), true);

echo "Total businesses in home summary: " . count($data['businesses']) . PHP_EOL . PHP_EOL;
echo "=== 6 USAHA PERTAMA DI HALAMAN DEPAN (USAHA POPULER / HALAMAN 1) ===" . PHP_EOL;
for ($i = 0; $i < min(6, count($data['businesses'])); $i++) {
    $b = $data['businesses'][$i];
    $cat = $b['category']['name'] ?? 'Kategori';
    echo ($i + 1) . ". " . $b['name'] . " (" . $cat . " - " . $b['city'] . ")" . PHP_EOL;
    echo "   Foto: " . ($b['banner'] ?? $b['logo']) . PHP_EOL;
}

echo PHP_EOL . "=== 6 USAHA DI HALAMAN 2 ===" . PHP_EOL;
for ($i = 6; $i < min(12, count($data['businesses'])); $i++) {
    $b = $data['businesses'][$i];
    $cat = $b['category']['name'] ?? 'Kategori';
    echo ($i + 1) . ". " . $b['name'] . " (" . $cat . " - " . $b['city'] . ")" . PHP_EOL;
    echo "   Foto: " . ($b['banner'] ?? $b['logo']) . PHP_EOL;
}
