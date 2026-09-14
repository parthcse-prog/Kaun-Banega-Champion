const fs = require('fs');

const path = 'D:/parth/Kaun Banega Champion/Kaun-Banega-Champion/src/WordConnect/Data.js';
let content = fs.readFileSync(path, 'utf8');

const newCseQuestions = [
    {
      "id": "CSE_001",
      "question": "What is the visual representation of an algorithm using symbols and arrows called?",
      "answer": "Flowchart",
      "explanation": "You successfully identified Flowchart!"
    },
    {
      "id": "CSE_002",
      "question": "What computational thinking technique divides a complex problem into smaller parts?",
      "answer": "Decomposition",
      "explanation": "You successfully identified Decomposition!"
    },
    {
      "id": "CSE_003",
      "question": "What technique focuses on identifying similarities between problems or situations?",
      "answer": "Pattern",
      "explanation": "You successfully identified Pattern!"
    },
    {
      "id": "CSE_004",
      "question": "What is the process of simplifying a complex problem by focusing only on important details?",
      "answer": "Abstraction",
      "explanation": "You successfully identified Abstraction!"
    },
    {
      "id": "CSE_005",
      "question": "What Python feature determines the structure of code through whitespace?",
      "answer": "Indentation",
      "explanation": "You successfully identified Indentation!"
    },
    {
      "id": "CSE_006",
      "question": "Which Python data type represents True or False values?",
      "answer": "Boolean",
      "explanation": "You successfully identified Boolean!"
    },
    {
      "id": "CSE_007",
      "question": "Which Python statement immediately exits a loop?",
      "answer": "Break",
      "explanation": "You successfully identified Break!"
    },
    {
      "id": "CSE_008",
      "question": "Which Python statement skips the current loop iteration?",
      "answer": "Continue",
      "explanation": "You successfully identified Continue!"
    },
    {
      "id": "CSE_009",
      "question": "What term describes the region of a program where a variable can be accessed?",
      "answer": "Scope",
      "explanation": "You successfully identified Scope!"
    },
    {
      "id": "CSE_010",
      "question": "What special string in a Python function can describe what the function does?",
      "answer": "Docstring",
      "explanation": "You successfully identified Docstring!"
    },
    {
      "id": "CSE_011",
      "question": "Which file format is commonly used to store tabular data separated by commas?",
      "answer": "CSV",
      "explanation": "You successfully identified CSV!"
    },
    {
      "id": "CSE_012",
      "question": "Which mathematical operator represents the rate of change of a function?",
      "answer": "Derivative",
      "explanation": "You successfully identified Derivative!"
    },
    {
      "id": "CSE_013",
      "question": "Which vector operator measures how much a vector field spreads outward?",
      "answer": "Divergence",
      "explanation": "You successfully identified Divergence!"
    },
    {
      "id": "CSE_014",
      "question": "Which vector operator describes the rotation of a vector field?",
      "answer": "Curl",
      "explanation": "You successfully identified Curl!"
    },
    {
      "id": "CSE_015",
      "question": "Which phenomenon causes a change in observed frequency due to relative motion?",
      "answer": "Doppler",
      "explanation": "You successfully identified Doppler!"
    },
    {
      "id": "CSE_016",
      "question": "Which scientist's equations describe the fundamental behavior of electromagnetic fields?",
      "answer": "Maxwell",
      "explanation": "You successfully identified Maxwell!"
    },
    {
      "id": "CSE_017",
      "question": "What property of light describes the orientation of its electric field oscillations?",
      "answer": "Polarization",
      "explanation": "You successfully identified Polarization!"
    },
    {
      "id": "CSE_018",
      "question": "Which type of laser is specifically included in the Semester-I Engineering Physics syllabus?",
      "answer": "Ruby",
      "explanation": "You successfully identified Ruby!"
    },
    {
      "id": "CSE_019",
      "question": "What type of semiconductor contains no intentionally added impurities?",
      "answer": "Intrinsic",
      "explanation": "You successfully identified Intrinsic!"
    },
    {
      "id": "CSE_020",
      "question": "What process involves generating many possible ideas before selecting the best one?",
      "answer": "Ideation",
      "explanation": "You successfully identified Ideation!"
    }
].map(q => ({...q, stream: 'CSE', subject: 'General CS', topic: 'Mixed', difficulty: 1}));

const lawIndex = content.indexOf('// LAW QUESTIONS');
const head = content.substring(0, content.indexOf('// CSE QUESTIONS') + '// CSE QUESTIONS'.length + 1);
const tail = content.substring(lawIndex);

const mid = newCseQuestions.map(q => "  {\n    id: '" + q.id + "', stream: 'CSE', subject: '" + q.subject + "', topic: '" + q.topic + "', difficulty: " + q.difficulty + ",\n    question: \"" + q.question + "\",\n    answer: \"" + q.answer + "\",\n    explanation: \"" + q.explanation + "\"\n  },").join('\\n') + '\\n\\n  ';

fs.writeFileSync(path, head + mid + tail, 'utf8');
console.log("Updated Data.js with new CSE questions");
