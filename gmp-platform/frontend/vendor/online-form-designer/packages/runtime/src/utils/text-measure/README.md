# 文字测量工具 (Text Measure Utility)

一个基于 Canvas 的文字宽度测量工具，支持单个文字和批量文字的精确测量。

## 功能特性

- ✅ **精确测量**: 使用 Canvas 2D 上下文进行精确的文字宽度计算
- ✅ **批量处理**: 支持同时测量多段文字的独立宽度
- ✅ **字体配置**: 支持自定义字体大小、字体族、字体粗细等属性
- ✅ **实用工具**: 提供最大/最小宽度、总宽度计算、文字截断等实用功能
- ✅ **高性能**: 使用单例模式和懒加载，避免重复创建 Canvas 元素
- ✅ **TypeScript**: 完整的 TypeScript 类型支持

## 快速开始

### 基础用法

```typescript
import { measureText, measureTexts } from '@gct/runtime/utils';

// 测量单个文字
const width = measureText('Hello World');
console.log(width); // 输出: 55 (像素)

// 测量多段文字
const texts = ['短文字', '中等长度文字', '很长很长的文字内容'];
const results = measureTexts(texts);
console.log(results);
// 输出: [
//   { text: '短文字', width: 42 },
//   { text: '中等长度文字', width: 84 },
//   { text: '很长很长的文字内容', width: 126 }
// ]
```

### 自定义字体样式

```typescript
import { measureText, type TextMeasureOptions } from '@gct/runtime/utils';

const options: TextMeasureOptions = {
  fontSize: 16,
  fontFamily: 'Microsoft YaHei, sans-serif',
  fontWeight: 'bold',
  fontStyle: 'normal'
};

const width = measureText('你好世界', options);
```

### 实用工具函数

```typescript
import {
  getMaxTextWidth,
  getMinTextWidth,
  getTotalTextWidth,
  truncateText
} from '@gct/runtime/utils';

const texts = ['短', '中等长度', '很长很长的文字'];

// 获取最大宽度
const maxWidth = getMaxTextWidth(texts);

// 获取最小宽度
const minWidth = getMinTextWidth(texts);

// 计算总宽度（水平排列，含间距）
const totalWidth = getTotalTextWidth(texts, undefined, 10); // 10px 间距

// 文字截断
const longText = '这是一段很长的文字内容';
const truncated = truncateText(longText, 100); // 限制在 100px 内
```

## API 参考

### 类型定义

```typescript
interface TextMeasureOptions {
  fontSize?: string | number;    // 字体大小，默认 14px
  fontFamily?: string;           // 字体族，默认 'Arial, sans-serif'
  fontWeight?: string | number;  // 字体粗细，默认 'normal'
  fontStyle?: string;            // 字体样式，默认 'normal'
}

interface TextMeasureResult {
  text: string;     // 文字内容
  width: number;    // 计算得到的宽度
}
```

### 函数列表

#### `measureText(text: string, options?: TextMeasureOptions): number`

测量单个文字的宽度。

- **参数**:
  - `text`: 要测量的文字
  - `options`: 可选的字体配置
- **返回**: 文字宽度（像素）

#### `measureTexts(texts: string[], options?: TextMeasureOptions): TextMeasureResult[]`

批量测量多段文字的宽度。

- **参数**:
  - `texts`: 要测量的文字数组
  - `options`: 可选的字体配置
- **返回**: 包含文字和宽度的结果数组

#### `getMaxTextWidth(texts: string[], options?: TextMeasureOptions): number`

获取文字数组中的最大宽度。

#### `getMinTextWidth(texts: string[], options?: TextMeasureOptions): number`

获取文字数组中的最小宽度。

#### `getTotalTextWidth(texts: string[], options?: TextMeasureOptions, spacing?: number): number`

计算文字数组的总宽度（用于水平排列）。

- **参数**:
  - `spacing`: 文字间的间距，默认 0

#### `truncateText(text: string, maxWidth: number, options?: TextMeasureOptions, ellipsis?: string): string`

根据最大宽度截断文字，添加省略号。

- **参数**:
  - `maxWidth`: 最大允许宽度
  - `ellipsis`: 省略号，默认 '...'

## 实际应用场景

### 1. 动态调整表格列宽

```typescript
function calculateColumnWidth(columnData: string[]) {
  const maxWidth = getMaxTextWidth(columnData, {
    fontSize: 14,
    fontFamily: 'Arial, sans-serif'
  });

  return Math.min(maxWidth + 20, 300); // 加上 padding，最大 300px
}
```

### 2. 自动文字换行

```typescript
function wrapText(text: string, maxLineWidth: number) {
  const words = text.split(' ');
  const lines: string[] = [];
  let currentLine = '';

  for (const word of words) {
    const testLine = currentLine ? `${currentLine} ${word}` : word;
    const lineWidth = measureText(testLine);

    if (lineWidth <= maxLineWidth) {
      currentLine = testLine;
    } else {
      if (currentLine) lines.push(currentLine);
      currentLine = word;
    }
  }

  if (currentLine) lines.push(currentLine);
  return lines;
}
```

### 3. 响应式字体大小

```typescript
function getResponsiveFontSize(text: string, maxWidth: number) {
  let fontSize = 20;

  while (fontSize > 10) {
    const width = measureText(text, { fontSize });
    if (width <= maxWidth) return fontSize;
    fontSize--;
  }

  return 10;
}
```

## 性能优化

- 使用单例模式，避免重复创建 Canvas 元素
- 懒加载创建 Canvas 上下文
- 批量测量时复用字体设置
- 文字截断使用二分法查找，提高效率

## 注意事项

1. **浏览器兼容性**: 需要支持 Canvas 2D 的浏览器
2. **字体加载**: 确保自定义字体已加载完成再进行测量
3. **精度**: 使用 `Math.ceil()` 向上取整，确保宽度足够
4. **内存管理**: 长时间不使用时可调用 `TextMeasureUtil.destroy()` 释放资源
