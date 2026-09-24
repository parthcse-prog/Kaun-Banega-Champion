import fs from 'fs';
import { MongoClient } from 'mongodb';

// We will use 9 items per semester to form a 3x3 grid.
// We'll create generic meaningful rows/cols.

const sem1Items = [
  "Doppler effect",
  "Vibration and communication",
  "Coupled electric and magnetic fields",
  "Coulomb's law",
  "Displacement current",
  "Relationship between E₀ and B₀",
  "Diffraction",
  "Newton's rings",
  "Ruby laser"
];
const sem1Distractors = ["Photoelectric effect", "Ohm's law"];

const sem3Items = [
  "Spooling",
  "Device driver",
  "Virtual memory",
  "Algorithm",
  "Time complexity",
  "Space complexity",
  "Data structure",
  "Abstract Data Type (ADT)",
  "Array"
];
const sem3Distractors = ["Deadlock", "Linked List"];

const sem5Items = [
  "HTTP",
  "GET",
  "SMTP",
  "Network Simulator (NS)",
  "Socket programming",
  "Packet tracer",
  "Client-server architecture",
  "FTP",
  "C or C++"
];
const sem5Distractors = ["POST", "ALOHA"];

const sem7Items = [
  "Supervised learning",
  "Activation function",
  "Sigmoid",
  "Backpropagation",
  "Convolutional Neural Network",
  "Recurrent Neural Network",
  "Long Short-Term Memory (LSTM)",
  "Generative Adversarial Network",
  "Reinforcement learning"
];
const sem7Distractors = ["Decision Tree", "K-Means"];

function createGrid(sem, title, rows, cols, items, distractors) {
  const bankItems = [];
  let itemIdx = 0;
  for (let r = 0; r < 3; r++) {
    for (let c = 0; c < 3; c++) {
      bankItems.push({
        name: items[itemIdx],
        validCategoryIds: [`r${r}`, `c${c}`]
      });
      itemIdx++;
    }
  }
  distractors.forEach(d => {
    bankItems.push({
      name: d,
      validCategoryIds: ["invalid_r", "invalid_c"]
    });
  });

  return {
    id: `CSE_BINGO_SEM${sem}`,
    branch: "CSE",
    title: title,
    questionText: "Match the concepts to their correct grid category combinations.",
    gridConfig: {
      rows: rows.map((label, i) => ({ id: `r${i}`, label })),
      cols: cols.map((label, i) => ({ id: `c${i}`, label })),
      bankItems: bankItems
    }
  };
}

const sem1Doc = createGrid(
  1, 
  "Bingo Bonanza - Applied Physics & Math",
  ["Waves & Comm", "Electromagnetism", "Optics"],
  ["Phenomenon", "Theory/Law", "Application/Property"],
  sem1Items,
  sem1Distractors
);

const sem3Doc = createGrid(
  3,
  "Bingo Bonanza - OS, Algos & DS",
  ["Operating Systems", "Algorithms", "Data Structures"],
  ["Concept A", "Concept B", "Concept C"],
  sem3Items,
  sem3Distractors
);

const sem5Doc = createGrid(
  5,
  "Bingo Bonanza - Networks & Protocols",
  ["Web Protocols", "Simulation/Tools", "Architecture/Lang"],
  ["Item 1", "Item 2", "Item 3"],
  sem5Items,
  sem5Distractors
);

const sem7Doc = createGrid(
  7,
  "Bingo Bonanza - Deep Learning",
  ["Learning Types", "Neural Basics", "Advanced Nets"],
  ["Core", "Mechanism", "Variant"],
  sem7Items,
  sem7Distractors
);

async function seedBingo() {
  const uri = 'mongodb+srv://parthcse_db_user:e5T9QIbSX4JVDnpC@cluster0.jo12y4w.mongodb.net/?retryWrites=true&w=majority';
  const client = new MongoClient(uri);
  
  try {
    await client.connect();
    const db = client.db('miet_games');
    
    for (const sem of [1, 3, 5, 7]) {
      const collName = `algo_bingo_cs_sem${sem}`;
      await db.collection(collName).deleteMany({});
      
      let doc;
      if (sem === 1) doc = sem1Doc;
      if (sem === 3) doc = sem3Doc;
      if (sem === 5) doc = sem5Doc;
      if (sem === 7) doc = sem7Doc;

      await db.collection(collName).insertOne(doc);
      console.log(`Seeded Bingo for Sem ${sem}`);
    }
  } catch (error) {
    console.error("Error:", error);
  } finally {
    await client.close();
  }
}

seedBingo();
