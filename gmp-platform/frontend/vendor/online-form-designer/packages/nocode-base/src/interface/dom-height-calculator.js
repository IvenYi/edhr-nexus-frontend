/**
 * DOM 高度计算器
 * 优化版本：
 * 1. 使用 DocumentFragment 减少 DOM 操作
 * 2. 批量读取布局信息避免多次回流
 * 3. 使用 transform 替代定位，减少回流
 * 4. 实现计算结果缓存
 * 5. 支持批量异步计算
 */
function camelToKebab(camelCase) {
  return camelCase.replace(/[A-Z]/g, (match) => `-${match.toLowerCase()}`);
}

export class DOMHeightCalculator {
  constructor() {
    // 创建一个隐藏的容器用于测量
    this.measureContainer = document.createElement('div');
    this.measureContainer.style.cssText = `
            position: fixed;
            transform: translate(-9999px, -9999px);
            visibility: hidden;
            pointer-events: none;
            contain: strict;
            width: 0;
            height: 0;
        `;
    document.body.appendChild(this.measureContainer);

    // 初始化缓存
    this.cache = new Map();

    // 创建 DocumentFragment 用于批量操作
    this.fragment = document.createDocumentFragment();

    // 如果支持 ResizeObserver，创建一个用于监听尺寸变化
    if (typeof ResizeObserver !== 'undefined') {
      this.resizeObserver = new ResizeObserver((entries) => {
        entries.forEach((entry) => {
          const element = entry.target;
          const cacheKey = element.getAttribute('data-cache-key');
          if (cacheKey) {
            this.updateCache(cacheKey, entry.contentRect);
          }
        });
      });
    }
  }

  /**
   * 生成缓存键
   * @private
   */
  generateCacheKey(options) {
    return JSON.stringify({
      content: options.content instanceof HTMLElement ? options.content.outerHTML : options.content,
      width: options.width,
      style: options.style,
      tagName: options.tagName,
    });
  }

  /**
   * 更新缓存
   * @private
   */
  updateCache(key, metrics) {
    this.cache.set(key, {
      timestamp: Date.now(),
      metrics,
    });
  }

  /**
   * 计算指定内容在给定宽度下的实际渲染高度
   * 优化版本：批量读取布局信息，使用缓存
   * @param {Object} options 配置选项
   * @param {string|HTMLElement} options.content 要计算的内容（可以是HTML字符串或DOM元素）
   * @param {number} options.width 容器宽度（像素）
   * @param {Object} [options.style] 额外的样式配置
   * @param {string} [options.tagName='div'] 容器标签名
   * @returns {Object} 返回高度计算结果，包括内容高度、行数等信息
   */
  calculateHeight({ content, width, style = {}, tagName = 'div' }) {
    // 检查缓存
    const cacheKey = this.generateCacheKey({ content, width, style, tagName });
    const cached = this.cache.get(cacheKey);
    if (cached && Date.now() - cached.timestamp < 5000) {
      // 5秒缓存有效期
      return cached.metrics;
    }

    // 创建测量元素，使用 DocumentFragment 进行批处理
    const measureElement = document.createElement(tagName);
    measureElement.setAttribute('data-cache-key', cacheKey);

    // 批量设置样式以减少回流
    const cssText = [
      `width: ${width}px`,
      'position: static',
      'padding: 0',
      'border: none',
      'overflow: visible',
      'contain: content', // 创建新的包含块，减少重排影响
      ...Object.entries(style).map(([key, value]) => {
        const kebabKey = camelToKebab(key); // 转换属性名
        // 确保值是字符串（如需处理单位，可在这里扩展）
        return `${kebabKey}: ${value}`;
      }),
    ].join(';');
    measureElement.style.cssText = cssText;

    // 设置内容
    if (content instanceof HTMLElement) {
      measureElement.appendChild(content.cloneNode(true));
    } else {
      measureElement.innerHTML = content;
    }

    // 直接添加到测量容器
    this.measureContainer.appendChild(measureElement);

    // 批量读取布局信息，减少回流
    const computedStyle = window.getComputedStyle(measureElement);
    const metrics = {
      offsetHeight: measureElement.offsetHeight,
      scrollHeight: measureElement.scrollHeight,
      clientHeight: measureElement.clientHeight,
      lineHeight: parseInt(computedStyle.lineHeight) || 0,
    };

    // 计算结果
    const result = {
      height: metrics.offsetHeight,
      scrollHeight: metrics.scrollHeight,
      clientHeight: metrics.clientHeight,
      lineHeight: metrics.lineHeight,
      lines: 1,
      textContent: measureElement.textContent,
      style: {
        fontSize: computedStyle.fontSize,
        lineHeight: computedStyle.lineHeight,
        wordWrap: computedStyle.wordWrap,
        whiteSpace: computedStyle.whiteSpace,
      },
    };

    // 估算行数（如果可能）
    if (result.lineHeight > 0) {
      result.lines = Math.ceil(metrics.scrollHeight / metrics.lineHeight);
    }

    // 如果支持 ResizeObserver，添加监听
    if (this.resizeObserver) {
      this.resizeObserver.observe(measureElement);
    }

    // 更新缓存
    this.updateCache(cacheKey, result);

    // 清理元素
    // this.measureContainer.removeChild(measureElement);

    return result;
  }

  /**
   * 在给定最大高度下，计算最多能呈现多少纯文本内容
   * @param {Object} options
   * @param {string} options.content 纯文本字符串（必需）
   * @param {number} options.width 宽度（px，必需）
   * @param {Object} [options.style] 额外样式（camelCase 键）
   * @param {string} [options.tagName='div']
   * @param {number} options.maxHeight 最大高度（px，必需）
   * @param {boolean} [options.addEllipsis=false] 若截断，是否在可见末尾加 '…'（会确保省略号也在 maxHeight 内）
   * @returns {Object} {
   *   fits: boolean,
   *   totalHeight, visibleHeight, hiddenHeight,
   *   totalText, visibleText, hiddenText,
   *   charsShown, charsHidden, linesShown, lineHeight,
   *   visibleTextWithEllipsis? // 如果 addEllipsis 为 true，则返回此字段
   * }
   */
  calculateHeightWithMax({
    content,
    width,
    style = {},
    tagName = 'div',
    maxHeight,
    addEllipsis = false,
  }) {
    if (typeof content !== 'string') {
      throw new Error('calculateHeightWithMax: content must be a plain string');
    }
    if (typeof maxHeight !== 'number' || maxHeight <= 0) {
      throw new Error('calculateHeightWithMax requires a positive numeric maxHeight');
    }
    // 缓存键也包含 maxHeight 和 addEllipsis，因为结果依赖它们
    const cacheKey = JSON.stringify({
      content,
      width,
      style,
      tagName,
      maxHeight,
      addEllipsis,
      mode: 'withMax',
    });
    const cached = this.cache.get(cacheKey);
    if (cached && Date.now() - cached.timestamp < 5000) {
      return cached.metrics;
    }

    // 创建测量元素
    const el = document.createElement(tagName);
    el.setAttribute('data-cache-key', cacheKey);
    // 批量设置样式（使用 camelToKebab 转换）
    const cssText = [
      `width: ${width}px`,
      'position: static',
      'padding: 0',
      'border: none',
      'overflow: visible', // 需要读取 scrollHeight
      'contain: content',
      'white-space: pre-wrap', // 保留换行和空格行为
      ...Object.entries(style).map(([k, v]) => `${camelToKebab(k)}: ${v}`),
    ].join(';');
    el.style.cssText = cssText;

    // 填充全部文本以测总高度
    el.innerText = content;
    this.measureContainer.appendChild(el);

    const computedStyle = window.getComputedStyle(el);
    const totalScrollHeight = el.scrollHeight;
    const lineHeightPx = parseFloat(computedStyle.lineHeight) || 0;

    // 完全可见情况
    if (totalScrollHeight <= maxHeight) {
      const totalText = el.textContent || '';
      const lines = lineHeightPx > 0 ? Math.ceil(totalScrollHeight / lineHeightPx) : 1;
      // 清理
      this.measureContainer.removeChild(el);

      const result = {
        fits: true,
        totalHeight: totalScrollHeight,
        visibleHeight: totalScrollHeight,
        hiddenHeight: 0,
        totalText,
        visibleText: totalText,
        hiddenText: '',
        charsShown: totalText.length,
        charsHidden: 0,
        linesShown: lines,
        lineHeight: lineHeightPx,
      };
      this.updateCache(cacheKey, result);
      return result;
    }

    // 需要截断 —— 使用带初始猜测的二分查找（减少迭代）
    const fullText = content;
    let low = 0;
    let high = fullText.length;
    let best = 0;

    // 初始猜测：按高度比例估算字符数
    const ratio = Math.min(0.999, maxHeight / totalScrollHeight);
    let guess = Math.floor(fullText.length * ratio);
    // 保证 guess 在区间内
    guess = Math.max(0, Math.min(fullText.length, guess));
    // 先测试 guess，能减少后续二分步数
    const testFits = (mid) => {
      el.innerText = fullText.slice(0, mid);
      // 强制浏览器计算
      return el.scrollHeight <= maxHeight;
    };

    if (testFits(guess)) {
      best = guess;
      low = guess + 1;
      high = fullText.length;
    } else {
      best = 0;
      low = 0;
      high = guess - 1;
    }

    while (low <= high) {
      const mid = Math.floor((low + high) / 2);
      if (testFits(mid)) {
        best = mid;
        low = mid + 1;
      } else {
        high = mid - 1;
      }
    }

    // best 为最大可显示字符数
    const visibleText = fullText.slice(0, best);
    const hiddenText = fullText.slice(best);

    // 如果需要添加省略号，尝试把末尾替换为省略号并确保仍满足 maxHeight
    let visibleTextWithEllipsis;
    if (addEllipsis && best > 0) {
      // 先尝试直接在可见末尾加 '…'
      let cand = visibleText + '…';
      el.innerText = cand;
      if (el.scrollHeight <= maxHeight) {
        visibleTextWithEllipsis = cand;
      } else {
        // 否则逐步去掉几个字符再加省略号（通常不会很多次）
        let trim = Math.max(0, Math.min(10, best)); // 每次尝试最多去掉 10 个初始
        let ok = false;
        while (best > 0 && !ok) {
          best -= trim;
          cand = fullText.slice(0, best) + '…';
          el.innerText = cand;
          if (el.scrollHeight <= maxHeight) {
            visibleTextWithEllipsis = cand;
            ok = true;
            break;
          }
          // 缩减步长，避免过多循环
          trim = Math.max(1, Math.floor(trim / 2));
        }
        if (!ok) {
          visibleTextWithEllipsis = '…'; // 极端情况
        }
      }
    }

    // 读取最终 visibleHeight（基于当前 el 内容）
    el.innerText = visibleText;
    const visibleHeight = el.scrollHeight;
    const hiddenHeight = totalScrollHeight - visibleHeight;
    const linesShown = lineHeightPx > 0 ? Math.ceil(visibleHeight / lineHeightPx) : 1;

    // 清理
    this.measureContainer.removeChild(el);

    const result = {
      fits: false,
      totalHeight: totalScrollHeight,
      visibleHeight,
      hiddenHeight,
      totalText: fullText,
      visibleText,
      hiddenText,
      charsShown: visibleText.length,
      charsHidden: hiddenText.length,
      linesShown,
      lineHeight: lineHeightPx,
      ...(visibleTextWithEllipsis ? { visibleTextWithEllipsis } : {}),
    };

    this.updateCache(cacheKey, result);
    return result;
  }

  /**
   * 异步批量计算高度
   * @param {Array<Object>} items 要计算的项目数组
   * @returns {Promise<Array>} 计算结果数组
   */
  async calculateBatch(items) {
    return new Promise((resolve) => {
      requestAnimationFrame(() => {
        const results = items.map((item) => this.calculateHeight(item));
        resolve(results);
      });
    });
  }

  /**
   * 计算表格单元格的高度
   * @param {Object} options 配置选项
   * @param {string|HTMLElement} options.content 单元格内容
   * @param {number} options.width 单元格宽度
   * @param {Object} [options.style] 单元格样式
   * @returns {Object} 返回单元格高度计算结果
   */
  calculateTableCellHeight(options) {
    return this.calculateHeight({
      ...options,
      tagName: 'td',
      style: {
        display: 'table-cell',
        verticalAlign: 'top',
        wordWrap: 'break-word',
        whiteSpace: 'pre-wrap',
        ...options.style,
      },
    });
  }

  /**
   * 批量计算多个单元格的高度
   * 优化版本：使用 requestAnimationFrame 和 DocumentFragment 进行批量处理
   * @param {Array<Object>} cellsConfig 单元格配置数组
   * @returns {Promise<Array<Object>>} 返回每个单元格的高度计算结果
   */
  async calculateMultipleCells(cellsConfig) {
    // 检查是否所有配置都有缓存
    const cacheResults = cellsConfig.map((config) => {
      const cacheKey = this.generateCacheKey({ ...config, tagName: 'td' });
      return this.cache.get(cacheKey);
    });

    if (cacheResults.every((result) => result && Date.now() - result.timestamp < 5000)) {
      return cacheResults.map((cached) => cached.metrics);
    }

    // 使用 requestAnimationFrame 批量处理未缓存的计算
    return new Promise((resolve) => {
      requestAnimationFrame(() => {
        const fragment = document.createDocumentFragment();
        const elements = [];

        // 创建所有需要测量的元素
        cellsConfig.forEach((config, index) => {
          if (!cacheResults[index]) {
            const element = document.createElement('td');
            const cacheKey = this.generateCacheKey({ ...config, tagName: 'td' });
            element.setAttribute('data-cache-key', cacheKey);
            element.setAttribute('data-index', index.toString());

            // 批量设置样式
            const cssText = [
              `width: ${config.width}px`,
              'display: table-cell',
              'vertical-align: top',
              'word-wrap: break-word',
              'white-space: pre-wrap',
              'contain: content',
              ...Object.entries(config.style || {}).map(([key, value]) => `${key}: ${value}`),
            ].join(';');
            element.style.cssText = cssText;

            if (config.content instanceof HTMLElement) {
              element.appendChild(config.content.cloneNode(true));
            } else {
              element.innerHTML = config.content;
            }

            fragment.appendChild(element);
            elements.push(element);
          }
        });

        // 一次性添加所有元素
        this.measureContainer.appendChild(fragment);

        // 批量读取度量信息
        const results = cellsConfig.map((config, index) => {
          if (cacheResults[index]) {
            return cacheResults[index].metrics;
          }

          const element = elements[index];
          // const computedStyle = window.getComputedStyle(element);
          const metrics = {
            height: element.offsetHeight,
            scrollHeight: element.scrollHeight,
            clientHeight: element.clientHeight,
            lineHeight: parseInt(computedStyle.lineHeight) || 0,
            lines: 1,
            textContent: element.textContent,
            style: {
              fontSize: computedStyle.fontSize,
              lineHeight: computedStyle.lineHeight,
              wordWrap: computedStyle.wordWrap,
              whiteSpace: computedStyle.whiteSpace,
            },
          };

          if (metrics.lineHeight > 0) {
            metrics.lines = Math.ceil(metrics.scrollHeight / metrics.lineHeight);
          }

          // 更新缓存
          const cacheKey = element.getAttribute('data-cache-key');
          this.updateCache(cacheKey, metrics);

          return metrics;
        });

        // 清理
        while (this.measureContainer.firstChild) {
          this.measureContainer.removeChild(this.measureContainer.firstChild);
        }

        resolve(results);
      });
    });
  }

  /**
   * 销毁测量容器和清理资源
   */
  destroy() {
    if (this.resizeObserver) {
      this.resizeObserver.disconnect();
    }
    if (this.measureContainer && this.measureContainer.parentNode) {
      this.measureContainer.parentNode.removeChild(this.measureContainer);
    }
    this.cache.clear();
  }
}
