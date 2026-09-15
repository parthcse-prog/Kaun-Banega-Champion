import { MongoClient } from 'mongodb';

const uri = "mongodb+srv://parthcse_db_user:e5T9QIbSX4JVDnpC@cluster0.jo12y4w.mongodb.net/?retryWrites=true&w=majority";
const DB_NAME = "miet_games";

const wcQuestions = [
  {
    id: 'CSE_021', stream: 'CSE', subject: 'Python', topic: 'Operators', difficulty: 1,
    question: "Which logical operator returns True when at least one condition is True?",
    answer: "OR",
    explanation: "You successfully identified OR!"
  },
  {
    id: 'CSE_022', stream: 'CSE', subject: 'Python', topic: 'Operators', difficulty: 1,
    question: "Which logical operator reverses a Boolean value?",
    answer: "NOT",
    explanation: "You successfully identified NOT!"
  },
  {
    id: 'CSE_023', stream: 'CSE', subject: 'Python', topic: 'Loops', difficulty: 1,
    question: "Which loop is generally convenient when the number of iterations is based on a sequence or range?",
    answer: "FOR",
    explanation: "You successfully identified FOR loop!"
  },
  {
    id: 'CSE_024', stream: 'CSE', subject: 'Python', topic: 'Loops', difficulty: 1,
    question: "Which loop continues as long as its condition remains True?",
    answer: "WHILE",
    explanation: "You successfully identified WHILE loop!"
  },
  {
    id: 'CSE_025', stream: 'CSE', subject: 'Python', topic: 'Loops', difficulty: 1,
    question: "Which statement immediately terminates the nearest loop?",
    answer: "BREAK",
    explanation: "You successfully identified BREAK!"
  },
  {
    id: 'CSE_026', stream: 'CSE', subject: 'Python', topic: 'Loops', difficulty: 1,
    question: "Which statement skips the remaining statements in the current loop iteration?",
    answer: "CONTINUE",
    explanation: "You successfully identified CONTINUE!"
  },
  {
    id: 'CSE_027', stream: 'CSE', subject: 'Python', topic: 'Loops', difficulty: 1,
    question: "Which Python statement does nothing and is often used as a placeholder?",
    answer: "PASS",
    explanation: "You successfully identified PASS!"
  },
  {
    id: 'CSE_028', stream: 'CSE', subject: 'Python', topic: 'Loops', difficulty: 2,
    question: "What is a loop inside another loop called?",
    answer: "NESTED",
    explanation: "You successfully identified NESTED loop!"
  },
  {
    id: 'CSE_029', stream: 'CSE', subject: 'Python', topic: 'Techniques', difficulty: 2,
    question: "Which programming technique is useful for repeatedly adding values to calculate a total?",
    answer: "ACCUMULATION",
    explanation: "You successfully identified ACCUMULATION!"
  },
  {
    id: 'CSE_030', stream: 'CSE', subject: 'Python', topic: 'Techniques', difficulty: 1,
    question: "Which programming technique counts how many times a condition or event occurs?",
    answer: "COUNTING",
    explanation: "You successfully identified COUNTING!"
  },
  {
    id: 'CSE_031', stream: 'CSE', subject: 'Python', topic: 'Functions', difficulty: 1,
    question: "Which keyword is used to define a function in Python?",
    answer: "DEF",
    explanation: "You successfully identified DEF!"
  },
  {
    id: 'CSE_032', stream: 'CSE', subject: 'Python', topic: 'Functions', difficulty: 2,
    question: "What is the main advantage of dividing a program into functions?",
    answer: "MODULARITY",
    explanation: "You successfully identified MODULARITY!"
  },
  {
    id: 'CSE_033', stream: 'CSE', subject: 'Python', topic: 'Functions', difficulty: 1,
    question: "What does a return statement do inside a Python function?",
    answer: "RETURN",
    explanation: "You successfully identified RETURN!"
  },
  {
    id: 'CSE_034', stream: 'CSE', subject: 'Python', topic: 'Functions', difficulty: 2,
    question: "What is a value received by a function called?",
    answer: "PARAMETER",
    explanation: "You successfully identified PARAMETER!"
  },
  {
    id: 'CSE_035', stream: 'CSE', subject: 'Python', topic: 'Functions', difficulty: 2,
    question: "Which arguments are supplied using the parameter name when calling a Python function?",
    answer: "KEYWORD",
    explanation: "You successfully identified KEYWORD arguments!"
  },
  {
    id: 'CSE_036', stream: 'CSE', subject: 'Python', topic: 'Functions', difficulty: 2,
    question: "What argument provides a value when an argument is omitted in a function call?",
    answer: "DEFAULT",
    explanation: "You successfully identified DEFAULT argument!"
  },
  {
    id: 'CSE_037', stream: 'CSE', subject: 'Python', topic: 'Functions', difficulty: 2,
    question: "What is a function calling itself known as?",
    answer: "RECURSION",
    explanation: "You successfully identified RECURSION!"
  },
  {
    id: 'CSE_038', stream: 'CSE', subject: 'Python', topic: 'Functions', difficulty: 2,
    question: "What is essential to prevent a recursive function from calling itself forever?",
    answer: "BASE",
    explanation: "You successfully identified BASE case!"
  },
  {
    id: 'CSE_039', stream: 'CSE', subject: 'Python', topic: 'Techniques', difficulty: 2,
    question: "Which approach is often simpler when a problem can naturally be solved through repeated iteration?",
    answer: "ITERATION",
    explanation: "You successfully identified ITERATION!"
  },
  {
    id: 'CSE_040', stream: 'CSE', subject: 'Python', topic: 'Data Structures', difficulty: 1,
    question: "Which Python collection preserves elements in an ordered, mutable sequence?",
    answer: "LIST",
    explanation: "You successfully identified LIST!"
  }
];

async function seed() {
  const client = new MongoClient(uri);
  try {
    await client.connect();
    console.log("Connected to MongoDB.");
    const db = client.db(DB_NAME);
    const collection = db.collection('word_connect_cs');
    
    // Append these questions instead of deleting everything, or just clear and insert all?
    // Wait, let's keep existing and add these, but to be safe let's insert them.
    // I'll delete these specific IDs first if they exist to avoid duplicates
    for (const q of wcQuestions) {
      await collection.deleteOne({ id: q.id });
    }
    
    await collection.insertMany(wcQuestions);
    console.log("Successfully seeded new Word Connect questions.");
  } catch(e) {
    console.error(e);
  } finally {
    await client.close();
  }
}

seed();
