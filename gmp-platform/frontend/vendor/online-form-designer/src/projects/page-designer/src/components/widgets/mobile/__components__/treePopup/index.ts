import { isClient } from '@/utils/is';
import { createVNode, render } from 'vue';
import {
  SelectType as SelectType,
  type openPickerByType,
  type Options as popupOptions,
  type optionType,
  type TreeOptions,
} from './src/typing';
import TreePopup from './src/treePopup.vue';

let instance: ReturnType<typeof createVNode> | null = null;
export function createTreePopup(options: popupOptions) {
  if (!isClient) return { openTreePopup: () => '' };
  const propsData: Partial<popupOptions> = {};
  let popupRef: any;
  const container = document.createElement('div');
  Object.assign(propsData, options);
  function readyModal() {
    instance = createVNode(TreePopup, propsData);
    render(instance, container);
    document.body.appendChild(container);
    popupRef = instance.component?.exposed;
  }

  function openTreePopup(params: openPickerByType) {
    readyModal();
    popupRef.treeOpen(params);
  }

  return { openTreePopup };
}

export { SelectType, popupOptions, TreeOptions, optionType };
