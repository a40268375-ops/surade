const fs = require('fs');
const data = require('./all_153_businesses_raw.json');

console.log(`Total: ${data.length} businesses\n`);
data.forEach(b => {
  console.log(`ID: ${b.id.toString().padStart(3, ' ')} | [${b.address.split(',')[1]?.trim() || b.address}] ${b.name} (${b.category_name})`);
});
