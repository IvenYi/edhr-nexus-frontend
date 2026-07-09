import { isClient } from '@/utils/is';
import { createVNode, render } from 'vue';
import { SelectType, type openPickerByType, type Options, type Props } from './src/typing';
import TreePopup from './src/treePopup.vue';

let instance: ReturnType<typeof createVNode> | null = null;
export function createTreePopup(options: Options) {
  if (!isClient) return;
  const propsData: Partial<Props> = {};
  let popupRef: any;
  const container = document.createElement('div');
  Object.assign(propsData, options);

  function readyModal() {
    instance = createVNode(TreePopup, propsData);
    render(instance, container);
    document.body.appendChild(container);
    popupRef = instance.component?.exposed;
  }

  function openTreePopup({ ids, type, callback }: openPickerByType) {
    readyModal();
    if (type === SelectType.SINGLE) {
      popupRef.singleTreeOpen({ ids, type, callback });
    } else if (type === SelectType.MULTIPLE) {
      popupRef.multipleTreeOpen({ ids, type, callback });
    }
  }

  return { openTreePopup };
}
