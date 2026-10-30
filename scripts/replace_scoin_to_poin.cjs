const fs = require('fs');
const path = require('path');

const filesToUpdate = [
  'frontend/src/pages/admin-user/AdminUser.jsx',
  'frontend/src/pages/admin-user/tabs/SuradeCoinTab.jsx',
  'frontend/src/pages/admin-web/AdminWeb.jsx',
  'frontend/src/pages/admin-web/tabs/AdminCoinTab.jsx',
  'frontend/src/components/SuradeCoinModal.jsx',
  'frontend/src/components/SuradeCoinIcon.jsx',
  'frontend/src/components/ContentPaymentModal.jsx',
  'frontend/src/components/PackageSelectionModal.jsx',
  'frontend/src/components/WhatsAppAccessModal.jsx',
  'frontend/src/pages/BusinessDetail.jsx',
  'frontend/src/pages/AddBlog.jsx',
  'frontend/src/pages/AddBusiness.jsx',
  'frontend/src/pages/Dashboard.jsx',
  'backend/app/Http/Controllers/Api/CoinController.php',
];

const rootDir = path.resolve(__dirname, '..');

let totalModified = 0;

filesToUpdate.forEach(relPath => {
  const fullPath = path.join(rootDir, relPath);
  if (!fs.existsSync(fullPath)) return;

  let content = fs.readFileSync(fullPath, 'utf8');
  let original = content;

  // Replacements
  content = content.replace(/SCOIN Wallet/g, 'Dompet Poin');
  content = content.replace(/Scoin Wallet/g, 'Dompet Poin');
  content = content.replace(/Total Saldo SCOIN/g, 'Total Saldo Poin');
  content = content.replace(/Total Saldo Scoin/g, 'Total Saldo Poin');
  content = content.replace(/\+ Beli SCOIN/g, '+ Beli Poin');
  content = content.replace(/\+ Beli Scoin/g, '+ Beli Poin');
  content = content.replace(/Beli SCOIN/g, 'Beli Poin');
  content = content.replace(/Beli Scoin/g, 'Beli Poin');
  content = content.replace(/Riwayat SCOIN/g, 'Riwayat Poin');
  content = content.replace(/Panduan SCOIN/g, 'Panduan Poin');
  content = content.replace(/Apa itu SCOIN\?/g, 'Apa itu Poin?');
  content = content.replace(/Manajemen SCOIN/g, 'Manajemen Poin');
  content = content.replace(/Paket SCOIN/g, 'Paket Poin');
  content = content.replace(/Surade Coin/g, 'Surade Poin');
  content = content.replace(/surade coin/gi, 'Surade Poin');
  content = content.replace(/Saldo SCOIN/g, 'Saldo Poin');
  content = content.replace(/saldo scoin/gi, 'saldo poin');
  content = content.replace(/dengan SCOIN/g, 'dengan Poin');
  content = content.replace(/menggunakan SCOIN/g, 'menggunakan Poin');
  content = content.replace(/SCOIN/g, 'Poin');
  content = content.replace(/Scoin/g, 'Poin');

  if (content !== original) {
    fs.writeFileSync(fullPath, content, 'utf8');
    console.log(`Updated: ${relPath}`);
    totalModified++;
  }
});

console.log(`Total files updated: ${totalModified}`);
