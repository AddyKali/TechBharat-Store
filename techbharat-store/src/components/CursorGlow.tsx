import { useEffect, useRef } from "react";

interface Node {
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
  baseAlpha: number;
}

/**
 * Interactive neural network canvas — nodes drift slowly,
 * lines connect nearby nodes. Nodes near cursor grow brighter
 * and get attracted slightly toward cursor. Pure canvas, no DOM spam.
 */
const CursorGlow = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const mouse = useRef({ x: -9999, y: -9999 });
  const nodesRef = useRef<Node[]>([]);
  const frameRef = useRef<number>(0);
  const dpr = typeof window !== "undefined" ? Math.min(window.devicePixelRatio || 1, 2) : 1;

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const resize = () => {
      canvas.width = window.innerWidth * dpr;
      canvas.height = window.innerHeight * dpr;
      canvas.style.width = `${window.innerWidth}px`;
      canvas.style.height = `${window.innerHeight}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    resize();

    // Create nodes
    const NODE_COUNT = 35;
    const CONNECTION_DIST = 120;
    const CURSOR_RANGE = 180;

    const createNodes = (): Node[] => {
      const w = window.innerWidth;
      const h = window.innerHeight;
      return Array.from({ length: NODE_COUNT }, () => ({
        x: Math.random() * w,
        y: Math.random() * h,
        vx: (Math.random() - 0.5) * 0.3,
        vy: (Math.random() - 0.5) * 0.3,
        radius: Math.random() * 1.2 + 0.5,
        baseAlpha: Math.random() * 0.15 + 0.05,
      }));
    };
    nodesRef.current = createNodes();

    const onMove = (e: MouseEvent) => {
      mouse.current = { x: e.clientX, y: e.clientY };
    };
    const onLeave = () => {
      mouse.current = { x: -9999, y: -9999 };
    };

    const animate = () => {
      const w = window.innerWidth;
      const h = window.innerHeight;
      ctx.clearRect(0, 0, w, h);

      const mx = mouse.current.x;
      const my = mouse.current.y;
      const nodes = nodesRef.current;

      // Update + draw nodes
      for (const node of nodes) {
        // Drift
        node.x += node.vx;
        node.y += node.vy;

        // Wrap around edges
        if (node.x < -10) node.x = w + 10;
        if (node.x > w + 10) node.x = -10;
        if (node.y < -10) node.y = h + 10;
        if (node.y > h + 10) node.y = -10;

        // Cursor attraction
        const dx = mx - node.x;
        const dy = my - node.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        const inRange = dist < CURSOR_RANGE;

        if (inRange && dist > 1) {
          const force = 0.015 * (1 - dist / CURSOR_RANGE);
          node.vx += (dx / dist) * force;
          node.vy += (dy / dist) * force;
        }

        // Damping
        node.vx *= 0.995;
        node.vy *= 0.995;

        // Draw node
        const glow = inRange ? 1 - dist / CURSOR_RANGE : 0;
        const alpha = node.baseAlpha + glow * 0.4;
        const r = node.radius + glow * 2;

        ctx.beginPath();
        ctx.arc(node.x, node.y, r, 0, Math.PI * 2);
        ctx.fillStyle = `hsla(28, 95%, 55%, ${alpha})`;
        ctx.fill();

        // Outer glow for cursor-near nodes
        if (glow > 0.5) {
          ctx.beginPath();
          ctx.arc(node.x, node.y, r + 3, 0, Math.PI * 2);
          ctx.fillStyle = `hsla(28, 95%, 55%, ${glow * 0.08})`;
          ctx.fill();
        }
      }

      // Draw connections
      for (let i = 0; i < nodes.length; i++) {
        for (let j = i + 1; j < nodes.length; j++) {
          const a = nodes[i];
          const b = nodes[j];
          const dx = a.x - b.x;
          const dy = a.y - b.y;
          const dist = Math.sqrt(dx * dx + dy * dy);

          if (dist < CONNECTION_DIST) {
            const lineDist = 1 - dist / CONNECTION_DIST;
            // Check if either node near cursor
            const aDist = Math.sqrt((mx - a.x) ** 2 + (my - a.y) ** 2);
            const bDist = Math.sqrt((mx - b.x) ** 2 + (my - b.y) ** 2);
            const nearCursor = Math.min(aDist, bDist) < CURSOR_RANGE;
            const lineAlpha = nearCursor
              ? lineDist * 0.2
              : lineDist * 0.04;

            ctx.beginPath();
            ctx.moveTo(a.x, a.y);
            ctx.lineTo(b.x, b.y);
            ctx.strokeStyle = `hsla(28, 70%, 55%, ${lineAlpha})`;
            ctx.lineWidth = nearCursor ? 0.8 : 0.3;
            ctx.stroke();
          }
        }
      }

      // Cursor glow orb
      if (mx > -1000) {
        const gradient = ctx.createRadialGradient(mx, my, 0, mx, my, 90);
        gradient.addColorStop(0, "hsla(28, 95%, 50%, 0.03)");
        gradient.addColorStop(1, "hsla(28, 95%, 50%, 0)");
        ctx.beginPath();
        ctx.arc(mx, my, 90, 0, Math.PI * 2);
        ctx.fillStyle = gradient;
        ctx.fill();
      }

      frameRef.current = requestAnimationFrame(animate);
    };

    window.addEventListener("mousemove", onMove, { passive: true });
    window.addEventListener("mouseleave", onLeave);
    window.addEventListener("resize", resize);
    frameRef.current = requestAnimationFrame(animate);

    return () => {
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("mouseleave", onLeave);
      window.removeEventListener("resize", resize);
      cancelAnimationFrame(frameRef.current);
    };
  }, [dpr]);

  return (
    <canvas
      ref={canvasRef}
      className="neuron-canvas"
      aria-hidden="true"
    />
  );
};

export default CursorGlow;
