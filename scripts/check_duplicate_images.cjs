const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const dir = path.join(__dirname, '../frontend/public/images/businesses');

const hashes = {};
const duplicates = [];

for (let id = 1; id <= 153; id++) {
  const fn = `biz_real_${id}.jpg`;
  const fp = path.join(dir, fn);
  if (fs.existsSync(fp)) {
    const buf = fs.readFileSync(fp);
    const hash = crypto.createHash('md5').update(buf).digest('hex');
    if (hashes[hash]) {
      duplicates.push({ id, duplicateOf: hashes[hash], file: fn });
    } else {
      hashes[hash] = id;
    }
  } else {
    console.log(`Missing file: ${fn}`);
  }
}

console.log(`Found ${duplicates.length} duplicate images out of 153 businesses:`);
duplicates.forEach(d => console.log(`Biz ${d.id} is duplicate of Biz ${d.duplicateOf}`));
