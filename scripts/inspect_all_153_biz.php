<?php
$pdo = new PDO('mysql:host=127.0.0.1;dbname=surade_db', 'root', '');
$stmt = $pdo->query("SELECT b.id, b.name, b.address, b.banner, b.logo, b.gallery, c.name as category_name, b.tags FROM businesses b LEFT JOIN categories c ON b.category_id = c.id ORDER BY b.id ASC");
$rows = $stmt->fetchAll(PDO::FETCH_ASSOC);
echo "Total businesses: " . count($rows) . "\n";
foreach($rows as $r) {
    echo "ID: " . $r['id'] . " | " . $r['name'] . " | Cat: " . $r['category_name'] . " | Banner: " . $r['banner'] . " | Tags: " . $r['tags'] . "\n";
}
