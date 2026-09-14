const fs = require('fs');

const pathJSX = 'D:/parth/Kaun Banega Champion/Kaun-Banega-Champion/src/AlgoBingo/AlgoBingo.jsx';
let jsxContent = fs.readFileSync(pathJSX, 'utf8');

// 1. Shuffle bankItems on startGame
const oldStartGame = `    // If a specific question is provided (from the new JSON structure), use its gridConfig directly.
    // Otherwise fallback to generating one randomly using the legacy data.
    const newGrid = question ? question.gridConfig : generateValidGrid(contentSet.categories, contentSet.items);`;

const newStartGame = `    // If a specific question is provided (from the new JSON structure), use its gridConfig directly.
    // Otherwise fallback to generating one randomly using the legacy data.
    let newGrid = question ? question.gridConfig : generateValidGrid(contentSet.categories, contentSet.items);
    
    // Shuffle the bank items so they aren't painfully obvious
    if (newGrid && newGrid.bankItems) {
      newGrid = {
        ...newGrid,
        bankItems: [...newGrid.bankItems].sort(() => Math.random() - 0.5)
      };
    }`;

jsxContent = jsxContent.replace(oldStartGame, newStartGame);

// 2. Fix the "Algo Rack" text
jsxContent = jsxContent.replace(/Algo Rack/gi, "CONCEPT BANK");

fs.writeFileSync(pathJSX, jsxContent, 'utf8');
console.log("Updated AlgoBingo.jsx with shuffle and title fixes");
