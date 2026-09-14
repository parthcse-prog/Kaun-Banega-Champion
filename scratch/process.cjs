const fs = require('fs');

const data = {
  "questions": [
    {
      "id": 1,
      "question": "Which of the following is an essential characteristic of an algorithm?",
      "options": [
        "It must be written in Python",
        "It must have a finite sequence of well-defined steps",
        "It must always use a flowchart",
        "It can have unlimited steps"
      ],
      "answer": "It must have a finite sequence of well-defined steps"
    },
    {
      "id": 2,
      "question": "Which Python data type stores data as key-value pairs?",
      "options": [
        "List",
        "Tuple",
        "Dictionary",
        "Set"
      ],
      "answer": "Dictionary"
    },
    {
      "id": 3,
      "question": "Which Python keyword is used to define a function?",
      "options": [
        "function",
        "define",
        "def",
        "fun"
      ],
      "answer": "def"
    },
    {
      "id": 4,
      "question": "Which statement is used to handle exceptions in Python?",
      "options": [
        "if-else",
        "try-except",
        "for-while",
        "def-return"
      ],
      "answer": "try-except"
    },
    {
      "id": 5,
      "question": "What is the purpose of a base case in recursion?",
      "options": [
        "To increase the number of recursive calls",
        "To stop recursion from continuing indefinitely",
        "To create a loop",
        "To store variables permanently"
      ],
      "answer": "To stop recursion from continuing indefinitely"
    },
    {
      "id": 6,
      "question": "Which data structure follows the LIFO principle?",
      "options": [
        "Queue",
        "Stack",
        "Array",
        "Graph"
      ],
      "answer": "Stack"
    },
    {
      "id": 7,
      "question": "Which data structure follows the FIFO principle?",
      "options": [
        "Stack",
        "Queue",
        "Tree",
        "Set"
      ],
      "answer": "Queue"
    },
    {
      "id": 8,
      "question": "Which of the following is NOT a Python control structure mentioned in the Semester-I syllabus?",
      "options": [
        "if-else",
        "for loop",
        "while loop",
        "switch-case"
      ],
      "answer": "switch-case"
    },
    {
      "id": 9,
      "question": "Which type of error occurs when a program violates Python's syntax rules?",
      "options": [
        "Logical error",
        "Runtime error",
        "Syntax error",
        "Calculation error"
      ],
      "answer": "Syntax error"
    },
    {
      "id": 10,
      "question": "Which Python data structure is immutable?",
      "options": [
        "List",
        "Dictionary",
        "Tuple",
        "Set"
      ],
      "answer": "Tuple"
    },
    {
      "id": 11,
      "question": "Which law states that the algebraic sum of currents at a junction is zero?",
      "options": [
        "Kirchhoff's Current Law",
        "Ohm's Law",
        "Faraday's Law",
        "Coulomb's Law"
      ],
      "answer": "Kirchhoff's Current Law"
    },
    {
      "id": 12,
      "question": "Which physical quantity is a vector quantity?",
      "options": [
        "Mass",
        "Temperature",
        "Speed",
        "Velocity"
      ],
      "answer": "Velocity"
    },
    {
      "id": 13,
      "question": "Which phenomenon explains the spreading of light around an obstacle or through a narrow aperture?",
      "options": [
        "Reflection",
        "Diffraction",
        "Refraction",
        "Polarization"
      ],
      "answer": "Diffraction"
    },
    {
      "id": 14,
      "question": "Which principle is primarily responsible for guiding light through an optical fibre?",
      "options": [
        "Photoelectric effect",
        "Total internal reflection",
        "Doppler effect",
        "Electromagnetic induction"
      ],
      "answer": "Total internal reflection"
    },
    {
      "id": 15,
      "question": "Which principle states that the position and momentum of a particle cannot both be known with unlimited precision simultaneously?",
      "options": [
        "Newton's principle",
        "Heisenberg's uncertainty principle",
        "Huygens' principle",
        "Pascal's principle"
      ],
      "answer": "Heisenberg's uncertainty principle"
    },
    {
      "id": 16,
      "question": "What is the main purpose of dimensional analysis in physics?",
      "options": [
        "To convert every quantity into a vector",
        "To check the consistency of physical equations",
        "To measure temperature",
        "To calculate only mass"
      ],
      "answer": "To check the consistency of physical equations"
    },
    {
      "id": 17,
      "question": "Which type of semiconductor is obtained by adding controlled impurities to a pure semiconductor?",
      "options": [
        "Intrinsic semiconductor",
        "Extrinsic semiconductor",
        "Insulator",
        "Superconductor"
      ],
      "answer": "Extrinsic semiconductor"
    },
    {
      "id": 18,
      "question": "Which device is specifically used as a voltage regulator in the Semester-I Physics syllabus?",
      "options": [
        "LED",
        "Zener diode",
        "Photodiode",
        "Tunnel diode"
      ],
      "answer": "Zener diode"
    },
    {
      "id": 19,
      "question": "Which mathematical concept is primarily used to find maxima and minima of a function?",
      "options": [
        "Differentiation",
        "Matrix addition",
        "Vector addition",
        "Probability"
      ],
      "answer": "Differentiation"
    },
    {
      "id": 20,
      "question": "Which mathematical operation is commonly used to calculate the area under a curve?",
      "options": [
        "Differentiation",
        "Integration",
        "Matrix multiplication",
        "Vector subtraction"
      ],
      "answer": "Integration"
    }
  ]
};

function shuffleArray(array) {
  for (let i = array.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [array[i], array[j]] = [array[j], array[i]];
  }
}

const outQuestions = [];
for (let i = 0; i < 20; i++) {
  const q = data.questions[i];
  const options = [...q.options];
  shuffleArray(options);
  const correctIndex = options.indexOf(q.answer);
  
  outQuestions.push({
    question: q.question,
    options: options,
    answer: correctIndex
  });
}

let content = "export const questions = [\n";
for (let q of outQuestions) {
  content += `  {
    question: ${JSON.stringify(q.question)},
    options: ${JSON.stringify(q.options)},
    answer: ${q.answer}
  },\n`;
}
content += "];\n\n";

content += `export const backupQuestions = [
  { question: "What is the base of the hexadecimal number system?", options: ["8", "10", "16", "2"], answer: 2 },
  { question: "What is an algorithm?", options: ["A programming language", "A step-by-step procedure to solve a problem", "A hardware component", "An operating system"], answer: 1 },
  { question: "Which sorting algorithm is the most efficient on nearly sorted data?", options: ["Insertion Sort", "Selection Sort", "Merge Sort", "Heap Sort"], answer: 0 },
  { question: "What is a deadlock?", options: ["A circular wait condition where processes are blocked", "A fast process execution", "A memory leak", "A database backup"], answer: 0 }
];\n`;

fs.writeFileSync('../src/questions.js', content, 'utf8');
console.log("Written to src/questions.js");
