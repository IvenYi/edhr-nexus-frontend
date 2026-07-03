import { createVNode, render } from 'vue';
import ipadPicker from './ipad-picker.vue';
import pdaPicker from './pda-picker.vue';

export * from './const';
let instance: ReturnType<typeof createVNode> | null = null;
export function dataTimePickerInstance(config: dataPopupType = {}) {
  const Picker = import.meta.env.VITE_APP_ENV === 'ipad' ? ipadPicker : pdaPicker;
  const container = document.createElement('div');
  let popupRef: any;
  function readyModal() {
    instance = createVNode(Picker, {
      displayFormat: 'YYYY-MM-DD HH:mm:ss',
      ...config,
    });
    render(instance, container);
    document.body.appendChild(container);
    popupRef = instance.component?.exposed;
  }

  function openPicker(arg: openIosPopupType = {}): Promise<string> {
    readyModal();
    return popupRef.openPicker(arg);
  }

  return { openPicker };
}

export interface openIosPopupType {
  /**日期回显 默认 当前时间*/
  value?: string;
  /**标题 ipad样式需要  默认  选择时间*/
  title?: string;
  maxDate?: Date;
  minDate?: Date;
}
export interface dataPopupType {
  /**日期样式显示格式 默认 YYYY-MM-DD HH:mm:ss*/
  displayFormat?: string;
  /**日期数据值格式 默认 YYYY-MM-DD HH:mm:ss*/
  valueFormat?: string;
}
