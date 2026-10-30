const fs = require('fs');
const data = JSON.parse(fs.readFileSync('scripts/real_businesses_246_data.json', 'utf8'));
const fallbacks = data.filter(d => d.name.startsWith('Toko & Layanan') || d.products.some(p => p.name.startsWith('Paket Layanan')));
console.log('Fallbacks count:', fallbacks.length);
fallbacks.forEach((f, idx) => {
  console.log(`${idx + 1}. [${f.parent_name} / ${f.sub_name}] (Slug: ${f.sub_slug}) -> Name: ${f.name}`);
});
