import { MongoClient } from 'mongodb';

const MONGODB_URI = "mongodb+srv://parthcse_db_user:e5T9QIbSX4JVDnpC@cluster0.jo12y4w.mongodb.net/?retryWrites=true&w=majority";
const DB_NAME = "miet_games";

const rawQuestions = [
  { name: "Mark Zuckerberg", initials: "MZ", color: "#5a7ee6", hint: "Co-founded a social network from his Harvard dorm room in 2004; the company later renamed itself Meta." },
  { name: "Bill Gates", initials: "BG", color: "#6fcf97", hint: "Co-founded Microsoft and played a major role in the personal computer revolution." },
  { name: "Elon Musk", initials: "EM", color: "#c792f2", hint: "Runs an electric car company and a rocket company, and also owns the platform X (formerly Twitter)." },
  { name: "Sundar Pichai", initials: "SP", color: "#e6685a", hint: "The current CEO of Google and Alphabet Inc., who led the development of the Chrome browser." },
  { name: "Satya Nadella", initials: "SN", color: "#5aa9e6", hint: "Current CEO of Microsoft, widely credited with transforming the company's culture and pivoting it toward cloud computing." },
  { name: "Sam Altman", initials: "SA", color: "#e6b05a", hint: "CEO of a company known for building ChatGPT, and once testified before the US Congress about AI regulation." },
  { name: "Linus Torvalds", initials: "LT", color: "#6fcf97", hint: "Created the Linux kernel and the version control system Git." },
  { name: "Alan Turing", initials: "AT", color: "#c792f2", hint: "Considered the father of theoretical computer science and artificial intelligence; played a crucial role in cracking the Enigma code." },
  { name: "Ada Lovelace", initials: "AL", color: "#e6685a", hint: "Often recognized as the world's first computer programmer for her work on Charles Babbage's Analytical Engine." },
  { name: "James Gosling", initials: "JG", color: "#5a7ee6", hint: "Known as the father of the Java programming language." }
];

async function seedDatabase() {
  console.log("Connecting to MongoDB Atlas...");
  const client = new MongoClient(MONGODB_URI);

  try {
    await client.connect();
    console.log("Connected successfully!");
    
    const db = client.db(DB_NAME);

    console.log("Seeding Whos That Questions for CS...");
    const collection = db.collection('whos_that_cs');
    await collection.deleteMany({});
    
    await collection.insertMany(rawQuestions);
    console.log("Inserted " + rawQuestions.length + " Whos That CS questions.");
    
  } catch (error) {
    console.error("Error seeding database:", error);
  } finally {
    await client.close();
    console.log("Connection closed.");
  }
}

seedDatabase();
