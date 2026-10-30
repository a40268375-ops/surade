<?php
$pdo = new PDO('mysql:host=127.0.0.1;dbname=surade_db', 'root', '');
$stmt = $pdo->query("
    SELECT b.id, b.name, b.tags, c.name as subcategory, p.name as parent_category
    FROM businesses b
    LEFT JOIN categories c ON b.category_id = c.id
    LEFT JOIN categories p ON c.parent_id = p.id
    WHERE b.id BETWEEN 71 AND 153
    ORDER BY b.id ASC
");
$rows = $stmt->fetchAll(PDO::FETCH_ASSOC);
foreach($rows as $r) {
    echo "ID " . str_pad($r['id'], 3) . " | " . str_pad($r['name'], 48) . " | Main: " . str_pad($r['parent_category'] ?? '-', 20) . " | Sub: " . str_pad($r['subcategory'] ?? '-', 30) . " | Tags: " . $r['tags'] . PHP_EOL;
}
