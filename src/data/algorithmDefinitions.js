export const ALGORITHMS = {
  sort: [
    { key: 'selection', label: 'Selection Sort', bigO: 'O(n²)' },
    { key: 'bubble', label: 'Bubble Sort', bigO: 'O(n²)' },
  ],
  search: [
    { key: 'linear', label: 'Linear Search', bigO: 'O(n)' },
    { key: 'dfs', label: 'Depth-First Search', bigO: 'O(n)' },
    { key: 'bfs', label: 'Breadth-First Search', bigO: 'O(n)' },
    { key: 'binary', label: 'Binary Search', bigO: 'O(log n)' },
  ],
};

export const algorithmPseudocode = {
  selection: [
    'for i ← 0 to n - 2',
    '  min ← i',
    '  for j ← i + 1 to n - 1',
    '    compare array[j] with array[min]',
    '    if array[j] < array[min], min ← j',
    '  swap array[i] and array[min]',
    'return sorted array',
  ],
  bubble: [
    'for i ← 0 to n - 2',
    '  swapped ← false',
    '  for j ← 0 to n - i - 2',
    '    compare array[j] and array[j + 1]',
    '    if array[j] > array[j + 1], swap them',
    '  if not swapped, stop',
    'return sorted array',
  ],
  linear: [
    'for i ← 0 to n - 1',
    '  inspect array[i]',
    '  if array[i] = target',
    '    return i',
    'return not found',
  ],
  binary: [
    'sort the array',
    'left ← 0, right ← n - 1',
    'while left ≤ right',
    '  mid ← floor((left + right) / 2)',
    '  if array[mid] = target, return mid',
    '  if array[mid] < target, left ← mid + 1',
    '  else right ← mid - 1',
    'return not found',
  ],
  dfs: [
    'push root onto stack',
    'while stack is not empty',
    '  node ← stack.pop()',
    '  visit node and compare with target',
    '  push unvisited children onto stack',
    'return found or not found',
  ],
  bfs: [
    'enqueue root',
    'while queue is not empty',
    '  node ← queue.dequeue()',
    '  visit node and compare with target',
    '  enqueue unvisited children',
    'return found or not found',
  ],
};
