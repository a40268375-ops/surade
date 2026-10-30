const fs = require('fs');
const path = require('path');
const https = require('https');
const http = require('http');

const dir = path.join(__dirname, '../frontend/public/images/businesses');
const files = fs.readdirSync(dir);

console.log('Auditing images in:', dir);
const brokenFiles = [];

files.forEach(f => {
  const fullPath = path.join(dir, f);
  const stats = fs.statSync(fullPath);
  const content = fs.readFileSync(fullPath);
  if (stats.size < 2000 || content.toString('utf8', 0, 50).includes('<html') || content.toString('utf8', 0, 50).includes('404')) {
    brokenFiles.push({ file: f, size: stats.size });
  }
});

console.log('Total broken/corrupted images found:', brokenFiles.length);
brokenFiles.forEach(b => console.log(`- ${b.file} (${b.size} bytes)`));
