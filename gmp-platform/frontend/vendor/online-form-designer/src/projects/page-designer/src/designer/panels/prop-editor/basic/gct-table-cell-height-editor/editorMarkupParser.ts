/**
 * 编辑器标记解析工具
 * 支持在 radio 选项标签文本中内嵌编辑器标记
 * 标记格式：{editor:type:key}
 * 示例：`显示最多{editor:number:cellHeight}行`
 */

export type EditorType = 'number' | 'text';

export interface EditorSegment {
  type: 'editor';
  editorType: EditorType;
  key: string;
}

export interface TextSegment {
  type: 'text';
  content: string;
}

export type MarkupSegment = TextSegment | EditorSegment;

export interface NumberEditorConfig {
  min?: number;
  max?: number;
  decimalSeparator?: number;
  defaultValue?: number;
  step?: number;
}

export interface TextEditorConfig {
  maxlength?: number;
  placeholder?: string;
}

export type EditorConfig = NumberEditorConfig | TextEditorConfig;

export interface MarkupOptionEditorConfig {
  number?: NumberEditorConfig;
  text?: TextEditorConfig;
  i18nData?: Record<string, string>;
}

const MARKUP_REGEX = /\{editor\|(number|text)\|([a-zA-Z0-9_]+)\}/g;

/**
 * 判断标签文本中是否包含编辑器标记
 */
export function hasEditorMarkup(text: string): boolean {
  MARKUP_REGEX.lastIndex = 0;
  return MARKUP_REGEX.test(text);
}

/**
 * 解析标签文本中的编辑器标记，返回分段数组
 * @param text - 可能包含标记的标签文本
 * @returns 文本段和编辑器段的混合数组
 */
export function parseEditorMarkup(text: string): MarkupSegment[] {
  const segments: MarkupSegment[] = [];
  let lastIndex = 0;
  const regex = new RegExp(MARKUP_REGEX.source, 'g');
  let match: RegExpExecArray | null;

  while ((match = regex.exec(text)) !== null) {
    if (match.index > lastIndex) {
      segments.push({ type: 'text', content: text.slice(lastIndex, match.index) });
    }
    segments.push({
      type: 'editor',
      editorType: match[1] as EditorType,
      key: match[2],
    });
    lastIndex = match.index + match[0].length;
  }

  if (lastIndex < text.length) {
    segments.push({ type: 'text', content: text.slice(lastIndex) });
  }

  return segments;
}

/**
 * 从 option 配置中提取编辑器配置
 * @param editorType - 编辑器类型
 * @param optionConfig - option 项中的 _config 配置（可选）
 */
export function resolveEditorConfig(
  editorType: EditorType,
  optionConfig?: MarkupOptionEditorConfig,
): EditorConfig {
  return optionConfig?.[editorType] ?? {};
}
