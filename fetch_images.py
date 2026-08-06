import urllib.request
import json
import ssl

ctx = ssl.create_default_context()
ctx.check_hostname = False
ctx.verify_mode = ssl.CERT_NONE

def get_wiki_img(filename):
    url = f"https://en.wikipedia.org/w/api.php?action=query&titles=File:{filename}&prop=imageinfo&iiprop=url&format=json"
    req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0'})
    try:
        with urllib.request.urlopen(req, context=ctx) as response:
            data = json.loads(response.read().decode())
            pages = data['query']['pages']
            for page_id in pages:
                if 'imageinfo' in pages[page_id]:
                    return pages[page_id]['imageinfo'][0]['url']
    except Exception as e:
        print(f"Error for {filename}: {e}")
    return None

files = [
    "Baiturrahman_Grand_Mosque_Banda_Aceh_2016.jpg",
    "Pura_Ulun_Danu_Bratan,_Bali,_Indonesia.jpg",
    "Tugu_Kujang_1.jpg",
    "Monas_at_night.jpg",
    "Gentala_Arasy.jpg",
    "Borobudur_Temple.jpg",
    "Istana_Maimun_Medan.jpg"
]

for f in files:
    print(f"{f}: {get_wiki_img(f)}")
