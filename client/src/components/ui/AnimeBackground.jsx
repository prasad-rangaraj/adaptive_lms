import { useEffect, useRef } from 'react';

// ─────────────────────────────────────────────────────────────────────────────
// "Rising Knowledge" — Study-themed floating symbol animation
//
// Symbols represent: books, atoms, brains, light-bulbs, math, stars, graduation
// caps, pencils, certificates — all drifting upward like ideas rising to the
// surface. Inspired by the visual metaphor: "knowledge flowing upward from study"
// ─────────────────────────────────────────────────────────────────────────────

// Draw each educational symbol as a clean vector path on canvas
const SYMBOL_DRAWERS = [

  // 📚 Open Book
  (ctx, cx, cy, s, alpha, color) => {
    ctx.save();
    ctx.translate(cx, cy);
    ctx.globalAlpha = alpha;
    ctx.strokeStyle = color;
    ctx.lineWidth = s * 0.1;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    // Left page
    ctx.beginPath();
    ctx.moveTo(0, -s * 0.55);
    ctx.bezierCurveTo(-s * 0.05, -s * 0.6, -s * 0.7, -s * 0.5, -s * 0.7, -s * 0.1);
    ctx.bezierCurveTo(-s * 0.7, s * 0.4, -s * 0.05, s * 0.5, 0, s * 0.55);
    ctx.stroke();
    // Right page (mirror)
    ctx.beginPath();
    ctx.moveTo(0, -s * 0.55);
    ctx.bezierCurveTo(s * 0.05, -s * 0.6, s * 0.7, -s * 0.5, s * 0.7, -s * 0.1);
    ctx.bezierCurveTo(s * 0.7, s * 0.4, s * 0.05, s * 0.5, 0, s * 0.55);
    ctx.stroke();
    // Spine
    ctx.beginPath();
    ctx.moveTo(0, -s * 0.55);
    ctx.lineTo(0, s * 0.55);
    ctx.stroke();
    // Lines on left page
    for (let i = -0.25; i <= 0.25; i += 0.18) {
      ctx.globalAlpha = alpha * 0.4;
      ctx.beginPath();
      ctx.moveTo(-s * 0.55, i * s);
      ctx.lineTo(-s * 0.12, i * s);
      ctx.stroke();
    }
    ctx.restore();
  },

  // ⚛️ Atom
  (ctx, cx, cy, s, alpha, color) => {
    ctx.save();
    ctx.translate(cx, cy);
    ctx.globalAlpha = alpha;
    ctx.strokeStyle = color;
    ctx.lineWidth = s * 0.08;
    // Nucleus
    ctx.beginPath();
    ctx.arc(0, 0, s * 0.15, 0, Math.PI * 2);
    ctx.fillStyle = color;
    ctx.globalAlpha = alpha * 0.6;
    ctx.fill();
    ctx.globalAlpha = alpha;
    // 3 ellipses
    for (let i = 0; i < 3; i++) {
      ctx.save();
      ctx.rotate((i / 3) * Math.PI);
      ctx.beginPath();
      ctx.ellipse(0, 0, s * 0.7, s * 0.28, 0, 0, Math.PI * 2);
      ctx.stroke();
      ctx.restore();
    }
    ctx.restore();
  },

  // 💡 Lightbulb
  (ctx, cx, cy, s, alpha, color) => {
    ctx.save();
    ctx.translate(cx, cy);
    ctx.globalAlpha = alpha;
    ctx.strokeStyle = color;
    ctx.lineWidth = s * 0.09;
    ctx.lineCap = 'round';
    // Bulb
    ctx.beginPath();
    ctx.arc(0, -s * 0.1, s * 0.42, Math.PI * 0.15, Math.PI * 0.85);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(-s * 0.42 * Math.sin(Math.PI * 0.15), -s * 0.1 + s * 0.42 * Math.cos(Math.PI * 0.15));
    ctx.lineTo(-s * 0.25, s * 0.35);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(s * 0.42 * Math.sin(Math.PI * 0.15), -s * 0.1 + s * 0.42 * Math.cos(Math.PI * 0.15));
    ctx.lineTo(s * 0.25, s * 0.35);
    ctx.stroke();
    // Base lines
    ctx.beginPath(); ctx.moveTo(-s * 0.23, s * 0.38); ctx.lineTo(s * 0.23, s * 0.38); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(-s * 0.18, s * 0.5);  ctx.lineTo(s * 0.18, s * 0.5);  ctx.stroke();
    ctx.beginPath(); ctx.moveTo(-s * 0.1,  s * 0.62); ctx.lineTo(s * 0.1,  s * 0.62); ctx.stroke();
    ctx.restore();
  },

  // 🎓 Graduation Cap
  (ctx, cx, cy, s, alpha, color) => {
    ctx.save();
    ctx.translate(cx, cy);
    ctx.globalAlpha = alpha;
    ctx.strokeStyle = color;
    ctx.fillStyle = color;
    ctx.lineWidth = s * 0.08;
    ctx.lineJoin = 'round';
    // Board (rhombus)
    ctx.beginPath();
    ctx.moveTo(0, -s * 0.6);
    ctx.lineTo(s * 0.7, -s * 0.15);
    ctx.lineTo(0, s * 0.1);
    ctx.lineTo(-s * 0.7, -s * 0.15);
    ctx.closePath();
    ctx.globalAlpha = alpha * 0.18;
    ctx.fill();
    ctx.globalAlpha = alpha;
    ctx.stroke();
    // Rim of hat
    ctx.beginPath();
    ctx.ellipse(0, s * 0.1, s * 0.45, s * 0.15, 0, 0, Math.PI * 2);
    ctx.stroke();
    // Tassel
    ctx.beginPath();
    ctx.moveTo(s * 0.7, -s * 0.15);
    ctx.lineTo(s * 0.7, s * 0.3);
    ctx.stroke();
    ctx.beginPath();
    ctx.arc(s * 0.7, s * 0.32, s * 0.06, 0, Math.PI * 2);
    ctx.globalAlpha = alpha * 0.5;
    ctx.fill();
    ctx.restore();
  },

  // ✏️ Pencil
  (ctx, cx, cy, s, alpha, color) => {
    ctx.save();
    ctx.translate(cx, cy);
    ctx.rotate(Math.PI / 4);
    ctx.globalAlpha = alpha;
    ctx.strokeStyle = color;
    ctx.lineWidth = s * 0.09;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    const h = s * 1.2;
    const w = s * 0.28;
    // Body
    ctx.beginPath();
    ctx.rect(-w / 2, -h * 0.5 + s * 0.22, w, h * 0.7);
    ctx.globalAlpha = alpha * 0.12;
    ctx.fillStyle = color;
    ctx.fill();
    ctx.globalAlpha = alpha;
    ctx.stroke();
    // Tip (triangle)
    ctx.beginPath();
    ctx.moveTo(-w / 2, -h * 0.5 + s * 0.22);
    ctx.lineTo(0, -h * 0.5 - s * 0.12);
    ctx.lineTo(w / 2, -h * 0.5 + s * 0.22);
    ctx.stroke();
    // Eraser
    ctx.beginPath();
    ctx.rect(-w / 2, h * 0.2, w, s * 0.22);
    ctx.globalAlpha = alpha * 0.3;
    ctx.fillStyle = color;
    ctx.fill();
    ctx.globalAlpha = alpha;
    ctx.stroke();
    ctx.restore();
  },

  // 🧠 Brain (simplified)
  (ctx, cx, cy, s, alpha, color) => {
    ctx.save();
    ctx.translate(cx, cy);
    ctx.globalAlpha = alpha;
    ctx.strokeStyle = color;
    ctx.lineWidth = s * 0.09;
    ctx.lineCap = 'round';
    // Left hemisphere
    ctx.beginPath();
    ctx.moveTo(0, s * 0.5);
    ctx.bezierCurveTo(-s * 0.1, s * 0.5, -s * 0.6, s * 0.4, -s * 0.65, 0);
    ctx.bezierCurveTo(-s * 0.7, -s * 0.5, -s * 0.3, -s * 0.65, 0, -s * 0.55);
    ctx.stroke();
    // Left folds
    ctx.beginPath(); ctx.moveTo(-s*0.6, 0); ctx.bezierCurveTo(-s*0.45,-s*0.15,-s*0.2,-s*0.1,0,-s*0.1); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(-s*0.65, s*0.2); ctx.bezierCurveTo(-s*0.5,s*0.1,-s*0.2,s*0.1,0,s*0.2); ctx.stroke();
    // Right hemisphere
    ctx.beginPath();
    ctx.moveTo(0, s * 0.5);
    ctx.bezierCurveTo(s * 0.1, s * 0.5, s * 0.6, s * 0.4, s * 0.65, 0);
    ctx.bezierCurveTo(s * 0.7, -s * 0.5, s * 0.3, -s * 0.65, 0, -s * 0.55);
    ctx.stroke();
    // Right folds
    ctx.beginPath(); ctx.moveTo(s*0.6, 0); ctx.bezierCurveTo(s*0.45,-s*0.15,s*0.2,-s*0.1,0,-s*0.1); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(s*0.65, s*0.2); ctx.bezierCurveTo(s*0.5,s*0.1,s*0.2,s*0.1,0,s*0.2); ctx.stroke();
    // Spine line
    ctx.setLineDash([s*0.05, s*0.1]);
    ctx.beginPath(); ctx.moveTo(0, -s * 0.55); ctx.lineTo(0, s * 0.5); ctx.stroke();
    ctx.setLineDash([]);
    ctx.restore();
  },

  // ⭐ Star
  (ctx, cx, cy, s, alpha, color) => {
    ctx.save();
    ctx.translate(cx, cy);
    ctx.globalAlpha = alpha;
    ctx.strokeStyle = color;
    ctx.fillStyle = color;
    ctx.lineWidth = s * 0.06;
    ctx.lineJoin = 'round';
    const spikes = 5;
    const outerR = s * 0.6;
    const innerR = s * 0.25;
    ctx.beginPath();
    for (let i = 0; i < spikes * 2; i++) {
      const r = i % 2 === 0 ? outerR : innerR;
      const angle = (i / (spikes * 2)) * Math.PI * 2 - Math.PI / 2;
      i === 0 ? ctx.moveTo(Math.cos(angle) * r, Math.sin(angle) * r)
               : ctx.lineTo(Math.cos(angle) * r, Math.sin(angle) * r);
    }
    ctx.closePath();
    ctx.globalAlpha = alpha * 0.2;
    ctx.fill();
    ctx.globalAlpha = alpha;
    ctx.stroke();
    ctx.restore();
  },

  // 📊 Bar Chart (Analytics)
  (ctx, cx, cy, s, alpha, color) => {
    ctx.save();
    ctx.translate(cx, cy);
    ctx.globalAlpha = alpha;
    ctx.strokeStyle = color;
    ctx.fillStyle = color;
    ctx.lineWidth = s * 0.07;
    ctx.lineCap = 'round';
    const bars = [0.5, 0.85, 0.35, 0.7, 0.95];
    const bw = s * 0.18;
    const gap = s * 0.12;
    const totalW = bars.length * (bw + gap) - gap;
    for (let i = 0; i < bars.length; i++) {
      const x = -totalW / 2 + i * (bw + gap);
      const bh = bars[i] * s * 1.1;
      ctx.beginPath();
      ctx.roundRect(x, s * 0.55 - bh, bw, bh, s * 0.06);
      ctx.globalAlpha = alpha * 0.18;
      ctx.fill();
      ctx.globalAlpha = alpha;
      ctx.stroke();
    }
    // X axis
    ctx.beginPath();
    ctx.moveTo(-totalW / 2 - s * 0.05, s * 0.55);
    ctx.lineTo(totalW / 2 + s * 0.05, s * 0.55);
    ctx.stroke();
    ctx.restore();
  },
];

const COLORS = [
  'rgba(99, 102, 241, 1)',  // Indigo
  'rgba(139, 92, 246, 1)', // Violet
  'rgba(168, 85, 247, 1)', // Purple
  'rgba(236, 72, 153, 1)', // Pink
  'rgba(14, 165, 233, 1)', // Sky
  'rgba(16, 185, 129, 1)', // Emerald
  'rgba(245, 158, 11, 1)', // Amber
];

function makeSymbol(W, H) {
  return {
    x: Math.random() * W,
    y: H + 80 + Math.random() * H * 0.5,    // start below viewport
    size: 24 + Math.random() * 36,           // slightly larger — fewer but more impactful
    alpha: 0,
    targetAlpha: 0.10 + Math.random() * 0.14, // slightly more subtle
    vy: -(0.15 + Math.random() * 0.22),     // drift upward, a bit slower
    vx: (Math.random() - 0.5) * 0.1,
    rotation: Math.random() * Math.PI * 2,
    vr: (Math.random() - 0.5) * 0.004,     // very slow spin
    drawerIdx: Math.floor(Math.random() * SYMBOL_DRAWERS.length),
    colorIdx: Math.floor(Math.random() * COLORS.length),
    wobble: Math.random() * Math.PI * 2,
    wobbleSpeed: 0.006 + Math.random() * 0.01,
    wobbleAmt: 0.25 + Math.random() * 0.35,
  };
}

export default function AnimeBackground() {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    let raf;

    function resize() {
      canvas.width  = window.innerWidth;
      canvas.height = window.innerHeight;
    }
    resize();
    window.addEventListener('resize', resize);

    // Initialize with symbols spread across the full page height (not just bottom)
    let symbols = Array.from({ length: 15 }, (_, i) => {
      const s = makeSymbol(canvas.width, canvas.height);
      // Spread initial positions across the full viewport for instant fill
      s.x = (i / 15) * canvas.width + (Math.random() - 0.5) * 120;
      s.y = Math.random() * (canvas.height + 300) - 150;
      s.alpha = s.targetAlpha * Math.random();
      return s;
    });

    // Subtle aurora gradient orbs in the background
    const orbs = [
      { x: 0.15, y: 0.2,  r: 0.55, color: [99, 102, 241],  phase: 0,    speed: 0.00025 },
      { x: 0.85, y: 0.15, r: 0.5,  color: [168, 85, 247],  phase: 2.0,  speed: 0.0003  },
      { x: 0.5,  y: 0.65, r: 0.6,  color: [236, 72, 153],  phase: 4.0,  speed: 0.0002  },
      { x: 0.1,  y: 0.8,  r: 0.45, color: [139, 92, 246],  phase: 1.2,  speed: 0.00035 },
      { x: 0.9,  y: 0.75, r: 0.45, color: [14, 165, 233],  phase: 3.5,  speed: 0.00028 },
    ];

    let t = 0;

    // Mouse subtle parallax
    const mouse = { x: 0.5, y: 0.5 };
    const onMouse = (e) => {
      mouse.x = e.clientX / canvas.width;
      mouse.y = e.clientY / canvas.height;
    };
    window.addEventListener('mousemove', onMouse);

    function draw(ts) {
      raf = requestAnimationFrame(draw);
      t = ts * 0.001;

      const W = canvas.width;
      const H = canvas.height;

      ctx.clearRect(0, 0, W, H);

      // ── 1. Aurora orbs (very soft background wash) ──────────────────────
      const px = (mouse.x - 0.5) * 0.05;
      const py = (mouse.y - 0.5) * 0.05;

      for (const orb of orbs) {
        const ox = (orb.x + Math.sin(t * orb.speed * 1500 + orb.phase) * 0.1 + px) * W;
        const oy = (orb.y + Math.cos(t * orb.speed * 1200 + orb.phase) * 0.08 + py) * H;
        const r  = orb.r * Math.min(W, H);

        const g = ctx.createRadialGradient(ox, oy, 0, ox, oy, r);
        g.addColorStop(0,   `rgba(${orb.color},0.09)`);
        g.addColorStop(0.4, `rgba(${orb.color},0.05)`);
        g.addColorStop(1,   `rgba(${orb.color},0)`);

        ctx.beginPath();
        ctx.arc(ox, oy, r, 0, Math.PI * 2);
        ctx.fillStyle = g;
        ctx.fill();
      }

      // ── 2. Update & draw floating study symbols ──────────────────────────
      for (const sym of symbols) {
        // Fade in
        sym.alpha += (sym.targetAlpha - sym.alpha) * 0.025;

        // Horizontal wobble (breathing side-to-side)
        sym.wobble += sym.wobbleSpeed;
        sym.x += sym.vx + Math.sin(sym.wobble) * sym.wobbleAmt;
        sym.y += sym.vy;
        sym.rotation += sym.vr;

        // Draw the symbol
        ctx.save();
        ctx.translate(sym.x, sym.y);
        ctx.rotate(sym.rotation);
        SYMBOL_DRAWERS[sym.drawerIdx](ctx, 0, 0, sym.size, sym.alpha, COLORS[sym.colorIdx]);
        ctx.restore();

        // Reset when it drifts above the viewport
        if (sym.y < -120) {
          const fresh = makeSymbol(W, H);
          Object.assign(sym, fresh);
        }
      }
    }

    raf = requestAnimationFrame(draw);

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener('resize', resize);
      window.removeEventListener('mousemove', onMouse);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 0,
        pointerEvents: 'none',
        width:  '100vw',
        height: '100vh',
      }}
    />
  );
}
