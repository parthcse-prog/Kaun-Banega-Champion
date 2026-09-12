import { MongoClient } from 'mongodb';
import { questions as kbcQuestions } from '../src/questions.js';
import { SHAPES, conditionLesson } from '../src/LogicBlast/Data.js';
import { QUESTION_BANK as wordConnectQuestions } from '../src/WordConnect/Data.js';
import { QUESTIONS as conceptNinjaQuestions } from '../src/MathNinja/Data.js';
import { ALGO_BINGO_DATA } from '../src/AlgoBingo/Data.js';

const MONGODB_URI = "mongodb+srv://parthcse_db_user:e5T9QIbSX4JVDnpC@cluster0.jo12y4w.mongodb.net/?retryWrites=true&w=majority";
const DB_NAME = "miet_games";

async function seedDatabase() {
  console.log("Connecting to MongoDB Atlas...");
  const client = new MongoClient(MONGODB_URI);

  try {
    await client.connect();
    console.log("Connected successfully!");
    
    const db = client.db(DB_NAME);

    // 1. KBC
    console.log("Seeding KBC Questions...");
    const kbcCollection = db.collection('kbc_questions');
    await kbcCollection.deleteMany({});
    await kbcCollection.insertMany(kbcQuestions.map((q, i) => ({ ...q, _id: `kbc_q_${i}` })));
    console.log(`Inserted ${kbcQuestions.length} KBC questions.`);

    // 2. Logic Blast
    console.log("Seeding Logic Blast Data...");
    const lbCollection = db.collection('logic_blast_data');
    await lbCollection.deleteMany({});
    await lbCollection.insertOne({ _id: 'logic-blast-default', shapes: SHAPES, conditionLesson });
    console.log("Inserted Logic Blast data.");

    // 3. Word Connect
    console.log("Seeding Word Connect Data...");
    const wcCollection = db.collection('word_connect_data');
    await wcCollection.deleteMany({});
    await wcCollection.insertMany(wordConnectQuestions.map((q, i) => ({ ...q, _id: `wc_q_${i}` })));
    console.log(`Inserted ${wordConnectQuestions.length} Word Connect questions.`);

    // 4. Concept Ninja
    console.log("Seeding Concept Ninja Data...");
    const cnCollection = db.collection('concept_ninja_data');
    await cnCollection.deleteMany({});
    await cnCollection.insertMany(conceptNinjaQuestions.map((q, i) => ({ ...q, _id: `cn_q_${i}` })));
    console.log(`Inserted ${conceptNinjaQuestions.length} Concept Ninja questions.`);

    // 5. Algo Bingo
    console.log("Seeding Algo Bingo Data...");
    const abCollection = db.collection('algo_bingo_data');
    await abCollection.deleteMany({});
    await abCollection.insertOne({ ...ALGO_BINGO_DATA, _id: ALGO_BINGO_DATA._id || 'cs-algo-bingo' });
    console.log("Inserted Algo Bingo data.");

    console.log("Database seeded successfully!");
  } catch (error) {
    console.error("Error seeding database:", error);
  } finally {
    await client.close();
    console.log("Connection closed.");
  }
}

seedDatabase();
