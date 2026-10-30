<?php
$pdo = new PDO('mysql:host=127.0.0.1;dbname=surade_db', 'root', '');
$stmt = $pdo->query("SELECT id, name, logo, banner FROM businesses WHERE id IN (33, 34, 35)");
$rows = $stmt->fetchAll(PDO::FETCH_ASSOC);
foreach($rows as $r) {
    echo "ID: " . $r['id'] . "\nName: " . $r['name'] . "\nLogo: " . $r['logo'] . "\nBanner: " . $r['banner'] . "\n\n";
}
