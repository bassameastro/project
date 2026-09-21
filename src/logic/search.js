export const makeSnapshot = (state) => ({
  array: state.array ? [...state.array] : undefined,
  dfsNodes: state.dfsNodes ? state.dfsNodes.map((node) => ({ ...node })) : undefined,
  activeIndices: [...(state.activeIndices || [])],
  foundIndex: state.foundIndex ?? -1,
  activePseudocodeLine: state.activePseudocodeLine ?? -1,
  message: state.message || '',
  currentNodeId: state.currentNodeId ?? null,
  visitedIds: [...(state.visitedIds || [])],
});

const createState = (initial) => ({
  ...initial,
  activeIndices: [],
  foundIndex: -1,
  activePseudocodeLine: -1,
  message: 'Pick an algorithm and press Play to start the visualization.',
  currentNodeId: null,
  visitedIds: [],
});

export const buildArraySearchTrace = (sourceArray, searchValue) => {
  const steps = [];
  const state = createState({ array: [...sourceArray] });
  const push = (line, message = state.message, active = state.activeIndices, found = state.foundIndex) => {
    state.activePseudocodeLine = line;
    state.activeIndices = [...active];
    state.foundIndex = found;
    state.message = message;
    steps.push(makeSnapshot(state));
  };
  const target = Number(searchValue);
  if (Number.isNaN(target)) {
    push(-1, 'Enter a valid numeric search value.');
    return steps;
  }
  push(0);
  for (let index = 0; index < state.array.length; index += 1) {
    push(1, `Checking index ${index}`, [index]);
    if (state.array[index] === target) {
      push(2, `Value found at index ${index}`, [index], index);
      push(3, `Value found at index ${index}`, [], index);
      return steps;
    }
  }
  push(4, 'Value not found in the array.', []);
  return steps;
};

export const buildBinarySearchTrace = (sourceArray, searchValue) => {
  const steps = [];
  const state = createState({ array: [...sourceArray] });
  const push = (line, message = state.message, active = state.activeIndices, found = state.foundIndex) => {
    state.activePseudocodeLine = line;
    state.activeIndices = [...active];
    state.foundIndex = found;
    state.message = message;
    steps.push(makeSnapshot(state));
  };
  const target = Number(searchValue);
  if (Number.isNaN(target)) {
    push(-1, 'Enter a valid numeric search value.');
    return steps;
  }
  const sorted = [...state.array].sort((a, b) => a - b);
  state.array = sorted;
  push(0, 'Array sorted for binary search.');
  push(1);
  let left = 0;
  let right = sorted.length - 1;
  while (left <= right) {
    push(2, `Searching between ${left} and ${right}`);
    const middle = Math.floor((left + right) / 2);
    push(3, `Searching between ${left} and ${right}, checking ${middle}`, [left, middle, right]);
    if (sorted[middle] === target) {
      push(4, `Value found at sorted index ${middle}`, [middle], middle);
      push(4, `Value found at sorted index ${middle}`, [], middle);
      return steps;
    }
    if (sorted[middle] < target) {
      push(5, `Target is greater than index ${middle}`, [left, middle, right]);
      left = middle + 1;
    } else {
      push(6, `Target is less than index ${middle}`, [left, middle, right]);
      right = middle - 1;
    }
  }
  push(7, 'Value not found in sorted array.', []);
  return steps;
};

export const buildTreeSearchTrace = (algorithm, sourceNodes, searchValue) => {
  const steps = [];
  const state = createState({ dfsNodes: sourceNodes.map((node) => ({ ...node })) });
  const push = (line, message = state.message, active = state.activeIndices, found = state.foundIndex) => {
    state.activePseudocodeLine = line;
    state.activeIndices = [...active];
    state.foundIndex = found;
    state.message = message;
    steps.push(makeSnapshot(state));
  };
  const target = Number(searchValue);
  if (Number.isNaN(target)) {
    push(-1, 'Enter a valid numeric search value.');
    return steps;
  }
  const root = state.dfsNodes.find((node) => node.parentId === null);
  const pendingNodes = root ? [root.id] : [];
  const visited = new Set();
  const isBreadthFirst = algorithm === 'bfs';
  push(0);
  while (pendingNodes.length) {
    push(1, `${isBreadthFirst ? 'BFS' : 'DFS'} pending nodes: ${pendingNodes.length}`);
    const nodeId = isBreadthFirst ? pendingNodes.shift() : pendingNodes.pop();
    push(2, `${isBreadthFirst ? 'BFS' : 'DFS'} selected node ${nodeId}`);
    if (visited.has(nodeId)) continue;
    visited.add(nodeId);
    const node = state.dfsNodes.find((item) => item.id === nodeId);
    if (!node) continue;
    const index = state.dfsNodes.findIndex((item) => item.id === nodeId);
    state.currentNodeId = nodeId;
    state.visitedIds = [...visited];
    push(3, `${isBreadthFirst ? 'BFS' : 'DFS'} visiting node ${node.value}`, [index]);
    if (node.value === target) {
      push(3, `Value found by ${isBreadthFirst ? 'BFS' : 'DFS'} at node ${node.value}`, [index], index);
      push(5, `Value found by ${isBreadthFirst ? 'BFS' : 'DFS'} at node ${node.value}`, [], index);
      return steps;
    }
    const children = state.dfsNodes.filter((item) => item.parentId === nodeId);
    push(4, `${isBreadthFirst ? 'BFS' : 'DFS'} added ${children.length} child node(s)`, [index]);
    if (isBreadthFirst) children.forEach((child) => pendingNodes.push(child.id));
    else children.slice().reverse().forEach((child) => pendingNodes.push(child.id));
  }
  push(5, `Value not found by ${isBreadthFirst ? 'BFS' : 'DFS'}.`, []);
  return steps;
};
