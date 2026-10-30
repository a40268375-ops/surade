process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';
const fs = require('fs');
const path = require('path');

async function searchBingImages(query) {
  try {
    const res = await fetch(`https://www.bing.com/images/search?q=${encodeURIComponent(query)}&form=HDRSC2&first=1`, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36',
        'Accept-Language': 'id-ID,id;q=0.9,en-US;q=0.8,en;q=0.7'
      }
    });
    const html = await res.text();
    const matches = [...html.matchAll(/murl&quot;:&quot;(https?:\/\/[^&"]+?\.(?:jpg|png|jpeg|webp))/gi)];
    if (matches && matches.length > 0) {
      return [...new Set(matches.map(m => m[1]))];
    }
  } catch (err) {
    console.error(`Error searching ${query}:`, err.message);
  }
  return [];
}

async function test() {
  const queries = [
    'Apotek Surade Sukabumi',
    'Let\'s Coffee Surade Sukabumi',
    'Bakso Pasiripis Surade',
    'Gua Sungging Surade Sukabumi',
    'Toko Bangunan Jampang Surade',
    'Bengkel Motor AHASS Honda Indonesia',
    'Kerupuk Opak Jampang Sukabumi'
  ];

  for (const q of queries) {
    console.log(`\n=== Query: ${q} ===`);
    const results = await searchBingImages(q);
    console.log(`Found ${results.length} images:`);
    console.log(results.slice(0, 3));
  }
}

test();
