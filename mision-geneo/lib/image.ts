/**
 * Utilidades de imagen que corren en el navegador (canvas). Sin dependencias
 * de servidor: se usan antes de subir un archivo a Storage.
 */

/** Tamaño final del avatar (cuadrado) y calidad de export a webp. */
const AVATAR_SIZE = 400;
const AVATAR_QUALITY = 0.82;

/**
 * Recorta `file` a un cuadrado centrado (estilo `object-fit: cover`),
 * lo redimensiona a `size`×`size` y lo exporta como WebP. Pensado para
 * avatares: entrada de cualquier proporción, salida liviana y uniforme.
 */
export async function cropToSquareWebp(
  file: File,
  size: number = AVATAR_SIZE,
  quality: number = AVATAR_QUALITY,
): Promise<Blob> {
  const source = await loadImageSource(file);
  try {
    const width = source instanceof HTMLImageElement ? source.naturalWidth : source.width;
    const height = source instanceof HTMLImageElement ? source.naturalHeight : source.height;
    const side = Math.min(width, height);
    const sx = (width - side) / 2;
    const sy = (height - side) / 2;

    const canvas = document.createElement("canvas");
    canvas.width = size;
    canvas.height = size;
    const ctx = canvas.getContext("2d");
    if (!ctx) throw new Error("No se pudo preparar el lienzo para procesar la imagen.");
    ctx.drawImage(source, sx, sy, side, side, 0, 0, size, size);

    const blob = await new Promise<Blob | null>((resolve) =>
      canvas.toBlob(resolve, "image/webp", quality),
    );
    if (!blob) throw new Error("No se pudo generar la imagen final.");
    return blob;
  } finally {
    if (source instanceof ImageBitmap) source.close();
  }
}

/**
 * Decodifica `file` a algo dibujable en canvas. Usa `createImageBitmap` (rápido,
 * disponible en todo navegador moderno) y cae a un `<img>` decodificado solo si
 * esa API no existe (Safari muy viejo). `drawImage` acepta ambos tipos.
 */
async function loadImageSource(file: File): Promise<ImageBitmap | HTMLImageElement> {
  if (typeof createImageBitmap === "function") {
    return createImageBitmap(file);
  }
  const url = URL.createObjectURL(file);
  try {
    const img = new Image();
    await new Promise<void>((resolve, reject) => {
      img.onload = () => resolve();
      img.onerror = () => reject(new Error("No se pudo leer la imagen."));
      img.src = url;
    });
    return img;
  } finally {
    URL.revokeObjectURL(url);
  }
}
