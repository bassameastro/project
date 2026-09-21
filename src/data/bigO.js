// Single source of truth for Big-O growth formulas, colors, and value
// formatting. Previously this logic was duplicated in app.js (dead code),
// complexityVisualizer.js, and algorithms.js.

export const factorialBig = (value) => {
  let result = 1n;
  for (let index = 2n; index <= BigInt(value); index++) result *= index;
  return result;
};

export const COMPLEXITIES = [
  { name: 'O(1)', color: '#4ade80', formula: () => 1 },
  { name: 'O(log n)', color: '#60a5fa', formula: (value) => Math.log2(value) },
  { name: 'O(n)', color: '#fbbf24', formula: (value) => value },
  { name: 'O(n log n)', color: '#f472b6', formula: (value) => value * Math.log2(value) },
  { name: 'O(n²)', color: '#fb7185', formula: (value) => value * value },
  { name: 'O(n³)', color: '#a78bfa', formula: (value) => value * value * value },
  { name: 'O(2^n)', color: '#2dd4bf', formula: (value) => Math.pow(2, value) },
  { name: 'O(n!)', color: '#f97316', formula: (value) => factorialBig(value) },
];

// Convenience lookup for callers that just need "name -> formula",
// e.g. building comparison series for a specific set of algorithms.
export const complexityFormulas = COMPLEXITIES.reduce((map, complexity) => {
  map[complexity.name] = complexity.formula;
  return map;
}, {});

export const formatMetricValue = (value) => {
  if (typeof value === 'bigint') {
    const text = value.toString();
    if (text.length <= 12) return text;
    return `${Number.parseFloat(text.slice(0, 4)).toFixed(2)}e${text.length - 1}`;
  }
  if (typeof value === 'number') {
    if (!Number.isFinite(value)) return '∞';
    if (value >= 1_000_000) return value.toExponential(2);
    return Math.round(value).toLocaleString();
  }
  return String(value);
};
