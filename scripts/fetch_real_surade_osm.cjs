const https = require('https');
const fs = require('fs');
const path = require('path');

const query = `
[out:json][timeout:30];
(
  node(-7.45,106.50,-7.30,106.68)["name"];
  way(-7.45,106.50,-7.30,106.68)["name"];
);
out center body;
`;

const postData = 'data=' + encodeURIComponent(query);

const options = {
  hostname: 'overpass-api.de',
  port: 443,
  path: '/api/interpreter',
  method: 'POST',
  headers: {
    'Content-Type': 'application/x-www-form-urlencoded',
    'Content-Length': Buffer.byteLength(postData),
    'User-Agent': 'SuradeRealDataScraper/2.0'
  }
};

const req = https.request(options, (res) => {
  let body = '';
  res.on('data', chunk => body += chunk);
  res.on('end', () => {
    try {
      const json = JSON.parse(body);
      console.log('Total OSM elements retrieved in Surade bounding box:', json.elements?.length);
      const namedElements = (json.elements || []).map(e => ({
        id: e.id,
        name: e.tags?.name,
        type: e.tags?.shop || e.tags?.amenity || e.tags?.craft || e.tags?.tourism || e.tags?.office || e.tags?.healthcare || e.tags?.leisure || e.tags?.building || 'other',
        lat: e.lat || e.center?.lat,
        lon: e.lon || e.center?.lon,
        street: e.tags?.['addr:street'] || e.tags?.['addr:full'],
        phone: e.tags?.phone || e.tags?.['contact:phone'],
        tags: e.tags
      })).filter(e => e.name);

      console.log('Total named POIs found:', namedElements.length);
      namedElements.slice(0, 40).forEach((p, idx) => {
        console.log(`[${idx+1}] ${p.name} | Type: ${p.type} | Coord: ${p.lat}, ${p.lon}`);
      });

      fs.writeFileSync(path.join(__dirname, 'surade_osm_pois.json'), JSON.stringify(namedElements, null, 2));
      console.log('Saved to scripts/surade_osm_pois.json');
    } catch (err) {
      console.error('JSON parse error:', err.message, body.slice(0, 200));
    }
  });
});

req.on('error', (e) => {
  console.error('Request error:', e.message);
});

req.write(postData);
req.end();
