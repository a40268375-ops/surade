<?php
$pdo = new PDO('mysql:host=127.0.0.1;dbname=surade_db', 'root', '');
$tables = $pdo->query("SHOW TABLES")->fetchAll(PDO::FETCH_COLUMN);
echo "TABLES:\n" . implode(', ', $tables) . "\n\n";

foreach (['advertisements', 'businesses', 'products', 'reviews', 'ratings'] as $t) {
    if (in_array($t, $tables)) {
        $cols = $pdo->query("DESCRIBE $t")->fetchAll(PDO::FETCH_ASSOC);
        echo "=== TABLE: $t ===\n";
        foreach ($cols as $c) {
            echo "  " . $c['Field'] . " (" . $c['Type'] . ")\n";
        }
        $count = $pdo->query("SELECT COUNT(*) FROM $t")->fetchColumn();
        echo "  Total Rows: $count\n\n";
    }
}
