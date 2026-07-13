import { CanvasTexture, RepeatWrapping } from "three";

export function createColorTexture(size = 1024): CanvasTexture {
  const canvas = document.createElement("canvas");
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext("2d")!;

  // ── 1. Base — optic yellow (#CCFF00) ──
  // Official ITF "optic yellow": fluorescent yellow-green, zero blue channel
  ctx.fillStyle = "#CCFF00";
  ctx.fillRect(0, 0, size, size);

  // ── 2. Felt texture — uniform fibrous grain ──
  // Real tennis ball felt has a directional, short-fiber appearance
  // We simulate this with short horizontal streaks
  for (let i = 0; i < 12000; i++) {
    const x = Math.random() * size;
    const y = Math.random() * size;
    const len = Math.random() * 6 + 2;
    const brightness = 200 + Math.floor(Math.random() * 55); // 200-255
    ctx.strokeStyle = `rgba(255, 255, 255, ${Math.random() * 0.035})`;
    ctx.lineWidth = Math.random() * 1.5 + 0.5;
    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.lineTo(x + len, y + (Math.random() - 0.5) * 0.5);
    ctx.stroke();
  }

  // Add subtle darker fibers for depth
  for (let i = 0; i < 6000; i++) {
    const x = Math.random() * size;
    const y = Math.random() * size;
    ctx.strokeStyle = `rgba(100, 130, 0, ${Math.random() * 0.025})`;
    ctx.lineWidth = Math.random() * 1 + 0.3;
    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.lineTo(x + Math.random() * 5, y + (Math.random() - 0.5) * 0.5);
    ctx.stroke();
  }

  // ── 3. Seams — thick white curved bands ──
  // Real tennis ball seam is ~9% of the ball diameter.
  // On our 1024px texture, that's ~92px wide.
  // We draw the seam as a white band with a subtle dark edge for depth.

  const drawSeam = (
    x1: number, y1: number,
    c1x: number, c1y: number, c2x: number, c2y: number,
    x2: number, y2: number,
    c3x: number, c3y: number, c4x: number, c4y: number,
    x3: number, y3: number,
  ) => {
    // Dark shadow edge (depth)
    ctx.shadowColor = "rgba(60, 80, 0, 0.3)";
    ctx.shadowBlur = 16;
    ctx.strokeStyle = "rgba(80, 100, 0, 0.2)";
    ctx.lineWidth = 100;
    ctx.beginPath();
    ctx.moveTo(x1, y1);
    ctx.bezierCurveTo(c1x, c1y, c2x, c2y, x2, y2);
    ctx.bezierCurveTo(c3x, c3y, c4x, c4y, x3, y3);
    ctx.stroke();

    // White seam band
    ctx.shadowColor = "rgba(0, 0, 0, 0.1)";
    ctx.shadowBlur = 8;
    ctx.strokeStyle = "#FFFFFF";
    ctx.lineWidth = 80;
    ctx.beginPath();
    ctx.moveTo(x1, y1);
    ctx.bezierCurveTo(c1x, c1y, c2x, c2y, x2, y2);
    ctx.bezierCurveTo(c3x, c3y, c4x, c4y, x3, y3);
    ctx.stroke();

    // Bright center stripe (seam highlight)
    ctx.shadowBlur = 4;
    ctx.strokeStyle = "#FFFFFF";
    ctx.lineWidth = 40;
    ctx.beginPath();
    ctx.moveTo(x1, y1);
    ctx.bezierCurveTo(c1x, c1y, c2x, c2y, x2, y2);
    ctx.bezierCurveTo(c3x, c3y, c4x, c4y, x3, y3);
    ctx.stroke();

    // Reset shadow
    ctx.shadowBlur = 0;
  };

  const S = size;

  // Upper seam
  drawSeam(
    0, S * 0.24,
    S * 0.28, S * 0.12, S * 0.28, S * 0.56, S * 0.5, S * 0.56,
    S * 0.72, S * 0.56, S * 0.72, S * 0.12, S, S * 0.24,
  );

  // Lower seam (mirrored)
  drawSeam(
    0, S * 0.76,
    S * 0.28, S * 0.88, S * 0.28, S * 0.44, S * 0.5, S * 0.44,
    S * 0.72, S * 0.44, S * 0.72, S * 0.88, S, S * 0.76,
  );

  // ── 4. Very subtle post-processing ──
  // Slight darkening at the edges of the seam shadow
  // to make the seam pop more

  const tex = new CanvasTexture(canvas);
  tex.wrapS = RepeatWrapping;
  tex.wrapT = RepeatWrapping;
  return tex;
}

export function createBumpTexture(size = 512): CanvasTexture {
  const canvas = document.createElement("canvas");
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext("2d")!;

  // Mid-gray base (neutral)
  ctx.fillStyle = "#808080";
  ctx.fillRect(0, 0, size, size);

  // Felt fiber bumps — short streaks for directional felt texture
  for (let i = 0; i < 12000; i++) {
    const x = Math.random() * size;
    const y = Math.random() * size;
    const v = Math.floor(Math.random() * 50 + 115);
    ctx.strokeStyle = `rgb(${v}, ${v}, ${v})`;
    ctx.lineWidth = Math.random() * 1.5 + 0.5;
    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.lineTo(x + Math.random() * 4, y + (Math.random() - 0.5) * 0.5);
    ctx.stroke();
  }

  // Seam grooves (recessed)
  ctx.strokeStyle = "#666";
  ctx.lineWidth = 50;
  ctx.shadowBlur = 0;
  ctx.beginPath();
  ctx.moveTo(0, size * 0.24);
  ctx.bezierCurveTo(size * 0.28, size * 0.12, size * 0.28, size * 0.56, size * 0.5, size * 0.56);
  ctx.bezierCurveTo(size * 0.72, size * 0.56, size * 0.72, size * 0.12, size, size * 0.24);
  ctx.stroke();

  ctx.beginPath();
  ctx.moveTo(0, size * 0.76);
  ctx.bezierCurveTo(size * 0.28, size * 0.88, size * 0.28, size * 0.44, size * 0.5, size * 0.44);
  ctx.bezierCurveTo(size * 0.72, size * 0.44, size * 0.72, size * 0.88, size, size * 0.76);
  ctx.stroke();

  const tex = new CanvasTexture(canvas);
  tex.wrapS = RepeatWrapping;
  tex.wrapT = RepeatWrapping;
  return tex;
}
