import { isClient } from '@/utils/is';
import { createVNode, render } from 'vue';
import { type openNumPickerType } from './src/typing';
import NumberKeyboard from './src/numberKeyboard.vue';

let instance: ReturnType<typeof createVNode> | null = null;
export function createNumKeyboardPopup(options: {}) {
  if (!isClient) return;
  const propsData: Partial<{}> = {};
  let popupRef: any;
  const container = document.createElement('div');
  // const container = document.createDocumentFragment() as any;
  Object.assign(propsData, options);

  function readyModal() {
    instance = createVNode(NumberKeyboard, propsData);
    render(instance, container);
    document.body.appendChild(container);
    popupRef = instance.component?.exposed;
  }
  // return instance.component?.exposed;
  function openNumKeyPopup({
    val,
    extra,
    minmax,
    callback,
    onEnter,
    onBlur,
    onFocus,
    precision,
  }: openNumPickerType) {
    readyModal();
    popupRef.openNumKeyboardOpen({
      val,
      extra,
      minmax,
      callback,
      onEnter,
      onBlur,
      onFocus,
      precision,
    });
  }

  return { openNumKeyPopup };
}
