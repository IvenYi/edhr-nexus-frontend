export { CountLatch } from './count-latch/count-latch';
export { ResultAwaiter } from './count-latch/result-awaiter';
export { isMultipleOperator } from './design/design';
export { calcDndInsertPos } from './gct-dnd/gct-dnd';
export { Modal } from './modal/modal';
export { Namespace } from './namespace/namespace';
export { widthEditorInstall, widthTableEditorInstall } from './width-install/width-install';
export {
  afterValueSet,
  afterFieldSet,
  emitFieldSet,
  parseValueUnit,
  computedEx,
  cacheFnReturn,
} from './value-helper/value-helper';
export { modelLoader } from './model-loader/model-loader';
export { formulaFilter, deptFilter } from './field-filter/index';
export * from './data-prems/utils';
export * from './text-measure/text-measure';

export * from './util';

/**
 * 阻止事件冒泡
 *
 * @export
 * @param {Event} e 事件对象
 */
export function stopEvent(e: Event) {
  e.stopPropagation();
}

/**
 * 阻止默认事件，同时阻止冒泡
 *
 * @export
 * @param {Event} e
 */
export function stopDefaultEvent(e: Event) {
  stopEvent(e);
  e.preventDefault();
}

/**
 * 国际化翻译函数
 *
 * @export
 * @param {string} key
 * @param {...any[]} args
 * @returns {*}  {string}
 */
export function t(key: string, ...args: any[]): string {
  return (window as any).$t(key, ...args);
}

export function createWhiteImageWithText(name: string, width: number, height: number): string {
  // 创建 canvas 元素
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;

  const ctx = canvas.getContext('2d')!;
  // 填充白色背景
  ctx.fillStyle = '#ffffff';
  ctx.fillRect(0, 0, width, height);

  // 初始字体大小，根据图片高度的三分之一
  let fontSize = Math.floor(height / 3);
  ctx.font = `${fontSize}px Arial`;

  // 文本换行函数，按字符逐个添加测试是否超过最大宽度（此处取 canvas 宽度的 90%）
  function wrapText(text: string, maxWidth: number, context: CanvasRenderingContext2D): string[] {
    const characters = text.split('');
    const lines: string[] = [];
    let currentLine = '';
    for (const char of characters) {
      const testLine = currentLine + char;
      const metrics = context.measureText(testLine);
      if (metrics.width > maxWidth && currentLine !== '') {
        lines.push(currentLine);
        currentLine = char;
      } else {
        currentLine = testLine;
      }
    }
    if (currentLine) {
      lines.push(currentLine);
    }
    return lines;
  }

  // 设置最大文本宽度（90% 的 canvas 宽度）
  const maxTextWidth = width * 0.9;
  let lines = wrapText(name, maxTextWidth, ctx);

  // 调整行高比例为 1.2 倍字体大小
  let lineHeight = fontSize * 1.2;

  // 如果换行后总文本高度超出 canvas 高度，则缩小字体，并重新计算换行与行高
  while (lines.length * lineHeight > height && fontSize > 10) {
    fontSize--;
    lineHeight = fontSize * 1.2;
    ctx.font = `${fontSize}px Arial`;
    lines = wrapText(name, maxTextWidth, ctx);
  }

  // 计算整体文本显示区域的起始 y 坐标（垂直居中）
  const totalTextHeight = lines.length * lineHeight;
  const startY = (height - totalTextHeight) / 2 + lineHeight / 2;

  // 设置文本样式
  ctx.fillStyle = '#000000';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';

  // 绘制每一行文本
  lines.forEach((line, index) => {
    ctx.fillText(line, width / 2, startY + index * lineHeight);
  });

  // 返回图片 base64 编码（png 格式）
  return canvas.toDataURL('image/png');
}
