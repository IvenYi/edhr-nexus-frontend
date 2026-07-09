const canvas = document.createElement('canvas');

canvas.width = 800;
canvas.height = 600;

const ctx = canvas.getContext('2d') as CanvasRenderingContext2D;

function drawSVGIcon(svgString, x, y, size) {
  const img = new Image();
  img.src = 'data:image/svg+xml;base64,' + btoa(svgString);
  img.onload = function () {
    ctx.drawImage(img, x, y, size, size);
  };
}

// 绘制圆角矩形
function drawRoundedRect(x, y, width, height, radius) {
  ctx.beginPath();
  ctx.moveTo(x + radius, y);
  ctx.arcTo(x + width, y, x + width, y + height, radius);
  ctx.arcTo(x + width, y + height, x, y + height, radius);
  ctx.arcTo(x, y + height, x, y, radius);
  ctx.arcTo(x, y, x + width, y, radius);
  ctx.closePath();
  ctx.fillStyle = '#4CAF50'; // 矩形填充颜色
  ctx.fill();
}
