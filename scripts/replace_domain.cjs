const fs = require('fs');
const path = require('path');

const rootDir = path.resolve(__dirname, '..');

const ignoreDirs = new Set([
  '.git',
  '.gemini',
  'node_modules',
  'vendor',
  'storage',
  'dist',
  'build',
  '.vscode'
]);

const textExtensions = new Set([
  '.js', '.jsx', '.ts', '.tsx', '.json', '.html', '.css', '.scss',
  '.php', '.blade.php', '.env', '.example', '.md', '.txt', '.bat',
  '.sh', '.yml', '.yaml', '.xml', '.sql', '.cjs', '.mjs'
]);

function isTextFile(filePath) {
  const base = path.basename(filePath);
  if (base.startsWith('.env')) return true;
  for (const ext of textExtensions) {
    if (filePath.endsWith(ext)) return true;
  }
  return false;
}

let modifiedFiles = [];
let totalReplacements = 0;

function processFile(filePath) {
  try {
    const content = fs.readFileSync(filePath, 'utf8');
    
    // Check if contains surade.com with case insensitivity
    if (!/surade\.co\.id/i.test(content) && !/surade-com/i.test(content)) {
      return;
    }

    let count = 0;
    // Replacements with preserved casing
    let updated = content;
    
    // 1. surade.com exact casing variations
    updated = updated.replace(/Surade\.co\.id/g, () => { count++; return 'Surade.com'; });
    updated = updated.replace(/SURADE\.CO\.ID/g, () => { count++; return 'SURADE.COM'; });
    updated = updated.replace(/Surade\.Co\.Id/g, () => { count++; return 'Surade.Com'; });
    updated = updated.replace(/surade\.co\.id/g, () => { count++; return 'surade.com'; });
    
    // 2. Any leftover case-insensitive surade.com
    updated = updated.replace(/surade\.co\.id/gi, (match) => {
      count++;
      if (match === match.toUpperCase()) return 'SURADE.COM';
      if (match[0] === match[0].toUpperCase()) return 'Surade.com';
      return 'surade.com';
    });

    // 3. surade-com slug variations if any
    updated = updated.replace(/surade-com/gi, (match) => {
      count++;
      return 'surade-com';
    });

    if (count > 0 && updated !== content) {
      fs.writeFileSync(filePath, updated, 'utf8');
      modifiedFiles.push({ file: path.relative(rootDir, filePath), replacements: count });
      totalReplacements += count;
    }
  } catch (err) {
    console.error(`Error processing ${filePath}:`, err.message);
  }
}

function traverse(dir) {
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      if (!ignoreDirs.has(entry.name)) {
        traverse(fullPath);
      }
    } else if (entry.isFile()) {
      if (isTextFile(fullPath)) {
        processFile(fullPath);
      }
    }
  }
}

console.log('Starting search and replace from:', rootDir);
traverse(rootDir);

console.log(`\nReplacement complete!`);
console.log(`Total modified files: ${modifiedFiles.length}`);
console.log(`Total replacements: ${totalReplacements}\n`);
modifiedFiles.forEach(m => console.log(`- [${m.replacements} replaced] ${m.file}`));
