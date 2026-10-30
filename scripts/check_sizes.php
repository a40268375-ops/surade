<?php
$similar = [];
for ($i = 1; $i <= 153; $i++) {
    $f = "frontend/public/images/businesses/biz_real_{$i}.jpg";
    if (file_exists($f)) {
        $size = filesize($f);
        echo "Biz $i: $size bytes\n";
    }
}
