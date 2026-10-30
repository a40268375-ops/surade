<?php
$adBizIds = [1, 5, 8, 9, 13, 14, 15, 16, 18, 19, 22, 28, 29];
echo "=== TESTING ADVERTISEMENT IMAGES VIA HTTP STORAGE ===\n";
foreach ($adBizIds as $id) {
    $bannerUrl = "http://localhost:8000/storage/businesses/real_images/biz_{$id}_banner.jpg";
    $logoUrl = "http://localhost:8000/storage/businesses/real_images/biz_{$id}_logo.jpg";
    
    $bContent = @file_get_contents($bannerUrl);
    $lContent = @file_get_contents($logoUrl);
    
    echo "Biz ID {$id}:\n";
    echo "  Banner: " . ($bContent ? "✅ OK (" . strlen($bContent) . " bytes)" : "❌ FAILED") . " -> {$bannerUrl}\n";
    echo "  Logo:   " . ($lContent ? "✅ OK (" . strlen($lContent) . " bytes)" : "❌ FAILED") . " -> {$logoUrl}\n";
}
