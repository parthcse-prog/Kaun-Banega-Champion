const fs = require('fs');

const path = 'D:/parth/Kaun Banega Champion/Kaun-Banega-Champion/src/MathNinja/MathNinja.jsx';
let content = fs.readFileSync(path, 'utf8');

// The original map was QUESTIONS.map(q => (
// And we want allQuestions.map((q, i) => (
content = content.replace(
  /QUESTIONS\.map\(q => \(/g,
  `allQuestions.map((q, i) => (`
);

fs.writeFileSync(path, content, 'utf8');
console.log("Fixed Map function in MathNinja.jsx");
