const fs = require('fs');
const path = require('path');

async function fetchOSM() {
  const query = `
[out:json][timeout:30];
(
  node(-7.45,106.48,-7.28,106.68);
  way(-7.45,106.48,-7.28,106.68);
);
out center tags;
  `;
  
  console.log("Fetching real OSM data for Surade...");
  try {
    const body = new URLSearchParams();
    body.append('data', query);
    const res = await fetch('https://overpass-api.de/api/interpreter', {
      method: 'POST',
      body: body.toString(),
      headers: { 
        'Content-Type': 'application/x-www-form-urlencoded',
        'User-Agent': 'SuradeApp/1.0 (info@surade.com)'
      }
    });
    const text = await res.text();
    if (text.startsWith('<')) {
      console.log('Response HTML/Error:', text.substring(0, 300));
      return;
    }
    const data = JSON.parse(text);

    console.log("Total raw elements fetched:", data.elements.length);
    
    // Filter elements with name and relevant tags
    const named = data.elements.filter(e => e.tags && e.tags.name);
    console.log("Elements with name:", named.length);
    
    const sample = named.map(e => ({
      name: e.tags.name,
      amenity: e.tags.amenity,
      shop: e.tags.shop,
      tourism: e.tags.tourism,
      craft: e.tags.craft,
      cuisine: e.tags.cuisine,
      phone: e.tags.phone || e.tags['contact:phone'] || e.tags['contact:whatsapp'],
      addr_street: e.tags['addr:street'],
      addr_village: e.tags['addr:village'] || e.tags['addr:subdistrict'],
      lat: e.lat || e.center?.lat,
      lon: e.lon || e.center?.lon
    }));
    
    fs.writeFileSync(path.join(__dirname, 'osm_surade_real.json'), JSON.stringify(sample, null, 2));
    console.log("Saved to scripts/osm_surade_real.json. Sample 10 items:");
    console.log(sample.slice(0, 10));
  } catch (err) {
    console.error("Fetch error:", err);
  }
}

fetchOSM();
