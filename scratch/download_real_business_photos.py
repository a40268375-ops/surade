import urllib.request
import urllib.parse
import ssl
import json
import re
import os
import time

ctx = ssl._create_unverified_context()
headers = {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36',
    'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8',
    'Accept-Language': 'id-ID,id;q=0.9,en-US;q=0.8,en;q=0.7',
}

# Directories to store real downloaded photos
frontend_dir = os.path.abspath(r"c:\Project\Info.co.id\frontend\public\images\businesses")
backend_dir = os.path.abspath(r"c:\Project\Info.co.id\backend\storage\app\public\businesses")

os.makedirs(frontend_dir, exist_ok=True)
os.makedirs(backend_dir, exist_ok=True)

# 22 Businesses with precise search queries for their real storefront / location
businesses_queries = [
    {
        'slug': 'kopi-toko-djawa',
        'name': 'Kopi Toko Djawa',
        'query_banner': 'Kopi Toko Djawa Braga Bandung storefront tampak depan',
        'query_logo': 'logo Kopi Toko Djawa Bandung',
    },
    {
        'slug': 'warung-kopi-klotok-pakem',
        'name': 'Warung Kopi Klotok Pakem',
        'query_banner': 'Warung Kopi Klotok Pakem Sleman joglo warung',
        'query_logo': 'Warung Kopi Klotok pisang goreng telur krispi',
    },
    {
        'slug': 'roti-romi-kemang',
        'name': 'Roti Romi Kemang',
        'query_banner': 'Roti Romi Kemang Jakarta cafe gedung',
        'query_logo': 'Roti Romi Kemang roti jadul bakar',
    },
    {
        'slug': 'batik-danar-hadi-heritage',
        'name': 'Batik Danar Hadi Heritage',
        'query_banner': 'House of Danar Hadi Solo Slamet Riyadi museum gedung',
        'query_logo': 'logo Batik Danar Hadi Solo',
    },
    {
        'slug': 'saung-pak-ewok-sop-buah',
        'name': 'Saung Pak Ewok Sop Buah',
        'query_banner': 'Saung Pak Ewok Bogor sop buah resto',
        'query_logo': 'sop buah Saung Pak Ewok Bogor',
    },
    {
        'slug': 'sate-maranggi-hj-yetty-cibungur',
        'name': 'Sate Maranggi Hj. Yetty Cibungur',
        'query_banner': 'Sate Maranggi Hj Yetty Cibungur Purwakarta resto rumah makan',
        'query_logo': 'sate maranggi hj yetty cibungur purwakarta piring sambal',
    },
    {
        'slug': 'cuanki-batagor-serayu',
        'name': 'Cuanki & Batagor Serayu',
        'query_banner': 'Cuanki Serayu Bandung Jl Serayu Cihapit warung gerobak',
        'query_logo': 'mangkok cuanki serayu bandung batagor',
    },
    {
        'slug': 'gudeg-yu-djum-wijilan-167',
        'name': 'Gudeg Yu Djum Wijilan 167',
        'query_banner': 'Gudeg Yu Djum Wijilan 167 Yogyakarta warung tampak depan',
        'query_logo': 'Gudeg Yu Djum Wijilan kendil piring',
    },
    {
        'slug': 'tahu-gimbal-pak-h-edy',
        'name': 'Tahu Gimbal Pak H. Edy',
        'query_banner': 'Tahu Gimbal Pak H Edy Pandanaran Semarang warung',
        'query_logo': 'piring tahu gimbal pak h edy semarang',
    },
    {
        'slug': 'seblak-teh-betty-cikutra',
        'name': 'Seblak Teh Betty Cikutra',
        'query_banner': 'Seblak Teh Betty Cikutra Bandung prasmanan resto',
        'query_logo': 'mangkok seblak teh betty prasmanan',
    },
    {
        'slug': 'bengkel-motor-rejeki-abadi',
        'name': 'Bengkel Motor Rejeki Abadi',
        'query_banner': 'bengkel motor servis motor cinere ruko',
        'query_logo': 'mekanik servis motor bengkel',
    },
    {
        'slug': 'barbershop-raja-cukur',
        'name': 'Barbershop Raja Cukur',
        'query_banner': 'barbershop potong rambut pria cimahi kursi barber',
        'query_logo': 'barbershop logo pria cermin kursi',
    },
    {
        'slug': 'toko-kain-pronto-moda-pasar-baru',
        'name': 'Toko Kain Pronto Moda Pasar Baru',
        'query_banner': 'Pronto Moda Pasar Baru Jakarta toko tekstil kain',
        'query_logo': 'kain sutra tekstil pronto moda pasar baru',
    },
    {
        'slug': 'warung-makan-mak-beng-sanur',
        'name': 'Warung Makan Mak Beng Sanur',
        'query_banner': 'Warung Mak Beng Sanur Bali tampak depan restoran',
        'query_logo': 'ikan goreng sup kepala ikan mak beng sanur',
    },
    {
        'slug': 'laundry-koin-express-bersih-rapi',
        'name': 'Laundry Koin Express Bersih Rapi',
        'query_banner': 'laundry koin surabaya mesin cuci koin deretan',
        'query_logo': 'laundry koin express bersih rapi',
    },
    {
        'slug': 'apotek-k-24-margonda-raya',
        'name': 'Apotek K-24 Margonda Raya',
        'query_banner': 'Apotek K-24 Margonda Depok tampak depan gedung 24 jam',
        'query_logo': 'logo Apotek K-24 kuning hijau merah',
    },
    {
        'slug': 'toko-buku-togamas-buah-batu',
        'name': 'Toko Buku Togamas Buah Batu',
        'query_banner': 'Toko Buku Togamas Buah Batu Bandung tampak depan gedung',
        'query_logo': 'logo Toko Buku Togamas diskon',
    },
    {
        'slug': 'kopi-nako-kebon-jati',
        'name': 'Kopi Nako Kebon Jati',
        'query_banner': 'Kopi Nako Kebon Jati Bogor kaca pohon jati outdoor',
        'query_logo': 'gelas Kopi Nako es kopi susu',
    },
    {
        'slug': 'percetakan-grafika-mandiri-salemba',
        'name': 'Percetakan Grafika Mandiri Salemba',
        'query_banner': 'percetakan salemba jakarta pusat mesin digital printing toko',
        'query_logo': 'digital printing percetakan offset salemba',
    },
    {
        'slug': 'pecel-lele-si-doel-99',
        'name': 'Pecel Lele Si Doel 99',
        'query_banner': 'warung tenda pecel lele serpong spanduk malam',
        'query_logo': 'pecel lele sambal lamongan goreng garing',
    },
    {
        'slug': 'toko-buah-berkah-segar-melawai',
        'name': 'Toko Buah Berkah Segar Melawai',
        'query_banner': 'toko buah segar melawai kebayoran baru rak buah',
        'query_logo': 'buah segar alpukat mangga parcel buah',
    },
    {
        'slug': 'dbesto-fried-chicken-cipayung',
        'name': "D'Besto Fried Chicken Cipayung",
        'query_banner': 'dbesto fried chicken outlet gerai merah kuning',
        'query_logo': 'logo dbesto fried chicken ayam krispi',
    },
]

def search_bing_images(query):
    url = 'https://www.bing.com/images/search?q=' + urllib.parse.quote(query) + '&first=1'
    req = urllib.request.Request(url, headers=headers)
    try:
        html = urllib.request.urlopen(req, context=ctx, timeout=10).read().decode('utf-8', errors='ignore')
        murls = re.findall(r'murl&quot;:&quot;(https?://[^&]+)&quot;', html)
        if not murls:
            murls = re.findall(r'murl":"(https?://[^"]+)"', html)
        valid = [u for u in murls if any(u.lower().endswith(ext) or ext in u.lower() for ext in ['.jpg', '.jpeg', '.png', '.webp'])]
        return valid
    except Exception as e:
        print(f"Error searching '{query}': {e}")
        return []

def download_file(url, target_path):
    try:
        req = urllib.request.Request(url, headers=headers)
        with urllib.request.urlopen(req, context=ctx, timeout=15) as response:
            content = response.read()
            if len(content) > 3000: # at least 3KB
                with open(target_path, 'wb') as f:
                    f.write(content)
                return True
    except Exception as e:
        # print(f"Download failed for {url}: {e}")
        pass
    return False

results_map = {}

print(f"Starting real photo fetching for {len(businesses_queries)} authentic Indonesian businesses...\n")

for item in businesses_queries:
    slug = item['slug']
    print(f"--> Mencari foto asli untuk: {item['name']}...")
    
    # 1. Banner (Tampak Tempat / Suasana Asli)
    banner_filename = f"{slug}-banner.jpg"
    banner_frontend = os.path.join(frontend_dir, banner_filename)
    banner_backend = os.path.join(backend_dir, banner_filename)
    
    banner_downloaded = False
    banner_urls = search_bing_images(item['query_banner'])
    for url in banner_urls[:5]:
        if download_file(url, banner_frontend):
            # copy to backend as well
            with open(banner_frontend, 'rb') as src, open(banner_backend, 'wb') as dst:
                dst.write(src.read())
            print(f"   [OK] Banner asli terunduh dari: {url[:70]}...")
            banner_downloaded = True
            break
            
    # 2. Logo / Signature Product
    logo_filename = f"{slug}-logo.jpg"
    logo_frontend = os.path.join(frontend_dir, logo_filename)
    logo_backend = os.path.join(backend_dir, logo_filename)
    
    logo_downloaded = False
    logo_urls = search_bing_images(item['query_logo'])
    for url in logo_urls[:5]:
        if download_file(url, logo_frontend):
            with open(logo_frontend, 'rb') as src, open(logo_backend, 'wb') as dst:
                dst.write(src.read())
            print(f"   [OK] Logo/Produk asli terunduh dari: {url[:70]}...")
            logo_downloaded = True
            break
            
    results_map[slug] = {
        'banner': f"/images/businesses/{banner_filename}" if banner_downloaded else None,
        'logo': f"/images/businesses/{logo_filename}" if logo_downloaded else None,
    }
    time.sleep(0.5)

# Save results map to json
with open(os.path.abspath(r"c:\Project\Info.co.id\scratch\real_photos_map.json"), 'w') as f:
    json.dump(results_map, f, indent=2)

print("\nPencarian dan pengunduhan seluruh foto nyata tempat usaha selesai!")
