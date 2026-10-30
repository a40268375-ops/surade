const https = require('https');
const fs = require('fs');

const overpassQuery = `[out:json][timeout:30];
(
  node["amenity"](-7.42,106.52,-7.30,106.66);
  node["shop"](-7.42,106.52,-7.30,106.66);
  node["tourism"](-7.42,106.52,-7.30,106.66);
  node["craft"](-7.42,106.52,-7.30,106.66);
  node["office"](-7.42,106.52,-7.30,106.66);
  node["healthcare"](-7.42,106.52,-7.30,106.66);
  way["amenity"](-7.42,106.52,-7.30,106.66);
  way["shop"](-7.42,106.52,-7.30,106.66);
  way["tourism"](-7.42,106.52,-7.30,106.66);
);
out center;`;

const url = 'https://overpass-api.de/api/interpreter?data=' + encodeURIComponent(overpassQuery);
console.log('Querying Overpass API for real POIs in Kecamatan Surade...');

https.get(url, { headers: { 'User-Agent': 'SuradeDirectory/1.0 (contact: admin@surade.com)' } }, (res) => {
  let data = '';
  res.on('data', chunk => data += chunk);
  res.on('end', () => {
    try {
      const json = JSON.parse(data);
      const elements = json.elements || [];
      console.log(`Total raw OSM elements retrieved: ${elements.length}`);
      
      const named = elements.filter(e => e.tags && (e.tags.name || e.tags.shop || e.tags.amenity));
      console.log(`Named / Tagged elements: ${named.length}`);
      
      fs.writeFileSync('scripts/osm_surade_real_places.json', JSON.stringify(named, null, 2));
      
      console.log('\nSample Real Places from OpenStreetMap in Surade:');
      named.slice(0, 30).forEach((e, idx) => {
        const name = e.tags.name || e.tags.operator || `${e.tags.shop || e.tags.amenity || 'POI'} Surade`;
        const lat = e.lat || e.center?.lat;
        const lon = e.lon || e.center?.lon;
        const type = e.tags.shop || e.tags.amenity || e.tags.tourism || e.tags.office || e.tags.healthcare || 'other';
        console.log(`${idx + 1}. ${name} [${type}] @ ${lat}, ${lon}`);
      });
    } catch (err) {
      console.error('Failed to parse Overpass response:', err.message);
      console.log('Response head:', data.slice(0, 300));
    }
  });
}).on('error', (err) => {
  console.error('HTTP Request error:', err.message);
});
