// MOCK PROFILES
export const MOCK_PROFILES = [
  { studentId: '1001', name: 'Parth', stream: 'CSE', course: 'B.Tech', semester: 4, scheme: '2024' },
  { studentId: '1002', name: 'Priya', stream: 'LAW', course: 'LLB', semester: 3, scheme: '2024' },
  { studentId: '1003', name: 'Rahul', stream: 'BCOM', course: 'B.Com', semester: 2, scheme: '2024' },
  { studentId: '1004', name: 'Aditi', stream: 'ENG', course: 'B.E', semester: 5, scheme: '2024' }
];

// DATA-DRIVEN QUESTION BANK
export const QUESTION_BANK = [
  // CSE QUESTIONS
  {
    id: 'CSE_001', stream: 'CSE', subject: 'Object Oriented Programming', topic: 'OOP Concepts', difficulty: 2,
    question: "What OOP concept allows one interface to represent different underlying forms?",
    answer: "POLYMORPHISM",
    explanation: "Polymorphism allows the same interface to behave differently depending on the underlying object type."
  },
  {
    id: 'CSE_002', stream: 'CSE', subject: 'Data Structures', topic: 'Trees', difficulty: 1,
    question: "What is the top node of a tree data structure called?",
    answer: "ROOT",
    explanation: "The root is the topmost node in a tree, from which all other nodes descend."
  },
  {
    id: 'CSE_003', stream: 'CSE', subject: 'Algorithms', topic: 'Recursion', difficulty: 2,
    question: "What programming technique involves a function calling itself?",
    answer: "RECURSION",
    explanation: "Recursion breaks a problem down into smaller, identical sub-problems by having a function call itself."
  },
  {
    id: 'CSE_004', stream: 'CSE', subject: 'Databases', topic: 'SQL', difficulty: 1,
    question: "What SQL command is used to extract data from a database?",
    answer: "SELECT",
    explanation: "The SELECT statement is used to query and retrieve data from database tables."
  },

  // LAW QUESTIONS
  {
    id: 'LAW_001', stream: 'LAW', subject: 'Contract Law', topic: 'Basics', difficulty: 1,
    question: "What is the legal term for a legally enforceable agreement between two or more parties?",
    answer: "CONTRACT",
    explanation: "A contract creates mutual obligations enforceable by law."
  },
  {
    id: 'LAW_002', stream: 'LAW', subject: 'Civil Law', topic: 'Wrongs', difficulty: 2,
    question: "What is a civil wrong that causes a claimant to suffer loss or harm?",
    answer: "TORT",
    explanation: "Tort law deals with civil wrongs resulting in liability, such as negligence or defamation."
  },
  {
    id: 'LAW_003', stream: 'LAW', subject: 'Criminal Law', topic: 'Intent', difficulty: 3,
    question: "What Latin term refers to the mental element of a person's intention to commit a crime?",
    answer: "MENS REA",
    explanation: "Mens rea translates to 'guilty mind' and is a necessary element of many crimes."
  },

  // BCOM QUESTIONS
  {
    id: 'BCOM_001', stream: 'BCOM', subject: 'Accounting', topic: 'Financial Statements', difficulty: 2,
    question: "What financial statement shows a company's assets, liabilities and equity at a specific point in time?",
    answer: "BALANCE SHEET",
    explanation: "The balance sheet provides a snapshot of what a company owns and owes."
  },
  {
    id: 'BCOM_002', stream: 'BCOM', subject: 'Finance', topic: 'Assets', difficulty: 2,
    question: "What term describes the ease with which an asset can be converted into ready cash?",
    answer: "LIQUIDITY",
    explanation: "High liquidity means an asset can quickly be bought or sold without affecting its price."
  },
  {
    id: 'BCOM_003', stream: 'BCOM', subject: 'Economics', topic: 'Market Forces', difficulty: 1,
    question: "What economic concept pairs with demand to determine the price of goods?",
    answer: "SUPPLY",
    explanation: "Supply represents how much the market can offer, while demand represents how much buyers want."
  },

  // ENG QUESTIONS
  {
    id: 'ENG_001', stream: 'ENG', subject: 'Materials Science', topic: 'Properties', difficulty: 2,
    question: "What property describes a material's resistance to deformation under stress?",
    answer: "STIFFNESS",
    explanation: "Stiffness is the extent to which an object resists deformation in response to an applied force."
  },
  {
    id: 'ENG_002', stream: 'ENG', subject: 'Physics', topic: 'Forces', difficulty: 1,
    question: "What is the turning effect of a force called?",
    answer: "TORQUE",
    explanation: "Torque is a measure of the force that can cause an object to rotate about an axis."
  },
  {
    id: 'ENG_003', stream: 'ENG', subject: 'Thermodynamics', topic: 'Energy', difficulty: 3,
    question: "What is the measure of a system's thermal energy per unit temperature that is unavailable for doing useful work?",
    answer: "ENTROPY",
    explanation: "Entropy is often interpreted as the degree of disorder or randomness in the system."
  }
];
