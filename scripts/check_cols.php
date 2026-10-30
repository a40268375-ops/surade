<?php
$pdo = new PDO('mysql:host=127.0.0.1;dbname=surade_db;charset=utf8mb4', 'root', '');
$q = $pdo->query('DESCRIBE businesses');
print_r($q->fetchAll(PDO::FETCH_ASSOC));
