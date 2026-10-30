const http = require('http');

http.get('http://127.0.0.1:8000/api/businesses?per_page=10', (res) => {
  let data = '';
  res.on('data', chunk => data += chunk);
  res.on('end', () => {
    try {
      const json = JSON.parse(data);
      console.log('Total businesses in response:', json.total || json.data?.length);
      const list = json.data?.data || json.data || [];
      list.slice(0, 10).forEach(b => {
        console.log(`[ID ${b.id}] Name: ${b.name}`);
        console.log(`   Category: ${b.category?.name || 'N/A'}`);
        console.log(`   Village: ${b.city || b.village}`);
        console.log(`   Phone: ${b.phone} | WA: ${b.whatsapp}`);
        console.log(`   Logo: ${b.logo}`);
        console.log(`   Products: ${(b.products || []).map(p => `${p.name} (Rp ${p.price})`).join(' | ')}`);
        console.log('---');
      });
    } catch (e) {
      console.error('Parse error:', e.message);
      console.log('Raw output:', data.slice(0, 300));
    }
  });
});
