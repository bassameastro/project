const noop = () => {};
import { makeSnapshot } from './search.js';

export const sortWithTrace = (algorithm, sourceArray, emit = noop) => {
  const array = [...sourceArray];
  const report = (line, message, active) => emit(line, message, active, [...array]);

  if (algorithm === 'selection') {
    for (let i = 0; i < array.length - 1; i += 1) {
      report(0);
      let minIndex = i;
      report(1);
      report(2);
      for (let j = i + 1; j < array.length; j += 1) {
        report(3, `Comparing index ${minIndex} and ${j}`, [minIndex, j]);
        if (array[j] < array[minIndex]) {
          minIndex = j;
          report(4, `New minimum found at index ${minIndex}`, [minIndex, j]);
        }
      }
      if (i !== minIndex) {
        report(5, `Swapping positions ${i} and ${minIndex}`, [i, minIndex]);
        [array[i], array[minIndex]] = [array[minIndex], array[i]];
        report(5, `Swapped positions ${i} and ${minIndex}`, [i, minIndex]);
      }
    }
  } else if (algorithm === 'bubble') {
    for (let i = 0; i < array.length - 1; i += 1) {
      report(0);
      let swapped = false;
      report(1);
      report(2);
      for (let j = 0; j < array.length - i - 1; j += 1) {
        report(3, `Comparing index ${j} and ${j + 1}`, [j, j + 1]);
        if (array[j] > array[j + 1]) {
          report(4, `Swapping values at ${j} and ${j + 1}`, [j, j + 1]);
          [array[j], array[j + 1]] = [array[j + 1], array[j]];
          swapped = true;
          report(4, `Swapped values at ${j} and ${j + 1}`, [j, j + 1]);
        }
      }
      report(5, swapped ? 'Pass complete.' : 'No swaps made. Sort is complete.');
      if (!swapped) break;
    }
  }

  return array;
};

export const sortArray = (algorithm, sourceArray) => sortWithTrace(algorithm, sourceArray);

export const buildSortTrace = (algorithm, sourceArray) => {
  const steps = [];
  const state = {
    array: [...sourceArray],
    activeIndices: [],
    foundIndex: -1,
    activePseudocodeLine: -1,
    message: 'Pick an algorithm and press Play to start the visualization.',
    currentNodeId: null,
    visitedIds: [],
  };
  const push = (line, message = state.message, active = state.activeIndices) => {
    state.activePseudocodeLine = line;
    state.activeIndices = [...active];
    state.message = message;
    steps.push(makeSnapshot(state));
  };
  state.array = sortWithTrace(algorithm, state.array, (line, message, active, snapshotArray) => {
    state.array = snapshotArray;
    push(line, message, active);
  });
  push(6, 'Sort complete. Array is now ordered.', []);
  return steps;
};
