<?php
$pdo = new PDO('mysql:host=127.0.0.1;dbname=surade_db;charset=utf8mb4', 'root', '');
$stmt = $pdo->query('SELECT id, name, banner, logo FROM businesses WHERE id IN (10, 15, 76, 95, 150)');
$rows = $stmt->fetchAll(PDO::FETCH_ASSOC);
print_r($rows);

foreach ($rows as $r) {
    $id = $r['id'];
    $frontFile = "frontend/public/images/businesses/biz_real_{$id}.jpg";
    if (file_exists($frontFile)) {
        echo "ID {$id}: size=" . filesize($frontFile) . ", md5=" . md5_file($frontFile) . PHP_EOL;
    } else {
        echo "ID {$id}: NOT FOUND ($frontFile)" . PHP_EOL;
    }
}
