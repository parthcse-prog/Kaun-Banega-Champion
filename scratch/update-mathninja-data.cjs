const fs = require('fs');

const path = 'D:/parth/Kaun Banega Champion/Kaun-Banega-Champion/src/MathNinja/Data.js';
let content = fs.readFileSync(path, 'utf8');

const newCseConceptQuestions = [
    {
      "id": 1,
      "question": "Which of these are important concepts in Engineering Mathematics-I?",
      "correctOnes": ["Taylor", "Maclaurin", "Lagrange", "Gradient"],
      "wrongOnes": ["Recursion", "Hashing", "Polymorphism", "Deadlock"]
    },
    {
      "id": 2,
      "question": "Which of these are important concepts in Engineering Physics?",
      "correctOnes": ["Doppler", "Diffraction", "Polarization", "Schrodinger"],
      "wrongOnes": ["Recursion", "Inheritance", "Hashing", "Compilation"]
    },
    {
      "id": 3,
      "question": "Which of these are fundamental Problem Solving and Python concepts?",
      "correctOnes": ["Algorithm", "Recursion", "Iteration", "Debugging"],
      "wrongOnes": ["Refraction", "Eigenvalue", "Polarization", "Empathy"]
    },
    {
      "id": 4,
      "question": "Which of these are important Design Thinking concepts?",
      "correctOnes": ["Empathy", "Ideation", "Prototype", "Iteration"],
      "wrongOnes": ["Recursion", "Derivative", "Diffraction", "Compiler"]
    },
    {
      "id": 5,
      "question": "Which of these are essential practical programming concepts for a CSE student?",
      "correctOnes": ["Lists", "Dictionaries", "Exceptions", "CSV"],
      "wrongOnes": ["Polarization", "Curvature", "Doppler", "Lagrange"]
    }
];

const toInsert = newCseConceptQuestions.map((q, i) => {
    const explanations = {};
    q.wrongOnes.forEach(w => {
        explanations[w.toUpperCase()] = w + " is not the correct concept for this subject.";
    });

    return {
        id: 'CSE_CN_' + q.id,
        branch: 'CSE',
        subject: 'General Engineering',
        topic: 'Core Concepts',
        questionText: q.question,
        correctConcepts: q.correctOnes.map(c => c.toUpperCase()),
        distractors: q.wrongOnes.map(w => w.toUpperCase()),
        explanations: explanations
    };
});

const dataContent = "export const QUESTIONS = " + JSON.stringify(toInsert, null, 2) + ";\\n";
fs.writeFileSync(path, dataContent.replace(/\\n/g, '\n'), 'utf8');
console.log("Updated Data.js with new Concept Ninja questions");
