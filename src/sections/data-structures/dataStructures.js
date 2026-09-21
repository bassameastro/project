const e = React.createElement;
const { useState } = React;
import { TreeEditor, defaultTreeNodes } from '../../components/treeEditor.js';
import { ArrayEditor } from '../../components/arrayEditor.js';
import { dataStructurePseudocode } from '../../data/pseudocode.js';
import { layoutTreeNodes } from '../../logic/treeLayout.js';

export const dataStructureOptions = [
  { id: 'array', label: 'Array', description: 'Ordered collection of values with index-based access.' },
  { id: 'stack', label: 'Stack', description: 'Last-in, first-out structure for push/pop operations.' },
  { id: 'queue', label: 'Queue', description: 'First-in, first-out structure for scheduling and buffering.' },
  { id: 'linked-list', label: 'Linked List', description: 'Nodes connected by pointers for sequential traversal.' },
  { id: 'tree', label: 'Tree', description: 'Hierarchical structure of parent and child nodes.' },
];

export const dataStructureTopicInfo = {
  title: 'Data Structures',
  summary: 'Explore key structures, their roles, and example operations in one panel.',
};

export const DataStructuresSection = () => {
  const [selectedStructure, setSelectedStructure] = useState(dataStructureOptions[0].id);
  const [activeOperation, setActiveOperation] = useState('create');
  const [arrayItems, setArrayItems] = useState([10, 20, 30, 40]);
  const [stackItems, setStackItems] = useState([10, 20, 30]);
  const [queueItems, setQueueItems] = useState([10, 20, 30]);
  const [linkedListItems, setLinkedListItems] = useState([10, 20, 30, 40]);
  const [stackValue, setStackValue] = useState('');
  const [queueValue, setQueueValue] = useState('');
  const [listValue, setListValue] = useState('');
  const selected = dataStructureOptions.find((item) => item.id === selectedStructure);


  const defaultOperationForStructure = (structureId) => {
    if (structureId === 'array') return 'create';
    if (structureId === 'stack') return 'push';
    if (structureId === 'queue') return 'add';
    if (structureId === 'linked-list') return 'addHead';
    if (structureId === 'tree') return 'insert';
    return 'create';
  };

  const getPseudocode = () => (dataStructurePseudocode[selectedStructure] || {})[activeOperation] || [];

  const pushToStack = () => {
    setActiveOperation('push');
    const value = Number(stackValue);
    if (Number.isNaN(value)) return;
    setStackItems((items) => [...items, value]);
    setStackValue('');
  };

  const popFromStack = () => {
    setActiveOperation('pop');
    setStackItems((items) => items.slice(0, -1));
  };

  const addQueue = () => {
    setActiveOperation('add');
    const value = Number(queueValue);
    if (Number.isNaN(value)) return;
    setQueueItems((items) => [...items, value]);
    setQueueValue('');
  };

  const removeQueue = () => {
    setActiveOperation('remove');
    setQueueItems((items) => items.slice(1));
  };

  const addHead = () => {
    setActiveOperation('addHead');
    const value = Number(listValue);
    if (Number.isNaN(value)) return;
    setLinkedListItems((items) => [value, ...items]);
    setListValue('');
  };

  const addTail = () => {
    setActiveOperation('addTail');
    const value = Number(listValue);
    if (Number.isNaN(value)) return;
    setLinkedListItems((items) => [...items, value]);
    setListValue('');
  };

  const removeHead = () => {
    setActiveOperation('removeHead');
    setLinkedListItems((items) => items.slice(1));
  };

  const removeTail = () => {
    setActiveOperation('removeTail');
    setLinkedListItems((items) => items.slice(0, -1));
  };

  const renderStackVisual = () => e('div', { className: 'data-visual-stack' },
    e('div', { className: 'data-stack-top' }, 'Top'),
    [...stackItems].reverse().map((item, index) => e('div', {
      key: `${item}-${index}`,
      className: 'data-stack-item',
    }, item))
  );

  const renderQueueVisual = () => e('div', { className: 'data-queue-visual' },
    e('div', { className: 'data-visual-label' }, 'Front → Rear'),
    e('div', { className: 'data-queue-row' }, queueItems.map((item, index) => e('div', {
      key: `${item}-${index}`,
      className: 'data-queue-cell',
    }, item)))
  );

  const renderLinkedListVisual = () => e('div', { className: 'data-list-visual' },
    e('div', { className: 'data-visual-label' }, 'Head → Tail'),
    e('div', { className: 'data-list-row' }, linkedListItems.length === 0 ? e('div', { className: 'data-empty-state' }, 'Empty list') : linkedListItems.map((item, index) => e('div', { className: 'data-list-node-wrap', key: `${item}-${index}` },
      e('div', { className: 'data-list-node' }, item),
      index < linkedListItems.length - 1 && e('div', { className: 'data-list-arrow' }, '→')
    )))
  );

  const treeTerminology = [
    { term: 'Root', definition: 'The single node at the top of the tree with no parent.' },
    { term: 'Parent / Child', definition: 'A node directly connected one level above/below another.' },
    { term: 'Sibling', definition: 'Nodes that share the same parent.' },
    { term: 'Leaf', definition: 'A node with no children (both left and right are null).' },
    { term: 'Internal Node', definition: 'Any node with at least one child (includes the root).' },
    { term: 'Edge', definition: 'The connection/link between a parent and its child.' },
    { term: 'Depth of a node', definition: 'Number of edges from the root down to that node.' },
    { term: 'Height of a node', definition: 'Number of edges on the longest path from that node down to a leaf.' },
    { term: 'Height of the tree', definition: 'The height of the root node, the longest root-to-leaf path.' }
  ];

  const getTreeRoot = () => treeNodes.find((node) => !node.parentId) || null;

  const getTreeNodeById = (id) => treeNodes.find((node) => node.id === id) || null;

  const getTreeEdgePoints = (parentNode, childNode) => {
    if (!parentNode || !childNode) return null;

    const dx = childNode.x - parentNode.x;
    const dy = childNode.y - parentNode.y;
    const distance = Math.max(Math.hypot(dx, dy), 1);
    const radius = 28;

    return {
      startX: parentNode.x + (dx / distance) * radius,
      startY: parentNode.y + (dy / distance) * radius,
      endX: childNode.x - (dx / distance) * radius,
      endY: childNode.y - (dy / distance) * radius,
    };
  };

  const clearTreeState = () => {
    setTreeNodes([]);
    setTreePendingEdgeSource(null);
    draggingTreeNodeRef.current = null;
    setDraggingTreeNodeId(null);
  };

  const addTreeNodeAt = (x, y) => {
    const parsed = Number(treeValue);
    if (Number.isNaN(parsed)) return;

    const newNode = {
      id: nextTreeIdRef.current++,
      value: parsed,
      x,
      y,
      parentId: null,
      left: undefined,
      right: undefined,
    };

    if (treeNodes.length === 0) {
      setTreeNodes([newNode]);
      return;
    }

    const root = getTreeRoot();
    if (!root) {
      setTreeNodes([newNode]);
      return;
    }

    const target = treeNodes.find((node) => node.value === parsed);
    if (target) {
      return;
    }

    const insertionParent = treeNodes.reduce((best, node) => {
      if (!best) return node;
      return Math.abs(node.x - x) + Math.abs(node.y - y) < Math.abs(best.x - x) + Math.abs(best.y - y) ? node : best;
    }, null);

    if (!insertionParent) {
      setTreeNodes((prev) => [...prev, newNode]);
      return;
    }

    const nextNodes = treeNodes.map((node) => {
      if (node.id !== insertionParent.id) return node;
      if (parsed < node.value && !node.left) return { ...node, left: newNode.id };
      if (parsed >= node.value && !node.right) return { ...node, right: newNode.id };
      return node;
    });

    if (nextNodes.every((node) => node.id !== insertionParent.id)) {
      setTreeNodes((prev) => [...prev, newNode]);
      return;
    }

    setTreeNodes((prev) => {
      const foundParent = prev.find((node) => node.id === insertionParent.id);
      if (!foundParent) return [...prev, newNode];
      const updatedParent = { ...foundParent };
      if (parsed < foundParent.value && !foundParent.left) updatedParent.left = newNode.id;
      else if (parsed >= foundParent.value && !foundParent.right) updatedParent.right = newNode.id;
      else return [...prev, newNode];
      return prev.map((node) => (node.id === foundParent.id ? updatedParent : node)).concat({ ...newNode, parentId: foundParent.id });
    });
  };

  const connectTreeNodes = (fromId, toId) => {
    if (fromId === toId) return;
    const parent = treeNodes.find((node) => node.id === fromId);
    const child = treeNodes.find((node) => node.id === toId);
    if (!parent || !child) return;
    if (parent.left === toId || parent.right === toId) return;
    if (parent.left !== undefined && parent.right !== undefined && parent.left !== null && parent.right !== null) {
      return;
    }

    const newChildParent = child.parentId && child.parentId !== fromId ? child.parentId : fromId;

    setTreeNodes((prev) => prev.map((node) => {
      if (node.id === fromId) {
        const updated = { ...node };
        if (child.value < node.value && !updated.left) updated.left = toId;
        else if (child.value >= node.value && !updated.right) updated.right = toId;
        else if (!updated.left) updated.left = toId;
        else if (!updated.right) updated.right = toId;
        else return node;
        return updated;
      }

      if (node.id === toId) {
        return { ...node, parentId: newChildParent };
      }

      if (node.id === newChildParent && node.id !== fromId && node.id !== toId) {
        if (node.left === toId) return { ...node, left: undefined };
        if (node.right === toId) return { ...node, right: undefined };
      }

      return node;
    }));
  };

  const deleteTreeNode = (nodeId) => {
    if (!nodeId && nodeId !== 0) return;

    const idsToRemove = new Set([nodeId]);
    const collectChildren = (id) => {
      const node = treeNodes.find((item) => item.id === id);
      if (!node) return;
      if (node.left !== undefined && node.left !== null) {
        idsToRemove.add(node.left);
        collectChildren(node.left);
      }
      if (node.right !== undefined && node.right !== null) {
        idsToRemove.add(node.right);
        collectChildren(node.right);
      }
    };
    collectChildren(nodeId);

    setTreeNodes((prev) => prev
      .filter((node) => !idsToRemove.has(node.id))
      .map((node) => ({
        ...node,
        parentId: node.parentId !== undefined && idsToRemove.has(node.parentId) ? null : node.parentId,
        left: node.left !== undefined && idsToRemove.has(node.left) ? undefined : node.left,
        right: node.right !== undefined && idsToRemove.has(node.right) ? undefined : node.right,
      })));
    setTreePendingEdgeSource(null);
  };

  const generateRandomTree = () => {
    const count = 7 + Math.floor(Math.random() * 5);
    const uniqueValues = new Set();
    while (uniqueValues.size < count) {
      uniqueValues.add(Math.floor(Math.random() * 90) + 10);
    }
    const values = [...uniqueValues];
    const generated = [];

    let rootValue = values.shift();
    const root = { id: 1, value: rootValue, x: 0, y: 0, parentId: null };
    generated.push(root);
    nextTreeIdRef.current = 2;

    values.forEach((value) => {
      let current = root;
      while (true) {
        const node = generated.find((item) => item.id === current.id);
        if (!node) break;
        if (value < node.value) {
          if (node.left === undefined) {
            const newNode = {
              id: nextTreeIdRef.current++,
              value,
              x: 0,
              y: 0,
              parentId: node.id,
            };
            generated.push(newNode);
            node.left = newNode.id;
            break;
          }
          current = generated.find((item) => item.id === node.left);
        } else {
          if (node.right === undefined) {
            const newNode = {
              id: nextTreeIdRef.current++,
              value,
              x: 0,
              y: 0,
              parentId: node.id,
            };
            generated.push(newNode);
            node.right = newNode.id;
            break;
          }
          current = generated.find((item) => item.id === node.right);
        }
      }
    });

    const layoutWidth = treeViewportSize.width || 640;
    const layoutHeight = treeViewportSize.height || 440;
    setTreeNodes(layoutTreeNodes(generated, layoutWidth, layoutHeight));
    setTreePendingEdgeSource(null);
    draggingTreeNodeRef.current = null;
    setDraggingTreeNodeId(null);
  };

  const renderTreeEditorViewport = () => {
    const rootNode = getTreeRoot();
    const baseCanvasWidth = Math.max(treeViewportSize.width || 640, 280);
    const baseCanvasHeight = Math.max(treeViewportSize.height || 440, 280);
    const canvasWidth = baseCanvasWidth * treeViewportZoom;
    const canvasHeight = baseCanvasHeight * treeViewportZoom;

    const getPinchDistance = () => {
      const pointers = [...pinchPointersRef.current.values()];
      if (pointers.length < 2) return null;
      return Math.hypot(pointers[0].clientX - pointers[1].clientX, pointers[0].clientY - pointers[1].clientY);
    };

    const handleTreeViewportPointerDown = (event) => {
      if (event.pointerType === 'touch') {
        pinchPointersRef.current.set(event.pointerId, event);
        if (pinchPointersRef.current.size === 2) {
          pinchDistanceRef.current = getPinchDistance();
        }
      }
    };

    const handleTreeViewportPointerMove = (event) => {
      if (event.pointerType !== 'touch' || !pinchPointersRef.current.has(event.pointerId)) return;

      pinchPointersRef.current.set(event.pointerId, event);
      const nextDistance = getPinchDistance();
      if (!nextDistance || !pinchDistanceRef.current) return;

      const zoomChange = nextDistance / pinchDistanceRef.current;
      setTreeViewportZoom((zoom) => Math.min(2, Math.max(0.7, zoom * zoomChange)));
      pinchDistanceRef.current = nextDistance;
      event.preventDefault();
    };

    const handleTreeViewportPointerEnd = (event) => {
      pinchPointersRef.current.delete(event.pointerId);
      if (pinchPointersRef.current.size < 2) {
        pinchDistanceRef.current = null;
      }
    };

    const handleTreeViewportPointerUp = (event) => {
      if (event.currentTarget?.hasPointerCapture?.(event.pointerId)) {
        event.currentTarget.releasePointerCapture(event.pointerId);
      }
      handleTreeViewportPointerEnd(event);
      draggingTreeNodeRef.current = null;
      setDraggingTreeNodeId(null);
    };

    const handleTreeNodeClick = (event, nodeId) => {
      event.stopPropagation();

      if (treeTool === 'delete') {
        deleteTreeNode(nodeId);
        return;
      }

      if (treeTool === 'edge') {
        if (!treePendingEdgeSource) {
          setTreePendingEdgeSource(nodeId);
          return;
        }
        if (treePendingEdgeSource === nodeId) {
          setTreePendingEdgeSource(null);
          return;
        }
        connectTreeNodes(treePendingEdgeSource, nodeId);
        setTreePendingEdgeSource(null);
        return;
      }

      if (treeTool === 'move' && event.pointerType !== 'touch' && !draggingTreeNodeId) {
        draggingTreeNodeRef.current = nodeId;
        setDraggingTreeNodeId(nodeId);
      }
    };

    const handleTreeCanvasClick = (event) => {
      if (treeTool !== 'node') return;
      const bounds = treeViewportRef.current?.getBoundingClientRect();
      if (!bounds) return;
      const x = (event.clientX - bounds.left + treeViewportRef.current.scrollLeft) / treeViewportZoom;
      const y = (event.clientY - bounds.top + treeViewportRef.current.scrollTop) / treeViewportZoom;
      addTreeNodeAt(x, y);
    };

    return e('div', {
      className: `tree-editor-viewport ${treeViewportExpanded ? 'expanded' : ''}`,
      ref: treeViewportRef,
      onClick: handleTreeCanvasClick,
      onPointerDown: handleTreeViewportPointerDown,
      onPointerMove: handleTreeViewportPointerMove,
      onPointerUp: handleTreeViewportPointerUp,
      onPointerCancel: handleTreeViewportPointerUp,
      title: treePendingEdgeSource ? `Attach to node ${treePendingEdgeSource}` : 'Tree editor'
    },
      e('div', {
        className: 'tree-editor-canvas',
        style: { width: `${canvasWidth}px`, height: `${canvasHeight}px` }
      },
        e('svg', {
        className: 'tree-editor-svg',
        width: canvasWidth,
        height: canvasHeight,
        style: {
          width: `${canvasWidth / treeViewportZoom}px`,
          height: `${canvasHeight / treeViewportZoom}px`,
          transform: `scale(${treeViewportZoom})`,
          transformOrigin: 'top left'
        }
      },
        treeNodes.flatMap((childNode) => {
          const parentNode = childNode.parentId !== null && childNode.parentId !== undefined
            ? getTreeNodeById(childNode.parentId)
            : null;

          if (!parentNode) return [];

          const edgePoints = getTreeEdgePoints(parentNode, childNode);
          if (!edgePoints) return [];

          return e('line', {
            key: `${parentNode.id}-${childNode.id}-line`,
            x1: edgePoints.startX,
            y1: edgePoints.startY,
            x2: edgePoints.endX,
            y2: edgePoints.endY,
            stroke: childNode.value < parentNode.value ? '#60a5fa' : '#34d399',
            strokeWidth: 2,
            strokeDasharray: '6 4',
            markerEnd: 'url(#treeArrowHead)'
          });
        }),
        e('defs', { key: 'treeArrowDefs' },
          e('marker', {
            id: 'treeArrowHead',
            viewBox: '0 0 10 10',
            refX: '8',
            refY: '5',
            markerWidth: '7',
            markerHeight: '7',
            orient: 'auto-start-reverse'
          },
            e('path', { d: 'M 0 0 L 10 5 L 0 10 z', fill: '#60a5fa' })
          )
        )
        ),
        treeNodes.length === 0 && e('div', { className: 'tree-empty-state' }, 'Click to add the first root node'),
        treeNodes.map((node) => {
        const isRoot = rootNode && node.id === rootNode.id;
        return e('div', {
          key: node.id,
          className: `tree-editor-node ${isRoot ? 'root' : node.left === undefined && node.right === undefined ? 'leaf' : 'branch'}`,
          style: {
            left: `${node.x * treeViewportZoom}px`,
            top: `${node.y * treeViewportZoom}px`,
            transform: `translate(-50%, -50%) scale(${treeViewportZoom})`,
          },
          title: isRoot ? 'Root' : `Node ${node.value}`,
          onPointerDown: (event) => {
            if (event.pointerType === 'touch') {
              handleTreeViewportPointerDown(event);
            }
            handleTreeNodeClick(event, node.id);
            if (treeTool === 'move' && event.pointerType !== 'touch') {
              event.currentTarget.setPointerCapture(event.pointerId);
            }
          },
          onPointerMove: handleTreeViewportPointerMove,
          onPointerUp: handleTreeViewportPointerUp,
          onPointerCancel: handleTreeViewportPointerUp,
        }, node.value);
        })
      )
    );
  };

  const renderTreeControls = () => e('div', { className: 'tree-controls-panel' },
    e('div', { className: 'tree-editor-toolbar' },
      e('button', { className: `tree-tool-button ${treeTool === 'move' ? 'active' : ''}`, onClick: () => setTreeTool('move') }, 'Move / Pan'),
      e('button', { className: `tree-tool-button ${treeTool === 'node' ? 'active' : ''}`, onClick: () => setTreeTool('node') }, 'Add Node'),
      e('button', { className: `tree-tool-button ${treeTool === 'edge' ? 'active' : ''}`, onClick: () => setTreeTool('edge') }, 'Connect'),
      e('button', { className: `tree-tool-button destroy ${treeTool === 'delete' ? 'active' : ''}`, onClick: () => setTreeTool('delete') }, 'Delete'),
      e('button', { className: 'tree-tool-button accent', onClick: () => clearTreeState() }, 'Clear'),
      e('button', { className: 'tree-tool-button accent', onClick: generateRandomTree }, 'Random Tree'),
      e('button', {
        className: 'tree-tool-button resize',
        onClick: () => setTreeViewportExpanded((expanded) => !expanded),
        'aria-pressed': treeViewportExpanded,
        title: treeViewportExpanded ? 'Reduce visualization height' : 'Expand visualization height'
      }, treeViewportExpanded ? 'Reduce View' : 'Resize View')
    ),
    e('div', { className: 'tree-editor-input-row' },
      e('label', { className: 'tree-input-label' }, 'Value'),
      e('input', {
        type: 'number',
        value: treeValue,
        onChange: (event) => setTreeValue(event.target.value),
        className: 'tree-input'
      })
    )
  );

  const renderTreeVisual = () => e('div', { className: 'data-tree-visual' }, e(TreeEditor, {
    initialNodes: defaultTreeNodes,
    editable: true,
  }));

  const renderStructureVisual = () => {
    if (selectedStructure === 'stack') {
      return renderStackVisual();
    }

    if (selectedStructure === 'queue') {
      return renderQueueVisual();
    }

    if (selectedStructure === 'linked-list') {
      return renderLinkedListVisual();
    }

    if (selectedStructure === 'tree') {
      return renderTreeVisual();
    }

    return e(ArrayEditor, {
      items: arrayItems,
      editable: true,
      hideControls: true,
      onItemsChange: setArrayItems,
      onOperation: setActiveOperation,
      variant: 'cells',
    });
  };

  return e('div', { className: 'section-content' },
    e('div', { className: 'data-structures-layout' },
      e('div', { className: 'card data-controls-card' },
        e('label', null, 'Structure', e('select', {
          value: selectedStructure,
          onChange: (event) => {
            setSelectedStructure(event.target.value);
            setActiveOperation(defaultOperationForStructure(event.target.value));
          },
        }, dataStructureOptions.map((item) => e('option', { key: item.id, value: item.id }, item.label)))),
        selectedStructure === 'array' && e(ArrayEditor, {
          items: arrayItems,
          editable: true,
          controlsOnly: true,
          onItemsChange: setArrayItems,
          onOperation: setActiveOperation,
          variant: 'cells',
        }),
        selectedStructure === 'stack' && e('div', { className: 'data-controls-group' },
          e('input', {
            type: 'number',
            value: stackValue,
            placeholder: 'Enter value',
            onChange: (event) => setStackValue(event.target.value),
          }),
          e('div', { className: 'button-row' },
            e('button', { className: 'primary', onClick: pushToStack }, 'Push'),
            e('button', { onClick: popFromStack }, 'Pop')
          )
        ),
        selectedStructure === 'queue' && e('div', { className: 'data-controls-group' },
          e('input', {
            type: 'number',
            value: queueValue,
            placeholder: 'Enter value',
            onChange: (event) => setQueueValue(event.target.value),
          }),
          e('div', { className: 'button-row' },
            e('button', { className: 'primary', onClick: addQueue }, 'Add'),
            e('button', { onClick: removeQueue }, 'Remove')
          )
        ),
        selectedStructure === 'linked-list' && e('div', { className: 'data-controls-group' },
          e('input', {
            type: 'number',
            value: listValue,
            placeholder: 'Enter value',
            onChange: (event) => setListValue(event.target.value),
          }),
          e('div', { className: 'button-row' },
            e('button', { className: 'primary', onClick: addHead }, 'Add Head'),
            e('button', { onClick: addTail }, 'Add Tail'),
            e('button', { onClick: removeHead }, 'Remove Head'),
            e('button', { onClick: removeTail }, 'Remove Tail')
          )
        ),
        selectedStructure === 'tree' && e('div', { className: 'data-controls-group' },
          e('div', { className: 'tree-info-panel' },
            e('div', { className: 'tree-info-title' }, 'Key Terminology'),
            e('div', { className: 'tree-info-list tree-term-cards' },
              treeTerminology.map((item) => e('div', { className: 'tree-term-card tree-info-line', key: item.term },
                e('span', { className: 'tree-term-card-title' }, item.term),
                e('span', { className: 'tree-term-card-definition' }, item.definition)
              ))
            )
          )
        )
      ),
      e('div', { className: 'card data-visual-card' },
        e('h3', null, selected.label),
        e('p', null, selected.description),
        selectedStructure === 'tree'
          ? e('div', { className: 'mini-visual mini-visual-tree' }, renderTreeVisual())
          : e('div', { className: 'mini-visual' }, renderStructureVisual()),
        e('div', { className: 'data-pseudocode-panel' },
          e('div', { className: 'data-pseudocode-title' }, 'pseudocode'),
          e('pre', { className: 'data-pseudocode-code' },
            getPseudocode().map((line, idx) => e('div', { className: 'data-pseudocode-line', key: idx }, line))
          )
        ),
        e('p', { className: 'info-note' }, selectedStructure === 'array'
          ? 'Create a new array or insert, remove, and update values by index.'
          : selectedStructure === 'stack'
            ? 'Push adds to the top and pop removes from the top.'
            : selectedStructure === 'queue'
              ? 'Add places a value at the rear, and remove takes the front value.'
              : selectedStructure === 'linked-list'
                ? 'Add head/tail inserts nodes, and remove head/tail deletes them from the ends.'
                : 'A tree stores parent-child relationships in levels and branches.')
      )
    )
  );
};
