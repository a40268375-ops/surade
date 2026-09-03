import urllib.request
import urllib.parse
import ssl
import re

ctx = ssl._create_unverified_context()
headers = {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36',
    'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
}

queries = [
    ("sop-buntut-cut-meutia-banner", "Sop Buntut Cut Meutia Menteng rumah makan tampak depan"),
    ("sop-buntut-cut-meutia-logo", "Sop Buntut Cut Meutia semangkuk sop buntut bakar kuah"),
    ("bakso-bakar-pak-man-banner", "Bakso Bakar Pak Man Malang warung tampak depan"),
    ("bakso-bakar-pak-man-logo", "Bakso Bakar Pak Man Malang sepiring bakso bakar arang"),
    ("pia-legong-bali-banner", "Pia Legong Kuta Bali toko ruko tampak depan"),
    ("pia-legong-bali-logo", "Pia Legong Bali kotak kemasan pia keju coklat asli"),
    ("kopi-es-tak-kie-banner", "Kopi Es Tak Kie Glodok tampak depan kedai kopi"),
    ("kopi-es-tak-kie-logo", "Kopi Es Tak Kie es kopi susu gelas otentik"),
]

for tag, q in queries:
    url = 'https://www.bing.com/images/search?q=' + urllib.parse.quote(q) + '&first=1'
    req = urllib.request.Request(url, headers=headers)
    html = urllib.request.urlopen(req, context=ctx, timeout=10).read().decode('utf-8', errors='ignore')
    
    murls = re.findall(r'mediaurl=(https?%3a%2f%2f.*?)&', html, re.IGNORECASE)
    murls = [urllib.parse.unquote(x) for x in murls]
    
    trusted = []
    for u in murls:
        low = u.lower()
        if any(t in low for t in ['detik', 'kompas', 'manual', 'pergikuliner', 'tripadvisor', 'traveloka', 'kumparan', 'idntimes', 'qraved', 'nibble', 'foodierate', 'tempo', 'tribun', 'jawapos', 'republika', 'okezone', 'sindonews', 'liputan6', 'merdeka']):
            trusted.append(u)
    
    print(f"\n[{tag}] -> {len(trusted)} trusted results found for '{q}':")
    for t in trusted[:4]:
        print("  *", t)
