const https = require('https');
const fs = require('fs');

const bbox = '-7.40,106.53,-7.30,106.63';
const query = `[out:json][timeout:25];
(
  node(${bbox});
  way(${bbox});
);
out center;`;

const postData = 'data=' + encodeURIComponent(query);

const req = https.request('https://overpass-api.de/api/interpreter', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/x-www-form-urlencoded',
    'User-Agent': 'SuradeExplorer/1.0',
    'Content-Length': Buffer.byteLength(postData)
  }
}, (res) => {
  let data = '';
  res.on('data', chunk => data += chunk);
  res.on('end', () => {
    try {
      const json = JSON.parse(data);
      console.log('Total elements in Surade bbox:', json.elements.length);
      const named = json.elements.filter(e => e.tags && e.tags.name);
      console.log('Named elements in Surade bbox:', named.length);
      
      fs.writeFileSync('scripts/osm_surade_real_places.json', JSON.stringify(named, null, 2));
      
      named.slice(0, 50).forEach((e, idx) => {
        const type = e.tags.shop || e.tags.amenity || e.tags.tourism || e.tags.craft || e.tags.office || e.tags.place || 'place';
        const lat = e.lat || e.center?.lat;
        const lon = e.lon || e.center?.lon;
        console.log(`${idx + 1}. ${e.tags.name} [${type}] @ ${lat}, ${lon}`);
      });
    } catch (e) {
      console.error('Error parsing response:', e.message);
      console.log('Raw head:', data.slice(0, 300));
    }
  });
});

req.on('error', (e) => {
  console.error('Request error:', e.message);
});

req.write(postData);
req.end();
