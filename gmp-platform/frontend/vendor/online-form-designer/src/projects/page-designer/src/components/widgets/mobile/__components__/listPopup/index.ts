import { isClient } from '@/utils/is';
import { createVNode, render } from 'vue';
import { type openPickerByType, type Options, type Props } from './src/typing';
import ListPopup from './src/listPopup.vue';

let instance: ReturnType<typeof createVNode> | null = null;
export function createListPopup(options: Options) {
  if (!isClient) return;
  const propsData: Partial<Props> = {};
  let popupRef: any;
  const container = document.createElement('div');
  Object.assign(propsData, options);
  // console.log(propsData, options, 'propsData');

  function readyModal() {
    instance = createVNode(ListPopup, propsData);
    render(instance, container);
    document.body.appendChild(container);
    popupRef = instance.component?.exposed;
  }
  function openListPopup({ ids, callback }: openPickerByType) {
    readyModal();
    popupRef.open({ ids, callback });
  }

  return { openListPopup };
}
