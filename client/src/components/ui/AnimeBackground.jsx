import { useEffect, useRef } from 'react';

// ─────────────────────────────────────────────────────────────────────────────
// "Neural Aurora" — High-tech AI background
//
// Combines soft glowing aurora orbs with a dynamic, interconnected neural network
// (particles and lines) to perfectly represent an AI-driven Adaptive LMS.
// ─────────────────────────────────────────────────────────────────────────────

const COLORS = [
  'rgba(99, 102, 241, 1)',  // Indigo
  'rgba(139, 92, 246, 1)',  // Violet
  'rgba(14, 165, 233, 1)',  // Sky
];

export default function AnimeBackground() {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    let raf;

    function resize() {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    }
    resize();
    window.addEventListener('resize', resize);

    // Particles for Neural Network
    const particles = Array.from({ length: 70 }, () => ({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      vx: (Math.random() - 0.5) * 0.5,
      vy: (Math.random() - 0.5) * 0.5,
      size: Math.random() * 2 + 1,
      color: COLORS[Math.floor(Math.random() * COLORS.length)],
      alpha: Math.random() * 0.6 + 0.2,
    }));

    // Aurora Orbs
    const orbs = [
      { x: 0.15, y: 0.2,  r: 0.55, color: [99, 102, 241],  phase: 0,    speed: 0.00025 },
      { x: 0.85, y: 0.15, r: 0.5,  color: [168, 85, 247],  phase: 2.0,  speed: 0.0003  },
      { x: 0.5,  y: 0.65, r: 0.6,  color: [236, 72, 153],  phase: 4.0,  speed: 0.0002  },
      { x: 0.1,  y: 0.8,  r: 0.45, color: [139, 92, 246],  phase: 1.2,  speed: 0.00035 },
      { x: 0.9,  y: 0.75, r: 0.45, color: [14, 165, 233],  phase: 3.5,  speed: 0.00028 },
    ];

    const mouse = { x: canvas.width / 2, y: canvas.height / 2, radius: 180 };
    const onMouseMove = (e) => {
      mouse.x = e.clientX;
      mouse.y = e.clientY;
    };
    window.addEventListener('mousemove', onMouseMove);

    let t = 0;

    function draw(ts) {
      raf = requestAnimationFrame(draw);
      t = ts * 0.001;
      const W = canvas.width;
      const H = canvas.height;

      ctx.clearRect(0, 0, W, H);

      // 1. Draw Aurora Orbs (soft background wash)
      const px = (mouse.x / W - 0.5) * 0.05;
      const py = (mouse.y / H - 0.5) * 0.05;

      for (const orb of orbs) {
        const ox = (orb.x + Math.sin(t * orb.speed * 1500 + orb.phase) * 0.1 + px) * W;
        const oy = (orb.y + Math.cos(t * orb.speed * 1200 + orb.phase) * 0.08 + py) * H;
        const r = orb.r * Math.min(W, H);

        const g = ctx.createRadialGradient(ox, oy, 0, ox, oy, r);
        g.addColorStop(0, `rgba(${orb.color},0.08)`);
        g.addColorStop(0.4, `rgba(${orb.color},0.04)`);
        g.addColorStop(1, `rgba(${orb.color},0)`);

        ctx.beginPath();
        ctx.arc(ox, oy, r, 0, Math.PI * 2);
        ctx.fillStyle = g;
        ctx.fill();
      }

      // 2. Draw Neural Network Particles
      for (let i = 0; i < particles.length; i++) {
        const p = particles[i];
        p.x += p.vx;
        p.y += p.vy;

        // Bounce off edges
        if (p.x < 0 || p.x > W) p.vx *= -1;
        if (p.y < 0 || p.y > H) p.vy *= -1;

        // Mouse interaction (push away gently)
        const dx = mouse.x - p.x;
        const dy = mouse.y - p.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < mouse.radius) {
          const force = (mouse.radius - dist) / mouse.radius;
          p.x -= (dx / dist) * force * 1.5;
          p.y -= (dy / dist) * force * 1.5;
        }

        // Draw particle
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fillStyle = p.color.replace('1)', `${p.alpha})`);
        ctx.fill();

        // Connect particles within range
        for (let j = i + 1; j < particles.length; j++) {
          const p2 = particles[j];
          const dx2 = p.x - p2.x;
          const dy2 = p.y - p2.y;
          const dist2 = Math.sqrt(dx2 * dx2 + dy2 * dy2);

          const maxDist = 160;
          if (dist2 < maxDist) {
            ctx.beginPath();
            ctx.moveTo(p.x, p.y);
            ctx.lineTo(p2.x, p2.y);
            // Opacity based on distance
            const op = (1 - dist2 / maxDist) * 0.15;
            ctx.strokeStyle = `rgba(99, 102, 241, ${op})`;
            ctx.lineWidth = 1;
            ctx.stroke();
          }
        }
      }
    }

    raf = requestAnimationFrame(draw);

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener('resize', resize);
      window.removeEventListener('mousemove', onMouseMove);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100vw',
        height: '100vh',
        pointerEvents: 'none',
        zIndex: 0,
        background: '#ffffff', // Ensures a clean premium white background behind everything
      }}
    />
  );
}
