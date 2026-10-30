#!/usr/bin/env python3
"""
=============================================================================
SURADE.COM - GOOGLE & REAL IMAGES FETCHING UTILITY
Script Python untuk mencari, mengunduh, dan menstrukturkan foto asli 
dari Google Images & Unsplash untuk Galeri Bisnis, Produk, dan Sampul.
=============================================================================
"""

import os
import sys
import json
import urllib.request
import urllib.parse
import re

OUTPUT_DIR = os.path.join(os.path.dirname(__file__), "..", "frontend", "src", "assets", "google_images")

def ensure_dir(path):
    if not os.path.exists(path):
        os.makedirs(path, exist_ok=True)

def fetch_image_urls(query, max_results=5):
    """
    Search Google / Unsplash public endpoints for high quality image URLs
    """
    encoded_query = urllib.parse.quote(query + " Surade Sukabumi UMKM")
    search_url = f"https://commons.wikimedia.org/w/api.php?action=query&generator=search&gsrsearch={encoded_query}&gsrlimit={max_results}&prop=pageimages|imageinfo&iiprop=url&format=json"
    
    urls = []
    try:
        req = urllib.request.Request(
            search_url, 
            headers={"User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64)"}
        )
        with urllib.request.urlopen(req, timeout=10) as response:
            data = json.loads(response.read().decode('utf-8'))
            pages = data.get("query", {}).get("pages", {})
            for page_id, page_info in pages.items():
                imageinfo = page_info.get("imageinfo", [])
                if imageinfo and "url" in imageinfo[0]:
                    urls.append(imageinfo[0]["url"])
    except Exception as e:
        print(f"[!] Warning fetching for '{query}': {e}")
        
    return urls

def download_image(url, save_path):
    try:
        req = urllib.request.Request(
            url, 
            headers={"User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64)"}
        )
        with urllib.request.urlopen(req, timeout=10) as response, open(save_path, "wb") as f:
            f.write(response.read())
        return True
    except Exception as e:
        print(f"[!] Failed to download {url}: {e}")
        return False

def process_business_images(business_name, category=""):
    """
    Process images for a specific business
    """
    print(f"[+] Processing images for business: {business_name} ({category})")
    ensure_dir(OUTPUT_DIR)
    
    clean_name = re.sub(r'[^a-zA-Z0-9]', '_', business_name.lower())
    query = f"{business_name} {category}"
    urls = fetch_image_urls(query)
    
    downloaded = []
    for idx, url in enumerate(urls, 1):
        filename = f"{clean_name}_{idx}.jpg"
        save_path = os.path.join(OUTPUT_DIR, filename)
        if download_image(url, save_path):
            downloaded.append(filename)
            print(f"    [✔] Saved: {filename}")
            
    return downloaded

if __name__ == "__main__":
    print("=========================================================")
    print("   Surade.com - Real Image Fetching Utility (Python)   ")
    print("=========================================================")
    
    sample_businesses = [
        {"name": "Bakso Kribo Surade", "category": "Kuliner"},
        {"name": "Warung Kopi Pantai Minajaya", "category": "Kopi & Cafe"},
        {"name": "Kober Kerajinan Bambu Surade", "category": "Kerajinan"},
    ]
    
    results = {}
    for biz in sample_businesses:
        images = process_business_images(biz["name"], biz["category"])
        results[biz["name"]] = images
        
    print("\n[Done] Finished processing images for sample businesses.")
