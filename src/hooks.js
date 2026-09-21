const { useState, useEffect, useRef } = React;

export const useResizeObserver = (ref) => {
  const [size, setSize] = useState({ width: 0, height: 0 });

  useEffect(() => {
    const element = ref.current;
    if (!element || typeof ResizeObserver === 'undefined') return undefined;
    const update = () => {
      const bounds = element.getBoundingClientRect();
      setSize((previous) => Math.round(previous.width) === Math.round(bounds.width)
        && Math.round(previous.height) === Math.round(bounds.height)
        ? previous
        : { width: bounds.width, height: bounds.height });
    };
    update();
    const observer = new ResizeObserver(update);
    observer.observe(element);
    return () => observer.disconnect();
  }, [ref]);

  return size;
};

export const usePinchZoom = (min = 0.7, max = 2) => {
  const [zoom, setZoom] = useState(1);
  const pointersRef = useRef(new Map());
  const distanceRef = useRef(null);

  const distance = () => {
    const pointers = [...pointersRef.current.values()];
    return pointers.length < 2 ? null : Math.hypot(
      pointers[0].clientX - pointers[1].clientX,
      pointers[0].clientY - pointers[1].clientY
    );
  };

  const onPointerDown = (event) => {
    if (event.pointerType !== 'touch') return;
    pointersRef.current.set(event.pointerId, event);
    if (pointersRef.current.size === 2) distanceRef.current = distance();
  };
  const onPointerMove = (event) => {
    if (event.pointerType !== 'touch') return;
    pointersRef.current.set(event.pointerId, event);
    const nextDistance = distance();
    if (!nextDistance || !distanceRef.current) return;
    setZoom((value) => Math.min(max, Math.max(min, value * nextDistance / distanceRef.current)));
    distanceRef.current = nextDistance;
    event.preventDefault();
  };
  const onPointerEnd = (event) => {
    pointersRef.current.delete(event.pointerId);
    if (pointersRef.current.size < 2) distanceRef.current = null;
  };

  return { zoom, setZoom, handlers: { onPointerDown, onPointerMove, onPointerUp: onPointerEnd, onPointerCancel: onPointerEnd } };
};

export const useNodeDrag = (onMove, enabled = true) => {
  const draggingIdRef = useRef(null);
  const [draggingId, setDraggingId] = useState(null);

  useEffect(() => {
    const move = (event) => {
      if (!enabled || draggingIdRef.current === null) return;
      onMove(draggingIdRef.current, event);
    };
    const stop = () => {
      draggingIdRef.current = null;
      setDraggingId(null);
    };
    window.addEventListener('pointermove', move);
    window.addEventListener('pointerup', stop);
    window.addEventListener('pointercancel', stop);
    return () => {
      window.removeEventListener('pointermove', move);
      window.removeEventListener('pointerup', stop);
      window.removeEventListener('pointercancel', stop);
    };
  }, [enabled, onMove]);

  const startDrag = (id) => {
    if (!enabled) return;
    draggingIdRef.current = id;
    setDraggingId(id);
  };
  return { draggingId, startDrag };
};
