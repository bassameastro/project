const e = React.createElement;
const { useState, useEffect, useRef } = React;
import { useResizeObserver, usePinchZoom } from '../hooks.js';
import { layoutTreeNodes } from '../logic/treeLayout.js';

export const defaultTreeNodes = [
  { id: 1, value: 50, x: 0, y: 0, parentId: null, left: 2, right: 3 },
  { id: 2, value: 25, x: 0, y: 0, parentId: 1 },
  { id: 3, value: 75, x: 0, y: 0, parentId: 1 },
  { id: 4, value: 15, x: 0, y: 0, parentId: 2 },
  { id: 5, value: 35, x: 0, y: 0, parentId: 2 },
  { id: 6, value: 60, x: 0, y: 0, parentId: 3 },
  { id: 7, value: 90, x: 0, y: 0, parentId: 3 },
];

export const TreeEditor = ({
  initialNodes = [],
  editable = true,
  highlightedIds = [],
  activeId = null,
  onNodesChange,
}) => {
  const [treeNodes, setTreeNodes] = useState(() => initialNodes.map((node) => ({ ...node })));
  const [treeTool, setTreeTool] = useState('move');
  const [treeValue, setTreeValue] = useState('25');
  const [pendingEdgeSource, setPendingEdgeSource] = useState(null);
  const { zoom, setZoom, handlers: pinchHandlers } = usePinchZoom();
  const [draggingNodeId, setDraggingNodeId] = useState(null);
  const viewportRef = useRef(null);
  const draggingRef = useRef(null);
  const zoomRef = useRef(1);
  const nextIdRef = useRef(Math.max(0, ...treeNodes.map((node) => node.id)) + 1);
  const lastReportedKeyRef = useRef('');
  const isBinaryTree = treeNodes.some((node) => node.left !== undefined || node.right !== undefined);
  const topologyKey = treeNodes.map((node) => `${node.id}:${node.value}:${node.parentId ?? ''}:${node.left ?? ''}:${node.right ?? ''}`).join('|');

  const updateNodes = (updater) => {
    setTreeNodes((previous) => typeof updater === 'function' ? updater(previous) : updater);
  };

  useEffect(() => { zoomRef.current = zoom; }, [zoom]);
  useEffect(() => {
    const key = treeNodes.map((node) => `${node.id}:${node.value}:${node.x}:${node.y}:${node.parentId ?? ''}:${node.left ?? ''}:${node.right ?? ''}`).join('|');
    if (key === lastReportedKeyRef.current) return;
    lastReportedKeyRef.current = key;
    onNodesChange?.(treeNodes.map((node) => ({ ...node })));
  }, [treeNodes, onNodesChange]);
  const viewportSize = useResizeObserver(viewportRef);
  useEffect(() => {
    const move = (event) => {
      const id = draggingRef.current;
      if (!id || !viewportRef.current || !editable) return;
      const bounds = viewportRef.current.getBoundingClientRect();
      const currentZoom = zoomRef.current;
      const x = (event.clientX - bounds.left + viewportRef.current.scrollLeft) / currentZoom;
      const y = (event.clientY - bounds.top + viewportRef.current.scrollTop) / currentZoom;
      updateNodes((nodes) => nodes.map((node) => node.id === id ? { ...node, x, y } : node));
    };
    const stop = () => { draggingRef.current = null; setDraggingNodeId(null); };
    window.addEventListener('pointermove', move);
    window.addEventListener('pointerup', stop);
    window.addEventListener('pointercancel', stop);
    return () => {
      window.removeEventListener('pointermove', move);
      window.removeEventListener('pointerup', stop);
      window.removeEventListener('pointercancel', stop);
    };
  }, [editable]);
  useEffect(() => {
    const width = viewportSize.width || 640;
    const height = viewportSize.height || 440;
    updateNodes((nodes) => layoutTreeNodes(nodes, width, height));
  }, [topologyKey, viewportSize.width, viewportSize.height]);

  const root = treeNodes.find((node) => node.parentId === null || node.parentId === undefined) || null;
  const getNode = (id) => treeNodes.find((node) => node.id === id) || null;
  const edgePoints = (parent, child) => {
    const dx = child.x - parent.x;
    const dy = child.y - parent.y;
    const distance = Math.max(Math.hypot(dx, dy), 1);
    return { startX: parent.x + (dx / distance) * 28, startY: parent.y + (dy / distance) * 28, endX: child.x - (dx / distance) * 28, endY: child.y - (dy / distance) * 28 };
  };

  const addNode = (x, y) => {
    const value = Number(treeValue);
    if (!editable || Number.isNaN(value) || treeNodes.some((node) => node.value === value)) return;
    const newNode = { id: nextIdRef.current++, value, x, y, parentId: null };
    if (!treeNodes.length) return updateNodes([newNode]);
    const parent = treeNodes.reduce((closest, node) => !closest || Math.hypot(node.x - x, node.y - y) < Math.hypot(closest.x - x, closest.y - y) ? node : closest, null);
    if (isBinaryTree) {
      const parentUpdate = { ...parent };
      if (value < parent.value && parentUpdate.left === undefined) parentUpdate.left = newNode.id;
      else if (value >= parent.value && parentUpdate.right === undefined) parentUpdate.right = newNode.id;
      else return;
      newNode.parentId = parent.id;
      return updateNodes((nodes) => nodes.map((node) => node.id === parent.id ? parentUpdate : node).concat(newNode));
    }
    newNode.parentId = parent.id;
    updateNodes((nodes) => nodes.concat(newNode));
  };

  const connectNodes = (fromId, toId) => {
    if (!editable || fromId === toId) return;
    const parent = getNode(fromId);
    const child = getNode(toId);
    if (!parent || !child) return;
    if (isBinaryTree && parent.left !== undefined && parent.right !== undefined) return;
    updateNodes((nodes) => nodes.map((node) => {
      if (node.id === toId) return { ...node, parentId: fromId };
      if (!isBinaryTree || node.id !== fromId) return node;
      const next = { ...node };
      if (child.value < node.value && next.left === undefined) next.left = toId;
      else if (next.right === undefined) next.right = toId;
      return next;
    }));
    setPendingEdgeSource(null);
  };

  const deleteNode = (nodeId) => {
    if (!editable) return;
    const remove = new Set([nodeId]);
    const collect = (id) => treeNodes.filter((node) => node.parentId === id).forEach((node) => { remove.add(node.id); collect(node.id); });
    collect(nodeId);
    updateNodes((nodes) => nodes.filter((node) => !remove.has(node.id)).map((node) => ({ ...node, parentId: remove.has(node.parentId) ? null : node.parentId, left: remove.has(node.left) ? undefined : node.left, right: remove.has(node.right) ? undefined : node.right })));
    setPendingEdgeSource(null);
  };

  const randomTree = () => {
    if (!editable) return;
    const values = [];
    while (values.length < 8) { const value = Math.floor(Math.random() * 90) + 10; if (!values.includes(value)) values.push(value); }
    const generated = [{ id: 1, value: values[0], x: 0, y: 0, parentId: null }];
    values.slice(1).forEach((value, index) => {
      const node = { id: index + 2, value, x: 0, y: 0, parentId: null };
      if (!isBinaryTree) {
        node.parentId = generated[Math.floor(Math.random() * generated.length)].id;
        generated.push(node);
        return;
      }
      let current = generated[0];
      while (current) {
        if (value < current.value) {
          if (current.left === undefined) {
            current.left = node.id;
            node.parentId = current.id;
            break;
          }
          current = generated.find((item) => item.id === current.left);
        } else {
          if (current.right === undefined) {
            current.right = node.id;
            node.parentId = current.id;
            break;
          }
          current = generated.find((item) => item.id === current.right);
        }
      }
      generated.push(node);
    });
    nextIdRef.current = generated.length + 1;
    updateNodes(generated);
    setPendingEdgeSource(null);
  };

  const pointerEnd = (event) => {
    pinchHandlers.onPointerUp(event);
    draggingRef.current = null;
    setDraggingNodeId(null);
  };
  const pointerMove = (event) => {
    pinchHandlers.onPointerMove(event);
  };
  const pointerDownNode = (event, nodeId) => {
    event.stopPropagation();
    if (!editable) return;
    pinchHandlers.onPointerDown(event);
    if (treeTool === 'delete') return deleteNode(nodeId);
    if (treeTool === 'edge') {
      if (pendingEdgeSource === null) setPendingEdgeSource(nodeId);
      else connectNodes(pendingEdgeSource, nodeId);
      return;
    }
    if (treeTool === 'move') { draggingRef.current = nodeId; setDraggingNodeId(nodeId); }
  };

  const baseWidth = Math.max(viewportSize.width || 640, 280);
  const baseHeight = Math.max(viewportSize.height || 440, 280);
  const canvasWidth = baseWidth * zoom;
  const canvasHeight = baseHeight * zoom;
  const renderedNodes = treeNodes;

  return e('div', { className: 'tree-editor' },
    editable && e('div', { className: 'tree-editor-toolbar' },
      ['move', 'node', 'edge', 'delete'].map((tool) => e('button', { key: tool, className: `tree-tool-button ${treeTool === tool ? 'active' : ''}`, onClick: () => setTreeTool(tool) }, tool === 'node' ? 'Add Node' : tool === 'edge' ? 'Connect' : tool[0].toUpperCase() + tool.slice(1))),
      e('button', { className: 'tree-tool-button accent', onClick: () => updateNodes([]) }, 'Clear'),
      e('button', { className: 'tree-tool-button accent', onClick: randomTree }, 'Random Tree'),
      e('div', { className: 'tree-editor-input-row' }, e('label', { className: 'tree-input-label' }, 'Value'), e('input', { type: 'number', value: treeValue, onChange: (event) => setTreeValue(event.target.value), className: 'tree-input' }))
    ),
    e('div', { className: 'tree-editor-viewport', ref: viewportRef, onPointerDown: pinchHandlers.onPointerDown, onPointerMove: pointerMove, onPointerUp: pointerEnd, onPointerCancel: pointerEnd, onClick: (event) => {
      if (editable && treeTool === 'node' && viewportRef.current) { const bounds = viewportRef.current.getBoundingClientRect(); addNode((event.clientX - bounds.left + viewportRef.current.scrollLeft) / zoom, (event.clientY - bounds.top + viewportRef.current.scrollTop) / zoom); }
    } },
      e('div', { className: 'tree-editor-canvas', style: { width: `${canvasWidth}px`, height: `${canvasHeight}px` } },
        e('svg', { className: 'tree-editor-svg', width: canvasWidth, height: canvasHeight, style: { width: `${canvasWidth / zoom}px`, height: `${canvasHeight / zoom}px`, transform: `scale(${zoom})`, transformOrigin: 'top left' } },
          renderedNodes.flatMap((node) => { const parent = node.parentId != null ? getNode(node.parentId) : null; if (!parent) return []; const points = edgePoints(parent, node); return e('line', { key: `${parent.id}-${node.id}`, x1: points.startX, y1: points.startY, x2: points.endX, y2: points.endY, stroke: node.value < parent.value ? '#60a5fa' : '#34d399', strokeWidth: 2, strokeDasharray: '6 4' }); }),
          renderedNodes.map((node) => e('circle', { key: `node-${node.id}`, cx: node.x, cy: node.y, r: 28, fill: node.id === activeId ? '#dc2626' : highlightedIds.includes(node.id) ? '#ffb54d' : node.id === root?.id ? '#2563eb' : '#3b82f6', stroke: '#dbeafe', strokeWidth: 2 }))
        ),
        renderedNodes.map((node) => e('div', { key: node.id, className: `tree-editor-node ${node.id === activeId ? 'tree-node-active' : ''} ${highlightedIds.includes(node.id) ? 'tree-node-visited' : ''}`, style: { left: `${node.x * zoom}px`, top: `${node.y * zoom}px`, transform: `translate(-50%, -50%) scale(${zoom})` }, onPointerDown: (event) => pointerDownNode(event, node.id), onPointerUp: pointerEnd, onPointerCancel: pointerEnd }, node.value))
      )
    )
  );
};
