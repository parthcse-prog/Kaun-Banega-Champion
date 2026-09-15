import { MongoClient } from 'mongodb';

const uri = "mongodb+srv://parthcse_db_user:e5T9QIbSX4JVDnpC@cluster0.jo12y4w.mongodb.net/?retryWrites=true&w=majority";
const DB_NAME = "miet_games";

const bingo2 = {
  "id": "CSE_BINGO_DT_1",
  "branch": "CSE",
  "title": "Design Thinking: Empathy & Definition",
  "questionText": "Match the Empathy and Definition stage concepts to the correct combination of topic categories.",
  "gridConfig": {
    "rows": [
      { "id": "r0", "label": "User Research" },
      { "id": "r1", "label": "Mapping & Tools" },
      { "id": "r2", "label": "Problem Framing" }
    ],
    "cols": [
      { "id": "c3", "label": "Data Gathering" },
      { "id": "c4", "label": "Synthesis" },
      { "id": "c5", "label": "Outcomes" }
    ],
    "bankItems": [
      { "name": "User Interview", "validCategoryIds": ["r0", "c3"] },
      { "name": "Persona", "validCategoryIds": ["r0", "c4"] },
      { "name": "Pain point", "validCategoryIds": ["r0", "c5"] },
      { "name": "Observation", "validCategoryIds": ["r1", "c3"] },
      { "name": "Empathy map", "validCategoryIds": ["r1", "c4"] },
      { "name": "Journey Map", "validCategoryIds": ["r1", "c5"] },
      { "name": "5 Whys", "validCategoryIds": ["r2", "c3"] },
      { "name": "Problem Statement", "validCategoryIds": ["r2", "c4"] },
      { "name": "How-Might-We", "validCategoryIds": ["r2", "c5"] },
      { "name": "Business Plan", "validCategoryIds": ["invalid_r", "invalid_c"] },
      { "name": "Algorithm", "validCategoryIds": ["invalid_r", "invalid_c"] }
    ]
  }
};

const bingo3 = {
  "id": "CSE_BINGO_DT_2",
  "branch": "CSE",
  "title": "Design Thinking: Ideation Strategies",
  "questionText": "Match the Ideation stage concepts to their correct methodology types and team dynamics.",
  "gridConfig": {
    "rows": [
      { "id": "r0", "label": "Ideation Types" },
      { "id": "r1", "label": "Structured Methods" },
      { "id": "r2", "label": "Rapid Generation" }
    ],
    "cols": [
      { "id": "c3", "label": "Expansive" },
      { "id": "c4", "label": "Focused" },
      { "id": "c5", "label": "Collaborative" }
    ],
    "bankItems": [
      { "name": "Divergent thinking", "validCategoryIds": ["r0", "c3"] },
      { "name": "Convergent thinking", "validCategoryIds": ["r0", "c4"] },
      { "name": "Brainstorming", "validCategoryIds": ["r0", "c5"] },
      { "name": "SCAMPER", "validCategoryIds": ["r1", "c3"] },
      { "name": "Six Thinking Hats", "validCategoryIds": ["r1", "c4"] },
      { "name": "Mind Mapping", "validCategoryIds": ["r1", "c5"] },
      { "name": "Crazy-8s", "validCategoryIds": ["r2", "c3"] },
      { "name": "Prototyping", "validCategoryIds": ["r2", "c4"] },
      { "name": "6-3-5", "validCategoryIds": ["r2", "c5"] },
      { "name": "SQL Database", "validCategoryIds": ["invalid_r", "invalid_c"] },
      { "name": "Binary Search", "validCategoryIds": ["invalid_r", "invalid_c"] }
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
    
    // We want to KEEP the previous one and just add these two. Let's delete if they already exist.
    await collection.deleteMany({ id: { $in: ["CSE_BINGO_DT_1", "CSE_BINGO_DT_2"] } });
    
    await collection.insertMany([bingo2, bingo3]);
    console.log("Successfully seeded additional Algo Bingo questions.");
  } catch(e) {
    console.error(e);
  } finally {
    await client.close();
  }
}

seed();
