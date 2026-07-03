import { createVNode, render } from 'vue';
import preview from './preview.vue';

let instance: ReturnType<typeof createVNode> | null = null;
export function createPreview(propsData: any = {}) {
  let popupRef: any;
  const container = document.createElement('div');

  function readyModal() {
    instance = createVNode(preview, propsData);
    render(instance, container);
    document.body.appendChild(container);
    popupRef = instance.component?.exposed;
  }
  function openPreview(...arg) {
    readyModal();
    popupRef.openPreview(...arg);
  }

  return { openPreview };
}
