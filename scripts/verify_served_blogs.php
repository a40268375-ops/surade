<?php
$res = file_get_contents('http://localhost:8000/api/blogs?all=true');
$json = json_decode($res, true);
$blogs = $json['data'] ?? $json;
echo "=== BLOGS (Total: " . count($blogs) . ") ===\n";
foreach ($blogs as $b) {
    echo "ID: {$b['id']} | Category: {$b['blog_category']}\n";
    echo "  Title: {$b['title']}\n";
    echo "  Thumb: {$b['thumbnail']}\n";
    $imgUrl = "http://localhost:8000/storage/" . $b['thumbnail'];
    $content = @file_get_contents($imgUrl);
    echo "  HTTP Check: " . ($content ? "✅ OK (" . strlen($content) . " bytes)" : "❌ FAIL") . "\n";
}

$resEvents = file_get_contents('http://localhost:8000/api/events');
$jsonEvents = json_decode($resEvents, true);
$events = $jsonEvents['data'] ?? $jsonEvents;
echo "\n=== EVENTS (Total: " . count($events) . ") ===\n";
foreach ($events as $e) {
    echo "ID: {$e['id']} | Category: {$e['blog_category']}\n";
    echo "  Title: {$e['title']}\n";
    echo "  Location: {$e['event_location']}\n";
    echo "  Date: {$e['event_date']}\n";
    echo "  Thumb: {$e['thumbnail']}\n";
    $imgUrl = "http://localhost:8000/storage/" . $e['thumbnail'];
    $content = @file_get_contents($imgUrl);
    echo "  HTTP Check: " . ($content ? "✅ OK (" . strlen($content) . " bytes)" : "❌ FAIL") . "\n";
}
