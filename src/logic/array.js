export const parseArrayInput = (input) => {
  const values = input.split(/[,\s]+/).filter(Boolean).map(Number);
  return values.length > 0 && values.every((value) => !Number.isNaN(value)) ? values : null;
};

export const clampIndex = (index, length, fallback) => Number.isNaN(index)
  ? fallback
  : Math.max(0, Math.min(length, index));

export const insertAt = (items, index, value) => {
  const next = [...items];
  next.splice(clampIndex(index, items.length, items.length), 0, value);
  return next;
};

export const removeAt = (items, index) => {
  if (items.length === 0) return items;
  const next = [...items];
  next.splice(clampIndex(index, items.length - 1, items.length - 1), 1);
  return next;
};

export const updateAt = (items, index, value) => {
  if (items.length === 0) return items;
  const next = [...items];
  next[clampIndex(index, items.length - 1, items.length - 1)] = value;
  return next;
};

export const moveItem = (items, fromIndex, toIndex) => {
  if (fromIndex === toIndex || fromIndex === null || fromIndex === undefined) return items;
  const next = [...items];
  const [moved] = next.splice(fromIndex, 1);
  next.splice(toIndex, 0, moved);
  return next;
};
