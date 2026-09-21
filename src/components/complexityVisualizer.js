import { COMPLEXITIES, factorialBig, formatMetricValue } from '../data/bigO.js';

const e = React.createElement;
const { useState, useEffect, useRef } = React;

export const ComplexityVisualizer = ({ algorithmLabel = 'Big O Complexity Growth Visualizer', highlightedComplexity }) => {
  const [n, setN] = useState(10);
  const canvasRef = useRef(null);
  const complexities = COMPLEXITIES;

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const context = canvas.getContext('2d');
    const width = canvas.width;
    const height = canvas.height;
    const padding = 40;
    const graphWidth = width - padding * 2;
    const graphHeight = height - padding * 2;
    const maxX = Math.max(10, n);
    const cssValue = (name, fallback) => getComputedStyle(document.documentElement).getPropertyValue(name).trim() || fallback;
    const logValue = (complexity, value) => {
      const raw = complexity.name === 'O(n!)' ? factorialBig(value) : complexity.formula(value);
      return typeof raw === 'bigint' ? Math.log10(Number(raw.toString().slice(0, 12))) : Math.log10(Math.max(raw, 1));
    };
    const maxY = Math.max(...complexities.map((complexity) => logValue(complexity, maxX)), 1);

    context.clearRect(0, 0, width, height);
    context.fillStyle = cssValue('--surface', '#ffffff');
    context.fillRect(0, 0, width, height);
    context.strokeStyle = cssValue('--border', '#ddd');
    context.lineWidth = 1;
    context.beginPath();
    context.moveTo(padding, height - padding);
    context.lineTo(width - padding, height - padding);
    context.moveTo(padding, height - padding);
    context.lineTo(padding, padding);
    context.stroke();
    context.font = '12px Arial';
    context.fillStyle = cssValue('--text', '#333');

    const xStep = Math.ceil(maxX / 5);
    for (let value = 0; value <= maxX; value += xStep) {
      const x = padding + (value / maxX) * graphWidth;
      context.fillText(String(value), x, height - padding + 20);
    }

    complexities.forEach((complexity) => {
      context.strokeStyle = complexity.color;
      context.lineWidth = 2;
      context.beginPath();
      for (let value = 1; value <= maxX; value++) {
        const x = padding + (value / maxX) * graphWidth;
        const y = height - padding - (logValue(complexity, value) / maxY) * graphHeight;
        if (value === 1) context.moveTo(x, y);
        else context.lineTo(x, y);
      }
      context.stroke();
    });
  }, [n]);

  return e('div', { className: 'complexity-visualizer' },
    e('h3', null, algorithmLabel),
    e('div', { className: 'complexity-slider-container' },
      e('label', null, `Input Size (n): ${n}`),
      e('input', { type: 'range', min: 1, max: 100, value: n, onChange: (event) => setN(Number(event.target.value)), className: 'complexity-slider' })
    ),
    e('div', { className: 'complexity-chart-container' },
      e('canvas', { ref: canvasRef, width: 700, height: 350, className: 'complexity-canvas' }),
      e('div', { className: 'complexity-tooltip', style: { display: 'none' } })
    ),
    e('div', { className: 'complexity-metrics' },
      e('h4', null, `Operation Counts at n = ${n}`),
      e('div', { className: 'metrics-grid' }, complexities.map((complexity) => {
        return e('div', {
          key: complexity.name,
          className: 'metric-card home-metric-card',
          style: { '--complexity-color': complexity.color, backgroundColor: `${complexity.color}18` },
        },
          e('div', { className: 'metric-name', style: { borderLeftColor: complexity.color } }, complexity.name),
          e('div', { className: 'metric-value' }, formatMetricValue(complexity.name === 'O(n!)' ? factorialBig(n) : complexity.formula(n)))
        );
      }))
    )
  );
};
