const fs = require('fs');

const pathJSX = 'D:/parth/Kaun Banega Champion/Kaun-Banega-Champion/src/AlgoBingo/AlgoBingo.jsx';
let jsxContent = fs.readFileSync(pathJSX, 'utf8');

// Replace the {q.questionText} with a stripped down version using regex
const oldText = `{q.questionText}`;
const newText = `{q.questionText.replace(/Match the (.*?) concepts to the correct combination of.*/i, '$1')}`;

jsxContent = jsxContent.replace(oldText, newText);

// Let's also increase the text size a bit to make it look like a proper title now that it's shorter
// Old: className="text-lg font-bold text-white leading-snug mb-4 flex-1"
// New: className="text-xl md:text-2xl font-black text-white leading-snug mb-4 flex-1 flex items-center"
jsxContent = jsxContent.replace(
  `className="text-lg font-bold text-white leading-snug mb-4 flex-1"`,
  `className="text-xl md:text-2xl font-black text-white leading-snug mb-4 flex-1 flex items-center"`
);

fs.writeFileSync(pathJSX, jsxContent, 'utf8');
console.log("Updated AlgoBingo card text rendering.");
