const video = document.getElementById("video");
const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");
let unlocked = false;
let stable = 0;
navigator.mediaDevices.getUserMedia({
  video: { facingMode: "environment" }
}).then(s => video.srcObject = s);

function detectFast() {
  if (unlocked) return;
  const W = 96, H = 96;
  canvas.width = W;
  canvas.height = H;
  ctx.drawImage(video, 0, 0, W, H);
  const img = ctx.getImageData(0, 0, W, H).data;
  let brightCount = 0;
  for (let i = 0; i < img.length; i += 4) {
    if (img[i] > 200 && img[i+1] > 200 && img[i+2] > 200)
      brightCount++;
  }

  if (brightCount < 400) {
    stable = 0;
    requestAnimationFrame(detectFast);
    return;
  }

  let minX = W, minY = H, maxX = 0, maxY = 0;
  for (let y = 0; y < H; y++) {
    for (let x = 0; x < W; x++) {
      const i = (y * W + x) * 4;
      if (img[i] > 200) {
        minX = Math.min(minX, x);
        minY = Math.min(minY, y);
        maxX = Math.max(maxX, x);
        maxY = Math.max(maxY, y);
      }
    }
  }

  const bw = maxX - minX;
  const bh = maxY - minY;
  if (bw < 40 || bh < 40) {
    stable = 0;
    requestAnimationFrame(detectFast);
    return;
  }
  let midY = Math.floor((minY + maxY) / 2);
  let leftHit = 0, rightHit = 0;
  for (let x = minX; x < maxX; x++) {
    const i = (midY * W + x) * 4;
    if (img[i] > 200) {
      if (x < W / 2) leftHit++;
      else rightHit++;
    }
  }
  const ratio = rightHit / (leftHit + 1);
  if (ratio > 2.2) {
    stable++;
  } else {
    stable = 0;
  }

  if (stable >= 3) {
    unlocked = true;
    sessionStorage.setItem("G_ACCESS", "1");
    setTimeout(() => location.href = "secret.html", 200);
    return;
  }
  requestAnimationFrame(detectFast);
}

video.onloadedmetadata = () => detectFast();
