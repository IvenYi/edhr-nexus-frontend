/**
 * 文本测量工具类
 * 使用 Canvas 测量文本宽度，支持批量测量
 */

interface TextMeasureOptions {
  /** 字体大小，默认 14px */
  fontSize?: string | number;
  /** 字体族，默认 'Arial, sans-serif' */
  fontFamily?: string;
  /** 字体粗细，默认 'normal' */
  fontWeight?: string | number;
  /** 字体样式，默认 'normal' */
  fontStyle?: string;
}

interface TextMeasureResult {
  /** 文本内容 */
  text: string;
  /** 计算得到的宽度 */
  width: number;
}

class TextMeasureUtil {
  private canvas: HTMLCanvasElement | null = null;
  private ctx: CanvasRenderingContext2D | null = null;

  /**
   * 获取 Canvas 上下文，懒加载创建
   */
  private getContext(): CanvasRenderingContext2D {
    if (!this.canvas) {
      this.canvas = document.createElement('canvas');
      this.ctx = this.canvas.getContext('2d');
      if (!this.ctx) {
        throw new Error('无法创建 Canvas 2D 上下文');
      }
    }
    return this.ctx!;
  }

  /**
   * 设置字体样式
   */
  private setFont(options: TextMeasureOptions = {}): void {
    const {
      fontSize = 14,
      fontFamily = 'Arial, sans-serif',
      fontWeight = 'normal',
      fontStyle = 'normal',
    } = options;

    const ctx = this.getContext();
    const fontSizeStr = typeof fontSize === 'number' ? `${fontSize}px` : fontSize;
    ctx.font = `${fontStyle} ${fontWeight} ${fontSizeStr} ${fontFamily}`;
  }

  /**
   * 测量单个文本的宽度
   *
   * @param text 要测量的文本
   * @param options 字体选项
   * @returns 文本宽度（像素）
   */
  measureText(text: string, options: TextMeasureOptions = {}): number {
    if (!text) return 0;

    this.setFont(options);
    const ctx = this.getContext();
    const metrics = ctx.measureText(text);
    return Math.ceil(metrics.width);
  }

  /**
   * 批量测量多段文本的宽度
   *
   * @param texts 要测量的文本数组
   * @param options 字体选项
   * @returns 包含每段文本和对应宽度的结果数组
   */
  measureTexts(texts: string[], options: TextMeasureOptions = {}): TextMeasureResult[] {
    if (!texts || texts.length === 0) return [];

    this.setFont(options);
    const ctx = this.getContext();

    return texts.map((text) => ({
      text,
      width: text ? Math.ceil(ctx.measureText(text).width) : 0,
    }));
  }

  /**
   * 获取文本的最大宽度
   *
   * @param texts 要测量的文本数组
   * @param options 字体选项
   * @returns 最大宽度（像素）
   */
  getMaxWidth(texts: string[], options: TextMeasureOptions = {}): number {
    const results = this.measureTexts(texts, options);
    return Math.max(...results.map((result) => result.width), 0);
  }

  /**
   * 获取文本的最小宽度
   *
   * @param texts 要测量的文本数组
   * @param options 字体选项
   * @returns 最小宽度（像素）
   */
  getMinWidth(texts: string[], options: TextMeasureOptions = {}): number {
    const results = this.measureTexts(texts, options);
    return Math.min(...results.map((result) => result.width), 0);
  }

  /**
   * 计算文本的总宽度（用于水平排列的文本）
   *
   * @param texts 要测量的文本数组
   * @param options 字体选项
   * @param spacing 文本间的间距，默认 0
   * @returns 总宽度（像素）
   */
  getTotalWidth(texts: string[], options: TextMeasureOptions = {}, spacing: number = 0): number {
    const results = this.measureTexts(texts, options);
    const totalTextWidth = results.reduce((sum, result) => sum + result.width, 0);
    const totalSpacing = Math.max(0, texts.length - 1) * spacing;
    return totalTextWidth + totalSpacing;
  }

  /**
   * 根据最大宽度截断文本，添加省略号
   *
   * @param text 原始文本
   * @param maxWidth 最大宽度
   * @param options 字体选项
   * @param ellipsis 省略号，默认 '...'
   * @param minChars 最少显示字符数，默认 0
   * @returns 截断后的文本
   */
  truncateText(
    text: string,
    maxWidth: number,
    options: TextMeasureOptions = {},
    ellipsis: string = '...',
    minChars: number = 0,
  ): string {
    if (!text) return '';

    const fullWidth = this.measureText(text, options);
    if (fullWidth <= maxWidth) return text;

    const ellipsisWidth = this.measureText(ellipsis, options);
    const availableWidth = maxWidth - ellipsisWidth;

    if (availableWidth <= 0) {
      // 如果设置了最少显示字符数，即使宽度不足也要显示
      if (minChars > 0) {
        const minText = text.substring(0, minChars);
        return minText + ellipsis;
      }
      return ellipsis;
    }

    // 二分法查找最长可显示的文本长度
    let left = minChars; // 从最少显示字符数开始
    let right = text.length;
    let result = minChars > 0 ? text.substring(0, minChars) : '';

    while (left <= right) {
      const mid = Math.floor((left + right) / 2);
      const substring = text.substring(0, mid);
      const substringWidth = this.measureText(substring, options);

      if (substringWidth <= availableWidth) {
        result = substring;
        left = mid + 1;
      } else {
        right = mid - 1;
      }
    }

    return result + ellipsis;
  }

  /**
   * 销毁资源
   */
  destroy(): void {
    this.canvas = null;
    this.ctx = null;
  }
}

// 创建单例实例
const textMeasureUtil = new TextMeasureUtil();

/**
 * 测量单个文本的宽度
 *
 * @param text 要测量的文本
 * @param options 字体选项
 * @returns 文本宽度（像素）
 */
export function measureText(text: string, options?: TextMeasureOptions): number {
  return textMeasureUtil.measureText(text, options);
}

/**
 * 批量测量多段文本的宽度
 *
 * @param texts 要测量的文本数组
 * @param options 字体选项
 * @returns 包含每段文本和对应宽度的结果数组
 */
export function measureTexts(texts: string[], options?: TextMeasureOptions): TextMeasureResult[] {
  return textMeasureUtil.measureTexts(texts, options);
}

/**
 * 获取文本的最大宽度
 *
 * @param texts 要测量的文本数组
 * @param options 字体选项
 * @returns 最大宽度（像素）
 */
export function getMaxTextWidth(texts: string[], options?: TextMeasureOptions): number {
  return textMeasureUtil.getMaxWidth(texts, options);
}

/**
 * 获取文本的最小宽度
 *
 * @param texts 要测量的文本数组
 * @param options 字体选项
 * @returns 最小宽度（像素）
 */
export function getMinTextWidth(texts: string[], options?: TextMeasureOptions): number {
  return textMeasureUtil.getMinWidth(texts, options);
}

/**
 * 计算文本的总宽度（用于水平排列的文本）
 *
 * @param texts 要测量的文本数组
 * @param options 字体选项
 * @param spacing 文本间的间距，默认 0
 * @returns 总宽度（像素）
 */
export function getTotalTextWidth(
  texts: string[],
  options?: TextMeasureOptions,
  spacing?: number,
): number {
  return textMeasureUtil.getTotalWidth(texts, options, spacing);
}

/**
 * 根据最大宽度截断文本，添加省略号
 *
 * @param text 原始文本
 * @param maxWidth 最大宽度
 * @param options 字体选项
 * @param ellipsis 省略号，默认 '...'
 * @param minChars 最少显示字符数，默认 0
 * @returns 截断后的文本
 */
export function truncateText(
  text: string,
  maxWidth: number,
  options?: TextMeasureOptions,
  ellipsis?: string,
  minChars?: number,
): string {
  return textMeasureUtil.truncateText(text, maxWidth, options, ellipsis, minChars);
}

export { TextMeasureUtil, type TextMeasureOptions, type TextMeasureResult };
