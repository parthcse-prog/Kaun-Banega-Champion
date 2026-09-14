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
    id: 'CSE_001', stream: 'CSE', subject: 'General CS', topic: 'Mixed', difficulty: 1,
    question: "What is the visual representation of an algorithm using symbols and arrows called?",
    answer: "Flowchart",
    explanation: "You successfully identified Flowchart!"
  },
  {
    id: 'CSE_002', stream: 'CSE', subject: 'General CS', topic: 'Mixed', difficulty: 1,
    question: "What computational thinking technique divides a complex problem into smaller parts?",
    answer: "Decomposition",
    explanation: "You successfully identified Decomposition!"
  },
  {
    id: 'CSE_003', stream: 'CSE', subject: 'General CS', topic: 'Mixed', difficulty: 1,
    question: "What technique focuses on identifying similarities between problems or situations?",
    answer: "Pattern",
    explanation: "You successfully identified Pattern!"
  },
  {
    id: 'CSE_004', stream: 'CSE', subject: 'General CS', topic: 'Mixed', difficulty: 1,
    question: "What is the process of simplifying a complex problem by focusing only on important details?",
    answer: "Abstraction",
    explanation: "You successfully identified Abstraction!"
  },
  {
    id: 'CSE_005', stream: 'CSE', subject: 'General CS', topic: 'Mixed', difficulty: 1,
    question: "What Python feature determines the structure of code through whitespace?",
    answer: "Indentation",
    explanation: "You successfully identified Indentation!"
  },
  {
    id: 'CSE_006', stream: 'CSE', subject: 'General CS', topic: 'Mixed', difficulty: 1,
    question: "Which Python data type represents True or False values?",
    answer: "Boolean",
    explanation: "You successfully identified Boolean!"
  },
  {
    id: 'CSE_007', stream: 'CSE', subject: 'General CS', topic: 'Mixed', difficulty: 1,
    question: "Which Python statement immediately exits a loop?",
    answer: "Break",
    explanation: "You successfully identified Break!"
  },
  {
    id: 'CSE_008', stream: 'CSE', subject: 'General CS', topic: 'Mixed', difficulty: 1,
    question: "Which Python statement skips the current loop iteration?",
    answer: "Continue",
    explanation: "You successfully identified Continue!"
  },
  {
    id: 'CSE_009', stream: 'CSE', subject: 'General CS', topic: 'Mixed', difficulty: 1,
    question: "What term describes the region of a program where a variable can be accessed?",
    answer: "Scope",
    explanation: "You successfully identified Scope!"
  },
  {
    id: 'CSE_010', stream: 'CSE', subject: 'General CS', topic: 'Mixed', difficulty: 1,
    question: "What special string in a Python function can describe what the function does?",
    answer: "Docstring",
    explanation: "You successfully identified Docstring!"
  },
  {
    id: 'CSE_011', stream: 'CSE', subject: 'General CS', topic: 'Mixed', difficulty: 1,
    question: "Which file format is commonly used to store tabular data separated by commas?",
    answer: "CSV",
    explanation: "You successfully identified CSV!"
  },
  {
    id: 'CSE_012', stream: 'CSE', subject: 'General CS', topic: 'Mixed', difficulty: 1,
    question: "Which mathematical operator represents the rate of change of a function?",
    answer: "Derivative",
    explanation: "You successfully identified Derivative!"
  },
  {
    id: 'CSE_013', stream: 'CSE', subject: 'General CS', topic: 'Mixed', difficulty: 1,
    question: "Which vector operator measures how much a vector field spreads outward?",
    answer: "Divergence",
    explanation: "You successfully identified Divergence!"
  },
  {
    id: 'CSE_014', stream: 'CSE', subject: 'General CS', topic: 'Mixed', difficulty: 1,
    question: "Which vector operator describes the rotation of a vector field?",
    answer: "Curl",
    explanation: "You successfully identified Curl!"
  },
  {
    id: 'CSE_015', stream: 'CSE', subject: 'General CS', topic: 'Mixed', difficulty: 1,
    question: "Which phenomenon causes a change in observed frequency due to relative motion?",
    answer: "Doppler",
    explanation: "You successfully identified Doppler!"
  },
  {
    id: 'CSE_016', stream: 'CSE', subject: 'General CS', topic: 'Mixed', difficulty: 1,
    question: "Which scientist's equations describe the fundamental behavior of electromagnetic fields?",
    answer: "Maxwell",
    explanation: "You successfully identified Maxwell!"
  },
  {
    id: 'CSE_017', stream: 'CSE', subject: 'General CS', topic: 'Mixed', difficulty: 1,
    question: "What property of light describes the orientation of its electric field oscillations?",
    answer: "Polarization",
    explanation: "You successfully identified Polarization!"
  },
  {
    id: 'CSE_018', stream: 'CSE', subject: 'General CS', topic: 'Mixed', difficulty: 1,
    question: "Which type of laser is specifically included in the Semester-I Engineering Physics syllabus?",
    answer: "Ruby",
    explanation: "You successfully identified Ruby!"
  },
  {
    id: 'CSE_019', stream: 'CSE', subject: 'General CS', topic: 'Mixed', difficulty: 1,
    question: "What type of semiconductor contains no intentionally added impurities?",
    answer: "Intrinsic",
    explanation: "You successfully identified Intrinsic!"
  },
  {
    id: 'CSE_020', stream: 'CSE', subject: 'General CS', topic: 'Mixed', difficulty: 1,
    question: "What process involves generating many possible ideas before selecting the best one?",
    answer: "Ideation",
    explanation: "You successfully identified Ideation!"
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
