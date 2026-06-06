const fs = require('fs');
const path = require('path');

const srcDir = path.join(__dirname, 'src');

function traverseAndReplace(dir) {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const fullPath = path.join(dir, file);
    if (fs.statSync(fullPath).isDirectory()) {
      traverseAndReplace(fullPath);
    } else if (fullPath.endsWith('.js') || fullPath.endsWith('.jsx')) {
      let content = fs.readFileSync(fullPath, 'utf8');
      if (content.includes('http://localhost:5000/api')) {
        content = content.replace(/'http:\/\/localhost:5000\/api/g, "(import.meta.env.VITE_API_URL || 'https://api.interplanetary.tv/api') + '");
        content = content.replace(/`http:\/\/localhost:5000\/api/g, "`${import.meta.env.VITE_API_URL || 'https://api.interplanetary.tv/api'}");
        fs.writeFileSync(fullPath, content, 'utf8');
        console.log(`Updated ${fullPath}`);
      }
    }
  }
}

traverseAndReplace(srcDir);
console.log('Done replacing API URLs.');
