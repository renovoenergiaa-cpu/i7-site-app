const fs = require('fs');
const path = require('path');

function walk(dir) {
  let results = [];
  const list = fs.readdirSync(dir);
  list.forEach(file => {
    file = path.join(dir, file);
    const stat = fs.statSync(file);
    if (stat && stat.isDirectory()) { 
      results = results.concat(walk(file));
    } else { 
      results.push(file);
    }
  });
  return results;
}

const files = walk('./apps/web/src');
files.forEach(f => {
  const content = fs.readFileSync(f, 'utf8');
  if(content.includes('brand-blue')) {
    fs.writeFileSync(f, content.replace(/brand-blue/g, 'brand-lime'));
    console.log('Updated', f);
  }
});

// Also replace the hardcoded hex in PropertyMap
const mapFile = './apps/web/src/components/PropertyMap.tsx';
if (fs.existsSync(mapFile)) {
  const mapContent = fs.readFileSync(mapFile, 'utf8');
  if(mapContent.includes('#0055FF')) {
      fs.writeFileSync(mapFile, mapContent.replace(/#0055FF/g, '#65A30D'));
      console.log('Updated hex in map');
  }
}
