<?php
// Let's check all biz_real_*.jpg files and list their sizes and inspect if any have duplicate sizes or suspicious headers
$sizes = [];
for ($i = 1; $i <= 153; $i++) {
    $f = "frontend/public/images/businesses/biz_real_{$i}.jpg";
    if (!file_exists($f)) {
        echo "MISSING: Biz $i\n";
        continue;
    }
    $size = filesize($f);
    $sizes[$size][] = $i;
}

echo "--- Grouped by identical file size ---\n";
foreach ($sizes as $s => $bizIds) {
    if (count($bizIds) > 1) {
        echo "Size {$s} bytes shared by: " . implode(', ', $bizIds) . "\n";
    }
}
