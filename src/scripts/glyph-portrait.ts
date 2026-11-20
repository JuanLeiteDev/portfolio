/**
 * Glyph portrait — signature effect of the hero.
 *
 * The real photo is always visible (it is the LCP candidate and must never
 * flash). A canvas on top renders the *same* photo as characters, but only
 * inside a moving mask:
 *   - "scan": a band sweeps top → bottom once when the portrait first enters
 *     the viewport (and again on tap, for touch users);
 *   - "lens": on fine pointers, a circle of glyphs follows the cursor.
 * Glyphs are derived from the photo's real luminance — nothing is invented.
 *
 * Cost control: the luminance grid is computed once; frames are drawn only
 * while an effect is active; DPR capped at 2; paused when off-screen or when
 * the tab is hidden; disabled with prefers-reduced-motion.
 */
const RAMP = ' .:-=+*#%@';
const CELL = 9; // CSS px per glyph cell

interface Grid {
  cols: number;
  rows: number;
  lum: Float32Array;
}

export function initGlyphPortrait(root: HTMLElement): () => void {
  const img = root.querySelector('img');
  const canvas = root.querySelector('canvas');
  const ctx = canvas?.getContext('2d', { alpha: true });
  if (!img || !canvas || !ctx) return () => {};

  let grid: Grid | null = null;
  let w = 0;
  let h = 0;
  let dpr = 1;
  let raf = 0;
  let visible = false;
  let scanStart = -1;
  const lens: { x: number; y: number; a: number; target: number } = { x: 0, y: 0, a: 0, target: 0 };
  let colors = { fg: '#ece9e1', bg: '#0d0e0c', signal: '#ff6b2c' };

  const readColors = () => {
    const s = getComputedStyle(document.documentElement);
    colors = {
      fg: s.getPropertyValue('--c-fg').trim() || colors.fg,
      bg: s.getPropertyValue('--c-bg').trim() || colors.bg,
      signal: s.getPropertyValue('--c-signal').trim() || colors.signal,
    };
  };

  /** Sample the photo into a luminance grid matching object-fit: cover. */
  const sample = () => {
    const rect = root.getBoundingClientRect();
    w = Math.round(rect.width);
    h = Math.round(rect.height);
    if (!w || !h || !img.naturalWidth) return;
    dpr = Math.min(2, window.devicePixelRatio || 1);
    canvas.width = Math.round(w * dpr);
    canvas.height = Math.round(h * dpr);
    const cols = Math.ceil(w / CELL);
    const rows = Math.ceil(h / CELL);
    const off = document.createElement('canvas');
    off.width = cols;
    off.height = rows;
    const octx = off.getContext('2d', { willReadFrequently: true });
    if (!octx) return;
    // object-fit: cover; object-position: 50% 20% (matches CSS)
    const ir = img.naturalWidth / img.naturalHeight;
    const cr = w / h;
    let sw = img.naturalWidth;
    let sh = img.naturalHeight;
    let sx = 0;
    let sy = 0;
    if (ir > cr) {
      sw = sh * cr;
      sx = (img.naturalWidth - sw) / 2;
    } else {
      sh = sw / cr;
      sy = (img.naturalHeight - sh) * 0.2;
    }
    octx.drawImage(img, sx, sy, sw, sh, 0, 0, cols, rows);
    const data = octx.getImageData(0, 0, cols, rows).data;
    const lum = new Float32Array(cols * rows);
    for (let i = 0; i < cols * rows; i += 1) {
      const r = data[i * 4] ?? 0;
      const g = data[i * 4 + 1] ?? 0;
      const b = data[i * 4 + 2] ?? 0;
      lum[i] = (0.2126 * r + 0.7152 * g + 0.0722 * b) / 255;
    }
    grid = { cols, rows, lum };
  };

  /** Draw glyph cells whose centre falls inside `mask(x, y)` (0..1 weight). */
  const drawCells = (mask: (x: number, y: number) => number) => {
    if (!grid) return;
    const light = document.documentElement.getAttribute('data-theme') === 'light' ||
      (!document.documentElement.hasAttribute('data-theme') && matchMedia('(prefers-color-scheme: light)').matches);
    ctx.font = `500 ${CELL + 1}px "JetBrains Mono", ui-monospace, monospace`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    for (let r = 0; r < grid.rows; r += 1) {
      const cy = r * CELL + CELL / 2;
      for (let c = 0; c < grid.cols; c += 1) {
        const cx = c * CELL + CELL / 2;
        const m = mask(cx, cy);
        if (m <= 0) continue;
        const l = grid.lum[r * grid.cols + c] ?? 0;
        // background tile hides the photo under the mask
        ctx.globalAlpha = m;
        ctx.fillStyle = colors.bg;
        ctx.fillRect(c * CELL, r * CELL, CELL, CELL);
        const v = light ? 1 - l : l;
        const ch = RAMP.charAt(Math.min(RAMP.length - 1, Math.floor(v * RAMP.length)));
        if (ch === ' ') continue;
        ctx.globalAlpha = m * (0.35 + v * 0.65);
        ctx.fillStyle = colors.fg;
        ctx.fillText(ch, cx, cy);
      }
    }
    ctx.globalAlpha = 1;
  };

  const SCAN_MS = 1500;
  const BAND = 70;

  const frame = (now: number) => {
    raf = 0;
    if (!grid) return;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.clearRect(0, 0, w, h);
    let active = false;

    if (scanStart >= 0) {
      if (scanStart === 0) scanStart = now;
      const p = (now - scanStart) / SCAN_MS;
      if (p >= 1) {
        scanStart = -1;
      } else {
        active = true;
        const eased = 1 - Math.pow(1 - p, 2);
        const y = -BAND + eased * (h + BAND * 2);
        drawCells((_x, cy) => {
          const d = y - cy; // cells above the line fade out behind it
          if (d < 0 || d > BAND * 2) return 0;
          return 1 - d / (BAND * 2);
        });
        ctx.fillStyle = colors.signal;
        ctx.globalAlpha = 0.9;
        ctx.fillRect(0, Math.round(y), w, 1);
        ctx.globalAlpha = 1;
      }
    }

    if (lens.a > 0.01 || lens.target > 0) {
      lens.a += (lens.target - lens.a) * 0.18;
      const R = Math.min(90, w * 0.28);
      drawCells((cx, cy) => {
        const d = Math.hypot(cx - lens.x, cy - lens.y);
        if (d > R) return 0;
        return lens.a * Math.min(1, (R - d) / 18);
      });
      ctx.strokeStyle = colors.signal;
      ctx.globalAlpha = lens.a * 0.8;
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.arc(lens.x, lens.y, R, 0, Math.PI * 2);
      ctx.stroke();
      ctx.globalAlpha = 1;
      if (Math.abs(lens.target - lens.a) > 0.01 || lens.target > 0) active = true;
    }

    if (active && visible && !document.hidden) schedule();
  };

  const schedule = () => {
    if (!raf) raf = requestAnimationFrame(frame);
  };

  const startScan = () => {
    scanStart = 0;
    schedule();
  };

  /* ------------------------------------------------------------ wiring */

  const ready = async () => {
    try {
      await img.decode();
    } catch {
      /* already decoded or failed — sample() guards naturalWidth */
    }
    try {
      await document.fonts.load(`500 ${CELL + 1}px "JetBrains Mono"`);
    } catch {
      /* fallback monospace is fine */
    }
    readColors();
    sample();
  };

  let scanned = false;
  const io = new IntersectionObserver(
    ([entry]) => {
      visible = !!entry?.isIntersecting;
      if (visible && !scanned && grid) {
        scanned = true;
        startScan();
      }
      if (visible) schedule();
    },
    { threshold: 0.35 },
  );

  const fine = matchMedia('(hover: hover) and (pointer: fine)');
  const onMove = (e: PointerEvent) => {
    if (e.pointerType !== 'mouse' && !fine.matches) return;
    const r = root.getBoundingClientRect();
    lens.x = e.clientX - r.left;
    lens.y = e.clientY - r.top;
    lens.target = 1;
    schedule();
  };
  const onLeave = () => {
    lens.target = 0;
    schedule();
  };
  const onTap = (e: PointerEvent) => {
    if (e.pointerType === 'mouse') return;
    startScan();
  };

  let resizeTimer = 0;
  const ro = new ResizeObserver(() => {
    window.clearTimeout(resizeTimer);
    resizeTimer = window.setTimeout(() => {
      sample();
      schedule();
    }, 150);
  });
  const onTheme = () => {
    readColors();
    schedule();
  };
  const onVisibility = () => {
    if (!document.hidden) schedule();
  };

  void ready().then(() => {
    io.observe(root);
    ro.observe(root);
    root.addEventListener('pointermove', onMove);
    root.addEventListener('pointerleave', onLeave);
    root.addEventListener('pointerup', onTap);
    document.addEventListener('themechange', onTheme);
    document.addEventListener('visibilitychange', onVisibility);
    root.classList.add('is-live');
  });

  return () => {
    cancelAnimationFrame(raf);
    io.disconnect();
    ro.disconnect();
    root.removeEventListener('pointermove', onMove);
    root.removeEventListener('pointerleave', onLeave);
    root.removeEventListener('pointerup', onTap);
    document.removeEventListener('themechange', onTheme);
    document.removeEventListener('visibilitychange', onVisibility);
  };
}
