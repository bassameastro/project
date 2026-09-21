import { ComplexityVisualizer } from '../../components/complexityVisualizer.js';
import { ArrayEditor } from '../../components/arrayEditor.js';
import { complexityFormulas } from '../../data/bigO.js';
import { TreeEditor } from '../../components/treeEditor.js';
import { ALGORITHMS, algorithmPseudocode } from '../../data/algorithmDefinitions.js';
import { layoutTreeNodes } from '../../logic/treeLayout.js';
import { buildSortTrace } from '../../logic/sorting.js';
import { buildArraySearchTrace, buildBinarySearchTrace, buildTreeSearchTrace, makeSnapshot } from '../../logic/search.js';

const e = React.createElement;
const { useState, useEffect, useMemo, useRef } = React;

export const algorithmTopicInfo = {
  title: 'Algorithms',
  summary: 'Visualize sorting and searching with live controls and Big O comparison charts.',
};

const generateArray = (size) => Array.from({ length: size }, () => Math.floor(Math.random() * 90) + 10);
const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

const createDfsTree = (values) => {
  const nodes = [];

  values.forEach((value, index) => {
    const parent = index === 0
      ? null
      : nodes[Math.floor(Math.random() * nodes.length)];

    nodes.push({
      id: index + 1,
      value,
      x: 0,
      y: 0,
      parentId: parent ? parent.id : null,
    });
  });

  return nodes;
};

export const AlgorithmSection = () => {
  const initialArray = generateArray(12);
  const [array, setArray] = useState(initialArray);
  const [speed, setSpeed] = useState(250);
  const [mode, setMode] = useState('sort');
  const [algorithm, setAlgorithm] = useState('selection');
  const [searchValue, setSearchValue] = useState('');
  const [message, setMessage] = useState('Pick an algorithm and press Play to start the visualization.');
  const [activeIndices, setActiveIndices] = useState([]);
  const [foundIndex, setFoundIndex] = useState(-1);
  const [activePseudocodeLine, setActivePseudocodeLine] = useState(-1);
  const [isRunning, setIsRunning] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [steps, setSteps] = useState([]);
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [visualType, setVisualType] = useState('bars');
  const [dfsNodes, setDfsNodes] = useState(() => createDfsTree(initialArray));
  const [dfsTool, setDfsTool] = useState('move');
  const [dfsValue, setDfsValue] = useState('25');
  const [dfsPendingEdgeSource, setDfsPendingEdgeSource] = useState(null);
  const [dfsZoom, setDfsZoom] = useState(1);
  const [dfsViewportSize, setDfsViewportSize] = useState({ width: 0, height: 440 });

  const pausedRef = useRef(false);
  const runningRef = useRef(false);
  const dfsDraggingRef = useRef(null);
  const dfsViewportRef = useRef(null);
  const dfsPointersRef = useRef(new Map());
  const dfsPinchDistanceRef = useRef(null);
  const dfsZoomRef = useRef(1);
  const nextDfsIdRef = useRef(initialArray.length + 1);

  const dfsTopologyKey = dfsNodes.map((node) => `${node.id}:${node.value}:${node.parentId ?? 'root'}`).join('|');

  useEffect(() => {
    dfsZoomRef.current = dfsZoom;
  }, [dfsZoom]);

  useEffect(() => {
    const viewport = dfsViewportRef.current;
    if (!viewport || typeof ResizeObserver === 'undefined') return undefined;

    const updateSize = () => {
      const bounds = viewport.getBoundingClientRect();
      setDfsViewportSize((previous) => {
        if (Math.round(previous.width) === Math.round(bounds.width)
          && Math.round(previous.height) === Math.round(bounds.height)) return previous;
        return { width: bounds.width, height: bounds.height };
      });
    };

    updateSize();
    const observer = new ResizeObserver(updateSize);
    observer.observe(viewport);
    return () => observer.disconnect();
  }, [mode, algorithm]);

  useEffect(() => {
    const width = dfsViewportSize.width || 640;
    const height = dfsViewportSize.height || 440;
    setDfsNodes((nodes) => layoutTreeNodes(nodes, width, height));
  }, [dfsTopologyKey, dfsViewportSize.width, dfsViewportSize.height]);

  useEffect(() => {
    const move = (event) => {
      const id = dfsDraggingRef.current;
      if (!id || !dfsViewportRef.current) return;
      const bounds = dfsViewportRef.current.getBoundingClientRect();
      const x = (event.clientX - bounds.left + dfsViewportRef.current.scrollLeft) / dfsZoomRef.current;
      const y = (event.clientY - bounds.top + dfsViewportRef.current.scrollTop) / dfsZoomRef.current;
      setDfsNodes((nodes) => nodes.map((node) => node.id === id ? { ...node, x, y } : node));
    };
    const stop = () => { dfsDraggingRef.current = null; };
    window.addEventListener('pointermove', move);
    window.addEventListener('pointerup', stop);
    window.addEventListener('pointercancel', stop);
    return () => {
      window.removeEventListener('pointermove', move);
      window.removeEventListener('pointerup', stop);
      window.removeEventListener('pointercancel', stop);
    };
  }, []);

  useEffect(() => {
    setAlgorithm(mode === 'sort' ? 'selection' : 'linear');
    setActiveIndices([]);
    setFoundIndex(-1);
    setActivePseudocodeLine(-1);
    setMessage('Pick an algorithm and press Play to start the visualization.');
  }, [mode]);

  useEffect(() => {
    setIsRunning(false);
    setIsPaused(false);
    pausedRef.current = false;
    runningRef.current = false;
  }, [algorithm, array, searchValue, dfsTopologyKey]);

  useEffect(() => {
    pausedRef.current = isPaused;
  }, [isPaused]);

  const generatedSteps = useMemo(() => {
    if (mode === 'search' && (algorithm === 'dfs' || algorithm === 'bfs')) {
      return buildTreeSearchTrace(algorithm, dfsNodes, searchValue);
    }
    if (algorithm === 'linear') return buildArraySearchTrace(array, searchValue);
    if (algorithm === 'binary') return buildBinarySearchTrace(array, searchValue);
    return buildSortTrace(algorithm, array);
  }, [mode, algorithm, array, searchValue, dfsTopologyKey]);

  useEffect(() => {
    setSteps(generatedSteps);
    setCurrentStepIndex(0);
  }, [generatedSteps]);

  const currentSnapshot = steps[currentStepIndex] || generatedSteps[0] || makeSnapshot({
    array,
    dfsNodes,
    activeIndices: [],
    foundIndex: -1,
    activePseudocodeLine: -1,
    message: 'Pick an algorithm and press Play to start the visualization.',
  });
  const displayedArray = currentSnapshot.array || array;
  const displayedDfsNodes = currentSnapshot.dfsNodes || dfsNodes;
  const displayedActiveIndices = currentSnapshot.activeIndices || [];
  const displayedFoundIndex = currentSnapshot.foundIndex ?? -1;
  const displayedPseudocodeLine = currentSnapshot.activePseudocodeLine ?? -1;
  const displayedMessage = currentSnapshot.message || message;
  const displayedCurrentNodeId = currentSnapshot.currentNodeId ?? null;
  const displayedVisitedIds = currentSnapshot.visitedIds || [];

  const getDfsNode = (id) => dfsNodes.find((node) => node.id === id) || null;
  const getDisplayedDfsNode = (id) => displayedDfsNodes.find((node) => node.id === id) || null;


  const getDfsPinchDistance = () => {
    const pointers = [...dfsPointersRef.current.values()];
    if (pointers.length < 2) return null;
    return Math.hypot(pointers[0].clientX - pointers[1].clientX, pointers[0].clientY - pointers[1].clientY);
  };

  const addDfsNodeAt = (x, y) => {
    const value = Number(dfsValue);
    if (Number.isNaN(value)) return;
    const id = nextDfsIdRef.current++;
    const parent = dfsNodes.reduce((closest, node) => {
      if (!closest) return node;
      const nodeDistance = Math.hypot(node.x - x, node.y - y);
      const closestDistance = Math.hypot(closest.x - x, closest.y - y);
      return nodeDistance < closestDistance ? node : closest;
    }, null);

    setDfsNodes((nodes) => [...nodes, { id, value, x, y, parentId: parent?.id ?? null }]);
  };

  const connectDfsNodes = (fromId, toId) => {
    const fromNode = getDfsNode(fromId);
    const toNode = getDfsNode(toId);
    if (fromId === toId || !fromNode || !toNode) return;

    if (toNode.parentId === null) {
      setMessage('Cannot attach the root beneath another node.');
      setDfsPendingEdgeSource(null);
      return;
    }

    let ancestorId = fromNode.parentId;
    while (ancestorId !== null && ancestorId !== undefined) {
      if (ancestorId === toId) {
        setMessage('Connection rejected: it would create a cycle.');
        setDfsPendingEdgeSource(null);
        return;
      }
      const ancestor = getDfsNode(ancestorId);
      ancestorId = ancestor ? ancestor.parentId : null;
    }

    setDfsNodes((nodes) => nodes.map((node) => node.id === toId ? { ...node, parentId: fromId } : node));
    setDfsPendingEdgeSource(null);
  };

  const deleteDfsNode = (id) => {
    const remove = new Set([id]);
    let changed = true;
    while (changed) {
      changed = false;
      dfsNodes.forEach((node) => {
        if (remove.has(node.parentId) && !remove.has(node.id)) {
          remove.add(node.id);
          changed = true;
        }
      });
    }
    setDfsNodes((nodes) => nodes.filter((node) => !remove.has(node.id)));
    setDfsPendingEdgeSource(null);
  };

  const randomizeDfsTree = () => {
    const values = generateArray(10);
    const generated = createDfsTree(values);
    const layoutWidth = dfsViewportSize.width || 640;
    const layoutHeight = dfsViewportSize.height || 440;
    nextDfsIdRef.current = generated.length + 1;
    setDfsNodes(layoutTreeNodes(generated, layoutWidth, layoutHeight));
    setActiveIndices([]);
    setFoundIndex(-1);
  };

  const makeComparisonSeries = (maxN = 40) => {
    const ns = Array.from({ length: maxN }, (_, i) => i + 1);
    return ALGORITHMS[mode].map((item) => {
      const fn = complexityFormulas[item.bigO] || ((n) => n);
      return { label: item.label, bigO: item.bigO, values: ns.map((n) => fn(n)), ns };
    });
  };

  const renderVisualContent = () => {
    if (mode === 'search' && (algorithm === 'dfs' || algorithm === 'bfs')) {
      return e(TreeEditor, {
        initialNodes: dfsNodes,
        editable: true,
        activeId: displayedCurrentNodeId,
        highlightedIds: displayedVisitedIds,
        onNodesChange: (nodes) => setDfsNodes(nodes),
      });
      /*
      const baseCanvasWidth = Math.max(dfsViewportSize.width || 640, 280);
      const baseCanvasHeight = Math.max(dfsViewportSize.height || 440, 280);
      const canvasWidth = baseCanvasWidth * dfsZoom;
      const canvasHeight = baseCanvasHeight * dfsZoom;
      const pointerDown = (event, nodeId) => {
        if (event.pointerType === 'touch') {
          dfsPointersRef.current.set(event.pointerId, event);
          if (dfsPointersRef.current.size === 2) {
            // second finger landed: switch to pinch-zoom, cancel any single-finger drag
            dfsPinchDistanceRef.current = getDfsPinchDistance();
            dfsDraggingRef.current = null;
            return;
          }
          // single finger: fall through so move/edge/delete still work on touch
        }
        if (dfsTool === 'delete') return deleteDfsNode(nodeId);
        if (dfsTool === 'edge') {
          if (dfsPendingEdgeSource === null) setDfsPendingEdgeSource(nodeId);
          else connectDfsNodes(dfsPendingEdgeSource, nodeId);
          return;
        }
        if (dfsTool === 'move') dfsDraggingRef.current = nodeId;
      };
      const pointerMove = (event) => {
        if (event.pointerType === 'touch') {
          dfsPointersRef.current.set(event.pointerId, event);
          const nextDistance = getDfsPinchDistance();
          if (nextDistance && dfsPinchDistanceRef.current) {
            setDfsZoom((zoom) => Math.min(2, Math.max(0.7, zoom * nextDistance / dfsPinchDistanceRef.current)));
            dfsPinchDistanceRef.current = nextDistance;
            event.preventDefault();
          }
        }
      };
      const pointerEnd = (event) => {
        dfsPointersRef.current.delete(event.pointerId);
        if (dfsPointersRef.current.size < 2) dfsPinchDistanceRef.current = null;
        dfsDraggingRef.current = null;
      };
      const root = displayedDfsNodes.find((node) => node.parentId === null);

      return e('div', { className: 'dfs-tree-editor' },
        e('div', { className: 'dfs-tree-toolbar' },
          ['move', 'node', 'edge', 'delete'].map((tool) => e('button', {
            key: tool,
            className: `tree-tool-button ${dfsTool === tool ? 'active' : ''}`,
            onClick: () => setDfsTool(tool)
          }, tool === 'node' ? 'Add Node' : tool === 'edge' ? 'Connect' : tool[0].toUpperCase() + tool.slice(1))),
          e('button', { className: 'tree-tool-button accent', onClick: () => { setDfsNodes([]); setDfsPendingEdgeSource(null); } }, 'Clear'),
          e('button', { className: 'tree-tool-button accent', onClick: randomizeDfsTree }, 'Random Tree'),
          e('input', { className: 'tree-input', type: 'number', value: dfsValue, onChange: (event) => setDfsValue(event.target.value) })
        ),
        e('div', {
          className: 'dfs-tree-viewport',
          ref: dfsViewportRef,
          onPointerMove: pointerMove,
          onPointerUp: pointerEnd,
          onPointerCancel: pointerEnd,
          onPointerDown: (event) => {
            if (event.pointerType === 'touch') dfsPointersRef.current.set(event.pointerId, event);
            if (dfsTool === 'node' && !event.target.closest('g')) {
              const bounds = dfsViewportRef.current.getBoundingClientRect();
              const x = (event.clientX - bounds.left + dfsViewportRef.current.scrollLeft) / dfsZoomRef.current;
              const y = (event.clientY - bounds.top + dfsViewportRef.current.scrollTop) / dfsZoomRef.current;
              addDfsNodeAt(x, y);
            }
          }
        },
          e('div', { className: 'tree-editor-canvas', style: { width: `${canvasWidth}px`, height: `${canvasHeight}px` } },
            e('svg', { className: 'tree-editor-svg', width: canvasWidth, height: canvasHeight, style: { width: `${canvasWidth / dfsZoom}px`, height: `${canvasHeight / dfsZoom}px`, transform: `scale(${dfsZoom})`, transformOrigin: 'top left' } },
              displayedDfsNodes.map((node) => {
                const parent = getDisplayedDfsNode(node.parentId);
                return parent && e('line', { key: `dfs-edge-${node.id}`, x1: parent.x, y1: parent.y, x2: node.x, y2: node.y, stroke: '#94a3b8', strokeWidth: 2 });
              }),
              displayedDfsNodes.map((node, index) => e('g', { key: node.id, onPointerDown: (event) => { event.stopPropagation(); pointerDown(event, node.id); }, style: { cursor: 'pointer' } },
                e('circle', { cx: node.x, cy: node.y, r: 25, fill: displayedFoundIndex === index ? '#6fffa3' : displayedActiveIndices.includes(index) ? '#ffb54d' : '#3b82f6', stroke: '#dbeafe', strokeWidth: 2 }),
                e('text', { x: node.x, y: node.y + 4, fill: '#fff', textAnchor: 'middle', fontSize: 13, fontWeight: 700 }, String(node.value)),
                e('title', null, `DFS node ${node.value}`)
              ))
            )
          )
        )
      );
      */
    }

    if (visualType === 'pie' || visualType === 'donut') {
      const center = 120;
      const radius = 92;
      const innerRadius = visualType === 'donut' ? 58 : 0;
      const total = displayedArray.reduce((sum, value) => sum + Math.max(Math.abs(value), 1), 0) || 1;
      let startAngle = 0;
      const colors = ['#58a6ff', '#7b7dff', '#4dd0e1', '#ff8b6b', '#ffd86b', '#9be46a'];

      const polarToCartesian = (cx, cy, r, angle) => {
        const radians = (angle - 90) * (Math.PI / 180);
        return {
          x: cx + r * Math.cos(radians),
          y: cy + r * Math.sin(radians),
        };
      };

      const describeSlice = (cx, cy, outerR, innerRValue, start, end) => {
        let finalEnd = end;
        const sweep = end - start;
        if (sweep >= 359.99) {
          finalEnd = start + 359.99;
        }

        const startOuter = polarToCartesian(cx, cy, outerR, start);
        const endOuter = polarToCartesian(cx, cy, outerR, finalEnd);
        const startInner = polarToCartesian(cx, cy, innerRValue, finalEnd);
        const endInner = polarToCartesian(cx, cy, innerRValue, start);
        const largeArcFlag = finalEnd - start <= 180 ? 0 : 1;

        if (innerRValue === 0) {
          return `M ${cx} ${cy} L ${startOuter.x} ${startOuter.y} A ${outerR} ${outerR} 0 ${largeArcFlag} 1 ${endOuter.x} ${endOuter.y} Z`;
        }

        return [
          `M ${startOuter.x} ${startOuter.y}`,
          `A ${outerR} ${outerR} 0 ${largeArcFlag} 1 ${endOuter.x} ${endOuter.y}`,
          `L ${startInner.x} ${startInner.y}`,
          `A ${innerRValue} ${innerRValue} 0 ${largeArcFlag} 0 ${endInner.x} ${endInner.y}`,
          'Z',
        ].join(' ');
      };

      return e('div', { className: 'visual-area circular' },
        e('svg', { viewBox: '0 0 240 240', className: 'chart-svg' },
          displayedArray.map((value, index) => {
            const safeValue = Math.max(Math.abs(value), 1);
            const angle = (safeValue / total) * 360;
            const endAngle = startAngle + angle;
            const midAngle = startAngle + angle / 2;
            const color = displayedActiveIndices.includes(index)
              ? '#ffb54d'
              : displayedFoundIndex === index
                ? '#6fffa3'
                : colors[index % colors.length];
            const path = describeSlice(center, center, radius, innerRadius, startAngle, endAngle);
            const labelPos = polarToCartesian(center, center, innerRadius + (radius - innerRadius) / 2, midAngle);
            startAngle = endAngle;

            return e('g', { key: `${value}-${index}` },
              e('path', {
                d: path,
                fill: color,
                stroke: 'rgba(255,255,255,0.16)',
                strokeWidth: 1.2,
              }),
              angle > 24 && e('text', {
                x: labelPos.x,
                y: labelPos.y,
                fill: '#fff',
                textAnchor: 'middle',
                dominantBaseline: 'middle',
                fontSize: 11,
                fontWeight: 700,
              }, String(value))
            );
          })
        ),
        e('div', { className: 'chart-center-label' },
          e('strong', null, displayedArray.length ? displayedArray.reduce((sum, value) => sum + value, 0) : 0),
          e('span', null, 'Total')
        )
      );
    }

    return e(ArrayEditor, {
      items: array,
      displayItems: displayedArray,
      editable: !(isRunning && !isPaused),
      activeIndices: displayedActiveIndices,
      foundIndex: displayedFoundIndex,
      onItemsChange: (next) => {
        setArray(next);
        setActiveIndices([]);
        setFoundIndex(-1);
      },
      onMessageChange: setMessage,
      variant: 'bars',
    });
  };

  const renderComplexityChart = () => {
    const series = makeComparisonSeries(40);
    const svgW = 640;
    const svgH = 220;
    const margin = 28;
    const allValues = series.flatMap((s) => s.values);
    const maxVal = Math.max(...allValues) || 1;

    const scaleX = (i, len) => margin + (i / Math.max(len - 1, 1)) * (svgW - margin * 2);
    const scaleY = (v) => svgH - margin - (v / maxVal) * (svgH - margin * 2);
    const colors = ['#7b7dff', '#ff8b6b', '#4dd0e1', '#ffd86b', '#9be46a'];

    return e('div', { className: 'complexity-chart' },
      e('svg', { viewBox: `0 0 ${svgW} ${svgH}`, preserveAspectRatio: 'xMidYMid meet', width: '100%', height: svgH },
        e('line', { x1: margin, y1: margin, x2: margin, y2: svgH - margin, stroke: 'rgba(255,255,255,0.08)' }),
        e('line', { x1: margin, y1: svgH - margin, x2: svgW - margin, y2: svgH - margin, stroke: 'rgba(255,255,255,0.08)' }),
        series[0].ns.map((n, i) => i % 9 === 0 ? e('g', { key: `tick-${i}` },
          e('line', { x1: scaleX(i, series[0].ns.length), y1: svgH - margin, x2: scaleX(i, series[0].ns.length), y2: margin, stroke: 'rgba(255,255,255,0.03)' }),
          e('text', { x: scaleX(i, series[0].ns.length), y: svgH - 6, fill: 'rgba(255,255,255,0.6)', fontSize: 10, textAnchor: 'middle' }, String(n))
        ) : null),
        series.map((s, idx) => {
          const len = s.values.length;
          const d = s.values.map((v, i) => `${i === 0 ? 'M' : 'L'} ${scaleX(i, len)} ${scaleY(v)}`).join(' ');
          return e('path', { key: s.label, d, stroke: colors[idx % colors.length], fill: 'none', strokeWidth: 2.4, strokeLinecap: 'round' });
        })
      ),
      e('div', { className: 'complexity-legend' }, series.map((s, i) => e('div', { key: s.label, className: 'legend-item' },
        e('span', { className: 'legend-swatch', style: { background: colors[i % colors.length] } }),
        e('span', { className: 'legend-text' }, `${s.label} (${s.bigO})`)
      )))
    );
  };

  useEffect(() => {
    if (!isRunning || isPaused) return undefined;
    if (currentStepIndex >= steps.length - 1) {
      setIsRunning(false);
      runningRef.current = false;
      return undefined;
    }
    const timer = window.setTimeout(() => setCurrentStepIndex((index) => Math.min(index + 1, steps.length - 1)), speed);
    return () => window.clearTimeout(timer);
  }, [isRunning, isPaused, currentStepIndex, steps.length, speed]);

  const handlePlayPause = () => {
    if (isRunning) {
      setIsPaused((paused) => {
        pausedRef.current = !paused;
        return !paused;
      });
      return;
    }
    if (currentStepIndex >= steps.length - 1) setCurrentStepIndex(0);
    runningRef.current = true;
    pausedRef.current = false;
    setIsPaused(false);
    setIsRunning(true);
  };

  const stepTo = (nextIndex) => {
    runningRef.current = false;
    pausedRef.current = true;
    setIsRunning(false);
    setIsPaused(true);
    setCurrentStepIndex(Math.max(0, Math.min(nextIndex, Math.max(steps.length - 1, 0))));
  };

  const handleStepBackward = () => stepTo(currentStepIndex - 1);
  const handleStepForward = () => stepTo(currentStepIndex + 1);

  const statSection = (title, content) => e('div', { className: 'stat' }, e('strong', null, title), content);
  const actionLabel = !isRunning ? 'Play' : isPaused ? 'Play' : 'Pause';
  const isTreeSearch = mode === 'search' && (algorithm === 'dfs' || algorithm === 'bfs');
  const visualControl = isTreeSearch ? null : e('label', null, 'Visual', e('select', {
    value: visualType,
    onChange: (event) => setVisualType(event.target.value),
  },
    e('option', { value: 'bars' }, 'Bar Chart'),
    e('option', { value: 'pie' }, 'Pie Chart'),
    e('option', { value: 'donut' }, 'Donut Chart')
  ));
  const pseudocode = algorithmPseudocode[algorithm] || [];

  return e('div', { className: 'algorithm-layout' },
    e('div', { className: 'algorithm-controls-panel' },
      e('div', { className: 'card control-card' },
        e('div', { className: 'controls' },
          e('label', null, 'Mode', e('select', {
            value: mode,
            disabled: isRunning && !isPaused,
            onChange: (e) => setMode(e.target.value),
          },
            e('option', { key: 'sort', value: 'sort' }, 'Sorting'),
            e('option', { key: 'search', value: 'search' }, 'Searching')
          )),
          e('label', null, 'Algorithm', e('select', {
            value: algorithm,
            disabled: isRunning && !isPaused,
            onChange: (e) => setAlgorithm(e.target.value),
          }, ALGORITHMS[mode].map((item) => e('option', { key: item.key, value: item.key }, item.label)))),
          e('label', null, 'Speed (ms)', e('input', {
            type: 'number', min: 50, max: 800,
            value: speed,
            disabled: isRunning && !isPaused,
            onChange: (e) => setSpeed(Number(e.target.value)),
          })),
          mode === 'search' && e('label', null, 'Search value', e('input', {
            type: 'text',
            value: searchValue,
            disabled: isRunning && !isPaused,
            placeholder: 'Enter number to find',
            onChange: (e) => setSearchValue(e.target.value),
          }))
        ),
        e('div', { className: 'button-row' },
          e('button', { className: 'primary', onClick: handlePlayPause }, actionLabel),
          e('button', { onClick: handleStepBackward, disabled: currentStepIndex === 0 || steps.length === 0 }, '‹ Step Back'),
          e('button', { onClick: handleStepForward, disabled: currentStepIndex >= steps.length - 1 || steps.length === 0 }, 'Step Forward ›'),
        ),
        e('div', { className: 'stats' },
          statSection('Active algorithm', ALGORITHMS[mode].find((item) => item.key === algorithm)?.label),
          statSection('Big O', ALGORITHMS[mode].find((item) => item.key === algorithm)?.bigO),
          statSection('Current mode', mode === 'sort' ? 'Sorting' : 'Searching'),
          statSection('Status', displayedMessage),
          statSection('Step', `Step ${Math.min(currentStepIndex + 1, Math.max(steps.length, 1))} / ${Math.max(steps.length, 1)}`)
        )
      )
    ),
    e('div', { className: 'algorithm-visual-panel' },
      e('div', { className: 'card visual-card' },
        renderVisualContent(),
        e('div', { className: 'algorithm-pseudocode-panel' },
          e('div', { className: 'algorithm-pseudocode-title' }, `${ALGORITHMS[mode].find((item) => item.key === algorithm)?.label || 'Algorithm'} pseudocode`),
          e('pre', { className: 'algorithm-pseudocode-code' },
            pseudocode.map((line, index) => e('div', {
              key: `${algorithm}-step-${index}`,
              className: `algorithm-pseudocode-line ${displayedPseudocodeLine === index ? 'active' : ''}`
            },
              e('span', { className: 'algorithm-pseudocode-number' }, String(index + 1).padStart(2, '0')),
              e('span', null, line)
            ))
          )
        ),
         e('div', { className: 'algorithm-complexity-panel' },
      e(ComplexityVisualizer, {
        algorithmLabel: `${ALGORITHMS[mode].find((item) => item.key === algorithm)?.label || 'Algorithm'} Big O Complexity Growth Visualizer`,
        highlightedComplexity: ALGORITHMS[mode].find((item) => item.key === algorithm)?.bigO,
      })
    )
      )
    )
  );
};