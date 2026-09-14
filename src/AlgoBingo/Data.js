export const ALGO_BINGO_DATA = {
  _id: "cs-algo-bingo",
  branch: "cs",
  title: "Bingo Bonanza",
  categories: [
    { id: 0, label: "O(n²) worst case" },
    { id: 1, label: "O(n log n) average" },
    { id: 2, label: "O(n) linear time" },
    { id: 3, label: "In-place (O(1) extra space)" },
    { id: 4, label: "Needs O(n) extra space" },
    { id: 5, label: "Stable" },
    { id: 6, label: "Not stable" },
    { id: 7, label: "Divide & conquer" },
    { id: 8, label: "Comparison-based" },
    { id: 9, label: "Non-comparison based" },
    { id: 10, label: "Adaptive (fast on nearly-sorted)" },
    { id: 11, label: "Uses recursion" },
    { id: 12, label: "Good for small arrays" },
    { id: 13, label: "Used in real-world standard libraries" },
    { id: 14, label: "Naturally parallelizable" },
    { id: 15, label: "Online (processes input as it arrives)" }
  ],
  items: [
    { name: "Bubble Sort",    validCategoryIds: [0,3,5,8,10,12] },
    { name: "Insertion Sort", validCategoryIds: [0,3,5,8,10,12,15] },
    { name: "Selection Sort", validCategoryIds: [0,3,6,8,12] },
    { name: "Merge Sort",     validCategoryIds: [1,4,5,7,8,11,13,14] },
    { name: "Quick Sort",     validCategoryIds: [0,1,3,6,7,8,11,13,14] },
    { name: "Heap Sort",      validCategoryIds: [1,3,6,8] },
    { name: "Counting Sort",  validCategoryIds: [2,4,5,9] },
    { name: "Radix Sort",     validCategoryIds: [2,4,5,9] },
    { name: "Bucket Sort",    validCategoryIds: [2,4,9] },
    { name: "Shell Sort",         validCategoryIds: [3,6,8] },
    { name: "Timsort",            validCategoryIds: [1,5,10,13] },
    { name: "Strand Sort",        validCategoryIds: [0,4,5,8,12] },
    { name: "American Flag Sort", validCategoryIds: [2,3,6,9,15] },
    { name: "Pigeonhole Sort",    validCategoryIds: [2,4,5,9,12] },
    { name: "Tree Sort",          validCategoryIds: [1,4,5,8] }
  ]
};

export const FALLBACK_BINGO_QUESTIONS = [
  {
    "id": "CSE_BINGO_1",
    "branch": "CSE",
    "title": "Bingo Bonanza - 1",
    "questionText": "Match the Engineering Mathematics-I concepts to the correct combination of topic categories.",
    "gridConfig": {
      "rows": [
        {
          "id": "r0",
          "label": "Differential Calculus"
        },
        {
          "id": "r1",
          "label": "Multivariable Calculus"
        },
        {
          "id": "r2",
          "label": "Integral Calculus"
        }
      ],
      "cols": [
        {
          "id": "c3",
          "label": "Core Concept"
        },
        {
          "id": "c4",
          "label": "Application"
        },
        {
          "id": "c5",
          "label": "Mathematical Tool"
        }
      ],
      "bankItems": [
        {
          "name": "Continuity",
          "validCategoryIds": [
            "r0",
            "c3"
          ]
        },
        {
          "name": "Maxima",
          "validCategoryIds": [
            "r0",
            "c4"
          ]
        },
        {
          "name": "Taylor",
          "validCategoryIds": [
            "r0",
            "c5"
          ]
        },
        {
          "name": "PartialDerivative",
          "validCategoryIds": [
            "r1",
            "c3"
          ]
        },
        {
          "name": "Optimization",
          "validCategoryIds": [
            "r1",
            "c4"
          ]
        },
        {
          "name": "Gradient",
          "validCategoryIds": [
            "r1",
            "c5"
          ]
        },
        {
          "name": "DefiniteIntegral",
          "validCategoryIds": [
            "r2",
            "c3"
          ]
        },
        {
          "name": "Area",
          "validCategoryIds": [
            "r2",
            "c4"
          ]
        },
        {
          "name": "Gamma",
          "validCategoryIds": [
            "r2",
            "c5"
          ]
        },
        {
          "name": "Recursion",
          "validCategoryIds": [
            "invalid_r",
            "invalid_c"
          ]
        },
        {
          "name": "Diffraction",
          "validCategoryIds": [
            "invalid_r",
            "invalid_c"
          ]
        }
      ]
    }
  },
  {
    "id": "CSE_BINGO_2",
    "branch": "CSE",
    "title": "Bingo Bonanza - 2",
    "questionText": "Match the Engineering Physics concepts to the correct combination of topic categories.",
    "gridConfig": {
      "rows": [
        {
          "id": "r0",
          "label": "Mechanics"
        },
        {
          "id": "r1",
          "label": "Waves"
        },
        {
          "id": "r2",
          "label": "Quantum Physics"
        }
      ],
      "cols": [
        {
          "id": "c3",
          "label": "Core Concept"
        },
        {
          "id": "c4",
          "label": "Phenomenon"
        },
        {
          "id": "c5",
          "label": "Application"
        }
      ],
      "bankItems": [
        {
          "name": "Newton",
          "validCategoryIds": [
            "r0",
            "c3"
          ]
        },
        {
          "name": "Kinematics",
          "validCategoryIds": [
            "r0",
            "c4"
          ]
        },
        {
          "name": "Energy",
          "validCategoryIds": [
            "r0",
            "c5"
          ]
        },
        {
          "name": "Oscillation",
          "validCategoryIds": [
            "r1",
            "c3"
          ]
        },
        {
          "name": "Doppler",
          "validCategoryIds": [
            "r1",
            "c4"
          ]
        },
        {
          "name": "Resonance",
          "validCategoryIds": [
            "r1",
            "c5"
          ]
        },
        {
          "name": "Wavefunction",
          "validCategoryIds": [
            "r2",
            "c3"
          ]
        },
        {
          "name": "Uncertainty",
          "validCategoryIds": [
            "r2",
            "c4"
          ]
        },
        {
          "name": "Schrodinger",
          "validCategoryIds": [
            "r2",
            "c5"
          ]
        },
        {
          "name": "Recursion",
          "validCategoryIds": [
            "invalid_r",
            "invalid_c"
          ]
        },
        {
          "name": "Abstraction",
          "validCategoryIds": [
            "invalid_r",
            "invalid_c"
          ]
        }
      ]
    }
  },
  {
    "id": "CSE_BINGO_3",
    "branch": "CSE",
    "title": "Bingo Bonanza - 3",
    "questionText": "Match the Problem Solving and Python concepts to the correct combination of topic categories.",
    "gridConfig": {
      "rows": [
        {
          "id": "r0",
          "label": "Algorithms"
        },
        {
          "id": "r1",
          "label": "Control Structures"
        },
        {
          "id": "r2",
          "label": "Functions"
        }
      ],
      "cols": [
        {
          "id": "c3",
          "label": "Design"
        },
        {
          "id": "c4",
          "label": "Execution"
        },
        {
          "id": "c5",
          "label": "Problem Solving"
        }
      ],
      "bankItems": [
        {
          "name": "Pseudocode",
          "validCategoryIds": [
            "r0",
            "c3"
          ]
        },
        {
          "name": "Flowchart",
          "validCategoryIds": [
            "r0",
            "c4"
          ]
        },
        {
          "name": "TraceTable",
          "validCategoryIds": [
            "r0",
            "c5"
          ]
        },
        {
          "name": "IfElse",
          "validCategoryIds": [
            "r1",
            "c3"
          ]
        },
        {
          "name": "ForLoop",
          "validCategoryIds": [
            "r1",
            "c4"
          ]
        },
        {
          "name": "WhileLoop",
          "validCategoryIds": [
            "r1",
            "c5"
          ]
        },
        {
          "name": "Parameters",
          "validCategoryIds": [
            "r2",
            "c3"
          ]
        },
        {
          "name": "Return",
          "validCategoryIds": [
            "r2",
            "c4"
          ]
        },
        {
          "name": "Recursion",
          "validCategoryIds": [
            "r2",
            "c5"
          ]
        },
        {
          "name": "Polarization",
          "validCategoryIds": [
            "invalid_r",
            "invalid_c"
          ]
        },
        {
          "name": "Gradient",
          "validCategoryIds": [
            "invalid_r",
            "invalid_c"
          ]
        }
      ]
    }
  },
  {
    "id": "CSE_BINGO_4",
    "branch": "CSE",
    "title": "Bingo Bonanza - 4",
    "questionText": "Match the Design Thinking concepts to the correct combination of stages and activities.",
    "gridConfig": {
      "rows": [
        {
          "id": "r0",
          "label": "Empathize"
        },
        {
          "id": "r1",
          "label": "Ideate"
        },
        {
          "id": "r2",
          "label": "Prototype"
        }
      ],
      "cols": [
        {
          "id": "c3",
          "label": "Understand"
        },
        {
          "id": "c4",
          "label": "Generate"
        },
        {
          "id": "c5",
          "label": "Validate"
        }
      ],
      "bankItems": [
        {
          "name": "Persona",
          "validCategoryIds": [
            "r0",
            "c3"
          ]
        },
        {
          "name": "Interview",
          "validCategoryIds": [
            "r0",
            "c4"
          ]
        },
        {
          "name": "PainPoint",
          "validCategoryIds": [
            "r0",
            "c5"
          ]
        },
        {
          "name": "Brainstorming",
          "validCategoryIds": [
            "r1",
            "c3"
          ]
        },
        {
          "name": "SCAMPER",
          "validCategoryIds": [
            "r1",
            "c4"
          ]
        },
        {
          "name": "MindMapping",
          "validCategoryIds": [
            "r1",
            "c5"
          ]
        },
        {
          "name": "Wireframe",
          "validCategoryIds": [
            "r2",
            "c3"
          ]
        },
        {
          "name": "Mockup",
          "validCategoryIds": [
            "r2",
            "c4"
          ]
        },
        {
          "name": "Usability",
          "validCategoryIds": [
            "r2",
            "c5"
          ]
        },
        {
          "name": "Derivative",
          "validCategoryIds": [
            "invalid_r",
            "invalid_c"
          ]
        },
        {
          "name": "Compiler",
          "validCategoryIds": [
            "invalid_r",
            "invalid_c"
          ]
        }
      ]
    }
  }
];
