import type { Badge } from "@/lib/badges";

/**
 * Genera una tarjeta cuadrada (1080×1080 PNG) con los logros del empleado para
 * compartir en redes/WhatsApp. Se dibuja con canvas en el dispositivo del
 * usuario: los emojis de las medallas usan la fuente de emoji del SO (renderizan
 * bien), y el texto va en una sans-serif del sistema (fidelidad suficiente para
 * una tarjeta de compartir; no es el certificado imprimible).
 */

export type ProfileCardData = {
  name: string;
  levelName: string;
  levelN: number;
  points: number;
  earned: Badge[];
  earnedCount: number;
  totalBadges: number;
};

const FONT = 'system-ui, -apple-system, "Segoe UI", Roboto, sans-serif';

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error("no-image"));
    img.src = src;
  });
}

/** Baja el tamaño de fuente hasta que `text` entre en `maxWidth`. */
function fitFont(
  ctx: CanvasRenderingContext2D,
  text: string,
  maxWidth: number,
  base: number,
  weight: string,
): void {
  let size = base;
  ctx.font = `${weight} ${size}px ${FONT}`;
  while (size > 28 && ctx.measureText(text).width > maxWidth) {
    size -= 4;
    ctx.font = `${weight} ${size}px ${FONT}`;
  }
}

export async function generateProfileCard(data: ProfileCardData): Promise<Blob | null> {
  const S = 1080;
  const canvas = document.createElement("canvas");
  canvas.width = S;
  canvas.height = S;
  const ctx = canvas.getContext("2d");
  if (!ctx) return null;

  // Fondo: gradiente de marca.
  const grad = ctx.createLinearGradient(0, 0, S, S);
  grad.addColorStop(0, "#e6005c");
  grad.addColorStop(1, "#8a0038");
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, S, S);

  ctx.textAlign = "center";

  // Logo Geneo (blanco). Si no carga, seguimos sin él.
  try {
    const logo = await loadImage("/img/logo-white.webp");
    const lw = 300;
    const lh = lw * (logo.height / logo.width);
    ctx.drawImage(logo, (S - lw) / 2, 110, lw, lh);
  } catch {
    // sin logo
  }

  const maxW = S - 160;

  // Nombre.
  ctx.fillStyle = "#ffffff";
  fitFont(ctx, data.name, maxW, 68, "700");
  ctx.fillText(data.name, S / 2, 320);

  // Nivel.
  ctx.fillStyle = "rgba(255,255,255,0.9)";
  fitFont(ctx, `${data.levelName} · Nivel ${data.levelN}`, maxW, 40, "600");
  ctx.fillText(`${data.levelName} · Nivel ${data.levelN}`, S / 2, 384);

  // Puntos.
  ctx.fillStyle = "#ffffff";
  ctx.font = `800 150px ${FONT}`;
  ctx.fillText(`${data.points}`, S / 2, 580);
  ctx.fillStyle = "rgba(255,255,255,0.85)";
  ctx.font = `700 34px ${FONT}`;
  ctx.fillText("PUNTOS", S / 2, 632);

  // Medallas (emojis, hasta 6).
  const emojis = data.earned.slice(0, 6).map((b) => b.emoji);
  if (emojis.length > 0) {
    ctx.font = `84px ${FONT}`;
    const gap = 116;
    const totalW = (emojis.length - 1) * gap;
    emojis.forEach((e, i) => {
      ctx.fillText(e, S / 2 - totalW / 2 + i * gap, 800);
    });
  }
  ctx.fillStyle = "rgba(255,255,255,0.9)";
  ctx.font = `600 36px ${FONT}`;
  ctx.fillText(`${data.earnedCount} de ${data.totalBadges} logros`, S / 2, 872);

  // Pie.
  ctx.fillStyle = "#ffffff";
  ctx.font = `700 42px ${FONT}`;
  ctx.fillText("Misión Geneo", S / 2, 980);
  ctx.fillStyle = "rgba(255,255,255,0.7)";
  ctx.font = `500 30px ${FONT}`;
  ctx.fillText("by Natufarma", S / 2, 1026);

  return await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, "image/png"));
}
