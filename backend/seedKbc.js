import { MongoClient } from 'mongodb';

const uri = "mongodb+srv://parthcse_db_user:e5T9QIbSX4JVDnpC@cluster0.jo12y4w.mongodb.net/?retryWrites=true&w=majority";
const DB_NAME = "miet_games";

const kbcQuestions = [
  {
    "id": 1,
    "question": "Which computational thinking technique breaks a complex problem into smaller, manageable parts?",
    "options": ["Abstraction", "Decomposition", "Compilation", "Iteration"],
    "answer": 1
  },
  {
    "id": 2,
    "question": "Which computational thinking technique focuses only on the important details of a problem?",
    "options": ["Abstraction", "Debugging", "Iteration", "Traversal"],
    "answer": 0
  },
  {
    "id": 3,
    "question": "Recognizing similarities between different problems is known as what?",
    "options": ["Pattern recognition", "Recursion", "Compilation", "Validation"],
    "answer": 0
  },
  {
    "id": 4,
    "question": "Which representation uses symbols and arrows to describe the steps of an algorithm?",
    "options": ["Flowchart", "Dictionary", "Traceback", "Docstring"],
    "answer": 0
  },
  {
    "id": 5,
    "question": "What is pseudocode primarily used for?",
    "options": ["Designing program logic before implementation", "Executing Python programs", "Managing computer memory", "Installing libraries"],
    "answer": 0
  },
  {
    "id": 6,
    "question": "What is the purpose of a dry run of an algorithm?",
    "options": ["To execute it faster", "To manually trace its behavior", "To compile it", "To remove all loops"],
    "answer": 1
  },
  {
    "id": 7,
    "question": "Which tool records the changing values of variables while manually tracing a program?",
    "options": ["Trace table", "Flowchart", "Compiler", "Debugger"],
    "answer": 0
  },
  {
    "id": 8,
    "question": "A program runs successfully but produces the wrong output. What type of error is this?",
    "options": ["Syntax error", "Runtime error", "Logical error", "Indentation error"],
    "answer": 2
  },
  {
    "id": 9,
    "question": "Which type of error occurs when Python cannot understand the structure of the code?",
    "options": ["Logical error", "Syntax error", "Runtime error", "Input error"],
    "answer": 1
  },
  {
    "id": 10,
    "question": "Which type of error occurs while a syntactically valid program is executing?",
    "options": ["Runtime error", "Syntax error", "Design error", "Formatting error"],
    "answer": 0
  },
  {
    "id": 11,
    "question": "Which stage of the program development process involves finding and correcting errors?",
    "options": ["Debugging", "Abstraction", "Compilation", "Decomposition"],
    "answer": 0
  },
  {
    "id": 12,
    "question": "Which practice improves the readability of a Python program?",
    "options": ["Meaningful variable names", "Using single-letter names everywhere", "Removing comments", "Writing everything on one line"],
    "answer": 0
  },
  {
    "id": 13,
    "question": "Which component of Python executes code interactively rather than requiring a complete program first?",
    "options": ["Interpreter", "Compiler", "Linker", "Loader"],
    "answer": 0
  },
  {
    "id": 14,
    "question": "Which of the following is a valid Python identifier?",
    "options": ["2value", "student_name", "class", "student-name"],
    "answer": 1
  },
  {
    "id": 15,
    "question": "Which Python keyword cannot normally be used as a variable name?",
    "options": ["value", "number", "class", "score"],
    "answer": 2
  },
  {
    "id": 16,
    "question": "What does indentation primarily determine in Python?",
    "options": ["The code block structure", "The variable type", "The memory address", "The file format"],
    "answer": 0
  },
  {
    "id": 17,
    "question": "Which Python type represents True or False?",
    "options": ["String", "Boolean", "Integer", "Float"],
    "answer": 1
  },
  {
    "id": 18,
    "question": "What is the result of converting the string \"25\" using int(\"25\")?",
    "options": ["25 as an integer", "\"25\" as a string", "25.0 as a float", "True"],
    "answer": 0
  },
  {
    "id": 19,
    "question": "Which Python function can be used to determine the type of a value?",
    "options": ["type()", "typeof()", "datatype()", "checktype()"],
    "answer": 0
  },
  {
    "id": 20,
    "question": "Which operator calculates the remainder after division in Python?",
    "options": ["/", "//", "%", "**"],
    "answer": 2
  }
];

const backupQuestions = [
  {
    "id": 21,
    "question": "Which Python operator performs floor division?",
    "options": ["/", "//", "%", "**"],
    "answer": 1
  },
  {
    "id": 22,
    "question": "Which operator is used for exponentiation in Python?",
    "options": ["^", "**", "^^", "//"],
    "answer": 1
  },
  {
    "id": 23,
    "question": "What is the main purpose of operator precedence?",
    "options": ["To determine the order in which expressions are evaluated", "To determine variable names", "To define functions", "To control file access"],
    "answer": 0
  },
  {
    "id": 24,
    "question": "Which statement is best suited for choosing between multiple conditions?",
    "options": ["elif", "import", "return", "with"],
    "answer": 0
  },
  {
    "id": 25,
    "question": "Which logical operator returns True only when both conditions are True?",
    "options": ["or", "not", "and", "xor"],
    "answer": 2
  }
];

async function seed() {
  const client = new MongoClient(uri);
  try {
    await client.connect();
    console.log("Connected to MongoDB.");
    const db = client.db(DB_NAME);
    const collection = db.collection('kbc_cs');
    
    await collection.deleteMany({});
    console.log("Cleared existing kbc_cs collection.");
    
    await collection.insertOne({
      questions: kbcQuestions,
      backupQuestions: backupQuestions
    });
    console.log("Successfully seeded KBC questions.");
  } catch(e) {
    console.error(e);
  } finally {
    await client.close();
  }
}

seed();
