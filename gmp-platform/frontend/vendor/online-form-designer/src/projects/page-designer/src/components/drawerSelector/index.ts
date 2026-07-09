import { createVNode, render } from 'vue';
import popup from './popup.vue';
import { openPopupType } from './types';
import { merge } from 'lodash-es';

export * from './types';
let instance: ReturnType<typeof createVNode> | null = null;
export function drawerSelectorInstance(config: Partial<openPopupType>) {
  const container = document.createElement('div');
  let popupRef: any;
  function readyModal() {
    instance = createVNode(popup);
    render(instance, container);
    document.body.appendChild(container);
    popupRef = instance.component?.exposed;
  }
  function openPicker(arg: openPopupType): Promise<{
    values: string | string[];
    options: IObject | IObject[];
  }> {
    readyModal();
    return popupRef.openPicker(merge({ ...config }, arg));
  }

  return { openPicker };
}
