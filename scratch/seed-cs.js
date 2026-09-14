import { MongoClient } from 'mongodb';
import { questions as kbcQuestions } from '../src/questions.js';

const MONGODB_URI = "mongodb+srv://parthcse_db_user:e5T9QIbSX4JVDnpC@cluster0.jo12y4w.mongodb.net/?retryWrites=true&w=majority";
const DB_NAME = "miet_games";

async function seedDatabase() {
  console.log("Connecting to MongoDB Atlas...");
  const client = new MongoClient(MONGODB_URI);

  try {
    await client.connect();
    console.log("Connected successfully!");
    
    const db = client.db(DB_NAME);

    // Seed into kbc_questions_cs collection for the CS guys
    console.log("Seeding KBC Questions for CS...");
    const kbcCollection = db.collection('kbc_questions_cs');
    await kbcCollection.deleteMany({});
    await kbcCollection.insertMany(kbcQuestions.map((q, i) => ({ ...q, _id: `kbc_q_cs_${i}`, stream: 'CS' })));
    console.log(`Inserted ${kbcQuestions.length} KBC CS questions.`);

    console.log("Database seeded successfully!");
  } catch (error) {
    console.error("Error seeding database:", error);
  } finally {
    await client.close();
    console.log("Connection closed.");
  }
}

seedDatabase();
