import React, { useEffect, useRef, useState } from 'react';

interface TrailParticle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  alpha: number;
  color: string;
}

interface AmbientNode {
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
  alpha: number;
  color: string;
}

export const PurpleGradientMouse: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [isHoveringClickable, setIsHoveringClickable] = useState(false);
  const [isMouseDown, setIsMouseDown] = useState(false);
  const [isVisible, setIsVisible] = useState(false);

  // Position references for 60-120fps smooth interpolation without React state lag
  const mouseRef = useRef({
    targetX: -1000,
    targetY: -1000,
    currentX: -1000,
    currentY: -1000,
    prevX: -1000,
    prevY: -1000,
    ringX: -1000,
    ringY: -1000,
    speed: 0,
  });

  const cursorRingRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    // Initial center position until first mouse movement
    mouseRef.current.targetX = width / 2;
    mouseRef.current.targetY = height / 3;
    mouseRef.current.currentX = width / 2;
    mouseRef.current.currentY = height / 3;
    mouseRef.current.ringX = width / 2;
    mouseRef.current.ringY = height / 3;

    const handleResize = () => {
      if (!canvas) return;
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };
    window.addEventListener('resize', handleResize);

    // Purple palette for gradient lighting and stardust particles
    const purpleColors = [
      '#f3e8ff', // purple-100 (bright spark)
      '#e9d5ff', // purple-200
      '#d8b4fe', // purple-300
      '#c084fc', // purple-400
      '#a855f7', // purple-500
      '#9333ea', // purple-600
      '#7c3aed', // violet-600
    ];

    // Ambient floating background nodes in purple hues
    const nodeCount = Math.min(width > 768 ? 45 : 22, 55);
    const ambientNodes: AmbientNode[] = Array.from({ length: nodeCount }, () => ({
      x: Math.random() * width,
      y: Math.random() * height,
      vx: (Math.random() - 0.5) * 0.45,
      vy: (Math.random() - 0.5) * 0.45,
      radius: Math.random() * 2 + 0.8,
      alpha: Math.random() * 0.35 + 0.15,
      color: purpleColors[Math.floor(Math.random() * purpleColors.length)],
    }));

    // Particle spark trails
    const trailParticles: TrailParticle[] = [];

    const handleMouseMove = (e: MouseEvent) => {
      setIsVisible(true);
      const m = mouseRef.current;
      m.targetX = e.clientX;
      m.targetY = e.clientY;

      // Calculate movement delta
      const dx = m.targetX - m.prevX;
      const dy = m.targetY - m.prevY;
      m.speed = Math.sqrt(dx * dx + dy * dy);
      m.prevX = m.targetX;
      m.prevY = m.targetY;

      // Spawn ephemeral purple stardust sparks on mouse movement
      if (m.speed > 2 && trailParticles.length < 50) {
        const count = Math.min(Math.floor(m.speed / 8) + 1, 3);
        for (let i = 0; i < count; i++) {
          trailParticles.push({
            x: m.targetX + (Math.random() - 0.5) * 16,
            y: m.targetY + (Math.random() - 0.5) * 16,
            vx: (Math.random() - 0.5) * 1.5 - dx * 0.08,
            vy: (Math.random() - 0.5) * 1.5 - dy * 0.08,
            size: Math.random() * 2.8 + 1,
            alpha: 0.8,
            color: purpleColors[Math.floor(Math.random() * purpleColors.length)],
          });
        }
      }

      // Check if hovering clickable elements to morph cursor halo
      const target = e.target as HTMLElement | null;
      if (target) {
        const isClickable =
          target.tagName === 'BUTTON' ||
          target.tagName === 'A' ||
          target.tagName === 'INPUT' ||
          target.tagName === 'SELECT' ||
          target.tagName === 'TEXTAREA' ||
          target.closest('button') !== null ||
          target.closest('a') !== null ||
          target.getAttribute('role') === 'button';
        setIsHoveringClickable(isClickable);
      }
    };

    const handleMouseDown = () => {
      setIsMouseDown(true);
      // Spawn ripple spark burst
      const m = mouseRef.current;
      for (let i = 0; i < 12; i++) {
        const angle = (Math.PI * 2 * i) / 12 + Math.random() * 0.3;
        const speed = Math.random() * 3 + 1.5;
        trailParticles.push({
          x: m.targetX,
          y: m.targetY,
          vx: Math.cos(angle) * speed,
          vy: Math.sin(angle) * speed,
          size: Math.random() * 3 + 1.5,
          alpha: 1,
          color: purpleColors[Math.floor(Math.random() * purpleColors.length)],
        });
      }
    };

    const handleMouseUp = () => setIsMouseDown(false);
    const handleMouseLeave = () => setIsVisible(false);
    const handleMouseEnter = () => setIsVisible(true);

    window.addEventListener('mousemove', handleMouseMove, { passive: true });
    window.addEventListener('mousedown', handleMouseDown);
    window.addEventListener('mouseup', handleMouseUp);
    document.addEventListener('mouseleave', handleMouseLeave);
    document.addEventListener('mouseenter', handleMouseEnter);

    // Main animation loop
    const render = () => {
      ctx.clearRect(0, 0, width, height);

      const m = mouseRef.current;
      // Fluid linear interpolation (damping) for spotlight and ring
      m.currentX += (m.targetX - m.currentX) * 0.12;
      m.currentY += (m.targetY - m.currentY) * 0.12;

      m.ringX += (m.targetX - m.ringX) * 0.22;
      m.ringY += (m.targetY - m.ringY) * 0.22;

      // Update cursor ring DOM element position directly
      if (cursorRingRef.current) {
        cursorRingRef.current.style.transform = `translate3d(${m.ringX}px, ${m.ringY}px, 0)`;
      }

      const curX = m.currentX;
      const curY = m.currentY;

      // 1. MASTER PURPLE GRADIENT SPOTLIGHT (Multi-layer Radial Glow)
      // Layer A: Massive deep ambient purple glow (650px radius)
      const ambientGlow = ctx.createRadialGradient(curX, curY, 0, curX, curY, 550);
      ambientGlow.addColorStop(0, 'rgba(168, 85, 247, 0.24)'); // Vibrant Purple-500
      ambientGlow.addColorStop(0.25, 'rgba(147, 51, 234, 0.15)'); // Purple-600
      ambientGlow.addColorStop(0.5, 'rgba(126, 34, 206, 0.08)'); // Purple-700
      ambientGlow.addColorStop(0.75, 'rgba(76, 29, 149, 0.03)'); // Purple-900
      ambientGlow.addColorStop(1, 'rgba(15, 10, 30, 0)');
      ctx.fillStyle = ambientGlow;
      ctx.fillRect(0, 0, width, height);

      // Layer B: Focused vibrant violet/fuchsia core (220px radius)
      const coreGlow = ctx.createRadialGradient(curX, curY, 0, curX, curY, 220);
      coreGlow.addColorStop(0, 'rgba(216, 180, 254, 0.32)'); // Soft bright lilac
      coreGlow.addColorStop(0.4, 'rgba(192, 132, 252, 0.18)'); // Purple-400
      coreGlow.addColorStop(0.8, 'rgba(147, 51, 234, 0.06)'); // Purple-600
      coreGlow.addColorStop(1, 'rgba(124, 58, 237, 0)');
      ctx.fillStyle = coreGlow;
      ctx.fillRect(0, 0, width, height);

      // 2. AMBIENT PURPLE NODES & PROXIMITY MOUSE ATTRACTION
      for (let i = 0; i < ambientNodes.length; i++) {
        const node = ambientNodes[i];
        node.x += node.vx;
        node.y += node.vy;

        // Wrap around boundaries
        if (node.x < 0) node.x = width;
        if (node.x > width) node.x = 0;
        if (node.y < 0) node.y = height;
        if (node.y > height) node.y = 0;

        // Cursor proximity physics attraction
        const dxM = curX - node.x;
        const dyM = curY - node.y;
        const distM = Math.sqrt(dxM * dxM + dyM * dyM);

        if (distM < 220 && distM > 0) {
          const force = (1 - distM / 220) * 0.35;
          node.x += (dxM / distM) * force;
          node.y += (dyM / distM) * force;

          // Draw radiant purple connection line to mouse
          ctx.beginPath();
          ctx.moveTo(node.x, node.y);
          ctx.lineTo(curX, curY);
          const lineAlpha = (1 - distM / 220) * 0.22;
          ctx.strokeStyle = `rgba(192, 132, 252, ${lineAlpha})`;
          ctx.lineWidth = 0.8;
          ctx.stroke();
        }

        // Draw particle node
        ctx.beginPath();
        ctx.arc(node.x, node.y, node.radius, 0, Math.PI * 2);
        ctx.fillStyle = node.color;
        ctx.globalAlpha = node.alpha;
        ctx.fill();
        ctx.globalAlpha = 1.0;

        // Inter-particle purple gradient web connections
        for (let j = i + 1; j < ambientNodes.length; j++) {
          const nodeB = ambientNodes[j];
          const dx = node.x - nodeB.x;
          const dy = node.y - nodeB.y;
          const dist = Math.sqrt(dx * dx + dy * dy);

          if (dist < 130) {
            ctx.beginPath();
            ctx.moveTo(node.x, node.y);
            ctx.lineTo(nodeB.x, nodeB.y);
            const lineAlpha = (1 - dist / 130) * 0.14;
            ctx.strokeStyle = `rgba(168, 85, 247, ${lineAlpha})`;
            ctx.lineWidth = 0.6;
            ctx.stroke();
          }
        }
      }

      // 3. EPHEMERAL PURPLE STARDUST SPARK TRAIL
      for (let i = trailParticles.length - 1; i >= 0; i--) {
        const p = trailParticles[i];
        p.x += p.vx;
        p.y += p.vy;
        p.vx *= 0.95;
        p.vy *= 0.95;
        p.alpha -= 0.024;
        p.size *= 0.96;

        if (p.alpha <= 0 || p.size <= 0.2) {
          trailParticles.splice(i, 1);
          continue;
        }

        ctx.save();
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fillStyle = p.color;
        ctx.shadowColor = p.color;
        ctx.shadowBlur = 8;
        ctx.globalAlpha = p.alpha;
        ctx.fill();
        ctx.restore();
      }

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mousedown', handleMouseDown);
      window.removeEventListener('mouseup', handleMouseUp);
      document.removeEventListener('mouseleave', handleMouseLeave);
      document.removeEventListener('mouseenter', handleMouseEnter);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  return (
    <>
      {/* Background Ambient Purple Gradient Auroras & Grid Overlay (z-0) */}
      <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
        <div className="absolute -top-40 left-1/4 w-[550px] h-[550px] bg-purple-600/15 rounded-full blur-[140px] animate-pulse-slow pointer-events-none" />
        <div className="absolute top-1/3 -right-20 w-[480px] h-[480px] bg-purple-500/12 rounded-full blur-[130px] pointer-events-none" />
        <div className="absolute bottom-10 left-1/3 w-[620px] h-[620px] bg-indigo-600/10 rounded-full blur-[160px] pointer-events-none" />

        {/* Subtle Purple Cybernetic Grid Lines */}
        <div
          className="absolute inset-0 opacity-[0.035]"
          style={{
            backgroundImage: `linear-gradient(#a855f7 1px, transparent 1px), linear-gradient(90deg, #a855f7 1px, transparent 1px)`,
            backgroundSize: '48px 48px',
          }}
        />
      </div>

      {/* Fixed Fullscreen Purple Gradient Mouse Movement Canvas (Mix-blend Screen over dark UI, z-[60]) */}
      <div className="fixed inset-0 pointer-events-none z-[60] overflow-hidden mix-blend-screen">
        <canvas ref={canvasRef} className="absolute inset-0 block w-full h-full" />
      </div>

      {/* Interactive Cursor Follower Halo Ring (z-[70]) */}
      <div
        ref={cursorRingRef}
        className={`fixed top-0 left-0 pointer-events-none z-[70] -translate-x-1/2 -translate-y-1/2 transition-opacity duration-300 ${
          isVisible ? 'opacity-100' : 'opacity-0'
        }`}
        style={{ willChange: 'transform' }}
      >
        <div
          className={`rounded-full transition-all duration-200 ease-out flex items-center justify-center ${
            isMouseDown
              ? 'w-6 h-6 border-2 border-purple-300 bg-purple-500/30 scale-90 shadow-[0_0_20px_rgba(216,180,254,0.9)]'
              : isHoveringClickable
              ? 'w-11 h-11 border border-purple-400/80 bg-purple-500/15 shadow-[0_0_25px_rgba(168,85,247,0.7),inset_0_0_12px_rgba(192,132,252,0.4)]'
              : 'w-7 h-7 border border-purple-400/50 bg-purple-600/10 shadow-[0_0_15px_rgba(168,85,247,0.4)]'
          }`}
        >
          {/* Subtle center purple pinpoint dot */}
          <div
            className={`rounded-full bg-purple-300 transition-all duration-200 ${
              isHoveringClickable ? 'w-1.5 h-1.5 bg-white shadow-[0_0_8px_#ffffff]' : 'w-1 h-1 opacity-70'
            }`}
          />
        </div>
      </div>
    </>
  );
};
