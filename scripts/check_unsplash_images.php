<?php
$unsplashCount = 0;
for ($i = 1; $i <= 153; $i++) {
    $f = "frontend/public/images/businesses/biz_real_{$i}.jpg";
    if (file_exists($f)) {
        $content = file_get_contents($f);
        if (stripos($content, 'unsplash') !== false || (filesize($f) > 630000 && filesize($f) < 640000)) {
            echo "Biz $i matches Unsplash/cafe size (" . filesize($f) . " bytes)\n";
            $unsplashCount++;
        }
    }
}
echo "Total Unsplash matches: $unsplashCount\n";
