import { clampIndex, insertAt, moveItem, parseArrayInput, removeAt, updateAt } from '../logic/array.js';

const e = React.createElement;
const { useState } = React;

export const ArrayEditor = ({
  items = [],
  displayItems,
  editable = true,
  activeIndices = [],
  foundIndex = -1,
  onItemsChange,
  onMessageChange,
  onOperation,
  variant = 'cells',
}) => {
  const [createInput, setCreateInput] = useState(items.join(','));
  const [valueInput, setValueInput] = useState('');
  const [indexInput, setIndexInput] = useState('');
  const [draggedIndex, setDraggedIndex] = useState(null);
  const shownItems = displayItems || items;
  const canEdit = editable;
  const notify = (message) => onMessageChange?.(message);
  const commit = (next, operation, message) => {
    onItemsChange?.(next);
    onOperation?.(operation);
    if (message) notify(message);
  };

  const createArray = () => {
    const parsed = parseArrayInput(createInput);
    onOperation?.('create');
    if (!parsed) return;
    commit(parsed, 'create');
    setCreateInput(parsed.join(','));
  };

  const appendValue = () => {
    const parsed = Number(valueInput.trim());
    if (Number.isNaN(parsed)) {
      notify('Please enter a valid number.');
      return;
    }
    commit([...items, parsed], 'append', `Added ${parsed} to the array.`);
    setValueInput('');
  };

  const insertValue = () => {
    const value = Number(valueInput);
    const index = Number(indexInput);
    if (Number.isNaN(value)) return;
    commit(insertAt(items, index, value), 'insert');
    setValueInput('');
    setIndexInput('');
  };

  const removeValue = () => {
    const index = Number(indexInput);
    commit(removeAt(items, index), 'remove');
    setIndexInput('');
  };

  const updateValue = () => {
    const value = Number(valueInput);
    const index = Number(indexInput);
    if (Number.isNaN(value)) return;
    commit(updateAt(items, index, value), 'update');
    setValueInput('');
    setIndexInput('');
  };

  const editBarValue = (index) => {
    const nextValue = window.prompt('Enter a new value for this bar', shownItems[index]);
    if (nextValue === null) return;
    const parsed = Number(nextValue);
    if (Number.isNaN(parsed)) {
      notify('Please enter a valid number.');
      return;
    }
    const actualIndex = clampIndex(index, items.length - 1, index);
    const next = updateAt(items, actualIndex, parsed);
    commit(next, 'update', `Updated value at index ${actualIndex} to ${parsed}.`);
  };

  const handleDrop = (targetIndex) => {
    if (draggedIndex === null || draggedIndex === targetIndex) {
      setDraggedIndex(null);
      return;
    }
    commit(moveItem(items, draggedIndex, targetIndex), 'reorder', 'Array order updated.');
    setDraggedIndex(null);
  };

  if (variant === 'cells') {
    return e('div', { className: 'data-array-editor' },
      canEdit && e('div', { className: 'data-controls-group' },
        e('label', null, 'Create Array', e('input', {
          type: 'text', value: createInput, placeholder: '10,20,30',
          onChange: (event) => setCreateInput(event.target.value),
        })),
        e('div', { className: 'button-row' }, e('button', { className: 'primary', onClick: createArray }, 'Create')),
        e('div', { className: 'data-inline-fields' },
          e('label', null, 'Value', e('input', { type: 'number', value: valueInput, placeholder: 'Value', onChange: (event) => setValueInput(event.target.value) })),
          e('label', null, 'Index', e('input', { type: 'number', value: indexInput, placeholder: 'Index', onChange: (event) => setIndexInput(event.target.value) }))
        ),
        e('div', { className: 'button-row' },
          e('button', { className: 'primary', onClick: insertValue }, 'Insert'),
          e('button', { onClick: removeValue }, 'Remove'),
          e('button', { onClick: updateValue }, 'Update')
        )
      ),
      e('div', { className: 'data-array-visual' },
        e('div', { className: 'data-visual-label' }, 'Index 0 → n'),
        e('div', { className: 'data-array-row' }, shownItems.map((item, index) => e('div', {
          key: `${item}-${index}`, className: 'data-array-cell',
        }, e('span', { className: 'data-array-index' }, index), e('span', { className: 'data-array-value' }, item))))
      )
    );
  }

  return e('div', { className: 'array-bars-editor' },
    e('div', { className: 'visual-header' },
      e('label', { className: 'value-input-label' }, 'Add number', e('input', {
        type: 'number', value: valueInput, disabled: !canEdit, placeholder: 'Type a number',
        onChange: (event) => setValueInput(event.target.value),
        onKeyDown: (event) => { if (event.key === 'Enter') { event.preventDefault(); appendValue(); } },
      })),
      e('button', { className: 'primary compact', onClick: appendValue, disabled: !canEdit }, 'Add')
    ),
    e('div', { className: 'visual-area' }, shownItems.map((value, index) => {
      const classNames = ['bar'];
      if (activeIndices.includes(index)) classNames.push('selected');
      if (foundIndex === index) classNames.push('found');
      return e('div', {
        key: index,
        className: classNames.join(' '),
        draggable: canEdit,
        onDragStart: () => setDraggedIndex(index),
        onDragOver: (event) => event.preventDefault(),
        onDrop: () => handleDrop(index),
        onDoubleClick: () => canEdit && editBarValue(index),
        style: { height: `${Math.max(value, 5)}%` },
      }, e('label', null, value));
    }))
  );
};
