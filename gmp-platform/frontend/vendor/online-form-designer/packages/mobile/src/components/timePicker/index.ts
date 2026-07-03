import { isClient } from '@/utils/is';
import { createVNode, render } from 'vue';
import { type openTimePickerType } from './src/typing';
import TimePicker from './src/timePicker.vue';

let instance: ReturnType<typeof createVNode> | null = null;
export function createTimePicker(options: {}) {
  if (!isClient) return;
  const propsData: Partial<{}> = {};
  let popupRef: any;
  const container = document.createElement('div');
  Object.assign(propsData, options);

  function readyModal() {
    instance = createVNode(TimePicker, propsData);
    render(instance, container);
    document.body.appendChild(container);
    popupRef = instance.component?.exposed;
  }
  function openTimePicker({
    val,
    columnsType,
    minTime,
    maxTime,
    callback,
    formatter,
    filter,
  }: openTimePickerType) {
    readyModal();
    popupRef.openTimePickerOpen({
      val,
      columnsType,
      minTime,
      maxTime,
      callback,
      formatter,
      filter,
    });
  }

  return { openTimePicker };
}
