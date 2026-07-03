// import { isClient } from '@/utils/is';
import { createVNode, render } from 'vue';
import { Props, Options } from './src/typing';
import writeModal from './src/writeModal.vue';

let instance: ReturnType<typeof createVNode> | null = null;
export function createHandWritingBoard(options: Props) {
  // if (!isClient) return {};
  const propsData: Partial<Options> = {};
  let popupRef: any;
  const container = document.createElement('div');
  Object.assign(propsData, options);

  function readyModal() {
    instance = createVNode(writeModal, propsData);
    render(instance, container);
    document.body.appendChild(container);
    popupRef = instance.component?.exposed;
  }
  function openHandWritingBoard({ callback }: Options) {
    readyModal();
    popupRef.open({ callback });
  }

  return { openHandWritingBoard };
}
