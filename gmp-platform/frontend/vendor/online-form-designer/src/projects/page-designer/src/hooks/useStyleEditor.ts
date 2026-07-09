import { computed, nextTick } from 'vue';
import { useSelectedWidget } from '/@page-designer/hooks/useSelectedWidget';
import { LowCodeWidget } from '/@page-designer/types/widget-basic-types';
import { LowCodeModal } from '/@page-designer/types/modal-types';
import { isString, isObject } from '/@/utils/is';
import { useDesigner } from '/@page-designer/hooks/useDesigner';

export const props = {
  editor: {
    type: Object as PropType<LowCodeWidget.StyleEditor>,
    default: {},
  },
  widget: {
    type: Object as PropType<LowCodeWidget.BasicSchema | LowCodeModal.Modal>,
  },
  propConfig: {
    type: Object,
    default: {},
  },
};
export const presetColor = [
  '#DBDBDB',
  '#FFE4E4',
  '#D1D1D1',
  '#838383',
  '#838383',
  '#FFEECB',
  '#D8E3FF',
  '#FF8888',
  '#FF8888',
  '#0DAA9C',
  '#3370FF',
];
const { selectedStyle, selectedRef } = useSelectedWidget();
const { emitCache } = useDesigner();
export function useStyleEditor<T = any>(editor) {
  const styleValue = computed({
    get() {
      return getValue(editor.name) as T;
    },
    set(val) {
      setValue(val, editor.name);
      if (!!editor.changeCallback && typeof editor.changeCallback === 'function') {
        nextTick().then(() => {
          editor.changeCallback!(selectedRef.value, val);
        });
      }
      emitCache();
    },
  });
  return {
    styleValue,
  };
}
//propName支持字符串链式调用    对象情况支持多字段
function setValue(value, name) {
  if (isString(name)) {
    const keyslist = name.split('.');
    const len = keyslist.length - 1;
    keyslist.reduce((memo, cur, index) => {
      if (index === len) {
        memo[cur] = value;
      }
      return memo[cur];
    }, selectedStyle.value);
  }
  if (isObject(name)) {
    const valueMap = value;
    for (const key in name) {
      const valKey = name[key];
      setValue(valueMap[key], valKey);
    }
  }
}
function getValue(name) {
  if (isString(name)) {
    const keyslist = name.split('.');
    return keyslist.reduce((memo, cur) => memo[cur], selectedStyle.value);
  }
  if (isObject(name)) {
    const valueMap = {};
    for (const key in name) {
      const valKey: string = name[key];
      valueMap[key] = getValue(valKey);
    }
    return valueMap;
  }
}

export const btnTypeColor = [
  {
    type: 'primary',
    danger: false,
    fontColor: '#fff',
    backgroundColor: '--ant-primary-color',
  },
  {
    type: 'default',
    danger: false,
    fontColor: 'rgba(0, 0, 0, 0.85)',
    backgroundColor: '#E8EBF0',
  },
  {
    type: 'primary',
    danger: true,
    fontColor: '#fff',
    backgroundColor: '--ant-error-color',
  },
  {
    type: 'default',
    danger: true,
    fontColor: '--ant-error-color',
    backgroundColor: '--ant-error-color',
  },
  {
    type: 'dashed',
    danger: false,
    fontColor: 'rgba(0, 0, 0, 0.85)',
    backgroundColor: '#E8EBF0',
  },
  {
    type: 'link',
    danger: false,
    fontColor: '--ant-primary-color',
    backgroundColor: '',
  },
];

export const shadeColor = (color) => {
  let r,
    g,
    b,
    a: any = 1;
  let colorStr = '';
  if (color.indexOf('rgba(') > -1) {
    colorStr = color.replace('rgba(', '').replace(')', '');
    [r, g, b, a] = colorStr.split(',');
  } else if (color.indexOf('rgb(') > -1) {
    colorStr = color.replace('rgb(', '').replace(')', '');
    [r, g, b] = colorStr.split(',');
  }
  return rgba2hex(r, g, b, a);
};

export function rgba2hex(r, g, b, a = 1) {
  r = parseInt(r);
  const r1 = r.toString(16).length !== 2 ? '0' + r.toString(16) : r.toString(16);
  g = parseInt(g);
  const g1 = g.toString(16).length !== 2 ? '0' + g.toString(16) : g.toString(16);
  b = parseInt(b);
  const b1 = b.toString(16).length !== 2 ? '0' + b.toString(16) : b.toString(16);
  a = parseFloat(a);
  let a1 = '';
  if (a !== 1) {
    const temp = Math.floor(256 * a);
    a1 = temp.toString(16).length !== 2 ? '0' + temp.toString(16) : temp.toString(16);
  }
  return `#${r1}${g1}${b1}${a1}`.toUpperCase();
}
