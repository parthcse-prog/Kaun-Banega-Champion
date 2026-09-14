import { MongoClient } from 'mongodb';

const MONGODB_URI = "mongodb+srv://parthcse_db_user:e5T9QIbSX4JVDnpC@cluster0.jo12y4w.mongodb.net/?retryWrites=true&w=majority";
const DB_NAME = "miet_games";

const cseConceptQuestions = [
    {
      "id": 1,
      "question": "Which of these are important concepts in Engineering Mathematics-I?",
      "correctOnes": [
        "Taylor",
        "Maclaurin",
        "Lagrange",
        "Gradient"
      ],
      "wrongOnes": [
        "Recursion",
        "Hashing",
        "Polymorphism",
        "Deadlock"
      ]
    },
    {
      "id": 2,
      "question": "Which of these are important concepts in Engineering Physics?",
      "correctOnes": [
        "Doppler",
        "Diffraction",
        "Polarization",
        "Schrodinger"
      ],
      "wrongOnes": [
        "Recursion",
        "Inheritance",
        "Hashing",
        "Compilation"
      ]
    },
    {
      "id": 3,
      "question": "Which of these are fundamental Problem Solving and Python concepts?",
      "correctOnes": [
        "Algorithm",
        "Recursion",
        "Iteration",
        "Debugging"
      ],
      "wrongOnes": [
        "Refraction",
        "Eigenvalue",
        "Polarization",
        "Empathy"
      ]
    },
    {
      "id": 4,
      "question": "Which of these are important Design Thinking concepts?",
      "correctOnes": [
        "Empathy",
        "Ideation",
        "Prototype",
        "Iteration"
      ],
      "wrongOnes": [
        "Recursion",
        "Derivative",
        "Diffraction",
        "Compiler"
      ]
    },
    {
      "id": 5,
      "question": "Which of these are essential practical programming concepts for a CSE student?",
      "correctOnes": [
        "Lists",
        "Dictionaries",
        "Exceptions",
        "CSV"
      ],
      "wrongOnes": [
        "Polarization",
        "Curvature",
        "Doppler",
        "Lagrange"
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

    console.log("Seeding Concept Ninja Questions for CS...");
    const collection = db.collection('concept_ninja_cs');
    await collection.deleteMany({});
    
    // Map to MathNinja expected format
    const toInsert = cseConceptQuestions.map((q, i) => {
        const explanations = {};
        q.wrongOnes.forEach(w => {
            explanations[w] = w + " is not the correct concept for this subject.";
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

    await collection.insertMany(toInsert);
    console.log("Inserted " + toInsert.length + " Concept Ninja CS questions.");
    
  } catch (error) {
    console.error("Error seeding database:", error);
  } finally {
    await client.close();
    console.log("Connection closed.");
  }
}

seedDatabase();
