import fs from 'fs';
import { MongoClient } from 'mongodb';

const sem1Celebs = [
  { name: "Bill Gates", initials: "BG", color: "#6fcf97", hint: "Co-founded Microsoft and played a major role in the personal computer revolution." },
  { name: "Steve Jobs", initials: "SJ", color: "#5a7ee6", hint: "Co-founded Apple and oversaw the creation of the iPhone and Mac." },
  { name: "Mark Zuckerberg", initials: "MZ", color: "#5a7ee6", hint: "Co-founded a social network from his Harvard dorm room in 2004; the company later renamed itself Meta." },
  { name: "Alan Turing", initials: "AT", color: "#c792f2", hint: "Considered the father of theoretical computer science and artificial intelligence; played a crucial role in cracking the Enigma code." },
  { name: "Ada Lovelace", initials: "AL", color: "#e6685a", hint: "Often recognized as the world's first computer programmer for her early work on mechanical computers." }
];

const sem3Celebs = [
  { name: "Linus Torvalds", initials: "LT", color: "#6fcf97", hint: "Created the Linux operating system kernel and the version control system Git." },
  { name: "Tim Cook", initials: "TC", color: "#5a7ee6", hint: "The current CEO of Apple, succeeding Steve Jobs." },
  { name: "Jeff Bezos", initials: "JB", color: "#e6b05a", hint: "Founded Amazon from his garage in 1994, building it into the world's largest e-commerce company." },
  { name: "Satya Nadella", initials: "SN", color: "#5aa9e6", hint: "Current CEO of Microsoft, widely credited with transforming the company's culture toward cloud computing." },
  { name: "Larry Page", initials: "LP", color: "#e6685a", hint: "Co-founded Google and invented the PageRank algorithm that powers its search engine." }
];

const sem5Celebs = [
  { name: "Elon Musk", initials: "EM", color: "#c792f2", hint: "Runs an electric car company (Tesla) and a rocket company (SpaceX), and owns X (formerly Twitter)." },
  { name: "Sundar Pichai", initials: "SP", color: "#e6685a", hint: "The current CEO of Google and Alphabet Inc., who led the development of the Chrome browser." },
  { name: "Jack Dorsey", initials: "JD", color: "#5aa9e6", hint: "Co-founded Twitter (now X) and the financial payments company Block (formerly Square)." },
  { name: "Kevin Systrom", initials: "KS", color: "#c792f2", hint: "Co-founded Instagram, the massively popular photo-sharing app." },
  { name: "Sergey Brin", initials: "SB", color: "#6fcf97", hint: "Co-founded Google alongside Larry Page while they were PhD students at Stanford." }
];

const sem7Celebs = [
  { name: "Sam Altman", initials: "SA", color: "#e6b05a", hint: "CEO of OpenAI, the company known for building ChatGPT and GPT-4." },
  { name: "Ilya Sutskever", initials: "IS", color: "#e6685a", hint: "Co-founder and former Chief Scientist of OpenAI, highly regarded as one of the top AI minds in the world." },
  { name: "Demis Hassabis", initials: "DH", color: "#805AD5", hint: "CEO and co-founder of DeepMind, the AI lab that created AlphaGo." },
  { name: "Jensen Huang", initials: "JH", color: "#38A169", hint: "CEO and co-founder of NVIDIA, the company designing the massive GPUs powering the AI revolution." },
  { name: "Yann LeCun", initials: "YL", color: "#3182CE", hint: "Chief AI Scientist at Meta, often called one of the 'Godfathers of AI'." }
];

async function seedWhosThat() {
  const uri = 'mongodb+srv://parthcse_db_user:e5T9QIbSX4JVDnpC@cluster0.jo12y4w.mongodb.net/?retryWrites=true&w=majority';
  const client = new MongoClient(uri);
  
  try {
    await client.connect();
    const db = client.db('miet_games');
    
    for (const [sem, celebs] of [[1, sem1Celebs], [3, sem3Celebs], [5, sem5Celebs], [7, sem7Celebs]]) {
      const collName = `whos_that_cs_sem${sem}`;
      await db.collection(collName).deleteMany({});
      await db.collection(collName).insertMany(celebs);
      console.log(`Seeded WhosThat for Sem ${sem}`);
    }
  } catch (error) {
    console.error("Error:", error);
  } finally {
    await client.close();
  }
}

seedWhosThat();
