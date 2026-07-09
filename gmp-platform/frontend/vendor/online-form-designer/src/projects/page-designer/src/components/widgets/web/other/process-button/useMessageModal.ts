import { createVNode, render } from 'vue';
import MessageModal from './message-modal.vue';

let container = null;
export function useMessageModal() {
  let modalRef: any;
  if (!container) {
    container = document.createDocumentFragment() as any;
  }
  async function open() {
    const ins = createVNode(MessageModal, {});
    render(ins, container!);
    modalRef = ins.component?.exposed;
    const data = await modalRef.open();
    return data;
  }

  return { open };
}
