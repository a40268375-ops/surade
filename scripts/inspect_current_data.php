<?php
$pdo = new PDO('mysql:host=127.0.0.1;dbname=surade_db', 'root', '');
$pCount = $pdo->query("SELECT COUNT(*) FROM products")->fetchColumn();
$rCount = $pdo->query("SELECT COUNT(*) FROM ratings")->fetchColumn();
$aCount = $pdo->query("SELECT COUNT(*) FROM advertisements")->fetchColumn();
$bCount = $pdo->query("SELECT COUNT(*) FROM businesses")->fetchColumn();
$vCount = $pdo->query("SELECT COUNT(*) FROM businesses WHERE is_verified = 1 OR is_premium = 1")->fetchColumn();

echo "Businesses: $bCount\n";
echo "Verified/Premium Businesses: $vCount\n";
echo "Products: $pCount\n";
echo "Ratings/Reviews: $rCount\n";
echo "Advertisements: $aCount\n";

$sampleProducts = $pdo->query("SELECT p.id, p.business_id, b.name as biz_name, p.name as prod_name, p.price, p.image FROM products p JOIN businesses b ON p.business_id = b.id LIMIT 5")->fetchAll(PDO::FETCH_ASSOC);
echo "\nSample Products:\n";
print_r($sampleProducts);
