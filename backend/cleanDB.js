import { MongoClient } from 'mongodb';

const uri = "mongodb+srv://parthcse_db_user:e5T9QIbSX4JVDnpC@cluster0.jo12y4w.mongodb.net/?retryWrites=true&w=majority";

async function run() {
  const client = new MongoClient(uri);
  await client.connect();
  const db = client.db('miet_games');
  
  // Create an array of IDs from CSE_001 to CSE_020
  const idsToRemove = [];
  for(let i = 1; i <= 20; i++) {
    idsToRemove.push(`CSE_${i.toString().padStart(3, '0')}`);
  }
  
  await db.collection('word_connect_cs').deleteMany({ id: { $in: idsToRemove } });
  console.log("Deleted old physics questions.");
  await client.close();
}
run();
