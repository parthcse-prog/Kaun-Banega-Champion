import { MongoClient } from 'mongodb';

const uri = "mongodb+srv://parthcse_db_user:e5T9QIbSX4JVDnpC@cluster0.jo12y4w.mongodb.net/?retryWrites=true&w=majority";
const DB_NAME = "miet_games";

const newBingoQuestion = {
  "id": "CSE_BINGO_NEW",
  "branch": "CSE",
  "title": "Bingo Bonanza - Python Lab & Exceptions",
  "questionText": "Match the Python File Handling, Libraries, and Lab Exercises to the correct combination of topic categories.",
  "gridConfig": {
    "rows": [
      { "id": "r0", "label": "File Handling & Exceptions" },
      { "id": "r1", "label": "Standard Libraries" },
      { "id": "r2", "label": "Lab Exercises" }
    ],
    "cols": [
      { "id": "c3", "label": "Data IO & Math" },
      { "id": "c4", "label": "Core Mechanisms" },
      { "id": "c5", "label": "Advanced & Assured" }
    ],
    "bankItems": [
      { "name": "a (Append)", "validCategoryIds": ["r0", "c3"] },
      { "name": "try-except", "validCategoryIds": ["r0", "c4"] },
      { "name": "finally", "validCategoryIds": ["r0", "c5"] },
      { "name": "csv", "validCategoryIds": ["r1", "c3"] },
      { "name": "random", "validCategoryIds": ["r1", "c4"] },
      { "name": "datetime", "validCategoryIds": ["r1", "c5"] },
      { "name": "Math Utilities", "validCategoryIds": ["r2", "c3"] },
      { "name": "Binary search", "validCategoryIds": ["r2", "c4"] },
      { "name": "Sum of digits", "validCategoryIds": ["r2", "c5"] },
      { "name": "Student gradebook", "validCategoryIds": ["invalid_r", "invalid_c"] },
      { "name": "Linear search", "validCategoryIds": ["invalid_r", "invalid_c"] }
    ]
  }
};

async function seed() {
  const client = new MongoClient(uri);
  try {
    await client.connect();
    console.log("Connected to MongoDB.");
    const db = client.db(DB_NAME);
    const collection = db.collection('algo_bingo_cs');
    
    await collection.deleteMany({});
    console.log("Cleared existing algo_bingo_cs collection.");
    
    await collection.insertOne(newBingoQuestion);
    console.log("Successfully seeded new Algo Bingo question.");
  } catch(e) {
    console.error(e);
  } finally {
    await client.close();
  }
}

seed();
