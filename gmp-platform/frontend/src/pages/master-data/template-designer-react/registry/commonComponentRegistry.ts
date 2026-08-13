import type { CanvasNode } from '../types';

export type CommonDisplayComponentId =
  | 'text'
  | 'image'
  | 'page-number'
  | 'barcode'
  | 'qr-code'
  | 'header-columns'
  | 'superscript'
  | 'line'
  | 'serial-number'
  | 'time-difference';

type CommonDisplayComponentDefinition = {
  id: CommonDisplayComponentId;
  label: string;
  icon: 'text' | 'image' | 'page' | 'barcode' | 'qr' | 'columns' | 'superscript' | 'line' | 'serial' | 'time';
  nodeType: string;
  props: Record<string, unknown>;
  style: Record<string, unknown>;
};

export const commonDisplayComponents: CommonDisplayComponentDefinition[] = [
  { id: 'text', label: '文本', icon: 'text', nodeType: 'static-text', props: { text: '文本' }, style: { compWidth: 180, compHeight: 40 } },
  { id: 'image', label: '图片', icon: 'image', nodeType: 'static-image', props: { src: '', alt: '图片' }, style: { compWidth: 180, compHeight: 110 } },
  { id: 'page-number', label: '页码', icon: 'page', nodeType: 'static-text', props: { text: '第 1 页' }, style: { compWidth: 96, compHeight: 32, textAlign: 'center' } },
  { id: 'barcode', label: '条码', icon: 'barcode', nodeType: 'display-barcode', props: { value: '1234567890' }, style: { compWidth: 180, compHeight: 56 } },
  { id: 'qr-code', label: '二维码', icon: 'qr', nodeType: 'display-qr-code', props: { value: '二维码' }, style: { compWidth: 92, compHeight: 92 } },
  { id: 'header-columns', label: '表头分栏', icon: 'columns', nodeType: 'display-header-columns', props: { leftText: '左侧标题', rightText: '右侧标题' }, style: { compWidth: 360, compHeight: 36 } },
  { id: 'superscript', label: '次幂', icon: 'superscript', nodeType: 'static-text', props: { text: 'x²' }, style: { compWidth: 72, compHeight: 36, fontSize: 20 } },
  { id: 'line', label: '线条', icon: 'line', nodeType: 'display-line', props: {}, style: { compWidth: 240, compHeight: 12 } },
  { id: 'serial-number', label: '序号', icon: 'serial', nodeType: 'static-text', props: { text: '1.' }, style: { compWidth: 48, compHeight: 32, textAlign: 'center' } },
  { id: 'time-difference', label: '时间差', icon: 'time', nodeType: 'static-text', props: { text: '时间差' }, style: { compWidth: 96, compHeight: 32 } },
];

function createId(prefix: string) {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return `${prefix}-${crypto.randomUUID()}`;
  }
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

export function createCommonDisplayNode(
  componentId: CommonDisplayComponentId,
  position: { left: number; top: number },
): CanvasNode {
  const definition = commonDisplayComponents.find((component) => component.id === componentId) ?? commonDisplayComponents[0];

  return {
    id: createId(`common-${definition.id}`),
    type: definition.nodeType,
    parentId: null,
    children: [],
    props: { ...definition.props },
    style: {
      position: 'absolute',
      compLeft: Math.max(0, Math.round(position.left)),
      compTop: Math.max(0, Math.round(position.top)),
      ...definition.style,
    },
    bindings: {},
  };
}
