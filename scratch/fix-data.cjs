const fs = require('fs');

const path = 'D:/parth/Kaun Banega Champion/Kaun-Banega-Champion/src/WordConnect/Data.js';
let content = fs.readFileSync(path, 'utf8');

// Replace all literal \n with actual newlines
content = content.replace(/\\n/g, '\n');

fs.writeFileSync(path, content, 'utf8');
console.log("Fixed Data.js newlines");
