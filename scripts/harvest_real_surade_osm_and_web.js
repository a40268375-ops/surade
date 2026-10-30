const fs = require('fs');
const path = require('path');

// Kecamatan Surade Bounding Box:
// South: -7.420, North: -7.300, West: 106.500, East: 106.660
async function fetchOverpassData() {
  console.log("1. Querying OpenStreetMap Overpass API for all verified POIs in Kecamatan Surade...");
  const query = `
[out:json][timeout:60];
(
  node["amenity"](-7.420,106.500,-7.300,106.660);
  node["shop"](-7.420,106.500,-7.300,106.660);
  node["tourism"](-7.420,106.500,-7.300,106.660);
  node["craft"](-7.420,106.500,-7.300,106.660);
  node["office"](-7.420,106.500,-7.300,106.660);
  node["healthcare"](-7.420,106.500,-7.300,106.660);
  node["commercial"](-7.420,106.500,-7.300,106.660);
  way["amenity"](-7.420,106.500,-7.300,106.660);
  way["shop"](-7.420,106.500,-7.300,106.660);
  way["tourism"](-7.420,106.500,-7.300,106.660);
  way["craft"](-7.420,106.500,-7.300,106.660);
  way["building"="commercial"](-7.420,106.500,-7.300,106.660);
  way["building"="retail"](-7.420,106.500,-7.300,106.660);
);
out center body tags;
  `;

  try {
    const body = new URLSearchParams();
    body.append('data', query);
    const res = await fetch('https://overpass-api.de/api/interpreter', {
      method: 'POST',
      body: body.toString(),
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'User-Agent': 'SuradeResearch/2.0 (sukabumi-surade@surade.com)'
      }
    });

    const text = await res.text();
    if (text.startsWith('<')) {
      console.error("Overpass returned non-JSON:", text.substring(0, 300));
      return [];
    }

    const data = JSON.parse(text);
    console.log(`Retrieved ${data.elements.length} elements from Overpass.`);
    return data.elements;
  } catch (err) {
    console.error("Overpass error:", err.message);
    return [];
  }
}

async function run() {
  const elements = await fetchOverpassData();
  
  // Extract named places
  const namedPlaces = elements.filter(e => e.tags && (e.tags.name || e.tags['name:id'] || e.tags.brand));
  console.log(`Named places found: ${namedPlaces.length}`);
  
  const mapped = namedPlaces.map(e => {
    const t = e.tags;
    const name = t.name || t['name:id'] || t.brand;
    const lat = e.lat || e.center?.lat;
    const lon = e.lon || e.center?.lon;
    
    return {
      osm_id: e.id,
      osm_type: e.type,
      name: name.trim(),
      amenity: t.amenity || null,
      shop: t.shop || null,
      tourism: t.tourism || null,
      craft: t.craft || null,
      healthcare: t.healthcare || null,
      office: t.office || null,
      cuisine: t.cuisine || null,
      phone: t.phone || t['contact:phone'] || t['contact:whatsapp'] || null,
      website: t.website || t['contact:website'] || null,
      opening_hours: t.opening_hours || null,
      street: t['addr:street'] || null,
      village: t['addr:village'] || t['addr:subdistrict'] || null,
      city: 'Kecamatan Surade, Kabupaten Sukabumi',
      lat: lat,
      lon: lon,
      source_name: 'OpenStreetMap & Public Registry',
      source_url: `https://www.openstreetmap.org/${e.type}/${e.id}`
    };
  });

  fs.writeFileSync(path.join(__dirname, 'osm_raw_surade.json'), JSON.stringify(mapped, null, 2));
  console.log(`Saved ${mapped.length} OSM items to scripts/osm_raw_surade.json`);
}

run();
