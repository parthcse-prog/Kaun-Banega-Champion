import fs from 'fs';
import { MongoClient } from 'mongodb';

async function seedWordConnect() {
  const uri = 'mongodb+srv://parthcse_db_user:e5T9QIbSX4JVDnpC@cluster0.jo12y4w.mongodb.net/?retryWrites=true&w=majority';
  const client = new MongoClient(uri);
  
  try {
    await client.connect();
    const db = client.db('miet_games');
    
    const semesters = [1, 3, 5, 7];
    
    for (const sem of semesters) {
      const data = JSON.parse(fs.readFileSync(`src/sem${sem}_word.json`, 'utf8'));
      
      const formatted = data.map(q => {
        let ans = q.correct_answer;
        // Strip out non-alphanumeric just to be safe, but keep spaces
        ans = ans.replace(/[^a-zA-Z0-9 -_]/g, "").trim();
        
        return {
          id: q.question_id,
          question: q.question,
          answer: ans,
          stream: 'CSE',
          subject: `Semester ${sem}`,
          topic: 'Mixed',
          explanation: `You successfully identified ${ans}!`
        };
      });
      
      const collName = `word_connect_cs_sem${sem}`;
      await db.collection(collName).deleteMany({});
      if (formatted.length > 0) {
        await db.collection(collName).insertMany(formatted);
      }
      console.log(`Seeded ${formatted.length} questions into ${collName}`);
    }
    
  } catch (error) {
    console.error("Error:", error);
  } finally {
    await client.close();
  }
}

seedWordConnect();
