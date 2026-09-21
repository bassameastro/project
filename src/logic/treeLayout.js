export const layoutTreeNodes = (nodes, width, height) => {
  if (!nodes.length) return nodes;
  const safeWidth = Math.max(width, 280);
  const safeHeight = Math.max(height, 280);
  const childrenByParent = new Map();
  nodes.forEach((node) => {
    const children = childrenByParent.get(node.parentId ?? null) || [];
    children.push(node);
    childrenByParent.set(node.parentId ?? null, children);
  });
  const levels = [];
  const queue = (childrenByParent.get(null) || []).map((node) => ({ node, depth: 0 }));
  const visited = new Set();
  while (queue.length) {
    const { node, depth } = queue.shift();
    if (visited.has(node.id)) continue;
    visited.add(node.id);
    if (!levels[depth]) levels[depth] = [];
    levels[depth].push(node);
    (childrenByParent.get(node.id) || []).forEach((child) => queue.push({ node: child, depth: depth + 1 }));
  }
  nodes.forEach((node) => {
    if (visited.has(node.id)) return;
    if (!levels[0]) levels[0] = [];
    levels[0].push(node);
  });
  const horizontalPadding = Math.min(48, safeWidth * 0.12);
  const verticalPadding = 42;
  const usableWidth = Math.max(safeWidth - horizontalPadding * 2, 120);
  const maxDepth = Math.max(levels.length - 1, 0);
  const levelGap = maxDepth === 0 ? 0 : (safeHeight - verticalPadding * 2) / maxDepth;
  return nodes.map((node) => {
    const depth = levels.findIndex((level) => level.some((item) => item.id === node.id));
    const level = levels[depth] || [node];
    const index = level.findIndex((item) => item.id === node.id);
    return {
      ...node,
      x: horizontalPadding + ((index + 1) / (level.length + 1)) * usableWidth,
      y: verticalPadding + depth * levelGap,
    };
  });
};
