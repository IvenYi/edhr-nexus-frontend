import { createVNode, render } from 'vue';
import iosSelect from './iosSelect.vue';

let instance: ReturnType<typeof createVNode> | null = null;
export function createIosPopup() {
  const container = document.createElement('div');
  let popupRef: any;
  function readyModal() {
    instance = createVNode(iosSelect);
    render(instance, container);
    document.body.appendChild(container);
    popupRef = instance.component?.exposed;
  }

  function openIosPopup(arg: openIosPopupType = {}): Promise<{
    value: (string | number)[];
    select: any[];
  }> {
    readyModal();
    return popupRef.openPicker(arg);
  }

  return { openIosPopup };
}

interface openIosPopupType {
  options?: any[];
  value?: (string | number)[];
  title?: string;
  beforeSelect?: (arg: any) => Promise<any>;
}
