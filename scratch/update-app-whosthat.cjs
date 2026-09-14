const fs = require('fs');
const path = 'D:/parth/Kaun Banega Champion/Kaun-Banega-Champion/src/App.jsx';

let content = fs.readFileSync(path, 'utf8');

// Add import
if (!content.includes('WhosThat')) {
  content = content.replace(
    `import KnifeHit from './KnifeHit/KnifeHit';`,
    `import KnifeHit from './KnifeHit/KnifeHit';\nimport WhosThat from './WhosThat/WhosThat';`
  );

  // Add route
  content = content.replace(
    `<Route path="knife-hit" element={<KnifeHit />} />`,
    `<Route path="knife-hit" element={<KnifeHit />} />\n          <Route path="whos-that" element={<WhosThat />} />`
  );

  fs.writeFileSync(path, content, 'utf8');
  console.log("App.jsx updated with WhosThat route.");
}
