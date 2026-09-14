const fs = require('fs');

const pathData = 'D:/parth/Kaun Banega Champion/Kaun-Banega-Champion/src/AlgoBingo/Data.js';
const pathJSX = 'D:/parth/Kaun Banega Champion/Kaun-Banega-Champion/src/AlgoBingo/AlgoBingo.jsx';

// 1. Create the fallback data structure to inject into Data.js
const rawQuestions = [
    {
      "id": 1,
      "question": "Match the Engineering Mathematics-I concepts to the correct combination of topic categories.",
      "rows": ["Differential Calculus", "Multivariable Calculus", "Integral Calculus"],
      "columns": ["Core Concept", "Application", "Mathematical Tool"],
      "correctConcepts": [
        { "concept": "Continuity", "row": "Differential Calculus", "column": "Core Concept" },
        { "concept": "Maxima", "row": "Differential Calculus", "column": "Application" },
        { "concept": "Taylor", "row": "Differential Calculus", "column": "Mathematical Tool" },
        { "concept": "PartialDerivative", "row": "Multivariable Calculus", "column": "Core Concept" },
        { "concept": "Optimization", "row": "Multivariable Calculus", "column": "Application" },
        { "concept": "Gradient", "row": "Multivariable Calculus", "column": "Mathematical Tool" },
        { "concept": "DefiniteIntegral", "row": "Integral Calculus", "column": "Core Concept" },
        { "concept": "Area", "row": "Integral Calculus", "column": "Application" },
        { "concept": "Gamma", "row": "Integral Calculus", "column": "Mathematical Tool" }
      ],
      "wrongConcepts": ["Recursion", "Diffraction"]
    },
    {
      "id": 2,
      "question": "Match the Engineering Physics concepts to the correct combination of topic categories.",
      "rows": ["Mechanics", "Waves", "Quantum Physics"],
      "columns": ["Core Concept", "Phenomenon", "Application"],
      "correctConcepts": [
        { "concept": "Newton", "row": "Mechanics", "column": "Core Concept" },
        { "concept": "Kinematics", "row": "Mechanics", "column": "Phenomenon" },
        { "concept": "Energy", "row": "Mechanics", "column": "Application" },
        { "concept": "Oscillation", "row": "Waves", "column": "Core Concept" },
        { "concept": "Doppler", "row": "Waves", "column": "Phenomenon" },
        { "concept": "Resonance", "row": "Waves", "column": "Application" },
        { "concept": "Wavefunction", "row": "Quantum Physics", "column": "Core Concept" },
        { "concept": "Uncertainty", "row": "Quantum Physics", "column": "Phenomenon" },
        { "concept": "Schrodinger", "row": "Quantum Physics", "column": "Application" }
      ],
      "wrongConcepts": ["Recursion", "Abstraction"]
    },
    {
      "id": 3,
      "question": "Match the Problem Solving and Python concepts to the correct combination of topic categories.",
      "rows": ["Algorithms", "Control Structures", "Functions"],
      "columns": ["Design", "Execution", "Problem Solving"],
      "correctConcepts": [
        { "concept": "Pseudocode", "row": "Algorithms", "column": "Design" },
        { "concept": "Flowchart", "row": "Algorithms", "column": "Execution" },
        { "concept": "TraceTable", "row": "Algorithms", "column": "Problem Solving" },
        { "concept": "IfElse", "row": "Control Structures", "column": "Design" },
        { "concept": "ForLoop", "row": "Control Structures", "column": "Execution" },
        { "concept": "WhileLoop", "row": "Control Structures", "column": "Problem Solving" },
        { "concept": "Parameters", "row": "Functions", "column": "Design" },
        { "concept": "Return", "row": "Functions", "column": "Execution" },
        { "concept": "Recursion", "row": "Functions", "column": "Problem Solving" }
      ],
      "wrongConcepts": ["Polarization", "Gradient"]
    },
    {
      "id": 4,
      "question": "Match the Design Thinking concepts to the correct combination of stages and activities.",
      "rows": ["Empathize", "Ideate", "Prototype"],
      "columns": ["Understand", "Generate", "Validate"],
      "correctConcepts": [
        { "concept": "Persona", "row": "Empathize", "column": "Understand" },
        { "concept": "Interview", "row": "Empathize", "column": "Generate" },
        { "concept": "PainPoint", "row": "Empathize", "column": "Validate" },
        { "concept": "Brainstorming", "row": "Ideate", "column": "Understand" },
        { "concept": "SCAMPER", "row": "Ideate", "column": "Generate" },
        { "concept": "MindMapping", "row": "Ideate", "column": "Validate" },
        { "concept": "Wireframe", "row": "Prototype", "column": "Understand" },
        { "concept": "Mockup", "row": "Prototype", "column": "Generate" },
        { "concept": "Usability", "row": "Prototype", "column": "Validate" }
      ],
      "wrongConcepts": ["Derivative", "Compiler"]
    }
];

const fallbackQuestions = rawQuestions.map((q) => {
    let catId = 0;
    const rowCats = q.rows.map(r => ({ id: "r" + (catId++), label: r }));
    const colCats = q.columns.map(c => ({ id: "c" + (catId++), label: c }));
    
    let bankItems = q.correctConcepts.map(cc => {
        const rId = rowCats.find(r => r.label === cc.row).id;
        const cId = colCats.find(c => c.label === cc.column).id;
        return {
            name: cc.concept,
            validCategoryIds: [rId, cId]
        };
    });

    q.wrongConcepts.forEach(wc => {
        bankItems.push({
            name: wc,
            validCategoryIds: ["invalid_r", "invalid_c"]
        });
    });

    return {
        id: 'CSE_BINGO_' + q.id,
        branch: 'CSE',
        title: "Bingo Bonanza - " + q.id,
        questionText: q.question,
        gridConfig: {
            rows: rowCats,
            cols: colCats,
            bankItems: bankItems
        }
    };
});

// Append this export to Data.js
let dataContent = fs.readFileSync(pathData, 'utf8');
dataContent += "\nexport const FALLBACK_BINGO_QUESTIONS = " + JSON.stringify(fallbackQuestions, null, 2) + ";\n";
fs.writeFileSync(pathData, dataContent, 'utf8');


// 2. Update AlgoBingo.jsx
let jsxContent = fs.readFileSync(pathJSX, 'utf8');

// Ensure import includes FALLBACK_BINGO_QUESTIONS
jsxContent = jsxContent.replace(
    `import { Storage } from './Storage';`,
    `import { Storage } from './Storage';\nimport { FALLBACK_BINGO_QUESTIONS } from './Data';`
);

// Update useState initial value
jsxContent = jsxContent.replace(
    `const [allQuestions, setAllQuestions] = useState([]);`,
    `const [allQuestions, setAllQuestions] = useState(FALLBACK_BINGO_QUESTIONS);`
);

// Replace "Could not fetch from backend" with logic to set fallback
jsxContent = jsxContent.replace(
    `console.warn("Could not fetch from backend");`,
    `console.warn("Could not fetch from backend");\n        setAllQuestions(FALLBACK_BINGO_QUESTIONS);`
);

// Completely remove the "START LEGACY GAME" button and rely purely on allQuestions
// Since allQuestions now guarantees to have the 4 questions, we don't even need the ternary, but let's keep it safe.
jsxContent = jsxContent.replace(
    /<button \s*onClick=\{\(\) => startGame\(\)\}\s*className="[^"]*">\s*START LEGACY GAME\s*<\/button>/g,
    `{/* No legacy game allowed */}`
);

// Replace "ALGO RACK" with "CONCEPT BANK"
jsxContent = jsxContent.replace(/ALGO RACK/g, "CONCEPT BANK");

// Replace "11 Left" with dynamic count based on gridConfig.bankItems length minus filled items
jsxContent = jsxContent.replace(
    /<div className="px-2 py-0\.5 rounded bg-indigo-500\/20 text-indigo-300 text-\[10px\] font-black uppercase tracking-widest border border-indigo-500\/50">\s*11 Left\s*<\/div>/g,
    `<div className="px-2 py-0.5 rounded bg-indigo-500/20 text-indigo-300 text-[10px] font-black uppercase tracking-widest border border-indigo-500/50">
        {gridConfig.bankItems.length - Object.keys(session.filledBoxes || {}).length} Left
     </div>`
);

fs.writeFileSync(pathJSX, jsxContent, 'utf8');

console.log("AlgoBingo Fallback fix applied.");
