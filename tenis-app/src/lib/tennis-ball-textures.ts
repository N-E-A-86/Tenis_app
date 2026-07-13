import { CanvasTexture, RepeatWrapping } from "three";

export function createColorTexture(size = 1024): CanvasTexture {
  const canvas = document.createElement("canvas");
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext("2d")!;

  // 1. Base — optic yellow (tuned)
  ctx.fillStyle = "#E2F05E";
  ctx.fillRect(0, 0, size, size);

  // 2. Fuzz — subtle grain (less noisy)
  for (let i = 0; i < 6000; i++) {
    const x = Math.random() * size;
    const y = Math.random() * size;
    const a = Math.random() * 0.04;
    ctx.fillStyle = `rgba(255, 255, 200, ${a})`;
    ctx.beginPath();
    ctx.arc(x, y, Math.random() * 1.5 + 0.5, 0, Math.PI * 2);
    ctx.fill();
  }

  // 3. Seams — thick white with clear shadow
  const drawSeam = (
    x1: number, y1: number,
    c1x: number, c1y: number, c2x: number, c2y: number, x2: number, y2: number,
    c3x: number, c3y: number, c4x: number, c4y: number, x3: number, y3: number,
  ) => {
    // Dark depression behind seam
    ctx.shadowColor = "rgba(60, 70, 20, 0.4)";
    ctx.shadowBlur = 14;
    ctx.strokeStyle = "rgba(140, 160, 50, 0.15)";
    ctx.lineWidth = 24;
    ctx.beginPath();
    ctx.moveTo(x1, y1);
    ctx.bezierCurveTo(c1x, c1y, c2x, c2y, x2, y2);
    ctx.bezierCurveTo(c3x, c3y, c4x, c4y, x3, y3);
    ctx.stroke();

    // White seam (wider, pure white)
    ctx.shadowColor = "rgba(0, 0, 0, 0.15)";
    ctx.shadowBlur = 6;
    ctx.strokeStyle = "#FFFFFF";
    ctx.lineWidth = 12;
    ctx.beginPath();
    ctx.moveTo(x1, y1);
    ctx.bezierCurveTo(c1x, c1y, c2x, c2y, x2, y2);
    ctx.bezierCurveTo(c3x, c3y, c4x, c4y, x3, y3);
    ctx.stroke();

    // Soft outer glow
    ctx.shadowBlur = 0;
    ctx.strokeStyle = "rgba(255, 255, 255, 0.08)";
    ctx.lineWidth = 22;
    ctx.beginPath();
    ctx.moveTo(x1, y1);
    ctx.bezierCurveTo(c1x, c1y, c2x, c2y, x2, y2);
    ctx.bezierCurveTo(c3x, c3y, c4x, c4y, x3, y3);
    ctx.stroke();
  };

  const S = size;

  drawSeam(
    0, S * 0.26,
    S * 0.25, S * 0.16, S * 0.25, S * 0.56, S * 0.5, S * 0.56,
    S * 0.75, S * 0.56, S * 0.75, S * 0.16, S, S * 0.26,
  );

  drawSeam(
    0, S * 0.74,
    S * 0.25, S * 0.84, S * 0.25, S * 0.44, S * 0.5, S * 0.44,
    S * 0.75, S * 0.44, S * 0.75, S * 0.84, S, S * 0.74,
  );

  return new CanvasTexture(canvas);
}

export function createBumpTexture(size = 512): CanvasTexture {
  const canvas = document.createElement("canvas");
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext("2d")!;

  // Lighter mid-gray base (less aggressive bump)
  ctx.fillStyle = "#A0A0A0";
  ctx.fillRect(0, 0, size, size);

  // Sparse noise (subtle fuzz)
  for (let i = 0; i < 8000; i++) {
    const x = Math.random() * size;
    const y = Math.random() * size;
    const v = Math.random() * 30 + 113;
    ctx.fillStyle = `rgb(${v}, ${v}, ${v})`;
    ctx.beginPath();
    ctx.arc(x, y, Math.random() * 1.5 + 0.3, 0, Math.PI * 2);
    ctx.fill();
  }

  // Subtle seam grooves
  ctx.strokeStyle = "#888";
  ctx.lineWidth = 14;
  ctx.beginPath();
  ctx.moveTo(0, size * 0.26);
  ctx.bezierCurveTo(size * 0.25, size * 0.16, size * 0.25, size * 0.56, size * 0.5, size * 0.56);
  ctx.bezierCurveTo(size * 0.75, size * 0.56, size * 0.75, size * 0.16, size, size * 0.26);
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(0, size * 0.74);
  ctx.bezierCurveTo(size * 0.25, size * 0.84, size * 0.25, size * 0.44, size * 0.5, size * 0.44);
  ctx.bezierCurveTo(size * 0.75, size * 0.44, size * 0.75, size * 0.84, size, size * 0.74);
  ctx.stroke();

  const tex = new CanvasTexture(canvas);
  tex.wrapS = RepeatWrapping;
  tex.wrapT = RepeatWrapping;
  return tex;
}
