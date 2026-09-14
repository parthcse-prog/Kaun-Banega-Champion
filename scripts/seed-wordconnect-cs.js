import { MongoClient } from 'mongodb';

const MONGODB_URI = "mongodb+srv://parthcse_db_user:e5T9QIbSX4JVDnpC@cluster0.jo12y4w.mongodb.net/?retryWrites=true&w=majority";
const DB_NAME = "miet_games";

const cseQuestions = [
    {
      "id": 1,
      "question": "What is the visual representation of an algorithm using symbols and arrows called?",
      "answer": "Flowchart"
    },
    {
      "id": 2,
      "question": "What computational thinking technique divides a complex problem into smaller parts?",
      "answer": "Decomposition"
    },
    {
      "id": 3,
      "question": "What technique focuses on identifying similarities between problems or situations?",
      "answer": "Pattern"
    },
    {
      "id": 4,
      "question": "What is the process of simplifying a complex problem by focusing only on important details?",
      "answer": "Abstraction"
    },
    {
      "id": 5,
      "question": "What Python feature determines the structure of code through whitespace?",
      "answer": "Indentation"
    },
    {
      "id": 6,
      "question": "Which Python data type represents True or False values?",
      "answer": "Boolean"
    },
    {
      "id": 7,
      "question": "Which Python statement immediately exits a loop?",
      "answer": "Break"
    },
    {
      "id": 8,
      "question": "Which Python statement skips the current loop iteration?",
      "answer": "Continue"
    },
    {
      "id": 9,
      "question": "What term describes the region of a program where a variable can be accessed?",
      "answer": "Scope"
    },
    {
      "id": 10,
      "question": "What special string in a Python function can describe what the function does?",
      "answer": "Docstring"
    },
    {
      "id": 11,
      "question": "Which file format is commonly used to store tabular data separated by commas?",
      "answer": "CSV"
    },
    {
      "id": 12,
      "question": "Which mathematical operator represents the rate of change of a function?",
      "answer": "Derivative"
    },
    {
      "id": 13,
      "question": "Which vector operator measures how much a vector field spreads outward?",
      "answer": "Divergence"
    },
    {
      "id": 14,
      "question": "Which vector operator describes the rotation of a vector field?",
      "answer": "Curl"
    },
    {
      "id": 15,
      "question": "Which phenomenon causes a change in observed frequency due to relative motion?",
      "answer": "Doppler"
    },
    {
      "id": 16,
      "question": "Which scientist's equations describe the fundamental behavior of electromagnetic fields?",
      "answer": "Maxwell"
    },
    {
      "id": 17,
      "question": "What property of light describes the orientation of its electric field oscillations?",
      "answer": "Polarization"
    },
    {
      "id": 18,
      "question": "Which type of laser is specifically included in the Semester-I Engineering Physics syllabus?",
      "answer": "Ruby"
    },
    {
      "id": 19,
      "question": "What type of semiconductor contains no intentionally added impurities?",
      "answer": "Intrinsic"
    },
    {
      "id": 20,
      "question": "What process involves generating many possible ideas before selecting the best one?",
      "answer": "Ideation"
    }
];

async function seedDatabase() {
  console.log("Connecting to MongoDB Atlas...");
  const client = new MongoClient(MONGODB_URI);

  try {
    await client.connect();
    console.log("Connected successfully!");
    
    const db = client.db(DB_NAME);

    console.log("Seeding Word Connect Questions for CS...");
    const collection = db.collection('word_connect_cs');
    await collection.deleteMany({});
    
    // Add stream and explanation placeholders
    const toInsert = cseQuestions.map((q, i) => ({
        ...q,
        stream: 'CSE',
        subject: 'General CS',
        topic: 'Mixed',
        explanation: "You successfully identified " + q.answer + "!"
    }));

    await collection.insertMany(toInsert);
    console.log("Inserted " + toInsert.length + " Word Connect CS questions.");
    
  } catch (error) {
    console.error("Error seeding database:", error);
  } finally {
    await client.close();
    console.log("Connection closed.");
  }
}

seedDatabase();
