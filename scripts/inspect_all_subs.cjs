const fs = require('fs');
const cats = JSON.parse(fs.readFileSync('scripts/all_categories_dump.json', 'utf8'));

console.log(`Total categories: ${cats.length}`);
let total = 0;
cats.forEach((c, idx) => {
  console.log(`\n[${idx + 1}] Category: ${c.name} (slug: ${c.slug}, ID: ${c.id}) - ${c.subcategories.length} subcategories:`);
  c.subcategories.forEach((s, sidx) => {
    console.log(`   ${sidx + 1}. ID: ${s.id} | Slug: ${s.slug} | Name: ${s.name}`);
    total++;
  });
});
console.log(`\nTotal subcategories across all categories: ${total}`);
