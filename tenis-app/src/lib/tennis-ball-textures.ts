import { CanvasTexture, RepeatWrapping } from "three";

export function createColorTexture(size = 1024): CanvasTexture {
  const canvas = document.createElement("canvas");
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext("2d")!;

  // 1. Base — optic yellow
  ctx.fillStyle = "#DDF15E";
  ctx.fillRect(0, 0, size, size);

  // 2. Fuzz — tiny dots
  for (let i = 0; i < 10000; i++) {
    const x = Math.random() * size;
    const y = Math.random() * size;
    const a = Math.random() * 0.055;
    ctx.fillStyle = `rgba(255, 255, 220, ${a})`;
    ctx.beginPath();
    ctx.arc(x, y, Math.random() * 2 + 0.5, 0, Math.PI * 2);
    ctx.fill();
  }

  // 3. Seams — figure-8 with shadow depth
  const drawSeam = (
    x1: number, y1: number,
    c1x: number, c1y: number, c2x: number, c2y: number, x2: number, y2: number,
    c3x: number, c3y: number, c4x: number, c4y: number, x3: number, y3: number,
  ) => {
    ctx.shadowColor = "rgba(80, 90, 30, 0.3)";
    ctx.shadowBlur = 10;
    ctx.strokeStyle = "rgba(160, 180, 60, 0.1)";
    ctx.lineWidth = 16;
    ctx.beginPath();
    ctx.moveTo(x1, y1);
    ctx.bezierCurveTo(c1x, c1y, c2x, c2y, x2, y2);
    ctx.bezierCurveTo(c3x, c3y, c4x, c4y, x3, y3);
    ctx.stroke();
    ctx.shadowColor = "rgba(100, 100, 50, 0.2)";
    ctx.shadowBlur = 6;
    ctx.strokeStyle = "rgba(255, 255, 255, 0.95)";
    ctx.lineWidth = 7;
    ctx.beginPath();
    ctx.moveTo(x1, y1);
    ctx.bezierCurveTo(c1x, c1y, c2x, c2y, x2, y2);
    ctx.bezierCurveTo(c3x, c3y, c4x, c4y, x3, y3);
    ctx.stroke();
    ctx.shadowBlur = 0;
    ctx.strokeStyle = "rgba(255, 255, 255, 0.12)";
    ctx.lineWidth = 14;
    ctx.beginPath();
    ctx.moveTo(x1, y1);
    ctx.bezierCurveTo(c1x, c1y, c2x, c2y, x2, y2);
    ctx.bezierCurveTo(c3x, c3y, c4x, c4y, x3, y3);
    ctx.stroke();
  };

  const S = size;

  drawSeam(
    0, S * 0.28,
    S * 0.22, S * 0.18, S * 0.22, S * 0.56, S * 0.5, S * 0.56,
    S * 0.78, S * 0.56, S * 0.78, S * 0.18, S, S * 0.28,
  );

  drawSeam(
    0, S * 0.72,
    S * 0.22, S * 0.82, S * 0.22, S * 0.44, S * 0.5, S * 0.44,
    S * 0.78, S * 0.44, S * 0.78, S * 0.82, S, S * 0.72,
  );

  // 4. Subtle darker variation
  for (let i = 0; i < 4000; i++) {
    const x = Math.random() * size;
    const y = Math.random() * size;
    const a = Math.random() * 0.02;
    ctx.fillStyle = `rgba(140, 160, 50, ${a})`;
    ctx.beginPath();
    ctx.arc(x, y, Math.random() * 1.5 + 0.3, 0, Math.PI * 2);
    ctx.fill();
  }

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

  ctx.fillStyle = "#808080";
  ctx.fillRect(0, 0, size, size);

  for (let i = 0; i < 20000; i++) {
    const x = Math.random() * size;
    const y = Math.random() * size;
    const v = Math.random() * 50 + 103;
    ctx.fillStyle = `rgb(${v}, ${v}, ${v})`;
    ctx.beginPath();
    ctx.arc(x, y, Math.random() * 1.8 + 0.3, 0, Math.PI * 2);
    ctx.fill();
  }

  ctx.strokeStyle = "#585858";
  ctx.lineWidth = 10;
  ctx.beginPath();
  ctx.moveTo(0, size * 0.28);
  ctx.bezierCurveTo(size * 0.22, size * 0.18, size * 0.22, size * 0.56, size * 0.5, size * 0.56);
  ctx.bezierCurveTo(size * 0.78, size * 0.56, size * 0.78, size * 0.18, size, size * 0.28);
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(0, size * 0.72);
  ctx.bezierCurveTo(size * 0.22, size * 0.82, size * 0.22, size * 0.44, size * 0.5, size * 0.44);
  ctx.bezierCurveTo(size * 0.78, size * 0.44, size * 0.78, size * 0.82, size, size * 0.72);
  ctx.stroke();

  const tex = new CanvasTexture(canvas);
  tex.wrapS = RepeatWrapping;
  tex.wrapT = RepeatWrapping;
  return tex;
}
