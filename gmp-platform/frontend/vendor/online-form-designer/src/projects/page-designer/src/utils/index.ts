export { isDropAllowed } from './is-drop-put/is-drop-put';
export { isSortFiled } from './is-sort-filed/is-sort-filed';

export { findAllChildrenTypes } from './find-deep-types/find-deep-types';


/**
 * 计算配置样式
 *
 * @param data
 * @param ignoringStyle
 * @returns
 */
export const calcStyle = (data: IData, ignoringStyle: string[] = []): any => {
  if (!data) {
    return {};
  }
  const style: any = {};
  // padding 配置
  if (data.paddingTop && data.paddingTop != '0' && !ignoringStyle.includes('paddingTop'))
    style['padding-top'] = `${data.paddingTop}px`;
  if (data.paddingRight && data.paddingRight != '0' && !ignoringStyle.includes('paddingRight'))
    style['padding-right'] = `${data.paddingRight}px`;
  if (data.paddingBottom && data.paddingBottom != '0' && !ignoringStyle.includes('paddingBottom'))
    style['padding-bottom'] = `${data.paddingBottom}px`;
  if (data.paddingLeft && data.paddingLeft != '0' && !ignoringStyle.includes('paddingLeft'))
    style['padding-left'] = `${data.paddingLeft}px`;
  // margin 配置
  if (data.marginTop && data.marginTop != '0' && !ignoringStyle.includes('marginTop'))
    style['margin-top'] = `${data.marginTop}px`;
  if (data.marginRight && data.marginRight != '0' && !ignoringStyle.includes('marginRight'))
    style['margin-right'] = `${data.marginRight}px`;
  if (data.marginBottom && data.marginBottom != '0' && !ignoringStyle.includes('marginBottom'))
    style['margin-bottom'] = `${data.marginBottom}px`;
  if (data.marginLeft && data.marginLeft != '0' && !ignoringStyle.includes('marginLeft'))
    style['margin-left'] = `${data.marginLeft}px`;
  // 背景颜色
  if (data.backgroundColor && !ignoringStyle.includes('backgroundColor')) {
    style['background-color'] = data.backgroundColor;
  }
  // 宽度
  if (data.width != null && data.width != '' && !ignoringStyle.includes('width')) {
    style.width = `${data.width}px`;
  }
  // 高度
  if (data.height != null && data.height != '' && !ignoringStyle.includes('height')) {
    style.height = `${data.height}px`;
    style.overflowX = 'hidden';
    style.overflowY = 'auto';
  }
  // 定位
  const position = data.position;
  if (position && !ignoringStyle.includes('zIndex')) {
    style.position = position;
    style['z-index'] = 1;
  }
  if (data.top && !ignoringStyle.includes('top')) style.top = `${data.top}px`;
  if (data.right && !ignoringStyle.includes('right')) style.right = `${data.right}px`;
  if (data.bottom && !ignoringStyle.includes('bottom')) style.bottom = `${data.bottom}px`;
  if (data.left && !ignoringStyle.includes('left')) style.left = `${data.left}px`;
  // 边
  if (data.borderBottomLeftRadius && !ignoringStyle.includes('borderBottomLeftRadius')) {
    style['border-top-left-radius'] = `${data.borderBottomLeftRadius}px`;
  }
  if (data.borderTopRightRadius && !ignoringStyle.includes('borderTopRightRadius')) {
    style['border-top-right-radius'] = `${data.borderTopRightRadius}px`;
  }
  if (data.borderBottomLeftRadius && !ignoringStyle.includes('borderBottomLeftRadius')) {
    style['border-bottom-left-radius'] = `${data.borderBottomLeftRadius}px`;
  }
  if (data.borderBottomRightRadius && !ignoringStyle.includes('borderBottomRightRadius')) {
    style['border-bottom-right-radius'] = `${data.borderBottomRightRadius}px`;
  }
  // 边框样式
  {
    const top = data.borderTop;
    if (top) {
      if (top.borderColor && !ignoringStyle.includes('borderTopColor')) {
        style['border-top-color'] = top.borderColor;
      }
      if (top.borderWidth && !ignoringStyle.includes('borderTopWidth')) {
        style['border-top-width'] = `${top.borderWidth}px`;
      }
      if (top.borderStyle && !ignoringStyle.includes('borderTopStyle')) {
        style['border-top-style'] = top.borderStyle;
      }
    }
    const right = data.borderRight;
    if (right) {
      if (right.borderColor && !ignoringStyle.includes('borderRightColor')) {
        style['border-right-color'] = right.borderColor;
      }
      if (right.borderWidth && !ignoringStyle.includes('borderRightWidth')) {
        style['border-right-width'] = `${right.borderWidth}px`;
      }
      if (right.borderStyle && !ignoringStyle.includes('borderRightStyle')) {
        style['border-right-style'] = right.borderStyle;
      }
    }
    const bottom = data.borderBottom;
    if (bottom) {
      if (bottom.borderColor && !ignoringStyle.includes('borderBottomColor')) {
        style['border-bottom-color'] = bottom.borderColor;
      }
      if (bottom.borderWidth && !ignoringStyle.includes('borderBottomWidth')) {
        style['border-bottom-width'] = `${bottom.borderWidth}px`;
      }
      if (bottom.borderStyle && !ignoringStyle.includes('borderBottomStyle')) {
        style['border-bottom-style'] = bottom.borderStyle;
      }
    }
    const left = data.borderLeft;
    if (left) {
      if (left.borderColor && !ignoringStyle.includes('borderLeftColor')) {
        style['border-left-color'] = left.borderColor;
      }
      if (left.borderWidth && !ignoringStyle.includes('borderLeftWidth')) {
        style['border-left-width'] = `${left.borderWidth}px`;
      }
      if (left.borderStyle && !ignoringStyle.includes('borderLeftStyle')) {
        style['border-left-style'] = left.borderStyle;
      }
    }
  }
  return style;
};

/**字符串生成临时显示的图片 */
// export function createWhiteImageWithText(name, width, height) {
//   // 创建 canvas 元素
//   const canvas = document.createElement('canvas');
//   canvas.width = width;
//   canvas.height = height;

//   const ctx = canvas.getContext('2d')!;
//   // 填充白色背景
//   ctx.fillStyle = '#ffffff';
//   ctx.fillRect(0, 0, width, height);

//   // 设置文本样式：根据宽高动态计算合适的字体大小
//   const fontSize = Math.floor(height / 3);
//   ctx.font = `${fontSize}px Arial`;
//   ctx.fillStyle = '#000000'; // 设置文本颜色
//   ctx.textAlign = 'center';
//   ctx.textBaseline = 'middle';

//   // 在 canvas 中心绘制文本
//   ctx.fillText(name, width / 2, height / 2);

//   // 返回图片 base64 编码（png 格式）
//   return canvas.toDataURL('image/png');
// }
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
