import { QuestionEntity, QuestionCategoryEntity, QuestionTagEntity, QuestionPoolEntity } from '@/types/question';

export const MOCK_QUESTION_CATEGORIES: QuestionCategoryEntity[] = [
  { categoryId: 'cat_alg', institutionId: 'inst_default', name: 'Algorithms & Data Structures', description: 'Core CS algorithmic paradigms', createdAt: '2026-01-01T00:00:00Z' },
  { categoryId: 'cat_os', institutionId: 'inst_default', name: 'Operating Systems & Concurrency', description: 'Kernel, processes, and memory management', createdAt: '2026-01-01T00:00:00Z' },
  { categoryId: 'cat_ee', institutionId: 'inst_default', name: 'Electrical Engineering & Circuits', description: 'Circuits, signals, and systems', createdAt: '2026-01-01T00:00:00Z' }
];

export const MOCK_QUESTION_TAGS: QuestionTagEntity[] = [
  { tagId: 'tag_sorting', institutionId: 'inst_default', name: 'sorting', createdAt: '2026-01-01T00:00:00Z' },
  { tagId: 'tag_trees', institutionId: 'inst_default', name: 'trees', createdAt: '2026-01-01T00:00:00Z' },
  { tagId: 'tag_graphs', institutionId: 'inst_default', name: 'graphs', createdAt: '2026-01-01T00:00:00Z' },
  { tagId: 'tag_python', institutionId: 'inst_default', name: 'python', createdAt: '2026-01-01T00:00:00Z' },
  { tagId: 'tag_concurrency', institutionId: 'inst_default', name: 'concurrency', createdAt: '2026-01-01T00:00:00Z' }
];

export const MOCK_QUESTION_POOLS: QuestionPoolEntity[] = [
  {
    poolId: 'pool_midterm_a',
    bankId: 'bank_default',
    institutionId: 'inst_default',
    name: 'Midterm Random Pool A',
    targetQuestionCount: 10,
    strategy: 'RANDOM',
    isValidated: true,
    createdAt: '2026-07-01T00:00:00Z',
    updatedAt: '2026-07-26T12:00:00Z'
  },
  {
    poolId: 'pool_final_b',
    bankId: 'bank_default',
    institutionId: 'inst_default',
    name: 'Final Exam Hard Pool',
    targetQuestionCount: 15,
    strategy: 'WEIGHTED',
    isValidated: true,
    createdAt: '2026-07-01T00:00:00Z',
    updatedAt: '2026-07-26T12:00:00Z'
  }
];

export const MOCK_QUESTIONS: QuestionEntity[] = [
  {
    id: 'q_mock_1',
    questionId: 'q_mock_1',
    bankId: 'bank_default',
    institutionId: 'inst_default',
    type: 'MCQ_SINGLE',
    title: 'Time Complexity of QuickSort Worst Case',
    body: 'What is the worst-case time complexity of the standard randomized QuickSort algorithm when selecting unbalanced pivots?',
    status: 'APPROVED',
    difficulty: 'MEDIUM',
    marks: 4,
    negativeMarks: 1,
    estimatedTimeSeconds: 120,
    options: [
      { text: 'O(N log N)', isCorrect: false },
      { text: 'O(N^2)', isCorrect: true },
      { text: 'O(N)', isCorrect: false },
      { text: 'O(log N)', isCorrect: false }
    ],
    hints: ['Think of already sorted arrays with first element pivot selection.'],
    explanation: 'QuickSort degenerates to O(N^2) time when the pivot partition split is highly unbalanced (e.g. 0 and N-1).',
    tags: ['sorting', 'algorithms'],
    version: 1,
    createdAt: '2026-07-01T00:00:00Z',
    updatedAt: '2026-07-26T12:00:00Z'
  },
  {
    id: 'q_mock_2',
    questionId: 'q_mock_2',
    bankId: 'bank_default',
    institutionId: 'inst_default',
    type: 'CODE_SNIPPET',
    title: 'Binary Search Implementation',
    body: 'Write an efficient function `binary_search(arr, target)` that returns the 0-based index of target if present in sorted array `arr`, or -1 if not found.',
    status: 'APPROVED',
    difficulty: 'HARD',
    marks: 10,
    negativeMarks: 2,
    estimatedTimeSeconds: 300,
    codeLanguage: 'python',
    codeTemplate: 'def binary_search(arr, target):\n    left, right = 0, len(arr) - 1\n    while left <= right:\n        mid = (left + right) // 2\n        if arr[mid] == target:\n            return mid\n        elif arr[mid] < target:\n            left = mid + 1\n        else:\n            right = mid - 1\n    return -1',
    hints: ['Maintain left and right pointer bounds.'],
    explanation: 'Binary Search divides search space in half each step giving O(log N) time complexity.',
    tags: ['searching', 'python'],
    version: 1,
    createdAt: '2026-07-02T00:00:00Z',
    updatedAt: '2026-07-26T12:00:00Z'
  },
  {
    id: 'q_mock_3',
    questionId: 'q_mock_3',
    bankId: 'bank_default',
    institutionId: 'inst_default',
    type: 'TRUE_FALSE',
    title: 'AVL Tree Balance Property',
    body: 'True or False: An AVL tree guarantees a strict height balance factor of at most 1 between left and right subtrees of every node.',
    status: 'APPROVED',
    difficulty: 'EASY',
    marks: 2,
    negativeMarks: 0,
    estimatedTimeSeconds: 60,
    options: [
      { text: 'True', isCorrect: true },
      { text: 'False', isCorrect: false }
    ],
    hints: ['Check the definition of AVL balance factor.'],
    explanation: 'AVL trees strictly maintain |height(left) - height(right)| <= 1 via single and double rotations.',
    tags: ['trees'],
    version: 1,
    createdAt: '2026-07-03T00:00:00Z',
    updatedAt: '2026-07-26T12:00:00Z'
  },
  {
    id: 'q_mock_4',
    questionId: 'q_mock_4',
    bankId: 'bank_default',
    institutionId: 'inst_default',
    type: 'SHORT_ANSWER',
    title: 'Dijkstra Single Source Shortest Path Data Structure',
    body: 'What abstract data structure is required to achieve O((V + E) log V) time complexity in Dijkstra algorithm?',
    status: 'APPROVED',
    difficulty: 'MEDIUM',
    marks: 5,
    negativeMarks: 0,
    estimatedTimeSeconds: 90,
    hints: ['Used for rapid minimum key extraction.'],
    explanation: 'Min Priority Queue (or Min Heap / Fibonacci Heap) enables fast extraction of the minimum distance vertex.',
    tags: ['graphs', 'algorithms'],
    version: 1,
    createdAt: '2026-07-04T00:00:00Z',
    updatedAt: '2026-07-26T12:00:00Z'
  },
  {
    id: 'q_mock_5',
    questionId: 'q_mock_5',
    bankId: 'bank_default',
    institutionId: 'inst_default',
    type: 'LONG_ANSWER',
    title: 'Virtual Memory Page Replacement Tradeoffs',
    body: 'Compare and contrast Least Recently Used (LRU) vs First-In-First-Out (FIFO) page replacement algorithms under Belady Anomaly conditions.',
    status: 'APPROVED',
    difficulty: 'HARD',
    marks: 15,
    negativeMarks: 0,
    estimatedTimeSeconds: 600,
    hints: ['Mention stack algorithms and page fault rate curve.'],
    explanation: 'FIFO is prone to Belady Anomaly where increasing physical frames increases page fault rate, whereas LRU is a stack algorithm immune to Belady Anomaly.',
    tags: ['concurrency'],
    version: 1,
    createdAt: '2026-07-05T00:00:00Z',
    updatedAt: '2026-07-26T12:00:00Z'
  }
];
