<?php
$pdo = new PDO('mysql:host=127.0.0.1;dbname=surade_db', 'root', '');
$stmt = $pdo->query("SELECT b.id, b.name, b.address, b.category_id, b.banner, b.logo, c.name as category_name, b.tags, b.description FROM businesses b LEFT JOIN categories c ON b.category_id = c.id ORDER BY b.id ASC");
$rows = $stmt->fetchAll(PDO::FETCH_ASSOC);
file_put_contents(__DIR__ . '/all_153_businesses_raw.json', json_encode($rows, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE));
echo "Dumped " . count($rows) . " businesses to all_153_businesses_raw.json\n";
