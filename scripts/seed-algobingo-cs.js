import { MongoClient } from 'mongodb';

const MONGODB_URI = "mongodb+srv://parthcse_db_user:e5T9QIbSX4JVDnpC@cluster0.jo12y4w.mongodb.net/?retryWrites=true&w=majority";
const DB_NAME = "miet_games";

const rawQuestions = [
    {
      "id": 1,
      "question": "Match the Engineering Mathematics-I concepts to the correct combination of topic categories.",
      "rows": [
        "Differential Calculus",
        "Multivariable Calculus",
        "Integral Calculus"
      ],
      "columns": [
        "Core Concept",
        "Application",
        "Mathematical Tool"
      ],
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
      "wrongConcepts": [
        "Recursion",
        "Diffraction"
      ]
    },
    {
      "id": 2,
      "question": "Match the Engineering Physics concepts to the correct combination of topic categories.",
      "rows": [
        "Mechanics",
        "Waves",
        "Quantum Physics"
      ],
      "columns": [
        "Core Concept",
        "Phenomenon",
        "Application"
      ],
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
      "wrongConcepts": [
        "Recursion",
        "Abstraction"
      ]
    },
    {
      "id": 3,
      "question": "Match the Problem Solving and Python concepts to the correct combination of topic categories.",
      "rows": [
        "Algorithms",
        "Control Structures",
        "Functions"
      ],
      "columns": [
        "Design",
        "Execution",
        "Problem Solving"
      ],
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
      "wrongConcepts": [
        "Polarization",
        "Gradient"
      ]
    },
    {
      "id": 4,
      "question": "Match the Design Thinking concepts to the correct combination of stages and activities.",
      "rows": [
        "Empathize",
        "Ideate",
        "Prototype"
      ],
      "columns": [
        "Understand",
        "Generate",
        "Validate"
      ],
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
      "wrongConcepts": [
        "Derivative",
        "Compiler"
      ]
    }
];

async function seedDatabase() {
  console.log("Connecting to MongoDB Atlas...");
  const client = new MongoClient(MONGODB_URI);

  try {
    await client.connect();
    console.log("Connected successfully!");
    
    const db = client.db(DB_NAME);

    console.log("Seeding Algo Bingo Questions for CS...");
    const collection = db.collection('algo_bingo_cs');
    await collection.deleteMany({});
    
    // Convert to the exact GridConfig schema expected by AlgoBingo logic
    const toInsert = rawQuestions.map((q) => {
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

        // Add wrong concepts as items with NO valid categories so they can never be placed correctly
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

    await collection.insertMany(toInsert);
    console.log("Inserted " + toInsert.length + " Algo Bingo CS questions.");
    
  } catch (error) {
    console.error("Error seeding database:", error);
  } finally {
    await client.close();
    console.log("Connection closed.");
  }
}

seedDatabase();
