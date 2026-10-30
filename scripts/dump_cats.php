<?php
$pdo = new PDO('mysql:host=127.0.0.1;dbname=surade_db', 'root', '');
$stmt = $pdo->query("SELECT id, parent_id, name, slug FROM categories WHERE name LIKE '%bank%' OR name LIKE '%uang%' OR name LIKE '%pos%' OR name LIKE '%emas%' OR name LIKE '%spbu%' OR name LIKE '%bensin%' OR name LIKE '%masjid%' OR name LIKE '%sekolah%' OR name LIKE '%gadai%' ORDER BY id ASC");
$rows = $stmt->fetchAll(PDO::FETCH_ASSOC);
foreach($rows as $r) {
    echo $r['id'] . ' | parent:' . ($r['parent_id'] ?? 'null') . ' | ' . $r['name'] . ' (' . $r['slug'] . ')' . PHP_EOL;
}
