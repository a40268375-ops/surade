<?php
$pdo = new PDO('mysql:host=127.0.0.1;dbname=surade_db', 'root', '');
$stmt = $pdo->query("SELECT id, name FROM businesses ORDER BY id ASC");
$businesses = $stmt->fetchAll(PDO::FETCH_ASSOC);

$updateStmt = $pdo->prepare("UPDATE businesses SET banner = :banner, logo = :logo, gallery = :gallery WHERE id = :id");

$count = 0;
foreach ($businesses as $b) {
    $id = $b['id'];
    $img = "/images/businesses/biz_real_{$id}.jpg";
    $gallery = json_encode([$img]);
    $updateStmt->execute([
        ':banner' => $img,
        ':logo' => $img,
        ':gallery' => $gallery,
        ':id' => $id
    ]);
    $count++;
}

echo "Successfully updated database images for {$count} businesses in surade_db.\n";
