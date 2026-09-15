import { MongoClient } from 'mongodb';

const uri = "mongodb+srv://parthcse_db_user:e5T9QIbSX4JVDnpC@cluster0.jo12y4w.mongodb.net/?retryWrites=true&w=majority";
const DB_NAME = "miet_games";

const cnQuestions = [
  {
    "id": "CSE_CN_47",
    "branch": "CSE",
    "subject": "Python",
    "topic": "Lists",
    "questionText": "What is the index of the first element in a Python list?",
    "correctConcepts": ["0"],
    "distractors": ["1", "-1", "None"],
    "explanations": {
      "1": "1 is the index of the second element.",
      "-1": "-1 is the index of the last element.",
      "None": "None is not an index."
    }
  },
  {
    "id": "CSE_CN_48",
    "branch": "CSE",
    "subject": "Python",
    "topic": "Lists",
    "questionText": "Which operation extracts a portion of a Python list?",
    "correctConcepts": ["Slicing"],
    "distractors": ["Casting", "Hashing", "Compiling"],
    "explanations": {
      "Casting": "Casting changes data types, not extracts portions.",
      "Hashing": "Hashing is for mapping data.",
      "Compiling": "Compiling translates code to machine language."
    }
  },
  {
    "id": "CSE_CN_49",
    "branch": "CSE",
    "subject": "Python",
    "topic": "Lists",
    "questionText": "Which list operation adds an element to the end of a list?",
    "correctConcepts": ["append()"],
    "distractors": ["insertEnd()", "pushEnd()", "addLast()"],
    "explanations": {
      "insertEnd()": "Not a valid Python list method.",
      "pushEnd()": "Not a valid Python list method.",
      "addLast()": "Not a valid Python list method."
    }
  },
  {
    "id": "CSE_CN_50",
    "branch": "CSE",
    "subject": "Python",
    "topic": "Lists",
    "questionText": "Which list operation removes and returns an element from a list?",
    "correctConcepts": ["pop()"],
    "distractors": ["delete()", "removeLast()", "extract()"],
    "explanations": {
      "delete()": "There is a del keyword, but no delete() method that returns.",
      "removeLast()": "Not a valid Python list method.",
      "extract()": "Not a valid Python list method."
    }
  },
  {
    "id": "CSE_CN_51",
    "branch": "CSE",
    "subject": "Python",
    "topic": "Data Structures",
    "questionText": "Which Python collection is immutable?",
    "correctConcepts": ["Tuple"],
    "distractors": ["List", "Dictionary", "Set"],
    "explanations": {
      "List": "Lists are mutable.",
      "Dictionary": "Dictionaries are mutable.",
      "Set": "Sets are mutable."
    }
  },
  {
    "id": "CSE_CN_52",
    "branch": "CSE",
    "subject": "Python",
    "topic": "Data Structures",
    "questionText": "Which Python collection automatically keeps only unique elements?",
    "correctConcepts": ["Set"],
    "distractors": ["List", "Tuple", "String"],
    "explanations": {
      "List": "Lists allow duplicates.",
      "Tuple": "Tuples allow duplicates.",
      "String": "Strings allow duplicate characters."
    }
  },
  {
    "id": "CSE_CN_53",
    "branch": "CSE",
    "subject": "Python",
    "topic": "Data Structures",
    "questionText": "Which Python structure is most appropriate for fast key-based lookup?",
    "correctConcepts": ["Dictionary"],
    "distractors": ["Tuple", "String", "Float"],
    "explanations": {
      "Tuple": "Tuples are indexed by integers.",
      "String": "Strings are sequences of characters.",
      "Float": "Float is a numeric type."
    }
  },
  {
    "id": "CSE_CN_54",
    "branch": "CSE",
    "subject": "Python",
    "topic": "Dictionaries",
    "questionText": "In a Python dictionary, what uniquely identifies a stored value?",
    "correctConcepts": ["Key"],
    "distractors": ["Index", "Loop", "Slice"],
    "explanations": {
      "Index": "Dictionaries use keys, not numerical indices.",
      "Loop": "Loops iterate over items.",
      "Slice": "Slicing is for sequences like lists or strings."
    }
  },
  {
    "id": "CSE_CN_55",
    "branch": "CSE",
    "subject": "Python",
    "topic": "Dictionaries",
    "questionText": "Which problem is naturally suited to a dictionary?",
    "correctConcepts": ["Frequency counting"],
    "distractors": ["Drawing a flowchart", "Calculating indentation", "Creating a loop"],
    "explanations": {
      "Drawing a flowchart": "Flowcharts are visual algorithm representations.",
      "Calculating indentation": "Indentation is syntax.",
      "Creating a loop": "Loops are control structures."
    }
  },
  {
    "id": "CSE_CN_56",
    "branch": "CSE",
    "subject": "Python",
    "topic": "Strings",
    "questionText": "Which technique is useful for counting the occurrences of each character in a string?",
    "correctConcepts": ["Frequency counting"],
    "distractors": ["Binary conversion", "Compilation", "Recursion only"],
    "explanations": {
      "Binary conversion": "Converts numbers to binary.",
      "Compilation": "Translates code to machine language.",
      "Recursion only": "Recursion isn't specifically for counting frequencies."
    }
  },
  {
    "id": "CSE_CN_57",
    "branch": "CSE",
    "subject": "Python",
    "topic": "Strings",
    "questionText": "Which string operation can be used to convert text to lowercase?",
    "correctConcepts": ["lower()"],
    "distractors": ["small()", "tolowercase()", "case()"],
    "explanations": {
      "small()": "Not a Python string method.",
      "tolowercase()": "Not a Python string method (like in Java/JS).",
      "case()": "Not a Python string method."
    }
  },
  {
    "id": "CSE_CN_58",
    "branch": "CSE",
    "subject": "Python",
    "topic": "Strings",
    "questionText": "Which concept is commonly used to determine whether a string reads the same forward and backward?",
    "correctConcepts": ["Palindrome"],
    "distractors": ["Iteration", "Casting", "Aggregation"],
    "explanations": {
      "Iteration": "Iteration is looping.",
      "Casting": "Casting converts data types.",
      "Aggregation": "Aggregation combines data."
    }
  },
  {
    "id": "CSE_CN_59",
    "branch": "CSE",
    "subject": "Python",
    "topic": "File I/O",
    "questionText": "Which file mode is used to read an existing text file?",
    "correctConcepts": ["r"],
    "distractors": ["w", "a", "x"],
    "explanations": {
      "w": "w is for writing.",
      "a": "a is for appending.",
      "x": "x is for exclusive creation."
    }
  },
  {
    "id": "CSE_CN_60",
    "branch": "CSE",
    "subject": "Python",
    "topic": "File I/O",
    "questionText": "Which file mode is used to write data to a file, potentially replacing existing content?",
    "correctConcepts": ["w"],
    "distractors": ["r", "a", "read"],
    "explanations": {
      "r": "r is for reading.",
      "a": "a is for appending.",
      "read": "Not a valid mode string."
    }
  }
];

async function seed() {
  const client = new MongoClient(uri);
  try {
    await client.connect();
    console.log("Connected to MongoDB.");
    const db = client.db(DB_NAME);
    const collection = db.collection('concept_ninja_cs');
    
    // Clear old questions
    await collection.deleteMany({});
    console.log("Cleared existing concept_ninja_cs collection.");
    
    // Insert new questions
    await collection.insertMany(cnQuestions);
    console.log("Successfully seeded new Concept Ninja questions.");
  } catch(e) {
    console.error(e);
  } finally {
    await client.close();
  }
}

seed();
