# Videos de fondo (loops Seedance)

Dejá acá los videos generados en Seedance, ya comprimidos para web.

## Hero (lo lee `components/HeroVideo.tsx` automáticamente)
- `hero-loop.webm`
- `hero-loop.mp4`

Si estos archivos no existen, el Hero muestra la foto `public/img/hero.webp`.
Lo mismo si el visitante tiene activado `prefers-reduced-motion`.

## Producto (opcional)
- `prod-colageno-loop.webm` / `prod-colageno-loop.mp4`

## Compresión recomendada (ffmpeg)
```bash
ffmpeg -i origen.mp4 -an -movflags +faststart -vcodec libx264 -crf 24 -preset slow -vf "scale=1920:-2" hero-loop.mp4
ffmpeg -i origen.mp4 -an -c:v libvpx-vp9 -crf 33 -b:v 0 -vf "scale=1920:-2" hero-loop.webm
```

Los prompts para generar estos videos están en `PROMPTS-SEEDANCE.md` (raíz del proyecto).
