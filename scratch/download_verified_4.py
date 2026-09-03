import urllib.request
import urllib.parse
import ssl
import re
import os

ctx = ssl._create_unverified_context()
headers = {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36',
    'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
}

frontend_dir = os.path.abspath(r"c:\Project\Info.co.id\frontend\public\images\businesses")
backend_dir = os.path.abspath(r"c:\Project\Info.co.id\backend\storage\app\public\businesses")

os.makedirs(frontend_dir, exist_ok=True)
os.makedirs(backend_dir, exist_ok=True)

targets = [
    {
        'slug': 'sop-buntut-cut-meutia',
        'name': 'Sop Buntut Cut Meutia',
        'banner_candidates': [
            'https://manual.co.id/wp-content/uploads/2017/05/Sop-Buntut-Cut-Meutia-Street_Menteng-11-980x719.jpg',
            'https://img.restaurantguru.com/c8f0-Restaurant-Sop-Buntut-Cut-Meutia-Menteng-soup.jpg',
            'https://awsimages.detik.net.id/community/media/visual/2025/12/13/sop-buntut-cut-meutia-1765608038826.jpeg?w=800',
        ],
        'logo_candidates': [
            'https://img.restaurantguru.com/c8f0-Restaurant-Sop-Buntut-Cut-Meutia-Menteng-soup.jpg',
            'https://awsimages.detik.net.id/community/media/visual/2025/12/13/sop-buntut-cut-meutia-1765608038826.jpeg?w=800',
            'https://manual.co.id/wp-content/uploads/2017/05/Sop-Buntut-Cut-Meutia-Street_Menteng-11-980x719.jpg',
        ]
    },
    {
        'slug': 'bakso-bakar-pak-man-malang',
        'name': 'Bakso Bakar Pak Man Malang',
        'banner_candidates': [
            'https://asset.kompas.com/crops/x6OULHa8pMi47UnvDTzf1j62ov4=/3x0:700x465/750x500/data/photo/2022/08/25/6306b48bb80a1.jpeg',
            'https://1.bp.blogspot.com/-AfqL4blLYis/XROS3DhivrI/AAAAAAAAYxY/0e1o3xxbhAMns1oXPQR03lX6yjC3PNyWwCEwYBhgL/s1600/bakso%2Bbakar%2Bpak%2Bman%2B2.jpeg',
            'https://cdn.idntimes.com/content-images/community/2022/09/fromandroid-9e12013d15094d85dc5cf215e8bf951e.jpg'
        ],
        'logo_candidates': [
            'https://1.bp.blogspot.com/-AfqL4blLYis/XROS3DhivrI/AAAAAAAAYxY/0e1o3xxbhAMns1oXPQR03lX6yjC3PNyWwCEwYBhgL/s1600/bakso%2Bbakar%2Bpak%2Bman%2B2.jpeg',
            'https://cdn.idntimes.com/content-images/community/2022/09/fromandroid-9e12013d15094d85dc5cf215e8bf951e.jpg',
            'https://asset.kompas.com/crops/x6OULHa8pMi47UnvDTzf1j62ov4=/3x0:700x465/750x500/data/photo/2022/08/25/6306b48bb80a1.jpeg',
        ]
    },
    {
        'slug': 'kopi-es-tak-kie-glodok',
        'name': 'Kopi Es Tak Kie Glodok',
        'banner_candidates': [
            'https://static.republika.co.id/uploads/images/xlarge/023873600-1712298966-1280-856.jpg',
            'https://asset.kompas.com/crops/-1yEM-TchZ6F1QCX6Gzc1gsUuQg=/0x0:0x0/750x500/data/photo/2023/08/14/64d97e380847e.jpg',
            'https://manual.co.id/wp-content/uploads/2014/11/Kopi-Es-Tak-Kie_Glodok-2.jpg'
        ],
        'logo_candidates': [
            'https://asset.kompas.com/crops/-1yEM-TchZ6F1QCX6Gzc1gsUuQg=/0x0:0x0/750x500/data/photo/2023/08/14/64d97e380847e.jpg',
            'https://static.republika.co.id/uploads/images/xlarge/023873600-1712298966-1280-856.jpg',
            'https://manual.co.id/wp-content/uploads/2014/11/Kopi-Es-Tak-Kie_Glodok-2.jpg'
        ]
    },
    {
        'slug': 'bebek-sinjay-bangkalan',
        'name': 'Bebek Sinjay Bangkalan',
        'banner_candidates': [
            'https://asset.kompas.com/crops/dQL-SQcsA1QuFWeRj6n6WZRcHTE=/202x66:1000x599/750x500/data/photo/2023/05/07/6456a450d2edd.jpg',
            'https://cdn.idntimes.com/content-images/post/20191206/bebek-sinjay-1-0eb11a31d9aaae4305f889ef51a7e2b8.jpg',
            'https://asset.kompas.com/crops/a-i-8U5zK9V6Hk4N9Wq7l5G0zWw=/0x0:1000x667/750x500/data/photo/2021/04/09/60700d36c2a61.jpg'
        ],
        'logo_candidates': [
            'https://cdn.idntimes.com/content-images/post/20191206/bebek-sinjay-1-0eb11a31d9aaae4305f889ef51a7e2b8.jpg',
            'https://asset.kompas.com/crops/dQL-SQcsA1QuFWeRj6n6WZRcHTE=/202x66:1000x599/750x500/data/photo/2023/05/07/6456a450d2edd.jpg',
            'https://asset.kompas.com/crops/a-i-8U5zK9V6Hk4N9Wq7l5G0zWw=/0x0:1000x667/750x500/data/photo/2021/04/09/60700d36c2a61.jpg'
        ]
    }
]

def download(urls, target_front, target_back):
    for u in urls:
        try:
            req = urllib.request.Request(u, headers=headers)
            with urllib.request.urlopen(req, context=ctx, timeout=12) as resp:
                data = resp.read()
                if len(data) > 5000:
                    with open(target_front, 'wb') as f:
                        f.write(data)
                    with open(target_back, 'wb') as f:
                        f.write(data)
                    print(f"  Downloaded ({len(data)//1024} KB): {u[:65]}...")
                    return True
        except Exception as e:
            # print(f"  Failed {u[:50]}: {e}")
            pass
    return False

print("Downloading authentic Indonesian business photos...")
for t in targets:
    print(f"\n--> {t['name']} ({t['slug']})")
    bf = os.path.join(frontend_dir, f"{t['slug']}-banner.jpg")
    bb = os.path.join(backend_dir, f"{t['slug']}-banner.jpg")
    download(t['banner_candidates'], bf, bb)

    lf = os.path.join(frontend_dir, f"{t['slug']}-logo.jpg")
    lb = os.path.join(backend_dir, f"{t['slug']}-logo.jpg")
    download(t['logo_candidates'], lf, lb)

print("\nDone downloading 4 new real business photos!")
