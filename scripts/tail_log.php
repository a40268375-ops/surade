<?php
$logPath = __DIR__ . '/../backend/storage/logs/laravel.log';
$content = file_get_contents($logPath);
$pos = strrpos($content, 'local.ERROR');
if ($pos !== false) {
    echo substr($content, $pos, 1000);
}
