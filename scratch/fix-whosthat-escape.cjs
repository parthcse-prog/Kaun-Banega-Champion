const fs = require('fs');
const path = 'D:/parth/Kaun Banega Champion/Kaun-Banega-Champion/src/WhosThat/WhosThat.jsx';

let content = fs.readFileSync(path, 'utf8');

// Replace improperly escaped template strings
content = content.replace(/\\`https/g, '`https');
content = content.replace(/\\\$/g, '$');
content = content.replace(/\\`/g, '`');
content = content.replace(/\\\\s/g, '\\s');

fs.writeFileSync(path, content, 'utf8');
console.log("Fixed WhosThat.jsx escaping.");
