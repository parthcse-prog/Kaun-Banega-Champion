export const questions = [
  // EASY (30s) - Index 0-4
  {
    question: "Which of the following is a fundamental data type in C?",
    options: ["String", "Array", "Float", "Class"],
    answer: 2
  },
  {
    question: "What does CPU stand for?",
    options: ["Central Process Unit", "Computer Personal Unit", "Central Processing Unit", "Central Processor Unit"],
    answer: 2
  },
  {
    question: "In Python, which keyword is used to define a function?",
    options: ["func", "define", "def", "function"],
    answer: 2
  },
  {
    question: "Which symbol is used for single-line comments in C++?",
    options: ["//", "/*", "#", "--"],
    answer: 0
  },
  {
    question: "What is the binary representation of the decimal number 5?",
    options: ["101", "110", "011", "100"],
    answer: 0
  },
  
  // MEDIUM (45s) - Index 5-9
  {
    question: "Which data structure operates on a Last In First Out (LIFO) principle?",
    options: ["Queue", "Tree", "Stack", "Linked List"],
    answer: 2
  },
  {
    question: "What is the time complexity of binary search on a sorted array?",
    options: ["O(n)", "O(log n)", "O(n^2)", "O(1)"],
    answer: 1
  },
  {
    question: "Which of the following is not an Object-Oriented Programming concept?",
    options: ["Inheritance", "Encapsulation", "Compilation", "Polymorphism"],
    answer: 2
  },
  {
    question: "What is a pointer in C/C++?",
    options: ["A keyword", "A variable that stores a memory address", "A function", "An array"],
    answer: 1
  },
  {
    question: "Which logic gate outputs 1 only if both inputs are 1?",
    options: ["OR", "XOR", "AND", "NAND"],
    answer: 2
  },

  // HARD (60s) - Index 10-14
  {
    question: "What is the worst-case time complexity of QuickSort?",
    options: ["O(n log n)", "O(n)", "O(n^2)", "O(log n)"],
    answer: 2
  },
  {
    question: "In a relational database, what is a primary key?",
    options: ["A unique identifier for a record", "A key used to encrypt data", "A foreign key", "A keyword"],
    answer: 0
  },
  {
    question: "What is the purpose of the 'virtual' keyword in C++?",
    options: ["To create a virtual machine", "To support dynamic polymorphism", "To hide variables", "To optimize memory"],
    answer: 1
  },
  {
    question: "Which algorithm is used to find the shortest path in a weighted graph?",
    options: ["DFS", "BFS", "Dijkstra's Algorithm", "Kruskal's Algorithm"],
    answer: 2
  },
  {
    question: "What is a 'Segmentation fault'?",
    options: ["A syntax error", "Accessing memory that the program doesn't own", "A logic error", "A compiler warning"],
    answer: 1
  },

  // EXPERT (No timer) - Index 15-19
  {
    question: "What is the Halting Problem in computer science?",
    options: ["A problem deciding if a program stops or runs forever", "A hardware failure", "A deadlock in OS", "A network timeout"],
    answer: 0
  },
  {
    question: "Which of these is a feature of a pure functional programming language?",
    options: ["Mutable state", "Side effects", "No side effects", "Object inheritance"],
    answer: 2
  },
  {
    question: "What does the CAP theorem state regarding distributed systems?",
    options: ["A system can only provide 2 of: Consistency, Availability, Partition tolerance", "Data must be encrypted", "Networks are always reliable", "Latency is zero"],
    answer: 0
  },
  {
    question: "What is the primary difference between a Mutex and a Semaphore?",
    options: ["Mutex is an integer, Semaphore is a float", "Mutex has ownership, Semaphore is a signaling mechanism", "There is no difference", "Semaphore is faster"],
    answer: 1
  },
  {
    question: "In lambda calculus, what does the Y combinator enable?",
    options: ["Variable assignment", "Recursion without names", "Object orientation", "Exception handling"],
    answer: 1
  }
];

export const backupQuestions = [
  { question: "What is the base of the hexadecimal number system?", options: ["8", "10", "16", "2"], answer: 2 },
  { question: "What is an algorithm?", options: ["A programming language", "A step-by-step procedure to solve a problem", "A hardware component", "An operating system"], answer: 1 },
  { question: "Which sorting algorithm is the most efficient on nearly sorted data?", options: ["Insertion Sort", "Selection Sort", "Merge Sort", "Heap Sort"], answer: 0 },
  { question: "What is a deadlock?", options: ["A circular wait condition where processes are blocked", "A fast process execution", "A memory leak", "A database backup"], answer: 0 }
];
