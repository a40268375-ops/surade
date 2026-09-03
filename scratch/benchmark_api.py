import urllib.request
import time

endpoints = [
    '/api/home-summary',
    '/api/home-summary', # second call to test cache speed
    '/api/businesses?limit=24',
    '/api/businesses?limit=24', # second call to test cache speed
]

print("Benchmarking optimized endpoints...")
for ep in endpoints:
    start = time.time()
    try:
        req = urllib.request.Request('http://127.0.0.1:8000' + ep, headers={'Accept': 'application/json'})
        with urllib.request.urlopen(req, timeout=10) as res:
            data = res.read()
            duration = (time.time() - start) * 1000
            print(f"{ep}: {duration:.1f} ms (payload: {len(data)} bytes)")
    except Exception as e:
        print(f"{ep} ERROR: {e}")
