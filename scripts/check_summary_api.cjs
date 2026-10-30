const http = require('http');

http.get('http://127.0.0.1:8000/api/home-summary', (res) => {
  let raw = '';
  res.on('data', chunk => raw += chunk);
  res.on('end', () => {
    try {
      const data = JSON.parse(raw);
      console.log('Total businesses in summary:', data.businesses?.length);
      (data.businesses || []).slice(0, 12).forEach((b, i) => {
        console.log(`[${i+1}] ID: ${b.id} | Name: ${b.name} | Logo: ${b.logo} | Banner: ${b.banner}`);
      });
    } catch (e) {
      console.error('Error parsing JSON:', e.message);
    }
  });
}).on('error', e => console.error(e.message));
