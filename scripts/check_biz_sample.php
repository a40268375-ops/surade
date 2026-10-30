<?php
$pdo = new PDO('mysql:host=127.0.0.1;dbname=surade_db', 'root', '');
$stmt = $pdo->query("SELECT b.id, b.name, b.address, b.banner, b.logo, c.name as cat, b.tags FROM businesses b LEFT JOIN categories c ON b.category_id = c.id WHERE b.id BETWEEN 30 AND 45 ORDER BY b.id ASC");
$rows = $stmt->fetchAll(PDO::FETCH_ASSOC);
foreach($rows as $r) {
    echo "ID: " . $r['id'] . " | " . $r['name'] . " | Cat: " . $r['cat'] . " | Banner: " . $r['banner'] . "\n";
}
