function getCenterCrop(ctx, w, h) {
  const s = Math.min(w, h) * 0.7;
  const x = (w - s) / 2;
  const y = (h - s) / 2;
  return ctx.getImageData(x, y, s, s);
}

function edgeDetect(img) {
  const w = img.width;
  const h = img.height;
  const d = img.data;
  const out = new Uint8ClampedArray(d.length);
  for (let i = 0; i < d.length; i += 4) {
    const gray = (d[i] + d[i+1] + d[i+2]) / 3;
    const v = gray > 120 ? 255 : 0; 
    out[i] = out[i+1] = out[i+2] = v;
    out[i+3] = 255;
  }
  return new ImageData(out, w, h);
}

function analyzeShape(img) {
  const w = img.width, h = img.height;
  const d = img.data;
  let total = 0;
  let centerEmpty = 0;
  let rightLine = 0;
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      const i = (y * w + x) * 4;
      const isWhite = d[i] > 200;
      if (isWhite) {
        total++;
        if (x > w * 0.65 && y > h * 0.35 && y < h * 0.65)
          rightLine++;
      } else {
        if (x > w * 0.35 && x < w * 0.65 &&
            y > h * 0.35 && y < h * 0.65)
          centerEmpty++;
      }
    }
  }
  return {
    total,
    centerEmpty,
    rightLine
  };
}

function isLikelyG(sig, area) {
  return (
    sig.total > area * 0.35 &&     
    sig.centerEmpty > area * 0.08 &&
    sig.rightLine > area * 0.04     
  );
}
