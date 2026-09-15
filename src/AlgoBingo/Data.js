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
    "id": "CSE_BINGO_NEW",
    "branch": "CSE",
    "title": "Bingo Bonanza - Python Lab & Exceptions",
    "questionText": "Match the Python File Handling, Libraries, and Lab Exercises to the correct combination of topic categories.",
    "gridConfig": {
      "rows": [
        { "id": "r0", "label": "File Handling & Exceptions" },
        { "id": "r1", "label": "Standard Libraries" },
        { "id": "r2", "label": "Lab Exercises" }
      ],
      "cols": [
        { "id": "c3", "label": "Data IO & Math" },
        { "id": "c4", "label": "Core Mechanisms" },
        { "id": "c5", "label": "Advanced & Assured" }
      ],
      "bankItems": [
        { "name": "a (Append)", "validCategoryIds": ["r0", "c3"] },
        { "name": "try-except", "validCategoryIds": ["r0", "c4"] },
        { "name": "finally", "validCategoryIds": ["r0", "c5"] },
        { "name": "csv", "validCategoryIds": ["r1", "c3"] },
        { "name": "random", "validCategoryIds": ["r1", "c4"] },
        { "name": "datetime", "validCategoryIds": ["r1", "c5"] },
        { "name": "Math Utilities", "validCategoryIds": ["r2", "c3"] },
        { "name": "Binary search", "validCategoryIds": ["r2", "c4"] },
        { "name": "Sum of digits", "validCategoryIds": ["r2", "c5"] },
        { "name": "Student gradebook", "validCategoryIds": ["invalid_r", "invalid_c"] },
        { "name": "Linear search", "validCategoryIds": ["invalid_r", "invalid_c"] }
      ]
    }
  },
  {
    "id": "CSE_BINGO_DT_1",
    "branch": "CSE",
    "title": "Design Thinking: Empathy & Definition",
    "questionText": "Match the Empathy and Definition stage concepts to the correct combination of topic categories.",
    "gridConfig": {
      "rows": [
        { "id": "r0", "label": "User Research" },
        { "id": "r1", "label": "Mapping & Tools" },
        { "id": "r2", "label": "Problem Framing" }
      ],
      "cols": [
        { "id": "c3", "label": "Data Gathering" },
        { "id": "c4", "label": "Synthesis" },
        { "id": "c5", "label": "Outcomes" }
      ],
      "bankItems": [
        { "name": "User Interview", "validCategoryIds": ["r0", "c3"] },
        { "name": "Persona", "validCategoryIds": ["r0", "c4"] },
        { "name": "Pain point", "validCategoryIds": ["r0", "c5"] },
        { "name": "Observation", "validCategoryIds": ["r1", "c3"] },
        { "name": "Empathy map", "validCategoryIds": ["r1", "c4"] },
        { "name": "Journey Map", "validCategoryIds": ["r1", "c5"] },
        { "name": "5 Whys", "validCategoryIds": ["r2", "c3"] },
        { "name": "Problem Statement", "validCategoryIds": ["r2", "c4"] },
        { "name": "How-Might-We", "validCategoryIds": ["r2", "c5"] },
        { "name": "Business Plan", "validCategoryIds": ["invalid_r", "invalid_c"] },
        { "name": "Algorithm", "validCategoryIds": ["invalid_r", "invalid_c"] }
      ]
    }
  },
  {
    "id": "CSE_BINGO_DT_2",
    "branch": "CSE",
    "title": "Design Thinking: Ideation Strategies",
    "questionText": "Match the Ideation stage concepts to their correct methodology types and team dynamics.",
    "gridConfig": {
      "rows": [
        { "id": "r0", "label": "Ideation Types" },
        { "id": "r1", "label": "Structured Methods" },
        { "id": "r2", "label": "Rapid Generation" }
      ],
      "cols": [
        { "id": "c3", "label": "Expansive" },
        { "id": "c4", "label": "Focused" },
        { "id": "c5", "label": "Collaborative" }
      ],
      "bankItems": [
        { "name": "Divergent thinking", "validCategoryIds": ["r0", "c3"] },
        { "name": "Convergent thinking", "validCategoryIds": ["r0", "c4"] },
        { "name": "Brainstorming", "validCategoryIds": ["r0", "c5"] },
        { "name": "SCAMPER", "validCategoryIds": ["r1", "c3"] },
        { "name": "Six Thinking Hats", "validCategoryIds": ["r1", "c4"] },
        { "name": "Mind Mapping", "validCategoryIds": ["r1", "c5"] },
        { "name": "Crazy-8s", "validCategoryIds": ["r2", "c3"] },
        { "name": "Prototyping", "validCategoryIds": ["r2", "c4"] },
        { "name": "6-3-5", "validCategoryIds": ["r2", "c5"] },
        { "name": "SQL Database", "validCategoryIds": ["invalid_r", "invalid_c"] },
        { "name": "Binary Search", "validCategoryIds": ["invalid_r", "invalid_c"] }
      ]
    }
  }
];
