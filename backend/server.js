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

// LEADERBOARD ENDPOINTS
app.post('/api/leaderboard/submit', async (req, res) => {
  try {
    if (!db) return res.status(500).json({ error: "Database not connected yet" });
    
    const { pi360_id, name, avatar, gameName, xp } = req.body;
    if (!pi360_id) return res.status(400).json({ error: "missing pi360_id" });

    const collection = db.collection('leaderboard');
    const user = await collection.findOne({ _id: pi360_id });
    
    let games = user?.games || {};
    // Update only if the new XP is higher for this game
    if (!games[gameName] || xp > games[gameName]) {
      games[gameName] = xp;
    }
    
    const totalXP = Object.values(games).reduce((a, b) => a + b, 0);
    
    await collection.updateOne(
      { _id: pi360_id },
      { $set: { name, avatar, games, totalXP, lastUpdated: new Date() } },
      { upsert: true }
    );
    
    res.json({ success: true, totalXP });
  } catch (error) {
    console.error("Error submitting score:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

app.get('/api/leaderboard', async (req, res) => {
  try {
    if (!db) return res.status(500).json({ error: "Database not connected yet" });
    
    const collection = db.collection('leaderboard');
    // Fetch top 50, sort by totalXP descending
    const topUsers = await collection.find({}).sort({ totalXP: -1 }).limit(50).toArray();
    
    res.json(topUsers);
  } catch (error) {
    console.error("Error fetching leaderboard:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

app.listen(port, () => {
  console.log(`Backend server running at http://localhost:${port}`);
});
