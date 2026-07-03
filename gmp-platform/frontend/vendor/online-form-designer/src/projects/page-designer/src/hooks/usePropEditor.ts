import { computed, nextTick } from 'vue';
import { useSelectedWidget } from '/@page-designer/hooks/useSelectedWidget';
import { LowCodeWidget } from '/@page-designer/types/widget-basic-types';
import { LowCodeModal } from '/@page-designer/types/modal-types';
import { isString, isObject } from '/@/utils/is';
import { useDesigner } from '/@page-designer/hooks/useDesigner';

export const props = {
  propName: {
    type: [String, Object],
    default: '',
  },
  propConfig: {
    type: Object as PropType<Partial<LowCodeWidget.PropEditorConfig>>,
    default: {},
  },
  changeCallback: {
    type: Function,
  },
  required: {
    type: Boolean,
    default: false,
  },
  validate: {
    type: Promise<any>,
  },
  widget: {
    type: Object as PropType<LowCodeWidget.BasicSchema | LowCodeModal.Modal>,
  },
};
/**判断是否重根路径链路最总 */
const regRoot = /^root:/;
const { selectedProps, selectedRef } = useSelectedWidget();
const { emitCache } = useDesigner();
export function usePropEditor<T = any>(propName, changeCallback, globData = {}) {
  const propValue = computed<T>({
    get() {
      //**value null 触发后续逻辑 */
      return (getValue(propName) as T) ?? globData?.[propName];
    },
    set(val) {
      setValue(val, propName);
      if (!!changeCallback && typeof changeCallback === 'function') {
        nextTick().then(() => {
          changeCallback!(selectedRef.value, val);
        });
      }
      emitCache();
    },
  });
  return {
    propValue,
  };
}
//propName支持字符串链式调用    对象情况支持多字段
function setValue(value, name) {
  if (isString(name)) {
    /**root 开头的字段就在全链路处理 */
    const widget = regRoot.test(name) ? selectedRef : selectedProps;
    const keyslist = name.replace(regRoot, '').split('.');
    const len = keyslist.length - 1;
    keyslist.reduce((memo, cur, index) => {
      if (index === len) {
        memo[cur] = value;
      }
      return memo[cur];
    }, widget.value);
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
    const widget = regRoot.test(name) ? selectedRef : selectedProps;
    if (!widget?.value) return;
    const keyslist = name.replace(regRoot, '').split('.');
    try {
      return keyslist.reduce((memo, cur) => memo[cur], widget.value);
    } catch (err) {
      console.warn(err);
    }
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
