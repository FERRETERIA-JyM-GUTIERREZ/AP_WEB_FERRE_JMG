const fs = require('fs');
const path = require('path');

try {
  const logoPath = path.join(__dirname, 'public', 'img', 'logo.png');
  const logoBuffer = fs.readFileSync(logoPath);
  const base64 = logoBuffer.toString('base64');
  console.log('data:image/png;base64,' + base64);
} catch (error) {
  console.error('Error al leer el archivo:', error.message);
} 