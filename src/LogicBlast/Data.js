// Polyomino Shapes for Block Blast
export const SHAPES = [
  { id: 'dot', matrix: [[1]], color: 'bg-cyan-500' },
  { id: 'line2_h', matrix: [[1, 1]], color: 'bg-blue-500' },
  { id: 'line2_v', matrix: [[1], [1]], color: 'bg-blue-500' },
  { id: 'line3_h', matrix: [[1, 1, 1]], color: 'bg-emerald-500' },
  { id: 'line3_v', matrix: [[1], [1], [1]], color: 'bg-emerald-500' },
  { id: 'line4_h', matrix: [[1, 1, 1, 1]], color: 'bg-indigo-500' },
  { id: 'line4_v', matrix: [[1], [1], [1], [1]], color: 'bg-indigo-500' },
  { id: 'square', matrix: [[1, 1], [1, 1]], color: 'bg-purple-500' },
  { id: 'L_1', matrix: [[1, 0], [1, 1]], color: 'bg-orange-500' },
  { id: 'L_2', matrix: [[0, 1], [1, 1]], color: 'bg-orange-500' },
  { id: 'L_3', matrix: [[1, 1], [1, 0]], color: 'bg-orange-500' },
  { id: 'L_4', matrix: [[1, 1], [0, 1]], color: 'bg-orange-500' },
  { id: 'T_1', matrix: [[1, 1, 1], [0, 1, 0]], color: 'bg-pink-500' },
  { id: 'T_2', matrix: [[0, 1, 0], [1, 1, 1]], color: 'bg-pink-500' },
  { id: 'T_3', matrix: [[1, 0], [1, 1], [1, 0]], color: 'bg-pink-500' },
  { id: 'T_4', matrix: [[0, 1], [1, 1], [0, 1]], color: 'bg-pink-500' },
  { id: 'big_square', matrix: [[1, 1, 1], [1, 1, 1], [1, 1, 1]], color: 'bg-rose-500' }
];

export const conditionLesson = {
  lessonId: 'condition-01',
  subject: 'COM-101',
  topic: 'Control Structures',
  concept: 'IF / ELSE Conditions',
  stages: [
    {
      id: 'observe',
      title: 'Stage 1: Observe',
      type: 'OBSERVE',
      ruleLabel: 'IF marks >= 40',
      ruleFunction: (val) => val >= 40,
      objectiveText: 'Clear lines containing marks. Watch how the rule evaluates them to PASS or FAIL.',
      valuesToSpawn: [72, 35, 81, 44, 28, 65, 90, 12, 40, 39],
      targetClears: 2 // Clear 2 lines containing values to advance
    },
    {
      id: 'experiment',
      title: 'Stage 2: Experiment',
      type: 'EXPERIMENT',
      ruleLabel: 'IF marks >= 40',
      ruleFunction: (val) => val >= 40,
      objectiveText: 'Keep playing. Experiment with clearing different values. Observe the consequences.',
      valuesToSpawn: [55, 32, 78, 21, 46, 88, 15, 41, 38, 60],
      targetClears: 2
    },
    {
      id: 'predict',
      title: 'Stage 3: Predict',
      type: 'PREDICT',
      ruleLabel: 'IF marks >= 40',
      ruleFunction: (val) => val >= 40,
      objectiveText: 'Before the line clears, predict whether the highlighted mark will PASS or FAIL.',
      valuesToSpawn: [42, 18, 95, 30, 50, 25, 40, 39, 80],
      targetClears: 2
    },
    {
      id: 'control',
      title: 'Stage 4: Control',
      type: 'CONTROL',
      ruleLabel: 'IF marks >= 40',
      ruleFunction: (val) => val >= 40,
      objectiveText: 'Strategic placement! Clear a single line that produces at least 3 PASS results.',
      valuesToSpawn: [80, 85, 90, 20, 15, 10, 45, 50, 55],
      targetPasses: 3,
      targetClears: 1
    },
    {
      id: 'mastery',
      title: 'Stage 5: Rule Change!',
      type: 'OBSERVE',
      ruleLabel: 'IF marks >= 60',
      ruleFunction: (val) => val >= 60,
      objectiveText: 'The rule changed to >= 60. See how the same values now have different results.',
      valuesToSpawn: [55, 65, 45, 75, 59, 60, 40, 80],
      targetClears: 2
    }
  ]
};
