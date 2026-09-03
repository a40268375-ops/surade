import urllib.request
import urllib.parse
import ssl
import re

ctx = ssl._create_unverified_context()
headers = {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36',
    'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
}

def check(query):
    url = 'https://www.bing.com/images/search?q=' + urllib.parse.quote(query) + '&first=1'
    req = urllib.request.Request(url, headers=headers)
    html = urllib.request.urlopen(req, context=ctx, timeout=10).read().decode('utf-8', errors='ignore')
    
    # Try finding murl
    murls = re.findall(r'murl&quot;:&quot;(.*?)&quot;', html)
    if not murls:
        murls = re.findall(r'"murl":"(.*?)"', html)
    if not murls:
        # Check src= or mediaurl=
        murls = re.findall(r'mediaurl=(https?%3a%2f%2f.*?)&', html, re.IGNORECASE)
        murls = [urllib.parse.unquote(x) for x in murls]
    
    print(f"Query: {query} -> Found: {len(murls)}")
    for m in murls[:3]:
        print(" ", m)
    return murls

check("Sop Buntut Cut Meutia Menteng")
