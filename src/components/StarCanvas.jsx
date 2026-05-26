import { useRef } from 'react';
import { useStarCanvas } from '../hooks/useStarCanvas';

export default function StarCanvas() {
  const ref = useRef(null);
  useStarCanvas(ref);
  return (
    <canvas
      ref={ref}
      className="fixed inset-0 w-full h-full pointer-events-none z-0"
    />
  );
}
