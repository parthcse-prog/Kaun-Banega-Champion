export const QUESTIONS = [
  {
    id: 'OOP_001',
    branch: 'CSE',
    subject: 'Object Oriented Programming',
    topic: 'OOP Concepts',
    questionText: 'Which of these are OOP concepts?',
    correctConcepts: ['ENCAPSULATION', 'INHERITANCE', 'POLYMORPHISM', 'ABSTRACTION'],
    distractors: ['COMPILER', 'ROUTER', 'DATABASE', 'KEYBOARD'],
    explanations: {
      'COMPILER': 'A compiler translates code into machine language. It is not an OOP concept.',
      'ROUTER': 'A router is a networking device that forwards data packets.',
      'DATABASE': 'A database stores data. It is not an OOP concept.',
      'KEYBOARD': 'A keyboard is a hardware input device.'
    }
  },
  {
    id: 'DS_001',
    branch: 'CSE',
    subject: 'Data Structures',
    topic: 'Linear Data Structures',
    questionText: 'Which of these are Data Structures?',
    correctConcepts: ['ARRAY', 'STACK', 'QUEUE', 'GRAPH', 'TREE', 'LINKED LIST'],
    distractors: ['VARIABLE', 'OPERATING SYSTEM', 'MONITOR', 'CPU'],
    explanations: {
      'VARIABLE': 'A variable stores a single value, not a complex data structure.',
      'OPERATING SYSTEM': 'An OS manages hardware and software resources.',
      'MONITOR': 'A monitor is an output display device.',
      'CPU': 'A CPU executes instructions. It is hardware.'
    }
  },
  {
    id: 'ARCH_001',
    branch: 'CSE',
    subject: 'Computer Architecture',
    topic: 'Memory',
    questionText: 'Which of these are primary memory types?',
    correctConcepts: ['RAM', 'ROM', 'CACHE MEMORY', 'REGISTERS'],
    distractors: ['HARD DISK', 'SSD', 'USB DRIVE', 'MAGNETIC TAPE'],
    explanations: {
      'HARD DISK': 'Hard disk is secondary, non-volatile storage.',
      'SSD': 'Solid State Drives are secondary storage.',
      'USB DRIVE': 'USB drives are portable secondary storage.',
      'MAGNETIC TAPE': 'Magnetic tape is used for secondary archival storage.'
    }
  }
];
