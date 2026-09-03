import urllib.request
import urllib.parse
import ssl
import re
import os
import time

ctx = ssl._create_unverified_context()
headers = {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36',
    'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
}

frontend_dir = os.path.abspath(r"c:\Project\Info.co.id\frontend\public\images\businesses")
backend_dir = os.path.abspath(r"c:\Project\Info.co.id\backend\storage\app\public\businesses")

os.makedirs(frontend_dir, exist_ok=True)
os.makedirs(backend_dir, exist_ok=True)

new_businesses = [
    {
        'slug': 'sop-buntut-cut-meutia',
        'name': 'Sop Buntut Cut Meutia',
        'query_banner': 'Sop Buntut Cut Meutia Menteng tampak depan restoran',
        'query_logo': 'Sop Buntut Cut Meutia semangkuk sup',
    },
    {
        'slug': 'bakso-bakar-pak-man-malang',
        'name': 'Bakso Bakar Pak Man Malang',
        'query_banner': 'Bakso Bakar Pak Man Malang warung',
        'query_logo': 'Bakso Bakar Pak Man Malang tusuk bumbu',
    },
    {
        'slug': 'pia-legong-kuta-bali',
        'name': 'Pia Legong Kuta Bali',
        'query_banner': 'Pia Legong Bypass Ngurah Rai Bali toko depan',
        'query_logo': 'Pia Legong Bali kemasan kotak asli',
    },
    {
        'slug': 'kopi-es-tak-kie-glodok',
        'name': 'Kopi Es Tak Kie Glodok',
        'query_banner': 'Kopi Es Tak Kie Glodok kedai kopi tua',
        'query_logo': 'Kopi Es Tak Kie es kopi susu gelas',
    },
]

def search_bing_images(query):
    url = 'https://www.bing.com/images/search?q=' + urllib.parse.quote(query) + '&first=1'
    try:
        req = urllib.request.Request(url, headers=headers)
        html = urllib.request.urlopen(req, context=ctx, timeout=10).read().decode('utf-8', errors='ignore')
        
        murls = re.findall(r'mediaurl=(https?%3a%2f%2f.*?)&', html, re.IGNORECASE)
        murls = [urllib.parse.unquote(x) for x in murls]
        
        clean = []
        for u in murls:
            low = u.lower()
            if any(ext in low for ext in ['.jpg', '.jpeg', '.png', '.webp']) and not any(bad in low for bad in ['shutterstock', 'dreamstime', 'alamy', 'vector', 'stock']):
                clean.append(u)
        return clean
    except Exception as e:
        print(f"Error searching '{query}': {e}")
        return []

def download_file(url, target_path):
    try:
        req = urllib.request.Request(url, headers=headers)
        with urllib.request.urlopen(req, context=ctx, timeout=15) as response:
            content = response.read()
            if len(content) > 3000:
                with open(target_path, 'wb') as f:
                    f.write(content)
                return True
    except Exception as e:
        pass
    return False

print("Memulai pengunduhan foto nyata tempat usaha 4 UMKM...\n")

for item in new_businesses:
    slug = item['slug']
    print(f"--> Bisnis: {item['name']}")

    # 1. Banner
    banner_file = f"{slug}-banner.jpg"
    banner_frontend = os.path.join(frontend_dir, banner_file)
    banner_backend = os.path.join(backend_dir, banner_file)
    banner_urls = search_bing_images(item['query_banner'])
    for url in banner_urls:
        if download_file(url, banner_frontend):
            with open(banner_frontend, 'rb') as s, open(banner_backend, 'wb') as d:
                d.write(s.read())
            print(f"   [OK] Banner: {url[:75]}...")
            break

    # 2. Logo / Signature Product
    logo_file = f"{slug}-logo.jpg"
    logo_frontend = os.path.join(frontend_dir, logo_file)
    logo_backend = os.path.join(backend_dir, logo_file)
    logo_urls = search_bing_images(item['query_logo'])
    for url in logo_urls:
        if download_file(url, logo_frontend):
            with open(logo_frontend, 'rb') as s, open(logo_backend, 'wb') as d:
                d.write(s.read())
            print(f"   [OK] Logo/Produk: {url[:75]}...")
            break
            
    time.sleep(0.5)

print("\nPengunduhan foto selesai!")
