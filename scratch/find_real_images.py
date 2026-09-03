import urllib.request
import urllib.parse
import ssl
import json
import re
import os

ctx = ssl._create_unverified_context()
headers = {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36',
    'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
    'Accept-Language': 'id-ID,id;q=0.9,en-US;q=0.8,en;q=0.7',
}

def get_real_image_from_bing(query):
    url = 'https://www.bing.com/images/search?q=' + urllib.parse.quote(query) + '&first=1'
    req = urllib.request.Request(url, headers=headers)
    try:
        html = urllib.request.urlopen(req, context=ctx, timeout=10).read().decode('utf-8', errors='ignore')
        # Bing images stores murl in json or attributes: murl&quot;:&quot;(url)&quot;
        murls = re.findall(r'murl&quot;:&quot;(https?://[^&]+)&quot;', html)
        if not murls:
            murls = re.findall(r'murl":"(https?://[^"]+)"', html)
        valid = [u for u in murls if any(u.lower().endswith(ext) or ext in u.lower() for ext in ['.jpg', '.jpeg', '.png', '.webp'])]
        return valid[:3]
    except Exception as e:
        print(f"Error searching for {query}: {e}")
        return []

if __name__ == '__main__':
    for test in ['Kopi Toko Djawa Braga Bandung', 'Warung Kopi Klotok Pakem Sleman', 'Roti Romi Kemang']:
        res = get_real_image_from_bing(test)
        print(f"Query: {test}")
        print(f"Results: {res[:2]}\n")
