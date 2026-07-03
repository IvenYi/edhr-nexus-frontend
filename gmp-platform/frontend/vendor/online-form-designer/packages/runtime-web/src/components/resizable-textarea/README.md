# ResizableTextarea 组件

一个支持拖拽调整高度的 textarea 组件。

## 功能特点

- 支持拖拽调整高度
- 固定 `ns-resize` 鼠标图标（垂直调整）
- 支持最小/最大高度限制
- 支持禁用状态
- 响应式设计

## 使用方法

```tsx
import { ResizableTextarea } from '@/components/resizable-textarea';

// 基本使用
<ResizableTextarea
  v-model={value}
  placeholder="请输入内容..."
/>

// 带配置的使用
<ResizableTextarea
  v-model={value}
  placeholder="请输入内容..."
  rows={6}
  cols={60}
  minHeight={100}
  maxHeight={400}
  disabled={false}
  onInput={handleInput}
  onChange={handleChange}
  onFocus={handleFocus}
  onBlur={handleBlur}
/>
```

## Props

| 属性 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| modelValue | string | '' | 绑定值 |
| disabled | boolean | false | 是否禁用 |
| placeholder | string | '' | 占位符文本 |
| rows | number | 4 | 初始行数 |
| cols | number | 50 | 初始列数 |
| minHeight | number | 80 | 最小高度（px） |
| maxHeight | number | 300 | 最大高度（px） |

## Events

| 事件名 | 说明 | 回调参数 |
|--------|------|----------|
| update:modelValue | 值变化时触发 | (value: string) |
| input | 输入时触发 | (event: Event) |
| change | 值改变时触发 | (event: Event) |
| focus | 获得焦点时触发 | (event: FocusEvent) |
| blur | 失去焦点时触发 | (event: FocusEvent) |

## 交互行为

- **拖拽手柄**：位于 textarea 右下角，显示垂直调整图标（上下箭头）
- **拖拽操作**：只能垂直拖拽调整高度，受 `minHeight` 和 `maxHeight` 限制
- **视觉反馈**：拖拽时手柄高亮，防止文本选择
