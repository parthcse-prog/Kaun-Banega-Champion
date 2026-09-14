import express from 'express';
import cors from 'cors';
import { MongoClient } from 'mongodb';

const app = express();
const port = 5000;

app.use(cors());
app.use(express.json());

const MONGODB_URI = "mongodb+srv://parthcse_db_user:e5T9QIbSX4JVDnpC@cluster0.jo12y4w.mongodb.net/?retryWrites=true&w=majority";
const DB_NAME = "miet_games";

let db;

async function connectDB() {
  try {
    const client = new MongoClient(MONGODB_URI);
    await client.connect();
    db = client.db(DB_NAME);
    console.log("Connected to MongoDB Atlas");
  } catch (error) {
    console.error("MongoDB connection error:", error);
  }
}

connectDB();

app.get('/api/wordconnect/cs', async (req, res) => {
  try {
    if (!db) {
        return res.status(500).json({ error: "Database not connected yet" });
    }
    const collection = db.collection('word_connect_cs');
    const questions = await collection.aggregate([
        { $sample: { size: 20 } }
    ]).toArray();
    
    res.json(questions);
  } catch (error) {
    console.error("Error fetching questions:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

app.get('/api/conceptninja/cs', async (req, res) => {
  try {
    if (!db) {
        return res.status(500).json({ error: "Database not connected yet" });
    }
    const collection = db.collection('concept_ninja_cs');
    const questions = await collection.find({}).toArray();
    
    res.json(questions);
  } catch (error) {
    console.error("Error fetching concept ninja questions:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

app.get('/api/algobingo/cs', async (req, res) => {
  try {
    if (!db) {
        return res.status(500).json({ error: "Database not connected yet" });
    }
    const collection = db.collection('algo_bingo_cs');
    const questions = await collection.find({}).toArray();
    
    res.json(questions);
  } catch (error) {
    console.error("Error fetching algo bingo questions:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

app.get('/api/whosthat/cs', async (req, res) => {
  try {
    if (!db) {
        return res.status(500).json({ error: "Database not connected yet" });
    }
    const collection = db.collection('whos_that_cs');
    const questions = await collection.find({}).toArray();
    
    res.json(questions);
  } catch (error) {
    console.error("Error fetching whos that questions:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

app.listen(port, () => {
  console.log(`Backend server running at http://localhost:${port}`);
});
