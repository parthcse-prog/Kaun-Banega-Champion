const fs = require('fs');
const path = 'D:/parth/Kaun Banega Champion/Kaun-Banega-Champion/src/WordConnect/WordConnect.jsx';
let content = fs.readFileSync(path, 'utf8');

content = content.replace(
  `const currentQ = questions[currentQIdx] || {};`,
  `const currentQ = questions[currentQIdx];`
);

content = content.replace(
  `profile.stream`,
  `profile?.stream`
);

content = content.replace(
  `currentQ.subject`,
  `currentQ?.subject`
);

content = content.replace(
  `currentQ.topic`,
  `currentQ?.topic`
);

content = content.replace(
  `currentQ.question`,
  `currentQ?.question`
);

content = content.replace(
  `currentQ.answer`,
  `currentQ?.answer`
);

content = content.replace(
  `currentQ.explanation`,
  `currentQ?.explanation`
);

fs.writeFileSync(path, content, 'utf8');
console.log("Fixed optional chaining");
